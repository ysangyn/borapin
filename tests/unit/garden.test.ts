import { test } from 'node:test';
import assert from 'node:assert/strict';
import { garden, growHint, patternOf, plantLine } from '../../src/lib/garden';
import type { PlaceRec, Trip } from '../../src/lib/types';

const trip = (id: string, code: string, over: Partial<Trip> = {}): Trip => ({ id, title: id, kind: 'trip', status: 'done', when: { p: 'year', y: 2024 }, places: [{ t: 'kr', code }], companions: [], memo: '', tags: [], source: 'app', v: 1, ...over });
const rec = (code: string, reviews: Record<string, string> = {}): PlaceRec => ({ id: code + Object.keys(reviews).join(), name: '곳', kind: 'food', region: { t: 'kr', code }, reviews, verdict: null, v: 1 } as PlaceRec);

test('핀만 꽂으면 씨앗, 예정 여행은 심지 않는다', () => {
  const g = garden([trip('a', '51150'), trip('b', '26', { status: 'planned' })], []);
  assert.equal(g.get('51150')?.stage, 'seed');
  assert.equal(g.has('26'), false);
});

test('한 사람의 한 줄 평이면 그 사람의 새싹, 둘 다면 꽃', () => {
  const t = [trip('a', '51150')];
  const one = garden(t, [rec('51150', { 보라: '최고' })]).get('51150')!;
  assert.equal(one.stage, 'sprout');
  assert.deepEqual(one.by, ['보라']);
  assert.equal(plantLine(one), '보라의 새싹이 났어요 · 2024');
  assert.equal(growHint(one, '영상'), '나도 한 줄 남기면 꽃이 피어요');
  const two = garden(t, [rec('51150', { 보라: '최고', 영상: '또 가자' })]).get('51150')!;
  assert.equal(two.stage, 'flower');
  assert.equal(growHint(two, '영상'), null);
});

test('혼자 쓰는 공간도 꽃이 핀다: 한 줄 평 + 메모', () => {
  const g = garden([trip('a', '51150', { memo: '바다가 좋았다' })], [rec('51150', { 나: '좋아' })]);
  assert.equal(g.get('51150')?.stage, 'flower');
});

test('빈 한 줄 평은 마음이 아니다, 장소만 남겨도 새싹', () => {
  assert.equal(garden([trip('a', '51150')], [rec('51150', { 보라: '  ' })]).get('51150')?.stage, 'sprout'); // 장소 기록 하나
  assert.equal(garden([trip('a', '51150')], [rec('47130', { 보라: '좋아' })]).get('51150')?.stage, 'seed'); // 다른 칸 기록
});

test('두 번 이상 가면 촘촘한 무늬, 나이테는 해마다', () => {
  const g = garden([trip('a', '51150', { when: { p: 'year', y: 2019 } }), trip('b', '51150', { when: { p: 'year', y: 2024 } })], []).get('51150')!;
  assert.equal(patternOf(g), 'g-seed-2');
  assert.deepEqual(g.years, [2019, 2024]);
  assert.equal(plantLine(g), '씨앗을 심었어요 · 2019 · 2024');
});
