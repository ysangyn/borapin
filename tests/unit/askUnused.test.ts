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
  for (const q of ['케이블카 타기 좋은 곳', '캠핑하기 좋은 여행지', '출렁다리 있는 곳 추천', '레일바이크 탈 만한 데', '서핑 하기 좋은 곳', '템플스테이 추천해줘', '스노클링 하기 좋은 바다', '패러글라이딩 할 수 있는 곳']) {
    const a = ask(q, {}, d);
    assert.ok(!(a.intent === 'recommend' && rulesConfident(q, a)), q);
  }
});

test('알아듣는 추천은 그대로 규칙형이 답한다', () => {
  for (const q of ['11월에 어디 갈까', '단풍 보러 갈 만한 데', '둘 다 안 가본 섬', '부모님이랑 갈 만한 바다', '은하수 보기 좋은 국내 여행지', '이번 주 날씨 좋은 여행지', '내년 봄 벚꽃', '온천 추천']) {
    assert.equal(sure(q), true, q);
  }
});
