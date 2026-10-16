import { computeStats } from './data';
import { tripDays } from './tripExtras';
import { placeLong } from './geo';
import type { Place, Trip } from './types';

const key = (p: Place) => (p.t === 'kr' ? `kr:${p.code}` : `w:${p.id}`);

/** 한 해 결산: 여행 횟수, 밖에서 보낸 날, 처음 가본 곳, 가장 많이 간 곳 */
export function yearReview(trips: Trip[], year: number) {
  const done = trips.filter((t) => t.status === 'done');
  const inYear = done.filter((t) => t.when.y === year);
  const before = new Set(done.filter((t) => t.when.y && t.when.y < year).flatMap((t) => t.places.map(key)));
  const firsts: Place[] = [];
  for (const t of inYear) for (const p of t.places) if (!before.has(key(p)) && !firsts.some((f) => key(f) === key(p))) firsts.push(p);
  // 밖에서 보낸 날: 날짜가 정확한 여행은 실제 날수, 아니면 1일로 센다
  const days = inYear.reduce((n, t) => n + Math.max(1, tripDays(t.when).length), 0);
  const known = inYear.every((t) => tripDays(t.when).length > 0);
  const count = new Map<string, { p: Place; n: number }>();
  for (const t of inYear) for (const p of t.places) count.set(key(p), { p, n: (count.get(key(p))?.n ?? 0) + 1 });
  const top = [...count.values()].sort((a, b) => b.n - a.n)[0];
  const stats = computeStats(inYear);
  return {
    trips: inYear.length,
    days,
    daysExact: known,
    firsts,
    top: top && top.n > 1 ? `${placeLong(top.p)} ${top.n}번` : null,
    cells: stats.cellVisits.size,
    countries: stats.countryVisits.size,
  };
}

/** 연도·달 잔디: 달까지 아는 기록만 칸에 들어간다 (계절만 알면 계절 가운데 달) */
export function monthGrid(trips: Trip[]) {
  const SEASON_MID: Record<string, number> = { spring: 4, summer: 7, autumn: 10, winter: 1 };
  const grid = new Map<number, number[]>();
  let undated = 0;
  for (const t of trips.filter((x) => x.status === 'done')) {
    const m = t.when.m ?? (t.when.s ? SEASON_MID[t.when.s] : null);
    if (!t.when.y || !m) { undated++; continue; }
    const row = grid.get(t.when.y) ?? new Array(12).fill(0);
    row[m - 1]++;
    grid.set(t.when.y, row);
  }
  return { rows: [...grid.entries()].sort((a, b) => b[0] - a[0]), undated };
}
