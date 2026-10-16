import { useMemo } from 'react';
import type { MapFlag } from '../components/MapView';
import type { Trip, Wish } from './types';
import { bothWant, wishState } from './wishes';

/** 지도 깃발: 아직 다녀오지 않은 가고 싶은 곳만 */
export function useWishFlags(wishes: Wish[] | null, trips: Trip[] | null): MapFlag[] {
  return useMemo(
    () =>
      wishes && trips
        ? wishes
            .filter((w) => wishState(w, trips).kind !== 'done')
            .map((w) => ({ id: w.id, place: w.place, priority: w.priority, both: bothWant(w) }))
        : [],
    [wishes, trips],
  );
}
