import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { queued } from './writes';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import type { Note, PlanItem } from './types';

const plansCol = () => collection(db, 'spaces', SPACE_ID, 'plans');
const notesCol = () => collection(db, 'spaces', SPACE_ID, 'notes');

function useByTrip<T>(col: () => ReturnType<typeof collection>, tripId: string | undefined) {
  // 다른 여행으로 옮기면 이전 여행 것이 잠깐 보이지 않게 여행 id와 함께 둔다
  const [state, setState] = useState<{ tripId?: string; items: T[] | null }>({ items: null });
  useEffect(() => {
    if (!tripId) return;
    return onSnapshot(
      query(col(), where('tripId', '==', tripId)),
      (snap) => setState({ tripId, items: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T) }),
      () => setState({ tripId, items: [] }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);
  return state.tripId === tripId ? state.items : null;
}

// ---------- 일정 ----------
export function usePlan(tripId: string | undefined) {
  const items = useByTrip<PlanItem>(plansCol, tripId);
  return useMemo(() => (items ? [...items].sort((a, b) => (a.day ?? '9999').localeCompare(b.day ?? '9999') || (a.time ?? '99').localeCompare(b.time ?? '99') || a.order - b.order) : null), [items]);
}
export const addPlan = (tripId: string, name: string, order: number, recId?: string | null) =>
  queued(setDoc(doc(plansCol()), { tripId, name: name.trim(), order, day: null, time: null, info: '', recId: recId ?? null, done: false, createdAt: serverTimestamp(), v: 1 }));
export const updatePlan = (id: string, patch: Partial<Omit<PlanItem, 'id' | 'tripId' | 'v'>>) => queued(updateDoc(doc(plansCol(), id), patch));
export const deletePlan = (id: string) => queued(deleteDoc(doc(plansCol(), id)));
/** 뺀 일정 되돌리기 */
export const restorePlan = (p: PlanItem) => {
  const { id, ...rest } = p;
  return queued(setDoc(doc(plansCol(), id), rest));
};

export { tripDays, dayLabel } from './dates';

// ---------- 기록(글) ----------
export function useNotes(tripId: string | undefined) {
  const items = useByTrip<Note>(notesCol, tripId);
  return useMemo(() => (items ? [...items].sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now())) : null), [items]);
}
export const addNote = (tripId: string, text: string, user: User) =>
  queued(setDoc(doc(notesCol()), { tripId, text: text.trim(), by: { uid: user.uid, name: displayName(user) }, createdAt: serverTimestamp(), v: 1 }));
export const deleteNote = (id: string) => queued(deleteDoc(doc(notesCol(), id)));

export { PACK_TEMPLATES, packFromTemplate } from './packing';

/** 모든 여행의 글 (공유카드 '메모 인용' 등) */
export function useAllNotes(enabled = true) {
  const [items, setItems] = useState<Note[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    return onSnapshot(notesCol(), (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Note)), () => setItems([]));
  }, [enabled]);
  return items;
}
