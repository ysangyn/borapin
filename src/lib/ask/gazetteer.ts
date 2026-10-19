import { COUNTRIES, GROUPS, REGIONS, searchPlaces } from '../geo';
import type { TravelInfo } from '../travelinfo';
import type { Place } from '../types';

/**
 * 지명 사전: 행정구역 이름·줄임말·옛 이름, 광역시의 구·군, 여행정보의 명소, 나라·인기 도시.
 * "설악산", "해운대"처럼 지역 이름이 없는 질문도 알아듣는다.
 */
export type GazKind = 'region' | 'group' | 'gu' | 'spot' | 'country' | 'city';
export interface GazEntry {
  key: string;
  kind: GazKind;
  places: Place[];
  /** 지역 묶음(광역)일 때 그 id */
  group?: string;
  label: string;
}

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/** 여러 시·군에 걸친 산·강·바다 (바로 이동하지 않고 고르게 한다) */
const MULTI: Record<string, string[]> = {
  설악산: ['속초시', '양양군', '인제군'],
  지리산: ['남원시', '구례군', '산청군', '하동군', '함양군'],
  한라산: ['제주'],
  오대산: ['평창군', '홍천군', '강릉시'],
  덕유산: ['무주군', '거창군'],
  내장산: ['정읍시', '순창군'],
  한려수도: ['통영시', '거제시', '남해군', '여수시'],
  동해바다: ['강릉시', '속초시', '동해시', '삼척시', '양양군', '고성군@gangwon'],
};

/** 인기 해외 도시 → 나라 */
const CITIES: Record<string, string> = {
  도쿄: 'JPN', 오사카: 'JPN', 교토: 'JPN', 후쿠오카: 'JPN', 삿포로: 'JPN', 오키나와: 'JPN', 나고야: 'JPN', 고베: 'JPN',
  방콕: 'THA', 치앙마이: 'THA', 푸켓: 'THA', 파타야: 'THA',
  다낭: 'VNM', 하노이: 'VNM', 호치민: 'VNM', 나트랑: 'VNM', 푸꾸옥: 'VNM', 하롱베이: 'VNM', 달랏: 'VNM',
  세부: 'PHL', 보라카이: 'PHL', 마닐라: 'PHL', 보홀: 'PHL',
  타이베이: 'TWN', 가오슝: 'TWN', 타이중: 'TWN',
  상하이: 'CHN', 베이징: 'CHN', 칭다오: 'CHN', 장가계: 'CHN', 하얼빈: 'CHN',
  파리: 'FRA', 니스: 'FRA', 런던: 'GBR', 로마: 'ITA', 피렌체: 'ITA', 베네치아: 'ITA', 밀라노: 'ITA',
  바르셀로나: 'ESP', 마드리드: 'ESP', 리스본: 'PRT', 프라하: 'CZE', 빈: 'AUT', 취리히: 'CHE', 인터라켄: 'CHE',
  뉴욕: 'USA', 로스앤젤레스: 'USA', 엘에이: 'USA', 라스베이거스: 'USA', 샌프란시스코: 'USA', 하와이: 'USA', 호놀룰루: 'USA',
  시드니: 'AUS', 멜버른: 'AUS', 오클랜드: 'NZL', 발리: 'IDN', 코타키나발루: 'MYS', 쿠알라룸푸르: 'MYS',
  블라디보스토크: 'RUS', 이스탄불: 'TUR', 두바이: 'ARE', 몰디브: 'MDV', 울란바토르: 'MNG',
};

/** 일상 낱말과 겹치는 나라 이름 ('가나요', '오만 원', '몇 나라') */
const NOISY = new Set(['가나', '오만', '말리', '차드', '토고', '기니', '나라', '이란', '레드']);

let cache: { info: TravelInfo; list: GazEntry[] } | null = null;

export function buildGazetteer(info: TravelInfo): GazEntry[] {
  if (cache?.info === info) return cache.list;
  const list: GazEntry[] = [];
  const add = (key: string, kind: GazKind, places: Place[], label: string, group?: string) => {
    const k = norm(key);
    if ((k.length < 2 && k !== '괌') || NOISY.has(k)) return;
    const same = list.find((e) => e.key === k && e.kind === kind);
    if (same) {
      for (const p of places) if (!same.places.some((x) => JSON.stringify(x) === JSON.stringify(p))) same.places.push(p);
      return;
    }
    list.push({ key: k, kind, places: [...places], label, group });
  };
  const byName = new Map<string, string[]>();
  for (const r of REGIONS) byName.set(r.name, [...(byName.get(r.name) ?? []), r.code]);

  // 시·군 (이름, 줄임말 '강릉')
  for (const r of REGIONS) {
    const p: Place = { t: 'kr', code: r.code };
    add(r.name, 'region', [p], r.name);
    const stem = r.name.replace(/(특별자치시|특별자치도|특별시|광역시|시|군)$/, '');
    if (stem !== r.name && stem.length >= 2) add(stem, 'region', [p], r.name);
  }
  // 광역 (짧은 이름, 정식 이름, 옛 이름)
  const OLD: Record<string, string[]> = {
    gangwon: ['강원도'], jeonbuk: ['전라북도', '전북'], jngj: ['전라남도', '전남', '전남광주'], gyeongbuk: ['경상북도'], gyeongnam: ['경상남도'],
    chungbuk: ['충청북도'], chungnam: ['충청남도'], gyeonggi: ['경기도'], jeju: ['제주도'], seoul: ['서울시'], busan: ['부산시'],
  };
  for (const g of GROUPS) {
    const cells = REGIONS.filter((r) => r.group === g.id).map((r) => ({ t: 'kr', code: r.code }) as Place);
    if (cells.length < 2) continue; // 광역시는 시·군 한 칸이라 위에서 이미 들어감
    for (const k of [g.name, g.sido, ...(OLD[g.id] ?? [])]) add(k, 'group', cells, g.id === 'jngj' ? '광주·전남' : g.name, g.id);
  }
  // 광역시의 구·군 (여행정보의 하위 항목) — '중구'처럼 여러 곳이면 되묻는다
  for (const [code, c] of Object.entries(info.cells)) {
    for (const s of c.subs) {
      const p: Place = { t: 'kr', code };
      add(s.name, 'gu', [p], s.name);
      const stem = s.name.replace(/(구|군|시)$/, '');
      if (stem.length >= 2 && !byName.has(stem) && !/^(중|동|서|남|북)$/.test(stem)) add(stem, 'gu', [p], s.name);
    }
  }
  // 여행정보의 명소 ('안목 커피거리' → 강릉)
  for (const [code, c] of Object.entries(info.cells)) {
    for (const e of [c.main, ...c.subs]) {
      for (const raw of e.spots) {
        for (const part of raw.split(/[·/]|&|\(|\)/)) {
          const name = part.trim();
          if (norm(name).length >= 3) add(name, 'spot', [{ t: 'kr', code }], name);
        }
      }
    }
  }
  for (const [k, names] of Object.entries(MULTI)) {
    const places = names.flatMap((n) => {
      const [nm, grp] = n.split('@');
      return REGIONS.filter((r) => r.name === nm && (!grp || r.group === grp)).map((r) => ({ t: 'kr', code: r.code }) as Place);
    });
    add(k, 'spot', places, k);
  }
  // 나라·도시
  for (const c of COUNTRIES) {
    add(c.name, 'country', [{ t: 'country', id: c.id }], c.name);
    if (c.en.length >= 4) add(c.en, 'country', [{ t: 'country', id: c.id }], c.name);
  }
  for (const [city, id] of Object.entries(CITIES)) add(city, 'city', [{ t: 'country', id, city }], city);
  // 긴 이름부터 맞춘다
  list.sort((a, b) => b.key.length - a.key.length);
  cache = { info, list };
  return list;
}

/** 지명으로 잘못 알아듣기 쉬운 흔한 낱말 */
const STOP = new Set([
  '우리', '부부', '연인', '남편', '아내', '여권', '공항', '패턴', '성향', '비자', '환전', '언제', '어디', '가면', '좋아', '좋은', '여행', '추천', '맛집', '먹거리', '볼거리', '가볼', '이번', '다음', '지난', '작년', '올해',
  '재작년', '오늘', '저녁', '주말', '바다', '산', '섬', '오만', '거기', '여기', '그곳', '알려줘', '보여줘', '갔어', '갔지', '가자', '했던',
  '어때', '뭐하지', '뭐해', '뭐', '몇', '번', '곳', '어디가', '나아', '비교', '말고', '보러', '만한', '갈만한', '다녀온', '같이', '함께',
  '축제', '준비물', '챙겨', '챙길', '예정', '여행지', '어디였지', '마신', '고마워', '안녕', '도움말', '가본', '안가본', '가봤', '가봤나', '벚꽃', '단풍', '당일치기', '가까운', '근처', '내년', '제일', '가장', '많이',
]);
const JOSA_END = /(에서|으로|이랑|하고|에는|은|는|이|가|을|를|에|로|와|과|도|만|랑)$/;

export interface Mention {
  entry: GazEntry;
  start: number;
  end: number;
}

/** 문장에서 지명 찾기: 긴 이름 먼저, 겹치면 앞선 것만. 없으면 오타·초성으로 한 번 더 */
export function findMentions(q: string, info: TravelInfo): Mention[] {
  const text = norm(q);
  const list = buildGazetteer(info);
  const taken: boolean[] = new Array(text.length).fill(false);
  const out: Mention[] = [];
  for (const e of list) {
    let from = 0;
    while (true) {
      const i = text.indexOf(e.key, from);
      if (i < 0) break;
      const end = i + e.key.length;
      if (!taken.slice(i, end).some(Boolean)) {
        // '동해'(바다) 같은 2글자 줄임말이 더 긴 일반 낱말 안에 묻힌 경우는 건너뛴다
        out.push({ entry: e, start: i, end });
        for (let k = i; k < end; k++) taken[k] = true;
      }
      from = end;
    }
  }
  if (!out.length) {
    // 오타: 낱말마다 장소 검색 (강능 → 강릉). 흔한 낱말은 건너뛰고, 정확히 같거나 한 글자 차이만 받는다.
    const words = q.split(/\s+/).map((t) => t.replace(/[?!.,~]/g, '').replace(JOSA_END, '')).filter((t) => t.length >= 2 && !STOP.has(t));
    for (const tok of words) {
      const hit = searchPlaces(tok, 1)[0];
      if (hit && (hit.score === 102 || hit.score === 100 || hit.score === 82 || hit.score === 80 || hit.score === 42 || hit.score === 40)) {
        out.push({ entry: { key: norm(tok), kind: hit.place.t === 'kr' ? 'region' : 'country', places: [hit.place], label: hit.label }, start: text.indexOf(norm(tok)), end: text.indexOf(norm(tok)) + norm(tok).length });
        break;
      }
    }
  }
  return out.sort((a, b) => a.start - b.start);
}
