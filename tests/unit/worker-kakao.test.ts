import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseKakaoNear } from '../../worker/src/kakaoParse';

// 카카오 로컬 카테고리 검색 응답 모양 (documents) — 음식점(FD6)·카페(CE7)
const food = { documents: [
  { id: '11', place_name: '초당할머니순두부', category_name: '음식점 > 한식 > 순두부', category_group_code: 'FD6', distance: '120', x: '128.9089', y: '37.7915', road_address_name: '강원 강릉시 초당순두부길 77', address_name: '강원 강릉시 초당동 309-1', phone: '033-652-2058', place_url: 'http://place.map.kakao.com/11' },
  { id: '12', place_name: '○○베이커리', category_name: '음식점 > 간식 > 제과,베이커리', category_group_code: 'FD6', distance: '40', x: '128.9080', y: '37.7920', road_address_name: '', address_name: '강원 강릉시 초당동 1', phone: '', place_url: 'http://place.map.kakao.com/12' },
] };
const cafe = { documents: [
  { id: '21', place_name: '테라로사 초당점', category_name: '음식점 > 카페 > 커피전문점', category_group_code: 'CE7', distance: '80', x: '128.9085', y: '37.7918', road_address_name: '강원 강릉시 초당길 1', address_name: '', phone: '', place_url: '' },
  { id: '11', place_name: '초당할머니순두부', category_name: '음식점 > 한식 > 순두부', category_group_code: 'FD6', distance: '120', x: '128.9089', y: '37.7915', road_address_name: '', address_name: '', phone: '', place_url: '' },
] };

test('카카오 근처 가게: 음식점·카페를 합쳐 가까운 순, 같은 가게는 한 번, 종류·자리·주소·걸어서 몇 분', () => {
  const items = parseKakaoNear([food, cafe]);
  assert.deepEqual(items.map((i) => i.name), ['○○베이커리', '테라로사 초당점', '초당할머니순두부']);
  const [bread, coffee, tofu] = items;
  assert.equal(bread.kind, 'food');
  assert.equal(bread.type, '제과,베이커리');
  assert.equal(coffee.kind, 'cafe');
  assert.equal(tofu.addr, '강원 강릉시 초당순두부길 77');
  assert.equal(bread.addr, '강원 강릉시 초당동 1');
  assert.equal(tofu.dist, 120);
  assert.equal(tofu.walk, 2);
  assert.ok(Math.abs(tofu.lat - 37.7915) < 1e-6 && Math.abs(tofu.lng - 128.9089) < 1e-6);
  assert.equal(tofu.id, 'k11');
});

test('이상한 응답은 빈 목록', () => {
  assert.deepEqual(parseKakaoNear([null, { documents: 'x' }, {}]), []);
});
