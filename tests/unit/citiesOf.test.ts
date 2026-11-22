import { test } from 'node:test';
import assert from 'node:assert/strict';
import { citiesOf } from '../../src/lib/geo';

test('나라를 고르면 그 나라의 도시 목록 (자료에 적힌 순서 = 많이 가는 순)', () => {
  assert.deepEqual(citiesOf('TWN').slice(0, 3), ['타이베이', '가오슝', '타이중']);
  assert.ok(citiesOf('JPN').includes('교토'));
  assert.deepEqual(citiesOf('XXX'), []);
});
