import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import { abroadNow, alarmFor, fxFor, loadAbroad, setAbroad, visaFor } from '../../src/lib/abroad';
import { ask, type AskData } from '../../src/lib/ask/engine';

const d = { trips: [], wishes: [], recs: [], notes: [], festivals: null, info: travelinfo, seasons, world, now: new Date('2026-10-19T12:00:00+09:00') } as unknown as AskData;
const sample = {
  alarm: { JP: { lvl: 1 }, TH: { lvl: 2, remark: '일부 지역' } }, alarmAt: '2026-10-18',
  visa: { JP: { free: true, stay: '90일' }, US: { free: false } }, visaAt: '2026-10-17',
  fx: { JPY: 8.9, USD: 1400.5 }, fxAt: '2026-10-16',
};

test('외교부·환율 자료는 번들에 없다: 받기 전엔 null이고 모든 조회가 null (화면·답은 그 줄을 뺀다)', async () => {
  assert.equal(abroadNow(), null);
  assert.equal(alarmFor('JPN'), null);
  assert.equal(visaFor('JPN'), null);
  assert.equal(fxFor('JPY 엔'), null);
  // 브라우저 밖(시험)에서는 받지 않는다 — 조용히 null
  assert.equal(await loadAbroad(), null);
  assert.equal(abroadNow(), null);
});

test('규칙형 FAQ: 자료가 없으면 손 메모(세계 도시 자료)로, 있으면 외교부 줄이 붙는다', () => {
  setAbroad(null);
  const before = ask('일본 갈 때 비자 필요해?', {}, d);
  assert.equal(before.intent, 'faq');
  assert.ok(before.lines?.some((l) => /일본 입국: .*세계 도시 자료/.test(l)), JSON.stringify(before.lines));
  assert.ok(!before.lines?.some((l) => /외교부/.test(l)));

  setAbroad(sample);
  const after = ask('일본 갈 때 비자 필요해?', {}, d);
  assert.ok(after.lines?.some((l) => /일본 입국: 무비자 90일 \(외교부 10월 17일 기준\)/.test(l)), JSON.stringify(after.lines));
  assert.ok(after.lines?.some((l) => /여행경보: 1단계 여행유의 \(외교부 10월 18일 기준\)/.test(l)));
  setAbroad(null);
});

test('조회 글: 여행경보 단계·일부 지역, 무비자/비자 필요, 환율(1엔·1달러)', () => {
  assert.deepEqual(alarmFor('THA', sample), { lvl: 2, text: '일부 지역 2단계 여행자제', at: '10월 18일' });
  assert.deepEqual(visaFor('USA', sample), { text: '비자 필요', at: '10월 17일' });
  assert.equal(visaFor('FRA', sample), null);
  assert.deepEqual(fxFor('JPY 엔', sample), { text: '1엔 ≈ 8.9원', at: '10월 16일' });
  assert.equal(fxFor('USD 달러', sample)?.text, '1달러 ≈ 1,401원');
  assert.equal(fxFor('EUR 유로', sample), null);
});
