import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPub, monthOf, myLine, nameNeedsRetype, pubBlock, pubId, summarize } from '../../src/lib/pubShape';
import type { PlaceRec } from '../../src/lib/types';

const ts = (ms: number) => ({ toMillis: () => ms }) as unknown as PlaceRec['createdAt'];
const base: PlaceRec = {
  id: 'p1', name: '정성당', kind: 'food', tag: '빵집', region: { t: 'kr', code: '42150' }, status: 'been',
  reviews: { 영상: '소금빵이 짭짤해요', 보라: '줄이 길어요' }, reviewBy: { 영상: 'u1', 보라: 'u2' },
  verdict: 'again', ref: { src: 'kakao', id: '12345' }, memo: '비밀 메모', lat: 37.7, lng: 128.9, address: '강릉 어딘가',
  createdAt: ts(Date.UTC(2026, 10, 25)), v: 1,
};

test('공개할 수 있는지: 다녀온 곳, 또 갈래요·한 번이면 충분, 가게 번호가 있어야', () => {
  assert.equal(pubBlock(base), null);
  assert.match(pubBlock({ ...base, status: 'want' })!, /다녀온/);
  assert.match(pubBlock({ ...base, verdict: 'meh' })!, /또 갈래요/);
  assert.match(pubBlock({ ...base, verdict: null })!, /또 갈래요/);
  assert.match(pubBlock({ ...base, ref: null })!, /근처 목록/);
  assert.equal(pubBlock({ ...base, ref: null, naverUrl: 'https://map.naver.com/p/entry/place/987' }), null);
});

test('내 한 줄만: 이름이 같아도 쓴 사람 uid가 나여야', () => {
  assert.equal(myLine(base, '영상', 'u1'), '소금빵이 짭짤해요');
  assert.equal(myLine(base, '보라', 'u1'), '');
  assert.equal(myLine({ ...base, reviewBy: undefined }, '영상', 'u1'), '소금빵이 짭짤해요');
});

test('카카오 이름이 들어 있을 수 있는 옛 기록(11-22 전 카카오 번호)은 이름을 다시 적게 한다', () => {
  assert.equal(nameNeedsRetype(base), false);
  assert.equal(nameNeedsRetype({ ...base, createdAt: ts(Date.UTC(2026, 10, 20)) }), true);
  assert.equal(nameNeedsRetype({ ...base, createdAt: null }), true);
  assert.equal(nameNeedsRetype({ ...base, ref: { src: 'naver', id: '9' }, createdAt: ts(Date.UTC(2026, 0, 1)) }), false);
});

test('달까지만: 여행 달이 먼저, 없으면 남긴 달', () => {
  assert.equal(monthOf(base, { p: 'day', y: 2026, m: 3, d: 5 }), '2026-03');
  assert.equal(monthOf(base, null), '2026-11');
  assert.equal(monthOf({ ...base, createdAt: null }, null, new Date(2027, 0, 9)), '2027-01');
});

test('공개 사본: 메모·자리·주소·함께 간 사람은 빠지고, 시각 칸도 없다', () => {
  const d = buildPub(base, { uid: 'u1', nick: '영상', spaceId: 'main', name: '정성당', line: '소금빵이 짭짤해요', month: '2026-11' });
  assert.deepEqual(Object.keys(d).sort(), ['hidden', 'kind', 'line', 'month', 'name', 'nick', 'placeKey', 'region', 'spaceId', 'tag', 'uid', 'v', 'verdict'].sort());
  assert.equal(d.placeKey, 'k12345');
  assert.equal(pubId('k12345', 'u1'), 'k12345_u1');
  assert.equal(d.hidden, false);
  assert.ok(!('memo' in d) && !('lat' in d) && !('address' in d) && !('at' in d));
  assert.equal(buildPub({ ...base, tag: undefined }, { uid: 'u1', nick: 'x'.repeat(20), spaceId: 'main', name: ' 이름 ', line: 'y'.repeat(300), month: '2026-11' }).nick.length, 10);
});

test('가게별 모아 보기: 또 갈래요·한 번이면 충분 수 (가린 사람 평은 뺀다)', () => {
  const list = [{ uid: 'a', verdict: 'again' }, { uid: 'b', verdict: 'again' }, { uid: 'c', verdict: 'once' }] as const;
  assert.deepEqual(summarize([...list], new Set()), { again: 2, once: 1 });
  assert.deepEqual(summarize([...list], new Set(['a'])), { again: 1, once: 1 });
});

test('공개 사진 칸: 평 이름_0 · _1 둘뿐, 빈 칸부터', async () => {
  const { freePhotoSlot } = await import('../../src/lib/pubShape');
  assert.equal(freePhotoSlot('k1_u', []), 'k1_u_0');
  assert.equal(freePhotoSlot('k1_u', ['k1_u_0']), 'k1_u_1');
  assert.equal(freePhotoSlot('k1_u', ['k1_u_1']), 'k1_u_0');
  assert.equal(freePhotoSlot('k1_u', ['k1_u_0', 'k1_u_1']), null);
});
