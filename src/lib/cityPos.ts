/**
 * 해외 자리 → 가까운 도시 (사진 위치·지금 여기). 일본 안이면 '일본'이 아니라 '교토'로 묶는다.
 * 자리는 src/data/citypos.json (세계 도시 자료 126곳), 시험이 다른 나라에 찍힌 자리를 막는다.
 */
import cp from '../data/citypos.json';

const POS = (cp as unknown as { pos: Record<string, [number, number]> }).pos;
const BY_COUNTRY = new Map<string, { city: string; lat: number; lng: number }[]>();
for (const [k, [lat, lng]] of Object.entries(POS)) {
  const [c, city] = k.split(':');
  if (!BY_COUNTRY.has(c)) BY_COUNTRY.set(c, []);
  BY_COUNTRY.get(c)!.push({ city, lat, lng });
}

function km(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const r = Math.PI / 180;
  const h = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** 그 나라 도시 가운데 가장 가까운 곳 (60km 안). 없으면 null → 나라로 남긴다 */
export function nearestCity(countryId: string, lat: number, lng: number, maxKm = 60): string | null {
  let best: string | null = null, bd = maxKm;
  for (const c of BY_COUNTRY.get(countryId) ?? []) {
    const d = km(lat, lng, c.lat, c.lng);
    if (d <= bd) { bd = d; best = c.city; }
  }
  return best;
}
