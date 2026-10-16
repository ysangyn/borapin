import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { ASK_URL, aiAvailable } from './ask/smart';
import { placeLabel } from './geo';
import type { Place } from './types';
import { isTravelNews } from './newsFilter';

/** 여행 소식 한 줄 (구글 뉴스 RSS, 뒷단이 6시간 캐시) */
export interface NewsItem { title: string; link: string; source: string; at: string }

const mem = new Map<string, { at: number; items: NewsItem[] }>();
const TTL = 6 * 3600_000;
const KEY = 'borapin:news:';

/** 지역별 검색어: '강릉 여행' — 광역시·도 이름이 겹치는 곳은 시·군 이름으로 */
export const newsQuery = (p: Place) => `${placeLabel(p)} 여행`;

export { isTravelNews } from './newsFilter';

export const fetchNews = (p: Place) => fetchNewsQuery(newsQuery(p));

/** 여행 전반 소식 검색어 (유류할증료·항공권·축제·여권 같은 '준비에 영향 주는' 것) */
export const GENERAL_NEWS_QUERY = '여행 항공권 유류할증료 OR 축제 OR 여권 OR 환율';

export async function fetchNewsQuery(q: string): Promise<NewsItem[]> {
  const c = mem.get(q);
  if (c && Date.now() - c.at < TTL) return c.items;
  try {
    const raw = localStorage.getItem(KEY + q);
    if (raw) {
      const j = JSON.parse(raw) as { at: number; items: NewsItem[] };
      if (Date.now() - j.at < TTL) { mem.set(q, j); return j.items; }
    }
  } catch { /* 저장소 없어도 그만 */ }
  const user = auth.currentUser;
  if (!aiAvailable() || !user) return [];
  const token = await user.getIdToken();
  const r = await fetch(`${ASK_URL}/news?q=${encodeURIComponent(q)}`, { headers: { authorization: `Bearer ${token}` } });
  if (!r.ok) return [];
  const j = (await r.json()) as { items?: NewsItem[] };
  const items = (j.items ?? []).filter(isTravelNews).slice(0, 5);
  const entry = { at: Date.now(), items };
  mem.set(q, entry);
  try { localStorage.setItem(KEY + q, JSON.stringify(entry)); } catch { /* */ }
  return items;
}

/** 지역의 소식 (없으면 빈 배열, 뒷단이 없으면 null → 칸을 숨긴다) */
export function useNews(p: Place | null): NewsItem[] | null { return useNewsQuery(p ? newsQuery(p) : ''); }

export function useNewsQuery(key: string): NewsItem[] | null {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  useEffect(() => {
    let on = true;
    setItems(null);
    if (!key || !aiAvailable()) return;
    fetchNewsQuery(key).then((x) => on && setItems(x), () => on && setItems([]));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return items;
}

export const newsAgo = (iso: string) => {
  if (!iso) return '';
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  return h < 1 ? '방금' : h < 24 ? `${h}시간 전` : `${Math.round(h / 24)}일 전`;
};
