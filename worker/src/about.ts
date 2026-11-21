/** '어떤 곳·어떤 음식인지' 한 번에 여러 이름 (위키백과 한국어 요약, 7일 캐시). 풀이는 aboutParse.ts */
import { aboutTitles, parseWikiSummary, splitNames, type About } from './aboutParse';

const UA = { 'user-agent': 'borapin/1.0 (+https://borapin.web.app)', accept: 'application/json' };

async function one(name: string, area: string): Promise<About | null> {
  const cache = caches.default;
  const ck = new Request(`https://cache.borapin/about?${encodeURIComponent(area)}&${encodeURIComponent(name)}`);
  const hit = await cache.match(ck);
  if (hit) return (await hit.json()) as About | null;
  let found: About | null = null;
  for (const t of aboutTitles(name, area)) {
    try {
      const r = await fetch(`https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, '_'))}?redirect=true`, { headers: UA, signal: AbortSignal.timeout(6000) });
      if (r.ok) { found = parseWikiSummary(await r.json()); if (found) break; }
    } catch { /* 다음 이름으로 */ }
  }
  // 못 찾은 것도 하루는 기억한다 (같은 걸 계속 묻지 않게)
  await cache.put(ck, new Response(JSON.stringify(found), { headers: { 'cache-control': `public, max-age=${found ? 604800 : 86400}` } }));
  return found;
}

/** names: '|'로 이은 이름들(12개까지). "서산 게국지/어리굴젓"처럼 한 칸에 둘이면 앞의 것으로 찾는다 */
export async function about(names: string[], area: string): Promise<Response> {
  const list = names.map((n) => n.trim()).filter(Boolean).slice(0, 12);
  const got = await Promise.all(list.map(async (n) => [n, await one(splitNames(n)[0] ?? n, area)] as const));
  return new Response(JSON.stringify({ items: Object.fromEntries(got.filter(([, a]) => a)) }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  });
}
