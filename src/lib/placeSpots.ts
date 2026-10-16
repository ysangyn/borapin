import { useMemo } from 'react';
import type { PlaceRec } from './types';
import type { MapSpot } from '../components/MapView';

/** 지도에 띄울 '우리 장소' 표시: 지역마다 몇 곳 남겼는지 */
export function usePlaceSpots(recs: PlaceRec[] | null): MapSpot[] {
  return useMemo(() => {
    const by = new Map<string, MapSpot>();
    for (const r of recs ?? []) {
      const key = r.region.t === 'kr' ? `kr:${r.region.code}` : `c:${r.region.id}`;
      const cur = by.get(key);
      if (cur) cur.count++;
      else by.set(key, { place: r.region, count: 1 });
    }
    return [...by.values()];
  }, [recs]);
}
