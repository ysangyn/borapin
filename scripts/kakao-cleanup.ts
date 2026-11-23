/**
 * 옛 카카오 기록 정리 (사용자 확인 11-23) — 카카오 데브톡 답변 3번.
 *
 * 대상: 가게 번호(ref)가 생기기 전(11-12 ~ 11-23 고침 전) '지금 여기'로 남긴, 주소까지 있는 장소 기록.
 *   그때는 카카오 목록에서 고르면 카카오 이름·주소·좌표를 그대로 남겼다.
 * 하는 일: 주소·좌표를 지운다. 이름은 남기고, 사용자가 직접 보고 다시 적는다 (사용자에게 다시 받은 정보).
 * 안전: 세어 둔 수(EXPECT)와 다르면 아무것도 안 하고 멈춘다. DRY_RUN=1 이면 세기만.
 * 출력: 공개 브랜치라 문서 번호만 (이름·주소·좌표는 찍지 않음).
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue, type Timestamp } from 'firebase-admin/firestore';

const projectId = process.env.GCLOUD_PROJECT || 'borapin';
initializeApp(process.env.FIRESTORE_EMULATOR_HOST ? { projectId } : { credential: applicationDefault(), projectId });
const db = getFirestore();

const HERE_START = Date.UTC(2026, 10, 12, 5, 0);
const FIXED = Date.UTC(2026, 10, 23, 3, 0);
const EXPECT = Number(process.env.EXPECT ?? 1);
const dry = process.env.DRY_RUN === '1';

type Doc = { ref?: unknown; address?: string; lat?: number; lng?: number; createdAt?: Timestamp | null };
const snap = await db.collectionGroup('places').get();
const targets = snap.docs.filter((d) => {
  if (!d.ref.path.startsWith('spaces/')) return false;
  const x = d.data() as Doc;
  const t = x.createdAt?.toMillis?.();
  return !x.ref && t != null && t >= HERE_START && t < FIXED && !!x.address;
});

console.log(`== 옛 카카오 기록 정리${dry ? ' (세기만)' : ''} ==`);
console.log(`대상 ${targets.length}건 (예상 ${EXPECT}건)`);
if (targets.length !== EXPECT) {
  console.log('예상과 달라서 아무것도 고치지 않고 멈춰요.');
  process.exit(1);
}
for (const d of targets) {
  const [, space, , id] = d.ref.path.split('/');
  if (!dry) await d.ref.update({ address: FieldValue.delete(), lat: FieldValue.delete(), lng: FieldValue.delete() });
  console.log(`${dry ? '지울 것' : '지웠어요'}: 주소·좌표 · 공간 ${space === 'main' ? '우리 공간' : '다른 공간'} · 기록 ${id} → https://borapin.web.app/places/${id} 에서 이름을 다시 확인해 주세요`);
}
