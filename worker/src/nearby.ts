/** 지금 여기 근처 관광지: 관광공사 부르기·캐시 (풀이 함수는 nearbyParse.ts — 앱 시험이 그쪽만 읽는다) */
import { aboutOf, firstLine, introOf, parseNearby, pickSpot, type NearbyItem } from './nearbyParse';
import { tourImages } from './aboutParse';

const BASE = 'https://apis.data.go.kr/B551011/KorService2';
async function call(key: string, op: string, p: Record<string, string>) {
  const qs = new URLSearchParams({ serviceKey: key, MobileOS: 'ETC', MobileApp: 'borapin', _type: 'json', ...p });
  const r = await fetch(`${BASE}/${op}?${qs}`, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`관광공사 ${r.status}`);
  return r.json();
}

/**
 * kind: 'food' 음식점만(39) · 'see' 관광지만(12) · 없으면 다 (지금 여기). 알아보기 창의 '근처 맛집·볼거리'는 1km → 3km.
 */
export async function nearby(key: string, lat: number, lng: number, kind?: 'food' | 'see'): Promise<Response> {
  const head = { 'content-type': 'application/json; charset=utf-8' };
  if (!(lat > 32 && lat < 39.5 && lng > 124 && lng < 132)) return new Response(JSON.stringify({ items: [], outside: true }), { headers: head });
  const la = lat.toFixed(3), ln = lng.toFixed(3);
  const cache = caches.default;
  const ck = new Request(`https://cache.borapin/nearby?${la},${ln}${kind ? `&${kind}` : ''}`);
  const hit = await cache.match(ck);
  if (hit) return hit;
  // 500m 안에 셋이 안 되면 1.5km까지
  let items: NearbyItem[] = [];
  const type: Record<string, string> = kind === 'food' ? { contentTypeId: '39' } : kind === 'see' ? { contentTypeId: '12' } : {};
  for (const radius of kind ? ['1000', '3000'] : ['500', '1500']) {
    items = parseNearby(await call(key, 'locationBasedList2', { mapX: ln, mapY: la, radius, arrange: 'E', numOfRows: '12', pageNo: '1', ...type }));
    if (items.length >= 3) break;
  }
  items = items.slice(0, 9);
  // 앞의 셋만 한 줄 (개요 7일 캐시)
  await Promise.all(items.slice(0, 3).map(async (it) => {
    const ok = new Request(`https://cache.borapin/overview?${it.id}`);
    const o = await cache.match(ok);
    if (o) { it.line = (await o.text()) || undefined; return; }
    try {
      const d = (await call(key, 'detailCommon2', { contentId: it.id })) as { response?: { body?: { items?: { item?: { overview?: string }[] } } } };
      it.line = firstLine(d.response?.body?.items?.item?.[0]?.overview);
    } catch { /* 한 줄 없이 */ }
    await cache.put(ok, new Response(it.line ?? '', { headers: { 'cache-control': 'public, max-age=604800' } }));
  }));
  const res = new Response(JSON.stringify({ items }), { headers: { ...head, 'cache-control': 'public, max-age=86400' } });
  await cache.put(ck, res.clone());
  return res;
}

/** 관광지 하나 자세히 (사진을 누르면 뜨는 창): 이름+자리로 찾아 소개·이용 시간·쉬는 날·주소·전화. 7일 캐시 */
export async function spot(key: string, name: string, lat?: number, lng?: number): Promise<Response> {
  const head = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=604800' };
  const cache = caches.default;
  const ck = new Request(`https://cache.borapin/spot2?${encodeURIComponent(name)}&${lat?.toFixed(3) ?? ''},${lng?.toFixed(3) ?? ''}`);
  const hit = await cache.match(ck);
  if (hit) return hit;
  const found = pickSpot(await call(key, 'searchKeyword2', { keyword: name, numOfRows: '10', pageNo: '1', arrange: 'O' }), lat, lng);
  let out: Record<string, unknown> = {};
  if (found) {
    const [common, intro, images] = await Promise.all([
      call(key, 'detailCommon2', { contentId: found.id }).catch(() => null),
      call(key, 'detailIntro2', { contentId: found.id, contentTypeId: found.type }).catch(() => null),
      // 사진 여러 장 (한 장만으로는 가고 싶은지 알기 어렵다 · 아내 의견 11-21)
      call(key, 'detailImage2', { contentId: found.id, imageYN: 'Y', numOfRows: '10', pageNo: '1' }).catch(() => null),
    ]);
    const c = ((common as { response?: { body?: { items?: { item?: Record<string, unknown>[] } } } } | null)?.response?.body?.items?.item ?? [])[0] ?? {};
    const tel = typeof c.tel === 'string' && /^[0-9-]{7,}$/.test(c.tel.trim()) ? c.tel.trim() : undefined;
    const imgs = tourImages(images).filter((u) => u !== found.img);
    out = { ...aboutOf(c.overview), ...introOf(intro), addr: found.addr, tel, img: found.img, ...(imgs.length ? { imgs } : {}), type: found.type };
  }
  const res = new Response(JSON.stringify(out), { headers: head });
  await cache.put(ck, res.clone());
  return res;
}
