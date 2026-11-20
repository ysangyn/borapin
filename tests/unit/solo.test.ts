import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setMembers } from '../../src/lib/members';
import { isSolo, soloText, spaceWord } from '../../src/lib/solo';

test('혼자 쓰는 공간: 구성원이 한 명일 때만 혼자 말투', () => {
  setMembers([{ email: 'a@x.com', name: '파랑새' }]);
  assert.equal(isSolo(), true);
  assert.equal(spaceWord(), '내 공간');
  assert.equal(soloText('둘의 한 줄 평', '한 줄 평'), '한 줄 평');
  setMembers([{ email: 'a@x.com', name: '파랑새' }, { email: 'b@x.com', name: '제부' }]);
  assert.equal(isSolo(), false);
  assert.equal(spaceWord(), '우리 공간');
  // 이름이 아직 안 실렸을 때(빈 목록)는 둘 이상으로 본다
  setMembers([]);
  assert.equal(isSolo(), false);
});
