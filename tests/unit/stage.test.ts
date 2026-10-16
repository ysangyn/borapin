import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tripStage } from '../../src/lib/stage';
import type { Trip } from '../../src/lib/types';

const trip = (over: Partial<Trip>): Trip => ({
  id: 'x', title: '여행', kind: 'trip', status: 'planned', when: { p: 'day', y: 2026, m: 10, d: 20, d2: 22 }, places: [{ t: 'kr', code: '51150' }],
  companions: [], memo: '', tags: [], source: 'app', v: 1, ...over,
});
const now = new Date(2026, 9, 16); // 2026-10-16

test('떠나기 전(14일 안): D-4', () => {
  const s = tripStage([trip({})], now);
  assert.equal(s?.kind, 'before');
  assert.equal(s?.label, 'D-4');
});
test('여행 중: 2일째', () => {
  const s = tripStage([trip({ when: { p: 'day', y: 2026, m: 10, d: 15, d2: 18 } })], now);
  assert.equal(s?.kind, 'during');
  assert.equal(s?.label, '여행 중 2일째');
});
test('막 다녀옴(7일 안, 다녀온 것으로 바꾼 여행)', () => {
  const s = tripStage([trip({ status: 'done', when: { p: 'day', y: 2026, m: 10, d: 10, d2: 13 } })], now);
  assert.equal(s?.kind, 'after');
  assert.equal(s?.label, '3일 전에 다녀왔어요');
});
test('먼 예정·오래된 기록·날짜 모르는 기록은 없음', () => {
  assert.equal(tripStage([trip({ when: { p: 'day', y: 2026, m: 12, d: 1 } })], now), null);
  assert.equal(tripStage([trip({ status: 'done', when: { p: 'day', y: 2026, m: 9, d: 1 } })], now), null);
  assert.equal(tripStage([trip({ when: { p: 'month', y: 2026, m: 10 } })], now), null);
});
test('여행 중이 곧 떠남보다 먼저', () => {
  const s = tripStage([trip({ id: 'a' }), trip({ id: 'b', when: { p: 'day', y: 2026, m: 10, d: 16 } })], now);
  assert.equal(s?.kind, 'during');
  assert.equal(s?.trip.id, 'b');
});
