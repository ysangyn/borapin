import transport from '../data/transport.json';
import iata from '../data/iata.json';
import { REGION_BY_CODE } from './geo';
import type { Place } from './types';

/**
 * 가까운 공항·KTX/SRT역 (손으로 정리한 좌표표, 빌드 고정). 시·군 중심에서 직선거리로 고른다.
 * 버스터미널은 거의 모든 시·군에 있어 적지 않는다.
 */
interface Pt { n: string; lat: number; lng: number; c?: string }
const DATA = transport as { airports: Pt[]; stations: Pt[] };
const CODES = iata as Record<string, string>;

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const nearest = (from: { lat: number; lng: number }, list: Pt[]) => list.map((p) => ({ ...p, km: km(from, p) })).sort((a, b) => a.km - b.km)[0];

export interface Access { station?: { n: string; km: number }; airport?: { n: string; km: number; c?: string }; code?: string }

/** 국내: 가까운 KTX/SRT역(60km 안)과 공항(120km 안). 해외: 도시 공항 코드 */
export function accessFor(p: Place): Access | null {
  if (p.t === 'kr') {
    const r = REGION_BY_CODE.get(p.code);
    if (!r) return null;
    const st = nearest(r, DATA.stations);
    const ap = nearest(r, DATA.airports);
    const out: Access = {};
    if (st && st.km <= 60) out.station = { n: st.n, km: Math.round(st.km) };
    if (ap && ap.km <= 120) out.airport = { n: ap.n, km: Math.round(ap.km), c: ap.c };
    return out.station || out.airport ? out : null;
  }
  const code = (p.city && CODES[p.city]) || CODES[p.id];
  return code ? { code } : null;
}

/** 한 줄 글: 'KTX 강릉역 3km · 양양공항 48km' / '공항 KIX' */
export function accessLine(p: Place): string {
  const a = accessFor(p);
  if (!a) return '';
  if (a.code) return `공항 ${a.code}`;
  const parts: string[] = [];
  if (a.station) parts.push(`${a.station.n.includes('SRT') ? '' : 'KTX '}${a.station.n}${a.station.km >= 5 ? ` ${a.station.km}km` : ''}`);
  if (a.airport) parts.push(`${a.airport.n}${a.airport.km >= 5 ? ` ${a.airport.km}km` : ''}`);
  return parts.join(' · ');
}
