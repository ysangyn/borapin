/**
 * 유튜브 영상 찾기 (YouTube Data API v3 search.list, 한 번에 100단위 · 하루 1만 단위 무료) — 순수 함수.
 * 같은 말은 7일 캐시해서 다시 쓴다 (API 정책상 30일 안에서 새로 받으면 된다). 열쇠는 Worker 비밀값 YOUTUBE_API_KEY.
 */
export interface Video { id: string; title: string; channel: string; at: string; thumb: string }

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const unescape = (s: string) => s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
  if (ENT[e.toLowerCase()]) return ENT[e.toLowerCase()];
  if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
  return m;
});

export function videoQuery(name: string, area: string, kind?: 'food' | 'sight'): string {
  const n = name.trim();
  const a = area.trim();
  const parts = [n];
  if (a && !n.includes(a)) parts.push(a);
  if (kind !== 'food') parts.push('여행');
  return parts.join(' ').slice(0, 60);
}

export function videosUrl(key: string, q: string): string {
  const qs = new URLSearchParams({ part: 'snippet', type: 'video', maxResults: '6', regionCode: 'KR', relevanceLanguage: 'ko', safeSearch: 'strict', q, key });
  return `https://www.googleapis.com/youtube/v3/search?${qs}`;
}

interface Item { id?: { kind?: string; videoId?: string }; snippet?: { title?: string; channelTitle?: string; publishedAt?: string; thumbnails?: Record<string, { url?: string } | undefined> } }

export function parseVideos(j: unknown): Video[] {
  const items = (j as { items?: unknown } | null)?.items;
  if (!Array.isArray(items)) return [];
  const out: Video[] = [];
  for (const it of items as Item[]) {
    const id = it.id?.videoId;
    if (it.id?.kind !== 'youtube#video' || !id || !/^[A-Za-z0-9_-]{11}$/.test(id)) continue;
    const t = it.snippet?.thumbnails ?? {};
    const thumb = t.medium?.url ?? t.high?.url ?? t.default?.url ?? `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    if (!/^https:\/\/i\.ytimg\.com\//.test(thumb)) continue;
    out.push({ id, title: unescape(it.snippet?.title ?? '').slice(0, 120), channel: unescape(it.snippet?.channelTitle ?? '').slice(0, 60), at: (it.snippet?.publishedAt ?? '').slice(0, 10), thumb });
  }
  return out;
}
