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

test('관광지 자세히: 가장 가까운 것 고르기(3km 넘으면 없음), 소개 짧게·전체, 이용 시간·쉬는 날', async () => {
  const { aboutOf, introOf, pickSpot } = await import('../../worker/src/nearbyParse');
  const r = { response: { body: { items: { item: [
    { contentid: 'far', contenttypeid: '12', title: '경포대', mapx: '127.0', mapy: '37.5' },
    { contentid: 'near', contenttypeid: '12', title: '경포대', mapx: '128.896', mapy: '37.795', addr1: '강원 강릉시 경포로', firstimage: 'http://x/a.jpg' },
  ] } } } };
  assert.deepEqual(pickSpot(r, 37.796, 128.897), { id: 'near', type: '12', addr: '강원 강릉시 경포로', img: 'https://x/a.jpg' });
  assert.equal(pickSpot(r, 35.1, 129.0), null);
  const a = aboutOf('<p>경포대는 경포호 북쪽에 있는 누각이다. 관동팔경의 하나로 꼽힌다.</p><br>' + '달맞이 명소다. '.repeat(20));
  assert.ok(a.short?.startsWith('경포대는 경포호 북쪽에 있는 누각이다. 관동팔경의 하나로 꼽힌다.'));
  assert.ok((a.short ?? '').length <= 170);
  assert.ok((a.full ?? '').length > (a.short ?? '').length);
  assert.deepEqual(introOf({ response: { body: { items: { item: [{ usetime: '09:00~18:00<br>(입장 마감 17:30)', restdate: '연중무휴', parking: '' }] } } } }), { time: '09:00~18:00 · (입장 마감 17:30)', rest: '연중무휴', parking: undefined });
});
