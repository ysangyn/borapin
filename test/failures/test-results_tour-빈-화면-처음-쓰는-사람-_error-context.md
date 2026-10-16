# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 빈 화면 (처음 쓰는 사람)
- Location: tests/tour.spec.ts:70:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('navigation', { name: '주 메뉴' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('navigation', { name: '주 메뉴' }) with timeout 20000ms
  - waiting for getByRole('navigation', { name: '주 메뉴' })

```

# Page snapshot

```yaml
- iframe [aria-hidden] [ref=f2e3]
```

# Test source

```ts
  1   | /**
  2   |  * 화면 둘러보기: 빈 상태 → 실제처럼 채운 상태를 휴대폰·PC로 모두 찍어 둔다.
  3   |  * (기능 점검은 app.spec.ts가 하고, 이 파일은 디자인 검수용 사진을 만든다.)
  4   |  */
  5   | import { test, expect, type Browser, type Page } from '@playwright/test';
  6   | import fs from 'node:fs';
  7   | import path from 'node:path';
  8   | import { initializeApp, getApps } from 'firebase-admin/app';
  9   | import { getFirestore, Timestamp } from 'firebase-admin/firestore';
  10  | 
  11  | const OWNER = 'ysangyn@gmail.com';
  12  | const BORA = 'bora.test@gmail.com';
  13  | const OUT = 'test-results/tour';
  14  | fs.mkdirSync(OUT, { recursive: true });
  15  | 
  16  | test.describe.configure({ mode: 'serial' });
  17  | 
  18  | const HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
  19  | const app = getApps()[0] ?? initializeApp({ projectId: 'demo-borapin' });
  20  | const db = getFirestore(app);
  21  | const sp = db.collection('spaces').doc('main');
  22  | 
  23  | const problems: string[] = [];
  24  | function watch(page: Page, label: string) {
  25  |   page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${e.message}`));
  26  |   page.on('console', (m) => {
  27  |     if (m.type() === 'error' && !/permission|insufficient/i.test(m.text())) problems.push(`[${label}] console: ${m.text().slice(0, 200)}`);
  28  |   });
  29  | }
  30  | 
  31  | async function signIn(page: Page, email = OWNER, name = '테스트') {
  32  |   await page.goto('/');
  33  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  34  |   await page.evaluate(([e, n]) => (window as unknown as { __testSignIn: (e: string, n: string) => Promise<void> }).__testSignIn(e, n), [email, name]);
> 35  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  36  | }
  37  | 
  38  | // Firestore가 연결을 계속 열어 두므로 networkidle은 쓰지 않는다
  39  | async function settle(page: Page) {
  40  |   await page.waitForLoadState('load').catch(() => undefined);
  41  |   await page.waitForTimeout(1200);
  42  | }
  43  | 
  44  | async function snap(page: Page, name: string, full = true) {
  45  |   await settle(page);
  46  |   await page.screenshot({ path: path.join(OUT, `${name}.jpg`), fullPage: full, type: 'jpeg', quality: 82 });
  47  | }
  48  | 
  49  | async function mobile(browser: Browser) {
  50  |   const ctx = await browser.newContext({
  51  |     viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true,
  52  |     locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block',
  53  |   });
  54  |   const page = await ctx.newPage();
  55  |   watch(page, 'mobile');
  56  |   return page;
  57  | }
  58  | async function desktop(browser: Browser) {
  59  |   const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  60  |   const page = await ctx.newPage();
  61  |   watch(page, 'desktop');
  62  |   return page;
  63  | }
  64  | 
  65  | test.beforeAll(async () => {
  66  |   // 앞선 점검이 남긴 기록을 모두 비운다
  67  |   await fetch(`http://${HOST}/emulator/v1/projects/demo-borapin/databases/(default)/documents`, { method: 'DELETE' });
  68  | });
  69  | 
  70  | test('빈 화면 (처음 쓰는 사람)', async ({ browser }) => {
  71  |   test.setTimeout(300_000);
  72  |   const page = await mobile(browser);
  73  |   // 로그인 화면 (구름 영상이 움직이기 시작한 뒤)
  74  |   await page.goto('/');
  75  |   await expect(page.getByTestId('email-form')).toBeVisible({ timeout: 20_000 });
  76  |   await page.waitForTimeout(2500);
  77  |   await snap(page, 'e00-login', false);
  78  |   await signIn(page);
  79  |   await snap(page, 'e01-home', false);
  80  |   for (const [route, name] of [['/trips', 'e02-trips'], ['/wishes', 'e03-wishes'], ['/places', 'e04-places'], ['/memories', 'e05-memories'], ['/map', 'e06-map'], ['/ask', 'e07-ask'], ['/space', 'e08-space'], ['/record', 'e09-record']] as const) {
  81  |     await page.goto(route);
  82  |     await snap(page, name, route !== '/map');
  83  |   }
  84  |   await page.context().close();
  85  | });
  86  | 
  87  | // ---------- 실제처럼 채우기 ----------
  88  | const by = { uid: 'owner', email: OWNER, name: '영상' };
  89  | const byB = { uid: 'bora', email: BORA, name: '보라' };
  90  | const ts = (s: string) => Timestamp.fromDate(new Date(s));
  91  | 
  92  | const TRIPS = [
  93  |   { id: 't1', title: '강릉 바다 여행', kind: 'trip', status: 'done', when: { p: 'day', y: 2024, m: 5, d: 3, d2: 5 }, places: [{ t: 'kr', code: '51150' }, { t: 'kr', code: '51830' }], companions: [], memo: '경포 바다 보며 커피, 초당 순두부. 둘째 날은 비가 와서 카페 투어.', tags: ['바다', '카페'] },
  94  |   { id: 't2', title: '제주 한 바퀴', kind: 'trip', status: 'done', when: { p: 'day', y: 2023, m: 10, d: 12, d2: 15 }, places: [{ t: 'kr', code: '50' }], companions: [], memo: '오름 세 개, 해녀의 집 전복죽.', tags: ['섬'] },
  95  |   { id: 't3', title: '경주 벚꽃', kind: 'trip', status: 'done', when: { p: 'month', y: 2023, m: 4 }, places: [{ t: 'kr', code: '47130' }], companions: [], memo: '', tags: [] },
  96  |   { id: 't4', title: '여수 밤바다', kind: 'trip', status: 'done', when: { p: 'season', y: 2022, s: 'summer' }, places: [{ t: 'kr', code: '46130' }], companions: ['보라 동생'], memo: '낭만포차', tags: ['야경'] },
  97  |   { id: 't5', title: '부산 먹방', kind: 'trip', status: 'done', when: { p: 'day', y: 2025, m: 2, d: 14, d2: 16 }, places: [{ t: 'kr', code: '26' }], companions: [], memo: '돼지국밥, 밀면, 씨앗호떡', tags: ['맛집'] },
  98  |   { id: 't6', title: '전주 한옥마을', kind: 'outing', status: 'done', when: { p: 'year', y: 2021 }, places: [{ t: 'kr', code: '52' }], companions: [], memo: '', tags: [] },
  99  |   { id: 't7', title: '가평 캠핑', kind: 'outing', status: 'done', when: { p: 'day', y: 2025, m: 9, d: 20 }, places: [{ t: 'kr', code: '41820' }], companions: ['회사 동기들'], memo: '', tags: ['캠핑'] },
  100 |   { id: 't8', title: '도쿄 첫 해외여행', kind: 'trip', status: 'done', when: { p: 'day', y: 2024, m: 11, d: 21, d2: 24 }, places: [{ t: 'country', id: 'JPN', city: '도쿄' }], companions: [], memo: '시부야, 츠키지 시장, 디즈니씨', tags: ['해외'] },
  101 |   { id: 't9', title: '다낭 휴양', kind: 'trip', status: 'done', when: { p: 'month', y: 2025, m: 7 }, places: [{ t: 'country', id: 'VNM', city: '다낭' }], companions: [], memo: '', tags: ['휴양'] },
  102 |   { id: 't10', title: '파리 · 로마', kind: 'trip', status: 'done', when: { p: 'day', y: 2019, m: 9, d: 2, d2: 10 }, places: [{ t: 'country', id: 'FRA', city: '파리' }, { t: 'country', id: 'ITA', city: '로마' }], companions: [], memo: '신혼여행', tags: ['해외'] },
  103 |   { id: 't11', title: '통영 · 남해 드라이브', kind: 'trip', status: 'planned', when: { p: 'day', y: 2026, m: 11, d: 7, d2: 9 }, places: [{ t: 'kr', code: '48220' }, { t: 'kr', code: '48840' }], companions: [], memo: '', tags: [], packing: [{ t: '여권 말고 신분증', who: null, done: true }, { t: '충전기', who: '영상', done: false }, { t: '선크림', who: '보라', done: false }] },
  104 |   { id: 't12', title: '타이베이 겨울', kind: 'trip', status: 'planned', when: { p: 'month', y: 2027, m: 1 }, places: [{ t: 'country', id: 'TWN', city: '타이베이' }], companions: [], memo: '', tags: [] },
  105 |   { id: 't13', title: '속초 당일치기', kind: 'outing', status: 'done', when: { p: 'unknown' }, places: [{ t: 'kr', code: '51210' }], companions: [], memo: '', tags: [] },
  106 | ];
  107 | const WISHES = [
  108 |   { id: 'w1', place: { t: 'kr', code: '47170' }, spotName: '하회마을', wantedBy: ['보라', '영상'], priority: 1, spots: ['하회마을', '월영교'], todos: [], foods: ['안동찜닭'], note: '' },
  109 |   { id: 'w2', place: { t: 'kr', code: '44825' }, wantedBy: ['보라'], priority: 2, spots: ['꽃지 해변'], todos: ['일몰 보기'], foods: [], note: '' },
  110 |   { id: 'w3', place: { t: 'country', id: 'ESP', city: '바르셀로나' }, wantedBy: ['영상'], priority: 1, spots: ['사그라다 파밀리아'], todos: [], foods: ['빠에야'], note: '결혼 10주년에' },
  111 |   { id: 'w4', place: { t: 'kr', code: '51110' }, wantedBy: ['보라', '영상'], priority: null, spots: [], todos: [], foods: ['닭갈비'], note: '' },
  112 |   { id: 'w5', place: { t: 'country', id: 'AUS', city: '시드니' }, wantedBy: [], priority: 3, spots: [], todos: [], foods: [], note: '' },
  113 | ];
  114 | const RECS = [
  115 |   { id: 'r1', name: '초당할머니순두부', kind: 'food', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: { 영상: '아침으로 최고', 보라: '짬뽕순두부가 더 맛있었어' }, verdict: 'again', address: '강원 강릉시 초당순두부길 77' },
  116 |   { id: 'r2', name: '보헤미안 박이추 커피', kind: 'cafe', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: { 보라: '바다 뷰' }, verdict: 'again' },
  117 |   { id: 'r3', name: '해녀의 집', kind: 'food', region: { t: 'kr', code: '50' }, tripId: 't2', reviews: { 영상: '전복죽' }, verdict: 'once' },
  118 |   { id: 'r4', name: '감천문화마을', kind: 'sight', region: { t: 'kr', code: '26' }, tripId: 't5', reviews: {}, verdict: 'once' },
  119 |   { id: 'r5', name: '이치란 시부야', kind: 'food', region: { t: 'country', id: 'JPN', city: '도쿄' }, tripId: 't8', reviews: { 영상: '줄이 길다' }, verdict: 'meh' },
  120 |   { id: 'r6', name: '한옥스테이 소담', kind: 'stay', region: { t: 'kr', code: '52' }, tripId: 't6', reviews: {}, verdict: null },
  121 | ];
  122 | 
  123 | /** 그럴듯한 풍경 사진(하늘·해·산·바다)을 브라우저 캔버스로 만든다 */
  124 | async function makePhotos(page: Page, n: number): Promise<{ l: string; t: string; w: number; h: number }[]> {
  125 |   return page.evaluate(async (count) => {
  126 |     const palettes = [
  127 |       ['#8ec5fc', '#e0c3fc', '#5b7bd5', '#2f4a8a'], ['#fbd3a6', '#f7a07a', '#c96b5a', '#5a3d5c'], ['#a1e3d8', '#d8f3ec', '#3c9d8f', '#1f5c63'],
  128 |       ['#ffd194', '#ff9a8b', '#7b5ea7', '#3a2c5f'], ['#c2e9fb', '#a1c4fd', '#4f86c6', '#24476b'], ['#f6d365', '#fda085', '#b55d4c', '#4b2e39'],
  129 |     ];
  130 |     const enc = (c: HTMLCanvasElement, q: number) => c.toDataURL('image/jpeg', q).split(',')[1];
  131 |     const out = [];
  132 |     for (let i = 0; i < count; i++) {
  133 |       const [a, b, c, d] = palettes[i % palettes.length];
  134 |       const portrait = i % 4 === 3;
  135 |       const w = portrait ? 1200 : 1600, h = portrait ? 1600 : 1200;
```