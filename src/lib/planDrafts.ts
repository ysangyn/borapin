import { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, orderBy, query, limit, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import { queued } from './writes';
import type { Candidate, PlanConds } from './planner';

/** 여행 계획하기 초안 (spaces/main/planDrafts): 후보 3곳 + 사람마다 하트 */
export interface PlanDraft {
  id: string;
  conds: PlanConds;
  cands: Candidate[];
  hearts: Record<string, string[]>;
  names: Record<string, string>;
  by: { uid: string; name: string };
  createdAt?: { toMillis?: () => number } | null;
  tripId: string | null;
  round: number;
  v: 1;
}
const col = () => collection(db, 'spaces', SPACE_ID, 'planDrafts');
const clean = (c: Candidate[]) => JSON.parse(JSON.stringify(c)) as Candidate[];

export async function createDraft(conds: PlanConds, cands: Candidate[], user: User): Promise<string> {
  const me = displayName(user);
  const ref = await addDoc(col(), { conds: JSON.parse(JSON.stringify(conds)), cands: clean(cands), hearts: {}, names: {}, by: { uid: user.uid, name: me }, createdAt: serverTimestamp(), tripId: null, round: 1, v: 1 });
  return ref.id;
}
export const setMyHearts = (id: string, user: User, keys: string[]) =>
  queued(updateDoc(doc(col(), id), { [`hearts.${user.uid}`]: keys, [`names.${user.uid}`]: displayName(user) }));
export const rerollDraft = (id: string, cands: Candidate[], round: number) => queued(updateDoc(doc(col(), id), { cands: clean(cands), hearts: {}, round }));
export const markDecided = (id: string, tripId: string) => queued(updateDoc(doc(col(), id), { tripId }));

export function useDraft(id: string | undefined): PlanDraft | null | undefined {
  const [d, setD] = useState<PlanDraft | null | undefined>(undefined);
  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(col(), id), (s) => setD(s.exists() ? ({ id: s.id, ...(s.data() as Omit<PlanDraft, 'id'>) }) : null), () => setD(null));
  }, [id]);
  return d;
}

/** 아직 정하지 않은 최근 초안 (홈에 '고르는 중'으로) */
export function useOpenDrafts(): PlanDraft[] | null {
  const [list, setList] = useState<PlanDraft[] | null>(null);
  useEffect(() => onSnapshot(query(col(), orderBy('createdAt', 'desc'), limit(5)), (s) => {
    const two = Date.now() - 14 * 86400000;
    setList(s.docs.map((x) => ({ id: x.id, ...(x.data() as Omit<PlanDraft, 'id'>) })).filter((d) => !d.tripId && (d.createdAt?.toMillis?.() ?? Date.now()) > two));
  }, () => setList([])), []);
  return list;
}
