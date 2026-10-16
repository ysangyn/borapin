import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, MultiLineString, Polygon, MultiPolygon } from 'geojson';
import { REGION_BY_CODE } from './geo';
import type { Place } from './types';

// ---------- 경계 데이터는 한 번만 불러온다 ----------
let geoPromise: Promise<{ kr: FeatureCollection; krMesh: MultiLineString; world: FeatureCollection }> | null = null;
/** 경계 크기(대략) — 이름 자리 경쟁에서 큰 곳이 먼저 */
export const SIZES = new Map<string, number>();
function bboxSize(geom: unknown): number {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  const walk = (c: unknown): void => {
    if (Array.isArray(c) && typeof c[0] === 'number') {
      const [x, y] = c as [number, number];
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    } else if (Array.isArray(c)) c.forEach(walk);
  };
  walk((geom as { coordinates?: unknown })?.coordinates);
  if (x1 < x0) return 0;
  return (x1 - x0) * (y1 - y0) * Math.cos((((y0 + y1) / 2) * Math.PI) / 180);
}
export function loadGeo() {
  if (!geoPromise) {
    geoPromise = Promise.all([
      fetch('/data/kr-cells.topojson').then((r) => r.json() as Promise<Topology>),
      fetch('/data/world.topojson').then((r) => r.json() as Promise<Topology>),
    ]).then(([krT, wT]) => {
      const krObj = krT.objects[Object.keys(krT.objects)[0]] as GeometryCollection<{ cell: string }>;
      const wObj = wT.objects[Object.keys(wT.objects)[0]] as GeometryCollection;
      const kr = feature(krT, krObj) as unknown as FeatureCollection;
      const groupOf = (g: unknown) => REGION_BY_CODE.get((g as { properties?: { cell?: string } }).properties?.cell ?? '')?.group;
      const krMesh = mesh(krT, krObj, (a, b) => a !== b && groupOf(a) !== groupOf(b)) as MultiLineString;
      const world = feature(wT, wObj) as unknown as FeatureCollection;
      for (const f of kr.features) SIZES.set(`kr:${f.properties?.cell}`, bboxSize(f.geometry));
      for (const f of world.features) SIZES.set(`w:${f.properties?.ADM0_A3}`, bboxSize(f.geometry));
      return { kr, krMesh, world };
    });
  }
  return geoPromise;
}


// ---------- 좌표 → 지역 (사진 위치로 시·군·나라 찾기) ----------
function inRing(x: number, y: number, ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inGeom(x: number, y: number, g: Polygon | MultiPolygon) {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return polys.some((rings) => inRing(x, y, rings[0]) && !rings.slice(1).some((h) => inRing(x, y, h)));
}
function findIn(fc: FeatureCollection, x: number, y: number): Feature | undefined {
  return fc.features.find((f) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') && inGeom(x, y, f.geometry));
}

/** 위경도 → 국내 시·군 칸 또는 나라. 바다면 가장 가까운 칸을 찾지 않고 null */
export async function locate(lng: number, lat: number): Promise<Place | null> {
  const g = await loadGeo();
  const kr = findIn(g.kr, lng, lat);
  if (kr?.properties?.cell) return { t: 'kr', code: String(kr.properties.cell) };
  const w = findIn(g.world, lng, lat);
  const id = w?.properties?.ADM0_A3 as string | undefined;
  if (!id) return null;
  if (id === 'KOR') {
    // 경계 단순화로 해안선 바로 앞이 칸 밖일 때: 가장 가까운 칸 중심
    let best: string | null = null, bd = Infinity;
    for (const r of REGION_BY_CODE.values()) {
      const d = (r.lng - lng) ** 2 + (r.lat - lat) ** 2;
      if (d < bd) { bd = d; best = r.code; }
    }
    return best ? { t: 'kr', code: best } : null;
  }
  return { t: 'country', id };
}
