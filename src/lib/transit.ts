import { useEffect, useState } from 'react';

/**
 * 갈아타지 않고 한 번에 가는 기차·고속버스·시외버스 (국토교통부 공공데이터를 매달 다시 확인해 줄인 자료: scripts/bus-collect.ts → routes-build.ts).
 * 앱이 처음 열릴 때 무겁지 않게 필요할 때만 불러온다. 시간·편수는 '○월 기준', 예매·시간표는 각 예매 사이트에서.
 */
export type Svc = 'S' | 'E' | 'T';
export interface RoutesData { updated: string; s: ([string, string, Svc] | [string, string, Svc, number, number])[]; r: [Svc, number, number, number, number, number, number, 0 | 1, number[]?, (number[] | null)?, (number[] | null)?][] }
export interface Way { svc: Svc; ktx: boolean; from: string; to: string; n: number; min: number; inferred: boolean }

let cache: Promise<RoutesData | null> | null = null;
export const loadRoutes = () => (cache ??= import('../data/routes.json').then((m) => m.default as unknown as RoutesData, () => null));
export function useRoutes(): RoutesData | null | undefined {
  const [d, setD] = useState<RoutesData | null | undefined>(undefined);
  useEffect(() => { let live = true; void loadRoutes().then((x) => live && setD(x)); return () => { live = false; }; }, []);
  return d;
}

/** 한 노선을 보여 줄 모양으로: 열차는 KTX가 있으면 KTX 편수·시간으로 */
function toWay(d: RoutesData, x: RoutesData['r'][number]): Way {
  const [svc, a, b, n, min, kn, kmin, inf] = x;
  const ktx = svc === 'T' && kn > 0;
  return { svc, ktx, from: d.s[a][0], to: d.s[b][0], n: ktx ? kn : n, min: ktx && kmin > 0 ? kmin : min, inferred: inf === 1 };
}

/** 두 시·군 사이 한 번에 가는 길: 서비스마다 가장 빠른 하나 (기차 → 고속 → 시외 순) */
export function directWays(d: RoutesData, fromCode: string, toCode: string): Way[] {
  const best = new Map<Svc, Way>();
  for (const x of d.r) {
    if (d.s[x[1]][1] !== fromCode || d.s[x[2]][1] !== toCode) continue;
    const w = toWay(d, x);
    const cur = best.get(w.svc);
    if (!cur || (w.ktx && !cur.ktx) || (w.ktx === cur.ktx && w.min < cur.min)) best.set(w.svc, w);
  }
  return (['T', 'E', 'S'] as const).map((s) => best.get(s)).filter((w): w is Way => !!w);
}

/** 우리 시·군에서 한 번에 가는 시·군 전부 (가장 빠른 길 하나씩) — 여행지 고르기 '한 번에 가는 곳' */
export function directFrom(d: RoutesData, fromCode: string): Map<string, Way> {
  const out = new Map<string, Way>();
  for (const x of d.r) {
    if (d.s[x[1]][1] !== fromCode) continue;
    const to = d.s[x[2]][1];
    const w = toWay(d, x);
    const cur = out.get(to);
    if (!cur || w.min < cur.min) out.set(to, w);
  }
  return out;
}

export const SVC_LABEL: Record<Svc, string> = { T: '기차', E: '고속버스', S: '시외버스' };
export const wayName = (w: Way) => (w.ktx ? 'KTX' : SVC_LABEL[w.svc]);

/** '약 2시간 10분' (10분 단위로 둥글게, 1시간 안은 '약 50분') */
export function aboutTime(min: number): string {
  const m = Math.max(10, Math.round(min / 10) * 10);
  const h = Math.floor(m / 60), r = m % 60;
  return `약 ${h ? `${h}시간` : ''}${h && r ? ' ' : ''}${r ? `${r}분` : ''}`;
}

/** 'KTX 행신→강릉 약 2시간 · 하루 4편' */
export const wayLine = (w: Way) => `${wayName(w)} ${w.from}→${w.to} ${aboutTime(w.min)} · 하루 ${w.n}편`;

/** 예매·시간표 (회사마다 하나) */
export const BOOK: Record<Svc, { name: string; url: string }> = {
  T: { name: '코레일', url: 'https://www.letskorail.com/' },
  E: { name: '고속버스 예매', url: 'https://www.kobus.co.kr/' },
  S: { name: '시외버스 예매', url: 'https://txbus.t-money.co.kr/' },
};

/** '2026-11' → '11월 기준' */
export const basisLabel = (d: RoutesData) => (d.updated ? `${+d.updated.slice(5, 7)}월 기준` : '');
