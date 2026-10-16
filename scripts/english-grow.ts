/**
 * 영어 문장 은행 키우기: Workers AI(무료)로 한 주제 10문장을 만들어 src/data/english.json에 보탠다.
 * - 달에 한 번 GitHub Actions가 돌리고, 결과는 PR로 올린다 (사람이 보고 합친다). 자동으로 main에 들어가지 않는다.
 * - 상한(MAX_ITEMS)을 넘으면 아무것도 하지 않는다. 모델 답이 틀(JSON·영문·한글·단어 1~3개)에 안 맞으면 그 문장은 버린다.
 * - 쓰는 값: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (없으면 조용히 끝)
 */
import fs from 'node:fs';

const MAX_ITEMS = 500;
const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const PATH = 'src/data/english.json';

interface Item { id: string; en: string; ko: string; words: [string, string][] }
interface Topic { id: string; label: string; items: Item[] }
interface Bank { topics: Topic[] }

const TOPIC_POOL: [string, string][] = [
  ['spa', '온천·마사지'], ['market', '시장·노점'], ['bike', '자전거·스쿠터'], ['ferry', '배·섬'], ['winter', '눈·스키'],
  ['festival', '축제·공연'], ['wine', '와인·술'], ['bakery', '빵집·디저트'], ['night', '야경·밤 산책'], ['pack', '짐·세탁·분실물'],
  ['neighbors', '이웃·현지 사람과'], ['home', '숙소 문제 말하기'], ['walk', '동네 산책'], ['camera', '카메라·사진 부탁'], ['return', '돌아가는 날'],
];

async function main() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) { console.log('Cloudflare 값이 없어 건너뜀'); return; }
  const bank = JSON.parse(fs.readFileSync(PATH, 'utf8')) as Bank;
  const total = bank.topics.reduce((n, t) => n + t.items.length, 0);
  if (total >= MAX_ITEMS) { console.log(`이미 ${total}문장 (상한 ${MAX_ITEMS}) — 보태지 않음`); return; }
  const have = new Set(bank.topics.map((t) => t.id));
  const next = TOPIC_POOL.find(([id]) => !have.has(id));
  if (!next) { console.log('새 주제가 없어요 — TOPIC_POOL을 늘리세요'); return; }
  const [tid, label] = next;
  const existing = new Set(bank.topics.flatMap((t) => t.items.map((i) => i.en.toLowerCase())));

  const prompt = `You write short, natural travel English for a Korean couple in their 40s-50s. Topic: "${label}".
Return ONLY a JSON array of 12 objects: {"en": English sentence (5-12 words, everyday polite spoken English, no slang), "ko": natural Korean translation (존댓말 or 반말 as fits), "words": [[english word or phrase, Korean meaning], ...] with 1-3 entries picking the most useful vocabulary from the sentence}.
No numbering, no markdown, no duplicates, no sentences about prices in numbers.`;
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 1500, temperature: 0.6 }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { result?: { response?: unknown } };
  const raw = typeof j.result?.response === 'string' ? j.result.response : JSON.stringify(j.result?.response ?? '');
  const m = raw.match(/\[[\s\S]*\]/);
  if (!m) throw new Error('JSON 배열을 못 찾음: ' + raw.slice(0, 200));
  const arr = JSON.parse(m[0]) as { en?: unknown; ko?: unknown; words?: unknown }[];
  const items: Item[] = [];
  for (const x of arr) {
    const en = typeof x.en === 'string' ? x.en.trim() : '';
    const ko = typeof x.ko === 'string' ? x.ko.trim() : '';
    const words = Array.isArray(x.words) ? (x.words as unknown[]).filter((w): w is [string, string] => Array.isArray(w) && w.length === 2 && typeof w[0] === 'string' && typeof w[1] === 'string').slice(0, 3) : [];
    const okEn = /^[A-Za-z][A-Za-z0-9 ,.'’!?-]{10,90}$/.test(en) && en.split(' ').length <= 14;
    const okKo = /[가-힣]/.test(ko) && ko.length <= 60 && !/[A-Za-z]{4,}/.test(ko);
    const okWords = words.length >= 1 && words.every(([w, k]) => /^[A-Za-z][A-Za-z '’-]{0,30}$/.test(w) && /[가-힣]/.test(k) && en.toLowerCase().includes(w.toLowerCase().split(' ')[0]));
    if (okEn && okKo && okWords && !existing.has(en.toLowerCase()) && !/\d/.test(en)) { items.push({ id: `${tid}${items.length + 1}`, en, ko, words }); existing.add(en.toLowerCase()); }
    if (items.length >= 10) break;
  }
  if (items.length < 8) throw new Error(`쓸 만한 문장이 ${items.length}개뿐 — 이번 달은 건너뜀`);
  bank.topics.push({ id: tid, label, items });
  fs.writeFileSync(PATH, JSON.stringify(bank, null, 1) + '\n');
  console.log(`주제 '${label}' ${items.length}문장 보탬 → ${total + items.length}문장`);
  for (const i of items) console.log(`- ${i.en} / ${i.ko} / ${i.words.map((w) => w.join('=')).join(', ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
