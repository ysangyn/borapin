import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasWishItem, planWishItem } from '../../src/lib/wishes';
import type { Wish } from '../../src/lib/types';

const wish = (over: Partial<Wish>): Wish => ({
  id: 'w1', place: { t: 'kr', code: '51150' }, priority: null, spots: [], todos: [], foods: [], note: '', source: 'app', v: 1, ...over,
});
const gn = { t: 'kr' as const, code: '51150' };

test('그 지역 가고 싶은 곳이 없으면 새로 만든다', () => {
  assert.deepEqual(planWishItem([], gn, '경포대', 'spot'), { action: 'create' });
});

test('있으면 볼거리는 spots, 먹거리는 foods에 보탠다', () => {
  const ws = [wish({ spots: ['오죽헌'], foods: ['초당순두부'] })];
  assert.deepEqual(planWishItem(ws, gn, '경포대', 'spot'), { action: 'append', id: 'w1' });
  assert.deepEqual(planWishItem(ws, gn, '오죽헌', 'spot'), { action: 'already', id: 'w1' });
  assert.deepEqual(planWishItem(ws, gn, '초당순두부', 'food'), { action: 'already', id: 'w1' });
  assert.equal(planWishItem(ws, gn, '초당순두부', 'spot').action, 'append'); // 볼거리·먹거리 칸은 따로
  assert.equal(hasWishItem(ws, gn, '오죽헌', 'spot'), true);
});

test('이미 여행으로 만든 가고 싶은 곳에는 보태지 않는다', () => {
  assert.deepEqual(planWishItem([wish({ tripId: 't1', spots: ['경포대'] })], gn, '경포대', 'spot'), { action: 'create' });
});

test('해외 도시는 같은 도시끼리만', () => {
  const ws = [wish({ place: { t: 'country', id: 'JPN', city: '도쿄' } })];
  assert.equal(planWishItem(ws, { t: 'country', id: 'JPN', city: '오사카' }, '도톤보리', 'spot').action, 'create');
  assert.equal(planWishItem(ws, { t: 'country', id: 'JPN', city: '도쿄' }, '메이지 신궁', 'spot').action, 'append');
});

test('예정 여행에 이곳이 들어 있으면 그 여행으로 담는다 (다녀온 여행은 아님)', async () => {
  const { plannedTripFor } = await import('../../src/lib/wishes');
  const t = (id: string, status: 'planned' | 'done', code: string) => ({ id, title: id, kind: 'trip', status, when: { p: 'none' }, places: [{ t: 'kr', code }], companions: [], memo: '', tags: [], source: 'app', v: 1 }) as never;
  assert.equal(plannedTripFor([t('a', 'done', '51150')], gn), null);
  assert.equal(plannedTripFor([t('a', 'done', '51150'), t('b', 'planned', '51150')], gn)?.id, 'b');
  assert.equal(plannedTripFor([t('c', 'planned', '26')], gn), null);
});

test('투어·티켓 검색 주소: 도시 이름을 안전하게 넣고, 기본은 누를 때마다 고르기', async () => {
  const { TOUR_SITES, tourPref } = await import('../../src/components/TourPick');
  for (const s of Object.values(TOUR_SITES)) {
    const u = new URL(s.url('호찌민 & 다낭'));
    assert.equal(u.protocol, 'https:');
    assert.ok(decodeURIComponent(u.search).includes('호찌민 & 다낭'));
  }
  assert.equal(tourPref(), 'ask');
});
