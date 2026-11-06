import type { Photo, Place, Trip } from './types';
import { placeParam } from './geo';

export interface RegionAlbum {
  place: Place;
  /** 최근 여행 사진부터 */
  photos: Photo[];
  /** 이 지역에 다녀온(사진 있는) 여행 수 */
  trips: number;
}

const whenKey = (t: Trip) => (t.when.y ?? 0) * 10000 + (t.when.m ?? 0) * 100 + (t.when.d ?? 0);

/**
 * 사진첩을 지역별로: 여행에 묶인 사진을 그 여행의 지역마다 모은다 (두 지역 여행이면 둘 다에).
 * 여러 번 간 지역은 한 앨범, 사진 많은 지역부터. 여행이 없는 사진은 뺀다.
 */
export function albumsByRegion(trips: Trip[], photos: Photo[]): RegionAlbum[] {
  const byTrip = new Map<string, Photo[]>();
  for (const p of photos) if (p.tripId) byTrip.set(p.tripId, [...(byTrip.get(p.tripId) ?? []), p]);
  const albums = new Map<string, RegionAlbum>();
  const ordered = [...trips].filter((t) => byTrip.has(t.id)).sort((a, b) => whenKey(b) - whenKey(a));
  for (const t of ordered) {
    const ps = byTrip.get(t.id)!;
    for (const place of t.places) {
      const k = placeParam(place);
      const a = albums.get(k) ?? { place, photos: [], trips: 0 };
      a.photos.push(...ps);
      a.trips += 1;
      albums.set(k, a);
    }
  }
  return [...albums.values()].sort((a, b) => b.photos.length - a.photos.length);
}
