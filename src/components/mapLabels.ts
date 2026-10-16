import { COUNTRIES, GROUPS, REGIONS } from '../lib/geo';
import type { Stats } from '../lib/data';

/**
 * 지도 위 지역 이름. 지도 글꼴 서버 없이 HTML 글자로 올리고, 겹치면 중요한 것만 남긴다.
 *  - 국내: 확대 5.6~6.6 → 도 이름 + 광역시, 6.6 이상 → 시·군 이름
 *  - 세계: 확대 2.2 이상 → 나라 이름
 */
export type LabelKind = 'province' | 'metro' | 'cell' | 'country';

export interface MapLabel {
  key: string;
  text: string;
  lng: number;
  lat: number;
  kind: LabelKind;
  /** 기본 우선순위 (클수록 먼저 자리 잡음) */
  base: number;
  /** 크기 비교용 id (경계 면적) */
  sizeKey?: string;
  visited: (s: Stats | null) => boolean;
  w: number;
  h: number;
}

const FONT: Record<LabelKind, number> = { province: 13, metro: 11.5, cell: 11, country: 11.5 };

function estWidth(text: string, fs: number) {
  let w = 0;
  for (const ch of text) w += /[ㄱ-힝]/.test(ch) ? fs * 0.98 : fs * 0.62;
  return Math.ceil(w + 8);
}

function make(l: Omit<MapLabel, 'w' | 'h'>): MapLabel {
  const fs = FONT[l.kind];
  return { ...l, w: estWidth(l.text, fs), h: Math.ceil(fs + 7) };
}

const METRO_CODES = new Set(['11', '26', '27', '28', '29', '30', '31', '36110']);

// 도 이름은 경계 중심보다 보기 좋은 자리에 (광역시 이름과 덜 겹치게)
const PROVINCE_POS: Record<string, [number, number]> = {
  gyeonggi: [127.38, 37.28],
  gangwon: [128.3, 37.72],
  chungbuk: [127.78, 36.82],
  chungnam: [126.82, 36.5],
  jeonbuk: [127.12, 35.72],
  jngj: [126.95, 34.85],
  gyeongbuk: [128.75, 36.35],
  gyeongnam: [128.22, 35.3],
  jeju: [126.55, 33.38],
};

export const PROVINCE_LABELS: MapLabel[] = [
  ...GROUPS.filter((g) => PROVINCE_POS[g.id]).map((g) =>
    make({
      key: `g-${g.id}`,
      text: g.id === 'jngj' ? '전남' : g.name,
      lng: PROVINCE_POS[g.id][0],
      lat: PROVINCE_POS[g.id][1],
      kind: 'province',
      base: 200,
      visited: (s) => !!s?.groupsVisited.has(g.id),
    }),
  ),
  ...REGIONS.filter((r) => METRO_CODES.has(r.code)).map((r) =>
    make({
      key: `m-${r.code}`,
      text: r.name,
      lng: r.lng,
      lat: r.lat,
      kind: 'metro',
      base: r.code === '11' ? 260 : 150,
      visited: (s) => !!s?.cellVisits.has(r.code),
    }),
  ),
];

export const CELL_LABELS: MapLabel[] = REGIONS.map((r) =>
  make({
    key: `c-${r.code}`,
    text: r.name,
    lng: r.lng,
    lat: r.lat,
    kind: 'cell',
    base: METRO_CODES.has(r.code) ? 300 : r.name.endsWith('시') ? 150 : 50,
    sizeKey: `kr:${r.code}`,
    visited: (s) => !!s?.cellVisits.has(r.code),
  }),
);

export const COUNTRY_LABELS: MapLabel[] = [
  make({ key: 'n-KOR', text: '한국', lng: 127.8, lat: 36.3, kind: 'country', base: 500, visited: (s) => !!s && s.cellVisits.size > 0 }),
  ...COUNTRIES.map((c) =>
    make({
      key: `n-${c.id}`,
      text: c.name,
      lng: c.lng,
      lat: c.lat,
      kind: 'country',
      base: 0,
      sizeKey: `w:${c.id}`,
      visited: (s) => !!s?.countryVisits.has(c.id),
    }),
  ),
];

export function labelsFor(mode: 'kr' | 'world', zoom: number): MapLabel[] {
  if (mode === 'kr') return zoom >= 6.6 ? CELL_LABELS : zoom >= 5.6 ? PROVINCE_LABELS : [];
  return zoom >= 2.2 ? COUNTRY_LABELS : [];
}
