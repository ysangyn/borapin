import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchPlaces } from '../../src/lib/geo';

test('청도를 치면 국내 청도군이 먼저, 중국 칭다오도 뜬다', () => {
  const hits = searchPlaces('청도', 8);
  assert.equal(hits[0].label, '청도군');
  const qd = hits.find((h) => h.label === '칭다오');
  assert.ok(qd, '칭다오가 없어요');
  assert.deepEqual(qd!.place, { t: 'country', id: 'CHN', city: '칭다오' });
  assert.equal(qd!.sub, '중국 · Qingdao');
});

test('도시 본 이름(오사카·다낭)과 영문(osaka)으로도 찾는다', () => {
  assert.equal(searchPlaces('오사카')[0].label, '오사카');
  assert.equal(searchPlaces('다낭')[0].label, '다낭');
  assert.equal(searchPlaces('osaka')[0].label, '오사카');
  // 나라 이름은 그대로 나라로
  assert.deepEqual(searchPlaces('일본')[0].place, { t: 'country', id: 'JPN' });
});
