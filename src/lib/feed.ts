import type { Note, Photo, PlaceRec, Trip, Wish } from './types';

/**
 * 피드: 우리 둘이 최근에 남긴 것들을 시간순으로 한 줄씩.
 * 사진은 같은 사람이 같은 여행에 같은 날 올린 것끼리 한 묶음으로 (수십 장이 줄줄이 나오지 않게).
 */
export type FeedItem =
  | { kind: 'photos'; at: number; by: string; trip: Trip; photos: Photo[]; captions: string[] }
  | { kind: 'note'; at: number; by: string; trip: Trip; note: Note }
  | { kind: 'place'; at: number; by: string; trip: Trip | null; rec: PlaceRec; review?: string }
  | { kind: 'trip'; at: number; by: string; trip: Trip }
  | { kind: 'wish'; at: number; by: string; wish: Wish }
  /** 오늘의 한 질문에 답함: 모두 답했을 때만(opened) 답 글이 보인다 */
  | { kind: 'ask'; at: number; by: string; day: string; uid: string; question: string; text: string; opened: boolean };

export interface AskFeedSrc { day: string; qid: string; question: string; answers: Record<string, { name: string; text: string; at: number }>; need: number }

const ms = (t: { toMillis?: () => number } | null | undefined) => (t && typeof t.toMillis === 'function' ? t.toMillis() : 0);
const dayKey = (at: number) => new Date(at).toDateString();
const who = (x: { createdBy?: { name?: string; email?: string } } | undefined, fallback = '') =>
  x?.createdBy?.name || (x?.createdBy?.email ? x.createdBy.email.split('@')[0] : fallback);

export function buildFeed(d: { trips: Trip[]; photos: Photo[]; notes: Note[]; recs: PlaceRec[]; wishes: Wish[]; asks?: AskFeedSrc[] }, limit = 40): FeedItem[] {
  const tripOf = new Map(d.trips.map((t) => [t.id, t]));
  const items: FeedItem[] = [];

  // 사진 묶음: 사람 + 여행 + 날
  const groups = new Map<string, { trip: Trip; by: string; at: number; photos: Photo[] }>();
  for (const p of d.photos) {
    const trip = p.tripId ? tripOf.get(p.tripId) : undefined;
    const at = ms(p.createdAt);
    if (!trip || !at) continue;
    const by = who(p);
    const key = `${by}|${trip.id}|${dayKey(at)}`;
    const g = groups.get(key);
    if (g) { g.photos.push(p); g.at = Math.max(g.at, at); }
    else groups.set(key, { trip, by, at, photos: [p] });
  }
  for (const g of groups.values()) {
    items.push({ kind: 'photos', at: g.at, by: g.by, trip: g.trip, photos: g.photos, captions: g.photos.map((p) => p.caption?.trim()).filter((c): c is string => !!c) });
  }

  for (const n of d.notes) {
    const trip = tripOf.get(n.tripId);
    const at = ms(n.createdAt);
    if (trip && at) items.push({ kind: 'note', at, by: n.by?.name || '', trip, note: n });
  }
  for (const r of d.recs) {
    const at = ms(r.createdAt);
    if (!at) continue;
    const by = who(r);
    const review = r.reviews?.[by] || Object.values(r.reviews ?? {})[0];
    items.push({ kind: 'place', at, by, trip: r.tripId ? tripOf.get(r.tripId) ?? null : null, rec: r, review });
  }
  for (const t of d.trips) {
    const at = ms(t.createdAt);
    if (at) items.push({ kind: 'trip', at, by: who(t), trip: t });
  }
  for (const w of d.wishes) {
    const at = ms(w.createdAt);
    if (at) items.push({ kind: 'wish', at, by: who(w), wish: w });
  }
  for (const a of d.asks ?? []) {
    const opened = Object.keys(a.answers).length >= a.need;
    for (const [uid, ans] of Object.entries(a.answers)) items.push({ kind: 'ask', at: ans.at, by: ans.name, day: a.day, uid, question: a.question, text: ans.text, opened });
  }
  return items.sort((a, b) => b.at - a.at).slice(0, limit);
}

/** '방금' · '12분 전' · '3시간 전' · '어제' · '5일 전' · '9월 3일' */
export function ago(at: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return '방금';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.round(h / 24);
  if (d === 1) return '어제';
  if (d < 7) return `${d}일 전`;
  const dt = new Date(at);
  const y = dt.getFullYear() === new Date(now).getFullYear() ? '' : `${dt.getFullYear()}년 `;
  return `${y}${dt.getMonth() + 1}월 ${dt.getDate()}일`;
}

/** 피드에 새 소식이 있는지 (마지막으로 본 시각 뒤에 남이 남긴 것) */
export function unseenCount(items: FeedItem[], lastSeen: number, me: string): number {
  return items.filter((i) => i.at > lastSeen && i.by !== me).length;
}
