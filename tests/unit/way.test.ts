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
