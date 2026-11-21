import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reviewUrl, spotCards, videoUrl } from '../../src/lib/explore';

test('볼거리 카드: 보라핀이 고른 이름 먼저, 관광공사 사진이 같은 곳이면 사진을 빌린다, 나머지 관광공사 곳은 사진 있는 것만 뒤에', () => {
  const tour: [string, number, number, string][] = [
    ['서산 해미읍성', 36.71, 126.55, 'https://t/haemi.jpg'],
    ['모월저수지', 36.8, 126.4, 'https://t/mowol.jpg'],
    ['사진없는곳', 36.8, 126.4, ''],
  ];
  const c = spotCards(['서산마애삼존불상', '해미읍성'], tour);
  assert.deepEqual(c.map((x) => x.name), ['서산마애삼존불상', '해미읍성', '모월저수지']);
  assert.equal(c[0].img, undefined);
  assert.equal(c[1].img, 'https://t/haemi.jpg');
  assert.equal(c[1].from, 'info');
  assert.equal(c[2].from, 'tour');
});

test('후기·영상 검색 주소', () => {
  assert.equal(reviewUrl('서산시', '게국지'), 'https://search.naver.com/search.naver?where=blog&query=' + encodeURIComponent('서산시 게국지 후기'));
  assert.match(videoUrl('서산시', '간월암'), /^https:\/\/www\.youtube\.com\/results\?search_query=/);
});
