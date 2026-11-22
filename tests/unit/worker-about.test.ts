import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aboutTitles, parseWikiSummary, splitNames, tourImages } from '../../worker/src/aboutParse';

test('이름 가르기: "서산 게국지/어리굴젓" → 두 가지, 지역 이름은 떼어 본 것도 함께', () => {
  assert.deepEqual(splitNames('서산 게국지/어리굴젓'), ['서산 게국지', '어리굴젓']);
  assert.deepEqual(aboutTitles('서산 게국지', '서산시'), ['서산 게국지', '게국지']);
  assert.deepEqual(aboutTitles('해미읍성', '서산시'), ['해미읍성']);
  assert.deepEqual(aboutTitles('서산마애삼존불상', '서산시'), ['서산마애삼존불상', '서산 마애삼존불상']);
  assert.deepEqual(aboutTitles('밀국낙지탕 (박속낙지탕)', '서산시'), ['밀국낙지탕', '박속낙지탕']);
});

test('위키백과 요약: 소개·사진·주소. 동음이의 문서와 내용 없는 문서는 버린다', () => {
  const ok = parseWikiSummary({
    type: 'standard', title: '게국지', extract: '게국지는 충청남도 서산·태안 지방의 향토 음식이다. 게장 국물에 배추를 넣어 끓인다.',
    thumbnail: { source: 'http://upload.wikimedia.org/a.jpg' }, content_urls: { mobile: { page: 'https://ko.m.wikipedia.org/wiki/게국지' } },
  });
  assert.equal(ok?.title, '게국지');
  assert.equal(ok!.short, '게국지는 충청남도 서산·태안 지방의 향토 음식이다. 게장 국물에 배추를 넣어 끓인다.');
  assert.equal(ok?.img, 'https://upload.wikimedia.org/a.jpg');
  assert.equal(ok?.url, 'https://ko.m.wikipedia.org/wiki/게국지');
  assert.equal(parseWikiSummary({ type: 'disambiguation', title: 'x', extract: 'x는 다음을 가리킨다.' }), null);
  assert.equal(parseWikiSummary({ type: 'standard', title: 'x', extract: '' }), null);
  assert.equal(parseWikiSummary(null), null);
});

test('관광공사 사진 여러 장: https로, 같은 사진은 한 번, 8장까지', () => {
  const j = { response: { body: { items: { item: [
    { originimgurl: 'http://tong.visitkorea.or.kr/1.jpg', smallimageurl: 'http://tong.visitkorea.or.kr/1s.jpg' },
    { originimgurl: 'http://tong.visitkorea.or.kr/1.jpg' },
    ...Array.from({ length: 10 }, (_, i) => ({ originimgurl: `http://tong.visitkorea.or.kr/${i + 2}.jpg` })),
  ] } } } };
  const imgs = tourImages(j);
  assert.equal(imgs.length, 8);
  assert.equal(imgs[0], 'https://tong.visitkorea.or.kr/1.jpg');
  assert.equal(new Set(imgs).size, imgs.length);
  assert.deepEqual(tourImages({}), []);
});
