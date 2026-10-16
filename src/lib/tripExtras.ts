import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import type { Note, PackItem, PlanItem, When } from './types';

const plansCol = () => collection(db, 'spaces', SPACE_ID, 'plans');
const notesCol = () => collection(db, 'spaces', SPACE_ID, 'notes');

function useByTrip<T>(col: () => ReturnType<typeof collection>, tripId: string | undefined) {
  const [items, setItems] = useState<T[] | null>(null);
  useEffect(() => {
    if (!tripId) return;
    return onSnapshot(query(col(), where('tripId', '==', tripId)), (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);
  return items;
}

// ---------- 일정 ----------
export function usePlan(tripId: string | undefined) {
  const items = useByTrip<PlanItem>(plansCol, tripId);
  return useMemo(() => (items ? [...items].sort((a, b) => (a.day ?? '9999').localeCompare(b.day ?? '9999') || (a.time ?? '99').localeCompare(b.time ?? '99') || a.order - b.order) : null), [items]);
}
export const addPlan = (tripId: string, name: string, order: number, recId?: string | null) =>
  addDoc(plansCol(), { tripId, name: name.trim(), order, day: null, time: null, info: '', recId: recId ?? null, done: false, createdAt: serverTimestamp(), v: 1 });
export const updatePlan = (id: string, patch: Partial<Omit<PlanItem, 'id' | 'tripId' | 'v'>>) => updateDoc(doc(plansCol(), id), patch);
export const deletePlan = (id: string) => deleteDoc(doc(plansCol(), id));

/** 정확한 날짜가 있는 여행의 날짜들 ['2026-11-01', …] (최대 30일) */
export function tripDays(w: When): string[] {
  if (w.p !== 'day' || !w.y || !w.m || !w.d) return [];
  const start = new Date(Date.UTC(w.y, w.m - 1, w.d));
  const end = w.d2 ? new Date(Date.UTC(w.y2 ?? w.y, (w.m2 ?? w.m) - 1, w.d2)) : start;
  const out: string[] = [];
  for (let t = start.getTime(); t <= end.getTime() && out.length < 30; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}
export const dayLabel = (day: string, days: string[]) => {
  const i = days.indexOf(day);
  const [, m, d] = day.split('-').map(Number);
  const wd = '일월화수목금토'[new Date(day + 'T00:00:00Z').getUTCDay()];
  return `${i >= 0 ? `${i + 1}일째 · ` : ''}${m}.${d} (${wd})`;
};

// ---------- 기록(글) ----------
export function useNotes(tripId: string | undefined) {
  const items = useByTrip<Note>(notesCol, tripId);
  return useMemo(() => (items ? [...items].sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now())) : null), [items]);
}
export const addNote = (tripId: string, text: string, user: User) =>
  addDoc(notesCol(), { tripId, text: text.trim(), by: { uid: user.uid, name: displayName(user) }, createdAt: serverTimestamp(), v: 1 });
export const deleteNote = (id: string) => deleteDoc(doc(notesCol(), id));

// ---------- 준비물 ----------
const COMMON = ['신분증', '지갑·카드', '휴대폰 충전기', '보조배터리', '상비약', '세면도구', '갈아입을 옷', '잠옷'];
export const PACK_TEMPLATES: Record<string, { label: string; items: string[] }> = {
  rest: { label: '휴양', items: ['수영복', '선크림', '선글라스', '모자', '비치타월', '샌들'] },
  city: { label: '도시', items: ['편한 신발', '접는 우산', '에코백', '보조 가방'] },
  nature: { label: '자연', items: ['등산화', '바람막이', '물병', '간식', '벌레 기피제', '손전등'] },
  family: { label: '가족', items: ['아이 간식', '물티슈', '여벌 옷', '장난감', '아이 상비약'] },
};
const ABROAD = ['여권', '환전·트래블카드', '멀티어댑터', '유심·eSIM', '여행자 보험', '항공권·숙소 예약 확인'];

export function packFromTemplate(kind: string, abroad: boolean): PackItem[] {
  const names = [...(abroad ? ABROAD : []), ...COMMON, ...(PACK_TEMPLATES[kind]?.items ?? [])];
  return [...new Set(names)].map((t) => ({ t, who: null, done: false }));
}
