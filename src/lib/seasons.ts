import { useEffect, useState } from 'react';
import type { Place } from './types';

/** 가기 좋은 달 (scripts/seasons.ts가 공개 기후 자료로 미리 계산해 둔 값) */
export interface SeasonInfo {
  /** 좋은 달 1~12 */
  m: number[];
  /** 짧은 이유: '선선하고 비가 적어요' */
  why: string;
  /** 나라는 많이 가는 도시 기준일 때 그 도시 이름 */
  at?: string;
}
export interface SeasonData {
  updated: string;
  kr: Record<string, SeasonInfo>;
  world: Record<string, SeasonInfo>;
}

let cache: Promise<SeasonData> | null = null;
export function loadSeasons(): Promise<SeasonData> {
  if (!cache) {
    cache = import('../data/seasons.json').then((m) => m.default as unknown as SeasonData);
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

/** 해외 도시는 나라 평균보다 도시 자료(world.json)의 좋은 달이 정확하다. 자료가 실리면 여기 등록된다 */
const CITY: Map<string, SeasonInfo> = new Map();
export function registerCitySeasons(list: { c: string; city: string; best: number[]; why: string }[]) {
  for (const w of list) CITY.set(`${w.c}:${w.city}`, { m: w.best, why: w.why, at: w.city });
}

export function useSeasons(): SeasonData | null {
  const [d, setD] = useState<SeasonData | null>(null);
  useEffect(() => {
    let alive = true;
    // 도시 자료도 함께 실어 두면 seasonFor가 도시 단위로 답한다 (실패해도 나라 자료로 간다)
    Promise.all([loadSeasons(), import('./world').then((m) => m.loadWorld()).then((w) => registerCitySeasons(w.cities), () => null)]).then(([x]) => alive && setD(x));
    return () => {
      alive = false;
    };
  }, []);
  return d;
}

export function seasonFor(data: SeasonData | null, p: Place, override?: number[]): SeasonInfo | null {
  if (override?.length) return { m: [...override].sort((a, b) => a - b), why: '직접 고른 달' };
  if (!data) return null;
  if (p.t === 'kr') return data.kr[p.code] ?? null;
  return (p.city ? CITY.get(`${p.id}:${p.city}`) : null) ?? data.world[p.id] ?? null;
}

/** [3,4,5,9,10] → '3~5, 9·10월', [11,12,1,2] → '11~2월' (12월→1월은 이어진 것으로), 열두 달 → '언제든' */
export function monthsLabel(m: number[]): string {
  if (!m.length) return '';
  const s = [...new Set(m)].sort((a, b) => a - b);
  if (s.length >= 12) return '언제든';
  const runs: number[][] = [];
  for (const x of s) {
    const last = runs.at(-1);
    if (last && x === last[last.length - 1] + 1) last.push(x);
    else runs.push([x]);
  }
  // 12월로 끝나는 묶음과 1월로 시작하는 묶음은 겨울 하나로 잇는다
  if (runs.length > 1 && runs[0][0] === 1 && runs.at(-1)!.at(-1) === 12) runs.unshift([...runs.pop()!, ...runs.shift()!]);
  return runs.map((r) => (r.length >= 3 ? `${r[0]}~${r[r.length - 1]}` : r.join('·'))).join(', ') + '월';
}

export const isGoodNow = (info: SeasonInfo | null, month = new Date().getMonth() + 1) => !!info?.m.includes(month);
