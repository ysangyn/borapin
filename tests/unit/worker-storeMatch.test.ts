import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStores, storeUrl } from '../../worker/src/storeMatch';
// 같은 가게 비교는 폰 안에서 (카카오 값은 조회 조건으로 쓰지 않는다 — 데브톡 답변 11-23)
import { matchStore } from '../../src/lib/storeMatch';

// 소상공인시장진흥공단 상가(상권)정보 storeListInRadius 응답 모양 (body.items)
const page = { header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' }, body: { totalCount: 4, items: [
  { bizesId: 'MA010120220800000001', bizesNm: '정성당', brchNm: '', rdnmAdr: '강원특별자치도 강릉시 경강로 1', lnoAdr: '강원특별자치도 강릉시 임당동 1', lon: '128.90020', lat: '37.70010' },
  { bizesId: 'MA010120220800000002', bizesNm: '테라로사', brchNm: '초당점', rdnmAdr: '강원특별자치도 강릉시 초당길 1', lnoAdr: '', lon: '128.90090', lat: '37.70030' },
  { bizesId: 'MA010120220800000003', bizesNm: '정성식당', brchNm: '', rdnmAdr: '', lnoAdr: '강원특별자치도 강릉시 임당동 9', lon: '128.90300', lat: '37.70200' },
  { bizesId: '', bizesNm: '번호 없는 가게', lon: '128.9', lat: '37.7' },
] } };

test('상가정보 응답 풀이: 지점명은 붙이고, 번호·좌표 없는 줄은 버린다', () => {
  const s = parseStores(page);
  assert.equal(s.length, 3);
  assert.equal(s[1].name, '테라로사 초당점');
  assert.equal(s[0].addr, '강원특별자치도 강릉시 경강로 1');
  assert.equal(s[2].addr, '강원특별자치도 강릉시 임당동 9');
  assert.deepEqual([s[0].lat, s[0].lng], [37.7001, 128.9002]);
});

test('활용 신청 전이거나 오류면 빈 목록', () => {
  assert.deepEqual(parseStores({ header: { resultCode: '30', resultMsg: 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR' } }), []);
  assert.deepEqual(parseStores(null), []);
  assert.deepEqual(parseStores('<OpenAPI_ServiceResponse>…'), []);
});

test('같은 가게 찾기: 이름이 비슷하고 가까운 곳 (제과·본점·띄어쓰기는 무시)', () => {
  const s = parseStores(page);
  assert.equal(matchStore('정성당 제과', 37.7, 128.9, s)?.id, 'MA010120220800000001');
  assert.equal(matchStore('테라로사 초당점', 37.7003, 128.9009, s)?.name, '테라로사 초당점');
  assert.equal(matchStore('테라로사커피 초당', 37.7003, 128.9009, s)?.name, '테라로사 초당점');
});

test('이름이 달라도, 이름이 같아도 너무 멀면 다른 가게로 본다', () => {
  const s = parseStores(page);
  assert.equal(matchStore('스타벅스 강릉점', 37.7, 128.9, s), null);
  // 정성식당은 이름 앞이 같지만 300m 가까이 떨어져 있다
  assert.equal(matchStore('정성식당', 37.7, 128.9, s), null);
});

test('부르는 주소: 기본 반경 100m, json, 키는 그대로', () => {
  const u = new URL(storeUrl('K+EY/=', 37.123456789, 127.98765432));
  assert.equal(u.origin + u.pathname, 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius');
  assert.equal(u.searchParams.get('serviceKey'), 'K+EY/=');
  assert.equal(u.searchParams.get('radius'), '100');
  assert.equal(u.searchParams.get('cx'), '127.987654');
  assert.equal(u.searchParams.get('cy'), '37.123457');
  assert.equal(u.searchParams.get('type'), 'json');
});

test('지금 여기는 폰 위치 둘레 150m로 부른다', () => {
  assert.equal(new URL(storeUrl('K', 37.5, 127)).searchParams.get('radius'), '100');
  assert.equal(new URL(storeUrl('K', 37.5, 127, 150)).searchParams.get('radius'), '150');
});
