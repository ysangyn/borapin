import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hoursFromKorea, tzText, zoneFor, localTimeText } from '../../src/lib/tz';
import countries from '../../src/data/countries.json' with { type: 'json' };

const jan = new Date(Date.UTC(2026, 0, 15, 3)); // 겨울
const jul = new Date(Date.UTC(2026, 6, 15, 3)); // 여름(서머타임)

test('시차: 일본 0, 태국 -2, 네팔 -3.25, 파리는 겨울 -8 여름 -7, 뉴욕은 겨울 -14 여름 -13', () => {
  assert.equal(hoursFromKorea({ t: 'country', id: 'JPN' }, jan), 0);
  assert.equal(hoursFromKorea({ t: 'country', id: 'THA' }, jan), -2);
  assert.equal(hoursFromKorea({ t: 'country', id: 'NPL' }, jan), -3.25);
  assert.equal(hoursFromKorea({ t: 'country', id: 'FRA' }, jan), -8);
  assert.equal(hoursFromKorea({ t: 'country', id: 'FRA' }, jul), -7);
  assert.equal(hoursFromKorea({ t: 'country', id: 'USA' }, jan), -14);
  assert.equal(hoursFromKorea({ t: 'country', id: 'USA', city: '샌프란시스코' }, jul), -16);
  assert.equal(hoursFromKorea({ t: 'country', id: 'GTM' }, jan), -15);
  assert.equal(tzText({ t: 'country', id: 'JPN' }), '시차 없음');
  assert.equal(tzText({ t: 'country', id: 'NPL' }, jan), '한국보다 3시간 15분 느려요');
  assert.equal(tzText({ t: 'country', id: 'NZL' }, jan), '한국보다 4시간 빨라요');
  assert.equal(hoursFromKorea({ t: 'kr', code: '11' }), null);
  assert.ok(localTimeText({ t: 'country', id: 'JPN' }).length > 0);
});

test('모든 나라에 시간대가 있고 기기가 아는 이름이다', () => {
  const missing = (countries as { id: string }[]).filter((c) => !zoneFor({ t: 'country', id: c.id })).map((c) => c.id);
  assert.deepEqual(missing, []);
  for (const c of countries as { id: string }[]) assert.notEqual(hoursFromKorea({ t: 'country', id: c.id }, jan), null, c.id);
});
