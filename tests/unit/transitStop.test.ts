import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock, span, transitPlans } from '../../src/lib/transitStop';
import type { RoutesData } from '../../src/lib/transit';

// 고양 → 남원. 바로 가는 KTX(행신→남원), 전주 들러 가기(KTX 행신→전주, 버스 전주→남원), 대전 경유
const GOYANG = '41280', JEONJU = '52', NAMWON = '52190', DAEJEON = '30', BUSAN = '26';
const flat = (xs: [number, number, 0 | 1][]) => xs.flat();
const h = (hh: number, mm = 0) => hh * 60 + mm;
const D: RoutesData = {
  updated: '2026-11',
  s: [['행신', GOYANG, 'T'], ['남원', NAMWON, 'T'], ['전주', JEONJU, 'T'], ['전주고속', JEONJU, 'E'], ['남원고속', NAMWON, 'E'], ['대전', DAEJEON, 'T'], ['부산', BUSAN, 'T']],
  r: [
    ['T', 0, 1, 2, 150, 2, 150, 0, flat([[h(9), 150, 1], [h(15), 150, 1]])], // 행신→남원 9:00·15:00
    ['T', 0, 2, 3, 120, 3, 120, 0, flat([[h(8), 120, 1], [h(10), 120, 1], [h(14), 120, 1]])], // 행신→전주
    ['E', 3, 4, 6, 60, -1, -1, 0, flat([[h(10, 30), 60, 0], [h(13), 60, 0], [h(14), 60, 0], [h(17), 60, 0]])], // 전주고속→남원
    ['T', 2, 1, 2, 30, 2, 30, 0, flat([[h(10, 20), 30, 1], [h(19), 30, 1]])], // 전주역→남원역
    ['T', 0, 5, 1, 70, 1, 70, 0, flat([[h(8), 70, 1]])], // 행신→대전 (남원 가는 길 아님)
    ['T', 5, 1, 1, 100, 1, 100, 1, []], // 시각표 모름 → 안 씀
  ],
};

test('바로 가기 · 가장 빠른 길 · 들러 가기', () => {
  const p = transitPlans(D, GOYANG, NAMWON);
  const direct = p.find((x) => x.kind === 'direct')!;
  assert.equal(clock(direct.legs[0].dep), '9:00');
  assert.equal(clock(direct.end), '11:30');
  // 행신 8:00 → 전주 10:00 → (같은 역) 10:20 → 남원 10:50: 바로 가기보다 40분 빨리
  const fast = p.find((x) => x.kind === 'fast')!;
  assert.equal(clock(fast.end), '10:50');
  assert.equal(fast.mid, JEONJU);
  // 전주에서 2~5시간: 8:00 출발 → 10:00 전주 → (터미널 30분) 13:00 버스 → 14:00 남원 (머무는 2시간 30분)
  const stop = p.find((x) => x.kind === 'stop')!;
  assert.equal(stop.mid, JEONJU);
  assert.ok(stop.stay! >= 120 && stop.stay! <= 300);
  assert.ok(stop.legs[1].dep - stop.legs[0].arr >= 120);
  // 대전은 시각표 없는 노선이라 들러 가기 후보가 아니다
  assert.ok(!p.some((x) => x.mid === DAEJEON));
});

test('버스만: 첫 구간도 버스여야 해서 기차 출발 길은 빠진다', () => {
  assert.equal(transitPlans(D, GOYANG, NAMWON, { mode: 'bus' }).length, 0);
});

test('가 본 곳보다 처음 가는 곳을 먼저', () => {
  const p = transitPlans(D, GOYANG, NAMWON, { visited: new Set([JEONJU]) });
  assert.ok(p.find((x) => x.kind === 'stop')); // 그래도 하나뿐이면 보여 준다
});

test('clock · span', () => {
  assert.equal(clock(h(9, 5)), '9:05');
  assert.equal(clock(1440 + h(10)), '10:00');
  assert.equal(span(200), '3시간 20분');
  assert.equal(span(120), '2시간');
  assert.equal(span(40), '40분');
});

test('막차: 바로 가기는 그 노선의 마지막 출발', () => {
  const direct = transitPlans(D, GOYANG, NAMWON).find((x) => x.kind === 'direct')!;
  assert.equal(clock(direct.last!), '15:00');
});

test('토요일: 받은 토요일 시각표를 쓰고, 아직 안 받은 노선은 평일 것', () => {
  const sat: RoutesData = { ...D, r: D.r.map((x, i) => (i === 0 ? [...x.slice(0, 9), flat([[h(11), 150, 1]])] as unknown as RoutesData['r'][number] : x)) };
  const direct = transitPlans(sat, GOYANG, NAMWON, { day: 'sat' }).find((x) => x.kind === 'direct')!;
  assert.equal(clock(direct.legs[0].dep), '11:00');
  const weekday = transitPlans(sat, GOYANG, NAMWON).find((x) => x.kind === 'direct')!;
  assert.equal(clock(weekday.legs[0].dep), '9:00');
});

test('갈아타기: 자리를 알면 걸어서(700m 안)·택시(4km 안), 모르면 시내 이동 30분', async () => {
  const { transfer } = await import('../../src/lib/transitStop');
  const mk = (a: [number, number] | null, b: [number, number] | null): RoutesData => ({
    updated: '2026-11',
    s: [['행신', GOYANG, 'T'], a ? ['전주', JEONJU, 'T', a[0], a[1]] : ['전주', JEONJU, 'T'], b ? ['전주고속', JEONJU, 'E', b[0], b[1]] : ['전주고속', JEONJU, 'E'], ['남원', NAMWON, 'E']],
    r: [],
  });
  const e1 = { svc: 'T' as const, from: 0, to: 1, fromCode: GOYANG, toCode: JEONJU, deps: [] };
  const e2 = { svc: 'E' as const, from: 2, to: 3, fromCode: JEONJU, toCode: NAMWON, deps: [] };
  assert.equal(transfer(mk(null, null), e1, e2).how, 'town');
  const walk = transfer(mk([35.85, 127.16], [35.853, 127.162]), e1, e2);
  assert.equal(walk.how, 'walk');
  assert.ok(walk.min >= 10 && walk.min <= 16);
  assert.equal(transfer(mk([35.85, 127.16], [35.87, 127.18]), e1, e2).how, 'taxi');
});

test('일요일: 일요일 시각표가 아직 없으면 토요일 것', () => {
  const sat: RoutesData = { ...D, r: D.r.map((x, i) => (i === 0 ? [...x.slice(0, 9), flat([[h(11), 150, 1]]), null] as unknown as RoutesData['r'][number] : x)) };
  const p = transitPlans(sat, GOYANG, NAMWON, { day: 'sun' }).find((x) => x.kind === 'direct')!;
  assert.equal(clock(p.legs[0].dep), '11:00');
});
