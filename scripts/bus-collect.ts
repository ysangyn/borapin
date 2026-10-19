/**
 * 버스·KTX 노선 찾기 (백그라운드, 여러 날에 나눠): 대표 정류지끼리 '노선이 있는 짝'만 모은다.
 * 상태는 state.json에 남겨 다음 실행이 이어 간다 (하루 한도 안에서 MAX_CALLS만큼).
 *   DATA_GO_KR_KEY=… STATE=bus/state.json npx tsx scripts/bus-collect.ts
 * 결과: state.json { stops, queue 위치, routes: [서비스, 출발id, 도착id, 하루 횟수, 소요분, 요금] }
 */
import fs from 'node:fs';

const KEY = process.env.DATA_GO_KR_KEY;
if (!KEY) { console.error('DATA_GO_KR_KEY가 없어요'); process.exit(1); }
const STATE = process.env.STATE ?? 'bus-state.json';
const MAX_CALLS = Number(process.env.MAX_CALLS ?? 8500);
const BASE = 'https://apis.data.go.kr/1613000';
type Item = Record<string, string | number>;
const pause = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
let calls = 0;
async function api(svc: string, op: string, p: Record<string, string> = {}): Promise<Item[] | null> {
  const qs = new URLSearchParams({ serviceKey: KEY!, _type: 'json', numOfRows: '3000', pageNo: '1', ...p });
  calls++;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(`${BASE}/${svc}/${op}?${qs}`, { signal: AbortSignal.timeout(20000) });
      const t = await r.text();
      if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS|한도/.test(t)) return null; // 오늘 한도 끝
      const j = JSON.parse(t) as { response?: { body?: { items?: { item?: Item | Item[] } } } };
      const it = j.response?.body?.items && typeof j.response.body.items === 'object' ? j.response.body.items.item : undefined;
      return !it ? [] : Array.isArray(it) ? it : [it];
    } catch { await pause(1500 * (i + 1)); }
  }
  return [];
}

interface Stop { svc: 'S' | 'E' | 'T'; id: string; name: string; region: string }
interface State { v: 1; stops: Stop[]; pairs: number; done: number; routes: [string, string, string, number, number, number][]; updated: string }
const SVC = { S: ['SuburbsBusInfo', 'GetStrtpntAlocFndSuberbsBusInfo', 'depTerminalId', 'arrTerminalId'], E: ['ExpBusInfo', 'GetStrtpntAlocFndExpbusInfo', 'depTerminalId', 'arrTerminalId'], T: ['TrainInfo', 'GetStrtpntAlocFndTrainInfo', 'depPlaceId', 'arrPlaceId'] } as const;

const regions = (JSON.parse(fs.readFileSync('src/data/regions.json', 'utf8')) as { regions: { code: string; name: string; lat: number; lng: number }[] }).regions;
const short = (n: string) => (n.length >= 3 ? n.replace(/[시군구]$/, '') : n);
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88);
const byCode = new Map(regions.map((r) => [r.code, r]));

/** 대표 정류지: 시·군 이름과 같거나 '이름+종합/터미널/시외/고속'인 곳, 시·군마다 서비스별 최대 2곳 + 고양 출발지 */
async function pickStops(): Promise<Stop[]> {
  const out: Stop[] = [];
  const add = (svc: Stop['svc'], list: { id: string; name: string }[]) => {
    for (const r of regions) {
      const s = short(r.name);
      const hit = list.filter((t) => t.name === s || new RegExp(`^${s}(종합|터미널|시외|고속|공용|버스|역)?(\\(.+\\))?$`).test(t.name)).slice(0, 2);
      for (const t of hit) out.push({ svc, id: t.id, name: t.name, region: r.code });
    }
  };
  const sub = (await api('SuburbsBusInfo', 'GetSuberbsBusTrminlList')) ?? [];
  add('S', sub.map((t) => ({ id: String(t.terminalId), name: String(t.terminalNm) })));
  const exp = (await api('ExpBusInfo', 'GetExpBusTrminlList')) ?? [];
  add('E', exp.map((t) => ({ id: String(t.terminalId), name: String(t.terminalNm) })));
  for (const t of exp) if (/^고양(백석|화정)$/.test(String(t.terminalNm))) out.push({ svc: 'E', id: String(t.terminalId), name: String(t.terminalNm), region: regions.find((r) => r.name === '고양시')?.code ?? '' });
  const cities = (await api('TrainInfo', 'GetCtyCodeList')) ?? [];
  const st: { id: string; name: string }[] = [];
  for (const c of cities) { for (const s of (await api('TrainInfo', 'GetCtyAcctoTrainSttnList', { cityCode: String(c.citycode) })) ?? []) st.push({ id: String(s.nodeid), name: String(s.nodename) }); await pause(50); }
  add('T', st);
  for (const s of st) if (s.name === '행신') out.push({ svc: 'T', id: s.id, name: s.name, region: regions.find((r) => r.name === '고양시')?.code ?? '' });
  const seen = new Set<string>();
  return out.filter((s) => s.region && !seen.has(s.svc + s.id) && seen.add(s.svc + s.id));
}

/** 묻는 짝: 같은 서비스, 30km 넘게 떨어진 시·군끼리 (시외는 300km 안) */
function pairList(stops: Stop[]): [Stop, Stop][] {
  const out: [Stop, Stop][] = [];
  for (const a of stops) for (const b of stops) {
    if (a.svc !== b.svc || a.id === b.id || a.region === b.region) continue;
    const d = km(byCode.get(a.region)!, byCode.get(b.region)!);
    if (d < 30 || (a.svc === 'S' && d > 300)) continue;
    out.push([a, b]);
  }
  return out;
}

const day = (() => { const d = new Date(Date.now() + 9 * 3600_000 + 86400_000); while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ''); })();
const mins = (x: Item) => { const d = String(x.depPlandTime ?? x.depplandtime ?? ''), a = String(x.arrPlandTime ?? x.arrplandtime ?? ''); if (d.length < 12 || a.length < 12) return 0; const m = (t: string) => +t.slice(8, 10) * 60 + +t.slice(10, 12); return (m(a) - m(d) + 1440) % 1440; };

let st: State;
try { st = JSON.parse(fs.readFileSync(STATE, 'utf8')) as State; } catch { st = { v: 1, stops: [], pairs: 0, done: 0, routes: [], updated: '' }; }
if (!st.stops.length) { st.stops = await pickStops(); st.done = 0; st.routes = []; console.log(`대표 정류지 ${st.stops.length}곳 (시외 ${st.stops.filter((s) => s.svc === 'S').length} · 고속 ${st.stops.filter((s) => s.svc === 'E').length} · 열차 ${st.stops.filter((s) => s.svc === 'T').length})`); }
const pairs = pairList(st.stops);
st.pairs = pairs.length;
console.log(`짝 ${pairs.length}개 중 ${st.done}개 끝 · 이번 최대 ${MAX_CALLS}번`);

let stop = false;
const CONC = 6;
while (!stop && st.done < pairs.length && calls < MAX_CALLS) {
  const batch = pairs.slice(st.done, st.done + CONC);
  const res = await Promise.all(batch.map(([a, b]) => { const [svc, op, dk, ak] = SVC[a.svc]; return api(svc, op, { [dk]: a.id, [ak]: b.id, depPlandTime: day }); }));
  if (res.some((r) => r === null)) { console.log('오늘 한도에 닿아 멈춰요'); stop = true; break; }
  res.forEach((r, i) => { if (r && r.length) { const [a, b] = batch[i]; st.routes.push([a.svc, a.id, b.id, r.length, mins(r[0]), Number(r[0].charge ?? r[0].adultcharge ?? 0)]); } });
  st.done += batch.length;
  if (st.done % 600 < CONC) { st.updated = new Date().toISOString(); fs.writeFileSync(STATE, JSON.stringify(st)); }
}
st.updated = new Date().toISOString();
fs.writeFileSync(STATE, JSON.stringify(st));
console.log(`이번 호출 ${calls}번 · 진행 ${st.done}/${pairs.length} (${Math.round((st.done / Math.max(1, pairs.length)) * 100)}%) · 찾은 노선 ${st.routes.length}개`);
