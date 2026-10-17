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

async function fetchRaw(q: string): Promise<NewsItem[]> {
  const c = mem.get(q);
  const fresh = (e: { at: number; items: NewsItem[] }) => Date.now() - e.at < (e.items.length ? TTL : EMPTY_TTL);
  if (c && fresh(c)) return c.items;
  try {
    const raw = localStorage.getItem(KEY + q);
    if (raw) {
      const j = JSON.parse(raw) as { at: number; items: NewsItem[] };
      if (fresh(j)) { mem.set(q, j); return j.items; }
    }
  } catch { /* 저장소 없어도 그만 */ }
  const user = auth.currentUser;
  if (!aiAvailable() || !user) return [];
  const token = await user.getIdToken();
  const r = await fetch(`${ASK_URL}/news?q=${encodeURIComponent(q)}`, { headers: { authorization: `Bearer ${token}` } });
  if (!r.ok) return [];
  const j = (await r.json()) as { items?: NewsItem[] };
  const items = (j.items ?? []).filter(isTravelNews);
  const entry = { at: Date.now(), items };
  mem.set(q, entry);
  try { localStorage.setItem(KEY + q, JSON.stringify(entry)); } catch { /* */ }
  return items;
}

/** 여러 검색어를 한꺼번에 가져와 고르기. match가 있으면 제목에 그 이름이 있는 기사만 */
export async function fetchNewsSet(queries: string[], match = '', n = 5): Promise<NewsItem[]> {
  const lists = await Promise.all(queries.map((q) => fetchRaw(q).catch(() => [] as NewsItem[])));
  const only = match ? lists.map((l) => l.filter((x) => x.title.includes(match))) : lists;
  // 골라낸 것(관련 있는 것)은 최근 순으로 보여 준다
  return pickNews(only, match, n).sort((a, b) => (b.at || '').localeCompare(a.at || ''));
}

export type { NewsTab } from './newsFilter';
export { orderNewsTabs } from './newsFilter';
export function useNewsTabs(tabs: import('./newsFilter').NewsTab[] | null): Record<string, NewsItem[]> | null {
  const key = tabs ? tabs.map((t) => t.key + '#' + t.match).join('|') : '';
  const [got, setGot] = useState<Record<string, NewsItem[]> | null>(null);
  useEffect(() => {
    let on = true;
    setGot(null);
    if (!key || !tabs || !aiAvailable()) return;
    Promise.all(tabs.map((t) => fetchNewsSet(t.queries, t.match).catch(() => [] as NewsItem[])))
      .then((ls) => on && setGot(Object.fromEntries(tabs.map((t, i) => [t.key, ls[i]]))));
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
    setItems(null);
    if (!key || !queries || !aiAvailable()) return;
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
