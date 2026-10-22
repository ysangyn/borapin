/**
 * 물어보기 행동 단추가 말한 곳으로 가는지 (검토 M1·M6):
 * - '여행 만들기'·'여행 계획하기'는 /plan 하나로 (옛 /record?status=planned 길은 쓰지 않는다)
 * - 횟수는 times() ('3번' 아니고 '세 번')
 * - tests/ask/cases.ts의 link 기대값
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import { ask, type AskCtx, type AskData } from '../../src/lib/ask/engine';
import { setMembers } from '../../src/lib/members';
import { CASES } from '../ask/cases';
import type { Trip, Wish } from '../../src/lib/types';

setMembers([{ email: 'ysangyn@gmail.com', name: '영상' }, { email: 'bora@example.com', name: '보라' }]);

const T = (id: string, title: string, places: Trip['places'], when: Trip['when'], extra: Partial<Trip> = {}): Trip =>
  ({ id, title, kind: 'trip', status: 'done', when, places, companions: ['보라', '영상'], memo: '', tags: [], source: 'app', v: 1, ...extra }) as Trip;
// scripts/ask-test.ts와 같은 공간 (예정 여행 하나 포함)
const trips: Trip[] = [
  T('t1', '강릉시 여행', [{ t: 'kr', code: '51150' }], { p: 'day', y: 2019, m: 5, d: 3, d2: 4 }, { companions: ['보라', '영상', '엄마'] }),
  T('t2', '부산 여행', [{ t: 'kr', code: '26' }], { p: 'year', y: 2021 }),
  T('t3', '교토 단풍 여행', [{ t: 'country', id: 'JPN', city: '교토' }], { p: 'season', y: 2025, s: 'autumn' }),
  T('t4', '속초 여름 바다', [{ t: 'kr', code: '51210' }], { p: 'month', y: 2024, m: 8 }),
  T('t5', '제주 여행', [{ t: 'kr', code: '50' }], { p: 'year', y: 2026 }, { status: 'planned' }),
];
const wishes: Wish[] = [{ id: 'w1', place: { t: 'kr', code: '50' }, priority: 1, spots: [], todos: [], foods: [], note: '', source: 'app', v: 1 } as Wish];
const base = { recs: [], notes: [], festivals: null, info: travelinfo, seasons, world, now: new Date('2026-10-16T12:00:00+09:00') };
const full = { ...base, trips, wishes } as unknown as AskData;
const empty = { ...base, trips: [], wishes: [] } as unknown as AskData;

const run = (q: string, d: AskData, after?: string) => {
  let ctx: AskCtx = {};
  if (after) ctx = ask(after, {}, d).ctx;
  return ask(q, ctx, d);
};
const links = (a: ReturnType<typeof ask>) => a.buttons.map((b) => b.to).filter((x): x is string => !!x);

test('cases.ts의 link 기대값: 단추 하나가 그 주소로 간다', () => {
  const bad: string[] = [];
  for (const c of CASES.filter((x) => x.link)) {
    const a = run(c.q, full, c.after);
    if (!links(a).some((to) => to.startsWith(c.link!))) bad.push(`${c.q} → ${links(a).join(', ') || '(단추 없음)'} (기대 ${c.link})`);
  }
  assert.deepEqual(bad, []);
});

test('어떤 질문의 단추도 옛 계획 길(/record?status=planned)로 가지 않는다', () => {
  const bad: string[] = [];
  for (const c of CASES) for (const d of [full, empty]) {
    for (const to of links(run(c.q, d, c.after))) if (/^\/record\?.*status=planned/.test(to)) bad.push(`${c.q} → ${to}`);
  }
  assert.deepEqual(bad, []);
});

test("'여행 만들기' 단추는 언제나 /plan, 짧은 이름 하나만 쓴다", () => {
  for (const c of CASES) for (const d of [full, empty]) {
    const a = run(c.q, d, c.after);
    for (const b of a.buttons) {
      if (b.label === '여행 만들기') assert.match(b.to ?? '', /^\/plan(\?|$)/, c.q);
      assert.ok(!/여행 만들고/.test(b.label), `${c.q}: 긴 단추 '${b.label}'`);
    }
  }
});

test('예정 여행이 없으면 다음 여행 질문은 여행 계획하기(/plan)로 이끈다', () => {
  const a = ask('다음 여행 언제야', {}, empty);
  assert.equal(a.intent, 'next');
  assert.ok(a.buttons.some((b) => b.label === '여행 계획하기' && b.to === '/plan'), JSON.stringify(a.buttons));
});

test("기록이 적으면 패턴 질문은 '기록 남기기'(/record)로", () => {
  const a = ask('우리 여행 패턴 어때', {}, empty);
  assert.equal(a.intent, 'pattern');
  assert.ok(a.buttons.some((b) => b.label === '기록 남기기' && b.to === '/record'), JSON.stringify(a.buttons));
});

test("횟수는 우리말: '3번'이 아니라 '세 번'", () => {
  const a = ask('우리 몇 곳 갔어?', {}, full);
  const all = [a.text, ...(a.lines ?? [])].join(' / ');
  assert.ok(!/(^|[^\d])[1-9]번/.test(all), all);
});
