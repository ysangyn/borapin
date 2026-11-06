import type { Place, When } from '../../src/lib/types';
import { tripDays } from '../../src/lib/dates';
import type { Item } from './types';

/** 보라핀 앱 '우리 공간'에서 내보낸 여행 목록 한 줄 */
export interface DeskTrip { id: string; title: string; when: When; places: Place[] }
export interface TripsExport { v: 1; exportedAt: string; space?: string; trips: DeskTrip[] }

export type Confidence = 'sure' | 'guess' | 'weak';
export interface TripMatch { tripId: string | null; confidence: Confidence | null }

/**
 * 사진 촬영일을 여행 날짜와 견준다.
 * 날짜 여행(p=day)은 그 날들 안이면 sure · 달 여행(p=month)은 같은 달이면 guess · 해 여행(p=year)은 같은 해면 weak.
 * 여러 여행이 겹치면 더 정확한 쪽(day > month > year).
 */
export function matchTrips(items: Item[], trips: DeskTrip[]): TripMatch[] {
  const dayIdx = new Map<string, string>();
  const monthIdx = new Map<string, string>();
  const yearIdx = new Map<string, string>();
  for (const t of trips) {
    const w = t.when;
    if (w.p === 'day') for (const d of tripDays(w)) dayIdx.set(d, t.id);
    else if (w.p === 'month' && w.y && w.m) {
      const last = w.m2 ?? w.m, y2 = w.y2 ?? w.y;
      for (let y = w.y, m = w.m; y < y2 || (y === y2 && m <= last); m++) { if (m > 12) { m = 1; y++; } monthIdx.set(`${y}-${String(m).padStart(2, '0')}`, t.id); }
    } else if (w.y) yearIdx.set(String(w.y), t.id);
  }
  return items.map((i) => {
    if (!i.taken) return { tripId: null, confidence: null };
    const day = i.taken.slice(0, 10), month = i.taken.slice(0, 7), year = i.taken.slice(0, 4);
    // 메신저로 받은 사진은 '받은 날'이라 날짜가 맞아도 약한 추정까지만
    const cap = (c: Confidence): Confidence => (i.received ? 'weak' : c);
    if (day.length === 10 && dayIdx.has(day)) return { tripId: dayIdx.get(day)!, confidence: cap('sure') };
    if (month.length === 7 && monthIdx.has(month)) return { tripId: monthIdx.get(month)!, confidence: cap('guess') };
    if (yearIdx.has(year)) return { tripId: yearIdx.get(year)!, confidence: 'weak' };
    return { tripId: null, confidence: null };
  });
}

/** 내보낸 JSON 파일 읽기 (모양이 다르면 빈 목록) */
export function parseTripsExport(text: string): DeskTrip[] {
  try {
    const j = JSON.parse(text) as Partial<TripsExport>;
    if (!Array.isArray(j.trips)) return [];
    return j.trips.filter((t) => t && typeof t.id === 'string' && t.when && Array.isArray(t.places));
  } catch {
    return [];
  }
}
