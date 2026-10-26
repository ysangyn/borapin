/**
 * 한국어 표기 (검수에서 나온 것: '1번 다녀왔어요', 'gmail.com로', '2022 여름')
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { times, withRo } from '../../src/lib/ko';
import { formatWhen } from '../../src/lib/dates';

test('횟수는 열 번까지 우리말로', () => {
  assert.equal(times(1), '한 번');
  assert.equal(times(2), '두 번');
  assert.equal(times(3), '세 번');
  assert.equal(times(4), '네 번');
  assert.equal(times(5), '다섯 번');
  assert.equal(times(10), '열 번');
  assert.equal(times(11), '11번');
  assert.equal(times(24), '24번');
});

test("'로/으로'는 영어 메일 주소도 읽는 소리대로", () => {
  assert.equal(withRo('ysangyn@gmail.com'), 'ysangyn@gmail.com으로'); // 컴(엠)
  assert.equal(withRo('bora@example.kr'), 'bora@example.kr로'); // 알 (ㄹ 받침은 '로')
  assert.equal(withRo('x@y.net'), 'x@y.net로'); // 티
  assert.equal(withRo('x@y.co'), 'x@y.co로');
  assert.equal(withRo('부산'), '부산으로');
  assert.equal(withRo('서울'), '서울로');
  assert.equal(withRo('제주'), '제주로');
});

test('계절만 아는 날짜는 "2022년 여름"', () => {
  assert.equal(formatWhen({ p: 'season', y: 2022, s: 'summer' }), '2022년 여름');
  assert.equal(formatWhen({ p: 'season', s: 'winter' }), '겨울');
});

test("'이/가' 같은 조사도 받침대로, 영어 이름은 읽는 소리대로 (Planner '○○이(가)' 대신)", async () => {
  const { withIGa, withJosa, josaOnly } = await import('../../src/lib/ko');
  assert.equal(withIGa('보라'), '보라가');
  assert.equal(withIGa('영상'), '영상이');
  assert.equal(withIGa('YUN'), 'YUN이'); // 엔
  assert.equal(withIGa('Bora'), 'Bora가');
  assert.equal(withJosa('제주', '은/는'), '제주는');
  assert.equal(withJosa('부산', '을/를'), '부산을');
  assert.equal(withJosa('보라', '과/와'), '보라와');
  assert.equal(withJosa('영상', '과/와'), '영상과');
  assert.equal(josaOnly('보라', '이/가'), '가');
  assert.equal(josaOnly('영상', '이/가'), '이');
});

test("'로/으로'만 떼어 쓰기 (이름을 굵게 쓰고 조사만 이어 붙일 때)", () => {
  assert.equal(withRo('보라').slice('보라'.length), '로');
  assert.equal(withRo('영상').slice('영상'.length), '으로');
  assert.equal(withRo('제주 여행').slice('제주 여행'.length), '으로');
});

test('이에요/예요', async () => {
  const { withIeyo } = await import('../../src/lib/ko');
  assert.equal(withIeyo('양평'), '양평이에요');
  assert.equal(withIeyo('대구'), '대구예요');
  assert.equal(withIeyo('강원 강릉시'), '강원 강릉시예요');
});
