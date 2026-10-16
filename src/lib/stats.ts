import type { Place, Trip } from './types';
import { COUNTRY_BY_ID, GROUPS, REGION_BY_CODE } from './geo';
import { isUpcoming, whenSortKey } from './dates';
import { memberNames } from './members';

// ---------- 통계 ----------
export interface Stats {
  /** 시·군 칸별 다녀온 횟수 */
  cellVisits: Map<string, number>;
  /** 예정만 있는 칸 */
  cellPlanned: Set<string>;
  countryVisits: Map<string, number>;
  countryPlanned: Set<string>;
  cities: Set<string>;
  groupsVisited: Set<string>;
  continents: Set<string>;
  tripsDone: number;
  pins: number;
}

export function computeStats(trips: Trip[]): Stats {
  const cellVisits = new Map<string, number>();
  const countryVisits = new Map<string, number>();
  const cellPlanned = new Set<string>();
  const countryPlanned = new Set<string>();
  const cities = new Set<string>();
  const groupsVisited = new Set<string>();
  const continents = new Set<string>();
  let tripsDone = 0;
  for (const t of trips) {
    const done = t.status === 'done';
    if (done) tripsDone++;
    const seenCells = new Set<string>();
    const seenCountries = new Set<string>();
    for (const p of t.places) {
      if (p.t === 'kr') {
        if (seenCells.has(p.code)) continue;
        seenCells.add(p.code);
        if (done) {
          cellVisits.set(p.code, (cellVisits.get(p.code) ?? 0) + 1);
          const r = REGION_BY_CODE.get(p.code);
          if (r) groupsVisited.add(r.group);
        } else cellPlanned.add(p.code);
      } else {
        if (done && p.city) cities.add(`${p.id}:${p.city}`);
        if (seenCountries.has(p.id)) continue;
        seenCountries.add(p.id);
        if (done) {
          countryVisits.set(p.id, (countryVisits.get(p.id) ?? 0) + 1);
          const c = COUNTRY_BY_ID.get(p.id);
          if (c) continents.add(c.continent);
        } else countryPlanned.add(p.id);
      }
    }
  }
  for (const c of cellVisits.keys()) cellPlanned.delete(c);
  for (const c of countryVisits.keys()) countryPlanned.delete(c);
  if (cellVisits.size) continents.add('아시아');
  return {
    cellVisits,
    cellPlanned,
    countryVisits,
    countryPlanned,
    cities,
    groupsVisited,
    continents,
    tripsDone,
    pins: cellVisits.size + countryVisits.size,
  };
}

export const TOTAL_CELLS = REGION_BY_CODE.size;
export const TOTAL_GROUPS = GROUPS.length;

export function tripsAtPlace(trips: Trip[], match: (p: Place) => boolean) {
  return trips.filter((t) => t.places.some(match));
}

/** 같이 간 사람 칩 후보: 자주 쓴 순 */
export function companionSuggestions(trips: Trip[]): string[] {
  const count = new Map<string, number>();
  for (const t of trips) for (const c of t.companions) count.set(c, (count.get(c) ?? 0) + 1);
  const base = memberNames();
  const rest = [...count.entries()].filter(([n]) => !base.includes(n)).sort((a, b) => b[1] - a[1]).map(([n]) => n);
  return [...base, ...rest];
}

/** 다가오는 여행: 가까운 날부터, 날짜 모르는 계획은 뒤로. 날짜가 지난 계획은 뺀다 */
export function upcomingTrips(trips: Trip[], now = new Date()): Trip[] {
  return trips
    .filter((t) => t.status === 'planned' && (t.when.p === 'unknown' || isUpcoming(t.when, now)))
    .sort((a, b) => (a.when.y ? whenSortKey(a.when) : 9e9) - (b.when.y ? whenSortKey(b.when) : 9e9));
}

/** 날짜가 지났는데 아직 '예정'인 여행 (다녀왔는지 물어볼 것) */
export function overdueTrips(trips: Trip[], now = new Date()): Trip[] {
  return trips.filter((t) => t.status === 'planned' && t.when.p !== 'unknown' && !!t.when.y && !isUpcoming(t.when, now));
}

/** 최근에 남긴 기록 순서 (날짜를 모르는 기록도 방금 남겼으면 위로) */
export function recentlyAdded(trips: Trip[], n = 3): Trip[] {
  const ms = (t: Trip) => (t.createdAt && typeof t.createdAt.toMillis === 'function' ? t.createdAt.toMillis() : Date.now());
  return trips.filter((t) => t.status === 'done').sort((a, b) => ms(b) - ms(a)).slice(0, n);
}
