import { useEffect, useState } from 'react';
import { collection, doc, documentId, limit, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import { queued } from './writes';
import { ymd } from './study/srs';
import type { Place } from './types';
import { QUESTIONS, questionFor, questionText, type Question } from './askOfDay';

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

/** 최근 며칠의 질문·답 (피드와 새 소식 점에 쓴다) */
export function useRecentAsks(days = 7): { day: string; doc: AskDoc }[] | null {
  const [data, setData] = useState<{ day: string; doc: AskDoc }[] | null>(null);
  useEffect(() => onSnapshot(query(collection(db, 'spaces', SPACE_ID, 'asks'), orderBy(documentId(), 'desc'), limit(days)),
    (s) => setData(s.docs.map((x) => ({ day: x.id, doc: x.data() as AskDoc }))), () => setData([])), [days]);
  return data;
}

/** 피드용으로 바꾸기: 질문 글과 '모두 답했는지' 기준 인원 */
export function asksForFeed(list: { day: string; doc: AskDoc }[] | null, need: number) {
  return (list ?? []).map(({ day, doc }) => {
    const q = QUESTIONS.find((x) => x.id === doc.qid) ?? questionFor(day);
    return { day, qid: doc.qid, question: questionText(q, doc.place), answers: doc.answers ?? {}, need: Math.max(1, need) };
  });
}
