import { useCallback, useEffect, useState } from 'react';

/**
 * 한 줄 평 가리고 쓰기: 켜 두면 내가 아직 안 쓴 장소의 상대 한 줄 평이 가려진다 (서로 영향 없이 솔직하게).
 * 기기마다 두는 설정(localStorage). 내 한 줄 평을 쓰는 순간 열린다.
 */
const KEY = 'borapin:blind';
const listeners = new Set<() => void>();
export function blindOn(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function setBlind(on: boolean) {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* 저장소 없는 기기 */ }
  listeners.forEach((f) => f());
}
export function useBlind(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(blindOn);
  useEffect(() => { const f = () => setOn(blindOn()); listeners.add(f); return () => { listeners.delete(f); }; }, []);
  return [on, useCallback((v: boolean) => setBlind(v), [])];
}

/** 이 사람(who)의 한 줄 평을 지금 가려야 하는지: 가리기 켬 + 남의 것 + 내 것이 아직 비어 있음 */
export function hideReview(reviews: Record<string, string> | undefined, who: string, me: string, blind: boolean): boolean {
  if (!blind || !me || who === me) return false;
  return !(reviews?.[me] ?? '').trim();
}
