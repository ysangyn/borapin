/** 피드를 마지막으로 본 시각 (이 기기에만 남는다). 아래 메뉴 '피드'에 새 소식 점을 찍는 데 쓴다. */
const KEY = 'borapin:feed-seen';
const listeners = new Set<() => void>();

export function feedSeenAt(): number {
  try {
    return Number(localStorage.getItem(KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}
export function markFeedSeen(at: number) {
  try {
    if (at > feedSeenAt()) localStorage.setItem(KEY, String(at));
  } catch { /* 저장 못 해도 그만 */ }
  listeners.forEach((f) => f());
}
export function onFeedSeen(f: () => void) {
  listeners.add(f);
  return () => { listeners.delete(f); };
}
