import type { Trip } from './types';
import { placeLong } from './geo';

/** PC 사진함(desk/)이 사진을 여행과 견주는 데 쓰는 여행 목록. 사진함은 id·title·when·places만 본다. */
export interface TripsExport {
  v: 1;
  exportedAt: string;
  trips: { id: string; title: string; when: Trip['when']; places: Trip['places']; placeNames: string[]; status: Trip['status'] }[];
}

export function tripsExport(trips: Trip[], now = new Date()): TripsExport {
  const p = (n: number) => String(n).padStart(2, '0');
  return {
    v: 1,
    exportedAt: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`,
    trips: trips
      .filter((t) => t.status === 'done')
      .map((t) => ({ id: t.id, title: t.title, when: t.when, places: t.places, placeNames: t.places.map(placeLong), status: t.status })),
  };
}
