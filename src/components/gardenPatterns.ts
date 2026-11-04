import type { Map as MLMap } from 'maplibre-gl';
import { KINDS } from '../lib/flowers';

/**
 * 심는 지도 무늬 (설계서 C3): 다녀온 칸을 보라 대신 꽃밭으로. 이미지 파일 없이 캔버스로 그려 지도에 넣는다.
 * 다녀온 칸은 한 번만 가도 꽃이 핀다(시안대로). 마음을 남길수록 꽃이 많아지고 색이 풍성해진다:
 *   g-seed 꽃 몇 송이 · g-sprout 조금 더 · g-flower 가득
 * -1 한 번 / -2 두 번 이상(풀빛이 진하고 한 송이 더)
 * 반복이 눈에 띄지 않게 큰 판(36px)에 크기·자리를 흩어 그린다. 꽃 도감(C2)이 생기면 고장 꽃 색으로 바뀐다.
 */
const R = 2;
const T = 36; // 판 한 변(CSS px)
const MEADOW = ['#CDEBC0', '#B4DEA4'];
const BLADE = ['#B2DBA2', '#9CCF8C'];
// [꽃잎, 가운데]
const COLORS: [string, string][] = [['#FFFFFF', '#F5C542'], ['#FFD84D', '#F59E0B'], ['#FFB7C9', '#F07A95'], ['#E7A6F0', '#B5509E'], ['#FFFFFF', '#F5C542'], ['#FF9FB2', '#E8475F']];
// 흩어 놓은 자리 (0~1), 앞에서부터 쓴다
const SPOTS = [[0.18, 0.22], [0.66, 0.12], [0.44, 0.52], [0.86, 0.6], [0.12, 0.78], [0.6, 0.86], [0.32, 0.06], [0.9, 0.3]];
const COUNT = { seed: 2, sprout: 4, flower: 7 } as const;

function flower(g: CanvasRenderingContext2D, x: number, y: number, r: number, [petal, mid]: [string, string]) {
  g.fillStyle = petal;
  for (let k = 0; k < 5; k++) { const a = (k * 72 - 90) * Math.PI / 180; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.78, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = mid; g.beginPath(); g.arc(x, y, r * 0.55, 0, Math.PI * 2); g.fill();
}

function draw(stage: keyof typeof COUNT, dense: boolean, icon: string): ImageData {
  const S = T * R;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = MEADOW[dense ? 1 : 0];
  g.fillRect(0, 0, S, S);
  // 풀잎: 글자처럼 보이지 않게 둥근 잎 몇 장만 비스듬히
  g.fillStyle = BLADE[dense ? 1 : 0];
  for (const [x, y, a] of [[0.38, 0.3, -0.5], [0.76, 0.42, 0.6], [0.22, 0.56, 0.3], [0.54, 0.74, -0.7], [0.92, 0.9, 0.2]]) { g.beginPath(); g.ellipse(x * S, y * S, 2.4 * R, 0.9 * R, a, 0, Math.PI * 2); g.fill(); }
  const n = COUNT[stage] + (dense ? 1 : 0);
  SPOTS.slice(0, n).forEach(([x, y], i) => {
    const r = (stage === 'flower' ? 2.4 : 2.1) * R * (i % 3 === 0 ? 1.15 : i % 3 === 1 ? 0.9 : 1);
    // 마음이 적을수록 흰·노랑 들꽃, 많을수록 여러 색
    // 고장 꽃이 있으면 그 꽃 색이 주인공, 사이사이 흰 들꽃 / 없으면(들꽃) 여러 색
    const k = KINDS[icon];
    const col: [string, string] = k && icon !== 'wild' ? (i % 3 === 2 ? COLORS[0] : [k.petal === '#FFFFFF' ? '#FFFFFF' : k.petal, k.mid]) : stage === 'seed' ? COLORS[i % 2] : COLORS[(i * 5 + 1) % COLORS.length];
    // 판 가장자리에 걸친 꽃이 네모로 잘리지 않게 이웃 판 자리에도 그린다 (이어 붙이면 한 송이)
    for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) flower(g, x * S + dx, y * S + dy, r, col);
  });
  return g.getImageData(0, 0, S, S);
}

/** 무늬 이름: 단계·촘촘함·꽃 종류 */
export const patternId = (stage: keyof typeof COUNT, dense: boolean, icon: string) => `g-${stage}-${dense ? 2 : 1}-${KINDS[icon] ? icon : 'wild'}`;

/** 쓰는 무늬만 그때그때 그려 넣는다 (꽃 30여 종 × 단계 3 × 촘촘 2를 다 만들지 않게) */
export function ensurePattern(map: MLMap, id: string) {
  if (map.hasImage(id)) return;
  const [, stage, d, ...icon] = id.split('-');
  map.addImage(id, draw(stage as keyof typeof COUNT, d === '2', icon.join('-')), { pixelRatio: R });
}

/**
 * 수채 물들이기 (11-04 사용자 결정: 시안 A + C의 피어나는 순간).
 * 다녀온 칸을 그 고장 꽃 색의 옅은 물빛으로 칠한다. 마음(사진·글·평)을 남길수록, 여러 번 갈수록 조금씩 진해진다.
 * 흰 꽃(목련·배꽃 등)은 꽃 가운데 색을 쓴다. 꽃 그림은 칸을 누를 때 피어나는 한 송이로만.
 */
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
const toHex = (v: number[]) => '#' + v.map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const lum = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const LIGHT = { seed: 0.85, sprout: 0.77, flower: 0.68 } as const;
/** 색의 각도(0~360) */
function hueOf([r, g, b]: number[]): number {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
function hsl(h: number, s: number, l: number): number[] {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
}
/**
 * 보라 수채 (11-04 사용자: 보라핀 보라로, 단조롭지 않게 — 시안 D).
 * 고장 꽃 색을 보라 범위 안으로 옮긴다: 분홍·빨강 → 난초빛 보라(286°), 노랑·주황 → 라일락(266°), 파랑·보라 → 남보라(248°).
 * 칸마다 ±8° 흔들어 이웃 칸이 한 덩어리로 보이지 않게, 마음을 남길수록·여러 번 갈수록 진하게.
 */
export function washColor(icon: string, stage: keyof typeof LIGHT, visits: number, code = ''): string {
  const k = KINDS[icon] ?? KINDS.wild ?? { petal: '#C9B8F5', mid: '#9B82F6' };
  let base = hex(k.petal);
  if (lum(base) > 0.85) base = hex(k.mid);
  const h0 = hueOf(base);
  const target = h0 >= 300 || h0 < 20 ? 286 : h0 < 70 ? 266 : h0 < 200 ? 276 : 248;
  let n = 0;
  for (const ch of code) n = (n * 31 + ch.charCodeAt(0)) % 997;
  const jit = (n % 17) - 8;
  const l = Math.max(0.62, LIGHT[stage] - (visits > 1 ? 0.04 : 0));
  return toHex(hsl((target + jit + 360) % 360, 0.62, l));
}

/** 물빛 결: 칸 위에 옅게 얹는 종이·물감 얼룩 (한 장을 모든 칸이 같이 쓴다) */
export function ensurePaper(map: MLMap) {
  if (map.hasImage('g-paper')) return;
  const S = 64 * R;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  // 고정된 씨앗으로 흩어 그려 매번 같은 결
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const x = rnd() * S, y = rnd() * S, r = (6 + rnd() * 16) * R;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const light = rnd() > 0.5;
    grd.addColorStop(0, light ? 'rgba(255,255,255,0.32)' : 'rgba(60,30,90,0.07)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    // 판 가장자리에서 잘린 얼룩은 반대편에 이어 그려 이음매(네모 칸)가 안 보이게
    for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
      if ((dx && (x + dx + r < 0 || x + dx - r > S)) || (dy && (y + dy + r < 0 || y + dy - r > S))) continue;
      g.save(); g.translate(dx, dy); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
    }
  }
  map.addImage('g-paper', g.getImageData(0, 0, S, S), { pixelRatio: R });
}
