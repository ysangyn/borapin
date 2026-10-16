import type { ToolCall } from './tools';

/**
 * AI가 짠 도구 계획의 안전망 (공짜·즉시).
 * 모델이 '우리 기록' 질문에 our_* 도구를 빼먹으면 "기록이 없어요"라고 잘못 답하게 되므로,
 * 질문 말투로 보아 우리 기록이 필요한데 빠졌으면 보태 준다. 지명은 모델이 적은 resolve_place 인자나 찾아낸 지명을 그대로 쓴다.
 */
const OURS = /갔을 때|갔었|갔던|다녀온|다녀왔|먹었|마셨|묵었|남긴|남겼|썼던|적었|기록|사진|글|또 가|다시 가|우리가|우리 |언제 갔|몇 번|가봤|가 봤|했던|했었/;
const NOTE_LIKE = /글|일기|남긴|썼|적었/;
const PLACE_LIKE = /맛집|식당|카페|가게|먹었|마셨|장소|또 가|다시 가/;
const PHOTO_LIKE = /사진/;

export function ensurePlan(question: string, calls: ToolCall[], placeName: string | null): ToolCall[] {
  const out = [...calls];
  const has = (t: string) => out.some((c) => c.tool === t);
  const place = placeName ?? (out.find((c) => c.tool === 'resolve_place')?.args?.place as string | undefined) ?? null;
  const withPlace = (extra: Record<string, unknown> = {}) => (place ? { place, ...extra } : extra);
  if (OURS.test(question)) {
    if (place && !has('resolve_place')) out.unshift({ tool: 'resolve_place', args: { place } });
    if (!has('our_trips')) out.push({ tool: 'our_trips', args: withPlace() });
    if (PLACE_LIKE.test(question) && !has('our_places')) out.push({ tool: 'our_places', args: withPlace() });
    if (NOTE_LIKE.test(question) && !has('our_notes')) out.push({ tool: 'our_notes', args: {} });
    if (PHOTO_LIKE.test(question) && !has('our_photos')) out.push({ tool: 'our_photos', args: withPlace() });
  }
  return out.slice(0, 7);
}
