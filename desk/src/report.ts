import { groupDupes } from './dupes';
import { CONF_LABEL, FROM_LABEL, HINT_LABEL, summarize } from './inventory';
import { matchTrips, type DeskTrip } from './trips';
import { vaultTable } from './vaults';
import { buildTree, type TreeNode } from './tree';
import { fullPath, type Item } from './types';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const n = (x: number) => x.toLocaleString('ko-KR');
const gb = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)}GB` : b >= 1e6 ? `${(b / 1e6).toFixed(0)}MB` : `${(b / 1e3).toFixed(0)}KB`);

/**
 * 훑기 보고서 (HTML 한 장). 스크립트 없이, 어디서 열어도 안전하게.
 * 네 숫자가 맨 위: 사진 · 여행 · 중복 · 모르는 사진.
 */
export function renderReport(items: Item[], trips: DeskTrip[], opts: { generatedAt: string; roots: string[] }): string {
  const s = summarize(items, trips);
  const d = groupDupes(items);
  const v = vaultTable(items);
  const m = matchTrips(items, trips);
  const unknownRows = items.map((i, k) => ({ i, k })).filter(({ i, k }) => !i.taken || i.takenFrom === 'mtime' || i.received || (i.lat == null && !m[k].tripId)).slice(0, 300);
  const row = (cells: unknown[]) => `<tr>${cells.map((c) => (typeof c === 'number' || /^[\d,.]+(장|개|KB|MB|GB)?$/.test(String(c)) ? `<td class="n">${esc(c)}</td>` : `<td>${esc(c)}</td>`)).join('')}</tr>`;
  const lines = (ps: string[]) => ps.map(esc).join('<br>');
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>보라핀 사진함 · 훑기 보고서</title>
<style>
:root{color-scheme:light dark}
body{margin:0;padding:28px 20px 60px;font-family:"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;background:#F5F2FF;color:#1E1640;line-height:1.5}
@media(prefers-color-scheme:dark){body{background:#17132A;color:#EEE9FF}.card,table{background:#211B3C}th{background:#2B2450}}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 8px}
.sub{color:#6E6490;font-size:13px}
.nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:18px 0}
.card{background:#fff;border:1.5px solid #E4DDFF;border-radius:16px;padding:14px 16px}
.card b{font-size:26px;color:#5B3FD1}
.card .why{display:block;color:#6E6490;font-size:12px;margin-top:2px}
table{border-collapse:collapse;width:100%;background:#fff;border:1.5px solid #E4DDFF;border-radius:12px;overflow:hidden;font-size:13px}
th,td{padding:7px 10px;text-align:left;border-bottom:1px solid #EEE9FF;vertical-align:top;word-break:break-all}
th{background:#EFEBFF;font-weight:600;white-space:nowrap}
td.n{white-space:nowrap;text-align:right}
.safe{color:#2E9467}.risky{color:#A63A52}
.note{background:#FFF2BF;border-radius:12px;padding:10px 14px;font-size:13px;margin:14px 0}
.tree details{margin:4px 0 4px 0;border-left:2px solid #E4DDFF;padding-left:10px}
.tree>details{border-left:none;padding-left:0;background:#fff;border:1.5px solid #E4DDFF;border-radius:12px;padding:8px 12px;margin:8px 0}
.tree summary{cursor:pointer;font-weight:600;font-size:14px;padding:4px 0;list-style:none;display:flex;gap:8px;align-items:center}
.tree summary::before{content:'▸';color:#8A80A8;font-size:12px}
.tree details[open]>summary::before{content:'▾'}
.tree summary .c{color:#6E6490;font-weight:500;font-size:12.5px}
.tree ul{margin:2px 0 6px 0;padding-left:18px;font-size:12.5px;color:#4B4762;columns:2;column-gap:24px}
.tree li{break-inside:avoid;word-break:break-all}
</style></head><body>
<h1>보라핀 사진함 · 훑기 보고서</h1>
<div class="sub">${esc(opts.generatedAt)} · 보관처 ${opts.roots.map(esc).join(' · ')} · 읽기만 했어요 — 파일은 하나도 바뀌지 않았어요</div>
<div class="nums">
  <div class="card">사진 <b>${n(s.photos)}</b>장<span class="why">파일 ${n(s.files)}개 · ${gb(s.bytes)}</span></div>
  <div class="card">여행 <b>${n(s.trips)}</b>번<span class="why">보라핀 여행 ${n(trips.length)}번 중 사진이 붙은 것</span></div>
  <div class="card">중복 <b>${n(s.dupes)}</b>장<span class="why">완전히 같은 파일 · ${gb(s.dupeBytes)} 겹침</span></div>
  <div class="card">모르는 사진 <b>${n(s.unknown)}</b>장<span class="why">언제 모름 ${n(s.unknownWhen)} · 어디 모름 ${n(s.unknownWhere)}</span></div>
</div>
<div class="note">중복은 '완전히 같은 파일'만 셌어요. 닮은 사진·연사는 다음 단계에서 제안만 해요. 보관처가 한 곳뿐인 사진 <b class="risky">${n(v.byLevel.risky)}</b>장, 두 곳 이상 <b class="safe">${n(v.byLevel.safe)}</b>장.</div>

<h2>서랍 — 사진은 그대로 둔 채 이렇게 묶여요</h2>
<div class="tree">${drawers(buildTree(items, trips))}</div>

<h2>보관처</h2>
<table><tr><th>보관처</th><th>파일</th><th>용량</th><th>여기에만 있는 사진</th></tr>
${v.roots.map((r) => row([r.root, n(r.files), gb(r.bytes), n(r.onlyHere)])).join('')}</table>

<h2>여행별</h2>
${s.byTrip.length ? `<table><tr><th>여행</th><th>사진</th><th>날짜로 확실</th></tr>${s.byTrip.map((t) => row([t.title, n(t.files), n(t.sure)])).join('')}</table>` : '<div class="sub">여행 목록 파일(--trips)을 주면 여행별로 나눠요. 보라핀 앱 → 우리 공간 → 여행 목록 내보내기.</div>'}

<h2>해별</h2>
<table><tr><th>해</th><th>사진</th></tr>${s.byYear.map((y) => row([y.year, n(y.files)])).join('')}</table>

<h2>촬영 시각을 어디서 읽었나</h2>
<table><tr><th>근거</th><th>파일</th></tr>${Object.entries(s.byTakenFrom).map(([k, c]) => row([FROM_LABEL[k] ?? k, n(c)])).join('')}</table>

<h2>중복 (겹치는 용량 큰 순, 50묶음까지)</h2>
<table><tr><th>같은 파일</th><th>개수</th><th>크기</th></tr>
${d.groups.slice(0, 50).map((g) => `<tr><td>${lines(g.paths)}</td><td class="n">${n(g.paths.length)}</td><td class="n">${gb(g.size)}</td></tr>`).join('')}</table>

<h2>모르는 사진 (${n(unknownRows.length)}${s.unknown > unknownRows.length ? ' · 300개까지' : ''})</h2>
<table><tr><th>파일</th><th>촬영</th><th>근거</th><th>여행</th><th>출처</th></tr>
${unknownRows.map(({ i, k }) => row([fullPath(i), i.taken ?? '', FROM_LABEL[i.takenFrom ?? ''] ?? '', m[k].tripId ? `${trips.find((t) => t.id === m[k].tripId)?.title ?? ''} (${CONF_LABEL[m[k].confidence!]})` : '', i.received ? '받은 사진' : (HINT_LABEL[i.hint ?? ''] ?? '')])).join('')}</table>
</body></html>`;
}

/** 서랍 나무를 접히는 목록으로 (스크립트 없이 <details>) */
function drawers(nodes: TreeNode[], depth = 0): string {
  return nodes.map((d) => {
    const unit = d.kind === 'vaults' ? '곳' : '장';
    const files = d.files.length ? `<ul>${d.files.slice(0, 200).map((f) => `<li>${esc(f.rel)}${f.takenFrom === 'mtime' || f.received ? ' <span class="risky">?</span>' : ''}</li>`).join('')}${d.files.length > 200 ? `<li>… ${n(d.files.length - 200)}장 더 (인벤토리.csv)</li>` : ''}</ul>` : '';
    return `<details${depth === 0 && d.kind === 'trips' ? ' open' : ''}><summary>${esc(d.name)} <span class="c">${n(d.count)}${unit}</span></summary>${drawers(d.children, depth + 1)}${files}</details>`;
  }).join('');
}
