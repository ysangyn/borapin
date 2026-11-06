import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candidates, guessKind } from '../../src/lib/recordStops';
import type { PlaceRec, Wish } from '../../src/lib/types';

const G = { t: 'kr', code: '51150' } as const;
const wish = { id: 'w', place: G, spots: ['경포대', '테라로사'], foods: ['초당순두부', '툇마루 카페'], todos: [] } as unknown as Wish;

test('이름으로 종류 짐작', () => {
  assert.equal(guessKind('초당순두부', wish), 'food');
  assert.equal(guessKind('툇마루 카페', wish), 'cafe');
  assert.equal(guessKind('경포대', wish), 'sight');
  assert.equal(guessKind('보헤미안 커피', null), 'cafe');
  assert.equal(guessKind('안동찜닭 골목 식당', null), 'food');
  assert.equal(guessKind('월영교', null), 'sight');
});

test('체크 후보: 가고 싶어요 가게 먼저, 글 줄은 가게로 이미 있으면 뺀다', () => {
  const recs = [
    { id: 'a', name: '버드나무 브루어리', kind: 'food', region: G, status: 'want', reviews: {}, verdict: null, v: 1 },
    { id: 'b', name: '테라로사 커피공장', kind: 'cafe', region: G, reviews: {}, verdict: 'again', v: 1 },
  ] as PlaceRec[];
  const c = candidates([G], recs, [wish]);
  assert.deepEqual(c.map((x) => [x.k, x.name, x.kind]), [
    ['want', '버드나무 브루어리', 'food'],
    ['line', '경포대', 'sight'],
    ['line', '초당순두부', 'food'],
    ['line', '툇마루 카페', 'cafe'],
  ]);
  assert.deepEqual(candidates([{ t: 'kr', code: '26' }], recs, [wish]), []);
});
