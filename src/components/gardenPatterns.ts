import type { Map as MLMap } from 'maplibre-gl';

/**
 * 심는 지도 무늬 (설계서 C3): 다녀온 칸을 보라 대신 풀밭으로. 이미지 파일 없이 캔버스로 그려 지도에 넣는다.
 * g-seed: 풀밭 · g-sprout: 풀밭 + 새싹 · g-flower: 풀밭 + 들꽃 (꽃 도감이 생기면 고장 꽃으로 바뀐다)
 * -1 한 번 / -2 두 번 이상(촘촘하고 풀빛이 진함)
 */
const R = 2; // 선명하게 2배로 그린다
const MEADOW = ['#C9E8BC', '#AEDB9E'];
const FLOWERS: [string, string][] = [['#FFFFFF', '#F5C542'], ['#FFD233', '#F59E0B'], ['#FFB7C9', '#F07A95']];

function draw(stage: 'seed' | 'sprout' | 'flower', dense: boolean): ImageData {
  const S = (dense ? 14 : 18) * R;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = MEADOW[dense ? 1 : 0];
  g.fillRect(0, 0, S, S);
  // 풀 몇 가닥
  g.strokeStyle = '#8CC97C'; g.lineWidth = 1 * R; g.lineCap = 'round';
  for (const [x, y] of [[0.2, 0.8], [0.75, 0.35]]) { g.beginPath(); g.moveTo(x * S, y * S); g.lineTo(x * S - 1.5 * R, y * S - 3 * R); g.moveTo(x * S, y * S); g.lineTo(x * S + 1.5 * R, y * S - 3 * R); g.stroke(); }
  const pts = dense ? [[0.3, 0.3], [0.78, 0.75]] : [[0.32, 0.36]];
  pts.forEach(([x, y], i) => {
    const cx = x * S, cy = y * S;
    if (stage === 'sprout') {
      g.fillStyle = '#5DAA6A';
      g.beginPath(); g.ellipse(cx - 1.6 * R, cy, 2 * R, 1 * R, -0.6, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(cx + 1.6 * R, cy, 2 * R, 1 * R, 0.6, 0, Math.PI * 2); g.fill();
    } else if (stage === 'flower') {
      const [petal, mid] = FLOWERS[i % FLOWERS.length];
      g.fillStyle = petal;
      for (let k = 0; k < 5; k++) { const a = (k * 72 - 90) * Math.PI / 180; g.beginPath(); g.arc(cx + Math.cos(a) * 1.7 * R, cy + Math.sin(a) * 1.7 * R, 1.35 * R, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = mid; g.beginPath(); g.arc(cx, cy, 1 * R, 0, Math.PI * 2); g.fill();
    }
  });
  return g.getImageData(0, 0, S, S);
}

export function addGardenPatterns(map: MLMap) {
  for (const stage of ['seed', 'sprout', 'flower'] as const) for (const d of [1, 2]) {
    const id = `g-${stage}-${d}`;
    if (!map.hasImage(id)) map.addImage(id, draw(stage, d === 2), { pixelRatio: R });
  }
}
