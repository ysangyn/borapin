/**
 * 세계 도시 달별 기후 (옷차림 한 줄의 재료) → src/data/wear.json
 * 데이터를 만들 때 한 번만 실행(.github/workflows/data.yml, data-build 브랜치). 평년 기후라 해마다 다시 돌릴 필요 없다.
 *
 * 1) 도시 좌표: Open-Meteo 지오코딩(무료·키 없음), 영어 이름 + 나라 코드로 첫 결과
 * 2) 기후: NASA POWER 월별 평년값(가기 좋은 달과 같은 자료) — 평균기온·낮 최고·하루 강수량
 * 옷차림 글은 앱이 이 숫자로 만든다(src/lib/wear.ts) — 글을 손으로 1,500줄 쓰지 않고, 기준을 바꾸면 한 번에 바뀌게.
 *
 *   npx tsx scripts/wear.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import world from '../src/data/world.json' with { type: 'json' };
import countries from '../src/data/countries.json' with { type: 'json' };

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/data/wear.json');
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const UA = { 'User-Agent': 'borapin-data-build (github.com/ysangyn/borapin)' };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const r1 = (x: number) => Math.round(x * 10) / 10;

async function retry<T>(f: () => Promise<T>, what: string): Promise<T> {
  for (let i = 1; ; i++) {
    try { return await f(); } catch (e) { if (i >= 4) throw new Error(`${what}: ${(e as Error).message}`); await sleep(1500 * i); }
  }
}

async function geocode(en: string, iso2: string): Promise<[number, number]> {
  return retry(async () => {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(en)}&count=10&language=en&format=json`, { headers: UA });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = (await r.json()) as { results?: { latitude: number; longitude: number; country_code: string; population?: number }[] };
    const hits = (j.results ?? []).filter((x) => x.country_code?.toUpperCase() === iso2.toUpperCase()).sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
    if (!hits[0]) throw new Error('못 찾음');
    return [hits[0].latitude, hits[0].longitude];
  }, `지오코딩 ${en}`);
}

async function climate(lat: number, lng: number) {
  return retry(async () => {
    const r = await fetch(`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,T2M_RANGE,PRECTOTCORR&community=RE&latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&format=JSON`, { headers: UA });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const p = ((await r.json()) as { properties: { parameter: Record<string, Record<string, number>> } }).properties.parameter;
    const t = MON.map((m) => p.T2M[m]), rg = MON.map((m) => p.T2M_RANGE[m]), pr = MON.map((m) => p.PRECTOTCORR[m]);
    if ([...t, ...rg, ...pr].some((x) => typeof x !== 'number' || x < -90)) throw new Error('값이 비었어요');
    return { t: t.map(r1), hi: t.map((x, i) => r1(x + rg[i] / 2)), lo: t.map((x, i) => r1(x - rg[i] / 2)), r: pr.map(r1) };
  }, `기후 ${lat},${lng}`);
}

async function main() {
  const iso = new Map((countries as { id: string; iso2: string | null }[]).map((c) => [c.id, c.iso2 ?? '']));
  const prev = fs.existsSync(OUT) ? (JSON.parse(fs.readFileSync(OUT, 'utf8')) as { cities: Record<string, unknown> }).cities : {};
  const cities: Record<string, unknown> = {};
  let ok = 0, kept = 0, fail = 0;
  for (const w of (world as { cities: { c: string; city: string; en: string }[] }).cities) {
    const key = `${w.c}:${w.city}`;
    try {
      const [lat, lng] = await geocode(w.en, iso.get(w.c) ?? '');
      cities[key] = { lat: r1(lat), lng: r1(lng), ...(await climate(lat, lng)) };
      ok++;
      console.log(`✓ ${key} ${lat.toFixed(2)},${lng.toFixed(2)}`);
    } catch (e) {
      if (prev[key]) { cities[key] = prev[key]; kept++; } else fail++;
      console.log(`✗ ${key} ${(e as Error).message}${prev[key] ? ' (지난 값 유지)' : ''}`);
    }
    await sleep(300);
  }
  console.log(`받음 ${ok} · 지난 값 ${kept} · 실패 ${fail}`);
  if (ok + kept < 100) throw new Error('100곳 미만이라 쓰지 않아요');
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), source: 'NASA POWER 평년 기후 · Open-Meteo 지오코딩', cities }) + '\n');
}
main().catch((e) => { console.error(e); process.exit(1); });
