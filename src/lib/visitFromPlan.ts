/**
 * 계획(일정 줄) → 다녀온 곳(우리 장소)으로 옮길 때 쓰는 계산.
 * 시험: tests/unit/visitFromPlan.test.ts
 */
/** 가는 길 줄(열차·버스·들르기·하룻밤)은 장소가 아니다 */
export const isWayLine = (name: string) => /→|들르기$|에서 하룻밤$/.test(name.trim());
const CAFE = /카페|커피|cafe|coffee|베이커리|빵집|로스터/i;
/** 일정 종류 → 장소 종류 (먹을 곳은 이름으로 카페를 가른다) */
export function planKindToPlace(it: { name: string; kind?: string }): string {
  if (it.kind === 'eat') return CAFE.test(it.name) ? 'cafe' : 'food';
  const m: Record<string, string> = { see: 'sight', buy: 'shop', stay: 'stay', fest: 'etc', do: 'etc' };
  return m[it.kind ?? ''] ?? (CAFE.test(it.name) ? 'cafe' : 'food');
}
/** 장소 담기 주소: 이름·종류·자리·여행·일정 줄을 채워서 */
export function visitUrl(tripId: string, it: { id: string; name: string; kind?: string; lat?: number | null; lng?: number | null }): string {
  const q = new URLSearchParams({ trip: tripId, plan: it.id, from: it.name, kind: planKindToPlace(it) });
  if (it.lat != null && it.lng != null) { q.set('lat', String(it.lat)); q.set('lng', String(it.lng)); }
  return `/places/new?${q.toString()}`;
}
