import type { TransitPlan } from './transitStop';
import { clock } from './transitStop';
import { SVC_LABEL, type Svc } from './transit';
import { REGION_BY_CODE } from './geo';
import type { WayPick } from './types';
import { withRo } from './ko';

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
  if (w.kind === 'direct') return `${withRo(first ? legName(first.svc, first.ktx) : '대중교통')} 바로`;
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

const mins = (t: string) => { const m = /^(\d{1,2}):(\d{2})/.exec(t); return m ? +m[1] * 60 + +m[2] : null; };
const AUTO = /들르기$|하룻밤$/;
export interface Clash { at: string; place: string; names: string[] }
/**
 * 고른 대중교통 시각과 맞지 않는 일정: 가는 길이 닿기 전(첫날부터, 1박이면 다음 날까지), 돌아오는 길이 떠난 뒤(마지막 날).
 * 체크한(다녀온) 일정·시각이 없는 일정·가는 길이 넣은 '들르기·하룻밤' 줄은 보지 않는다. 자동차는 언제든 되니 비워 둔다.
 */
export function wayClash(way: { go?: WayPick | null; back?: WayPick | null } | undefined, days: string[], items: { name: string; day?: string | null; time?: string | null; done?: boolean }[]): { go?: Clash; back?: Clash } {
  const out: { go?: Clash; back?: Clash } = {};
  if (!days.length) return out;
  const timed = items
    .filter((p) => !p.done && p.day && p.time && !AUTO.test(p.name) && days.includes(p.day))
    .map((p) => ({ name: p.name, at: days.indexOf(p.day!) * 1440 + mins(p.time!)! }))
    .filter((p) => !Number.isNaN(p.at))
    .sort((a, b) => a.at - b.at);
  const go = way?.go?.mode === 'transit' ? way.go.legs?.[way.go.legs.length - 1] : null;
  if (go) {
    const names = timed.filter((p) => p.at < go.arr).map((p) => p.name);
    if (names.length) out.go = { at: clock(go.arr), place: go.to, names };
  }
  const back = way?.back?.mode === 'transit' ? way.back.legs?.[0] : null;
  if (back) {
    const start = (days.length - 1) * 1440 + back.dep;
    const names = timed.filter((p) => p.at > start).map((p) => p.name);
    if (names.length) out.back = { at: clock(back.dep), place: back.from, names };
  }
  return out;
}
