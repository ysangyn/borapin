import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessFromMembers, newSpaceId, spaceKey } from '../../src/lib/spaceAccess';
import { profileDocUrl, spaceMemberUrl, spaceOfProfile } from '../../worker/src/guard';

const m = (uid: string, email: string, role: 'admin' | 'member', name: string, relation?: string) => ({ uid, email, role, name, via: 'code12345', v: 1 as const, ...(relation ? { relation } : {}) });

test('다른 공간의 구성원 문서들 → 화면이 쓰는 함께 쓰는 사람 목록 (관리자 먼저, 이름·관계·uid)', () => {
  const a = accessFromMembers([m('u2', 'Dave@Example.com', 'member', '데이브', 'spouse'), m('u1', 'carol@example.com', 'admin', '캐롤')]);
  assert.deepEqual(a.allowed, ['carol@example.com', 'dave@example.com']);
  assert.deepEqual(a.admins, ['carol@example.com']);
  assert.deepEqual(a.names, { 'carol@example.com': '캐롤', 'dave@example.com': '데이브' });
  assert.deepEqual(a.relations, { 'dave@example.com': 'spouse' });
  assert.deepEqual(a.uids, { 'carol@example.com': 'u1', 'dave@example.com': 'u2' });
});

test('폰 저장 열쇠: 우리 공간은 예전 그대로, 다른 공간은 공간 이름표를 붙인다', () => {
  assert.equal(spaceKey('borapin:feed-seen', 'main'), 'borapin:feed-seen');
  assert.equal(spaceKey('borapin:feed-seen', 'AbC0123456789xyzABCD'), 'borapin:feed-seen@AbC0123456789xyzABCD');
});

test('새 공간 이름표: 영문·숫자 20자 (규칙과 같은 모양), 매번 다르다', () => {
  const a = newSpaceId();
  assert.match(a, /^[A-Za-z0-9]{20}$/);
  assert.notEqual(a, newSpaceId());
});

test('뒷단: 우리 공간이 아니면 별명 문서가 가리키는 공간의 내 구성원 문서로 확인한다', () => {
  assert.equal(profileDocUrl('borapin', 'u1'), 'https://firestore.googleapis.com/v1/projects/borapin/databases/(default)/documents/profiles/u1?mask.fieldPaths=spaceId');
  assert.equal(spaceMemberUrl('borapin', 'AbC0123456789xyzABCD', 'u1'), 'https://firestore.googleapis.com/v1/projects/borapin/databases/(default)/documents/spaces/AbC0123456789xyzABCD/members/u1?mask.fieldPaths=role');
  assert.equal(spaceOfProfile({ fields: { spaceId: { stringValue: 'AbC0123456789xyzABCD' } } }), 'AbC0123456789xyzABCD');
  // 우리 공간·이상한 값·없는 값은 다시 볼 것이 없다
  assert.equal(spaceOfProfile({ fields: { spaceId: { stringValue: 'main' } } }), null);
  assert.equal(spaceOfProfile({ fields: { spaceId: { stringValue: '../config/access' } } }), null);
  assert.equal(spaceOfProfile({}), null);
  assert.equal(spaceOfProfile(null), null);
});
