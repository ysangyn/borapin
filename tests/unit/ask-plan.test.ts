import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensurePlan } from '../../src/lib/ask/plan';

test('우리 기록 질문인데 AI가 도구를 빼먹으면 our_* 도구를 보탠다', () => {
  const calls = ensurePlan('강릉 갔을 때 뭐 먹었더라, 또 가고 싶다고 한 데 있었나', [], '강릉');
  const tools = calls.map((c) => c.tool);
  assert.deepEqual(tools, ['resolve_place', 'our_trips', 'our_places']);
  assert.equal(calls[1].args?.place, '강릉');
});

test('이미 들어 있으면 겹쳐 넣지 않고, 지명은 모델이 적은 것을 쓴다', () => {
  const calls = ensurePlan('제주에서 남긴 글 찾아줘', [{ tool: 'resolve_place', args: { place: '제주' } }, { tool: 'our_notes', args: {} }], null);
  assert.deepEqual(calls.map((c) => c.tool), ['resolve_place', 'our_notes', 'our_trips']);
  assert.equal(calls[2].args?.place, '제주');
});

test('일반 여행정보 질문은 건드리지 않는다', () => {
  const given = [{ tool: 'resolve_place', args: { place: '남해' } }, { tool: 'best_time', args: { place: '남해' } }];
  assert.deepEqual(ensurePlan('남해는 언제 가는 게 좋아', given, '남해'), given);
});
