/**
 * 소상공인시장진흥공단 상가(상권)정보 — 내 폰 위치 둘레의 가게 목록 (순수 함수).
 *
 * 카카오 데브톡 답변(11-23): 카카오 응답의 이름·좌표를 공공데이터 조회 조건으로 쓰면 안 된다.
 * 그래서 조회 조건은 사용자 폰 위치뿐이고, 카카오 항목과의 비교는 앱(src/lib/storeMatch.ts)이 한다.
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
