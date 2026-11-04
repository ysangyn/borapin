import { test } from 'node:test';
import assert from 'node:assert/strict';
import { garden, growHint, plantLine } from '../../src/lib/garden';
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
  assert.equal(plantLine(one), '보라의 마음으로 색이 진해졌어요 · 2024');
  assert.equal(growHint(one, '영상'), '나도 한 줄 남기면 보랏빛이 가득 물들어요');
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
  assert.equal(g.visits, 2);
  assert.deepEqual(g.years, [2019, 2024]);
  assert.equal(plantLine(g), '보랏빛으로 물들기 시작했어요 · 2019 · 2024');
});

test('보라 수채: 어떤 꽃이든 보라 범위, 마음을 남길수록 진하게', async () => {
  const { washColor } = await import('../../src/components/gardenPatterns');
  const hue = (c: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
  for (const icon of ['rose', 'forsythia', 'camellia', 'magnolia', 'iris', 'wild']) {
    const h = hue(washColor(icon, 'sprout', 1, '41280'));
    assert.ok(h >= 238 && h <= 296, `${icon} ${h}`);
  }
  const L = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).reduce((a, b) => a + b, 0);
  assert.ok(L(washColor('rose', 'flower', 2, '26')) < L(washColor('rose', 'seed', 1, '26')));
});

test('사진 3장 이상·글 하나도 마음으로 센다', () => {
  const t = { id: 'a', status: 'done', when: { p: 'day', y: 2025, m: 5, d: 1 }, places: [{ t: 'kr', code: '26' }], memo: '' } as unknown as Parameters<typeof garden>[0][number];
  assert.equal(garden([t], []).get('26')!.stage, 'seed');
  assert.equal(garden([t], [], new Map([['a', { photos: 2, notes: 0 }]])).get('26')!.stage, 'seed');
  assert.equal(garden([t], [], new Map([['a', { photos: 3, notes: 0 }]])).get('26')!.stage, 'sprout');
  assert.equal(garden([t], [], new Map([['a', { photos: 5, notes: 1 }]])).get('26')!.stage, 'flower');
});
