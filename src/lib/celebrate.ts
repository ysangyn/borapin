import { badges } from './achievements';
import { computeStats } from './stats';
import type { Trip } from './types';

/**
 * 새 곳에 핀을 꽂거나 뱃지를 받으면 화면 위로 작은 색종이가 터진다.
 * 움직임 줄이기 설정이면 터뜨리지 않는다.
 */
export function confetti(origin?: { x: number; y: number }) {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth, H = window.innerHeight;
  c.width = W * dpr;
  c.height = H * dpr;
  c.className = 'confetti';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const g = c.getContext('2d');
  if (!g) return c.remove();
  g.scale(dpr, dpr);
  const colors = ['#5B3FD1', '#9A82F5', '#CBBEFF', '#FF7A59', '#FFC2B0'];
  const ox = origin?.x ?? W / 2, oy = origin?.y ?? H * 0.42;
  const parts = Array.from({ length: 70 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const v = 6 + Math.random() * 7;
    return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 5, h: 3 + Math.random() * 4, col: colors[i % colors.length], pin: i % 9 === 0 };
  });
  const t0 = performance.now();
  const tick = (t: number) => {
    const k = (t - t0) / 1400;
    g.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      g.save();
      g.globalAlpha = Math.max(0, 1 - k * k);
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.fillStyle = p.col;
      if (p.pin) {
        // 작은 핀 모양
        g.beginPath();
        g.arc(0, -3, 4, Math.PI, 0);
        g.lineTo(0, 5);
        g.closePath();
        g.fill();
      } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
    }
    if (k < 1) requestAnimationFrame(tick);
    else c.remove();
  };
  requestAnimationFrame(tick);
}

/**
 * 여행을 더한 뒤 새로 생긴 기쁜 일: 처음 가본 시·군·나라, 새 뱃지.
 * 없으면 null.
 */
export function whatsNew(before: Trip[], after: Trip[]): string | null {
  const a = computeStats(before), b = computeStats(after);
  const newCells = [...b.cellVisits.keys()].filter((k) => !a.cellVisits.has(k)).length;
  const newCountries = [...b.countryVisits.keys()].filter((k) => !a.countryVisits.has(k)).length;
  const had = new Set(badges(before, a, [], []).filter((x) => x.have >= x.need).map((x) => x.id));
  const got = badges(after, b, [], []).filter((x) => x.have >= x.need && !had.has(x.id));
  if (got.length) return `'${got[0].name}' 뱃지를 받았어요`;
  if (newCountries) return `처음 가본 나라! ${b.countryVisits.size}번째 나라예요`;
  if (newCells) return `처음 가본 곳! ${b.cellVisits.size}번째 시·군이에요`;
  return null;
}
