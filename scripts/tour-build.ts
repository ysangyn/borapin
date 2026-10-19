/**
 * 관광공사 자료 (CI 빌드 때, 실패하면 지난 자료): 시·군마다 관광지 12곳(이름·좌표·사진) + 무장애 관광지 수
 * → src/data/tour.json  { updated, cells: { [우리 시군 코드]: { s: [[이름, 위도, 경도, 사진]], easy: 무장애 곳 수 } } }
 * 우리 시·군 코드 = 법정동 시군구 코드(5자리). 광역 하나인 칸(서울 '11' 등)은 시도 코드로 묻는다.
 */
import fs from 'node:fs';

const KEY = process.env.DATA_GO_KR_KEY || process.env.TOUR_API_KEY;
const OUT = 'src/data/tour.json';
if (!KEY) { console.log('키 없음: 지난 자료 그대로'); process.exit(0); }
const regions = (JSON.parse(fs.readFileSync('src/data/regions.json', 'utf8')) as { regions: { code: string; name: string }[] }).regions;
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
const area = (code: string): Record<string, string> => (code.length === 5 ? { lDongRegnCd: code.slice(0, 2), lDongSignguCd: code.slice(2) } : { lDongRegnCd: code.slice(0, 2) });
const https = (u: string) => (u ? u.replace(/^http:/, 'https:') : '');

const prev = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')) as { cells: Record<string, unknown> }; } catch { return { cells: {} }; } })();
const cells: Record<string, { s: [string, number, number, string][]; easy: number }> = {};
let ok = 0;
const codes = regions.map((r) => r.code).filter((c) => /^\d+$/.test(c));
for (let i = 0; i < codes.length; i += 6) {
  await Promise.all(codes.slice(i, i + 6).map(async (code) => {
    const [spots, easy] = await Promise.all([
      q('KorService2', 'areaBasedList2', { ...area(code), contentTypeId: '12', arrange: 'Q', numOfRows: '12' }),
      q('KorWithService2', 'areaBasedList2', { ...area(code), contentTypeId: '12', numOfRows: '1' }),
    ]);
    if (!spots.length) return;
    ok++;
    cells[code] = {
      s: spots.map((x) => [x.title.replace(/\s*\(.*?\)\s*$/, '').slice(0, 30), +(+x.mapy).toFixed(5), +(+x.mapx).toFixed(5), https(x.firstimage2 || x.firstimage || '')] as [string, number, number, string]).filter((x) => x[1] && x[2]),
      easy: (easy as Item[] & { total?: number }).total ?? 0,
    };
  }));
}
console.log(`관광공사: 시·군 ${codes.length} 중 ${ok}곳 받음`);
if (ok < codes.length * 0.6) { console.log('너무 적게 받아 지난 자료 그대로'); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), note: '한국관광공사 TourAPI(국문 관광정보·무장애 여행), 공공누리 제1유형', cells: { ...prev.cells, ...cells } }));
