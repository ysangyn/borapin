/**
 * 찾아보기: 비용·횟수 제한 없는 규칙형 답변기. 모든 처리는 기기 안에서 끝난다.
 * - 질문 틀(의도) + 빈칸(지역·달·테마·누구와·때)을 채워 답한다.
 * - 우리 기록은 저장된 것을 세어 답하고, 자료에 없는 것은 지어내지 않고 검색 링크를 준다.
 * - 직전 지역을 기억해 "거기 맛집은?"을 이어받고, 애매하면 후보를 버튼으로 묻는다.
 */
import { computeStats, TOTAL_CELLS, TOTAL_GROUPS } from '../stats';
import { formatWhen, SEASON_LABEL } from '../dates';
import { COUNTRY_BY_ID, GROUPS, placeLabel, placeLong, placeParam, REGION_BY_CODE } from '../geo';
import { candidates, THEMES } from '../recommend';
import topicsData from '../../data/topics.json';
import faqData from '../../data/faq.json';
import { regionLong } from '../geo';
import { josaOnly, withJosa, withRo } from '../ko';
import { accessLine } from '../transport';
import { straightKm } from '../placeApps';
import { abroadNow, alarmFor, fxFor, loadAbroad, visaFor, type Abroad } from '../abroad';
import { wearLine, type CityClimate } from '../wear';
import { monthsLabel, seasonFor, type SeasonData } from '../seasons';
import type { TravelInfo } from '../travelinfo';
import { cityFor, cityPlace, COST_LABEL, countryName, flyLabel, pickCities, tzLabel, WALK_LABEL, type WorldCity, type WorldData } from '../world';
import type { Note, Photo, PlanItem, Place, PlaceRec, Season, Trip, Wish } from '../types';
import { festivalPeriod, isOngoing, upcomingFestivals, type FestivalData } from '../festivals';
import { dday } from '../dates';
import { packFromTemplate } from '../packing';
import { dailyShuffle, samePlace } from '../wishes';
import { findMentions, type Mention } from './gazetteer';
import { josa } from 'es-hangul';
import { times } from '../ko';
import { isMemberName, memberNames } from '../members';
import { loadTour, loadTrend, rankTrend, tourNow, trendAt, trendNow, trendSummary, type TourData, type TrendData, type TrendTopicKind } from '../trend';

// 외교부 자료는 번들 밖(/data/abroad.json): 물어보기 화면이 열리면(엔진이 실려 오면) 미리 받아 두어 첫 답부터 붙게. 시험(브라우저 밖)에선 받지 않는다
// 요즘 자료(뜨는 곳·한적한 곳·붐빔)와 관광지(무장애 수)도 같이 받아 둔다 (둘 다 번들 조각이라 설치 뒤엔 네트워크 없이 온다)
if (typeof window !== 'undefined') { void loadAbroad(); void loadTrend(); void loadTour(); }

/** 이름 뒤 조사: '강릉시는', '부산을' */
const jo = (w: string | null | undefined, pair: Parameters<typeof josa>[1]) => (w ? josa(w, pair) : '');

export type Intent =
  | 'overview' | 'spots' | 'foods' | 'goods' | 'transport' | 'season'
  | 'count' | 'when' | 'time' | 'people' | 'again' | 'compare'
  | 'recommend' | 'stats' | 'pattern' | 'faq' | 'wishAdd' | 'wishList' | 'map' | 'choose'
  | 'weather' | 'plan' | 'money' | 'distance' | 'media'
  | 'festival' | 'next' | 'packing' | 'find' | 'hello' | 'help' | 'ai' | 'unknown';

export interface Btn {
  label: string;
  /** 이 질문을 다시 묻기 */
  ask?: string;
  /** 앱 안 화면으로 */
  to?: string;
  /** 바깥 링크 (네이버·구글 검색) */
  url?: string;
  /** 가고 싶은 곳에 담기 */
  wish?: Place;
  /** 애매한 지명: 이 장소로 같은 질문 다시 */
  choose?: Place;
}

/** 추천처럼 '곳' 목록으로 답할 때: 한 줄 = 이름·설명 + 누르면 자세히 + 오른쪽 하트(담기) */
export interface AnswerItem { title: string; sub?: string; open?: Btn; wish?: Place }
export interface Answer {
  intent: Intent;
  text: string;
  lines?: string[];
  items?: AnswerItem[];
  buttons: Btn[];
  source?: string;
  /** 되묻기에서 받은 우리 집 (화면이 저장한다) */
  setHome?: Place;
  /** 되묻기: 이 정보가 있어야 답할 수 있다 */
  pending?: { need: 'home'; q: string };
  /** 추천 질문에서 알아듣지 못하고 버린 낱말 (있으면 규칙형이 자신 없음 → AI) */
  unused?: string[];
  ctx: AskCtx;
}

export interface AskCtx {
  place?: Place | null;
  intent?: Intent;
  /** 되묻는 중: 무엇이 필요하고, 받으면 어떤 질문을 다시 풀지 */
  pending?: { need: 'home'; q: string } | null;
  /** 직전 추천 질문 ('우리 집 근처로'처럼 조건만 덧붙일 때 이어 쓴다) */
  lastQ?: string | null;
}

export interface AskData {
  trips: Trip[];
  wishes: Wish[];
  recs: PlaceRec[];
  info: TravelInfo;
  seasons: SeasonData | null;
  /** 지역 축제 (관광공사) — 없으면 축제 질문에 '자료 없음' */
  festivals?: FestivalData | null;
  /** 여행에 남긴 글 — '커피 마신 날' 같은 찾기에 쓴다 */
  notes?: Note[];
  /** 사진 정보(파일 아님): 몇 장·언제 찍었는지·설명 */
  photos?: Photo[];
  /** 일정 줄: 가볼 곳·날짜·시간·예약 정보 */
  plans?: PlanItem[];
  /** 해외 도시 기본 정보 (world.json) */
  world?: WorldData | null;
  /** 우리 집 (공간에 정해 둔 곳) — '우리 집 근처' 질문에 */
  home?: { lat: number; lng: number; code: string; label?: string } | null;
  /** 요즘 자료(뜨는 곳·한적한 곳·붐빔). 안 주면 엔진이 받아 둔 것(trendNow)을 쓴다. null이면 '자료 없음' */
  trend?: TrendData | null;
  /** 관광지 자료(무장애 수). 안 주면 받아 둔 것(tourNow) */
  tour?: TourData | null;
  /** 도시 평년 기후(wear.json cities) — 날씨·옷차림 질문에. 없으면 '가기 좋은 때'만 */
  wear?: Record<string, CityClimate> | null;
  /** 외교부·수출입은행 자료 — 환율 질문에. 없으면 받아 둔 것(abroadNow) */
  abroad?: Abroad | null;
  now?: Date;
}
export const trendOf = (d: AskData) => (d.trend !== undefined ? d.trend : trendNow());
export const tourOf = (d: AskData) => (d.tour !== undefined ? d.tour : tourNow());

const has = (q: string, re: RegExp) => re.test(q);
const search = (q: string) => [
  { label: '네이버 검색', url: `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}` },
  { label: '구글 검색', url: `https://www.google.com/search?q=${encodeURIComponent(q)}` },
];

// ---------- 빈칸 읽기 ----------
function readMonth(q: string): number | null {
  const m = q.match(/(\d{1,2})\s*월/);
  if (m && +m[1] >= 1 && +m[1] <= 12) return +m[1];
  if (/이번\s*달|이달/.test(q)) return new Date().getMonth() + 1;
  if (/다음\s*달/.test(q)) return (new Date().getMonth() + 1) % 12 + 1;
  return null;
}
function readSeason(q: string): Season | null {
  if (/봄/.test(q)) return 'spring';
  if (/여름/.test(q)) return 'summer';
  if (/가을/.test(q)) return 'autumn';
  if (/겨울/.test(q)) return 'winter';
  return null;
}
function readYear(q: string, now: Date): number | null {
  const y = q.match(/(19|20)\d{2}/);
  if (y) return +y[0];
  if (/재작년/.test(q)) return now.getFullYear() - 2;
  if (/작년|지난\s*해/.test(q)) return now.getFullYear() - 1;
  if (/올해|올\s*해|이번\s*해/.test(q)) return now.getFullYear();
  const ago = q.match(/(\d+)\s*년\s*전/);
  if (ago) return now.getFullYear() - +ago[1];
  return null;
}
function readThemes(q: string) {
  const pos: string[] = [], neg: string[] = [];
  for (const t of THEMES) {
    const words = t.label.split('·');
    for (const w of words) {
      if (new RegExp(`${w}\\s*(말고|빼고|싫)`).test(q)) neg.push(t.id);
      else if (q.includes(w)) pos.push(t.id);
    }
  }
  // 비 오는 날·장마는 실내로
  if (/비\s*(오|와|올)|비오는|장마|실내/.test(q) && !/비\s*(안|없)/.test(q)) pos.push('indoor');
  return { pos: [...new Set(pos)].filter((x) => !neg.includes(x)), neg: [...new Set(neg)] };
}
const PEOPLE = /(엄마|아빠|부모님|어머니|아버지|동생|친구|가족|언니|오빠|누나|형|장모님|장인|시어머니|시아버지|조카|아이|애들)/;
/** 질문에 든 우리 공간 사람 이름 (보라가·영상이) */
function memberNamesIn(q: string): string | null { for (const n of memberNames()) if (n.length >= 2 && q.includes(n)) return n; return null; }
function readPerson(q: string, trips: Trip[]): string | null {
  const names = new Set(trips.flatMap((t) => t.companions).filter((c) => !isMemberName(c)));
  for (const n of names) if (n.length >= 2 && q.includes(n)) return n;
  const m = q.match(PEOPLE);
  return m ? m[1] : null;
}

function intentOf(q: string, places: Place[], hasPerson: boolean, hasTime: boolean, hasGroup = false): Intent {
  if (has(q, /^(안녕|하이|헬로|반가워|고마워|고맙|감사|잘\s*자|수고|사랑해|보라야|ㅎㅇ|ㅇㅋ)/) && q.length <= 12) return 'hello';
  if (/^[ㅋㅠㅜ!~.\s]{3,}$/.test(q) || /^(ㄱㅅ|ㅇㅇ|넵|응|네|웅|오케이|ok|좋아|굿)$/i.test(q.trim())) return 'hello';
  // 코스·일정을 짜 달라면 계획하기(다섯 걸음)로 — 챗봇이 일정을 지어내지 않는다
  if (places.length && has(q, /(코스|일정|루트|동선)\s*(짜|추천|만들|어떻게|좀)|\d\s*박\s*\d\s*일|당일치기\s*(코스|일정)/)) return 'plan';
  // 두 곳 사이 거리·시간
  if (places.length >= 2 && has(q, /얼마나\s*걸|몇\s*시간|몇\s*분|거리|멀어|가까워|떨어져/)) return 'distance';
  // 사진·글 몇 개
  if (has(q, /사진\s*(몇|얼마나|많이)|글\s*(뭐|몇|썼|남긴|적은)|메모\s*(뭐|몇)/) && !places.length) return 'media';
  // 환율·돈
  if (has(q, /환율|[가-힣]*화\s*(환율|얼마)|(돈|화폐|통화)\s*(얼마|뭐|단위)|\d+\s*(엔|달러|유로|바트|위안|동|페소)\s*(이|가)?\s*(얼마|몇)/)) return 'money';
  // 날씨·옷차림 (예보는 못 보지만 평년 기후로)
  if (places.length && has(q, /날씨|기온|춥|추워|추운|더워|더운|덥|옷차림|뭐\s*입|우산|비\s*(와|오|많)|눈\s*(와|오)|습하|건조/)) return 'weather';
  if (has(q, /도움말|뭐\s*(물어|할\s*수)|어떻게\s*(써|사용)|사용법|뭘\s*할\s*수/)) return 'help';
  if (faqFor(q, places.length > 0)) return 'faq';
  if (has(q, /패턴|성향|스타일|취향|여행\s*습관|어떤\s*여행(을|자|가)|우리\s*(여행|부부|둘).*어때/)) return 'pattern';
  if (has(q, /축제|페스티벌|불꽃|행사/)) return 'festival';
  if (has(q, /준비물|뭐\s*챙|챙길|챙겨|짐\s*(싸|쌀)|가져갈/)) return 'packing';
  if ((topicOf(q) || trendTopicOf(q) || STAR_Q.test(q)) && !places.length && !hasTime && !has(q, /(간|갔|다녀온|다녀왔)\s*(곳|데|적)/)) return 'recommend';
  if (has(q, /다음\s*여행|예정(된|인)?\s*(여행|거)|언제\s*(떠나|출발)|디데이|d-?day/i)) return 'next';
  if (has(q, /어디였지|어디였더라|뭐였지|이름이\s*뭐|기억\s*안|찾아\s*줘|검색/) || has(q, /(마신|먹은|갔던|봤던|했던)\s*(날|곳|데)$/)) return 'find';
  // '오션뷰 카페 어디 갔었지' · '루프탑 술집 어디 갔더라': 종류 말 + 갔었지/갔더라 (지명 없이)
  if (!places.length && has(q, /(카페|커피|맛집|식당|밥집|술집|빵집|숙소|호텔)/) && has(q, /(어디|뭐)\s*(갔었|갔더|갔었지|갔지|였지|였더라)|갔던\s*(데|곳)/)) return 'find';
  // 우리 기록에서 조건으로 찾기: '우리가 간 카페 중에 바다 보이는 데', '성수동 카페 어디 갔었지'
  if (has(q, /우리(가|들이)?\s*(간|갔|다녀온|남긴|갔던)\s*.*(중에|중\s|가운데|어디|뭐)/) || (!places.length && has(q, /[가-힣]{1,4}(동|읍|면|리|가)\s*(카페|맛집|식당|어디|갔)/) && has(q, /갔|어디|있/))) return 'find';
  if (places.length && has(q, /가고\s*싶은\s*곳/) && has(q, /적어|적은|메모|뭐\s*(있|적|담)|보여|담은|담았/)) return 'wishList';
  if (places.length >= 2 && has(q, /비교|vs|어디가\s*(더|나아)|중에|랑.*중|차이/)) return 'compare';
  if (has(q, /또\s*(가|갈)|다시\s*가고\s*싶은\s*(맛집|가게|장소|카페)|또\s*갈래/)) return 'again';
  if (has(q, /가고\s*싶(은|어\s*하는|어하는|다고\s*한)\s*(곳|데|곳들)|위시\s*(리스트|목록)|찜\s*(한|목록)/) && (!places.length || has(q, /목록|리스트|보여|전부|다\s*보/)) && !has(q, /추천/)) return 'wishList';
  if (places.length && has(q, /가고\s*싶|담아|위시|찜/)) return 'wishAdd';
  if (has(q, /제일\s*많이|가장\s*많이|자주\s*(간|갔|가는)|많이\s*간/) && !places.length) return 'stats';
  if (has(q, /몇\s*번|몇\s*회|얼마나\s*(자주|많이)?\s*(갔|다녀)|간\s*적|가\s*본\s*적|가본\s*적|가\s*봤|가봤|갔었/) && (places.length || hasGroup)) return 'count';
  if (has(q, /언제\s*(갔|다녀|가봤|가 봤)|갔던\s*(때|날)|마지막(으로)?\s*(간|갔|다녀)/)) return 'when';
  if (hasPerson && has(q, /(랑|하고|와|과|이랑)\s*(어디\s*)?(간|갔|다녀|여행)|같이\s*(어디\s*)?(간|갔)|함께\s*(어디\s*)?(간|갔)/)) return 'people';
  if (has(q, /몇\s*(곳|군데|개|퍼|%)|달성|통계|얼마나\s*칠|몇\s*나라|몇\s*번\s*(여행|갔)/) && !places.length) return 'stats';
  if (hasTime && has(q, /(간|갔|다녀온|다녀왔|여행한|여행했|여행\s*몇)\s*(곳|데|여행|번)?|어디\s*(갔|다녀)/)) return 'time';
  if (has(q, /언제\s*가|몇\s*월(에|이)?\s*(가|좋)|가기\s*좋은|시기|성수기|날씨\s*좋|(단풍|벚꽃|눈꽃|해돋이|유채|억새)\s*(언제|시기|절정|때)/) && places.length) return 'season';
  if (has(q, /언제\s*가|몇\s*월(에|이)?\s*(가|좋)|가기\s*좋은|시기|성수기|날씨\s*좋/)) return 'season';
  if (has(q, /맛집|먹거리|먹을|음식|뭐\s*먹|머\s*먹|먹으러|식당|카페|맛있는|먹방|밥집|맛난/)) return 'foods';
  if (has(q, /특산|기념품|선물|사\s*올|사올|쇼핑/)) return 'goods';
  if (has(q, /교통|어떻게\s*가|가는\s*(법|길|방법)|ktx|기차|버스|공항|배편|비행기/i)) return 'transport';
  if (has(q, /추천|어디\s*(갈|가지|가면|갈까)|갈\s*만한|가\s*볼\s*만한\s*곳\s*(있|어디)|놀러|여행지|당일치기|가까운\s*(데|곳)|근처\s*(어디|갈)|떠나고\s*싶|(주말|휴일|연휴|심심)[^가-힣]*(뭐|어디|할)|가기\s*좋은\s*(곳|데)|갈\s*수\s*있는|드라이브|나들이|바람\s*쐬|괜찮은\s*[가-힣]+$/) && !(places.length === 1 && places[0].t === 'kr' && !has(q, /추천|에서\s|시간\s*안|이내|말고|빼고/))) return 'recommend';
  if (!places.length && has(q, /뭐\s*하지|뭐\s*할까|심심/)) return 'recommend';
  // 장소 없이 테마·계절·꽃만 던지면 ('내년 봄 벚꽃', '단풍 보러', '둘 다 안 가본 섬') 추천으로
  if (!places.length && !hasGroup && (readThemes(q).pos.length || has(q, /벚꽃|단풍|꽃놀이|눈꽃|해돋이|안\s*가\s*본|안가본/))) return 'recommend';
  if (has(q, /볼거리|가볼|가 볼|볼\s*만|구경|관광|명소|뭐\s*(하|해|봐)|머\s*(하|해)|할\s*거|놀\s*거리|놀거리|놀\s*데|코스|가\s*볼\s*곳|갈\s*만한\s*데|갈만한데|좋은\s*(데|곳)\s*(있|어디|알려)?$/)) return 'spots';
  if (has(q, /지도|보여|위치|어디\s*있/)) return 'map';
  if (places.length) return 'overview';
  return 'unknown';
}

// ---------- 답 만들기 ----------
const placeName = (p: Place) => placeLong(p);
const tripsAt = (trips: Trip[], p: Place) =>
  trips.filter((t) => t.status === 'done' && t.places.some((x) => samePlace(x, p)));

function placeButtons(p: Place, extra: Btn[] = []): Btn[] {
  const name = p.t === 'kr' ? REGION_BY_CODE.get(p.code)?.name ?? '' : p.city ?? COUNTRY_BY_ID.get(p.id)?.name ?? '';
  return [
    { label: '지도에서 보기', to: `/map?sel=${placeParam(p)}` },
    { label: '가고 싶은 곳에 담기', wish: p },
    { label: '여행 만들기', to: `/plan?place=${placeParam(p)}` },
    ...extra,
    { label: '네이버지도', url: `https://map.naver.com/p/search/${encodeURIComponent(name)}` },
  ];
}

function seasonLine(d: AskData, p: Place) {
  const s = seasonFor(d.seasons, p);
  return s ? `가기 좋은 때: ${monthsLabel(s.m)} · ${s.why}${s.at ? ` (${s.at} 기준)` : ''}` : null;
}

function visitsLine(d: AskData, p: Place) {
  const ts = tripsAt(d.trips, p);
  if (!ts.length) return '우리는 아직 안 가본 곳이에요.';
  const last = ts[0];
  return `우리는 ${times(ts.length)} 다녀왔어요 · 최근 ${formatWhen(last.when)}`;
}

const INFO_SRC = (d: AskData) => `보라핀 여행정보 · ${d.info.updated.replace(/^(\d{4})-(\d{2}).*/, (_, y, m) => `${y}년 ${Number(m)}월`)} 기준`;

function info(d: AskData, p: Place) {
  return p.t === 'kr' ? d.info.cells[p.code] : null;
}

function answerFor(intent: Intent, p: Place | null, q: string, d: AskData, now: Date): Omit<Answer, 'ctx'> {
  switch (intent) {
    case 'overview':
    case 'spots':
    case 'foods':
    case 'goods':
    case 'transport': {
      if (!p) return unknown(q);
      const c = info(d, p);
      const ours = d.recs.filter((r) => samePlace(r.region, p));
      if (!c) {
        // 해외: 도시 자료(world.json)가 있으면 그걸로, 없으면 가기 좋은 때 + 우리 기록
        const country = p.t === 'country' ? COUNTRY_BY_ID.get(p.id) : null;
        const w = cityFor(d.world ?? null, p);
        const oursLines = ours.slice(0, 3).map((r) => `우리 맛집·명소: ${r.name}${r.verdict === 'again' ? ' (또 갈래요)' : ''}`);
        if (w) {
          const lines: string[] = [];
          if (intent === 'foods') lines.push(`먹거리: ${w.eat.join(', ')}`);
          else if (intent === 'transport') lines.push(`인천에서 ${flyLabel(w.fly)} · ${tzLabel(w.tz)} · ${WALK_LABEL[w.walk]}`);
          else if (intent === 'goods') lines.push(`돈: ${w.cur} · ${COST_LABEL[w.cost]} · 콘센트 ${w.plug}`);
          else {
            lines.push(w.line, `볼거리: ${w.see.join(', ')}`);
            if (intent === 'overview') lines.push(`먹거리: ${w.eat.join(', ')}`, `돈·말: ${w.cur} · ${w.lang} · 콘센트 ${w.plug}`, `입국: ${w.entry} (떠나기 전 확인)`);
          }
          const sl = seasonLine(d, p); if (sl) lines.push(sl);
          lines.push(visitsLine(d, p), ...oursLines);
          return { intent, text: `${w.city} · ${country?.name ?? ''}`.trim(), lines, buttons: [...placeButtons(p), ...search(`${w.city} ${intent === 'foods' ? '맛집' : '가볼만한곳'}`)], source: `보라핀 세계 도시 자료 ${d.world?.updated?.slice(0, 7).replace('-', '.') ?? ''} 기준 · 우리 기록` };
        }
        const lines = [seasonLine(d, p), visitsLine(d, p), ...oursLines].filter(Boolean) as string[];
        return {
          intent,
          text: `${placeName(p)}${country ? ` · ${country.continent}` : ''}`,
          lines: [...lines, '이 나라의 도시 정보는 아직 모으는 중이에요. 아래 검색으로 이어서 볼 수 있어요.'],
          buttons: [...placeButtons(p), ...search(`${placeName(p)} ${intent === 'foods' ? '맛집' : '가볼만한곳'}`)],
          source: '날씨: NASA POWER 월평균 · 우리 기록',
        };
      }
      const m = c.main;
      const subs = c.subs.slice(0, 4).map((s) => s.name);
      const lines: string[] = [];
      if (intent === 'foods') {
        lines.push(`먹거리: ${m.foods.join(', ') || '자료 없음'}`);
        for (const s of c.subs.slice(0, 4)) if (s.foods.length) lines.push(`${s.name}: ${s.foods.slice(0, 3).join(', ')}`);
        const eat = ours.filter((r) => r.kind === 'food' || r.kind === 'cafe');
        if (eat.length) lines.push(`우리가 남긴 곳: ${eat.map((r) => `${r.name}${r.verdict === 'again' ? '(또 갈래요)' : r.verdict === 'meh' ? '(별로)' : ''}`).join(', ')}`);
      } else if (intent === 'goods') {
        lines.push(m.goods.length ? `특산물·기념품: ${m.goods.join(', ')}` : '특산물 자료가 아직 없어요.');
      } else if (intent === 'transport') {
        lines.push(m.transport.length ? `교통: ${m.transport.join(', ')}` : '교통 자료가 아직 없어요.');
        const acc = accessLine(p);
        if (acc) lines.push(`가까운 역·공항: ${acc}`);
        if (/ktx|srt|기차|열차|역/i.test(q) && !/ktx|srt|기차|열차/i.test(m.transport.join(' '))) lines.push(acc && /KTX|SRT|역/.test(acc) ? `${placeLabel(p)}엔 기차역이 없어서 가까운 역까지 가서 버스나 차로 이어요.` : `${placeLabel(p)}엔 KTX가 서지 않아요. 시외버스나 차가 편해요.`);
        if (d.home) lines.push(`우리 집에서 가는 길은 여행 상세의 '준비' 탭에서 골라요 (KTX·버스 시각표).`);
      } else {
        // 테마 말('야경'·'바다'·'온천')이 있으면 그 말에 맞는 볼거리를 먼저 골라 준다
        const th = THEMES.filter((t) => t.label.split('·').some((w) => q.includes(w)) || (t.id === 'night' && /야경/.test(q)));
        const pool = [...m.spots.map((x) => ({ n: x, at: '' })), ...c.subs.flatMap((sb) => sb.spots.map((x) => ({ n: x, at: sb.name })))];
        const themed = th.length ? pool.filter((x) => th.some((t) => t.re.test(x.n))) : [];
        if (th.length && themed.length) lines.push(`${th.map((t) => t.label).join('·')}: ${themed.slice(0, 6).map((x) => (x.at ? `${x.n}(${x.at})` : x.n)).join(', ')}`);
        else if (th.length && intent === 'spots') lines.push(`'${th.map((t) => t.label).join('·')}'에 딱 맞는 자료는 없어요. 볼거리 중에서 골라 보세요.`);
        lines.push(`볼거리: ${m.spots.join(', ')}`);
        if (intent === 'overview' && !th.length) lines.push(`먹거리: ${m.foods.join(', ')}`);
        if (subs.length) lines.push(`구·군별로도 볼 수 있어요: ${subs.join(', ')}${c.subs.length > 4 ? ' …' : ''}`);
        const sights = ours.filter((r) => r.kind === 'sight');
        if (sights.length) lines.push(`우리가 남긴 곳: ${sights.map((r) => r.name).join(', ')}`);
      }
      if (m.note) lines.push(`참고: ${m.note}`);
      // 질문에 있는데 자료에 없는 말('케이블카'·'루지')은 솔직하게: 그 말로 검색 단추를 준다
      const ASKABLE = /케이블카|루지|짚라인|스카이워크|출렁다리|수목원|동물원|아쿠아리움|워터파크|스키장|썰매|글램핑|캠핑|서핑|요트|유람선|해수욕장|전망대|야시장|미술관|박물관|사찰|성당|둘레길|자전거|트레킹|등산|낚시|골프|승마|패러글라이딩|번지|레일바이크|모노레일|놀이공원|테마파크|스파|족욕|일출|일몰|해돋이|물놀이|눈썰매|빙어|딸기|체험|목장|농장|사진\s*스팟|포토/;
      const tp = topicOf(q);
      const topicMiss = tp && !tp.words.some((w) => [m.theme, m.note ?? '', ...m.spots, ...c.subs.flatMap((x) => x.spots)].join(' ').includes(w)) ? [tp.label] : [];
      const miss = [...topicMiss, ...unusedWords(q, d.info).filter((w) => ASKABLE.test(w) && !topicMiss.includes(w))];
      if (miss.length) lines.push(`'${miss.join(' ')}'은(는) 제 자료에 없어요. 아래 검색으로 이어 볼 수 있어요.`);
      // 요즘 자료(뜨는 곳·한적·붐빔·같이 가면 좋은 곳)와 무장애 수: 있을 때만 한 줄씩
      if ((intent === 'overview' || intent === 'spots') && p.t === 'kr') {
        const f = trendSummary(p.code, trendOf(d), tourOf(d));
        if (f.tag) lines.push(`요즘: ${f.tag}`);
        if (intent === 'spots' && f.crowd) lines.push(`붐빔: ${f.crowd}`);
        if (f.related) lines.push(`같이 가면 좋은 곳: ${f.related}`);
        if (intent === 'spots' && f.easy) lines.push(`편하게: ${f.easy}`);
      }
      const sl = seasonLine(d, p);
      if (sl && intent !== 'transport') lines.push(sl);
      if (intent === 'overview') lines.push(visitsLine(d, p));
      const next: Btn[] = intent === 'foods' ? [{ label: '볼거리는?', ask: `${placeLabel(p)} 볼거리` }] : [{ label: '맛집은?', ask: `${placeLabel(p)} 맛집` }];
      return { intent: miss.length && intent === 'overview' ? 'spots' : intent, text: `${placeName(p)} · ${m.theme}`, lines, buttons: [...placeButtons(p, next), ...(miss.length ? search(`${placeLabel(p)} ${miss.join(' ')}`) : [])], source: INFO_SRC(d) };
    }
    case 'season': {
      const sightQ = SIGHT_WORDS.find((x) => x.re.test(q));
      if (p && sightQ && p.t === 'country') {
        const w = cityFor(d.world ?? null, p);
        const label = q.match(/단풍|벚꽃|눈꽃|해돋이|유채|억새/)?.[0] ?? '그때';
        const when = label === '단풍' ? '보통 10월 말~11월 (북쪽·산은 이르고 남쪽·도시는 늦어요)' : label === '벚꽃' ? '보통 3월 말~4월 초 (남쪽이 먼저)' : `${sightQ.month}월 앞뒤`;
        return { intent, text: `${w?.city ?? placeName(p)} ${withJosa(label, '은/는')} ${when}`, lines: [seasonLine(d, p) ?? '', '해마다 1~2주 차이가 나요. 떠나기 한 달 전쯤 현지 예보(개화·단풍 예상)를 한 번 봐 주세요.'].filter(Boolean), buttons: placeButtons(p), source: '보라핀 좋은 때 자료 · 일반 시기' };
      }
      if (!p) {
        const month = readMonth(q) ?? now.getMonth() + 1;
        return recommend(q, d, now, month);
      }
      const s = seasonFor(d.seasons, p);
      const ours = tripsAt(d.trips, p).filter((t) => t.when.m || t.when.s).map((t) => (t.when.m ? `${t.when.m}월` : SEASON_LABEL[t.when.s!]));
      return {
        intent,
        text: s ? (monthsLabel(s.m) === '언제든' ? `${jo(placeName(p), '은/는')} 언제 가도 좋아요` : `${jo(placeName(p), '은/는')} ${jo(monthsLabel(s.m), '이/가')} 좋아요`) : `${placeName(p)}의 가기 좋은 때 자료가 없어요`,
        lines: [s ? `${s.why}${s.at ? ` (${s.at} 기준)` : ''}` : '', ours.length ? `우리가 갔던 때: ${[...new Set(ours)].join(', ')}` : ''].filter(Boolean),
        buttons: placeButtons(p),
        source: '날씨: NASA POWER 월평균으로 계산',
      };
    }
    case 'count': {
      if (!p) return unknown(q);
      const ts = tripsAt(d.trips, p);
      return {
        intent,
        text: ts.length ? `${placeName(p)}에 ${times(ts.length)} 다녀왔어요` : `${jo(placeName(p), '은/는')} 아직 안 가봤어요`,
        lines: ts.slice(0, 6).map((t) => `${formatWhen(t.when)} · ${t.title}`),
        buttons: ts.length ? ts.slice(0, 3).map((t) => ({ label: t.title, to: `/trips/${t.id}` })) : placeButtons(p),
        source: '우리 기록',
      };
    }
    case 'when': {
      if (!p) return unknown(q);
      const ts = tripsAt(d.trips, p);
      return {
        intent,
        text: ts.length ? `${placeName(p)}에는 ${formatWhen(ts[0].when)}에 마지막으로 갔어요` : `${jo(placeName(p), '은/는')} 아직 기록이 없어요`,
        lines: ts.map((t) => `${formatWhen(t.when)} · ${t.title}`).slice(0, 8),
        buttons: ts.slice(0, 3).map((t) => ({ label: t.title, to: `/trips/${t.id}` })),
        source: '우리 기록',
      };
    }
    default:
      return unknown(q);
  }
}

function unknown(q: string): Omit<Answer, 'ctx'> {
  return {
    intent: 'unknown',
    text: '잘 모르겠어요. 이렇게 물어보실 수 있어요.',
    lines: ['"강릉 맛집", "제주 언제 가면 좋아?"', '"작년 여름에 간 곳", "엄마랑 간 곳"', '"5월에 바다 보러 갈 만한 곳", "안 가본 곳 추천"'],
    buttons: [{ label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }, { label: '우리 통계', ask: '우리 몇 곳 갔어?' }, ...search(q)],
  };
}

const SEASON_MONTH: Record<Season, number> = { spring: 4, summer: 7, autumn: 10, winter: 1 };
/** 꽃·단풍 같은 '볼거리 낱말': 이 말이 든 볼거리가 있는 곳을 먼저, 때도 맞춘다 */
const SIGHT_WORDS: { re: RegExp; month: number }[] = [{ re: /벚꽃|꽃놀이|유채|튤립/, month: 4 }, { re: /단풍|억새|핑크뮬리/, month: 10 }, { re: /눈꽃|설경|스키|얼음|눈\s*(보러|구경|오는|내리|쌓)/, month: 1 }, { re: /해돋이|일출/, month: 1 }, { re: /해수욕|물놀이/, month: 7 }];

/** 해외 쪽 말: 이 말이 있으면 세계 도시 자료에서 고른다 (나라 코드 묶음 또는 꼬리표) */
const WORLD_AREAS: { re: RegExp; label: string; countries?: string[]; tags?: string[] }[] = [
  { re: /북극|오로라|백야/, label: '북극권(오로라)', tags: ['오로라'] },
  { re: /남극/, label: '남극에 가까운 곳', countries: ['ARG', 'CHL', 'NZL'] },
  { re: /북유럽|스칸디나비아/, label: '북유럽', countries: ['NOR', 'SWE', 'FIN', 'DNK', 'ISL'] },
  { re: /동유럽/, label: '동유럽', countries: ['CZE', 'HUN', 'POL', 'HRV', 'SVN', 'MNE', 'AUT'] },
  { re: /지중해/, label: '지중해', countries: ['ITA', 'ESP', 'GRC', 'HRV', 'MLT', 'FRA', 'MNE', 'TUR'] },
  { re: /유럽/, label: '유럽', countries: ['ITA', 'ESP', 'FRA', 'CHE', 'GBR', 'HRV', 'GRC', 'PRT', 'AUT', 'CZE', 'HUN', 'NLD', 'BEL', 'NOR', 'ISL', 'FIN', 'DNK', 'POL', 'SVN', 'MNE', 'MLT'] },
  { re: /동남아/, label: '동남아', countries: ['THA', 'VNM', 'SGP', 'MYS', 'IDN', 'PHL', 'KHM', 'LAO'] },
  { re: /중화권|대만|홍콩|마카오/, label: '중화권', countries: ['TWN', 'HKG', 'MAC', 'CHN'] },
  { re: /남태평양|휴양지 섬|괌|사이판/, label: '태평양 섬', countries: ['GUM', 'MNP', 'PLW', 'FJI', 'MDV'] },
  { re: /미주|북미|미국|캐나다/, label: '북미', countries: ['USA', 'CAN', 'MEX'] },
  { re: /남미/, label: '남미', countries: ['PER', 'BRA', 'ARG', 'CHL'] },
  { re: /아프리카/, label: '아프리카', countries: ['EGY', 'MAR', 'ZAF', 'TZA', 'KEN'] },
  { re: /중동/, label: '중동', countries: ['ARE', 'TUR', 'JOR', 'GEO'] },
  { re: /오세아니아|호주|뉴질랜드/, label: '오세아니아', countries: ['AUS', 'NZL', 'FJI'] },
  { re: /해외|외국|비행기 타고/, label: '해외' },
];

function worldRecommend(q: string, d: AskData, month: number | null): Omit<Answer, 'ctx'> | null {
  const area = WORLD_AREAS.find((a) => a.re.test(q));
  if (!area) return null;
  if (!d.world) return { intent: 'recommend', text: '해외 도시 자료를 불러오는 중이에요', lines: ['잠시 뒤 다시 물어봐 주세요.'], buttons: [] };
  const withWho = /부모님|엄마|아빠|어르신/.test(q) ? '부모님' : /아이|애들|아기/.test(q) ? '아이' : /친구/.test(q) ? '친구' : null;
  const cheap = /싼|저렴|물가.*(낮|싼)|가성비/.test(q) ? 1 as const : null;
  const near = /가까운|짧은 비행|4시간/.test(q) ? 'near' as const : null;
  let list: WorldCity[] = pickCities(d.world, { month, tags: area.tags, with: withWho, cost: cheap, fly: near, unvisitedOnly: /안\s*가\s*본/.test(q) }, computeStats(d.trips), d.wishes);
  if (area.countries) list = list.filter((w) => area.countries!.includes(w.c));
  const picks = list.slice(0, 3);
  const head = [month ? `${month}월에` : '', area.label].filter(Boolean).join(' ');
  if (!picks.length) return { intent: 'recommend', text: `${head} 쪽은 아직 고를 곳이 없어요`, lines: ['조건을 하나 빼거나, 가고 싶은 곳 → 해외 도시 고르기에서 찾아보세요.'], buttons: [{ label: '해외 도시 고르기', to: '/wishes?find=world' }] };
  return {
    intent: 'recommend',
    text: `${head} 가 볼 만한 곳 ${picks.length}곳`,
    items: picks.map((w) => ({ title: `${w.city} · ${countryName(w)}`, sub: `${w.line} · 좋은 때 ${monthsLabel(w.best)} · 인천에서 ${flyLabel(w.fly)}`, open: { label: `${w.city} 자세히`, ask: `${w.city} 여행` }, wish: cityPlace(w) })),
    buttons: [{ label: '다른 곳', ask: q + ' ' }, { label: '해외 도시 고르기', to: '/wishes?find=world' }],
    source: `보라핀 세계 도시 자료 ${d.world.updated.slice(0, 7).replace('-', '.')} 기준`,
  };
}

/** 지도에 없는 바다·대륙 이름 같은 걸 물으면(북극해·카리브해…) 국내로 엉뚱하게 답하지 않게 */
const UNKNOWN_FAR = /([가-힣]{2,}(해|양|대륙|반도|제도|사막))(\s|에|으로|로|쪽|의|$)/;

/** 추천 질문에서 쓰지 못한 낱말: 아는 말(지명·테마·계절·조건)을 지우고 남은 핵심 낱말 */
const KNOWN_RE: RegExp[] = [
  /\d{1,2}\s*월/, /봄|여름|가을|겨울/, /가까운|근처|당일치기|당일|멀리|먼\s*곳/, /안\s*가\s*본|안가본|못\s*가\s*본|처음|새로운|또\s*가|다시/,
  /부모님|엄마|아빠|아이|애들|아기|친구|혼자|둘이|가족|어르신|커플|부부|연인/, /[1-9]\s*박|[1-9]\s*일|주말|평일|연휴|이번\s*주|다음\s*주|이번\s*달|다음\s*달|내년|올해/,
  /국내|해외|외국|우리나라/, /말고|빼고|싫/,
];
const GENERIC = new Set(('여행지 여행 곳 데 데가 곳들 장소 명소 코스 추천 추천해줘 추천해 좋은 좋을 좋아 좋은데 괜찮은 보기 가기 갈 갈만한 만한 가볼 가볼만한 볼만한 '
  + '어디 어디가 어디로 어디를 이번 다음 주 달 날씨 요즘 지금 우리 둘 다 같이 함께 놀러 알려줘 해줘 줘 좀 하기 할 하는 한 있는 없는 가면 갈까 가자 가고 싶은 싶어 '
  + '중에 중 아직 정도 쯤 어디야 어디예요 어디에요 모시고 끌고 다니기 다닐 편한 편하게 다른 '
  + '보러 하러 먹으러 쉬러 여행하기 여행가기 어때 어떤 데요 곳이 곳을 곳은 거 것 수 있을까 있어 인 의 및 또는 그리고 가봐야 할만한 보면 맑은 비 안 오는 드라이브').split(' '));
export function unusedWords(q: string, info: AskData['info']): string[] {
  let rest = ` ${q} `;
  const cut = (re: RegExp) => { rest = rest.replace(new RegExp(re.source, 'g'), ' '); };
  // 주제 낱말을 먼저(긴 것부터) 지운다: '석회동굴'이 '동굴'로 잘려 '석회'가 남지 않게
  for (const w of TOPICS.flatMap((t) => t.words).sort((a, b) => b.length - a.length)) if (hasWord(q, w)) rest = rest.split(w).join(' ');
  for (const m of findMentions(q, info)) rest = rest.replace(q.slice(m.start, m.end), ' ');
  for (const t of THEMES) { cut(t.re); for (const w of t.label.split('·')) cut(new RegExp(w)); }
  for (const x of SIGHT_WORDS) cut(x.re);
  for (const x of WORLD_AREAS) cut(x.re);
  for (const re of [...KNOWN_RE, STAR_Q, WEATHER_SOON, ...TREND_TOPICS.map((t) => t.re)]) cut(re);
  return rest.split(/[\s,.?!~·]+/)
    .map((w) => w.replace(JOSA_TAIL, ''))
    .filter((w) => w.length >= 2 && /[가-힣a-z]/i.test(w) && !GENERIC.has(w) && !/^(가|보|하|먹|쉬|놀|좋)/.test(w.length <= 2 ? w : '_'));
}
const JOSA_TAIL = /(에서|으로|이랑|하고|에는|이나|같은|처럼|보다|까지|부터|은|는|이|가|을|를|에|로|와|과|도|만|랑|의)$/;

function recommend(q: string, d: AskData, _now: Date, monthArg?: number | null, groupId?: string | null): Omit<Answer, 'ctx'> {
  const wr = worldRecommend(q, d, monthArg ?? readMonth(q));
  if (wr) return wr;
  const far = q.match(UNKNOWN_FAR);
  if (far && !findMentions(q, d.info).length && !/바다|동해|서해|남해/.test(far[1])) {
    return { intent: 'recommend', text: `${far[1]} 쪽 여행지는 아직 자료가 없어요`, lines: ['가까운 나라나 도시 이름으로 물어보면 찾아볼게요. 예: 노르웨이 트롬쇠, 아이슬란드'], buttons: [{ label: '오로라 보러 갈 만한 곳', ask: '오로라 보러 갈 만한 곳 추천' }, { label: '해외 도시 고르기', to: '/wishes?find=world' }] };
  }
  // 요즘 뜨는 곳·한적한 곳·많이 안 걷는 곳: 요즘 자료(외지인 흐름)와 무장애 관광지 수로 고른다
  const tt = trendTopicOf(q);
  if (tt) return trendRecommend(q, d, tt, groupId ?? null);
  // 볼거리 이름('공룡발자국'·'출렁다리')이 지명 사전에 있으면: 그 볼거리가 있는 곳들 (사전에 없는 주제도 자료가 있으면 답한다)
  const spotM = findMentions(q, d.info).filter((m) => m.entry.kind === 'spot');
  if (spotM.length && !topicOf(q)) {
    const label = spotM.map((m) => m.entry.label).join('·');
    const ps = [...new Map(spotM.flatMap((m) => m.entry.places).filter((p) => p.t === 'kr').map((p) => [p.t === 'kr' ? p.code : '', p])).values()];
    const picks = dailyShuffle(ps, q).slice(0, 5);
    if (picks.length) return {
      intent: 'recommend',
      text: `'${label}' 볼 수 있는 곳 ${picks.length}곳`,
      items: picks.map((pl) => { const s = seasonFor(d.seasons, pl); return { title: placeName(pl), sub: s ? `좋은 때 ${monthsLabel(s.m)}` : '', open: { label: `${placeLabel(pl)} 자세히`, ask: `${placeLabel(pl)} 볼거리` }, wish: pl }; }),
      buttons: [{ label: '다른 곳', ask: q + ' ' }],
      source: INFO_SRC(d),
    };
  }
  // 여행 주제(해돋이·케이블카·캠핑…): 주제 사전의 곳에서 고른다
  const topic = topicOf(q);
  if (topic) {
    const visited = computeStats(d.trips).cellVisits;
    const unv = /안\s*가\s*본|안가본|처음/.test(q);
    const list = topic.places.filter((x) => !unv || !visited.has(x.code));
    const picks = dailyShuffle(list, q).slice(0, 3);
    if (!picks.length) return { intent: 'recommend', text: `${topic.label} 하기 좋은 곳은 이미 다 가 봤어요`, lines: ['안 가본 곳 조건을 빼고 다시 물어보세요.'], buttons: [{ label: '다시 보기', ask: q.replace(/안\s*가\s*본|안가본|처음/g, '') }] };
    return {
      intent: 'recommend',
      text: `${topic.label} 하기 좋은 곳 ${picks.length}곳`,
      items: picks.map((x) => {
        const pl: Place = { t: 'kr', code: x.code };
        const s = seasonFor(d.seasons, pl);
        return { title: placeName(pl), sub: `${x.spot}${s ? ` · 좋은 때 ${monthsLabel(s.m)}` : ''}`, open: { label: `${placeLabel(pl)} 자세히`, ask: `${placeLabel(pl)} 볼거리` }, wish: pl };
      }),
      buttons: [{ label: '다른 곳', ask: q + ' ' }],
      source: '보라핀 여행 주제 사전 · 운영 여부는 떠나기 전 확인',
    };
  }
  // 별·은하수: 테마 글자로는 못 고른다(대도시 '야경'이 걸림) → 빛 공해가 적은 곳을 손으로 고른 목록
  if (STAR_Q.test(q)) {
    const visited = computeStats(d.trips).cellVisits;
    const unv = /안\s*가\s*본|안가본|처음/.test(q);
    const list = DARK_SKY.filter((x) => !unv || !visited.has(x.code));
    const picks = dailyShuffle(list, q).slice(0, 3);
    return {
      intent: 'recommend',
      text: `밤하늘이 어두워 별 보기 좋은 곳 ${picks.length}곳`,
      lines: ['달이 없는 그믐 앞뒤, 맑은 날 밤 11시 넘어서가 가장 잘 보여요. 은하수는 5~9월이 좋아요.'],
      items: picks.map((x) => {
        const pl: Place = { t: 'kr', code: x.code };
        return { title: placeName(pl), sub: x.spot, open: { label: `${placeLabel(pl)} 자세히`, ask: `${placeLabel(pl)} 볼거리` }, wish: pl };
      }),
      buttons: [{ label: '다른 곳', ask: q + ' ' }],
      source: '보라핀이 고른 별 보기 좋은 곳 · 날씨는 떠나기 전 확인',
    };
  }
  const sight = SIGHT_WORDS.find((x) => new RegExp(`(^|[^가-힣])(?:${x.re.source})`).test(q));
  const seasonQ = readSeason(q);
  const month = monthArg ?? readMonth(q) ?? sight?.month ?? (seasonQ ? SEASON_MONTH[seasonQ] : null);
  const { pos, neg } = readThemes(q);
  // '우리 집 근처'인데 집을 모르면 되묻는다 (실패로 끝내지 않고 대화를 잇는다)
  const homeQ = HOME_NEAR.test(q);
  if (homeQ && !d.home) return { intent: 'recommend', text: '어디 사세요? 시·군 이름을 알려 주시면 그 근처로 찾아볼게요', lines: ['예: 고양, 강릉, 부산 해운대', '알려 주신 곳은 우리 집으로 기억해 둘게요 (둘이 같이 써요).'], buttons: [{ label: '우리 공간에서 정하기', to: '/space#home' }], pending: { need: 'home', q } };
  // '가까운·당일치기': 우리 집을 알면 집에서 70km 안, 모르면 수도권(서울·경기·인천·강원·충청)
  const near = !groupId && (homeQ || /가까운|근처|당일치기|당일/.test(q));
  const unvisited = /안\s*가\s*본|안가본|처음|새로운|못\s*가\s*본/.test(q);
  const stats = computeStats(d.trips);
  let list = candidates({ scope: groupId ?? 'kr', unvisitedOnly: unvisited, theme: pos[0] ?? null, stats, info: d.info, wishes: [] });
  // '○○ 말고·빼고': 그 지역은 뺀다. '서울에서 2시간 안에': 그 지역에서 시간×75km 안
  const ments = findMentions(q, d.info, { typo: false }).filter((m) => m.entry.places.length === 1 && m.entry.places[0].t === 'kr');
  const excluded = ments.filter((m) => /^\s*(말고|빼고|제외|빼|말곤)/.test(q.slice(m.end))).map((m) => (m.entry.places[0] as { code: string }).code);
  if (excluded.length) list = list.filter((c) => !(c.place.t === 'kr' && excluded.includes(c.place.code)));
  const hoursM = q.match(/에서\s*(\d(?:\.\d)?)\s*시간/);
  const origin = hoursM ? ments.find((m) => /에서/.test(q.slice(m.end, m.end + 3))) : null;
  if (origin && hoursM) {
    const o = REGION_BY_CODE.get((origin.entry.places[0] as { code: string }).code)!;
    const km = Math.max(60, +hoursM[1] * 75);
    list = list.filter((c) => c.place.t === 'kr' && c.place.code !== o.code && straightKm(o, REGION_BY_CODE.get(c.place.code)!) <= km);
  } else if (near && d.home) { const h = d.home; list = list.filter((c) => { if (c.place.t !== 'kr' || c.place.code === h.code) return false; const r = REGION_BY_CODE.get(c.place.code); return !!r && straightKm(h, r) <= 70; }); }
  else if (near) list = list.filter((c) => c.place.t === 'kr' && ['seoul', 'gyeonggi', 'incheon', 'gangwon', 'chungnam', 'chungbuk', 'daejeon', 'sejong'].includes(REGION_BY_CODE.get(c.place.code)?.group ?? ''));
  if (sight) {
    const hit = list.filter((c) => sight.re.test([c.theme ?? '', ...(c.spots ?? [])].join(' ')));
    if (hit.length >= 2) list = hit;
  }
  if (neg.length) {
    const res = neg.map((n) => THEMES.find((t) => t.id === n)!.re);
    list = list.filter((c) => !(c.place.t === 'kr' && res.some((re) => re.test([c.theme, ...(c.spots ?? [])].join(' ')))));
  }
  // 그 달이 '가기 좋은 때'인 곳 → 모자라면 앞뒤 달 → 겨울(12~2월)이면 겨울에 어울리는 곳(온천·눈·해돋이…)으로 넓힌다
  // (12월처럼 좋은 때로 꼽힌 곳이 드문 달에 '조건에 맞는 곳을 찾지 못했어요'로 끝나지 않게, 써 보기 11-05)
  let relaxed: string | null = null;
  if (month) {
    const all = list;
    const goodIn = (ms: number[]) => all.filter((c) => { const m = seasonFor(d.seasons, c.place)?.m ?? []; return ms.some((x) => m.includes(x)); });
    list = goodIn([month]);
    if (list.length < 3) {
      const near = goodIn([((month + 10) % 12) + 1, (month % 12) + 1]).filter((c) => !list.includes(c));
      if (near.length) { list = [...list, ...near]; relaxed = `${month}월이 딱 좋은 때로 꼽힌 곳이 적어서 앞뒤 달이 좋은 곳까지 골랐어요.`; }
    }
    if (list.length < 3 && (month === 12 || month <= 2)) {
      const winter = all.filter((c) => !list.includes(c) && /온천|눈|스키|해돋이|일출|얼음|빙어|겨울|설경|눈꽃/.test([c.theme ?? '', ...(c.spots ?? [])].join(' ')));
      if (winter.length) { list = [...list, ...winter]; relaxed = '겨울은 가기 좋은 때로 꼽힌 곳이 드물어서 온천·눈·해돋이처럼 겨울에 어울리는 곳으로 골랐어요.'; }
    }
  }
  const picks = dailyShuffle(list, q).slice(0, 3);
  const themeLabel = pos.map((p) => THEMES.find((t) => t.id === p)!.label).join('·');
  const sightWord = sight ? (q.match(sight.re)?.[0] ?? '') : '';
  const head = [near ? (d.home ? '우리 집에서 가까운' : '수도권에서 가까운') : '', month ? `${month}월에` : '', sightWord ? `${sightWord} 보러` : themeLabel ? `${themeLabel} 보러` : '', unvisited ? '안 가본' : ''].filter(Boolean).join(' ');
  if (!picks.length) return { intent: 'recommend', text: '조건에 맞는 곳을 찾지 못했어요', lines: ['조건을 하나 빼고 다시 물어보세요.'], buttons: [{ label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }] };
  return {
    intent: 'recommend',
    text: `${head ? head + ' ' : ''}가 볼 만한 곳 ${picks.length}곳`,
    items: picks.map((c) => {
      const s = seasonFor(d.seasons, c.place);
      return { title: placeName(c.place), sub: `${c.theme ?? ''}${s ? ` · 좋은 때 ${monthsLabel(s.m)}` : ''}`, open: { label: `${placeLabel(c.place)} 자세히`, ask: `${placeLabel(c.place)} 볼거리` }, wish: c.place };
    }),
    unused: unusedWords(q, d.info),
    // 이번 주·주말 날씨를 물어도 예보는 보지 않는다 → 본 척하지 않고 평년 날씨라고 밝힌다
    ...((WEATHER_SOON.test(q) || relaxed) ? { lines: [...(relaxed ? [relaxed] : []), ...(WEATHER_SOON.test(q) ? [`이번 주 날씨 예보는 아직 보지 못해요. ${month ?? new Date().getMonth() + 1}월 평년 날씨로 고른 곳이니 떠나기 전 예보를 확인해 주세요.`] : [])] } : {}),
    buttons: [{ label: '다른 곳', ask: q + ' ' }],
    source: `${INFO_SRC(d)} · 날씨: NASA POWER 월평균`,
  };
}

/** 여행 상식 (src/data/faq.json, 손으로 정리). 지명이 있으면 지명 질문이 먼저 (이름에 지명이 든 상식만 예외) */
interface Faq { id: string; re: RegExp; a: string; lines: string[]; volatile: boolean; link?: { label: string; href: string } }
const FAQ: Faq[] = (faqData as { faq: (Omit<Faq, 're'> & { re: string })[] }).faq.map((f) => ({ ...f, re: new RegExp(f.re, 'i') }));
const FAQ_WITH_PLACE = new Set(['dom-id', 'jeju-ferry', 'island-ferry', 'visa', 'plug', 'tipping', 'smoking', 'idp', 'roaming']);
function faqFor(q: string, hasPlace = false) { return FAQ.find((f) => f.re.test(q) && (!hasPlace || FAQ_WITH_PLACE.has(f.id))) ?? null; }

/** 우리 여행 패턴: 기록에서 계절·지역·국내외·동행·다시 간 곳 */
function travelPattern(done: Trip[], d: AskData): Omit<Answer, 'ctx'> {
  if (done.length < 3) return { intent: 'pattern', text: '패턴을 말하기엔 기록이 아직 적어요', lines: ['다녀온 여행을 3개 넘게 남기면 계절·지역·함께 간 사람을 모아 볼게요.'], buttons: [{ label: '기록 남기기', to: '/record' }] };
  const s = computeStats(d.trips);
  const SEASON: Record<string, string> = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
  const ofM = (m: number) => (m >= 3 && m <= 5 ? 'spring' : m <= 8 && m >= 6 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter');
  const seasons = new Map<string, number>();
  for (const t of done) { const k = t.when.s ?? (t.when.m ? ofM(t.when.m) : null); if (k) seasons.set(k, (seasons.get(k) ?? 0) + 1); }
  const sTop = [...seasons.entries()].sort((a, b) => b[1] - a[1]);
  const abroad = done.filter((t) => t.places.some((p) => p.t === 'country')).length;
  const groups = new Map<string, number>();
  for (const t of done) for (const p of t.places) if (p.t === 'kr') { const g = REGION_BY_CODE.get(p.code)?.groupName; if (g) groups.set(g, (groups.get(g) ?? 0) + 1); }
  const gTop = [...groups.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([g]) => g);
  const again = [...s.cellVisits.values()].filter((n) => n >= 2).length;
  const comp = new Map<string, number>();
  for (const t of done) for (const c of t.companions ?? []) comp.set(c, (comp.get(c) ?? 0) + 1);
  const people = [...comp.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
  const missing = ['spring', 'summer', 'autumn', 'winter'].filter((k) => !seasons.has(k)).map((k) => SEASON[k]);
  const lines = [
    sTop.length ? `계절: ${sTop.map(([k, n]) => `${SEASON[k]} ${n}`).join(' · ')}${missing.length ? ` (아직 ${missing.join('·')} 여행은 없어요)` : ''}` : '',
    `국내 ${done.length - abroad} · 해외 ${abroad}`,
    gTop.length ? `자주 가는 쪽: ${gTop.join(', ')}` : '',
    again ? `두 번 넘게 간 곳 ${again}곳 · 마음에 들면 또 가는 편이에요` : '같은 곳을 다시 가기보다 새 곳을 찾는 편이에요',
    people.length ? `자주 함께한 사람: ${people.join(', ')}` : '',
  ].filter(Boolean);
  const head = sTop[0] ? `${SEASON[sTop[0][0]]}에 ${abroad * 2 > done.length ? '해외로' : '국내로'} 떠나는 편이에요` : `${times(done.length)}의 여행을 모아 봤어요`;
  return { intent: 'pattern', text: head, lines, buttons: [{ label: missing[0] ? `${missing[0]}에 갈 곳` : '안 가본 곳 추천', ask: missing[0] ? `${missing[0]}에 갈 만한 곳` : '안 가본 곳 추천' }, { label: '추억', to: '/memories' }], source: '우리 기록' };
}

/** 여행 주제 사전 (src/data/topics.json): 낱말이 있으면 손으로 고른 곳에서 */
interface Topic { id: string; label: string; words: string[]; places: { code: string; spot: string }[] }
const TOPICS = (topicsData as { topics: Topic[] }).topics;
// 낱말 앞이 다른 한글이면(수상스키의 '스키') 그 주제가 아니다
const hasWord = (q: string, w: string) => new RegExp(`(^|[^가-힣])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(q);
export const topicOf = (q: string) => TOPICS.find((t) => t.words.some((w) => hasWord(q, w))) ?? null;

/**
 * 요즘 자료로 고르는 주제: 뜨는 곳·한적한 곳(trend.json의 외지인 흐름), 많이 안 걷는 곳(tour.json의 무장애 관광지 수).
 * 낱말은 띄어쓰기 없이도 맞게 \s* 로 쓴다 (지명 사전처럼 공백 뺀 글에도 대 본다). 한적한 곳을 먼저 본다 ('요즘 사람 많지 않은 곳'이 뜨는 곳으로 읽히지 않게)
 */
export interface TrendTopic { kind: TrendTopicKind; label: string; re: RegExp }
export const TREND_TOPICS: TrendTopic[] = [
  { kind: 'quiet', label: '한적한 곳', re: /사람\s*(없|적)는|사람\s*(안\s*)?많지\s*않|사람\s*(별로\s*)?없|사람\s*적은|조용한|조용히|조용하게|붐비지\s*않|안\s*붐비|한산한|한적|북적(이|거리)?지\s*않|덜\s*붐비|덜\s*북적|한갓진|호젓한/ },
  { kind: 'easy', label: '많이 안 걷는 곳', re: /휠체어|유모차|(부모님|어르신|할머니|할아버지|어머니|아버지)\s*모시고|무릎|편하게\s*다니|편하게\s*다닐|편히\s*다니|많이\s*안\s*걷|안\s*걷는|안\s*걷고|걷기\s*힘|걷기\s*싫|덜\s*걷|오래\s*못\s*걷|걷지\s*않|걷는\s*(게|거)\s*힘|계단\s*없는|무장애|배리어\s*프리|조금만\s*걷/ },
  { kind: 'hot', label: '요즘 뜨는 곳', re: /핫한|핫플|핫하다는|요즘\s*(인기|뜨|뜬다|핫|유행|많이\s*(가|찾)|잘\s*나가)|요새\s*(인기|뜨|핫)|인기\s*(있는|많은|좋은|여행지|있다는)|(?<!(해|달|해가|달이)\s*)뜨는\s*(곳|데|여행지|지역|동네)|뜨고\s*있는|떠오르는|유행하는/ },
];
export const trendTopicOf = (q: string) => TREND_TOPICS.find((t) => t.re.test(q)) ?? null;
/** 요즘 주제 낱말이 차지하는 자리(공백 뺀 글 기준): 그 자리에 걸린 지명 후보('한산'·'조용')는 버린다 */
function trendSpan(q: string): [number, number] | null {
  const tt = trendTopicOf(q);
  if (!tt) return null;
  const m = q.replace(/\s+/g, '').match(tt.re);
  return m && m.index != null ? [m.index, m.index + m[0].length] : null;
}
const TREND_HEAD: Record<TrendTopicKind, string> = { hot: '요즘 뜨는 곳', quiet: '한적한 곳', easy: '많이 안 걷고 편하게 다닐 곳' };
const SRC_MONTH = (s: string) => s.replace(/^(\d{4})-(\d{2}).*/, (_, y, m) => `${y}년 ${Number(m)}월`);

function trendRecommend(q: string, d: AskData, tt: TrendTopic, groupId: string | null): Omit<Answer, 'ctx'> {
  const trend = trendOf(d), tour = tourOf(d);
  const stats = computeStats(d.trips);
  const visited = new Set(stats.cellVisits.keys());
  const unv = /안\s*가\s*본|안가본|처음|못\s*가\s*본/.test(q);
  // 테마는 주제 낱말을 뺀 나머지에서 읽는다 ('한산한'의 '산'이 산·숲으로 읽히지 않게)
  const { pos } = readThemes(q.replace(tt.re, ' '));
  // 광역·테마 조건이 있으면 그 조건에 맞는 시·군만
  const allow = groupId || pos.length
    ? new Set(candidates({ scope: groupId ?? 'kr', unvisitedOnly: false, theme: pos[0] ?? null, stats, info: d.info, wishes: [] }).flatMap((c) => (c.place.t === 'kr' ? [c.place.code] : [])))
    : null;
  // '우리 집 근처'인데 집을 모르면 되묻는다 (일반 추천과 같은 흐름)
  const homeQ = HOME_NEAR.test(q);
  if (homeQ && !d.home) return { intent: 'recommend', text: '어디 사세요? 시·군 이름을 알려 주시면 그 근처로 찾아볼게요', lines: ['예: 고양, 강릉, 부산 해운대', '알려 주신 곳은 우리 집으로 기억해 둘게요 (둘이 같이 써요).'], buttons: [{ label: '우리 공간에서 정하기', to: '/space#home' }], pending: { need: 'home', q } };
  const near = homeQ || /가까운|근처|당일치기|당일/.test(q);
  const ranked = rankTrend(tt.kind, { trend, tour, visited, home: d.home ?? null, allow, unvisitedOnly: unv, kmPerStep: near ? 15 : 60 });
  const groupName = groupId ? GROUPS.find((g) => g.id === groupId)?.name ?? '' : '';
  const themeLabel = pos.map((x) => THEMES.find((t) => t.id === x)!.label).join('·');
  const head = [groupName ? `${groupName}에서` : '', near && d.home ? '우리 집에서 가까운' : '', unv ? '안 가본' : '', themeLabel ? `${themeLabel} 쪽` : '', TREND_HEAD[tt.kind]].filter(Boolean).join(' ');
  if (!ranked) {
    return {
      intent: 'recommend',
      text: `${jo(head, '은/는')} 아직 자료가 없어요`,
      lines: [tt.kind === 'easy' ? '관광지 자료를 아직 못 받았어요. 잠시 뒤 다시 물어봐 주세요.' : '요즘 자료가 아직 없어요. 들어오면 바로 보여 드릴게요.'],
      buttons: [{ label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }, { label: '이번 달 가기 좋은 곳', ask: '이번 달 가기 좋은 곳' }],
    };
  }
  // '다른 곳'을 누를 때마다 다음 3곳 (순위라 섞지 않는다)
  const page = (q.match(/다른\s*곳/g) ?? []).length;
  const picks = ranked.slice(page * 3, page * 3 + 3);
  if (!picks.length) return { intent: 'recommend', text: `${jo(head, '을/를')} 더 찾지 못했어요`, lines: ['조건을 하나 빼고 다시 물어보세요.'], buttons: [{ label: '처음부터', ask: q.replace(/\s*다른\s*곳/g, '') }] };
  const others: Btn[] = tt.kind === 'hot' ? [{ label: '한적한 곳은?', ask: '요즘 한적한 곳' }] : tt.kind === 'quiet' ? [{ label: '요즘 뜨는 곳은?', ask: '요즘 뜨는 곳' }] : [{ label: '한적한 곳은?', ask: '요즘 한적한 곳' }];
  return {
    intent: 'recommend',
    text: `${head} ${picks.length}곳`,
    lines: tt.kind === 'easy' ? ['휠체어·유모차 정보가 등록된 관광지가 많은 순이에요. 지역 창의 관광지 띠에서 볼 수 있어요.'] : [`외지인 방문 흐름으로 골랐어요${trendAt(trend) ? ` · ${trendAt(trend)}` : ''}`],
    items: picks.map((x) => {
      const pl: Place = { t: 'kr', code: x.code };
      const s = seasonFor(d.seasons, pl);
      const n = stats.cellVisits.get(x.code) ?? 0;
      const sub = [x.why, d.info.cells[x.code]?.main.theme ?? '', s ? `좋은 때 ${monthsLabel(s.m)}` : '', n ? `우리 ${times(n)} 다녀왔어요` : ''].filter(Boolean).join(' · ');
      return { title: placeName(pl), sub, open: { label: `${placeLabel(pl)} 자세히`, ask: `${placeLabel(pl)} 볼거리` }, wish: pl };
    }),
    buttons: [...(ranked.length > (page + 1) * 3 ? [{ label: '다른 곳', ask: `${q} 다른 곳` }] : []), ...others],
    // 주제를 알아들었으니 남은 낱말('모시고'·'끌고')로 자신 없어 하지 않는다
    unused: [],
    source: tt.kind === 'easy' ? `한국관광공사 무장애 관광 정보${tour?.updated ? ` · ${SRC_MONTH(tour.updated)} 기준` : ''}` : `한국관광공사 관광빅데이터(외지인 방문 흐름)${trendAt(trend) ? ` · ${trendAt(trend)}` : ''}`,
  };
}

const HOME_NEAR = /우리\s*집|집\s*(근처|에서|가까)|사는\s*(곳|데)\s*(근처|가까|에서)|동네\s*(근처|가까)/;
export const STAR_Q = /은하수|별\s*(을|이)?\s*(보|관측|사진)|별자리|별빛|천문대|밤하늘|별\s*보러/;
const WEATHER_SOON = /날씨|맑|비\s*안/;
/** 빛 공해가 적은 곳 (국제밤하늘보호공원·천문대) */
export const DARK_SKY: { code: string; spot: string }[] = [
  { code: '47760', spot: '반딧불이천문대 · 국제밤하늘보호공원' },
  { code: '51750', spot: '별마로천문대' },
  { code: '51760', spot: '육백마지기 · 청옥산' },
  { code: '51770', spot: '만항재 · 가장 높은 포장도로 고개' },
  { code: '51790', spot: '조경철천문대' },
  { code: '43800', spot: '소백산 자락 · 별 보기 좋은 산골' },
  { code: '52730', spot: '반디랜드 천문과학관' },
  { code: '47230', spot: '보현산천문대' },
  { code: '41830', spot: '중미산천문대' },
  { code: '51190', spot: '매봉산 바람의 언덕' },
];

/** 질문 하나에 답한다. ctx는 직전 대화(지역·질문 틀) */
export function ask(question: string, ctx: AskCtx, d: AskData, forced?: Place): Answer {
  const now = d.now ?? new Date();
  const q = question.trim().replace(/[?!.~]+$/g, '');
  // 여행 주제 낱말('케이블카'·'동굴')이 지명 사전의 볼거리 이름에 걸려 되묻지 않게: 주제 낱말 자리의 지명은 버린다
  const tp = topicOf(q);
  // 직전 추천에 조건만 덧붙이면('우리 집 근처로', '안 가본 데로') 앞 질문과 합쳐 다시 푼다
  if (!forced && ctx.intent === 'recommend' && ctx.lastQ && !ctx.pending && q.replace(/\s/g, '').length <= 12 && /근처|가까|우리\s*집|안\s*가\s*본|처음|당일|말고|빼고/.test(q) && !/추천|어디/.test(q)) {
    return ask(`${ctx.lastQ} ${q}`, { ...ctx, lastQ: null }, d, forced);
  }
  // 되묻기에 대한 답: '어디 사세요?' → 시·군 이름이면 우리 집으로 삼고 처음 질문을 다시 푼다
  if (ctx.pending?.need === 'home' && !forced) {
    const m = findMentions(q, d.info).find((x) => x.entry.places.length === 1 && x.entry.places[0].t === 'kr');
    const at = m?.entry.places[0];
    const r = at && at.t === 'kr' ? REGION_BY_CODE.get(at.code) : undefined;
    if (at && r) {
      const re = ask(ctx.pending.q, { place: null, intent: undefined }, { ...d, home: { lat: r.lat, lng: r.lng, code: r.code, label: regionLong(r.code) } }, undefined);
      return { ...re, setHome: at, lines: [`${withRo(regionLong(r.code))} 우리 집을 기억할게요.`, ...(re.lines ?? [])] };
    }
    if (q.replace(/\s/g, '').length <= 8) return { intent: 'recommend', text: '시·군 이름으로 알려 주세요', lines: ['예: 고양, 강릉, 부산 해운대'], buttons: [{ label: '우리 공간에서 정하기', to: '/space#home' }], ctx: { ...ctx } };
    // 다른 질문으로 넘어갔으면 되묻기를 그만둔다
  }
  // 여행 상식 질문('기내에 화장품', '카드', '환전')이면 오타 고치기를 하지 않는다: 흔한 말이 지명(기니·차드·인천)으로 바뀌지 않게
  const tsp = trendSpan(q);
  const mentions: Mention[] = forced ? [] : findMentions(q, d.info, { typo: !faqFor(q) })
    .filter((m) => !tp || !tp.words.some((w) => { const i = q.indexOf(w); return i >= 0 && hasWord(q, w) && m.start < i + w.length && m.end > i; }))
    // 요즘 주제 낱말('한적한'·'조용한') 자리에 걸린 지명 후보는 버린다
    .filter((m) => !tsp || m.end <= tsp[0] || m.start >= tsp[1]);
  const person = readPerson(q, d.trips);
  const year = readYear(q, now);
  const season = readSeason(q);
  const hasTime = year != null || (season != null && /(간|갔|다녀)/.test(q));

  // 지명 후보 정리: 하나로 정해진 것 / 여러 곳 / 광역 묶음
  let places: Place[] = forced ? [forced] : [];
  let groupId: string | null = null;
  const ambiguous: Mention[] = [];
  for (const m of mentions) {
    if (m.entry.kind === 'group') {
      groupId = m.entry.group ?? null;
      continue;
    }
    if (m.entry.places.length === 1) places.push(m.entry.places[0]);
    else ambiguous.push(m);
  }
  // '거기·그곳'처럼 가리키면 앞 질문의 장소를 이어 쓴다.
  // 장소 없이 '어디 가면 좋아?·추천'처럼 새로 고르는 질문은 앞 장소를 잇지 않는다.
  const refers = /거기|그곳|그\s*지역|여기|그럼|그러면|거긴|거기서/.test(q);
  // 새로 고르는 질문·조건(달·계절·테마·동행·날씨)이 나오면 앞 장소를 잇지 않는다. 짧은 되물음만 잇는다 ('맛집은?', '언제 가면 좋아')
  const freshPick = /어디\s*(갈|가지|가면|가볼|가 볼|좋)|추천|갈\s*만한|놀러|여행지|가기\s*좋은\s*(곳|데)|갈\s*수\s*있는|뭐\s*있어|목록|보여\s*줘/.test(q) || !!trendTopicOf(q)
    || readMonth(q) != null || readSeason(q) != null || readThemes(q).pos.length > 0 || /벚꽃|단풍|눈꽃|해돋이|아이|애들|가족|부모님|강아지|반려|비\s*오|주말|당일/.test(q);
  const followUp = refers || (!places.length && !groupId && !ambiguous.length && !freshPick && q.replace(/\s/g, '').length <= 16);
  if (!places.length && !groupId && !ambiguous.length && followUp && ctx.place) places = [ctx.place];

  const intent = intentOf(q, places.length ? places : ambiguous.length ? [ambiguous[0].entry.places[0]] : [], person != null, hasTime, groupId != null);

  // 애매한 지명은 되묻기
  if (ambiguous.length && !places.length && !['stats', 'time', 'people', 'wishList', 'again'].includes(intent)) {
    const m = ambiguous[0];
    return {
      intent: 'choose',
      text: `'${m.entry.label}'${josa.pick(m.entry.label, '은/는')} 여러 곳이에요. 어디를 말씀하시는 거예요?`,
      buttons: m.entry.places.slice(0, 8).map((p) => ({ label: placeName(p), choose: p })),
      ctx: { ...ctx, intent },
    };
  }

  const p = places[0] ?? null;
  const done = d.trips.filter((t) => t.status === 'done');
  let a: Omit<Answer, 'ctx'>;
  switch (intent) {
    case 'compare': {
      const [x, y] = places;
      const row = (pl: Place) => {
        const c = info(d, pl);
        const s = seasonFor(d.seasons, pl);
        return `${placeName(pl)}: ${c ? c.main.theme : ''}${s ? ` · 좋은 때 ${monthsLabel(s.m)}` : ''} · 우리 ${tripsAt(d.trips, pl).length ? times(tripsAt(d.trips, pl).length) : '아직 안 가 봤어요'}${c ? ` · 먹거리 ${c.main.foods.slice(0, 2).join(', ')}` : ''}`;
      };
      a = { intent, text: `${jo(placeLabel(x), '와/과')} ${placeLabel(y)} 비교`, lines: [row(x), row(y)], buttons: [{ label: `${placeLabel(x)} 자세히`, ask: `${placeLabel(x)} 볼거리` }, { label: `${placeLabel(y)} 자세히`, ask: `${placeLabel(y)} 볼거리` }], source: INFO_SRC(d) };
      break;
    }
    case 'again': {
      const kindQ = /카페|커피/.test(q) ? 'cafe' : /맛집|식당|밥집|음식/.test(q) ? 'food' : /숙소|호텔/.test(q) ? 'stay' : null;
      const list = d.recs.filter((r) => r.verdict === 'again' && (!p || samePlace(r.region, p)) && (!kindQ || r.kind === kindQ));
      a = list.length
        ? { intent, text: `또 가자고 한 곳 ${list.length}곳`, lines: list.slice(0, 10).map((r) => `${r.name} · ${placeName(r.region)}`), buttons: list.slice(0, 4).map((r) => ({ label: r.name, to: `/places/${r.id}` })), source: '우리 맛집·명소' }
        : { intent, text: '아직 "또 갈래요"로 남긴 장소가 없어요', lines: ['여행 상세에서 장소를 남기고 "또 갈래요"를 눌러 보세요.'], buttons: [{ label: '맛집·명소', to: '/places' }] };
      break;
    }
    case 'wishList': {
      const mine = p ? d.wishes.filter((w) => samePlace(w.place, p)) : [];
      if (p && mine.length) {
        const w = mine[0];
        const lines = [w.foods.length ? `맛집·카페: ${w.foods.join(', ')}` : '', w.spots.length ? `관광지·볼거리: ${w.spots.join(', ')}` : '', w.todos.length ? `해볼 것: ${w.todos.join(', ')}` : '', w.note ? `메모: ${w.note.slice(0, 60)}` : ''].filter(Boolean);
        a = { intent, text: `${placeName(p)} 가고 싶은 곳에 적어 둔 것${lines.length ? '' : ' — 아직 비어 있어요'}`, lines: lines.length ? lines : ['들를 곳을 적어 두면 계획할 때 담기 후보로 먼저 나와요.'], buttons: [{ label: '열어 보기', to: `/wishes/${w.id}` }, { label: '여기로 계획', to: `/plan?place=${placeParam(p)}` }], source: '우리 기록' };
        break;
      }
      if (p && !mine.length) { a = { intent, text: `${jo(placeName(p), '은/는')} 아직 가고 싶은 곳에 없어요`, buttons: [{ label: '가고 싶은 곳에 담기', wish: p }, { label: '가고 싶은 곳 모두', to: '/wishes' }] }; break; }
      const who = memberNamesIn(q);
      const ws = who ? d.wishes.filter((w) => (w.wantedBy ?? []).includes(who)) : d.wishes;
      a = ws.length
        ? { intent, text: `${who ? `${withJosa(who, '이/가')} 가고 싶다고 한 곳` : '가고 싶은 곳'} ${ws.length}곳`, lines: ws.slice(0, 8).map((w) => `${placeName(w.place)}${!who && w.wantedBy?.length ? ` · ${w.wantedBy.join('·')}` : ''}`), buttons: [{ label: '모두 보기', to: '/wishes' }], source: '우리 기록' }
        : who ? { intent, text: `${withJosa(who, '이/가')} 원한다고 표시한 곳이 아직 없어요`, lines: ['가고 싶은 곳 카드의 하트(누가 원해요)를 누르면 여기서 보여요.'], buttons: [{ label: '가고 싶은 곳', to: '/wishes' }] }
        : { intent, text: '아직 담은 곳이 없어요', buttons: [{ label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }, { label: '여행지 뽑기', to: '/wishes' }] };
      break;
    }
    case 'distance': {
      const [x, y] = places;
      const rx = x.t === 'kr' ? REGION_BY_CODE.get(x.code) : null, ry = y.t === 'kr' ? REGION_BY_CODE.get(y.code) : null;
      if (rx && ry) {
        const km = Math.round(straightKm(rx, ry));
        const road = Math.round(km * 1.3), min = Math.round((road / 70) * 60);
        const h = Math.floor(min / 60), mm = min % 60;
        a = { intent, text: `${placeLabel(x)}에서 ${placeLabel(y)}까지 직선 ${km}km`, lines: [`길로는 ${road}km쯤 · 차로 ${h ? `${h}시간 ` : ''}${mm ? `${mm}분` : ''} 안팎 (시·군 가운데 기준 어림)`, '정확한 시간은 길찾기 앱으로 봐 주세요.'], buttons: [{ label: '여행 상세의 가는 길', to: `/plan?place=${placeParam(x)}` }, { label: '네이버지도 길찾기', url: `https://map.naver.com/p/directions/-/-/-/car?c=15.00,0,0,0,dh` }], source: '직선거리 어림' };
      } else a = { intent, text: '국내 시·군끼리만 거리를 어림해요', lines: [p ? `${withJosa(placeLabel(p), '은/는')} 해외라 비행시간을 물어보세요 (예: "오사카 몇 시간 걸려")` : ''].filter(Boolean), buttons: [] };
      break;
    }
    case 'media': {
      const ph = d.photos ?? [], ns = d.notes ?? [];
      const byT = (id: string | null) => d.trips.find((t) => t.id === id)?.title ?? '';
      if (/글|메모/.test(q) && !/사진/.test(q)) {
        const recent = [...ns].slice(-5).reverse();
        a = ns.length ? { intent, text: `지금까지 남긴 글 ${ns.length}개`, lines: recent.map((n) => `"${n.text.slice(0, 36)}${n.text.length > 36 ? '…' : ''}" · ${byT(n.tripId)}${n.by?.name ? ` · ${n.by.name}` : ''}`), buttons: recent.slice(0, 2).map((n) => ({ label: byT(n.tripId) || '글 보기', to: `/trips/${n.tripId}?tab=notes` })), source: '우리 기록' } : { intent, text: '아직 남긴 글이 없어요', lines: ['여행 상세의 글 탭에서 한 줄씩 남겨 보세요.'], buttons: [{ label: '여행', to: '/trips' }] };
      } else {
        const perTrip = new Map<string, number>();
        for (const x of ph) perTrip.set(x.tripId ?? '', (perTrip.get(x.tripId ?? '') ?? 0) + 1);
        const top = [...perTrip.entries()].sort((a2, b2) => b2[1] - a2[1]).slice(0, 4);
        a = ph.length ? { intent, text: `사진 ${ph.length}장이 있어요`, lines: top.map(([id, n]) => `${byT(id) || '여행 없이'} · ${n}장`), buttons: [{ label: '피드', to: '/feed' }, { label: '추억', to: '/memories' }], source: '우리 기록' } : { intent, text: '아직 올린 사진이 없어요', lines: ['피드 맨 위에서 여행을 골라 바로 올릴 수 있어요.'], buttons: [{ label: '피드', to: '/feed' }] };
      }
      break;
    }
    case 'wishAdd': {
      a = p ? { intent, text: `${jo(placeName(p), '을/를')} 가고 싶은 곳에 담을까요?`, lines: [seasonLine(d, p) ?? ''].filter(Boolean), buttons: [{ label: '가고 싶은 곳에 담기', wish: p }, { label: '볼거리 먼저', ask: `${placeLabel(p)} 볼거리` }] } : unknown(q);
      break;
    }
    case 'people': {
      const list = done.filter((t) => t.companions.some((c) => c.includes(person!) || person!.includes(c)));
      a = list.length
        ? { intent, text: `${jo(person, '와/과')} 간 여행 ${times(list.length)}`, lines: list.slice(0, 8).map((t) => `${formatWhen(t.when)} · ${t.title}`), buttons: list.slice(0, 3).map((t) => ({ label: t.title, to: `/trips/${t.id}` })), source: '우리 기록' }
        : { intent, text: `${jo(person, '와/과')} 간 기록을 찾지 못했어요`, lines: ['기록할 때 "누구와"에 이름을 넣으면 여기서 찾을 수 있어요.'], buttons: [{ label: '기록 남기기', to: '/record' }] };
      break;
    }
    case 'time': {
      const list = done.filter((t) => (year == null || t.when.y === year) && (season == null || (t.when.s ?? (t.when.m ? (['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'] as Season[])[t.when.m - 1] : null)) === season));
      const label = [year ? (year === now.getFullYear() ? '올해' : year === now.getFullYear() - 1 ? '작년' : `${year}년`) : '', season ? SEASON_LABEL[season] : ''].filter(Boolean).join(' ');
      a = list.length
        ? { intent, text: `${label}에 간 곳 ${times(list.length)}`, lines: list.slice(0, 8).map((t) => `${formatWhen(t.when)} · ${t.title}`), buttons: list.slice(0, 3).map((t) => ({ label: t.title, to: `/trips/${t.id}` })), source: '우리 기록' }
        : { intent, text: `${label}에 간 기록이 없어요`, lines: ['날짜를 모르는 기록은 추억 탭의 "날짜 채우기 놀이"로 채울 수 있어요.'], buttons: [{ label: '추억', to: '/memories' }] };
      break;
    }
    case 'stats': {
      const s = computeStats(d.trips);
      const y = now.getFullYear();
      const thisYear = done.filter((t) => t.when.y === y).length;
      const top = [...s.cellVisits.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([code, n]) => `${placeLong({ t: 'kr', code })} ${times(n)}`);
      if (has(q, /제일\s*많이|가장\s*많이|자주|많이\s*간/)) {
        a = { intent, text: top.length ? `제일 많이 간 곳은 ${top[0]}` : '아직 기록이 없어요', lines: top.slice(1).map((t, i) => `${i + 2}위 ${t}`), buttons: [{ label: '지도 보기', to: '/map' }], source: '우리 기록' };
        break;
      }
      a = { intent, text: `지금까지 여행 ${times(s.tripsDone)}, 핀 ${s.pins}개`, lines: [`시·군 ${s.cellVisits.size}/${TOTAL_CELLS} (${Math.round((s.cellVisits.size / TOTAL_CELLS) * 100)}%)`, `광역 ${s.groupsVisited.size}/${TOTAL_GROUPS}`, `나라 ${s.countryVisits.size}곳 · 대륙 ${s.continents.size}곳`, `올해 ${times(thisYear)}`, top.length ? `자주 간 곳: ${top.join(', ')}` : ''].filter(Boolean), buttons: [{ label: '지도 보기', to: '/map' }, { label: '추억', to: '/memories' }], source: '우리 기록' };
      break;
    }
    case 'faq': {
      const f = faqFor(q, places.length > 0) ?? faqFor(q)!;
      // 나라를 말했으면 세계 도시 자료의 그 나라 입국·콘센트 메모를 앞에 (손 메모라 '떠나기 전 확인'과 함께)
      const cty = places.find((x) => x.t === 'country');
      const city = cty && cty.t === 'country' ? d.world?.cities.find((c) => c.c === cty.id) : undefined;
      // 외교부 자료는 따로 받는다(abroad.ts): 아직 없으면 그 줄은 빼고 손 메모로 답하되, 다음 질문을 위해 받기 시작한다
      const gov = city ? visaFor(city.c, abroadNow()) : null, alarm = city ? alarmFor(city.c, abroadNow()) : null;
      if (city && !abroadNow()) void loadAbroad();
      const extra = city ? (f.id === 'plug' ? [`${countryName(city)} 콘센트: ${city.plug}`] : [`${countryName(city)} 입국: ${gov ? `${gov.text} (외교부 ${gov.at} 기준)` : `${city.entry} (세계 도시 자료)`} · 떠나기 전 확인`, ...(alarm ? [`여행경보: ${alarm.text} (외교부 ${alarm.at} 기준)`] : [])]) : [];
      a = { intent, text: f.a, lines: [...extra, ...f.lines], buttons: f.link ? [{ label: f.link.label, url: f.link.href }] : [], source: `보라핀 여행 상식 · ${(faqData as { updated: string }).updated} 기준${f.volatile ? ' · 규정이 자주 바뀌어요, 떠나기 전 확인' : ''}` };
      break;
    }
    case 'pattern': {
      a = travelPattern(done, d);
      break;
    }
    case 'recommend': {
      a = recommend(q, d, now, null, groupId);
      if (!a.unused) a = { ...a, unused: unusedWords(q, d.info) };
      break;
    }
    case 'hello': {
      const t = /고마워|고맙|감사/.test(q) ? '별말씀을요! 다음 여행도 같이 궁리해요' : /잘\s*자|수고/.test(q) ? '오늘도 수고했어요. 푹 쉬어요' : /사랑/.test(q) ? '저도요! 어디로 떠나 볼까요?' : `안녕하세요! 어디 갈지, 어디 갔었는지 뭐든 물어보세요`;
      a = { intent, text: t, buttons: [{ label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }, { label: '요즘 축제', ask: '요즘 축제' }, { label: '다음 여행', ask: '다음 여행 언제야' }] };
      break;
    }
    case 'help': {
      a = {
        intent,
        text: '이런 걸 물어볼 수 있어요',
        lines: ['여행정보: "강릉 맛집", "제주 볼거리", "부산 어떻게 가", "여수 특산물"', '언제: "제주 언제 가면 좋아", "이번 달 가기 좋은 곳", "요즘 축제"', '우리 기록: "강릉 몇 번 갔어", "작년 여름에 간 곳", "엄마랑 간 곳", "순두부 어디였지"', '계획: "다음 여행 언제야", "제주 준비물", "안 가본 곳 추천", "태국 vs 베트남"'],
        buttons: [{ label: '요즘 축제', ask: '요즘 축제' }, { label: '우리 통계', ask: '우리 몇 곳 갔어?' }, { label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }],
      };
      break;
    }
    case 'weather': {
      if (!p) { a = unknown(q); break; }
      const month = readMonth(q) ?? now.getMonth() + 1;
      const w = cityFor(d.world ?? null, p);
      const key = p.t === 'country' ? `${p.id}:${w?.city ?? p.city ?? ''}` : '';
      const wl = key ? wearLine(d.wear?.[key] ?? null, month) : null;
      const sl = seasonLine(d, p);
      const lines = [wl ? `${month}월 옷차림: ${wl}` : '', sl ?? '', '날씨 예보는 보라핀이 못 봐요. 평년 기후로 말씀드린 거라 떠나기 전엔 예보를 한 번 봐 주세요.'].filter(Boolean);
      a = { intent, text: wl ? `${placeName(p)} ${month}월은 ${wl.split(' · ')[0]}이에요` : `${placeName(p)} 날씨는 평년 기준으로만 알아요`, lines, buttons: [...placeButtons(p), { label: '네이버 날씨', url: `https://search.naver.com/search.naver?query=${encodeURIComponent(`${placeLabel(p)} 날씨`)}` }], source: wl ? 'NASA POWER 월평균 · 보라핀 좋은 때 자료' : '보라핀 좋은 때 자료' };
      break;
    }
    case 'plan': {
      if (!p) { a = unknown(q); break; }
      const nm = q.match(/(\d)\s*박/);
      const nights = nm ? Math.min(4, +nm[1]) : null;
      a = { intent, text: `${placeName(p)} ${nights != null ? `${nights}박 ${nights + 1}일 ` : ''}계획은 다섯 걸음으로 같이 짜요`, lines: ['언제 → 숙소 → 담기(가고 싶어요·관광공사 자료) → 동선 → 기대. 중간에 멈춰도 저장돼요.', ...(d.wishes.some((x) => samePlace(x.place, p)) ? ['가고 싶은 곳에 적어 둔 들를 곳이 담기 후보로 먼저 나와요.'] : [])], buttons: [{ label: '계획 다섯 걸음 시작', to: `/plan?place=${placeParam(p)}${nights != null ? `&nights=${nights}` : ''}` }, { label: '볼거리 먼저', ask: `${placeLabel(p)} 볼거리` }], source: '보라핀 계획하기' };
      break;
    }
    case 'money': {
      const ab = d.abroad !== undefined ? d.abroad : abroadNow();
      if (d.abroad === undefined && !ab) void loadAbroad();
      const w = p ? cityFor(d.world ?? null, p) : null;
      const CUR: [RegExp, string][] = [[/엔/, 'JPY 엔'], [/달러|불\b/, 'USD 달러'], [/유로/, 'EUR 유로'], [/바트/, 'THB 바트'], [/위안|런민비/, 'CNY 위안'], [/동\b|베트남/, 'VND 동'], [/페소/, 'PHP 페소'], [/파운드/, 'GBP 파운드'], [/대만|타이완/, 'TWD 대만달러'], [/홍콩/, 'HKD 홍콩달러'], [/싱가포르/, 'SGD 싱가포르달러'], [/프랑/, 'CHF 프랑'], [/루피아|발리|인도네시아/, 'IDR 루피아'], [/링깃/, 'MYR 링깃']];
      const cur = w?.cur ?? CUR.find(([re]) => re.test(q))?.[1] ?? null;
      const fx = cur ? fxFor(cur, ab) : null;
      a = cur
        ? { intent, text: fx ? `${fx.text}` : `${cur} · 환율 자료를 아직 못 받았어요`, lines: [fx ? `수출입은행 ${fx.at} 기준 · 실제 환전 때는 수수료가 붙어요` : '인터넷에 연결되면 다시 물어보세요.', ...(w ? [`${w.city}: ${COST_LABEL[w.cost]}`] : [])], buttons: p ? placeButtons(p) : [], source: fx ? '한국수출입은행 환율' : undefined }
        : { intent, text: '어느 나라 돈인지 알려 주세요', lines: ['예: "엔화 환율", "태국 바트 얼마야"'], buttons: [] };
      break;
    }
    case 'festival': {
      const fd = d.festivals ?? null;
      const month = readMonth(q);
      const from = month ? new Date(now.getFullYear() + (month < now.getMonth() + 1 ? 1 : 0), month - 1, 1) : now;
      const days = month ? 31 : /요즘|지금|이번\s*주|주말/.test(q) ? 21 : 60;
      if (p && p.t === 'kr') {
        const list = upcomingFestivals(fd, p.code, from, 120);
        a = list.length
          ? { intent, text: `${placeName(p)} 축제 ${list.length}개`, lines: list.slice(0, 6).map((f) => `${isOngoing(f, now) ? '지금 열려요 · ' : ''}${f.t} · ${festivalPeriod(f)}`), buttons: [...placeButtons(p), ...search(`${placeLabel(p)} 축제`)], source: '한국관광공사 TourAPI' }
          : { intent, text: `${placeName(p)}에 다가오는 축제 자료가 없어요`, lines: [fd?.updated ? '관광공사에 등록된 축제만 보여 드려요.' : '축제 자료를 아직 받지 못했어요. 인터넷에 연결되면 다시 물어보세요.'], buttons: [...placeButtons(p), ...search(`${placeLabel(p)} 축제`)] };
      } else {
        const all = Object.entries(fd?.cells ?? {}).flatMap(([code, _]) => upcomingFestivals(fd, code, from, days).map((f) => ({ code, f })));
        const groupId2 = groupId;
        const filtered = groupId2 ? all.filter((x) => REGION_BY_CODE.get(x.code)?.group === groupId2) : all;
        const sorted = filtered.sort((x, y) => Number(isOngoing(y.f, now)) - Number(isOngoing(x.f, now)) || x.f.s.localeCompare(y.f.s));
        const picks = dailyShuffle(sorted.slice(0, 40), q).slice(0, 6).sort((x, y) => Number(isOngoing(y.f, now)) - Number(isOngoing(x.f, now)) || x.f.s.localeCompare(y.f.s));
        const head = month ? `${month}월 축제` : /요즘|지금|이번\s*주|주말/.test(q) ? '요즘 열리는 축제' : '다가오는 축제';
        a = picks.length
          ? { intent, text: `${groupId2 ? (GROUPS.find((g) => g.id === groupId2)?.name ?? '') + ' ' : ''}${head}`, lines: picks.map(({ code, f }) => `${placeLong({ t: 'kr', code })} · ${f.t} · ${festivalPeriod(f)}${isOngoing(f, now) ? ' (지금)' : ''}`), buttons: [...picks.slice(0, 3).map(({ code }) => ({ label: `${placeLabel({ t: 'kr', code })} 자세히`, ask: `${placeLabel({ t: 'kr', code })} 축제` })), { label: '다른 축제', ask: q + ' ' }], source: '한국관광공사 TourAPI' }
          : { intent, text: '그때 열리는 축제 자료가 없어요', lines: [fd?.updated ? '관광공사에 등록된 축제만 보여 드려요.' : '축제 자료를 아직 받지 못했어요. 인터넷에 연결되면 다시 물어보세요.'], buttons: search('이번 달 축제') };
      }
      break;
    }
    case 'next': {
      const planned = d.trips.filter((t) => t.status === 'planned').sort((x, y) => (x.when.y ? x.when.y * 10000 + (x.when.m ?? 0) * 100 + (x.when.d ?? 0) : 9e9) - (y.when.y ? y.when.y * 10000 + (y.when.m ?? 0) * 100 + (y.when.d ?? 0) : 9e9));
      a = planned.length
        ? { intent, text: `다음 여행은 ${planned[0].title}${dday(planned[0].when, now) ? ` · ${dday(planned[0].when, now)}` : ''}`, lines: planned.slice(0, 6).map((t) => `${formatWhen(t.when)} · ${t.title} · ${t.places.map(placeLabel).join(', ')}${(t.packing?.length ?? 0) ? ` · 준비물 ${t.packing!.filter((x) => x.done).length}/${t.packing!.length}` : ''}`), buttons: planned.slice(0, 3).map((t) => ({ label: t.title, to: `/trips/${t.id}` })), source: '우리 기록' }
        : { intent, text: '예정된 여행이 아직 없어요', lines: ['가고 싶은 곳에서 "여행 만들기"를 누르거나, 여행 계획하기에서 후보 3곳 중에 골라 보세요.'], buttons: [{ label: '가고 싶은 곳', to: '/wishes' }, { label: '여행 계획하기', to: '/plan' }] };
      break;
    }
    case 'packing': {
      const abroad = p?.t === 'country';
      const theme = p ? info(d, p)?.main.theme ?? '' : '';
      const kind = /바다|해변|휴양|섬|리조트/.test(theme + q) ? 'rest' : /산|숲|계곡|트레킹|등산|자연/.test(theme + q) ? 'nature' : /아이|가족|부모/.test(q) ? 'family' : 'city';
      const items = packFromTemplate(kind, abroad).map((x) => x.t);
      const s2 = p ? seasonFor(d.seasons, p) : null;
      a = {
        intent,
        text: `${p ? placeName(p) + ' ' : ''}준비물 ${items.length}가지${abroad ? ' (해외)' : ''}`,
        lines: [items.join(', '), s2?.why ? `날씨: ${s2.why}` : ''].filter(Boolean),
        buttons: [{ label: '여행 만들기', to: p ? `/plan?place=${placeParam(p)}` : '/plan' }, ...(p ? placeButtons(p).filter((b) => b.label !== '여행 만들기') : [])],
        source: '보라핀 기본 준비물',
      };
      break;
    }
    case 'find': {
      const STOP = /^(어디였지|어디였더라|뭐였지|기억|찾아|검색|우리|우리가|우리들이|갔던|먹었던|갔었지|갔었어|갔지|갔어|갔던데|어디|중에|중|가운데|있는|있던|보이|보이는|보였던|보인|데|곳|그|거기|간|다녀온|남긴|했던|뭐|뭐야|좀|제일|가장|근처|쪽)$/;
      // 오타 고치기로 붙은 지명(예: '보이는'→보령)은 거르기에 쓰지 않는다: 질문에 그 이름이 그대로 있을 때만
      const fp = p && mentions.some((m) => m.entry.places.length === 1 && samePlace(m.entry.places[0], p) && q.slice(m.start, m.end).includes(m.entry.label.slice(0, 2))) ? p : null;
      const PART = /(에서|으로|이랑|하고|에는|은|는|이|가|을|를|에|로|와|과|도|만|랑|였지|였더라)$/;
      // 한 글자라도 뜻이 있는 말(산·강·뷰·숲·섬)은 남긴다
      const words = q.replace(/[?!.,~]/g, ' ').split(/\s+/).map((w) => w.replace(PART, '')).filter((w) => (w.length >= 2 || /^(산|강|뷰|숲|섬|들|논|밭)$/.test(w)) && !STOP.test(w));
      // 비슷한 말: 바다 = 오션·해변·바닷가 (한 줄 평에 '오션뷰'라고 적었어도)
      const SAME: [RegExp, string[]][] = [[/^(바다|오션|오션뷰|해변|바닷가)$/, ['바다', '오션', '해변', '바닷가']], [/^(산|산뷰|마운틴)$/, ['산', '숲', '마운틴']], [/^(야경|밤)$/, ['야경', '밤']], [/^(루프탑|옥상)$/, ['루프탑', '옥상', '테라스']]];
      const alts = (w: string) => SAME.find(([re]) => re.test(w))?.[1] ?? [w];
      // 종류 말(카페·맛집)은 거르는 조건으로, 나머지는 찾는 말로
      const kinds = words.filter((w) => /^(카페|커피|맛집|식당|밥집|술집|빵집|숙소|호텔)$/.test(w));
      const keys = words.filter((w) => !kinds.includes(w));
      const kindOk = (r: PlaceRec) => !kinds.length || kinds.some((k) => (/카페|커피/.test(k) ? r.kind === 'cafe' : /숙소|호텔/.test(k) ? r.kind === 'stay' : r.kind === 'food' || r.kind === 'cafe'));
      const hit = (text: string) => (keys.length ? keys.some((w) => alts(w).some((x) => text.includes(x))) : true);
      const beenOnly = /간|갔|다녀온|먹은|마신/.test(q);
      const recs = d.recs.filter((r) => kindOk(r) && (!beenOnly || r.status !== 'want') && (fp ? samePlace(r.region, fp) : true) && hit([r.name, r.address ?? '', r.memo ?? '', placeName(r.region), ...Object.values(r.reviews ?? {})].join(' ')));
      const notes = keys.length ? (d.notes ?? []).filter((n) => hit(n.text)) : [];
      const trips = keys.length && !kinds.length ? d.trips.filter((t) => hit([t.title, t.memo, ...(t.tags ?? [])].join(' '))) : [];
      const lines = [
        ...recs.slice(0, 5).map((r) => `우리 맛집·명소: ${r.name} · ${placeName(r.region)}${r.verdict === 'again' ? ' (또 갈래요)' : ''}`),
        ...notes.slice(0, 4).map((n) => { const t = d.trips.find((x) => x.id === n.tripId); return `글: "${n.text.slice(0, 40)}"${t ? ` · ${t.title}` : ''}`; }),
        ...trips.slice(0, 4).map((t) => `여행: ${t.title} · ${formatWhen(t.when)}`),
      ];
      a = lines.length
        ? { intent, text: keys.length ? `'${keys.join(' ')}'${withRo(keys.join(' ')).slice(keys.join(' ').length)} 찾은 기록 ${recs.length + notes.length + trips.length}건` : `${kinds.join(' ')} 기록 ${recs.length}건`, lines, buttons: [...recs.slice(0, 2).map((r) => ({ label: r.name, to: `/places/${r.id}` })), ...notes.slice(0, 2).map((n) => ({ label: '글 보기', to: `/trips/${n.tripId}` })), ...trips.slice(0, 2).map((t) => ({ label: t.title, to: `/trips/${t.id}` }))], source: '우리 기록' }
        : (() => {
            // 못 찾았을 때: 무엇을 어디서 찾았는지 그대로 말하고, 그 종류의 가게를 몇 곳 보여 준다 (고르기 쉽게)
            const pool = d.recs.filter((r) => kindOk(r) && (!beenOnly || r.status !== 'want') && (fp ? samePlace(r.region, fp) : true));
            const kindWord = kinds.length ? (/카페|커피/.test(kinds[0]) ? '카페' : /숙소|호텔/.test(kinds[0]) ? '숙소' : '맛집') : '맛집·명소';
            const keyWord = keys.length ? `'${keys.join(' ')}'${josaOnly(keys.join(' '), '이/가')}` : '';
            const head = `${fp ? placeName(fp) + '에서 ' : ''}${beenOnly ? '다녀온' : '담아 둔'} ${kindWord} ${pool.length}곳`;
            return {
              intent,
              text: pool.length ? `${head} 중 ${keyWord ? `${keyWord} 들어간 곳은 없어요` : '맞는 곳이 없어요'}` : `${fp ? placeName(fp) + '에 ' : ''}${beenOnly ? '다녀온' : '담아 둔'} ${withJosa(kindWord, '이/가')} 아직 없어요`,
              lines: [
                ...pool.slice(0, 4).map((r) => `${r.name} · ${placeName(r.region)}${r.verdict === 'again' ? ' (또 갈래요)' : ''}`),
                keys.length ? '가게 이름·주소·한 줄 평·메모에서 찾아요. 한 줄 평에 적어 두면 다음엔 찾아 드려요.' : '',
              ].filter(Boolean),
              buttons: [...pool.slice(0, 2).map((r) => ({ label: r.name, to: `/places/${r.id}` })), { label: '맛집·명소', to: '/places' }],
              source: '우리 기록',
            };
          })();
      break;
    }
    case 'map': {
      a = p ? { intent, text: `${jo(placeName(p), '을/를')} 지도에서 볼게요`, buttons: [{ label: '지도 열기', to: `/map?sel=${placeParam(p)}` }] } : { intent, text: '우리 지도', buttons: [{ label: '지도 열기', to: '/map' }] };
      break;
    }
    case 'count':
      if (!p && groupId) {
        const g = GROUPS.find((x) => x.id === groupId)!;
        const list = done.filter((t) => t.places.some((x) => x.t === 'kr' && REGION_BY_CODE.get(x.code)?.group === groupId));
        a = { intent, text: `${g.id === 'jngj' ? '광주·전남' : g.name}에 ${times(list.length)} 다녀왔어요`, lines: list.slice(0, 8).map((t) => `${formatWhen(t.when)} · ${t.title}`), buttons: [], source: '우리 기록' };
        break;
      }
      a = answerFor(intent, p, q, d, now);
      break;
    default:
      if (!p && groupId && intent !== 'unknown') {
        a = recommend(q, d, now, null, groupId);
        a.text = `${GROUPS.find((x) => x.id === groupId)!.name}: ${a.text}`;
      } else a = answerFor(intent, p, q, d, now);
  }
  return { ...a, ctx: { place: p ?? ctx.place ?? null, intent: a.intent, pending: a.pending ?? null, lastQ: a.intent === 'recommend' ? (a.pending?.q ?? q) : null } };
}

/** 첫 화면 버튼 (자유 입력을 줄인다) */
export const STARTERS = ['요즘 축제', '안 가본 곳 추천', '이번 달 가기 좋은 곳', '다음 여행 언제야', '우리 몇 곳 갔어?', '또 가자고 한 맛집'];
