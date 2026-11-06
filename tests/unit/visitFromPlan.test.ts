import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isWayLine, planKindToPlace, visitUrl } from '../../src/lib/visitFromPlan';

test('가는 길 줄은 장소가 아니다', () => {
  assert.equal(isWayLine('행신 → 대전 KTX'), true);
  assert.equal(isWayLine('대전 들르기'), true);
  assert.equal(isWayLine('대전에서 하룻밤'), true);
  assert.equal(isWayLine('안동찜닭'), false);
});

test('일정 종류 → 장소 종류', () => {
  assert.equal(planKindToPlace({ name: '테라로사 커피공장', kind: 'eat' }), 'cafe');
  assert.equal(planKindToPlace({ name: '초당순두부', kind: 'eat' }), 'food');
  assert.equal(planKindToPlace({ name: '월영교', kind: 'see' }), 'sight');
  assert.equal(planKindToPlace({ name: '중앙시장', kind: 'buy' }), 'shop');
  assert.equal(planKindToPlace({ name: '카페 툇마루' }), 'cafe');
  assert.equal(planKindToPlace({ name: '안동찜닭' }), 'food');
});

test('담기 주소에 여행·일정 줄·이름·자리가 들어간다', () => {
  const u = new URL(visitUrl('t1', { id: 'p9', name: '테라로사 커피공장', kind: 'eat', lat: 37.7, lng: 128.86 }), 'https://x');
  assert.equal(u.pathname, '/places/new');
  assert.equal(u.searchParams.get('trip'), 't1');
  assert.equal(u.searchParams.get('plan'), 'p9');
  assert.equal(u.searchParams.get('from'), '테라로사 커피공장');
  assert.equal(u.searchParams.get('kind'), 'cafe');
  assert.equal(u.searchParams.get('lat'), '37.7');
  assert.equal(new URL(visitUrl('t1', { id: 'p', name: '월영교' }), 'https://x').searchParams.get('lat'), null);
});
