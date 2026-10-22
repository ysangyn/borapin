import { useMemo } from 'react';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  runTransaction,
  arrayRemove,
  arrayUnion,
  type DocumentReference,
  type WriteBatch,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import { useStore } from './store';
import { queued } from './writes';
import { DELETE, editsOf, isTimestampLike, restoreFields, type Edit } from './tripActions';
import type { PackItem, PlaceRec, PlaceRecInput, Trip, TripInput, Wish, WishInput, Relation } from './types';
import { whenSortKey } from './dates';

const sp = (name: string) => collection(db, 'spaces', SPACE_ID, name);
const tripsCol = () => sp('trips');
const wishesCol = () => sp('wishes');
const placesCol = () => sp('places');

export function useTrips() {
  const { trips, error } = useStore();
  const sorted = useMemo(() => (trips ? [...trips].sort((a, b) => whenSortKey(b.when) - whenSortKey(a.when)) : null), [trips]);
  return { trips: sorted, error };
}

export function useWishes() {
  const { wishes, error } = useStore();
  return { wishes, error };
}

export function usePlaces() {
  const { places, error } = useStore();
  const sorted = useMemo(() => (places ? [...places].sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now())) : null), [places]);
  return { places: sorted, error };
}

function clean<T extends object>(o: T): T {
  // Firestore는 undefined 값을 받지 않는다
  return JSON.parse(JSON.stringify(o));
}

const author = (user: User) => ({ uid: user.uid, email: user.email ?? '', name: displayName(user) });

async function patch(ref: DocumentReference, fields: Record<string, unknown>) {
  if (!Object.keys(fields).length) return;
  await queued(updateDoc(ref, { ...fields, updatedAt: serverTimestamp() }));
}

/**
 * 편집 화면 저장: 고친 칸만 보낸다(editsOf). 둘이 동시에 다른 칸을 고쳐도 서로 지우지 않는다.
 * 안쪽 칸(reviews.이름)은 FieldPath로 보내 이름에 점이 있어도 안전하고, 남의 칸은 건드리지 않는다.
 */
async function patchEdits(ref: DocumentReference, edits: Edit[]) {
  if (!edits.length) return;
  const args: unknown[] = [];
  for (const e of edits) args.push(new FieldPath(...e.path), e.value === DELETE ? deleteField() : e.value);
  const [field, value, ...rest] = args;
  await queued(updateDoc(ref, field as FieldPath, value, ...rest, 'updatedAt', serverTimestamp()));
}

/** 되돌리기용 문서: createdAt(Timestamp)을 지켜 피드·정렬에서 빠지지 않게. 서버 시각이 아직 없던 것은 지금으로 */
function restoreDoc(rest: object) {
  const f = restoreFields(rest);
  if (!isTimestampLike(f.createdAt)) f.createdAt = serverTimestamp();
  f.updatedAt = serverTimestamp();
  return f;
}

// ---------- 여행 ----------
export async function createTrip(input: TripInput, user: User): Promise<string> {
  const ref = doc(tripsCol());
  await queued(setDoc(ref, { ...clean(input), createdBy: author(user), createdAt: serverTimestamp(), updatedAt: serverTimestamp(), v: 1 }));
  return ref.id;
}

/** 고친 칸만 저장. opened는 편집 화면을 '연 때'의 여행(폼 초기값의 바탕)이어야 한다 — 최신 문서를 넘기면 상대가 그사이 고친 칸이 덮인다 */
export async function updateTrip(id: string, opened: Trip, input: TripInput) {
  await patchEdits(doc(tripsCol(), id), editsOf(opened, input));
}

/** 여행 일부만 고치기 (사진으로 날짜·장소 채우기 등) */
export async function patchTrip(id: string, fields: Partial<TripInput> | Record<string, unknown>) {
  await queued(updateDoc(doc(tripsCol(), id), { ...clean(fields as object), updatedAt: serverTimestamp() }));
}

/**
 * 준비물 고치기: 서버의 최신 목록에 바꾼 점만 더한다(둘이 동시에 체크해도 서로 안 지워짐).
 * 오프라인이면 기기에 있는 목록으로 저장해 두고 연결되면 올린다.
 */
const packingQueue = new Map<string, Promise<unknown>>();
export function mutatePacking(trip: Trip, fn: (list: PackItem[]) => PackItem[]): Promise<void> {
  // 같은 여행의 고치기는 한 줄로 세워 차례로 (빨리 여러 번 눌러도 서로 부딪히지 않게)
  const prev = packingQueue.get(trip.id) ?? Promise.resolve();
  const next = prev.catch(() => undefined).then(() => mutatePackingNow(trip, fn));
  packingQueue.set(trip.id, next);
  return next;
}
async function mutatePackingNow(trip: Trip, fn: (list: PackItem[]) => PackItem[]) {
  const ref = doc(tripsCol(), trip.id);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    await queued(updateDoc(ref, { packing: fn(trip.packing ?? []), updatedAt: serverTimestamp() }));
    return;
  }
  await runTransaction(db, async (tx) => {
    const s = await tx.get(ref);
    const cur = ((s.data()?.packing as PackItem[] | undefined) ?? []).filter(Boolean);
    tx.update(ref, { packing: fn(cur), updatedAt: serverTimestamp() });
  });
}

/** 방금 만든 여행 되돌리기 (딸린 것이 없을 때) */
export async function deleteTrip(id: string) {
  await queued(deleteDoc(doc(tripsCol(), id)));
}

/**
 * 여행 하나와 딸린 것(사진·일정·글) 모두 지우기. 우리 장소·가고 싶은 곳은 남기고 연결만 푼다.
 * 여행 문서 삭제를 첫 묶음에 넣는다: 상대가 쓴 글은 '그 여행이 (같은 묶음에서) 없어질 때'만 지울 수 있고(firestore.rules notes),
 * 400개가 넘어 여러 묶음이 될 때 중간에 멈춰도 '여행은 사라지고 고아 자료만 남는' 쪽이 된다(여행이 반쯤 빈 채 남지 않게).
 */
export async function deleteTripAll(trip: Trip, onStep?: (done: number, total: number) => void) {
  const byTrip = async (name: string) => (await getDocs(query(sp(name), where('tripId', '==', trip.id)))).docs;
  const [photos, plans, notes, recs, wishes] = await Promise.all(['photos', 'plans', 'notes', 'places', 'wishes'].map(byTrip));
  const ops: ((b: WriteBatch) => void)[] = [(b) => b.delete(doc(tripsCol(), trip.id))];
  if (trip.share?.token) ops.push((b) => b.delete(doc(db, 'shares', trip.share!.token)));
  for (const d of notes) ops.push((b) => b.delete(d.ref));
  for (const p of photos) {
    ops.push((b) => b.delete(doc(sp('photoData'), `${p.id}_l`)));
    ops.push((b) => b.delete(doc(sp('photoData'), `${p.id}_t`)));
    ops.push((b) => b.delete(p.ref));
  }
  for (const d of plans) ops.push((b) => b.delete(d.ref));
  for (const d of [...recs, ...wishes]) ops.push((b) => b.update(d.ref, { tripId: null }));
  for (let i = 0; i < ops.length; i += 400) {
    const b = writeBatch(db);
    ops.slice(i, i + 400).forEach((op) => op(b));
    await b.commit();
    onStep?.(Math.min(ops.length, i + 400), ops.length);
  }
}

// ---------- 우리 장소 ----------
export async function createPlace(input: PlaceRecInput, user: User): Promise<string> {
  const ref = doc(placesCol());
  await queued(setDoc(ref, { ...clean(input), createdBy: author(user), createdAt: serverTimestamp(), updatedAt: serverTimestamp(), v: 1 }));
  return ref.id;
}
/** 고친 칸만 저장. opened는 편집 화면을 '연 때'의 장소. 한 줄 평은 이름별(reviews.이름)로만 보내고 남의 칸은 지우지 않는다(me = 내 이름) */
export async function updatePlace(id: string, opened: PlaceRec, input: PlaceRecInput, me: string) {
  await patchEdits(doc(placesCol(), id), editsOf(opened, input, { perPerson: ['reviews'], me }));
}
/** 링크에서 가져온 사진·자리만 조용히 채우기 (이미 있는 값은 건드리지 않는다) */
export async function enrichPlace(id: string, fields: { photoUrl?: string; lat?: number; lng?: number }) {
  const f = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  if (Object.keys(f).length) await patch(doc(placesCol(), id), f);
}
export async function deletePlace(id: string) {
  await queued(deleteDoc(doc(placesCol(), id)));
}
/** 지운 장소 되돌리기 (createdAt을 지켜 피드·정렬 자리도 돌아온다) */
export async function restorePlace(p: PlaceRec) {
  const { id, ...rest } = p;
  await queued(setDoc(doc(placesCol(), id), restoreDoc(rest)));
}

// ---------- 가고 싶은 곳 ----------
export async function createWish(input: WishInput, user: User): Promise<string> {
  const ref = doc(wishesCol());
  await queued(setDoc(ref, { ...clean(input), createdBy: author(user), createdAt: serverTimestamp(), updatedAt: serverTimestamp(), v: 1 }));
  return ref.id;
}

export async function updateWish(id: string, fields: Partial<WishInput>) {
  await queued(updateDoc(doc(wishesCol(), id), { ...clean(fields), updatedAt: serverTimestamp() }));
}
/** 편집 화면: 고친 칸만. opened는 편집 화면을 '연 때'의 것 */
export async function saveWishEdits(id: string, opened: Wish, input: WishInput) {
  await patchEdits(doc(wishesCol(), id), editsOf(opened, input));
}

export async function deleteWish(id: string) {
  await queued(deleteDoc(doc(wishesCol(), id)));
}
/** 지운 가고 싶은 곳 되돌리기 (createdAt을 지켜 피드·정렬 자리도 돌아온다) */
export async function restoreWish(w: Wish) {
  const { id, ...rest } = w;
  await queued(setDoc(doc(wishesCol(), id), restoreDoc(rest)));
}

/** 다녀온 뒤 '또 가고 싶어요': 새로 담은 것처럼 되돌린다 */
export async function reviveWish(id: string) {
  await queued(updateDoc(doc(wishesCol(), id), { tripId: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
}

// ---------- 멤버 ----------
export async function setAccessList(field: 'allowed' | 'admins', email: string, add: boolean) {
  await queued(
    updateDoc(doc(db, 'config', 'access'), {
      [field]: add ? arrayUnion(email.toLowerCase().trim()) : arrayRemove(email.toLowerCase().trim()),
      updatedAt: serverTimestamp(),
    }),
  );
}

/** 함께 쓰는 사람 넣기 (부를 이름도 함께). 메일에 점이 있어 이름은 FieldPath로 쓴다 */
export async function addMember(email: string, name: string) {
  const e = email.toLowerCase().trim();
  const ref = doc(db, 'config', 'access');
  await queued(
    name.trim()
      ? updateDoc(ref, 'allowed', arrayUnion(e), new FieldPath('names', e), name.trim(), 'updatedAt', serverTimestamp())
      : updateDoc(ref, { allowed: arrayUnion(e), updatedAt: serverTimestamp() }),
  );
}
/** 관계 정하기 (부부·연인·가족·친구·친지·그 밖에), 비우면 지움 */
export async function setMemberRelation(email: string, relation: Relation | null) {
  const e = email.toLowerCase().trim();
  await queued(updateDoc(doc(db, 'config', 'access'), new FieldPath('relations', e), relation ?? deleteField(), 'updatedAt', serverTimestamp()));
}
/** 부를 이름 바꾸기 (비우면 기본 이름으로) */
export async function setMemberName(email: string, name: string) {
  const e = email.toLowerCase().trim();
  await queued(updateDoc(doc(db, 'config', 'access'), new FieldPath('names', e), name.trim() || deleteField(), 'updatedAt', serverTimestamp()));
}

/** 한 번만 읽기 (백업 등) */
export async function readAll(name: 'photos' | 'plans' | 'notes') {
  return (await getDocs(sp(name))).docs.map((d) => ({ id: d.id, ...d.data() }));
}
export const getTripOnce = async (id: string) => {
  const s = await getDoc(doc(tripsCol(), id));
  return s.exists() ? ({ id: s.id, ...s.data() } as Trip) : null;
};

// 통계·집계는 Firebase 없이도 쓰도록 stats.ts에 있다 (찾아보기 채점 등)
export * from './stats';
export type { PlaceRec, Wish };
