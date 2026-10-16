import type { ToolCall } from './tools';
import { THEMES } from '../recommend';

/**
 * AI가 짠 도구 계획의 안전망 (공짜·즉시).
 * 모델이 '우리 기록' 질문에 our_* 도구를 빼먹으면 "기록이 없어요"라고 잘못 답하게 되므로,
 * 질문 말투로 보아 우리 기록이 필요한데 빠졌으면 보태 준다. 지명은 모델이 적은 resolve_place 인자나 찾아낸 지명을 그대로 쓴다.
 */
const OURS = /갔을 때|갔었|갔던|다녀온|다녀왔|먹었|마셨|묵었|남긴|남겼|썼던|적었|기록|사진|글|또 가|다시 가|우리가|우리 |언제 갔|몇 번|가봤|가 봤|했던|했었/;
const NOTE_LIKE = /글|일기|남긴|썼|적었/;
const PLACE_LIKE = /맛집|식당|카페|가게|먹었|마셨|장소|또 가|다시 가/;
const PHOTO_LIKE = /사진/;

/** 질문 글에서 테마 낱말 찾기: '바다 쪽', '실내에서', '온천' → 테마 이름 */
const THEME_WORDS: [RegExp, string][] = [
  [/바다|바닷가|해변|해수욕/, '바다'], [/산|숲|계곡|트레킹|등산/, '산·숲'], [/섬/, '섬'], [/온천|스파/, '온천'], [/야경|밤/, '야경'],
  [/역사|전통|한옥|유적|사찰|절/, '역사·전통'], [/카페|커피/, '카페'], [/시장|먹거리|먹을/, '시장·먹거리'], [/실내|비 오|비가 오|비오/, '실내'],
];
export function themesIn(question: string): string[] {
  return THEME_WORDS.filter(([re]) => re.test(question)).map(([, label]) => label).filter((l) => THEMES.some((t) => t.label === l));
}
/** '다음 달'·'11월'·'내년 1월' → 달 숫자 */
export function monthIn(question: string, now = new Date()): number | null {
  const m = question.match(/(\d{1,2})월/);
  if (m) { const n = Number(m[1]); if (n >= 1 && n <= 12) return n; }
  if (/다음\s*달/.test(question)) return (now.getMonth() + 1) % 12 + 1;
  if (/이번\s*달|이달/.test(question)) return now.getMonth() + 1;
  return null;
}

const PLACE_TOOLS = new Set(['resolve_place', 'place_info', 'best_time', 'festivals', 'our_trips', 'our_places', 'our_photos', 'packing']);

/**
 * 모델이 적은 인자 손보기 (작은 모델이 자주 내는 실수):
 * - 틀을 그대로 베낀 'month?' 같은 열쇠 → 'month'
 * - 질문에 없는 지명·검색어(글자가 깨진 것) → 질문에서 찾은 지명으로 바꾸거나 뺀다
 */
function sanitize(c: ToolCall, question: string, mention: string | null): ToolCall {
  const a: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(c.args ?? {})) { const key = k.replace(/\?$/, ''); if (!(key in a) || k === key) a[key] = v; }
  if (c.tool === 'resolve_place' && typeof a.name === 'string' && a.place === undefined) { a.place = a.name; delete a.name; }
  const q = question.replace(/\s+/g, '');
  const inQ = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && q.includes(v.replace(/\s+/g, '').replace(/(시|군|구)$/, '').slice(0, 2));
  if (PLACE_TOOLS.has(c.tool) && typeof a.place === 'string' && !inQ(a.place) && !/거기|그곳|여기/.test(a.place)) {
    if (mention) a.place = mention; else delete a.place;
  }
  if (typeof a.query === 'string' && !inQ(a.query)) delete a.query;
  return { tool: c.tool, args: a };
}

export function ensurePlan(question: string, calls: ToolCall[], placeName: string | null, now = new Date()): ToolCall[] {
  const out = calls.map((c) => sanitize(c, question, placeName));
  // 추천 도구에 질문의 테마·달·안 가본 곳 조건이 빠졌으면 채운다 (모델이 자주 빼먹는 인자)
  for (const c of out) {
    if (c.tool !== 'recommend') continue;
    const a = (c.args ??= {});
    const themes = themesIn(question);
    if (themes.length && !a.themes && !a.theme) a.themes = themes;
    const month = monthIn(question, now);
    if (month && !a.month) a.month = month;
    if (/안\s*가\s*본|못\s*가\s*본|새로운 곳/.test(question) && a.unvisited === undefined) a.unvisited = true;
  }
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
