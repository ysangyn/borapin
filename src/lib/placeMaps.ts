import { placeParam } from './geo';
import { samePlace } from './wishes';
import type { Place, PlaceKind, PlaceRec } from './types';

/**
 * 내 지도: 우리 장소를 '지역 × 주제(종류)'로 묶은 것. 묶음 하나가 지도 한 장이다 ('성동구 카페 지도').
 * 순위는 별점 없이 비교로 만든다: 새로 담은 곳을 이미 있는 곳과 최대 3번 견줘 자리에 끼운다 (Beli 방식, 건너뛰어도 됨).
 * 순수 함수 (시험: tests/unit/placeMaps.test.ts). 저장 모양은 PlaceMap(types.ts), 공개 사본은 MapShare.
 */
export type Theme = PlaceKind;
export interface MyMap { region: Place; theme: Theme; recs: PlaceRec[] }

/** 지도 문서 이름: 'kr:11|cafe' */
export const mapKey = (region: Place, theme: Theme) => `${placeParam(region)}|${theme}`;

/** 우리 장소 → 지도 묶음 (곳이 많은 순, 같으면 먼저 담은 순) */
export function mapsOf(recs: PlaceRec[]): MyMap[] {
  const out: MyMap[] = [];
  for (const r of recs) {
    const m = out.find((x) => x.theme === r.kind && samePlace(x.region, r.region));
    if (m) m.recs.push(r); else out.push({ region: r.region, theme: r.kind, recs: [r] });
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
