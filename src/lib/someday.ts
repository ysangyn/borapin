/**
 * '언젠가 갈 곳': 예정 여행인데 해(年)조차 정하지 않은 것. 날짜가 정해진 '다가오는 여행'과 나눠 보여 준다
 * (예전에 '갈 거예요'로 적어 둔 곳들이 모두 '예정'으로 보여 진짜 계획과 섞였다).
 */
import type { Trip, Wish, WishInput } from './types';
import { samePlace } from './wishes';
import { isMemberName } from './members';

export const isSomeday = (t: Pick<Trip, 'status' | 'when'>) => t.status === 'planned' && !t.when.y;

/** 목록 줄의 작은 표시: 언젠가 / D-n / 예정 / (다녀온 여행은 없음) */
export function tripMark(t: Pick<Trip, 'status' | 'when'>, dday: (w: Trip['when']) => string | null): string | null {
  if (t.status !== 'planned') return null;
  if (isSomeday(t)) return '언젠가';
  return dday(t.when) ?? '예정';
}

/** 언젠가 갈 곳(날짜 없는 예정 여행) → 가고 싶은 곳: 장소마다 하나, 이미 담은 곳은 건너뛴다. 메모와 누가 원하는지(우리 둘 중) 옮긴다 */
export function somedayToWishes(trip: Pick<Trip, 'places' | 'memo' | 'companions'>, wishes: Pick<Wish, 'place'>[], isMember: (name: string) => boolean = isMemberName): WishInput[] {
  const who = (trip.companions ?? []).filter(isMember);
  return trip.places
    .filter((p) => !wishes.some((w) => samePlace(w.place, p)))
    .map((place) => ({ place, priority: null, spots: [], todos: [], foods: [], note: (trip.memo ?? '').slice(0, 500), ...(who.length ? { wantedBy: who } : {}), source: 'app' as const }));
}
