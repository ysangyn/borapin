import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickFromItem } from '../../src/lib/herePick';
import type { NearbyItem } from '../../src/lib/nearby';

// 카카오 정책 (데브톡 답변): 로컬 API의 장소명·주소·좌표는 저장해 다시 쓸 수 없고, 장소 ID·링크는 저장해도 된다
const kakao: NearbyItem = { id: 'k12345', name: '정성당 제과', kind: 'food', type: '제과,베이커리', dist: 40, walk: 1, lat: 37.7, lng: 128.9, addr: '강원 강릉시 어딘가 1' };
const tour: NearbyItem = { id: 't999', name: '오죽헌', kind: 'sight', type: '관광지', dist: 300, walk: 4, lat: 37.78, lng: 128.88, addr: '강원 강릉시 율곡로 3139' };
const me = { lat: 37.70012, lng: 128.90034 };

test('카카오에서 고른 곳: 카카오 주소·좌표는 남기지 않고, 내 폰 위치와 카카오 장소 번호만', () => {
  const p = pickFromItem(kakao, me, null, true);
  assert.deepEqual(p.pos, me);
  assert.equal(p.addr, undefined);
  assert.deepEqual(p.ref, { src: 'kakao', id: '12345' });
  assert.equal(p.kind, 'food');
  assert.equal(p.tag, '빵집');
});

test('카카오에서 고른 곳: 상가정보와 맞으면 이름·주소·자리는 상가정보 값으로', () => {
  const p = pickFromItem(kakao, me, { id: 'MA0101', name: '정성당', addr: '강원특별자치도 강릉시 어딘가 1', lat: 37.7001, lng: 128.9002 }, true);
  assert.equal(p.name, '정성당');
  assert.equal(p.addr, '강원특별자치도 강릉시 어딘가 1');
  assert.deepEqual(p.pos, { lat: 37.7001, lng: 128.9002 });
  assert.deepEqual(p.ref, { src: 'kakao', id: '12345' });
});

test('카카오에서 고른 곳: 상가정보와 안 맞고 카카오 이름을 못 쓰게 하면 이름 칸은 비운다 (사용자가 직접 적기)', () => {
  assert.equal(pickFromItem(kakao, me, null, false).name, '');
  // 위치를 못 받았으면 자리도 비운다 (카카오 좌표로 채우지 않는다)
  assert.equal(pickFromItem(kakao, null, null, true).pos, null);
});

test('관광공사 목록(공공데이터)은 그대로 남겨도 된다', () => {
  const p = pickFromItem(tour, me, null, false);
  assert.equal(p.name, '오죽헌');
  assert.equal(p.addr, '강원 강릉시 율곡로 3139');
  assert.deepEqual(p.pos, { lat: 37.78, lng: 128.88 });
  assert.equal(p.ref, null);
});
