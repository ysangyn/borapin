import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hereKind, HERE_KINDS } from '../../src/lib/hereKinds';

test('지금 여기 종류 짐작: 이름이 먼저, 그다음 근처 목록의 종류, 둘 다 없으면 맛집', () => {
  assert.equal(hereKind('성심당 베이커리', 'food'), 'bakery');
  assert.equal(hereKind('테라로사 커피공장', null), 'cafe');
  assert.equal(hereKind('을지로 노가리 포차', null), 'bar');
  assert.equal(hereKind('오죽헌', 'sight'), 'sight');
  assert.equal(hereKind('경포 소품샵', 'shop'), 'shop');
  assert.equal(hereKind('초당할머니순두부', null), 'food');
});

test('종류마다 저장할 장소 종류와 꼬리표 (빵집·술집은 맛집 + 꼬리표 → 내 지도 주제)', () => {
  const by = Object.fromEntries(HERE_KINDS.map((k) => [k.k, k]));
  assert.deepEqual([by.bakery.kind, by.bakery.tag], ['food', '빵집']);
  assert.deepEqual([by.bar.kind, by.bar.tag], ['food', '술집']);
  assert.equal(by.cafe.kind, 'cafe');
  assert.equal(by.cafe.tag, undefined);
});
