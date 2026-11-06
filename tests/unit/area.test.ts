import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areaOf, areasOf } from '../../src/lib/area';

test('주소에서 구·동 읽기', () => {
  assert.deepEqual(areaOf('서울 성동구 성수동2가 277-135'), { gu: '성동구', dong: '성수동' });
  assert.deepEqual(areaOf('서울특별시 마포구 연남동 227-15 1층'), { gu: '마포구', dong: '연남동' });
  assert.deepEqual(areaOf('부산 해운대구 우동 1392'), { gu: '해운대구', dong: '우동' });
  assert.deepEqual(areaOf('강원특별자치도 강릉시 구정면 현천길 7'), { gu: null, dong: '구정면' });
  assert.deepEqual(areaOf('경기 고양시 일산동구 정발산동 1234'), { gu: '일산동구', dong: '정발산동' });
  assert.deepEqual(areaOf('제주 제주시 애월읍 애월해안로 1'), { gu: null, dong: '애월읍' });
  assert.deepEqual(areaOf(''), { gu: null, dong: null });
  assert.deepEqual(areaOf('도로명만 있는 주소 123'), { gu: null, dong: null });
});

test('동네 묶음: 많은 순', () => {
  const recs = [{ address: '서울 성동구 성수동2가 1' }, { address: '서울 성동구 서울숲길 1' }, { address: '서울 마포구 연남동 1' }, { address: undefined }];
  assert.deepEqual(areasOf(recs), [{ name: '성동구', n: 2, level: 'gu' }, { name: '마포구', n: 1, level: 'gu' }]);
  // 다 한 구에 있으면 동으로
  assert.deepEqual(areasOf([{ address: '서울 성동구 성수동2가 1' }, { address: '서울 성동구 금호동1가 1' }]).map((a) => [a.name, a.level]), [['금호동', 'dong'], ['성수동', 'dong']]);
});

test('주소에서 지역 찾기', async () => {
  const { regionFromAddress } = await import('../../src/lib/area');
  const { searchPlaces } = await import('../../src/lib/geo');
  const r1 = regionFromAddress('경남 통영시 항남동 123', searchPlaces);
  assert.equal(r1 && r1.t === 'kr' ? r1.code : null, '48220');
  const r2 = regionFromAddress('서울 성동구 성수동2가 1', searchPlaces);
  assert.equal(r2 && r2.t === 'kr' ? r2.code : null, '11');
  const r3 = regionFromAddress('강원특별자치도 강릉시 구정면 1', searchPlaces);
  assert.equal(r3 && r3.t === 'kr' ? r3.code : null, '51150');
  assert.equal(regionFromAddress('어딘가 123', searchPlaces), null);
});

test('버그: 도로명만 있는 주소도 가게 자리(좌표)로 구·동을 찾는다 (고양시 옐로커피 · 동네 칩이 안 뜨던 것)', async () => {
  const { readFileSync } = await import('node:fs');
  const { decodeDong, dongAt } = await import('../../src/lib/dong');
  const { areasOf } = await import('../../src/lib/area');
  const goyang = decodeDong(JSON.parse(readFileSync('public/data/dong/41280.json', 'utf8')));
  const seoul = decodeDong(JSON.parse(readFileSync('public/data/dong/11.json', 'utf8')));
  assert.deepEqual(dongAt(goyang, 126.832, 37.6584), { gu: '덕양구', dong: '주교동' }); // 고양시청
  assert.equal(dongAt(goyang, 126.768, 37.656)?.gu, '일산동구'); // 호수공원
  assert.equal(dongAt(seoul, 127.0557, 37.5445)?.gu, '성동구'); // 성수
  assert.equal(dongAt(goyang, 127.0557, 37.5445), null); // 고양 밖
  // 칩 묶음: 좌표가 있으면 좌표가 이기고, 없으면 주소
  const recs = [
    { address: '통일로1267번길 144-30 옐로커피', lat: 37.6584, lng: 126.832 },
    { address: '경기 고양시 일산동구 정발산동 1', lat: null, lng: null },
    { address: '도로명 1', lat: 37.656, lng: 126.768 },
  ];
  assert.deepEqual(areasOf(recs, goyang), [{ name: '일산동구', n: 2, level: 'gu' }, { name: '덕양구', n: 1, level: 'gu' }]);
});
