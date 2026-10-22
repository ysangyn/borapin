import { josa } from 'es-hangul';

/** 횟수: 열 번까지는 우리말 ('한 번', '두 번' …), 그 뒤는 숫자 ('11번') */
const NATIVE = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
export const times = (n: number) => (Number.isInteger(n) && n >= 1 && n <= 10 ? `${NATIVE[n]} 번` : `${n}번`);

// 영어 글자·숫자를 우리말로 읽었을 때 끝소리: l = ㄹ 받침, y = 다른 받침, 없으면 받침 없음
const LATIN_END: Record<string, 'l' | 'y'> = { l: 'l', r: 'l', m: 'y', n: 'y' }; // 엘·알·엠·엔
const DIGIT_END: Record<string, 'l' | 'y'> = { '0': 'y', '1': 'l', '3': 'y', '6': 'y', '7': 'l', '8': 'l' }; // 영·일·삼·육·칠·팔

/** 낱말 끝소리: null = 한글(es-hangul이 받침을 안다), 'l' = ㄹ 받침, 'y' = 다른 받침, 'n' = 받침 없음 */
function ending(w: string): 'l' | 'y' | 'n' | null {
  const last = w.slice(-1);
  if (/[가-힣]/.test(last)) return null;
  const end = /[a-z]/i.test(last) ? LATIN_END[last.toLowerCase()] : /\d/.test(last) ? DIGIT_END[last] : undefined;
  return end ?? 'n';
}

/** '…로/…으로': 한글은 받침대로, 메일 주소 같은 영어는 읽는 소리대로 (gmail.com → 으로) */
export function withRo(word: string): string {
  const w = word.trim();
  const end = ending(w);
  if (end === null) return josa(w, '으로/로');
  return w + (end === 'y' ? '으로' : '로');
}

/** 받침에 따라 갈리는 조사 (앞이 받침 있을 때): '이/가', '은/는', '을/를', '과/와'. 영어 이름도 읽는 소리대로 */
export function withJosa(word: string, pair: '이/가' | '은/는' | '을/를' | '과/와'): string {
  const w = word.trim();
  const end = ending(w);
  if (end === null) return josa(w, pair === '과/와' ? '와/과' : pair);
  const [yes, no] = pair.split('/');
  return w + (end === 'n' ? no : yes);
}

/** 이름 뒤 '이/가': '보라가', '영상이', 'YUN이' */
export const withIGa = (word: string) => withJosa(word, '이/가');

/** 낱말 뒤에 붙는 조사만 ('보라' → '가'): 이름을 굵게 쓰고 조사만 이어 붙일 때 */
export const josaOnly = (word: string, pair: Parameters<typeof withJosa>[1]) => withJosa(word, pair).slice(word.trim().length);
