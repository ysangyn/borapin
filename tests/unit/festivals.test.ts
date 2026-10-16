/**
 * 축제 자료 다루기 (관광공사 자료 → 지역 창·이번 달 추천·가고 싶은 곳)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { festivalMonths, festivalPeriod, upcomingFestivals, type FestivalData } from '../../src/lib/festivals';

const data: FestivalData = {
  updated: '2026-10-16',
  cells: {
    '51150': [
      { t: '강릉 단오제', s: '20260617', e: '20260624', id: '1' },
      { t: '강릉커피축제', s: '20261023', e: '20261026', id: '2' },
      { t: '경포 벚꽃축제', s: '20260401', e: '20260405', id: '3' },
      { t: '정동진 해맞이축제', s: '20261231', e: '20270101', id: '4' },
      // 1년 내내 하는 '문화가 있는 날' 같은 상시 프로그램은 축제로 보여 주지 않는다
      { t: '2026 문화가 있는 날 청춘마이크', s: '20260312', e: '20261211', id: '5' },
    ],
  },
};
const today = new Date(2026, 9, 16); // 2026-10-16

test('기간 표기: 같은 달은 끝 날짜만, 달이 바뀌면 달까지, 하루짜리는 하루', () => {
  assert.equal(festivalPeriod({ t: '', s: '20261023', e: '20261026', id: '' }), '10.23~26');
  assert.equal(festivalPeriod({ t: '', s: '20261231', e: '20270101', id: '' }), '12.31~1.1');
  assert.equal(festivalPeriod({ t: '', s: '20261009', e: '20261009', id: '' }), '10.9');
});

test('다가오는 축제: 끝난 건 빼고, 가까운 순서로, 정해진 날 수 안에서만', () => {
  const up = upcomingFestivals(data, '51150', today, 120);
  assert.deepEqual(up.map((f) => f.t), ['강릉커피축제', '정동진 해맞이축제']);
  assert.deepEqual(upcomingFestivals(data, '51150', today, 30).map((f) => f.t), ['강릉커피축제']);
  assert.deepEqual(upcomingFestivals(data, '11', today), []);
  assert.deepEqual(upcomingFestivals(null, '51150', today), []);
});

test('진행 중인 축제도 다가오는 축제에 들어간다', () => {
  const up = upcomingFestivals(data, '51150', new Date(2026, 9, 24), 30);
  assert.equal(up[0].t, '강릉커피축제');
});

test('축제가 있는 달 (해마다 비슷하다고 보고 지난 1년 자료로)', () => {
  assert.deepEqual(festivalMonths(data, '51150'), [1, 4, 6, 10, 12]);
  assert.deepEqual(festivalMonths(data, '11'), []);
});
