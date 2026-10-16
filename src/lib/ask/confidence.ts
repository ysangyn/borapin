import type { Answer } from './engine';

/** 규칙형이 자신 있게 답한 건지: 모르겠다·되묻기·'장소만 던진 긴 질문'·조건이 여럿이면 AI에게 */
export function rulesConfident(q: string, a: Answer): boolean {
  if (a.intent === 'unknown') return false;
  const text = q.trim();
  const long = text.replace(/\s+/g, '').length >= 24;
  const multi = (text.match(/그리고|면서|이면서|하면서|이고|인데|말고|빼고|둘 다|같이|근처|가까운|1박|2박|당일|주말|예산|돈|아이|부모님|강아지|비 오|비 올|추운|더운/g) ?? []).length >= 2;
  if (multi) return false;
  if (a.intent === 'overview' && long) return false;
  return true;
}

/** 답에 나온 숫자·지명이 사실 안에 있는지 (지어낸 흔적이 있으면 규칙형으로) */
export function grounded(text: string, facts: string): boolean {
  const nums = text.match(/\d{2,}/g) ?? [];
  if (nums.some((n) => !facts.includes(n))) return false;
  return true;
}

