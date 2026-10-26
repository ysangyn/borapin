import { REGIONS } from './geo';
import { straightKm } from './placeApps';

/**
 * 다음 한 칸: 우리 집에서 가장 가까운, 아직 안 가 본(계획도 없는) 시·군 하나 (순수 함수).
 * 수집을 '채워야 할 숫자'가 아니라 '이번 주말 갈 곳 하나'로 보여 주려는 것 (docs/SPEC-2026-11.md C5).
 * 시간은 stopover.ts와 같은 어림: 길은 직선의 1.3배, 시속 70km, 10분 단위 (화면엔 '약').
 */
export interface NextCell { code: string; name: string; km: number; min: number }

export function nextCell(home: { lat: number; lng: number; code: string } | null | undefined, visited: Map<string, number> | Set<string>, planned: Set<string> = new Set()): NextCell | null {
  if (!home) return null;
  let best: NextCell | null = null;
  for (const r of REGIONS) {
    if (r.code === home.code || visited.has(r.code) || planned.has(r.code)) continue;
    const km = straightKm(home, r);
    if (!best || km < best.km) best = { code: r.code, name: r.name, km, min: 0 };
  }
  if (!best) return null;
  best.km = Math.round(best.km);
  best.min = Math.max(10, Math.round((best.km * 1.3) / 70 * 6) * 10);
  return best;
}

/** '약 1시간 10분' · '약 40분' */
export function aboutMin(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  return `약 ${h ? `${h}시간` : ''}${h && m ? ' ' : ''}${m || !h ? `${m}분` : ''}`;
}
