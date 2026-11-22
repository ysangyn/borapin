/**
 * '어떤 곳·어떤 음식인지' (아내 의견 11-21: 처음 보는 곳은 지도만으로 판단할 수 없다 → 사진과 소개)
 * - 위키백과 한국어 요약(REST page/summary): 소개 두세 문장 + 대표 사진 + 문서 주소
 * - 관광공사 detailImage2: 한 곳의 사진 여러 장
 * 앱 시험이 이 파일만 읽는다 (부르기·캐시는 about.ts / nearby.ts)
 */
export interface About { title: string; short: string; img?: string; url?: string }

/** "서산 게국지/어리굴젓" → ["서산 게국지", "어리굴젓"] */
export const splitNames = (s: string) => s.split(/[\/·,]/).map((x) => x.trim()).filter(Boolean);

/** 찾아볼 문서 이름들: 그대로 → 괄호 속 다른 이름 → 지역 이름을 뗀 것 → 지역 이름 뒤에 띄어쓰기 */
export function aboutTitles(name: string, area: string): string[] {
  const out: string[] = [];
  const add = (x: string) => { const t = x.trim(); if (t && !out.includes(t)) out.push(t); };
  const paren = /^(.*?)\s*\((.+)\)\s*$/.exec(name);
  const base = paren ? paren[1] : name;
  add(base);
  if (paren) add(paren[2]);
  const stem = area.replace(/(특별자치시|특별자치도|특별시|광역시|시|군|구)$/, '');
  if (stem.length >= 2) {
    if (base.startsWith(`${stem} `)) add(base.slice(stem.length + 1));
    else if (base.startsWith(stem) && base.length > stem.length + 1) add(`${stem} ${base.slice(stem.length)}`);
  }
  return out.slice(0, 3);
}

const https = (u: unknown) => (typeof u === 'string' && /^https?:\/\//.test(u) ? u.replace(/^http:/, 'https:') : undefined);

/** 위키백과 요약 → 소개(두세 문장, 220자까지)·사진·주소. 동음이의 문서·빈 문서는 null */
export function parseWikiSummary(j: unknown): About | null {
  const d = j as { type?: string; title?: string; extract?: string; thumbnail?: { source?: string }; originalimage?: { source?: string }; content_urls?: { mobile?: { page?: string }; desktop?: { page?: string } } } | null;
  if (!d || d.type === 'disambiguation' || !d.title) return null;
  const t = (d.extract ?? '').replace(/\s+/g, ' ').trim();
  if (t.length < 15) return null;
  const sents = t.match(/[^.!?。]+[.!?。]+(\s|$)|[^.!?。]+$/g)?.map((x) => x.trim()) ?? [t];
  let short = '';
  for (const s of sents) { if ((short + s).length > 220 && short) break; short = short ? `${short} ${s}` : s; }
  return { title: d.title, short: short.slice(0, 260), img: https(d.thumbnail?.source ?? d.originalimage?.source), url: https(d.content_urls?.mobile?.page ?? d.content_urls?.desktop?.page) };
}

/** 관광공사 detailImage2 → 사진 주소들 (https, 겹침 없이, 8장까지) */
export function tourImages(j: unknown): string[] {
  const items = (j as { response?: { body?: { items?: { item?: unknown } | string } } })?.response?.body?.items;
  const raw = items && typeof items === 'object' ? (items as { item?: unknown }).item : undefined;
  const list = (Array.isArray(raw) ? raw : raw ? [raw] : []) as { originimgurl?: string; smallimageurl?: string }[];
  const out: string[] = [];
  for (const x of list) {
    const u = https(x.originimgurl) ?? https(x.smallimageurl);
    if (u && !out.includes(u)) out.push(u);
    if (out.length >= 8) break;
  }
  return out;
}
