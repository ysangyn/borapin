import type { PlaceKind, PlaceRec, Wish } from './types';
import { leftItems, recNames, sameName } from './wishes';
import { samePlace } from './wishes';
import type { Place } from './types';

/**
 * 여행 기록의 '들른 맛집·명소': 그 지역에 담아 둔 가고 싶어요 가게와 가고 싶은 곳에 적어 둔 글 줄을 체크로 불러오고, 새로 적은 곳도 함께 저장한다.
 * 시험: tests/unit/recordStops.test.ts
 */
export type Stop =
  | { k: 'want'; id: string; name: string; kind: PlaceKind }
  | { k: 'line'; name: string; kind: PlaceKind }
  | { k: 'new'; name: string; kind: PlaceKind };

const CAFE = /카페|커피|cafe|coffee|베이커리|빵집|로스터|디저트/i;
const FOOD = /식당|맛집|국밥|순두부|횟집|고기|구이|면|국수|분식|치킨|피자|족발|곱창|술집|포차|브루어리/i;
/** 이름(과 가고 싶은 곳의 칸)으로 종류 짐작 */
export function guessKind(name: string, wish: Wish | null): PlaceKind {
  if (wish?.foods.some((f) => sameName(f, name))) return CAFE.test(name) ? 'cafe' : 'food';
  if (wish?.spots.some((s) => sameName(s, name))) return 'sight';
  if (CAFE.test(name)) return 'cafe';
  if (FOOD.test(name)) return 'food';
  return 'sight';
}

/** 체크 후보: 그 지역들의 가고 싶어요 가게 + 가고 싶은 곳 글 줄(이미 가게로 있는 이름은 뺌) */
export function candidates(places: Place[], recs: PlaceRec[], wishes: Wish[]): Stop[] {
  const out: Stop[] = [];
  for (const p of places) {
    for (const r of recs.filter((x) => x.status === 'want' && samePlace(x.region, p))) out.push({ k: 'want', id: r.id, name: r.name, kind: r.kind });
    const w = wishes.find((x) => samePlace(x.place, p) && !x.tripId) ?? null;
    if (w) for (const n of leftItems(w, recNames(recs, p))) if (!out.some((o) => sameName(o.name, n))) out.push({ k: 'line', name: n, kind: guessKind(n, w) });
  }
  return out;
}
