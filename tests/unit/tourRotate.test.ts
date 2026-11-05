import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickBatch } from '../../scripts/tour-rotate';

const codes = Array.from({ length: 160 }, (_, i) => String(10000 + i));
const cell = (at?: string, f = true) => ({ s: [], ...(f ? { f: [], b: [] } : {}), easy: 0, ...(at ? { at } : {}) });

test('처음(음식점 칸이 거의 없음): 한 번에 60곳씩 채운다', () => {
  const prev = Object.fromEntries(codes.map((c) => [c, cell(undefined, false)]));
  const b = pickBatch(codes, prev, '2026-11-06');
  assert.equal(b.length, 60);
  assert.deepEqual(b.slice(0, 2), ['10000', '10001']);
});

test('평소: 받은 지 6일 넘은 곳 중 가장 오래된 25곳, 다 새것이면 없음', () => {
  const prev = Object.fromEntries(codes.map((c, i) => [c, cell(i < 30 ? '2026-10-29' : i < 40 ? '2026-10-30' : '2026-11-05')]));
  const b = pickBatch(codes, prev, '2026-11-06');
  assert.equal(b.length, 25);
  assert.ok(b.every((c) => +c - 10000 < 30)); // 10-29 것부터
  const fresh = Object.fromEntries(codes.map((c) => [c, cell('2026-11-03')]));
  assert.deepEqual(pickBatch(codes, fresh, '2026-11-06'), []);
});

test('받은 날이 없는 칸(새로 생긴 칸)이 먼저', () => {
  const prev = Object.fromEntries(codes.map((c) => [c, cell('2026-10-20')]));
  delete (prev as Record<string, unknown>)['10159'];
  assert.equal(pickBatch(codes, prev, '2026-11-06')[0], '10159');
});
