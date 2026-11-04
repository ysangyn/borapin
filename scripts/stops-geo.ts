/**
 * 역·터미널 자리 (갈아타기 거리: 걸어서 700m·택시 4km 기준) — CI에서만 (.github/workflows/bus.yml)
 * 노선에 쓰이는 정류지만, 아직 자리를 모르는 것만 오픈스트리트맵 Nominatim으로 찾는다 (1초에 1번, 무료).
 * 그 시·군 가운데에서 30km 넘게 떨어진 결과는 버린다(이름만 같은 다른 곳).
 *   STATE=bus/state.json GEO=bus/stops-geo.json npx tsx scripts/stops-geo.ts
 */
import fs from 'node:fs';

const STATE = process.env.STATE ?? 'bus/state.json';
const GEO = process.env.GEO ?? 'bus/stops-geo.json';
const MAX = Number(process.env.MAX ?? 400);
const UA = { 'User-Agent': 'borapin-data-build/1.0 (github.com/ysangyn/borapin)', 'Accept-Language': 'ko' };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Svc = 'S' | 'E' | 'T';
interface Stop { svc: Svc; id: string; name: string; region: string }
const st = JSON.parse(fs.readFileSync(STATE, 'utf8')) as { stops: Stop[]; routes: [Svc, string, string][] };
const regions = new Map((JSON.parse(fs.readFileSync('src/data/regions.json', 'utf8')) as { regions: { code: string; name: string; lat: number; lng: number }[] }).regions.map((r) => [r.code, r]));
let geo: Record<string, [number, number] | null> = {};
try { geo = JSON.parse(fs.readFileSync(GEO, 'utf8')); } catch { /* 처음 */ }
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88);

const used = new Set(st.routes.flatMap((r) => [`${r[0]}|${r[1]}`, `${r[0]}|${r[2]}`]));
const todo = st.stops.filter((s) => used.has(`${s.svc}|${s.id}`) && !(`${s.svc}|${s.id}` in geo)).slice(0, MAX);
console.log(`자리 아는 정류지 ${Object.values(geo).filter(Boolean).length} · 이번에 찾을 것 ${todo.length}`);

const words = (s: Stop) => {
  const n = s.name.replace(/\(.*\)/g, '').trim();
  const r = regions.get(s.region)?.name ?? '';
  return s.svc === 'T' ? [`${n}역`, `${n}역 ${r}`] : s.svc === 'E' ? [`${n} 고속버스터미널`, `${n}터미널 ${r}`, `${n} 터미널`] : [`${n} 시외버스터미널`, `${n}터미널 ${r}`, `${n} 터미널`];
};
let ok = 0, miss = 0;
for (const s of todo) {
  const c = regions.get(s.region);
  let hit: [number, number] | null = null;
  for (const q of words(s)) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=kr&q=${encodeURIComponent(q)}`, { headers: UA });
      const j = (r.ok ? await r.json() : []) as { lat: string; lon: string }[];
      const near = j.map((x) => [Number(x.lat), Number(x.lon)] as [number, number]).find(([lat, lng]) => !c || km({ lat, lng }, c) <= 30);
      await sleep(1100);
      if (near) { hit = [Math.round(near[0] * 1e4) / 1e4, Math.round(near[1] * 1e4) / 1e4]; break; }
    } catch { await sleep(2000); }
  }
  geo[`${s.svc}|${s.id}`] = hit;
  if (hit) ok++; else miss++;
  console.log(`${hit ? '✓' : '✗'} ${s.svc} ${s.name} ${hit ? hit.join(',') : ''}`);
}
fs.writeFileSync(GEO, JSON.stringify(geo));
console.log(`찾음 ${ok} · 못 찾음 ${miss} · 모두 ${Object.values(geo).filter(Boolean).length}`);
