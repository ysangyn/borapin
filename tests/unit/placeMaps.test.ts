import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAnswer, insertAt, mapKey, mapsOf, nearby, nextQuestion, rankedRecs, startInsert, themeLabel, themeOf, themesOrder, ALL } from '../../src/lib/placeMaps';
import type { PlaceRec } from '../../src/lib/types';

const SD = { t: 'kr' as const, code: '11' };
const GN = { t: 'kr' as const, code: '51150' };
const r = (id: string, kind: PlaceRec['kind'], region = SD, extra: Partial<PlaceRec> = {}): PlaceRec => ({ id, name: id, kind, region, reviews: {}, verdict: null, v: 1, ...extra });

test('내 지도는 지역×주제로 묶이고, 많은 순 · 꼬리표가 있으면 꼬리표가 주제', () => {
  const recs = [r('a', 'cafe'), r('b', 'cafe'), r('c', 'food'), r('d', 'cafe', GN), r('e', 'cafe'), r('f', 'shop', SD, { tag: '옷가게' }), r('g', 'shop', SD, { tag: ' 옷가게 ' })];
  const maps = mapsOf(recs);
  assert.deepEqual(maps.map((m) => [mapKey(m.region, m.theme), m.recs.length]), [['kr:11|cafe', 3], ['kr:11|t:옷가게', 2], ['kr:11|food', 1], ['kr:51150|cafe', 1]]);
  assert.equal(themeOf(r('x', 'shop', SD, { tag: '소품샵' })), 't:소품샵');
  assert.equal(themeOf(r('x', 'shop', SD, { tag: '  ' })), 'shop');
  assert.equal(themeLabel('t:소품샵'), '소품샵');
  assert.equal(themeLabel('food'), '맛집');
  assert.equal(themeLabel(ALL), '한눈에');
});

test('주제 순서: 맛집·카페가 먼저, 그다음 내 꼬리표, 나머지 종류', () => {
  assert.deepEqual(themesOrder(['stay', 't:옷가게', 'cafe', 'shop', 'food', 't:빵집']), ['food', 'cafe', 't:빵집', 't:옷가게', 'shop', 'stay']);
});

test('순위 끼워 넣기: 가운데와 비교해 최대 3번, 건너뛰면 지금 자리에', () => {
  const order = ['a', 'b', 'c', 'd', 'e', 'f', 'g']; // 1등 a … 7등 g
  let st = startInsert(order, 'x');
  assert.equal(nextQuestion(st), 'd'); // 가운데
  st = applyAnswer(st, 'better'); // d보다 좋다 → a~c 사이
  assert.equal(nextQuestion(st), 'b');
  st = applyAnswer(st, 'worse'); // b보다 못하다 → c와 비교
  assert.equal(nextQuestion(st), 'c');
  st = applyAnswer(st, 'better');
  assert.equal(nextQuestion(st), null); // 끝
  assert.deepEqual(insertAt(st), ['a', 'b', 'x', 'c', 'd', 'e', 'f', 'g']);
  // 처음부터 건너뛰면 맨 뒤
  assert.deepEqual(insertAt(startInsert(order, 'y')), [...order, 'y']);
  // 비어 있으면 물을 것 없이 1등
  assert.equal(nextQuestion(startInsert([], 'z')), null);
  assert.deepEqual(insertAt(startInsert([], 'z')), ['z']);
  // 3번을 넘기지 않는다 (16개여도)
  let s2 = startInsert(Array.from({ length: 16 }, (_, i) => `p${i}`), 'q');
  let n = 0;
  while (nextQuestion(s2)) { s2 = applyAnswer(s2, 'better'); n++; }
  assert.ok(n <= 3, String(n));
});

test('순위 목록: 순서에 있는 것 먼저, 없는 것(아직 안 물은 것)은 최근 것부터 뒤에', () => {
  const recs = [r('a', 'cafe'), r('b', 'cafe'), r('c', 'cafe')];
  assert.deepEqual(rankedRecs(recs, ['c', 'a']).map((x) => x.id), ['c', 'a', 'b']);
  assert.deepEqual(rankedRecs(recs, ['c', 'zz', 'a']).map((x) => x.id), ['c', 'a', 'b']); // 지운 곳은 건너뜀
});

test('지금 근처: 2km 안, 가까운 순, 자리 없는 곳은 뺌', () => {
  const recs = [r('far', 'cafe', SD, { lat: 37.60, lng: 127.10 }), r('near', 'cafe', SD, { lat: 37.5447, lng: 127.0557 }), r('mid', 'food', SD, { lat: 37.55, lng: 127.06 }), r('none', 'cafe')];
  const out = nearby(recs, { lat: 37.5445, lng: 127.0560 }, 2);
  assert.deepEqual(out.map((x) => x.rec.id), ['near', 'mid']);
  assert.ok(out[0].m < 100 && out[1].m > 500);
});
