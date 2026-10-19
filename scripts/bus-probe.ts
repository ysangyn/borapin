/**
 * 버스·열차 공공데이터 범위 확인 (국토교통부 TAGO). 앱에는 아무것도 넣지 않고 보고서만 남긴다.
 * DATA_GO_KR_KEY=… npx tsx scripts/bus-probe.ts > bus-probe.txt
 * 1) 서비스마다 도시 코드·터미널(역) 목록 → 우리 160개 시·군과 이름 맞추기
 * 2) 고양(일산·화정·백석) 출발 → 경북·충북 쪽 터미널로 내일 배차가 있는지 (호출 수 제한)
 * 3) 고양 → 문경새재 예시: 문경·점촌행, 충주·청주 경유 후보
 */
import fs from 'node:fs';

const KEY = process.env.DATA_GO_KR_KEY;
if (!KEY) { console.error('DATA_GO_KR_KEY가 없어요'); process.exit(1); }
const BASE = 'https://apis.data.go.kr/1613000';
let calls = 0;
const raw: Record<string, string> = {};

type Item = Record<string, string | number>;
async function api(svc: string, op: string, params: Record<string, string | number> = {}): Promise<{ items: Item[]; total: number; err?: string }> {
  const qs = new URLSearchParams({ serviceKey: KEY!, _type: 'json', numOfRows: '1000', pageNo: '1', ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const url = `${BASE}/${svc}/${op}?${qs}`;
  calls++;
  try {
    const r = await fetch(url);
    const t = await r.text();
    if (!raw[`${svc}/${op}`]) raw[`${svc}/${op}`] = `${r.status} ${t.slice(0, 300)}`;
    let j: { response?: { header?: { resultCode?: string; resultMsg?: string }; body?: { items?: { item?: Item | Item[] } | ''; totalCount?: number } } };
    try { j = JSON.parse(t); } catch { return { items: [], total: 0, err: `${r.status} ${t.slice(0, 120)}` }; }
    const code = j.response?.header?.resultCode;
    if (code && code !== '00') return { items: [], total: 0, err: `${code} ${j.response?.header?.resultMsg}` };
    const it = j.response?.body?.items && typeof j.response.body.items === 'object' ? j.response.body.items.item : undefined;
    const items = !it ? [] : Array.isArray(it) ? it : [it];
    return { items, total: Number(j.response?.body?.totalCount ?? items.length) };
  } catch (e) {
    return { items: [], total: 0, err: String(e).slice(0, 120) };
  }
}
const pause = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
const tomorrow = (() => { const d = new Date(Date.now() + 9 * 3600_000 + 86400_000); return d.toISOString().slice(0, 10).replace(/-/g, ''); })();

const regions = (JSON.parse(fs.readFileSync('src/data/regions.json', 'utf8')) as { regions: { code: string; name: string; groupName: string }[] }).regions;
const short = (n: string) => (n.length >= 3 ? n.replace(/[시군구]$/, '') : n);

interface Svc { label: string; svc: string; cities: string; stops: string; stopsParam: string; idKey: string; nameKey: string; route: string; dep: string; arr: string }
const SVCS: Svc[] = [
  { label: '시외버스', svc: 'SuburbsBusInfoService', cities: 'getCtyCodeList', stops: 'getSuberbsBusTrminlList', stopsParam: 'cityCode', idKey: 'terminalId', nameKey: 'terminalNm', route: 'getStrtpntAlocFndSuberbsBusInfo', dep: 'depTerminalId', arr: 'arrTerminalId' },
  { label: '고속버스', svc: 'ExpBusInfoService', cities: 'getCtyCodeList', stops: 'getExpBusTrminlList', stopsParam: 'cityCode', idKey: 'terminalId', nameKey: 'terminalNm', route: 'getStrtpntAlocFndExpbusInfo', dep: 'depTerminalId', arr: 'arrTerminalId' },
  { label: '열차', svc: 'TrainInfoService', cities: 'getCtyCodeList', stops: 'getCtyAcctoTrainSttnList', stopsParam: 'cityCode', idKey: 'nodeid', nameKey: 'nodename', route: 'getStrtpntAlocFndTrainInfo', dep: 'depPlaceId', arr: 'arrPlaceId' },
];

const out: string[] = [];
const log = (s = '') => { out.push(s); console.log(s); };
log(`버스·열차 공공데이터 범위 확인 · 내일 ${tomorrow} 기준`);

const found: Record<string, { id: string; name: string; city: string }[]> = {};
for (const s of SVCS) {
  log(`\n## ${s.label} (${s.svc})`);
  const cities = await api(s.svc, s.cities);
  if (cities.err) { log(`도시 코드 실패: ${cities.err}`); found[s.label] = []; continue; }
  log(`도시 코드 ${cities.items.length}개`);
  const stops: { id: string; name: string; city: string }[] = [];
  // 터미널 목록: 도시마다 (시외버스·열차) / 고속버스는 도시 없이도 됨
  const all = await api(s.svc, s.stops, { numOfRows: 3000 });
  if (!all.err && all.items.length > 50) {
    for (const it of all.items) stops.push({ id: String(it[s.idKey]), name: String(it[s.nameKey]), city: String(it.cityName ?? '') });
  } else {
    for (const c of cities.items) {
      const r = await api(s.svc, s.stops, { [s.stopsParam]: String(c.citycode ?? c.cityCode) });
      for (const it of r.items) stops.push({ id: String(it[s.idKey]), name: String(it[s.nameKey]), city: String(c.cityname ?? c.cityName ?? '') });
      await pause(60);
    }
  }
  found[s.label] = stops;
  log(`터미널·역 ${stops.length}곳`);
  const hit = regions.filter((r) => stops.some((t) => t.name.includes(short(r.name))));
  log(`우리 ${regions.length}개 시·군 중 이름이 맞는 곳: ${hit.length}곳`);
  const miss = regions.filter((r) => !hit.includes(r)).map((r) => `${r.groupName} ${r.name}`);
  log(`없는 곳(일부): ${miss.slice(0, 40).join(', ')}${miss.length > 40 ? ` 외 ${miss.length - 40}` : ''}`);
  const goyang = stops.filter((t) => /고양|일산|화정|백석|대화|탄현/.test(t.name));
  log(`고양 쪽: ${goyang.map((t) => `${t.name}(${t.id})`).join(', ') || '없음'}`);
}

// 고양 → 경북·충북 쪽 배차 (시외·고속), 문경새재 예시
const TARGET = /문경|점촌|충주|청주|괴산|상주|예천|안동|제천|단양|수안보|연풍|이천|여주|원주/;
for (const s of SVCS) {
  const stops = found[s.label] ?? [];
  const deps = stops.filter((t) => /고양|일산|화정|백석|대화|탄현/.test(t.name)).slice(0, 4);
  const arrs = stops.filter((t) => TARGET.test(t.name)).slice(0, 40);
  if (!deps.length || !arrs.length) { log(`\n${s.label}: 고양 출발 또는 도착 후보 없음 (출발 ${deps.length}, 도착 ${arrs.length})`); continue; }
  log(`\n## ${s.label}: 고양 출발 → 경북·충북 쪽 (내일)`);
  for (const d of deps) {
    for (const a of arrs) {
      if (calls > 600) break;
      const r = await api(s.svc, s.route, { [s.dep]: d.id, [s.arr]: a.id, depPlandTime: tomorrow });
      if (r.items.length) {
        const times = r.items.map((x) => String(x.depPlandTime ?? '').slice(8, 12)).filter(Boolean);
        const dur = r.items[0] && r.items[0].arrPlandTime && r.items[0].depPlandTime ? '' : '';
        log(`✓ ${d.name} → ${a.name}: 하루 ${r.items.length}회 · 첫차 ${times[0] ?? '?'} · 막차 ${times[times.length - 1] ?? '?'}${dur} · 요금 ${r.items[0].charge ?? r.items[0].adultcharge ?? '?'}`);
      } else if (r.err) log(`· ${d.name} → ${a.name}: ${r.err}`);
      await pause(60);
    }
  }
}

log(`\n호출 ${calls}번`);
log('\n## 응답 첫머리 (형식 확인용)');
for (const [k, v] of Object.entries(raw)) log(`${k}: ${v.replace(/serviceKey=[^&"]+/g, 'serviceKey=***')}`);
fs.writeFileSync('bus-probe.json', JSON.stringify(found, null, 1));
