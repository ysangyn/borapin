import type { PlaceRec } from './types';
import { dongAt, type DongData } from './dong';

/**
 * 동네: 주소에서 구·군(그리고 동·읍·면)을 읽는다. 따로 고르지 않아도 '서울 성동구 성수동2가 …' → { gu: '성동구', dong: '성수동' }.
 * 큰 도시(서울·부산…)는 구로, 시·군은 동·읍·면으로 나눈다. 시험: tests/unit/area.test.ts
 */
export interface Area { gu: string | null; dong: string | null }
const SIDO = /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(특별시|광역시|특별자치시|특별자치도|도)?\s*/;
export function areaOf(address: string | undefined | null): Area {
  if (!address) return { gu: null, dong: null };
  let a = address.replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim().replace(SIDO, '');
  // 시 이름은 건너뛴다 (고양시 일산동구 → 일산동구)
  a = a.replace(/^[가-힣]{1,6}시\s+/, '');
  const gu = a.match(/^([가-힣]{1,6}(구|군))(?=\s|$)/)?.[1] ?? null;
  const rest = gu ? a.slice(gu.length).trim() : a;
  const d = rest.match(/^([가-힣]{1,8}?(동|읍|면|가|리))(?=\s|\d|$)/)?.[1] ?? null;
  // '성수동2가' → 성수동, '일산동' 그대로
  const dong = d ? d.replace(/\d+가$/, '').replace(/(동|읍|면)\d+$/, '$1') : null;
  return { gu, dong: dong && dong.length >= 2 ? dong : null };
}
type AreaRec = Pick<PlaceRec, 'address'> & { lat?: number | null; lng?: number | null };
/** 칩에 쓸 동네 이름: 구가 있으면 구, 아니면 동·읍·면. 가게 자리(좌표)와 동네 경계가 있으면 그게 먼저 (도로명 주소엔 구·동이 없을 때가 많다) */
export const areaLabel = (r: AreaRec, dong?: DongData | null): string | null => {
  const at = r.lat != null && r.lng != null ? dongAt(dong, r.lng, r.lat) : null;
  if (at) return at.gu ?? at.dong;
  const a = areaOf(r.address);
  return a.gu ?? a.dong;
};
/** 동·읍·면만 (구 안에서 더 나눌 때) */
export const dongLabel = (r: AreaRec, dong?: DongData | null): string | null => {
  const at = r.lat != null && r.lng != null ? dongAt(dong, r.lng, r.lat) : null;
  return at ? at.dong : areaOf(r.address).dong;
};
/** 지역 안의 동네 묶음 (많은 순). 구로 나눠 한 묶음뿐이면 동으로 한 번 더 (가게가 다 한 구에 있을 때) */
export function areasOf(recs: AreaRec[], dong?: DongData | null): { name: string; n: number; level: 'gu' | 'dong' }[] {
  const gu = groupBy(recs, (r) => areaLabel(r, dong));
  if (gu.length >= 2) return gu.map((a) => ({ ...a, level: 'gu' as const }));
  return groupBy(recs, (r) => dongLabel(r, dong)).map((a) => ({ ...a, level: 'dong' as const }));
}
function groupBy(recs: AreaRec[], key: (r: AreaRec) => string | null): { name: string; n: number }[] {
  const m = new Map<string, number>();
  for (const r of recs) { const k = key(r); if (k) m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m.entries()].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'ko'));
}

/** 주소 글에서 지역(시·군, 광역시는 그 시) 찾기: '경남 통영시 항남동' → 통영시 · '서울 성동구 …' → 서울 */
export function regionFromAddress(address: string, search: (q: string, n: number) => { place: import('./types').Place; label: string; score: number }[]): import('./types').Place | null {
  const a = address.replace(/\(.*?\)/g, ' ').trim();
  const big = a.match(/^(서울|부산|대구|인천|광주|대전|울산|세종)/)?.[1];
  const sigungu = a.replace(SIDO, '').match(/^([가-힣]{1,6}(시|군))(?=\s|$)/)?.[1];
  const q = big ?? sigungu;
  if (!q) return null;
  const hit = search(q, 3).find((h) => h.place.t === 'kr');
  return hit ? hit.place : null;
}
