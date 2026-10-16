/**
 * 예전 여행지도(v21) 기록을 보라핀 DB로 직접 옮긴다. (앱 화면에서 가져오기 대신, 한 번만 쓰는 서버 작업)
 *
 *   npx tsx scripts/migrate.ts <v21 '데이터 내보내기' JSON 경로>
 *
 * - 파일 없이 실행하면 배포 계정의 DB 읽기·쓰기 권한만 확인한다.
 * - DRY_RUN=1 이면 무엇을 옮길지 보여 주기만 한다.
 * - 같은 지역은 같은 문서 id(v22-<코드>)로 쓰므로 여러 번 돌려도 겹치지 않는다.
 */
import fs from 'node:fs';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { planV22Import } from '../src/lib/v22import';
import { regionLong } from '../src/lib/geo';

const OWNER = 'ysangyn@gmail.com';
const SPACE = 'spaces/main';
const file = process.argv[2];
const dry = process.env.DRY_RUN === '1';

const projectId = process.env.GCLOUD_PROJECT || 'borapin';
// 점검 때는 가짜 Firebase(에뮬레이터)에 쓴다
initializeApp(process.env.FIRESTORE_EMULATOR_HOST ? { projectId } : { credential: applicationDefault(), projectId });
const db = getFirestore();

function explain(e: unknown): never {
  const msg = String((e as Error)?.message ?? e);
  if (/PERMISSION_DENIED|permission/i.test(msg)) {
    console.error('\n✗ 배포 계정에 DB 권한이 없어요.');
    console.error("  Google Cloud 콘솔 → IAM → github-deploy 계정에 'Cloud Datastore 사용자' 역할을 추가해 주세요.");
  }
  console.error(msg);
  process.exit(1);
}

// 1) 권한 확인: 읽기 + 쓰고 지우기
let accessExists = false;
try {
  accessExists = (await db.doc('config/access').get()).exists;
  const probe = db.doc('config/_probe');
  await probe.set({ at: FieldValue.serverTimestamp() });
  await probe.delete();
  console.log(`✓ DB 읽기·쓰기 권한 확인 (허용 목록 ${accessExists ? '있음' : '아직 없음 — 주인 첫 로그인 전'})`);
} catch (e) {
  explain(e);
}

if (!file || !fs.existsSync(file)) {
  console.log('옮길 파일이 없어 권한 확인만 하고 끝냅니다.');
  process.exit(0);
}

// 2) 파일 읽고 계획 세우기
const plan = planV22Import(JSON.parse(fs.readFileSync(file, 'utf8')));
console.log(`\n옮길 것: 지난 여행 ${plan.trips.length}건, 가고 싶은 곳 ${plan.wishes.length}곳`);
console.log(`건너뜀: 알 수 없는 지역 코드 ${plan.skipped.length}개${plan.skipped.length ? ` (${plan.skipped.join(', ')})` : ''}`);
if (plan.photoCount) console.log(`사진 ${plan.photoCount}장은 이번에 옮기지 않아요 (2단계 사진 기능에서)`);
const byPrecision: Record<string, number> = {};
for (const t of plan.trips) byPrecision[t.data.when.p] = (byPrecision[t.data.when.p] ?? 0) + 1;
console.log('날짜 정도:', JSON.stringify(byPrecision));
for (const t of plan.trips.slice(0, 200)) {
  const w = t.data.when;
  const when = w.p === 'unknown' ? '날짜 모름' : [w.y, w.m, w.d].filter(Boolean).join('.');
  const code = t.data.places[0].t === 'kr' ? t.data.places[0].code : '';
  console.log(`  - ${regionLong(code)} · ${when} · ${t.data.title}`);
}
if (dry) {
  console.log('\n(DRY_RUN) 실제로 쓰지 않았어요.');
  process.exit(0);
}

// 3) 쓰기
try {
  if (!accessExists) {
    await db.doc('config/access').set({ allowed: [OWNER], admins: [OWNER], updatedAt: FieldValue.serverTimestamp() });
  }
  const space = await db.doc(SPACE).get();
  if (!space.exists) await db.doc(SPACE).set({ name: '보라 & 영상', createdAt: FieldValue.serverTimestamp(), v: 1 });

  const items = [
    ...plan.trips.map((t) => ({ path: `${SPACE}/trips/${t.id}`, data: { ...t.data, createdBy: { uid: 'migration', email: OWNER, name: '영상' }, updatedAt: FieldValue.serverTimestamp() } })),
    ...plan.wishes.map((w) => ({ path: `${SPACE}/wishes/${w.id}`, data: { ...w.data } })),
  ];
  for (let i = 0; i < items.length; i += 400) {
    const b = db.batch();
    for (const it of items.slice(i, i + 400)) b.set(db.doc(it.path), { ...it.data, createdAt: FieldValue.serverTimestamp(), v: 1 });
    await b.commit();
  }
  const n = (await db.collection(`${SPACE}/trips`).count().get()).data().count;
  console.log(`\n✓ 옮김 완료. 지금 보라핀 여행 기록은 모두 ${n}건이에요.`);
  if (process.env.EXPECT_TRIPS && Number(process.env.EXPECT_TRIPS) !== n) {
    console.error(`✗ 기대한 ${process.env.EXPECT_TRIPS}건과 달라요 (겹쳐 쓰기 확인 실패)`);
    process.exit(1);
  }
} catch (e) {
  explain(e);
}
