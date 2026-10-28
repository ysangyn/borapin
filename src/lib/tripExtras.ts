import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, getCountFromServer, getDocs, getDocsFromCache, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, type CollectionReference } from 'firebase/firestore';
import { queued } from './writes';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { isSealed } from './capsule';
import { displayName } from './auth';
import type { Note, PlanItem } from './types';

const plansCol = () => collection(db, 'spaces', SPACE_ID, 'plans');
const notesCol = () => collection(db, 'spaces', SPACE_ID, 'notes');

// ---------- 한 여행의 개수만 (홈 단계 카드) ----------
/**
 * 어느 여행의 문서 수. 서버 집계라 문서를 받지 않아 읽기 1회(1000개까지)로 끝난다.
 * 오프라인이면 기기 캐시에서 센다(읽기 0). 캐시에도 하나도 없으면 0인지 모르는 건지 알 수 없어 null.
 */
export async function countByTrip(col: () => CollectionReference, tripId: string): Promise<number | null> {
  const q = query(col(), where('tripId', '==', tripId));
  try {
    return (await getCountFromServer(q)).data().count;
  } catch {
    const cached = await getDocsFromCache(q).then((s) => s.size, () => 0);
    return cached > 0 ? cached : null;
  }
}
/** 화면용: 열 때 한 번 센다 (화면을 다시 열면 다시 센다). 아직 모르면 null */
export function useTripCount(col: () => CollectionReference, tripId: string | undefined) {
  const [state, setState] = useState<{ tripId?: string; n: number | null }>({ n: null });
  useEffect(() => {
    if (!tripId) return;
    let on = true;
    countByTrip(col, tripId).then((n) => on && setState({ tripId, n }), () => on && setState({ tripId, n: null }));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);
  return state.tripId === tripId ? state.n : null;
}
export const countTripNotes = (tripId: string) => countByTrip(notesCol, tripId);
export const useTripNoteCount = (tripId: string | undefined) => useTripCount(notesCol, tripId);

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
/** 뼈대 일정 한꺼번에 넣기 (여행 계획하기) */
export const addPlans = (tripId: string, items: { day: string | null; time: string | null; name: string; info: string; recId?: string }[]) =>
  Promise.all(items.map((it, i) => queued(setDoc(doc(plansCol()), { tripId, name: it.name.slice(0, 80), order: i + 1, day: it.day, time: it.time, info: it.info.slice(0, 200), recId: it.recId ?? null, done: false, createdAt: serverTimestamp(), v: 1 }))));
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
export const addNote = (tripId: string, text: string, user: User, openAt?: string) =>
  queued(setDoc(doc(notesCol()), { tripId, text: text.trim(), by: { uid: user.uid, name: displayName(user) }, ...(openAt ? { openAt } : {}), createdAt: serverTimestamp(), v: 1 }));
/** 열리는 날이 된 타임캡슐 글만 한 번 읽는다 (홈 봉투: 열리는 날이 없는 글은 오지 않는다) */
export const readArrivedCapsules = async (today: string): Promise<Note[]> =>
  (await getDocs(query(notesCol(), where('openAt', '<=', today)))).docs.map((d) => ({ id: d.id, ...d.data() }) as Note);
export const deleteNote = (id: string) => queued(deleteDoc(doc(notesCol(), id)));

export { PACK_TEMPLATES, packFromTemplate } from './packing';

/** 모든 여행의 일정 줄 (물어보기용) */
export function useAllPlans(enabled = true) {
  const [items, setItems] = useState<PlanItem[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    return onSnapshot(plansCol(), (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PlanItem)), () => setItems([]));
  }, [enabled]);
  return items;
}

// ---------- 한 번만 읽기 (물어보기: 질문할 때 한 번, 구독 없이) ----------
/** 모든 여행의 일정 줄을 한 번 읽는다 (오프라인이면 기기 캐시에서) */
export const readPlansOnce = async (): Promise<PlanItem[]> => (await getDocs(plansCol())).docs.map((d) => ({ id: d.id, ...d.data() }) as PlanItem);
/** 모든 여행의 글을 한 번 읽는다 (오프라인이면 기기 캐시에서) */
export const readNotesOnce = async (): Promise<Note[]> => (await getDocs(notesCol())).docs.map((d) => ({ id: d.id, ...d.data() }) as Note).filter((n) => !isSealed(n));

/** 모든 여행의 글 (공유카드 '메모 인용' 등) */
export function useAllNotes(enabled = true) {
  const [items, setItems] = useState<Note[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    // 봉한 타임캡슐은 피드·공유 카드·물어보기에 나오지 않는다 (그 여행의 글 탭에선 봉투로만)
    return onSnapshot(notesCol(), (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Note).filter((n) => !isSealed(n))), () => setItems([]));
  }, [enabled]);
  return items;
}
