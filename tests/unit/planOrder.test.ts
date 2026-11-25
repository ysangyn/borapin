import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chain, groupByDistance, km, moveItem, type Slot } from '../../src/lib/planOrder';

// 타이베이 근처 (대략)
const P = {
  memorial: { id: 'm', lat: 25.0346, lng: 121.5218 }, // 중정기념당
  yongkang: { id: 'y', lat: 25.0330, lng: 121.5297 }, // 융캉제
  t101: { id: 't', lat: 25.0340, lng: 121.5645 }, // 타이베이 101
  shilin: { id: 's', lat: 25.0880, lng: 121.5240 }, // 스린 야시장
  jiufen: { id: 'j', lat: 25.1092, lng: 121.8452 }, // 지우펀
  shifen: { id: 'f', lat: 25.0480, lng: 121.7780 }, // 스펀
};

test('거리: 중정기념당 ~ 타이베이 101은 4km 남짓', () => {
  const d = km(P.memorial, P.t101);
  assert.ok(d > 3.5 && d < 5, String(d));
});

test('가까운 곳 잇기: 지우펀과 스펀은 붙어 있고, 중정기념당과 융캉제도 붙어 있다', () => {
  const ids = chain(Object.values(P)).map((p) => p.id).join('');
  assert.ok(/jf|fj/.test(ids), ids);
  assert.ok(/my|ym/.test(ids), ids);
});

test('가까운 곳끼리 날짜 나누기: 사흘이면 하루 두 곳, 지우펀·스펀은 같은 날', () => {
  const days = ['2026-12-23', '2026-12-24', '2026-12-25'];
  const r = groupByDistance(Object.values(P), days);
  assert.equal(r.length, 6);
  for (const d of days) assert.equal(r.filter((x) => x.day === d).length, 2);
  const day = (id: string) => r.find((x) => x.id === id)!.day;
  assert.equal(day('j'), day('f'));
  assert.ok(r.every((x) => x.time === null));
});

test('날짜가 없거나 곳이 없으면 아무것도 안 바꾼다', () => {
  assert.deepEqual(groupByDistance(Object.values(P), []), []);
  assert.deepEqual(groupByDistance([], ['2026-12-23']), []);
});

const days = ['d1', 'd2'];
const L: Slot[] = [
  { id: 'a', day: 'd1', order: 1, time: '10:00' },
  { id: 'b', day: 'd1', order: 2, time: null },
  { id: 'c', day: 'd2', order: 1, time: null },
  { id: 'x', day: null, order: 1, time: null },
];

test('화살표: 같은 날 안에서는 옆 곳과 차례·시간을 바꾼다', () => {
  const r = moveItem(L, 'b', -1, days);
  assert.deepEqual(r, [{ id: 'b', day: 'd1', order: 1, time: '10:00' }, { id: 'a', day: 'd1', order: 2, time: null }]);
});

test('화살표: 그날 맨 아래에서 ↓면 다음 날 맨 앞으로, 맨 위에서 ↑면 앞 날 맨 뒤로', () => {
  assert.deepEqual(moveItem(L, 'b', 1, days), [{ id: 'b', day: 'd2', order: 0, time: null }]);
  assert.deepEqual(moveItem(L, 'c', -1, days), [{ id: 'c', day: 'd1', order: 3, time: null }]);
  assert.deepEqual(moveItem(L, 'c', 1, days), [{ id: 'c', day: null, order: 0, time: null }]);
});

test('화살표: 더 갈 데가 없으면 그대로', () => {
  assert.deepEqual(moveItem(L, 'a', -1, days), []);
  assert.deepEqual(moveItem(L, 'x', 1, days), []);
});

test('화살표: 차례 번호가 같아도 확실히 바뀐다', () => {
  const same: Slot[] = [{ id: 'p', day: 'd1', order: 1, time: null }, { id: 'q', day: 'd1', order: 1, time: null }];
  const r = moveItem(same, 'q', -1, days);
  assert.equal(r.find((x) => x.id === 'q')!.order, 0);
  assert.equal(r.find((x) => x.id === 'p')!.order, 1);
});
