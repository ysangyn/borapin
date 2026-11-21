import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CIRCLE_LIMITS, circleItemFromPlace, circleItemId, itemKeyOf, mineFirst, newCircleId } from '../../src/lib/circleItems';

const place = {
  id: 'Abc123XYZ',
  name: '소금빵집',
  kind: 'food' as const,
  tag: '빵집',
  region: { t: 'kr' as const, code: '41285' },
  reviews: { 보라: '빵이 짭짤', 영상: '줄이 길어요' },
  verdict: 'again' as const,
  ref: { src: 'kakao' as const, id: '12345' },
  lat: 37.66, lng: 126.77,
  memo: '비밀번호 1234',
  companions: ['엄마'],
  address: '경기 고양시 일산동구',
  createdBy: { uid: 'u1', email: 'a@x.com', name: '보라' },
  v: 1 as const,
};

test('같은 가게를 묶는 열쇠: 가게 번호가 있으면 그것, 없으면 내 기록 번호', () => {
  assert.equal(itemKeyOf(place), 'k12345');
  assert.equal(itemKeyOf({ id: 'Abc123XYZ', naverUrl: 'https://map.naver.com/p/entry/place/777' }), 'n777');
  assert.equal(itemKeyOf({ id: 'Abc123XYZ' }), 'pAbc123XYZ');
  assert.equal(circleItemId('k12345', 'uid9'), 'k12345_uid9');
});

test('모임에 거는 사본: 내 한 줄 평만, 메모·함께 간 사람·주소·메일은 넣지 않는다', () => {
  const it = circleItemFromPlace(place, { uid: 'u1', nick: '보라', me: '보라', spaceId: 'main' });
  assert.deepEqual(it, {
    key: 'k12345', name: '소금빵집', kind: 'food', tag: '빵집', lat: 37.66, lng: 126.77,
    region: { t: 'kr', code: '41285' }, verdict: 'again', line: '빵이 짭짤', placeKey: 'k12345',
    by: { uid: 'u1', nick: '보라' }, spaceId: 'main', v: 1,
  });
  const s = JSON.stringify(it);
  for (const bad of ['비밀번호', '엄마', '일산동구', 'a@x.com', '줄이 길어요']) assert.equal(s.includes(bad), false, bad);
});

test('빈 칸은 만들지 않고, 길이는 규칙 한도에 맞춘다', () => {
  const it = circleItemFromPlace({ id: 'p1', name: 'x'.repeat(100), kind: 'cafe', region: { t: 'kr', code: '11' }, reviews: { 보라: 'y'.repeat(300) }, verdict: null, v: 1 }, { uid: 'u1', nick: '가나다라마바사아자차카', me: '보라', spaceId: null });
  assert.equal(it.name.length, 80);
  assert.equal(it.line!.length, 200);
  assert.equal(it.by.nick.length, 10);
  assert.equal('verdict' in it, false);
  assert.equal('lat' in it, false);
  assert.equal('tag' in it, false);
  assert.equal('placeKey' in it, false);
  assert.equal(it.spaceId, null);
});

test('목록 정리: 내가 건 것 먼저, 그다음 새것 순', () => {
  const list = [
    { id: 'a_u2', by: { uid: 'u2', nick: '캐롤' }, at: 3 },
    { id: 'b_u1', by: { uid: 'u1', nick: '보라' }, at: 1 },
    { id: 'c_u2', by: { uid: 'u2', nick: '캐롤' }, at: 5 },
  ];
  assert.deepEqual(mineFirst(list, 'u1').map((x) => x.id), ['b_u1', 'c_u2', 'a_u2']);
});

test('모임 이름표는 영문·숫자 20자, 한도 숫자', () => {
  assert.match(newCircleId(), /^[A-Za-z0-9]{20}$/);
  assert.deepEqual(CIRCLE_LIMITS, { people: 30, items: 500, myCircles: 5 });
});
