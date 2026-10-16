import type { Stats } from './data';
import type { Photo, PlaceRec, Trip } from './types';
import { CONTINENTS } from './geo';

/** v20 도전 뱃지를 보라핀 기록으로 다시 계산 (저장하지 않고 매번 센다) */
export interface Badge {
  id: string;
  name: string;
  desc: string;
  have: number;
  need: number;
}

const ISLANDS = ['50', '47940', '46910', '46890', '46900', '48310', '48840'];
const seasonOf = (m: number) => (m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter');

export function badges(trips: Trip[], stats: Stats, photos: Photo[], recs: PlaceRec[]): Badge[] {
  const done = trips.filter((t) => t.status === 'done');
  const others = new Set(done.flatMap((t) => t.companions.filter((c) => c !== '보라' && c !== '영상')));
  // 한 해에 네 계절을 모두 다닌 해
  const seasonsByYear = new Map<number, Set<string>>();
  for (const t of done) {
    const s = t.when.s ?? (t.when.m ? seasonOf(t.when.m) : null);
    if (!t.when.y || !s) continue;
    seasonsByYear.set(t.when.y, (seasonsByYear.get(t.when.y) ?? new Set()).add(s));
  }
  const bestSeasons = Math.max(0, ...[...seasonsByYear.values()].map((x) => x.size));
  const islands = ISLANDS.filter((c) => stats.cellVisits.has(c)).length;
  return [
    { id: 'first', name: '첫 핀', desc: '첫 기록을 남겼어요', have: Math.min(stats.tripsDone, 1), need: 1 },
    { id: 'pins10', name: '핀 10개', desc: '서로 다른 곳 10곳', have: stats.pins, need: 10 },
    { id: 'pins30', name: '핀 30개', desc: '서로 다른 곳 30곳', have: stats.pins, need: 30 },
    { id: 'cells50', name: '시·군 50', desc: '국내 시·군 50곳', have: stats.cellVisits.size, need: 50 },
    { id: 'cells100', name: '시·군 100', desc: '국내 시·군 100곳', have: stats.cellVisits.size, need: 100 },
    { id: 'cells160', name: '전국 완주', desc: '시·군 160곳을 모두 칠했어요', have: stats.cellVisits.size, need: 160 },
    { id: 'groups', name: '광역 16곳', desc: '모든 광역에 한 번씩', have: stats.groupsVisited.size, need: 16 },
    { id: 'islands', name: '섬 탐험가', desc: '제주·울릉·신안·완도·진도·거제·남해', have: islands, need: 4 },
    { id: 'abroad', name: '첫 해외', desc: '처음으로 나라 밖으로', have: Math.min(stats.countryVisits.size, 1), need: 1 },
    { id: 'countries10', name: '나라 10곳', desc: '서로 다른 나라 10곳', have: stats.countryVisits.size, need: 10 },
    { id: 'continents', name: '대륙 3곳', desc: `${CONTINENTS.length}개 대륙 중 3곳`, have: stats.continents.size, need: 3 },
    { id: 'seasons', name: '사계절 여행', desc: '한 해에 봄·여름·가을·겨울 모두', have: bestSeasons, need: 4 },
    { id: 'family', name: '함께라서', desc: '보라·영상 말고 다른 사람과도', have: Math.min(others.size, 1), need: 1 },
    { id: 'photos100', name: '사진 100장', desc: '사진첩에 100장', have: photos.length, need: 100 },
    { id: 'again5', name: '또 갈래요 5곳', desc: '다시 가고 싶은 장소 5곳', have: recs.filter((r) => r.verdict === 'again').length, need: 5 },
  ];
}
