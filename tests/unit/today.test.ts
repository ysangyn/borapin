import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayList, nextStop, moveGuess, sunsetAt, hhmm } from '../../src/lib/today';

const it = (id: string, over: Record<string, unknown>) => ({ id, name: id, day: '2026-11-14', time: null, done: false, order: 0, ...over }) as Parameters<typeof todayList>[0][number];

test('오늘 목록: 그날 것만, 시각 순, 시각 없는 것은 순서대로 뒤에', () => {
  const plan = [
    it('숙소', { time: '18:00', kind: 'stay', order: 4 }),
    it('공지천', { time: '11:00', order: 1, done: true }),
    it('카페', { order: 3 }),
    it('스카이워크', { time: '15:00', order: 2 }),
    it('남이섬', { day: '2026-11-15', time: '09:30' }),
  ];
  assert.deepEqual(todayList(plan, '2026-11-14').map((p) => p.id), ['공지천', '스카이워크', '숙소', '카페']);
});

test('다음 곳: 아직 안 간 첫 곳 (숙소는 다른 곳이 다 끝난 뒤에만)', () => {
  const list = todayList([
    it('공지천', { time: '11:00', done: true }),
    it('숙소', { time: '13:00', kind: 'stay' }),
    it('스카이워크', { time: '15:00' }),
  ], '2026-11-14');
  assert.equal(nextStop(list)?.id, '스카이워크');
  assert.equal(nextStop(list.map((p) => (p.id === '스카이워크' ? { ...p, done: true } : p)))?.id, '숙소');
  assert.equal(nextStop(list.map((p) => ({ ...p, done: true }))), null);
});

test('이동 어림: 가까우면 걸어서, 멀면 차로 (길이 굽은 만큼 더해)', () => {
  // 공지천 → 소양강 스카이워크 (직선 약 3.6km)
  const a = { lat: 37.8697, lng: 127.7121 }, b = { lat: 37.8966, lng: 127.7322 };
  const g = moveGuess(a, b)!;
  assert.equal(g.mode, 'car');
  assert.ok(g.min >= 8 && g.min <= 20, `차로 ${g.min}분`);
  const near = moveGuess(a, { lat: 37.8735, lng: 127.7121 })!; // 약 420m
  assert.equal(near.mode, 'walk');
  assert.ok(near.min >= 5 && near.min <= 10, `걸어서 ${near.min}분`);
  assert.equal(moveGuess(a, { lat: null, lng: null }), null);
});

test('해 지는 시각: 서울 11월 중순은 오후 5시 20분 무렵', () => {
  const t = sunsetAt(37.5665, 126.978, new Date('2026-11-14T03:00:00Z'))!;
  const kst = new Date(t.getTime() + 9 * 3600_000);
  const min = kst.getUTCHours() * 60 + kst.getUTCMinutes();
  assert.ok(Math.abs(min - (17 * 60 + 20)) <= 6, `서울 해 지는 시각 ${kst.getUTCHours()}:${kst.getUTCMinutes()}`);
  assert.equal(hhmm(new Date(2026, 10, 14, 7, 5)), '07:05');
});
