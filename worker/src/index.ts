/**
 * 보라핀 물어보기 뒷단 (Cloudflare Worker, 무료)
 *
 * 앱(폰)이 규칙형으로 못 알아들은 질문만 여기로 보낸다.
 *   1) POST /plan   : 질문 → 어떤 자료를 볼지 (도구 호출 목록). 자료 조회는 폰 안에서 한다 (기록은 폰 밖으로 안 나감).
 *   2) POST /answer : 질문 + 폰이 모은 사실 → 사실만으로 쓴 한국어 답 (JSON).
 *
 * 지키는 것
 * - Firebase 로그인 토큰(ID 토큰)이 맞는 요청만 받는다 (구글 공개 키로 서명 확인, 프로젝트 확인, 메일 인증 확인).
 * - 우리 공간 멤버만: 사용자 토큰으로 Firestore의 멤버 전용 문서(config/access)를 읽어 본다 (규칙이 멤버만 허용 → 200이면 멤버).
 *   결과는 사람(uid)마다 메모리에 1시간 두어 Firestore 읽기를 아낀다. 아무나 이메일 가입만으로 무료 한도를 쓰지 못하게.
 * - 사람당 분당 20번(/news는 따로 메모리로 분당 20번), 하루 DAILY_LIMIT번. 넘으면 429 → 앱은 규칙형 답으로 돌아간다.
 * - 모델이 사실에 없는 지명·숫자를 만들지 않도록 지시하고, 앱 쪽에서 한 번 더 거른다.
 */
import { bingQuery, parseBingRss, parseGoogleRss, type NewsItem } from './rss';
import { allowedUrl, coordsFromUrl, kakaoPlaceId, naverPlaceId, parseKakaoHtml, parseNaverHtml, type PlaceInfo } from './placeInfo';
import { checkPayload, MEMBER_TTL_MS, memberDocUrl, memberFromStatus, RateCounter, TtlCache, type TokenPayload } from './guard';

export interface Env {
  AI: Ai;
  QUOTA: KVNamespace;
  PER_USER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  FIREBASE_PROJECTS: string;
  MODEL: string;
  DAILY_LIMIT: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Max-Age': '86400',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...CORS } });

// ---------- Firebase ID 토큰 확인 ----------
const JWKS = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let jwkCache: { keys: JsonWebKey[]; until: number } | null = null;

async function jwks(): Promise<JsonWebKey[]> {
  if (jwkCache && jwkCache.until > Date.now()) return jwkCache.keys;
  const r = await fetch(JWKS, { cf: { cacheTtl: 3600 } });
  const body = (await r.json()) as { keys: (JsonWebKey & { kid: string })[] };
  const cc = r.headers.get('cache-control') ?? '';
  const max = Number(/max-age=(\d+)/.exec(cc)?.[1] ?? 3600);
  jwkCache = { keys: body.keys, until: Date.now() + Math.min(max, 6 * 3600) * 1000 };
  return body.keys;
}
const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0));

interface Who { uid: string; email: string; project: string }
async function verifyIdToken(token: string, projects: string[]): Promise<Who | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let header: { alg: string; kid: string }, payload: TokenPayload;
  try {
    header = JSON.parse(new TextDecoder().decode(b64url(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
  } catch {
    return null;
  }
  if (header.alg !== 'RS256') return null;
  // 내용 검사(만료·프로젝트·메일 인증)는 guard.ts의 순수 함수 (시험됨)
  const c = checkPayload(payload, projects, Math.floor(Date.now() / 1000));
  if (!c.ok) return null;
  const key = (await jwks()).find((k) => (k as JsonWebKey & { kid?: string }).kid === header.kid);
  if (!key) return null;
  const pub = await crypto.subtle.importKey('jwk', key, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pub, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!ok) return null;
  return { uid: c.uid, email: c.email, project: c.project };
}

// ---------- 우리 공간 멤버인지 ----------
// 사용자 토큰으로 멤버 전용 문서를 읽어 본다: 규칙(firestore.rules `config/access` read: isMember)이 판단하므로 뒷단이 멤버 목록을 알 필요가 없다.
// 실제(borapin)·시험용(borapin-test) 모두 토큰의 프로젝트로 묻는다. 결과는 uid마다 메모리에 (Worker가 바뀌면 비워지는 '아껴 쓰기'용 캐시).
const memberCache = new TtlCache<boolean>(500);
/** true 멤버 · false 아님 · null 지금은 모름(Firestore 장애 등 → 이번 요청만 거절, 캐시 안 함) */
async function isMember(who: Who, token: string): Promise<boolean | null> {
  const key = `${who.project}:${who.uid}`;
  const hit = memberCache.get(key);
  if (hit !== undefined) return hit;
  let status = 0;
  try {
    const r = await fetch(memberDocUrl(who.project), { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) });
    status = r.status;
    await r.body?.cancel().catch(() => undefined); // 내용은 필요 없다 (상태만 본다)
  } catch {
    status = 0; // 연결 실패·시간 초과 → 모름
  }
  const v = memberFromStatus(status);
  if (v === 'unknown') return null;
  memberCache.set(key, v === 'member', v === 'member' ? MEMBER_TTL_MS.member : MEMBER_TTL_MS.denied);
  return v === 'member';
}
// 소식(/news)은 AI 한도와 무관하지만 밖(RSS)을 부르므로 사람마다 분당 20번 (메모리)
const newsRate = new RateCounter(20, 60_000);

// ---------- 모델에 주는 지시 ----------
const TOOLS = `
쓸 수 있는 도구 (이름: 설명 · 인자)
- resolve_place: 지명을 앱의 지역(국내 시·군 또는 나라·도시)으로 맞춘다 · {name}
- place_info: 그 지역의 테마·볼거리·먹거리·특산물·교통 (국내 160곳) · {place}
- best_time: 그 지역에 가기 좋은 달과 이유 (날씨 자료) · {place}
- festivals: 다가오는 축제 (지역 또는 달) · {place?, month?}
- our_trips: 우리가 그 지역에 간 기록 (언제·제목·누구와) · {place?, year?, season?, person?}
- our_places: 우리가 남긴 맛집·카페·명소와 한 줄 평 · {place?, query?}
- our_notes: 여행에 남긴 글 찾기 · {query}
- our_photos: 사진 몇 장·언제 찍었는지·설명 (여행 또는 지역별) · {place?, trip?}
- plans: 여행 일정표(가볼 곳·날짜·시간·예약 정보) · {place?, trip?}
- stats: 우리 여행 통계 (몇 번, 시·군 몇 곳, 나라) · {}
- wishes: 가고 싶은 곳 목록 · {}
- next_trips: 예정된 여행과 D-day · {}
- recommend: 추천 후보 (조건: 달, 테마[바다·산·섬·도시·온천·꽃·단풍·눈·카페·맛집·역사], 안 가본 곳만, 광역) · {month?, themes?, unvisited?, group?, count?}
- packing: 준비물 제안 · {place?, kind?}
`;

const PLAN_SYSTEM = `당신은 부부 여행 기록 앱 '보라핀'의 도우미 보라입니다. 사용자 질문에 답하려면 어떤 도구를 불러야 하는지 정합니다.
${TOOLS}
규칙: 반드시 JSON만 출력합니다: {"calls":[{"tool":"이름","args":{...}}, ...], "note":"짧은 메모"}.
- 질문에 지명이 있으면 먼저 resolve_place를 넣고, 그 지명을 다른 도구의 place 인자에도 그대로 적습니다.
- 우리 기록(갔는지, 언제, 누구와, 뭐 먹었는지, 남긴 글·사진, 또 가고 싶다고 한 곳)이 필요하면 our_trips·our_places·our_notes·our_photos 중 맞는 것을 꼭 넣습니다. "갔을 때", "먹었더라", "남긴", "또 가고 싶다"가 보이면 우리 기록 질문입니다.
- 일반 여행정보면 place_info·best_time·festivals를, 어디 갈지 고르는 질문이면 recommend를 넣습니다. 해외 도시도 place_info가 기본 정보(통화·말·입국·먹을 것·볼 것)를 줍니다.
- 도구는 최대 5개. 정말 아무 자료도 필요 없을 때만 빈 배열.`;

const ANSWER_SYSTEM = `당신은 부부 여행 기록 앱 '보라핀'의 도우미 보라입니다. 다정하고 간결한 한국어 존댓말(해요체)로 답합니다.
아주 중요한 규칙:
- 아래 '사실'에 있는 내용만 씁니다. 사실에 없는 지명·식당·날짜·숫자·축제는 절대 지어내지 않습니다. 사실에 '없음'이라고 적혀 있을 때만 "기록이 없어요"라고 하고, 사실이 아예 비어 있으면 "자료를 못 찾았어요, 다르게 물어봐 주세요"라고 합니다.
- 답은 JSON만: {"text":"한 줄 요약(40자 이내)","lines":["근거나 세부 1","…(최대 6개)"],"buttons":["사실에 있는 action id만"]}
- lines에는 사실에서 가져온 구체 내용을 넣고, 우리 기록과 일반 정보를 구분해 씁니다.
- buttons는 사실 안의 actions 중 id를 골라 최대 4개. 없으면 [].`;

async function runModel(env: Env, system: string, user: string, maxTokens: number, model = env.MODEL): Promise<string> {
  const r = (await env.AI.run(model as never, {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: maxTokens,
    temperature: 0.2,
  } as never)) as { response?: unknown; choices?: { message?: { content?: unknown } }[] };
  // 모델마다 모양이 다르다: 글자 / 객체(JSON) / OpenAI식 choices
  const raw = r.response ?? r.choices?.[0]?.message?.content ?? '';
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object') return JSON.stringify(raw);
  return String(raw ?? '');
}

/** 모델 출력에서 JSON만 꺼낸다 (앞뒤 설명·코드펜스가 붙어도) */
function extractJson(s: string): unknown {
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
async function rss(url: string): Promise<{ status: number; xml: string }> {
  try {
    const r = await fetch(url, { headers: { 'user-agent': BROWSER_UA, 'accept-language': 'ko-KR,ko;q=0.9', accept: 'application/rss+xml, application/xml, text/xml, */*' } });
    return { status: r.status, xml: r.ok ? await r.text() : '' };
  } catch (e) {
    return { status: 0, xml: String(e) };
  }
}
/** 소식 하나: 구글 뉴스 RSS → 비면 빙 뉴스 RSS. 6시간 캐시(빈 결과는 20분) */
async function newsOne(q: string): Promise<{ items: NewsItem[]; debug: string[] }> {
  const cache = caches.default;
  const key = new Request(`https://cache.borapin/news2?q=${encodeURIComponent(q)}`);
  const hit = await cache.match(key);
  if (hit) return (await hit.json()) as { items: NewsItem[]; debug: string[] };
  const g = await rss(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`);
  let items = parseGoogleRss(g.xml);
  const debug: string[] = [`google ${g.status} ${g.xml.length}b ${items.length}`];
  if (!items.length) {
    const b = await rss(`https://www.bing.com/news/search?q=${encodeURIComponent(bingQuery(q))}&format=rss&setlang=ko-KR&cc=KR&mkt=ko-KR`);
    items = parseBingRss(b.xml);
    debug.push(`bing ${b.status} ${b.xml.length}b ${items.length}`);
  }
  const body = { items, debug };
  const res = new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${items.length ? 21600 : 1200}` } });
  await cache.put(key, res);
  return body;
}
/** 소식: ?q=하나 → {items}, ?q=a&q=b… → {lists: {a: items, b: items}} (한 번에 받아 폰의 왕복을 줄인다) */
async function news(qs: string[]): Promise<Response> {
  const got = await Promise.all(qs.map((q) => newsOne(q).catch((e) => ({ items: [] as NewsItem[], debug: [`error ${String(e).slice(0, 80)}`] }))));
  if (qs.length === 1) return json({ items: got[0].items, q: qs[0], debug: got[0].debug });
  return json({ lists: Object.fromEntries(qs.map((q, i) => [q, got[i].items])), debug: Object.fromEntries(qs.map((q, i) => [q, got[i].debug])) });
}

// ---------- 지도 링크 → 장소 정보 (이름·사진·주소·종류·좌표) ----------
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
async function follow(u: URL): Promise<URL> {
  let cur = u;
  for (let i = 0; i < 5; i++) {
    const r = await fetch(cur.toString(), { redirect: 'manual', headers: { 'user-agent': MOBILE_UA } });
    const loc = r.headers.get('location');
    if (r.status < 300 || r.status >= 400 || !loc) return cur;
    const next = allowedUrl(new URL(loc, cur).toString());
    if (!next) return new URL(new URL(loc, cur).toString()); // 허용 밖이면 열지 않고 주소만 본다
    cur = next;
  }
  return cur;
}
async function geocode(addr: string): Promise<{ lat: number; lng: number } | null> {
  // OpenStreetMap Nominatim (키 없음, 초당 1번 이하 · 결과는 7일 캐시)
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kr&accept-language=ko&q=${encodeURIComponent(addr)}`, { headers: { 'user-agent': 'borapin/1.0 (+https://borapin.web.app)' } });
  if (!r.ok) return null;
  const j = (await r.json().catch(() => [])) as { lat: string; lon: string }[];
  const lat = Number(j[0]?.lat), lng = Number(j[0]?.lon);
  return lat && lng ? { lat, lng } : null;
}
async function placeInfo(raw: string, addr: string): Promise<Response> {
  const start = allowedUrl(raw);
  if (!start) return json({ error: 'not allowed' }, 400);
  const cache = caches.default;
  const key = new Request(`https://cache.borapin/place?u=${encodeURIComponent(start.toString())}&a=${encodeURIComponent(addr)}`);
  const hit = await cache.match(key);
  if (hit) return new Response(hit.body, { headers: { ...Object.fromEntries(hit.headers), ...CORS } });
  let info: PlaceInfo = {};
  const steps: string[] = [];
  try {
    const end = await follow(start);
    steps.push(`→ ${end.hostname}${end.pathname}`);
    const c = coordsFromUrl(end.toString());
    const nid = naverPlaceId(end.toString());
    const kid = kakaoPlaceId(end.toString());
    if (nid) {
      info.placeId = nid;
      const r = await fetch(`https://m.place.naver.com/place/${nid}/home`, { headers: { 'user-agent': MOBILE_UA, 'accept-language': 'ko-KR,ko' } });
      steps.push(`naver ${r.status}`);
      if (r.ok) info = { ...parseNaverHtml((await r.text()).slice(0, 600_000)), placeId: nid };
    } else if (kid) {
      info.placeId = kid;
      const r = await fetch(`https://place.map.kakao.com/${kid}`, { headers: { 'user-agent': MOBILE_UA } });
      steps.push(`kakao ${r.status}`);
      if (r.ok) info = { ...parseKakaoHtml((await r.text()).slice(0, 200_000)), placeId: kid };
    }
    if (c && info.lat == null) { info.lat = c.lat; info.lng = c.lng; }
    const where = info.address || addr;
    if (info.lat == null && where) {
      const g = await geocode(where).catch(() => null);
      steps.push(`geocode ${g ? 'ok' : 'none'}`);
      if (g) { info.lat = g.lat; info.lng = g.lng; }
    }
  } catch (e) {
    steps.push(`error ${(e as Error).message}`);
  }
  const res = json({ ...info, steps });
  const found = info.name || info.image || info.lat != null;
  res.headers.set('cache-control', `public, max-age=${found ? 7 * 86400 : 1800}`);
  await cache.put(key, res.clone());
  return res;
}

export default {
  // 어떤 오류가 나도 CORS 머리글이 붙은 JSON으로 답한다 (브라우저가 '막힌 요청'으로 보지 않게)
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      return await handle(req, env);
    } catch (e) {
      return json({ error: 'server', detail: String((e as Error)?.message ?? e).slice(0, 200) }, 500);
    }
  },
};

async function handle(req: Request, env: Env): Promise<Response> {
  {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(req.url);
    if (req.method === 'GET' && url.pathname === '/health') return json({ ok: true, model: env.MODEL });
    const isNews = req.method === 'GET' && url.pathname === '/news';
    const isPlace = req.method === 'GET' && url.pathname === '/place';
    const isGeo = req.method === 'GET' && url.pathname === '/geo';
    if (!isNews && !isPlace && !isGeo && (req.method !== 'POST' || !['/plan', '/answer'].includes(url.pathname))) return json({ error: 'not found' }, 404);

    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const who = token ? await verifyIdToken(token, env.FIREBASE_PROJECTS.split(',').map((s) => s.trim())) : null;
    if (!who) return json({ error: 'unauthorized' }, 401);
    // 로그인했어도 우리 공간 멤버가 아니면(초대 안 된 계정) 아무것도 안 준다 — 모든 길(/plan·/answer·/news·/place·/geo, ?model= 포함)에 적용
    const member = await isMember(who, token);
    if (member === null) return json({ error: 'member check failed' }, 503);
    if (!member) return json({ error: 'not a member' }, 403);

    // 여행 소식: 구글 뉴스 RSS(키 없음)를 6시간 캐시해 지역별 머리기사 5개만 준다 (AI 한도와 무관)
    if (isNews) {
      const nr = newsRate.hit(`${who.project}:${who.uid}`);
      if (!nr.ok) return json({ error: 'too many requests', retry: nr.retryAfter }, 429);
      const qs = [...new Set(url.searchParams.getAll('q').map((q) => q.trim().slice(0, 60)).filter(Boolean))].slice(0, 24);
      if (!qs.length) return json({ error: 'empty' }, 400);
      return news(qs);
    }
    // 동네·주소 → 위경도 (우리 집 정하기). OpenStreetMap Nominatim, 30일 캐시
    if (isGeo) {
      const rl1 = await env.PER_USER.limit({ key: who.uid });
      if (!rl1.success) return json({ error: 'too many requests' }, 429);
      const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
      if (!q) return json({ error: 'empty' }, 400);
      const cache = caches.default;
      const key = new Request(`https://cache.borapin/geo?q=${encodeURIComponent(q)}`);
      const hit = await cache.match(key);
      if (hit) return new Response(hit.body, { headers: { ...Object.fromEntries(hit.headers), ...CORS } });
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kr&accept-language=ko&q=${encodeURIComponent(q)}`, { headers: { 'user-agent': 'borapin/1.0 (+https://borapin.web.app)' } }).catch(() => null);
      const j = r && r.ok ? ((await r.json().catch(() => [])) as { lat: string; lon: string; display_name: string }[]) : [];
      const out = j[0] ? { lat: Number(j[0].lat), lng: Number(j[0].lon), name: j[0].display_name } : {};
      const res = json(out);
      res.headers.set('cache-control', `public, max-age=${j[0] ? 30 * 86400 : 600}`);
      await cache.put(key, res.clone());
      return res;
    }
    if (isPlace) {
      const rl0 = await env.PER_USER.limit({ key: who.uid });
      if (!rl0.success) return json({ error: 'too many requests', retry: 60 }, 429);
      return placeInfo((url.searchParams.get('url') ?? '').slice(0, 300), (url.searchParams.get('addr') ?? '').slice(0, 120));
    }

    // 모델 비교 점검: 시험용 계정만 ?model=로 다른 모델을 써 볼 수 있다 (실제 사용자는 늘 MODEL)
    const want = url.searchParams.get('model') ?? '';
    const model = who.project === 'borapin-test' && /^@cf\/[\w./-]+$/.test(want) ? want : env.MODEL;
    const rl = await env.PER_USER.limit({ key: who.uid });
    if (!rl.success) return json({ error: 'too many requests', retry: 60 }, 429);
    // 하루 한도 (/plan 때만 센다: 질문 하나 = 1)
    if (url.pathname === '/plan') {
      const day = new Date().toISOString().slice(0, 10);
      const key = `q:${who.uid}:${day}`;
      const used = Number((await env.QUOTA.get(key)) ?? 0);
      const limit = Number(env.DAILY_LIMIT) || 80;
      if (used >= limit) return json({ error: 'daily limit', limit }, 429);
      await env.QUOTA.put(key, String(used + 1), { expirationTtl: 2 * 86400 });
    }

    let body: { question?: string; context?: string; facts?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return json({ error: 'bad json' }, 400);
    }
    const question = (body.question ?? '').toString().slice(0, 300);
    if (!question.trim()) return json({ error: 'empty' }, 400);

    try {
      if (url.pathname === '/plan') {
        const user = `${body.context ? `상황: ${body.context.slice(0, 600)}\n` : ''}질문: ${question}`;
        const out = await runModel(env, PLAN_SYSTEM, user, 300, model);
        const plan = extractJson(out) as { calls?: unknown } | null;
        return json({ calls: Array.isArray(plan?.calls) ? plan!.calls.slice(0, 5) : [] });
      }
      const facts = (body.facts ?? '').toString().slice(0, 6000);
      const user = `${body.context ? `상황: ${body.context.slice(0, 600)}\n` : ''}질문: ${question}\n\n사실:\n${facts || '(없음)'}`;
      const out = await runModel(env, ANSWER_SYSTEM, user, 500, model);
      const a = extractJson(out) as { text?: unknown; lines?: unknown; buttons?: unknown } | null;
      if (!a || typeof a.text !== 'string') return json({ error: 'no answer' }, 502);
      return json({
        text: a.text.slice(0, 120),
        lines: Array.isArray(a.lines) ? a.lines.filter((x) => typeof x === 'string').slice(0, 6).map((x) => (x as string).slice(0, 200)) : [],
        buttons: Array.isArray(a.buttons) ? a.buttons.filter((x) => typeof x === 'string').slice(0, 4) : [],
      });
    } catch (e) {
      return json({ error: 'model failed', detail: String((e as Error).message ?? e).slice(0, 200) }, 502);
    }
  }
}

