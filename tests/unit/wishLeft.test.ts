import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leftItems, leftoverPlans, recNames, sameName, wishState } from '../../src/lib/wishes';
import type { Trip, Wish } from '../../src/lib/types';

const gn = { t: 'kr' as const, code: '48220' }; // 통영
const wish = (over: Partial<Wish>): Wish => ({ id: 'w1', place: gn, priority: null, spots: [], todos: [], foods: [], note: '', source: 'app', v: 1, ...over });
const ts = (ms: number) => ({ toMillis: () => ms }) as unknown as Wish['createdAt'];
const trip = (status: 'done' | 'planned'): Trip => ({ id: 't1', places: [gn], status, createdAt: ts(2000) } as unknown as Trip);

test('이름 맞추기: 띄어쓰기·괄호를 빼고 한쪽이 다른 쪽을 품으면 같은 곳', () => {
  assert.ok(sameName('동피랑 벽화마을', '동피랑'));
  assert.ok(sameName('충무김밥(원조)', '충무 김밥'));
  assert.ok(!sameName('미륵산', '동피랑'));
  assert.ok(!sameName('', '동피랑'));
});

test('남은 곳: 다녀옴 표시와 그 지역 장소 기록 이름은 뺀다', () => {
  const w = wish({ spots: ['동피랑 벽화마을', '미륵산 케이블카', '소매물도'], foods: ['충무김밥'], gone: ['소매물도'] });
  assert.deepEqual(leftItems(w, ['동피랑']), ['미륵산 케이블카', '충무김밥']);
});

test('다녀왔어도 못 간 곳이 남으면 다시 가고 싶어요, 다 가 봤으면 다녀왔어요', () => {
  const w = wish({ spots: ['미륵산'], createdAt: ts(1000) });
  const s = wishState(w, [trip('done')]);
  assert.equal(s.kind, 'again');
  assert.deepEqual(s.kind === 'again' ? s.left : [], ['미륵산']);
  assert.equal(wishState(w, [trip('done')], ['미륵산 케이블카']).kind, 'done');
  assert.equal(wishState(wish({ createdAt: ts(1000) }), [trip('done')]).kind, 'done'); // 담은 것 없으면 그대로
  assert.equal(wishState(w, [trip('planned')]).kind, 'planned');
});

test('장소 기록 이름은 그 지역 것만', () => {
  const recs = [{ name: '동피랑', region: gn }, { name: '경포대', region: { t: 'kr' as const, code: '51150' } }];
  assert.deepEqual(recNames(recs, gn), ['동피랑']);
});

test('여행의 못 간 일정: 체크 안 한 것만, 숙소·들르기·이동·이미 담은 것은 빼고', () => {
  const items = [
    { name: '미륵산', done: false, kind: 'see' },
    { name: '충무김밥', done: false, kind: 'eat' },
    { name: '동피랑', done: true, kind: 'see' },
    { name: '스탠포드 호텔', done: false, kind: 'stay' },
    { name: '진주 들르기', done: false },
    { name: '고양 → 통영', done: false },
    { name: '소매물도', done: false, kind: 'see' },
  ];
  assert.deepEqual(leftoverPlans(items, wish({ spots: ['소매물도 등대섬'] })), [{ name: '미륵산', food: false }, { name: '충무김밥', food: true }]);
});
