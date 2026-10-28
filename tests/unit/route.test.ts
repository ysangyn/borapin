import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arrange, dayDistance } from '../../src/lib/route';

// 강릉 북쪽(주문진) 둘, 남쪽(정동진) 둘, 시내 하나
const S = [
  { id: 'jumun', lat: 37.89, lng: 128.83 }, { id: 'sodol', lat: 37.9, lng: 128.82 },
  { id: 'jeongdong', lat: 37.69, lng: 129.03 }, { id: 'haslla', lat: 37.7, lng: 129.02 },
  { id: 'ojuk', lat: 37.78, lng: 128.88 },
];
const days = ['2026-11-08', '2026-11-09'];

test('가까운 것끼리 날짜로 묶는다 (북쪽 둘은 같은 날, 남쪽 둘은 같은 날)', () => {
  const r = arrange(S, days);
  const dayOf = (id: string) => r.find((x) => x.id === id)!.day;
  assert.equal(dayOf('jumun'), dayOf('sodol'));
  assert.equal(dayOf('jeongdong'), dayOf('haslla'));
  assert.notEqual(dayOf('jumun'), dayOf('jeongdong'));
  assert.equal(r.length, 5);
});

test('하루 수가 한쪽으로 쏠리지 않는다 (±1)', () => {
  const r = arrange(S, days);
  const n = days.map((d) => r.filter((x) => x.day === d).length);
  assert.ok(Math.abs(n[0] - n[1]) <= 1, String(n));
});

test('시간이 적힌 곳은 그 날에 남고, 자리 없는 곳은 마지막 날 끝에', () => {
  const r = arrange([...S, { id: 'dinner', day: days[0], time: '18:00' }, { id: 'nopos' }], days);
  assert.equal(r.find((x) => x.id === 'dinner')!.day, days[0]);
  const last = r.filter((x) => x.day === days[1]).sort((a, b) => a.order - b.order);
  assert.equal(last[last.length - 1].id, 'nopos');
});

test('날짜가 없으면 순서만', () => {
  assert.deepEqual(arrange([{ id: 'a' }, { id: 'b' }], []).map((x) => x.order), [1, 2]);
});

test('하루 이동 거리', () => {
  assert.ok(dayDistance(S.slice(0, 2)) < 2);
  assert.ok(dayDistance([S[0], S[2]]) > 20);
});
