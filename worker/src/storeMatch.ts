/**
 * 소상공인시장진흥공단 상가(상권)정보로 '같은 가게' 찾기 — 순수 함수 (앱 시험이 이것만 읽는다).
 *
 * 카카오 정책: 로컬 API의 장소명·주소·좌표는 저장할 수 없다. 그래서 사용자가 카카오 목록에서 한 곳을 고르면,
 * 그 요청 안에서만 카카오 이름·위치로 상가정보를 찾아 공공데이터의 이름·주소·위치를 돌려준다.
 * 카카오 값은 캐시·로그 어디에도 남기지 않는다 (docs/kakao-devtalk-question.md).
 */
export interface Store { id: string; name: string; addr?: string; lat: number; lng: number }

const BASE = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius';

export function storeUrl(key: string, lat: number, lng: number, radius = 100): string {
  const qs = new URLSearchParams({ serviceKey: key, pageNo: '1', numOfRows: '300', radius: String(radius), cx: lng.toFixed(6), cy: lat.toFixed(6), type: 'json' });
  return `${BASE}?${qs}`;
}

interface Row { bizesId?: string; bizesNm?: string; brchNm?: string; rdnmAdr?: string; lnoAdr?: string; lon?: string; lat?: string }

export function parseStores(j: unknown): Store[] {
  const o = j as { header?: { resultCode?: string }; body?: { items?: unknown } } | null;
  if (!o || typeof o !== 'object' || o.header?.resultCode !== '00') return [];
  const items = o.body?.items;
  if (!Array.isArray(items)) return [];
  const out: Store[] = [];
  for (const r of items as Row[]) {
    const lat = Number(r.lat), lng = Number(r.lon);
    if (!r.bizesId || !r.bizesNm || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const name = [r.bizesNm.trim(), (r.brchNm ?? '').trim()].filter(Boolean).join(' ').slice(0, 80);
    const addr = (r.rdnmAdr || r.lnoAdr || '').trim().slice(0, 200) || undefined;
    out.push({ id: r.bizesId, name, ...(addr ? { addr } : {}), lat, lng });
  }
  return out;
}

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
