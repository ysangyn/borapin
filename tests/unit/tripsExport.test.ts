import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tripsExport } from '../../src/lib/tripsExport';
import { parseTripsExport } from '../../desk/src/trips';
import type { Trip } from '../../src/lib/types';

test('사진함용 여행 목록: 다녀온 여행만, 사진함이 그대로 읽는다', () => {
  const t = (id: string, status: Trip['status']) => ({ id, title: id, kind: 'trip', status, when: { p: 'day', y: 2024, m: 5, d: 3 }, places: [{ t: 'kr', code: '51150' }], companions: [], memo: '', tags: [], source: 'app', v: 1 }) as Trip;
  const j = tripsExport([t('a', 'done'), t('b', 'planned')], new Date(2026, 10, 7, 9, 5));
  assert.equal(j.exportedAt, '2026-11-07T09:05');
  assert.deepEqual(j.trips.map((x) => [x.id, x.placeNames[0]]), [['a', '강원 강릉시']]);
  assert.deepEqual(parseTripsExport(JSON.stringify(j)).map((x) => x.id), ['a']);
  assert.deepEqual(parseTripsExport('{"oops":1}'), []);
});
