import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsNew } from '../../src/lib/celebrate';
import type { Trip } from '../../src/lib/types';

const trip = (id: string, code: string): Trip => ({
  id, title: '여행', kind: 'trip', status: 'done', when: { p: 'year', y: 2024 }, places: [{ t: 'kr', code }],
  companions: [], memo: '', tags: [], source: 'app', v: 1,
});

test('여러 시·군이 있는 도의 첫 칸이면 도 이름으로 축하', () => {
  const before = [trip('a', '41281'), trip('b', '41285'), trip('c', '41287')]; // 경기 셋 (뱃지 '첫 핀'은 이미 받음)
  assert.equal(whatsNew(before, [...before, trip('d', '47130')]), '경북 첫 칸이에요!');
});

test('같은 도의 두 번째 칸이면 몇 번째 시·군', () => {
  const before = [trip('a', '41281'), trip('b', '41285'), trip('c', '47130')];
  const msg = whatsNew(before, [...before, trip('d', '47150')]);
  assert.match(msg ?? '', /번째 시·군이에요|배지/);
});
