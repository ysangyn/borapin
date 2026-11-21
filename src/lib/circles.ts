/**
 * 모임 (docs/design/SPACES-PUBLIC.md 4절): 고른 가게만 가족·친구와 나누기.
 * 규칙은 firestore.rules '모임'. 사람 수·가게 수·모임 수 한도는 규칙이 셀 수 없어 여기서 지킨다 (CIRCLE_LIMITS).
 */
import type { User } from 'firebase/auth';
import { addDoc, Bytes, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { shrinkSmall } from './photos';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { SPACE_ID } from './space';
import { CIRCLE_LIMITS, circleItemFromPlace, circleItemId, itemKeyOf, newCircleId, type CircleItem } from './circleItems';
import type { JoinResult } from './invites';
import type { Place, PlaceRec } from './types';

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
export async function hangGuestPlace(cid: string, user: User, nick: string, p: { name: string; kind: PlaceRec['kind']; verdict: PlaceRec['verdict']; line: string; region?: Place | null }, current: number) {
  if (current >= CIRCLE_LIMITS.items) throw new Error(`한 모임에 가게는 ${CIRCLE_LIMITS.items}곳까지 걸 수 있어요`);
  const key = `g${randomCode(12).replace(/[^a-z0-9]/g, '')}`;
  await setDoc(doc(itemsCol(cid), circleItemId(key, user.uid)), {
    key, name: p.name.trim().slice(0, 80), kind: p.kind,
    ...(p.verdict ? { verdict: p.verdict } : {}), ...(p.line.trim() ? { line: p.line.trim().slice(0, 200) } : {}),
    ...(p.region ? { region: p.region } : {}),
    by: { uid: user.uid, nick: (nick.trim() || '나').slice(0, 10) }, spaceId: null, at: serverTimestamp(), v: 1,
  });
}


// ---------- 별명 (자기 것만, 1~10자: 규칙 validCircleMember) ----------
export const setMyNick = (cid: string, uid: string, nick: string) =>
  updateDoc(doc(db, 'circles', cid, 'members', uid), { nick: nick.trim().slice(0, 10), updatedAt: serverTimestamp() });

// ---------- 모임 사진: 걸린 가게마다 (모임 안 사람만 보고, 건 사람이나 방장이 내린다) ----------
export interface CirclePhoto { id: string; by: string; itemId: string; url: string; w?: number; h?: number }
const photosCol = (cid: string) => collection(db, 'circles', cid, 'photos');

export async function addCirclePhoto(cid: string, user: User, guest: boolean, itemId: string, file: File): Promise<void> {
  const { blob, w, h } = await shrinkSmall(file);
  await addDoc(photosCol(cid), {
    by: user.uid, spaceId: guest ? null : SPACE_ID, itemId, w, h, at: serverTimestamp(), v: 1,
    data: Bytes.fromUint8Array(new Uint8Array(await blob.arrayBuffer())),
  });
}
export const deleteCirclePhoto = (cid: string, id: string) => deleteDoc(doc(photosCol(cid), id));

/** 가게 하나의 모임 사진 (열려 있을 때만 받는다) */
export function useCirclePhotos(cid: string | undefined, itemId: string | null): CirclePhoto[] | null {
  const [list, setList] = useState<CirclePhoto[] | null>(null);
  useEffect(() => {
    if (!cid || !itemId) { setList(null); return; }
    let urls: string[] = [];
    const un = onSnapshot(query(photosCol(cid), where('itemId', '==', itemId), limit(12)), (s) => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls = [];
      setList(s.docs.map((d) => {
        const x = d.data() as { by: string; itemId: string; data: Bytes; w?: number; h?: number };
        const url = URL.createObjectURL(new Blob([x.data.toUint8Array() as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' }));
        urls.push(url);
        return { id: d.id, by: x.by, itemId: x.itemId, url, w: x.w, h: x.h };
      }));
    }, () => setList([]));
    return () => { un(); urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [cid, itemId]);
  return list;
}

// ---------- 홈: '모임에 새 가게 n곳' (마지막으로 본 뒤 남이 건 것) ----------
const seenKey = (cid: string) => `borapin.circleSeen.${cid}`;
export function markCircleSeen(cid: string): void {
  try { localStorage.setItem(seenKey(cid), String(Date.now())); } catch { /* 저장 못 해도 괜찮다 */ }
}
function seenAt(cid: string): number | null {
  try { const v = Number(localStorage.getItem(seenKey(cid))); return Number.isFinite(v) && v > 0 ? v : null; } catch { return null; }
}

/** 모임마다 새 가게 수. 처음 보는 모임은 지금부터 센다 (옛 가게를 모두 '새'로 보이지 않게) */
export function useCircleNews(uid: string | null | undefined, circles: { id: string; name: string }[] | null): { id: string; name: string; count: number }[] {
  const [news, setNews] = useState<{ id: string; name: string; count: number }[]>([]);
  const ids = (circles ?? []).map((c) => c.id).join(',');
  useEffect(() => {
    if (!uid || !circles?.length) { setNews([]); return; }
    let on = true;
    void Promise.all(circles.slice(0, CIRCLE_LIMITS.myCircles).map(async (c) => {
      const seen = seenAt(c.id);
      if (seen == null) { markCircleSeen(c.id); return { ...c, count: 0 }; }
      const s = await getDocs(query(itemsCol(c.id), where('at', '>', Timestamp.fromMillis(seen)), limit(50))).catch(() => null);
      const count = s ? s.docs.filter((d) => (d.data() as CircleItem).by?.uid !== uid).length : 0;
      return { ...c, count };
    })).then((r) => on && setNews(r.filter((x) => x.count > 0)));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, ids]);
  return news;
}
