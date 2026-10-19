import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import { ask, type AskData } from '../../src/lib/ask/engine';
import { rulesConfident } from '../../src/lib/ask/confidence';

const d: AskData = { trips: [], wishes: [], recs: [], notes: [], festivals: null, info: travelinfo as never, seasons: seasons as never, world: world as never, now: new Date('2026-10-19T12:00:00+09:00') } as AskData;
const sure = (q: string) => rulesConfident(q, ask(q, {}, d));

test('추천 질문에 모르는 핵심 낱말이 있으면 규칙형이 자신 있다고 하지 않는다 (엉뚱한 3곳 대신 AI로)', () => {
  // 모르는 주제로 '그냥 추천 3곳'을 자신 있게 내놓지 않는다 (지명으로 읽혀 되묻거나, AI로 넘기거나)
  for (const q of ['승마 하기 좋은 곳', '번지점프 할 수 있는 곳 추천', '카약 탈 만한 데', '열기구 타는 곳 추천해줘', '와이너리 투어 하기 좋은 여행지']) {
    const a = ask(q, {}, d);
    assert.ok(!(a.intent === 'recommend' && rulesConfident(q, a)), q);
  }
});

test('알아듣는 추천은 그대로 규칙형이 답한다', () => {
  for (const q of ['11월에 어디 갈까', '단풍 보러 갈 만한 데', '둘 다 안 가본 섬', '부모님이랑 갈 만한 바다', '은하수 보기 좋은 국내 여행지', '이번 주 날씨 좋은 여행지', '내년 봄 벚꽃', '온천 추천']) {
    assert.equal(sure(q), true, q);
  }
});

test('되묻기: 우리 집을 모르면 묻고, 시·군으로 답하면 그 근처로 처음 질문을 다시 푼다', () => {
  const a1 = ask('단풍 놀이 장소 추천', {}, d);
  assert.equal(a1.intent, 'recommend');
  const a2 = ask('우리집 근처로', a1.ctx, d); // 앞 질문에 조건만 덧붙임
  assert.match(a2.text, /어디 사세요/);
  assert.equal(a2.ctx.pending?.need, 'home');
  assert.ok(rulesConfident('우리집 근처로', a2));
  const a3 = ask('고양', a2.ctx, d);
  assert.equal(a3.setHome?.t, 'kr');
  assert.match(a3.text, /우리 집에서 가까운/);
  assert.ok((a3.lines ?? [])[0].includes('우리 집을 기억할게요'));
  assert.ok((a3.items ?? []).length > 0);
  // 집을 알면 바로 답한다
  const withHome = { ...d, home: { lat: 37.66, lng: 126.83, code: '41280' } };
  assert.match(ask('우리 집 근처 단풍 명소 추천', {}, withHome).text, /우리 집에서 가까운|단풍/);
  // 되묻는 중에 다른 질문을 하면 되묻기를 그만두고 그 질문에 답한다
  assert.notEqual(ask('제주 맛집 알려줘', a2.ctx, d).pending?.need, 'home');
});
