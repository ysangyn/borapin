import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hideReview } from '../../src/lib/blind';

test('가리고 쓰기: 내 한 줄 평이 비어 있을 때만 상대 것을 가린다', () => {
  const r = { 보라: '아침으로 최고', 영상: '' };
  assert.equal(hideReview(r, '보라', '영상', true), true);
  assert.equal(hideReview(r, '영상', '영상', true), false);
  assert.equal(hideReview({ ...r, 영상: '순두부 완벽' }, '보라', '영상', true), false);
  assert.equal(hideReview(r, '보라', '영상', false), false);
  assert.equal(hideReview(r, '보라', '', true), false);
});
