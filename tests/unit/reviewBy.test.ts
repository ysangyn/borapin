import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DELETE, editsOf, withReviewBy } from '../../src/lib/tripActions';

const opened = { name: '소금빵집', reviews: { 영상: '짭짤' } };

test('내 한 줄 평을 쓰면 쓴 사람 uid도 함께 보낸다', () => {
  const e = withReviewBy(editsOf({ name: '소금빵집', reviews: {} }, { name: '소금빵집', reviews: { 보라: '버터 향' } }, { perPerson: ['reviews'], me: '보라' }), '보라', 'uid-bora');
  assert.deepEqual(e.find((x) => x.path[0] === 'reviewBy'), { path: ['reviewBy', '보라'], value: 'uid-bora' });
});

test('남의 칸만 바뀌었거나 내 평을 지울 땐 보내지 않는다', () => {
  const other = withReviewBy([{ path: ['reviews', '영상'], value: '바뀜' }], '보라', 'uid-bora');
  assert.equal(other.some((x) => x.path[0] === 'reviewBy'), false);
  const del = withReviewBy(editsOf(opened, { name: '소금빵집', reviews: {} }, { perPerson: ['reviews'], me: '영상' }), '영상', 'uid-ys');
  assert.deepEqual(del, [{ path: ['reviews', '영상'], value: DELETE }]);
});

test('로그인 정보가 없으면 그대로', () => {
  const e = [{ path: ['reviews', '보라'], value: '좋음' }];
  assert.equal(withReviewBy(e, '보라', undefined), e);
});

test('편집 저장은 폼에 없는 가게 번호·쓴 사람 칸을 지우지 않는다', () => {
  const was = { name: '소금빵집', ref: { src: 'kakao', id: '1' }, reviewBy: { 보라: 'u' }, reviews: { 보라: 'a' } };
  const e = editsOf(was, { name: '소금빵 가게', reviews: { 보라: 'a' } }, { perPerson: ['reviews'], me: '보라' });
  assert.deepEqual(e, [{ path: ['name'], value: '소금빵 가게' }]);
});
