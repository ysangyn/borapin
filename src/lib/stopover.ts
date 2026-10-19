import { REGIONS } from './geo';
import { straightKm } from './placeApps';
import type { TravelInfo } from './travelinfo';

/**
 * 차로 갈 때 '가는 길에 들르기': 집 → 목적지 길에서 조금만 돌아가는 시·군 (순수 함수).
 * - 덜 돌아감: (집→여기 + 여기→목적지) − (집→목적지) ≤ max(20km, 직선의 25%)
 * - 집·목적지 시·군은 빼고, 집에서 30km 안(일상 동네)도 뺀다
 * - 안 가 본 곳, 볼거리 자료 있는 곳, 길의 가운데쯤(쉬어 가기 좋은 곳)을 앞에
 * 시간은 '길은 직선의 1.3배, 시속 70km'로 어림한다 (화면엔 '약').
 */
export interface Stopover { code: string; extraMin: number; atKm: number; theme: string; spots: string[]; visited: boolean }

export function stopovers(home: { lat: number; lng: number; code: string }, dest: { lat: number; lng: number; code: string }, visited: Map<string, number> | Set<string>, info: TravelInfo | null, n = 3): Stopover[] {
  const direct = straightKm(home, dest);
  if (direct < 60) return [];
  const slack = Math.max(20, direct * 0.25);
  const out: (Stopover & { score: number })[] = [];
  for (const r of REGIONS) {
    if (r.code === home.code || r.code === dest.code) continue;
    const a = straightKm(home, r), b = straightKm(r, dest);
    if (a < 30 || b < 15) continue;
    const detour = a + b - direct;
    if (detour > slack) continue;
    const cell = info?.cells[r.code];
    const was = visited.has(r.code);
    const mid = 1 - Math.abs(a / (a + b) - 0.5) * 2; // 1 = 딱 가운데
    const score = (was ? 0 : 3) + (cell ? 2 : 0) + mid * 2 - detour / slack;
    out.push({ code: r.code, extraMin: Math.round(((detour * 1.3) / 70) * 60 / 5) * 5, atKm: Math.round(a), theme: cell?.main.theme ?? '', spots: cell?.main.spots.slice(0, 2) ?? [], visited: was, score });
  }
  // 같은 광역에 몰리지 않게 위에서부터 고르되, 서로 25km 안이면 하나만
  const picked: typeof out = [];
  for (const s of out.sort((x, y) => y.score - x.score)) {
    const r = REGIONS.find((x) => x.code === s.code)!;
    if (picked.some((p) => straightKm(REGIONS.find((x) => x.code === p.code)!, r) < 25)) continue;
    picked.push(s);
    if (picked.length >= n) break;
  }
  return picked.map(({ score: _s, ...x }) => x);
}
