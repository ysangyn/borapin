/**
 * '언젠가 갈 곳': 예정 여행인데 해(年)조차 정하지 않은 것. 날짜가 정해진 '다가오는 여행'과 나눠 보여 준다
 * (예전에 '갈 거예요'로 적어 둔 곳들이 모두 '예정'으로 보여 진짜 계획과 섞였다).
 */
import type { Trip } from './types';

export const isSomeday = (t: Pick<Trip, 'status' | 'when'>) => t.status === 'planned' && !t.when.y;

/** 목록 줄의 작은 표시: 언젠가 / D-n / 예정 / (다녀온 여행은 없음) */
export function tripMark(t: Pick<Trip, 'status' | 'when'>, dday: (w: Trip['when']) => string | null): string | null {
  if (t.status !== 'planned') return null;
  if (isSomeday(t)) return '언젠가';
  return dday(t.when) ?? '예정';
}
