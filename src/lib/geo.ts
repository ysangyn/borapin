import regionsData from '../data/regions.json';
import countriesData from '../data/countries.json';
import citiesData from '../data/cities.json';
import { getChoseong, disassemble } from 'es-hangul';
import type { Place } from './types';

export interface Region {
  code: string;
  name: string;
  group: string;
  groupName: string;
  sido: string;
  lng: number;
  lat: number;
}
export interface Group { id: string; name: string; sido: string }
export interface Country {
  id: string;
  iso2: string | null;
  name: string;
  en: string;
  continent: string;
  lng: number;
  lat: number;
}

export const REGIONS: Region[] = regionsData.regions;
export const GROUPS: Group[] = regionsData.groups;
export const COUNTRIES: Country[] = (countriesData as Country[]).filter((c) => c.id !== 'KOR');
export const REGION_BY_CODE = new Map(REGIONS.map((r) => [r.code, r]));
export const COUNTRY_BY_ID = new Map(COUNTRIES.map((c) => [c.id, c]));

/** 해외 주요 도시 (나라, 이름, 영문, 다른 이름들…). 검색에서 '청도'→'칭다오 · 중국'처럼 바로 뜨게 */
export interface City { country: string; name: string; en: string; aliases: string[] }
export const CITIES: City[] = (citiesData as string[][]).map(([country, name, en, ...aliases]) => ({ country, name, en, aliases }));
export const CONTINENTS = ['아시아', '유럽', '북아메리카', '남아메리카', '아프리카', '오세아니아'];

export function regionLabel(code: string): string {
  return REGION_BY_CODE.get(code)?.name ?? code;
}

/** 광역 단위 짧은 이름. 전남광주통합특별시 안의 옛 전남 시·군은 '전남'으로 부른다. */
export function areaShort(r: Region): string {
  if (r.group === 'jngj') return r.code === '29' ? '광주' : '전남';
  return r.groupName;
}

/** 지역의 짧은 위치 설명: '강원 강릉시', '서울', '전남 여수시' */
export function regionLong(code: string): string {
  const r = REGION_BY_CODE.get(code);
  if (!r) return code;
  const area = areaShort(r);
  return area === r.name ? r.name : `${area} ${r.name}`;
}

export function placeLabel(p: Place): string {
  if (p.t === 'kr') return regionLabel(p.code);
  const c = COUNTRY_BY_ID.get(p.id);
  const base = c ? c.name : p.id;
  return p.city ? `${p.city}` : base;
}

export function placeLong(p: Place): string {
  if (p.t === 'kr') return regionLong(p.code);
  const c = COUNTRY_BY_ID.get(p.id);
  const base = c ? c.name : p.id;
  return p.city ? `${base} ${p.city}` : base;
}

export function isDomestic(p: Place): boolean {
  return p.t === 'kr';
}

// ---------- 검색: 띄어쓰기·조사·초성·오타를 너그럽게 ----------
const JOSA = /(에서|으로|에게|까지|부터|이랑|하고|에는|에선|은|는|이|가|을|를|에|로|와|과|도|만)$/;

export function normalizeQuery(q: string): string {
  return q.replace(/\s+/g, '').replace(JOSA, '').toLowerCase();
}

function isChoseongOnly(q: string) {
  return /^[ㄱ-ㅎ]+$/.test(q);
}

/** 자모 단위 편집거리 (짧은 지명용) */
function jamoDistance(a: string, b: string): number {
  const x = disassemble(a), y = disassemble(b);
  const dp = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j++) dp[0][j] = j;
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return dp[x.length][y.length];
}

export interface SearchHit { place: Place; label: string; sub: string; score: number }

function scoreName1(name: string, q: string): number {
  const n = name.replace(/\s+/g, '').toLowerCase();
  const stem = n.replace(/(특별자치시|특별자치도|특별시|광역시|시|군|구|도)$/, '');
  if (n === q || stem === q) return 100;
  if (n.startsWith(q) || stem.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  if (isChoseongOnly(q)) {
    const ch = getChoseong(n);
    if (ch.startsWith(q)) return 50;
    if (ch.includes(q)) return 35;
  }
  if (q.length >= 2 && stem.length >= 2 && Math.abs(stem.length - q.length) <= 1) {
    const d = jamoDistance(stem, q);
    if (d <= 1) return 40;
    if (d <= 2 && q.length >= 3) return 25;
  }
  return 0;
}

export function searchPlaces(query: string, limit = 12): SearchHit[] {
  // '청도'·'독도'처럼 끝 글자가 조사와 같은 이름도 있으니, 조사를 뗀 것과 안 뗀 것 중 더 잘 맞는 쪽으로
  const raw = query.replace(/\s+/g, '').toLowerCase();
  const stripped = normalizeQuery(query);
  const qs = raw && raw !== stripped ? [raw, stripped] : [stripped];
  const scoreName = (name: string, _q: string) => Math.max(...qs.map((q) => scoreName1(name, q)));
  const enHit = (en: string) => qs.some((q) => en.toLowerCase().startsWith(q));
  const q = stripped;
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const r of REGIONS) {
    const s = Math.max(scoreName(r.name, q), scoreName(areaShort(r) + r.name, q) - 5, scoreName(r.groupName, q) - 30, scoreName(r.sido, q) - 30);
    if (s > 0) hits.push({ place: { t: 'kr', code: r.code }, label: r.name, sub: areaShort(r) === r.name ? '국내' : `국내 · ${areaShort(r)}`, score: s + 2 });
  }
  for (const c of COUNTRIES) {
    const s = Math.max(scoreName(c.name, q), enHit(c.en) ? 70 : 0);
    if (s > 0) hits.push({ place: { t: 'country', id: c.id }, label: c.name, sub: `해외 · ${c.continent}`, score: s });
  }
  for (const c of CITIES) {
    const country = COUNTRY_BY_ID.get(c.country);
    if (!country) continue;
    // 다른 이름(청도·북경 …)으로 찾았으면 국내 같은 이름보다 아래, 본 이름이면 나라와 같은 급
    const own = Math.max(scoreName(c.name, q), enHit(c.en) ? 70 : 0);
    const alias = Math.max(0, ...c.aliases.map((a) => scoreName(a, q))) - 8;
    const s = Math.max(own, alias);
    if (s > 0) hits.push({ place: { t: 'country', id: c.country, city: c.name }, label: c.name, sub: `${country.name} · ${c.en}`, score: s - 1 });
  }
  hits.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, 'ko'));
  return hits.slice(0, limit);
}

/** 주소창용: kr:51150 · country:JPN · country:JPN:교토 */
export const placeParam = (p: Place) =>
  p.t === 'kr' ? `kr:${p.code}` : `country:${p.id}${p.city ? `:${encodeURIComponent(p.city)}` : ''}`;

export function parsePlaceParam(v: string | null): Place[] {
  if (!v) return [];
  const [t, id, city] = v.split(':');
  if (t === 'kr' && id && REGION_BY_CODE.has(id)) return [{ t: 'kr', code: id }];
  if (t === 'country' && id) return [city ? { t: 'country', id, city: decodeURIComponent(city) } : { t: 'country', id }];
  return [];
}
