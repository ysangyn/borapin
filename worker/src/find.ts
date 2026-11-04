/** 해외 함께 찾기: 위키보이지 받기 + 우리말 한 줄(번역만) + 하루 캐시 (풀이는 findParse.ts) */
import { parseListings, type FindItem, type FindKind } from './findParse';

const UA = { 'user-agent': 'borapin/1.0 (+https://borapin.web.app)' };

async function wikitext(page: string): Promise<string | null> {
  const r = await fetch(`https://en.wikivoyage.org/w/api.php?action=parse&format=json&prop=wikitext&redirects=1&page=${encodeURIComponent(page)}`, { headers: UA });
  if (!r.ok) return null;
  const j = (await r.json().catch(() => null)) as { parse?: { wikitext?: { '*': string } } } | null;
  return j?.parse?.wikitext?.['*'] ?? null;
}

/** 한 줄을 우리말로 '번역만' (원문에 없는 말을 보태지 말 것). 실패하면 원문 그대로 */
async function translate(ai: Ai, model: string, lines: string[]): Promise<string[]> {
  if (!lines.length) return [];
  const prompt = `다음 영어 문장들을 자연스러운 한국어로 번역만 하세요. 원문에 없는 내용은 절대 보태지 말고, 가격 숫자는 빼세요. 줄 수와 순서를 그대로 지켜 JSON 문자열 배열 하나만 출력하세요.\n${JSON.stringify(lines)}`;
  try {
    const r = (await ai.run(model as Parameters<Ai['run']>[0], { messages: [{ role: 'user', content: prompt }], max_tokens: 1800 } as never)) as { response?: string };
    const m = (r.response ?? '').match(/\[[\s\S]*\]/);
    const arr = m ? (JSON.parse(m[0]) as unknown[]) : [];
    return lines.map((l, i) => (typeof arr[i] === 'string' && (arr[i] as string).trim() ? (arr[i] as string).trim().slice(0, 160) : l));
  } catch { return lines; }
}

export async function find(ai: Ai, model: string, city: string, kind: FindKind): Promise<Response> {
  const head = { 'content-type': 'application/json; charset=utf-8' };
  const cache = caches.default;
  const ck = new Request(`https://cache.borapin/find?${encodeURIComponent(city.toLowerCase())}&${kind}`);
  const hit = await cache.match(ck);
  if (hit) return hit;
  const text = await wikitext(city);
  if (text == null) return new Response(JSON.stringify({ error: 'upstream' }), { status: 503, headers: head });
  const items: FindItem[] = parseListings(text, kind).slice(0, 24);
  const ko = await translate(ai, model, items.map((x) => x.line ?? ''));
  items.forEach((x, i) => { if (x.line) x.line = ko[i]; });
  const res = new Response(JSON.stringify({ items, source: `https://en.wikivoyage.org/wiki/${encodeURIComponent(city.replace(/ /g, '_'))}` }), { headers: { ...head, 'cache-control': 'public, max-age=86400' } });
  await cache.put(ck, res.clone());
  return res;
}
