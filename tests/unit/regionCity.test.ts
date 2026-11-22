import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from '../../src/lib/region';
import type { Trip } from '../../src/lib/types';

const trip = (id: string, places: Trip['places']): Trip => ({ id, title: id, places, when: { p: 'unknown' }, status: 'done', companions: [], v: 1 } as unknown as Trip);

test('나라만 꽂은 여행(일본)은 하코다테 화면에 "다녀옴"으로 세지 않는다. 도시 여행은 나라 화면에 센다 (사용자 의견 11-22)', () => {
  const japan = trip('jp', [{ t: 'country', id: 'JPN' }]);
  const hako = trip('hk', [{ t: 'country', id: 'JPN', city: '하코다테' }]);
  const kyoto = trip('ky', [{ t: 'country', id: 'JPN', city: '교토' }]);
  const all = [japan, hako, kyoto];
  assert.deepEqual(summarize({ t: 'country', id: 'JPN', city: '하코다테' }, [], all, []).done.map((t) => t.id), ['hk']);
  assert.deepEqual(summarize({ t: 'country', id: 'JPN' }, [], all, []).done.map((t) => t.id).sort(), ['hk', 'jp', 'ky']);
  assert.deepEqual(summarize({ t: 'country', id: 'JPN', city: '오사카' }, [], [japan], []).done, []);
});
