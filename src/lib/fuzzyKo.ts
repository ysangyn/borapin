/**
 * 한글 오타에 너그러운 찾기 (순수 함수) — 사용자 의견 11-25: '대회역'이라고 쳐도 '대화역'이 나오게, 치는 동안 자동완성.
 * 글자를 자음·모음 낱자로 풀어(겹모음·겹받침도 풀어서) 비교하면 한 끗 틀린 글자는 거리 1이 된다.
 */
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅗㅏ', 'ㅗㅐ', 'ㅗㅣ', 'ㅛ', 'ㅜ', 'ㅜㅓ', 'ㅜㅔ', 'ㅜㅣ', 'ㅠ', 'ㅡ', 'ㅡㅣ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄱㅅ', 'ㄴ', 'ㄴㅈ', 'ㄴㅎ', 'ㄷ', 'ㄹ', 'ㄹㄱ', 'ㄹㅁ', 'ㄹㅂ', 'ㄹㅅ', 'ㄹㅌ', 'ㄹㅍ', 'ㄹㅎ', 'ㅁ', 'ㅂ', 'ㅂㅅ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/** '대화' → 'ㄷㅐㅎㅗㅏ' (한글 아닌 글자는 소문자로 그대로, 띄어쓰기·가운뎃점은 뺀다) */
export function jamo(s: string): string {
  let out = '';
  for (const ch of s.toLowerCase().replace(/[\s·.\-_()]/g, '')) {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c >= 0 && c < 11172) out += CHO[Math.floor(c / 588)] + JUNG[Math.floor((c % 588) / 28)] + JONG[c % 28];
    else out += ch;
  }
  return out;
}

/** 두 글의 편집 거리 (넣기·빼기·바꾸기 한 번 = 1) */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/** '대화역' · '대화' 둘 다 같은 역으로 ('역'은 떼고 비교) */
export const stationKey = (s: string) => s.replace(/\s+/g, '').replace(/역$/, '');

export interface FuzzyHit<T> { item: T; exact: boolean; score: number }

/**
 * 이름 목록에서 찾기: ① 앞부분이 같으면(자동완성) 먼저, 짧은 이름 먼저 ② 낱자 거리가 가까우면 '혹시' 후보.
 * 낱자 거리 허용: 두 글자 이하는 1, 그보다 길면 2. 한 글자만 쳤을 땐 오타 보정을 하지 않는다.
 */
export function fuzzyFind<T>(q: string, list: readonly T[], name: (t: T) => string, max = 5): FuzzyHit<T>[] {
  const qk = stationKey(q.trim());
  if (!qk) return [];
  const qj = jamo(qk);
  const allow = qk.length <= 2 ? 1 : 2;
  const out: FuzzyHit<T>[] = [];
  for (const item of list) {
    const nk = stationKey(name(item));
    const nj = jamo(nk);
    if (nj.startsWith(qj)) { out.push({ item, exact: true, score: nk.length - qk.length }); continue; }
    if (qk.length < 2) continue;
    // 길이가 비슷한 이름만 거리를 잰다 (앞부분 오타도 잡게, 같은 길이 앞부분끼리도 견줌)
    const whole = Math.abs(nj.length - qj.length) <= allow ? editDistance(qj, nj) : 99;
    const head = nj.length > qj.length ? editDistance(qj, nj.slice(0, qj.length)) + 0.5 : 99;
    const d = Math.min(whole, head);
    if (d <= allow) out.push({ item, exact: false, score: 100 + d * 10 + nk.length });
  }
  return out.sort((a, b) => a.score - b.score).slice(0, max);
}
