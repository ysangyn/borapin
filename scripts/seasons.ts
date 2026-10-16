/**
 * 가기 좋은 달 계산 (데이터를 만들 때 한 번만 실행 → src/data/seasons.json)
 *
 * 자료: NASA POWER 월별 기후값 (지점마다 한 번 호출로 12달 평균, 무료·키 없음)
 *   https://power.larc.nasa.gov/docs/services/api/temporal/climatology/
 * 지점: 국내 시·군 160칸의 대표 좌표, 나라는 대표 지점(라벨 위치)
 *
 * 규칙: 낮 최고기온이 18~26℃에 가깝고 비가 적은 달이 높은 점수.
 *       1년 내내 덥거나 추운 곳은 그중 나은 달(건기, 따뜻한 달)을 고른다.
 *
 *   npx tsx scripts/seasons.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import regionsData from '../src/data/regions.json' with { type: 'json' };
import countriesData from '../src/data/countries.json' with { type: 'json' };

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/data/seasons.json');
const RAW = path.join(ROOT, 'data/climate.json');
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export interface Climate {
  /** 달마다 낮 최고기온 평균(℃) */
  tmax: number[];
  /** 달마다 하루 강수량 평균(mm) */
  prcp: number[];
}

async function fetchClimate(lat: number, lng: number): Promise<Climate> {
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M_MAX,PRECTOTCORR&community=RE&latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&format=JSON`;
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'borapin-data-build (github.com/ysangyn/borapin)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { properties: { parameter: Record<string, Record<string, number>> } };
      const p = j.properties.parameter;
      const tmax = MON.map((m) => p.T2M_MAX[m]);
      const prcp = MON.map((m) => p.PRECTOTCORR[m]);
      if (tmax.some((x) => typeof x !== 'number' || x < -90) || prcp.some((x) => typeof x !== 'number' || x < 0)) throw new Error('값이 비었어요');
      return { tmax, prcp };
    } catch (e) {
      if (attempt >= 4) throw new Error(`${lat},${lng}: ${(e as Error).message}`);
      await new Promise((res) => setTimeout(res, 1500 * attempt));
    }
  }
}

const comfort = (t: number) =>
  t >= 18 && t <= 26 ? 1 : t >= 15 && t <= 28.5 ? 0.65 : t >= 12 && t <= 30.5 ? 0.3 : 0;
const dryness = (mm: number) => (mm <= 2.2 ? 1 : mm <= 3.5 ? 0.75 : mm <= 5 ? 0.45 : mm <= 7 ? 0.2 : 0);

/** 점수로 좋은 달을 고르고 이유를 붙인다 */
export function bestMonths(c: Climate): { m: number[]; why: string } {
  const score = c.tmax.map((t, i) => comfort(t) * 0.65 + dryness(c.prcp[i]) * 0.35);
  let m = score.map((s, i) => [s, i + 1] as const).filter(([s]) => s >= 0.74).map(([, i]) => i);
  const hotAll = Math.min(...c.tmax) >= 28;
  const coldAll = Math.max(...c.tmax) < 17;
  let why = '';
  if (m.length > 5) {
    // 좋은 달이 많으면 점수 높은 5달만
    m = m.sort((a, b) => score[b - 1] - score[a - 1] || a - b).slice(0, 5);
  }
  if (m.length >= 2) {
    const wet = m.filter((x) => c.prcp[x - 1] > 3.5).length * 2 > m.length;
    why = wet ? '덥지도 춥지도 않아요' : '선선하고 비가 적어요';
  } else if (hotAll) {
    // 1년 내내 더운 곳: 비가 가장 적은 달(건기)
    const order = c.prcp.map((p, i) => [p, i + 1] as const).sort((a, b) => a[0] - b[0]);
    m = order.slice(0, 4).map(([, i]) => i);
    why = '건기라 비가 적어요';
  } else if (coldAll) {
    const order = c.tmax.map((t, i) => [t, i + 1] as const).sort((a, b) => b[0] - a[0]);
    m = order.slice(0, 3).map(([, i]) => i);
    why = '1년 중 가장 따뜻한 달이에요';
  } else {
    const order = score.map((s, i) => [s, i + 1] as const).sort((a, b) => b[0] - a[0]);
    m = order.slice(0, 3).map(([, i]) => i);
    why = '1년 중 날씨가 가장 무난해요';
  }
  return { m: m.sort((a, b) => a - b), why };
}

async function pool<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
        if (i % 20 === 0) console.log(`  ${i + 1}/${items.length}`);
      }
    }),
  );
  return out;
}

async function main() {
  const regions = regionsData.regions as { code: string; name: string; lng: number; lat: number }[];
  const countries = (countriesData as { id: string; name: string; lng: number; lat: number }[]).filter((c) => c.id !== 'KOR');
  const cache: Record<string, Climate> = fs.existsSync(RAW) ? JSON.parse(fs.readFileSync(RAW, 'utf8')) : {};
  const todo = [
    ...regions.map((r) => ({ key: `kr:${r.code}`, lat: r.lat, lng: r.lng })),
    ...countries.map((c) => ({ key: `w:${c.id}`, lat: c.lat, lng: c.lng })),
  ].filter((x) => !cache[x.key]);
  console.log(`기후값 받기: ${todo.length}곳 (이미 받은 곳 ${Object.keys(cache).length})`);
  const failed: string[] = [];
  await pool(todo, 4, async (x) => {
    try {
      cache[x.key] = await fetchClimate(x.lat, x.lng);
    } catch (e) {
      failed.push((e as Error).message);
    }
  });
  fs.mkdirSync(path.dirname(RAW), { recursive: true });
  fs.writeFileSync(RAW, JSON.stringify(cache) + '\n');

  const kr: Record<string, { m: number[]; why: string }> = {};
  const world: Record<string, { m: number[]; why: string }> = {};
  for (const [k, c] of Object.entries(cache)) {
    const [t, id] = k.split(':');
    (t === 'kr' ? kr : world)[id] = bestMonths(c);
  }
  const out = { updated: new Date().toISOString().slice(0, 10), source: 'NASA POWER 월별 기후값', kr, world };
  fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
  console.log(`✓ 국내 ${Object.keys(kr).length}곳, 나라 ${Object.keys(world).length}곳 → src/data/seasons.json`);
  if (failed.length) {
    console.log(`받지 못한 곳 ${failed.length}개:`);
    failed.slice(0, 20).forEach((f) => console.log('  - ' + f));
  }
  if (Object.keys(kr).length < regions.length) process.exit(1);
}

if (process.argv[1]?.endsWith('seasons.ts')) main();
