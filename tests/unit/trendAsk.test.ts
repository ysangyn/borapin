/**
 * 물어보기 × 요즘 자료: '요즘 뜨는 곳'·'한적한 곳'·'많이 안 걷는 곳'을 알아듣고,
 * 자료가 있으면 그 순서(안 가본 곳 먼저·집 가까운 곳 가산)로 3곳, 없으면 지어내지 않고 없다고 한다.
 * AI 도구(place_info·recommend)에도 같은 사실이 한 줄 붙는다.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import { ask, TREND_TOPICS, trendTopicOf, type AskData } from '../../src/lib/ask/engine';
import { rulesConfident } from '../../src/lib/ask/confidence';
import { runTools } from '../../src/lib/ask/tools';
import { setMembers } from '../../src/lib/members';
import type { TourData, TrendData } from '../../src/lib/trend';
import type { Trip } from '../../src/lib/types';

setMembers([{ email: 'ysangyn@gmail.com', name: '영상' }, { email: 'bora@example.com', name: '보라' }]);
const T = (id: string, title: string, places: Trip['places'], when: Trip['when']): Trip =>
  ({ id, title, kind: 'trip', status: 'done', when, places, companions: ['보라', '영상'], memo: '', tags: [], source: 'app', v: 1 }) as Trip;
const trips = [T('t1', '강릉시 여행', [{ t: 'kr', code: '51150' }], { p: 'year', y: 2019 }), T('t2', '서울 나들이', [{ t: 'kr', code: '11' }], { p: 'year', y: 2021 })];

const trend: TrendData = {
  at: '2026-10-20',
  window: { from: '2026-10-13', to: '2026-10-19' },
  regions: {
    '51150': { out: 50000, outPrev: 37000, growth: 0.35, rank: 3, related: [{ n: '경포해변', m: '강릉시' }, { n: '안목해변', m: '강릉시' }], crowd: [{ n: '경포해변', r: 62.1 }, { n: '오죽헌', r: 12 }] },
    '46130': { out: 20000, outPrev: 15000, growth: 0.33, rank: 10, related: [], crowd: [] },
    '51210': { out: 30000, outPrev: 25000, growth: 0.2, rank: 8, related: [], crowd: [] },
    '44790': { out: 9000, outPrev: 7500, growth: 0.2, rank: 20, related: [], crowd: [] },
    '47940': { out: 300, outPrev: 300, growth: 0, rank: 158, related: [], crowd: [] },
    '51810': { out: 500, outPrev: null, growth: null, rank: 150, related: [], crowd: [] },
    '43800': { out: 600, outPrev: 500, growth: 0.2, rank: 149, related: [], crowd: [] },
  },
  hot: ['51150', '46130', '51210', '44790'],
  quiet: ['47940', '51810', '43800'],
};
const tour: TourData = { updated: '2026-10-21', cells: { '11': { s: [], easy: 297 }, '29': { s: [], easy: 306 }, '51150': { s: [], easy: 95 }, '41280': { s: [], easy: 40 } } };
const base = { trips, wishes: [], recs: [], notes: [], festivals: null, info: travelinfo, seasons, world, now: new Date('2026-10-16T12:00:00+09:00') } as unknown as AskData;
const withData: AskData = { ...base, trend, tour };
const noData: AskData = { ...base, trend: null, tour: null };
const titles = (a: ReturnType<typeof ask>) => (a.items ?? []).map((i) => i.title);
const all = (a: ReturnType<typeof ask>) => [a.text, ...(a.lines ?? []), ...(a.items ?? []).map((i) => `${i.title} ${i.sub ?? ''}`), ...a.buttons.map((b) => b.label)].join(' / ');

test('주제 알아듣기: 뜨는 곳·한적한 곳·많이 안 걷는 곳 표현, 해 뜨는 곳은 아니다', () => {
  const kind = (q: string) => trendTopicOf(q)?.kind ?? null;
  for (const q of ['요즘 뜨는 곳', '요즘 핫한 여행지', '핫플 추천', '요즘 인기 많은 곳 어디야', '뜨고 있는 여행지', '요새 인기 여행지']) assert.equal(kind(q), 'hot', q);
  for (const q of ['한적한 곳 추천', '사람 없는 조용한 곳', '붐비지 않는 곳', '한산한 바다', '요즘 사람 많지 않은 곳', '북적이지 않는 데']) assert.equal(kind(q), 'quiet', q);
  for (const q of ['휠체어로 다니기 편한 곳', '유모차 끌고 갈 만한 곳', '부모님 모시고 가기 좋은 곳', '무릎 안 좋은 엄마랑 갈 곳', '많이 안 걷는 여행지', '편하게 다닐 수 있는 곳']) assert.equal(kind(q), 'easy', q);
  for (const q of ['해 뜨는 곳', '해가 뜨는 바다', '강릉 맛집', '안 가본 곳 추천', '부모님이랑 가기 좋은 곳']) assert.equal(kind(q), null, q);
  assert.equal(TREND_TOPICS.length, 3);
});

test('요즘 뜨는 곳: hot 순서로 3곳, 가 본 강릉은 뒤로, 안 가본 곳 먼저', () => {
  const a = ask('요즘 뜨는 곳', {}, withData);
  assert.equal(a.intent, 'recommend');
  assert.equal(a.text, '요즘 뜨는 곳 3곳');
  assert.deepEqual(titles(a), ['전남 여수시', '강원 속초시', '충남 청양군']);
  assert.match(a.items![0].sub ?? '', /^외지인 33% 늘었어요/);
  assert.match(all(a), /10월 20일 기준/);
  assert.ok(rulesConfident('요즘 뜨는 곳', a));
  // '다른 곳'을 누르면 다음 3곳 (가 본 강릉이 여기 온다)
  const more = a.buttons.find((b) => b.label === '다른 곳');
  assert.ok(more?.ask, JSON.stringify(a.buttons));
  const a2 = ask(more!.ask!, {}, withData);
  assert.deepEqual(titles(a2), ['강원 강릉시']);
  assert.match(a2.items![0].sub ?? '', /우리 한 번 다녀왔어요/);
  assert.ok(!a2.buttons.some((b) => b.label === '다른 곳'));
  // '안 가본'을 콕 집으면 가 본 곳은 아예 뺀다
  assert.deepEqual(titles(ask('안 가본 요즘 뜨는 곳', {}, withData)), ['전남 여수시', '강원 속초시', '충남 청양군']);
  assert.equal(ask('안 가본 요즘 뜨는 곳 다른 곳', {}, withData).text, '안 가본 요즘 뜨는 곳을 더 찾지 못했어요');
});

test('요즘 뜨는 곳: 집이 있으면 가까운 곳 가산 (집이 순천이면 여수가 1등, 광역 조건이면 그 안에서만)', () => {
  const home = { lat: 34.95, lng: 127.49, code: '46150' };
  assert.deepEqual(titles(ask('요즘 핫한 여행지', {}, { ...withData, home })), ['전남 여수시', '충남 청양군', '강원 속초시']);
  const g = ask('강원도에서 요즘 뜨는 곳', {}, withData);
  assert.equal(g.text, '강원에서 요즘 뜨는 곳 2곳');
  assert.deepEqual(titles(g), ['강원 속초시', '강원 강릉시']);
  // 테마 조건: 바다가 있는 곳만 ('한산한'의 '산'은 테마가 아니다)
  const sea = ask('한산한 바다', {}, withData);
  assert.equal(sea.text, '바다 쪽 한적한 곳 1곳');
  assert.deepEqual(titles(sea), ['경북 울릉군']);
});

test("'우리 집 근처'로 좁히면: 집을 모르면 되묻고, 알면 거리를 크게 본다", () => {
  const a1 = ask('요즘 뜨는 곳', {}, withData);
  const a2 = ask('우리 집 근처로', a1.ctx, withData);
  assert.match(a2.text, /어디 사세요/);
  assert.equal(a2.ctx.pending?.need, 'home');
  const a3 = ask('순천', a2.ctx, withData);
  assert.equal(a3.setHome?.t, 'kr');
  assert.equal(a3.text, '우리 집에서 가까운 요즘 뜨는 곳 3곳');
  assert.equal(titles(a3)[0], '전남 여수시');
  // 집이 서울이면 강릉·속초·청양이 여수보다 앞 (가 본 강릉은 그래도 뒤)
  const seoul = { lat: 37.55, lng: 126.99, code: '11' };
  assert.deepEqual(titles(ask('우리 집 근처 요즘 뜨는 곳', {}, { ...withData, home: seoul })), ['충남 청양군', '강원 속초시', '전남 여수시']);
});

test('한적한 곳: quiet 순서로, 되묻지 않고 답한다 (조용·한산이 지명으로 읽히지 않는다)', () => {
  for (const q of ['한적한 곳 추천', '사람 없는 조용한 곳', '붐비지 않는 곳', '요즘 사람 많지 않은 곳']) {
    const a = ask(q, {}, withData);
    assert.equal(a.intent, 'recommend', q);
    assert.equal(a.text, '한적한 곳 3곳', q);
    assert.deepEqual(titles(a), ['경북 울릉군', '강원 인제군', '충북 단양군'], q);
    assert.ok(rulesConfident(q, a), q);
  }
  assert.ok(ask('한적한 곳 추천', {}, withData).buttons.some((b) => b.label === '요즘 뜨는 곳은?'));
});

test('많이 안 걷는 곳: 무장애 관광지 수 많은 순, 가 본 서울은 뒤로', () => {
  const a = ask('휠체어로 다니기 편한 곳', {}, withData);
  assert.equal(a.intent, 'recommend');
  assert.equal(a.text, '많이 안 걷고 편하게 다닐 곳 3곳');
  assert.deepEqual(titles(a), ['광주', '경기 고양시', '서울']);
  assert.match(a.items![0].sub ?? '', /^휠체어·유모차로 다니기 편한 관광지 306곳/);
  assert.match(a.source ?? '', /무장애/);
  assert.ok(rulesConfident('휠체어로 다니기 편한 곳', a));
  for (const q of ['부모님 모시고 가기 좋은 곳', '유모차 끌고 갈 만한 곳', '많이 안 걷는 여행지']) assert.equal(ask(q, {}, withData).text, '많이 안 걷고 편하게 다닐 곳 3곳', q);
  // 해외 쪽 말이 있으면 세계 도시 자료가 먼저 (부모님 모시고 유럽)
  assert.match(ask('부모님 모시고 유럽 추천', {}, withData).text, /유럽/);
});

test('이어 묻기: 앞 지역이 있어도 요즘 주제는 새로 고르고, 거기라고 하면 그 지역 답', () => {
  const ctx = ask('강릉 볼거리', {}, withData).ctx;
  const fresh = ask('한적한 곳 추천', ctx, withData);
  assert.equal(fresh.text, '한적한 곳 3곳');
  const hot = ask('요즘 뜨는 곳', ctx, withData);
  assert.equal(hot.text, '요즘 뜨는 곳 3곳');
  const there = ask('거기 요즘 핫해?', ctx, withData);
  assert.equal(there.intent, 'overview');
  assert.ok(there.lines!.some((l) => l.startsWith('요즘: 요즘 뜨는 곳')), JSON.stringify(there.lines));
});

test('자료가 없으면 지어내지 않고 없다고 한다 (규칙형이 끝까지 맡는다)', () => {
  for (const [q, head] of [['요즘 뜨는 곳', '요즘 뜨는 곳은'], ['한적한 곳 추천', '한적한 곳은'], ['휠체어로 다니기 편한 곳', '많이 안 걷고 편하게 다닐 곳은']] as const) {
    const a = ask(q, {}, noData);
    assert.equal(a.intent, 'recommend', q);
    assert.equal(a.text, `${head} 아직 자료가 없어요`, q);
    assert.equal(a.items, undefined, q);
    assert.ok(rulesConfident(q, a), q);
    assert.ok(a.buttons.some((b) => b.label === '안 가본 곳 추천'), q);
  }
  // 자리표시(빈 자료)도 없는 것으로
  const empty: TrendData = { at: '', window: { from: '', to: '' }, regions: {}, hot: [], quiet: [] };
  assert.match(ask('요즘 뜨는 곳', {}, { ...base, trend: empty, tour: null }).text, /아직 자료가 없어요$/);
});

test('지역 답(개요·볼거리)에 요즘 줄: 뜨는 곳·붐빔·같이 가면 좋은 곳·편하게, 자료 없으면 그 줄이 없다', () => {
  const ov = ask('강릉', {}, withData);
  assert.ok(ov.lines!.includes('요즘: 요즘 뜨는 곳(외지인 35% 늘었어요) · 10월 20일 기준'), JSON.stringify(ov.lines));
  assert.ok(ov.lines!.includes('같이 가면 좋은 곳: 경포해변, 안목해변'));
  assert.ok(!ov.lines!.some((l) => l.startsWith('붐빔')));
  const sp = ask('강릉 볼거리', {}, withData);
  assert.ok(sp.lines!.includes('붐빔: 경포해변 붐벼요, 오죽헌 한적'), JSON.stringify(sp.lines));
  assert.ok(sp.lines!.includes('편하게: 휠체어·유모차로 다니기 편한 관광지 95곳'));
  const none = ask('강릉 볼거리', {}, noData);
  assert.ok(!none.lines!.some((l) => /^(요즘|붐빔|같이 가면|편하게)/.test(l)), JSON.stringify(none.lines));
  // 자료에 없는 지역은 줄이 없다
  assert.ok(!ask('부산 볼거리', {}, withData).lines!.some((l) => /^(요즘|붐빔|같이 가면)/.test(l)));
});

test('AI 도구: place_info에 요즘 한 줄, recommend는 주제면 요즘 자료로만, 아니면 후보에 꼬리표', () => {
  const now = new Date('2026-10-16T12:00:00+09:00');
  const pi = runTools([{ tool: 'place_info', args: { place: '강릉' } }], withData, null, now);
  assert.match(pi.text, /강원 강릉시 요즘\(한국관광공사 관광빅데이터\): 요즘 요즘 뜨는 곳\(외지인 35% 늘었어요\) · 10월 20일 기준 \/ 붐빔: 경포해변 붐벼요, 오죽헌 한적 \/ 같이 가면 좋은 곳: 경포해변, 안목해변 \/ 편하게: 휠체어·유모차로 다니기 편한 관광지 95곳/);
  assert.doesNotMatch(runTools([{ tool: 'place_info', args: { place: '강릉' } }], noData, null, now).text, /요즘\(/);
  const hot = runTools([{ tool: 'recommend', args: { count: 3 } }], withData, null, now, '요즘 뜨는 곳');
  assert.match(hot.text, /^요즘 뜨는 곳\(외지인 늘어난 순, 안 가본 곳 먼저, 10월 20일 기준\): 전남 여수시 · 외지인 33% 늘었어요 · .* · 우리 0번 \/ 강원 속초시/);
  assert.ok(hot.actions.some((x) => x.btn.label === '여수시 담기'));
  const easy = runTools([{ tool: 'recommend', args: {} }], withData, null, now, '부모님 모시고 가기 좋은 곳');
  assert.match(easy.text, /^많이 안 걷는 곳\(무장애 관광지 많은 순, 안 가본 곳 먼저\): 광주 · 휠체어·유모차로 다니기 편한 관광지 306곳/);
  const none = runTools([{ tool: 'recommend', args: {} }], noData, null, now, '한적한 곳 추천');
  assert.match(none.text, /^한적한 곳: 요즘 자료가 아직 없음/);
  assert.doesNotMatch(none.text, /추천 후보/);
  // 일반 추천 후보에는 꼬리표가 붙는다 (강릉이 들면 '요즘 뜨는 곳(외지인 35%↑)')
  const gen = runTools([{ tool: 'recommend', args: { group: '강원', count: 6 } }], { ...withData, trips: [] }, null, now, '강원도 여행지 추천');
  if (/강릉시/.test(gen.text)) assert.match(gen.text, /강원 강릉시 · [^/]*요즘 뜨는 곳\(외지인 35%↑\)/);
  assert.doesNotMatch(runTools([{ tool: 'recommend', args: { count: 6 } }], noData, null, now, '여행지 추천').text, /요즘 뜨는 곳|한적해요/);
});
