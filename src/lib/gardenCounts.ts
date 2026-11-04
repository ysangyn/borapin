import { useEffect, useState } from 'react';
import { countTripPhotos } from './photos';
import { countTripNotes } from './tripExtras';
import type { Trip } from './types';

/**
 * 꽃 지도 '마음' 재료: 다녀온 여행마다 사진·글 개수 (사진을 받지 않고 서버에서 센다 — 여행 하나에 읽기 2회).
 * 한 번 센 여행은 앱을 다시 열 때까지 기억해서 홈·지도·지역 창이 같이 쓴다.
 */
export interface TripMemory { photos: number; notes: number }
const cache = new Map<string, Promise<TripMemory>>();
const countOf = (id: string) => {
  let p = cache.get(id);
  if (!p) {
    p = Promise.all([countTripPhotos(id), countTripNotes(id)]).then(([photos, notes]) => ({ photos: photos ?? 0, notes: notes ?? 0 }), () => ({ photos: 0, notes: 0 }));
    cache.set(id, p);
  }
  return p;
};
/** 사진을 올리거나 글을 쓴 뒤 그 여행만 다시 세게 */
export const forgetTripMemory = (tripId: string) => cache.delete(tripId);

export function useTripMemories(trips: Trip[] | null | undefined): Map<string, TripMemory> | null {
  const [m, setM] = useState<Map<string, TripMemory> | null>(null);
  const key = (trips ?? []).filter((t) => t.status === 'done' && t.places.some((p) => p.t === 'kr')).map((t) => t.id).sort().join(',');
  useEffect(() => {
    if (!key) { setM(new Map()); return; }
    let live = true;
    const ids = key.split(',');
    void Promise.all(ids.map(async (id) => [id, await countOf(id)] as const)).then((rows) => live && setM(new Map(rows)));
    return () => { live = false; };
  }, [key]);
  return m;
}
