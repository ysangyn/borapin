import type { Booking, BookingKind } from './types';

/**
 * 예약(비행기·숙소·기차·표): 정렬, 다음 예약, 한 줄 글. 홈 카드·준비 탭·가이드북이 같이 쓴다.
 * 시각은 한국 시간으로 비교한다(여행지 시차는 적은 그대로 — 표에 찍힌 현지 시각을 적는 게 보통).
 */
export const BOOKING_LABEL: Record<BookingKind, string> = { flight: '비행기', stay: '숙소', train: '기차', bus: '버스', car: '렌터카', ticket: '표·입장권', etc: '기타' };
export const BOOKING_HINT: Record<BookingKind, string> = { flight: '편명·구간 (예: KE723 인천→간사이)', stay: '숙소 이름', train: '열차·구간 (예: KTX 101 서울→부산)', bus: '구간 (예: 동서울→속초)', car: '렌터카 회사', ticket: '표 이름 (예: 유니버설 입장권)', etc: '이름' };
const VERB: Record<BookingKind, string> = { flight: '출발', stay: '체크인', train: '출발', bus: '출발', car: '받기', ticket: '', etc: '' };

const key = (b: Booking) => (b.date ? `${b.date} ${b.time ?? '99:99'}` : '9999');
export const sortBookings = (list: Booking[]) => [...list].sort((a, b) => key(a).localeCompare(key(b)));

const kstParts = (d: Date) => { const k = new Date(d.getTime() + 9 * 3600_000); return { ymd: k.toISOString().slice(0, 10), hm: k.toISOString().slice(11, 16) }; };
const pad = (t: string) => (t.length === 4 ? `0${t}` : t);

/** 지금 뒤에 오는 첫 예약 (날짜 없는 것은 빼고) */
export function nextBooking(list: Booking[] | undefined, now = new Date()): Booking | null {
  const { ymd, hm } = kstParts(now);
  return sortBookings(list ?? []).find((b) => b.date && (b.date > ymd || (b.date === ymd && (!b.time || pad(b.time) >= hm)))) ?? null;
}

/** '내일 9:20 KE723 인천→간사이 출발 · 예약번호 ABC123' */
export function bookingLine(b: Booking, now = new Date()): string {
  const { ymd } = kstParts(now);
  const tomorrow = kstParts(new Date(now.getTime() + 86400_000)).ymd;
  const day = !b.date ? '' : b.date === ymd ? '오늘' : b.date === tomorrow ? '내일' : `${+b.date.slice(5, 7)}월 ${+b.date.slice(8, 10)}일`;
  const t = b.time ? b.time.replace(/^0(\d):/, '$1:') : '';
  const verb = VERB[b.kind];
  return [[day, t, b.title, verb].filter(Boolean).join(' '), b.code ? `예약번호 ${b.code}` : ''].filter(Boolean).join(' · ');
}
