/**
 * 뒷단 문지기 (worker/src/guard.ts): 토큰 내용 검사 · 멤버 확인 결과 · 캐시 · 분당 횟수
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPayload, MEMBER_TTL_MS, memberDocUrl, memberFromStatus, RateCounter, TtlCache } from '../../worker/src/guard';

const PROJECTS = ['borapin', 'borapin-test'];
const now = 1_800_000_000;
const good = { aud: 'borapin', iss: 'https://securetoken.google.com/borapin', sub: 'uid-1', exp: now + 3000, iat: now - 60, email: 'bora@example.com', email_verified: true };

test('구글 로그인 토큰(메일 인증됨)은 통과하고 uid·프로젝트를 돌려준다', () => {
  const r = checkPayload(good, PROJECTS, now);
  assert.deepEqual(r, { ok: true, uid: 'uid-1', email: 'bora@example.com', project: 'borapin' });
  const t = checkPayload({ ...good, aud: 'borapin-test', iss: 'https://securetoken.google.com/borapin-test' }, PROJECTS, now);
  assert.equal(t.ok && t.project, 'borapin-test');
});

test('메일 인증이 안 된 토큰(이메일로 막 가입한 계정)은 거부한다', () => {
  assert.equal(checkPayload({ ...good, email_verified: false }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({ ...good, email_verified: undefined }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({ ...good, email_verified: 'true' }, PROJECTS, now).ok, false);
});

test('메일이 없는 토큰(익명 로그인)도 거부한다', () => {
  assert.equal(checkPayload({ ...good, email: undefined }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({ ...good, email: '' }, PROJECTS, now).ok, false);
});

test('만료·미래 발급·다른 프로젝트·uid 없음은 거부한다', () => {
  assert.equal(checkPayload({ ...good, exp: now }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({ ...good, iat: now + 600 }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({ ...good, aud: 'other' }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({ ...good, iss: 'https://securetoken.google.com/borapin-test' }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({ ...good, sub: '' }, PROJECTS, now).ok, false);
  assert.equal(checkPayload({}, PROJECTS, now).ok, false);
});

test('멤버 확인: 멤버 전용 문서를 토큰의 프로젝트로 읽고, 200만 멤버 · 401/403 아님 · 나머지는 모름', () => {
  assert.equal(memberDocUrl('borapin'), 'https://firestore.googleapis.com/v1/projects/borapin/databases/(default)/documents/config/access?mask.fieldPaths=updatedAt');
  assert.match(memberDocUrl('borapin-test'), /projects\/borapin-test\//);
  assert.equal(memberFromStatus(200), 'member');
  assert.equal(memberFromStatus(403), 'denied');
  assert.equal(memberFromStatus(401), 'denied');
  for (const s of [0, 404, 429, 500, 503]) assert.equal(memberFromStatus(s), 'unknown', String(s));
  assert.equal(MEMBER_TTL_MS.member, 3_600_000);
  assert.ok(MEMBER_TTL_MS.denied < MEMBER_TTL_MS.member);
});

test('캐시: 시간이 지나면 잊고, 개수가 차면 지난 것·오래된 것부터 버린다', () => {
  const c = new TtlCache<boolean>(3);
  c.set('a', true, 1000, 0);
  assert.equal(c.get('a', 999), true);
  assert.equal(c.get('a', 1000), undefined); // 만료
  c.set('a', true, 1000, 0);
  c.set('b', false, 10, 0);
  c.set('c', true, 1000, 0);
  c.set('d', true, 1000, 500); // 꽉 참 → 지난 b가 먼저 나간다
  assert.equal(c.get('b', 500), undefined);
  assert.equal(c.get('a', 500), true);
  assert.equal(c.get('d', 500), true);
  c.set('e', true, 1000, 500); // 지난 게 없으면 가장 오래된 a
  assert.equal(c.get('a', 500), undefined);
  assert.equal(c.get('e', 500), true);
  assert.equal(c.size, 3);
});

test('분당 횟수: 20번째까지 되고 21번째부터 막히며, 1분이 지나면 다시 된다 · 사람마다 따로', () => {
  const r = new RateCounter(20, 60_000);
  const t0 = 1_000_000;
  for (let i = 0; i < 20; i++) assert.equal(r.hit('u1', t0 + i * 100).ok, true, `${i + 1}번째`);
  const over = r.hit('u1', t0 + 30_000);
  assert.equal(over.ok, false);
  assert.equal(over.retryAfter, 30);
  assert.equal(r.hit('u2', t0 + 30_000).ok, true); // 다른 사람은 영향 없음
  assert.equal(r.hit('u1', t0 + 60_000).ok, true); // 새 창
});

test('분당 횟수표가 너무 커지면 지난 창부터 비운다', () => {
  const r = new RateCounter(5, 60_000, 3);
  r.hit('a', 0);
  r.hit('b', 0);
  r.hit('c', 0);
  r.hit('d', 61_000); // a·b·c는 지난 창 → 비우고 d
  assert.equal(r.size, 1);
  r.hit('e', 61_000);
  r.hit('f', 61_000);
  r.hit('g', 61_000); // 지난 것이 없으면 가장 오래된 것부터
  assert.equal(r.size, 3);
});
