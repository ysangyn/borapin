import type { Place, Trip, Wish } from './types';
import { localDate } from './dates';
import { everyoneWants } from './members';


const ms = (t: { toMillis?: () => number } | null | undefined) => (t?.toMillis ? t.toMillis() : Date.now());

/** 같은 곳인지: 국내는 시·군, 해외는 나라(+둘 다 도시가 있으면 도시까지) */
export const samePlace = (a: Place, b: Place) =>
  a.t === 'kr' ? b.t === 'kr' && a.code === b.code : b.t === 'country' && a.id === b.id && (!a.city || !b.city || a.city === b.city);

export type WishState = { kind: 'wish' } | { kind: 'planned'; trip: Trip } | { kind: 'done'; trip: Trip } | { kind: 'again'; trip: Trip; left: string[] };

/** 이름 맞추기: 띄어쓰기·괄호를 빼고, 한쪽이 다른 쪽을 품으면 같은 곳 ('동피랑 벽화마을' ≈ '동피랑') */
const norm = (s: string) => s.replace(/\(.*?\)|\s|·/g, '').toLowerCase();
export const sameName = (a: string, b: string) => { const x = norm(a), y = norm(b); return !!x && !!y && (x === y || (Math.min(x.length, y.length) >= 2 && (x.includes(y) || y.includes(x)))); };

/** 가고 싶은 곳의 볼거리·먹거리 중 아직 안 간 것 (다녀온 표시 gone + 그 지역에 남긴 장소 기록 이름으로 지움) */
export function leftItems(w: Wish, visitedNames: string[] = []): string[] {
  const gone = [...(w.gone ?? []), ...visitedNames];
  return [...w.spots, ...w.foods].filter((n) => n.trim() && !gone.some((g) => sameName(g, n)));
}

/** 편집 화면 칩: 다녀옴 표시(gone)·장소 기록으로 가 본 곳(rec)·아직(null) */
export function itemMarks(w: Wish, visitedNames: string[] = []): { name: string; mark: 'gone' | 'rec' | null }[] {
  return [...w.spots, ...w.foods].filter((n) => n.trim()).map((name) => ({
    name,
    mark: (w.gone ?? []).some((g) => sameName(g, name)) ? 'gone' : visitedNames.some((g) => sameName(g, name)) ? 'rec' : null,
  }));
}

/**
 * 가고 싶은 곳의 지금 상태.
 * - '여행 만들기'로 생긴 여행이 있으면 그 여행 상태를 따른다.
 * - 아니어도, 담은 뒤에 그곳에 다녀온 기록이 생기면 '다녀왔어요'로 옮겨간다.
 * - 다만 담아 둔 볼거리·먹거리 중 못 간 곳이 남았으면 '다시 가고 싶어요'(again)로 남는다.
 */
export function wishState(w: Wish, trips: Trip[], visitedNames: string[] = []): WishState {
  // 다녀왔어도 담아 둔 볼거리·먹거리가 남았으면 '다시 가고 싶어요' (다 가 봤을 때만 '다녀왔어요')
  const done = (t: Trip): WishState => { const left = leftItems(w, visitedNames); return left.length ? { kind: 'again', trip: t, left } : { kind: 'done', trip: t }; };
  if (w.tripId) {
    const t = trips.find((x) => x.id === w.tripId);
    if (t) return t.status === 'done' ? done(t) : { kind: 'planned', trip: t };
  }
  const since = ms(w.createdAt);
  const after = trips.filter((t) => ms(t.createdAt) >= since && t.places.some((p) => samePlace(p, w.place)));
  const went = after.find((t) => t.status === 'done');
  if (went) return done(went);
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

export type WishItemKind = 'spot' | 'food';
export type WishItemPlan = { action: 'already' | 'append'; id: string } | { action: 'create' };
export const fieldOfWishItem = (k: WishItemKind) => (k === 'food' ? 'foods' : 'spots') as 'foods' | 'spots';

/** 볼거리·먹거리 하나를 담을 때 할 일: 그 지역 가고 싶은 곳이 있으면 메모 칸에 보태고, 없으면 새로 만든다 */
export function planWishItem(existing: Wish[], place: Place, name: string, kind: WishItemKind): WishItemPlan {
  const w = existing.find((x) => samePlace(x.place, place) && !x.tripId);
  if (!w) return { action: 'create' };
  const list = w[fieldOfWishItem(kind)] ?? [];
  return { action: list.includes(name) ? 'already' : 'append', id: w.id };
}

/**
 * 받은 지도를 한꺼번에 담을 때 할 일: 맛집·카페는 먹거리, 나머지는 볼거리 칸으로.
 * 그 지역 가고 싶은 곳(여행에 안 묶인 것)이 있으면 거기 이어(id), 없으면 새로(id: null). 이미 있는 이름은 건너뛴다
 */
export function wishBatch(existing: Wish[], place: Place, items: { name: string; kind: string }[], limit = 50): { id: string | null; foods: string[]; spots: string[]; skipped: number; over?: number } {
  const w = existing.find((x) => samePlace(x.place, place) && !x.tripId) ?? null;
  const have = [...(w?.foods ?? []), ...(w?.spots ?? [])];
  const foods: string[] = [], spots: string[] = [];
  let skipped = 0;
  for (const it of items) {
    const name = it.name.trim();
    if (!name) continue;
    if ([...have, ...foods, ...spots].some((h) => sameName(h, name))) { skipped++; continue; }
    (it.kind === 'food' || it.kind === 'cafe' ? foods : spots).push(name);
  }
  // 칸마다 50개까지 (규칙 한도): 넘치는 것은 담지 않고 수만 알려 준다
  const roomF = Math.max(0, limit - (w?.foods?.length ?? 0)), roomS = Math.max(0, limit - (w?.spots?.length ?? 0));
  const over = Math.max(0, foods.length - roomF) + Math.max(0, spots.length - roomS);
  const out = { id: w?.id ?? null, foods: foods.slice(0, roomF), spots: spots.slice(0, roomS), skipped };
  return over ? { ...out, over } : out;
}

/** 이미 담겨 있는지 (창의 하트 모양) */
export const hasWishItem = (existing: Wish[], place: Place, name: string, kind: WishItemKind) => planWishItem(existing, place, name, kind).action === 'already';

/** 예정 여행 중 이곳이 들어간 것 (있으면 '담기'가 그 여행 일정으로 간다) */
export const plannedTripFor = (trips: Trip[] | null | undefined, place: Place) =>
  trips?.find((t) => t.status === 'planned' && t.places.some((p) => samePlace(p, place))) ?? null;

/** 그 지역에 남긴 장소 기록 이름들 (다녀온 곳 지우기에 씀) */
export const recNames = (recs: { name: string; region: Place }[] | null | undefined, place: Place) => (recs ?? []).filter((r) => samePlace(r.region, place)).map((r) => r.name);

/** 다녀온 여행의 일정 중 못 간 것(체크 안 한 것) → 가고 싶은 곳에 아직 없는 것만 */
export function leftoverPlans(items: { name: string; done: boolean; kind?: string }[], existing: Wish | null): { name: string; food: boolean }[] {
  const have = existing ? [...existing.spots, ...existing.foods] : [];
  return items.filter((p) => !p.done && p.name.trim() && p.kind !== 'stay' && !/들르기$|하룻밤$|→/.test(p.name) && !have.some((h) => sameName(h, p.name))).map((p) => ({ name: p.name.trim(), food: p.kind === 'eat' }));
}
