/**
 * 보라(AI) 품질 점검: 규칙형이 못 받는 질문 몇 개를 실제 뒷단(Worker → Workers AI)에 물어보고
 * - 답이 왔는지, 사실(폰 안 도구 결과) 밖의 숫자를 지어내지 않았는지, 단추가 사실 안 id인지 확인한다.
 * 시험용 프로젝트 계정으로 로그인해 토큰을 받는다 (실제 기록은 쓰지 않는다 — 자료는 ask-test와 같은 가짜).
 *
 *   ASK_URL=https://… FIREBASE_API_KEY=… EMAIL=… PW=… npx tsx scripts/ask-eval.ts
 */
import travelinfo from '../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../src/data/seasons.json' with { type: 'json' };
import type { AskData } from '../src/lib/ask/engine';
import { runTools, type ToolCall } from '../src/lib/ask/tools';
import { ensurePlan } from '../src/lib/ask/plan';
import { findMentions } from '../src/lib/ask/gazetteer';
import { grounded } from '../src/lib/ask/confidence';
import { setMembers } from '../src/lib/members';
import type { Note, PlaceRec, Trip, Wish } from '../src/lib/types';

const { ASK_URL, FIREBASE_API_KEY, EMAIL, PW } = process.env;
if (!ASK_URL || !FIREBASE_API_KEY || !EMAIL || !PW) {
  console.error('ASK_URL, FIREBASE_API_KEY, EMAIL, PW가 필요해요');
  process.exit(2);
}
setMembers([{ email: 'ysangyn@gmail.com', name: '영상' }, { email: 'bora@example.com', name: '보라' }]);
const T = (id: string, title: string, places: Trip['places'], when: Trip['when'], extra: Partial<Trip> = {}): Trip =>
  ({ id, title, kind: 'trip', status: 'done', when, places, companions: ['보라', '영상'], memo: '', tags: [], source: 'app', v: 1, ...extra }) as Trip;
const data: AskData = {
  trips: [
    T('t1', '강릉시 여행', [{ t: 'kr', code: '51150' }], { p: 'day', y: 2019, m: 5, d: 3, d2: 4 }, { companions: ['보라', '영상', '엄마'] }),
    T('t2', '부산 여행', [{ t: 'kr', code: '26' }], { p: 'year', y: 2021 }),
    T('t4', '속초 여름 바다', [{ t: 'kr', code: '51210' }], { p: 'month', y: 2024, m: 8 }),
    T('t5', '제주 여행', [{ t: 'kr', code: '50' }], { p: 'day', y: 2026, m: 11, d: 20, d2: 22 }, { status: 'planned', packing: [{ t: '선크림', who: null, done: true }, { t: '수영복', who: '보라', done: false }] }),
  ],
  recs: [{ id: 'r1', name: '초당할머니순두부', kind: 'food', region: { t: 'kr', code: '51150' }, reviews: { 영상: '최고', 보라: '고소해요' }, verdict: 'again', v: 1 } as unknown as PlaceRec],
  wishes: [{ id: 'w1', place: { t: 'kr', code: '50' }, priority: 1, wantedBy: ['보라', '영상'], spots: [], todos: [], foods: [], note: '', source: 'app', v: 1 } as unknown as Wish],
  notes: [{ id: 'n1', tripId: 't1', text: '바다 보며 커피 마신 날', by: { uid: 'u', name: '영상' }, v: 1 } as Note],
  festivals: { updated: '2026-10-16', cells: { '51150': [{ t: '강릉커피축제', s: '20261023', e: '20261026', id: 'f1' }] } },
  info: travelinfo as never,
  seasons: seasons as never,
  now: new Date('2026-10-16T12:00:00+09:00'),
};

const QUESTIONS = [
  '다음 달에 둘 다 안 가본 바다 쪽으로 1박 가고 싶은데 어디가 좋을까',
  '강릉 갔을 때 뭐 먹었더라, 또 가고 싶다고 한 데 있었나',
  '제주 가기 전에 준비물 뭐 남았어',
  '엄마 모시고 갈 만한 데 추천해줘, 많이 걷지 않는 데로',
  '커피 마시러 갔던 날 글 남긴 거 찾아줘',
  '11월 셋째 주에 비 오면 실내에서 뭐 할 수 있는 곳',
];

async function token(): Promise<string> {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PW, returnSecureToken: true }),
  });
  const j = (await r.json()) as { idToken?: string; error?: { message: string } };
  if (!j.idToken) throw new Error(`로그인 실패: ${j.error?.message}`);
  return j.idToken;
}
async function post(path: string, tk: string, body: unknown, tries = 2) {
  let r: Response;
  try {
    r = await fetch(`${ASK_URL}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${tk}` }, body: JSON.stringify(body) });
  } catch (e) {
    // 네트워크가 잠깐 끊기면 한 번 더 (시험 결과가 날씨에 흔들리지 않게)
    if (tries > 1) { await new Promise((ok) => setTimeout(ok, 2000)); return post(path, tk, body, tries - 1); }
    throw e;
  }
  const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) throw new Error(`${path} ${r.status} ${JSON.stringify(j).slice(0, 120)}`);
  return j;
}

const tk = await token();
const context = '오늘 2026년 10월 16일\n함께 쓰는 사람: 보라, 영상';
let bad = 0;
for (const q of QUESTIONS) {
  const t0 = Date.now();
  try {
    const plan = await post('/plan', tk, { question: q, context });
    const mention = findMentions(q, data.info)[0]?.entry.label ?? null;
    const calls = ensurePlan(q, (Array.isArray(plan.calls) ? plan.calls : []) as ToolCall[], mention, data.now);
    console.log(`   계획: ${JSON.stringify(calls)}`);
    const facts = runTools(calls, data, null, data.now);
    const factText = [facts.text, facts.actions.length ? `actions: ${facts.actions.map((x) => `${x.id}=${x.btn.label}`).join(', ')}` : ''].filter(Boolean).join('\n');
    const ans = await post('/answer', tk, { question: q, context, facts: factText });
    const text = String(ans.text ?? '');
    const lines = (Array.isArray(ans.lines) ? ans.lines : []).map(String);
    const ids = (Array.isArray(ans.buttons) ? ans.buttons : []).map(String);
    const okGround = grounded([text, ...lines].join(' '), factText);
    const okBtn = ids.every((id) => facts.actions.some((x) => x.id === id));
    const ms = Date.now() - t0;
    const status = text && okGround && okBtn ? '✓' : '✗';
    if (status === '✗') bad++;
    console.log(`${status} "${q}" (${ms}ms)\n   도구: ${calls.map((c) => c.tool).join(', ') || '없음'}\n   답: ${text}\n   ${lines.map((l) => '· ' + l).join('\n   ')}\n   단추: ${ids.join(', ') || '없음'}${okGround ? '' : '\n   !! 사실에 없는 숫자'}${okBtn ? '' : '\n   !! 사실 밖 단추 id'}`);
  } catch (e) {
    bad++;
    console.log(`✗ "${q}" → ${(e as Error).message}`);
  }
}
// 소식·장소 링크 뒷단 확인 (결과만 기록, 실패해도 관문은 막지 않는다: 바깥 사이트 사정이라)
async function get(path: string) {
  const r = await fetch(`${ASK_URL}${path}`, { headers: { authorization: `Bearer ${tk}` } });
  return { status: r.status, body: await r.json().catch(() => ({})) as Record<string, unknown> };
}
for (const q of ['유류할증료 when:14d', '고창 여행 when:30d', '경기 광주 축제 when:30d', '인기 여행지 when:14d']) {
  const r = await get(`/news?q=${encodeURIComponent(q)}`).catch((e) => ({ status: 0, body: { error: String(e) } as Record<string, unknown> }));
  const items = (r.body.items as { title: string; at: string }[] | undefined) ?? [];
  console.log(`소식 "${q}": ${r.status} · ${items.length}개 · ${JSON.stringify(r.body.debug ?? r.body.error ?? "")}${items[0] ? ` · 첫 기사 "${items[0].title}" (${items[0].at})` : ''}`);
}
for (const u of ['https://naver.me/GlVmYk5l', 'https://naver.me/GIVmYk5l']) {
  const r = await get(`/place?url=${encodeURIComponent(u)}&addr=${encodeURIComponent('경북 칠곡군 동명면 남원로3길 14')}`).catch((e) => ({ status: 0, body: { error: String(e) } as Record<string, unknown> }));
  console.log(`장소 링크 ${u}: ${r.status} ${JSON.stringify(r.body).slice(0, 400)}`);
}

console.log(`\n보라(AI) 점검: ${QUESTIONS.length - bad}/${QUESTIONS.length}`);
if (bad > QUESTIONS.length / 2) {
  console.error('✗ 절반 넘게 실패');
  process.exit(1);
}
