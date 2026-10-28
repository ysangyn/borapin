import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstLine, parseNearby } from '../../worker/src/nearbyParse';

const resp = (item: unknown) => ({ response: { body: { items: { item } } } });

test('관광공사 응답 → 가까운 순, 여행코스 빼고, 걸어서 몇 분', () => {
  const out = parseNearby(resp([
    { contentid: '2', contenttypeid: '39', title: '초당할머니순두부', dist: '420.5', mapx: '128.9', mapy: '37.79', firstimage: 'http://tong.visitkorea.or.kr/a.jpg' },
    { contentid: '1', contenttypeid: '12', title: '경포대 [강원 강릉]', dist: '120', mapx: '128.89', mapy: '37.8' },
    { contentid: '3', contenttypeid: '25', title: '강릉 여행코스', dist: '10', mapx: '1', mapy: '1' },
  ]));
  assert.deepEqual(out.map((x) => x.name), ['경포대', '초당할머니순두부']);
  assert.equal(out[0].type, '관광지');
  assert.equal(out[0].kind, 'sight');
  assert.equal(out[0].walk, 2);
  assert.equal(out[1].kind, 'food');
  assert.equal(out[1].img, 'https://tong.visitkorea.or.kr/a.jpg');
});

test('항목이 하나거나 없을 때', () => {
  assert.equal(parseNearby(resp({ contentid: '1', contenttypeid: '14', title: '박물관', dist: '50', mapx: '1', mapy: '2' })).length, 1);
  assert.deepEqual(parseNearby({ response: { body: { items: '' } } }), []);
  assert.deepEqual(parseNearby(null), []);
});

test('개요 → 한 줄: 태그 걷고 첫 문장, 길면 줄임', () => {
  assert.equal(firstLine('<p>경포호 가에 있는 누각이다.<br>달맞이 명소로 알려져 있다.</p>'), '경포호 가에 있는 누각이다.');
  assert.ok((firstLine('가'.repeat(120)) ?? '').endsWith('…'));
  assert.equal(firstLine(''), undefined);
});
