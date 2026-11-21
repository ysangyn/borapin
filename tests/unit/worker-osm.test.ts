import { test } from 'node:test';
import assert from 'node:assert/strict';
import { overpassQuery, parseOsmNear } from '../../worker/src/osmParse';

// Overpass API 응답 모양 (elements: node는 lat/lon, way는 center)
const res = { elements: [
  { type: 'node', id: 101, lat: 35.0116, lon: 135.7681, tags: { amenity: 'restaurant', name: '一蘭 京都河原町店', 'name:ko': '이치란 교토 가와라마치점', cuisine: 'ramen', 'addr:street': '河原町通', 'addr:housenumber': '12' } },
  { type: 'way', id: 202, center: { lat: 35.0120, lon: 135.7690 }, tags: { amenity: 'cafe', name: '% Arabica Kyoto' } },
  { type: 'node', id: 303, lat: 35.0117, lon: 135.7682, tags: { shop: 'bakery', name: 'Shinshindo' } },
  { type: 'node', id: 404, lat: 35.0117, lon: 135.7682, tags: { amenity: 'restaurant' } },
  { type: 'node', id: 505, lat: 35.0300, lon: 135.7900, tags: { amenity: 'bar', name: '먼 곳 바' } },
] };

test('오픈스트리트맵 근처 가게 풀이: 이름 없는 건 버리고, 우리말 이름이 있으면 먼저, 가까운 순', () => {
  const v = parseOsmNear(res, 35.0116, 135.7681);
  assert.deepEqual(v.map((x) => x.id), ['on101', 'on303', 'ow202', 'on505']);
  assert.equal(v[0].name, '이치란 교토 가와라마치점');
  assert.equal(v[0].type, '라멘');
  assert.equal(v[0].kind, 'food');
  assert.equal(v[0].addr, '河原町通 12');
  assert.equal(v[0].dist, 0);
  assert.equal(v[1].type, '빵집');
  assert.equal(v[2].kind, 'cafe');
  assert.equal(v[2].type, '카페');
  assert.ok(v[3].dist > 2000);
  assert.deepEqual(parseOsmNear(null, 0, 0), []);
});

test('찾는 말: 반경 안의 식당·카페·빵집, 이름 있는 것만', () => {
  const q = overpassQuery(35.0116, 135.7681, 300);
  assert.match(q, /around:300,35\.011600,135\.768100/);
  assert.match(q, /restaurant\|cafe/);
  assert.match(q, /bakery/);
  assert.match(q, /\[name\]/);
});
