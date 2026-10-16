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
