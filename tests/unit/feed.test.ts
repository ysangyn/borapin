import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ago, buildFeed, unseenCount } from '../../src/lib/feed';
import type { Note, Photo, PlaceRec, Trip } from '../../src/lib/types';

const T = (ms: number) => ({ toMillis: () => ms }) as unknown as Trip['createdAt'];
const day = 86400000;
const now = Date.UTC(2026, 9, 16, 12);
const by = (name: string) => ({ uid: name, email: `${name}@x.com`, name });
const trip = (id: string, at: number): Trip => ({ id, title: `${id} 여행`, kind: 'trip', status: 'done', when: { p: 'unknown' }, places: [{ t: 'kr', code: '51150' }], companions: [], memo: '', tags: [], source: 'app', v: 1, createdBy: by('영상'), createdAt: T(at) });
const photo = (id: string, tripId: string, at: number, name: string, caption?: string): Photo => ({ id, tripId, w: 1, h: 1, taken: null, takenGuess: false, bytes: 1, v: 1, createdBy: by(name), createdAt: T(at), caption });

test('같은 사람이 같은 여행에 같은 날 올린 사진은 한 묶음, 최신 것이 먼저', () => {
  const t = trip('a', now - 10 * day);
  const items = buildFeed({
    trips: [t],
    photos: [photo('1', 'a', now - 2 * day, '보라', '바다!'), photo('2', 'a', now - 2 * day + 1000, '보라'), photo('3', 'a', now - 1 * day, '영상')],
    notes: [{ id: 'n', tripId: 'a', text: '좋았다', by: { uid: 'u', name: '영상' }, createdAt: T(now - 3 * day), v: 1 } as Note],
    recs: [{ id: 'r', name: '순두부', kind: 'food', region: { t: 'kr', code: '51150' }, tripId: 'a', reviews: { 보라: '고소' }, v: 1, createdBy: by('보라'), createdAt: T(now - 5 * day) } as unknown as PlaceRec],
    wishes: [],
  });
  assert.deepEqual(items.map((i) => i.kind), ['photos', 'photos', 'note', 'place', 'trip']);
  const first = items[0] as Extract<typeof items[number], { kind: 'photos' }>;
  assert.equal(first.by, '영상');
  const second = items[1] as Extract<typeof items[number], { kind: 'photos' }>;
  assert.equal(second.photos.length, 2);
  assert.deepEqual(second.captions, ['바다!']);
  const place = items[3] as Extract<typeof items[number], { kind: 'place' }>;
  assert.equal(place.review, '고소');
});

test('시각이 없는 기록은 피드에 안 나온다', () => {
  const t = trip('a', 0);
  assert.deepEqual(buildFeed({ trips: [t], photos: [], notes: [], recs: [], wishes: [] }), []);
});

test('얼마 전: 방금·분·시간·어제·일·날짜', () => {
  assert.equal(ago(now - 20_000, now), '방금');
  assert.equal(ago(now - 12 * 60_000, now), '12분 전');
  assert.equal(ago(now - 3 * 3600_000, now), '3시간 전');
  assert.equal(ago(now - day, now), '어제');
  assert.equal(ago(now - 5 * day, now), '5일 전');
  assert.match(ago(now - 40 * day, now), /^9월 \d+일$/);
  assert.match(ago(now - 400 * day, now), /^2025년 /);
});

test('안 본 소식 수: 마지막으로 본 뒤에 남이 남긴 것만', () => {
  const t = trip('a', now - 10 * day);
  const items = buildFeed({ trips: [t], photos: [photo('1', 'a', now - day, '보라'), photo('2', 'a', now - 2 * day, '영상')], notes: [], recs: [], wishes: [] });
  assert.equal(unseenCount(items, now - 3 * day, '영상'), 1);
  assert.equal(unseenCount(items, now, '영상'), 0);
});

test('잇따라 담은 가고 싶은 곳은 한 묶음, 날짜 머리글', async () => {
  const { mergeBursts, dayHeading } = await import('../../src/lib/feed');
  const w = (id: string) => ({ id, place: { t: 'kr', code: '11' }, priority: null, spots: [], todos: [], foods: [], note: '', source: 'app' }) as never;
  const t0 = Date.UTC(2026, 9, 16, 12);
  const items = [
    { kind: 'wish', at: t0, by: '영상', wish: w('a') },
    { kind: 'wish', at: t0 - 60_000, by: '영상', wish: w('b') },
    { kind: 'wish', at: t0 - 120_000, by: '보라', wish: w('c') },
    { kind: 'wish', at: t0 - 5 * 3600_000, by: '영상', wish: w('d') },
  ] as never[];
  const merged = mergeBursts(items as never);
  assert.deepEqual(merged.map((i) => i.kind), ['wishes', 'wish', 'wish']);
  assert.equal((merged[0] as { wishes: unknown[] }).wishes.length, 2);
  assert.equal(dayHeading(t0, t0), '오늘');
  assert.equal(dayHeading(t0 - 86400000, t0), '어제');
  assert.match(dayHeading(t0 - 10 * 86400000, t0), /^10월 6일$/);
});
