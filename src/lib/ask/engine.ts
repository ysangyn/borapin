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
import { monthsLabel, seasonFor, type SeasonData } from '../seasons';
import type { TravelInfo } from '../travelinfo';
import type { Place, PlaceRec, Season, Trip, Wish } from '../types';
import { dailyShuffle, samePlace } from '../wishes';
import { findMentions, type Mention } from './gazetteer';
import { josa } from 'es-hangul';
import { times } from '../ko';

/** 이름 뒤 조사: '강릉시는', '부산을' */
const jo = (w: string | null | undefined, pair: Parameters<typeof josa>[1]) => (w ? josa(w, pair) : '');

export type Intent =
  | 'overview' | 'spots' | 'foods' | 'goods' | 'transport' | 'season'
  | 'count' | 'when' | 'time' | 'people' | 'again' | 'compare'
  | 'recommend' | 'stats' | 'wishAdd' | 'wishList' | 'map' | 'choose' | 'unknown';

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

export interface Answer {
  intent: Intent;
  text: string;
  lines?: string[];
  buttons: Btn[];
  source?: string;
  ctx: AskCtx;
}

export interface AskCtx {
  place?: Place | null;
  intent?: Intent;
}

export interface AskData {
  trips: Trip[];
  wishes: Wish[];
  recs: PlaceRec[];
  info: TravelInfo;
  seasons: SeasonData | null;
  now?: Date;
}

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
  return { pos: [...new Set(pos)].filter((x) => !neg.includes(x)), neg: [...new Set(neg)] };
}
const PEOPLE = /(엄마|아빠|부모님|어머니|아버지|동생|친구|가족|언니|오빠|누나|형|장모님|장인|시어머니|시아버지|조카|아이|애들)/;
function readPerson(q: string, trips: Trip[]): string | null {
  const names = new Set(trips.flatMap((t) => t.companions).filter((c) => c !== '보라' && c !== '영상'));
  for (const n of names) if (n.length >= 2 && q.includes(n)) return n;
  const m = q.match(PEOPLE);
  return m ? m[1] : null;
}

function intentOf(q: string, places: Place[], hasPerson: boolean, hasTime: boolean, hasGroup = false): Intent {
  if (places.length >= 2 && has(q, /비교|vs|어디가\s*(더|나아)|중에|랑.*중|차이/)) return 'compare';
  if (has(q, /또\s*(가|갈)|다시\s*가고\s*싶은\s*(맛집|가게|장소|카페)|또\s*갈래/)) return 'again';
  if (has(q, /가고\s*싶은\s*곳/) && !places.length && !has(q, /추천/)) return 'wishList';
  if (places.length && has(q, /가고\s*싶|담아|위시|찜/)) return 'wishAdd';
  if (has(q, /몇\s*번|몇\s*회|얼마나\s*(자주|많이)?\s*(갔|다녀)/) && (places.length || hasGroup)) return 'count';
  if (has(q, /언제\s*(갔|다녀|가봤|가 봤)|갔던\s*(때|날)|마지막(으로)?\s*(간|갔|다녀)/)) return 'when';
  if (hasPerson && has(q, /(랑|하고|와|과|이랑)\s*(간|갔|다녀|여행)|같이\s*(간|갔)|함께\s*(간|갔)/)) return 'people';
  if (has(q, /몇\s*(곳|군데|개|퍼|%)|달성|통계|얼마나\s*칠|몇\s*나라|몇\s*번\s*(여행|갔)/) && !places.length) return 'stats';
  if (hasTime && has(q, /(간|갔|다녀온|다녀왔|여행한)\s*(곳|데|여행)?|어디\s*(갔|다녀)/)) return 'time';
  if (has(q, /언제\s*가|몇\s*월(에|이)?\s*(가|좋)|가기\s*좋은|시기|성수기|날씨\s*좋/)) return 'season';
  if (has(q, /맛집|먹거리|먹을|음식|뭐\s*먹|먹으러|식당|카페/)) return 'foods';
  if (has(q, /특산|기념품|선물|사\s*올|사올|쇼핑/)) return 'goods';
  if (has(q, /교통|어떻게\s*가|가는\s*(법|길|방법)|ktx|기차|버스|공항|배편|비행기/i)) return 'transport';
  if (has(q, /추천|어디\s*(갈|가지|가면)|갈\s*만한|가\s*볼\s*만한\s*곳\s*(있|어디)|놀러|여행지/) && !(places.length === 1 && places[0].t === 'kr' && !has(q, /추천/))) return 'recommend';
  if (has(q, /볼거리|가볼|가 볼|볼\s*만|구경|관광|명소|뭐\s*(하|해|봐)|할\s*거|코스|가\s*볼\s*곳/)) return 'spots';
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
    { label: '여행 만들기', to: `/record?status=planned&place=${placeParam(p)}` },
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
        // 해외: 기본 정보 + 가기 좋은 때 + 우리 기록
        const country = p.t === 'country' ? COUNTRY_BY_ID.get(p.id) : null;
        const lines = [seasonLine(d, p), visitsLine(d, p), ...ours.slice(0, 3).map((r) => `우리 장소: ${r.name}${r.verdict === 'again' ? ' (또 갈래요)' : ''}`)].filter(Boolean) as string[];
        return {
          intent,
          text: `${placeName(p)}${country ? ` · ${country.continent}` : ''}`,
          lines: [...lines, '해외 볼거리·먹거리 정보는 아직 모으는 중이에요. 아래 검색으로 이어서 볼 수 있어요.'],
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
      } else {
        lines.push(`볼거리: ${m.spots.join(', ')}`);
        if (intent === 'overview') lines.push(`먹거리: ${m.foods.join(', ')}`);
        if (subs.length) lines.push(`구·군별로도 볼 수 있어요: ${subs.join(', ')}${c.subs.length > 4 ? ' …' : ''}`);
        const sights = ours.filter((r) => r.kind === 'sight');
        if (sights.length) lines.push(`우리가 남긴 곳: ${sights.map((r) => r.name).join(', ')}`);
      }
      if (m.note) lines.push(`참고: ${m.note}`);
      const sl = seasonLine(d, p);
      if (sl && intent !== 'transport') lines.push(sl);
      if (intent === 'overview') lines.push(visitsLine(d, p));
      const next: Btn[] = intent === 'foods' ? [{ label: '볼거리는?', ask: `${placeLabel(p)} 볼거리` }] : [{ label: '맛집은?', ask: `${placeLabel(p)} 맛집` }];
      return { intent, text: `${placeName(p)} · ${m.theme}`, lines, buttons: placeButtons(p, next), source: INFO_SRC(d) };
    }
    case 'season': {
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

function recommend(q: string, d: AskData, _now: Date, monthArg?: number | null, groupId?: string | null): Omit<Answer, 'ctx'> {
  const month = monthArg ?? readMonth(q);
  const { pos, neg } = readThemes(q);
  const unvisited = /안\s*가\s*본|안가본|처음|새로운|못\s*가\s*본/.test(q);
  const stats = computeStats(d.trips);
  let list = candidates({ scope: groupId ?? 'kr', unvisitedOnly: unvisited, theme: pos[0] ?? null, stats, info: d.info, wishes: [] });
  if (neg.length) {
    const res = neg.map((n) => THEMES.find((t) => t.id === n)!.re);
    list = list.filter((c) => !(c.place.t === 'kr' && res.some((re) => re.test([c.theme, ...(c.spots ?? [])].join(' ')))));
  }
  if (month) list = list.filter((c) => seasonFor(d.seasons, c.place)?.m.includes(month));
  const picks = dailyShuffle(list, q).slice(0, 3);
  const themeLabel = pos.map((p) => THEMES.find((t) => t.id === p)!.label).join('·');
  const head = [month ? `${month}월에` : '', themeLabel ? `${themeLabel} 보러` : '', unvisited ? '안 가본' : ''].filter(Boolean).join(' ');
  if (!picks.length) return { intent: 'recommend', text: '조건에 맞는 곳을 찾지 못했어요', lines: ['조건을 하나 빼고 다시 물어보세요.'], buttons: [{ label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }] };
  return {
    intent: 'recommend',
    text: `${head ? head + ' ' : ''}가 볼 만한 곳 ${picks.length}곳`,
    lines: picks.map((c) => {
      const s = seasonFor(d.seasons, c.place);
      return `${placeName(c.place)} · ${c.theme ?? ''}${s ? ` · ${monthsLabel(s.m)}` : ''}`;
    }),
    buttons: picks.flatMap((c) => [{ label: `${placeLabel(c.place)} 자세히`, ask: `${placeLabel(c.place)} 볼거리` }, { label: `${placeLabel(c.place)} 담기`, wish: c.place }]).concat([{ label: '다른 곳', ask: q + ' ' }]),
    source: `${INFO_SRC(d)} · 날씨: NASA POWER 월평균`,
  };
}

/** 질문 하나에 답한다. ctx는 직전 대화(지역·질문 틀) */
export function ask(question: string, ctx: AskCtx, d: AskData, forced?: Place): Answer {
  const now = d.now ?? new Date();
  const q = question.trim().replace(/[?!.~]+$/g, '');
  const mentions: Mention[] = forced ? [] : findMentions(q, d.info);
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
  const refers = /거기|그곳|그\s*지역|여기|그럼|그러면/.test(q);
  const freshPick = /어디\s*(갈|가지|가면|가볼|가 볼|좋)|추천|갈\s*만한|놀러|여행지/.test(q);
  const followUp = refers || (!places.length && !groupId && !ambiguous.length && !freshPick);
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
        return `${placeName(pl)}: ${c ? c.main.theme : ''}${s ? ` · 좋은 때 ${monthsLabel(s.m)}` : ''} · 우리 ${tripsAt(d.trips, pl).length}번${c ? ` · 먹거리 ${c.main.foods.slice(0, 2).join(', ')}` : ''}`;
      };
      a = { intent, text: `${jo(placeLabel(x), '와/과')} ${placeLabel(y)} 비교`, lines: [row(x), row(y)], buttons: [{ label: `${placeLabel(x)} 자세히`, ask: `${placeLabel(x)} 볼거리` }, { label: `${placeLabel(y)} 자세히`, ask: `${placeLabel(y)} 볼거리` }], source: INFO_SRC(d) };
      break;
    }
    case 'again': {
      const list = d.recs.filter((r) => r.verdict === 'again' && (!p || samePlace(r.region, p)));
      a = list.length
        ? { intent, text: `또 가자고 한 곳 ${list.length}곳`, lines: list.slice(0, 10).map((r) => `${r.name} · ${placeName(r.region)}`), buttons: list.slice(0, 4).map((r) => ({ label: r.name, to: `/places/${r.id}` })), source: '우리 장소' }
        : { intent, text: '아직 "또 갈래요"로 남긴 장소가 없어요', lines: ['여행 상세에서 장소를 남기고 "또 갈래요"를 눌러 보세요.'], buttons: [{ label: '우리 장소', to: '/places' }] };
      break;
    }
    case 'wishList': {
      a = d.wishes.length
        ? { intent, text: `가고 싶은 곳 ${d.wishes.length}곳`, lines: d.wishes.slice(0, 8).map((w) => placeName(w.place)), buttons: [{ label: '모두 보기', to: '/wishes' }], source: '우리 기록' }
        : { intent, text: '아직 담은 곳이 없어요', buttons: [{ label: '안 가본 곳 추천', ask: '안 가본 곳 추천' }, { label: '여행지 뽑기', to: '/wishes' }] };
      break;
    }
    case 'wishAdd': {
      a = p ? { intent, text: `${jo(placeName(p), '을/를')} 가고 싶은 곳에 담을까요?`, lines: [seasonLine(d, p) ?? ''].filter(Boolean), buttons: [{ label: '가고 싶은 곳에 담기', wish: p }, { label: '볼거리 먼저', ask: `${placeLabel(p)} 볼거리` }] } : unknown(q);
      break;
    }
    case 'people': {
      const list = done.filter((t) => t.companions.some((c) => c.includes(person!) || person!.includes(c)));
      a = list.length
        ? { intent, text: `${jo(person, '와/과')} 간 여행 ${list.length}번`, lines: list.slice(0, 8).map((t) => `${formatWhen(t.when)} · ${t.title}`), buttons: list.slice(0, 3).map((t) => ({ label: t.title, to: `/trips/${t.id}` })), source: '우리 기록' }
        : { intent, text: `${jo(person, '와/과')} 간 기록을 찾지 못했어요`, lines: ['기록할 때 "누구와"에 이름을 넣으면 여기서 찾을 수 있어요.'], buttons: [{ label: '기록 남기기', to: '/record' }] };
      break;
    }
    case 'time': {
      const list = done.filter((t) => (year == null || t.when.y === year) && (season == null || (t.when.s ?? (t.when.m ? (['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'] as Season[])[t.when.m - 1] : null)) === season));
      const label = [year ? (year === now.getFullYear() ? '올해' : year === now.getFullYear() - 1 ? '작년' : `${year}년`) : '', season ? SEASON_LABEL[season] : ''].filter(Boolean).join(' ');
      a = list.length
        ? { intent, text: `${label}에 간 곳 ${list.length}번`, lines: list.slice(0, 8).map((t) => `${formatWhen(t.when)} · ${t.title}`), buttons: list.slice(0, 3).map((t) => ({ label: t.title, to: `/trips/${t.id}` })), source: '우리 기록' }
        : { intent, text: `${label}에 간 기록이 없어요`, lines: ['날짜를 모르는 기록은 추억 탭의 "날짜 채우기 놀이"로 채울 수 있어요.'], buttons: [{ label: '추억', to: '/memories' }] };
      break;
    }
    case 'stats': {
      const s = computeStats(d.trips);
      const y = now.getFullYear();
      const thisYear = done.filter((t) => t.when.y === y).length;
      a = { intent, text: `지금까지 ${s.tripsDone}번의 여행, 핀 ${s.pins}개`, lines: [`시·군 ${s.cellVisits.size}/${TOTAL_CELLS} (${Math.round((s.cellVisits.size / TOTAL_CELLS) * 100)}%)`, `광역 ${s.groupsVisited.size}/${TOTAL_GROUPS}`, `나라 ${s.countryVisits.size}곳 · 대륙 ${s.continents.size}곳`, `올해 ${thisYear}번`], buttons: [{ label: '지도 보기', to: '/map' }, { label: '추억', to: '/memories' }], source: '우리 기록' };
      break;
    }
    case 'recommend': {
      a = recommend(q, d, now, null, groupId);
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
  return { ...a, ctx: { place: p ?? ctx.place ?? null, intent: a.intent } };
}

/** 첫 화면 버튼 (자유 입력을 줄인다) */
export const STARTERS = ['안 가본 곳 추천', '이번 달 가기 좋은 곳', '우리 몇 곳 갔어?', '작년에 간 곳', '또 가자고 한 맛집', '가고 싶은 곳'];
