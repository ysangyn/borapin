import { say } from '../speech';
import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, SPACE_ID } from '../firebase';
import { queued } from '../writes';
import { bankLoaded, grade as gradeFn, ITEMS, loadBank, onBank, toggleSaved as toggleFn, ymd, type Item, type ProgressMap } from './srs';

/** 영어 공부 진도 (사람마다 문서 하나: spaces/main/study/{uid}) */
export interface StudyDoc { progress: ProgressMap; days: string[] }

/**
 * 문장 은행: 받기 전엔 null(뼈대를 보여 준다), 받은 뒤엔 문장 배열. 받지 못하면(오프라인에 조각도 없음) 빈 배열.
 * 첫 묶음을 가볍게 하려고 은행은 이 훅이 처음 불릴 때 따로 받는다.
 */
export function useBank(): Item[] | null {
  const [state, setState] = useState<Item[] | null>(() => (bankLoaded() ? ITEMS : null));
  useEffect(() => {
    if (state) return;
    let on = true;
    const off = onBank(() => on && setState(ITEMS));
    loadBank().then(() => on && setState(ITEMS), () => on && setState([]));
    return () => { on = false; off(); };
  }, [state]);
  return state;
}

export function useStudy() {
  const [data, setData] = useState<StudyDoc | null>(null);
  const uid = auth.currentUser?.uid ?? '';
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, 'spaces', SPACE_ID, 'study', uid), (s) => {
      const d = s.data() as Partial<StudyDoc> | undefined;
      setData({ progress: d?.progress ?? {}, days: d?.days ?? [] });
    }, () => setData({ progress: {}, days: [] }));
  }, [uid]);

  const write = useCallback((next: StudyDoc) => {
    if (!uid) return Promise.resolve();
    setData(next);
    return queued(setDoc(doc(db, 'spaces', SPACE_ID, 'study', uid), { ...next, v: 1 }));
  }, [uid]);

  const grade = useCallback((id: string, correct: boolean) => {
    if (!data) return;
    const t = ymd(new Date());
    void write({ progress: gradeFn(data.progress, id, correct), days: data.days.includes(t) ? data.days : [...data.days, t].slice(-1000) });
  }, [data, write]);

  const toggleSaved = useCallback((id: string) => {
    if (!data) return;
    void write({ ...data, progress: toggleFn(data.progress, id) });
  }, [data, write]);

  return { data, grade, toggleSaved };
}

/** 영어 읽어 주기 (폰 내장 음성, 무료) */
export const speak = (text: string) => say(text, 'en-US', 0.92);
