import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { aiAvailable, ASK_URL } from './ask/url';

/**
 * 해외 함께 찾기 (설계서 A3): 도시를 열 때 뒷단 /find가 위키보이지(CC BY-SA) 목록을 받아 온다.
 * 미리 만들어 둔 자료가 아니라 그때 받은 것(뒷단 하루 캐시 + 앱 안 기억). 뒷단이 없거나 실패하면 null → 화면은 숨김.
 */
export type FindKind = 'see' | 'do' | 'eat' | 'buy';
export interface FindItem { name: string; lat?: number; lng?: number; line?: string; area?: string; kind: FindKind; url?: string }
export const FIND_LABEL: Record<FindKind, string> = { see: '볼 것', do: '할 것', eat: '먹을 것', buy: '살 것' };
export const FIND_SOURCE = '위키보이지(Wikivoyage) · CC BY-SA';

const mem = new Map<string, Promise<FindItem[] | null>>();
export function fetchFind(user: User | null, city: string, kind: FindKind): Promise<FindItem[] | null> {
  if (!aiAvailable() || !user || !city) return Promise.resolve(null);
  const k = `${city}|${kind}`;
  let p = mem.get(k);
  if (!p) {
    p = (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch(`${ASK_URL}/find?city=${encodeURIComponent(city)}&kind=${kind}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(25000) });
        if (!r.ok) return null;
        return ((await r.json()) as { items: FindItem[] }).items ?? [];
      } catch { return null; }
    })();
    p.then((v) => { if (v == null) mem.delete(k); });
    mem.set(k, p);
  }
  return p;
}

/** 한 종류를 받아 온다: undefined = 받는 중, null = 못 받음 */
export function useFind(user: User | null, city: string | null | undefined, kind: FindKind | null): FindItem[] | null | undefined {
  const [s, setS] = useState<{ k: string; v: FindItem[] | null } | null>(null);
  const k = city && kind ? `${city}|${kind}` : '';
  useEffect(() => {
    if (!k || !city || !kind) return;
    let live = true;
    void fetchFind(user, city, kind).then((v) => live && setS({ k, v }));
    return () => { live = false; };
  }, [k, user, city, kind]);
  if (!k) return null;
  return s?.k === k ? s.v : undefined;
}
