import type { When } from './types';
import type { Festival } from './festivals';

/**
 * 계획 이어가기 '언제' 달력: 한 달 칸(앞쪽 빈칸 포함)과 칸마다 표시 — 지난 날 · 가기 좋은 달(초록 점) · 축제(분홍 점) · 고른 기간.
 * 순수 함수 (시험: tests/unit/planCal.test.ts)
 */
export interface CalCell { ymd: string; d: number; past: boolean; good: boolean; fest: string | null; inRange: boolean; isStart: boolean }
const pad = (n: number) => String(n).padStart(2, '0');
const key = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const compact = (s: string) => s.replace(/-/g, '');
/** 'YYYY-MM-DD' → 그 기기 시간대의 그날 0시 (new Date('YYYY-MM-DD')는 UTC로 읽어 미주에선 하루 당겨진다) */
export const dateOf = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };

export function monthCells(y: number, m: number, o: { today: Date; goodMonths: number[]; fests: Festival[]; start?: string | null; nights: number }): (CalCell | null)[] {
  const first = new Date(y, m - 1, 1).getDay();
  const last = new Date(y, m, 0).getDate();
  const today = key(o.today.getFullYear(), o.today.getMonth() + 1, o.today.getDate());
  const end = o.start ? (() => { const s = dateOf(o.start); s.setDate(s.getDate() + o.nights); return key(s.getFullYear(), s.getMonth() + 1, s.getDate()); })() : null;
  const out: (CalCell | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= last; d++) {
    const k = key(y, m, d);
    const f = o.fests.find((x) => compact(k) >= x.s && compact(k) <= (x.e || x.s));
    out.push({ ymd: k, d, past: k < today, good: o.goodMonths.includes(m), fest: f ? f.t : null, inRange: !!o.start && !!end && k >= o.start && k <= end, isStart: k === o.start });
  }
  return out;
}

/** 고른 기간에 열리는 축제 (없으면 그달 가장 가까운 것 하나를 '참고'로) */
export function festsIn(fests: Festival[], start: string, nights: number): { during: Festival[]; near: Festival | null } {
  const s = compact(start);
  const e = (() => { const t = dateOf(start); t.setDate(t.getDate() + nights); return `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}`; })();
  const during = fests.filter((f) => f.s <= e && (f.e || f.s) >= s);
  const near = during.length ? null : fests.filter((f) => f.s.slice(0, 6) === s.slice(0, 6)).sort((a, b) => Math.abs(+a.s - +s) - Math.abs(+b.s - +s))[0] ?? null;
  return { during, near };
}

/** 여행 날짜(하루 단위로 정해진 때만) → 'YYYY-MM-DD' 목록 (최대 31일) */
export const daysOf = (w: When): string[] => {
  if (w.p !== 'day' || !w.y || !w.m || !w.d) return [];
  const s = new Date(w.y, w.m - 1, w.d);
  const e = w.d2 ? new Date(w.y2 ?? w.y, (w.m2 ?? w.m) - 1, w.d2) : s;
  const out: string[] = [];
  for (let t = new Date(s); t <= e && out.length < 31; t.setDate(t.getDate() + 1)) out.push(ymdOf(t));
  return out;
};
function ymdOf(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
