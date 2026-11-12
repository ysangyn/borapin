import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSomeday, tripMark } from '../../src/lib/someday';

const t = (status: 'planned' | 'done', when: Record<string, unknown>) => ({ status, when: { p: 'unknown', ...when } }) as Parameters<typeof isSomeday>[0];

test('언젠가 갈 곳: 예정인데 해(年)조차 정하지 않은 여행', () => {
  assert.equal(isSomeday(t('planned', {})), true);
  assert.equal(isSomeday(t('planned', { p: 'year', y: 2027 })), false);
  assert.equal(isSomeday(t('planned', { p: 'day', y: 2026, m: 12, d: 5 })), false);
  assert.equal(isSomeday(t('done', {})), false);
});

test('목록 표시: 날짜 없는 예정은 \'언젠가\', 날짜 있는 예정은 D-n(없으면 예정), 다녀온 여행은 없음', () => {
  assert.equal(tripMark(t('planned', {}), () => null), '언젠가');
  assert.equal(tripMark(t('planned', { p: 'day', y: 2026, m: 12, d: 5 }), () => 'D-23'), 'D-23');
  assert.equal(tripMark(t('planned', { p: 'year', y: 2027 }), () => null), '예정');
  assert.equal(tripMark(t('done', {}), () => null), null);
});
