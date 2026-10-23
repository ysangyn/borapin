/**
 * 물어보기 두 단계: 규칙형(NLP)이 알아들으면 그걸로 끝(빠르고 공짜), 못 알아듣거나 조건이 여럿이면 보라(AI)에게.
 * - AI 경로: Worker에 질문만 보내 '어떤 자료를 볼지' 받고 → 자료 조회는 폰 안에서 → 사실만 보내 답을 받는다.
 * - AI가 없거나(주소 없음·오프라인·한도 초과·실패) 답이 사실 밖이면 규칙형 답으로 돌아간다.
 */
import type { User } from 'firebase/auth';
import { ask, trendTopicOf, type Answer, type AskCtx, type AskData, type Btn, type Intent } from './engine';
import { lastPlace, runTools, type ToolCall } from './tools';
import { ensurePlan } from './plan';
import { findMentions } from './gazetteer';
import { memberNames } from '../members';
import { grounded, wantsAi } from './confidence';
import { placeLong } from '../geo';
import { ASK_URL, aiAvailable } from './url';

// 주소는 url.ts에 있다 (소식·장소 찾기가 엔진 없이 가져다 쓰게). 옛 import 자리를 위해 다시 내보낸다
export { ASK_URL, aiAvailable } from './url';

export interface SmartResult { answer: Answer; via: 'rules' | 'ai'; reason?: string }

async function post(path: string, token: string, body: unknown, timeoutMs = 20000): Promise<Record<string, unknown>> {
  const ctl = new AbortController();
  const t = window.setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(`${ASK_URL}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(body), signal: ctl.signal });
    const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (!r.ok) throw Object.assign(new Error(String(j.error ?? r.status)), { status: r.status, body: j });
    return j;
  } finally {
    window.clearTimeout(t);
  }
}

export async function askSmart(question: string, ctx: AskCtx, d: AskData, user: User | null, history: { q: string; a: string }[] = []): Promise<SmartResult> {
  const rule = ask(question, ctx, d);
  if (!wantsAi(question, rule, history) || !aiAvailable() || !user) return { answer: rule, via: 'rules' };
  try {
    const token = await user.getIdToken();
    const now = d.now ?? new Date();
    const context = [
      `오늘 ${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`,
      `함께 쓰는 사람: ${memberNames().join(', ') || '둘'}`,
      ctx.place ? `직전에 이야기한 지역: ${placeLong(ctx.place)}` : '',
      ...history.slice(-4).map((h) => `앞 대화: Q ${h.q} / A ${h.a.slice(0, 200)}`),
    ].filter(Boolean).join('\n');
    const plan = await post('/plan', token, { question, context });
    const mention = findMentions(question, d.info)[0]?.entry.label ?? null;
    const calls = ensurePlan(question, (Array.isArray(plan.calls) ? plan.calls : []) as ToolCall[], mention, now);
    // 요즘 뜨는 곳·한적한 곳·많이 안 걷는 곳은 추천 도구가 요즘 자료(또는 '자료 없음')를 사실로 준다: 모델이 빼먹었으면 보탠다
    if (trendTopicOf(question) && !calls.some((c) => c.tool === 'recommend')) calls.push({ tool: 'recommend', args: {} });
    const facts = runTools(calls, d, ctx.place ?? null, now, question);
    const factText = [facts.text, facts.actions.length ? `actions: ${facts.actions.map((x) => `${x.id}=${x.btn.label}`).join(', ')}` : ''].filter(Boolean).join('\n');
    const ans = await post('/answer', token, { question, context, facts: factText });
    const text = String(ans.text ?? '');
    const lines = (Array.isArray(ans.lines) ? ans.lines : []).map(String);
    if (!text || !grounded([text, ...lines].join(' '), [factText, question, context].join('\n'))) return { answer: rule, via: 'rules', reason: 'ungrounded' };
    const ids = (Array.isArray(ans.buttons) ? ans.buttons : []).map(String);
    const buttons: Btn[] = ids.map((id) => facts.actions.find((x) => x.id === id)?.btn).filter((b): b is Btn => !!b);
    if (!buttons.length) buttons.push(...facts.actions.slice(0, 3).map((x) => x.btn));
    const place = lastPlace(calls, ctx.place ?? null);
    return {
      answer: { intent: 'ai' as Intent, text, lines, buttons, source: '핀이 · 우리 기록과 여행정보만으로 답했어요', ctx: { place, intent: 'ai' as Intent } },
      via: 'ai',
    };
  } catch (e) {
    const status = (e as { status?: number }).status;
    console.warn('ai ask failed', e);
    return { answer: rule, via: 'rules', reason: status === 429 ? 'limit' : 'error' };
  }
}
