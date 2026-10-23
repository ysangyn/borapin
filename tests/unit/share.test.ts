/**
 * F13 공유 사본: 공개 링크가 켜진 여행의 사진 설명·들른 곳·제목이 '어느 화면에서' 바뀌어도 사본(shares/{token})이 따라간다.
 * 가짜 Firestore(firebaseFake.ts) 위에서 src/lib/share.ts·photos.ts·data.ts를 그대로 돌린다.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { fake, lib } from './libLoader';
import type { Photo, PlaceRec, Trip } from '../../src/lib/types';

const share: typeof import('../../src/lib/share') = await lib('share.ts');
const photos: typeof import('../../src/lib/photos') = await lib('photos.ts');
const data: typeof import('../../src/lib/data') = await lib('data.ts');

const SP = 'spaces/main';
const trip = (over: Partial<Trip> = {}): Trip => ({
  id: 't1', title: '강릉 바다', kind: 'trip', status: 'done', when: { p: 'day', y: 2026, m: 5, d: 3 }, places: [{ t: 'kr', code: '51150' }],
  companions: ['엄마'], memo: '비밀 메모', tags: [], source: 'app', v: 1, share: { token: 'tok1' }, ...over,
});
const photo = (id: string, over: Partial<Photo> = {}): Photo => ({ id, tripId: 't1', w: 100, h: 80, taken: '2026-05-03T10:00', takenGuess: false, bytes: 1, v: 1, ...over });
const rec = (id: string, over: Partial<PlaceRec> = {}): PlaceRec => ({ id, name: '초당순두부', kind: 'food', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: {}, verdict: 'again', v: 1, ...over });
const user = { uid: 'u1', email: 'ysangyn@gmail.com', displayName: '영상' } as unknown as import('firebase/auth').User;

const strip = (p: Photo) => { const { id, ...rest } = p; void id; return rest; };
function seedShared() {
  fake.reset();
  const t = trip();
  const { id: _i, ...tdoc } = t; void _i;
  fake.seed(`${SP}/trips/t1`, tdoc);
  fake.seed(`${SP}/trips/t2`, { ...tdoc, title: '남의 여행', share: null });
  fake.seed(`${SP}/photos/p1`, strip(photo('p1')));
  fake.seed(`${SP}/photos/p2`, strip(photo('p2', { taken: '2026-05-03T09:00', caption: '바다' })));
  fake.seed(`${SP}/photos/p3`, strip(photo('p3', { tripId: 't2' })));
  for (const id of ['p1', 'p2', 'p3']) for (const s of ['l', 't']) fake.seed(`${SP}/photoData/${id}_${s}`, { photoId: id, kind: s, public: id !== 'p3' });
  const { id: _r, ...rdoc } = rec('r1'); void _r;
  fake.seed(`${SP}/places/r1`, rdoc);
  fake.seed(`${SP}/places/r2`, { ...rdoc, tripId: 't2', name: '남의 가게' });
  // 지금 올라가 있는 사본 (p2가 먼저: 촬영 시각 순)
  fake.seed('shares/tok1', { ...share.buildShared(t, [photo('p2', { taken: '2026-05-03T09:00', caption: '바다' }), photo('p1')], [rec('r1')]), updatedAt: fake.Timestamp.now() });
  fake.log.length = 0;
}
const sharedDoc = () => fake.docs.get('shares/tok1') as unknown as import('../../src/lib/types').SharedTrip;

beforeEach(seedShared);

test('가짜 Firestore가 src/lib와 같은 인스턴스를 본다 (바꿔 끼우기 확인)', async () => {
  const s = await share.loadShared('tok1');
  assert.equal(s?.title, '강릉 바다');
});

test('사본에는 제목·날짜·장소·사진(앞 60장, 설명 있는 것만 caption)·들른 곳만 들어가고 메모·동행은 없다', () => {
  const many = Array.from({ length: 70 }, (_, i) => photo(`p${i}`, { taken: `2026-05-03T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}` }));
  const d = share.buildShared(trip(), many, [rec('r1')]);
  assert.equal(d.photos.length, 60);
  assert.equal(d.title, '강릉 바다');
  assert.deepEqual(d.spots, [{ name: '초당순두부', kind: 'food', verdict: 'again' }]);
  assert.ok(!('memo' in d) && !('companions' in d));
  const withCap = share.buildShared(trip(), [photo('a', { caption: '노을' }), photo('b')], []);
  assert.deepEqual(withCap.photos.map((p) => 'caption' in p), [true, false]);
});

test('사진·장소를 다른 순서로 넘겨도 사본은 같다 — 화면과 저장 뒤 갱신이 서로 덮어쓰지 않게', () => {
  const ps = [photo('b', { taken: '2026-05-03T11:00' }), photo('a', { taken: '2026-05-03T10:00' })];
  const rs = [rec('r2', { name: '카페', createdAt: fake.Timestamp.fromMillis(2000) as never }), rec('r1', { createdAt: fake.Timestamp.fromMillis(1000) as never })];
  const one = share.buildShared(trip(), ps, rs);
  const two = share.buildShared(trip(), [...ps].reverse(), [...rs].reverse());
  assert.deepEqual(one, two);
  assert.deepEqual(one.photos.map((p) => p.id), ['a', 'b']);
});

test('바뀐 게 없으면 사본을 쓰지 않는다 (읽기 1·쓰기 0)', async () => {
  await share.syncShare(trip(), [photo('p2', { taken: '2026-05-03T09:00', caption: '바다' }), photo('p1')], [rec('r1')]);
  assert.equal(fake.reads('read', 'shares/'), 1);
  assert.equal(fake.reads('write'), 0);
});

test('사진 설명을 저장하면(슬라이드쇼 등 어느 화면이든) 공개 중인 여행의 사본이 따라온다', async () => {
  await photos.captionPhoto('p1', '  첫날 아침  ');
  await share.whenShareSynced();
  assert.equal((fake.docs.get(`${SP}/photos/p1`) as { caption: string }).caption, '첫날 아침');
  assert.deepEqual(sharedDoc().photos.map((p) => [p.id, p.caption]), [['p2', '바다'], ['p1', '첫날 아침']]);
});

test('공개하지 않은 여행의 사진 설명은 사본도, 사진 전체 읽기도 건드리지 않는다', async () => {
  await photos.captionPhoto('p3', '남의 것');
  await share.whenShareSynced();
  assert.equal(fake.reads('write', 'shares/'), 0);
  assert.equal(fake.reads('read', `${SP}/photos/`), 0);
});

test('들른 곳(우리 장소)을 고치거나 새로 남기면 사본의 들른 곳이 따라온다', async () => {
  await data.updatePlace('r1', rec('r1'), { ...rec('r1'), verdict: 'once' }, '영상');
  await share.whenShareSynced();
  assert.deepEqual(sharedDoc().spots, [{ name: '초당순두부', kind: 'food', verdict: 'once' }]);

  await data.createPlace({ name: '안목 카페', kind: 'cafe', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: {}, verdict: null }, user);
  await share.whenShareSynced();
  assert.deepEqual(sharedDoc().spots.map((s) => s.name).sort(), ['안목 카페', '초당순두부']);
});

test('여행 고치기(제목)와 일부 고치기(장소)도 사본에 반영된다', async () => {
  const opened = trip();
  const { id: _i, createdAt: _c, updatedAt: _u, createdBy: _b, ...input } = { ...opened, title: '강릉 봄 바다' };
  void _i; void _c; void _u; void _b;
  await data.updateTrip('t1', opened, input);
  await share.whenShareSynced();
  assert.equal(sharedDoc().title, '강릉 봄 바다');

  await data.patchTrip('t1', { places: [{ t: 'kr', code: '51150' }, { t: 'kr', code: '51210' }] });
  await share.whenShareSynced();
  assert.equal(sharedDoc().places.length, 2);
});

test('사본 갱신이 실패해도 원래 저장은 성공한 채로 조용히 넘어간다', async () => {
  fake.net.failWrites = /^shares\//;
  await photos.captionPhoto('p1', '실패해도');
  await share.whenShareSynced();
  assert.equal((fake.docs.get(`${SP}/photos/p1`) as { caption: string }).caption, '실패해도');
  assert.equal(sharedDoc().photos.find((p) => p.id === 'p1')?.caption, undefined);
});
