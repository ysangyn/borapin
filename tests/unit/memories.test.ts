import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickMemory } from '../../src/lib/memories';
import { placeLabel } from '../../src/lib/geo';
import type { Trip } from '../../src/lib/types';

const trip = (over: Partial<Trip>): Trip => ({
  id: 'x', title: '여행', kind: 'trip', status: 'done', when: { p: 'day', y: 2024, m: 10, d: 16 }, places: [{ t: 'kr', code: '51150' }],
  companions: [], memo: '', tags: [], source: 'app', v: 1, ...over,
});
const now = new Date(2026, 9, 16); // 2026-10-16

test('같은 날 기록이 있으면 "n년 전 오늘"', () => {
  const m = pickMemory([trip({})], now);
  assert.equal(m?.trip.id, 'x');
  assert.equal(m?.label, '2년 전 오늘');
});

test('장소가 빈 옛 기록은 추억으로 고르지 않는다 (홈 카드가 첫 장소 이름을 쓰므로)', () => {
  // 옛 자료(v22)에는 places가 빈 여행이 남아 있을 수 있다. 홈은 placeLabel(memory.trip.places[0])로 네모 글자를 만든다
  const empty = trip({ id: 'empty', title: '어딘지 모를 여행', places: [], source: 'v22' });
  const m = pickMemory([empty], now);
  assert.doesNotThrow(() => m && placeLabel(m.trip.places[0]), '홈 추억 카드가 던지는 예외');
  assert.equal(m, null);
});

test('장소가 빈 기록은 건너뛰고 장소가 있는 기록을 고른다 (어느 단계에서든)', () => {
  for (const seed of [0, 1, 2, 3]) {
    const picked = pickMemory(
      [
        trip({ id: 'e1', places: [] }), // 같은 날
        trip({ id: 'e2', places: [], when: { p: 'month', y: 2024, m: 10 } }), // 같은 달
        trip({ id: 'e3', places: [], when: { p: 'season', y: 2023, s: 'autumn' } }), // 같은 계절
        trip({ id: 'e4', places: [], when: { p: 'year', y: 2022 } }), // 연도만
        trip({ id: 'e5', places: [], when: { p: 'unknown' } }), // 날짜 모름
        trip({ id: 'ok', when: { p: 'unknown' }, places: [{ t: 'country', id: 'JPN', city: '교토' }] }),
      ],
      now,
      seed,
    );
    assert.equal(picked?.trip.id, 'ok', `seed ${seed}`);
    assert.equal(picked?.label, '오늘은 교토를 다시 볼까요?');
  }
});

test('추억 카드의 한 줄 평: 그 여행 것 중 가장 짧은 것, 없으면 null', async () => {
  const { memoryLine } = await import('../../src/lib/memories');
  const rec = (over: object) => ({ id: 'r', name: '초당순두부', kind: 'food', region: { t: 'kr', code: '51150' }, reviews: {}, verdict: null, v: 1, ...over }) as never;
  const t = trip({});
  assert.equal(memoryLine(t, []), null);
  assert.equal(memoryLine(t, [rec({ tripId: 'other', reviews: { 보라: '좋아' } })]), null);
  const line = memoryLine(t, [rec({ tripId: 'x', reviews: { 보라: '아침으로 최고였어', 영상: ' 또 갈래 ' } }), rec({ tripId: 'x', name: '경포대', reviews: { 보라: '' } })]);
  assert.deepEqual(line, { who: '영상', text: '또 갈래', place: '초당순두부' });
});
