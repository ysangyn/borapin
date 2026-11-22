/**
 * 알아보기 창 글 다듬기 (순수 함수): 사진 아래 한 줄 소개, 위쪽 정보 칩 (사용자 의견 11-22: 가독성·집중).
 */

/** 관광공사 글의 꼬리표·줄바꿈 표시를 걷어 낸다 */
export function cleanText(s: string): string {
  return s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

/** 첫 문장 하나 (너무 길면 max 글자에서 끊고 …) */
export function leadLine(text: string, max = 60): string {
  const t = cleanText(text);
  if (!t) return '';
  const m = t.match(/^.+?[.!?。](?=\s|$)|^.+?(?:다|요)\.(?=\s|$)/);
  const first = (m ? m[0] : t).trim();
  return first.length > max ? `${first.slice(0, max - 1).trimEnd()}…` : first;
}

/** 본문이 한 줄 소개와 거의 같으면 본문은 따로 안 보여 준다 */
export function bodyAfterLead(text: string, lead: string): string {
  const t = cleanText(text);
  const l = lead.replace(/…$/, '');
  if (!t || t.length <= l.length + 15) return '';
  return t;
}

/** 칩에 넣을 짧은 값: 첫 덩어리만, max 글자 */
export function chipValue(s: string | undefined | null, max = 16): string {
  if (!s) return '';
  const t = cleanText(s).split(/\s*(?:\/|,|;|※|\(|\n)\s*/)[0].trim() || cleanText(s);
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}
