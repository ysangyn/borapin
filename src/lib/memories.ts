import type { Trip, Season } from './types';
import { josa } from 'es-hangul';
import { SEASON_LABEL } from './dates';
import { placeLabel } from './geo';

export interface Memory { trip: Trip; label: string }

function seasonOf(m: number): Season {
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter';
}

const agoYears = (y: number, now: Date) => now.getFullYear() - y;
const yearsLabel = (n: number) => (n === 1 ? '작년' : n === 2 ? '재작년' : `${n}년 전`);

/**
 * 아는 만큼만 말하는 추억 찾기: 정확한 날짜 → 같은 달 → 같은 계절 → 날짜 모르는 기록은 장소로.
 * 장소가 빈 옛 기록(v22)은 건너뛴다: 추억 카드는 첫 장소 이름으로 네모를 그리므로 보여 줄 게 없다.
 */
export function pickMemory(trips: Trip[], now = new Date(), seed = now.getDate()): Memory | null {
  const done = trips.filter((t) => t.status === 'done' && t.places.length > 0);
  if (!done.length) return null;
  const m = now.getMonth() + 1, d = now.getDate();
  const past = done.filter((t) => t.when.y && t.when.y < now.getFullYear());

  // 1. 같은 날(앞뒤 3일)
  const sameDay = past.filter((t) => t.when.p === 'day' && t.when.m === m && t.when.d && Math.abs(t.when.d - d) <= 3);
  if (sameDay.length) {
    const t = sameDay[seed % sameDay.length];
    const n = agoYears(t.when.y!, now);
    return { trip: t, label: t.when.d === d ? `${n}년 전 오늘` : `${n}년 전 이번 주` };
  }
  // 2. 같은 달
  const sameMonth = past.filter((t) => (t.when.p === 'day' || t.when.p === 'month') && t.when.m === m);
  if (sameMonth.length) {
    const t = sameMonth[seed % sameMonth.length];
    const n = agoYears(t.when.y!, now);
    return { trip: t, label: n === 1 ? '작년 이맘때' : `${n}년 전 ${m}월` };
  }
  // 3. 같은 계절
  const s = seasonOf(m);
  const sameSeason = past.filter((t) => (t.when.s ?? (t.when.m ? seasonOf(t.when.m) : null)) === s);
  if (sameSeason.length) {
    const t = sameSeason[seed % sameSeason.length];
    return { trip: t, label: `${yearsLabel(agoYears(t.when.y!, now))} ${SEASON_LABEL[s]}` };
  }
  // 4. 연도만 아는 기록
  const yearOnly = past.filter((t) => t.when.y);
  if (yearOnly.length) {
    const t = yearOnly[seed % yearOnly.length];
    return { trip: t, label: `${t.when.y}년의 여행` };
  }
  // 5. 날짜를 모르는 기록은 장소로 꺼낸다
  const t = done[seed % done.length];
  const where = t.places[0] ? placeLabel(t.places[0]) : '';
  return { trip: t, label: where ? `오늘은 ${josa(where, '을/를')} 다시 볼까요?` : '다시 꺼내 보는 여행' };
}
