import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextAbroadTrip, stageAction, tripStage, tripTabs } from '../../src/lib/stage';
import type { Trip } from '../../src/lib/types';

const trip = (over: Partial<Trip>): Trip => ({
  id: 'x', title: '여행', kind: 'trip', status: 'planned', when: { p: 'day', y: 2026, m: 10, d: 20, d2: 22 }, places: [{ t: 'kr', code: '51150' }],
  companions: [], memo: '', tags: [], source: 'app', v: 1, ...over,
});
const now = new Date(2026, 9, 16); // 2026-10-16

test('떠나기 전(14일 안): D-4', () => {
  const s = tripStage([trip({})], now);
  assert.equal(s?.kind, 'before');
  assert.equal(s?.label, 'D-4');
});
test('여행 중: 2일째', () => {
  const s = tripStage([trip({ when: { p: 'day', y: 2026, m: 10, d: 15, d2: 18 } })], now);
  assert.equal(s?.kind, 'during');
  assert.equal(s?.label, '여행 중 2일째');
});
test('막 다녀옴(7일 안, 다녀온 것으로 바꾼 여행)', () => {
  const s = tripStage([trip({ status: 'done', when: { p: 'day', y: 2026, m: 10, d: 10, d2: 13 } })], now);
  assert.equal(s?.kind, 'after');
  assert.equal(s?.label, '3일 전에 다녀왔어요');
});
test('먼 예정·오래된 기록·날짜 모르는 기록은 없음', () => {
  assert.equal(tripStage([trip({ when: { p: 'day', y: 2026, m: 12, d: 1 } })], now), null);
  assert.equal(tripStage([trip({ status: 'done', when: { p: 'day', y: 2026, m: 9, d: 1 } })], now), null);
  assert.equal(tripStage([trip({ when: { p: 'month', y: 2026, m: 10 } })], now), null);
});
test('여행 중이 곧 떠남보다 먼저', () => {
  const s = tripStage([trip({ id: 'a' }), trip({ id: 'b', when: { p: 'day', y: 2026, m: 10, d: 16 } })], now);
  assert.equal(s?.kind, 'during');
  assert.equal(s?.trip.id, 'b');
});

// ---------- 단계 카드의 단추는 말한 그 탭으로 (M8) ----------
test('떠나기 전 단추는 준비 탭, 여행 중은 사진 탭으로', () => {
  const before = tripStage([trip({})], now)!;
  assert.deepEqual(stageAction(before, { photos: 0, notes: 0 }), { label: '준비물 보기', to: '/trips/x?tab=prep' });
  const during = tripStage([trip({ when: { p: 'day', y: 2026, m: 10, d: 15, d2: 18 } })], now)!;
  assert.deepEqual(stageAction(during, { photos: 3, notes: 0 }), { label: '사진 올리기', to: '/trips/x?tab=photos' });
});
test('막 다녀온 뒤 단추는 빠진 것 쪽으로: 글이 없으면 글 탭, 사진이 없으면 사진 탭, 둘 다 있으면 개요', () => {
  const after = tripStage([trip({ status: 'done', when: { p: 'day', y: 2026, m: 10, d: 10, d2: 13 } })], now)!;
  assert.deepEqual(stageAction(after, { photos: 5, notes: 0 }), { label: '한 줄 남기기', to: '/trips/x?tab=notes' });
  assert.deepEqual(stageAction(after, { photos: 0, notes: 2 }), { label: '사진 올리기', to: '/trips/x?tab=photos' });
  assert.deepEqual(stageAction(after, { photos: 0, notes: 0 }), { label: '사진·한 줄 남기기', to: '/trips/x?tab=photos' });
  assert.deepEqual(stageAction(after, { photos: 5, notes: 2 }), { label: '다시 보기', to: '/trips/x' });
});

// ---------- 여행 상세 탭은 넷 (R7) ----------
test('예정 여행은 개요·일정·준비·사진, 다녀온 여행은 개요·들른 곳·사진·글', () => {
  assert.deepEqual(tripTabs('planned'), ['info', 'plan', 'prep', 'photos']);
  assert.deepEqual(tripTabs('done'), ['info', 'plan', 'photos', 'notes']);
  assert.equal(tripTabs('planned').length, 4);
  assert.equal(tripTabs('done').length, 4);
});

// ---------- 오늘의 영어 카드는 다음 예정 여행이 해외일 때만 (R3) ----------
test('다음 예정 여행이 해외면 그 여행, 국내면 없음', () => {
  const kyoto = trip({ id: 'jp', when: { p: 'month', y: 2026, m: 12 }, places: [{ t: 'country', id: 'JP', city: '교토' }] });
  const jeju = trip({ id: 'kr', when: { p: 'day', y: 2026, m: 11, d: 1 }, places: [{ t: 'kr', code: '50110' }] });
  assert.equal(nextAbroadTrip([kyoto], now)?.id, 'jp');
  // 가까운 예정 여행이 국내(11월 제주)면 그 뒤 해외 여행이 있어도 카드는 안 보인다
  assert.equal(nextAbroadTrip([kyoto, jeju], now), null);
  // 다녀온 해외 여행·날짜 지난 계획은 '다음'이 아니다
  assert.equal(nextAbroadTrip([trip({ status: 'done', places: [{ t: 'country', id: 'JP' }] })], now), null);
  assert.equal(nextAbroadTrip([trip({ when: { p: 'day', y: 2026, m: 9, d: 1 }, places: [{ t: 'country', id: 'JP' }] })], now), null);
  assert.equal(nextAbroadTrip([], now), null);
});
