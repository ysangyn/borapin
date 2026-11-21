/**
 * 모임 (docs/design/SPACES-PUBLIC.md 4절): 고른 가게만 가족·친구와 나누기.
 * 규칙은 firestore.rules '모임'. 사람 수·가게 수·모임 수 한도는 규칙이 셀 수 없어 여기서 지킨다 (CIRCLE_LIMITS).
 */
import type { User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { SPACE_ID } from './space';
import { CIRCLE_LIMITS, circleItemFromPlace, circleItemId, itemKeyOf, newCircleId, type CircleItem } from './circleItems';
import type { JoinResult } from './invites';
import type { PlaceRec } from './types';

export interface Circle { id: string; name: string; createdBy: string }
export interface CircleMember { uid: string; role: 'host' | 'member'; nick: string; via: string }
export interface CircleInvite { by: string; circleId: string; circleName?: string; expiresAt: number; usedBy?: string; v: 1 }
export type CircleItemDoc = CircleItem & { id: string };

const mineRef = (uid: string, cid: string) => doc(db, 'users', uid, 'circles', cid);
const memberRef = (cid: string, uid: string) => doc(db, 'circles', cid, 'members', uid);
const itemsCol = (cid: string) => collection(db, 'circles', cid, 'items');
const INVITE_DAYS = 7;

function randomCode(n = 20) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => chars[b % chars.length]).join('');
}

/** 내가 든 모임 (내 모임 목록) */
export function useMyCircles(uid: string | null | undefined): { id: string; name: string }[] | null {
  const [list, setList] = useState<{ id: string; name: string }[] | null>(null);
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(collection(db, 'users', uid, 'circles'), (s) => setList(s.docs.map((d) => ({ id: d.id, name: String(d.data().name ?? '') })).sort((a, b) => a.name.localeCompare(b.name, 'ko'))), () => setList([]));
  }, [uid]);
  return uid ? list : [];
}

/** 모임에 하나라도 들어 있나 (공간 없는 손님 알아보기) */
export async function hasAnyCircle(uid: string): Promise<boolean> {
  return (await myCircleCount(uid)) > 0;
}

export async function myCircleCount(uid: string): Promise<number> {
  return (await getDocs(collection(db, 'users', uid, 'circles'))).size;
}

/** 모임 만들기: 모임 문서 + 내 방장 문서 + 내 모임 목록 (한 묶음) */
export async function createCircle(user: User, name: string, nick: string): Promise<string> {
  if ((await myCircleCount(user.uid)) >= CIRCLE_LIMITS.myCircles) throw new Error(`모임은 ${CIRCLE_LIMITS.myCircles}개까지 들 수 있어요`);
  const id = newCircleId();
  const clean = name.trim().slice(0, 20);
  const b = writeBatch(db);
  b.set(doc(db, 'circles', id), { name: clean, createdBy: user.uid, createdAt: serverTimestamp(), v: 1 });
  b.set(memberRef(id, user.uid), { uid: user.uid, role: 'host', nick: (nick.trim() || '나').slice(0, 10), via: 'host', joinedAt: serverTimestamp(), v: 1 });
  b.set(mineRef(user.uid, id), { name: clean, joinedAt: serverTimestamp(), v: 1 });
  await b.commit();
  return id;
}

/** 모임 하나: 문서·사람·걸린 가게. 'gone'은 없어졌거나 내가 더는 들어 있지 않음 */
export function useCircle(cid: string | undefined): { circle: Circle | null | 'gone'; members: CircleMember[] | null; items: CircleItemDoc[] | null } {
  const [circle, setCircle] = useState<Circle | null | 'gone'>(null);
  const [members, setMembers] = useState<CircleMember[] | null>(null);
  const [items, setItems] = useState<CircleItemDoc[] | null>(null);
  useEffect(() => {
    if (!cid) return;
    setCircle(null); setMembers(null); setItems(null);
    const gone = () => setCircle('gone');
    const u1 = onSnapshot(doc(db, 'circles', cid), (s) => setCircle(s.exists() ? ({ id: s.id, ...(s.data() as Omit<Circle, 'id'>) }) : 'gone'), gone);
    const u2 = onSnapshot(collection(db, 'circles', cid, 'members'), (s) => setMembers(s.docs.map((d) => d.data() as CircleMember)), gone);
    const u3 = onSnapshot(itemsCol(cid), (s) => setItems(s.docs.map((d) => ({ id: d.id, ...(d.data() as CircleItem) }))), gone);
    return () => { u1(); u2(); u3(); };
  }, [cid]);
  return { circle, members, items };
}

export const renameCircle = (cid: string, name: string) => updateDoc(doc(db, 'circles', cid), { name: name.trim().slice(0, 20), updatedAt: serverTimestamp() });

/** 모임에 가게 걸기 (내 공간의 기록 → 사본). 이미 걸었으면 고친다 */
export async function hangPlace(cid: string, place: PlaceRec, user: User, me: string, nick: string, current: number): Promise<void> {
  const item = circleItemFromPlace(place, { uid: user.uid, nick, me, spaceId: SPACE_ID });
  const ref = doc(itemsCol(cid), circleItemId(item.key, user.uid));
  if (current >= CIRCLE_LIMITS.items && !(await getDoc(ref)).exists()) throw new Error(`한 모임에 가게는 ${CIRCLE_LIMITS.items}곳까지 걸 수 있어요`);
  await setDoc(ref, { ...item, at: serverTimestamp() });
}

/** 이 가게를 건 모임들 (내 모임마다 문서 하나씩 확인) */
export async function circlesHolding(place: PlaceRec, uid: string, circleIds: string[]): Promise<Set<string>> {
  const id = circleItemId(itemKeyOf(place), uid);
  const got = await Promise.all(circleIds.map((c) => getDoc(doc(itemsCol(c), id)).then((s) => (s.exists() ? c : null), () => null)));
  return new Set(got.filter((x): x is string => !!x));
}

export const takeDown = (cid: string, itemId: string) => deleteDoc(doc(itemsCol(cid), itemId));
export const takeDownPlace = (cid: string, place: PlaceRec, uid: string) => takeDown(cid, circleItemId(itemKeyOf(place), uid));

/** 모임 초대장 (방장만) */
export async function createCircleInvite(user: User, cid: string, circleName: string, people: number): Promise<string> {
  if (people >= CIRCLE_LIMITS.people) throw new Error(`한 모임은 ${CIRCLE_LIMITS.people}명까지예요`);
  const code = randomCode();
  await setDoc(doc(db, 'circleInvites', code), { by: user.uid, circleId: cid, circleName: circleName.slice(0, 20), createdAt: serverTimestamp(), expiresAt: Date.now() + INVITE_DAYS * 86400000, v: 1 });
  return code;
}
export const deleteCircleInvite = (code: string) => deleteDoc(doc(db, 'circleInvites', code));

/** 내가 만든, 아직 안 쓴 이 모임 초대장 */
export function useCircleInvites(uid: string | null | undefined, cid: string): ({ code: string } & CircleInvite)[] {
  const [list, setList] = useState<({ code: string } & CircleInvite)[]>([]);
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(query(collection(db, 'circleInvites'), where('by', '==', uid)), (s) => {
      setList(s.docs.map((d) => ({ code: d.id, ...(d.data() as CircleInvite) })).filter((i) => i.circleId === cid && !i.usedBy && i.expiresAt > Date.now()));
    }, () => setList([]));
  }, [uid, cid]);
  return list;
}

export async function readCircleInvite(code: string): Promise<CircleInvite | null> {
  const s = await getDoc(doc(db, 'circleInvites', code)).catch(() => null);
  return s?.exists() ? (s.data() as CircleInvite) : null;
}

/** 모임에 들어가기: 초대장 표시 + 내 구성원 문서 + 내 모임 목록 (한 묶음) */
export async function joinCircle(code: string, inv: CircleInvite, user: User, nick: string): Promise<JoinResult> {
  if (inv.usedBy && inv.usedBy !== user.uid) return 'used';
  if (inv.expiresAt < Date.now()) return 'expired';
  try {
    const b = writeBatch(db);
    b.update(doc(db, 'circleInvites', code), { usedBy: user.uid, usedAt: Date.now() });
    b.set(memberRef(inv.circleId, user.uid), { uid: user.uid, role: 'member', nick: (nick.trim() || '나').slice(0, 10), via: code, joinedAt: serverTimestamp(), v: 1 });
    b.set(mineRef(user.uid, inv.circleId), { name: (inv.circleName ?? '모임').slice(0, 20), joinedAt: serverTimestamp(), v: 1 });
    await b.commit();
    return 'joined';
  } catch (e) {
    console.warn('join circle failed', e);
    return 'failed';
  }
}

/** 한 사람이 건 것 모두 내리기 */
async function takeDownAllBy(cid: string, uid: string) {
  const s = await getDocs(query(itemsCol(cid), where('by.uid', '==', uid)));
  await Promise.all(s.docs.map((d) => deleteDoc(d.ref)));
}

/** 스스로 나가기: 내가 건 것을 내리고 → 내 구성원 문서와 내 모임 목록을 지운다 */
export async function leaveCircle(cid: string, uid: string) {
  await takeDownAllBy(cid, uid);
  const b = writeBatch(db);
  b.delete(memberRef(cid, uid));
  b.delete(mineRef(uid, cid));
  await b.commit();
}

/** 방장이 내보내기: 그 사람이 건 것을 내리고 구성원 문서를 지운다 (그 사람의 모임 목록에는 '없어진 모임'으로 남아 스스로 지운다) */
export async function kickFromCircle(cid: string, uid: string) {
  await takeDownAllBy(cid, uid);
  await deleteDoc(memberRef(cid, uid));
}

/** 모임에서 빠졌거나 모임이 없어졌을 때 내 목록에서 지우기 */
export const forgetCircle = (uid: string, cid: string) => deleteDoc(mineRef(uid, cid));

/** 모임 없애기 (방장): 걸린 것·사람·초대장을 치우고 모임 문서와 내 문서를 한 묶음으로 */
export async function deleteCircle(cid: string, uid: string) {
  const items = await getDocs(itemsCol(cid));
  await Promise.all(items.docs.map((d) => deleteDoc(d.ref)));
  const photos = await getDocs(collection(db, 'circles', cid, 'photos'));
  await Promise.all(photos.docs.map((d) => deleteDoc(d.ref)));
  const members = await getDocs(collection(db, 'circles', cid, 'members'));
  await Promise.all(members.docs.filter((d) => d.id !== uid).map((d) => deleteDoc(d.ref)));
  const invites = await getDocs(query(collection(db, 'circleInvites'), where('by', '==', uid)));
  await Promise.all(invites.docs.filter((d) => d.data().circleId === cid).map((d) => deleteDoc(d.ref)));
  const b = writeBatch(db);
  b.delete(doc(db, 'circles', cid));
  b.delete(memberRef(cid, uid));
  b.delete(mineRef(uid, cid));
  await b.commit();
}

/** 손님이 이름만 적어 걸기 (원본 기록이 없다). 열쇠는 'g' + 무작위 */
export async function hangGuestPlace(cid: string, user: User, nick: string, p: { name: string; kind: PlaceRec['kind']; verdict: PlaceRec['verdict']; line: string }, current: number) {
  if (current >= CIRCLE_LIMITS.items) throw new Error(`한 모임에 가게는 ${CIRCLE_LIMITS.items}곳까지 걸 수 있어요`);
  const key = `g${randomCode(12).replace(/[^a-z0-9]/g, '')}`;
  await setDoc(doc(itemsCol(cid), circleItemId(key, user.uid)), {
    key, name: p.name.trim().slice(0, 80), kind: p.kind,
    ...(p.verdict ? { verdict: p.verdict } : {}), ...(p.line.trim() ? { line: p.line.trim().slice(0, 200) } : {}),
    by: { uid: user.uid, nick: (nick.trim() || '나').slice(0, 10) }, spaceId: null, at: serverTimestamp(), v: 1,
  });
}
