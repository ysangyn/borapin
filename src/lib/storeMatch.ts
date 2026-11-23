/**
 * 카카오에서 고른 곳과 상가정보(공공데이터)의 같은 가게 맞추기 — 순수 함수, 폰 안에서만 돈다.
 *
 * 카카오 데브톡 답변(11-23): 카카오 응답의 이름·좌표를 공공데이터 조회 조건으로 쓰면 안 되고, 같은 곳인지 비교에만 쓸 수 있다.
 * 그래서 상가정보는 내 폰 위치로 먼저 받아 두고(뒷단 /stores), 고른 카카오 항목과 여기서 비교만 한다.
 */
export interface Store { id: string; name: string; addr?: string; lat: number; lng: number }

/** 가게 이름에 흔히 붙는 말은 빼고 비교 (정성당 제과 = 정성당, 테라로사커피 초당 = 테라로사 초당점) */
const GENERIC = ['커피전문점', '베이커리', '커피', '카페', '제과점', '제과', '본점'];
export function normName(s: string): string {
  let t = s.toLowerCase().replace(/[\s()[\]{}·.,'"&\-_/]+/g, '');
  for (const g of GENERIC) t = t.split(g).join('');
  if (t.length > 3 && t.endsWith('점')) t = t.slice(0, -1);
  return t;
}

function bigrams(s: string): string[] { const o: string[] = []; for (let i = 0; i < s.length - 1; i++) o.push(s.slice(i, i + 2)); return o; }

export function nameSim(a: string, b: string): number {
  const x = normName(a), y = normName(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const [s, l] = x.length <= y.length ? [x, y] : [y, x];
  if (s.length >= 2 && l.includes(s)) return 0.85;
  const A = bigrams(x), B = bigrams(y);
  if (!A.length || !B.length) return 0;
  const pool = [...B]; let hit = 0;
  for (const g of A) { const i = pool.indexOf(g); if (i >= 0) { hit++; pool.splice(i, 1); } }
  return (2 * hit) / (A.length + B.length);
}

function meters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (lat2 - lat1) * toR, dLng = (lng2 - lng1) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 이름이 충분히 비슷하고(0.6 이상) 100m 안인 가게 가운데 가장 잘 맞는 하나. 없으면 null */
export function matchStore(name: string, lat: number, lng: number, stores: Store[]): Store | null {
  let best: Store | null = null, bestScore = -1;
  for (const s of stores) {
    const d = meters(lat, lng, s.lat, s.lng);
    if (d > 100) continue;
    const sim = nameSim(name, s.name);
    if (sim < 0.6) continue;
    const score = sim - d / 1000;
    if (score > bestScore) { best = s; bestScore = score; }
  }
  return best;
}
