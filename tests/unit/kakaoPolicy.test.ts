import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pickFromItem } from '../../src/lib/herePick';
import { matchStore, type Store } from '../../src/lib/storeMatch';
import type { NearbyItem } from '../../src/lib/nearby';

/*
 * 카카오 데브톡 답변 (2026-11-23, docs/kakao-devtalk-question.md):
 *  1. 카카오 응답의 장소명·좌표를 공공데이터 조회 조건으로 쓰면 안 된다 (요청 중에만 써도 같다).
 *     → 상가정보는 '내 폰 위치'(독립적으로 얻은 조건)로 먼저 받고, 카카오 응답은 같은 곳인지 비교에만.
 *  4. 출처는 '카카오맵 오픈 API'.
 */
const worker = readFileSync('worker/src/index.ts', 'utf8');
const nearby = readFileSync('src/lib/nearby.ts', 'utf8');
const herePage = readFileSync('src/pages/HerePage.tsx', 'utf8');

test('뒷단에 카카오 이름·좌표로 상가정보를 찾는 길(/match)이 없다', () => {
  assert.ok(!/pathname === '\/match'/.test(worker), '/match 길이 남아 있다');
});

test('상가정보는 내 폰 위치만으로 받는다 (/stores?lat&lng, 이름 없음)', () => {
  assert.match(nearby, /\/stores\?lat=\$\{[^}]+\}&lng=\$\{[^}]+\}`/);
  assert.ok(!/fetchStoreMatch/.test(nearby), '카카오 이름을 보내는 fetchStoreMatch가 남아 있다');
});

test('지금 여기: 상가정보를 카카오 목록보다 먼저 부른다', () => {
  const a = herePage.indexOf('fetchStores('), b = herePage.indexOf('fetchShops(');
  assert.ok(a > 0 && b > 0 && a < b, '상가정보 조회가 카카오 목록보다 앞서야 한다');
});

test("출처 표기는 '카카오맵 오픈 API'", () => {
  assert.ok(!/카카오맵 장소 정보/.test(herePage));
  assert.match(herePage, /카카오맵 오픈 API/);
  assert.ok(!/카카오맵 장소 정보/.test(readFileSync('src/pages/Legal.tsx', 'utf8')));
});

const stores: Store[] = [
  { id: 'S1', name: '정성당', addr: '강릉시 경강로 1', lat: 37.7001, lng: 128.9002 },
  { id: 'S2', name: '테라로사 초당점', lat: 37.7003, lng: 128.9009 },
];
const kakao: NearbyItem = { id: 'k123', name: '정성당 제과', type: '제과', kind: 'food', lat: 37.7, lng: 128.9, dist: 30 } as NearbyItem;

test('카카오에서 고른 곳은 폰 안에서 비교만: 맞으면 상가정보 값, 카카오 번호만 남김', () => {
  const p = pickFromItem(kakao, { lat: 37.7, lng: 128.9 }, matchStore(kakao.name, kakao.lat, kakao.lng, stores), false);
  assert.equal(p.name, '정성당');
  assert.equal(p.addr, '강릉시 경강로 1');
  assert.deepEqual(p.pos, { lat: 37.7001, lng: 128.9002 });
  assert.deepEqual(p.ref, { src: 'kakao', id: '123' });
});

test('못 맞추면 이름은 비우고 자리는 내 폰 위치 (카카오 이름·좌표는 남기지 않음)', () => {
  const me = { lat: 37.71, lng: 128.91 };
  const p = pickFromItem({ ...kakao, name: '없는가게' }, me, matchStore('없는가게', kakao.lat, kakao.lng, stores), false);
  assert.equal(p.name, '');
  assert.deepEqual(p.pos, me);
  assert.equal(p.addr, undefined);
});
