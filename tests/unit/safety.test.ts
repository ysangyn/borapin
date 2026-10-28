import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safetyNews, type Abroad } from '../../src/lib/abroad';
import { COUNTRIES } from '../../src/lib/geo';

const jp = COUNTRIES.find((c) => c.iso2?.toUpperCase() === 'JP')!.id;
const th = COUNTRIES.find((c) => c.iso2?.toUpperCase() === 'TH')!.id;
const now = new Date('2026-10-28T09:00:00+09:00');
const d: Abroad = {
  changes: [{ k: 'TH', d: '2026-10-20', t: '태국 일부 지역 특별여행주의보 발령' }, { k: 'JP', d: '2026-08-01', t: '오래된 조정' }],
  notices: { JP: [{ d: '2026-10-25', t: '태풍 관련 안전 공지' }, { d: '2026-09-01', t: '옛 공지' }], TH: [{ d: '2026-10-26', t: '집회 안내' }] },
};

test('자료가 없으면 아무것도 없다', () => {
  assert.equal(safetyNews([jp], null, now), null);
});

test('공지는 14일 안, 경보 조정은 30일 안의 가장 새것', () => {
  assert.deepEqual(safetyNews([jp], d, now), { countryId: jp, kind: '공지', d: '2026-10-25', t: '태풍 관련 안전 공지', when: '10월 25일' });
  // 태국: 공지(10-26)가 경보(10-20)보다 새것
  assert.equal(safetyNews([th], d, now)?.kind, '공지');
  assert.equal(safetyNews([th], { changes: d.changes }, now)?.kind, '경보');
});

test('앞의 나라(예정 여행)가 먼저, 오래된 것만 있으면 다음 나라', () => {
  assert.equal(safetyNews([th, jp], d, now)?.countryId, th);
  const old: Abroad = { notices: { JP: [{ d: '2026-09-01', t: '옛 공지' }] }, changes: d.changes };
  assert.equal(safetyNews([jp, th], old, now)?.countryId, th);
  assert.equal(safetyNews([jp], old, now), null);
});
