/**
 * 해외 자료 만들기 (CI, 매일): 외교부 여행경보·입국허가요건 + 수출입은행 환율 → src/data/abroad.json
 * 실패하면 기존 파일을 그대로 둔다(앱은 '○일 기준'으로 보여 준다). SAMPLE=1 이면 필드 모양만 출력.
 */
import fs from 'node:fs';

const DATA = process.env.DATA_GO_KR_KEY ?? '', EXIM = process.env.KOREAEXIM_KEY ?? '';
const OUT = 'src/data/abroad.json';
type Item = Record<string, string | number | null>;
async function list(path: string): Promise<Item[]> {
  const out: Item[] = [];
  for (let page = 1; page <= 5; page++) {
    const r = await fetch(`https://apis.data.go.kr/1262000/${path}?serviceKey=${encodeURIComponent(DATA)}&numOfRows=300&pageNo=${page}&returnType=JSON&_type=json`, { signal: AbortSignal.timeout(30000) });
    const j = (await r.json()) as { response?: { body?: { items?: { item?: Item[] | Item }; totalCount?: number } }; data?: Item[] };
    const it = j.response?.body?.items?.item ?? j.data ?? [];
    const arr = Array.isArray(it) ? it : [it];
    out.push(...arr);
    if (arr.length < 300) break;
  }
  return out;
}
const lastBizDay = () => { const d = new Date(Date.now() + 9 * 3600_000); if (d.getUTCHours() < 11) d.setUTCDate(d.getUTCDate() - 1); while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10).replace(/-/g, ''); };

const prev = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return null; } })();
const out: Record<string, unknown> = { ...(prev ?? {}), note: '외교부 해외안전여행(여행경보·입국허가요건)·한국수출입은행 환율. 매일 CI가 갱신, 실패하면 지난 자료.' };

try {
  const alarm = await list('TravelAlarmService2/getTravelAlarmList2');
  if (process.env.SAMPLE) console.log('여행경보 예시', JSON.stringify(alarm.slice(0, 2)));
  const by: Record<string, { lvl: number; remark?: string }> = {};
  for (const a of alarm) {
    const k = String(a.country_iso_alp2 ?? '').toUpperCase();
    const lvl = Number(a.alarm_lvl ?? 0);
    if (!k || !lvl) continue;
    // 한 나라에 지역별 경보가 여럿이면 가장 높은 단계와 '일부 지역' 표시
    const cur = by[k];
    const part = String(a.region_ty ?? '') === '일부' ? '일부 지역' : '';
    if (!cur || lvl > cur.lvl) by[k] = { lvl, ...(part ? { remark: part.slice(0, 80) } : {}) };
  }
  if (Object.keys(by).length > 30) { out.alarm = by; out.alarmAt = new Date().toISOString().slice(0, 10); }
  console.log(`여행경보 ${alarm.length}줄 → 나라 ${Object.keys(by).length}`);
} catch (e) { console.log('여행경보 실패(지난 자료 유지):', (e as Error).message); }

try {
  const visa = await list('EntranceVisaService2/getEntranceVisaList2');
  if (process.env.SAMPLE) console.log('입국허가요건 예시', JSON.stringify(visa.slice(0, 2)));
  const by: Record<string, { free: boolean | null; stay?: string; note?: string }> = {};
  for (const v of visa) {
    const k = String(v.country_iso_alp2 ?? '').toUpperCase();
    if (!k) continue;
    // 일반여권: 무비자 체류 기간 글(예 '90일'), 'X'면 무비자 입국 불가(비자 필요)
    const cn = String(v.gnrl_pspt_visa_cn ?? '').trim();
    const ev = String(v.nvisa_entry_evdc_cn ?? '').split(/\\n|\n/).map((x) => x.trim()).find((x) => /일반여권/.test(x))?.replace(/^일반여권\s*소지자\s*:\s*/, '');
    by[k] = { free: !cn ? null : cn !== 'X', ...(cn && cn !== 'X' ? { stay: cn.slice(0, 40) } : {}), ...(ev ? { note: ev.slice(0, 60) } : {}) };
  }
  if (Object.keys(by).length > 30) { out.visa = by; out.visaAt = new Date().toISOString().slice(0, 10); }
  console.log(`입국허가요건 ${visa.length}줄 → 나라 ${Object.keys(by).length}`);
} catch (e) { console.log('입국허가요건 실패(지난 자료 유지):', (e as Error).message); }

try {
  // 여행경보 조정 이력: 최근 90일 바뀐 것만 (나라 · 날짜 · 내용)
  const hist = await list('CountryHistoryService2/getCountryHistoryList2');
  if (process.env.SAMPLE) console.log('여행경보 조정 예시', JSON.stringify(hist.slice(0, 3)));
  const since = Date.now() - 90 * 86400000;
  const pick = (x: Item, ...ks: string[]) => { for (const k of ks) if (x[k] != null && String(x[k]).trim()) return String(x[k]).trim(); return ''; };
  const changes = hist.map((h) => ({ k: pick(h, 'country_iso_alp2', 'iso_alp2').toUpperCase(), d: pick(h, 'wrt_dt', 'written_dt', 'regist_dt', 'adjust_dt', 'reg_dt').slice(0, 10), t: pick(h, 'title', 'adjust_cn', 'txt_origin_cn', 'cn').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 120) }))
    .filter((c) => c.k && c.d && Date.parse(c.d) >= since).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 80);
  out.changes = changes; out.changesAt = new Date().toISOString().slice(0, 10);
  console.log(`여행경보 조정 ${hist.length}줄 → 최근 90일 ${changes.length}건`);
} catch (e) { console.log('여행경보 조정 실패(지난 자료 유지):', (e as Error).message); }

try {
  // 안전공지: 나라마다 최근 60일 공지 제목 3개까지 (나라 · 날짜 · 제목)
  const ns = await list('CountrySafetyService7/getCountrySafetyList7');
  if (process.env.SAMPLE) console.log('안전공지 예시', JSON.stringify(ns.slice(0, 2)).slice(0, 1500));
  const since = Date.now() - 60 * 86400000;
  const pick = (x: Item, ...ks: string[]) => { for (const k of ks) if (x[k] != null && String(x[k]).trim()) return String(x[k]).trim(); return ''; };
  const by: Record<string, { d: string; t: string }[]> = {};
  for (const n of ns) {
    const k = pick(n, 'country_iso_alp2', 'iso_alp2').toUpperCase();
    const d = pick(n, 'wrt_dt', 'written_dt', 'regist_dt', 'reg_dt').slice(0, 10);
    const t = pick(n, 'title', 'sfty_notice_title').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 100);
    if (!k || !d || !t || Date.parse(d) < since) continue;
    (by[k] ??= []).push({ d, t });
  }
  for (const k of Object.keys(by)) by[k] = by[k].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 3);
  if (ns.length) { out.notices = by; out.noticesAt = new Date().toISOString().slice(0, 10); }
  console.log(`안전공지 ${ns.length}줄 → 최근 60일 나라 ${Object.keys(by).length}`);
} catch (e) { console.log('안전공지 실패(지난 자료 유지):', (e as Error).message); }

try {
  if (!EXIM) throw new Error('KOREAEXIM_KEY 없음');
  const day = lastBizDay();
  const r = await fetch(`https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${EXIM}&searchdate=${day}&data=AP01`, { signal: AbortSignal.timeout(30000) });
  const j = (await r.json()) as { cur_unit: string; deal_bas_r: string; cur_nm: string }[];
  const fx: Record<string, number> = {};
  for (const x of j ?? []) { const unit = x.cur_unit.replace(/\(100\)/, ''); const per = /\(100\)/.test(x.cur_unit) ? 100 : 1; const v = Number(String(x.deal_bas_r).replace(/,/g, '')); if (unit !== 'KRW' && v) fx[unit] = +(v / per).toFixed(4); }
  if (Object.keys(fx).length > 10) { out.fx = fx; out.fxAt = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)}`; }
  console.log(`환율 ${Object.keys(fx).length}개 (${day})`);
} catch (e) { console.log('환율 실패(지난 자료 유지):', (e as Error).message); }

fs.writeFileSync(OUT, JSON.stringify(out));
