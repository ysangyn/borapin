import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowedUrl, coordsFromUrl, kakaoPlaceId, naverPlaceId, parseKakaoHtml, parseNaverHtml } from '../../worker/src/placeInfo';

test('지도 링크: 네이버·카카오만 따라가고 그 밖은 열지 않는다', () => {
  assert.ok(allowedUrl('https://naver.me/GlVmYk5l'));
  assert.ok(allowedUrl('http://map.naver.com/p/entry/place/1234567'));
  assert.ok(allowedUrl('https://place.map.kakao.com/12345'));
  assert.equal(allowedUrl('https://evil.example/naver.me'), null);
  assert.equal(allowedUrl('https://naver.me.evil.com/x'), null);
  assert.equal(allowedUrl('file:///etc/passwd'), null);
  assert.equal(allowedUrl('http://169.254.169.254/'), null);
});

test('장소 번호와 좌표 뽑기', () => {
  assert.equal(naverPlaceId('https://map.naver.com/p/entry/place/1234567?c=15.00,0,0,0,dh'), '1234567');
  assert.equal(naverPlaceId('https://m.place.naver.com/restaurant/37816171/home'), '37816171');
  assert.equal(naverPlaceId('https://map.naver.com/p/search/칠곡'), null);
  assert.equal(kakaoPlaceId('https://place.map.kakao.com/m/26338954'), '26338954');
  assert.deepEqual(coordsFromUrl('https://map.naver.com/p?lng=128.5&lat=35.9'), { lat: 35.9, lng: 128.5 });
  assert.deepEqual(coordsFromUrl('https://map.naver.com/v5/entry/place/1?c=128.51,35.98,15,0,0,0,dh'), { lat: 35.98, lng: 128.51 });
  assert.equal(coordsFromUrl('https://map.naver.com/p/entry/place/1?c=15.00,0,0,0,dh'), null);
});

test('네이버 장소 페이지에서 이름·사진·주소·종류·좌표', () => {
  const html = `<html><head><meta property="og:title" content="슈츠 : 네이버"><meta property="og:image" content="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb.jpg&amp;type=f"></head>
  <script>window.__APOLLO_STATE__={"PlaceDetailBase:1":{"name":"슈츠","category":"카페,디저트","roadAddress":"경북 칠곡군 동명면 남원로3길 14","x":"128.5791","y":"35.9912"}}</script></html>`;
  const p = parseNaverHtml(html);
  assert.equal(p.name, '슈츠');
  assert.equal(p.image, 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb.jpg&type=f');
  assert.equal(p.address, '경북 칠곡군 동명면 남원로3길 14');
  assert.equal(p.category, '카페,디저트');
  assert.equal(p.lat, 35.9912);
  assert.equal(p.lng, 128.5791);
  // 기본 그림(로고)은 사진으로 치지 않는다
  assert.equal(parseNaverHtml('<meta property="og:image" content="https://ssl.pstatic.net/static/www/mobile/naver_logo.png">').image, undefined);
});

test('카카오 장소 페이지(og)', () => {
  const p = parseKakaoHtml('<meta property="og:title" content="슈츠 | 카카오맵"><meta property="og:image" content="https://img1.kakaocdn.net/cthumb/local/x.jpg"><meta property="og:description" content="경북 칠곡군 동명면 남원로3길 14">');
  assert.equal(p.name, '슈츠');
  assert.ok(p.image?.startsWith('https://img1.kakaocdn.net'));
  assert.equal(p.address, '경북 칠곡군 동명면 남원로3길 14');
});

test('업종 → 종류, 지도 앱 주소', async () => {
  const { kindFromCategory, mapApps } = await import('../../src/lib/placeApps');
  assert.equal(kindFromCategory('카페,디저트'), 'cafe');
  assert.equal(kindFromCategory('한식>국밥'), 'food');
  assert.equal(kindFromCategory('펜션'), 'stay');
  assert.equal(kindFromCategory('박물관'), 'sight');
  assert.equal(kindFromCategory(''), null);
  const a = mapApps('슈츠', '칠곡군', 35.99, 128.57);
  assert.equal(a.kakao, 'https://map.kakao.com/link/map/%EC%8A%88%EC%B8%A0,35.99,128.57');
  assert.ok(a.route?.includes('/link/to/'));
  assert.equal(mapApps('슈츠', '칠곡군').route, null);
});
