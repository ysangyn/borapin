import type { TransitPlan } from './transitStop';
import { clock } from './transitStop';
import { SVC_LABEL, type Svc } from './transit';
import { REGION_BY_CODE } from './geo';
import type { WayPick } from './types';

/**
 * 고른 교통편(가는 길·돌아오는 길)을 여행에 저장하는 모양과 보여 주는 글.
 * 계획하기 '동선'에서 고르고, 준비 탭·홈 카드·가이드북이 그대로 읽는다.
 */
export function pickOf(p: TransitPlan, day: 'weekday' | 'sat' | 'sun'): WayPick {
  return {
    mode: 'transit', kind: p.kind, mid: p.mid ?? null, day, last: p.last ?? null,
    legs: p.legs.map((l) => ({ svc: l.svc, ktx: l.ktx, from: l.from, to: l.to, dep: l.dep, arr: l.arr })),
  };
}
export const CAR: WayPick = { mode: 'car' };

const legName = (svc: string, ktx: boolean) => (ktx ? 'KTX' : SVC_LABEL[svc as Svc] ?? '');
/** 고른 길 제목: '자동차' · 'KTX 바로 가기' · '전주 들러 가기' · '대전에서 하룻밤' */
export function pickTitle(w: WayPick): string {
  if (w.mode === 'car') return '자동차로 가요';
  const m = w.mid ? REGION_BY_CODE.get(w.mid)?.name ?? '' : '';
  const first = w.legs?.[0];
  if (w.kind === 'direct') return `${first ? legName(first.svc, first.ktx) : '대중교통'}으로 바로`;
  if (w.kind === 'fast') return `${m}에서 갈아타기`;
  if (w.kind === 'overnight') return `${m}에서 하룻밤`;
  return `${m} 들러 가기`;
}
/** 구간 한 줄: '9:11 행신 KTX → 12:29 창원중앙' */
export const legLine = (l: NonNullable<WayPick['legs']>[number]) => `${clock(l.dep)} ${l.from} ${legName(l.svc, l.ktx)} → ${clock(l.arr)} ${l.to}`;
/** 첫 구간 출발: 'KTX 9:11 행신 출발' (홈 카드) */
export function departLine(w: WayPick | null | undefined): string | null {
  const l = w?.mode === 'transit' ? w.legs?.[0] : null;
  return l ? `${legName(l.svc, l.ktx)} ${clock(l.dep)} ${l.from} 출발` : null;
}
/** 고른 길에 쓰이는 탈것 (예매 링크) */
export const pickSvcs = (w: WayPick): Svc[] => [...new Set((w.legs ?? []).map((l) => l.svc as Svc))];
