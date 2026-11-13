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

test('언젠가 갈 곳 → 가고 싶은 곳: 장소마다 하나, 이미 담은 곳은 건너뜀, 메모·누가 원하는지 옮김', async () => {
  const { somedayToWishes } = await import('../../src/lib/someday');
  const trip = { status: 'planned', when: { p: 'unknown' }, title: '말레이시아 여행', memo: '쿠알라룸푸르 야경', companions: ['보라', '영상'],
    places: [{ t: 'country', id: 'MY' }, { t: 'kr', code: '51130' }] } as unknown as Parameters<typeof somedayToWishes>[0];
  const wishes = [{ place: { t: 'kr', code: '51130' } }] as unknown as Parameters<typeof somedayToWishes>[1];
  const out = somedayToWishes(trip, wishes, (n) => n === '보라' || n === '영상');
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].place, { t: 'country', id: 'MY' });
  assert.equal(out[0].note, '쿠알라룸푸르 야경');
  assert.deepEqual(out[0].wantedBy, ['보라', '영상']);
  assert.equal(out[0].source, 'app');
  assert.deepEqual([out[0].spots, out[0].todos, out[0].foods, out[0].priority], [[], [], [], null]);
});
