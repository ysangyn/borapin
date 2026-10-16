import { loadGeo } from './geodata';
import { computeStats, TOTAL_CELLS, TOTAL_GROUPS } from './stats';
import { formatWhen, SEASON_LABEL } from './dates';
import { GROUPS, placeLabel, placeLong, REGIONS } from './geo';
import { THEMES } from './recommend';
import type { TravelInfo } from './travelinfo';
import type { Note, Season, Trip } from './types';
import { yearReview } from './yearReview';

/** 공유카드 7종 (v19 계승). 인스타 4:5 (1080×1350) 그림으로 만든다. */
export type CardKind = 'map' | 'progress' | 'year' | 'style' | 'season' | 'region' | 'quote';
export const CARD_KINDS: { k: CardKind; label: string }[] = [
  { k: 'map', label: '우리 지도' },
  { k: 'progress', label: '달성률' },
  { k: 'year', label: '올해의 여행' },
  { k: 'style', label: '여행 성향' },
  { k: 'season', label: '계절 여행' },
  { k: 'region', label: '지역 집중' },
  { k: 'quote', label: '메모 인용' },
];

const W = 1080, H = 1350;
const FONT = "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', sans-serif";
const C = { violet: '#5B3FD1', lav: '#B9A8FF', mist: '#EFEBFF', night: '#1E1640', ink2: '#4B4762', ink3: '#716C88', coral: '#FF7A59', v1: '#B9A8F5', v2: '#8D73EE', v3: '#5B3FD1', none: '#EFEAE0' };

export interface CardData {
  trips: Trip[];
  notes: Note[];
  info: TravelInfo | null;
  year: number;
  space: string;
}

function font(ctx: CanvasRenderingContext2D, size: number, weight = 700) {
  ctx.font = `${weight} ${size}px ${FONT}`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 6) {
  const words = text.replace(/\n+/g, ' ').split(/(\s+)/);
  let line = '', n = 0;
  const out: string[] = [];
  for (const w of words) {
    const test = line + w;
    if (ctx.measureText(test).width > maxW && line.trim()) {
      out.push(line.trim());
      line = w.trimStart();
      if (++n >= maxLines) break;
    } else line = test;
  }
  if (n < maxLines && line.trim()) out.push(line.trim());
  // 한 낱말이 너무 길면 글자 단위로 자른다
  out.slice(0, maxLines).forEach((l, i) => {
    let t = l;
    while (ctx.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1);
    ctx.fillText(t + (t !== l || (i === maxLines - 1 && out.length > maxLines) ? '…' : ''), x, y + i * lh);
  });
  return Math.min(out.length, maxLines);
}

function frame(ctx: CanvasRenderingContext2D, title: string, space: string) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#F3EFFF');
  g.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // 로고: 겹쳐진 두 핀
  const pin = (x: number, y: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 0.85, Math.PI * 2.15);
    ctx.lineTo(x, y + r * 1.9);
    ctx.closePath();
    ctx.fill();
  };
  pin(118, 108, 26, C.lav);
  pin(96, 120, 30, C.violet);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(96, 118, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.night;
  font(ctx, 44, 800);
  ctx.fillText('보라핀', 158, 132);
  ctx.fillStyle = C.ink3;
  font(ctx, 30, 600);
  ctx.textAlign = 'right';
  ctx.fillText(space, W - 72, 130);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.night;
  font(ctx, 64, 800);
  ctx.fillText(title, 72, 250);
  // 아래 줄
  ctx.fillStyle = C.ink3;
  font(ctx, 28, 600);
  ctx.fillText('가본 곳마다, 우리 핀 하나', 72, H - 72);
  ctx.textAlign = 'right';
  ctx.fillText('borapin.web.app', W - 72, H - 72);
  ctx.textAlign = 'left';
}

async function drawKorea(ctx: CanvasRenderingContext2D, visits: Map<string, number>, x: number, y: number, w: number, h: number) {
  const g = await loadGeo();
  const [lon0, lat0, lon1, lat1] = [124.6, 33.1, 130.95, 38.65];
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const sx = w / (lon1 - lon0), sy = h / (merc(lat1) - merc(lat0));
  const s = Math.min(sx, sy);
  const ox = x + (w - (lon1 - lon0) * s) / 2, oy = y + (h - (merc(lat1) - merc(lat0)) * s) / 2;
  const P = (lon: number, lat: number) => [ox + (lon - lon0) * s, oy + (merc(lat1) - merc(lat)) * s] as const;
  for (const f of g.kr.features) {
    const n = visits.get(String(f.properties?.cell)) ?? 0;
    ctx.fillStyle = n >= 3 ? C.v3 : n === 2 ? C.v2 : n === 1 ? C.v1 : C.none;
    ctx.strokeStyle = n ? '#FFFFFF' : '#E2DCD0';
    ctx.lineWidth = 1.2;
    const geom = f.geometry as { type: string; coordinates: number[][][] | number[][][][] };
    const polys = (geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates) as number[][][][];
    ctx.beginPath();
    for (const rings of polys) for (const ring of rings) ring.forEach(([lo, la], i) => { const [px, py] = P(lo, la); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
    ctx.fill('evenodd');
    ctx.stroke();
  }
}

function bars(ctx: CanvasRenderingContext2D, rows: [string, number][], x: number, y: number, w: number, color: string) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  rows.forEach(([label, n], i) => {
    const yy = y + i * 110;
    ctx.fillStyle = C.ink2;
    font(ctx, 36, 700);
    ctx.fillText(label, x, yy);
    ctx.fillStyle = C.mist;
    ctx.beginPath();
    ctx.roundRect(x, yy + 22, w, 34, 17);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, yy + 22, Math.max(34, (w * n) / max), 34, 17);
    ctx.fill();
    ctx.fillStyle = C.night;
    font(ctx, 36, 800);
    ctx.textAlign = 'right';
    ctx.fillText(String(n), x + w, yy);
    ctx.textAlign = 'left';
  });
}

const seasonOf = (t: Trip): Season | null => t.when.s ?? (t.when.m ? (['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'] as Season[])[t.when.m - 1] : null);

export async function drawCard(kind: CardKind, d: CardData): Promise<Blob> {
  await Promise.all([document.fonts.load(`800 64px ${FONT}`), document.fonts.load(`600 30px ${FONT}`)]).catch(() => undefined);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.textBaseline = 'alphabetic';
  const stats = computeStats(d.trips);
  const done = d.trips.filter((t) => t.status === 'done');

  if (kind === 'map') {
    frame(ctx, '우리의 지도', d.space);
    await drawKorea(ctx, stats.cellVisits, 120, 300, 840, 820);
    ctx.fillStyle = C.violet;
    font(ctx, 44, 800);
    ctx.fillText(`시·군 ${stats.cellVisits.size}/${TOTAL_CELLS} · 광역 ${stats.groupsVisited.size}/${TOTAL_GROUPS} · 나라 ${stats.countryVisits.size}`, 72, 1190);
  } else if (kind === 'progress') {
    frame(ctx, '여기까지 칠했어요', d.space);
    const pct = Math.round((stats.cellVisits.size / TOTAL_CELLS) * 100);
    const cx = W / 2, cy = 640, r = 250;
    ctx.lineWidth = 56;
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.mist;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = C.violet;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct) / 100);
    ctx.stroke();
    ctx.fillStyle = C.night;
    font(ctx, 150, 800);
    ctx.textAlign = 'center';
    ctx.fillText(`${pct}%`, cx, cy + 50);
    font(ctx, 40, 700);
    ctx.fillStyle = C.ink2;
    ctx.fillText(`시·군 ${stats.cellVisits.size} / ${TOTAL_CELLS}`, cx, 1010);
    ctx.fillText(`광역 ${stats.groupsVisited.size} / ${TOTAL_GROUPS} · 나라 ${stats.countryVisits.size} · 여행 ${stats.tripsDone}번`, cx, 1080);
    ctx.textAlign = 'left';
  } else if (kind === 'year') {
    const r = yearReview(d.trips, d.year);
    frame(ctx, `${d.year}년의 여행`, d.space);
    const big = (n: string, label: string, x: number) => {
      ctx.fillStyle = C.violet;
      font(ctx, 120, 800);
      ctx.fillText(n, x, 470);
      ctx.fillStyle = C.ink3;
      font(ctx, 34, 600);
      ctx.fillText(label, x, 525);
    };
    big(String(r.trips), '여행·나들이', 72);
    big(`${r.days}${r.daysExact ? '' : '+'}`, '밖에서 보낸 날', 400);
    big(String(r.firsts.length), '처음 가본 곳', 760);
    ctx.fillStyle = C.night;
    font(ctx, 40, 800);
    ctx.fillText('처음 가본 곳', 72, 660);
    font(ctx, 38, 600);
    ctx.fillStyle = C.ink2;
    r.firsts.slice(0, 7).forEach((p, i) => ctx.fillText(`· ${placeLong(p)}`, 72, 730 + i * 62));
    if (!r.firsts.length) ctx.fillText('올해는 다녀온 곳을 다시 찾았어요', 72, 730);
    if (r.top) {
      ctx.fillStyle = C.coral;
      font(ctx, 38, 800);
      ctx.fillText(`가장 많이 간 곳: ${r.top}`, 72, 1200);
    }
  } else if (kind === 'style') {
    frame(ctx, '우리의 여행 성향', d.space);
    const score: Record<string, number> = {};
    for (const code of stats.cellVisits.keys()) {
      const c = d.info?.cells[code];
      if (!c) continue;
      const text = [c.main, ...c.subs].map((e) => [e.theme, ...e.spots, ...e.foods].join(' ')).join(' ');
      for (const t of THEMES) if (t.re.test(text)) score[t.label] = (score[t.label] ?? 0) + (stats.cellVisits.get(code) ?? 1);
    }
    const rows = Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const top = rows[0]?.[0]?.split('·')[0];
    ctx.fillStyle = C.violet;
    font(ctx, 110, 800);
    ctx.fillText(top ? `${top}파` : '아직 몰라요', 72, 420);
    ctx.fillStyle = C.ink3;
    font(ctx, 32, 600);
    ctx.fillText('다녀온 시·군의 여행정보로 세어 봤어요', 72, 480);
    bars(ctx, rows.length ? rows : [['기록을 더 남겨 보세요', 0]], 72, 600, 936, C.violet);
  } else if (kind === 'season') {
    frame(ctx, '계절 여행', d.space);
    const count: Record<Season, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 };
    for (const t of done) { const s = seasonOf(t); if (s) count[s]++; }
    const rows = (['spring', 'summer', 'autumn', 'winter'] as Season[]).map((s) => [SEASON_LABEL[s], count[s]] as [string, number]);
    const best = [...rows].sort((a, b) => b[1] - a[1])[0];
    ctx.fillStyle = C.coral;
    font(ctx, 96, 800);
    ctx.fillText(best[1] ? `${best[0]}에 가장 많이` : '계절을 채워 보세요', 72, 420);
    bars(ctx, rows, 72, 560, 936, C.coral);
  } else if (kind === 'region') {
    frame(ctx, '우리가 가장 많이 간 곳', d.space);
    const byGroup = GROUPS.map((g) => {
      const cells = REGIONS.filter((r) => r.group === g.id);
      const n = cells.filter((r) => stats.cellVisits.has(r.code)).length;
      return { g, n, total: cells.length };
    }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n || a.total - b.total);
    const top = byGroup[0];
    ctx.fillStyle = C.violet;
    font(ctx, 120, 800);
    ctx.fillText(top ? (top.g.id === 'jngj' ? '광주·전남' : top.g.name) : '아직 없어요', 72, 430);
    if (top) {
      ctx.fillStyle = C.ink2;
      font(ctx, 40, 700);
      ctx.fillText(`${top.total}곳 중 ${top.n}곳`, 72, 500);
    }
    bars(ctx, byGroup.slice(0, 5).map((x) => [x.g.id === 'jngj' ? '광주·전남' : x.g.name, x.n]), 72, 640, 936, C.v2);
  } else {
    frame(ctx, '그날의 한 줄', d.space);
    const fromNotes = d.notes.map((n) => ({ text: n.text, trip: d.trips.find((t) => t.id === n.tripId), by: n.by.name }));
    const fromMemo = done.filter((t) => t.memo).map((t) => ({ text: t.memo, trip: t, by: '' }));
    const inYear = (x: { trip?: Trip }) => x.trip?.when.y === d.year;
    const all = [...fromNotes, ...fromMemo].filter((x) => x.text && x.trip);
    const q = all.find(inYear) ?? all[0] ?? null;
    ctx.fillStyle = C.lav;
    font(ctx, 260, 800);
    ctx.fillText('“', 60, 520);
    ctx.fillStyle = C.night;
    font(ctx, 58, 700);
    const lines = wrap(ctx, q?.text ?? '여행 기록에 한 줄을 남겨 보세요', 110, 560, 860, 84, 6);
    if (q?.trip) {
      ctx.fillStyle = C.ink3;
      font(ctx, 36, 600);
      ctx.fillText(`${q.trip.title} · ${formatWhen(q.trip.when)}${q.by ? ` · ${q.by}` : ''}`, 110, 560 + lines * 84 + 70);
      ctx.fillText(q.trip.places.map(placeLabel).join(', '), 110, 560 + lines * 84 + 124);
    }
  }
  return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('카드를 만들지 못했어요'))), 'image/png'));
}

/** 휴대폰 공유창으로 보내고, 안 되면 내려받는다 */
export async function shareOrSave(blob: Blob, name: string): Promise<'shared' | 'saved' | 'cancelled'> {
  const file = new File([blob], name, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: '보라핀' });
      return 'shared';
    } catch (e) {
      // 사람이 공유창을 닫았으면 아무것도 하지 않는다
      if ((e as Error)?.name === 'AbortError') return 'cancelled';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'saved';
}
