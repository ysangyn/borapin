# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 어느 화면도 옆으로 넘치지 않는다
- Location: tests/human.spec.ts:313:3

# Error details

```
Error: page.goto: Frame load interrupted
Call log:
  - navigating to "http://127.0.0.1:5174/", waiting until "load"

```

```
Error: console: Error: Worker failed to load. Check that the worker URL is correct.
console: Error: Worker failed to load. Check that the worker URL is correct.
console: Error: Worker failed to load. Check that the worker URL is correct.
console: Error: Worker failed to load. Check that the worker URL is correct.

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 6

- Array []
+ Array [
+   "console: Error: Worker failed to load. Check that the worker URL is correct.",
+   "console: Error: Worker failed to load. Check that the worker URL is correct.",
+   "console: Error: Worker failed to load. Check that the worker URL is correct.",
+   "console: Error: Worker failed to load. Check that the worker URL is correct.",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e3]:
      - generic [ref=f4e4]:
        - generic [ref=f4e5]:
          - img "보라핀 로고" [ref=f4e6]
          - text: 보라핀
        - link "우리 공간" [ref=f4e10]:
          - /url: /space
          - generic "영상" [ref=f4e11]: 영
      - generic [ref=f4e13]:
        - generic [ref=f4e14]: 영상의 지도
        - generic [ref=f4e19]:
          - generic [ref=f4e20]:
            - tablist [ref=f4e21]:
              - tab "국내" [selected] [ref=f4e22] [cursor=pointer]
              - tab "세계" [ref=f4e23] [cursor=pointer]
            - link "지도 크게 보기" [ref=f4e24]:
              - /url: /map
          - generic [ref=f4e26]: 지역을 누르면 핀 꽂기 단추가 나와요전체 보기 단추를 누르면 전국이 보여요
        - textbox "물어보기" [ref=f4e28]:
          - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
        - generic [ref=f4e30]:
          - heading "최근에 남긴 기록" [level=2] [ref=f4e31]
          - link "전체 보기" [ref=f4e32]:
            - /url: /trips
      - navigation "주 메뉴" [ref=f4e33]:
        - link "홈" [ref=f4e34]:
          - /url: /
        - link "여행" [ref=f4e37]:
          - /url: /trips
        - button "남기기" [ref=f4e40] [cursor=pointer]
        - link "지도" [ref=f4e43]:
          - /url: /map
        - link [ref=f4e46]:
          - /url: /feed
      - link "물어보기" [ref=f4e50]:
        - /url: /ask
        - generic [aria-hidden] [ref=f4e51]: 물어봐요
    - status
  - iframe [aria-hidden] [ref=f4e52]
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
  23  |   // 사파리는 화면을 옮기며 끊긴 요청(에뮬레이터 긴 연결·자료 받기)을 모두 '접근 확인' 오류로 알리는데, 앱 오류가 아니라서 뺀다
  24  |   page.on('pageerror', (e) => { if (!/due to access control checks/.test(e.message)) problems.push(`pageerror: ${e.message}`); });
  25  |   page.on('console', (m) => {
  26  |     if (m.type() === 'error' && !/permission|insufficient/i.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  27  |   });
  28  |   page.on('response', (r) => {
  29  |     if (r.status() === 404 || r.status() >= 500) problems.push(`${r.status()}: ${r.url().slice(0, 160)}`);
  30  |   });
  31  |   return page;
  32  | }
  33  | test.afterEach(() => {
  34  |   const p = problems.splice(0);
> 35  |   expect(p, p.join('\n')).toEqual([]);
      |                           ^ Error: console: Error: Worker failed to load. Check that the worker URL is correct.
  36  | });
  37  | 
  38  | async function phone(browser: Browser, width = 375, height = 667) {
  39  |   // webkit이면 아이폰 사파리처럼 보이게 (UA): 앱의 iOS 분기(소리 안내 등)도 같이 지난다
  40  |   const webkit = browser.browserType().name() === 'webkit';
  41  |   const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block', ...(webkit ? { userAgent: devices['iPhone 13'].userAgent } : {}) });
  42  |   return watch(await ctx.newPage());
  43  | }
  44  | async function desktop(browser: Browser) {
  45  |   const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  46  |   return watch(await ctx.newPage());
  47  | }
  48  | 
  49  | /** 빠른 로그인 (구글 창 시험이 아닌 곳에서) */
  50  | async function signIn(page: Page, email = OWNER) {
  51  |   await page.goto('/');
  52  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  53  |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  54  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  55  | }
  56  | 
  57  | /** 구글 로그인: 버튼 → (에뮬레이터의) 구글 계정 창 → 계정 고르기 */
  58  | async function googleSignIn(page: Page, email = OWNER, name = '영상') {
  59  |   await page.goto('/');
  60  |   const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByTestId('login').click()]);
  61  |   await popup.waitForLoadState();
  62  |   const existing = popup.locator('#accounts-list').getByText(email);
  63  |   if (await existing.count()) {
  64  |     await existing.first().click();
  65  |   } else {
  66  |     await popup.locator('#add-account-button').click();
  67  |     await popup.locator('#email-input').fill(email);
  68  |     await popup.locator('#display-name-input').fill(name);
  69  |     await popup.locator('#sign-in').click();
  70  |   }
  71  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  72  | }
  73  | 
  74  | /** IME로 한글을 조합하는 중 (아직 확정 전) */
  75  | async function composeKorean(page: Page, steps: string[]) {
  76  |   const cdp = await page.context().newCDPSession(page);
  77  |   for (const t of steps) await cdp.send('Input.imeSetComposition', { text: t, selectionStart: t.length, selectionEnd: t.length });
  78  |   return {
  79  |     commit: (text: string) => cdp.send('Input.insertText', { text }),
  80  |   };
  81  | }
  82  | 
  83  | /** 지도 위 경도·위도 지점을 누른다 */
  84  | async function tapLngLat(page: Page, lng: number, lat: number) {
  85  |   const project = () => page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  86  |   const box = await page.getByTestId('map').first().boundingBox();
  87  |   if (!box) throw new Error('지도가 없어요');
  88  |   let pt = await project();
  89  |   // 홈 지도는 최근 핀 둘레만 보여 주므로, 누를 곳이 화면 밖이면 사람처럼 '전체 보기'를 먼저 누른다
  90  |   if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) {
  91  |     await page.getByRole('button', { name: '전체 보기' }).click();
  92  |     await page.waitForFunction(() => (window as unknown as { __map: { isMoving: () => boolean } }).__map.isMoving() === false);
  93  |     await page.waitForTimeout(150);
  94  |     pt = await project();
  95  |   }
  96  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  97  | }
  98  | 
  99  | /** 화면 폭을 넘어 삐져나간 요소 (가로 스크롤 상자 안은 제외) */
  100 | function overflowing(page: Page) {
  101 |   return page.evaluate(() => {
  102 |     const vw = document.documentElement.clientWidth;
  103 |     const scrollsX = (el: Element) => {
  104 |       for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  105 |         const s = getComputedStyle(p);
  106 |         if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
  107 |       }
  108 |       return false;
  109 |     };
  110 |     const bad: string[] = [];
  111 |     for (const el of document.querySelectorAll('body *')) {
  112 |       const r = el.getBoundingClientRect();
  113 |       if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
  114 |       if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
  115 |         bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  116 |       }
  117 |     }
  118 |     return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  119 |   });
  120 | }
  121 | 
  122 | test.describe('사람처럼 쓰기', () => {
  123 |   test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
  124 |     const page = await phone(browser);
  125 |     await googleSignIn(page);
  126 |     await page.reload();
  127 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  128 |     await expect(page.getByTestId('login')).toHaveCount(0);
  129 |     await page.context().close();
  130 |   });
  131 | 
  132 |   test('로그인 화면에서 이용약관 링크를 눌러 열고 로고로 돌아와도 화면이 살아 있다', async ({ browser }) => {
  133 |     // 약관 화면은 로그인 없이 보는 길(early return)이라, 앱 안에서 오갈 때 훅 개수가 달라지면 흰 화면이 됐다
  134 |     const page = await phone(browser);
  135 |     await page.goto('/');
```