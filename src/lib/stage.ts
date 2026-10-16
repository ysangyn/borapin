import { dday, isUpcoming, whenSortKey } from './dates';
import type { Trip } from './types';

/**
 * 홈이 여행 전·중·후에 따라 바뀌게: 지금 가장 가까운 여행 하나와 그 단계.
 * - before: 정확한 날짜가 있고 14일 안에 떠나는 예정 여행 (D-n)
 * - during: 오늘이 여행 기간 안
 * - after: 7일 안에 끝난(또는 다녀온 걸로 바꾼) 여행 — 사진·한 줄을 남기자고 권한다
 */
export type Stage =
  | { kind: 'before'; trip: Trip; label: string; days: number }
  | { kind: 'during'; trip: Trip; label: string; day: number }
  | { kind: 'after'; trip: Trip; label: string; daysAgo: number };

const DAY = 86400000;
const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);

export function tripStage(trips: Trip[], now = new Date()): Stage | null {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dated = trips.filter((t) => t.when.p === 'day' && t.when.y && t.when.m && t.when.d);
  // 여행 중 > 곧 떠남 > 막 다녀옴
  for (const t of dated) {
    const w = t.when;
    const start = utc(w.y!, w.m!, w.d!);
    const end = w.d2 ? utc(w.y2 ?? w.y!, w.m2 ?? w.m!, w.d2) : start;
    if (today >= start && today <= end && t.status === 'planned') {
      return { kind: 'during', trip: t, label: dday(w, now) ?? '여행 중', day: Math.round((today - start) / DAY) + 1 };
    }
  }
  const soon = dated
    .filter((t) => t.status === 'planned' && isUpcoming(t.when, now))
    .map((t) => ({ t, n: Math.round((utc(t.when.y!, t.when.m!, t.when.d!) - today) / DAY) }))
    .filter((x) => x.n >= 0 && x.n <= 14)
    .sort((a, b) => a.n - b.n)[0];
  if (soon) return { kind: 'before', trip: soon.t, label: dday(soon.t.when, now) ?? '곧', days: soon.n };
  const just = dated
    .filter((t) => t.status === 'done')
    .map((t) => {
      const w = t.when;
      const end = w.d2 ? utc(w.y2 ?? w.y!, w.m2 ?? w.m!, w.d2) : utc(w.y!, w.m!, w.d!);
      return { t, ago: Math.round((today - end) / DAY) };
    })
    .filter((x) => x.ago >= 0 && x.ago <= 7)
    .sort((a, b) => a.ago - b.ago || whenSortKey(b.t.when) - whenSortKey(a.t.when))[0];
  if (just) return { kind: 'after', trip: just.t, label: just.ago === 0 ? '오늘 돌아왔어요' : `${just.ago}일 전에 다녀왔어요`, daysAgo: just.ago };
  return null;
}
