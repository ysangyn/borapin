/**
 * 해외 '지금 여기' 근처 식당·카페: 오픈스트리트맵 Overpass API (무료, 열쇠 없음) — 순수 함수.
 * 자료는 ODbL이라 출처(© OpenStreetMap 기여자)를 밝히면 고른 가게의 이름·자리를 기록으로 남겨도 된다.
 */
import type { NearbyItem } from './nearbyParse';

export function overpassQuery(lat: number, lng: number, radius: number): string {
  const a = `around:${radius},${lat.toFixed(6)},${lng.toFixed(6)}`;
  return `[out:json][timeout:10];(nwr(${a})[amenity~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|food_court)$"][name];nwr(${a})[shop~"^(bakery|pastry|confectionery)$"][name];);out center 60;`;
}

const CUISINE: Record<string, string> = {
  ramen: '라멘', sushi: '스시', japanese: '일식', udon: '우동', soba: '소바', yakitori: '야키토리', tempura: '덴푸라',
  chinese: '중식', dim_sum: '딤섬', noodle: '국수', thai: '태국 음식', vietnamese: '베트남 음식', pho: '쌀국수', indian: '인도 음식',
  korean: '한식', italian: '이탈리아 음식', pizza: '피자', french: '프랑스 음식', spanish: '스페인 음식', mexican: '멕시코 음식',
  burger: '햄버거', steak_house: '스테이크', seafood: '해산물', bbq: '바비큐', coffee_shop: '카페', ice_cream: '아이스크림',
  local: '현지 음식', regional: '현지 음식', curry: '카레', bakery: '빵집', dessert: '디저트', tapas: '타파스', kebab: '케밥',
};
const AMENITY: Record<string, string> = { restaurant: '식당', cafe: '카페', fast_food: '간단한 식사', bar: '바', pub: '펍', ice_cream: '아이스크림', food_court: '푸드코트' };

function meters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000, r = Math.PI / 180;
  const h = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface El { type?: string; id?: number; lat?: number; lon?: number; center?: { lat?: number; lon?: number }; tags?: Record<string, string> }

export function parseOsmNear(j: unknown, lat: number, lng: number): NearbyItem[] {
  const els = (j as { elements?: unknown } | null)?.elements;
  if (!Array.isArray(els)) return [];
  const out: NearbyItem[] = [];
  const seen = new Set<string>();
  for (const e of els as El[]) {
    const t = e.tags ?? {};
    const name = (t['name:ko'] || t.name || '').trim();
    const y = e.lat ?? e.center?.lat, x = e.lon ?? e.center?.lon;
    if (!name || !e.id || !e.type || y == null || x == null) continue;
    const id = `o${e.type[0]}${e.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const cafe = t.amenity === 'cafe';
    const first = (t.cuisine ?? '').split(';')[0].trim();
    const type = t.shop ? '빵집' : CUISINE[first] ?? AMENITY[t.amenity ?? ''] ?? '식당';
    const dist = Math.round(meters(lat, lng, y, x));
    const addr = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ').slice(0, 200) || undefined;
    out.push({ id, name: name.slice(0, 80), kind: cafe ? 'cafe' : 'food', type, dist, walk: Math.max(1, Math.round(dist / 70)), lat: y, lng: x, ...(addr ? { addr } : {}) });
  }
  return out.sort((a, b) => a.dist - b.dist);
}
