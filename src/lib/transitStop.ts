import { REGION_BY_CODE } from './geo';
import type { RoutesData, Svc } from './transit';

/**
 * 대중교통으로 들러 가기 (설계: docs/ROADMAP.md 9번).
 * 우리 집 시·군 → (한 번에) 중간 도시에서 2~5시간 → (한 번에) 여행지. 갈아타기 시간은 시각표로 맞춘다.
 *  - 같은 정류지에서 바로 갈아타면 10분, 같은 시·군의 다른 역·터미널이면 시내 이동 30분을 잡는다
 *  - 바로 가기: 갈아타지 않는 길 중 아침(start) 뒤 첫 차
 *  - 가장 빠른 길: 바로 가기보다 일찍 닿는 한 번 갈아타기(기다림 2시간 안)가 있으면
 *  - 1박: 차 타는 시간이 6시간을 넘거나 같은 날 들러 갈 길이 없으면, 중간 도시에서 자고 다음 날 아침에
 * 시각표를 모르는 노선(반대 방향으로 짐작한 것)은 쓰지 않는다.
 */
export type Mode = 'all' | 'bus' | 'train';
export interface Leg { svc: Svc; ktx: boolean; from: string; to: string; fromCode: string; toCode: string; dep: number; arr: number }
export interface TransitPlan {
  kind: 'direct' | 'fast' | 'stop' | 'overnight';
  legs: Leg[];
  mid?: string; // 들르는 시·군 코드
  stay?: number; // 머무는 분 (갈아타는 시간 빼고)
  move?: number; // 갈아타러 옮기는 분 (다른 역·터미널로)
  moveHow?: MoveHow;
  ride: number; // 차 타는 분 합
  end: number; // 마지막에 닿는 시각(분, 다음 날이면 +1440)
  last?: number; // 마지막 구간의 막차 출발 시각(그 노선)
}
export interface StopOpts { day?: 'weekday' | 'sat' | 'sun'; mode?: Mode; start?: number; visited?: Set<string> | Map<string, number>; themeOf?: (code: string) => string | undefined; n?: number }

const SAME = 10, TOWN = 30, STAY_MIN = 120, STAY_MAX = 300, LATEST = 22 * 60, OVERNIGHT_RIDE = 6 * 60;

interface Edge { svc: Svc; from: number; to: number; fromCode: string; toCode: string; deps: [number, number, boolean][] }

function edges(d: RoutesData, day: 'weekday' | 'sat' | 'sun' = 'weekday'): Edge[] {
  const out: Edge[] = [];
  for (const x of d.r) {
    // 토·일요일: 그날 시각표를 받았으면 그것(안 다니면 빈 칸), 일요일을 아직 못 받았으면 토요일 것, 그것도 없으면 평일 것
    const flat = (day === 'sat' && x[9] != null ? x[9] : day === 'sun' && x[10] != null ? x[10] : day === 'sun' && x[9] != null ? x[9] : x[8]) ?? [];
    if (!flat.length) continue;
    const deps: [number, number, boolean][] = [];
    for (let i = 0; i + 2 < flat.length; i += 3) deps.push([flat[i], flat[i + 1], flat[i + 2] === 1]);
    out.push({ svc: x[0], from: x[1], to: x[2], fromCode: d.s[x[1]][1], toCode: d.s[x[2]][1], deps });
  }
  return out;
}

const okFirst = (svc: Svc, mode: Mode) => mode === 'all' || (mode === 'bus' ? svc !== 'T' : svc === 'T');
// 기차만: 첫 구간은 기차, 마지막 구간은 버스도 된다 (기차역이 없는 곳까지)
const okSecond = (svc: Svc, mode: Mode) => mode !== 'bus' || svc !== 'T';

const lastOf = (e: Edge) => e.deps[e.deps.length - 1]?.[0];
const leg = (d: RoutesData, e: Edge, dep: [number, number, boolean], day = 0): Leg => ({ svc: e.svc, ktx: dep[2], from: d.s[e.from][0], to: d.s[e.to][0], fromCode: e.fromCode, toCode: e.toCode, dep: dep[0] + day, arr: dep[0] + dep[1] + day });

/** 갈아타는 데 드는 분: 같은 정류지 10분, 같은 시·군 다른 곳 30분 */
/** 갈아타기: 같은 정류지 10분 · 자리를 알면 걸어서(700m 안, 분당 65m)나 택시(4km 안) · 모르면 시내 이동 30분 */
export type MoveHow = 'same' | 'walk' | 'taxi' | 'town';
export function transfer(d: RoutesData, a: Edge, b: Edge): { min: number; how: MoveHow } {
  if (a.svc === b.svc && a.to === b.from) return { min: SAME, how: 'same' };
  const p = d.s[a.to], q = d.s[b.from];
  if (p.length > 3 && q.length > 3) {
    const km = Math.hypot((p[3]! - q[3]!) * 111, (p[4]! - q[4]!) * 88);
    if (km <= 0.7) return { min: Math.max(SAME, Math.round(5 + (km * 1000) / 65)), how: 'walk' };
    if (km <= 4) return { min: Math.round(12 + km * 3), how: 'taxi' };
    return { min: Math.max(TOWN, Math.round(15 + km * 2.5)), how: 'town' };
  }
  return { min: TOWN, how: 'town' };
}

export function transitPlans(d: RoutesData, from: string, to: string, o: StopOpts = {}): TransitPlan[] {
  const mode = o.mode ?? 'all', start = o.start ?? 7 * 60, n = o.n ?? 3;
  const all = edges(d, o.day);
  const out: TransitPlan[] = [];

  // 바로 가기: 아침 뒤 첫 차 (같으면 빠른 것)
  let direct: TransitPlan | null = null;
  for (const e of all) {
    if (e.fromCode !== from || e.toCode !== to || !okFirst(e.svc, mode)) continue;
    for (const dp of e.deps) {
      if (dp[0] < start) continue;
      const l = leg(d, e, dp);
      if (!direct || l.dep < direct.legs[0].dep || (l.dep === direct.legs[0].dep && l.arr < direct.end)) direct = { kind: 'direct', legs: [l], ride: dp[1], end: l.arr, last: lastOf(e) };
      break; // 시각표는 출발 순
    }
  }
  if (direct) out.push(direct);

  const firsts = all.filter((e) => e.fromCode === from && e.toCode !== to && okFirst(e.svc, mode));
  const seconds = new Map<string, Edge[]>();
  for (const e of all) if (e.toCode === to && e.fromCode !== from && okSecond(e.svc, mode)) (seconds.get(e.fromCode) ?? seconds.set(e.fromCode, []).get(e.fromCode)!).push(e);

  // 가장 빠른 길(한 번 갈아타기, 기다림 2시간 안)과 들러 가기 후보
  let fast: TransitPlan | null = null;
  const stops: (TransitPlan & { score: number })[] = [];
  const overnight: (TransitPlan & { score: number })[] = [];
  const f = REGION_BY_CODE.get(from), t = REGION_BY_CODE.get(to);
  const km = (a?: { lat: number; lng: number }, b?: { lat: number; lng: number }) => (a && b ? Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88) : 0);
  const direct0 = km(f, t);
  for (const e1 of firsts) {
    const sec = seconds.get(e1.toCode);
    if (!sec) continue;
    const m = REGION_BY_CODE.get(e1.toCode);
    // 너무 돌아가는 중간 도시는 빼기 (직선으로 1.35배 넘게)
    if (direct0 && km(f, m) + km(m, t) > direct0 * 1.35 + 20) continue;
    for (const dp1 of e1.deps) {
      if (dp1[0] < start) continue;
      const arr1 = dp1[0] + dp1[1];
      for (const e2 of sec) {
        const tf = transfer(d, e1, e2), tr = tf.min;
        const mv = tf.how === 'same' ? {} : { move: tf.min, moveHow: tf.how };
        for (const dp2 of e2.deps) {
          const wait = dp2[0] - arr1 - tr;
          if (wait < 0) continue;
          const l1 = leg(d, e1, dp1), l2 = leg(d, e2, dp2);
          const end = l2.arr, ride = dp1[1] + dp2[1];
          if (wait <= 120 && (!fast || end < fast.end)) fast = { kind: 'fast', legs: [l1, l2], mid: e1.toCode, stay: wait, ...mv, ride, end, last: lastOf(e2) };
          if (wait >= STAY_MIN && wait <= STAY_MAX && end <= LATEST && ride <= OVERNIGHT_RIDE) {
            const was = o.visited?.has(e1.toCode) ?? false;
            const midness = direct0 ? 1 - Math.abs(km(f, m) / Math.max(1, km(f, m) + km(m, t)) - 0.5) * 2 : 0.5;
            const score = (was ? 0 : 3) + (o.themeOf?.(e1.toCode) ? 2 : 0) + midness * 2 - (end - dp1[0]) / 600 - (end > 19 * 60 ? 1.5 : 0) - (dp1[0] < 7 * 60 + 30 ? 0.5 : 0);
            stops.push({ kind: 'stop', legs: [l1, l2], mid: e1.toCode, stay: wait, ...mv, ride, end, last: lastOf(e2), score });
          }
          if (dp2[0] > arr1 + tr + STAY_MAX) break;
        }
      }
    }
    // 1박: 오후에 가서 자고 다음 날 9~12시 출발
    for (const dp1 of e1.deps) {
      if (dp1[0] < 12 * 60) continue;
      const arr1 = dp1[0] + dp1[1];
      if (arr1 > 21 * 60) break;
      for (const e2 of sec) {
        const dp2 = e2.deps.find((x) => x[0] >= 9 * 60 && x[0] <= 12 * 60);
        if (!dp2) continue;
        const was = o.visited?.has(e1.toCode) ?? false;
        overnight.push({ kind: 'overnight', legs: [leg(d, e1, dp1), leg(d, e2, dp2, 1440)], mid: e1.toCode, ride: dp1[1] + dp2[1], end: dp2[0] + dp2[1] + 1440, last: lastOf(e2), ...(() => { const tf = transfer(d, e1, e2); return tf.how === 'same' ? {} : { move: tf.min, moveHow: tf.how }; })(), score: (was ? 0 : 3) + (o.themeOf?.(e1.toCode) ? 2 : 0) });
      }
      break; // 오후 첫 차 하나만
    }
  }
  if (fast && (!direct || fast.end < direct.end - 20)) out.push(fast);

  // 들러 가기: 중간 도시마다 가장 좋은 것 하나, 점수 순으로 n개
  const best = new Map<string, TransitPlan & { score: number }>();
  for (const s of stops) { const cur = best.get(s.mid!); if (!cur || s.score > cur.score || (s.score === cur.score && s.end < cur.end)) best.set(s.mid!, s); }
  const picked = [...best.values()].sort((a, b) => b.score - a.score).slice(0, n);
  out.push(...picked.map(({ score: _s, ...p }) => p));

  // 같은 날 들러 갈 길이 없거나 차 타는 시간이 길면 1박 하나
  const longRide = (direct?.ride ?? fast?.ride ?? 0) > OVERNIGHT_RIDE;
  if (!picked.length || longRide) {
    const ob = overnight.sort((a, b) => b.score - a.score || a.end - b.end)[0];
    if (ob) { const { score: _s, ...p } = ob; out.push(p); }
  }
  return out;
}

/** '9:05' */
export const clock = (m: number) => { const x = ((m % 1440) + 1440) % 1440; return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`; };
/** '3시간 20분' */
export const span = (m: number) => { const h = Math.floor(m / 60), r = m % 60; return `${h ? `${h}시간` : ''}${h && r ? ' ' : ''}${r || !h ? `${r}분` : ''}`; };
