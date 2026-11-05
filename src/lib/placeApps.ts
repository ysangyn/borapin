import type { PlaceKind } from './types';

/** 업종 글(네이버 '카페,디저트')로 종류 짐작 */
export function kindFromCategory(c?: string): PlaceKind | null {
  if (!c) return null;
  if (/카페|커피|디저트|베이커리|빵|찻집|티룸/.test(c)) return 'cafe';
  if (/호텔|모텔|펜션|숙박|게스트하우스|리조트|민박|캠핑장|글램핑|한옥스테이/.test(c)) return 'stay';
  if (/음식|식당|한식|중식|일식|양식|분식|고기|구이|국밥|냉면|횟집|해물|치킨|피자|술집|요리|국수|칼국수|맛집|뷔페|레스토랑|주점/.test(c)) return 'food';
  if (/쇼핑|시장|백화점|아울렛|상점|가게|소품|서점|마트/.test(c)) return 'shop';
  if (/관광|명소|공원|박물관|미술관|전시|해수욕장|산|폭포|사찰|절|궁|유적|전망|수목원|테마파크|체험|섬|계곡|호수/.test(c)) return 'sight';
  return null;
}

/** 지도 앱 바로가기 (좌표가 있으면 그 자리, 없으면 이름 검색) */
export function mapApps(name: string, area: string, lat?: number | null, lng?: number | null, naverUrl?: string) {
  const q = encodeURIComponent(`${area} ${name}`.trim());
  const n = encodeURIComponent(name);
  const has = lat != null && lng != null;
  return {
    naver: naverUrl || `https://map.naver.com/p/search/${q}`,
    kakao: has ? `https://map.kakao.com/link/map/${n},${lat},${lng}` : `https://map.kakao.com/link/search/${q}`,
    google: has ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${q}`,
    route: has ? `https://map.kakao.com/link/to/${n},${lat},${lng}` : null,
  };
}

/** 우리 집 (공간에 하나). exact가 아니면 약 500m로 반올림해 둔다 */
export interface Home { label: string; code: string; lat: number; lng: number; exact: boolean }
export const roundHome = (lat: number, lng: number, exact: boolean) => (exact ? { lat: +lat.toFixed(5), lng: +lng.toFixed(5) } : { lat: Math.round(lat * 200) / 200, lng: Math.round(lng * 200) / 200 });

/** 우리 집에서 가는 길: 카카오맵(웹·앱 모두), 네이버지도(앱) */
export function routeLinks(from: { label: string; lat: number; lng: number }, to: { name: string; lat: number; lng: number }) {
  const o = `${encodeURIComponent(from.label)},${from.lat},${from.lng}`;
  const d = `${encodeURIComponent(to.name)},${to.lat},${to.lng}`;
  const nm = (mode: string) => `nmap://route/${mode}?slat=${from.lat}&slng=${from.lng}&sname=${encodeURIComponent(from.label)}&dlat=${to.lat}&dlng=${to.lng}&dname=${encodeURIComponent(to.name)}&appname=borapin.web.app`;
  return {
    kakaoTransit: `https://map.kakao.com/link/by/publictransit/${o}/${d}`,
    kakaoCar: `https://map.kakao.com/link/by/car/${o}/${d}`,
    naverTransit: nm('public'),
    naverCar: nm('car'),
  };
}

/** 두 점 사이 직선거리(km) */
export const straightKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * 지도 앱을 '앱으로' 바로 연다 (설정한 네이버·카카오).
 * - 안드로이드: intent:// 주소 하나로 앱을 열고, 앱이 없으면 크롬이 알아서 웹 주소로 (S.browser_fallback_url)
 * - 아이폰: 앱 주소(scheme)를 먼저 열고, 1.5초 안에 화면을 떠나지 않으면 웹으로 (부품이 처리)
 * - PC: 웹을 새 창으로. 네이버 공유 주소(naver.me 등)가 있으면 그 주소가 그 가게를 정확히 연다
 */
export function appOpen(app: 'naver' | 'kakao', t: { name: string; area?: string; lat?: number | null; lng?: number | null }, ua: string, naverUrl?: string): { href: string; scheme?: string; newTab: boolean } {
  const enc = encodeURIComponent;
  const q = [t.area, t.name].filter(Boolean).join(' ');
  const pos = t.lat != null && t.lng != null;
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua);
  if (app === 'naver') {
    if (naverUrl) return { href: naverUrl, newTab: !android && !ios };
    const web = `https://map.naver.com/p/search/${enc(q)}`;
    const path = pos ? `place?lat=${t.lat}&lng=${t.lng}&name=${enc(t.name)}&appname=borapin.web.app` : `search?query=${enc(q)}&appname=borapin.web.app`;
    if (android) return { href: `intent://${path}#Intent;scheme=nmap;package=com.nhn.android.nmap;S.browser_fallback_url=${enc(web)};end`, newTab: false };
    if (ios) return { href: web, scheme: `nmap://${path}`, newTab: false };
    return { href: web, newTab: true };
  }
  const web = pos ? `https://map.kakao.com/link/map/${enc(t.name)},${t.lat},${t.lng}` : `https://map.kakao.com/link/search/${enc(q)}`;
  const path = pos ? `search?q=${enc(t.name)}&p=${t.lat},${t.lng}` : `search?q=${enc(q)}`;
  if (android) return { href: `intent://${path}#Intent;scheme=kakaomap;package=net.daum.android.map;S.browser_fallback_url=${enc(web)};end`, newTab: false };
  if (ios) return { href: web, scheme: `kakaomap://${path}`, newTab: false };
  return { href: web, newTab: true };
}

/** 아이폰: 앱 주소를 열어 보고, 화면을 떠나지 않으면(앱이 없으면) 웹으로 */
export function openWithFallback(scheme: string, web: string, wait = 1500) {
  let left = false;
  const off = () => { left = true; };
  document.addEventListener('visibilitychange', off, { once: true });
  window.addEventListener('pagehide', off, { once: true });
  location.href = scheme;
  setTimeout(() => {
    document.removeEventListener('visibilitychange', off);
    window.removeEventListener('pagehide', off);
    if (!left && document.visibilityState === 'visible') location.href = web;
  }, wait);
}
