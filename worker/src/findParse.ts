/**
 * 해외 함께 찾기: 위키보이지(Wikivoyage, CC BY-SA) 영어판 문서의 목록 틀을 풀어 낸다.
 * {{see | name=… | lat=… | long=… | content=…}} · {{listing | type=eat | …}} · {{eat|…}} {{buy|…}} {{do|…}} {{drink|…}}
 * 앱 시험(tests/unit/worker-find.test.ts)이 이 파일만 읽는다 (Workers 전용 API 없음).
 */
export type FindKind = 'see' | 'do' | 'eat' | 'buy';
export interface FindItem { name: string; lat?: number; lng?: number; line?: string; area?: string; kind: FindKind; url?: string }

const KIND_OF: Record<string, FindKind> = { see: 'see', do: 'do', eat: 'eat', drink: 'eat', buy: 'buy' };

/** 틀 안을 '|'로 나누되 [[…|…]]·{{…|…}} 안의 '|'는 두고 */
function splitParams(body: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === '{{' || two === '[[') { depth++; cur += two; i++; continue; }
    if ((two === '}}' || two === ']]') && depth > 0) { depth--; cur += two; i++; continue; }
    if (body[i] === '|' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += body[i];
  }
  out.push(cur);
  return out;
}

/** 위키 글씨 → 보통 글씨 */
export function plain(s: string): string {
  return s
    .replace(/<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/\[https?:\/\/\S+\s([^\]]+)\]/g, '$1')
    .replace(/'''?|<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 가격(₩·$·€·£·¥ + 숫자, '숫자 baht' 등)은 지운다 — 바뀌는 숫자는 넣지 않는다 */
export function noPrice(s: string): string {
  return s
    .replace(/[([]?\s*(?:US\$|[$€£¥₩₫฿]|THB|JPY|USD|EUR|KRW|VND|HKD|TWD|SGD|MYR|IDR|PHP)\s?\d[\d,]*(?:\.\d+)?(?:\s?[-–]\s?\d[\d,]*(?:\.\d+)?)?\s*[)\]]?/gi, '')
    .replace(/\d[\d,]*(?:\.\d+)?\s?(?:baht|yen|yuan|dong|won|dollars?|euros?|pesos?|ringgit|rupiah|dirhams?)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .trim();
}

/** 첫 문장만 (140자 안) */
export function firstSentence(s: string): string {
  const t = s.split(/(?<=[.!?])\s/)[0] ?? s;
  return t.length > 140 ? t.slice(0, 138).replace(/\s\S*$/, '') + '…' : t;
}

/** '{{' 부터 짝이 맞는 '}}' 까지 (안에 다른 틀이 있어도) */
function closeAt(t: string, from: number): number {
  let depth = 0;
  for (let i = from; i < t.length - 1; i++) {
    if (t[i] === '{' && t[i + 1] === '{') { depth++; i++; } else if (t[i] === '}' && t[i + 1] === '}') { depth--; i++; if (depth === 0) return i + 1; }
  }
  return -1;
}

export function parseListings(wikitext: string, want?: FindKind): FindItem[] {
  const out: FindItem[] = [];
  const seen = new Set<string>();
  let area = '';
  // '=== Old Town ===' 같은 작은 제목은 동네, '== See ==' 같은 큰 제목이 나오면 동네를 지운다
  const re = /(^|\n)(={2,4})\s*([^=\n]+?)\s*\2\s*(?=\n)|\{\{\s*(see|do|eat|drink|buy|listing)\s*\|/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(wikitext))) {
    if (m[2]) { area = m[2].length >= 3 ? plain(m[3]) : ''; continue; }
    const start = m.index, end = closeAt(wikitext, start);
    if (end < 0) break;
    re.lastIndex = end;
    const tpl = m[4].toLowerCase();
    const body = wikitext.slice(start + 2, end - 2);
    const params: Record<string, string> = {};
    for (const p of splitParams(body).slice(1)) {
      const i = p.indexOf('=');
      if (i > 0) params[p.slice(0, i).trim().toLowerCase()] = p.slice(i + 1).trim();
    }
    const kind = KIND_OF[tpl === 'listing' ? (params.type ?? '').toLowerCase() : tpl];
    if (!kind || (want && kind !== want)) continue;
    const name = plain(params.name ?? '');
    if (!name || name.length > 80 || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const lat = Number(params.lat), lng = Number(params.long ?? params.lon ?? params.lng);
    const line = noPrice(firstSentence(plain(params.content ?? params.description ?? '')));
    const url = /^https?:\/\//.test(params.url ?? '') ? params.url : undefined;
    out.push({ name, kind, ...(Number.isFinite(lat) && Number.isFinite(lng) && lat && lng ? { lat, lng } : {}), ...(line ? { line } : {}), ...(area ? { area } : {}), ...(url ? { url } : {}) });
  }
  return out;
}
