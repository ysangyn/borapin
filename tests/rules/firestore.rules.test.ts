/**
 * Firestore 보안 규칙 시험 (에뮬레이터에 실제 firestore.rules를 올려서)
 * 허용돼야 하는 경우와 막혀야 하는 경우를 둘 다 확인한다.
 *
 * 실행: npm run test:rules  (firebase emulators:exec 안에서 node --test)
 */
import { after, before, beforeEach, describe, test } from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { Bytes, FieldPath, arrayUnion, collection, deleteDoc, deleteField, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch, type Firestore } from 'firebase/firestore';

const OWNER = 'ysangyn@gmail.com';
const BORA = 'bora@example.com';
const STRANGER = 'stranger@example.com';

let env: RulesTestEnvironment;

const trip = (over: Record<string, unknown> = {}) => ({
  title: '강릉 바다 여행', kind: 'trip', status: 'done', when: { y: 2024 }, places: [{ t: 'kr', code: '51150' }], v: 1, ...over,
});

// 사람별 Firestore (토큰 내용이 규칙의 request.auth가 된다)
const as = {
  anon: () => env.unauthenticatedContext().firestore() as unknown as Firestore,
  owner: () => env.authenticatedContext('owner', { email: OWNER, email_verified: true }).firestore() as unknown as Firestore,
  bora: () => env.authenticatedContext('bora', { email: BORA, email_verified: true }).firestore() as unknown as Firestore,
  boraUpper: () => env.authenticatedContext('bora', { email: 'Bora@Example.com', email_verified: true }).firestore() as unknown as Firestore,
  boraUnverified: () => env.authenticatedContext('bora-unverified', { email: BORA, email_verified: false }).firestore() as unknown as Firestore,
  stranger: () => env.authenticatedContext('stranger', { email: STRANGER, email_verified: true }).firestore() as unknown as Firestore,
};
const T = (db: Firestore, id = 't1') => doc(db, 'spaces/main/trips', id);

before(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
  env = await initializeTestEnvironment({
    projectId: 'demo-borapin-rules',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8'), host, port: Number(port) },
  });
});
after(async () => {
  await env?.cleanup();
});

// 매 시험마다 같은 출발점: 주인 + 보라가 함께 쓰는 공간, 여행 1개, 글 1개, 공유 1개, 사진 파일 2개
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore() as unknown as Firestore;
    await setDoc(doc(db, 'config/access'), { allowed: [OWNER, BORA], admins: [OWNER], names: {} });
    await setDoc(doc(db, 'config/flags'), { uploadsPaused: false });
    await setDoc(T(db), trip());
    await setDoc(doc(db, 'spaces/main/notes/n-owner'), { tripId: 't1', text: '영상이 쓴 글', by: { uid: 'owner', name: '영상' }, v: 1 });
    await setDoc(doc(db, 'shares/tok1'), { title: '공개 여행', when: '2024', places: [], photos: [], v: 1 });
    await setDoc(doc(db, 'spaces/main/photoData/p1_l'), { photoId: 'p1', tripId: 't1', kind: 'l', data: Bytes.fromUint8Array(new Uint8Array([1, 2, 3])), size: 3, public: false, v: 1 });
    await setDoc(doc(db, 'spaces/main/photoData/p2_l'), { photoId: 'p2', tripId: 't1', kind: 'l', data: Bytes.fromUint8Array(new Uint8Array([4, 5, 6])), size: 3, public: true, v: 1 });
  });
});

const photoFile = (id: string, over: Record<string, unknown> = {}) => ({
  photoId: id, tripId: 't1', kind: 'l', data: Bytes.fromUint8Array(new Uint8Array([9, 9, 9])), size: 3, public: false, v: 1, ...over,
});

describe('로그인 안 한 사람', () => {
  test('여행을 읽지도 쓰지도 못한다', async () => {
    await assertFails(getDoc(T(as.anon())));
    await assertFails(getDocs(collection(as.anon(), 'spaces/main/trips')));
    await assertFails(setDoc(T(as.anon(), 't2'), trip()));
  });
  test('함께 쓰는 사람 목록을 볼 수 없다', async () => {
    await assertFails(getDoc(doc(as.anon(), 'config/access')));
  });
  test('공개 링크는 토큰을 알면 하나씩 읽고, 목록으로는 못 본다', async () => {
    await assertSucceeds(getDoc(doc(as.anon(), 'shares/tok1')));
    await assertFails(getDocs(collection(as.anon(), 'shares')));
    await assertFails(setDoc(doc(as.anon(), 'shares/tok2'), { title: 'x', when: '', places: [], photos: [], v: 1 }));
  });
  test('공개된 사진 파일만 읽고, 비공개 사진은 못 본다', async () => {
    await assertSucceeds(getDoc(doc(as.anon(), 'spaces/main/photoData/p2_l')));
    await assertFails(getDoc(doc(as.anon(), 'spaces/main/photoData/p1_l')));
    await assertFails(getDocs(collection(as.anon(), 'spaces/main/photoData')));
  });
});

describe('초대 안 된 계정 (다른 사람)', () => {
  test('우리 여행을 읽거나 쓸 수 없다', async () => {
    await assertFails(getDoc(T(as.stranger())));
    await assertFails(getDocs(collection(as.stranger(), 'spaces/main/trips')));
    await assertFails(setDoc(T(as.stranger(), 't2'), trip()));
    await assertFails(updateDoc(T(as.stranger()), { title: '바꿔치기' }));
    await assertFails(deleteDoc(T(as.stranger())));
  });
  test('자기를 함께 쓰는 사람에 넣을 수 없다', async () => {
    await assertFails(updateDoc(doc(as.stranger(), 'config/access'), { allowed: [OWNER, BORA, STRANGER] }));
  });
  test('비공개 사진·글·문제 신고에 닿지 못한다', async () => {
    await assertFails(getDoc(doc(as.stranger(), 'spaces/main/photoData/p1_l')));
    await assertFails(getDoc(doc(as.stranger(), 'spaces/main/notes/n-owner')));
    await assertFails(setDoc(doc(as.stranger(), 'reports/r1'), { kind: 'report', message: '안녕' }));
  });
});

describe('메일 인증을 안 한 초대 계정', () => {
  test('인증 전에는 초대된 메일이라도 못 들어온다', async () => {
    await assertFails(getDoc(T(as.boraUnverified())));
    await assertFails(setDoc(T(as.boraUnverified(), 't2'), trip()));
  });
});

describe('함께 쓰는 사람 (보라)', () => {
  test('여행을 읽고 만들고 고치고 지운다', async () => {
    const db = as.bora();
    await assertSucceeds(getDoc(T(db)));
    await assertSucceeds(getDocs(collection(db, 'spaces/main/trips')));
    await assertSucceeds(setDoc(T(db, 't2'), trip({ title: '경주 여행' })));
    await assertSucceeds(updateDoc(T(db, 't2'), { title: '경주 벚꽃 여행' }));
    await assertSucceeds(deleteDoc(T(db, 't2')));
  });
  test('장소: 사진 주소는 https만, 좌표는 범위 안만', async () => {
    const db = as.bora();
    const P = (id: string) => doc(db, `spaces/main/places/${id}`);
    const place = (over: Record<string, unknown> = {}) => ({ name: '슈츠', kind: 'cafe', region: { t: 'kr', code: '47850' }, reviews: {}, verdict: null, v: 1, ...over });
    await assertSucceeds(setDoc(P('p1'), place({ photoUrl: 'https://search.pstatic.net/x.jpg', lat: 35.99, lng: 128.57 })));
    await assertFails(setDoc(P('p2'), place({ photoUrl: 'javascript:alert(1)' })));
    await assertFails(setDoc(P('p3'), place({ photoUrl: 'http://x.example/a.jpg' })));
    await assertFails(setDoc(P('p4'), place({ lat: 135, lng: 128 })));
    await assertFails(setDoc(P('p5'), place({ lng: '128' })));
  });
  test('우리 집: 국내 위경도와 정해진 칸만 저장된다', async () => {
    const db = as.bora();
    const S = doc(db, 'spaces/main');
    await assertSucceeds(setDoc(S, { name: '보라 & 영상', v: 1, home: { label: '고양시 일산동구', code: '41285', lat: 37.66, lng: 126.77, exact: false } }, { merge: true }));
    await assertFails(setDoc(S, { name: '보라 & 영상', v: 1, home: { label: '집', code: '41285', lat: 37.66, lng: 126.77, exact: false, addr: '자세한 주소' } }, { merge: true }));
    await assertFails(setDoc(S, { name: '보라 & 영상', v: 1, home: { label: '집', code: '41285', lat: 48.8, lng: 2.3, exact: false } }, { merge: true }));
    await assertFails(setDoc(doc(as.stranger(), 'spaces/main'), { name: 'x', home: { label: '집', code: '1', lat: 37.5, lng: 127, exact: false } }, { merge: true }));
  });
  test('메일 대소문자가 달라도 같은 사람으로 본다', async () => {
    await assertSucceeds(getDoc(T(as.boraUpper())));
  });
  test('규칙에 맞지 않는 여행은 저장되지 않는다', async () => {
    const db = as.bora();
    await assertFails(setDoc(T(db, 'bad1'), trip({ title: 'x'.repeat(101) })));
    await assertFails(setDoc(T(db, 'bad2'), trip({ kind: 'party' })));
    await assertFails(setDoc(T(db, 'bad3'), trip({ places: [] })));
    await assertFails(setDoc(T(db, 'bad4'), { title: '장소 없음', v: 1 }));
  });
  test('우리 공간(main) 말고 다른 공간은 만들거나 읽지 못한다', async () => {
    const db = as.bora();
    await assertFails(setDoc(doc(db, 'spaces/other/trips/t1'), trip()));
    await assertFails(getDoc(doc(db, 'spaces/other/trips/t1')));
    await assertFails(setDoc(doc(db, 'spaces/other'), { name: '남의 공간' }));
  });
  test('규칙에 없는 곳에는 쓰지 못한다', async () => {
    await assertFails(setDoc(doc(as.bora(), 'users/bora'), { a: 1 }));
  });
  test('관리자가 아니면 함께 쓰는 사람·앱 스위치를 바꾸지 못한다 (보기는 된다)', async () => {
    const db = as.bora();
    await assertSucceeds(getDoc(doc(db, 'config/access')));
    await assertFails(updateDoc(doc(db, 'config/access'), { allowed: [OWNER, BORA, STRANGER] }));
    await assertSucceeds(getDoc(doc(db, 'config/flags')));
    await assertFails(setDoc(doc(db, 'config/flags'), { uploadsPaused: true }));
  });
  test('멤버는 앱에서 쓸 자기 이름만 바꾼다 (남의 이름·허용 목록은 못 바꿈, 10자 넘으면 안 됨)', async () => {
    const db = as.bora();
    await assertSucceeds(updateDoc(doc(db, 'config/access'), { [`names.${BORA}`]: '보라공주' }));
    await assertFails(updateDoc(doc(db, 'config/access'), { [`names.${OWNER}`]: '남편' }));
    await assertFails(updateDoc(doc(db, 'config/access'), { [`names.${BORA}`]: '열자가넘는이름이에요정말' }));
    await assertFails(updateDoc(doc(db, 'config/access'), { [`names.${BORA}`]: '보라', allowed: [OWNER, BORA, STRANGER] }));
  });
  test('글은 자기 이름으로만 쓰고, 자기 글만 지운다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'spaces/main/notes/n-bora'), { tripId: 't1', text: '보라 글', by: { uid: 'bora', name: '보라' }, v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/notes/n-fake'), { tripId: 't1', text: '남의 이름으로', by: { uid: 'owner', name: '영상' }, v: 1 }));
    await assertFails(deleteDoc(doc(db, 'spaces/main/notes/n-owner')));
    await assertFails(updateDoc(doc(db, 'spaces/main/notes/n-bora'), { text: '고쳐 쓰기' }));
    await assertSucceeds(deleteDoc(doc(db, 'spaces/main/notes/n-bora')));
  });
  test('장소 한 줄 평: 이름별 점 경로(reviews.이름)로 고쳐도 되고, 상대 칸은 그대로 남는다', async () => {
    const db = as.bora();
    const P = doc(db, 'spaces/main/places/p1');
    await assertSucceeds(setDoc(P, { name: '슈츠', kind: 'cafe', region: { t: 'kr', code: '47850' }, reviews: { 영상: '최고' }, verdict: null, v: 1 }));
    // 앱(data.ts patchEdits)은 고친 칸만 FieldPath로 보낸다: 내 칸 쓰기 → 지우기 → 다시 쓰기
    await assertSucceeds(updateDoc(P, new FieldPath('reviews', '보라'), '고소해요', 'updatedAt', 1));
    await assertSucceeds(updateDoc(P, new FieldPath('reviews', '보라'), deleteField(), 'updatedAt', 2));
    await assertSucceeds(updateDoc(P, new FieldPath('reviews', '보라'), '다시 씀', 'memo', '줄 30분', 'updatedAt', 3));
    const after = await getDoc(doc(as.owner(), 'spaces/main/places/p1'));
    assert.deepEqual(after.data()?.reviews, { 영상: '최고', 보라: '다시 씀' });
    // 한 줄 평이 11명분이 되는 점 경로 쓰기는 막힌다 (validPlace는 고친 뒤 문서 전체를 본다)
    const many = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`사람${i}`, '글']));
    await assertSucceeds(updateDoc(P, { reviews: many }));
    await assertFails(updateDoc(P, new FieldPath('reviews', '열한번째'), '글'));
  });
  test('피드 하트: 자기 이름으로만 누르고 뗀다, 남의 하트는 못 건드린다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'spaces/main/hearts/note_n1'), { by: { bora: '보라' }, v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/hearts/note_n2'), { by: { owner: '영상' }, v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/hearts/note_n3'), { by: { bora: '보라', owner: '영상' }, v: 1 }));
    const own = as.owner();
    await assertSucceeds(updateDoc(doc(own, 'spaces/main/hearts/note_n1'), { 'by.owner': '영상' }));
    await assertFails(updateDoc(doc(own, 'spaces/main/hearts/note_n1'), { 'by.bora': deleteField() }));
    await assertSucceeds(updateDoc(doc(db, 'spaces/main/hearts/note_n1'), { 'by.bora': deleteField() }));
    await assertFails(setDoc(doc(as.stranger(), 'spaces/main/hearts/note_n9'), { by: { stranger: '손님' }, v: 1 }));
  });
  test('영어 공부 진도: 자기 문서만 읽고 쓴다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'spaces/main/study/bora'), { progress: { ap1: { box: 1, due: '2026-10-18', seen: 1, right: 1, wrong: 0 } }, days: ['2026-10-17'], v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/study/owner'), { progress: {}, days: [], v: 1 }));
    await assertFails(getDoc(doc(db, 'spaces/main/study/owner')));
    await assertSucceeds(getDoc(doc(db, 'spaces/main/study/bora')));
    await assertFails(setDoc(doc(as.stranger(), 'spaces/main/study/stranger'), { progress: {}, days: [], v: 1 }));
  });
  test('오늘의 한 질문: 답은 자기 uid 칸에만, 남의 답은 못 고친다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'spaces/main/asks/2026-10-17'), { qid: 'q01', place: { t: 'kr', code: '52' }, answers: { bora: { name: '보라', text: '순두부', at: 1 } }, v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/asks/2026-10-18'), { qid: 'q01', place: { t: 'kr', code: '52' }, answers: { owner: { name: '영상', text: '가짜', at: 1 } }, v: 1 }));
    const own = as.owner();
    await assertSucceeds(updateDoc(doc(own, 'spaces/main/asks/2026-10-17'), { 'answers.owner': { name: '영상', text: '갈치', at: 2 } }));
    await assertFails(updateDoc(doc(own, 'spaces/main/asks/2026-10-17'), { 'answers.bora': { name: '보라', text: '바꿈', at: 3 } }));
    await assertSucceeds(getDoc(doc(db, 'spaces/main/asks/2026-10-17')));
    await assertFails(getDoc(doc(as.stranger(), 'spaces/main/asks/2026-10-17')));
  });
  test('사진 파일은 올리고, 공개 여부만 바꿀 수 있다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'spaces/main/photoData/p3_l'), photoFile('p3')));
    await assertFails(setDoc(doc(db, 'spaces/main/photoData/p4_l'), photoFile('p4', { public: true })));
    await assertFails(setDoc(doc(db, 'spaces/main/photoData/wrongname'), photoFile('p5')));
    await assertSucceeds(updateDoc(doc(db, 'spaces/main/photoData/p1_l'), { public: true }));
    await assertFails(updateDoc(doc(db, 'spaces/main/photoData/p1_l'), { data: Bytes.fromUint8Array(new Uint8Array([0])) }));
  });
  test('공유 사본에는 메모·같이 간 사람을 넣을 수 없다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'shares/tok3'), { title: '공개', when: '2024', places: [], photos: [], v: 1 }));
    await assertFails(setDoc(doc(db, 'shares/tok4'), { title: '공개', when: '2024', places: [], photos: [], memo: '비밀 메모', v: 1 }));
    await assertFails(setDoc(doc(db, 'shares/tok5'), { title: '공개', when: '2024', places: [], photos: [], companions: ['보라'], v: 1 }));
  });
  test('문제 신고는 남기지만 남의 신고는 못 본다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'reports/r1'), { kind: 'report', message: '지도가 안 떠요' }));
    await assertFails(getDoc(doc(db, 'reports/r1')));
    await assertFails(setDoc(doc(db, 'reports/r2'), { kind: 'spam', message: 'x' }));
  });
});

describe('주인 (관리자)', () => {
  test('함께 쓰는 사람을 넣고 뺄 수 있다', async () => {
    const db = as.owner();
    await assertSucceeds(updateDoc(doc(db, 'config/access'), { allowed: [OWNER, BORA, 'friend@example.com'] }));
    await assertSucceeds(updateDoc(doc(db, 'config/access'), { allowed: [OWNER] }));
  });
  test('주인 자신은 목록에서 빠질 수 없다', async () => {
    const db = as.owner();
    await assertFails(updateDoc(doc(db, 'config/access'), { allowed: [BORA] }));
    await assertFails(updateDoc(doc(db, 'config/access'), { admins: [] }));
    await assertFails(deleteDoc(doc(db, 'config/access')));
  });
  test('목록에서 뺀 사람은 바로 못 들어온다', async () => {
    await assertSucceeds(updateDoc(doc(as.owner(), 'config/access'), { allowed: [OWNER] }));
    await assertFails(getDoc(T(as.bora())));
  });
  test('사진 올리기를 멈추면 아무도 사진 파일을 새로 올리지 못한다', async () => {
    await assertSucceeds(setDoc(doc(as.owner(), 'config/flags'), { uploadsPaused: true }));
    await assertFails(setDoc(doc(as.bora(), 'spaces/main/photoData/p6_l'), photoFile('p6')));
    await assertFails(setDoc(doc(as.owner(), 'spaces/main/photoData/p7_l'), photoFile('p7')));
  });
  test('문제 신고를 보고 지운다', async () => {
    await assertSucceeds(setDoc(doc(as.bora(), 'reports/r1'), { kind: 'report', message: '확인 부탁' }));
    await assertSucceeds(getDoc(doc(as.owner(), 'reports/r1')));
    await assertSucceeds(deleteDoc(doc(as.owner(), 'reports/r1')));
  });
});

describe('초대 링크', () => {
  const DAY = 24 * 3600 * 1000;
  const invite = (over: Record<string, unknown> = {}) => ({ by: OWNER, name: '새 식구', createdAt: 1, expiresAt: Date.now() + 7 * DAY, v: 1, ...over });
  test('관리자만 초대 코드를 만들고(7일 안), 보라는 못 만든다', async () => {
    await assertSucceeds(setDoc(doc(as.owner(), 'invites/abcdefgh1234'), invite()));
    await assertFails(setDoc(doc(as.owner(), 'invites/toolong'), invite({ expiresAt: Date.now() + 30 * DAY })));
    await assertFails(setDoc(doc(as.bora(), 'invites/boramade1'), invite({ by: BORA })));
    await assertFails(setDoc(doc(as.stranger(), 'invites/strangermade'), invite({ by: STRANGER })));
  });
  test('링크로 온 사람: 코드에 자기 메일로 표시하고 → 자기 메일만 허용 목록에 넣는다 (한 번만)', async () => {
    await setDoc(doc(as.owner(), 'invites/abcdefgh1234'), invite());
    const me = as.stranger();
    await assertSucceeds(getDoc(doc(me, 'invites/abcdefgh1234')));
    // 쓰기 전엔 허용 목록에 못 들어간다
    await assertFails(updateDoc(doc(me, 'config/access'), 'allowed', arrayUnion(STRANGER), 'via', 'abcdefgh1234', 'updatedAt', 1));
    await assertSucceeds(updateDoc(doc(me, 'invites/abcdefgh1234'), { usedBy: STRANGER, usedAt: 2 }));
    // 남의 메일을 넣거나, 관리자를 건드리거나, 둘을 넣는 건 막힌다
    await assertFails(updateDoc(doc(me, 'config/access'), 'allowed', arrayUnion('other@example.com'), 'via', 'abcdefgh1234', 'updatedAt', 1));
    await assertFails(updateDoc(doc(me, 'config/access'), 'allowed', arrayUnion(STRANGER), 'admins', arrayUnion(STRANGER), 'via', 'abcdefgh1234', 'updatedAt', 1));
    await assertFails(updateDoc(doc(me, 'config/access'), 'allowed', arrayUnion(STRANGER, 'other@example.com'), 'via', 'abcdefgh1234', 'updatedAt', 1));
    // 내 메일 + 내 이름만
    await assertSucceeds(updateDoc(doc(me, 'config/access'), 'allowed', arrayUnion(STRANGER), new FieldPath('names', STRANGER), '새 식구', 'via', 'abcdefgh1234', 'updatedAt', 1));
    const after = await getDoc(doc(as.owner(), 'config/access'));
    assert.deepEqual(after.data()?.allowed, [OWNER, BORA, STRANGER]);
    // 이제 멤버: 여행을 읽는다
    await assertSucceeds(getDoc(T(as.stranger())));
    // 같은 코드를 다른 사람이 또 쓰진 못한다
    const other = env.authenticatedContext('other', { email: 'other@example.com', email_verified: true }).firestore() as unknown as Firestore;
    await assertFails(updateDoc(doc(other, 'invites/abcdefgh1234'), { usedBy: 'other@example.com', usedAt: 3 }));
  });
  test('만료된 코드·없는 코드로는 못 들어온다', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore() as unknown as Firestore, 'invites/expired12345'), invite({ expiresAt: Date.now() - 1000 }));
    });
    await assertFails(updateDoc(doc(as.stranger(), 'invites/expired12345'), { usedBy: STRANGER, usedAt: 2 }));
    await assertFails(updateDoc(doc(as.stranger(), 'config/access'), 'allowed', arrayUnion(STRANGER), 'via', 'nosuchcode1234', 'updatedAt', 1));
  });
  test('관리자가 고칠 때 via 칸이 있어도 된다 (초대로 들어온 뒤에도 이름 바꾸기·빼기 가능)', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore() as unknown as Firestore, 'config/access'), { allowed: [OWNER, BORA, STRANGER], admins: [OWNER], names: {}, via: 'abcdefgh1234' });
    });
    await assertSucceeds(updateDoc(doc(as.owner(), 'config/access'), new FieldPath('names', STRANGER), '막내', 'updatedAt', 1));
  });
});

describe('여행 지우기 (deleteTripAll: 여행 문서를 첫 묶음에 넣고 글·사진을 뒤따라 지운다)', () => {
  const N = (db: Firestore, id: string) => doc(db, 'spaces/main/notes', id);
  test('여행이 살아 있을 땐 남의 글은 못 지운다 (다른 여행을 지우는 묶음에 끼워도)', async () => {
    const db = as.bora();
    await assertFails(deleteDoc(N(db, 'n-owner')));
    await assertSucceeds(setDoc(T(db, 't2'), trip({ title: '다른 여행' })));
    const b = writeBatch(db);
    b.delete(T(db, 't2'));
    b.delete(N(db, 'n-owner'));
    await assertFails(b.commit());
    const still = await getDoc(N(as.owner(), 'n-owner'));
    assert.equal(still.exists(), true);
  });
  test('여행을 지우는 묶음에서는 상대 글도 함께 지워지고, 여행이 먼저 사라진 뒤 남은 글도 지워진다', async () => {
    const db = as.bora();
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(N(ctx.firestore() as unknown as Firestore, 'n-owner2'), { tripId: 't1', text: '영상이 쓴 글 2', by: { uid: 'owner', name: '영상' }, v: 1 });
    });
    // 첫 묶음: 여행 문서 + 남의 글 하나 (같은 묶음에서 여행이 없어지므로 허용)
    const b = writeBatch(db);
    b.delete(T(db));
    b.delete(N(db, 'n-owner'));
    await assertSucceeds(b.commit());
    // 뒤 묶음(400개가 넘어 나뉜 경우): 여행은 이미 없으니 남은 남의 글도 지워진다
    await assertSucceeds(deleteDoc(N(db, 'n-owner2')));
    const left = await getDocs(collection(as.owner(), 'spaces/main/notes'));
    assert.equal(left.size, 0);
  });
  test('초대 안 된 계정은 여행이 없어진 뒤에도 글을 못 지운다', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(T(ctx.firestore() as unknown as Firestore));
    });
    await assertFails(deleteDoc(N(as.stranger(), 'n-owner')));
  });
});

describe('여행 계획하기 초안', () => {
  const draft = (by = 'owner') => ({ conds: { when: 'nextweekend', nights: 1 }, cands: [{ title: '강릉' }], hearts: {}, names: {}, by: { uid: by, name: '영상' }, createdAt: 1, tripId: null, round: 1, v: 1 });
  test('멤버가 만들고, 상대는 자기 하트만 누른다 (남의 하트·만든 사람은 못 바꾼다)', async () => {
    await assertSucceeds(setDoc(doc(as.owner(), 'spaces/main/planDrafts/d1'), draft()));
    await assertFails(setDoc(doc(as.bora(), 'spaces/main/planDrafts/d2'), draft('owner')));
    await assertFails(setDoc(doc(as.stranger(), 'spaces/main/planDrafts/d3'), draft('stranger')));
    await assertSucceeds(updateDoc(doc(as.bora(), 'spaces/main/planDrafts/d1'), { 'hearts.bora': ['kr:51150'], 'names.bora': '보라' }));
    await assertFails(updateDoc(doc(as.bora(), 'spaces/main/planDrafts/d1'), { 'hearts.owner': ['kr:50'] }));
    await assertFails(updateDoc(doc(as.bora(), 'spaces/main/planDrafts/d1'), { by: { uid: 'bora', name: '보라' } }));
    // 다시 고르기는 하트를 모두 비울 때만
    await assertFails(updateDoc(doc(as.bora(), 'spaces/main/planDrafts/d1'), { cands: [{ title: '제주' }], hearts: { owner: ['x'] }, round: 2 }));
    await assertSucceeds(updateDoc(doc(as.bora(), 'spaces/main/planDrafts/d1'), { cands: [{ title: '제주' }], hearts: {}, round: 2 }));
    await assertSucceeds(updateDoc(doc(as.bora(), 'spaces/main/planDrafts/d1'), { tripId: 't1' }));
    await assertFails(getDoc(doc(as.stranger(), 'spaces/main/planDrafts/d1')));
    await assertFails(deleteDoc(doc(as.bora(), 'spaces/main/planDrafts/d1')));
    await assertSucceeds(deleteDoc(doc(as.owner(), 'spaces/main/planDrafts/d1')));
  });
});
