/**
 * 6걸음 공개 평 — 보라핀 사람들에게 내가 고른 가게 평의 사본을 보여 준다 (firestore.rules pubReviews·pubFlags).
 * 원본(places)은 그대로, 사본만 pubReviews/{가게번호}_{내 uid}. 원본을 고치면 사본도 고치고, 지우거나 '별로'로 바꾸면 사본을 지운다.
 */
import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, query, setDoc, updateDoc, where, deleteField } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { buildPub, monthOf, myLine, pubBlock, pubId, type PubReview } from './pubShape';
import { placeKey } from './placeRef';
import type { PlaceRec, When } from './types';

export type PubDoc = PubReview & { id: string };
const col = () => collection(db, 'pubReviews');

/** 공개할 때 쓰는 별명 (처음엔 내 공간 별명) */
export async function myPubNick(uid: string, fallback: string): Promise<string> {
  try { const s = await getDoc(doc(db, 'profiles', uid)); const n = (s.data() as { nick?: string } | undefined)?.nick; return (n || fallback).slice(0, 10); } catch { return fallback.slice(0, 10); }
}

/** 공개하기 (같은 가게는 한 사람에 한 건: 다시 하면 고친다) */
export async function publishPlace(rec: PlaceRec, user: User, me: string, o: { nick: string; name: string; when?: When | null }): Promise<string> {
  const why = pubBlock(rec);
  if (why) throw new Error(why);
  const key = placeKey(rec)!;
  const d = buildPub(rec, { uid: user.uid, nick: o.nick, spaceId: SPACE_ID, name: o.name, line: myLine(rec, me, user.uid), month: monthOf(rec, o.when) });
  await setDoc(doc(col(), pubId(key, user.uid)), d);
  return key;
}
export const unpublish = (key: string, uid: string) => deleteDoc(doc(col(), pubId(key, uid)));

/** 내 공개 사본 (가게 화면의 '보여 줄 사람' 줄). undefined = 읽는 중, null = 공개 안 함 */
export function useMyPub(key: string | null, uid: string | null | undefined): PubDoc | null | undefined {
  const [v, setV] = useState<PubDoc | null | undefined>(undefined);
  useEffect(() => {
    if (!key || !uid) { setV(null); return; }
    return onSnapshot(doc(col(), pubId(key, uid)), (s) => setV(s.exists() ? ({ id: s.id, ...(s.data() as PubReview) }) : null), () => setV(null));
  }, [key, uid]);
  return v;
}

/** 원본을 고친 뒤: 내 사본이 있으면 따라 고치고, 공개할 수 없게 되었으면(별로·가고 싶어요) 지운다. 이름은 사본 것을 지킨다 */
export async function syncMyPub(rec: PlaceRec | null, uid: string, me: string, key?: string | null): Promise<void> {
  const k = key ?? (rec ? placeKey(rec) : null);
  if (!k) return;
  const ref = doc(col(), pubId(k, uid));
  try {
    const s = await getDoc(ref);
    if (!s.exists()) return;
    if (!rec || pubBlock(rec)) { await deleteDoc(ref); return; }
    const cur = s.data() as PubReview;
    const next = buildPub(rec, { uid, nick: cur.nick, spaceId: cur.spaceId, name: cur.name, line: myLine(rec, me, uid), month: cur.month });
    const changed = (['verdict', 'line', 'kind', 'tag'] as const).filter((f) => (cur as unknown as Record<string, unknown>)[f] !== (next as unknown as Record<string, unknown>)[f]);
    if (!changed.length) return;
    const patch: Record<string, unknown> = {};
    for (const f of changed) patch[f] = (next as unknown as Record<string, unknown>)[f] ?? deleteField();
    await updateDoc(ref, patch);
  } catch { /* 사본 맞추기는 다음에 가게를 열 때 다시 해도 된다 */ }
}

/** 같은 가게를 공개한 사람들 (가려지지 않은 것, 20건까지) */
export function usePlacePubs(key: string | null): PubDoc[] | null {
  const [list, setList] = useState<PubDoc[] | null>(null);
  useEffect(() => {
    if (!key) { setList([]); return; }
    getDocs(query(col(), where('placeKey', '==', key), where('hidden', '==', false), limit(20)))
      .then((s) => setList(s.docs.map((d) => ({ id: d.id, ...(d.data() as PubReview) }))), () => setList([]));
  }, [key]);
  return list;
}

/** 내가 공개한 것 (가려진 것 포함) */
export function useMyPubs(uid: string | null | undefined): PubDoc[] | null {
  const [list, setList] = useState<PubDoc[] | null>(null);
  useEffect(() => {
    if (!uid) { setList(null); return; }
    return onSnapshot(query(col(), where('uid', '==', uid), limit(200)), (s) => setList(s.docs.map((d) => ({ id: d.id, ...(d.data() as PubReview) }))), () => setList([]));
  }, [uid]);
  return list;
}

// ---------- 신고 · 안 보기 ----------
export const FLAG_REASONS = { privacy: '사람이 알아볼 수 있는 내용', wrong: '틀린 정보', rude: '거친 말', ad: '광고', other: '그 밖에' } as const;
export type FlagReason = keyof typeof FLAG_REASONS;
export async function flagPub(reviewId: string, uid: string, reason: FlagReason, note: string): Promise<void> {
  await setDoc(doc(db, 'pubFlags', `${reviewId}_${uid}`), { reviewId, uid, reason, ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}), v: 1 });
}

/** 이 폰에서만 안 보기 (신고한 평·안 보기로 한 사람) */
const MUTE = 'borapin.pubMute';
function readMute(): { uids: string[]; reviews: string[] } {
  try { const v = JSON.parse(localStorage.getItem(MUTE) ?? ''); return { uids: v.uids ?? [], reviews: v.reviews ?? [] }; } catch { return { uids: [], reviews: [] }; }
}
export function useMute(): [{ uids: Set<string>; reviews: Set<string> }, (k: 'uids' | 'reviews', id: string) => void] {
  const [m, setM] = useState(readMute);
  const add = (k: 'uids' | 'reviews', id: string) => {
    const next = { ...m, [k]: [...new Set([...m[k], id])].slice(-500) };
    try { localStorage.setItem(MUTE, JSON.stringify(next)); } catch { /* 저장 못 해도 이번엔 가린다 */ }
    setM(next);
  };
  return [{ uids: new Set(m.uids), reviews: new Set(m.reviews) }, add];
}

// ---------- 주인: 신고함 · 가리기 ----------
export interface Flag { id: string; reviewId: string; uid: string; reason: FlagReason; note?: string }
export function useFlags(on: boolean): Flag[] | null {
  const [list, setList] = useState<Flag[] | null>(null);
  useEffect(() => {
    if (!on) { setList(null); return; }
    return onSnapshot(query(collection(db, 'pubFlags'), limit(100)), (s) => setList(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Flag, 'id'>) }))), () => setList([]));
  }, [on]);
  return list;
}
export const readPub = (id: string) => getDoc(doc(col(), id)).then((s) => (s.exists() ? ({ id: s.id, ...(s.data() as PubReview) }) : null));
export const hidePub = (id: string, reason: string) => updateDoc(doc(col(), id), { hidden: true, hiddenReason: reason.slice(0, 100) });
export const unhidePub = (id: string) => updateDoc(doc(col(), id), { hidden: false, hiddenReason: deleteField() });
export const dismissFlag = (id: string) => deleteDoc(doc(db, 'pubFlags', id));
