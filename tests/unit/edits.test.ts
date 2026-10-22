/**
 * 편집 화면 저장: 고친 칸만 보내기 (src/lib/tripActions.ts editsOf · restoreFields)
 * 둘이 같은 기록을 동시에 고쳐도 서로 지우지 않아야 한다.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DELETE, editsOf, restoreFields } from '../../src/lib/tripActions';

// 화면을 연 때의 문서(스냅샷). 폼 초기값은 여기서 나온다
const opened = { name: '초당할머니순두부', kind: 'food', memo: '아침', verdict: null, reviews: { 영상: '최고' } };
const reviews = { perPerson: ['reviews'], me: '영상' };

test('내가 안 바꾼 칸은 보내지 않는다 (상대가 그사이 고친 칸이 내 옛 값으로 덮이지 않게)', () => {
  // 메모만 고쳤다 → 메모만 간다
  assert.deepEqual(editsOf(opened, { ...opened, memo: '아침 최고' }), [{ path: ['memo'], value: '아침 최고' }]);
  // 아무것도 안 고쳤으면 아무것도 안 간다 (없음·null·빈 글은 같은 것으로 본다)
  assert.deepEqual(editsOf(opened, { ...opened, verdict: undefined, naverUrl: undefined, tripId: null, address: '' }), []);
  // 비운 선택 칸은 지운다 (연 때 있었을 때만)
  assert.deepEqual(editsOf({ ...opened, naverUrl: 'https://naver.me/x' }, { ...opened, naverUrl: undefined }), [{ path: ['naverUrl'], value: DELETE }]);
  // 연 때 문서에 있어도 폼에 없는 칸(createdBy 등)은 건드리지 않는다
  assert.deepEqual(editsOf({ ...opened, createdBy: { uid: 'u' } }, { ...opened }), []);
});

test('상대 한 줄 평은 지워지지 않는다: 바뀐 이름 칸만 점 경로로, 지우는 건 내 칸뿐', () => {
  // 내가 화면을 연 뒤 보라가 자기 한 줄 평을 남겼다 → 최신 문서에는 있고 내 폼에는 없다
  const live = { ...opened, reviews: { 영상: '최고', 보라: '고소해요' } };
  const mine = { ...opened, reviews: { 영상: '최고!' } };
  // 연 때 문서를 넘기면 내 칸만 간다 (reviews 통째가 아니라 reviews.영상)
  assert.deepEqual(editsOf(opened, mine, reviews), [{ path: ['reviews', '영상'], value: '최고!' }]);
  // 실수로 최신 문서를 넘겨도 보라 칸을 지우지 않는다
  assert.deepEqual(editsOf(live, mine, reviews), [{ path: ['reviews', '영상'], value: '최고!' }]);
  // 내 칸을 비우면 내 칸만 지운다
  assert.deepEqual(editsOf(opened, { ...opened, reviews: {} }, reviews), [{ path: ['reviews', '영상'], value: DELETE }]);
  // 남의 칸을 비워도 지우지 않는다
  assert.deepEqual(editsOf(live, { ...opened, reviews: { 영상: '최고' } }, reviews), []);
  // 남의 칸에 대신 써 준 글은 그 칸만 간다 (만들 때처럼 둘 것을 한 사람이 적는 경우)
  assert.deepEqual(editsOf(opened, { ...opened, reviews: { 영상: '최고', 보라: '고소' } }, reviews), [{ path: ['reviews', '보라'], value: '고소' }]);
  // 이름을 모르면(로그인 전) 아무 칸도 지우지 않는다
  assert.deepEqual(editsOf(opened, { ...opened, reviews: {} }, { perPerson: ['reviews'] }), []);
});

test('되돌리기: createdAt(Timestamp)은 그대로 두고 undefined 칸만 뺀다', () => {
  const ts = { toMillis: () => 1_700_000_000_000 };
  const out = restoreFields({ name: '슈츠', memo: undefined, createdAt: ts, createdBy: { uid: 'u', name: '보라' }, region: { t: 'kr', code: '47850' } });
  // JSON 복사로 일반 객체가 되면 피드·정렬(createdAt.toMillis)에서 빠진다
  assert.equal(out.createdAt, ts);
  assert.ok(!('memo' in out));
  assert.deepEqual(out.region, { t: 'kr', code: '47850' });
  assert.deepEqual(out.createdBy, { uid: 'u', name: '보라' });
});
