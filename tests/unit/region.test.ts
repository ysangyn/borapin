import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultTab, statusChips, summarize } from '../../src/lib/region';
import type { PlaceRec, Trip, Wish } from '../../src/lib/types';

const G = { t: 'kr', code: '51150' } as const;
const rec = (id: string, status?: 'want' | 'been') => ({ id, name: id, kind: 'cafe', region: G, reviews: {}, verdict: null, v: 1, ...(status ? { status } : {}) }) as PlaceRec;
const trip = (id: string, status: 'done' | 'planned', y: number, m = 1) => ({ id, title: id, status, kind: 'trip', when: { p: 'month', y, m }, places: [G], companions: [], memo: '', tags: [], source: 'app', v: 1 }) as Trip;

test('지역 한 장 요약: 가고 싶어요·다녀왔어요(옛 기록은 다녀왔어요), 여행은 최근순, 계획은 가까운 순', () => {
  const s = summarize(G, [rec('a', 'want'), rec('b'), rec('c', 'been'), { ...rec('x'), region: { t: 'kr', code: '26' } }], [trip('t1', 'done', 2019), trip('t2', 'done', 2024, 5), trip('p1', 'planned', 2026, 12), trip('p0', 'planned', 2026, 11)], [{ id: 'w', place: G, spots: [], foods: [], todos: [], v: 1 } as unknown as Wish]);
  assert.deepEqual(s.want.map((r) => r.id), ['a']);
  assert.deepEqual(s.been.map((r) => r.id), ['b', 'c']);
  assert.deepEqual(s.done.map((t) => t.id), ['t2', 't1']);
  assert.deepEqual(s.planned.map((t) => t.id), ['p0', 'p1']);
  assert.equal(s.wish?.id, 'w');
  assert.deepEqual(statusChips(s), ['다녀옴 2번', '계획 중', '♥ 가고 싶어요']);
});

test('처음 열 탭: 주소가 이김', () => {
  const s = summarize(G, [], [], []);
  assert.equal(defaultTab('places', s), 'places');
  assert.equal(defaultTab(null, s), 'glance');
  assert.deepEqual(statusChips(s), []);
});
