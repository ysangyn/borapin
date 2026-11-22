import type { User } from 'firebase/auth';
import { aiAvailable, ASK_URL } from './ask/url';

/** 지금 여기 근처 관광지 (뒷단 /nearby, 관광공사 자료). 뒷단이 없거나(에뮬레이터·비밀값 없음) 실패하면 null */
export interface NearbyItem { id: string; name: string; kind: 'food' | 'cafe' | 'sight' | 'stay' | 'shop' | 'etc'; type: string; dist: number; walk: number; lat: number; lng: number; img?: string; addr?: string; line?: string }
export type NearbyResult = { items: NearbyItem[]; outside?: boolean; source?: 'kakao' | 'osm' } | null;

export async function fetchNearby(user: User | null, lat: number, lng: number): Promise<NearbyResult> {
  if (!aiAvailable() || !user) return null;
  try {
    const token = await user.getIdToken();
    const r = await fetch(`${ASK_URL}/nearby?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(12000) });
    if (!r.ok) return null;
    return (await r.json()) as NearbyResult;
  } catch { return null; }
}

/** '걸어서 3분' · '120m' */
/** 지금 여기 근처 음식점·카페 (서버 /shops: 국내는 카카오, 해외는 오픈스트리트맵). 키가 없거나 실패하면 null → 관광공사 목록으로 */
export async function fetchShops(user: User | null, lat: number, lng: number): Promise<NearbyResult> {
  if (!aiAvailable() || !user) return null;
  try {
    const token = await user.getIdToken();
    const r = await fetch(`${ASK_URL}/shops?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    return (await r.json()) as NearbyResult;
  } catch { return null; }
}

export const walkText = (it: Pick<NearbyItem, 'walk' | 'dist'>) => (it.dist < 60 ? '바로 앞' : `걸어서 ${it.walk}분`);

/** 지금 위치 (10초 안에 못 받으면 실패). 거절·실패 이유를 화면 글로 */
export function here(): Promise<{ lat: number; lng: number } | { error: string }> {
  return new Promise((res) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return res({ error: '이 기기에서는 위치를 쓸 수 없어요' });
    navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => res({ error: e.code === 1 ? '위치 사용을 허용하면 근처 장소를 찾아 드려요 (브라우저·폰 설정)' : '지금 위치를 찾지 못했어요. 밖으로 나가 다시 해 보세요' }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

/** 관광지 하나 자세히 (뒷단 /spot, 관광공사): 소개·이용 시간·쉬는 날·주소·전화. 못 받으면 null */
export interface SpotInfo { short?: string; full?: string; time?: string; rest?: string; parking?: string; addr?: string; tel?: string; img?: string; imgs?: string[] }

/** 어떤 곳·어떤 음식인지 (위키백과 요약): 이름 → 소개·사진·문서 주소 */
export interface AboutInfo { title: string; short: string; img?: string; url?: string }
export async function fetchSpot(user: User | null, name: string, lat?: number | null, lng?: number | null): Promise<SpotInfo | null> {
  if (!aiAvailable() || !user) return null;
  try {
    const token = await user.getIdToken();
    const pos = lat != null && lng != null ? `&lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}` : '';
    const r = await fetch(`${ASK_URL}/spot?name=${encodeURIComponent(name)}${pos}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(12000) });
    if (!r.ok) return null;
    return (await r.json()) as SpotInfo;
  } catch { return null; }
}

/** 여러 이름을 한 번에 '어떤 곳·어떤 음식인지' (뒷단 /about, 7일 캐시). 지역 창 하나에 한 번만 부른다 */
const aboutMemo = new Map<string, Promise<Record<string, AboutInfo>>>();
export function fetchAbout(user: User | null, names: string[], area: string): Promise<Record<string, AboutInfo>> {
  const list = [...new Set(names.map((n) => n.trim()).filter(Boolean))].slice(0, 12);
  if (!aiAvailable() || !user || !list.length) return Promise.resolve({});
  const k = `${area}|${list.join('|')}`;
  let p = aboutMemo.get(k);
  if (!p) {
    p = (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch(`${ASK_URL}/about?area=${encodeURIComponent(area)}&names=${encodeURIComponent(list.join('|'))}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
        if (!r.ok) { aboutMemo.delete(k); return {}; }
        return ((await r.json()) as { items?: Record<string, AboutInfo> }).items ?? {};
      } catch { aboutMemo.delete(k); return {}; }
    })();
    aboutMemo.set(k, p);
  }
  return p;
}

/** 카카오에서 고른 한 곳 → 상가정보의 같은 가게 (worker /match). 못 찾거나 실패하면 null */
export async function fetchStoreMatch(user: User | null, name: string, lat: number, lng: number): Promise<import('./herePick').StoreMatch | null> {
  if (!user || !aiAvailable()) return null;
  try {
    const token = await user.getIdToken();
    const r = await fetch(`${ASK_URL}/match?name=${encodeURIComponent(name.slice(0, 80))}&lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const j = (await r.json()) as { match?: import('./herePick').StoreMatch | null };
    const m = j.match;
    return m && typeof m.name === 'string' && Number.isFinite(m.lat) && Number.isFinite(m.lng) ? m : null;
  } catch { return null; }
}

export interface VideoItem { id: string; title: string; channel: string; at: string; thumb: string }
/** 유튜브 영상 몇 개 (worker /videos, 7일 캐시). 열쇠가 없거나 실패하면 null → 화면은 유튜브 검색 링크 */
export async function fetchVideos(user: User | null, name: string, area: string, kind: 'food' | 'sight'): Promise<VideoItem[] | null> {
  if (!user || !aiAvailable()) return null;
  try {
    const token = await user.getIdToken();
    const r = await fetch(`${ASK_URL}/videos?name=${encodeURIComponent(name.slice(0, 40))}&area=${encodeURIComponent(area.slice(0, 20))}&kind=${kind}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const j = (await r.json()) as { items?: VideoItem[] };
    return Array.isArray(j.items) ? j.items.filter((v) => /^[A-Za-z0-9_-]{11}$/.test(v.id) && /^https:\/\/i\.ytimg\.com\//.test(v.thumb)) : null;
  } catch { return null; }
}
