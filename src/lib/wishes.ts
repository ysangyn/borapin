import type { Place, Trip, Wish } from './types';
import { localDate } from './dates';
import { everyoneWants } from './members';


const ms = (t: { toMillis?: () => number } | null | undefined) => (t?.toMillis ? t.toMillis() : Date.now());

/** 같은 곳인지: 국내는 시·군, 해외는 나라(+둘 다 도시가 있으면 도시까지) */
export const samePlace = (a: Place, b: Place) =>
  a.t === 'kr' ? b.t === 'kr' && a.code === b.code : b.t === 'country' && a.id === b.id && (!a.city || !b.city || a.city === b.city);

export type WishState = { kind: 'wish' } | { kind: 'planned'; trip: Trip } | { kind: 'done'; trip: Trip };

/**
 * 가고 싶은 곳의 지금 상태.
 * - '여행 만들기'로 생긴 여행이 있으면 그 여행 상태를 따른다.
 * - 아니어도, 담은 뒤에 그곳에 다녀온 기록이 생기면 '다녀왔어요'로 옮겨간다.
 */
export function wishState(w: Wish, trips: Trip[]): WishState {
  if (w.tripId) {
    const t = trips.find((x) => x.id === w.tripId);
    if (t) return t.status === 'done' ? { kind: 'done', trip: t } : { kind: 'planned', trip: t };
  }
  const since = ms(w.createdAt);
  const after = trips.filter((t) => ms(t.createdAt) >= since && t.places.some((p) => samePlace(p, w.place)));
  const done = after.find((t) => t.status === 'done');
  if (done) return { kind: 'done', trip: done };
  const planned = after.find((t) => t.status === 'planned');
  if (planned) return { kind: 'planned', trip: planned };
  return { kind: 'wish' };
}

export const bothWant = (w: Wish) => everyoneWants(w.wantedBy);

/** 목록 순서: 1·2·3순위 → 둘 다 원해요 → 최근에 담은 것 */
export function sortWishes(list: Wish[]): Wish[] {
  return [...list].sort((a, b) => {
    const pa = a.priority ?? 9, pb = b.priority ?? 9;
    if (pa !== pb) return pa - pb;
    const ba = bothWant(a) ? 0 : 1, bb = bothWant(b) ? 0 : 1;
    if (ba !== bb) return ba - bb;
    return ms(b.createdAt) - ms(a.createdAt);
  });
}

/** 날마다 같은 순서가 나오는 섞기 (홈 롤링·추천이 열 때마다 바뀌지 않게) */
export function dailyShuffle<T>(arr: T[], salt = ''): T[] {
  // 기기 시간대의 날짜로 (한국에서 오전 9시에 바뀌지 않게)
  const day = localDate() + salt;
  let h = 2166136261;
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 홈 롤링 순서: 둘 다 원하는 곳 → 이번 달이 좋은 곳 → 나머지는 그날의 랜덤 */
export function rollingOrder(list: Wish[], goodNow: (w: Wish) => boolean): Wish[] {
  const both = list.filter(bothWant);
  const season = list.filter((w) => !bothWant(w) && goodNow(w));
  const rest = dailyShuffle(list.filter((w) => !bothWant(w) && !goodNow(w)));
  return [...sortWishes(both), ...season, ...rest];
}

export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
