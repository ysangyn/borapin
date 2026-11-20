import type { Place } from './types';
import { SPACE_ID } from './space';
import { spaceKey } from './spaceAccess';

/**
 * 받은 지도(/m/토큰)에서 ♡한 곳: 그 페이지는 앱 밖(로그인 없이)이라 이 폰에 적어 두고,
 * 앱 홈에서 '가고 싶은 곳에 담기'로 한꺼번에 옮긴다 (로그인 전에 눌러 둔 것도 그대로 남는다).
 */
export interface PendingItem { name: string; kind: string }
export interface PendingMap { token: string; title: string; by: string; region: Place; items: PendingItem[] }
/** 공간마다 따로 (우리 공간은 예전 열쇠 그대로) */
const key = () => spaceKey('borapin:pending-wishes', SPACE_ID);
const same = (a: string, b: string) => a.trim() === b.trim();

export function togglePending(list: PendingMap[], head: Omit<PendingMap, 'items'>, item: PendingItem): PendingMap[] {
  const cur = list.find((m) => m.token === head.token);
  if (!cur) return [...list, { ...head, items: [item] }];
  const has = cur.items.some((x) => same(x.name, item.name));
  const items = has ? cur.items.filter((x) => !same(x.name, item.name)) : [...cur.items, item];
  return items.length ? list.map((m) => (m === cur ? { ...cur, items } : m)) : list.filter((m) => m !== cur);
}
export function mergePending(list: PendingMap[], head: Omit<PendingMap, 'items'>, items: PendingItem[]): PendingMap[] {
  const cur = list.find((m) => m.token === head.token);
  const base = cur?.items ?? [];
  const add = items.filter((it, i) => !base.some((x) => same(x.name, it.name)) && items.findIndex((y) => same(y.name, it.name)) === i);
  const next = { ...head, items: [...base, ...add] };
  return cur ? list.map((m) => (m === cur ? next : m)) : [...list, next];
}
export const pendingCount = (list: PendingMap[]) => list.reduce((a, m) => a + m.items.length, 0);

export function loadPending(): PendingMap[] {
  try { const v = JSON.parse(localStorage.getItem(key()) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
export function savePending(list: PendingMap[]) {
  try { if (list.length) localStorage.setItem(key(), JSON.stringify(list)); else localStorage.removeItem(key()); } catch { /* 저장 못 하면 이번 화면에서만 */ }
  try { window.dispatchEvent(new Event('borapin:pending')); } catch { /* */ }
}
