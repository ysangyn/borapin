/**
 * 시험용 Firebase 프로젝트(borapin-test) 준비와 정리 — 실제 기록(borapin)과는 완전히 분리
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=시험용키.json PREVIEW_PW=... npx tsx scripts/preview-env.ts seed
 *   ... npx tsx scripts/preview-env.ts cleanup
 *
 * seed: 시험 계정 3개(주인 역할·함께 쓰는 사람·초대 안 된 사람)를 메일 인증된 상태로 만들고, 함께 쓰는 사람 목록을 넣는다.
 * cleanup: 시험이 만든 기록(여행·장소·사진·일정·글·공유·신고·설정)과 시험 계정을 모두 지운다.
 * rules: 실제와 같은 firestore.rules를 시험용 프로젝트에 올린다 (Admin SDK로, 배포 도구 없이)
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getSecurityRules } from 'firebase-admin/security-rules';
import fs from 'node:fs';

const PROJECT = 'borapin-test';
if ((process.env.GCLOUD_PROJECT ?? PROJECT) !== PROJECT) throw new Error('시험용 프로젝트(borapin-test)에서만 돌릴 수 있어요');
initializeApp({ projectId: PROJECT });
const auth = getAuth();
const db = getFirestore();

export const ACCOUNTS = {
  owner: { email: 'ysangyn@gmail.com', name: '영상' },
  bora: { email: 'bora.preview@example.com', name: '보라' },
  stranger: { email: 'stranger.preview@example.com', name: '손님' },
};

async function seed() {
  const pw = process.env.PREVIEW_PW;
  if (!pw || pw.length < 12) throw new Error('PREVIEW_PW(12자 이상)가 필요해요');
  for (const a of Object.values(ACCOUNTS)) {
    const props = { email: a.email, password: pw, emailVerified: true, displayName: a.name, disabled: false };
    try {
      const u = await auth.getUserByEmail(a.email);
      await auth.updateUser(u.uid, props);
    } catch {
      await auth.createUser(props);
    }
  }
  await db.doc('config/access').set({
    allowed: [ACCOUNTS.owner.email, ACCOUNTS.bora.email],
    admins: [ACCOUNTS.owner.email],
    names: { [ACCOUNTS.owner.email]: ACCOUNTS.owner.name, [ACCOUNTS.bora.email]: ACCOUNTS.bora.name },
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log('시험 계정 3개와 함께 쓰는 사람 목록을 준비했어요');
}

async function cleanup() {
  // 시험용 프로젝트에는 시험이 만든 기록만 있다: 통째로 지운다
  for (const name of ['spaces', 'config', 'shares', 'reports']) {
    await db.recursiveDelete(db.collection(name));
  }
  const users = await auth.getUsers(Object.values(ACCOUNTS).map((a) => ({ email: a.email })));
  if (users.users.length) await auth.deleteUsers(users.users.map((u) => u.uid));
  const left = (await Promise.all(['spaces', 'config', 'shares', 'reports'].map((n) => db.collection(n).limit(1).get()))).some((s) => !s.empty);
  if (left) throw new Error('지우지 못한 기록이 남아 있어요');
  console.log(`시험 기록을 모두 지우고 시험 계정 ${users.users.length}개를 지웠어요`);
}

async function rules() {
  const source = fs.readFileSync('firestore.rules', 'utf8');
  const r = await getSecurityRules().releaseFirestoreRulesetFromSource(source);
  console.log(`보안 규칙을 올렸어요 (${r.name})`);
}

const cmd = process.argv[2];
if (cmd === 'rules') await rules();
else if (cmd === 'seed') await seed();
else if (cmd === 'cleanup') await cleanup();
else {
  console.error('사용: preview-env.ts rules | seed | cleanup');
  process.exit(2);
}
