import type { Answer } from './engine';

/** 규칙형이 자신 있게 답한 건지: 모르겠다·되묻기·'장소만 던진 긴 질문'·조건이 여럿이면 AI에게 */
export function rulesConfident(q: string, a: Answer): boolean {
  // 되묻는 중이거나 되묻기의 답을 받아 다시 푼 답은 규칙형이 끝까지 이어 간다
  if (a.pending || a.setHome) return true;
  if (a.intent === 'unknown') return false;
  // 추천인데 핵심 낱말을 알아듣지 못했다(예: '은하수', '케이블카') → 엉뚱한 3곳 대신 AI에게
  if (a.intent === 'recommend' && a.unused?.length) return false;
  // 해외 추천은 세계 도시 자료로 규칙형이 답한다 (AI 도구는 국내 추천만 알아서, 넘기면 엉뚱해진다)
  if (a.intent === 'recommend' && (a.items?.some((i) => i.wish?.t === 'country') || /자료가 없어요$/.test(a.text))) return true;
  const text = q.trim();
  const long = text.replace(/\s+/g, '').length >= 24;
  const multi = (text.match(/그리고|면서|이면서|하면서|이고|인데|말고|빼고|둘 다|같이|근처|가까운|1박|2박|당일|주말|예산|돈|아이|부모님|강아지|비 오|비 올|추운|더운/g) ?? []).length >= 2;
  if (multi) return false;
  if (a.intent === 'overview' && long) return false;
  return true;
}

/**
 * AI(보라)에게 넘길지: 뒷단이 있으면 기본은 AI가 대화로 답하고, 규칙형은 사실 찾기·단추·대체 답을 맡는다.
 * 규칙형이 끝까지 맡는 것: 되묻기 이어 가기, '지도'·'가고 싶은 곳 보기' 같은 이동 명령, 해외 도시 추천(세계 자료는 규칙형에만 있음),
 * 지역 이름 하나만 친 짧은 입력(예: '강릉') — 이건 개요 카드가 더 빠르고 정확하다.
 */
export function wantsAi(q: string, a: Answer, history: { q: string }[] = []): boolean {
  if (a.pending || a.setHome) return false;
  if (a.intent === 'map' || a.intent === 'wishList' || a.intent === 'choose' || a.intent === 'wishAdd') return false;
  if (a.intent === 'recommend' && (a.items?.some((i) => i.wish?.t === 'country') || /자료가 없어요$/.test(a.text))) return false;
  const t = q.trim().replace(/[?？!.~ ]+$/g, '');
  if (history.length > 0) return true; // 이어지는 말은 앞 대화를 아는 AI가
  if (t.replace(/\s+/g, '').length <= 5 && a.intent !== 'unknown') return false;
  return true;
}

/** 답에 나온 숫자·지명이 사실 안에 있는지 (지어낸 흔적이 있으면 규칙형으로) */
export function grounded(text: string, facts: string): boolean {
  // 달·날짜(1~31)와 질문·앞 대화에 나온 숫자는 지어낸 것이 아니다 (facts에 질문·맥락도 함께 넘긴다)
  const nums = (text.match(/\d{2,}/g) ?? []).filter((n) => Number(n) > 31);
  if (nums.some((n) => !facts.includes(n))) return false;
  return true;
}

