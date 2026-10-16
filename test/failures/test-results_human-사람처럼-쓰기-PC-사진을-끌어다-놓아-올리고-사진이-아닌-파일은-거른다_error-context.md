# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다
- Location: tests/human.spec.ts:205:3

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

```
Error: pageerror: Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "pageerror: Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.",
+ ]
```

# Page snapshot

```yaml
- iframe [aria-hidden] [ref=e3]
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
  9   | import { test, expect, type Browser, type Page } from '@playwright/test';
  10  | import fs from 'node:fs';
  11  | 
  12  | const OWNER = 'ysangyn@gmail.com';
  13  | 
  14  | const problems: string[] = [];
  15  | function watch(page: Page) {
  16  |   page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  17  |   page.on('console', (m) => {
  18  |     if (m.type() === 'error' && !/permission|insufficient/i.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  19  |   });
  20  |   page.on('response', (r) => {
  21  |     if (r.status() === 404 || r.status() >= 500) problems.push(`${r.status()}: ${r.url().slice(0, 160)}`);
  22  |   });
  23  |   return page;
  24  | }
  25  | test.afterEach(() => {
  26  |   const p = problems.splice(0);
> 27  |   expect(p, p.join('\n')).toEqual([]);
      |                           ^ Error: pageerror: Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
  28  | });
  29  | 
  30  | async function phone(browser: Browser, width = 375, height = 667) {
  31  |   const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  32  |   return watch(await ctx.newPage());
  33  | }
  34  | async function desktop(browser: Browser) {
  35  |   const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  36  |   return watch(await ctx.newPage());
  37  | }
  38  | 
  39  | /** 빠른 로그인 (구글 창 시험이 아닌 곳에서) */
  40  | async function signIn(page: Page, email = OWNER) {
  41  |   await page.goto('/');
  42  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  43  |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  44  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  45  | }
  46  | 
  47  | /** 구글 로그인: 버튼 → (에뮬레이터의) 구글 계정 창 → 계정 고르기 */
  48  | async function googleSignIn(page: Page, email = OWNER, name = '영상') {
  49  |   await page.goto('/');
  50  |   const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByTestId('login').click()]);
  51  |   await popup.waitForLoadState();
  52  |   const existing = popup.locator('#accounts-list').getByText(email);
  53  |   if (await existing.count()) {
  54  |     await existing.first().click();
  55  |   } else {
  56  |     await popup.locator('#add-account-button').click();
  57  |     await popup.locator('#email-input').fill(email);
  58  |     await popup.locator('#display-name-input').fill(name);
  59  |     await popup.locator('#sign-in').click();
  60  |   }
  61  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  62  | }
  63  | 
  64  | /** IME로 한글을 조합하는 중 (아직 확정 전) */
  65  | async function composeKorean(page: Page, steps: string[]) {
  66  |   const cdp = await page.context().newCDPSession(page);
  67  |   for (const t of steps) await cdp.send('Input.imeSetComposition', { text: t, selectionStart: t.length, selectionEnd: t.length });
  68  |   return {
  69  |     commit: (text: string) => cdp.send('Input.insertText', { text }),
  70  |   };
  71  | }
  72  | 
  73  | /** 지도 위 경도·위도 지점을 누른다 */
  74  | async function tapLngLat(page: Page, lng: number, lat: number) {
  75  |   const project = () => page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  76  |   const box = await page.getByTestId('map').first().boundingBox();
  77  |   if (!box) throw new Error('지도가 없어요');
  78  |   let pt = await project();
  79  |   // 홈 지도는 최근 핀 둘레만 보여 주므로, 누를 곳이 화면 밖이면 사람처럼 '전체 보기'를 먼저 누른다
  80  |   if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) {
  81  |     await page.getByRole('button', { name: '전체 보기' }).click();
  82  |     await page.waitForFunction(() => (window as unknown as { __map: { isMoving: () => boolean } }).__map.isMoving() === false);
  83  |     await page.waitForTimeout(150);
  84  |     pt = await project();
  85  |   }
  86  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  87  | }
  88  | 
  89  | /** 화면 폭을 넘어 삐져나간 요소 (가로 스크롤 상자 안은 제외) */
  90  | function overflowing(page: Page) {
  91  |   return page.evaluate(() => {
  92  |     const vw = document.documentElement.clientWidth;
  93  |     const scrollsX = (el: Element) => {
  94  |       for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  95  |         const s = getComputedStyle(p);
  96  |         if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
  97  |       }
  98  |       return false;
  99  |     };
  100 |     const bad: string[] = [];
  101 |     for (const el of document.querySelectorAll('body *')) {
  102 |       const r = el.getBoundingClientRect();
  103 |       if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
  104 |       if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
  105 |         bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  106 |       }
  107 |     }
  108 |     return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  109 |   });
  110 | }
  111 | 
  112 | test.describe('사람처럼 쓰기', () => {
  113 |   test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
  114 |     const page = await phone(browser);
  115 |     await googleSignIn(page);
  116 |     await page.reload();
  117 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  118 |     await expect(page.getByTestId('login')).toHaveCount(0);
  119 |     await page.context().close();
  120 |   });
  121 | 
  122 |   test('375px: 손으로 입력해 기록하고, 새로 고침해도 남아 있다', async ({ browser }) => {
  123 |     const page = await phone(browser);
  124 |     await googleSignIn(page);
  125 |     await page.getByRole('link', { name: '기록하기' }).click();
  126 |     // 장소: 한 글자씩 쳐서 찾기
  127 |     await page.getByLabel('어디 검색').click();
```