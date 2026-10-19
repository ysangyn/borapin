import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import faq from '../../src/data/faq.json' with { type: 'json' };
import { ask, type AskData } from '../../src/lib/ask/engine';

const d = { trips: [], wishes: [], recs: [], notes: [], festivals: null, info: travelinfo, seasons, world, now: new Date('2026-10-19T12:00:00+09:00') } as unknown as AskData;
type F = { id: string; a: string; ex: string; volatile: boolean; lines: string[]; link?: { href: string } };

test('여행 상식: 예시 질문마다 그 답이 나온다', () => {
  const bad = (faq.faq as F[]).filter((f) => { const a = ask(f.ex, {}, d); return !(a.intent === 'faq' && a.text === f.a); }).map((f) => `${f.ex} → ${ask(f.ex, {}, d).text}`);
  assert.deepEqual(bad, []);
});

test('바뀌기 쉬운 규정은 공식 링크나 확인 안내가 있고, 지명 질문을 빼앗지 않는다', () => {
  for (const f of faq.faq as F[]) if (f.volatile) assert.ok(f.link || f.lines.some((l) => /확인/.test(l)), f.id);
  assert.notEqual(ask('오사카 시차', {}, d).intent, 'faq');
  assert.notEqual(ask('강릉 맛집', {}, d).intent, 'faq');
});
