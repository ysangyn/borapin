import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayList, todayPool, nextStop, moveGuess, sunsetAt, hhmm, arriveKind, nightOf } from '../../src/lib/today';

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

test('오늘로 정한 곳이 없으면 날짜 안 정한 곳을 오늘 후보로 (다른 날로 정한 곳은 빼고)', () => {
  const plan = [it('공지천', { day: null, order: 2 }), it('남이섬', { day: '2026-11-15' }), it('닭갈비', { day: null, order: 1, done: true })];
  const r = todayPool(plan, '2026-11-14');
  assert.equal(r.mode, 'loose');
  assert.deepEqual(r.list.map((p) => p.id), ['닭갈비', '공지천']);
  const r2 = todayPool([...plan, it('스카이워크', { time: '15:00' })], '2026-11-14');
  assert.equal(r2.mode, 'today');
  assert.deepEqual(r2.list.map((p) => p.id), ['스카이워크']);
});

test('오늘 것도 날짜 안 정한 것도 없으면(여행 날짜를 옮긴 뒤 등) 아직 안 간 곳을 날짜·시각 순으로', () => {
  const plan = [it('남이섬', { day: '2026-12-06', time: '09:30' }), it('공지천', { day: '2026-12-05', time: '11:00' }), it('닭갈비', { day: '2026-12-05', time: '12:30', done: true })];
  const r = todayPool(plan, '2026-11-14');
  assert.equal(r.mode, 'left');
  assert.deepEqual(r.list.map((p) => p.id), ['공지천', '남이섬']);
  assert.equal(todayPool(plan.map((p) => ({ ...p, done: true })), '2026-11-14').list.length, 0);
});

test('도착했어요로 새로 남길 때 일정 종류 → 장소 종류 (먹을 곳=맛집, 살 곳=가게, 나머지 볼거리)', () => {
  assert.equal(arriveKind('eat'), 'food');
  assert.equal(arriveKind('buy'), 'shop');
  assert.equal(arriveKind('see'), 'sight');
  assert.equal(arriveKind('fest'), 'sight');
  assert.equal(arriveKind(undefined), 'sight');
});

test('하루 끝: 오늘 다녀온 곳(순서대로)·오늘 찍은 사진·내일 첫 일정', () => {
  const plan = [
    it('닭갈비', { time: '12:30', done: true }),
    it('공지천', { time: '11:00', done: true }),
    it('스카이워크', { time: '15:00' }),
    it('남이섬', { day: '2026-11-15', time: '09:30' }),
    it('레고랜드', { day: '2026-11-15', time: '14:00' }),
  ];
  const photos = [{ id: 'p1', taken: '2026-11-14T11:20' }, { id: 'p2', taken: '2026-11-13T20:00' }, { id: 'p3', taken: '2026-11-14T15:40' }, { id: 'p4', taken: null }];
  const n = nightOf(plan, photos, '2026-11-14');
  assert.deepEqual(n.went.map((p) => p.id), ['공지천', '닭갈비']);
  assert.deepEqual(n.photos.map((p) => p.id), ['p1', 'p3']);
  assert.equal(n.tomorrow?.id, '남이섬');
  assert.equal(nightOf(plan, photos, '2026-11-15').tomorrow, null);
});

test('하루 끝: 일정 날짜가 달라도(날짜 없이 담았거나 어긋났어도) 오늘 도착한 곳은 오늘 다닌 곳', () => {
  const plan = [
    it('공지천', { day: '2026-12-05', time: '11:00', done: true, doneDay: '2026-11-14' }),
    it('닭갈비', { day: null, done: true, doneDay: '2026-11-14', order: 2 }),
    it('남이섬', { day: '2026-11-14', time: '09:00', done: true, doneDay: '2026-11-13' }), // 어제 미리 다녀옴
    it('레고랜드', { day: '2026-12-06', done: true }), // 언제 갔는지 모름 → 그 날짜의 것
  ];
  assert.deepEqual(nightOf(plan, [], '2026-11-14').went.map((p) => p.id), ['공지천', '닭갈비']);
});
