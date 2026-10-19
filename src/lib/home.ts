import { useEffect, useState } from 'react';
import { deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, SPACE_ID } from './firebase';
import { queued } from './writes';
import type { Home } from './placeApps';

/** 우리 집: 공간 문서(spaces/main)의 home 칸. 둘이 같은 집을 쓴다 */
export function useHome(): Home | null | undefined {
  const [h, setH] = useState<Home | null | undefined>(undefined);
  useEffect(() => onSnapshot(doc(db, 'spaces', SPACE_ID), (s) => setH(((s.data() as { home?: Home } | undefined)?.home) ?? null), () => setH(null)), []);
  return h;
}
export const saveHome = (home: Home) => queued(updateDoc(doc(db, 'spaces', SPACE_ID), { home }));
export const clearHome = () => queued(updateDoc(doc(db, 'spaces', SPACE_ID), { home: deleteField() }));
