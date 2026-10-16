import { COUNTRIES, REGIONS } from './geo';
import type { Stats } from './stats';
import type { TravelInfo } from './travelinfo';
import { isGoodNow, type SeasonData } from './seasons';
import { dailyShuffle } from './wishes';
import type { Place, Wish } from './types';
import { upcomingFestivals, type FestivalData } from './festivals';

/** 여행지 뽑기 테마: 여행정보 DB의 테마·볼거리·먹거리 글자에서 찾는다 */
export const THEMES: { id: string; label: string; re: RegExp }[] = [
  { id: 'sea', label: '바다', re: /바다|해변|해수욕장|해안|포구|항구|등대|갯벌|해녀/ },
  { id: 'mountain', label: '산·숲', re: /[가-힣]산(?![가-힣]|업)|계곡|숲|국립공원|휴양림|수목원|봉우리|오름/ },
  { id: 'island', label: '섬', re: /섬|[가-힣]도(?=[ ,·)]|$)/ },
  { id: 'onsen', label: '온천', re: /온천|스파|탕$/ },
  { id: 'night', label: '야경', re: /야경|야시장|야간|타워|전망대|불빛|별/ },
  { id: 'heritage', label: '역사·전통', re: /한옥|향교|서원|사찰|[가-힣]사(?=[ ,·]|$)|궁|성곽|산성|민속|전통|고택|유적|왕릉/ },
  { id: 'cafe', label: '카페', re: /카페|커피|브런치|베이커리|빵/ },
  { id: 'market', label: '시장·먹거리', re: /시장|골목|먹자|노포/ },
];

export interface Candidate {
  place: Place;
  name: string;
  theme?: string;
  spots?: string[];
}

function cellText(info: TravelInfo, code: string) {
  const c = info.cells[code];
  if (!c) return '';
  const all = [c.main, ...c.subs];
  return all.map((e) => [e.theme, ...e.spots, ...e.foods].join(' ')).join(' ');
}

/** 뽑기 후보: 범위(국내 전체·광역·해외) + 안 가본 곳만 + 테마 */
export function candidates(opts: {
  scope: 'kr' | 'world' | string; // 광역 group id도 받음
  unvisitedOnly: boolean;
  theme: string | null;
  stats: Stats | null;
  info: TravelInfo | null;
  wishes: Wish[];
}): Candidate[] {
  const { scope, unvisitedOnly, theme, stats, info, wishes } = opts;
  const wished = new Set(wishes.map((w) => (w.place.t === 'kr' ? `kr:${w.place.code}` : `w:${w.place.id}`)));
  if (scope === 'world') {
    return COUNTRIES.filter((c) => !(unvisitedOnly && stats?.countryVisits.has(c.id)) && !wished.has(`w:${c.id}`)).map((c) => ({
      place: { t: 'country', id: c.id } as Place,
      name: c.name,
      theme: c.continent,
    }));
  }
  const re = theme ? THEMES.find((t) => t.id === theme)?.re : null;
  return REGIONS.filter((r) => {
    if (scope !== 'kr' && r.group !== scope) return false;
    if (unvisitedOnly && stats?.cellVisits.has(r.code)) return false;
    if (wished.has(`kr:${r.code}`)) return false;
    if (re && info && !re.test(cellText(info, r.code))) return false;
    return true;
  }).map((r) => {
    const m = info?.cells[r.code]?.main;
    return { place: { t: 'kr', code: r.code } as Place, name: r.name, theme: m?.theme, spots: m?.spots };
  });
}

/** 이번 달 추천 n곳: 안 가본 곳 중 이번 달이 좋은 곳을 먼저, 날마다 같은 순서 */
/** 이번 달 추천: 곧 축제가 있는 곳 → 날씨가 좋은 곳 → 나머지 (안 가본 곳, 날마다 섞어서) */
export function monthlyPicks(n: number, stats: Stats | null, info: TravelInfo | null, seasons: SeasonData | null, wishes: Wish[], festivals: FestivalData | null = null): Candidate[] {
  const all = candidates({ scope: 'kr', unvisitedOnly: true, theme: null, stats, info, wishes });
  const shuffled = dailyShuffle(all, 'picks');
  const fest = shuffled.filter((c) => c.place.t === 'kr' && upcomingFestivals(festivals, c.place.code, new Date(), 40).length > 0);
  const good = shuffled.filter((c) => !fest.includes(c) && c.place.t === 'kr' && isGoodNow(seasons?.kr[c.place.code] ?? null));
  const rest = shuffled.filter((c) => !fest.includes(c) && !good.includes(c));
  return [...fest, ...good, ...rest].slice(0, n);
}
