/**
 * 지역 축제 자료 만들기 (CI에서만: 한국관광공사 TourAPI KorService2 searchFestival2)
 *
 *   TOUR_API_KEY=... npx tsx scripts/tour-festivals.ts
 *
 * - 지난 1년부터 앞으로 열릴 축제까지 받아, 좌표(경도·위도)로 우리 지도 160칸 중 어디인지 정한다.
 *   좌표가 없으면 주소 글자로 정한다.
 * - 결과: public/data/festivals.json (축제 이름·기간만. 사진·설명은 담지 않는다)
 * - 키가 없거나 받기에 실패하면 기존 파일을 그대로 둔다 (앱은 축제 없이도 돌아간다).
 * 출처 표시: 한국관광공사 (공공누리 제1유형)
 */
import fs from 'node:fs';
import path from 'node:path';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import regionsData from '../src/data/regions.json' with { type: 'json' };

const KEY = process.env.TOUR_API_KEY;
const OUT = path.resolve(import.meta.dirname, '../public/data/festivals.json');
const BASE = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2';

if (!KEY) {
  console.log('TOUR_API_KEY가 없어 축제 자료를 그대로 둡니다');
  process.exit(0);
}

interface Item { contentid?: string; title?: string; addr1?: string; eventstartdate?: string; eventenddate?: string; mapx?: string; mapy?: string }

const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const from = new Date();
from.setFullYear(from.getFullYear() - 1);

// https가 안 되면(인증서 사슬 문제 등) http로 한 번 더 (공공데이터포털은 둘 다 받는다)
let base = BASE;
async function page(no: number): Promise<{ items: Item[]; total: number }> {
  const u = new URL(base);
  const q = { serviceKey: KEY!, MobileOS: 'ETC', MobileApp: 'borapin', _type: 'json', numOfRows: '200', pageNo: String(no), arrange: 'A', eventStartDate: ymd(from) };
  for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(u, { headers: { Accept: 'application/json' } });
      const text = await r.text();
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
      let j: { response?: { header?: { resultCode?: string; resultMsg?: string }; body?: { totalCount?: number; items?: { item?: Item | Item[] } | '' } } };
      try {
        j = JSON.parse(text);
      } catch {
        // 키가 아직 안 열렸거나 틀리면 XML 오류가 온다
        throw new Error(`JSON이 아니에요: ${text.slice(0, 200)}`);
      }
      const h = j.response?.header;
      if (h?.resultCode !== '0000') throw new Error(`TourAPI ${h?.resultCode}: ${h?.resultMsg}`);
      const raw = j.response?.body?.items;
      const item = raw && typeof raw === 'object' ? raw.item : undefined;
      return { items: Array.isArray(item) ? item : item ? [item] : [], total: Number(j.response?.body?.totalCount ?? 0) };
    } catch (e) {
      const cause = (e as { cause?: { code?: string; message?: string } }).cause;
      console.warn(`  ${no}쪽 ${i + 1}번째 시도 실패: ${(e as Error).message}${cause ? ` (${cause.code ?? ''} ${cause.message ?? ''})` : ''}`);
      if (cause && base.startsWith('https:')) base = base.replace('https:', 'http:');
      if (i === 3) throw e;
      await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
    }
  }
  throw new Error('unreachable');
}

// 지도 160칸 (좌표 → 칸)
const topo = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../public/data/kr-cells.topojson'), 'utf8')) as Topology;
const obj = Object.values(topo.objects)[0];
const cells = (feature(topo, obj) as unknown as { features: Feature<Polygon | MultiPolygon, { cell: string }>[] }).features;
const ringHas = (ring: number[][], x: number, y: number) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const polyHas = (rings: number[][][], x: number, y: number) => ringHas(rings[0], x, y) && !rings.slice(1).some((h) => ringHas(h, x, y));
function cellAt(x: number, y: number): string | null {
  for (const f of cells) {
    const g = f.geometry;
    if (g.type === 'Polygon' ? polyHas(g.coordinates, x, y) : g.coordinates.some((p) => polyHas(p, x, y))) return f.properties.cell;
  }
  // 해안선을 단순하게 그린 지도라 바닷가 축제가 살짝 바다에 찍히기도 한다: 8km 안의 가장 가까운 칸
  let best: string | null = null, bestD = 0.08 ** 2;
  for (const f of cells) {
    const g = f.geometry;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) for (const [px, py] of poly[0]) {
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bestD) (bestD = d), (best = f.properties.cell);
    }
  }
  return best;
}
// 주소 → 칸 (좌표가 없을 때): '강원특별자치도 강릉시 …' 처럼 시·군 이름과 도 이름이 함께 맞아야
const regions = (regionsData as { regions: { code: string; name: string; groupName: string }[] }).regions;
function cellByAddr(addr: string): string | null {
  const a = addr.replace(/\s+/g, ' ');
  const hits = regions.filter((r) => a.includes(r.name) && a.includes(r.groupName.slice(0, 2)));
  return hits.length === 1 ? hits[0].code : null;
}

let items: Item[] = [];
try {
  const first = await page(1);
  items = first.items;
  const pages = Math.ceil(first.total / 200);
  for (let p = 2; p <= Math.min(pages, 30); p++) items.push(...(await page(p)).items);
  console.log(`축제 ${first.total}건 받음 (${ymd(from)} 이후 시작)`);
} catch (e) {
  console.warn(`::warning::축제 자료를 받지 못해 기존 파일을 둡니다 — ${(e as Error).message}`);
  process.exit(0);
}

const byCell: Record<string, { t: string; s: string; e: string; id: string }[]> = {};
let byXY = 0, byAddr = 0, lost = 0;
for (const it of items) {
  if (!it.title || !it.eventstartdate) continue;
  const x = Number(it.mapx), y = Number(it.mapy);
  let code = x && y ? cellAt(x, y) : null;
  if (code) byXY++;
  else if ((code = cellByAddr(it.addr1 ?? ''))) byAddr++;
  if (!code) {
    lost++;
    continue;
  }
  (byCell[code] ??= []).push({ t: it.title.trim(), s: it.eventstartdate, e: it.eventenddate || it.eventstartdate, id: String(it.contentid ?? '') });
}
for (const list of Object.values(byCell)) list.sort((a, b) => a.s.localeCompare(b.s));
const total = Object.values(byCell).reduce((n, l) => n + l.length, 0);
if (total < 30) {
  console.warn(`::warning::축제가 ${total}건뿐이라 이상해서 기존 파일을 둡니다`);
  process.exit(0);
}
fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), source: '한국관광공사 TourAPI', cells: byCell }));
console.log(`칸 ${Object.keys(byCell).length}곳에 ${total}건 (좌표 ${byXY}, 주소 ${byAddr}, 못 찾음 ${lost}) → ${path.relative(process.cwd(), OUT)} ${Math.round(fs.statSync(OUT).size / 1024)}KB`);
