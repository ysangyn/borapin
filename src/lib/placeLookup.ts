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
