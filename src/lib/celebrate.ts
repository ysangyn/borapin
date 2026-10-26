import { badges } from './achievements';
import { computeStats } from './stats';
import { GROUPS, REGIONS } from './geo';
import { withIeyo } from './ko';
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
  // 그리는 좌표와 화면 크기를 같게 (iOS 주소창·PC 스크롤바 때문에 늘어나지 않게)
  c.style.width = `${W}px`;
  c.style.height = `${H}px`;
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

const CHEER = '/art/bora-cheer.webp';
let cheerImg: HTMLImageElement | null = null;

/** 축하 그림을 미리 받아 둔다 (로그인 뒤 잠시 있다가, 처음 축하할 때 바로 뜨게) */
export function preloadCheer() {
  if (cheerImg || typeof window === 'undefined') return;
  cheerImg = new Image();
  cheerImg.decoding = 'async';
  cheerImg.src = CHEER;
}

/**
 * 처음 가본 곳·새 뱃지: 화면 가운데에 핀을 꽂으며 환호하는 보라가 잠깐 떴다 사라지고,
 * 보라가 든 핀에서 색종이가 터진다. 누르거나 가리지 않는다 (글은 알림이 맡는다).
 */
export function celebrate() {
  if (typeof window === 'undefined') return;
  const img = cheerImg;
  const W = window.innerWidth, H = window.innerHeight;
  // 연달아 축하할 일이 생겨도 한 번만
  if (document.querySelector('.cheer')) return;
  if (img?.complete && img.naturalWidth) {
    const wrap = document.createElement('div');
    wrap.className = 'cheer';
    wrap.setAttribute('aria-hidden', 'true');
    const el = img.cloneNode() as HTMLImageElement;
    el.alt = '';
    wrap.appendChild(el);
    document.body.appendChild(wrap);
    const done = () => wrap.remove();
    wrap.addEventListener('animationend', done);
    setTimeout(done, 3200);
    // 보라가 든 핀 자리 (그림의 오른쪽 위)
    const w = 170, h = (w * img.naturalHeight) / img.naturalWidth;
    // 보라가 다 올라온 뒤에 터지게
    setTimeout(() => confetti({ x: W / 2 - w / 2 + w * 0.79, y: H * 0.45 - h / 2 + h * 0.1 }), 360);
  } else {
    preloadCheer();
    confetti();
  }
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
  if (got.length) return `'${got[0].name}' 배지를 받았어요`;
  if (newCountries) return `처음 가본 나라! ${b.countryVisits.size}번째 나라예요`;
  // 여러 시·군이 있는 도(道)의 첫 칸이면 그 이름으로: '경북 첫 칸이에요!'
  const newGroup = [...b.groupsVisited].find((g) => !a.groupsVisited.has(g) && REGIONS.filter((r) => r.group === g).length > 1);
  if (newGroup) return `${withIeyo(`${GROUPS.find((g) => g.id === newGroup)?.name ?? ''} 첫 칸`)}!`;
  if (newCells) return `처음 가본 곳! ${b.cellVisits.size}번째 시·군이에요`;
  return null;
}
