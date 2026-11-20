import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refFromNearbyId, refFromNaverUrl, placeKey } from '../../src/lib/placeRef';

test('카카오 근처 목록의 id(k + 번호)에서 가게 번호를 얻는다', () => {
  assert.deepEqual(refFromNearbyId('k12345678'), { src: 'kakao', id: '12345678' });
  assert.equal(refFromNearbyId('t555'), null); // 관광공사 항목은 가게 번호가 아니다
  assert.equal(refFromNearbyId(''), null);
});

test('네이버 지도 주소에서 장소 번호를 얻는다', () => {
  assert.deepEqual(refFromNaverUrl('https://map.naver.com/p/entry/place/1234567890?c=15.00'), { src: 'naver', id: '1234567890' });
  assert.deepEqual(refFromNaverUrl('https://m.place.naver.com/restaurant/1234567890/home'), { src: 'naver', id: '1234567890' });
  assert.deepEqual(refFromNaverUrl('https://pcmap.place.naver.com/place/98765/home'), { src: 'naver', id: '98765' });
  assert.equal(refFromNaverUrl('https://naver.me/abcDEF'), null); // 줄인 주소는 열어 봐야 알 수 있다
  assert.equal(refFromNaverUrl(undefined), null);
});

test('같은 가게를 묶는 열쇠: 저장된 번호가 먼저, 없으면 네이버 주소에서, 손으로 적은 가게는 없음', () => {
  assert.equal(placeKey({ ref: { src: 'kakao', id: '123' } }), 'k123');
  assert.equal(placeKey({ naverUrl: 'https://map.naver.com/p/entry/place/777' }), 'n777');
  assert.equal(placeKey({ ref: { src: 'naver', id: '9' }, naverUrl: 'https://map.naver.com/p/entry/place/777' }), 'n9');
  assert.equal(placeKey({}), null);
});
