# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: preview.spec.ts >> 화면 오류 없음
- Location: tests/preview.spec.ts:120:1

# Error details

```
Error: console: Access to fetch at 'https://borapin-ask.ysangyn.workers.dev/place?url=https%3A%2F%2Fnaver.me%2FxYz12&addr=%EA%B0%95%EC%9B%90%20%EA%B0%95%EB%A6%89%EC%8B%9C%20%EC%B4%88%EB%8B%B9%EC%88%9C%EB%91%90%EB%B6%
console: Failed to load resource: net::ERR_FAILED

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "console: Access to fetch at 'https://borapin-ask.ysangyn.workers.dev/place?url=https%3A%2F%2Fnaver.me%2FxYz12&addr=%EA%B0%95%EC%9B%90%20%EA%B0%95%EB%A6%89%EC%8B%9C%20%EC%B4%88%EB%8B%B9%EC%88%9C%EB%91%90%EB%B6%",
+   "console: Failed to load resource: net::ERR_FAILED",
+ ]
```

# Test source

```ts
  21  |     if (m.type() === 'error' && !/permission|insufficient|Failed to load resource: the server responded with a status of 400/i.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  22  |   });
  23  |   return page;
  24  | }
  25  | async function newPage(browser: Browser) {
  26  |   const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  27  |   return watch(await ctx.newPage());
  28  | }
  29  | 
  30  | /** 사람처럼 메일·비밀번호를 쳐서 로그인 */
  31  | async function emailLogin(page: Page, email: string) {
  32  |   await page.goto('/');
  33  |   const form = page.getByTestId('email-form');
  34  |   await form.getByLabel('메일 주소').click();
  35  |   await page.keyboard.type(email);
  36  |   await form.getByLabel('비밀번호').click();
  37  |   await page.keyboard.type(PW);
  38  |   await form.getByTestId('email-submit').click();
  39  | }
  40  | 
  41  | test('시험용 표시가 보이고, 이번 커밋이 올라가 있다', async ({ browser }) => {
  42  |   const page = await newPage(browser);
  43  |   await page.goto('/');
  44  |   await expect(page.getByTestId('preview-ribbon')).toBeVisible();
  45  |   const v = await page.locator('meta[name="borapin-version"]').getAttribute('content');
  46  |   expect(v).toMatch(new RegExp(`\\+${COMMIT}$`));
  47  |   await page.context().close();
  48  | });
  49  | 
  50  | test('메일로 로그인 → 기록 → 새로 고침 → 장소 → 사진 → 공유 → 공개 끄기', async ({ browser }) => {
  51  |   test.setTimeout(240_000);
  52  |   const page = await newPage(browser);
  53  |   await emailLogin(page, OWNER);
  54  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 30_000 });
  55  | 
  56  |   // 기록
  57  |   await page.getByRole('button', { name: '기록하기', exact: true }).click();
  58  |   await page.getByRole('menuitem', { name: /다녀온 곳 기록하기/ }).click();
  59  |   await page.getByLabel('어디 검색').click();
  60  |   await page.keyboard.type('강릉', { delay: 50 });
  61  |   await page.getByRole('option', { name: /강릉시/ }).first().click();
  62  |   await page.getByLabel('제목').click();
  63  |   await page.keyboard.type(TITLE);
  64  |   await page.getByRole('button', { name: '몇 년', exact: true }).click();
  65  |   await page.getByLabel('연도').selectOption('2025');
  66  |   await page.getByTestId('save').click();
  67  |   await expect(page.getByTestId('trip-title')).toHaveText(TITLE, { timeout: 30_000 });
  68  |   await page.reload();
  69  |   await expect(page.getByTestId('trip-title')).toHaveText(TITLE, { timeout: 30_000 });
  70  | 
  71  |   // 우리 장소
  72  |   await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  73  |   await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  74  |   await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  75  |   await page.getByTestId('place-save').click();
  76  |   await expect(page.getByTestId('trip-places')).toContainText('초당할머니순두부', { timeout: 30_000 });
  77  | 
  78  |   // 사진
  79  |   await page.getByRole('tab', { name: /사진/ }).click();
  80  |   await page.getByTestId('trip-photos').getByTestId('photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  81  |   await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 60_000 });
  82  |   await page.reload();
  83  |   await page.getByRole('tab', { name: /사진/ }).click();
  84  |   await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  85  | 
  86  |   // 공유: 로그인 안 한 사람이 링크로 본다
  87  |   await page.getByRole('tab', { name: '개요' }).click();
  88  |   const card = page.getByTestId('share-link');
  89  |   await card.getByTestId('share-on').click();
  90  |   const url = await card.getByLabel('공유 링크').inputValue();
  91  |   const anon = await newPage(browser);
  92  |   await anon.goto(url);
  93  |   await expect(anon.getByTestId('shared-trip')).toContainText(TITLE, { timeout: 30_000 });
  94  |   await expect(anon.getByTestId('shared-trip')).toContainText('초당할머니순두부');
  95  |   // 공개를 끄면 닫힌다
  96  |   await card.getByRole('button', { name: '공개 끄기' }).click();
  97  |   await expect(card.getByTestId('share-on')).toBeVisible();
  98  |   await anon.reload();
  99  |   await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible({ timeout: 30_000 });
  100 |   await anon.context().close();
  101 |   await page.context().close();
  102 | });
  103 | 
  104 | test('함께 쓰는 사람(보라)도 같은 기록을 본다', async ({ browser }) => {
  105 |   const page = await newPage(browser);
  106 |   await emailLogin(page, BORA);
  107 |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 30_000 });
  108 |   await page.goto('/trips');
  109 |   await expect(page.getByText(TITLE)).toBeVisible({ timeout: 30_000 });
  110 |   await page.context().close();
  111 | });
  112 | 
  113 | test('초대 안 된 계정은 메일·비밀번호가 맞아도 막힌다', async ({ browser }) => {
  114 |   const page = await newPage(browser);
  115 |   await emailLogin(page, STRANGER);
  116 |   await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible({ timeout: 30_000 });
  117 |   await page.context().close();
  118 | });
  119 | 
  120 | test('화면 오류 없음', () => {
> 121 |   expect(problems, problems.join('\n')).toEqual([]);
      |                                         ^ Error: console: Access to fetch at 'https://borapin-ask.ysangyn.workers.dev/place?url=https%3A%2F%2Fnaver.me%2FxYz12&addr=%EA%B0%95%EC%9B%90%20%EA%B0%95%EB%A6%89%EC%8B%9C%20%EC%B4%88%EB%8B%B9%EC%88%9C%EB%91%90%EB%B6%
  122 | });
  123 | 
```