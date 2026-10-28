import type { User } from 'firebase/auth';
import { aiAvailable, ASK_URL } from './ask/url';

/** 지금 여기 근처 관광지 (뒷단 /nearby, 관광공사 자료). 뒷단이 없거나(에뮬레이터·비밀값 없음) 실패하면 null */
export interface NearbyItem { id: string; name: string; kind: 'food' | 'cafe' | 'sight' | 'stay' | 'shop' | 'etc'; type: string; dist: number; walk: number; lat: number; lng: number; img?: string; addr?: string; line?: string }
export type NearbyResult = { items: NearbyItem[]; outside?: boolean } | null;

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
export interface SpotInfo { short?: string; full?: string; time?: string; rest?: string; parking?: string; addr?: string; tel?: string; img?: string }
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
