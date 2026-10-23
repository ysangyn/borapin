/**
 * F12 불러오기 실패: 기록 구독이 실패하면 '다시 시도' 화면이 나와야 하고,
 * 오프라인 첫 실행에서 초대 목록(config/access)이 캐시에 없을 때는 '초대되지 않은 계정'이 아니라 '연결을 기다리는 중'이어야 한다.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lib } from './libLoader';

const store: typeof import('../../src/lib/store') = await lib('store.tsx');
const auth: typeof import('../../src/lib/auth') = await lib('auth.tsx');

// ---------- 기록 구독 실패 → store가 '실패'를 말한다 ----------
test('셋 다 아직 없고 오류도 없으면 불러오는 중', () => {
  assert.equal(store.storeState({ trips: null, wishes: null, places: null, error: null }), 'loading');
});
test('구독이 실패해 기록이 하나도 안 왔으면 실패 (화면은 영원히 불러오는 중 대신 다시 시도)', () => {
  assert.equal(store.storeState({ trips: null, wishes: null, places: null, error: '기록을 불러오지 못했어요.' }), 'failed');
  assert.equal(store.storeState({ trips: [], wishes: null, places: [], error: '기록을 불러오지 못했어요.' }), 'failed');
});
test('기록이 이미 와 있는데 나중에 오류가 나면 화면은 그대로 두고 띠만 (ready)', () => {
  assert.equal(store.storeState({ trips: [], wishes: [], places: [], error: '인터넷 연결이 불안정해요.' }), 'ready');
  assert.equal(store.storeState({ trips: [], wishes: [], places: [], error: null }), 'ready');
});

// ---------- 초대 목록 스냅샷 판정 ----------
const me = 'bora@example.com';
test('초대 목록이 있고 내 메일이 들어 있으면 들어간다, 없으면 막는다', () => {
  assert.equal(auth.accessVerdict({ exists: true, fromCache: false, allowed: [me] }, me), 'ready');
  assert.equal(auth.accessVerdict({ exists: true, fromCache: true, allowed: [me] }, me), 'ready');
  assert.equal(auth.accessVerdict({ exists: true, fromCache: false, allowed: ['other@example.com'] }, me), 'denied');
  assert.equal(auth.accessVerdict({ exists: true, fromCache: true, allowed: ['other@example.com'] }, me), 'denied');
});
test('문서가 없다고 서버가 말하면 막지만, 캐시에서 온 "없음"(오프라인 첫 실행)은 연결을 기다린다', () => {
  assert.equal(auth.accessVerdict({ exists: false, fromCache: false, allowed: [] }, me), 'denied');
  assert.equal(auth.accessVerdict({ exists: false, fromCache: true, allowed: [] }, me), 'waiting');
});
test('주인 계정은 목록이 아직 없어도 들어간다 (처음 설정을 만들어야 하니)', () => {
  assert.equal(auth.accessVerdict({ exists: false, fromCache: false, allowed: [] }, 'ysangyn@gmail.com'), 'ready');
  assert.equal(auth.accessVerdict({ exists: false, fromCache: true, allowed: [] }, 'YSANGYN@gmail.com'), 'ready');
});
