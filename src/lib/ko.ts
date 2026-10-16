import { josa } from 'es-hangul';

/** 횟수: 열 번까지는 우리말 ('한 번', '두 번' …), 그 뒤는 숫자 ('11번') */
const NATIVE = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
export const times = (n: number) => (Number.isInteger(n) && n >= 1 && n <= 10 ? `${NATIVE[n]} 번` : `${n}번`);

// 영어 글자·숫자를 우리말로 읽었을 때 끝소리: l = ㄹ 받침, y = 다른 받침, 없으면 받침 없음
const LATIN_END: Record<string, 'l' | 'y'> = { l: 'l', r: 'l', m: 'y', n: 'y' }; // 엘·알·엠·엔
const DIGIT_END: Record<string, 'l' | 'y'> = { '0': 'y', '1': 'l', '3': 'y', '6': 'y', '7': 'l', '8': 'l' }; // 영·일·삼·육·칠·팔

/** '…로/…으로': 한글은 받침대로, 메일 주소 같은 영어는 읽는 소리대로 (gmail.com → 으로) */
export function withRo(word: string): string {
  const w = word.trim();
  const last = w.slice(-1);
  if (/[가-힣]/.test(last)) return josa(w, '으로/로');
  const end = /[a-z]/i.test(last) ? LATIN_END[last.toLowerCase()] : /\d/.test(last) ? DIGIT_END[last] : undefined;
  return w + (end === 'y' ? '으로' : '로');
}
