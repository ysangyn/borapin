/**
 * 밤 모드: 기기마다 고른다 (설정 → 화면). '자동'은 폰·컴퓨터 설정을 따른다.
 * 앱이 그려지기 전에(main.tsx) <html data-theme>을 정해 깜빡임이 없게. 바꾸면 한 번 새로 불러 지도 색까지 같이 바뀐다.
 */
export type ThemePref = 'light' | 'dark' | 'auto';
const KEY = 'borapin:theme';
export function themePref(): ThemePref {
  try { const v = localStorage.getItem(KEY); return v === 'dark' || v === 'auto' ? v : 'light'; } catch { return 'light'; }
}
export function isDark(pref: ThemePref = themePref()): boolean {
  if (pref === 'dark') return true;
  if (pref === 'auto') return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  return false;
}
export function applyTheme() {
  if (typeof document === 'undefined') return;
  const dark = isDark();
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#16122B' : '#F5F2FF');
}
export function setThemePref(p: ThemePref) {
  try { localStorage.setItem(KEY, p); } catch { /* 못 남기면 이번만 */ }
  applyTheme();
  window.location.reload();
}
/** '자동'일 때 폰 설정이 바뀌면 따라간다 */
export function watchSystemTheme() {
  if (typeof matchMedia !== 'function') return;
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (themePref() === 'auto') window.location.reload(); });
}
