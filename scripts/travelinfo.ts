/**
 * 여행정보 DB: data/travelinfo.csv(사람이 고치는 원본) → src/data/travelinfo.json(앱이 읽는 파일)
 * 고칠 때마다 검사합니다. 문제가 있으면 오류를 내고 멈춥니다 (CI에서 배포도 멈춤).
 *
 *   npx tsx scripts/travelinfo.ts          # 검사 + JSON 만들기
 *   npx tsx scripts/travelinfo.ts --check  # 검사만, JSON이 CSV와 다르면 실패
 */
import fs from 'node:fs';
import path from 'node:path';
import regionsData from '../src/data/regions.json' with { type: 'json' };

const ROOT = path.resolve(import.meta.dirname, '..');
const CSV = path.join(ROOT, 'data/travelinfo.csv');
const OUT = path.join(ROOT, 'src/data/travelinfo.json');
const COLS = ['cell', 'level', 'name', 'area', 'theme', 'spots', 'foods', 'goods', 'transport', 'note', 'updated'] as const;
type Row = Record<(typeof COLS)[number], string>;

export interface InfoEntry {
  name: string;
  theme: string;
  spots: string[];
  foods: string[];
  goods: string[];
  transport: string[];
  note?: string;
}

/** 따옴표를 지키는 CSV 읽기 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cur += c;
  }
  if (cur || row.length) { row.push(cur); if (row.some((x) => x !== '')) rows.push(row); }
  return rows;
}

/** "지하철(1,3,5), 시티투어버스" → 괄호 안 쉼표는 지키고 나눈다 */
export function splitList(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === '，') && depth === 0) { if (cur.trim()) out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const regions = regionsData.regions as { code: string; name: string; group: string }[];
const CODES = new Set(regions.map((r) => r.code));
const METRO = new Set(['11', '26', '27', '28', '29', '30', '31', '50']);
const AREAS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const text = fs.readFileSync(CSV, 'utf8');
const [head, ...body] = parseCsv(text);
const errors: string[] = [];
if (head.join(',') !== COLS.join(',')) errors.push(`첫 줄(열 이름)이 달라요: ${head.join(',')}`);
const rows: Row[] = body.map((r) => Object.fromEntries(COLS.map((k, i) => [k, (r[i] ?? '').trim()])) as Row);

const entry = (r: Row): InfoEntry => ({
  name: r.name,
  theme: r.theme,
  spots: splitList(r.spots),
  foods: splitList(r.foods),
  goods: splitList(r.goods),
  transport: splitList(r.transport),
  ...(r.note ? { note: r.note } : {}),
});

const cells: Record<string, { main?: InfoEntry; subs: InfoEntry[] }> = {};
const areas: Record<string, InfoEntry> = {};
rows.forEach((r, i) => {
  const at = `${i + 2}번째 줄(${r.area} ${r.name})`;
  for (const k of ['theme', 'spots', 'foods', 'goods', 'transport'] as const) {
    if (/^\s*-\s*$/.test(r[k]) || splitList(r[k]).some((x) => x === '-')) errors.push(`${at}: '${k}'에 '-'만 있어요. 비워 두세요.`);
  }
  if (!r.name) errors.push(`${at}: 이름이 비었어요`);
  if (!r.theme) errors.push(`${at}: 테마가 비었어요`);
  if (r.theme.length > 40) errors.push(`${at}: 테마가 40자를 넘어요`);
  if (!r.spots && r.level !== 'area') errors.push(`${at}: 볼거리가 비었어요`);
  if (!AREAS.includes(r.area)) errors.push(`${at}: 광역 이름 '${r.area}'를 모르겠어요`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.updated)) errors.push(`${at}: 확인일 형식(YYYY-MM-DD)이 아니에요`);
  if (r.level === 'area') {
    if (areas[r.area]) errors.push(`${at}: '${r.area}' 광역 줄이 두 번 있어요`);
    areas[r.area] = entry(r);
    if (r.cell) {
      if (!METRO.has(r.cell)) errors.push(`${at}: 광역 줄의 칸 코드는 광역시·제주만 쓸 수 있어요`);
      (cells[r.cell] ??= { subs: [] }).main = entry(r);
    }
    return;
  }
  if (!CODES.has(r.cell)) { errors.push(`${at}: 지도 칸 코드 '${r.cell}'가 없어요`); return; }
  const c = (cells[r.cell] ??= { subs: [] });
  if (r.level === 'region') {
    if (c.main) errors.push(`${at}: 이 칸의 대표 줄이 두 번 있어요`);
    c.main = entry(r);
  } else if (r.level === 'sub') c.subs.push(entry(r));
  else errors.push(`${at}: 단계는 area·region·sub 중 하나여야 해요`);
});

// 모든 지도 칸에 대표 정보가 있어야 한다
for (const r of regions) if (!cells[r.code]?.main) errors.push(`지도 칸 ${r.code} ${r.name}에 대표 정보가 없어요`);
for (const a of AREAS) if (a !== '세종' && !areas[a]) errors.push(`광역 '${a}' 개요 줄이 없어요`);
// 2026.7.1 인천 개편: 옛 구 이름이 남아 있으면 안 된다
const incheon = cells['28']?.subs.map((s) => s.name) ?? [];
for (const old of ['중구', '동구', '서구']) if (incheon.includes(old)) errors.push(`인천 '${old}'는 2026.7.1 개편으로 없어졌어요`);
for (const nw of ['제물포구', '영종구', '검단구', '서해구']) if (!incheon.includes(nw)) errors.push(`인천 '${nw}'가 없어요`);

if (errors.length) {
  console.error(`✗ 여행정보 DB 검사에서 ${errors.length}개 문제:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

const updated = rows.map((r) => r.updated).sort().at(-1);
const json = JSON.stringify({ updated, cells, areas }, null, 0) + '\n';
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== json) {
    console.error('✗ src/data/travelinfo.json이 CSV와 달라요. npx tsx scripts/travelinfo.ts 로 다시 만드세요.');
    process.exit(1);
  }
  console.log(`✓ 여행정보 DB 검사 통과 (${rows.length}줄, 지도 칸 ${Object.keys(cells).length}개)`);
} else {
  fs.writeFileSync(OUT, json);
  console.log(`✓ 여행정보 DB ${rows.length}줄 → ${path.relative(ROOT, OUT)} (${(json.length / 1024).toFixed(0)}KB)`);
}
