import type { Season, When } from './types';

export const SEASON_LABEL: Record<Season, string> = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
const SEASON_MID: Record<Season, number> = { spring: 4, summer: 7, autumn: 10, winter: 1 };

const pad = (n: number) => String(n).padStart(2, '0');

/** 정렬용 숫자. 모르는 날짜는 0 → 맨 뒤로 */
export function whenSortKey(w: When): number {
  if (!w.y) return 0;
  const m = w.m ?? (w.s ? SEASON_MID[w.s] : 6);
  const d = w.d ?? 15;
  return w.y * 10000 + m * 100 + d;
}

export function whenYear(w: When): number | null {
  return w.y ?? null;
}

/** 화면 표시: '2025.11.13–17', '2019년 1월쯤', '2019 여름', '2018년쯤', '날짜 모름' */
/** 화면엔 '(추정)'을 붙이지 않는다 — 사진 날짜로 채운 것도 그냥 날짜로 보여 준다 (est 값은 자료에 남음) */
export function formatWhen(w: When): string {
  return formatWhenBase(w);
}

function formatWhenBase(w: When): string {
  switch (w.p) {
    case 'day': {
      if (!w.y || !w.m || !w.d) return w.y ? `${w.y}년` : '날짜 모름';
      const a = `${w.y}.${w.m}.${w.d}`;
      if (!w.d2) return a;
      if ((w.y2 ?? w.y) !== w.y) return `${a} – ${w.y2}.${w.m2}.${w.d2}`;
      if ((w.m2 ?? w.m) !== w.m) return `${a} – ${w.m2}.${w.d2}`;
      if (w.d2 === w.d) return a;
      return `${a}–${w.d2}`;
    }
    case 'month':
      return w.y && w.m ? `${w.y}년 ${w.m}월쯤` : w.y ? `${w.y}년쯤` : '날짜 모름';
    case 'season':
      return w.y && w.s ? `${w.y}년 ${SEASON_LABEL[w.s]}` : w.s ? `${SEASON_LABEL[w.s]}` : '날짜 모름';
    case 'year':
      return w.y ? `${w.y}년쯤` : '날짜 모름';
    default:
      return '날짜 모름';
  }
}

/** 박·일 계산 (날짜를 정확히 알 때만) */
export function nightsDays(w: When): string | null {
  if (w.p !== 'day' || !w.y || !w.m || !w.d || !w.d2) return null;
  const a = new Date(w.y, w.m - 1, w.d);
  const b = new Date(w.y2 ?? w.y, (w.m2 ?? w.m) - 1, w.d2);
  const n = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (n <= 0) return '당일';
  if (n > 60) return null;
  return `${n}박 ${n + 1}일`;
}

export function toInputDate(y?: number, m?: number, d?: number): string {
  return y && m && d ? `${y}-${pad(m)}-${pad(d)}` : '';
}

export function fromInputDate(v: string): { y?: number; m?: number; d?: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return { y: undefined, m: undefined, d: undefined };
  return { y: +m[1], m: +m[2], d: +m[3] };
}

/** 대략 적은 기간의 마지막 날: '2026년' → 12.31, '10월쯤' → 10.31, '가을' → 11.30, '겨울' → 이듬해 2월 말 */
function periodEndKey(w: When): number {
  const y = w.y2 ?? w.y!;
  if (w.p === 'day' && w.m && w.d) return y * 10000 + (w.m2 ?? w.m) * 100 + (w.d2 ?? w.d);
  const lastDay = (yy: number, mm: number) => new Date(yy, mm, 0).getDate();
  if (w.p === 'month' && w.m) { const m = w.m2 ?? w.m; return y * 10000 + m * 100 + lastDay(y, m); }
  if (w.p === 'season' && w.s) {
    const end: Record<Season, [number, number]> = { spring: [0, 5], summer: [0, 8], autumn: [0, 11], winter: [1, 2] };
    const [plus, m] = end[w.s];
    return (y + plus) * 10000 + m * 100 + lastDay(y + plus, m);
  }
  return y * 10000 + 1231;
}

/** 예정 여행이 아직 안 지났는지: 대략 적었으면 그 기간이 끝날 때까지 '다가오는' 여행으로 본다 */
export function isUpcoming(w: When, now = new Date()): boolean {
  if (!w.y) return true;
  const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return periodEndKey(w) >= today;
}

/** 예정된 여행의 D-day: 'D-12' · 'D-day' · '여행 중 2일째' · null(날짜 모름/지남) */
export function dday(w: When, now = new Date()): string | null {
  if (w.p !== 'day' || !w.y || !w.m || !w.d) return null;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const start = Date.UTC(w.y, w.m - 1, w.d);
  const end = w.d2 ? Date.UTC(w.y2 ?? w.y, (w.m2 ?? w.m) - 1, w.d2) : start;
  const n = Math.round((start - today) / 86400000);
  if (n > 0) return `D-${n}`;
  if (n === 0) return 'D-day';
  if (today <= end) return `여행 중 ${Math.round((today - start) / 86400000) + 1}일째`;
  return null;
}

/** 정확한 날짜가 있는 여행의 날짜들 ['2026-11-01', …] (최대 30일) */
export function tripDays(w: When): string[] {
  if (w.p !== 'day' || !w.y || !w.m || !w.d) return [];
  const start = new Date(Date.UTC(w.y, w.m - 1, w.d));
  const end = w.d2 ? new Date(Date.UTC(w.y2 ?? w.y, (w.m2 ?? w.m) - 1, w.d2)) : start;
  const out: string[] = [];
  for (let t = start.getTime(); t <= end.getTime() && out.length < 30; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}
export const dayLabel = (day: string, days: string[]) => {
  const i = days.indexOf(day);
  const [, m, d] = day.split('-').map(Number);
  const wd = '일월화수목금토'[new Date(day + 'T00:00:00Z').getUTCDay()];
  return `${i >= 0 ? `${i + 1}일째 · ` : ''}${m}.${d} (${wd})`;
};


/** 기기 시간대 기준 오늘 'YYYY-MM-DD' (파일 이름 등) */
export function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
