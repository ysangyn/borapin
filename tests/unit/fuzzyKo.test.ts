import { test } from 'node:test';
import assert from 'node:assert/strict';
import { editDistance, fuzzyFind, jamo, stationKey } from '../../src/lib/fuzzyKo';

test('낱자로 풀기: 겹모음·겹받침도 푼다', () => {
  assert.equal(jamo('대화'), 'ㄷㅐㅎㅗㅏ');
  assert.equal(jamo('닭'), 'ㄷㅏㄹㄱ');
  assert.equal(jamo('Gangnam 역'), 'gangnamㅇㅕㄱ');
});

test("'대회'와 '대화'는 낱자 하나 차이", () => {
  assert.equal(editDistance(jamo('대회'), jamo('대화')), 1);
});

test("역 이름은 '역'을 떼고 비교", () => {
  assert.equal(stationKey('대화역'), '대화');
  assert.equal(stationKey(' 강남 역'), '강남');
});

const S = ['대화', '대화역', '대곡', '주엽', '정발산', '마두', '백석', '강남', '강남구청', '강변', '삼성', '서울역', '홍대입구', '대청', '대치'];

test("오타 보정: '대회역' → 대화가 맨 앞", () => {
  const r = fuzzyFind('대회역', S, (x) => x);
  assert.equal(stationKey(r[0].item), '대화');
  assert.equal(r[0].exact, false);
});

test('자동완성: 앞부분만 쳐도 (짧은 이름 먼저)', () => {
  const r = fuzzyFind('강남', S, (x) => x).filter((h) => h.exact).map((h) => h.item);
  assert.deepEqual(r, ['강남', '강남구청']);
  const r2 = fuzzyFind('홍대', S, (x) => x);
  assert.equal(r2[0].item, '홍대입구');
  assert.equal(r2[0].exact, true);
});

test('치는 중인 마지막 글자(받침 전)도 자동완성: 정바 → 정발산', () => {
  const r = fuzzyFind('정바', S, (x) => x);
  assert.equal(r[0].item, '정발산');
  assert.equal(r[0].exact, true);
});

test('한 글자는 오타 보정 없이 자동완성만', () => {
  const r = fuzzyFind('마', S, (x) => x);
  assert.deepEqual(r.map((h) => h.item), ['마두']);
});

test('전혀 다른 이름은 안 나온다', () => {
  assert.deepEqual(fuzzyFind('부산', S, (x) => x), []);
});
