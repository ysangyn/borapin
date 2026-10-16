import { placeLabel } from './geo';
import questions from '../data/questions.json';
import type { Place } from './types';

/**
 * 오늘의 한 질문(순수 부분): 날짜마다 하나, 다음 여행지 이름을 끼워 넣는다.
 * 답이 '먹을 것·가볼 곳·해볼 것'이면 가고 싶은 곳 메모에 넣을 수 있게 save 칸을 둔다.
 */
export interface Question { id: string; t: string; save?: 'foods' | 'spots' | 'todos' }

export const QUESTIONS = questions as Question[];

/**
 * 날짜로 고정 선택: 같은 날 둘이 같은 질문.
 * 하루 번호에 37(60과 서로소)을 곱해 돌리면 어느 날부터 세어도 60일 동안 같은 질문이 안 나온다.
 */
export function questionFor(day: string): Question {
  const [y, m, d] = day.split('-').map(Number);
  const n = Math.floor(Date.UTC(y || 2026, (m || 1) - 1, d || 1) / 86400000);
  const len = QUESTIONS.length;
  return QUESTIONS[(((n * 37) % len) + len) % len];
}

/** 말하듯 부르는 이름: '강릉시' → '강릉', '순창군' → '순창' (두 글자 이름은 그대로) */
export function spokenPlace(place: Place): string {
  const name = placeLabel(place);
  return place.t === 'kr' && name.length >= 3 ? name.replace(/[시군]$/, '') : name;
}
export const questionText = (q: Question, place: Place) => q.t.replace('{place}', spokenPlace(place));
