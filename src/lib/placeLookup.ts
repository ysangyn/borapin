import { COUNTRY_BY_ID, REGION_BY_CODE } from './geo';
import { cityPos } from './cityPos';
import type { Place } from './types';
import { auth } from './firebase';
import { ASK_URL, aiAvailable } from './ask/smart';

/** 지도 링크에서 가져온 장소 정보 (뒷단 /place). 없거나 실패하면 null — 손으로 쓴 값은 그대로 둔다 */
export interface LinkInfo { name?: string; image?: string; address?: string; category?: string; lat?: number; lng?: number }

export async function lookupLink(url: string, addr = ''): Promise<LinkInfo | null> {
  const user = auth.currentUser;
  if (!aiAvailable() || !user || !/^https?:\/\//i.test(url)) return null;
  try {
    const token = await user.getIdToken();
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 9000);
    const r = await fetch(`${ASK_URL}/place?url=${encodeURIComponent(url)}&addr=${encodeURIComponent(addr)}`, { headers: { authorization: `Bearer ${token}` }, signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = (await r.json()) as LinkInfo;
    return j.name || j.image || j.lat != null || j.address ? j : null;
  } catch {
    return null;
  }
}

export { kindFromCategory, mapApps } from './placeApps';

/** 동네·주소 → 위경도 (뒷단 /geo). 실패하면 null. near를 주면 그 나라(cc)의 그 자리 둘레에서만 찾는다 (일정의 가볼 곳) */
export async function lookupGeo(q: string, near?: { cc: string; lat?: number; lng?: number }): Promise<{ lat: number; lng: number; name?: string } | null> {
  const user = auth.currentUser;
  if (!aiAvailable() || !user || !q.trim()) return null;
  try {
    const token = await user.getIdToken();
    const r = await fetch(`${ASK_URL}/geo?q=${encodeURIComponent(q.trim())}${near ? `&cc=${near.cc.toLowerCase()}${near.lat != null && near.lng != null ? `&near=${near.lat.toFixed(3)},${near.lng.toFixed(3)}` : ''}` : ''}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(9000) });
    if (!r.ok) return null;
    const j = (await r.json()) as { lat?: number; lng?: number; name?: string };
    return j.lat && j.lng ? { lat: j.lat, lng: j.lng, name: j.name } : null;
  } catch { return null; }
}

/** 여행지 둘레: 일정의 가볼 곳 자리를 찾을 때 그 나라·그 도시(시군) 둘레에서만 찾는다 */
export function geoNearOf(p: Place): { cc: string; lat?: number; lng?: number } | null {
  if (p.t === 'kr') { const r = REGION_BY_CODE.get(p.code); return r ? { cc: 'kr', lat: r.lat, lng: r.lng } : { cc: 'kr' }; }
  const c = COUNTRY_BY_ID.get(p.id);
  if (!c?.iso2) return null;
  const pos = p.city ? cityPos(`${p.id}:${p.city}`) : null;
  return pos ? { cc: c.iso2, lat: pos[0], lng: pos[1] } : { cc: c.iso2 };
}
