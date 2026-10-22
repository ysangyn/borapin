/**
 * 새 버전 자동 새로 고침이 쓰던 글을 날리지 않게: 언제 새로 고칠지 판단 (src/lib/updateGate.ts)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDLE_MS, isTextField, shouldApplyUpdate, type GateState } from '../../src/lib/updateGate';

const idle: GateState = { busy: 0, typing: false, idleMs: IDLE_MS + 1 };

test('아무것도 안 하고 있으면(작업 없음·커서 없음·손 뗀 지 좀 됨) 새 버전이 오자마자 받는다 — 옛 버전이 남지 않게', () => {
  assert.equal(shouldApplyUpdate(idle, 'arrived'), true);
  assert.equal(shouldApplyUpdate({ ...idle, idleMs: Infinity }, 'arrived'), true);
});

test('글·답을 쓰는 중이거나 사진을 올리는 중(작업 중)이면 새 버전이 와도 바로 새로 고치지 않는다', () => {
  assert.equal(shouldApplyUpdate({ ...idle, busy: 1 }, 'arrived'), false);
  assert.equal(shouldApplyUpdate({ ...idle, busy: 2 }, 'arrived'), false);
});

test('입력칸에 커서가 있으면 미룬다 (작업으로 세지 않은 칸이라도)', () => {
  assert.equal(shouldApplyUpdate({ ...idle, typing: true }, 'arrived'), false);
  assert.equal(shouldApplyUpdate({ ...idle, typing: true }, 'route'), false);
  assert.equal(shouldApplyUpdate({ ...idle, typing: true }, 'visible'), false);
});

test('막 도착했을 때 손을 대고 있으면(누르는 중) 바로 바꾸지 않고 다음 기회를 기다린다', () => {
  assert.equal(shouldApplyUpdate({ ...idle, idleMs: 0 }, 'arrived'), false);
  assert.equal(shouldApplyUpdate({ ...idle, idleMs: IDLE_MS - 1 }, 'arrived'), false);
  assert.equal(shouldApplyUpdate({ ...idle, idleMs: IDLE_MS }, 'arrived'), true);
});

test('다음 화면으로 넘어갈 때·숨겼다가 돌아올 때: 작업 중이 아니면 받고, 작업 중이면 또 기다린다', () => {
  assert.equal(shouldApplyUpdate({ ...idle, idleMs: 0 }, 'route'), true); // 방금 눌러서 넘어온 것이니 손을 뗀 지는 안 본다
  assert.equal(shouldApplyUpdate({ ...idle, idleMs: 0 }, 'visible'), true);
  assert.equal(shouldApplyUpdate({ ...idle, busy: 1 }, 'route'), false);
  assert.equal(shouldApplyUpdate({ ...idle, busy: 1 }, 'visible'), false);
});

test("띠의 '지금 바꾸기'는 사용자가 고른 것이니 언제든 받는다", () => {
  assert.equal(shouldApplyUpdate({ busy: 3, typing: true, idleMs: 0 }, 'button'), true);
});

test('커서가 글 쓰는 칸에 있는지: 글상자·글 입력칸·고를 수 있는 칸·편집 영역은 맞고, 단추·체크·본문은 아니다', () => {
  assert.equal(isTextField({ tagName: 'TEXTAREA' }), true);
  assert.equal(isTextField({ tagName: 'INPUT' }), true); // type 없으면 글 입력칸
  assert.equal(isTextField({ tagName: 'input', type: 'text' }), true);
  assert.equal(isTextField({ tagName: 'INPUT', type: 'search' }), true);
  assert.equal(isTextField({ tagName: 'INPUT', type: 'date' }), true);
  assert.equal(isTextField({ tagName: 'SELECT' }), true);
  assert.equal(isTextField({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(isTextField({ tagName: 'INPUT', type: 'checkbox' }), false);
  assert.equal(isTextField({ tagName: 'INPUT', type: 'file' }), false);
  assert.equal(isTextField({ tagName: 'INPUT', type: 'range' }), false);
  assert.equal(isTextField({ tagName: 'BUTTON' }), false);
  assert.equal(isTextField({ tagName: 'BODY' }), false);
  assert.equal(isTextField(null), false);
  assert.equal(isTextField(undefined), false);
});
