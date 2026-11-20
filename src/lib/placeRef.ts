/**
 * 같은 가게를 알아보는 번호 (카카오 가게 번호 · 네이버 장소 번호).
 * 공개 평·모임에서 '같은 가게'를 묶는 열쇠가 된다. 이름만 손으로 적은 가게는 번호가 없다.
 */
export type PlaceRef = { src: 'kakao' | 'naver'; id: string };

/** 근처 목록 항목 id: 카카오는 'k' + 번호 (worker/src/kakaoParse.ts), 관광공사 항목은 가게 번호가 아니다 */
export function refFromNearbyId(id: string): PlaceRef | null {
  const m = /^k(\d{1,40})$/.exec(id);
  return m ? { src: 'kakao', id: m[1] } : null;
}

/** 네이버 지도·플레이스 주소의 장소 번호. 줄인 주소(naver.me)는 열어 봐야 알 수 있어 null */
export function refFromNaverUrl(url: string | undefined | null): PlaceRef | null {
  if (!url) return null;
  const m = /(?:map\.naver\.com\/p\/(?:entry|search\/[^/]+)\/place|place\.naver\.com\/(?:[a-z]+))\/(\d{1,40})/.exec(url);
  return m ? { src: 'naver', id: m[1] } : null;
}

/** 묶는 열쇠: 저장된 번호가 먼저, 없으면 네이버 주소에서 */
export function placeKey(p: { ref?: PlaceRef | null; naverUrl?: string }): string | null {
  const r = p.ref ?? refFromNaverUrl(p.naverUrl);
  return r ? (r.src === 'kakao' ? 'k' : 'n') + r.id : null;
}
