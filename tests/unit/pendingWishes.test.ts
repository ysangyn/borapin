import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergePending, togglePending, pendingCount } from '../../src/lib/pendingWishes';

const region = { t: 'kr', code: '51150' } as const;
const head = { token: 'tok1', title: '강릉 카페 지도', by: '보라', region };

test('받은 지도에서 ♡: 지도마다 한 묶음, 다시 누르면 빠진다', () => {
  let l = togglePending([], head, { name: '테라로사', kind: 'cafe' });
  l = togglePending(l, head, { name: '툇마루', kind: 'cafe' });
  assert.equal(l.length, 1);
  assert.deepEqual(l[0].items.map((x) => x.name), ['테라로사', '툇마루']);
  l = togglePending(l, head, { name: '테라로사', kind: 'cafe' });
  assert.deepEqual(l[0].items.map((x) => x.name), ['툇마루']);
  // 다 빠지면 묶음도 없어진다
  assert.deepEqual(togglePending(l, head, { name: '툇마루', kind: 'cafe' }), []);
});

test('전부 담기: 겹치는 이름은 한 번만, 개수', () => {
  const l = mergePending(togglePending([], head, { name: '테라로사', kind: 'cafe' }), head, [{ name: '테라로사', kind: 'cafe' }, { name: '초당순두부', kind: 'food' }]);
  assert.deepEqual(l[0].items.map((x) => x.name), ['테라로사', '초당순두부']);
  assert.equal(pendingCount(l), 2);
  assert.equal(pendingCount([]), 0);
});
