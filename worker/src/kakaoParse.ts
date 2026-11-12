/**
 * 카카오 로컬 카테고리 검색(음식점 FD6·카페 CE7) 응답 풀이 — 순수 함수 (앱 시험이 이것만 읽는다).
 * 카카오 정책: 결과를 저장해 다시 쓰지 않는다 → 서버는 캐시하지 않고, 앱은 사람이 고른 한 곳만 기록으로 남긴다.
 */
import type { NearbyItem } from './nearbyParse';

interface Doc { id?: string; place_name?: string; category_name?: string; category_group_code?: string; distance?: string; x?: string; y?: string; road_address_name?: string; address_name?: string }

export function parseKakaoNear(pages: unknown[]): NearbyItem[] {
  const seen = new Set<string>();
  const out: NearbyItem[] = [];
  for (const page of pages) {
    const docs = (page as { documents?: unknown } | null)?.documents;
    if (!Array.isArray(docs)) continue;
    for (const d of docs as Doc[]) {
      const lat = Number(d.y), lng = Number(d.x), dist = Number(d.distance);
      if (!d.id || !d.place_name || !Number.isFinite(lat) || !Number.isFinite(lng) || seen.has(d.id)) continue;
      seen.add(d.id);
      const cat = (d.category_name ?? '').split('>').map((s) => s.trim()).filter(Boolean);
      out.push({
        id: `k${d.id}`, name: d.place_name.slice(0, 80),
        kind: d.category_group_code === 'CE7' ? 'cafe' : 'food',
        type: cat[cat.length - 1] ?? (d.category_group_code === 'CE7' ? '카페' : '음식점'),
        dist: Number.isFinite(dist) ? dist : 0, walk: Math.max(1, Math.round((Number.isFinite(dist) ? dist : 0) / 70)),
        lat, lng, addr: (d.road_address_name || d.address_name || undefined)?.slice(0, 200),
      });
    }
  }
  return out.sort((a, b) => a.dist - b.dist);
}
