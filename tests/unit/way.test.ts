import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAR, departLine, legLine, pickOf, pickSvcs, pickTitle } from '../../src/lib/way';
import type { TransitPlan } from '../../src/lib/transitStop';

const stop: TransitPlan = {
  kind: 'stop', mid: '52', stay: 150, move: 30, ride: 200, end: 14 * 60 + 28, last: 18 * 60 + 20,
  legs: [
    { svc: 'T', ktx: true, from: '행신', to: '전주', fromCode: '41280', toCode: '52', dep: 9 * 60 + 29, arr: 11 * 60 + 33 },
    { svc: 'E', ktx: false, from: '전주고속', to: '남원', fromCode: '52', toCode: '52190', dep: 14 * 60 + 2, arr: 14 * 60 + 28 },
  ],
};

test('고른 길 저장 모양과 글', () => {
  const w = pickOf(stop, 'sat');
  assert.equal(w.kind, 'stop');
  assert.equal(w.day, 'sat');
  assert.equal(pickTitle(w), '전주시 들러 가기');
  assert.equal(legLine(w.legs![0]), '9:29 행신 KTX → 11:33 전주');
  assert.equal(legLine(w.legs![1]), '14:02 전주고속 고속버스 → 14:28 남원');
  assert.deepEqual(pickSvcs(w), ['T', 'E']);
  assert.equal(departLine(w), 'KTX 9:29 행신 출발');
});

test('자동차는 출발 한 줄이 없다', () => {
  assert.equal(pickTitle(CAR), '자동차로 가요');
  assert.equal(departLine(CAR), null);
  assert.equal(departLine(undefined), null);
});

test('저장 모양에 목록 안 목록이 없다 (Firestore가 못 담아 저장이 막혔던 일)', () => {
  const nested = (v: unknown): boolean => Array.isArray(v) ? v.some((x) => Array.isArray(x) || nested(x)) : !!v && typeof v === 'object' && Object.values(v).some(nested);
  assert.equal(nested(pickOf(stop, 'weekday')), false);
});

test('가는 길과 겹치는 일정: 첫날 닿기 전 시각, 마지막 날 떠난 뒤 시각 (들르기·하룻밤 줄은 빼고)', async () => {
  const { wayClash } = await import('../../src/lib/way');
  const go = pickOf(stop, 'sat'); // 14:28 남원 도착
  const back = { ...pickOf(stop, 'sun') }; // 9:29 출발
  const days = ['2026-11-07', '2026-11-08'];
  const items = [
    { name: '광한루', day: '2026-11-07', time: '13:00' },
    { name: '전주 들르기', day: '2026-11-07', time: '11:33' },
    { name: '저녁', day: '2026-11-07', time: '18:00' },
    { name: '아침 산책', day: '2026-11-08', time: '08:00' },
    { name: '점심', day: '2026-11-08', time: '12:00' },
    { name: '시간 없음', day: '2026-11-07', time: null },
  ];
  const c = wayClash({ go, back }, days, items);
  assert.deepEqual(c.go, { at: '14:28', place: '남원', names: ['광한루'] });
  assert.deepEqual(c.back, { at: '9:29', place: '행신', names: ['점심'] });
  assert.deepEqual(wayClash({ go: CAR }, days, items), {});
  // 1박으로 가면 다음 날 도착이라 첫날 일정은 모두 겹친다
  const night = pickOf({ ...stop, kind: 'overnight', legs: [stop.legs[0], { ...stop.legs[1], dep: stop.legs[1].dep + 1440, arr: stop.legs[1].arr + 1440 }] }, 'sat');
  assert.deepEqual(wayClash({ go: night }, days, items).go?.names, ['광한루', '저녁', '아침 산책', '점심']);
});
