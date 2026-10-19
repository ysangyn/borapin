/**
 * 대량 채점: 여행 주제 × 묻는 말투. 한 낱말만 고치는 게 아니라 같은 종류 질문 전체를 지킨다.
 * - 사전에 있는 주제: 주제 이름이 제목에, 고른 곳은 모두 그 주제의 곳
 * - 사전에 없는 활동: 규칙형이 '그냥 추천 3곳'을 자신 있게 내놓지 않는다 (AI나 '모름'으로)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import topics from '../../src/data/topics.json' with { type: 'json' };
import { ask, type AskData } from '../../src/lib/ask/engine';
import { rulesConfident } from '../../src/lib/ask/confidence';

const d = { trips: [], wishes: [], recs: [], notes: [], festivals: null, info: travelinfo, seasons, world, now: new Date('2026-10-19T12:00:00+09:00') } as unknown as AskData;
const TEMPLATES = ['{w} 하기 좋은 곳', '{w} 명소 추천', '국내 {w} 추천해줘', '{w} 어디가 좋아?', '주말에 {w} 갈 만한 데', '{w} 좋은 여행지', '{w} 보러 갈 곳 알려줘', '{w} 할 수 있는 곳'];

test('사전에 있는 주제 × 말투: 주제 곳에서만 고르고 제목에 주제가 나온다', () => {
  const bad: string[] = [];
  for (const t of (topics as { topics: { label: string; words: string[]; places: { code: string }[] }[] }).topics) {
    const codes = new Set(t.places.map((p) => p.code));
    for (const w of t.words) for (const tpl of TEMPLATES) {
      const q = tpl.replace('{w}', w);
      const a = ask(q, {}, d);
      const ok = a.intent === 'recommend' && a.text.includes(t.label) && (a.items ?? []).length > 0 && (a.items ?? []).every((i) => i.wish?.t === 'kr' && codes.has(i.wish.code)) && rulesConfident(q, a);
      if (!ok) bad.push(`${q} → ${a.intent} · ${a.text}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('사전에 없는 활동 × 말투: 엉뚱한 추천을 자신 있게 내놓지 않는다', () => {
  const UNKNOWN = ['승마', '번지점프', '카약', '래프팅', '짚라인', '열기구', '요트', '골프', '양떼목장', '와이너리', '전통주 양조장', '스카이워크', '루지', '수상스키', '빙어낚시', '자연휴양림 숙박', '천연 염전', '고인돌', '공룡 발자국', '야생화'];
  const bad: string[] = [];
  for (const w of UNKNOWN) for (const tpl of TEMPLATES) {
    const q = tpl.replace('{w}', w);
    const a = ask(q, {}, d);
    // 자료(지명 사전의 볼거리)로 그 낱말을 직접 다뤘으면 괜찮다
    if (a.text.replace(/\s/g, '').includes(w.replace(/\s/g, ''))) continue;
    if (a.intent === 'recommend' && rulesConfident(q, a)) bad.push(`${q} → ${a.text}`);
  }
  assert.deepEqual(bad, []);
});
