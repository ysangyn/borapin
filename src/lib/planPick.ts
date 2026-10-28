import type { FestivalData } from './festivals';
import { upcomingFestivals } from './festivals';
import type { TourData } from './trend';
import type { TravelInfo } from './travelinfo';
import type { WorldData } from './world';
import { cityFor } from './world';
import type { Place } from './types';

/**
 * 같이 찾아 담기 후보 (계획 이어가기 3걸음): 그 여행지에서 고를 거리를 한 목록으로.
 * 국내: 관광공사 관광지(사진·자리) · 보라핀 여행정보의 볼거리·먹거리·특산물 · 여행 날짜에 열리는 축제
 * 해외: 세계 도시 자료의 볼거리·먹거리 (뒷단 /find가 생기면 더해진다)
 * 같은 이름은 하나로(자리·사진이 있는 쪽을 남김). 순수 함수.
 */
export type PickKind = 'see' | 'eat' | 'buy' | 'fest';
export interface Pick { key: string; name: string; kind: PickKind; line?: string; img?: string; lat?: number; lng?: number; area?: string }

const norm = (s: string) => s.replace(/\s+/g, '').replace(/[()（）\[\]]/g, '');

export function pickables(place: Place, d: { tour: TourData | null; info: TravelInfo | null; festivals: FestivalData | null; world: WorldData | null }, window?: { start: Date; days: number } | null): Pick[] {
  const out: Pick[] = [];
  const seen = new Map<string, Pick>();
  const add = (p: Pick) => {
    const k = norm(p.name);
    const was = seen.get(k);
    if (was) { if (!was.img && p.img) was.img = p.img; if (was.lat == null && p.lat != null) { was.lat = p.lat; was.lng = p.lng; } if (!was.line && p.line) was.line = p.line; return; }
    seen.set(k, p);
    out.push(p);
  };
  if (place.t === 'kr') {
    const cell = d.info?.cells[place.code];
    // 축제: 여행 날짜와 겹치는 것만 (날짜 없으면 앞으로 60일)
    const fests = upcomingFestivals(d.festivals, place.code, window?.start ?? new Date(), window ? Math.max(1, window.days) : 60);
    for (const f of fests.slice(0, 4)) add({ key: `fest:${f.id || f.t}`, name: f.t, kind: 'fest', line: `${f.s.slice(4, 6).replace(/^0/, '')}월 ${f.s.slice(6, 8).replace(/^0/, '')}일부터` });
    for (const s of cell?.main.spots ?? []) add({ key: `see:${s}`, name: s, kind: 'see', line: cell?.main.theme });
    for (const [n, lat, lng, img] of d.tour?.cells[place.code]?.s ?? []) add({ key: `see:${n}`, name: n, kind: 'see', img: img || undefined, lat, lng });
    for (const sub of cell?.subs ?? []) for (const s of sub.spots) add({ key: `see:${s}`, name: s, kind: 'see', area: sub.name });
    for (const f of cell?.main.foods ?? []) add({ key: `eat:${f}`, name: f, kind: 'eat', line: '이 고장 먹거리' });
    for (const sub of cell?.subs ?? []) for (const f of sub.foods) add({ key: `eat:${f}`, name: f, kind: 'eat', area: sub.name });
    for (const g of cell?.main.goods ?? []) add({ key: `buy:${g}`, name: g, kind: 'buy', line: '특산물·기념품' });
  } else {
    const w = cityFor(d.world, place);
    for (const s of w?.see ?? []) add({ key: `see:${s}`, name: s, kind: 'see', line: w?.line });
    for (const f of w?.eat ?? []) add({ key: `eat:${f}`, name: f, kind: 'eat', line: '꼭 먹어 볼 것' });
  }
  return out;
}

export const PICK_LABEL: Record<PickKind, string> = { see: '볼 것', eat: '먹을 것', buy: '살 것', fest: '축제' };
