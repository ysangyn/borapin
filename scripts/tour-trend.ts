/**
 * 관광빅데이터 (CI 매일, 실패하면 지난 자료): 시·군마다 외지인 하루 평균(최근 28일)·작년 같은 28일 대비·순위 + 연관 관광지 + 관광지 붐빔
 * → src/data/trend.json (+ public/data/trend.json 사본)
 * {
 *   at: 'YYYY-MM-DD', window: { from, to },                       // 최근 28일 (자료가 있는 마지막 날까지)
 *   regions: { [우리 코드]: { out, outPrev, growth, rank, related: [{ n, m }], crowd: [{ n, r }] } },
 *   hot: [코드…최대 15: growth 높은 순, out이 중앙값 이상], quiet: [코드…최대 20: out 낮은 순, 광역시 제외]
 * }
 * 자료: 한국관광공사 TourAPI — DataLabService/locgoRegnVisitrDDList(기초지자체 방문자, 외지인 touDivCd 2),
 *       TarRlteTarService1/areaBasedList1(연관 관광지, 지난달), TatsCnctrRateService/tatsCnctrRatedList(관광지 집중률 %, 최근 7일 평균)
 * 우리 코드(src/data/regions.json) = 법정동 시군구 5자리. 광역시·제주는 2자리(그 구·군을 합친다), 청주·천안·포항·창원·전주도 2자리(행정구를 합친다).
 * 계산은 순수 함수(시험: tests/unit/trend.test.ts). 실제 호출은 CI에서만(이 작업 공간은 공공데이터 API가 막혀 있다).
 * SAMPLE=1 이면 받은 원본 2줄씩 찍는다. FORCE=1 이면 오늘 자료가 있어도 다시 받는다.
 * 지난 자료: 로컬 파일에 내용이 없으면(새 체크아웃·자리표시) 실제 주소(/data/trend.json)의 것을 먼저 받아 둔다 (scripts/data-health.ts).
 */
import { loadPrevious, readJson, seedFiles, trendHealth, writeJsonTo } from './data-health';

// ---------- 모양 ----------
export type Region = { code: string; name: string; sido?: string };
export type VisitItem = { signguCode?: string; signguNm?: string; touDivCd?: string; touNum?: string | number; baseYmd?: string };
export type RelatedItem = { tAtsNm?: string; rlteTatsNm?: string; rlteRegnNm?: string; rlteSignguNm?: string; rlteRank?: string | number };
export type CrowdItem = { tAtsNm?: string; cnctrRate?: string | number; baseYmd?: string };
export type RegionCore = { out: number; outPrev: number | null; growth: number | null; rank: number };
export type RegionTrend = RegionCore & { related: { n: string; m: string }[]; crowd: { n: string; r: number }[] };
export type TrendFile = { at: string; window: { from: string; to: string }; regions: Record<string, RegionTrend>; hot: string[]; quiet: string[] };
export type Resolver = (signguCode: string, signguNm?: string) => string | null;

// ---------- 날짜 (YYYYMMDD, UTC 기준으로 더하고 빼기만) ----------
const ymd8 = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
export function addDays(ymd: string, n: number): string {
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)));
  d.setUTCDate(d.getUTCDate() + n);
  return ymd8(d);
}
export const dash = (ymd: string) => `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
/** 최근 days일(last까지)과 작년 같은 기간. 작년은 364일(52주) 전으로 해서 요일이 맞게 한다 */
export function windowsOf(last: string, days = 28): { cur: { from: string; to: string }; prev: { from: string; to: string } } {
  const from = addDays(last, -(days - 1));
  return { cur: { from, to: last }, prev: { from: addDays(from, -364), to: addDays(last, -364) } };
}
/** 지난달부터 n달 전까지 YYYYMM */
export function prevMonths(today: string, n: number): string[] {
  const y = +today.slice(0, 4), m = +today.slice(4, 6);
  return Array.from({ length: n }, (_, i) => { const d = new Date(Date.UTC(y, m - 1 - (i + 1), 1)); return ymd8(d).slice(0, 6); });
}

// ---------- 시·군 코드 맞추기 ----------
/** 2자리 코드인데 광역시가 아닌 곳(행정구가 있는 시): 그 시의 법정동 코드 앞 4자리 (청주 43110, 천안 44130, 포항 47110, 창원 48120, 전주 52110) */
const CITY4: Record<string, string> = { '43': '4311', '44': '4413', '47': '4711', '48': '4812', '52': '5211' };
const normName = (s: string) => s.replace(/통합특별시|특별자치시|특별자치도|광역시|특별시/g, '').trim();
/**
 * 관광공사 시군구 코드(법정동 5자리)·이름 → 우리 코드. 못 맞추면 null.
 * 1) 5자리가 그대로 우리 코드 2) 광역시·제주처럼 시도 전체가 한 칸이면 앞 2자리
 * 3) 같은 시도 안에서 이름이 같거나 '청주시 상당구'처럼 시작 4) 행정구(수원시 장안구 41111 → 수원시 41110): 앞 4자리가 같은 시
 */
export function makeResolver(regions: Region[]): Resolver {
  const exact = new Set(regions.filter((r) => r.code.length === 5).map((r) => r.code));
  const byPrefix = new Map<string, Region[]>();
  for (const r of regions) byPrefix.set(r.code.slice(0, 2), [...(byPrefix.get(r.code.slice(0, 2)) ?? []), r]);
  const whole = new Set([...byPrefix.entries()].filter(([p, rs]) => rs.length === 1 && rs[0].code === p).map(([p]) => p));
  // 관광공사 자료는 광주·전남을 옛 번호 '12'로 묶는다 (12210~12330 구 = 광주광역시, 나머지 12xxx = 전남 시·군, 번호가 법정동과 달라 이름으로 맞춤)
  const LEGACY: Record<string, (sg: string) => string> = { '12': (sg) => (/^12(21|24|27|30|33)0$/.test(sg) ? '29' : '46') };
  return (signguCode, signguNm = '') => {
    const sg = String(signguCode ?? '').trim();
    const p2 = LEGACY[sg.slice(0, 2)]?.(sg) ?? sg.slice(0, 2);
    if (exact.has(sg)) return sg;
    if (whole.has(p2)) return p2;
    const cands = byPrefix.get(p2) ?? [];
    const nm = normName(String(signguNm ?? ''));
    const first = nm.split(/\s+/)[0] ?? '';
    const byName = cands.find((r) => nm === r.name || first === r.name || (!/[시군구]$/.test(r.name) && first === `${r.name}시`));
    if (byName) return byName.code;
    const city = cands.find((r) => r.code.length === 2 && CITY4[r.code] && sg.startsWith(CITY4[r.code]));
    if (city) return city.code;
    const byFour = cands.find((r) => r.code.length === 5 && r.code.endsWith('0') && r.code.slice(0, 4) === sg.slice(0, 4));
    return byFour ? byFour.code : null;
  };
}
/** 광역시(·특별시) 코드: '한적한 곳'에서 뺀다 */
export const metroCodes = (regions: Region[]): string[] => regions.filter((r) => r.code.length === 2 && /광역시|특별시/.test(r.sido ?? '')).map((r) => r.code);

// ---------- 계산 (순수) ----------
/** 외지인(touDivCd 2) 하루 평균: 우리 코드마다 날짜별로 합친 뒤(광역시는 구들을 더함) 날짜 수로 나눈다. sub = 합쳐진 관광공사 코드, 외지인 많은 순 */
export function avgOut(items: VisitItem[], resolve: Resolver): Record<string, { out: number; days: number; sub: string[] }> {
  const acc = new Map<string, { byDay: Map<string, number>; bySub: Map<string, number> }>();
  for (const it of items) {
    if (String(it.touDivCd ?? '').trim() !== '2') continue;
    const sg = String(it.signguCode ?? ''), day = String(it.baseYmd ?? ''), n = Number(it.touNum);
    if (!sg || !day || !Number.isFinite(n)) continue;
    const code = resolve(sg, String(it.signguNm ?? ''));
    if (!code) continue;
    let a = acc.get(code);
    if (!a) acc.set(code, (a = { byDay: new Map(), bySub: new Map() }));
    a.byDay.set(day, (a.byDay.get(day) ?? 0) + n);
    a.bySub.set(sg, (a.bySub.get(sg) ?? 0) + n);
  }
  const out: Record<string, { out: number; days: number; sub: string[] }> = {};
  for (const [code, a] of acc) {
    const total = [...a.byDay.values()].reduce((s, x) => s + x, 0);
    out[code] = { out: total / a.byDay.size, days: a.byDay.size, sub: [...a.bySub.entries()].sort((x, y) => y[1] - x[1]).map(([k]) => k) };
  }
  return out;
}
/** out(올해)·outPrev(작년)·growth(= out/outPrev − 1, 작년 없으면 null)·rank(외지인 많은 순 1부터) */
export function buildRegions(cur: Record<string, { out: number }>, prev: Record<string, { out: number }>): Record<string, RegionCore> {
  const codes = Object.keys(cur).sort((a, b) => cur[b].out - cur[a].out || a.localeCompare(b));
  const res: Record<string, RegionCore> = {};
  codes.forEach((c, i) => {
    const p = prev[c]?.out;
    const outPrev = p !== undefined && Math.round(p) > 0 ? Math.round(p) : null;
    res[c] = { out: Math.round(cur[c].out), outPrev, growth: outPrev === null ? null : +(cur[c].out / p! - 1).toFixed(3), rank: i + 1 };
  });
  return res;
}
export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
/** 요즘 뜨는 곳: growth 높은 순, 외지인(out)이 전체 중앙값 이상인 곳만 (작은 곳의 몇 배 뜀은 빼기) */
export function pickHot(regions: Record<string, { out: number; growth: number | null }>, n = 15): string[] {
  const med = median(Object.values(regions).map((r) => r.out));
  return Object.entries(regions)
    .filter(([, r]) => r.growth !== null && r.out >= med)
    .sort((a, b) => b[1].growth! - a[1].growth! || b[1].out - a[1].out || a[0].localeCompare(b[0]))
    .slice(0, n).map(([c]) => c);
}
/** 한적한 곳: 외지인 적은 순, 광역시(exclude) 제외 */
export function pickQuiet(regions: Record<string, { out: number }>, exclude: Iterable<string>, n = 20): string[] {
  const ex = new Set(exclude);
  return Object.entries(regions).filter(([c]) => !ex.has(c)).sort((a, b) => a[1].out - b[1].out || a[0].localeCompare(b[0])).slice(0, n).map(([c]) => c);
}
/** 연관 관광지: 이름이 많이 나온 순(같으면 연관 순위가 좋은 순) 최대 n개. 기준 관광지 자신은 뺀다. m = 연관 지역 시·군(광역시면 '서울 종로구'처럼) */
export function relatedTop(items: RelatedItem[], n = 6): { n: string; m: string }[] {
  const clean = (s: unknown) => String(s ?? '').trim();
  const acc = new Map<string, { count: number; best: number; places: Map<string, number> }>();
  for (const it of items) {
    const name = clean(it.rlteTatsNm);
    if (!name || name === clean(it.tAtsNm)) continue;
    const regn = clean(it.rlteRegnNm), sg = clean(it.rlteSignguNm);
    const short = normName(regn);
    const place = !sg ? short : /광역시|특별시|특별자치시/.test(regn) && !sg.startsWith(short) ? `${short} ${sg}` : sg;
    const rank = Number(it.rlteRank) || 999;
    let a = acc.get(name);
    if (!a) acc.set(name, (a = { count: 0, best: 999, places: new Map() }));
    a.count++;
    a.best = Math.min(a.best, rank);
    a.places.set(place, (a.places.get(place) ?? 0) + 1);
  }
  return [...acc.entries()]
    .sort((x, y) => y[1].count - x[1].count || x[1].best - y[1].best || x[0].localeCompare(y[0]))
    .slice(0, n)
    .map(([name, a]) => ({ n: name.slice(0, 30), m: [...a.places.entries()].sort((p, q) => q[1] - p[1])[0]?.[0] ?? '' }));
}
/** 붐빔: 관광지마다 최근 days일(자료에 있는 마지막 날짜들)의 집중률 평균, 높은 순 n개 */
export function crowdTop(items: CrowdItem[], n = 8, days = 7): { n: string; r: number }[] {
  const dates = [...new Set(items.map((i) => String(i.baseYmd ?? '').trim()).filter(Boolean))].sort().slice(-days);
  const keep = new Set(dates);
  const acc = new Map<string, { sum: number; k: number }>();
  for (const it of items) {
    const name = String(it.tAtsNm ?? '').trim(), r = Number(it.cnctrRate);
    if (!name || !Number.isFinite(r) || (keep.size && !keep.has(String(it.baseYmd ?? '').trim()))) continue;
    const a = acc.get(name) ?? { sum: 0, k: 0 };
    a.sum += r; a.k++;
    acc.set(name, a);
  }
  return [...acc.entries()].map(([name, a]) => ({ n: name.slice(0, 30), r: +(a.sum / a.k).toFixed(1) })).sort((x, y) => y.r - x.r || x.n.localeCompare(y.n)).slice(0, n);
}

// ---------- 아래는 받기 (CI에서만) ----------
const KEY = process.env.DATA_GO_KR_KEY || process.env.TOUR_API_KEY || '';
const SAMPLE = !!process.env.SAMPLE;
const OUT = 'src/data/trend.json';
const OUTS = [OUT, 'public/data/trend.json']; // public 쪽 사본은 실제 주소에 올라가 다음 CI의 지난 자료가 된다
const LIVE = 'https://borapin.web.app/data/trend.json';
const BASE = process.env.TOUR_API_BASE || 'https://apis.data.go.kr/B551011/'; // 시험용 가짜 서버로 바꿀 수 있게
type Item = Record<string, unknown>;
type Resp = { items: Item[]; total: number; ok: boolean; msg: string };
let calls = 0;
const sleep = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
async function q(svc: string, op: string, p: Record<string, string>): Promise<Resp> {
  const qs = new URLSearchParams({ serviceKey: KEY, MobileOS: 'ETC', MobileApp: 'borapin', _type: 'json', pageNo: '1', ...p });
  let msg = '';
  for (let i = 0; i < 2; i++) {
    calls++;
    try {
      const r = await fetch(`${BASE}${svc}/${op}?${qs}`, { signal: AbortSignal.timeout(20000) });
      const text = await r.text();
      let j: { response?: { header?: { resultCode?: string; resultMsg?: string }; body?: { items?: { item?: Item[] | Item } | ''; totalCount?: number } } };
      try { j = JSON.parse(text); } catch {
        msg = `${r.status} ${text.replace(/\s+/g, ' ').slice(0, 160)}`; // XML 오류문(키 미등록·한도 초과 등)은 그대로 보여 준다 (키는 응답에 없다)
        if (r.status >= 500) { await sleep(1500 * (i + 1)); continue; }
        return { items: [], total: 0, ok: false, msg };
      }
      const code = String(j.response?.header?.resultCode ?? '');
      const body = j.response?.body;
      const it = body?.items && typeof body.items === 'object' ? body.items.item : undefined;
      const items = !it ? [] : Array.isArray(it) ? it : [it];
      const ok = /^0*$/.test(code) || items.length > 0;
      return { items, total: Number(body?.totalCount ?? items.length), ok, msg: ok ? '' : `${code} ${j.response?.header?.resultMsg ?? ''}`.trim() };
    } catch (e) { msg = (e as Error).message; await sleep(1500 * (i + 1)); }
  }
  return { items: [], total: 0, ok: false, msg };
}
async function pool<T, R>(xs: T[], size: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < xs.length; i += size) out.push(...(await Promise.all(xs.slice(i, i + size).map(fn))));
  return out;
}
/** 첫 쪽으로 전체 수를 알아내고 나머지 쪽은 6개씩 같이 받는다 (한 쪽 1000줄) */
async function fetchAll(svc: string, op: string, p: Record<string, string>, maxPages = 60): Promise<Resp> {
  const first = await q(svc, op, { numOfRows: '1000', ...p });
  if (!first.ok || !first.items.length) return first;
  const pages = Math.ceil(first.total / first.items.length);
  if (pages > maxPages) console.warn(`::warning::${op}: ${pages}쪽 중 ${maxPages}쪽만 받아요 (한 쪽 ${first.items.length}줄)`);
  const rest = await pool(Array.from({ length: Math.min(pages, maxPages) - 1 }, (_, i) => String(i + 2)), 6, (pageNo) => q(svc, op, { numOfRows: '1000', ...p, pageNo }));
  return { ...first, items: first.items.concat(...rest.map((r) => r.items)) };
}

async function main() {
  const started = Date.now();
  const DEADLINE = started + 300_000; // CI는 360초에서 끊는다: 그 전에 받은 만큼이라도 쓴다
  const prev = await loadPrevious<TrendFile>('관광빅데이터', OUTS, LIVE, trendHealth);
  seedFiles(OUTS, prev.data, trendHealth); // 비어 있는 쪽(public 사본 등)에만
  if (!KEY) { console.log('키 없음: 지난 자료 그대로'); return; }
  const today = ymd8(new Date(Date.now() + 9 * 3600_000)); // 한국 날짜
  if (prev.data?.at === dash(today) && !process.env.FORCE) { console.log(`오늘(${dash(today)}) 자료가 이미 있어 다시 받지 않아요 (하루 호출 한도 아끼기 · FORCE=1이면 다시 받음)`); return; }
  const regionList = (readJson<{ regions: Region[] }>('src/data/regions.json')?.regions ?? []).filter((r) => /^\d+$/.test(r.code));
  const nameOf = (c: string) => regionList.find((r) => r.code === c)?.name ?? c;
  const unresolved = new Set<string>();
  const base = makeResolver(regionList);
  const resolve: Resolver = (sg, nm) => { const c = base(sg, nm); if (!c) unresolved.add(`${sg}${nm ? `(${nm})` : ''}`); return c; };
  const AREAS = [...new Set(regionList.map((r) => r.code.slice(0, 2)))].sort(); // 광역 17곳 (법정동 시도 코드)

  // 1. 기초지자체 방문자 — 파라미터 없이 전체가 오면 그대로, 안 되면 광역(areaCd)마다
  const yesterday = addDays(today, -1);
  const V = ['DataLabService', 'locgoRegnVisitrDDList'] as const;
  const vp = (from: string, to: string, areaCd?: string) => ({ startYmd: from, endYmd: to, ...(areaCd ? { areaCd } : {}) });
  let mode: 'all' | 'area' | null = null;
  const probeDay = addDays(yesterday, -45); // 이 정도 전이면 자료가 있어야 한다 (집계가 몇 주 늦어도)
  for (const m of ['all', 'area'] as const) {
    const r = await q(...V, { numOfRows: '5', ...vp(probeDay, probeDay, m === 'area' ? '11' : undefined) });
    if (SAMPLE) console.log(`방문자(${m}) 예시`, JSON.stringify(r.items.slice(0, 2)), r.msg);
    if (r.ok && r.items.length) { mode = m; break; }
    console.log(`방문자 ${m === 'all' ? '전체 한 번에' : '광역별'} 방식은 안 돼요: ${r.msg || '0줄'}`);
  }
  if (!mode) { console.log('방문자 자료를 받지 못해 지난 자료 그대로'); return; }
  console.log(`방문자 받는 방식: ${mode === 'all' ? '전체 한 번에(쪽으로)' : '광역 17곳마다'}`);
  // 자료가 있는 마지막 날 찾기 (probeDay는 있음, 어제는 모름 → 이분 탐색 6번쯤)
  const has = async (day: string) => { const r = await q(...V, { numOfRows: '1', ...vp(day, day, mode === 'area' ? '11' : undefined) }); return r.ok && (r.total > 0 || r.items.length > 0); };
  let a = 0, b = 45;
  while (a < b) { const mid = Math.ceil((a + b) / 2); if (await has(addDays(probeDay, mid))) a = mid; else b = mid - 1; }
  const last = addDays(probeDay, a);
  const { cur, prev: prv } = windowsOf(last, 28);
  console.log(`자료가 있는 마지막 날 ${dash(last)} (어제보다 ${45 - a}일 전) → 최근 ${dash(cur.from)}~${dash(cur.to)}, 작년 ${dash(prv.from)}~${dash(prv.to)}`);
  const fetchVisits = async (w: { from: string; to: string }): Promise<Item[]> =>
    mode === 'all' ? (await fetchAll(...V, vp(w.from, w.to))).items : (await pool(AREAS, 6, (ar) => fetchAll(...V, vp(w.from, w.to, ar), 30))).flatMap((r) => r.items);
  const curItems = await fetchVisits(cur);
  const prevItems = await fetchVisits(prv);
  if (SAMPLE) console.log('방문자 원본 예시', JSON.stringify(curItems.slice(0, 2)));
  const curAvg = avgOut(curItems as VisitItem[], resolve), prevAvg = avgOut(prevItems as VisitItem[], resolve);
  console.log(`방문자: 최근 ${curItems.length}줄 → 시·군 ${Object.keys(curAvg).length}곳, 작년 ${prevItems.length}줄 → ${Object.keys(prevAvg).length}곳 · 호출 ${calls}번`);
  if (unresolved.size) console.log(`짝 못 찾은 관광공사 시군구 ${unresolved.size}개:`, [...unresolved].slice(0, 30).join(' '));
  if (Object.keys(curAvg).length < 100) { console.log(`너무 적게 받아 지난 자료 그대로 (${prev.from ? trendHealth(prev.data).why : '지난 자료 없음'})`); return; }

  // 2·3. 연관 관광지(지난달 baseYm)·붐빔 — 시·군마다, 동시 6개. 광역시는 areaCd만으로 먼저, 안 되면 외지인 많은 구 4곳
  let baseYm = '';
  for (const ym of prevMonths(today, 3)) {
    const r = await q('TarRlteTarService1', 'areaBasedList1', { numOfRows: '2', baseYm: ym, areaCd: '51', signguCd: '51150' });
    if (r.ok && r.items.length) { baseYm = ym; break; }
    console.log(`연관 관광지 ${ym}: ${r.msg || '0줄'}`);
  }
  console.log(baseYm ? `연관 관광지 기준 달 ${baseYm}` : '연관 관광지는 받지 못해요 (지난 자료의 것을 둠)');
  const targets = (code: string): { areaCd: string; signguCd?: string }[][] => {
    const ar = code.slice(0, 2), subs = (curAvg[code]?.sub ?? []).filter((s) => s !== code).slice(0, 4);
    const second = subs.map((s) => ({ areaCd: ar, signguCd: s }));
    return code.length === 2 ? [[{ areaCd: code }], second] : [[{ areaCd: ar, signguCd: code }], second];
  };
  const shown = { err: false, rel: false, crowd: false };
  const tryTargets = async (svc: string, op: string, code: string, extra: Record<string, string>): Promise<Item[]> => {
    for (const group of targets(code)) {
      if (!group.length) continue;
      const rs = await Promise.all(group.map((t) => q(svc, op, { ...extra, ...t })));
      const items = rs.flatMap((r) => r.items);
      if (items.length) return items;
      if (!shown.err && rs[0].msg) { shown.err = true; console.log(`${op} ${code}: ${rs[0].msg}`); }
    }
    return [];
  };
  const related: Record<string, { n: string; m: string }[]> = {}, crowd: Record<string, { n: string; r: number }[]> = {};
  let skipped = 0;
  const codes = Object.keys(curAvg);
  await pool(codes, 6, async (code) => {
    if (Date.now() > DEADLINE) { skipped++; return; }
    const [ri, ci] = await Promise.all([
      baseYm ? tryTargets('TarRlteTarService1', 'areaBasedList1', code, { numOfRows: '500', baseYm }) : Promise.resolve([] as Item[]),
      tryTargets('TatsCnctrRateService', 'tatsCnctrRatedList', code, { numOfRows: '1000' }),
    ]);
    if (SAMPLE && ri.length && !shown.rel) { shown.rel = true; console.log('연관 관광지 원본 예시', JSON.stringify(ri.slice(0, 2))); }
    if (SAMPLE && ci.length && !shown.crowd) { shown.crowd = true; console.log('붐빔 원본 예시', JSON.stringify(ci.slice(0, 2))); }
    related[code] = relatedTop(ri as RelatedItem[]);
    crowd[code] = crowdTop(ci as CrowdItem[]);
  });

  // 합치기: 새로 못 받은 연관·붐빔은 지난 자료의 것을 둔다
  const core = buildRegions(curAvg, prevAvg);
  const regions: Record<string, RegionTrend> = {};
  for (const [code, c] of Object.entries(core)) {
    const p = prev.data?.regions?.[code];
    regions[code] = { ...c, related: related[code]?.length ? related[code] : p?.related ?? [], crowd: crowd[code]?.length ? crowd[code] : p?.crowd ?? [] };
  }
  const hot = pickHot(regions), quiet = pickQuiet(regions, metroCodes(regionList));
  const file: TrendFile = { at: dash(today), window: { from: dash(cur.from), to: dash(cur.to) }, regions, hot, quiet };
  writeJsonTo(OUTS, file);
  const n = (f: (r: RegionTrend) => boolean) => Object.values(regions).filter(f).length;
  console.log(`관광빅데이터: 시·군 ${codes.length}곳 (작년 비교 ${n((r) => r.growth !== null)}곳 · 연관 ${n((r) => r.related.length > 0)}곳 · 붐빔 ${n((r) => r.crowd.length > 0)}곳${skipped ? ` · 시간이 모자라 ${skipped}곳은 지난 연관·붐빔` : ''}) · 호출 ${calls}번 · ${Math.round((Date.now() - started) / 1000)}초`);
  console.log('요즘 뜨는 곳:', hot.slice(0, 8).map((c) => `${nameOf(c)} ${Math.round((regions[c].growth ?? 0) * 100)}%`).join(', '));
  console.log('한적한 곳:', quiet.slice(0, 8).map((c) => `${nameOf(c)} ${regions[c].out}`).join(', '));
  console.log(`저장 → ${OUTS.join(', ')}`);
}

if (process.argv[1]?.endsWith('tour-trend.ts')) await main();
