import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUpcoming } from '../../src/lib/dates';
import type { When } from '../../src/lib/types';

const oct17 = new Date(2026, 9, 17);

test('대략 적은 예정 여행은 그 기간이 끝날 때까지 다가오는 여행이다', () => {
  // '2026년쯤' — 10월이어도 올해가 끝날 때까지는 예정
  assert.equal(isUpcoming({ p: 'year', y: 2026 } as When, oct17), true);
  assert.equal(isUpcoming({ p: 'year', y: 2025 } as When, oct17), false);
  // '2026년 10월쯤' — 10월 31일까지는 예정, 11월이면 지남
  assert.equal(isUpcoming({ p: 'month', y: 2026, m: 10 } as When, oct17), true);
  assert.equal(isUpcoming({ p: 'month', y: 2026, m: 10 } as When, new Date(2026, 10, 1)), false);
  // '2026 가을' — 11월 말까지, 겨울은 이듬해 2월까지
  assert.equal(isUpcoming({ p: 'season', y: 2026, s: 'autumn' } as When, new Date(2026, 10, 20)), true);
  assert.equal(isUpcoming({ p: 'season', y: 2026, s: 'autumn' } as When, new Date(2026, 11, 1)), false);
  assert.equal(isUpcoming({ p: 'season', y: 2026, s: 'winter' } as When, new Date(2027, 1, 10)), true);
  // 정확한 날짜는 그대로: 마지막 날까지 예정
  assert.equal(isUpcoming({ p: 'day', y: 2026, m: 10, d: 15, d2: 17 } as When, oct17), true);
  assert.equal(isUpcoming({ p: 'day', y: 2026, m: 10, d: 15, d2: 16 } as When, oct17), false);
  assert.equal(isUpcoming({ p: 'unknown' } as When, oct17), true);
});
