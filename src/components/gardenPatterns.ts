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
