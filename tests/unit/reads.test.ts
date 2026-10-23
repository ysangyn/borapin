/**
 * F11 읽기 횟수: 홈 단계 카드는 '그 여행'의 개수만, 아래 메뉴 하트 점은 최근 것만, 물어보기는 한 번만 읽는다.
 * 가짜 Firestore(firebaseFake.ts)로 어떤 읽기가 몇 번 일어나는지 센다.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { fake, lib } from './libLoader';

const tripExtras: typeof import('../../src/lib/tripExtras') = await lib('tripExtras.ts');
const photos: typeof import('../../src/lib/photos') = await lib('photos.ts');
const hearts: typeof import('../../src/lib/hearts') = await lib('hearts.ts');

const SP = 'spaces/main';
beforeEach(() => {
  fake.reset();
  for (let i = 0; i < 30; i++) fake.seed(`${SP}/photos/p${i}`, { tripId: i < 7 ? 't1' : 't2', taken: `2026-05-0${(i % 9) + 1}T10:${String(i).padStart(2, '0')}`, w: 1, h: 1, bytes: 1, v: 1 });
  for (let i = 0; i < 12; i++) fake.seed(`${SP}/notes/n${i}`, { tripId: i < 3 ? 't1' : 't2', text: `글 ${i}`, by: { uid: 'u', name: '영상' }, v: 1 });
  for (let i = 0; i < 5; i++) fake.seed(`${SP}/plans/l${i}`, { tripId: 't1', name: `일정 ${i}`, order: i, v: 1 });
  fake.log.length = 0;
});

// ---------- 홈 단계 카드: 그 여행의 사진·글 '개수'만 (사진·글 전체 구독 대신) ----------
test('여행 하나의 사진 수는 서버 집계 1번으로 센다 — 사진 문서를 한 장도 받지 않는다', async () => {
  const n = await photos.countTripPhotos('t1');
  assert.equal(n, 7);
  assert.equal(fake.reads('count'), 1);
  assert.equal(fake.reads('read'), 0);
  assert.equal(fake.listens.length, 0);
});

test('글 수도 집계 1번. 오프라인이면 기기 캐시에서 세고(읽기 0), 캐시도 못 쓰면 null', async () => {
  assert.equal(await tripExtras.countTripNotes('t1'), 3);
  assert.equal(fake.reads('count'), 1);
  fake.net.offline = true;
  fake.log.length = 0;
  assert.equal(await tripExtras.countTripNotes('t1'), 3);
  assert.equal(fake.reads('read'), 0);
  assert.equal(fake.reads('count'), 0);
  for (let i = 0; i < 3; i++) fake.notCached.add(`${SP}/notes/n${i}`);
  // 캐시에 그 여행 글이 하나도 없으면 0이 아니라 '모름'
  assert.equal(await tripExtras.countTripNotes('t1'), null);
});

// ---------- 아래 메뉴 하트 점: 최근 것만 ----------
test('새 소식 점용 하트 구독은 최근 50개만 (at 내림차순 + limit)', () => {
  const q = hearts.recentHeartsQuery() as unknown as { constraints: unknown[] };
  assert.deepEqual(q.constraints, [{ kind: 'orderBy', field: 'at', dir: 'desc' }, { kind: 'limit', n: 50 }]);
  assert.equal(hearts.RECENT_HEARTS, 50);
});

test('남이 누른 하트 중 마지막으로 본 뒤의 것만 센다 (최근 50개 안에서)', () => {
  const at = (ms: number) => fake.Timestamp.fromMillis(ms) as unknown as import('firebase/firestore').Timestamp;
  const map = new Map<string, import('../../src/lib/hearts').Heart>([
    ['a', { key: 'a', by: { me: '영상' }, at: at(5000) }], // 내 것
    ['b', { key: 'b', by: { you: '보라' }, at: at(5000) }], // 남의 것, 본 뒤
    ['c', { key: 'c', by: { you: '보라' }, at: at(1000) }], // 남의 것, 보기 전
    ['d', { key: 'd', by: { you: '보라' } }], // 시각 없음(옛 자료) → 안 셈
  ]);
  assert.equal(hearts.unseenHearts(map, 3000, 'me'), 1);
  assert.equal(hearts.unseenHearts(null, 3000, 'me'), 0);
});

// ---------- 물어보기: 질문할 때 한 번만 읽기 ----------
test('물어보기 자료(사진·글·일정)는 구독이 아니라 한 번 읽기로, 사진은 촬영 순', async () => {
  const [ph, no, pl] = await Promise.all([photos.readPhotosOnce(), tripExtras.readNotesOnce(), tripExtras.readPlansOnce()]);
  assert.equal(ph.length, 30);
  assert.equal(no.length, 12);
  assert.equal(pl.length, 5);
  assert.equal(fake.listens.length, 0, '구독을 켜지 않는다');
  assert.equal(fake.reads('read'), 47);
  const takens = ph.map((p) => p.taken ?? '');
  assert.deepEqual(takens, [...takens].sort());
});
