/**
 * 관광공사 자료 (CI 빌드 때, 실패하면 지난 자료): 시·군마다 관광지 12곳 · 음식점 8곳 · 쇼핑 6곳(이름·좌표·사진) + 무장애 관광지 수
 * → src/data/tour.json  { updated, cells: { [우리 시군 코드]: { s: 관광지, f: 음식점, b: 쇼핑 — 모두 [[이름, 위도, 경도, 사진]], easy: 무장애 곳 수 } } } (+ public/data/tour.json 사본)
 * 하루 한 번만 받는다: 실제 주소의 자료가 오늘 것이고 음식점·쇼핑까지 들어 있으면 건너뜀(FORCE=1이면 받음) — 무료 하루 호출 수를 아끼려고.
 * 우리 시·군 코드 = 법정동 시군구 코드(5자리). 광역 하나인 칸(서울 '11' 등)은 시도 코드로 묻는다.
 * 지난 자료: 로컬 파일에 내용이 없으면(새 체크아웃·자리표시) 실제 주소(/data/tour.json)의 것을 먼저 받아 둔다 (scripts/data-health.ts).
 */
import fs from 'node:fs';
import { loadPrevious, seedFiles, tourHealth, writeJsonTo } from './data-health';

const KEY = process.env.DATA_GO_KR_KEY || process.env.TOUR_API_KEY;
const OUT = 'src/data/tour.json';
const OUTS = [OUT, 'public/data/tour.json']; // public 쪽 사본은 실제 주소에 올라가 다음 CI의 지난 자료가 된다
const LIVE = 'https://borapin.web.app/data/tour.json';
type TourFile = { updated?: string; note?: string; cells: Record<string, unknown> };
// 지난 자료부터 자리에 두기 (키가 없거나 적게 받아 '그대로' 둘 때도 자리표시가 아니라 이 자료가 남게)
const prev = await loadPrevious<TourFile>('관광공사', OUTS, LIVE, tourHealth);
seedFiles(OUTS, prev.data, tourHealth); // 비어 있는 쪽(public 사본 등)에만 쓴다
if (!KEY) { console.log('키 없음: 지난 자료 그대로'); process.exit(0); }
{
  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  const full = Object.values(prev.data?.cells ?? {}).some((c) => Array.isArray((c as { f?: unknown }).f));
  if (!process.env.FORCE && prev.data?.updated === today && full) { console.log(`오늘(${today}) 받은 자료가 있어 건너뜀`); process.exit(0); }
}
type Item = Record<string, string>;
async function q(svc: string, op: string, p: Record<string, string>): Promise<Item[]> {
  const qs = new URLSearchParams({ serviceKey: KEY!, MobileOS: 'ETC', MobileApp: 'borapin', _type: 'json', pageNo: '1', ...p });
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`https://apis.data.go.kr/B551011/${svc}/${op}?${qs}`, { signal: AbortSignal.timeout(20000) });
      const j = (await r.json()) as { response?: { body?: { items?: { item?: Item[] | Item } | ''; totalCount?: number } } };
      const it = j.response?.body?.items && typeof j.response.body.items === 'object' ? j.response.body.items.item : undefined;
      const arr = !it ? [] : Array.isArray(it) ? it : [it];
      (arr as Item[] & { total?: number }).total = Number(j.response?.body?.totalCount ?? arr.length);
      return arr;
    } catch { await new Promise((ok) => setTimeout(ok, 1500 * (i + 1))); }
  }
  return [];
}
// 관광공사 법정동 코드표로 우리 시·군 → 묻는 코드(여럿일 수 있음: 수원시 = 장안·권선·팔달·영통구)
const regnList = await q('KorService2', 'ldongCode2', { numOfRows: '50' });
const regnOf = new Map<string, string>(); // 시도 이름 → 코드
for (const x of regnList) regnOf.set(String(x.name ?? x.lDongRegnNm ?? ''), String(x.code ?? x.lDongRegnCd ?? ''));
const signgu = new Map<string, { code: string; name: string }[]>();
for (const [, rc] of regnOf) {
  const l = await q('KorService2', 'ldongCode2', { lDongRegnCd: rc, numOfRows: '100' });
  signgu.set(rc, l.map((x) => ({ code: String(x.code ?? x.lDongSignguCd ?? ''), name: String(x.name ?? x.lDongSignguNm ?? '') })));
}
console.log('시도 코드', [...regnOf.entries()].map(([n, c]) => `${n}=${c}`).join(' '));
const regionList = (JSON.parse(fs.readFileSync('src/data/regions.json', 'utf8')) as { regions: { code: string; name: string; groupName: string; sido: string }[] }).regions;
function areas(code: string): Record<string, string>[] {
  const r = regionList.find((x) => x.code === code)!;
  if ([...regnOf.values()].includes(code)) return [{ lDongRegnCd: code }]; // 세종처럼 시도 코드가 곧 우리 코드
  const base = code.length === 5 ? [{ lDongRegnCd: code.slice(0, 2), lDongSignguCd: code.slice(2) }] : [{ lDongRegnCd: code.slice(0, 2) }];
  // 이름으로 다시 찾기: 시도(옛 이름 포함)에서 시·군 이름이 같거나 '수원시 장안구'처럼 시작하는 곳
  const sidoKeys = [r.sido, r.groupName, ...(r.groupName === '전남광주' ? ['전라남도', '광주광역시', '전남', '광주'] : [])];
  const rcs = [...regnOf.entries()].filter(([n]) => sidoKeys.some((k) => k && (n.includes(k) || k.includes(n)))).map(([, c]) => c);
  if (code.length !== 5 || r.name === '세종') return rcs.length && code.length !== 5 ? rcs.map((c) => ({ lDongRegnCd: c })) : base;
  const hit = rcs.flatMap((rc) => (signgu.get(rc) ?? []).filter((g) => g.name === r.name || g.name.startsWith(`${r.name} `)).map((g) => ({ lDongRegnCd: rc, lDongSignguCd: g.code })));
  return hit.length ? hit : base;
}
const https = (u: string) => (u ? u.replace(/^http:/, 'https:') : '');

const prevCells = prev.data?.cells ?? {};
type Row = [string, number, number, string];
const cells: Record<string, { s: Row[]; f: Row[]; b: Row[]; easy: number }> = {};
let ok = 0;
const codes = regionList.map((r) => r.code).filter((c) => /^\d+$/.test(c));
for (let i = 0; i < codes.length; i += 6) {
  await Promise.all(codes.slice(i, i + 6).map(async (code) => {
    const as = areas(code);
    const per = Math.max(4, Math.ceil(12 / as.length));
    const n = (k: number) => String(Math.max(3, Math.ceil(k / as.length)));
    const got = await Promise.all(as.map((a) => Promise.all([
      q('KorService2', 'areaBasedList2', { ...a, contentTypeId: '12', arrange: 'Q', numOfRows: String(per) }),
      q('KorWithService2', 'areaBasedList2', { ...a, contentTypeId: '12', numOfRows: '1' }),
      // 음식점(39)·쇼핑(38): 사진 있는 것 먼저(arrange Q) — 가이드북 '먹을 것·살 것'과 계획하기 담기 후보
      q('KorService2', 'areaBasedList2', { ...a, contentTypeId: '39', arrange: 'Q', numOfRows: n(8) }),
      q('KorService2', 'areaBasedList2', { ...a, contentTypeId: '38', arrange: 'Q', numOfRows: n(6) }),
    ])));
    const spots = got.flatMap(([x]) => x).slice(0, 12);
    const foods = got.flatMap(([, , x]) => x).slice(0, 8);
    const shops = got.flatMap(([, , , x]) => x).slice(0, 6);
    const row = (x: Item) => [x.title.replace(/\s*\(.*?\)\s*$/, '').slice(0, 30), +(+x.mapy).toFixed(5), +(+x.mapx).toFixed(5), https(x.firstimage2 || x.firstimage || '')] as [string, number, number, string];
    const easy = Object.assign([] as Item[], { total: got.reduce((n, [, e]) => n + ((e as Item[] & { total?: number }).total ?? 0), 0) });
    if (!spots.length) return;
    ok++;
    cells[code] = {
      s: spots.map(row).filter((x) => x[1] && x[2]),
      f: foods.map(row).filter((x) => x[1] && x[2]),
      b: shops.map(row).filter((x) => x[1] && x[2]),
      easy: (easy as Item[] & { total?: number }).total ?? 0,
    };
  }));
}
console.log(`관광공사: 시·군 ${codes.length} 중 ${ok}곳 받음 · 음식점 ${Object.values(cells).reduce((a, c) => a + c.f.length, 0)} · 쇼핑 ${Object.values(cells).reduce((a, c) => a + c.b.length, 0)}`);
if (ok < codes.length * 0.6) { console.log(`너무 적게 받아 지난 자료 그대로 (${prev.from ? tourHealth(prev.data).why : '지난 자료 없음'})`); process.exit(0); }
writeJsonTo(OUTS, { updated: new Date().toISOString().slice(0, 10), note: '한국관광공사 TourAPI(국문 관광정보·무장애 여행), 공공누리 제1유형', cells: { ...prevCells, ...cells } });
console.log(`저장 → ${OUTS.join(', ')}`);
