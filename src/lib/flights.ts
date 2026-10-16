import iata from '../data/iata.json';
import { COUNTRY_BY_ID } from './geo';
import type { Place } from './types';

/**
 * 항공권 바로가기 (가격은 그쪽 화면에서). 정식 가격 API는 개인에게 안 열려 있어 링크만 건다.
 * 출발은 인천(ICN). 도착은 도시·나라별 공항 코드, 없으면 글로 검색.
 */
const CODES = iata as Record<string, string>;

export function flightLinks(p: Place, month?: number | null): { skyscanner: string; google: string; label: string } | null {
  if (p.t !== 'country') return null;
  const city = p.city ?? '';
  const code = CODES[city] ?? CODES[p.id];
  const name = city || COUNTRY_BY_ID.get(p.id)?.name || p.id;
  // 스카이스캐너: 달만 정하면 그 달 전체에서 싼 날을 보여 준다 (yymm), 없으면 '아무 때나'
  const now = new Date();
  const y = month && month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
  const ym = month ? `${String(y).slice(2)}${String(month).padStart(2, '0')}` : 'anytime';
  const skyscanner = code
    ? `https://www.skyscanner.co.kr/transport/flights/icn/${code.toLowerCase()}/${ym}/?rtn=1&preferdirects=false`
    : `https://www.skyscanner.co.kr/?q=${encodeURIComponent(name)}`;
  const google = `https://www.google.com/travel/flights?hl=ko&q=${encodeURIComponent(`인천에서 ${name} 왕복 항공권${month ? ` ${month}월` : ''}`)}`;
  return { skyscanner, google, label: `인천 → ${name}` };
}
