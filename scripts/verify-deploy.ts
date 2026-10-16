/**
 * 배포 확인: 실제 주소(또는 미리보기 주소)에 방금 만든 빌드가 그대로 올라갔는지
 *
 *   npx tsx scripts/verify-deploy.ts https://borapin.web.app abc1234
 *
 * 1. /version.json의 커밋 번호가 이번 커밋과 같은지 (CDN이 늦을 수 있어 최대 3분 기다림)
 * 2. index.html의 버전 표시가 같은지, index.html·sw.js는 캐시하지 않게 내려오는지
 * 3. index.html이 부르는 JS·CSS 파일, 서비스 워커가 미리 저장하는 파일이 모두 있는지
 *    (없는 파일은 호스팅이 index.html로 대신 돌려주므로 200이어도 HTML이면 '빠진 파일'로 본다)
 */
export {};
const [base0, commit] = process.argv.slice(2);
if (!base0 || !commit) {
  console.error('사용: tsx scripts/verify-deploy.ts <주소> <커밋 7자리>');
  process.exit(2);
}
const base = base0.replace(/\/$/, '');
const errors: string[] = [];
const bust = () => `ts=${Date.now()}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(path: string) {
  const url = path.startsWith('http') ? path : `${base}/${path.replace(/^\//, '')}`;
  for (let i = 0; i < 3; i++) {
    try {
      return await fetch(url, { headers: { 'cache-control': 'no-cache' }, redirect: 'follow' });
    } catch (e) {
      if (i === 2) throw e;
      await sleep(2000);
    }
  }
  throw new Error('unreachable');
}

// 1. 버전
let live = '';
for (let i = 0; i < 18; i++) {
  const r = await get(`/version.json?${bust()}`);
  const type = r.headers.get('content-type') ?? '';
  if (r.ok && type.includes('json')) {
    live = ((await r.json()) as { commit?: string }).commit ?? '';
    if (live === commit) break;
  }
  console.log(`  버전 기다리는 중… 지금 ${live || '(없음)'}, 기대 ${commit}`);
  await sleep(10_000);
}
if (live !== commit) errors.push(`version.json 커밋이 ${live || '없음'} (기대 ${commit})`);
else console.log(`✓ version.json 커밋 ${live}`);

// 2. index.html
const idx = await get(`/?${bust()}`);
const html = await idx.text();
const meta = html.match(/<meta name="borapin-version" content="([^"]+)"/)?.[1] ?? '';
if (!meta.endsWith(`+${commit}`)) errors.push(`index.html 버전 표시가 ${meta || '없음'} (기대 …+${commit})`);
else console.log(`✓ index.html 버전 ${meta}`);
const noCache = (h: Headers) => /no-cache|no-store|max-age=0/.test(h.get('cache-control') ?? '');
const idxFile = await get('/index.html');
if (!noCache(idxFile.headers)) errors.push(`index.html이 캐시돼요 (cache-control: ${idxFile.headers.get('cache-control')})`);

// 3. 파일
const isHtml = (r: Response) => (r.headers.get('content-type') ?? '').includes('text/html');
const want = new Set<string>();
for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) want.add(m[1]);
const sw = await get('/sw.js');
if (!sw.ok || isHtml(sw)) errors.push('sw.js가 없어요');
else {
  if (!noCache(sw.headers)) errors.push(`sw.js가 캐시돼요 (cache-control: ${sw.headers.get('cache-control')})`);
  const body = await sw.text();
  for (const m of body.matchAll(/url:"([^"]+)"/g)) want.add('/' + m[1].replace(/^\//, ''));
  for (const m of body.matchAll(/importScripts\("([^"]+)"\)/g)) want.add('/' + m[1].replace(/^\.?\//, ''));
}
let checked = 0;
await Promise.all(
  [...want].map(async (p) => {
    const r = await get(p);
    checked++;
    const html = isHtml(r);
    const expectHtml = /\.html$/.test(p) || p === '/';
    if (!r.ok) errors.push(`${p}: ${r.status}`);
    else if (html && !expectHtml) errors.push(`${p}: 파일이 빠져서 index.html이 대신 왔어요`);
    else if (/\/assets\/.+\.(js|mjs)$/.test(p) && !/javascript/.test(r.headers.get('content-type') ?? '')) errors.push(`${p}: 자바스크립트가 아니에요 (${r.headers.get('content-type')})`);
    else if (/\/assets\//.test(p) && !/immutable/.test(r.headers.get('cache-control') ?? '')) errors.push(`${p}: 오래 캐시되지 않아요`);
  }),
);
console.log(`✓ 파일 ${checked}개 확인 (index.html이 부르는 파일 + 서비스 워커가 미리 저장하는 파일)`);

if (errors.length) {
  console.error(`\n✗ 배포 확인 실패 (${base})\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`\n배포 확인 통과: ${base} = ${commit}`);
