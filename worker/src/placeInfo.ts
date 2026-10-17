/**
 * 지도 링크(네이버·카카오)에서 장소 정보 뽑기 — 순수 함수만 (시험: tests/unit/placeInfo.test.ts)
 * 가져오는 것: 이름, 대표 사진 주소, 주소, 종류(업종), 위경도. 없으면 비워 둔다.
 */
export interface PlaceInfo { name?: string; image?: string; address?: string; category?: string; lat?: number; lng?: number; placeId?: string; source?: 'naver' | 'kakao' }

/** 따라가도 되는 곳 (그 밖의 주소는 열지 않는다: 남의 서버를 대신 두드리는 통로가 되지 않게) */
const HOSTS = /^(naver\.me|map\.naver\.com|m\.map\.naver\.com|(m\.|pcmap\.)?place\.naver\.com|kko\.to|place\.map\.kakao\.com|map\.kakao\.com|m\.map\.kakao\.com)$/;
export function allowedUrl(u: string): URL | null {
  try {
    const x = new URL(u);
    if (x.protocol !== 'https:' && x.protocol !== 'http:') return null;
    if (!HOSTS.test(x.hostname)) return null;
    x.protocol = 'https:';
    return x;
  } catch { return null; }
}

/** 네이버 장소 번호: /place/123, /entry/place/123, /restaurant/123, ?id=123 */
export function naverPlaceId(u: string): string | null {
  const m = /\/(?:entry\/)?(?:place|restaurant|cafe|accommodation|hospital|hairshop|attraction)\/(\d{5,})/.exec(u) ?? /[?&](?:id|pinId)=(\d{5,})/.exec(u);
  return m ? m[1] : null;
}
export function kakaoPlaceId(u: string): string | null {
  const m = /place\.map\.kakao\.com\/(?:m\/)?(\d{4,})/.exec(u) ?? /[?&]itemId=(\d{4,})/.exec(u);
  return m ? m[1] : null;
}

const ent = (t: string) => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").trim();
const meta = (html: string, prop: string) => {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i');
  const m = re.exec(html);
  return m ? ent(m[1] ?? m[2] ?? '') : '';
};
const inKorea = (lat: number, lng: number) => lat > 32 && lat < 39.5 && lng > 124 && lng < 132.5;
const inWorld = (lat: number, lng: number) => Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

/** 네이버 장소 페이지(HTML)에서 */
export function parseNaverHtml(html: string): PlaceInfo {
  const out: PlaceInfo = { source: 'naver' };
  const title = meta(html, 'og:title').replace(/\s*[:|-]\s*네이버.*$/, '').trim();
  if (title) out.name = title;
  const img = meta(html, 'og:image');
  if (/^https:\/\//.test(img) && !/og_image|default|naver_logo|static\/www\/mobile/i.test(img)) out.image = img;
  const road = /"roadAddress"\s*:\s*"([^"]{4,120})"/.exec(html)?.[1] ?? /"address"\s*:\s*"([^"]{4,120})"/.exec(html)?.[1];
  if (road) out.address = ent(road);
  const cat = /"category"\s*:\s*"([^"]{1,40})"/.exec(html)?.[1];
  if (cat) out.category = ent(cat);
  // 좌표: "x":"127.1","y":"37.5" (경도·위도)
  const xy = /"x"\s*:\s*"?(1[23]\d\.\d+)"?\s*,\s*"y"\s*:\s*"?(3\d\.\d+)"?/.exec(html);
  if (xy) {
    const lng = Number(xy[1]), lat = Number(xy[2]);
    if (inKorea(lat, lng)) { out.lat = lat; out.lng = lng; }
  }
  return out;
}

/** 카카오 장소 페이지(HTML)에서 (og 태그만) */
export function parseKakaoHtml(html: string): PlaceInfo {
  const out: PlaceInfo = { source: 'kakao' };
  const title = meta(html, 'og:title').replace(/\s*[|-]\s*카카오맵.*$/, '').trim();
  if (title && title !== '카카오맵') out.name = title;
  const img = meta(html, 'og:image');
  if (/^https:\/\//.test(img) && !/default|kakaomap_logo|og_map/i.test(img)) out.image = img;
  const desc = meta(html, 'og:description');
  if (desc && /(시|도|군|구|로|길)\s/.test(desc)) out.address = desc.slice(0, 120);
  return out;
}

/** 주소 줄의 좌표 (?lng=&lat=, ?c=lng,lat 처럼 들어 있을 때) */
export function coordsFromUrl(u: string): { lat: number; lng: number } | null {
  const q = (k: string) => /[?&]/.test(u) ? new URL(u).searchParams.get(k) : null;
  try {
    const lat = Number(q('lat')), lng = Number(q('lng'));
    if (lat && lng && inWorld(lat, lng)) return { lat, lng };
    const c = q('c')?.split(',');
    if (c && c.length >= 2) {
      const a = Number(c[0]), b = Number(c[1]);
      if (a > 100 && a < 180 && b > 20 && b < 60) return { lat: b, lng: a };
    }
  } catch { /* */ }
  return null;
}
