import tz from '../data/tz.json';
import type { Place } from './types';

/**
 * 시차: 나라마다 대표 시간대 이름(IANA)을 적어 두고, 지금 시각 기준으로 한국과의 차이를 기기가 계산한다
 * (서머타임까지 기기 달력이 알아서 맞춘다 — 손으로 적은 숫자보다 정확). 미국·캐나다·호주·러시아·브라질처럼 넓은 나라는 대표 도시 기준.
 */
const ZONES = tz as Record<string, string>;
const CITY_ZONES: Record<string, string> = {
  'USA:샌프란시스코': 'America/Los_Angeles', 'USA:로스앤젤레스': 'America/Los_Angeles', 'USA:시애틀': 'America/Los_Angeles', 'USA:라스베이거스': 'America/Los_Angeles', 'USA:샌디에이고': 'America/Los_Angeles', 'USA:포틀랜드': 'America/Los_Angeles', 'USA:요세미티': 'America/Los_Angeles',
  'USA:하와이': 'Pacific/Honolulu', 'USA:알래스카': 'America/Anchorage', 'USA:덴버': 'America/Denver', 'USA:옐로스톤': 'America/Denver', 'USA:그랜드캐니언': 'America/Phoenix',
  'USA:시카고': 'America/Chicago', 'USA:휴스턴': 'America/Chicago', 'USA:댈러스': 'America/Chicago', 'USA:뉴올리언스': 'America/Chicago', 'USA:내슈빌': 'America/Chicago',
  'CAN:밴쿠버': 'America/Vancouver', 'CAN:빅토리아': 'America/Vancouver', 'CAN:밴프': 'America/Edmonton', 'CAN:캘거리': 'America/Edmonton', 'CAN:옐로나이프': 'America/Yellowknife',
  'AUS:퍼스': 'Australia/Perth', 'AUS:애들레이드': 'Australia/Adelaide', 'AUS:다윈': 'Australia/Darwin', 'AUS:브리즈번': 'Australia/Brisbane', 'AUS:골드코스트': 'Australia/Brisbane', 'AUS:케언스': 'Australia/Brisbane', 'AUS:울룰루': 'Australia/Darwin',
  'RUS:블라디보스토크': 'Asia/Vladivostok', 'RUS:이르쿠츠크': 'Asia/Irkutsk', 'BRA:마나우스': 'America/Manaus', 'MEX:칸쿤': 'America/Cancun', 'MEX:플라야델카르멘': 'America/Cancun',
  'IDN:발리': 'Asia/Makassar', 'CHL:이스터섬': 'Pacific/Easter', 'ESP:테네리페': 'Atlantic/Canary', 'PRT:마데이라': 'Atlantic/Madeira', 'FRA:타히티': 'Pacific/Tahiti',
};

export function zoneFor(p: Place): string | null {
  if (p.t !== 'country') return null;
  return (p.city && CITY_ZONES[`${p.id}:${p.city}`]) || ZONES[p.id] || null;
}

/** 지금 그 시간대의 UTC 오프셋(분) */
function offsetMinutes(zone: string, at = new Date()): number | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(at);
    const get = (t: string) => Number(parts.find((x) => x.type === t)?.value);
    const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
    return Math.round((asUtc - Math.floor(at.getTime() / 60000) * 60000) / 60000);
  } catch { return null; }
}

/** 한국보다 몇 시간 빠른지(+)·느린지(−), 지금 기준. 모르면 null */
export function hoursFromKorea(p: Place, at = new Date()): number | null {
  const zone = zoneFor(p);
  if (!zone) return null;
  const a = offsetMinutes(zone, at), k = offsetMinutes('Asia/Seoul', at);
  if (a === null || k === null) return null;
  return Math.round(((a - k) / 60) * 4) / 4;
}

/** '시차 없음' · '한국보다 1시간 느려요' · '한국보다 3시간 30분 빨라요' */
export function tzText(p: Place, at = new Date()): string {
  const h = hoursFromKorea(p, at);
  if (h === null) return '';
  if (h === 0) return '시차 없음';
  const abs = Math.abs(h);
  const hh = Math.floor(abs), mm = Math.round((abs - hh) * 60);
  return `한국보다 ${hh ? `${hh}시간` : ''}${mm ? `${hh ? ' ' : ''}${mm}분` : ''} ${h < 0 ? '느려요' : '빨라요'}`;
}

/** 그곳의 지금 시각 '오후 3:20' */
export function localTimeText(p: Place, at = new Date()): string {
  const zone = zoneFor(p);
  if (!zone) return '';
  try { return new Intl.DateTimeFormat('ko-KR', { timeZone: zone, hour: 'numeric', minute: '2-digit' }).format(at); } catch { return ''; }
}
