import type { PlaceRec, Trip, Wish, Place } from './types';
import { samePlace } from './wishes';

/**
 * 지역 한 장: 한 지역의 가게(가고 싶어요·다녀왔어요)·여행·바람을 한데 모으는 계산 (화면: pages/RegionPage.tsx).
 * 시험: tests/unit/region.test.ts
 */
export type RegionTab = 'glance' | 'places' | 'trips';
export const isWant = (r: Pick<PlaceRec, 'status'>) => r.status === 'want';
export const isBeen = (r: Pick<PlaceRec, 'status'>) => r.status !== 'want';

export interface RegionSummary {
  recs: PlaceRec[];
  want: PlaceRec[];
  been: PlaceRec[];
  done: Trip[];
  planned: Trip[];
  wish: Wish | null;
}
export function summarize(place: Place, recs: PlaceRec[], trips: Trip[], wishes: Wish[]): RegionSummary {
  const mine = recs.filter((r) => samePlace(r.region, place));
  const here = trips.filter((t) => t.places.some((p) => samePlace(p, place)));
  const byDate = (a: Trip, b: Trip) => ((b.when.y ?? 0) * 10000 + (b.when.m ?? 0) * 100 + (b.when.d ?? 0)) - ((a.when.y ?? 0) * 10000 + (a.when.m ?? 0) * 100 + (a.when.d ?? 0));
  return {
    recs: mine,
    want: mine.filter(isWant),
    been: mine.filter(isBeen),
    done: here.filter((t) => t.status === 'done').sort(byDate),
    planned: here.filter((t) => t.status === 'planned').sort((a, b) => -byDate(a, b)),
    wish: wishes.find((w) => samePlace(w.place, place) && !w.tripId) ?? null,
  };
}

/** 머리 상태 칩: '다녀옴 3번' · '가고 싶어요' · '계획 중' */
export function statusChips(s: RegionSummary): string[] {
  const out: string[] = [];
  if (s.done.length) out.push(`다녀옴 ${s.done.length}번`);
  if (s.planned.length) out.push('계획 중');
  if (s.wish || s.want.length) out.push('♥ 가고 싶어요');
  return out;
}

/** 어느 탭을 먼저 열지: 주소(?tab=)가 이기고, 없으면 들어온 길과 상태로 */
export function defaultTab(param: string | null, s: RegionSummary): RegionTab {
  if (param === 'places' || param === 'trips' || param === 'glance') return param;
  if (!s.recs.length && !s.done.length && !s.planned.length && !s.wish) return 'glance';
  return 'glance';
}

/** 빈 상태 한 줄 (탭마다 첫 행동 하나) */
export function emptyLine(tab: RegionTab, name: string): { title: string; sub: string } {
  if (tab === 'places') return { title: `${name}의 첫 가게를 담아 볼까요?`, sub: '가 본 곳도, 가 보고 싶은 곳도 돼요. 지도 앱 공유 글을 붙여 넣으면 이름·자리가 채워져요.' };
  if (tab === 'trips') return { title: `${name} 여행은 아직 없어요`, sub: '다녀왔으면 기록을, 갈 거면 다섯 걸음 계획을 시작해요.' };
  return { title: `${name}은 아직 비어 있어요`, sub: '가게 하나, 여행 하나가 쌓이면 여기에 한눈에 보여요.' };
}
