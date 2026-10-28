/**
 * 지금 여기 근처 관광지 (13번 '지금 여기 남기기' + 설계서 B '여기 뭐야').
 * 한국관광공사 KorService2 locationBasedList2: 좌표 반경 안의 관광지·음식점 등을 가까운 순으로.
 * 앞의 3곳은 detailCommon2 개요 첫 문장을 '한 줄'로 붙인다(AI 없음, 원문 그대로 줄이기만).
 * 좌표는 소수 셋째 자리(약 100m)로 반올림해 하루 캐시, 개요는 7일 캐시.
 */
export interface NearbyItem { id: string; name: string; kind: string; type: string; dist: number; walk: number; lat: number; lng: number; img?: string; addr?: string; line?: string }

export const TYPE_LABEL: Record<string, string> = { '12': '관광지', '14': '문화시설', '15': '축제·행사', '25': '여행코스', '28': '레포츠', '32': '숙소', '38': '쇼핑', '39': '음식점' };
/** 앱의 장소 종류로 */
export const KIND_OF: Record<string, string> = { '12': 'sight', '14': 'sight', '15': 'etc', '25': 'sight', '28': 'sight', '32': 'stay', '38': 'shop', '39': 'food' };

type Raw = { contentid?: string; contenttypeid?: string; title?: string; dist?: string | number; mapx?: string; mapy?: string; firstimage?: string; addr1?: string };

/** 관광공사 응답 → 가까운 순 목록 (여행코스는 장소가 아니라 뺀다) */
export function parseNearby(j: unknown): NearbyItem[] {
  const items = (j as { response?: { body?: { items?: { item?: Raw[] | Raw } | string } } })?.response?.body?.items;
  const list = items && typeof items === 'object' ? (Array.isArray(items.item) ? items.item : items.item ? [items.item] : []) : [];
  return list
    .filter((x) => x.contentid && x.title && x.contenttypeid !== '25')
    .map((x) => {
      const dist = Math.round(Number(x.dist) || 0);
      return {
        id: String(x.contentid), name: String(x.title).replace(/\s*\[.*?\]\s*$/, '').trim(), type: TYPE_LABEL[x.contenttypeid ?? ''] ?? '장소',
        kind: KIND_OF[x.contenttypeid ?? ''] ?? 'etc', dist, walk: Math.max(1, Math.round(dist / 70)),
        lat: Number(x.mapy), lng: Number(x.mapx), img: x.firstimage?.startsWith('http') ? x.firstimage.replace(/^http:/, 'https:') : undefined, addr: x.addr1 || undefined,
      };
    })
    .sort((a, b) => a.dist - b.dist);
}

/** 개요 → 한 줄: 태그를 걷어내고 첫 문장, 70자 안 */
export function firstLine(overview: string | undefined): string | undefined {
  if (!overview) return undefined;
  const t = overview.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const s = (t.match(/^.+?[.다요][.!?]?(?=\s|$)/)?.[0] ?? t).trim();
  return s.length > 70 ? `${s.slice(0, 68).trim()}…` : s || undefined;
}

