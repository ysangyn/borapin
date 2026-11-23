/**
 * 6걸음 공개 평 — 보라핀 사람들에게 내가 고른 가게 평의 사본을 보여 준다 (firestore.rules pubReviews·pubFlags).
 * 원본(places)은 그대로, 사본만 pubReviews/{가게번호}_{내 uid}. 원본을 고치면 사본도 고치고, 지우거나 '별로'로 바꾸면 사본을 지운다.
 */
import { useEffect, useState } from 'react';
import { Bytes, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, query, setDoc, updateDoc, where, deleteField, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { buildPub, freePhotoSlot, monthOf, myLine, pubBlock, pubId, PUB_PHOTO_MAX, type PubReview } from './pubShape';
import { shrinkSmall } from './photos';
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
  // 다시 공개(고치기)할 때 걸어 둔 사진 목록은 지킨다 (규칙: 목록과 사진 문서는 늘 맞아야 한다)
  const ref = doc(col(), pubId(key, user.uid));
  const cur = (await getDoc(ref)).data() as PubReview | undefined;
  await setDoc(ref, { ...d, ...(cur?.photos?.length ? { photos: cur.photos } : {}) });
  return key;
}

/** 공개 거두기: 평과 그 사진을 한 묶음으로 지운다 (규칙이 사진만 남는 지우기를 막는다) */
async function dropPub(id: string): Promise<void> {
  const ref = doc(col(), id);
  const cur = (await getDoc(ref)).data() as PubReview | undefined;
  if (!cur) return;
  const b = writeBatch(db);
  b.delete(ref);
  for (const p of cur.photos ?? []) b.delete(doc(db, 'pubPhotos', p));
  await b.commit();
}
export const unpublish = (key: string, uid: string) => dropPub(pubId(key, uid));

// ---------- 공개 사진 (평 하나에 2장까지. 원본과 다른 작은 사본: 다시 그려서 촬영 정보·자리·시각이 없다) ----------
/** 사진 한 장 올리기: 평의 목록에 적는 것과 사진 문서를 한 묶음으로 */
export async function addPubPhoto(pub: PubDoc, file: File): Promise<void> {
  const have = pub.photos ?? [];
  const pid = freePhotoSlot(pub.id, have);
  if (!pid) throw new Error(`사진은 ${PUB_PHOTO_MAX}장까지 올릴 수 있어요`);
  const { blob, w, h } = await shrinkSmall(file);
  const b = writeBatch(db);
  b.update(doc(col(), pub.id), { photos: [...have, pid] });
  b.set(doc(db, 'pubPhotos', pid), { uid: pub.uid, spaceId: pub.spaceId, reviewId: pub.id, w, h, v: 1, data: Bytes.fromUint8Array(new Uint8Array(await blob.arrayBuffer())) });
  await b.commit();
}
export async function removePubPhoto(pub: PubDoc, pid: string): Promise<void> {
  const b = writeBatch(db);
  b.update(doc(col(), pub.id), { photos: (pub.photos ?? []).filter((x) => x !== pid) });
  b.delete(doc(db, 'pubPhotos', pid));
  await b.commit();
}
/** 공개 사진 보기 (하나씩 읽는다). 못 읽는 것(가려짐·지워짐)은 빠진다 */
export function usePubPhotos(ids: readonly string[] | undefined): { id: string; url: string; w?: number; h?: number }[] {
  const [list, setList] = useState<{ id: string; url: string; w?: number; h?: number }[]>([]);
  const key = (ids ?? []).join(',');
  useEffect(() => {
    if (!key) { setList([]); return; }
    let live = true;
    const urls: string[] = [];
    void Promise.all(key.split(',').map(async (id) => {
      try {
        const s = await getDoc(doc(db, 'pubPhotos', id));
        const x = s.data() as { data: Bytes; w?: number; h?: number } | undefined;
        if (!x) return null;
        const url = URL.createObjectURL(new Blob([x.data.toUint8Array() as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' }));
        urls.push(url);
        return { id, url, w: x.w, h: x.h };
      } catch { return null; }
    })).then((r) => { if (live) setList(r.filter((x): x is NonNullable<typeof x> => !!x)); else urls.forEach((u) => URL.revokeObjectURL(u)); });
    return () => { live = false; urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [key]);
  return list;
}
/** 주인이 공개 사진 올리기를 멈췄는지 (config/flags) */
export function usePubPhotosPaused(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => onSnapshot(doc(db, 'config/flags'), (s) => setV((s.data() as { pubPhotosPaused?: boolean } | undefined)?.pubPhotosPaused === true), () => setV(false)), []);
  return v;
}
export const setPubPhotosPaused = (on: boolean) => setDoc(doc(db, 'config/flags'), { pubPhotosPaused: on }, { merge: true });

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
    if (!rec || pubBlock(rec)) { await dropPub(ref.id); return; }
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
