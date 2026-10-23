/**
 * 매일 받는 자료(해외·축제·관광공사)의 '지난 자료' 다루기 — 판정은 순수 함수 (시험: tests/unit/data-health.test.ts)
 *
 * 왜: 저장소의 src/data/abroad.json은 {note}뿐이고 public/data/festivals.json은 cells 0인 자리표시다.
 * CI는 매번 새 체크아웃이라 스크립트의 '실패하면 지난 파일 유지'가 '자리표시 유지'가 되어 축제·여행경보·입국·환율이 비어 배포됐다.
 * 그래서 받기 전에 지난 자료를 먼저 확보한다: (1) 로컬 파일에 내용이 있으면 그것, (2) 아니면 실제 주소(borapin.web.app/data/*.json)의 것.
 * 받기에 실패하면 그 지난 자료를 쓴다.
 */
import fs from 'node:fs';

export interface Health { ok: boolean; why: string }
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const count = (x: unknown) => (isObj(x) ? Object.keys(x).length : 0);

/** 해외 자료(abroad.json): 여행경보 나라가 30곳 넘어야 내용이 있는 것 (입국·환율은 그 뒤에 따라온다) */
export function abroadHealth(d: unknown): Health {
  const n = count(isObj(d) ? d.alarm : null);
  return { ok: n > 30, why: `여행경보 나라 ${n}곳` };
}
/** 축제(festivals.json): 칸(cells)이 1곳 넘어야 */
export function festivalsHealth(d: unknown): Health {
  const n = count(isObj(d) ? d.cells : null);
  return { ok: n > 1, why: `축제 칸 ${n}곳` };
}
/** 관광공사 관광지(tour.json): 시·군 100곳 넘어야 */
export function tourHealth(d: unknown): Health {
  const n = count(isObj(d) ? d.cells : null);
  return { ok: n > 100, why: `시·군 ${n}곳` };
}
/** 관광빅데이터(trend.json): regions에 시·군 100곳 이상이어야 (저장소의 자리표시는 regions 비어 있음) */
export function trendHealth(d: unknown): Health {
  const n = count(isObj(d) ? d.regions : null);
  return { ok: n >= 100, why: `시·군 ${n}곳` };
}

export type PrevPick<T> = { data: T | null; from: 'local' | 'live' | null; why: string };
/** 지난 자료 고르기: 내용 있는 로컬 파일이 먼저(적힌 순서), 없으면 실제 주소 것, 둘 다 없으면 null */
export function pickPrevious<T>(local: { file: string; data: T | null }[], live: T | null, health: (d: unknown) => Health): PrevPick<T> {
  for (const l of local) if (health(l.data).ok) return { data: l.data, from: 'local', why: l.file };
  const h = health(live);
  if (h.ok) return { data: live, from: 'live', why: `실제 주소 (${h.why})` };
  return { data: null, from: null, why: `로컬 ${local.map((l) => `${l.file}: ${health(l.data).why}`).join(', ')} · 실제 주소 ${h.why}` };
}

// ---------- 아래는 입출력 ----------
/** JSON 파일 읽기 (없거나 깨졌으면 null) */
export function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}
/** 실제 주소에서 JSON 받기. 호스팅은 없는 파일도 index.html(200)로 주므로 JSON으로 풀리지 않으면 null */
export async function fetchJson<T>(url: string, timeoutMs = 20_000): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: { accept: 'application/json', 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return JSON.parse(await r.text()) as T;
  } catch {
    return null;
  }
}
/** 지난 자료 확보: 로컬 파일들 → 실제 주소 순. 어디서 났는지 적는다 */
export async function loadPrevious<T>(label: string, localFiles: string[], liveUrl: string, health: (d: unknown) => Health): Promise<PrevPick<T>> {
  const local = localFiles.map((file) => ({ file, data: readJson<T>(file) }));
  let pick = pickPrevious<T>(local, null, health);
  if (pick.from !== 'local') pick = pickPrevious<T>(local, await fetchJson<T>(liveUrl), health);
  if (pick.from === 'local') console.log(`${label}: 지난 자료는 ${pick.why} (${health(pick.data).why})`);
  else if (pick.from === 'live') console.log(`${label}: 로컬 파일에 내용이 없어 실제 주소의 지난 자료를 받아 둡니다 — ${liveUrl} (${health(pick.data).why})`);
  else console.warn(`::warning::${label}: 지난 자료를 찾지 못했어요 (${pick.why}). 받기에 실패하면 빈 자료가 됩니다`);
  return pick;
}
/** 같은 내용을 여러 곳에 쓰기 (src/data는 빌드에, public/data는 실제 주소 /data/에 올라가 다음 CI의 지난 자료가 된다) */
export function writeJsonTo(files: string[], data: unknown): void {
  const s = JSON.stringify(data);
  for (const f of files) fs.writeFileSync(f, s);
}
/** 지난 자료를 자리에 두기: 내용이 없는(자리표시·없는) 파일에만 쓴다. 쓴 파일 목록을 돌려준다 */
export function seedFiles(files: string[], data: unknown, health: (d: unknown) => Health): string[] {
  if (!health(data).ok) return [];
  const written = files.filter((f) => !health(readJson(f)).ok);
  writeJsonTo(written, data);
  if (written.length) console.log(`지난 자료를 두었어요 → ${written.join(', ')}`);
  return written;
}
