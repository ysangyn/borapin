/**
 * 세계 도시 사진 후보 찾기 (CI에서만: 위키미디어 공용 API)
 * - world.json의 도시마다 자유 이용 사진을 찾는다. 먼저 '우수 사진(Featured/Quality images)' 안에서, 모자라면 일반 검색.
 * - 도시마다 후보 4장까지: 모아보기 그림(20도시 × 4칸)과 후보 목록(JSON)을 낸다. 사람이 보고 고른 것만 media-build에서 받는다.
 * - 'npx tsx scripts/media-cities.ts 교토 파리' 처럼 도시 이름을 주면 그것만 다시 찾는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import world from '../src/data/world.json' with { type: 'json' };
import queriesRaw from '../media/city-queries.json' with { type: 'json' };
import krRaw from '../media/kr-queries.json' with { type: 'json' };
import regionsRaw from '../src/data/regions.json' with { type: 'json' };
import travelinfo from '../src/data/travelinfo.json' with { type: 'json' };
const QUERIES = queriesRaw as Record<string, string[]>;
const KR = krRaw as Record<string, string[]>;

const OUT = 'media-cities';
fs.mkdirSync(OUT, { recursive: true });
const UA = 'borapin-media-bot/1.0 (https://github.com/ysangyn/borapin)';
const API = 'https://commons.wikimedia.org/w/api.php';
const OK_LICENSE = /^(cc0|public domain|pd|cc by(-sa)? ?[0-9.]*)/i;
const NOISE = /map|logo|flag|coat of arms|diagram|poster|stamp|coin|banknote|portrait|seminar|soldier|military|conference|ceremony|protest|election|crash|accident|funeral|menu|screenshot|floor plan|interior of a bus|cockpit|railway station platform/i;
const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

interface Cand { title: string; thumb: string; w: number; h: number; license: string; artist: string; desc: string; page: string; via: string }

async function api(params: Record<string, string>) {
  const u = new URL(API);
  for (const [k, v] of Object.entries({ format: 'json', origin: '*', ...params })) u.searchParams.set(k, v);
  for (let i = 0; i < 3; i++) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.ok) return r.json() as Promise<{ query?: { pages?: Record<string, { title: string; imageinfo?: { url: string; thumburl?: string; width: number; height: number; mime: string; extmetadata?: Record<string, { value: string }> }[] }> } }>;
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error(`API 실패 ${u}`);
}

async function search(q: string, via: string, n = 30): Promise<Cand[]> {
  const j = await api({ action: 'query', generator: 'search', gsrsearch: `${q} filetype:bitmap`, gsrnamespace: '6', gsrlimit: String(n), prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '640' });
  const out: Cand[] = [];
  for (const p of Object.values(j.query?.pages ?? {})) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata ?? {};
    const license = strip(m.LicenseShortName?.value ?? '');
    if (!OK_LICENSE.test(license) || /nc|nd/i.test(license.replace(/^cc by(-sa)?/i, ''))) continue;
    if (!/jpeg|png/.test(ii.mime)) continue;
    out.push({ title: p.title, thumb: ii.thumburl ?? ii.url, w: ii.width, h: ii.height, license, artist: strip(m.Artist?.value ?? '').slice(0, 120), desc: strip(m.ImageDescription?.value ?? '').slice(0, 200), page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`, via });
  }
  return out;
}

async function download(url: string): Promise<Buffer> {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
  }
  throw new Error(`받기 실패 ${url}`);
}

/** 모아보기: 한 줄에 도시 하나(이름 + 후보 4장) */
async function sheet(name: string, rows: { label: string; items: Buffer[] }[]) {
  const W = 320, H = 213, COLS = 4, LABEL = 36;
  const tiles: { input: Buffer; left: number; top: number }[] = [];
  for (const [r, row] of rows.entries()) {
    const top = r * (H + LABEL);
    const text = Buffer.from(`<svg width="${W * COLS}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="25" font-size="20" font-family="sans-serif" fill="#fff">${row.label.replace(/[<&]/g, '')}</text></svg>`);
    tiles.push({ input: text, left: 0, top });
    for (const [i, buf] of row.items.entries()) {
      const img = await sharp(buf).resize(W, H, { fit: 'cover' }).toBuffer();
      const tag = Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="34" height="28" fill="rgba(0,0,0,0.65)"/><text x="9" y="21" font-size="18" font-family="sans-serif" fill="#fff">${i}</text></svg>`);
      tiles.push({ input: await sharp(img).composite([{ input: tag }]).toBuffer(), left: i * W, top: top + LABEL });
    }
  }
  await sharp({ create: { width: W * COLS, height: rows.length * (H + LABEL), channels: 3, background: '#222' } }).composite(tiles).jpeg({ quality: 78 }).toFile(path.join(OUT, `${name}.jpg`));
}

// 'kr'를 주면 국내 160 시·군, 아니면 세계 도시. 그 뒤에 이름을 주면 그것만.
const args = process.argv.slice(2);
const mode = args[0] === 'kr' ? 'kr' : 'world';
const only = mode === 'kr' ? args.slice(1) : args;
interface Target { key: string; city: string; en: string; landmarks: string[] }
const cities: Target[] = mode === 'kr'
  ? (regionsRaw as { regions: { code: string; name: string }[] }).regions.filter((r) => !only.length || only.includes(r.name)).map((r) => {
      const spots = ((travelinfo as { cells: Record<string, { main: { spots: string[] } }> }).cells[r.code]?.main.spots ?? []).slice(0, 2);
      return { key: `kr:${r.code}`, city: r.name, en: KR[r.code]?.[0] ?? r.name, landmarks: [...(KR[r.code] ?? []), ...spots] };
    })
  : (world as { cities: { c: string; city: string; en: string }[] }).cities.filter((c) => !only.length || only.includes(c.city)).map((c) => ({ key: `${c.c}:${c.city}`, city: c.city, en: c.en, landmarks: QUERIES[`${c.c}:${c.city}`] ?? [c.en] }));
const PREFIX = mode === 'kr' ? 'kr' : 'cities';
const report: Record<string, Cand[]> = {};
const rows: { label: string; items: Buffer[] }[] = [];
let sheetNo = 1;

for (const c of cities) {
  const seen = new Set<string>();
  let all: Cand[] = [];
  // 도시 이름만으로 찾으면 엉뚱한 우수 사진(설명에 도시 이름이 스친 것)이 섞이므로, 명소 이름(영어)으로 찾는다
  const landmarks = c.landmarks;
  const queries: [string, string][] = landmarks.flatMap((l) => [[`"${l}" incategory:"Quality images"`, `q:${l}`], [`"${l}" incategory:"Featured pictures on Wikimedia Commons"`, `f:${l}`], [l, `p:${l}`]] as [string, string][]);
  for (const [q, via] of queries) {
    try {
      for (const x of await search(q, via, 20)) if (!seen.has(x.title)) { seen.add(x.title); all.push(x); }
    } catch (e) { console.warn(c.city, q, e); }
  }
  // 큰 가로 사진만. 명소마다 하나씩 고루(첫 명소 → 둘째 → 셋째), 같은 명소 안에선 우수 사진 먼저·큰 것부터
  const good = all.filter((x) => !NOISE.test(x.title + ' ' + x.desc) && x.w >= 1600 && x.w / x.h >= 1.3 && x.w / x.h <= 2.3);
  const rank = (x: Cand) => (x.via.startsWith('f:') ? 2 : x.via.startsWith('q:') ? 1 : 0);
  const byLandmark = landmarks.map((l) => good.filter((x) => x.via.slice(2) === l).sort((a, b) => rank(b) - rank(a) || b.w * b.h - a.w * a.h));
  const picked: Cand[] = [];
  for (let round = 0; picked.length < 4 && round < 4; round++) for (const list of byLandmark) { const x = list[round]; if (x && picked.length < 4 && !picked.includes(x)) picked.push(x); }
  all = picked;
  report[c.key] = all;
  const items: Buffer[] = [];
  for (const x of all) { try { items.push(await download(x.thumb)); } catch (e) { console.warn(e); } }
  rows.push({ label: `${c.city} (${c.en}) · ${all.map((x) => x.via.slice(0, 1) + ':' + x.via.slice(2, 14)).join(' | ')}`, items });
  console.log(`${c.city}: 후보 ${all.length}장 (${all.map((x) => x.via).join(', ')})`);
  if (rows.length >= 20) { await sheet(`${PREFIX}-${String(sheetNo++).padStart(2, '0')}`, rows.splice(0)); }
}
if (rows.length) await sheet(`${PREFIX}-${String(sheetNo++).padStart(2, '0')}`, rows);
fs.writeFileSync(path.join(OUT, `${PREFIX}-candidates.json`), JSON.stringify(report, null, 1));
console.log(`도시 ${cities.length}곳, 후보 있는 곳 ${Object.values(report).filter((v) => v.length).length}곳`);
