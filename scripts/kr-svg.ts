/**
 * 로그인 화면의 '핀이 채워지는 지도' 그림용: 국내 160칸 경계를 가벼운 SVG 경로로 만든다.
 * 사용: npx tsx scripts/kr-svg.ts → src/data/kr-svg.json
 */
import fs from 'node:fs';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

const topo = JSON.parse(fs.readFileSync('public/data/kr-cells.topojson', 'utf8')) as Topology;
const obj = topo.objects[Object.keys(topo.objects)[0]] as GeometryCollection<{ cell: string }>;
const fc = feature(topo, obj) as unknown as { features: { properties: { cell: string }; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] };

const K = Math.cos((36 * Math.PI) / 180);
const [LON0, LAT1] = [124.5, 38.7];
const S = 52; // 1도 ≈ 52 단위
const px = (lon: number, lat: number): [number, number] => [(lon - LON0) * K * S, (LAT1 - lat) * S];

function ringArea(r: [number, number][]) {
  let a = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % r.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}
/** 너무 가까운 점은 건너뛰어 줄인다 */
function thin(r: [number, number][], tol = 1.4) {
  const out: [number, number][] = [r[0]];
  for (const p of r.slice(1)) {
    const q = out[out.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= tol) out.push(p);
  }
  return out;
}
const fmt = (n: number) => Math.round(n).toString();

let maxX = 0, maxY = 0;
const cells = fc.features.map((f) => {
  const polys = (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) as number[][][][];
  const rings: string[] = [];
  const all = polys.map((poly) => poly[0].map(([x, y]) => px(x, y)));
  const biggest = Math.max(...all.map(ringArea));
  for (const r of all) {
    // 큰 섬은 남기고 아주 작은 섬은 뺀다 (제주·울릉은 남음)
    if (ringArea(r) < Math.max(3, biggest * 0.05)) continue;
    const t = thin(r);
    if (t.length < 4) continue;
    for (const [x, y] of t) { maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    rings.push('M' + t.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L') + 'Z');
  }
  return { c: f.properties.cell, d: rings.join('') };
}).filter((x) => x.d);

const out = { w: Math.ceil(maxX + 2), h: Math.ceil(maxY + 2), cells };
fs.writeFileSync('src/data/kr-svg.json', JSON.stringify(out));
console.log(`칸 ${cells.length}개, ${(JSON.stringify(out).length / 1024).toFixed(1)}KB, ${out.w}×${out.h}`);
