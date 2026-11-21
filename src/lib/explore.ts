/**
 * 지역 창 '알아보기' (아내 의견 11-21: 처음 보는 곳은 지도만으론 끌리지 않는다 → 사진·소개·사람들 이야기)
 * 순수 함수만: 볼거리 카드 묶기, 후기·영상 검색 주소
 */
export type Row = [string, number, number, string];
export interface ExploreCard { name: string; img?: string; lat?: number; lng?: number; line?: string; from: 'info' | 'tour' }

const norm = (s: string) => s.replace(/\s+/g, '').replace(/\(.*?\)/g, '');

/** 볼거리 카드: 보라핀 정보의 이름(먼저, 손으로 고른 대표) + 관광공사 사진 카드. 같은 곳은 하나로 (사진은 관광공사 것) */
export function spotCards(named: string[], tour: Row[], max = 10): ExploreCard[] {
  const out: ExploreCard[] = [];
  const used = new Set<string>();
  for (const n of named) {
    const hit = tour.find(([t]) => norm(t).includes(norm(n)) || norm(n).includes(norm(t)));
    if (hit) used.add(hit[0]);
    out.push({ name: n, from: 'info', ...(hit ? { img: hit[3] || undefined, lat: hit[1], lng: hit[2] } : {}) });
  }
  for (const [t, lat, lng, img] of tour) {
    if (used.has(t) || !img) continue;
    out.push({ name: t, img, lat, lng, from: 'tour' });
  }
  return out.slice(0, max);
}

/** 사람들 후기 (네이버 블로그 검색) · 영상 (유튜브 검색) — 열쇠 없이 검색 화면으로 */
export const reviewUrl = (area: string, name: string) => `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(`${area} ${name} 후기`.trim())}`;
export const videoUrl = (area: string, name: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${area} ${name}`.trim())}`;
/** 음식 이름으로 그 지역 맛집 찾기 */
export const foodPlaceUrl = (area: string, food: string) => `https://search.naver.com/search.naver?query=${encodeURIComponent(`${area} ${food} 맛집`)}`;
