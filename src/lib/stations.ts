import type { User } from 'firebase/auth';
import { ASK_URL, aiAvailable } from './ask/url';

/** 국내 역 [이름, 위도, 경도] (뒷단 /stations, 오픈스트리트맵). 이 폰에 30일 둔다 */
export type Station = [string, number, number];
const KEY = 'borapin.stations.v1';
const DAY = 86400000;
let memo: Promise<Station[]> | null = null;

export function loadStations(user: User | null): Promise<Station[]> {
  if (memo) return memo;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const j = JSON.parse(raw) as { at: number; list: Station[] };
      if (Date.now() - j.at < 30 * DAY && Array.isArray(j.list) && j.list.length > 100) return (memo = Promise.resolve(j.list));
    }
  } catch { /* 저장소를 못 쓰면 매번 받는다 */ }
  if (!user || !aiAvailable()) return Promise.resolve([]);
  memo = (async () => {
    try {
      const token = await user.getIdToken();
      const r = await fetch(`${ASK_URL}/stations`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as { stations?: Station[] };
      const list = (j.stations ?? []).filter((s) => Array.isArray(s) && typeof s[0] === 'string' && Number.isFinite(s[1]) && Number.isFinite(s[2]));
      try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), list })); } catch { /* 넘쳐도 이번엔 쓴다 */ }
      return list;
    } catch { memo = null; return []; }
  })();
  return memo;
}
