import data from '../data/abroad.json';
import { COUNTRY_BY_ID } from './geo';

/** 외교부 여행경보·입국허가요건, 수출입은행 환율 (CI가 매일 받아 넣음, 실패하면 지난 자료) */
interface Abroad {
  alarm?: Record<string, { lvl: number; remark?: string }>; alarmAt?: string;
  visa?: Record<string, { free: boolean | null; stay?: string; note?: string }>; visaAt?: string;
  fx?: Record<string, number>; fxAt?: string;
}
const D = data as Abroad;
const iso2 = (countryId: string) => COUNTRY_BY_ID.get(countryId)?.iso2?.toUpperCase() ?? '';
const md = (d?: string) => (d ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '');

export const ALARM_LABEL = ['', '여행유의', '여행자제', '출국권고', '여행금지'];

/** 여행경보: 1 여행유의 · 2 여행자제 · 3 출국권고 · 4 여행금지 */
export function alarmFor(countryId: string): { lvl: number; text: string; at: string } | null {
  const a = D.alarm?.[iso2(countryId)];
  if (!a) return null;
  return { lvl: a.lvl, text: `${a.remark ? `${a.remark} ` : ''}${a.lvl}단계 ${ALARM_LABEL[a.lvl] ?? ''}`.trim(), at: md(D.alarmAt) };
}

/** 입국(일반여권): '무비자 90일' / '비자 필요' */
export function visaFor(countryId: string): { text: string; at: string } | null {
  const v = D.visa?.[iso2(countryId)];
  if (!v || v.free === null) return null;
  return { text: v.free ? `무비자${v.stay ? ` ${v.stay}` : ''}` : '비자 필요', at: md(D.visaAt) };
}

/** 환율: 'JPY 엔' 같은 통화 글에서 코드를 읽어 '1엔 ≈ 8.5원' */
export function fxFor(cur: string): { text: string; at: string } | null {
  const code = cur.match(/[A-Z]{3}/)?.[0];
  if (!code || !D.fx?.[code]) return null;
  const v = D.fx[code];
  const unit = cur.replace(code, '').trim() || code;
  const [n, shown] = v < 1 ? [100, v * 100] : v < 20 ? [1, v] : [1, v];
  return { text: `${n === 100 ? 100 : 1}${unit} ≈ ${shown >= 100 ? Math.round(shown).toLocaleString('ko-KR') : shown.toFixed(1)}원`, at: md(D.fxAt) };
}
