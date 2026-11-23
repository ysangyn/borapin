/**
 * 옛 카카오 기록 세기 — 읽기만 한다 (아무것도 고치거나 지우지 않음).
 *
 * 카카오 데브톡 답변(11-23) 3번: 저장해 둔 카카오 응답의 장소명·주소·좌표는 지우고, 사용자에게 다시 받은 정보로 정리.
 * 카카오맵 연결용 장소 ID·URL은 둘 수 있다. 지우기 전에 몇 건인지부터 센다 (지우는 건 사용자 확인 뒤 따로).
 *
 * 결과는 공개 브랜치(ci-report)에 올라가므로 숫자만 찍는다 — 가게 이름·주소·좌표·사람은 찍지 않는다.
 *
 *   kakao-audit 브랜치에 올리면 .github/workflows/kakao-audit.yml 이 한 번 돌린다.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, type Timestamp } from 'firebase-admin/firestore';

const projectId = process.env.GCLOUD_PROJECT || 'borapin';
initializeApp(process.env.FIRESTORE_EMULATOR_HOST ? { projectId } : { credential: applicationDefault(), projectId });
const db = getFirestore();

// 11-22 KST 아침 전: 이름을 카카오에서 그대로 채웠을 수 있다. 그 뒤 ~ 11-23 고침 전: 카카오 이름·좌표로 찾은 상가정보 값
const NAME_ERA_END = Date.UTC(2026, 10, 21, 22, 0);
const MATCH_ERA_END = Date.UTC(2026, 10, 23, 3, 0);

type Doc = { ref?: { src?: string; id?: string } | null; address?: string; lat?: number; lng?: number; createdAt?: Timestamp | null; name?: string; status?: string };

const c = { places: 0, kakao: 0, kakaoNameEra: 0, matchEra: 0, after: 0, unknownTime: 0, withAddress: 0, withPos: 0, emptyName: 0, want: 0, spaces: new Set<string>() };
const places = await db.collectionGroup('places').get();
for (const d of places.docs) {
  if (!d.ref.path.startsWith('spaces/')) continue;
  c.places++;
  const x = d.data() as Doc;
  if (x.ref?.src !== 'kakao') continue;
  c.kakao++;
  c.spaces.add(d.ref.path.split('/')[1]);
  const ms = x.createdAt?.toMillis?.();
  if (ms == null) c.unknownTime++;
  else if (ms < NAME_ERA_END) c.kakaoNameEra++;
  else if (ms < MATCH_ERA_END) c.matchEra++;
  else c.after++;
  if (x.address) c.withAddress++;
  if (Number.isFinite(x.lat) && Number.isFinite(x.lng)) c.withPos++;
  if (!x.name?.trim()) c.emptyName++;
  if (x.status === 'want') c.want++;
}

const pub = await db.collection('pubReviews').get();
const pubKakao = pub.docs.filter((d) => d.id.startsWith('k') || (d.data() as { placeKey?: string }).placeKey?.startsWith('k')).length;

let circleKakao = 0, circleItems = 0;
const items = await db.collectionGroup('items').get();
for (const d of items.docs) {
  if (!d.ref.path.startsWith('circles/')) continue;
  circleItems++;
  const x = d.data() as { key?: string; ref?: { src?: string } };
  if (x.ref?.src === 'kakao' || x.key?.startsWith('k') || d.id.startsWith('k')) circleKakao++;
}

console.log('== 옛 카카오 기록 세기 (읽기만) ==');
console.log(`장소 기록 전체 ${c.places}건 · 그중 카카오 번호가 붙은 것 ${c.kakao}건 (공간 ${c.spaces.size}곳)`);
console.log(`  · 11-22 아침 전 (이름을 카카오에서 채웠을 수 있음): ${c.kakaoNameEra}건`);
console.log(`  · 11-22 아침 ~ 11-23 고침 전 (카카오 값으로 찾은 상가정보 값): ${c.matchEra}건`);
console.log(`  · 11-23 고침 뒤 (폰 위치로 찾은 상가정보 · 문제없음): ${c.after}건`);
console.log(`  · 남긴 때를 모름: ${c.unknownTime}건`);
console.log(`  · 주소가 있는 것 ${c.withAddress}건 · 좌표가 있는 것 ${c.withPos}건 · 이름이 빈 것 ${c.emptyName}건 · 가고 싶어요 ${c.want}건`);
console.log(`공개 평 전체 ${pub.size}건 · 카카오 가게 것 ${pubKakao}건`);
console.log(`모임에 건 가게 전체 ${circleItems}건 · 카카오 가게 것 ${circleKakao}건`);
