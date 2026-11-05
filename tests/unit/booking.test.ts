import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingLine, nextBooking, sortBookings } from '../../src/lib/booking';
import type { Booking } from '../../src/lib/types';

const b = (o: Partial<Booking>): Booking => ({ id: Math.random().toString(36).slice(2), kind: 'etc', title: '', date: null, time: null, code: '', memo: '', ...o });
const list: Booking[] = [
  b({ kind: 'stay', title: '난바 호텔', date: '2026-12-10', time: '15:00', code: 'HTL-77' }),
  b({ kind: 'flight', title: 'KE723 인천→간사이', date: '2026-12-10', time: '09:20', code: 'ABC123' }),
  b({ kind: 'flight', title: 'KE724 간사이→인천', date: '2026-12-13', time: '18:40' }),
  b({ kind: 'ticket', title: '유니버설 입장권', date: null }),
];

test('예약은 날짜·시각 순, 날짜 없는 것은 맨 뒤', () => {
  assert.deepEqual(sortBookings(list).map((x) => x.title), ['KE723 인천→간사이', '난바 호텔', 'KE724 간사이→인천', '유니버설 입장권']);
});

test('다음 예약: 지금 뒤 첫 것 (지난 것은 건너뜀)', () => {
  assert.equal(nextBooking(list, new Date('2026-12-09T20:00:00+09:00'))?.title, 'KE723 인천→간사이');
  assert.equal(nextBooking(list, new Date('2026-12-10T12:00:00+09:00'))?.title, '난바 호텔');
  assert.equal(nextBooking(list, new Date('2026-12-14T09:00:00+09:00')), null);
});

test('한 줄: 오늘·내일은 말로, 탈것은 출발, 숙소는 체크인, 예약번호', () => {
  const now = new Date('2026-12-09T20:00:00+09:00');
  assert.equal(bookingLine(list[1], now), '내일 9:20 KE723 인천→간사이 출발 · 예약번호 ABC123');
  assert.equal(bookingLine(list[0], new Date('2026-12-10T12:00:00+09:00')), '오늘 15:00 난바 호텔 체크인 · 예약번호 HTL-77');
  assert.equal(bookingLine(list[2], now), '12월 13일 18:40 KE724 간사이→인천 출발');
});
