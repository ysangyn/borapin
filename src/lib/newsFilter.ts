/**
 * 여행 소식 고르기 (순수 모듈): 걸러내기 + 점수 매겨 줄 세우기.
 * - 빼기: 사건·사고·재난·정치·경제 일반·인사·부고 기사
 * - 더하기: 축제·개장·명소·특가·취항·입국 같은 '여행 준비에 쓰이는' 말, 지역 이름이 제목에 있으면, 최근일수록
 * - 30일 넘은 기사, 제목이 거의 같은 기사(여러 매체 같은 보도)는 하나만
 */
import { COUNTRY_BY_ID, REGION_BY_CODE } from './geo';
import type { Place } from './types';

export interface NewsLike { title: string; link: string; source: string; at: string }

const NOT_TRAVEL = /사고|사망|숨져|숨진|화재|실종|범죄|폭행|살인|추락|침몰|감염|확진|지진|태풍|폭우|홍수|산불|붕괴|테러|피해|구속|기소|선거|의원|후보|시위|파업|징역|검찰|경찰|부고|별세|인사\]|\[인사|주가|증시|코스피|코스닥|금리|실적|채용|부동산|아파트|분양|재판|논란|의혹|갑질|횡령|탄핵|국감|국정감사|조례|예산안/;
export const isTravelNews = (n: { title: string }) => !NOT_TRAVEL.test(n.title);

const GOOD: [RegExp, number][] = [
  [/축제|페스티벌|불꽃|개막|열린다|개최/, 3],
  [/개장|개통|새로 문|오픈|문 연|재개장|신규 취항|취항|노선|직항/, 3],
  [/특가|할인|무료|반값|프로모션|이벤트/, 2],
  [/유류할증료|항공권|운임|환율|무비자|입국|비자|여권|면세|여행경보|전자여행허가|ETA|ESTA/, 3],
  [/KTX|SRT|예매|공항|출국|숙박|쿠폰|연휴|휴가/, 2],
  [/명소|가볼 만한|가볼만한|여행 코스|드라이브 코스|산책 코스|여행지|관광|여행|나들이|단풍|벚꽃|꽃길|해돋이|야경|맛집|체험|캠핑|트레킹|둘레길|개화|절정|해수욕장|눈꽃/, 2],
  [/추천|선정|베스트|가이드/, 1],
];

export function newsScore(n: NewsLike, place = '', now = Date.now()): number {
  if (!isTravelNews(n)) return -99;
  let s = 0;
  for (const [re, w] of GOOD) if (re.test(n.title)) s += w;
  if (place && n.title.includes(place)) s += 3;
  if (s === 0) return -99; // 여행 말도, 지역 이름도 없으면 최근이어도 버린다
  const age = n.at ? (now - new Date(n.at).getTime()) / 86400000 : 15;
  if (age > 30) return -99;
  s += age <= 3 ? 2 : age <= 10 ? 1 : 0;
  return s;
}

const norm = (t: string) => t.replace(/[\s"'“”‘’·…\[\]()<>「」]/g, '').slice(0, 18);

/** 여러 검색 결과를 합쳐 점수순으로, 같은 보도는 하나만 (min 점수 미만은 버림) */
export function pickNews<T extends NewsLike>(lists: T[][], place = '', n = 5, now = Date.now(), min = 2): T[] {
  const seen = new Set<string>();
  const all: { it: T; s: number }[] = [];
  for (const it of lists.flat()) {
    const k = norm(it.title);
    if (seen.has(k) || seen.has(it.link)) continue;
    seen.add(k); seen.add(it.link);
    const s = newsScore(it, place, now);
    if (s >= min) all.push({ it, s });
  }
  return all.sort((a, b) => b.s - a.s || (b.it.at || '').localeCompare(a.it.at || '')).slice(0, n).map((x) => x.it);
}

/**
 * 지역 소식 찾기: 검색어 몇 개 + 제목에 꼭 있어야 할 이름.
 * - '고창군' → '고창'으로 찾고 고르기 (기사 제목은 보통 '군·시'를 뺀다)
 * - 이름이 겹치는 곳(경기 광주시·강원 고성군 등)은 '경기 광주'처럼 도 이름을 붙여 찾는다
 * - 해외는 도시(없으면 나라) 이름
 */
const SAME_NAME = new Set(['광주', '고성', '동구', '서구', '남구', '북구', '중구']);
export function newsSpec(p: Place): { label: string; match: string; queries: string[] } {
  if (p.t === 'kr') {
    const r = REGION_BY_CODE.get(p.code);
    const name = r?.name ?? p.code;
    const short = name.length >= 3 ? name.replace(/[시군구]$/, '') : name;
    const area = r?.groupName ?? '';
    const q = SAME_NAME.has(short) && area && !(p.code === '29') ? `${area} ${short}` : short;
    return { label: name, match: short, queries: [`${q} 여행 when:30d`, `${q} 축제 when:30d`, `${q} 가볼만한 곳 when:30d`] };
  }
  const name = p.city || COUNTRY_BY_ID.get(p.id)?.name || p.id;
  return { label: name, match: name, queries: [`${name} 여행 when:30d`, `${name} 항공권 when:30d`, `${name} 입국 when:60d`] };
}

/** 여행 전반: 준비에 영향을 주는 것만 주제별로 따로 찾아 합친다 (한 검색어에 몰아 넣으면 거의 안 걸린다) */
const SEASON_QUERIES: Record<number, string[]> = {
  1: ['눈꽃 여행 when:14d', '겨울 축제 when:14d'], 2: ['겨울 축제 when:14d', '봄 여행 예약 when:14d'],
  3: ['벚꽃 개화 when:14d', '봄꽃 축제 when:14d'], 4: ['벚꽃 개화 when:14d', '봄꽃 축제 when:14d'],
  5: ['봄 축제 when:14d', '여름휴가 예약 when:14d'], 6: ['해수욕장 개장 when:14d', '여름휴가 항공권 when:14d'],
  7: ['해수욕장 when:7d 여행', '여름휴가 when:7d 여행'], 8: ['해수욕장 when:7d 여행', '가을 여행 when:14d'],
  9: ['추석 연휴 여행 when:14d', '가을 축제 when:14d'], 10: ['단풍 절정 when:14d', '가을 축제 when:14d'],
  11: ['단풍 절정 when:14d', '겨울 여행 when:14d'], 12: ['해돋이 명소 when:14d', '연말 여행 when:14d'],
};
export const BASE_QUERIES = [
  '유류할증료 when:14d',
  '항공권 특가 when:14d',
  '신규 취항 노선 when:14d',
  '무비자 입국 when:30d',
  '여행경보 when:14d',
  '전자여행허가 OR 여권 여행 when:14d',
  '환율 여행 엔화 OR 달러 when:7d',
  'KTX OR SRT 예매 when:14d',
  '숙박 할인 쿠폰 when:14d',
  '공항 혼잡 OR 주차 출국 when:14d',
  '축제 개막 when:7d',
];
export const generalQueries = (month = new Date().getMonth() + 1) => [...BASE_QUERIES, ...(SEASON_QUERIES[month] ?? [])];
export const GENERAL_QUERIES = generalQueries();


/** 소식 탭 순서: 새 소식 있는 탭부터, 가장 최근 소식 순. 빈 탭은 뒤로 */
export interface NewsTab { key: string; label: string; queries: string[]; match: string }
export function orderNewsTabs<T extends NewsTab>(tabs: T[], got: Record<string, NewsLike[]>): T[] {
  const newest = (t: T) => got[t.key]?.[0]?.at ?? '';
  return tabs.map((t, i) => ({ t, i })).sort((a, b) => {
    const na = got[a.t.key]?.length ? 1 : 0, nb = got[b.t.key]?.length ? 1 : 0;
    return nb - na || newest(b.t).localeCompare(newest(a.t)) || a.i - b.i;
  }).map((x) => x.t);
}
