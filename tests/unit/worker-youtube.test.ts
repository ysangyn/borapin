import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVideos, videosUrl, videoQuery } from '../../worker/src/youtube';

const res = { items: [
  { id: { kind: 'youtube#video', videoId: 'abcDEF12345' }, snippet: { title: '서산 해미읍성 &amp; 간월암 &quot;당일치기&quot;', channelTitle: '여행하는 &#39;파랑새&#39;', publishedAt: '2026-10-02T09:00:00Z', thumbnails: { medium: { url: 'https://i.ytimg.com/vi/abcDEF12345/mqdefault.jpg' }, default: { url: 'https://i.ytimg.com/vi/abcDEF12345/default.jpg' } } } },
  { id: { kind: 'youtube#channel', channelId: 'UCxxx' }, snippet: { title: '채널' } },
  { id: { kind: 'youtube#video', videoId: 'bad id!' }, snippet: { title: '이상한 번호' } },
  { id: { kind: 'youtube#video', videoId: 'zzzYYY00000' }, snippet: { title: '게국지 먹방', channelTitle: '먹보', publishedAt: '2025-01-01T00:00:00Z', thumbnails: { default: { url: 'https://i.ytimg.com/vi/zzzYYY00000/default.jpg' } } } },
] };

test('유튜브 찾기 풀이: 영상만, 글자 풀기, 썸네일은 중간 크기 먼저', () => {
  const v = parseVideos(res);
  assert.equal(v.length, 2);
  assert.deepEqual(v[0], { id: 'abcDEF12345', title: '서산 해미읍성 & 간월암 "당일치기"', channel: "여행하는 '파랑새'", at: '2026-10-02', thumb: 'https://i.ytimg.com/vi/abcDEF12345/mqdefault.jpg' });
  assert.equal(v[1].thumb, 'https://i.ytimg.com/vi/zzzYYY00000/default.jpg');
  assert.deepEqual(parseVideos(null), []);
  assert.deepEqual(parseVideos({ error: { code: 403 } }), []);
});

test('찾는 말: 이름 + 지역, 너무 길면 자르고 겹치는 지역은 한 번만', () => {
  assert.equal(videoQuery('해미읍성', '서산'), '해미읍성 서산 여행');
  assert.equal(videoQuery('서산 게국지', '서산', 'food'), '서산 게국지');
  assert.equal(videoQuery('x'.repeat(100), '').length <= 60, true);
});

test('부르는 주소: 영상만, 한국·한국어, 여섯 개', () => {
  const u = new URL(videosUrl('KEY', '해미읍성 서산 여행'));
  assert.equal(u.origin + u.pathname, 'https://www.googleapis.com/youtube/v3/search');
  assert.equal(u.searchParams.get('type'), 'video');
  assert.equal(u.searchParams.get('regionCode'), 'KR');
  assert.equal(u.searchParams.get('relevanceLanguage'), 'ko');
  assert.equal(u.searchParams.get('maxResults'), '6');
  assert.equal(u.searchParams.get('safeSearch'), 'strict');
  assert.equal(u.searchParams.get('key'), 'KEY');
});
