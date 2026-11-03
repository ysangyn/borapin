import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aboutTime, directFrom, directWays, wayLine, type RoutesData } from '../../src/lib/transit';
import { build } from '../../scripts/routes-build';

const GOYANG = '41280', GANGNEUNG = '51150', CHEONGJU = '43110';

test('aboutTime: 10분 단위로 둥글게', () => {
  assert.equal(aboutTime(127), '약 2시간 10분');
  assert.equal(aboutTime(120), '약 2시간');
  assert.equal(aboutTime(47), '약 50분');
  assert.equal(aboutTime(3), '약 10분');
});

test('build: 한쪽만 나온 노선은 반대 방향도 (표시), 같은 시·군 짝은 뺀다', () => {
  const d = build({
    updated: '2026-11-02T00:00:00Z', checkedAt: '2026-11',
    stops: [
      { svc: 'S', id: 'g', name: '고양종합', region: GOYANG },
      { svc: 'S', id: 'c', name: '청주', region: CHEONGJU },
      { svc: 'S', id: 'g2', name: '일산', region: GOYANG },
      { svc: 'T', id: 'h', name: '행신', region: GOYANG },
      { svc: 'T', id: 'k', name: '강릉', region: GANGNEUNG },
    ],
    routes: [
      ['S', 'c', 'g', 6, 150, 18000, -1, -1, '2026-11'], // 청주 → 고양만 나옴
      ['S', 'g', 'g2', 3, 20, 2000, -1, -1, '2026-11'], // 같은 시·군
      ['T', 'h', 'k', 6, 140, 30000, 4, 125, '2026-11'],
      ['T', 'k', 'h', 6, 140, 30000, 4, 126, '2026-11'],
    ],
  });
  assert.equal(d.updated, '2026-11');
  assert.equal(d.r.length, 4); // 청주→고양, (반대) 고양→청주, 행신↔강릉
  const back = d.r.find((x) => d.s[x[1]][0] === '고양종합');
  assert.ok(back);
  assert.equal(back[7], 1);
});

const D: RoutesData = {
  updated: '2026-11',
  s: [['행신', GOYANG, 'T'], ['강릉', GANGNEUNG, 'T'], ['고양백석', GOYANG, 'E'], ['강릉', GANGNEUNG, 'E'], ['청주', CHEONGJU, 'S'], ['고양종합', GOYANG, 'S']],
  r: [
    ['T', 0, 1, 9, 160, 4, 125, 0],
    ['E', 2, 3, 3, 200, -1, -1, 0],
    ['S', 5, 4, 6, 150, -1, -1, 1],
  ],
};

test('directWays: 기차는 KTX 편수·시간으로, 기차 → 고속 → 시외 순', () => {
  const w = directWays(D, GOYANG, GANGNEUNG);
  assert.deepEqual(w.map((x) => x.svc), ['T', 'E']);
  assert.equal(wayLine(w[0]), 'KTX 행신→강릉 약 2시간 10분 · 하루 4편');
  assert.equal(wayLine(w[1]), '고속버스 고양백석→강릉 약 3시간 20분 · 하루 3편');
  assert.equal(directWays(D, GANGNEUNG, CHEONGJU).length, 0);
});

test('directFrom: 우리 시·군에서 한 번에 가는 곳마다 가장 빠른 길', () => {
  const m = directFrom(D, GOYANG);
  assert.deepEqual([...m.keys()].sort(), [CHEONGJU, GANGNEUNG].sort());
  assert.equal(m.get(GANGNEUNG)!.ktx, true);
  assert.equal(m.get(CHEONGJU)!.inferred, true);
});
