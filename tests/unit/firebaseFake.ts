/**
 * 단위 시험용 가짜 Firestore (메모리). `firebase/firestore` 자리에 끼워 넣는다 (libLoader.ts).
 * 목적: 읽기·쓰기·구독이 '몇 번, 어떤 조건으로' 일어나는지 세어 보기. 실제 SDK의 작은 부분만 흉내 낸다.
 * - 문서는 경로 → 자료. 서버와 기기 캐시를 따로 두지 않되, `notCached`에 넣은 경로는 캐시에 없는 것으로 친다.
 * - `net.offline`이면 서버 읽기(getDoc·getDocs·getCountFromServer)는 실패하고 캐시 읽기만 된다.
 */
type Data = Record<string, unknown>;

export const docs = new Map<string, Data>();
/** 캐시에 없는 문서(서버에만 있는 것) */
export const notCached = new Set<string>();
/** 일어난 일: read(서버에서 문서 하나) · cache(캐시에서) · count · write · delete */
export const log: { op: 'read' | 'cache' | 'count' | 'write' | 'delete'; path: string }[] = [];
/** 켜진 구독 */
export const listens: { path: string; constraints: Constraint[]; off: boolean }[] = [];
/** offline: 서버 읽기 실패 · failWrites: 이 경로에 쓰면 실패 */
export const net: { offline: boolean; failWrites: RegExp | null } = { offline: false, failWrites: null };

export function reset() {
  docs.clear();
  notCached.clear();
  log.length = 0;
  listens.length = 0;
  net.offline = false;
  net.failWrites = null;
}
export function seed(path: string, data: Data) {
  docs.set(path, structuredClone(data));
}
export const reads = (op: 'read' | 'cache' | 'count' | 'write' | 'delete' = 'read', prefix = '') => log.filter((l) => l.op === op && l.path.startsWith(prefix)).length;

// ---------- 값 ----------
export class Timestamp {
  constructor(public seconds: number, public nanoseconds = 0) {}
  toMillis() { return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6); }
  toDate() { return new Date(this.toMillis()); }
  static now() { return Timestamp.fromMillis(Date.now()); }
  static fromMillis(ms: number) { return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6); }
}
export class FieldPath {
  segments: string[];
  constructor(...segments: string[]) { this.segments = segments; }
}
export class Bytes {
  constructor(private a: Uint8Array) {}
  static fromUint8Array(a: Uint8Array) { return new Bytes(a); }
  toUint8Array() { return this.a; }
}
const SENTINEL = Symbol('sentinel');
type Sentinel = { [SENTINEL]: 'ts' | 'del' | 'union' | 'remove'; v?: unknown[] };
const isSentinel = (x: unknown): x is Sentinel => !!x && typeof x === 'object' && SENTINEL in (x as object);
export const serverTimestamp = (): unknown => ({ [SENTINEL]: 'ts' });
export const deleteField = (): unknown => ({ [SENTINEL]: 'del' });
export const arrayUnion = (...v: unknown[]): unknown => ({ [SENTINEL]: 'union', v });
export const arrayRemove = (...v: unknown[]): unknown => ({ [SENTINEL]: 'remove', v });

// ---------- 참조 ----------
export interface ColRef { type: 'col'; path: string; id: string }
export interface DocRef { type: 'doc'; path: string; id: string; parent: ColRef }
export interface Query { type: 'query'; col: ColRef; constraints: Constraint[] }
export type Constraint =
  | { kind: 'where'; field: string; op: string; value: unknown }
  | { kind: 'orderBy'; field: string; dir: 'asc' | 'desc' }
  | { kind: 'limit'; n: number };

let auto = 0;
const newId = () => `auto${(++auto).toString(36).padStart(4, '0')}`;
const join = (...p: string[]) => p.filter(Boolean).join('/');
const isRef = (x: unknown): x is ColRef | DocRef => !!x && typeof x === 'object' && 'type' in (x as object) && 'path' in (x as object);

export function collection(parent: unknown, ...segs: string[]): ColRef {
  const base = isRef(parent) ? parent.path : '';
  const path = join(base, ...segs);
  return { type: 'col', path, id: segs[segs.length - 1] ?? path.split('/').pop() ?? '' };
}
export function doc(parent: unknown, ...segs: string[]): DocRef {
  if (isRef(parent) && parent.type === 'col') {
    const id = segs[0] ?? newId();
    return { type: 'doc', path: join(parent.path, id), id, parent };
  }
  const base = isRef(parent) ? parent.path : '';
  const path = join(base, ...segs);
  const parts = path.split('/');
  const id = parts.pop()!;
  const colPath = parts.join('/');
  return { type: 'doc', path, id, parent: { type: 'col', path: colPath, id: parts[parts.length - 1] ?? '' } };
}
export function query(target: ColRef | Query, ...cs: Constraint[]): Query {
  return target.type === 'query' ? { ...target, constraints: [...target.constraints, ...cs] } : { type: 'query', col: target, constraints: cs };
}
export const where = (field: string | FieldPath, op: string, value: unknown): Constraint => ({ kind: 'where', field: typeof field === 'string' ? field : field.segments.join('.'), op, value });
export const orderBy = (field: string, dir: 'asc' | 'desc' = 'asc'): Constraint => ({ kind: 'orderBy', field, dir });
export const limit = (n: number): Constraint => ({ kind: 'limit', n });

// ---------- 읽기 ----------
const getIn = (d: Data, field: string): unknown => field.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Data)[k] : undefined), d);
const cmp = (a: unknown, b: unknown) => (a === b ? 0 : a == null ? -1 : b == null ? 1 : (a as number) < (b as number) ? -1 : 1);
const asMillis = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : v);

function run(target: ColRef | Query, fromCache: boolean): { id: string; data: Data }[] {
  const col = target.type === 'query' ? target.col : target;
  const cs = target.type === 'query' ? target.constraints : [];
  let items = [...docs.entries()]
    .filter(([p]) => p.startsWith(col.path + '/') && !p.slice(col.path.length + 1).includes('/'))
    .filter(([p]) => !fromCache || !notCached.has(p))
    .map(([p, d]) => ({ id: p.split('/').pop()!, data: d }));
  for (const c of cs) {
    if (c.kind !== 'where') continue;
    items = items.filter(({ data }) => {
      const v = getIn(data, c.field);
      if (c.op === '==') return v === c.value;
      if (c.op === '!=') return v !== c.value;
      if (c.op === 'in') return (c.value as unknown[]).includes(v);
      if (c.op === 'array-contains') return Array.isArray(v) && v.includes(c.value);
      if (c.op === '>=') return cmp(asMillis(v), asMillis(c.value)) >= 0;
      if (c.op === '<=') return cmp(asMillis(v), asMillis(c.value)) <= 0;
      if (c.op === '>') return cmp(asMillis(v), asMillis(c.value)) > 0;
      if (c.op === '<') return cmp(asMillis(v), asMillis(c.value)) < 0;
      throw new Error(`fake firestore: where ${c.op} 미지원`);
    });
  }
  const orders = cs.filter((c): c is Extract<Constraint, { kind: 'orderBy' }> => c.kind === 'orderBy');
  if (orders.length) {
    // 정렬 칸이 없는 문서는 결과에 안 들어온다 (실제 Firestore와 같음)
    items = items.filter(({ data }) => orders.every((o) => getIn(data, o.field) !== undefined));
    items.sort((a, b) => {
      for (const o of orders) {
        const r = cmp(asMillis(getIn(a.data, o.field)), asMillis(getIn(b.data, o.field)));
        if (r) return o.dir === 'desc' ? -r : r;
      }
      return a.id.localeCompare(b.id);
    });
  } else items.sort((a, b) => a.id.localeCompare(b.id));
  const lim = cs.find((c): c is Extract<Constraint, { kind: 'limit' }> => c.kind === 'limit');
  if (lim) items = items.slice(0, lim.n);
  return items;
}

const unavailable = () => Object.assign(new Error('Failed to get document because the client is offline.'), { code: 'unavailable' });

function docSnap(ref: DocRef, fromCache: boolean) {
  const d = docs.get(ref.path);
  const has = !!d && (!fromCache || !notCached.has(ref.path));
  return { id: ref.id, ref, exists: () => has, data: () => (has ? structuredClone(d) : undefined), metadata: { fromCache, hasPendingWrites: false } };
}
function querySnap(target: ColRef | Query, fromCache: boolean) {
  const col = target.type === 'query' ? target.col : target;
  const list = run(target, fromCache).map(({ id, data }) => ({ id, ref: doc(col, id), exists: () => true, data: () => structuredClone(data) }));
  return { docs: list, size: list.length, empty: list.length === 0, forEach: (fn: (d: (typeof list)[number]) => void) => list.forEach(fn), metadata: { fromCache, hasPendingWrites: false } };
}

export async function getDoc(ref: DocRef) {
  if (net.offline) {
    if (docs.has(ref.path) && !notCached.has(ref.path)) { log.push({ op: 'cache', path: ref.path }); return docSnap(ref, true); }
    throw unavailable();
  }
  log.push({ op: 'read', path: ref.path });
  return docSnap(ref, false);
}
export async function getDocFromCache(ref: DocRef) {
  if (!docs.has(ref.path) || notCached.has(ref.path)) throw unavailable();
  log.push({ op: 'cache', path: ref.path });
  return docSnap(ref, true);
}
export async function getDocs(target: ColRef | Query) {
  const s = querySnap(target, net.offline);
  for (const d of s.docs) log.push({ op: net.offline ? 'cache' : 'read', path: d.ref.path });
  return s;
}
export async function getDocsFromCache(target: ColRef | Query) {
  const s = querySnap(target, true);
  for (const d of s.docs) log.push({ op: 'cache', path: d.ref.path });
  return s;
}
export const count = () => ({ agg: 'count' as const });
export const sum = (field: string) => ({ agg: 'sum' as const, field });
export async function getCountFromServer(target: ColRef | Query) {
  if (net.offline) throw unavailable();
  const col = target.type === 'query' ? target.col : target;
  log.push({ op: 'count', path: col.path });
  return { data: () => ({ count: run(target, false).length }) };
}
export async function getAggregateFromServer(target: ColRef | Query, spec: Record<string, { agg: 'count' } | { agg: 'sum'; field: string }>) {
  if (net.offline) throw unavailable();
  const items = run(target, false);
  const col = target.type === 'query' ? target.col : target;
  log.push({ op: 'count', path: col.path });
  const out: Record<string, number> = {};
  for (const [k, s] of Object.entries(spec)) out[k] = s.agg === 'count' ? items.length : items.reduce((a, { data }) => a + (Number(getIn(data, s.field)) || 0), 0);
  return { data: () => out };
}

// ---------- 쓰기 ----------
function materialize(v: unknown): unknown {
  if (isSentinel(v)) return v[SENTINEL] === 'ts' ? Timestamp.now() : v;
  if (Array.isArray(v)) return v.map(materialize);
  if (v && typeof v === 'object' && !(v instanceof Timestamp) && !(v instanceof Bytes)) return Object.fromEntries(Object.entries(v as Data).map(([k, x]) => [k, materialize(x)]));
  return v;
}
function setIn(d: Data, segments: string[], value: unknown) {
  let o = d;
  for (const k of segments.slice(0, -1)) {
    if (!o[k] || typeof o[k] !== 'object') o[k] = {};
    o = o[k] as Data;
  }
  const last = segments[segments.length - 1];
  if (isSentinel(value) && value[SENTINEL] === 'del') delete o[last];
  else if (isSentinel(value) && value[SENTINEL] === 'union') o[last] = [...new Set([...((o[last] as unknown[]) ?? []), ...(value.v ?? [])])];
  else if (isSentinel(value) && value[SENTINEL] === 'remove') o[last] = ((o[last] as unknown[]) ?? []).filter((x) => !(value.v ?? []).includes(x));
  else o[last] = materialize(value);
}
const denyWrite = (path: string) => {
  if (net.failWrites?.test(path)) throw Object.assign(new Error(`write failed: ${path}`), { code: 'unavailable' });
};
export async function setDoc(ref: DocRef, data: Data, opts?: { merge?: boolean }) {
  denyWrite(ref.path);
  log.push({ op: 'write', path: ref.path });
  const cur = docs.get(ref.path);
  if (opts?.merge && cur) {
    for (const [k, v] of Object.entries(data)) setIn(cur, [k], v);
  } else docs.set(ref.path, materialize(data) as Data);
  notCached.delete(ref.path);
}
export async function updateDoc(ref: DocRef, first: Data | string | FieldPath, ...rest: unknown[]) {
  denyWrite(ref.path);
  const cur = docs.get(ref.path);
  if (!cur) throw Object.assign(new Error('No document to update'), { code: 'not-found' });
  log.push({ op: 'write', path: ref.path });
  if (typeof first === 'object' && !(first instanceof FieldPath)) {
    for (const [k, v] of Object.entries(first)) setIn(cur, k.split('.'), v);
    return;
  }
  const args = [first, ...rest];
  for (let i = 0; i < args.length; i += 2) {
    const f = args[i];
    setIn(cur, f instanceof FieldPath ? f.segments : String(f).split('.'), args[i + 1]);
  }
}
export async function deleteDoc(ref: DocRef) {
  denyWrite(ref.path);
  log.push({ op: 'delete', path: ref.path });
  docs.delete(ref.path);
}
export const addDoc = async (col: ColRef, data: Data) => { const ref = doc(col); await setDoc(ref, data); return ref; };
export function writeBatch() {
  const ops: (() => Promise<void>)[] = [];
  const b = {
    set: (ref: DocRef, data: Data, opts?: { merge?: boolean }) => { ops.push(() => setDoc(ref, data, opts)); return b; },
    update: (ref: DocRef, first: Data | string | FieldPath, ...rest: unknown[]) => { ops.push(() => updateDoc(ref, first, ...rest)); return b; },
    delete: (ref: DocRef) => { ops.push(() => deleteDoc(ref)); return b; },
    commit: async () => { for (const op of ops) await op(); },
  };
  return b;
}
export async function runTransaction<T>(_db: unknown, fn: (tx: { get: typeof getDoc; set: typeof setDoc; update: typeof updateDoc; delete: typeof deleteDoc }) => Promise<T>) {
  return fn({ get: getDoc, set: setDoc, update: updateDoc, delete: deleteDoc });
}

// ---------- 구독 ----------
export function onSnapshot(target: DocRef | ColRef | Query, cb: (s: unknown) => void, _err?: (e: unknown) => void) {
  const entry = { path: target.type === 'query' ? target.col.path : target.path, constraints: target.type === 'query' ? target.constraints : [], off: false };
  listens.push(entry);
  let snap: unknown;
  if (target.type === 'doc') {
    snap = docSnap(target, net.offline);
    log.push({ op: net.offline ? 'cache' : 'read', path: target.path });
  } else {
    const s = querySnap(target, net.offline);
    for (const d of s.docs) log.push({ op: net.offline ? 'cache' : 'read', path: d.ref.path });
    snap = s;
  }
  queueMicrotask(() => { if (!entry.off) cb(snap); });
  return () => { entry.off = true; };
}
