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

test('추천 도구에 질문의 테마·달·안 가본 곳을 채운다', () => {
  const now = new Date(2026, 9, 16);
  const calls = ensurePlan('다음 달에 둘 다 안 가본 바다 쪽으로 1박 가고 싶은데 어디가 좋을까', [{ tool: 'recommend', args: {} }], null, now);
  assert.deepEqual(calls[0].args, { themes: ['바다'], month: 11, unvisited: true });
  const rain = ensurePlan('11월 셋째 주에 비 오면 실내에서 뭐 할 수 있는 곳', [{ tool: 'recommend', args: { month: 11 } }], null, now);
  assert.deepEqual(rain[0].args, { month: 11, themes: ['실내'] });
  // 모델이 이미 적은 건 그대로
  const kept = ensurePlan('바다 추천', [{ tool: 'recommend', args: { themes: ['섬'] } }], null, now);
  assert.deepEqual(kept[0].args, { themes: ['섬'] });
});

test('모델이 깨뜨린 인자를 손본다: 물음표 열쇠, 질문에 없는 지명·검색어', () => {
  const q = '강릉 갔을 때 뭐 먹었더라, 또 가고 싶다고 한 데 있었나';
  const calls = ensurePlan(q, [
    { tool: 'resolve_place', args: { name: '코랑' } },
    { tool: 'our_places', args: { place: '코랑', query: '해드' } },
    { tool: 'recommend', args: { 'month?': '2026-11', 'themes?': ['바다'], themes: ['바다'], month: 11 } },
  ], '강릉시');
  assert.deepEqual(calls[0], { tool: 'resolve_place', args: { place: '강릉시' } });
  assert.deepEqual(calls[1], { tool: 'our_places', args: { place: '강릉시' } });
  assert.deepEqual(calls[2].args, { month: 11, themes: ['바다'] });
  // 질문에 있는 지명·검색어는 그대로
  const ok = ensurePlan('제주에서 커피 마신 날 글', [{ tool: 'our_notes', args: { query: '커피' } }, { tool: 'our_trips', args: { place: '제주' } }], '제주');
  assert.deepEqual(ok.find((c) => c.tool === 'our_notes')!.args, { query: '커피' });
  assert.deepEqual(ok.find((c) => c.tool === 'our_trips')!.args, { place: '제주' });
});
