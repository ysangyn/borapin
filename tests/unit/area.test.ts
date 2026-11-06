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
  assert.deepEqual(areasOf(recs), [{ name: '성동구', n: 2 }, { name: '마포구', n: 1 }]);
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
