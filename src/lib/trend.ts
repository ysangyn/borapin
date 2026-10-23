import { useEffect, useState } from 'react';
import { REGION_BY_CODE } from './geo';
import { straightKm } from './placeApps';

/**
 * 요즘 자료 (src/data/trend.json, scripts/tour-trend.ts가 만든다): 시·군마다 외지인 방문 흐름(늘어난 비율·순위),
 * 같이 많이 가는 관광지(related), 관광지 붐빔(crowd). 뜨는 곳(hot)·한적한 곳(quiet) 목록도 함께.
 * 자리표시(regions가 빈 것)일 수 있으니 쓰는 쪽은 늘 '없으면 안 보임'으로 다룬다.
 * 무장애(휠체어·유모차) 관광지 수는 src/data/tour.json에 지역마다 있어, 그 자료도 여기서 같이 받는다.
 */
export interface TrendSpot { n: string; m: string }
export interface TrendCrowd { n: string; r: number }
export interface TrendRegion {
  /** 외지인 하루 평균 */
  out: number;
  /** 작년 같은 때 (없으면 null) */
  outPrev: number | null;
  /** 늘어난 비율 (0.35 = 35% 늘어남, 없으면 null) */
  growth: number | null;
  /** 외지인 많은 순 1..160 */
  rank: number;
  /** 같이 많이 가는 관광지 */
  related: TrendSpot[];
  /** 관광지 붐빔 비율 */
  crowd: TrendCrowd[];
}
export interface TrendData {
  at: string;
  window: { from: string; to: string };
  regions: Record<string, TrendRegion>;
  hot: string[];
  quiet: string[];
}

/** 관광공사 관광지(이름·자리·사진)와 무장애 관광지 수 */
export interface TourCell { s: [string, number, number, string][]; easy: number }
export interface TourData { updated: string; cells: Record<string, TourCell> }

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** 받은 JSON을 믿을 수 있는 모양으로 (빠진 칸은 빈 값으로). 모양이 아예 다르면 null */
export function normalizeTrend(raw: unknown): TrendData | null {
  if (!isObj(raw)) return null;
  const regions: Record<string, TrendRegion> = {};
  if (isObj(raw.regions)) {
    for (const [code, r] of Object.entries(raw.regions)) {
      if (!isObj(r)) continue;
      regions[code] = {
        out: typeof r.out === 'number' ? r.out : 0,
        outPrev: typeof r.outPrev === 'number' ? r.outPrev : null,
        growth: typeof r.growth === 'number' && Number.isFinite(r.growth) ? r.growth : null,
        rank: typeof r.rank === 'number' ? r.rank : 0,
        related: Array.isArray(r.related) ? r.related.filter((x): x is TrendSpot => isObj(x) && typeof x.n === 'string').map((x) => ({ n: x.n, m: typeof x.m === 'string' ? x.m : '' })) : [],
        crowd: Array.isArray(r.crowd) ? r.crowd.filter((x): x is TrendCrowd => isObj(x) && typeof x.n === 'string' && typeof x.r === 'number') : [],
      };
    }
  }
  const win = isObj(raw.window) ? raw.window : {};
  return {
    at: typeof raw.at === 'string' ? raw.at : '',
    window: { from: typeof win.from === 'string' ? win.from : '', to: typeof win.to === 'string' ? win.to : '' },
    regions,
    hot: strs(raw.hot),
    quiet: strs(raw.quiet),
  };
}

/** 자료가 실제로 들어 있는지 (자리표시가 아닌지) */
export const hasTrend = (t: TrendData | null | undefined): t is TrendData => !!t && (Object.keys(t.regions).length > 0 || t.hot.length > 0 || t.quiet.length > 0);

// ---------- 받기 (한 번만, 캐시) ----------
let TREND: TrendData | null = null;
let trendP: Promise<TrendData | null> | null = null;
export function loadTrend(): Promise<TrendData | null> {
  trendP ??= import('../data/trend.json').then(
    (m) => { TREND = normalizeTrend((m as { default?: unknown }).default ?? m); return TREND; },
    () => { trendP = null; return null; },
  );
  return trendP;
}
/** 지금 받아 둔 요즘 자료 (받기 전엔 null). 규칙형 엔진처럼 동기로 쓰는 곳용 */
export const trendNow = (): TrendData | null => TREND;

let TOUR: TourData | null = null;
let tourP: Promise<TourData | null> | null = null;
export function loadTour(): Promise<TourData | null> {
  tourP ??= import('../data/tour.json').then(
    (m) => { const d = (m as { default?: unknown }).default ?? m; TOUR = isObj(d) && isObj(d.cells) ? (d as unknown as TourData) : null; return TOUR; },
    () => { tourP = null; return null; },
  );
  return tourP;
}
export const tourNow = (): TourData | null => TOUR;

/** 시험용: 받지 않고 바로 넣는다 */
export function setTrend(t: TrendData | null) { TREND = t; }
export function setTour(t: TourData | null) { TOUR = t; }

/** 요즘 자료 훅: 받기 전·없으면 null (화면은 그 부분을 안 그린다) */
export function useTrend(): TrendData | null {
  const [d, setD] = useState<TrendData | null>(TREND);
  useEffect(() => {
    let on = true;
    void loadTrend().then((x) => { if (on && x) setD(x); });
    return () => { on = false; };
  }, []);
  return d;
}

// ---------- 순수 함수 ----------
export type TrendKind = 'hot' | 'quiet';
export interface TrendTag { t: string; k: TrendKind; why?: string }
export const TREND_TAG_LABEL: Record<TrendKind, string> = { hot: '요즘 뜨는 곳', quiet: '한적해요' };

const pct = (g: number) => Math.round(Math.abs(g) * 100);
/** '외지인 35% 늘었어요' (늘어난 비율이 없으면 null) */
export function growthText(r: TrendRegion | null | undefined): string | null {
  if (!r || r.growth == null) return null;
  const n = pct(r.growth);
  if (n === 0) return '외지인이 작년과 비슷해요';
  return r.growth > 0 ? `외지인 ${n}% 늘었어요` : `외지인 ${n}% 줄었어요`;
}

/** 지역 꼬리표: 뜨는 곳(왜: 외지인 늘어난 비율)·한적해요. 자료가 없으면 빈 목록 */
export function trendTags(code: string, trend: TrendData | null | undefined): TrendTag[] {
  if (!hasTrend(trend)) return [];
  const out: TrendTag[] = [];
  if (trend.hot.includes(code)) {
    const why = growthText(trend.regions[code]);
    out.push(why ? { t: TREND_TAG_LABEL.hot, k: 'hot', why } : { t: TREND_TAG_LABEL.hot, k: 'hot' });
  }
  if (trend.quiet.includes(code)) out.push({ t: TREND_TAG_LABEL.quiet, k: 'quiet' });
  return out;
}

/** 꼬리표를 한 토막으로: '요즘 뜨는 곳(외지인 35%↑)' · '한적해요' (AI 사실·후보 줄에 붙일 때). 없으면 '' */
export function tagShort(code: string, trend: TrendData | null | undefined): string {
  return trendTags(code, trend).map((t) => (t.why ? `${t.t}(${t.why.replace(/^외지인 (\d+)% 늘었어요$/, '외지인 $1%↑').replace(/^외지인 (\d+)% 줄었어요$/, '외지인 $1%↓')})` : t.t)).join(' · ');
}

export type CrowdLevel = '한적' | '보통' | '붐벼요';
/** 붐빔 비율 → 말: 20 미만 한적, 50 미만 보통, 그 밖은 붐벼요 */
export const crowdLevel = (rate: number): CrowdLevel => (rate < 20 ? '한적' : rate < 50 ? '보통' : '붐벼요');

const norm = (s: string) => s.replace(/\s+/g, '');
/** 관광지 이름의 붐빔 (crowd 목록에 없으면 null) */
export function crowdOf(code: string, trend: TrendData | null | undefined, name: string): CrowdLevel | null {
  const hit = trend?.regions[code]?.crowd.find((c) => norm(c.n) === norm(name));
  return hit ? crowdLevel(hit.r) : null;
}

/** 같이 가면 좋은 곳 (이름 중복 없이, 최대 8) */
export function relatedOf(code: string, trend: TrendData | null | undefined): TrendSpot[] {
  const list = trend?.regions[code]?.related ?? [];
  const seen = new Set<string>();
  return list.filter((x) => x.n && !seen.has(norm(x.n)) && seen.add(norm(x.n))).slice(0, 8);
}

/** '10월 20일 기준' (날짜가 없으면 '') */
export function trendAt(trend: TrendData | null | undefined): string {
  const m = trend?.at.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${Number(m[2])}월 ${Number(m[3])}일 기준` : '';
}

/** 카카오맵 검색 링크 (TourSpots의 map.kakao.com/link 방식) */
export const kakaoSearchUrl = (q: string) => `https://map.kakao.com/link/search/${encodeURIComponent(q.trim())}`;

/** 무장애(휠체어·유모차) 관광지 수 */
export const easyCount = (code: string, tour: TourData | null | undefined): number => tour?.cells[code]?.easy ?? 0;
export const easyText = (n: number) => (n > 0 ? `휠체어·유모차로 다니기 편한 관광지 ${n}곳` : '');

/** 한 지역의 요즘 사실을 짧은 글로 (물어보기 답·AI 사실용). 없는 칸은 빈 글 */
export function trendSummary(code: string, trend: TrendData | null | undefined, tour: TourData | null | undefined): { tag: string; crowd: string; related: string; easy: string } {
  const tags = trendTags(code, trend).map((t) => (t.why ? `${t.t}(${t.why})` : t.t));
  const at = trendAt(trend);
  const crowd = (trend?.regions[code]?.crowd ?? []).slice(0, 4).map((c) => `${c.n} ${crowdLevel(c.r)}`);
  return {
    tag: tags.length ? `${tags.join(' · ')}${at ? ` · ${at}` : ''}` : '',
    crowd: crowd.join(', '),
    related: relatedOf(code, trend).slice(0, 5).map((x) => x.n).join(', '),
    easy: easyText(easyCount(code, tour)),
  };
}

// ---------- 물어보기용 고르기 ----------
export type TrendTopicKind = 'hot' | 'quiet' | 'easy';
export interface TrendPick { code: string; why: string }
export interface RankOpts {
  trend?: TrendData | null;
  tour?: TourData | null;
  /** 우리가 다녀온 시·군 코드 (아직 안 가본 곳을 먼저) */
  visited: Set<string>;
  /** 우리 집 (있으면 가까운 곳 가산, 집 자체는 뺀다) */
  home?: { lat: number; lng: number; code: string } | null;
  /** 테마·광역 조건에 맞는 코드만 (없으면 모두) */
  allow?: Set<string> | null;
  /** '안 가본 곳'을 콕 집어 물었으면 가 본 곳은 아예 뺀다 */
  unvisitedOnly?: boolean;
  /** 집에서 몇 km마다 한 자리씩 뒤로 미는지 (기본 60, '근처'를 콕 집어 물으면 15로 거리를 크게 본다) */
  kmPerStep?: number;
}

/**
 * 뜨는 곳은 trend.hot 순서, 한적한 곳은 trend.quiet 순서, 안 걷는 곳은 무장애 관광지 수 많은 순.
 * 모두 안 가본 곳을 먼저, 집이 있으면 가까운 곳에 가산(60km마다 한 자리). 자료가 없으면 null
 */
export function rankTrend(kind: TrendTopicKind, o: RankOpts): TrendPick[] | null {
  let base: { code: string; why: string }[];
  if (kind === 'easy') {
    if (!o.tour) return null;
    base = Object.entries(o.tour.cells).filter(([, c]) => c.easy > 0).sort((a, b) => b[1].easy - a[1].easy)
      .map(([code, c]) => ({ code, why: `휠체어·유모차로 다니기 편한 관광지 ${c.easy}곳` }));
  } else {
    if (!hasTrend(o.trend)) return null;
    const t = o.trend;
    const list = kind === 'hot' ? t.hot : t.quiet;
    if (!list.length) return null;
    base = list.map((code) => ({ code, why: kind === 'hot' ? (growthText(t.regions[code]) ?? '외지인이 부쩍 늘었어요') : '사람이 적어 조용해요' }));
  }
  const scored = base
    .filter((x) => REGION_BY_CODE.has(x.code) && (!o.allow || o.allow.has(x.code)) && x.code !== o.home?.code && !(o.unvisitedOnly && o.visited.has(x.code)))
    .map((x, i) => {
      const r = REGION_BY_CODE.get(x.code)!;
      const near = o.home ? straightKm(o.home, r) / (o.kmPerStep ?? 60) : 0;
      return { ...x, score: i + (o.visited.has(x.code) ? 1000 : 0) + near };
    })
    .sort((a, b) => a.score - b.score);
  return scored.map(({ code, why }) => ({ code, why }));
}
