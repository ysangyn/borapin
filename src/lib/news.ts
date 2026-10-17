import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { ASK_URL, aiAvailable } from './ask/smart';
import type { Place } from './types';
import { GENERAL_QUERIES, isTravelNews, newsSpec, pickNews } from './newsFilter';
export { GENERAL_QUERIES, newsSpec } from './newsFilter';

/** 여행 소식 한 줄 (구글 뉴스 RSS, 뒷단이 6시간 캐시) */
export interface NewsItem { title: string; link: string; source: string; at: string }

const mem = new Map<string, { at: number; items: NewsItem[] }>();
const TTL = 6 * 3600_000;
const EMPTY_TTL = 20 * 60_000; // 빈 결과는 잠깐만 기억 (일시 장애가 6시간 '소식 없음'이 되지 않게)
const KEY = 'borapin:news2:';

export { isTravelNews } from './newsFilter';

type Entry = { at: number; items: NewsItem[] };
const fresh = (e: Entry) => Date.now() - e.at < (e.items.length ? TTL : EMPTY_TTL);
const STALE_MAX = 3 * 86400_000; // 새것을 받는 동안 먼저 보여 줄 옛 소식은 사흘까지

/** 기기에 있는 소식 (오래됐어도) */
function cached(q: string): Entry | null {
  const c = mem.get(q);
  if (c) return c;
  try {
    const raw = localStorage.getItem(KEY + q);
    if (raw) { const j = JSON.parse(raw) as Entry; mem.set(q, j); return j; }
  } catch { /* 저장소 없어도 그만 */ }
  return null;
}
function remember(q: string, items: NewsItem[]) {
  const entry = { at: Date.now(), items: items.filter(isTravelNews) };
  mem.set(q, entry);
  try { localStorage.setItem(KEY + q, JSON.stringify(entry)); } catch { /* */ }
}

/** 새로 받아야 할 검색어들을 한 번에 (뒷단 왕복 한 번) */
const inflight = new Map<string, Promise<void>>();
async function refresh(qs: string[]): Promise<void> {
  const need = qs.filter((q) => { const c = cached(q); return !c || !fresh(c); }).filter((q) => !inflight.has(q));
  const waits = qs.map((q) => inflight.get(q)).filter(Boolean) as Promise<void>[];
  if (need.length) {
    const p = (async () => {
      const user = auth.currentUser;
      if (!aiAvailable() || !user) return;
      const token = await user.getIdToken();
      const url = `${ASK_URL}/news?${need.map((q) => 'q=' + encodeURIComponent(q)).join('&')}`;
      const r = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const j = (await r.json()) as { lists?: Record<string, NewsItem[]>; items?: NewsItem[] };
      if (j.lists) for (const q of need) remember(q, j.lists[q] ?? []);
      else if (need.length === 1) remember(need[0], j.items ?? []);
    })().catch(() => undefined).finally(() => { for (const q of need) inflight.delete(q); });
    for (const q of need) inflight.set(q, p);
    waits.push(p);
  }
  await Promise.all(waits);
}

const pickFrom = (queries: string[], match: string, n: number, staleOk: boolean): NewsItem[] | null => {
  const es = queries.map(cached);
  if (es.some((e) => !e || (staleOk ? Date.now() - e.at > STALE_MAX : !fresh(e)))) return null;
  const lists = es.map((e) => e!.items);
  const only = match ? lists.map((l) => l.filter((x) => x.title.includes(match))) : lists;
  return pickNews(only, match, n);
};

/** 여러 검색어를 가져와 고르기. match가 있으면 제목에 그 이름이 있는 기사만 */
export async function fetchNewsSet(queries: string[], match = '', n = 5): Promise<NewsItem[]> {
  await refresh(queries);
  return pickFrom(queries, match, n, true) ?? [];
}

export type { NewsTab } from './newsFilter';
export { orderNewsTabs } from './newsFilter';
export function useNewsTabs(tabs: import('./newsFilter').NewsTab[] | null): Record<string, NewsItem[]> | null {
  const key = tabs ? tabs.map((t) => t.key + '#' + t.match).join('|') : '';
  const [got, setGot] = useState<Record<string, NewsItem[]> | null>(null);
  useEffect(() => {
    let on = true;
    if (!key || !tabs || !aiAvailable()) { setGot(null); return; }
    // 1) 기기에 있는 소식을 바로 (옛것이어도) → 2) 모든 탭 검색어를 한 번에 새로 받아 바꾼다
    const now = (staleOk: boolean) => Object.fromEntries(tabs.map((t) => [t.key, pickFrom(t.queries, t.match, 5, staleOk)]));
    const first = now(true);
    setGot(Object.values(first).every((x) => x) ? (first as Record<string, NewsItem[]>) : null);
    refresh([...new Set(tabs.flatMap((t) => t.queries))]).then(() => {
      if (on) setGot(Object.fromEntries(tabs.map((t) => [t.key, pickFrom(t.queries, t.match, 5, true) ?? []])));
    });
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return got;
}

export const fetchNews = (p: Place) => { const s = newsSpec(p); return fetchNewsSet(s.queries, s.match); };
export const fetchGeneralNews = () => fetchNewsSet(GENERAL_QUERIES);

/** 소식 (없으면 빈 배열, 뒷단이 없으면 null → 칸을 숨긴다) */
export function useNewsSet(queries: string[] | null, match = ''): NewsItem[] | null {
  const key = queries ? queries.join('|') + '#' + match : '';
  const [items, setItems] = useState<NewsItem[] | null>(null);
  useEffect(() => {
    let on = true;
    if (!key || !queries || !aiAvailable()) { setItems(null); return; }
    setItems(pickFrom(queries, match, 5, true));
    fetchNewsSet(queries, match).then((x) => on && setItems(x), () => on && setItems([]));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return items;
}

export function useNews(p: Place | null): NewsItem[] | null {
  const s = p ? newsSpec(p) : null;
  return useNewsSet(s ? s.queries : null, s?.match ?? '');
}

export const newsAgo = (iso: string) => {
  if (!iso) return '';
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  return h < 1 ? '방금' : h < 24 ? `${h}시간 전` : `${Math.round(h / 24)}일 전`;
};
