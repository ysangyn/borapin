import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import { queued } from './writes';
import { ymd } from './study/srs';
import type { Place } from './types';
import type { Question } from './askOfDay';

export { QUESTIONS, questionFor, questionText, type Question } from './askOfDay';

/** 오늘의 한 질문: 다음 여행지(1순위)에 대해 하루에 하나, 둘 다 답하면 서로의 답이 보인다. (spaces/main/asks/{day}) */
export interface AskDoc { qid: string; place: Place; answers: Record<string, { name: string; text: string; at: number }> }

export function useTodayAsk(day = ymd(new Date())) {
  const [data, setData] = useState<AskDoc | null | undefined>(undefined);
  useEffect(() => onSnapshot(doc(db, 'spaces', SPACE_ID, 'asks', day), (s) => setData((s.data() as AskDoc | undefined) ?? null), () => setData(null)), [day]);
  return data;
}

export async function answerAsk(day: string, q: Question, place: Place, text: string, user: User, existing: AskDoc | null) {
  const ref = doc(db, 'spaces', SPACE_ID, 'asks', day);
  const me = { name: displayName(user), text: text.trim().slice(0, 200), at: Date.now() };
  if (!existing) return queued(setDoc(ref, { qid: q.id, place, answers: { [user.uid]: me }, v: 1 }));
  return queued(updateDoc(ref, { [`answers.${user.uid}`]: me }));
}
