/** 열차 자료 검증: 역 목록(도시별), 차량 종류, 행신·판교 출발 KTX, 고양종합 시외 재확인. 보고서만. */
const KEY = process.env.DATA_GO_KR_KEY!;
const BASE = 'https://apis.data.go.kr/1613000';
type Item = Record<string, string | number>;
const pause = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
async function api(svc: string, op: string, p: Record<string, string> = {}): Promise<Item[]> {
  const qs = new URLSearchParams({ serviceKey: KEY, _type: 'json', numOfRows: '1000', pageNo: '1', ...p });
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(`${BASE}/${svc}/${op}?${qs}`, { signal: AbortSignal.timeout(20000) });
      const j = (await r.json()) as { response?: { body?: { items?: { item?: Item | Item[] } } } };
      const it = j.response?.body?.items && typeof j.response.body.items === 'object' ? j.response.body.items.item : undefined;
      return !it ? [] : Array.isArray(it) ? it : [it];
    } catch { await pause(2000 * (i + 1)); }
  }
  return [];
}
const day = (() => { const d = new Date(Date.now() + 9 * 3600_000 + 86400_000); return d.toISOString().slice(0, 10).replace(/-/g, ''); })();
const sat = (() => { const d = new Date(Date.now() + 9 * 3600_000); d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7 || 7)); return d.toISOString().slice(0, 10).replace(/-/g, ''); })();

console.log('차량 종류:', (await api('TrainInfo', 'GetVhcleKndList')).map((x) => `${x.vehiclekndnm}(${x.vehiclekndid})`).join(', '));
const cities = await api('TrainInfo', 'GetCtyCodeList');
const st: { id: string; name: string; city: string }[] = [];
for (const c of cities) { for (const s of await api('TrainInfo', 'GetCtyAcctoTrainSttnList', { cityCode: String(c.citycode) })) st.push({ id: String(s.nodeid), name: String(s.nodename), city: String(c.cityname) }); await pause(50); }
console.log(`역 ${st.length}곳`);
const find = (re: RegExp) => st.filter((s) => re.test(s.name));
for (const n of ['행신', '일산', '판교', '문경', '서울', '용산', '충주', '점촌', '상주', '수서']) console.log(`${n}: ${find(new RegExp(n)).map((s) => `${s.name}(${s.id})`).join(', ') || '없음'}`);

const show = async (a: string, b: string, date: string) => {
  const A = find(new RegExp(`^${a}$`))[0], B = find(new RegExp(`^${b}$`))[0];
  if (!A || !B) return console.log(`${a}→${b}: 역 없음`);
  const r = await api('TrainInfo', 'GetStrtpntAlocFndTrainInfo', { depPlaceId: A.id, arrPlaceId: B.id, depPlandTime: date });
  const kinds = [...new Set(r.map((x) => String(x.traingradename)))].join('/');
  console.log(`${a}→${b} (${date}): ${r.length}회 · ${kinds} · 예) ${r.slice(0, 2).map((x) => `${String(x.depplandtime).slice(8, 12)}→${String(x.arrplandtime).slice(8, 12)} ${x.traingradename} ${x.adultcharge}원`).join(' | ')}`);
};
for (const [a, b] of [['행신', '부산'], ['행신', '동대구'], ['행신', '광주송정'], ['행신', '강릉'], ['판교', '문경'], ['서울', '부산'], ['일산', '문산']]) { await show(a, b, day); await pause(50); }
await show('판교', '문경', sat);

// KTX가 서는 역 (행신 출발로 닿는 곳 + 판교 출발)
const ktx = new Set<string>();
for (const from of ['행신', '서울', '수서', '판교']) {
  const A = find(new RegExp(`^${from}$`))[0];
  if (!A) continue;
  let n = 0;
  for (const B of st) {
    if (B.id === A.id) continue;
    const r = await api('TrainInfo', 'GetStrtpntAlocFndTrainInfo', { depPlaceId: A.id, arrPlaceId: B.id, depPlandTime: day });
    if (r.some((x) => /KTX/.test(String(x.traingradename)))) { ktx.add(B.name); n++; }
    await pause(15);
  }
  console.log(`${from} 출발 KTX로 바로 닿는 역: ${n}곳`);
}
console.log(`KTX 역(합): ${ktx.size}곳 · ${[...ktx].join(', ')}`);

// 고양종합 시외 재확인 (몇 곳)
const sub = await api('SuburbsBusInfo', 'GetSuberbsBusTrminlList', { numOfRows: '3000' });
const g = sub.find((t) => String(t.terminalNm) === '고양종합');
console.log('고양종합 정보:', JSON.stringify(g));
if (g) for (const name of ['동서울', '춘천', '원주', '청주', '천안', '대전', '수원', '인천', '의정부', '파주', '김포공항', '인천공항']) {
  const B = sub.find((t) => String(t.terminalNm).startsWith(name));
  if (!B) continue;
  const r = await api('SuburbsBusInfo', 'GetStrtpntAlocFndSuberbsBusInfo', { depTerminalId: String(g.terminalId), arrTerminalId: String(B.terminalId), depPlandTime: day });
  console.log(`고양종합 → ${B.terminalNm}: ${r.length}회`);
}
export {};
