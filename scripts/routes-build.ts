/**
 * 모은 노선(bus-data 브랜치 state.json) → 앱 자료 src/data/routes.json (+ public/data 사본)
 *   STATE=bus/state.json npx tsx scripts/routes-build.ts
 * - 한쪽 방향만 나온 노선은 반대 방향도 있다고 본다 (공공데이터가 한쪽만 비는 일이 있다: 고양종합 출발 시외 0, 도착은 있음). 표시: 반대 방향으로 확인
 * - 같은 시·군 같은 이름(고양종합=고양백석처럼 시외·고속 이름만 다른 곳)은 화면에서 시·군으로 묶어 보여 준다
 * - 받기 실패·파일 없음이면 지난 자료 그대로
 */
import fs from 'node:fs';

type Svc = 'S' | 'E' | 'T';
type Route = [Svc, string, string, number, number, number, number?, number?, string?, [number, number, 0 | 1][]?, ([number, number, 0 | 1][] | null)?, ([number, number, 0 | 1][] | null)?];
interface Stop { svc: Svc; id: string; name: string; region: string }
interface State { stops: Stop[]; routes: Route[]; updated: string; scannedAt?: string; checkedAt?: string }

/** 앱 자료: s = 정류지 [이름, 시·군 코드, 서비스], r = [서비스, 출발 정류지 번호, 도착 번호, 하루 편수, 가장 빠른 분, KTX 편수(-1 모름), KTX 가장 빠른 분, 반대 방향으로 확인 1, 시각표(출발분·걸리는분·KTX 셋씩 펼침, 모르면 빈 칸), 토요일 시각표(같은 모양, 안 받았으면 null·토요일엔 없으면 빈 칸), 일요일 시각표(같은 모양)]
 * 정류지 s에 자리를 알면 [이름, 시·군, 서비스, 위도, 경도] (갈아타기 거리) */
export interface RoutesData { updated: string; s: ([string, string, Svc] | [string, string, Svc, number, number])[]; r: [Svc, number, number, number, number, number, number, 0 | 1, number[], number[] | null, number[] | null][] }

const REG = (() => { try { return new Map((JSON.parse(fs.readFileSync('src/data/regions.json', 'utf8')) as { regions: { code: string; lat: number; lng: number }[] }).regions.map((r) => [r.code, r])); } catch { return new Map<string, { lat: number; lng: number }>(); } })();
/** 이름이 같은 다른 곳(양주 장흥역 ↔ 전남 장흥군)을 걸러 낸다: 시·군 사이 직선거리를 그 시간에 갈 수 없으면(시속 300km 넘게) 버림 */
export function plausible(fromCode: string, toCode: string, min: number): boolean {
  const a = REG.get(fromCode), b = REG.get(toCode);
  if (!a || !b) return true;
  const km = Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88);
  return km / Math.max(min / 60, 0.1) <= 300;
}

export function build(st: State, geo: Record<string, [number, number] | null> = {}): RoutesData {
  const used = new Set<string>();
  const ok = st.routes.filter((r) => r[3] > 0 && r[4] > 0 && r[4] < 24 * 60);
  const key = (r: Route) => `${r[0]}|${r[1]}|${r[2]}`;
  const have = new Set(ok.map(key));
  const all: [Route, 0 | 1][] = ok.map((r) => [r, 0]);
  for (const r of ok) {
    const back: Route = [r[0], r[2], r[1], r[3], r[4], r[5], r[6], r[7], r[8], [], null, null]; // 반대 방향 시각표는 모름
    if (!have.has(key(back))) { all.push([back, 1]); have.add(key(back)); }
  }
  const stops = new Map(st.stops.map((s) => [`${s.svc}|${s.id}`, s]));
  const idx = new Map<string, number>();
  const s: RoutesData['s'] = [];
  const at = (svc: Svc, id: string) => {
    const k = `${svc}|${id}`;
    if (!idx.has(k)) { const p = stops.get(k)!; idx.set(k, s.length); const g = geo[k]; s.push(g ? [p.name, p.region, svc, g[0], g[1]] : [p.name, p.region, svc]); }
    return idx.get(k)!;
  };
  const r: RoutesData['r'] = [];
  for (const [x, inferred] of all) {
    const a = stops.get(`${x[0]}|${x[1]}`), b = stops.get(`${x[0]}|${x[2]}`);
    if (!a || !b || a.region === b.region || !plausible(a.region, b.region, x[4])) continue;
    used.add(a.region); used.add(b.region);
    r.push([x[0], at(x[0], x[1]), at(x[0], x[2]), x[3], x[4], x[6] ?? -1, x[7] ?? -1, inferred, (x[9] ?? []).flat(), x[10] == null ? null : x[10].flat(), x[11] == null ? null : x[11].flat()]);
  }
  r.sort((p, q) => p[1] - q[1] || p[2] - q[2] || p[0].localeCompare(q[0]));
  const month = (st.checkedAt || st.scannedAt || st.updated || '').slice(0, 7);
  return { updated: month, s, r };
}

const isMain = process.argv[1]?.endsWith('routes-build.ts');
if (isMain) {
  const STATE = process.env.STATE ?? 'bus/state.json';
  let st: State | null = null;
  try { st = JSON.parse(fs.readFileSync(STATE, 'utf8')) as State; } catch { /* 없으면 지난 자료 */ }
  if (!st?.routes?.length) { console.log('모은 노선이 없어 지난 자료 그대로'); process.exit(0); }
  let geo: Record<string, [number, number] | null> = {};
  try { geo = JSON.parse(fs.readFileSync(STATE.replace(/state\.json$/, 'stops-geo.json'), 'utf8')); } catch { /* 자리 모름 */ }
  const out = build(st, geo);
  const txt = JSON.stringify(out);
  fs.writeFileSync('src/data/routes.json', txt + '\n');
  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync('public/data/routes.json', txt);
  const by = (c: Svc) => out.r.filter((x) => x[0] === c).length;
  console.log(`노선 ${out.r.length}개 (열차 ${by('T')} · 고속 ${by('E')} · 시외 ${by('S')} · 반대 방향으로 확인 ${out.r.filter((x) => x[7]).length}) · 정류지 ${out.s.length} · ${(txt.length / 1024).toFixed(0)}KB · 자리 아는 정류지 ${out.s.filter((x) => x.length > 3).length} · ${out.updated} 기준`);
}
