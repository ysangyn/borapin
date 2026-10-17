/**
 * 여행 계획하기 (순수 모듈 — Firebase 없음, 시험 가능).
 * 1) 조건(언제·며칠·누구와·국내/해외)만으로 후보 3곳: 둘 다 원하는 곳 > 한 명이 원하는 곳 > 그 달에 좋은 곳·축제·안 가본 곳
 * 2) 정한 곳으로 하루하루 뼈대: 오전 볼거리 → 점심 → 오후 볼거리 → 저녁 (우리 장소 '또 갈래요'·축제를 먼저)
 */
import { REGION_BY_CODE, placeLabel } from './geo';
import { seasonFor, monthsLabel, type SeasonData } from './seasons';
import { upcomingFestivals, festivalPeriod, type FestivalData } from './festivals';
import { pickCities, cityFor, cityPlace, type WorldData } from './world';
import { candidates as krCandidates } from './recommend';
import { dailyShuffle, samePlace, bothWant, wishState } from './wishes';
import { accessLine } from './transport';
import type { Stats } from './stats';
import type { TravelInfo } from './travelinfo';
import type { Place, PlaceRec, Trip, Wish, When } from './types';

export type WhenKind = 'weekend' | 'nextweekend' | 'nextmonth' | 'pick' | 'unknown';
export interface PlanConds {
  when: WhenKind;
  /** 'pick'일 때 떠나는 날 YYYY-MM-DD */
  start?: string;
  /** 0 = 당일, 1 = 1박 … */
  nights: number;
  who: string | null; // 둘이 · 부모님 · 아이 · 친구
  scope: 'kr' | 'world' | 'any';
}

const pad = (n: number) => String(n).padStart(2, '0');
export const ymdOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** 조건 → 떠나는 날·돌아오는 날 (모르면 null) */
export function dateRange(c: PlanConds, now = new Date()): { start: Date; end: Date } | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start: Date | null = null;
  if (c.when === 'weekend' || c.when === 'nextweekend') {
    const toSat = (6 - today.getDay() + 7) % 7; // 오늘이 토요일이면 오늘
    start = addDays(today, toSat + (c.when === 'nextweekend' ? 7 : 0));
  } else if (c.when === 'nextmonth') {
    const first = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    start = addDays(first, (6 - first.getDay() + 7) % 7); // 다음 달 첫 토요일
  } else if (c.when === 'pick' && c.start) {
    const [y, m, d] = c.start.split('-').map(Number);
    start = new Date(y, m - 1, d);
  }
  if (!start) return null;
  return { start, end: addDays(start, Math.max(0, c.nights)) };
}

export function whenOf(c: PlanConds, now = new Date()): When {
  const r = dateRange(c, now);
  if (!r) return { p: 'unknown' };
  const w: When = { p: 'day', y: r.start.getFullYear(), m: r.start.getMonth() + 1, d: r.start.getDate() };
  if (c.nights > 0) { w.y2 = r.end.getFullYear(); w.m2 = r.end.getMonth() + 1; w.d2 = r.end.getDate(); }
  return w;
}

export const WHEN_LABEL: Record<WhenKind, string> = { weekend: '이번 주말', nextweekend: '다음 주말', nextmonth: '다음 달', pick: '날짜 고르기', unknown: '아직 몰라요' };
export const nightsLabel = (n: number) => (n === 0 ? '당일' : `${n}박 ${n + 1}일`);

export interface Candidate { place: Place; title: string; reasons: string[]; wishId?: string; score: number }
export interface PlannerData {
  wishes: Wish[];
  trips: Trip[];
  stats: Stats | null;
  info: TravelInfo | null;
  seasons: SeasonData | null;
  festivals: FestivalData | null;
  world: WorldData | null;
  recs: PlaceRec[];
}

/** 수도권에서 당일·1박으로 다녀올 만한 광역 */
const NEAR_GROUPS = new Set(['seoul', 'gyeonggi', 'incheon', 'gangwon', 'chungnam', 'chungbuk', 'daejeon', 'sejong']);
const keyOf = (p: Place) => (p.t === 'kr' ? `kr:${p.code}` : `w:${p.id}:${p.city ?? ''}`);

/** 후보 3곳 (skip: 이미 본 후보는 빼고 다시 고를 때) */
export function planCandidates(c: PlanConds, d: PlannerData, now = new Date(), skip: string[] = [], n = 3): Candidate[] {
  const range = dateRange(c, now);
  const month = range ? range.start.getMonth() + 1 : (now.getMonth() + 1) % 12 + 1;
  const pool = new Map<string, Candidate>();
  const add = (place: Place, title: string, score: number, reason: string, wishId?: string) => {
    const k = keyOf(place);
    if (skip.includes(k)) return;
    const cur = pool.get(k);
    if (cur) { cur.score += score; if (reason && !cur.reasons.includes(reason)) cur.reasons.push(reason); if (wishId) cur.wishId = wishId; }
    else pool.set(k, { place, title, reasons: reason ? [reason] : [], wishId, score });
  };
  const fitsScope = (p: Place) => c.scope === 'any' || (c.scope === 'kr' ? p.t === 'kr' : p.t === 'country');
  const fitsLength = (p: Place) => {
    if (p.t === 'kr') {
      const g = REGION_BY_CODE.get(p.code)?.group ?? '';
      if (c.nights === 0) return NEAR_GROUPS.has(g);
      if (g === 'jeju') return c.nights >= 1;
      return true;
    }
    const w = cityFor(d.world, p);
    if (!w) return c.nights >= 3;
    return c.nights >= 3 || (c.nights >= 2 ? w.fly <= 4.5 : c.nights >= 1 ? w.fly <= 2.5 : false);
  };

  // 1. 가고 싶은 곳 (둘 다 원하면 크게)
  for (const w of d.wishes) {
    if (wishState(w, d.trips).kind !== 'wish' || !fitsScope(w.place) || !fitsLength(w.place)) continue;
    const both = bothWant(w);
    add(w.place, placeLabel(w.place), both ? 10 : 5, both ? '둘 다 가고 싶다고 한 곳' : `${(w.wantedBy ?? []).join('·') || '누군가'}가 가고 싶다고 한 곳`, w.id);
    if (w.priority) add(w.place, '', 4 - w.priority, `${w.priority}순위`);
  }
  // 2. 그 달에 좋은 국내 (안 가본 곳 먼저), 축제가 겹치면 더
  if (c.scope !== 'world') {
    const list = dailyShuffle(krCandidates({ scope: 'kr', unvisitedOnly: false, theme: null, stats: d.stats, info: d.info, wishes: [] }), `plan-${ymdOf(now)}`);
    for (const k of list) {
      if (!fitsLength(k.place) || k.place.t !== 'kr') continue;
      const s = seasonFor(d.seasons, k.place);
      const visited = d.stats?.cellVisits.has(k.place.code);
      const fest = range ? upcomingFestivals(d.festivals, k.place.code, range.start, Math.max(1, c.nights + 1)).find((f) => f.s <= ymdOf(range.end).replace(/-/g, '')) : undefined;
      let score = 0; const why: string[] = [];
      if (s?.m.includes(month)) { score += 2; why.push(`${month}월에 좋아요 · ${s.why}`); }
      if (fest) { score += 4; why.push(`그때 축제: ${fest.t} (${festivalPeriod(fest)})`); }
      if (!visited) { score += 1; why.push('아직 안 가본 곳'); }
      if (score >= 3) for (const r of why) add(k.place, placeLabel(k.place), score / why.length, r);
    }
  }
  // 3. 해외 도시 (기간이 되면)
  if (c.scope !== 'kr' && c.nights >= 1) {
    const flyMax = c.nights >= 3 ? 'far' : c.nights >= 2 ? 'near' : 'near';
    for (const w of pickCities(d.world, { month, with: c.who, fly: flyMax === 'far' ? null : 'near' }, d.stats, d.wishes).slice(0, 12)) {
      const p = cityPlace(w);
      if (!fitsLength(p)) continue;
      add(p, `${w.city}`, w.best.includes(month) ? 3 : 1.5, w.best.includes(month) ? `${month}월에 좋아요 · ${w.why}` : w.line);
    }
  }
  // 누구와: 부모님이면 많이 걷는 곳 낮게
  if (c.who === '부모님') for (const cand of pool.values()) { const w = cityFor(d.world, cand.place); if (w && w.walk === 3) cand.score -= 2; }

  const sorted = [...pool.values()].sort((a, b) => b.score - a.score);
  // 같은 광역이 셋 다 되지 않게
  const out: Candidate[] = [];
  const groups = new Map<string, number>();
  for (const cand of sorted) {
    const g = cand.place.t === 'kr' ? REGION_BY_CODE.get(cand.place.code)?.group ?? '' : cand.place.id;
    if ((groups.get(g) ?? 0) >= 1 && sorted.length > n * 2) continue;
    groups.set(g, (groups.get(g) ?? 0) + 1);
    // 가는 길·가기 좋은 때 한 줄 보태기
    const s = seasonFor(d.seasons, cand.place, d.wishes.find((w) => w.id === cand.wishId)?.months);
    const line = accessLine(cand.place);
    if (line) cand.reasons.push(line);
    else if (s && !cand.reasons.some((r) => r.includes('좋아요'))) cand.reasons.push(`가기 좋은 때 ${monthsLabel(s.m)}`);
    out.push(cand);
    if (out.length >= n) break;
  }
  return out;
}

export interface SkeletonItem { day: string | null; time: string | null; name: string; info: string; recId?: string }

/** 하루하루 뼈대: 오전 볼거리 → 점심 → 오후 볼거리 → 저녁 (당일은 하루, 날짜를 모르면 날짜 없이 목록만) */
export function skeleton(place: Place, c: PlanConds, d: Pick<PlannerData, 'info' | 'festivals' | 'world' | 'recs'>, now = new Date()): SkeletonItem[] {
  const range = dateRange(c, now);
  const days: (string | null)[] = range ? Array.from({ length: c.nights + 1 }, (_, i) => ymdOf(addDays(range.start, i))) : [null];
  let spots: string[] = [], foods: string[] = [];
  if (place.t === 'kr') {
    const cell = d.info?.cells[place.code];
    spots = [...(cell?.main.spots ?? []), ...(cell?.subs.flatMap((s) => s.spots) ?? [])];
    foods = [...(cell?.main.foods ?? []), ...(cell?.subs.flatMap((s) => s.foods) ?? [])];
  } else {
    const w = cityFor(d.world, place);
    spots = w?.see ?? []; foods = w?.eat ?? [];
  }
  const ours = d.recs.filter((r) => samePlace(r.region, place));
  const againFood = ours.filter((r) => (r.kind === 'food' || r.kind === 'cafe') && r.verdict === 'again');
  const againSight = ours.filter((r) => r.kind !== 'food' && r.kind !== 'cafe' && r.verdict === 'again');
  const sightQ = [...againSight.map((r) => ({ name: r.name, info: '우리가 또 가고 싶다고 한 곳', recId: r.id })), ...spots.map((s) => ({ name: s, info: '' }))];
  const foodQ = [...againFood.map((r) => ({ name: r.name, info: '우리가 또 가고 싶다고 한 곳', recId: r.id })), ...foods.map((f) => ({ name: f, info: '이 지역 먹거리' }))];
  const seen = new Set<string>();
  const take = (q: { name: string; info: string; recId?: string }[]) => { while (q.length) { const x = q.shift()!; if (!seen.has(x.name)) { seen.add(x.name); return x; } } return null; };
  const out: SkeletonItem[] = [];
  const line = accessLine(place);
  days.forEach((day, i) => {
    const last = i === days.length - 1;
    if (i === 0 && line) out.push({ day, time: '09:00', name: '출발', info: `가는 길: ${line}` });
    const slots: [string, typeof sightQ][] = [['10:30', sightQ], ['12:30', foodQ], ['14:30', sightQ], ...(last && days.length > 1 ? [] : [['18:30', foodQ]] as [string, typeof sightQ][])];
    for (const [time, q] of slots) { const x = take(q); if (x) out.push({ day, time, name: x.name, info: x.info, recId: x.recId }); }
    if (last && days.length > 1) out.push({ day, time: '16:00', name: '집으로', info: '' });
  });
  // 축제가 그 기간에 열리면 첫날 오후에
  if (place.t === 'kr' && range) {
    const f = upcomingFestivals(d.festivals, place.code, range.start, c.nights + 1)[0];
    if (f) out.push({ day: days[0], time: '15:30', name: f.t, info: `축제 ${festivalPeriod(f)}` });
  }
  return out.sort((a, b) => (a.day ?? '').localeCompare(b.day ?? '') || (a.time ?? '').localeCompare(b.time ?? ''));
}

export const candidateKey = keyOf;
