import { placeParam } from './geo';
import { samePlace } from './wishes';
import { KIND_LABEL } from './placeRecs';
import type { Place, PlaceKind, PlaceRec } from './types';

/**
 * 내 지도: 우리 장소를 '지역 × 주제(종류)'로 묶은 것. 묶음 하나가 지도 한 장이다 ('성동구 카페 지도').
 * 순위는 별점 없이 비교로 만든다: 새로 담은 곳을 이미 있는 곳과 최대 3번 견줘 자리에 끼운다 (Beli 방식, 건너뛰어도 됨).
 * 순수 함수 (시험: tests/unit/placeMaps.test.ts). 저장 모양은 PlaceMap(types.ts), 공개 사본은 MapShare.
 */
/**
 * 주제: 종류('food'·'cafe'…) 또는 내가 만든 꼬리표('t:옷가게'), 그리고 한눈에('all').
 * 기본은 맛집·카페. 숙소 지도를 만들 사람은 드무니 종류는 뒤로, 내 꼬리표가 앞으로.
 */
export type Theme = string;
export const ALL = 'all';
export const themeOf = (r: Pick<PlaceRec, 'kind' | 'tag'>): Theme => (r.tag?.trim() ? `t:${r.tag.trim()}` : r.kind);
export const themeLabel = (t: Theme): string => (t === ALL ? '한눈에' : t.startsWith('t:') ? t.slice(2) : (KIND_LABEL as Record<string, string>)[t] ?? t);
const KIND_RANK: Record<string, number> = { food: 0, cafe: 1, shop: 10, sight: 11, etc: 12, stay: 13 };
/** 맛집 → 카페 → 내 꼬리표(이름순) → 나머지 종류 */
export const themesOrder = (themes: Theme[]): Theme[] => [...new Set(themes)].sort((a, b) => (a.startsWith('t:') ? 5 : KIND_RANK[a] ?? 9) - (b.startsWith('t:') ? 5 : KIND_RANK[b] ?? 9) || a.localeCompare(b, 'ko'));
/** 핀·꼬리표 색: 종류마다 (꼬리표는 그 종류 색) */
export const KIND_COLOR: Record<PlaceKind, string> = { food: '#F07A95', cafe: '#5B3FD1', shop: '#2E9467', sight: '#4D7FE0', stay: '#C9A227', etc: '#8A80A8' };
/** 종류별로 자주 쓰는 꼬리표 (담을 때 고르기 쉽게 · 직접 써도 됨) */
export const TAG_SUGGEST: Record<PlaceKind, string[]> = { food: ['빵집', '술집', '브런치', '디저트'], cafe: ['로스터리', '디저트', '북카페'], shop: ['소품샵', '옷가게', '서점', '시장', '편집샵'], sight: ['공원', '전시', '산책길'], stay: [], etc: ['놀거리', '목욕탕'] };

export interface MyMap { region: Place; theme: Theme; recs: PlaceRec[] }

/** 지도 문서 이름: 'kr:11|cafe' · 'kr:11|t:옷가게' · 'kr:11|all' */
export const mapKey = (region: Place, theme: Theme) => `${placeParam(region)}|${theme}`;

/** 우리 장소 → 지도 묶음 (지역×주제, 곳이 많은 순). 한눈에(all)는 여기 없고 화면이 지역으로 모은다 */
export function mapsOf(recs: PlaceRec[]): MyMap[] {
  const out: MyMap[] = [];
  for (const r of recs) {
    const t = themeOf(r);
    const m = out.find((x) => x.theme === t && samePlace(x.region, r.region));
    if (m) m.recs.push(r); else out.push({ region: r.region, theme: t, recs: [r] });
  }
  return out.sort((a, b) => b.recs.length - a.recs.length);
}

// ---------- 순위 끼워 넣기 (가운데와 견주기, 최대 3번) ----------
export interface InsertState { order: string[]; id: string; lo: number; hi: number; asked: number }
const MAX_Q = 3;
/** 시작: 아직 없는 곳(id)을 order(1등부터) 어디에 넣을지 */
export const startInsert = (order: string[], id: string): InsertState => ({ order: order.filter((x) => x !== id), id, lo: 0, hi: order.filter((x) => x !== id).length, asked: 0 });
/** 다음에 견줄 곳(id). 더 물을 게 없으면 null */
export const nextQuestion = (s: InsertState): string | null => (s.asked >= MAX_Q || s.hi - s.lo <= 0 ? null : s.order[Math.floor((s.lo + s.hi) / 2)] ?? null);
/** 답: 'better' = 새 곳이 견준 곳보다 좋다(앞으로), 'worse' = 못하다(뒤로) */
export function applyAnswer(s: InsertState, a: 'better' | 'worse'): InsertState {
  const mid = Math.floor((s.lo + s.hi) / 2);
  return a === 'better' ? { ...s, hi: mid, asked: s.asked + 1 } : { ...s, lo: mid + 1, asked: s.asked + 1 };
}
/** 지금까지의 답으로 끼운 순서 (한 번도 안 물었으면 맨 뒤) */
export function insertAt(s: InsertState): string[] {
  const at = s.asked === 0 ? s.order.length : s.lo;
  return [...s.order.slice(0, at), s.id, ...s.order.slice(at)];
}

/** 순위 순으로 늘어놓기: 순서에 있는 것 먼저(지운 곳은 건너뜀), 아직 안 견준 것은 최근 것부터 뒤에 */
export function rankedRecs(recs: PlaceRec[], order: string[] | undefined): PlaceRec[] {
  const by = new Map(recs.map((r) => [r.id, r]));
  const ranked = (order ?? []).map((id) => by.get(id)).filter((r): r is PlaceRec => !!r);
  const rest = recs.filter((r) => !(order ?? []).includes(r.id)).sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return [...ranked, ...rest];
}

// ---------- 지금 근처 ----------
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88);
/** 여기서 radiusKm 안에 담아 둔 곳, 가까운 순 (m: 미터) */
export function nearby(recs: PlaceRec[], here: { lat: number; lng: number }, radiusKm = 2): { rec: PlaceRec; m: number }[] {
  return recs
    .filter((r) => r.lat != null && r.lng != null)
    .map((rec) => ({ rec, m: Math.round(km(here, { lat: rec.lat!, lng: rec.lng! }) * 1000) }))
    .filter((x) => x.m <= radiusKm * 1000)
    .sort((a, b) => a.m - b.m);
}
/** '240m' · '1.3km' */
export const meters = (m: number) => (m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`);
