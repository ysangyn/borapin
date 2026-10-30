import { test } from 'node:test';
import assert from 'node:assert/strict';
import { festsIn, monthCells } from '../../src/lib/planCal';

const fests = [{ t: '커피축제', s: '20261114', e: '20261115', id: 'a' }];

test('2026년 11월: 1일은 일요일, 지난 날·좋은 달·축제·고른 기간', () => {
  const c = monthCells(2026, 11, { today: new Date(2026, 10, 6), goodMonths: [11], fests, start: '2026-11-08', nights: 1 });
  assert.equal(c[0]?.d, 1); // 앞쪽 빈칸 없음
  const day = (d: number) => c.find((x) => x?.d === d)!;
  assert.equal(day(5).past, true);
  assert.equal(day(6).past, false);
  assert.equal(day(10).good, true);
  assert.equal(day(14).fest, '커피축제');
  assert.equal(day(13).fest, null);
  assert.deepEqual([day(8).inRange, day(9).inRange, day(10).inRange], [true, true, false]);
  assert.equal(day(8).isStart, true);
});

test('달 앞쪽 빈칸 (2026년 12월 1일은 화요일)', () => {
  const c = monthCells(2026, 12, { today: new Date(2026, 0, 1), goodMonths: [], fests: [], nights: 0 });
  assert.deepEqual(c.slice(0, 3).map((x) => x?.d ?? null), [null, null, 1]);
});

test('고른 기간의 축제, 없으면 그달 가까운 것', () => {
  assert.equal(festsIn(fests, '2026-11-14', 0).during.length, 1);
  const r = festsIn(fests, '2026-11-08', 1);
  assert.equal(r.during.length, 0);
  assert.equal(r.near?.t, '커피축제');
});
