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
  /** 같은 사람이 잇따라 담은 가고 싶은 곳 묶음 (피드가 '담음·담음·담음'으로 길어지지 않게) */
  | { kind: 'wishes'; at: number; by: string; wishes: Wish[] }
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
  return mergeBursts(items.sort((a, b) => b.at - a.at)).slice(0, limit);
}

/** 같은 사람이 3시간 안에 잇따라 담은 가고 싶은 곳은 한 묶음으로 */
export function mergeBursts(sorted: FeedItem[], windowMs = 3 * 3600_000): FeedItem[] {
  const out: FeedItem[] = [];
  for (const it of sorted) {
    const last = out[out.length - 1];
    if (it.kind === 'wish' && last && (last.kind === 'wish' || last.kind === 'wishes') && last.by === it.by && last.at - it.at <= windowMs) {
      const wishes = last.kind === 'wish' ? [last.wish, it.wish] : [...last.wishes, it.wish];
      out[out.length - 1] = { kind: 'wishes', at: last.at, by: last.by, wishes };
    } else out.push(it);
  }
  return out;
}

/** 날짜 머리글: 오늘 · 어제 · 10월 15일 · 2025년 3월 2일 */
export function dayHeading(at: number, now = Date.now()): string {
  const d = new Date(at), n = new Date(now);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, n)) return '오늘';
  const y = new Date(n); y.setDate(n.getDate() - 1);
  if (same(d, y)) return '어제';
  return d.getFullYear() === n.getFullYear() ? `${d.getMonth() + 1}월 ${d.getDate()}일` : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
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

// ---------- 일기장 모양 (날짜 띠·이번 주 한 줄·달력) ----------
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');
/** 현지 날짜 'YYYY-MM-DD' (달력 칸과 날짜 띠를 잇는 이름) */
export const dayId = (at: number) => { const d = new Date(at); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
/** 날짜 띠: 오늘 · 어제 · 11월 3일 월요일 · 2025년 3월 2일 일요일 */
export function dayBand(at: number, now = Date.now()): string {
  const h = dayHeading(at, now);
  return h === '오늘' || h === '어제' ? h : `${h} ${WEEKDAY[new Date(at).getDay()]}요일`;
}

const itemTrip = (it: FeedItem): Trip | null => (it.kind === 'photos' || it.kind === 'note' || it.kind === 'trip' ? it.trip : it.kind === 'place' ? it.trip : null);
/** 이번 주(7일) 한 줄: 가장 많이 남긴 여행 + 사진·글·장소·가고 싶은 곳 수. 아무것도 없으면 null */
export function weekLine(items: FeedItem[], now = Date.now()): { title: string; sub: string } | null {
  const week = items.filter((i) => now - i.at < 7 * 86400_000 && i.at <= now + 60_000);
  if (!week.length) return null;
  let photos = 0, notes = 0, places = 0, wishes = 0;
  const per = new Map<string, { trip: Trip; n: number }>();
  for (const it of week) {
    if (it.kind === 'photos') photos += it.photos.length;
    else if (it.kind === 'note') notes++;
    else if (it.kind === 'place') places++;
    else if (it.kind === 'wish') wishes++;
    else if (it.kind === 'wishes') wishes += it.wishes.length;
    const t = itemTrip(it);
    if (t && it.kind !== 'trip') { const g = per.get(t.id) ?? { trip: t, n: 0 }; g.n += it.kind === 'photos' ? it.photos.length : 1; per.set(t.id, g); }
  }
  const top = [...per.values()].sort((a, b) => b.n - a.n)[0];
  const sub = [photos && `사진 ${photos}장`, notes && `글 ${notes}`, places && `장소 ${places}`, wishes && `가고 싶은 곳 ${wishes}`].filter(Boolean).join(' · ');
  const title = top ? `이번 주엔 ${top.trip.title} 이야기가 쌓였어요` : `이번 주에 ${week.length}가지를 남겼어요`;
  return { title, sub };
}

/** 달력 한 달(month는 0부터): 앞 빈칸 수와 날마다 소식 수·대표 사진 */
export function monthCells(items: FeedItem[], year: number, month: number): { lead: number; days: { day: number; id: string; n: number; photoId?: string }[] } {
  const last = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: last }, (_, i) => ({ day: i + 1, id: `${year}-${pad(month + 1)}-${pad(i + 1)}`, n: 0 as number, photoId: undefined as string | undefined }));
  for (const it of items) {
    const d = new Date(it.at);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const c = days[d.getDate() - 1];
    c.n++;
    if (!c.photoId && it.kind === 'photos') c.photoId = it.photos[0]?.id;
  }
  return { lead: new Date(year, month, 1).getDay(), days };
}
