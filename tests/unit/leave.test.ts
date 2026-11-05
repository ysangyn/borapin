import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leaveFreely, shouldAskLeave } from '../../src/lib/leave';

test('폰 뒤로 가기(POP)에서만, 쓰던 게 있을 때만 묻는다', () => {
  assert.equal(shouldAskLeave(true, 'POP', Date.now() + 5000), true);
  assert.equal(shouldAskLeave(false, 'POP', Date.now() + 5000), false);
  assert.equal(shouldAskLeave(true, 'PUSH', Date.now() + 5000), false);
  assert.equal(shouldAskLeave(true, 'REPLACE', Date.now() + 5000), false);
});

test('앱이 스스로 뒤로 갈 때(저장 뒤·뒤로 단추)는 잠깐 묻지 않는다', () => {
  leaveFreely();
  assert.equal(shouldAskLeave(true, 'POP'), false);
  assert.equal(shouldAskLeave(true, 'POP', Date.now() + 2000), true);
});
