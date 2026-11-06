import { useEffect, useState } from 'react';
import type { Place } from './types';

/**
 * 동네(구·행정동) 경계: 지역 한 장 단위 파일 /data/dong/{지역코드}.json (scripts/dong-build.py가 만듦).
 * 가게 자리(좌표)로 구·동을 찾는다 — 네이버 링크 주소가 '통일로1267번길 144-30'처럼 도로명만이어도 동네 칩이 생기게.
 * 원자료: 통계청 SGIS 행정동 경계 · vuski/admdongkor (출처는 /credits)
 */
export interface DongShape { gu: string | null; dong: string; rings: Float64Array[]; box: [number, number, number, number] }
export type DongData = DongShape[];
interface Raw { v: string; f: [string | null, string, number[][]][] }

export function decodeDong(raw: Raw): DongData {
  return raw.f.map(([gu, dong, rs]) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const rings = rs.map((r) => {
      const out = new Float64Array(r.length);
      let x = 0, y = 0;
      for (let i = 0; i < r.length; i += 2) {
        x = i ? x + r[i] : r[i]; y = i ? y + r[i + 1] : r[i + 1];
        const lx = x / 1e4, ly = y / 1e4;
        out[i] = lx; out[i + 1] = ly;
        if (lx < x0) x0 = lx; if (lx > x1) x1 = lx; if (ly < y0) y0 = ly; if (ly > y1) y1 = ly;
      }
      return out;
    });
    return { gu, dong, rings, box: [x0, y0, x1, y1] };
  });
}

const inRing = (r: Float64Array, x: number, y: number) => {
  let on = false;
  for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) on = !on;
  }
  return on;
};

/** 좌표가 든 동네 (경계를 줄여 둬서 경계선 바로 위면 가장 가까운 상자로 한 번 더) */
export function dongAt(data: DongData | null | undefined, lng: number, lat: number): { gu: string | null; dong: string } | null {
  if (!data) return null;
  for (const d of data) {
    const [x0, y0, x1, y1] = d.box;
    if (lng < x0 || lng > x1 || lat < y0 || lat > y1) continue;
    if (d.rings.some((r) => inRing(r, lng, lat))) return { gu: d.gu, dong: d.dong };
  }
  return null;
}

const cache = new Map<string, Promise<DongData | null>>();
export function loadDong(code: string): Promise<DongData | null> {
  if (!/^\d{2,5}$/.test(code)) return Promise.resolve(null);
  if (!cache.has(code)) {
    cache.set(code, fetch(`/data/dong/${code}.json`).then((r) => (r.ok ? r.json() : null)).then((j) => (j ? decodeDong(j as Raw) : null)).catch(() => { cache.delete(code); return null; }));
  }
  return cache.get(code)!;
}

/** 지역 한 장에서: 국내 지역이면 그 지역 동네 경계를 받아 둔다 (못 받으면 주소만으로) */
export function useDong(place: Place | null | undefined): DongData | null {
  const code = place && place.t === 'kr' ? place.code : null;
  const [data, setData] = useState<{ code: string; d: DongData | null } | null>(null);
  useEffect(() => {
    if (!code) return;
    let on = true;
    void loadDong(code).then((d) => { if (on) setData({ code, d }); });
    return () => { on = false; };
  }, [code]);
  return data && data.code === code ? data.d : null;
}
