# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 이메일로 가입하고 메일 인증 뒤 들어온다
- Location: tests/app.spec.ts:527:3

# Error details

```
Error: 400: http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCaK68gpzphfn9bFWQsR_8zXfSVkMKBzMM
console: Failed to load resource: the server responded with a status of 400 (Bad Request)

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "400: http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCaK68gpzphfn9bFWQsR_8zXfSVkMKBzMM",
+   "console: Failed to load resource: the server responded with a status of 400 (Bad Request)",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f6e1]:
  - generic [ref=f6e4]:
    - generic [ref=f6e5]:
      - img "핀이 하나씩 채워지는 우리나라 지도" [ref=f6e6]
      - generic [ref=f6e167]:
        - img "보라핀 로고" [ref=f6e169]
        - generic [ref=f6e173]: 보라핀
      - paragraph [ref=f6e174]: 가본 곳마다, 우리 핀 하나
    - generic [ref=f6e175]:
      - generic [ref=f6e176]:
        - radiogroup "로그인 또는 가입" [ref=f6e177]:
          - radio "로그인" [checked] [ref=f6e178] [cursor=pointer]
          - radio "처음이에요" [ref=f6e179] [cursor=pointer]
        - textbox "메일 주소" [ref=f6e180]
        - textbox "비밀번호" [ref=f6e181]
        - button "로그인" [disabled] [ref=f6e182]
        - button "비밀번호를 잊었어요" [ref=f6e183] [cursor=pointer]
      - generic [ref=f6e184]: 간편 로그인
      - button "구글로 계속하기" [ref=f6e186] [cursor=pointer]
      - generic [ref=f6e192]: 초대받은 메일 주소로만 들어올 수 있어요.
      - generic [ref=f6e193]:
        - link "이용약관" [ref=f6e194] [cursor=pointer]:
          - /url: /terms
        - link "개인정보 처리방침" [ref=f6e195] [cursor=pointer]:
          - /url: /privacy
  - iframe [aria-hidden] [ref=f6e196]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import path from 'node:path';
  3   | import fs from 'node:fs';
  4   | 
  5   | const OWNER = 'ysangyn@gmail.com';
  6   | const SHOTS = 'test-results/screens';
  7   | fs.mkdirSync(SHOTS, { recursive: true });
  8   | const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
  9   | 
  10  | // 화면에서 난 오류는 모두 모아 두었다가 테스트 끝에 확인한다
  11  | const IGNORED = [/permission[-_ ]denied/i, /Missing or insufficient permissions/i];
  12  | let problems: string[] = [];
  13  | test.beforeEach(({ page }) => {
  14  |   problems = [];
  15  |   page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}\n${(e.stack ?? '').split('\n').slice(0, 6).join('\n')}`));
  16  |   page.on('console', (m) => {
  17  |     if (m.type() === 'error' && !IGNORED.some((r) => r.test(m.text()))) problems.push(`console: ${m.text().slice(0, 300)}`);
  18  |   });
  19  |   page.on('response', (r) => {
  20  |     if (r.status() === 404 || r.status() === 400 || r.status() >= 500) problems.push(`${r.status()}: ${r.url().slice(0, 160)}`);
  21  |   });
  22  | });
  23  | test.afterEach(() => {
> 24  |   expect(problems, problems.join('\n')).toEqual([]);
      |                                         ^ Error: 400: http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCaK68gpzphfn9bFWQsR_8zXfSVkMKBzMM
  25  | });
  26  | 
  27  | /** 지도가 실제로 경계를 그렸는지 (그려진 칸 수 > 0) */
  28  | async function expectMapDrawn(page: Page) {
  29  |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  30  | }
  31  | 
  32  | /** 지도 위 경도·위도 지점을 누른다 */
  33  | async function tapLngLat(page: Page, lng: number, lat: number) {
  34  |   const pt = await page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  35  |   const box = await page.getByTestId('map').first().boundingBox();
  36  |   if (!box) throw new Error('지도가 없어요');
  37  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  38  | }
  39  | 
  40  | async function signIn(page: Page, email: string) {
  41  |   await page.goto('/');
  42  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  43  |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  44  | }
  45  | 
  46  | async function pickPlace(page: Page, q: string, label: string) {
  47  |   await page.getByLabel('어디 검색').fill(q);
  48  |   await page.getByRole('option', { name: new RegExp(label) }).first().click();
  49  | }
  50  | 
  51  | test.describe.serial('보라핀 1단계', () => {
  52  |   test('로그인 화면', async ({ page }) => {
  53  |     await page.goto('/');
  54  |     await expect(page.getByTestId('login')).toBeVisible();
  55  |     await shot(page, '01-login');
  56  |   });
  57  | 
  58  |   test('주인 계정으로 들어오면 빈 홈', async ({ page }) => {
  59  |     await signIn(page, OWNER);
  60  |     await expect(page.getByTestId('headline')).toHaveText('첫 핀을 꽂아 볼까요?');
  61  |     await expectMapDrawn(page);
  62  |     await shot(page, '02-home-empty');
  63  |   });
  64  | 
  65  |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  66  |     await signIn(page, OWNER);
  67  |     await page.getByRole('link', { name: '기록하기' }).click();
  68  |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  69  |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  70  |     await page.getByLabel('연도').selectOption('2024');
  71  |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  72  |     await page.getByRole('button', { name: '추가', exact: true }).click();
  73  |     await shot(page, '03-record');
  74  |     await page.getByTestId('save').click();
  75  |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  76  |     await expect(page.getByText('2024년쯤')).toBeVisible();
  77  |     await expectMapDrawn(page);
  78  |     await shot(page, '04-detail');
  79  |   });
  80  | 
  81  |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  82  |     await signIn(page, OWNER);
  83  |     await page.goto('/record');
  84  |     await pickPlace(page, '일본', '일본');
  85  |     await page.getByPlaceholder(/도시/).fill('교토');
  86  |     await page.getByRole('button', { name: '도시 넣기' }).click();
  87  |     await page.getByRole('button', { name: '계절만' }).click();
  88  |     await page.getByLabel('연도').selectOption('2025');
  89  |     await page.getByRole('button', { name: '가을' }).click();
  90  |     await page.getByLabel('제목').fill('교토 단풍 여행');
  91  |     await page.getByTestId('save').click();
  92  |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  93  |   });
  94  | 
  95  |   test('여행 목록과 필터', async ({ page }) => {
  96  |     await signIn(page, OWNER);
  97  |     await page.goto('/trips');
  98  |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  99  |     await page.getByRole('button', { name: /^해외/ }).click();
  100 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  101 |     await page.getByRole('button', { name: /^전체/ }).click();
  102 |     await shot(page, '05-trips');
  103 |   });
  104 | 
  105 |   test('홈 통계와 지도', async ({ page }) => {
  106 |     await signIn(page, OWNER);
  107 |     await expect(page.getByTestId('headline')).toHaveText('2번의 여행, 핀 2개');
  108 |     await expectMapDrawn(page);
  109 |     await shot(page, '06-home');
  110 |     await page.goto('/map');
  111 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  112 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  113 |     await expectMapDrawn(page);
  114 |     await page.waitForTimeout(800);
  115 |     await shot(page, '07-map');
  116 |     await page.getByRole('tab', { name: '세계' }).click();
  117 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  118 |     await page.waitForTimeout(1200);
  119 |     await expectMapDrawn(page);
  120 |     await shot(page, '08-map-world');
  121 |   });
  122 | 
  123 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  124 |     await signIn(page, OWNER);
```