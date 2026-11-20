import { test } from 'node:test';
import assert from 'node:assert/strict';
import { legacyMemberDoc, memberSignature, profileSeed } from '../../src/lib/membership';

const who = { uid: 'u1', email: 'Bora@Example.com' };

test('옛 목록의 사람을 구성원 문서로: 역할은 옛 관리자 목록을 따른다', () => {
  assert.deepEqual(legacyMemberDoc(who, { name: '보라', isAdmin: false, relation: 'spouse' }),
    { uid: 'u1', email: 'bora@example.com', role: 'member', name: '보라', relation: 'spouse', via: 'legacy', v: 1 });
  assert.equal(legacyMemberDoc(who, { name: '영상', isAdmin: true }).role, 'admin');
});

test('관계가 없으면 칸을 만들지 않고, 이름은 20자까지·비면 "나"', () => {
  const d = legacyMemberDoc(who, { name: '', isAdmin: false });
  assert.equal('relation' in d, false);
  assert.equal(d.name, '나');
  assert.equal(legacyMemberDoc(who, { name: '가'.repeat(30), isAdmin: false }).name.length, 20);
});

test('바뀐 게 없으면 다시 쓰지 않게: 같은 내용은 같은 표시, 이름·역할이 바뀌면 다른 표시', () => {
  const a = legacyMemberDoc(who, { name: '보라', isAdmin: false });
  assert.equal(memberSignature(a), memberSignature(legacyMemberDoc(who, { name: '보라', isAdmin: false })));
  assert.notEqual(memberSignature(a), memberSignature(legacyMemberDoc(who, { name: '보라', isAdmin: true })));
  assert.notEqual(memberSignature(a), memberSignature(legacyMemberDoc(who, { name: '보라보라', isAdmin: false })));
});

test('별명 문서의 처음 값: 별명은 10자까지, 메일은 넣지 않는다', () => {
  const p = profileSeed('가나다라마바사아자차카타', 'main');
  assert.deepEqual(p, { nick: '가나다라마바사아자차', spaceId: 'main', v: 1 });
  assert.equal(profileSeed('', 'main').nick, '나');
});
