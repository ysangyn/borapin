/**
 * '가기 좋은 때' 표기 (검수에서 나온 버그: 12월→1월로 이어지는 겨울이 '1·2 · 11·12월'로 쪼개져 보임)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthsLabel } from '../../src/lib/seasons.ts';

test('이어진 달은 물결(~), 떨어진 묶음은 쉼표로', () => {
  assert.equal(monthsLabel([3, 4, 5, 9, 10]), '3~5, 9·10월');
  assert.equal(monthsLabel([4, 5]), '4·5월');
  assert.equal(monthsLabel([7]), '7월');
  assert.equal(monthsLabel([]), '');
});

test('겨울처럼 12월에서 1월로 넘어가는 달은 한 묶음으로', () => {
  assert.equal(monthsLabel([11, 12, 1, 2]), '11~2월');
  assert.equal(monthsLabel([12, 1]), '12·1월');
  assert.equal(monthsLabel([1, 2, 6, 12]), '12~2, 6월');
});

test('열두 달 모두면 언제든', () => {
  assert.equal(monthsLabel([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), '언제든');
});
