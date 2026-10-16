import { useEffect, useState } from 'react';
import { COUNTRY_BY_ID } from './geo';
import type { Stats } from './stats';
import type { Place, Wish } from './types';
import { dailyShuffle, samePlace } from './wishes';

/**
 * 세계 도시 속성 자료 (src/data/world.json, 손으로 정리해 빌드에 고정 — 바깥 서비스 없음).
 * 테마를 4~8개로 못 박는 대신 속성을 조합한다: 좋은 달(자동) × 예산 × 가는 시간 × 꼬리표 × 누구와.
 */
export interface WorldCity {
  c: string; // 나라 ISO3
  city: string;
  en: string;
  best: number[];
  why: string;
  cost: 1 | 2 | 3;
  fly: number; // 인천에서 대략 시간
  tags: string[];
  walk: 1 | 2 | 3;
  with: string[];
  summer: '시원' | '온화' | '덥다' | '우기';
  winter: '따뜻' | '온화' | '춥다';
  line: string;
  eat: string[];
  see: string[];
  cur: string;
  lang: string;
  plug: string;
  tz: number;
  entry: string;
}
export interface WorldData { updated: string; note: string; cities: WorldCity[] }

let cache: Promise<WorldData> | null = null;
export function loadWorld(): Promise<WorldData> {
  if (!cache) {
    cache = import('../data/world.json').then((m) => m.default as unknown as WorldData);
    cache.catch(() => { cache = null; });
  }
  return cache;
}
export function useWorld(): WorldData | null {
  const [d, setD] = useState<WorldData | null>(null);
  useEffect(() => { let on = true; loadWorld().then((x) => on && setD(x)); return () => { on = false; }; }, []);
  return d;
}

export const cityPlace = (w: WorldCity): Place => ({ t: 'country', id: w.c, city: w.city });
export const cityKey = (w: WorldCity) => `${w.c}:${w.city}`;

/** 장소에 맞는 도시 자료: 도시가 있으면 그 도시, 나라만 있으면 그 나라의 첫 도시(대표) */
export function cityFor(data: WorldData | null, p: Place): WorldCity | null {
  if (!data || p.t !== 'country') return null;
  if (p.city) return data.cities.find((w) => w.c === p.id && w.city === p.city) ?? null;
  return data.cities.find((w) => w.c === p.id) ?? null;
}

export const COST_LABEL: Record<1 | 2 | 3, string> = { 1: '물가 가벼움', 2: '물가 보통', 3: '물가 비쌈' };
export const WALK_LABEL: Record<1 | 2 | 3, string> = { 1: '느긋하게', 2: '적당히 걷기', 3: '많이 걷기' };
export const flyLabel = (h: number) => (h < 1 ? '1시간 안' : h <= 3 ? `${h}시간쯤` : `${Math.round(h)}시간쯤`);
export const tzLabel = (tz: number) => (tz === 0 ? '시차 없음' : `한국보다 ${Math.abs(tz)}시간 ${tz < 0 ? '느려요' : '빨라요'}`);

/** 고르기 조건 — 비워 두면 그 축은 안 본다 */
export interface WorldFilter {
  month?: number | null; // 떠날 달 (좋은 달에 들거나, 여름엔 시원·겨울엔 따뜻한 곳)
  cost?: 1 | 2 | 3 | null; // 이 등급 이하
  fly?: 'near' | 'mid' | 'far' | null; // ≤4h · ≤8h · 상관없음
  tags?: string[]; // 하나라도 맞으면
  with?: string | null; // 둘이·부모님·아이·친구
  walk?: 1 | 2 | 3 | null; // 이 강도 이하
  unvisitedOnly?: boolean;
}

export const TAG_CHOICES = ['미식', '자연', '바다', '해변', '휴양', '도시', '전통', '역사', '예술', '쇼핑', '야경', '온천', '설산', '트레킹', '와인', '커피', '겨울풍경', '오로라', '사막', '섬', '테마파크'];

/** 그 달에 어울리는지: 좋은 달이면 2점, 여름에 시원하거나 겨울에 따뜻하면 1점, 우기면 -2 */
export function monthScore(w: WorldCity, month: number): number {
  let s = w.best.includes(month) ? 2 : 0;
  if ([6, 7, 8].includes(month)) { if (w.summer === '시원') s += 1; if (w.summer === '우기') s -= 2; }
  if ([12, 1, 2].includes(month)) { if (w.winter === '따뜻') s += 1; if (w.winter === '춥다' && !w.tags.some((t) => ['겨울풍경', '오로라', '설산'].includes(t))) s -= 1; }
  return s;
}

/** 조건에 맞는 도시들, 잘 맞는 순서(같은 점수는 날마다 섞음) */
export function pickCities(data: WorldData | null, f: WorldFilter, stats: Stats | null = null, wishes: Wish[] = []): WorldCity[] {
  if (!data) return [];
  const flyMax = f.fly === 'near' ? 4 : f.fly === 'mid' ? 8 : 99;
  const list = data.cities.filter((w) => {
    if (f.cost && w.cost > f.cost) return false;
    if (w.fly > flyMax) return false;
    if (f.walk && w.walk > f.walk) return false;
    if (f.with && !w.with.includes(f.with)) return false;
    if (f.tags?.length && !f.tags.some((t) => w.tags.includes(t))) return false;
    if (f.unvisitedOnly && stats?.cities.has(cityKey(w))) return false;
    if (wishes.some((x) => samePlace(x.place, cityPlace(w)))) return false;
    if (f.month && monthScore(w, f.month) < 0) return false;
    return true;
  });
  const score = (w: WorldCity) => (f.month ? monthScore(w, f.month) : 0) + (f.tags?.length ? f.tags.filter((t) => w.tags.includes(t)).length * 0.5 : 0);
  return dailyShuffle(list, 'world').sort((a, b) => score(b) - score(a));
}

/** 이번 달에 가기 좋은 해외 도시 n곳 (홈·가고 싶은 곳 비었을 때) */
export function monthlyWorldPicks(data: WorldData | null, n: number, month: number, stats: Stats | null, wishes: Wish[]): WorldCity[] {
  return pickCities(data, { month, unvisitedOnly: true }, stats, wishes).slice(0, n);
}

export const countryName = (w: WorldCity) => COUNTRY_BY_ID.get(w.c)?.name ?? w.c;
