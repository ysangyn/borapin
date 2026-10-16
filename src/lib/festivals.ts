import { useEffect, useState } from 'react';

/**
 * 지역 축제 (한국관광공사 TourAPI → CI가 매주 public/data/festivals.json으로 만든다)
 * 칸 코드마다 축제 이름과 기간(YYYYMMDD)만 담는다.
 */
export interface Festival { t: string; s: string; e: string; id: string }
export interface FestivalData { updated: string | null; source?: string; cells: Record<string, Festival[]> }

const EMPTY: FestivalData = { updated: null, cells: {} };
let cache: Promise<FestivalData> | null = null;

export function loadFestivals(): Promise<FestivalData> {
  cache ??= fetch('/data/festivals.json')
    .then((r) => (r.ok ? (r.json() as Promise<FestivalData>) : EMPTY))
    .then((d) => (d && typeof d === 'object' && d.cells ? d : EMPTY))
    .catch(() => {
      cache = null; // 다음에 다시 시도
      return EMPTY;
    });
  return cache;
}

export function useFestivals(): FestivalData | null {
  const [d, setD] = useState<FestivalData | null>(null);
  useEffect(() => {
    let alive = true;
    loadFestivals().then((x) => alive && setD(x));
    return () => {
      alive = false;
    };
  }, []);
  return d;
}

const toDate = (s: string) => new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
const md = (s: string) => `${Number(s.slice(4, 6))}.${Number(s.slice(6, 8))}`;

/** '10.23~26', '12.31~1.1', 하루짜리는 '10.9' */
export function festivalPeriod(f: Festival): string {
  if (f.e === f.s || !f.e) return md(f.s);
  if (f.s.slice(0, 6) === f.e.slice(0, 6)) return `${md(f.s)}~${Number(f.e.slice(6, 8))}`;
  return `${md(f.s)}~${md(f.e)}`;
}

/** 아직 안 끝났고(진행 중 포함) days일 안에 시작하는 축제, 가까운 순서 */
export function upcomingFestivals(data: FestivalData | null, code: string, today = new Date(), days = 90): Festival[] {
  const list = data?.cells[code];
  if (!list?.length) return [];
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const until = new Date(start.getTime() + days * 86400_000);
  return list
    .filter((f) => toDate(f.e || f.s) >= start && toDate(f.s) <= until)
    .sort((a, b) => a.s.localeCompare(b.s));
}

export const isOngoing = (f: Festival, today = new Date()) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return toDate(f.s) <= d && d <= toDate(f.e || f.s);
};

/** 그 지역에 축제가 열리는 달 (지난 1년 자료로. 축제는 해마다 비슷한 때 열린다) */
export function festivalMonths(data: FestivalData | null, code: string): number[] {
  const set = new Set<number>();
  for (const f of data?.cells[code] ?? []) {
    set.add(Number(f.s.slice(4, 6)));
    set.add(Number((f.e || f.s).slice(4, 6)));
  }
  return [...set].sort((a, b) => a - b);
}
