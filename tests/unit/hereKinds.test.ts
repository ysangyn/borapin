import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guessKind } from '../../src/lib/hereKinds';
import { KINDS } from '../../src/lib/placeRecs';
import { TAG_SUGGEST } from '../../src/lib/placeMaps';

test('지금 여기 종류 짐작: 담기 화면과 같은 종류·꼬리표로 (이름이 먼저, 그다음 근처 목록 종류, 둘 다 없으면 맛집)', () => {
  assert.deepEqual(guessKind('성심당 베이커리', 'food'), { kind: 'food', tag: '빵집' });
  assert.deepEqual(guessKind('테라로사 커피공장', null), { kind: 'cafe', tag: '' });
  assert.deepEqual(guessKind('을지로 노가리 포차', null), { kind: 'food', tag: '술집' });
  assert.deepEqual(guessKind('오죽헌', 'sight'), { kind: 'sight', tag: '' });
  assert.deepEqual(guessKind('경포 소품샵', 'shop'), { kind: 'shop', tag: '소품샵' });
  assert.deepEqual(guessKind('경포 한옥스테이', 'stay'), { kind: 'stay', tag: '' });
  assert.deepEqual(guessKind('초당할머니순두부', null), { kind: 'food', tag: '' });
});

test('카카오 분류 이름도 함께 보면 이름에 티가 안 나는 가게도 맞힌다', () => {
  assert.deepEqual(guessKind('정성당 제과,베이커리', 'food'), { kind: 'food', tag: '빵집' });
  assert.deepEqual(guessKind('달빛 호프,요리주점', 'food'), { kind: 'food', tag: '술집' });
  assert.deepEqual(guessKind('블루보틀 커피전문점', 'cafe'), { kind: 'cafe', tag: '' });
  assert.deepEqual(guessKind('아침식탁 브런치카페', null), { kind: 'food', tag: '브런치' });
});

test('짐작한 종류·꼬리표는 늘 담기 화면에 있는 것', () => {
  const kinds = new Set(KINDS.map((k) => k.k));
  for (const n of ['성심당 베이커리', '노가리 포차', '소품샵', '브런치', '커피', '순두부']) {
    const g = guessKind(n, null);
    assert.ok(kinds.has(g.kind));
    assert.ok(g.tag === '' || TAG_SUGGEST[g.kind].includes(g.tag), `${n} → ${g.kind}/${g.tag}`);
  }
});
