import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aboutMin, nextCell } from '../../src/lib/nextCell';
import { REGIONS } from '../../src/lib/geo';

const goyang = REGIONS.find((r) => r.name.includes('고양'))!;
const home = { lat: goyang.lat, lng: goyang.lng, code: goyang.code };

test('집이 없으면 아무것도 보이지 않는다', () => {
  assert.equal(nextCell(null, new Set()), null);
});

test('집 칸은 빼고 가장 가까운 안 가 본 칸', () => {
  const n = nextCell(home, new Set())!;
  assert.notEqual(n.code, home.code);
  assert.ok(n.km < 30, `${n.name} ${n.km}km`);
});

test('다녀온 칸과 계획된 칸은 건너뛴다', () => {
  const first = nextCell(home, new Set())!;
  const second = nextCell(home, new Set([first.code]))!;
  assert.notEqual(second.code, first.code);
  const third = nextCell(home, new Set([first.code]), new Set([second.code]))!;
  assert.ok(![first.code, second.code].includes(third.code));
  assert.ok(third.km >= second.km);
});

test('다 채우면 null', () => {
  assert.equal(nextCell(home, new Set(REGIONS.map((r) => r.code))), null);
});

test('시간 글', () => {
  assert.equal(aboutMin(70), '약 1시간 10분');
  assert.equal(aboutMin(40), '약 40분');
  assert.equal(aboutMin(120), '약 2시간');
});
