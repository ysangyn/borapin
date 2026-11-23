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
import { Bytes, FieldPath, Timestamp, arrayUnion, collection, deleteDoc, deleteField, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch, type Firestore } from 'firebase/firestore';

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
    // 4걸음부터: 우리 공간도 구성원 문서가 있어야 들어온다 (앱이 들어올 때 스스로 만든다)
    await setDoc(doc(db, 'spaces/main/members/owner'), memberDoc('owner', OWNER, { role: 'admin', name: '영상' }));
    await setDoc(doc(db, 'spaces/main/members/bora'), memberDoc('bora', BORA));
    await setDoc(doc(db, 'shares/tok1'), { title: '공개 여행', when: '2024', places: [], photos: [], v: 1 });
    await setDoc(doc(db, 'mapShares/map1'), { title: '성동구 카페 지도', intro: '', theme: 'cafe', by: '보라 & 영상', regionLabel: '서울 성동구', places: [], v: 1 });
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
    // 내 지도 공개 사본도 같다
    await assertSucceeds(getDoc(doc(as.anon(), 'mapShares/map1')));
    await assertFails(getDocs(collection(as.anon(), 'mapShares')));
    await assertFails(setDoc(doc(as.anon(), 'mapShares/map2'), { title: 'x', theme: 'cafe', by: 'x', places: [], v: 1 }));
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
  test('내 지도: 지역×주제 문서에 제목·소개·순위·공개 토큰, 공개 사본은 멤버만 쓰고 메모는 못 넣는다', async () => {
    const db = as.bora();
    const M = doc(db, 'spaces/main/placeMaps/kr:11|cafe');
    await assertSucceeds(setDoc(M, { region: { t: 'kr', code: '11' }, theme: 'cafe', title: '성수 카페 지도', intro: '조용한 곳만', order: ['p1', 'p2'], share: null, v: 1 }));
    await assertSucceeds(updateDoc(M, { order: ['p2', 'p1'], share: { token: 'map9' } }));
    await assertFails(setDoc(doc(db, 'spaces/main/placeMaps/bad'), { theme: 'cafe', v: 1 })); // 지역 없음
    await assertFails(setDoc(doc(db, 'spaces/main/placeMaps/bad2'), { region: { t: 'kr', code: '11' }, theme: 'cafe', title: 'x'.repeat(61), v: 1 }));
    await assertFails(getDoc(doc(as.stranger(), 'spaces/main/placeMaps/kr:11|cafe')));
    await assertSucceeds(setDoc(doc(db, 'mapShares/map9'), { title: '성수 카페 지도', intro: '', theme: 'cafe', by: '보라 & 영상', regionLabel: '서울 성동구', places: [{ id: 'p1', name: '센터커피', kind: 'cafe', verdict: 'again', lines: [{ who: '보라', text: '창가' }] }], v: 1 }));
    await assertFails(setDoc(doc(db, 'mapShares/map8'), { title: '메모 딸린 것', theme: 'cafe', by: 'x', places: [], memo: '비밀', v: 1 }));
    await assertSucceeds(deleteDoc(doc(db, 'mapShares/map9')));
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
    // 가고 싶어요/다녀왔어요 상태: 둘 중 하나만
    await assertSucceeds(setDoc(P('p6'), place({ status: 'want' })));
    await assertSucceeds(setDoc(P('p7'), place({ status: 'been' })));
    await assertFails(setDoc(P('p8'), place({ status: 'maybe' })));
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
    // 예약: 목록(30개까지)만
    await assertSucceeds(setDoc(T(db, 'bk1'), trip({ bookings: [{ id: 'a', kind: 'flight', title: 'KE723 인천→간사이', date: '2026-12-10', time: '09:20', code: 'ABC123', memo: '' }] })));
    await assertFails(setDoc(T(db, 'bk2'), trip({ bookings: 'KE723' })));
    await assertFails(setDoc(T(db, 'bk3'), trip({ bookings: Array.from({ length: 31 }, (_, i) => ({ id: `b${i}`, kind: 'etc', title: '', date: null, time: null, code: '', memo: '' })) })));
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
    // 메일에 점이 있으니 문자열 경로 대신 FieldPath로 (앱도 같은 방식)
    await assertSucceeds(updateDoc(doc(db, 'config/access'), new FieldPath('names', BORA), '보라공주'));
    await assertFails(updateDoc(doc(db, 'config/access'), new FieldPath('names', OWNER), '남편'));
    await assertFails(updateDoc(doc(db, 'config/access'), new FieldPath('names', BORA), '열자가넘는이름이에요정말'));
    await assertFails(updateDoc(doc(db, 'config/access'), new FieldPath('names', BORA), '보라', 'allowed', [OWNER, BORA, STRANGER]));
  });
  test('글은 자기 이름으로만 쓰고, 자기 글만 지운다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'spaces/main/notes/n-bora'), { tripId: 't1', text: '보라 글', by: { uid: 'bora', name: '보라' }, v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/notes/n-fake'), { tripId: 't1', text: '남의 이름으로', by: { uid: 'owner', name: '영상' }, v: 1 }));
    await assertFails(deleteDoc(doc(db, 'spaces/main/notes/n-owner')));
    await assertFails(updateDoc(doc(db, 'spaces/main/notes/n-bora'), { text: '고쳐 쓰기' }));
    // 타임캡슐: 열리는 날은 날짜 꼴만
    await assertSucceeds(setDoc(doc(db, 'spaces/main/notes/n-cap'), { tripId: 't1', text: '1년 뒤 우리에게', by: { uid: 'bora', name: '보라' }, openAt: '2027-10-28', v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/notes/n-cap2'), { tripId: 't1', text: '이상한 날', by: { uid: 'bora', name: '보라' }, openAt: 'tomorrow', v: 1 }));
    // 며칠째 이야기: 날짜 꼴이나 비움만
    await assertSucceeds(setDoc(doc(db, 'spaces/main/notes/n-day'), { tripId: 't1', text: '첫날', by: { uid: 'bora', name: '보라' }, day: '2026-11-07', v: 1 }));
    await assertSucceeds(setDoc(doc(db, 'spaces/main/notes/n-day0'), { tripId: 't1', text: '날짜 없이', by: { uid: 'bora', name: '보라' }, day: null, v: 1 }));
    await assertFails(setDoc(doc(db, 'spaces/main/notes/n-day2'), { tripId: 't1', text: '이상한 날', by: { uid: 'bora', name: '보라' }, day: '첫날', v: 1 }));
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
    // 목록에 들었어도 구성원 문서가 없으면 아직 못 읽는다 → 자기 문서를 만들고 나면 읽는다 (앱이 알아서 한다)
    await assertFails(getDoc(T(as.stranger())));
    await assertSucceeds(setDoc(doc(me, 'spaces/main/members/stranger'), memberDoc('stranger', STRANGER, { name: '새 식구' })));
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

// 여러 공간 1걸음 (docs/design/SPACES-PUBLIC.md 8절): 공간이 여럿이 되어도 남의 공유를 못 건드리게, 가게 번호·리뷰 쓴 사람 칸
describe('여러 공간 1걸음: 링크 공유는 자기 공간 것만', () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      // 다른 공간이 만든 공유 (지금은 다른 공간이 없지만, 생기면 이런 모양이 된다)
      await setDoc(doc(db, 'shares/other1'), { title: '남의 여행', when: '2025', places: [], photos: [], spaceId: 'other', v: 1 });
      await setDoc(doc(db, 'mapShares/othermap'), { title: '남의 지도', intro: '', theme: 'cafe', by: '남', regionLabel: '부산', places: [], spaceId: 'other', v: 1 });
      await setDoc(doc(db, 'shares/mine1'), { title: '우리 여행', when: '2025', places: [], photos: [], spaceId: 'main', v: 1 });
    });
  });
  test('다른 공간의 공유는 고치지도 지우지도 못한다 (링크로 읽기는 된다)', async () => {
    const db = as.bora();
    await assertSucceeds(getDoc(doc(db, 'shares/other1')));
    await assertFails(setDoc(doc(db, 'shares/other1'), { title: '바꿔치기', when: '', places: [], photos: [], spaceId: 'other', v: 1 }));
    await assertFails(deleteDoc(doc(db, 'shares/other1')));
    await assertFails(setDoc(doc(db, 'mapShares/othermap'), { title: '바꿔치기', theme: 'cafe', by: 'x', places: [], spaceId: 'other', v: 1 }));
    await assertFails(deleteDoc(doc(db, 'mapShares/othermap')));
  });
  test('남의 공간 이름으로 새 공유를 만들 수 없고, 내 공유를 남의 공간으로 옮길 수도 없다', async () => {
    const db = as.bora();
    await assertFails(setDoc(doc(db, 'shares/new1'), { title: 'x', when: '', places: [], photos: [], spaceId: 'other', v: 1 }));
    await assertFails(setDoc(doc(db, 'mapShares/new2'), { title: 'x', theme: 'cafe', by: 'x', places: [], spaceId: 'other', v: 1 }));
    await assertFails(setDoc(doc(db, 'shares/mine1'), { title: '우리 여행', when: '2025', places: [], photos: [], spaceId: 'other', v: 1 }));
  });
  test('우리 공간 공유는 지금처럼 만들고 고치고 지운다 (spaceId가 없는 옛 공유도 우리 것)', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(doc(db, 'shares/new3'), { title: 'x', when: '', places: [], photos: [], spaceId: 'main', v: 1 }));
    await assertSucceeds(setDoc(doc(db, 'shares/mine1'), { title: '우리 여행 (고침)', when: '2025', places: [], photos: [], spaceId: 'main', v: 1 }));
    await assertSucceeds(setDoc(doc(db, 'shares/tok1'), { title: '옛 공유 고침', when: '2024', places: [], photos: [], spaceId: 'main', v: 1 }));
    await assertSucceeds(deleteDoc(doc(db, 'mapShares/map1')));
  });
});

describe('여러 공간 1걸음: 가게 번호(ref)와 리뷰 쓴 사람(reviewBy)', () => {
  const P = (db: Firestore, id = 'pr1') => doc(db, 'spaces/main/places', id);
  const place = (over: Record<string, unknown> = {}) => ({ name: '소금빵집', kind: 'food', region: { t: 'kr', code: '41285' }, reviews: {}, verdict: null, v: 1, ...over });
  test('카카오·네이버 가게 번호를 남길 수 있다', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(P(db), place({ ref: { src: 'kakao', id: '12345678' } })));
    await assertSucceeds(setDoc(P(db, 'pr2'), place({ ref: { src: 'naver', id: '1234567890' } })));
  });
  test('가게 번호 모양이 틀리면 막는다', async () => {
    const db = as.bora();
    await assertFails(setDoc(P(db, 'bad1'), place({ ref: { src: 'google', id: '1' } })));
    await assertFails(setDoc(P(db, 'bad2'), place({ ref: { src: 'kakao', id: 12345 } })));
    await assertFails(setDoc(P(db, 'bad3'), place({ ref: { src: 'kakao', id: 'x'.repeat(41) } })));
    await assertFails(setDoc(P(db, 'bad4'), place({ ref: 'k123' })));
  });
  test('리뷰 쓴 사람 칸은 이름→uid 묶음(10명까지)으로만', async () => {
    const db = as.bora();
    await assertSucceeds(setDoc(P(db, 'pr3'), place({ reviews: { 보라: '빵이 짭짤' }, reviewBy: { 보라: 'bora' } })));
    await assertFails(setDoc(P(db, 'bad5'), place({ reviews: { 보라: '빵이 짭짤' }, reviewBy: '보라' })));
    await assertFails(setDoc(P(db, 'bad6'), place({ reviewBy: Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`p${i}`, 'x'])) })));
  });
});

// 여러 공간 2걸음 (docs/design/SPACES-PUBLIC.md 3절): 구성원 문서·별명 문서, 공간 가르기
const CAROL = 'carol@example.com';
const DAVE = 'dave@example.com';
const as2 = {
  carol: () => env.authenticatedContext('carol', { email: CAROL, email_verified: true }).firestore() as unknown as Firestore,
  dave: () => env.authenticatedContext('dave', { email: DAVE, email_verified: true }).firestore() as unknown as Firestore,
  carolUnverified: () => env.authenticatedContext('carol', { email: CAROL, email_verified: false }).firestore() as unknown as Firestore,
};
const memberDoc = (uid: string, email: string, over: Record<string, unknown> = {}) => ({ uid, email, role: 'member', name: '보라', via: 'legacy', v: 1, ...over });
// 공간 아래 열두 모음: 모음 이름 → 시험에 쓸 문서 이름 (study는 자기 uid 문서만 읽힌다)
const COLS: Record<string, (uid: string) => string> = {
  trips: () => 'x1', places: () => 'x1', placeMaps: () => 'x1', photos: () => 'x1', photoData: () => 'x1_l', plans: () => 'x1',
  notes: () => 'x1', wishes: () => 'x1', study: (uid) => uid, planDrafts: () => 'x1', asks: () => '2026-11-20', hearts: () => 'x1',
};
const seedSpace = async (db: Firestore, sid: string, uid: string) => {
  for (const [col, id] of Object.entries(COLS)) {
    await setDoc(doc(db, `spaces/${sid}/${col}/${id(uid)}`), col === 'trips' ? trip() : col === 'notes' ? { tripId: 'x1', text: '글', by: { uid, name: 'x' }, v: 1 } : { public: false, v: 1 });
  }
};

describe('여러 공간 2걸음: 구성원 문서 (옛 목록에서 새 문으로)', () => {
  const M = (db: Firestore, uid: string, sid = 'main') => doc(db, `spaces/${sid}/members/${uid}`);
  test('옛 목록에 있는 사람이 우리 공간에 자기 구성원 문서를 만든다 (역할은 옛 관리자 목록대로)', async () => {
    await assertSucceeds(setDoc(M(as.bora(), 'bora'), memberDoc('bora', BORA, { relation: 'spouse' })));
    await assertSucceeds(setDoc(M(as.owner(), 'owner'), memberDoc('owner', OWNER, { role: 'admin', name: '영상' })));
    // 이름이 바뀌면 자기 문서를 고친다
    await assertSucceeds(setDoc(M(as.bora(), 'bora'), memberDoc('bora', BORA, { name: '보라보라' })));
    // 구성원끼리는 서로의 문서를 본다
    await assertSucceeds(getDocs(collection(as.owner(), 'spaces/main/members')));
  });
  test('스스로 관리자가 될 수 없고, 관리자가 구성원인 척할 수도 없다', async () => {
    await assertFails(setDoc(M(as.bora(), 'bora'), memberDoc('bora', BORA, { role: 'admin' })));
    await assertFails(setDoc(M(as.owner(), 'owner'), memberDoc('owner', OWNER, { role: 'member' })));
    await assertFails(setDoc(M(as.bora(), 'bora'), memberDoc('bora', BORA, { role: 'host' })));
  });
  test('남의 문서, 남의 메일, 정해지지 않은 칸은 막는다', async () => {
    const db = as.bora();
    await assertFails(setDoc(M(db, 'owner'), memberDoc('owner', OWNER, { role: 'admin' })));
    await assertFails(setDoc(M(db, 'someone'), memberDoc('someone', BORA)));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', OWNER)));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('someone', BORA)));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', BORA, { extra: 1 })));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', BORA, { name: '' })));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', BORA, { name: 'x'.repeat(21) })));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', BORA, { relation: 'boss' })));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', BORA, { via: 'abcd1234' })));
  });
  test('옛 목록에 없는 사람·메일 인증 안 한 사람은 우리 공간 구성원 문서를 만들지 못하고 목록도 못 본다', async () => {
    await assertFails(setDoc(M(as.stranger(), 'stranger'), memberDoc('stranger', STRANGER)));
    await assertFails(setDoc(M(as.boraUnverified(), 'bora-unverified'), memberDoc('bora-unverified', BORA)));
    await assertFails(getDocs(collection(as.stranger(), 'spaces/main/members')));
    await assertFails(getDoc(M(as.stranger(), 'bora')));
  });
  test('옛 목록 사람도 우리 공간이 아닌 곳에는 구성원 문서를 만들지 못한다', async () => {
    await assertFails(setDoc(M(as.bora(), 'bora', 'sp2'), memberDoc('bora', BORA)));
    await assertFails(setDoc(M(as.owner(), 'owner', 'sp2'), memberDoc('owner', OWNER, { role: 'admin' })));
    await assertFails(setDoc(M(as.owner(), 'owner', 'brand-new'), memberDoc('owner', OWNER, { role: 'admin' })));
  });
  test('옛 문이 열려 있는 동안: 목록에서 뺀 사람은 구성원 문서가 남아 있어도 바로 못 들어온다', async () => {
    await assertSucceeds(setDoc(M(as.bora(), 'bora'), memberDoc('bora', BORA)));
    await assertSucceeds(updateDoc(doc(as.owner(), 'config/access'), { allowed: [OWNER] }));
    await assertFails(getDoc(T(as.bora())));
    await assertFails(getDocs(collection(as.bora(), 'spaces/main/members')));
    await assertFails(setDoc(M(as.bora(), 'bora'), memberDoc('bora', BORA, { name: '다시' })));
  });
  test('자기 문서는 스스로 지우고, 관리자는 남의 것도 지운다. 구성원은 남의 것을 못 지운다', async () => {
    await assertSucceeds(setDoc(M(as.bora(), 'bora'), memberDoc('bora', BORA)));
    await assertSucceeds(setDoc(M(as.owner(), 'owner'), memberDoc('owner', OWNER, { role: 'admin', name: '영상' })));
    await assertFails(deleteDoc(M(as.bora(), 'owner')));
    await assertFails(deleteDoc(M(as.stranger(), 'bora')));
    await assertSucceeds(deleteDoc(M(as.owner(), 'bora')));
    await assertSucceeds(deleteDoc(M(as.owner(), 'owner')));
  });
});

describe('여러 공간 2걸음: 공간 가르기 (다른 공간 sp2에 캐롤이 관리자, 데이브는 아무 데도 없음)', () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(db, 'spaces/sp2'), { name: '캐롤네', v: 1 });
      await setDoc(doc(db, 'spaces/sp2/members/carol'), memberDoc('carol', CAROL, { role: 'admin', name: '캐롤', via: 'invite-code-1' }));
      await seedSpace(db, 'sp2', 'carol');
      await seedSpace(db, 'main', 'bora');
      await setDoc(doc(db, 'spaces/main/study/carol'), { progress: {}, days: [], v: 1 });
      await setDoc(doc(db, 'spaces/sp2/study/bora'), { progress: {}, days: [], v: 1 });
      await setDoc(doc(db, 'spaces/sp2/study/owner'), { progress: {}, days: [], v: 1 });
      await setDoc(doc(db, 'shares/sp2share'), { title: '캐롤 여행', when: '2025', places: [], photos: [], spaceId: 'sp2', v: 1 });
    });
  });
  test('캐롤은 자기 공간(sp2)의 열두 모음을 읽고, 여행을 만들고 지운다', async () => {
    const db = as2.carol();
    await assertSucceeds(getDoc(doc(db, 'spaces/sp2')));
    for (const [col, id] of Object.entries(COLS)) await assertSucceeds(getDoc(doc(db, `spaces/sp2/${col}/${id('carol')}`)));
    await assertSucceeds(getDocs(collection(db, 'spaces/sp2/trips')));
    await assertSucceeds(setDoc(doc(db, 'spaces/sp2/trips/new1'), trip({ title: '캐롤의 제주' })));
    await assertSucceeds(deleteDoc(doc(db, 'spaces/sp2/trips/new1')));
    await assertSucceeds(getDocs(collection(db, 'spaces/sp2/members')));
    // 자기 공간의 링크 공유도 고치고 지운다
    await assertSucceeds(setDoc(doc(db, 'shares/sp2share'), { title: '캐롤 여행 (고침)', when: '2025', places: [], photos: [], spaceId: 'sp2', v: 1 }));
    await assertSucceeds(deleteDoc(doc(db, 'shares/sp2share')));
  });
  test('캐롤은 우리 공간(main)의 열두 모음을 하나도 읽지도, 지우지도, 쓰지도 못한다', async () => {
    const db = as2.carol();
    await assertFails(getDoc(doc(db, 'spaces/main')));
    for (const [col, id] of Object.entries(COLS)) {
      await assertFails(getDoc(doc(db, `spaces/main/${col}/${id('carol')}`)));
      await assertFails(getDoc(doc(db, `spaces/main/${col}/${id('bora')}`)));
      await assertFails(getDocs(collection(db, `spaces/main/${col}`)));
      await assertFails(deleteDoc(doc(db, `spaces/main/${col}/${id('bora')}`)));
    }
    await assertFails(setDoc(doc(db, 'spaces/main/trips/hack'), trip()));
    await assertFails(getDocs(collection(db, 'spaces/main/members')));
    await assertFails(getDoc(doc(db, 'config/access')));
    await assertFails(setDoc(doc(db, 'spaces/main/members/carol'), memberDoc('carol', CAROL)));
    await assertFails(setDoc(doc(db, 'shares/tok1'), { title: '바꿔치기', when: '', places: [], photos: [], spaceId: 'main', v: 1 }));
    await assertFails(setDoc(doc(db, 'shares/tok1'), { title: '가져가기', when: '', places: [], photos: [], spaceId: 'sp2', v: 1 }));
    await assertFails(deleteDoc(doc(db, 'shares/tok1')));
  });
  test('우리(보라·주인)도 캐롤 공간의 열두 모음을 하나도 읽지도, 지우지도, 쓰지도 못한다. 마을 주인도 마찬가지', async () => {
    for (const [who, db] of [['bora', as.bora()], ['owner', as.owner()]] as const) {
      await assertFails(getDoc(doc(db, 'spaces/sp2')));
      for (const [col, id] of Object.entries(COLS)) {
        await assertFails(getDoc(doc(db, `spaces/sp2/${col}/${id(who)}`)));
        await assertFails(getDoc(doc(db, `spaces/sp2/${col}/${id('carol')}`)));
        await assertFails(getDocs(collection(db, `spaces/sp2/${col}`)));
        await assertFails(deleteDoc(doc(db, `spaces/sp2/${col}/${id('carol')}`)));
      }
      await assertFails(setDoc(doc(db, 'spaces/sp2/trips/hack'), trip()));
      await assertFails(setDoc(doc(db, 'spaces/sp2'), { name: '바꿔치기', v: 1 }));
      await assertFails(getDocs(collection(db, 'spaces/sp2/members')));
      await assertFails(getDoc(doc(db, 'spaces/sp2/members/carol')));
      await assertFails(deleteDoc(doc(db, 'spaces/sp2/members/carol')));
      await assertFails(setDoc(doc(db, 'shares/sp2share'), { title: '바꿔치기', when: '', places: [], photos: [], spaceId: 'sp2', v: 1 }));
      await assertFails(deleteDoc(doc(db, 'shares/sp2share')));
    }
  });
  test('아무 공간에도 없는 사람(데이브)·메일 인증 안 한 캐롤은 어느 공간도 못 읽는다', async () => {
    for (const db of [as2.dave(), as2.carolUnverified()]) {
      for (const sid of ['main', 'sp2']) {
        for (const [col, id] of Object.entries(COLS)) await assertFails(getDoc(doc(db, `spaces/${sid}/${col}/${id('carol')}`)));
        await assertFails(getDocs(collection(db, `spaces/${sid}/trips`)));
        await assertFails(getDocs(collection(db, `spaces/${sid}/members`)));
      }
    }
  });
  test('초대장 없이는 다른 공간의 구성원 문서를 만들지 못한다. 관리자도 남의 문서를 대신 만들지 못한다', async () => {
    await assertFails(setDoc(doc(as2.dave(), 'spaces/sp2/members/dave'), memberDoc('dave', DAVE)));
    await assertFails(setDoc(doc(as2.carol(), 'spaces/sp2/members/dave'), memberDoc('dave', DAVE)));
    await assertFails(deleteDoc(doc(as2.carol(), 'spaces/sp2/members/carol')));
  });
});

describe('여러 공간 2걸음: 별명 문서 (profiles)', () => {
  const P = (db: Firestore, uid: string) => doc(db, 'profiles', uid);
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(db, 'spaces/sp2/members/carol'), memberDoc('carol', CAROL, { role: 'admin', name: '캐롤', via: 'invite-code-1' }));
      await setDoc(doc(db, 'profiles/owner'), { nick: '영상', spaceId: 'main', v: 1 });
    });
  });
  test('자기 별명 문서를 만들고 고치고 읽는다 (자기가 든 공간만 가리킨다)', async () => {
    await assertSucceeds(setDoc(P(as.bora(), 'bora'), { nick: '보라', spaceId: 'main', v: 1 }));
    await assertSucceeds(setDoc(P(as.bora(), 'bora'), { nick: '보라돌이', spaceId: 'main', v: 1 }));
    await assertSucceeds(getDoc(P(as.bora(), 'bora')));
    await assertSucceeds(setDoc(P(as2.carol(), 'carol'), { nick: '캐롤', spaceId: 'sp2', v: 1 }));
  });
  test('들지 않은 공간은 가리키지 못한다', async () => {
    await assertFails(setDoc(P(as.bora(), 'bora'), { nick: '보라', spaceId: 'sp2', v: 1 }));
    await assertFails(setDoc(P(as2.carol(), 'carol'), { nick: '캐롤', spaceId: 'main', v: 1 }));
    await assertFails(setDoc(P(as.stranger(), 'stranger'), { nick: '손님', spaceId: 'main', v: 1 }));
    await assertFails(setDoc(P(as2.dave(), 'dave'), { nick: '데이브', spaceId: 'sp2', v: 1 }));
  });
  test('메일·그 밖의 칸은 넣지 못하고, 별명은 1~10자', async () => {
    const db = as.bora();
    await assertFails(setDoc(P(db, 'bora'), { nick: '보라', spaceId: 'main', email: BORA, v: 1 }));
    await assertFails(setDoc(P(db, 'bora'), { nick: '보라', spaceId: 'main', role: 'admin', v: 1 }));
    await assertFails(setDoc(P(db, 'bora'), { nick: '', spaceId: 'main', v: 1 }));
    await assertFails(setDoc(P(db, 'bora'), { nick: '가'.repeat(11), spaceId: 'main', v: 1 }));
    await assertFails(setDoc(P(db, 'bora'), { nick: '보라', v: 1 }));
  });
  test('남의 별명 문서는 읽지도 쓰지도 못하고, 목록으로도 못 본다', async () => {
    await assertFails(getDoc(P(as.bora(), 'owner')));
    await assertFails(setDoc(P(as.bora(), 'owner'), { nick: '바꿔치기', spaceId: 'main', v: 1 }));
    await assertFails(deleteDoc(P(as.bora(), 'owner')));
    await assertFails(getDocs(collection(as.bora(), 'profiles')));
    await assertFails(getDoc(P(as.anon(), 'owner')));
  });
});

// 여러 공간 3걸음 가 (docs/design/SPACES-PUBLIC.md 3-3절): 공간이 적힌 초대장, 새 공간 열기, 들어오기·나가기
describe('여러 공간 3걸음: 초대장과 새 공간', () => {
  const DAY = 24 * 3600 * 1000;
  const S2 = 'CarolSpace0123456789'; // 이미 있는 공간 (캐롤이 관리자, 에린이 구성원)
  const NEW = 'NewSpace012345678901'; // 아직 없는 공간
  const ERIN = 'erin@example.com';
  const FRANK = 'frank@example.com';
  const erin = () => env.authenticatedContext('erin', { email: ERIN, email_verified: true }).firestore() as unknown as Firestore;
  const frank = () => env.authenticatedContext('frank', { email: FRANK, email_verified: true }).firestore() as unknown as Firestore;
  const inv = (over: Record<string, unknown> = {}) => ({ by: OWNER, spaceId: NEW, role: 'admin', createdAt: 1, expiresAt: Date.now() + 7 * DAY, v: 1, ...over });
  const I = (db: Firestore, code: string) => doc(db, 'spaceInvites', code);
  const M = (db: Firestore, sid: string, uid: string) => doc(db, `spaces/${sid}/members/${uid}`);
  const joined = (uid: string, email: string, code: string, over: Record<string, unknown> = {}) => ({ uid, email, role: 'member', name: '새 사람', via: code, v: 1, ...over });
  /** 들어오기 한 묶음: 초대장에 내 표시 + 내 구성원 문서 (+ 새 공간 문서) (+ 별명 문서) */
  const join = (db: Firestore, o: { code: string; sid: string; uid: string; email: string; role: string; space?: boolean; profile?: boolean; mark?: boolean; member?: boolean }) => {
    const b = writeBatch(db);
    if (o.mark !== false) b.update(I(db, o.code), { usedBy: o.email, usedAt: 2 });
    if (o.member !== false) b.set(M(db, o.sid, o.uid), joined(o.uid, o.email, o.code, { role: o.role }));
    if (o.space) b.set(doc(db, 'spaces', o.sid), { name: '데이브네', createdBy: o.uid, v: 1 });
    if (o.profile) b.set(doc(db, 'profiles', o.uid), { nick: '데이브', spaceId: o.sid, v: 1 });
    return b.commit();
  };
  const dNew = { code: 'newspace-code-1', sid: NEW, uid: 'dave', email: DAVE, role: 'admin', space: true };
  const dMem = { code: 'member-code-1', sid: S2, uid: 'dave', email: DAVE, role: 'member' };

  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(db, 'spaces', S2), { name: '캐롤네', createdBy: 'carol', v: 1 });
      await setDoc(M(db, S2, 'carol'), joined('carol', CAROL, 'seed-code-carol', { role: 'admin', name: '캐롤' }));
      await setDoc(M(db, S2, 'erin'), joined('erin', ERIN, 'seed-code-erin', { name: '에린' }));
      await setDoc(doc(db, `spaces/${S2}/trips/x1`), trip());
      await setDoc(I(db, 'newspace-code-1'), inv());
      await setDoc(I(db, 'newspace-code-2'), inv());
      await setDoc(I(db, 'member-code-1'), inv({ by: CAROL, spaceId: S2, role: 'member' }));
      await setDoc(I(db, 'expired-code-1'), inv({ by: CAROL, spaceId: S2, role: 'member', expiresAt: Date.now() - 1000 }));
      await setDoc(doc(db, 'invites/legacy-main-code'), { by: OWNER, createdAt: 1, expiresAt: Date.now() + 7 * DAY, v: 1 });
    });
  });

  test('새 공간 초대장은 마을 주인만 만든다 (아직 없는 공간, 관리자 자리, 8일 안)', async () => {
    await assertSucceeds(setDoc(I(as.owner(), 'ownermade-code-1'), inv({ spaceId: 'Another0123456789abc' })));
    await assertFails(setDoc(I(as.bora(), 'boramade-code-1'), inv({ by: BORA, spaceId: 'Another0123456789abd' })));
    await assertFails(setDoc(I(as2.carol(), 'carolmade-code-1'), inv({ by: CAROL, spaceId: 'Another0123456789abe' })));
    await assertFails(setDoc(I(as2.dave(), 'davemade-code-1'), inv({ by: DAVE, spaceId: 'Another0123456789abf' })));
    // 이미 있는 공간에 관리자 자리를 만들 수 없다 (주인이 남의 공간에 들어가는 길이 되지 않게)
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-2'), inv({ spaceId: S2 })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-3'), inv({ spaceId: S2, role: 'member' })));
    // 모양
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-4'), inv({ spaceId: 'main' })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-5'), inv({ spaceId: 'short' })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-6'), inv({ spaceId: 'Another0123456789ab/' })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-7'), inv({ spaceId: 'Another0123456789abg', expiresAt: Date.now() + 30 * DAY })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-8'), inv({ spaceId: 'Another0123456789abh', by: BORA })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-9'), inv({ spaceId: 'Another0123456789abi', role: 'host' })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-10'), inv({ spaceId: 'Another0123456789abj', usedBy: OWNER })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-11'), inv({ spaceId: 'Another0123456789abk', extra: 1 })));
  });

  test('있는 공간에 들이는 초대장은 그 공간 관리자만 만든다 (구성원 자리만)', async () => {
    await assertSucceeds(setDoc(I(as2.carol(), 'carolmade-code-2'), inv({ by: CAROL, spaceId: S2, role: 'member', name: '프랭크', relation: 'friend', spaceName: '캐롤네' })));
    await assertFails(setDoc(I(erin(), 'erinmade-code-1'), inv({ by: ERIN, spaceId: S2, role: 'member' })));
    await assertFails(setDoc(I(as2.carol(), 'carolmade-code-3'), inv({ by: CAROL, spaceId: S2, role: 'admin' })));
    await assertFails(setDoc(I(as.bora(), 'boramade-code-2'), inv({ by: BORA, spaceId: S2, role: 'member' })));
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-12'), inv({ spaceId: S2, role: 'member' })));
  });

  test('초대장은 코드를 아는 로그인한 사람이 하나씩 읽는다. 목록은 만든 사람이 자기 것만', async () => {
    await assertSucceeds(getDoc(I(as2.dave(), 'member-code-1')));
    await assertFails(getDoc(I(as.anon(), 'member-code-1')));
    await assertSucceeds(getDocs(query(collection(as2.carol(), 'spaceInvites'), where('by', '==', CAROL))));
    await assertSucceeds(getDocs(query(collection(as.owner(), 'spaceInvites'), where('by', '==', OWNER))));
    // 남의 초대장 코드를 목록으로 엿볼 수 없다 (주인도, 우리 공간 사람도, 그 공간의 구성원도)
    await assertFails(getDocs(query(collection(as.owner(), 'spaceInvites'), where('by', '==', CAROL))));
    await assertFails(getDocs(query(collection(as.owner(), 'spaceInvites'), where('spaceId', '==', S2))));
    await assertFails(getDocs(collection(as.owner(), 'spaceInvites')));
    await assertFails(getDocs(query(collection(as.bora(), 'spaceInvites'), where('spaceId', '==', S2))));
    await assertFails(getDocs(query(collection(erin(), 'spaceInvites'), where('spaceId', '==', S2))));
    await assertFails(getDocs(query(collection(as2.dave(), 'spaceInvites'), where('by', '==', OWNER))));
    // 지우기: 만든 사람과 그 공간 관리자
    await assertFails(deleteDoc(I(erin(), 'member-code-1')));
    await assertFails(deleteDoc(I(as.owner(), 'member-code-1')));
    await assertSucceeds(deleteDoc(I(as2.carol(), 'member-code-1')));
    await assertSucceeds(deleteDoc(I(as.owner(), 'newspace-code-2')));
  });

  test('새 공간 열기: 초대장 표시 + 내 구성원 문서(관리자) + 공간 문서를 한 묶음으로. 그 뒤 그 공간을 쓰고, 주인은 들여다보지 못한다', async () => {
    await assertSucceeds(join(as2.dave(), { ...dNew, profile: true }));
    const db = as2.dave();
    await assertSucceeds(setDoc(doc(db, `spaces/${NEW}/trips/t1`), trip({ title: '데이브의 첫 여행' })));
    await assertSucceeds(getDocs(collection(db, `spaces/${NEW}/trips`)));
    await assertSucceeds(getDoc(doc(db, 'spaces', NEW)));
    await assertSucceeds(getDoc(doc(db, 'profiles/dave')));
    // 관리자가 되었으니 짝을 초대할 수 있다
    await assertSucceeds(setDoc(I(db, 'davemade-code-2'), inv({ by: DAVE, spaceId: NEW, role: 'member' })));
    // 마을 주인·우리 공간 사람·다른 공간 관리자는 못 본다
    for (const other of [as.owner(), as.bora(), as2.carol()]) {
      await assertFails(getDoc(doc(other, `spaces/${NEW}/trips/t1`)));
      await assertFails(getDocs(collection(other, `spaces/${NEW}/members`)));
    }
    // 데이브는 여전히 우리 공간·캐롤 공간을 못 본다
    await assertFails(getDoc(T(db)));
    await assertFails(getDoc(doc(db, `spaces/${S2}/trips/x1`)));
  });

  test('새 공간 열기의 빈틈: 하나라도 빠지거나 어긋나면 통째로 막힌다', async () => {
    const db = as2.dave();
    await assertFails(join(db, { ...dNew, mark: false })); // 초대장에 표시 없이
    await assertFails(join(db, { ...dNew, member: false, space: false })); // 표시만 하고 안 들어오기 (초대장 못 쓰게 만들기)
    await assertFails(join(db, { ...dNew, space: false })); // 공간 문서 없이
    await assertFails(join(db, { ...dNew, role: 'member' })); // 초대장과 다른 역할
    await assertFails(join(db, { ...dNew, sid: 'Different01234567890' })); // 초대장과 다른 공간
    await assertFails(join(db, { ...dNew, sid: S2, space: false })); // 새 공간 초대장으로 있는 공간에
    await assertFails(join(db, { ...dNew, uid: 'frank' })); // 남의 구성원 문서
    await assertFails(join(db, { ...dNew, email: FRANK })); // 남의 메일
    await assertFails(setDoc(doc(db, 'spaces', NEW), { name: '그냥 만들기', createdBy: 'dave', v: 1 })); // 초대 없이 공간만
    await assertFails(setDoc(doc(db, 'spaces/Whatever012345678901'), { name: '그냥 만들기', createdBy: 'dave', v: 1 }));
    await assertFails(join(db, { ...dNew, code: 'legacy-main-code' })); // 우리 공간용 옛 초대 코드로
    await assertFails(join(db, { ...dNew, code: 'no-such-code-123' }));
    // 아무것도 안 생겼다
    await assertFails(getDoc(doc(db, 'spaces', NEW)));
  });

  test('한 초대장은 한 번만, 한 공간의 첫 관리자는 한 사람만', async () => {
    await assertSucceeds(join(as2.dave(), dNew));
    // 같은 코드를 다른 사람이
    await assertFails(join(frank(), { ...dNew, uid: 'frank', email: FRANK, space: false }));
    await assertFails(join(frank(), { ...dNew, uid: 'frank', email: FRANK }));
    // 같은 공간을 가리키는 또 다른 새 공간 초대장으로 (공간이 이미 열렸다)
    await assertFails(join(frank(), { ...dNew, code: 'newspace-code-2', uid: 'frank', email: FRANK, space: false }));
    await assertFails(join(frank(), { ...dNew, code: 'newspace-code-2', uid: 'frank', email: FRANK }));
    // 주인도 이제 이 공간에 관리자 초대장을 새로 만들 수 없다
    await assertFails(setDoc(I(as.owner(), 'ownermade-code-13'), inv()));
  });

  test('있는 공간에 들어오기: 초대장 표시 + 내 구성원 문서(구성원)를 한 묶음으로', async () => {
    await assertFails(join(as2.dave(), { ...dMem, role: 'admin' }));
    await assertFails(join(as2.dave(), { ...dMem, mark: false }));
    await assertFails(join(as2.dave(), { ...dMem, code: 'expired-code-1' }));
    await assertFails(join(as2.dave(), { ...dMem, sid: NEW }));
    await assertSucceeds(join(as2.dave(), { ...dMem, profile: true }));
    await assertSucceeds(getDoc(doc(as2.dave(), `spaces/${S2}/trips/x1`)));
    await assertSucceeds(getDocs(collection(as2.dave(), `spaces/${S2}/members`)));
    await assertFails(getDoc(T(as2.dave())));
    // 구성원은 초대장을 만들지 못한다
    await assertFails(setDoc(I(as2.dave(), 'davemade-code-3'), inv({ by: DAVE, spaceId: S2, role: 'member' })));
  });

  test('내보낸 사람은 바로 못 들어오고, 쓴 초대장으로 다시 들어오지도 못한다', async () => {
    await assertSucceeds(join(as2.dave(), dMem));
    await assertSucceeds(deleteDoc(M(as2.carol(), S2, 'dave')));
    await assertFails(getDoc(doc(as2.dave(), `spaces/${S2}/trips/x1`)));
    await assertFails(join(as2.dave(), dMem));
    await assertFails(join(as2.dave(), { ...dMem, mark: false }));
    await assertFails(setDoc(M(as2.dave(), S2, 'dave'), joined('dave', DAVE, 'member-code-1')));
  });

  test('구성원 문서: 자기 이름·관계만 고친다. 역할은 못 바꾼다. 구성원은 스스로 나가고, 관리자는 남을 내보내되 자기는 못 나간다', async () => {
    await assertSucceeds(updateDoc(M(erin(), S2, 'erin'), { name: '에린이', relation: 'friend' }));
    await assertFails(updateDoc(M(erin(), S2, 'erin'), { role: 'admin' }));
    await assertFails(updateDoc(M(erin(), S2, 'erin'), { email: CAROL }));
    await assertFails(updateDoc(M(erin(), S2, 'erin'), { uid: 'carol' }));
    await assertFails(updateDoc(M(erin(), S2, 'erin'), { via: 'other-code-123' }));
    await assertFails(updateDoc(M(erin(), S2, 'erin'), { name: '' }));
    await assertFails(updateDoc(M(erin(), S2, 'carol'), { name: '바꿔치기' }));
    await assertFails(updateDoc(M(as2.carol(), S2, 'erin'), { role: 'admin' }));
    await assertFails(updateDoc(M(as2.carol(), S2, 'carol'), { role: 'member' }));
    await assertSucceeds(updateDoc(M(as2.carol(), S2, 'carol'), { name: '캐롤 언니' }));
    await assertFails(deleteDoc(M(erin(), S2, 'carol')));
    await assertFails(deleteDoc(M(as2.carol(), S2, 'carol'))); // 관리자가 없는 공간이 되지 않게
    await assertFails(deleteDoc(M(as.owner(), S2, 'erin')));
    await assertSucceeds(deleteDoc(M(erin(), S2, 'erin')));
    await assertFails(getDoc(doc(erin(), `spaces/${S2}/trips/x1`)));
  });

  test('공간 초대장으로는 우리 공간(main)에 들어올 수 없다', async () => {
    const db = as2.dave();
    await assertFails(updateDoc(doc(db, 'config/access'), 'allowed', arrayUnion(DAVE), 'via', 'member-code-1', 'updatedAt', 1));
    await assertSucceeds(join(db, dMem));
    await assertFails(updateDoc(doc(db, 'config/access'), 'allowed', arrayUnion(DAVE), 'via', 'member-code-1', 'updatedAt', 1));
    await assertFails(setDoc(M(db, 'main', 'dave'), memberDoc('dave', DAVE)));
    await assertFails(setDoc(M(db, 'main', 'dave'), joined('dave', DAVE, 'member-code-1')));
    await assertFails(getDoc(T(db)));
  });

  test('어느 공간이든 든 사람은 앱 스위치를 읽고 문제 신고를 남긴다. 아무 데도 없는 사람은 못 한다', async () => {
    await assertFails(getDoc(doc(as2.dave(), 'config/flags')));
    await assertFails(setDoc(doc(as2.dave(), 'reports/r-dave-0'), { kind: 'report', message: '안녕' }));
    await assertSucceeds(join(as2.dave(), { ...dMem, profile: true }));
    await assertSucceeds(getDoc(doc(as2.dave(), 'config/flags')));
    await assertSucceeds(setDoc(doc(as2.dave(), 'reports/r-dave-1'), { kind: 'report', message: '안녕' }));
    // 스위치를 바꾸거나 남의 신고를 읽지는 못한다
    await assertFails(setDoc(doc(as2.dave(), 'config/flags'), { uploadsPaused: true }));
    await assertFails(getDoc(doc(as2.dave(), 'reports/r-dave-1')));
    // 내보내지면 바로 끊긴다 (별명 문서가 남아 있어도)
    await assertSucceeds(deleteDoc(M(as2.carol(), S2, 'dave')));
    await assertFails(getDoc(doc(as2.dave(), 'config/flags')));
  });
});

// 여러 공간 4걸음 (docs/design/SPACES-PUBLIC.md 3-5절): 우리 공간(main)도 구성원 문서가 문이다.
// 옛 목록은 '자기 구성원 문서를 만들 자격'이자 안전장치로 남는다: 목록에 있고 + 문서가 있어야 들어온다.
describe('여러 공간 4걸음: 우리 공간의 문 = 옛 목록 + 구성원 문서', () => {
  const M = (db: Firestore, uid: string) => doc(db, `spaces/main/members/${uid}`);
  const drop = (uid: string) => env.withSecurityRulesDisabled(async (ctx) => { await deleteDoc(M(ctx.firestore() as unknown as Firestore, uid)); });
  const put = (uid: string, data: Record<string, unknown>) => env.withSecurityRulesDisabled(async (ctx) => { await setDoc(M(ctx.firestore() as unknown as Firestore, uid), data); });
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await seedSpace(db, 'main', 'bora');
    });
  });

  test('목록에 있어도 구성원 문서가 없으면 우리 공간의 열두 모음을 읽지도 쓰지도 못한다', async () => {
    await drop('bora');
    const db = as.bora();
    await assertFails(getDoc(doc(db, 'spaces/main')));
    for (const [col, id] of Object.entries(COLS)) {
      await assertFails(getDoc(doc(db, `spaces/main/${col}/${id('bora')}`)));
      await assertFails(getDocs(collection(db, `spaces/main/${col}`)));
    }
    await assertFails(setDoc(doc(db, 'spaces/main/trips/new1'), trip()));
    await assertFails(getDocs(collection(db, 'spaces/main/members')));
    await assertFails(setDoc(doc(db, 'shares/tok1'), { title: '고침', when: '', places: [], photos: [], spaceId: 'main', v: 1 }));
    await assertFails(setDoc(doc(db, 'profiles/bora'), { nick: '보라', spaceId: 'main', v: 1 }));
  });

  test('스스로 들어오기: 목록에 있는 사람은 자기 구성원 문서(와 별명 문서)를 한 묶음으로 만들고 바로 읽는다', async () => {
    await drop('bora');
    const db = as.bora();
    const b = writeBatch(db);
    b.set(M(db, 'bora'), memberDoc('bora', BORA));
    b.set(doc(db, 'profiles/bora'), { nick: '보라', spaceId: 'main', v: 1 });
    await assertSucceeds(b.commit());
    for (const [col, id] of Object.entries(COLS)) await assertSucceeds(getDoc(doc(db, `spaces/main/${col}/${id('bora')}`)));
    await assertSucceeds(getDocs(collection(db, 'spaces/main/trips')));
    await assertSucceeds(setDoc(doc(db, 'spaces/main/trips/new1'), trip()));
    // 주인(관리자)도 같다
    await drop('owner');
    await assertFails(getDoc(T(as.owner())));
    await assertSucceeds(setDoc(M(as.owner(), 'owner'), memberDoc('owner', OWNER, { role: 'admin', name: '영상' })));
    await assertSucceeds(getDoc(T(as.owner())));
  });

  test('문서가 없어도 되는 일: 옛 목록 읽기(앱이 내가 누구인지 알아야 한다), 앱 스위치 읽기, 문제 신고', async () => {
    await drop('bora');
    const db = as.bora();
    await assertSucceeds(getDoc(doc(db, 'config/access')));
    await assertSucceeds(getDoc(doc(db, 'config/flags')));
    await assertSucceeds(setDoc(doc(db, 'reports/r-bora-1'), { kind: 'report', message: '못 들어가요' }));
  });

  test('목록에서 빼면 구성원 문서가 남아 있어도 바로 못 들어오고, 문서를 다시 만들지도 못한다 (옛 버전 앱으로 빼도 안전)', async () => {
    await assertSucceeds(getDoc(T(as.bora())));
    await assertSucceeds(updateDoc(doc(as.owner(), 'config/access'), { allowed: [OWNER] }));
    const db = as.bora();
    for (const [col, id] of Object.entries(COLS)) await assertFails(getDoc(doc(db, `spaces/main/${col}/${id('bora')}`)));
    await assertFails(getDocs(collection(db, 'spaces/main/trips')));
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', BORA)));
    await drop('bora');
    await assertFails(setDoc(M(db, 'bora'), memberDoc('bora', BORA)));
  });

  test('구성원 문서만 있고 목록에 없는 사람은 못 들어온다 (어떻게 생긴 문서든)', async () => {
    await put('stranger', memberDoc('stranger', STRANGER));
    await put('carol', { uid: 'carol', email: CAROL, role: 'admin', name: '캐롤', via: 'some-invite-code', v: 1 });
    for (const db of [as.stranger(), as2.carol()]) {
      for (const [col, id] of Object.entries(COLS)) await assertFails(getDoc(doc(db, `spaces/main/${col}/${id('bora')}`)));
      await assertFails(getDocs(collection(db, 'spaces/main/members')));
      await assertFails(setDoc(doc(db, 'spaces/main/trips/hack'), trip()));
    }
    await assertFails(setDoc(doc(as.stranger(), 'profiles/stranger'), { nick: '손님', spaceId: 'main', v: 1 }));
  });

  test('메일 인증을 안 한 계정은 문서가 있어도 못 들어온다', async () => {
    await put('bora-unverified', memberDoc('bora-unverified', BORA));
    await assertFails(getDoc(T(as.boraUnverified())));
    await assertFails(getDocs(collection(as.boraUnverified(), 'spaces/main/trips')));
  });

  test('관리자가 뺄 때: 목록에서 빼고 그 사람의 구성원 문서도 지운다. 구성원은 남의 문서를 못 지운다', async () => {
    await assertFails(deleteDoc(M(as.bora(), 'owner')));
    const db = as.owner();
    await assertSucceeds(updateDoc(doc(db, 'config/access'), { allowed: [OWNER] }));
    await assertSucceeds(deleteDoc(M(db, 'bora')));
    await assertFails(getDoc(T(as.bora())));
  });

  test('다른 공간 사람은 우리 공간에 자기 구성원 문서를 만들지 못한다 (공간 초대장으로도)', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(db, 'spaces/sp2/members/carol'), memberDoc('carol', CAROL, { role: 'admin', name: '캐롤', via: 'invite-code-1' }));
      await setDoc(doc(db, 'spaceInvites/main-trick-code'), { by: OWNER, spaceId: 'main', role: 'member', expiresAt: Date.now() + 86400000, v: 1 });
    });
    const db = as2.carol();
    await assertFails(setDoc(M(db, 'carol'), memberDoc('carol', CAROL)));
    const b = writeBatch(db);
    b.update(doc(db, 'spaceInvites/main-trick-code'), { usedBy: CAROL, usedAt: 2 });
    b.set(M(db, 'carol'), { uid: 'carol', email: CAROL, role: 'member', name: '캐롤', via: 'main-trick-code', v: 1 });
    await assertFails(b.commit());
    await assertFails(getDoc(T(db)));
  });
});

// 여러 공간 5걸음 (docs/design/SPACES-PUBLIC.md 4절): 모임 — 고른 가게만 가족·친구와 나누기
describe('5걸음: 모임 (circles)', () => {
  const DAY = 24 * 3600 * 1000;
  const C1 = 'CircleFamily01234567'; // 보라가 방장, 캐롤이 구성원, 데이브(공간 없음)가 손님
  const NEWC = 'CircleNew01234567890';
  const dave = () => as2.dave();
  const carol = () => as2.carol();
  const erin = () => env.authenticatedContext('erin', { email: 'erin@example.com', email_verified: true }).firestore() as unknown as Firestore;
  const daveUnverified = () => env.authenticatedContext('dave', { email: DAVE, email_verified: false }).firestore() as unknown as Firestore;
  const CM = (db: Firestore, cid: string, uid: string) => doc(db, `circles/${cid}/members/${uid}`);
  const CI = (db: Firestore, code: string) => doc(db, 'circleInvites', code);
  const IT = (db: Firestore, cid: string, id: string) => doc(db, `circles/${cid}/items/${id}`);
  const PH = (db: Firestore, cid: string, id: string) => doc(db, `circles/${cid}/photos/${id}`);
  const cm = (uid: string, over: Record<string, unknown> = {}) => ({ uid, role: 'member', nick: '별명', via: 'seed-code-000', v: 1, ...over });
  const cinv = (by: string, over: Record<string, unknown> = {}) => ({ by, circleId: C1, expiresAt: Date.now() + 7 * DAY, v: 1, ...over });
  const item = (uid: string, key: string, over: Record<string, unknown> = {}) => ({ key, name: '소금빵집', kind: 'food', by: { uid, nick: '별명' }, spaceId: null, v: 1, ...over });
  const photo = (uid: string, over: Record<string, unknown> = {}) => ({ by: uid, spaceId: null, itemId: `k1_${uid}`, data: Bytes.fromUint8Array(new Uint8Array([1, 2, 3])), w: 10, h: 10, v: 1, ...over });
  const make = (db: Firestore, uid: string, cid = NEWC, o: { circle?: boolean; member?: boolean; mine?: boolean; role?: string; createdBy?: string } = {}) => {
    const b = writeBatch(db);
    if (o.circle !== false) b.set(doc(db, 'circles', cid), { name: '대학 친구', createdBy: o.createdBy ?? uid, v: 1 });
    if (o.member !== false) b.set(CM(db, cid, uid), cm(uid, { role: o.role ?? 'host', via: 'host' }));
    if (o.mine) b.set(doc(db, `users/${uid}/circles/${cid}`), { name: '대학 친구', v: 1 });
    return b.commit();
  };
  const join = (db: Firestore, uid: string, code: string, o: { cid?: string; mark?: boolean; member?: boolean; role?: string; markAs?: string; mine?: boolean } = {}) => {
    const b = writeBatch(db);
    if (o.mark !== false) b.update(CI(db, code), { usedBy: o.markAs ?? uid, usedAt: 2 });
    if (o.member !== false) b.set(CM(db, o.cid ?? C1, uid), cm(uid, { role: o.role ?? 'member', via: code }));
    if (o.mine) b.set(doc(db, `users/${uid}/circles/${o.cid ?? C1}`), { name: '처가 가족', v: 1 });
    return b.commit();
  };

  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(db, 'profiles/bora'), { nick: '보라', spaceId: 'main', v: 1 });
      await setDoc(doc(db, 'profiles/owner'), { nick: '영상', spaceId: 'main', v: 1 });
      await setDoc(doc(db, 'spaces/sp2/members/carol'), memberDoc('carol', CAROL, { role: 'admin', name: '캐롤', via: 'invite-code-1' }));
      await setDoc(doc(db, 'profiles/carol'), { nick: '캐롤', spaceId: 'sp2', v: 1 });
      await setDoc(doc(db, 'circles', C1), { name: '처가 가족', createdBy: 'bora', v: 1 });
      await setDoc(CM(db, C1, 'bora'), cm('bora', { role: 'host', via: 'host', nick: '보라' }));
      await setDoc(CM(db, C1, 'carol'), cm('carol', { nick: '캐롤' }));
      await setDoc(CM(db, C1, 'dave'), cm('dave', { nick: '데이브' }));
      await setDoc(IT(db, C1, 'k100_bora'), item('bora', 'k100', { spaceId: 'main', line: '빵이 짭짤' }));
      await setDoc(IT(db, C1, 'k200_carol'), item('carol', 'k200', { spaceId: 'sp2' }));
      await setDoc(IT(db, C1, 'k300_dave'), item('dave', 'k300'));
      await setDoc(PH(db, C1, 'ph-bora-1'), photo('bora', { spaceId: 'main', itemId: 'k100_bora' }));
      await setDoc(PH(db, C1, 'ph-dave-1'), photo('dave', { itemId: 'k300_dave' }));
      await setDoc(CI(db, 'circle-code-001'), cinv('bora'));
      await setDoc(CI(db, 'circle-code-old'), cinv('bora', { expiresAt: Date.now() - 1000 }));
    });
  });

  test('모임 만들기: 자기 공간이 있는 사람이 모임 문서 + 내 방장 문서를 한 묶음으로', async () => {
    await assertSucceeds(make(carol(), 'carol', NEWC, { mine: true }));
    await assertSucceeds(getDoc(doc(carol(), 'circles', NEWC)));
    await assertSucceeds(getDoc(doc(carol(), `users/carol/circles/${NEWC}`)));
    // 우리 공간 사람도
    await assertSucceeds(make(as.owner(), 'owner', 'CircleOwner012345678'));
  });
  test('모임 만들기의 빈틈: 손님(공간 없음)·한쪽만·남의 이름·이미 있는 모임은 막힌다', async () => {
    await assertFails(make(dave(), 'dave'));
    await assertFails(make(erin(), 'erin'));
    await assertFails(make(carol(), 'carol', NEWC, { member: false }));
    await assertFails(make(carol(), 'carol', NEWC, { circle: false }));
    await assertFails(make(carol(), 'carol', NEWC, { role: 'member' }));
    await assertFails(make(carol(), 'carol', NEWC, { createdBy: 'bora' }));
    await assertFails(make(carol(), 'carol', 'short'));
    // 있는 모임에 방장으로 끼어들기 · 모임 문서 덮어쓰기
    await assertFails(setDoc(CM(as.owner(), C1, 'owner'), cm('owner', { role: 'host', via: 'host' })));
    await assertFails(make(as.owner(), 'owner', C1));
    await assertFails(setDoc(doc(carol(), 'circles', C1), { name: '뺏기', createdBy: 'carol', v: 1 }));
    // 모양
    const bad = (data: Record<string, unknown>) => { const db = carol(); const b = writeBatch(db); b.set(doc(db, 'circles', NEWC), data); b.set(CM(db, NEWC, 'carol'), cm('carol', { role: 'host', via: 'host' })); return b.commit(); };
    await assertFails(bad({ name: '', createdBy: 'carol', v: 1 }));
    await assertFails(bad({ name: 'x'.repeat(21), createdBy: 'carol', v: 1 }));
    await assertFails(bad({ name: '모임', createdBy: 'carol', extra: 1, v: 1 }));
  });

  test('읽기: 모임 사람만 (모임 문서·구성원·걸린 가게·사진). 밖의 사람은 주인이라도 못 본다', async () => {
    for (const db of [as.bora(), carol(), dave()]) {
      await assertSucceeds(getDoc(doc(db, 'circles', C1)));
      await assertSucceeds(getDocs(collection(db, `circles/${C1}/members`)));
      await assertSucceeds(getDocs(collection(db, `circles/${C1}/items`)));
      await assertSucceeds(getDoc(PH(db, C1, 'ph-bora-1')));
    }
    for (const db of [as.owner(), erin(), as.stranger(), as.anon(), daveUnverified()]) {
      await assertFails(getDoc(doc(db, 'circles', C1)));
      await assertFails(getDocs(collection(db, `circles/${C1}/members`)));
      await assertFails(getDoc(CM(db, C1, 'bora')));
      await assertFails(getDocs(collection(db, `circles/${C1}/items`)));
      await assertFails(getDoc(IT(db, C1, 'k100_bora')));
      await assertFails(getDoc(PH(db, C1, 'ph-bora-1')));
      await assertFails(getDocs(collection(db, `circles/${C1}/photos`)));
    }
    await assertFails(getDocs(collection(as.bora(), 'circles')));
  });

  test('모임에 든다고 서로의 공간이 보이지는 않는다 (손님은 어느 공간도, 보라핀 사람들 것도 못 본다)', async () => {
    await assertFails(getDoc(T(carol())));
    await assertFails(getDoc(T(dave())));
    await assertFails(getDocs(collection(dave(), 'spaces/main/places')));
    await assertFails(getDoc(doc(as.bora(), 'spaces/sp2/members/carol')));
    await assertFails(getDoc(doc(dave(), 'config/flags')));
    await assertFails(getDoc(doc(dave(), 'config/access')));
    await assertFails(getDoc(doc(dave(), 'profiles/bora')));
  });

  test('초대장: 방장만 만든다. 코드를 아는 로그인한 사람이 하나씩 읽고, 목록은 만든 사람만', async () => {
    await assertSucceeds(setDoc(CI(as.bora(), 'boramade-circle-1'), cinv('bora', { circleName: '처가 가족' })));
    await assertFails(setDoc(CI(carol(), 'carolmade-circle-1'), cinv('carol')));
    await assertFails(setDoc(CI(dave(), 'davemade-circle-1'), cinv('dave')));
    await assertFails(setDoc(CI(as.owner(), 'ownermade-circle-1'), cinv('owner')));
    await assertFails(setDoc(CI(as.bora(), 'boramade-circle-2'), cinv('carol')));
    await assertFails(setDoc(CI(as.bora(), 'boramade-circle-3'), cinv('bora', { expiresAt: Date.now() + 30 * DAY })));
    await assertFails(setDoc(CI(as.bora(), 'boramade-circle-4'), cinv('bora', { usedBy: 'bora' })));
    await assertFails(setDoc(CI(as.bora(), 'boramade-circle-5'), cinv('bora', { circleId: 'NoSuchCircle01234567' })));
    await assertFails(setDoc(CI(as.bora(), 'boramade-circle-6'), cinv('bora', { email: BORA })));
    await assertSucceeds(getDoc(CI(erin(), 'circle-code-001')));
    await assertFails(getDoc(CI(as.anon(), 'circle-code-001')));
    await assertSucceeds(getDocs(query(collection(as.bora(), 'circleInvites'), where('by', '==', 'bora'))));
    await assertFails(getDocs(query(collection(carol(), 'circleInvites'), where('by', '==', 'bora'))));
    await assertFails(getDocs(query(collection(carol(), 'circleInvites'), where('circleId', '==', C1))));
    await assertFails(getDocs(collection(as.owner(), 'circleInvites')));
    await assertFails(deleteDoc(CI(carol(), 'circle-code-001')));
    await assertSucceeds(deleteDoc(CI(as.bora(), 'circle-code-001')));
  });

  test('들어오기: 초대장 표시 + 내 구성원 문서를 한 묶음으로. 공간 없는 사람도 손님으로 들어온다', async () => {
    await assertSucceeds(join(erin(), 'erin', 'circle-code-001', { mine: true }));
    await assertSucceeds(getDocs(collection(erin(), `circles/${C1}/items`)));
    await assertSucceeds(setDoc(IT(erin(), C1, 'k900_erin'), item('erin', 'k900')));
    // 손님은 여전히 공간도 없고 모임을 만들지도 못한다
    await assertFails(getDoc(T(erin())));
    await assertFails(make(erin(), 'erin'));
    // 같은 초대장은 한 번만
    await assertFails(join(as.owner(), 'owner', 'circle-code-001'));
  });
  test('들어오기의 빈틈: 표시 없이·기한 지난·다른 모임·방장 자리·남의 이름·표시만은 통째로 막힌다', async () => {
    await assertFails(join(erin(), 'erin', 'circle-code-001', { mark: false }));
    await assertFails(join(erin(), 'erin', 'circle-code-001', { member: false }));
    await assertFails(join(erin(), 'erin', 'circle-code-old'));
    await assertFails(join(erin(), 'erin', 'circle-code-001', { role: 'host' }));
    await assertFails(join(erin(), 'erin', 'circle-code-001', { markAs: 'bora' }));
    await assertFails(join(erin(), 'erin', 'no-such-code-0001'));
    await assertFails(join(daveUnverified(), 'dave', 'circle-code-001'));
    // 다른 모임의 초대장으로
    await assertSucceeds(make(carol(), 'carol'));
    await assertFails(join(erin(), 'erin', 'circle-code-001', { cid: NEWC }));
    // 남의 구성원 문서
    const db = erin(); const b = writeBatch(db);
    b.update(CI(db, 'circle-code-001'), { usedBy: 'erin', usedAt: 2 });
    b.set(CM(db, C1, 'frank'), cm('frank', { via: 'circle-code-001' }));
    await assertFails(b.commit());
    // 공간 초대장·우리 공간 옛 초대 코드로는 모임에 못 들어온다
    await env.withSecurityRulesDisabled(async (ctx) => {
      const adb = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(adb, 'spaceInvites/space-code-0001'), { by: CAROL, spaceId: 'sp2', role: 'member', expiresAt: Date.now() + DAY, v: 1 });
    });
    await assertFails(join(erin(), 'erin', 'space-code-0001'));
    await assertFails(setDoc(CM(erin(), C1, 'erin'), cm('erin', { via: 'space-code-0001' })));
    await assertFails(getDoc(doc(erin(), 'circles', C1)));
  });

  test('구성원 문서: 자기 별명만 고친다. 역할·남의 것은 못 고친다. 메일 칸은 넣지 못한다', async () => {
    await assertSucceeds(updateDoc(CM(dave(), C1, 'dave'), { nick: '데이브2' }));
    await assertFails(updateDoc(CM(dave(), C1, 'dave'), { role: 'host' }));
    await assertFails(updateDoc(CM(dave(), C1, 'dave'), { uid: 'bora' }));
    await assertFails(updateDoc(CM(dave(), C1, 'dave'), { via: 'host' }));
    await assertFails(updateDoc(CM(dave(), C1, 'dave'), { email: DAVE }));
    await assertFails(updateDoc(CM(dave(), C1, 'dave'), { nick: '' }));
    await assertFails(updateDoc(CM(dave(), C1, 'dave'), { nick: '가'.repeat(11) }));
    await assertFails(updateDoc(CM(dave(), C1, 'carol'), { nick: '바꿔치기' }));
    await assertFails(updateDoc(CM(as.bora(), C1, 'carol'), { role: 'host' }));
    await assertFails(updateDoc(CM(as.bora(), C1, 'bora'), { role: 'member' }));
  });

  test('걸기: 자기 것만 (문서 이름 끝이 내 uid, by.uid가 나). 메모·함께 간 사람 같은 칸은 못 넣는다', async () => {
    await assertSucceeds(setDoc(IT(carol(), C1, 'n555_carol'), item('carol', 'n555', { spaceId: 'sp2', tag: '빵집', lat: 37.6, lng: 126.8, region: { t: 'kr', code: '41285' }, verdict: 'meh', line: '별로였어요', photos: ['a', 'b'], placeKey: 'n555' })));
    await assertSucceeds(setDoc(IT(dave(), C1, 'k301_dave'), item('dave', 'k301')));
    await assertSucceeds(updateDoc(IT(as.bora(), C1, 'k100_bora'), { line: '다시 가도 좋아요' }));
    const db = dave();
    await assertFails(setDoc(IT(db, C1, 'k302_bora'), item('bora', 'k302'))); // 남의 이름으로
    await assertFails(setDoc(IT(db, C1, 'k302_bora'), item('dave', 'k302')));
    await assertFails(setDoc(IT(db, C1, 'k302_dave'), item('bora', 'k302')));
    await assertFails(setDoc(IT(db, C1, 'k303_dave'), item('dave', 'k302'))); // 열쇠와 문서 이름이 다름
    await assertFails(updateDoc(IT(db, C1, 'k100_bora'), { line: '남의 것 고치기' }));
    await assertFails(setDoc(IT(db, C1, 'k100_bora'), item('dave', 'k100')));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { spaceId: 'main' }))); // 들지 않은 공간 이름
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { memo: '비밀 메모' })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { companions: ['누구'] })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { email: DAVE })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { name: '' })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { name: 'x'.repeat(81) })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { kind: 'secret' })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { line: 'x'.repeat(201) })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { photos: ['1', '2', '3', '4', '5'] })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { lat: 'x' })));
    await assertFails(setDoc(IT(db, C1, 'k304_dave'), item('dave', 'k304', { verdict: 'best' })));
    // 모임 밖 사람은 못 건다
    await assertFails(setDoc(IT(erin(), C1, 'k900_erin'), item('erin', 'k900')));
    await assertFails(setDoc(IT(as.owner(), C1, 'k900_owner'), item('owner', 'k900', { spaceId: 'main' })));
  });

  test('내리기: 본인, 같은 공간 사람(짝), 방장. 그 밖의 구성원은 남의 것을 못 내린다', async () => {
    await assertFails(deleteDoc(IT(dave(), C1, 'k200_carol')));
    await assertFails(deleteDoc(IT(carol(), C1, 'k300_dave')));
    await assertFails(deleteDoc(IT(carol(), C1, 'k100_bora')));
    await assertFails(deleteDoc(IT(as.owner(), C1, 'k100_bora'))); // 같은 공간이어도 모임 밖이면 못 내린다
    await assertSucceeds(deleteDoc(IT(dave(), C1, 'k300_dave')));
    await assertSucceeds(deleteDoc(IT(as.bora(), C1, 'k200_carol'))); // 방장
    // 짝: 주인이 모임에 들어오면 보라(같은 공간)가 건 것을 내릴 수 있다
    await assertSucceeds(join(as.owner(), 'owner', 'circle-code-001'));
    await assertSucceeds(deleteDoc(IT(as.owner(), C1, 'k100_bora')));
  });

  test('사진 사본: 구성원이 자기 것만 올리고(220KB까지), 고치지 못하고, 본인·짝·방장이 지운다', async () => {
    await assertSucceeds(setDoc(PH(dave(), C1, 'ph-dave-2'), photo('dave')));
    await assertFails(setDoc(PH(dave(), C1, 'ph-dave-3'), photo('bora')));
    await assertFails(setDoc(PH(dave(), C1, 'ph-dave-3'), photo('dave', { spaceId: 'main' })));
    await assertFails(setDoc(PH(dave(), C1, 'ph-dave-3'), photo('dave', { data: Bytes.fromUint8Array(new Uint8Array(220001)) })));
    await assertFails(setDoc(PH(dave(), C1, 'ph-dave-3'), photo('dave', { lat: 37.5 })));
    await assertFails(setDoc(PH(dave(), C1, 'ph-dave-3'), photo('dave', { data: 'text' })));
    await assertFails(updateDoc(PH(dave(), C1, 'ph-dave-1'), { w: 20 }));
    await assertFails(setDoc(PH(erin(), C1, 'ph-erin-1'), photo('erin')));
    await assertFails(deleteDoc(PH(carol(), C1, 'ph-dave-1')));
    await assertSucceeds(deleteDoc(PH(dave(), C1, 'ph-dave-1')));
    await assertSucceeds(deleteDoc(PH(as.bora(), C1, 'ph-dave-2')));
  });

  test('나가기·내보내기: 구성원은 스스로 나가고, 방장은 남을 내보낸다. 나가면 바로 못 본다', async () => {
    await assertFails(deleteDoc(CM(dave(), C1, 'carol')));
    await assertFails(deleteDoc(CM(as.owner(), C1, 'dave')));
    await assertFails(deleteDoc(CM(as.bora(), C1, 'bora'))); // 방장은 모임이 있는 동안 못 나간다
    await assertSucceeds(deleteDoc(CM(dave(), C1, 'dave')));
    await assertFails(getDocs(collection(dave(), `circles/${C1}/items`)));
    await assertFails(setDoc(IT(dave(), C1, 'k305_dave'), item('dave', 'k305')));
    await assertFails(setDoc(CM(dave(), C1, 'dave'), cm('dave')));
    await assertSucceeds(deleteDoc(CM(as.bora(), C1, 'carol')));
    await assertFails(getDoc(doc(carol(), 'circles', C1)));
    // 나간 사람이 남긴 것은 방장이 내린다
    await assertSucceeds(deleteDoc(IT(as.bora(), C1, 'k300_dave')));
  });

  test('모임 고치기·없애기: 방장만. 이름만 고치고 만든 사람은 못 바꾼다', async () => {
    await assertSucceeds(updateDoc(doc(as.bora(), 'circles', C1), { name: '처가 식구' }));
    await assertFails(updateDoc(doc(as.bora(), 'circles', C1), { createdBy: 'carol' }));
    await assertFails(updateDoc(doc(as.bora(), 'circles', C1), { name: '' }));
    await assertFails(updateDoc(doc(carol(), 'circles', C1), { name: '뺏기' }));
    await assertFails(deleteDoc(doc(carol(), 'circles', C1)));
    await assertFails(deleteDoc(doc(as.owner(), 'circles', C1)));
    // 없앨 때: 모임 문서와 내 방장 문서를 함께
    const db = as.bora(); const b = writeBatch(db);
    b.delete(doc(db, 'circles', C1)); b.delete(CM(db, C1, 'bora'));
    await assertSucceeds(b.commit());
    await assertFails(getDocs(collection(as.bora(), `circles/${C1}/items`)));
  });

  test('내 모임 목록(users/{uid}/circles): 자기 것만 읽고 쓴다. 들지 않은 모임은 적지 못한다', async () => {
    await assertSucceeds(setDoc(doc(dave(), `users/dave/circles/${C1}`), { name: '처가 가족', v: 1 }));
    await assertSucceeds(getDocs(collection(dave(), 'users/dave/circles')));
    await assertSucceeds(deleteDoc(doc(dave(), `users/dave/circles/${C1}`)));
    await assertFails(setDoc(doc(erin(), `users/erin/circles/${C1}`), { name: '처가 가족', v: 1 }));
    await assertFails(setDoc(doc(dave(), `users/carol/circles/${C1}`), { name: 'x', v: 1 }));
    await assertFails(getDocs(collection(carol(), 'users/dave/circles')));
    await assertFails(getDocs(collection(as.owner(), 'users/dave/circles')));
    await assertFails(setDoc(doc(dave(), `users/dave/circles/${C1}`), { name: 'x', email: DAVE, v: 1 }));
    await assertFails(setDoc(doc(dave(), 'users/dave'), { anything: 1 }));
  });
});

// 6걸음 (docs/design/SPACES-PUBLIC.md 5절): 보라핀 사람들에게 공개 — 공개 평, 공개 사진, 신고
describe('6걸음: 공개 평 (pubReviews · pubPhotos · pubFlags)', () => {
  const dave = () => as2.dave();
  const carol = () => as2.carol();
  const R = (db: Firestore, id: string) => doc(db, 'pubReviews', id);
  const PP = (db: Firestore, id: string) => doc(db, 'pubPhotos', id);
  const F = (db: Firestore, id: string) => doc(db, 'pubFlags', id);
  const rev = (uid: string, key: string, spaceId: string, over: Record<string, unknown> = {}) => ({
    placeKey: key, name: '소금빵집', kind: 'food', region: { t: 'kr', code: '41285' }, verdict: 'again', line: '빵이 짭짤해요',
    nick: '별명', uid, spaceId, month: '2026-11', hidden: false, v: 1, ...over,
  });
  const pphoto = (uid: string, spaceId: string, over: Record<string, unknown> = {}) => ({ uid, spaceId, reviewId: `k100_${uid}`, data: Bytes.fromUint8Array(new Uint8Array([1, 2, 3])), w: 10, h: 10, v: 1, ...over });
  const flag = (uid: string, reviewId: string, over: Record<string, unknown> = {}) => ({ reviewId, uid, reason: 'privacy', v: 1, ...over });
  const expectIds = (snap: { docs: { id: string }[] }, ids: string[]) => assert.deepEqual(snap.docs.map((x) => x.id).sort(), [...ids].sort());

  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(db, 'profiles/bora'), { nick: '보라', spaceId: 'main', v: 1 });
      await setDoc(doc(db, 'profiles/owner'), { nick: '영상', spaceId: 'main', v: 1 });
      await setDoc(doc(db, 'spaces/sp2/members/carol'), memberDoc('carol', CAROL, { role: 'admin', name: '캐롤', via: 'invite-code-1' }));
      await setDoc(doc(db, 'profiles/carol'), { nick: '캐롤', spaceId: 'sp2', v: 1 });
      // 모임에만 든 손님 (공간 없음)
      await setDoc(doc(db, 'circles/CircleFamily01234567'), { name: '모임', createdBy: 'bora', v: 1 });
      await setDoc(doc(db, 'circles/CircleFamily01234567/members/dave'), { uid: 'dave', role: 'member', nick: '데이브', via: 'seed-code-000', v: 1 });
      await setDoc(R(db, 'k100_bora'), rev('bora', 'k100', 'main', { nick: '보라' }));
      await setDoc(R(db, 'k100_carol'), rev('carol', 'k100', 'sp2', { nick: '캐롤', verdict: 'once', line: '한 번이면 돼요' }));
      await setDoc(R(db, 'k200_carol'), rev('carol', 'k200', 'sp2', { nick: '캐롤', hidden: true, hiddenReason: '얼굴이 나온 사진' }));
      // 사진이 붙은 평: 사진 이름은 평 이름_0 · _1 둘뿐이고, 평의 photos 목록과 늘 맞는다
      await setDoc(R(db, 'k400_bora'), rev('bora', 'k400', 'main', { nick: '보라', photos: ['k400_bora_0'] }));
      await setDoc(PP(db, 'k400_bora_0'), pphoto('bora', 'main', { reviewId: 'k400_bora' }));
      await setDoc(R(db, 'k400_carol'), rev('carol', 'k400', 'sp2', { nick: '캐롤', photos: ['k400_carol_0', 'k400_carol_1'] }));
      await setDoc(PP(db, 'k400_carol_0'), pphoto('carol', 'sp2', { reviewId: 'k400_carol' }));
      await setDoc(PP(db, 'k400_carol_1'), pphoto('carol', 'sp2', { reviewId: 'k400_carol' }));
      await setDoc(R(db, 'k500_carol'), rev('carol', 'k500', 'sp2', { nick: '캐롤', hidden: true, hiddenReason: '얼굴이 나온 사진', photos: ['k500_carol_0'] }));
      await setDoc(PP(db, 'k500_carol_0'), pphoto('carol', 'sp2', { reviewId: 'k500_carol' }));
      await setDoc(F(db, 'k100_bora_carol'), flag('carol', 'k100_bora'));
    });
  });

  test('읽기: 보라핀 사람(어느 공간이든)은 가려지지 않은 평을 하나씩도, 가게별 목록으로도 본다', async () => {
    for (const db of [as.bora(), as.owner(), carol()]) {
      await assertSucceeds(getDoc(R(db, 'k100_bora')));
      await assertSucceeds(getDocs(query(collection(db, 'pubReviews'), where('placeKey', '==', 'k100'), where('hidden', '==', false))));
      await assertSucceeds(getDocs(query(collection(db, 'pubReviews'), where('placeKey', 'in', ['k100', 'k200']), where('hidden', '==', false))));
    }
  });
  test('읽기: 공간이 없는 사람·손님·로그인 안 한 사람·메일 인증 안 한 사람은 못 본다', async () => {
    const unverified = env.authenticatedContext('carol', { email: CAROL, email_verified: false }).firestore() as unknown as Firestore;
    for (const db of [dave(), as.stranger(), as.anon(), unverified]) {
      await assertFails(getDoc(R(db, 'k100_bora')));
      await assertFails(getDocs(query(collection(db, 'pubReviews'), where('placeKey', '==', 'k100'), where('hidden', '==', false))));
      await assertFails(getDoc(PP(db, 'k400_bora_0')));
    }
  });
  test('읽기: 가려진 평은 쓴 사람과 마을 주인만 본다. 가려진 것까지 긁는 목록은 막힌다', async () => {
    await assertFails(getDoc(R(as.bora(), 'k200_carol')));
    await assertSucceeds(getDoc(R(carol(), 'k200_carol')));
    await assertSucceeds(getDoc(R(as.owner(), 'k200_carol')));
    await assertFails(getDocs(collection(as.bora(), 'pubReviews')));
    await assertFails(getDocs(query(collection(as.bora(), 'pubReviews'), where('placeKey', '==', 'k200'))));
    // 내가 공개한 것 한눈에 (가려진 것 포함) · 주인의 가려진 평 목록
    await assertSucceeds(getDocs(query(collection(carol(), 'pubReviews'), where('uid', '==', 'carol'))));
    await assertFails(getDocs(query(collection(as.bora(), 'pubReviews'), where('uid', '==', 'carol'))));
    await assertSucceeds(getDocs(query(collection(as.owner(), 'pubReviews'), where('hidden', '==', true))));
    await assertFails(getDocs(query(collection(as.bora(), 'pubReviews'), where('hidden', '==', true))));
  });
  test('내보내진 사람은 바로 못 본다 (별명 문서가 남아 있어도)', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => { await deleteDoc(doc(ctx.firestore() as unknown as Firestore, 'spaces/sp2/members/carol')); });
    await assertFails(getDoc(R(carol(), 'k100_bora')));
    await assertFails(setDoc(R(carol(), 'k300_carol'), rev('carol', 'k300', 'sp2')));
  });

  test('공개하기: 한 사람이 한 가게에 한 건 (문서 이름 = 가게 번호_내 uid), 자기 공간 이름으로, 고칠 수 있다', async () => {
    await assertSucceeds(setDoc(R(as.bora(), 'n555_bora'), rev('bora', 'n555', 'main', { tag: '빵집' })));
    await assertSucceeds(setDoc(R(carol(), 'k300_carol'), rev('carol', 'k300', 'sp2', { verdict: 'once', line: '' })));
    await assertSucceeds(updateDoc(R(as.bora(), 'k100_bora'), { line: '고친 평', verdict: 'once' }));
  });
  test('공개하기의 빈틈: 남의 이름·남의 공간·별로·손님·가게 번호 없는 가게는 막힌다', async () => {
    const db = as.bora();
    await assertFails(setDoc(R(db, 'k300_carol'), rev('carol', 'k300', 'sp2'))); // 남의 이름으로
    await assertFails(setDoc(R(db, 'k300_carol'), rev('bora', 'k300', 'main')));
    await assertFails(setDoc(R(db, 'k300_bora'), rev('carol', 'k300', 'main')));
    await assertFails(setDoc(R(db, 'k301_bora'), rev('bora', 'k300', 'main'))); // 문서 이름과 가게 번호가 다름
    await assertFails(setDoc(R(db, 'k300_bora'), rev('bora', 'k300', 'sp2'))); // 들지 않은 공간 이름
    await assertFails(setDoc(R(db, 'k300_bora'), rev('bora', 'k300', 'main', { verdict: 'meh' }))); // '별로'는 공개하지 않는다
    await assertFails(setDoc(R(db, 'k300_bora'), rev('bora', 'k300', 'main', { verdict: null })));
    await assertFails(setDoc(R(db, 'pAbc123_bora'), rev('bora', 'pAbc123', 'main'))); // 손으로 적은 가게
    await assertFails(setDoc(R(db, 'g1a2b3_bora'), rev('bora', 'g1a2b3', 'main')));
    await assertFails(updateDoc(R(db, 'k100_carol'), { line: '남의 평 고치기' }));
    await assertFails(setDoc(R(db, 'k100_carol'), rev('bora', 'k100', 'main')));
    await assertFails(updateDoc(R(db, 'k100_bora'), { uid: 'carol' }));
    await assertFails(updateDoc(R(db, 'k100_bora'), { placeKey: 'k999' }));
    await assertFails(updateDoc(R(db, 'k100_bora'), { verdict: 'meh' }));
    await assertFails(setDoc(R(dave(), 'k300_dave'), rev('dave', 'k300', 'main')));
    await assertFails(setDoc(R(as.stranger(), 'k300_stranger'), rev('stranger', 'k300', 'main')));
  });
  test('공개하기의 모양: 메일·위경도·메모·정확한 날짜 같은 칸은 못 넣는다', async () => {
    const db = as.bora();
    const bad = (over: Record<string, unknown>) => assertFails(setDoc(R(db, 'k300_bora'), rev('bora', 'k300', 'main', over)));
    await bad({ email: BORA });
    await bad({ lat: 37.5, lng: 127 });
    await bad({ memo: '비밀' });
    await bad({ companions: ['엄마'] });
    await bad({ tripId: 't1' });
    await bad({ date: '2026-11-21' });
    await bad({ month: '2026-11-21' });
    await bad({ name: '' });
    await bad({ name: 'x'.repeat(81) });
    await bad({ line: 'x'.repeat(201) });
    await bad({ nick: '' });
    await bad({ nick: '가'.repeat(11) });
    await bad({ kind: 'secret' });
    await bad({ photos: ['1', '2', '3'] });
    await bad({ tag: 'x'.repeat(21) });
    // 올린 시각은 남기지 않는다: '지금 여기'에서 바로 공개하면 '이 사람이 지금 이 가게에 있다'가 보인다 (달까지만)
    await bad({ at: Timestamp.now() });
    await bad({ updatedAt: Timestamp.now() });
    // 지역은 보라핀 지역 모양만 (국내 칸 번호 / 나라·도시)
    await bad({ region: { t: 'kr', code: '41285', note: '우리 집 근처' } });
    await bad({ region: { t: 'kr', code: 41285 } });
    await bad({ region: { t: 'home', code: '41285' } });
    await bad({ region: { t: 'country', id: 'JPN', city: 'x'.repeat(41) } });
    await assertSucceeds(setDoc(R(db, 'k301_bora'), rev('bora', 'k301', 'main', { region: { t: 'country', id: 'JPN', city: '교토' } })));
    await assertFails(updateDoc(R(db, 'k100_bora'), { updatedAt: Timestamp.now() }));
  });

  test('가리기: 마을 주인만 가리고 푼다. 쓴 사람은 처음부터 가려진 채로 올리거나 스스로 풀 수 없다', async () => {
    await assertFails(setDoc(R(as.bora(), 'k300_bora'), rev('bora', 'k300', 'main', { hidden: true })));
    await assertFails(updateDoc(R(as.bora(), 'k100_carol'), { hidden: true }));
    await assertFails(updateDoc(R(as.bora(), 'k100_bora'), { hidden: true }));
    await assertFails(updateDoc(R(carol(), 'k200_carol'), { hidden: false }));
    await assertFails(setDoc(R(carol(), 'k200_carol'), rev('carol', 'k200', 'sp2', { nick: '캐롤' })));
    // 가려진 평도 쓴 사람이 고칠 수는 있다 (가려진 채로)
    await assertSucceeds(updateDoc(R(carol(), 'k200_carol'), { line: '사진을 뺐어요' }));
    await assertFails(getDoc(R(as.bora(), 'k200_carol')));
    // 주인: 가리기·풀기만 (내용은 못 고친다)
    await assertSucceeds(updateDoc(R(as.owner(), 'k100_carol'), { hidden: true, hiddenReason: '광고' }));
    await assertFails(getDoc(R(as.bora(), 'k100_carol')));
    await assertSucceeds(updateDoc(R(as.owner(), 'k200_carol'), { hidden: false }));
    await assertSucceeds(getDoc(R(as.bora(), 'k200_carol')));
    await assertFails(updateDoc(R(as.owner(), 'k100_carol'), { line: '주인이 고쳐 씀' }));
    await assertFails(updateDoc(R(as.owner(), 'k100_carol'), { hidden: true, nick: '바꿔치기' }));
    await assertFails(updateDoc(R(as.owner(), 'k100_carol'), { hidden: true, hiddenReason: 'x'.repeat(101) }));
  });

  test('거두기: 본인, 같은 공간 사람(짝), 마을 주인. 다른 공간 사람은 못 지운다', async () => {
    await assertFails(deleteDoc(R(carol(), 'k100_bora')));
    await assertFails(deleteDoc(R(as.bora(), 'k100_carol')));
    await assertFails(deleteDoc(R(dave(), 'k100_bora')));
    await assertSucceeds(deleteDoc(R(as.owner(), 'k100_bora'))); // 같은 공간(짝)이자 주인
    await assertSucceeds(deleteDoc(R(carol(), 'k100_carol')));
    await assertSucceeds(deleteDoc(R(as.owner(), 'k200_carol'))); // 주인
  });

  // ---- 공개 사진 (7걸음). 사진은 평과 한 묶음(batch)으로만 오간다 ----
  const addPhoto = (db: Firestore, rid: string, slot: 0 | 1, uid: string, spaceId: string, before: string[], over: Record<string, unknown> = {}) => {
    const b = writeBatch(db);
    b.update(R(db, rid), { photos: [...before, `${rid}_${slot}`] });
    b.set(PP(db, `${rid}_${slot}`), pphoto(uid, spaceId, { reviewId: rid, ...over }));
    return b.commit();
  };
  test('공개 사진 읽기: 보라핀 사람은 가려지지 않은 평의 사진을 하나씩 본다. 긁어 가는 목록은 막힌다', async () => {
    await assertSucceeds(getDoc(PP(carol(), 'k400_bora_0')));
    await assertSucceeds(getDoc(PP(as.bora(), 'k400_carol_1')));
    await assertFails(getDocs(collection(carol(), 'pubPhotos')));
    await assertFails(getDocs(query(collection(carol(), 'pubPhotos'), where('reviewId', '==', 'k400_bora'))));
    await assertSucceeds(getDocs(query(collection(as.bora(), 'pubPhotos'), where('uid', '==', 'bora'))));
  });
  test('공개 사진 읽기: 가려진 평의 사진은 쓴 사람과 마을 주인만 본다 (이름을 맞혀도 못 본다)', async () => {
    await assertFails(getDoc(PP(as.bora(), 'k500_carol_0')));
    await assertSucceeds(getDoc(PP(carol(), 'k500_carol_0')));
    await assertSucceeds(getDoc(PP(as.owner(), 'k500_carol_0')));
    // 주인이 가리면 그때부터 남은 못 본다
    await assertSucceeds(updateDoc(R(as.owner(), 'k400_bora'), { hidden: true, hiddenReason: '얼굴이 나온 사진' }));
    await assertFails(getDoc(PP(carol(), 'k400_bora_0')));
    await assertSucceeds(getDoc(PP(as.bora(), 'k400_bora_0')));
  });
  test('공개 사진 올리기: 내 평에, 평과 한 묶음으로, 둘째 칸까지', async () => {
    await assertSucceeds(addPhoto(as.bora(), 'k400_bora', 1, 'bora', 'main', ['k400_bora_0']));
    await assertSucceeds(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', []));
    // 평을 처음 공개하면서 사진도 같이
    const c = carol(); // 한 묶음의 문서는 같은 연결에서 나와야 한다
    const b = writeBatch(c);
    b.set(R(c, 'k300_carol'), rev('carol', 'k300', 'sp2', { photos: ['k300_carol_1'] }));
    b.set(PP(c, 'k300_carol_1'), pphoto('carol', 'sp2', { reviewId: 'k300_carol' }));
    await assertSucceeds(b.commit());
  });
  test('공개 사진 올리기: 평 없이, 평 목록에 안 적고, 다른 이름으로는 못 올린다 (저장 공간을 몰래 못 쓴다)', async () => {
    // 평에 적지 않고 사진만
    await assertFails(setDoc(PP(as.bora(), 'k100_bora_0'), pphoto('bora', 'main', { reviewId: 'k100_bora' })));
    // 없는 평에
    await assertFails(setDoc(PP(as.bora(), 'k999_bora_0'), pphoto('bora', 'main', { reviewId: 'k999_bora' })));
    // 정해진 이름(평 이름_0 · _1)이 아닌 것
    for (const id of ['pp-bora-9', 'k100_bora_2', 'k100_bora_00', 'k100_bora']) {
      const d = as.bora();
      const b = writeBatch(d);
      b.update(R(d, 'k100_bora'), { photos: [id] });
      b.set(PP(d, id), pphoto('bora', 'main', { reviewId: 'k100_bora' }));
      await assertFails(b.commit());
    }
    // 평 목록에 아무 글이나 넣기 (사진 없이 이름만, 긴 글, 같은 이름 두 번, 글이 아닌 것)
    await assertFails(updateDoc(R(as.bora(), 'k100_bora'), { photos: ['k100_bora_0'] }));
    await assertFails(updateDoc(R(as.bora(), 'k100_bora'), { photos: ['a', 'b'] }));
    await assertFails(updateDoc(R(as.bora(), 'k100_bora'), { photos: ['x'.repeat(5000)] }));
    await assertFails(updateDoc(R(as.bora(), 'k400_bora'), { photos: ['k400_bora_0', 'k400_bora_0'] }));
    await assertFails(updateDoc(R(as.bora(), 'k400_bora'), { photos: [{ big: 'x'.repeat(5000) }] }));
    await assertFails(setDoc(R(as.bora(), 'n555_bora'), rev('bora', 'n555', 'main', { photos: ['a', 'b'] })));
    await assertSucceeds(updateDoc(R(as.bora(), 'k100_bora'), { photos: [] }));
  });
  test('공개 사진 올리기: 남의 평·남의 이름·다른 공간·큰 사진·위경도나 시각 칸은 막힌다', async () => {
    await assertFails(addPhoto(as.bora(), 'k400_carol', 0, 'bora', 'main', []));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'carol', 'main', []));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'sp2', []));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', [], { data: Bytes.fromUint8Array(new Uint8Array(220001)) }));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', [], { data: 'AAAA' }));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', [], { lat: 37.5 }));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', [], { takenAt: 1 }));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', [], { at: Timestamp.now() })); // 올린 시각도 남기지 않는다
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', [], { w: 99999 }));
    await assertFails(updateDoc(PP(as.bora(), 'k400_bora_0'), { w: 20 }));
    await assertFails(updateDoc(PP(as.bora(), 'k400_bora_0'), { data: Bytes.fromUint8Array(new Uint8Array([9])) }));
  });
  test('공개 사진 지우기: 평 목록에서 빼면서 같이 지운다. 사진만 지우거나 목록에서만 빼지는 못한다', async () => {
    await assertFails(deleteDoc(PP(as.bora(), 'k400_bora_0')));
    await assertFails(updateDoc(R(as.bora(), 'k400_bora'), { photos: [] }));
    const mk = (db: Firestore) => { const b = writeBatch(db); b.update(R(db, 'k400_bora'), { photos: [] }); b.delete(PP(db, 'k400_bora_0')); return b.commit(); };
    await assertFails(mk(carol()));
    await assertSucceeds(mk(as.bora()));
    // 둘 중 하나만
    const c = carol();
    const one = writeBatch(c);
    one.update(R(c, 'k400_carol'), { photos: ['k400_carol_1'] });
    one.delete(PP(c, 'k400_carol_0'));
    await assertSucceeds(one.commit());
  });
  test('공개 거두기: 평을 지울 땐 사진도 같이 지워야 한다 (본인·짝·주인). 사진이 남는 지우기는 막힌다', async () => {
    await assertFails(deleteDoc(R(as.bora(), 'k400_bora')));
    await assertFails(deleteDoc(R(as.owner(), 'k400_carol')));
    const drop = (db: Firestore, rid: string, photos: string[]) => { const b = writeBatch(db); b.delete(R(db, rid)); photos.forEach((p) => b.delete(PP(db, p))); return b.commit(); };
    await assertFails(drop(as.bora(), 'k400_carol', ['k400_carol_0', 'k400_carol_1']));
    await assertFails(drop(carol(), 'k400_carol', ['k400_carol_0']));
    await assertSucceeds(drop(as.owner(), 'k400_bora', ['k400_bora_0'])); // 주인이자 같은 공간 짝
    await assertSucceeds(drop(carol(), 'k400_carol', ['k400_carol_0', 'k400_carol_1']));
    await assertSucceeds(drop(as.owner(), 'k500_carol', ['k500_carol_0']));
    await assertSucceeds(deleteDoc(R(as.bora(), 'k100_bora'))); // 사진 없는 평은 그냥 지운다
  });
  test('공개 사진: 쓴 사람이 글을 고쳐도 사진 목록은 그대로여야 한다. 가려진 평엔 새 사진을 못 붙인다는 건 아니다(쓴 사람은 고칠 수 있다)', async () => {
    await assertSucceeds(updateDoc(R(as.bora(), 'k400_bora'), { line: '고친 평' }));
    await assertFails(setDoc(R(as.bora(), 'k400_bora'), rev('bora', 'k400', 'main', { nick: '보라' }))); // 덮어쓰며 목록을 잃기
    await assertSucceeds(setDoc(R(as.bora(), 'k400_bora'), rev('bora', 'k400', 'main', { nick: '보라', photos: ['k400_bora_0'] })));
  });
  test('공개 사진: 공간이 없는 사람·손님은 올리지도 보지도 못한다', async () => {
    await assertFails(setDoc(PP(dave(), 'k100_dave_0'), pphoto('dave', 'main', { reviewId: 'k100_dave' })));
    await assertFails(getDoc(PP(dave(), 'k400_bora_0')));
    await assertFails(getDoc(PP(as.anon(), 'k400_bora_0')));
  });
  test('공개 사진 멈춤 스위치: 주인이 켜면 새 사진을 못 올린다 (평 글과 지우기는 그대로)', async () => {
    await assertSucceeds(setDoc(doc(as.owner(), 'config/flags'), { pubPhotosPaused: true }));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', []));
    await assertSucceeds(setDoc(R(as.bora(), 'k300_bora'), rev('bora', 'k300', 'main')));
    const d = as.bora();
    const b = writeBatch(d); b.update(R(d, 'k400_bora'), { photos: [] }); b.delete(PP(d, 'k400_bora_0'));
    await assertSucceeds(b.commit());
    await assertSucceeds(setDoc(doc(as.owner(), 'config/flags'), { pubPhotosPaused: false }));
    await assertSucceeds(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', []));
  });

  // ---- 공간 관리자의 공개 끄기 (spaces/{공간}.pubOff) ----
  const seedSpaces = (over: Record<string, Record<string, unknown>> = {}) => env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore() as unknown as Firestore;
    await setDoc(doc(db, 'spaces/main'), { name: '우리 집', v: 1, ...(over.main ?? {}) });
    await setDoc(doc(db, 'spaces/sp2'), { name: '캐롤네', v: 1, ...(over.sp2 ?? {}) });
  });
  test('공개 끄기 스위치: 공간 관리자만 켜고 끈다. 구성원은 못 바꾸고, 다른 칸을 고칠 때도 그대로 둬야 한다', async () => {
    await seedSpaces();
    await assertFails(updateDoc(doc(as.bora(), 'spaces/main'), { pubOff: true }));
    await assertSucceeds(updateDoc(doc(as.bora(), 'spaces/main'), { name: '보라네' })); // 다른 칸은 예전처럼
    await assertFails(updateDoc(doc(carol(), 'spaces/main'), { pubOff: true })); // 남의 공간
    await assertFails(updateDoc(doc(as.owner(), 'spaces/main'), { pubOff: 'yes' }));
    await assertSucceeds(updateDoc(doc(as.owner(), 'spaces/main'), { pubOff: true }));
    await assertFails(updateDoc(doc(as.bora(), 'spaces/main'), { pubOff: false })); // 구성원이 다시 켜기
    await assertFails(updateDoc(doc(as.bora(), 'spaces/main'), { pubOff: deleteField() }));
    await assertSucceeds(updateDoc(doc(as.bora(), 'spaces/main'), { name: '우리 집' }));
    await assertSucceeds(updateDoc(doc(carol(), 'spaces/sp2'), { pubOff: true })); // 캐롤은 자기 공간 관리자
    await assertSucceeds(updateDoc(doc(as.owner(), 'spaces/main'), { pubOff: false }));
  });
  test('공개를 끈 공간: 새로 공개하지도, 글을 고치지도, 사진을 붙이지도 못한다. 거두기는 된다. 다른 공간은 그대로', async () => {
    await seedSpaces({ main: { pubOff: true } });
    await assertFails(setDoc(R(as.bora(), 'k300_bora'), rev('bora', 'k300', 'main')));
    await assertFails(setDoc(R(as.owner(), 'k300_owner'), rev('owner', 'k300', 'main'))); // 관리자 자신도
    await assertFails(updateDoc(R(as.bora(), 'k100_bora'), { line: '고친 평' }));
    await assertFails(addPhoto(as.bora(), 'k100_bora', 0, 'bora', 'main', []));
    await assertFails(addPhoto(as.bora(), 'k400_bora', 1, 'bora', 'main', ['k400_bora_0']));
    await assertSucceeds(setDoc(R(carol(), 'k300_carol'), rev('carol', 'k300', 'sp2')));
    await assertSucceeds(getDoc(R(as.bora(), 'k100_carol'))); // 읽기는 그대로
    const d = as.bora();
    const b = writeBatch(d); b.delete(R(d, 'k400_bora')); b.delete(PP(d, 'k400_bora_0'));
    await assertSucceeds(b.commit());
    await assertSucceeds(deleteDoc(R(as.owner(), 'k100_bora'))); // 관리자가 구성원 것을 거둔다
    // 다시 켜면 공개할 수 있다
    await assertSucceeds(updateDoc(doc(as.owner(), 'spaces/main'), { pubOff: false }));
    await assertSucceeds(setDoc(R(as.bora(), 'k300_bora'), rev('bora', 'k300', 'main')));
  });
  test('공개 끄기: 공간 관리자는 자기 공간의 공개 평을 모아 읽고(가려진 것까지) 거둔다. 구성원·다른 공간 관리자는 못 모은다', async () => {
    await seedSpaces();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      // 캐롤네 구성원 erin의 가려진 평 (관리자 캐롤이 거둘 수 있어야 한다)
      await setDoc(doc(db, 'spaces/sp2/members/erin'), memberDoc('erin', 'erin@example.com', { role: 'member', name: '에린', via: 'invite-code-2' }));
      await setDoc(R(db, 'k700_erin'), rev('erin', 'k700', 'sp2', { hidden: true }));
    });
    const c = carol();
    const got = await assertSucceeds(getDocs(query(collection(c, 'pubReviews'), where('spaceId', '==', 'sp2'))));
    expectIds(got, ['k100_carol', 'k200_carol', 'k400_carol', 'k500_carol', 'k700_erin']);
    await assertSucceeds(getDoc(R(c, 'k700_erin')));
    await assertFails(getDocs(query(collection(c, 'pubReviews'), where('spaceId', '==', 'main'))));
    await assertFails(getDocs(query(collection(as.bora(), 'pubReviews'), where('spaceId', '==', 'main'))));
    const erin = env.authenticatedContext('erin', { email: 'erin@example.com', email_verified: true }).firestore() as unknown as Firestore;
    await assertFails(getDocs(query(collection(erin, 'pubReviews'), where('spaceId', '==', 'sp2'))));
    await assertSucceeds(deleteDoc(R(c, 'k700_erin')));
  });

  test('신고: 보라핀 사람이 한 평에 한 번, 고칠 수 없다. 읽고 지우는 건 마을 주인만', async () => {
    await assertSucceeds(setDoc(F(as.bora(), 'k100_carol_bora'), flag('bora', 'k100_carol', { note: '광고 같아요' })));
    await assertFails(setDoc(F(as.bora(), 'k100_carol_bora'), flag('bora', 'k100_carol', { reason: 'rude' }))); // 다시 쓰기(고치기)
    await assertFails(updateDoc(F(carol(), 'k100_bora_carol'), { reason: 'ad' }));
    await assertFails(setDoc(F(as.bora(), 'k100_carol_owner'), flag('owner', 'k100_carol'))); // 남의 이름으로
    await assertFails(setDoc(F(as.bora(), 'k100_carol_bora2'), flag('bora', 'k100_carol')));
    await assertFails(setDoc(F(as.bora(), 'k999_none_bora'), flag('bora', 'k999_none'))); // 없는 평
    await assertFails(setDoc(F(as.owner(), 'k200_carol_owner'), flag('owner', 'k200_carol', { reason: 'whatever' })));
    await assertFails(setDoc(F(as.owner(), 'k200_carol_owner'), flag('owner', 'k200_carol', { note: 'x'.repeat(201) })));
    await assertFails(setDoc(F(as.owner(), 'k200_carol_owner'), flag('owner', 'k200_carol', { email: OWNER })));
    await assertFails(setDoc(F(dave(), 'k100_bora_dave'), flag('dave', 'k100_bora')));
    // 읽기·지우기
    await assertFails(getDoc(F(as.bora(), 'k100_bora_carol')));
    await assertFails(getDoc(F(carol(), 'k100_bora_carol')));
    await assertFails(getDocs(collection(carol(), 'pubFlags')));
    await assertFails(deleteDoc(F(carol(), 'k100_bora_carol')));
    await assertSucceeds(getDocs(collection(as.owner(), 'pubFlags')));
    await assertSucceeds(deleteDoc(F(as.owner(), 'k100_bora_carol')));
  });
});
