# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 폰에서 홈 지도는 한 손가락으로 끌면 움직인다 (두 손가락 안내 없이)
- Location: tests/human.spec.ts:493:3

# Error details

```
Error: 404: http://127.0.0.1:5174/data/abroad.json
console: Failed to load resource: the server responded with a status of 404 (Not Found)

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "404: http://127.0.0.1:5174/data/abroad.json",
+   "console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+ ]
```

# Test source

```ts
  1   | /**
  2   |  * 사람이 쓰는 그대로 시험한다 (에뮬레이터 + 실제 firestore.rules)
  3   |  * - 구글 로그인 창을 실제로 거쳐 들어오기
  4   |  * - 한글 입력 중 Enter (IME 조합 중에는 저장하지 않기)
  5   |  * - PC에서 사진 끌어다 놓기
  6   |  * - 375px 휴대폰 화면에서 옆으로 넘치지 않기, 로그인 그림이 문구를 가리지 않기
  7   |  * - 새로 고침해도 기록이 남아 있기
  8   |  */
  9   | import { test, expect, devices, type Browser, type Page } from '@playwright/test';
  10  | import fs from 'node:fs';
  11  | 
  12  | const OWNER = 'ysangyn@gmail.com';
  13  | const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
  14  | 
  15  | // 아이폰 사파리 흉내(webkit 프로젝트, @webkit 표시가 있는 시험만)는 앞선 chromium 시험들이 남긴 기록에 기대지 않게 빈 DB에서 시작한다
  16  | test.beforeAll(async ({ browserName }) => {
  17  |   if (browserName !== 'webkit') return;
  18  |   await fetch(`http://${FIRESTORE_HOST}/emulator/v1/projects/demo-borapin/databases/(default)/documents`, { method: 'DELETE' });
  19  | });
  20  | 
  21  | const problems: string[] = [];
  22  | function watch(page: Page) {
  23  |   page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  24  |   page.on('console', (m) => {
  25  |     if (m.type() === 'error' && !/permission|insufficient/i.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  26  |   });
  27  |   page.on('response', (r) => {
  28  |     if (r.status() === 404 || r.status() >= 500) problems.push(`${r.status()}: ${r.url().slice(0, 160)}`);
  29  |   });
  30  |   return page;
  31  | }
  32  | test.afterEach(() => {
  33  |   const p = problems.splice(0);
> 34  |   expect(p, p.join('\n')).toEqual([]);
      |                           ^ Error: 404: http://127.0.0.1:5174/data/abroad.json
  35  | });
  36  | 
  37  | async function phone(browser: Browser, width = 375, height = 667) {
  38  |   // webkit이면 아이폰 사파리처럼 보이게 (UA): 앱의 iOS 분기(소리 안내 등)도 같이 지난다
  39  |   const webkit = browser.browserType().name() === 'webkit';
  40  |   const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block', ...(webkit ? { userAgent: devices['iPhone 13'].userAgent } : {}) });
  41  |   return watch(await ctx.newPage());
  42  | }
  43  | async function desktop(browser: Browser) {
  44  |   const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  45  |   return watch(await ctx.newPage());
  46  | }
  47  | 
  48  | /** 빠른 로그인 (구글 창 시험이 아닌 곳에서) */
  49  | async function signIn(page: Page, email = OWNER) {
  50  |   await page.goto('/');
  51  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  52  |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  53  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  54  | }
  55  | 
  56  | /** 구글 로그인: 버튼 → (에뮬레이터의) 구글 계정 창 → 계정 고르기 */
  57  | async function googleSignIn(page: Page, email = OWNER, name = '영상') {
  58  |   await page.goto('/');
  59  |   const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByTestId('login').click()]);
  60  |   await popup.waitForLoadState();
  61  |   const existing = popup.locator('#accounts-list').getByText(email);
  62  |   if (await existing.count()) {
  63  |     await existing.first().click();
  64  |   } else {
  65  |     await popup.locator('#add-account-button').click();
  66  |     await popup.locator('#email-input').fill(email);
  67  |     await popup.locator('#display-name-input').fill(name);
  68  |     await popup.locator('#sign-in').click();
  69  |   }
  70  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  71  | }
  72  | 
  73  | /** IME로 한글을 조합하는 중 (아직 확정 전) */
  74  | async function composeKorean(page: Page, steps: string[]) {
  75  |   const cdp = await page.context().newCDPSession(page);
  76  |   for (const t of steps) await cdp.send('Input.imeSetComposition', { text: t, selectionStart: t.length, selectionEnd: t.length });
  77  |   return {
  78  |     commit: (text: string) => cdp.send('Input.insertText', { text }),
  79  |   };
  80  | }
  81  | 
  82  | /** 지도 위 경도·위도 지점을 누른다 */
  83  | async function tapLngLat(page: Page, lng: number, lat: number) {
  84  |   const project = () => page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  85  |   const box = await page.getByTestId('map').first().boundingBox();
  86  |   if (!box) throw new Error('지도가 없어요');
  87  |   let pt = await project();
  88  |   // 홈 지도는 최근 핀 둘레만 보여 주므로, 누를 곳이 화면 밖이면 사람처럼 '전체 보기'를 먼저 누른다
  89  |   if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) {
  90  |     await page.getByRole('button', { name: '전체 보기' }).click();
  91  |     await page.waitForFunction(() => (window as unknown as { __map: { isMoving: () => boolean } }).__map.isMoving() === false);
  92  |     await page.waitForTimeout(150);
  93  |     pt = await project();
  94  |   }
  95  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  96  | }
  97  | 
  98  | /** 화면 폭을 넘어 삐져나간 요소 (가로 스크롤 상자 안은 제외) */
  99  | function overflowing(page: Page) {
  100 |   return page.evaluate(() => {
  101 |     const vw = document.documentElement.clientWidth;
  102 |     const scrollsX = (el: Element) => {
  103 |       for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  104 |         const s = getComputedStyle(p);
  105 |         if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
  106 |       }
  107 |       return false;
  108 |     };
  109 |     const bad: string[] = [];
  110 |     for (const el of document.querySelectorAll('body *')) {
  111 |       const r = el.getBoundingClientRect();
  112 |       if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
  113 |       if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
  114 |         bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  115 |       }
  116 |     }
  117 |     return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  118 |   });
  119 | }
  120 | 
  121 | test.describe('사람처럼 쓰기', () => {
  122 |   test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
  123 |     const page = await phone(browser);
  124 |     await googleSignIn(page);
  125 |     await page.reload();
  126 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  127 |     await expect(page.getByTestId('login')).toHaveCount(0);
  128 |     await page.context().close();
  129 |   });
  130 | 
  131 |   test('로그인 화면에서 이용약관 링크를 눌러 열고 로고로 돌아와도 화면이 살아 있다', async ({ browser }) => {
  132 |     // 약관 화면은 로그인 없이 보는 길(early return)이라, 앱 안에서 오갈 때 훅 개수가 달라지면 흰 화면이 됐다
  133 |     const page = await phone(browser);
  134 |     await page.goto('/');
```