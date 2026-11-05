import { fitPins, KIND_COLOR } from './placeMaps';
import type { PlaceKind } from './types';

/**
 * 스토리 카드 (1080×1920 그림): 내 지도를 인스타·카톡 스토리에 올리기 좋게.
 * 지도 타일 대신 실제 좌표를 비율 그대로 찍은 '점 지도' + 1~3등은 사진 동그라미 + 순위 다섯 줄.
 * 사진은 다른 사이트 것이라 그림에 쓸 수 없으면(CORS) 색 동그라미로 바꾼다.
 */
export interface StoryInput { title: string; intro: string; by: string; region: string; places: { name: string; kind: PlaceKind; lat?: number | null; lng?: number | null; photoUrl?: string }[] }
const W = 1080, H = 1920;
const INK = '#1E1640', VIOLET = '#5B3FD1', PINK = '#A63A52', MUTED = '#6E6490';

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.referrerPolicy = 'no-referrer';
    const t = window.setTimeout(() => res(null), 4000);
    im.onload = () => { window.clearTimeout(t); res(im); };
    im.onerror = () => { window.clearTimeout(t); res(null); };
    im.src = src;
  });
}
/** 줄 바꿈: 글자 단위로 maxW 안에 (최대 lines줄, 넘치면 …) */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, lines: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const ch of [...text]) {
    if (ctx.measureText(cur + ch).width > maxW && cur) { out.push(cur); cur = ch.trimStart(); if (out.length === lines) break; }
    else cur += ch;
  }
  if (out.length < lines && cur) out.push(cur);
  if (out.length === lines && out.join('').length < [...text].length) {
    let last = out[lines - 1];
    while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
    out[lines - 1] = last + '…';
  }
  return out;
}

export async function drawStory(d: StoryInput): Promise<Blob> {
  // 글꼴은 글자 묶음마다 따로 받으므로(unicode-range) 그릴 글자를 함께 알려 준다
  const juaText = [d.title, ...d.places.map((p) => p.name), '보라핀0123456789'].join('');
  await Promise.all([document.fonts?.load('400 120px Jua', juaText), document.fonts?.load('700 56px Gaegu', d.intro || '가')].map((x) => x?.catch(() => undefined)));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  // 바탕: 옅은 보라 + 물결 + 흰 길 두 줄
  ctx.fillStyle = '#F5F2FF'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#E4DDFF';
  ctx.beginPath(); ctx.moveTo(-40, 620); ctx.bezierCurveTo(220, 520, 420, 760, 680, 620); ctx.bezierCurveTo(860, 520, 1120, 560, 1120, 700); ctx.lineTo(1120, 1400); ctx.bezierCurveTo(800, 1480, 300, 1380, -40, 1450); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(217,208,255,.7)';
  ctx.beginPath(); ctx.moveTo(-40, 980); ctx.bezierCurveTo(220, 900, 400, 1120, 680, 1000); ctx.bezierCurveTo(900, 920, 1060, 1000, 1120, 1080); ctx.lineTo(1120, 1400); ctx.bezierCurveTo(800, 1480, 300, 1380, -40, 1450); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 900); ctx.quadraticCurveTo(360, 840, 600, 980); ctx.quadraticCurveTo(840, 1100, 1080, 1000); ctx.stroke();
  ctx.lineWidth = 11;
  ctx.beginPath(); ctx.moveTo(460, 600); ctx.quadraticCurveTo(500, 900, 360, 1120); ctx.quadraticCurveTo(280, 1300, 420, 1400); ctx.stroke();

  // 머리: 누구의 지도 · 제목 · 한 줄 소개
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = VIOLET; ctx.font = '600 40px Pretendard, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText(`${d.by}의 지도`, 80, 170);
  ctx.fillStyle = INK; ctx.font = '400 116px Jua, sans-serif';
  const tl = wrap(ctx, d.title, W - 160, 2);
  tl.forEach((l, i) => ctx.fillText(l, 76, 300 + i * 124));
  let y = 300 + tl.length * 124 - 30;
  if (d.intro.trim()) {
    ctx.fillStyle = PINK; ctx.font = '700 54px Gaegu, sans-serif';
    wrap(ctx, d.intro.trim(), W - 160, 2).forEach((l, i) => ctx.fillText(l, 80, y + 40 + i * 62));
  }
  y = 620;

  // 점 지도: 좌표가 있는 곳만, 1~3등은 사진 동그라미
  const withPos = d.places.map((p, i) => ({ ...p, rank: i + 1 })).filter((p) => p.lat != null && p.lng != null);
  const pts = fitPins(withPos.map((p) => ({ lat: p.lat!, lng: p.lng! })), { x: 80, y: y + 40, w: W - 160, h: 720 }, 110);
  for (let i = withPos.length - 1; i >= 0; i--) {
    const p = withPos[i], q = pts[i];
    if (p.rank <= 3) continue;
    ctx.fillStyle = KIND_COLOR[p.kind] ?? VIOLET; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(q.x, q.y, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  const imgs = await Promise.all(withPos.map((p) => (p.rank <= 3 && p.photoUrl ? loadImg(p.photoUrl) : Promise.resolve(null))));
  withPos.forEach((p, i) => {
    if (p.rank > 3) return;
    const q = pts[i], r = p.rank === 1 ? 100 : 82;
    ctx.save();
    ctx.shadowColor = 'rgba(30,22,64,.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q.x, q.y, r + 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.clip();
    const im = imgs[i];
    if (im) { const s = Math.max((2 * r) / im.width, (2 * r) / im.height); ctx.drawImage(im, q.x - (im.width * s) / 2, q.y - (im.height * s) / 2, im.width * s, im.height * s); }
    else {
      ctx.fillStyle = KIND_COLOR[p.kind] ?? VIOLET; ctx.globalAlpha = 0.85; ctx.fillRect(q.x - r, q.y - r, 2 * r, 2 * r); ctx.globalAlpha = 1;
      // 사진이 없으면 이름 첫 글자
      ctx.fillStyle = '#fff'; ctx.font = `400 ${Math.round(r * 0.95)}px Jua, sans-serif`; ctx.textAlign = 'center';
      ctx.fillText([...p.name.replace(/^(카페|cafe)\s*/i, '')][0] ?? '', q.x, q.y + r * 0.33); ctx.textAlign = 'left';
    }
    ctx.restore();
    // 등수 동그라미
    ctx.fillStyle = KIND_COLOR[p.kind] ?? VIOLET; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(q.x - r * 0.72, q.y - r * 0.72, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '700 34px Pretendard, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(String(p.rank), q.x - r * 0.72, q.y - r * 0.72 + 12); ctx.textAlign = 'left';
  });

  // 순위 다섯 줄
  y = 1540;
  d.places.slice(0, 5).forEach((p, i) => {
    const ly = y + i * 64;
    ctx.fillStyle = KIND_COLOR[p.kind] ?? VIOLET;
    ctx.beginPath(); ctx.arc(96, ly - 15, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = VIOLET; ctx.font = '400 46px Jua, sans-serif'; ctx.fillText(String(i + 1), 128, ly);
    ctx.fillStyle = INK; ctx.font = '400 46px Jua, sans-serif';
    ctx.fillText(wrap(ctx, p.name, W - 340, 1)[0] ?? '', 180, ly);
  });
  if (d.places.length > 5) { ctx.fillStyle = MUTED; ctx.font = '500 34px Pretendard, sans-serif'; ctx.fillText(`외 ${d.places.length - 5}곳 · ${d.region}`, 180, y + 5 * 64 - 10); }
  // 바닥: 보라핀
  ctx.fillStyle = VIOLET; ctx.font = '400 52px Jua, sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('보라핀', W - 80, H - 76);
  ctx.fillStyle = MUTED; ctx.font = '500 30px Pretendard, sans-serif';
  ctx.fillText('링크로 열면 앱 없이 볼 수 있어요', W - 80, H - 32);
  ctx.textAlign = 'left';
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('그림을 만들지 못했어요'))), 'image/png'));
}
