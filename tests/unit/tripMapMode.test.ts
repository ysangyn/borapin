import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tripMapMode } from '../../src/lib/geo';

test('여행 지도: 해외가 한 곳이라도 있으면 세계 지도 (국내+해외 섞인 여행도 둘 다 보이게)', () => {
  assert.equal(tripMapMode([{ t: 'kr', code: '51150' }]), 'kr');
  assert.equal(tripMapMode([{ t: 'country', id: 'JPN' }]), 'world');
  assert.equal(tripMapMode([{ t: 'kr', code: '11' }, { t: 'country', id: 'JPN' }]), 'world');
  assert.equal(tripMapMode([]), 'kr');
});
