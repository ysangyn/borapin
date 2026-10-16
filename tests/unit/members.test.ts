/**
 * 함께 쓰는 사람: 박아 둔 '보라 & 영상' 대신 실제 멤버로
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { everyoneLabel, everyoneWants, memberNames, members, setMembers, spaceTitle } from '../../src/lib/members';

test('혼자면 내 이름만, 둘이면 A & B (누가 들어와도 같은 가나다 순서)', () => {
  setMembers([{ email: 'ysangyn@gmail.com', name: '영상' }]);
  assert.equal(spaceTitle(), '영상');
  assert.deepEqual(members().map((m) => m.initial), ['영']);
  setMembers([{ email: 'ysangyn@gmail.com', name: '영상' }, { email: 'bora@naver.com', name: '보라' }]);
  assert.equal(spaceTitle(), '보라 & 영상');
  assert.deepEqual(memberNames(), ['보라', '영상']);
  assert.deepEqual(members().map((m) => m.tone), [0, 1]);
});

test('셋 이상이면 두 사람 이름과 나머지 수', () => {
  setMembers([{ email: 'a', name: '엄마' }, { email: 'b', name: '아빠' }, { email: 'c', name: '영상' }]);
  assert.equal(spaceTitle(), '아빠 · 엄마 외 1명');
  assert.equal(everyoneLabel(), '모두 원해요');
});

test('모두 원해요는 멤버가 둘 이상이고 모두 골랐을 때만', () => {
  setMembers([{ email: 'a', name: '영상' }]);
  assert.equal(everyoneWants(['영상']), false);
  setMembers([{ email: 'a', name: '영상' }, { email: 'b', name: '보라' }]);
  assert.equal(everyoneWants(['영상']), false);
  assert.equal(everyoneWants(['보라', '영상']), true);
  assert.equal(everyoneLabel(), '둘 다 원해요');
});

test('같은 이름이 두 번 들어오면 한 번만', () => {
  setMembers([{ email: 'a', name: '보라' }, { email: 'b', name: '보라' }]);
  assert.deepEqual(memberNames(), ['보라']);
});
