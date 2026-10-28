/** 지금 여기 근처 관광지: 관광공사 부르기·캐시 (풀이 함수는 nearbyParse.ts — 앱 시험이 그쪽만 읽는다) */
import { aboutOf, firstLine, introOf, parseNearby, pickSpot, type NearbyItem } from './nearbyParse';

const BASE = 'https://apis.data.go.kr/B551011/KorService2';
async function call(key: string, op: string, p: Record<string, string>) {
  const qs = new URLSearchParams({ serviceKey: key, MobileOS: 'ETC', MobileApp: 'borapin', _type: 'json', ...p });
  const r = await fetch(`${BASE}/${op}?${qs}`, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`관광공사 ${r.status}`);
  return r.json();
}

export async function nearby(key: string, lat: number, lng: number): Promise<Response> {
  const head = { 'content-type': 'application/json; charset=utf-8' };
  if (!(lat > 32 && lat < 39.5 && lng > 124 && lng < 132)) return new Response(JSON.stringify({ items: [], outside: true }), { headers: head });
  const la = lat.toFixed(3), ln = lng.toFixed(3);
  const cache = caches.default;
  const ck = new Request(`https://cache.borapin/nearby?${la},${ln}`);
  const hit = await cache.match(ck);
  if (hit) return hit;
  // 500m 안에 셋이 안 되면 1.5km까지
  let items: NearbyItem[] = [];
  for (const radius of ['500', '1500']) {
    items = parseNearby(await call(key, 'locationBasedList2', { mapX: ln, mapY: la, radius, arrange: 'E', numOfRows: '12', pageNo: '1' }));
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
  const ck = new Request(`https://cache.borapin/spot?${encodeURIComponent(name)}&${lat?.toFixed(3) ?? ''},${lng?.toFixed(3) ?? ''}`);
  const hit = await cache.match(ck);
  if (hit) return hit;
  const found = pickSpot(await call(key, 'searchKeyword2', { keyword: name, numOfRows: '10', pageNo: '1', arrange: 'O' }), lat, lng);
  let out: Record<string, unknown> = {};
  if (found) {
    const [common, intro] = await Promise.all([
      call(key, 'detailCommon2', { contentId: found.id }).catch(() => null),
      call(key, 'detailIntro2', { contentId: found.id, contentTypeId: found.type }).catch(() => null),
    ]);
    const c = ((common as { response?: { body?: { items?: { item?: Record<string, unknown>[] } } } } | null)?.response?.body?.items?.item ?? [])[0] ?? {};
    const tel = typeof c.tel === 'string' && /^[0-9-]{7,}$/.test(c.tel.trim()) ? c.tel.trim() : undefined;
    out = { ...aboutOf(c.overview), ...introOf(intro), addr: found.addr, tel, img: found.img, type: found.type };
  }
  const res = new Response(JSON.stringify(out), { headers: head });
  await cache.put(ck, res.clone());
  return res;
}
