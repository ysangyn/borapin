/**
 * 버스·KTX 노선 모으기 (백그라운드, 매일 새벽 .github/workflows/bus.yml): 대표 정류지끼리 '노선이 있는 짝'만 모으고 계속 새로 고친다.
 *   DATA_GO_KR_KEY=… STATE=bus/state.json npx tsx scripts/bus-collect.ts
 *
 * 할 일은 서비스(시외 S·고속 E·열차 T)마다 줄(queue)에 쌓이고, 하루 한도(MAX_CALLS) 안에서 이어서 처리한다.
 *  - 처음과 매달 초(FULL_EVERY): 대표 정류지끼리 30km 넘는 모든 짝 훑기 (약 5만 번 → 서비스별 하루 한도로 사흘쯤)
 *  - 매달: 이미 아는 노선 짝과 그 반대 방향만 다시 물어 편수·시간을 고치고, 없어진 노선은 지운다
 *  - 우리 집 시·군(HOME_REGIONS, 기본 고양): 그 정류지에서 나라 안 모든 터미널·역으로 (대표 정류지에 없는 곳까지)
 * 결과 routes: [서비스, 출발id, 도착id, 하루 편수, 가장 빠른 분, 요금, KTX 편수, KTX 가장 빠른 분, 확인한 달]
 * 앱 자료로 줄이는 건 scripts/routes-build.ts.
 */
import fs from 'node:fs';

const KEY = process.env.DATA_GO_KR_KEY;
if (!KEY) { console.error('DATA_GO_KR_KEY가 없어요'); process.exit(1); }
const STATE = process.env.STATE ?? 'bus-state.json';
const MAX_CALLS = Number(process.env.MAX_CALLS ?? 8500);
const FULL_EVERY = Number(process.env.FULL_EVERY ?? 1); // 전체 훑기 간격(달). 비용 0이라 매달
const HOME_REGIONS = (process.env.HOME_REGIONS ?? '41280').split(',').filter(Boolean);
const BASE = 'https://apis.data.go.kr/1613000';
type Item = Record<string, string | number>;
const pause = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
let calls = 0;
async function api(svc: string, op: string, p: Record<string, string> = {}): Promise<Item[] | null | undefined> {
  const qs = new URLSearchParams({ serviceKey: KEY!, _type: 'json', numOfRows: '3000', pageNo: '1', ...p });
  calls++;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(`${BASE}/${svc}/${op}?${qs}`, { signal: AbortSignal.timeout(20000) });
      const t = await r.text();
      if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS|한도/.test(t)) return null; // 오늘 한도 끝
      const j = JSON.parse(t) as { response?: { body?: { items?: { item?: Item | Item[] } } } };
      const it = j.response?.body?.items && typeof j.response.body.items === 'object' ? j.response.body.items.item : undefined;
      return !it ? [] : Array.isArray(it) ? it : [it];
    } catch { await pause(1500 * (i + 1)); }
  }
  return undefined; // 네 번 다 실패: 모름(지우지 않는다)
}

type Svc = 'S' | 'E' | 'T';
interface Stop { svc: Svc; id: string; name: string; region: string; extra?: true }
/** 시각표 한 칸: [출발 분(0~1439), 걸리는 분, KTX면 1] */
export type Dep = [number, number, 0 | 1];
export type Route = [Svc, string, string, number, number, number, number, number, string, Dep[]?];
type Job = [string, string, 'scan' | 'check'];
interface State {
  v: 2; stops: Stop[]; routes: Route[]; updated: string;
  queue: Record<Svc, Job[]>; scannedAt: string; checkedAt: string; homeScanned: string[];
  // 옛(v1) 칸
  pairs?: number; done?: number; doneBy?: Record<Svc, number>;
}
const SVC = { S: ['SuburbsBusInfo', 'GetStrtpntAlocFndSuberbsBusInfo', 'depTerminalId', 'arrTerminalId'], E: ['ExpBusInfo', 'GetStrtpntAlocFndExpbusInfo', 'depTerminalId', 'arrTerminalId'], T: ['TrainInfo', 'GetStrtpntAlocFndTrainInfo', 'depPlaceId', 'arrPlaceId'] } as const;

const regions = (JSON.parse(fs.readFileSync('src/data/regions.json', 'utf8')) as { regions: { code: string; name: string; lat: number; lng: number }[] }).regions;
const short = (n: string) => (n.length >= 3 ? n.replace(/[시군구]$/, '') : n);
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88);
const byCode = new Map(regions.map((r) => [r.code, r]));
const month = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 7);
const monthsBetween = (a: string, b: string) => (a ? (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7)) : 99);

/** 터미널·역 이름 → 시·군 (이름이 시·군 이름으로 시작하면). 같은 건물의 다른 이름도 여기서 같은 시·군이 된다 */
const ALIAS: Record<string, string> = { 행신: '고양시', 일산: '고양시', 대곡: '고양시', 백마: '고양시', 풍산: '고양시', 능곡: '고양시', 서대전: '대전', 광주송정: '광주', 신경주: '경주', 김천구미: '김천', 동대구: '대구', 서광주: '광주', 동서울: '서울', 센트럴시티: '서울' };
function regionOf(name: string): string {
  const n = name.replace(/\s/g, '').replace(/\(.+\)$/, '');
  const al = Object.entries(ALIAS).find(([k]) => n.startsWith(k));
  if (al) return regions.find((r) => r.name === al[1])?.code ?? '';
  let best = '';
  for (const r of regions) { const s = short(r.name); if (s.length >= 2 && n.startsWith(s) && s.length > best.length) best = r.code; }
  return best ? best : '';
}
const NAME_RE = (s: string) => new RegExp(`^${s}(종합|복합|터미널|시외|고속|공용|버스|역|센트럴)?(\\(.+\\))?$`);

/** 모든 터미널·역 목록 (서비스별) */
async function terminals(): Promise<Record<Svc, { id: string; name: string }[]>> {
  const sub = (await api('SuburbsBusInfo', 'GetSuberbsBusTrminlList')) ?? [];
  const exp = (await api('ExpBusInfo', 'GetExpBusTrminlList')) ?? [];
  const cities = (await api('TrainInfo', 'GetCtyCodeList')) ?? [];
  const st: { id: string; name: string }[] = [];
  for (const c of cities) { for (const s of (await api('TrainInfo', 'GetCtyAcctoTrainSttnList', { cityCode: String(c.citycode) })) ?? []) st.push({ id: String(s.nodeid), name: String(s.nodename) }); await pause(50); }
  return {
    S: sub.map((t) => ({ id: String(t.terminalId), name: String(t.terminalNm) })),
    E: exp.map((t) => ({ id: String(t.terminalId), name: String(t.terminalNm) })),
    T: st,
  };
}

/** 대표 정류지: 시·군 이름과 같거나 '이름+종합/복합/터미널/시외/고속…'인 곳, 시·군마다 서비스별 최대 2곳 + 우리 집 시·군의 모든 정류지 */
function pickStops(all: Record<Svc, { id: string; name: string }[]>): Stop[] {
  const out: Stop[] = [];
  for (const svc of ['S', 'E', 'T'] as const) {
    for (const r of regions) {
      const s = short(r.name);
      const hit = all[svc].filter((t) => t.name === s || NAME_RE(s).test(t.name)).slice(0, 2);
      for (const t of hit) out.push({ svc, id: t.id, name: t.name, region: r.code });
    }
    for (const t of all[svc]) { const rg = regionOf(t.name); if (HOME_REGIONS.includes(rg)) out.push({ svc, id: t.id, name: t.name, region: rg }); }
  }
  const seen = new Set<string>();
  return out.filter((s) => s.region && !seen.has(s.svc + s.id) && seen.add(s.svc + s.id));
}

/** 훑을 짝: 같은 서비스, 30km 넘게 떨어진 시·군끼리 (시외는 300km 안) */
function scanJobs(stops: Stop[], only?: (a: Stop, b: Stop) => boolean): Record<Svc, Job[]> {
  const q: Record<Svc, Job[]> = { S: [], E: [], T: [] };
  for (const a of stops) for (const b of stops) {
    if (a.svc !== b.svc || a.id === b.id || a.region === b.region) continue;
    const d = km(byCode.get(a.region)!, byCode.get(b.region)!);
    if (d < 30 || (a.svc === 'S' && d > 300)) continue;
    if (only && !only(a, b)) continue;
    q[a.svc].push([a.id, b.id, 'scan']);
  }
  return q;
}

/** 아는 노선 다시 확인 + 반대 방향(한쪽만 나오는 일이 있어서) */
function checkJobs(st: State): Record<Svc, Job[]> {
  const q: Record<Svc, Job[]> = { S: [], E: [], T: [] };
  const have = new Set(st.routes.map((r) => `${r[0]}|${r[1]}|${r[2]}`));
  for (const r of st.routes) {
    q[r[0]].push([r[1], r[2], 'check']);
    if (!have.has(`${r[0]}|${r[2]}|${r[1]}`)) q[r[0]].push([r[2], r[1], 'scan']);
  }
  return q;
}

const day = (() => { const d = new Date(Date.now() + 9 * 3600_000 + 86400_000); while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ''); })();
const mins = (x: Item) => { const d = String(x.depPlandTime ?? x.depplandtime ?? ''), a = String(x.arrPlandTime ?? x.arrplandtime ?? ''); if (d.length < 12 || a.length < 12) return 0; const m = (t: string) => +t.slice(8, 10) * 60 + +t.slice(10, 12); return (m(a) - m(d) + 1440) % 1440; };
const fastest = (xs: Item[]) => xs.map(mins).filter((m) => m > 0).reduce((a, b) => Math.min(a, b), Infinity);
export function summarize(svc: Svc, a: string, b: string, items: Item[]): Route {
  const f = fastest(items);
  const ktx = svc === 'T' ? items.filter((x) => /KTX/i.test(String(x.traingradename ?? ''))) : [];
  const kf = ktx.length ? fastest(ktx) : 0;
  const charge = Number(items[0].charge ?? items[0].adultcharge ?? 0);
  // 들러 가기(갈아타기 시간 맞추기)에 쓰는 시각표
  const deps: Dep[] = items.map((x): Dep => {
    const d = String(x.depPlandTime ?? x.depplandtime ?? '');
    return [d.length >= 12 ? +d.slice(8, 10) * 60 + +d.slice(10, 12) : -1, mins(x), /KTX/i.test(String(x.traingradename ?? '')) ? 1 : 0];
  }).filter((x) => x[0] >= 0 && x[1] > 0).sort((p, q) => p[0] - q[0]);
  return [svc, a, b, items.length, Number.isFinite(f) ? f : 0, charge, ktx.length, Number.isFinite(kf) ? kf : 0, month, deps];
}

// ── 상태 읽기 (v1 → v2 이어받기) ──
let st: State;
try { st = JSON.parse(fs.readFileSync(STATE, 'utf8')) as State; } catch { st = { v: 2, stops: [], routes: [], updated: '', queue: { S: [], E: [], T: [] }, scannedAt: '', checkedAt: '', homeScanned: [] }; }
const raw = st as unknown as { v: number; routes: (string | number)[][] };
if (raw.v !== 2) {
  // 예전 상태: 훑기는 끝났다고 보고, 노선은 KTX 칸 없이 이어받는다. 이번 달 확인(check)에서 KTX 칸이 채워진다
  st = { v: 2, stops: st.stops ?? [], routes: (raw.routes ?? []).map((r) => [r[0], r[1], r[2], r[3], r[4], r[5], -1, -1, ''] as Route), updated: st.updated ?? '', queue: { S: [], E: [], T: [] }, scannedAt: st.updated ? st.updated.slice(0, 7) : '', checkedAt: '', homeScanned: [] };
  console.log(`옛 상태 이어받음: 정류지 ${st.stops.length} · 노선 ${st.routes.length}`);
}

// ── 오늘 할 일 정하기 ──
const add = (q: Record<Svc, Job[]>) => { for (const s of ['S', 'E', 'T'] as const) st.queue[s].push(...q[s]); };
const needStops = !st.stops.length || HOME_REGIONS.some((h) => !st.homeScanned.includes(h)) || monthsBetween(st.scannedAt, month) >= FULL_EVERY;
if (needStops) {
  const all = await terminals();
  if (all.S.length && all.E.length && all.T.length) {
    const old = new Set(st.stops.map((s) => s.svc + s.id));
    const fresh = pickStops(all);
    // 우리 집 정류지는 나라 안 모든 터미널·역으로 (대표 정류지에 없는 곳은 extra로 붙인다)
    for (const h of HOME_REGIONS.filter((x) => !st.homeScanned.includes(x))) {
      const homes = fresh.filter((s) => s.region === h);
      for (const svc of ['S', 'E', 'T'] as const) {
        const hs = homes.filter((s) => s.svc === svc);
        if (!hs.length) continue;
        for (const t of all[svc]) {
          const rg = regionOf(t.name);
          if (!rg || rg === h || !byCode.has(rg)) continue;
          if (svc === 'S' && km(byCode.get(h)!, byCode.get(rg)!) > 400) continue;
          if (!fresh.some((s) => s.svc === svc && s.id === t.id)) fresh.push({ svc, id: t.id, name: t.name, region: rg, extra: true });
          for (const a of hs) st.queue[svc].push([a.id, t.id, 'scan'], [t.id, a.id, 'scan']);
        }
      }
      st.homeScanned.push(h);
      console.log(`우리 집(${byCode.get(h)?.name}) 정류지 ${homes.length}곳 → 나라 안 모든 터미널·역 훑기 예약`);
    }
    if (!st.stops.length || monthsBetween(st.scannedAt, month) >= FULL_EVERY) {
      st.stops = fresh;
      add(scanJobs(st.stops.filter((s) => !s.extra)));
      st.scannedAt = month;
      console.log(`전체 훑기 예약 (대표 정류지 ${st.stops.filter((s) => !s.extra).length}곳)`);
    } else {
      const added = fresh.filter((s) => !old.has(s.svc + s.id));
      st.stops.push(...added);
      // 새로 들어온 대표 정류지(예: '복합' 이름)가 낀 짝만
      const isNew = new Set(added.filter((s) => !s.extra).map((s) => s.svc + s.id));
      if (isNew.size) { add(scanJobs(st.stops.filter((s) => !s.extra), (a, b) => isNew.has(a.svc + a.id) || isNew.has(b.svc + b.id))); console.log(`새 대표 정류지 ${isNew.size}곳이 낀 짝 훑기 예약`); }
    }
  } else console.log('터미널 목록을 못 받아 정류지는 그대로');
}
// 시각표 칸이 없는 노선이 있으면(시각표를 받기 전 자료) 이번 달이어도 다시 확인
if (st.checkedAt !== month || st.routes.some((r) => !r[9])) { add(checkJobs(st)); st.checkedAt = month; console.log(`이번 달 확인 예약: 아는 노선 ${st.routes.length}개 + 반대 방향`); }
// 같은 짝이 두 번 들어가지 않게
for (const s of ['S', 'E', 'T'] as const) { const seen = new Set<string>(); st.queue[s] = st.queue[s].filter((j) => { const k = j[0] + '|' + j[1]; return !seen.has(k) && !!seen.add(k); }); }
console.log(`할 일 시외 ${st.queue.S.length} · 고속 ${st.queue.E.length} · 열차 ${st.queue.T.length}`);

// ── 처리 ──
const index = new Map(st.routes.map((r, i) => [`${r[0]}|${r[1]}|${r[2]}`, i]));
const removed = new Set<string>();
const save = () => { st.routes = st.routes.filter((r) => !removed.has(`${r[0]}|${r[1]}|${r[2]}`)); index.clear(); st.routes.forEach((r, i) => index.set(`${r[0]}|${r[1]}|${r[2]}`, i)); removed.clear(); st.updated = new Date().toISOString(); fs.writeFileSync(STATE, JSON.stringify(st)); };
const CONC = 6;
let found = 0, gone = 0;
async function lane(svc: Svc) {
  const [name, op, dk, ak] = SVC[svc];
  let used = 0;
  while (st.queue[svc].length && used < MAX_CALLS) {
    const batch = st.queue[svc].slice(0, CONC);
    const res = await Promise.all(batch.map(([a, b]) => api(name, op, { [dk]: a, [ak]: b, depPlandTime: day })));
    used += batch.length;
    if (res.some((r) => r === null)) { console.log(`${name}: 오늘 한도에 닿아 멈춰요`); return; }
    res.forEach((r, i) => {
      const [a, b, kind] = batch[i];
      const key = `${svc}|${a}|${b}`;
      if (!r) return; // 연결 실패: 그대로 둔다
      if (r.length) {
        const row = summarize(svc, a, b, r);
        const at = index.get(key);
        if (at === undefined) { index.set(key, st.routes.length); st.routes.push(row); found++; } else { st.routes[at] = row; removed.delete(key); }
      } else if (kind === 'check' && index.has(key)) { removed.add(key); gone++; }
    });
    st.queue[svc].splice(0, batch.length);
    if (used % 600 < CONC) save();
  }
}
await Promise.all((['S', 'E', 'T'] as const).map(lane));
save();
const left = st.queue.S.length + st.queue.E.length + st.queue.T.length;
console.log(`이번 호출 ${calls}번 · 새 노선 ${found} · 없어진 노선 ${gone} · 남은 할 일 ${left} · 노선 ${st.routes.length}개 (KTX 칸 채운 열차 ${st.routes.filter((r) => r[0] === 'T' && r[6] >= 0).length}/${st.routes.filter((r) => r[0] === 'T').length})`);
