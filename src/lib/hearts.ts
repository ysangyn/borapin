import { useEffect, useState } from 'react';
import { collection, deleteField, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, type FirestoreError, type Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import { queued } from './writes';
import type { FeedItem } from './feed';

/** 피드 하트: 항목 하나당 문서 하나, by = { uid: 이름 } */
export interface Heart { key: string; by: Record<string, string>; at?: Timestamp | null }

const col = () => collection(db, 'spaces', SPACE_ID, 'hearts');

/** 피드 항목의 고정 열쇠 (사진 묶음은 사람·여행·날로) */
export function heartKey(it: FeedItem): string {
  const safe = (s: string) => s.replace(/[^\w가-힣-]/g, '_');
  switch (it.kind) {
    case 'photos': return `photos_${safe(it.by)}_${it.trip.id}_${new Date(it.at).toISOString().slice(0, 10)}`;
    case 'note': return `note_${it.note.id}`;
    case 'place': return `place_${it.rec.id}`;
    case 'wish': return `wish_${it.wish.id}`;
    case 'wishes': return `wishes_${safe(it.by)}_${new Date(it.at).toISOString().slice(0, 10)}`;
    case 'ask': return `ask_${it.day}_${safe(it.uid)}`;
    default: return `trip_${it.trip.id}`;
  }
}

export function useHearts() {
  const [map, setMap] = useState<Map<string, Heart> | null>(null);
  useEffect(() => onSnapshot(col(), (snap) => setMap(new Map(snap.docs.map((d) => [d.id, { key: d.id, by: (d.data().by ?? {}) as Record<string, string>, at: (d.data().at ?? null) as Timestamp | null }]))), (e: FirestoreError) => { console.warn(e); setMap(new Map()); }), []);
  return map;
}

export async function toggleHeart(key: string, current: Heart | undefined, user: User) {
  const mine = !!current?.by[user.uid];
  const ref = doc(col(), key);
  if (!current) return queued(setDoc(ref, { by: { [user.uid]: displayName(user) }, v: 1, at: serverTimestamp() }));
  return queued(updateDoc(ref, { [`by.${user.uid}`]: mine ? deleteField() : displayName(user), at: serverTimestamp() }));
}

/** 남이 누른 하트 중 마지막으로 본 뒤의 것 (아래 메뉴 점용) */
export const unseenHearts = (map: Map<string, Heart> | null, lastSeen: number, uid: string) =>
  map ? [...map.values()].filter((h) => Object.keys(h.by).some((u) => u !== uid) && (h.at && typeof h.at.toMillis === 'function' ? h.at.toMillis() : 0) > lastSeen).length : 0;
