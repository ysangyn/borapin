import { useEffect, useState } from 'react';
import type { Feature } from 'geojson';
import { loadGeo } from '../lib/geodata';
import { regionLabel } from '../lib/geo';
import type { Place } from '../lib/types';

/**
 * 장소 자리 그림: 그 시·군 모양(이웃은 옅게) 위에 핀 하나. 우리 경계 자료만 쓴다 (바깥 지도 서비스 없음).
 * 좌표가 없으면 시·군 모양만. 해외는 그리지 않는다.
 */
type Ring = [number, number][];
const rings = (f: Feature): Ring[] => {
  const g = f.geometry;
  if (!g) return [];
  if (g.type === 'Polygon') return g.coordinates as Ring[];
  if (g.type === 'MultiPolygon') return (g.coordinates as Ring[][]).flat();
  return [];
};

export default function SpotMap({ region, lat, lng, height = 150 }: { region: Place; lat?: number | null; lng?: number | null; height?: number }) {
  const [shape, setShape] = useState<{ me: Ring[]; near: Ring[][] } | null>(null);
  const code = region.t === 'kr' ? region.code : '';
  useEffect(() => {
    let on = true;
    if (!code) return;
    loadGeo().then((g) => {
      if (!on) return;
      const me = g.kr.features.filter((f) => String(f.properties?.cell) === code).flatMap(rings);
      if (!me.length) return;
      let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
      for (const r of me) for (const [x, y] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const pad = Math.max(x1 - x0, y1 - y0) * 0.6;
      const near = g.kr.features
        .filter((f) => String(f.properties?.cell) !== code)
        .map(rings)
        .filter((rs) => rs.some((r) => r.some(([x, y]) => x > x0 - pad && x < x1 + pad && y > y0 - pad && y < y1 + pad)));
      setShape({ me, near });
    }, () => {});
    return () => { on = false; };
  }, [code]);
  if (!code || !shape) return null;

  const W = 320, H = height;
  let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
  for (const r of shape.me) for (const [x, y] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const k0 = Math.cos((((y0 + y1) / 2) * Math.PI) / 180);
  const w = (x1 - x0) * k0, h = y1 - y0;
  const s = Math.min((W - 40) / w, (H - 28) / h);
  const ox = W / 2 - ((x0 + x1) / 2 - x0) * k0 * s, oy = H / 2 + ((y0 + y1) / 2 - y0) * s;
  const P = (x: number, y: number) => [(ox + (x - x0) * k0 * s).toFixed(1), (oy - (y - y0) * s).toFixed(1)].join(',');
  const d = (rs: Ring[]) => rs.map((r) => 'M' + r.map(([x, y]) => P(x, y)).join('L') + 'Z').join('');
  const pin = lat != null && lng != null && lng > x0 - 0.3 && lng < x1 + 0.3 && lat > y0 - 0.3 && lat < y1 + 0.3 ? P(lng, lat).split(',').map(Number) : null;
  return (
    <svg className="spot-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${regionLabel(code)} 안의 자리`} data-testid="spot-map">
      {shape.near.map((rs, i) => <path key={i} d={d(rs)} className="spot-near" />)}
      <path d={d(shape.me)} className="spot-me" />
      {pin ? (
        <g transform={`translate(${pin[0]},${pin[1]})`} className="spot-pin">
          <circle r="11" className="spot-halo" />
          <path d="M0 0 C -7 -9 -8 -13 -8 -16 A 8 8 0 1 1 8 -16 C 8 -13 7 -9 0 0 Z" />
          <circle cy="-16" r="3" fill="#fff" />
        </g>
      ) : (
        <text x={W / 2} y={H / 2} textAnchor="middle" dominantBaseline="middle" className="spot-label">{regionLabel(code)}</text>
      )}
    </svg>
  );
}
