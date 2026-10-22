/** 뉴스 RSS 읽기 (순수 함수, 시험: tests/unit/rss.test.ts) */
export interface NewsItem { title: string; link: string; source: string; at: string }

const decode = (t: string) => t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/<[^>]+>/g, '').trim();
const tag = (b: string, name: string) => decode(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(b)?.[1] ?? '');
const iso = (d: string) => { const t = d ? new Date(d) : null; return t && !isNaN(t.getTime()) ? t.toISOString() : ''; };

/** 구글 뉴스: 제목 끝 ' - 언론사'를 떼고, <source>가 언론사 */
export function parseGoogleRss(xml: string, max = 15): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const b = m[1];
    const title = tag(b, 'title'), link = tag(b, 'link'), source = tag(b, 'source');
    // 링크는 http(s) 주소만 (앱이 그대로 <a href>에 넣는다 · 빙 쪽과 같은 검사)
    if (title && /^https?:\/\//.test(link)) out.push({ title: title.replace(/\s+-\s+[^-]+$/, ''), link, source, at: iso(tag(b, 'pubDate')) });
    if (out.length >= max) break;
  }
  return out;
}

/** 빙 뉴스: 링크는 apiclick?url=진짜주소, 언론사는 <News:Source> */
export function parseBingRss(xml: string, max = 15): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const b = m[1];
    const title = tag(b, 'title');
    let link = tag(b, 'link');
    try { const u = new URL(link).searchParams.get('url'); if (u) link = u; } catch { /* 그대로 */ }
    const source = tag(b, 'News:Source') || tag(b, 'source');
    if (title && /^https?:\/\//.test(link)) out.push({ title, link, source, at: iso(tag(b, 'pubDate')) });
    if (out.length >= max) break;
  }
  return out;
}

/** 빙은 when: 을 모른다 → 떼고 보낸다 (최근 것만 고르는 건 앱이 한다) */
export const bingQuery = (q: string) => q.replace(/\s*when:\d+[dh]\s*/g, ' ').replace(/\s+/g, ' ').trim();
