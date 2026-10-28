import type { Note } from './types';

/**
 * 타임캡슐 '1년 뒤 우리에게' (설계서 C6): 글에 열리는 날을 붙여 두면 그날 전엔 봉투로만 보이고,
 * 그날이 되면 홈에 봉투가 온다. 열어 본 것은 이 폰에만 기억한다(글은 고칠 수 없게 둔 규칙을 그대로 지키려고).
 */
const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 1년 뒤 같은 날 (2월 29일은 2월 28일로) */
export function yearLater(d = new Date()): string {
  const y = d.getFullYear() + 1, m = d.getMonth(), day = d.getDate();
  const last = new Date(y, m + 1, 0).getDate();
  return `${y}-${pad(m + 1)}-${pad(Math.min(day, last))}`;
}
export const isSealed = (n: Pick<Note, 'openAt'>, now = new Date()) => !!n.openAt && n.openAt > ymd(now);
export const openLabel = (openAt: string) => `${+openAt.slice(0, 4)}년 ${+openAt.slice(5, 7)}월 ${+openAt.slice(8, 10)}일`;

const KEY = 'borapin:capsules-opened';
export const openedHere = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]); } catch { return new Set(); } };
export const markOpened = (id: string) => { try { const s = openedHere(); s.add(id); localStorage.setItem(KEY, JSON.stringify([...s].slice(-200))); } catch { /* */ } };

/** 홈에 올 봉투: 열리는 날이 지났고 이 폰에서 아직 안 연 것 중 가장 오래 기다린 것 */
export function arrived(notes: Pick<Note, 'id' | 'openAt'>[], opened: Set<string>, now = new Date()) {
  return notes.filter((n) => n.openAt && !isSealed(n, now) && !opened.has(n.id)).sort((a, b) => a.openAt!.localeCompare(b.openAt!))[0] ?? null;
}
