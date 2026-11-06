# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: preview.spec.ts >> 메일로 로그인 → 기록 → 새로 고침 → 장소 → 사진 → 공유 → 공개 끄기
- Location: tests/preview.spec.ts:52:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('shared-trip')
Expected substring: "미리보기 시험 여행 2ee8408"
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('shared-trip') with timeout 30000ms
  - waiting for getByTestId('shared-trip')

```

```yaml
- text: 여행을 불러오지 못했어요 인터넷 연결을 확인한 뒤 다시 열어 주세요.
- button "다시 불러오기"
- status
- text: 시험용 미리보기 · 실제 기록이 아니에요
```

# Test source

```ts
  1   | /**
  2   |  * 미리보기 주소에서 진짜 Firebase(시험용 프로젝트 borapin-test)로 시험한다.
  3   |  * 실제 서비스에 올리기 전 마지막 관문: 여기서 하나라도 실패하면 실제 배포를 하지 않는다.
  4   |  * 시험 계정·기록은 scripts/preview-env.ts가 만들고, 끝나면 지운다.
  5   |  */
  6   | import { test, expect, type Browser, type Page } from '@playwright/test';
  7   | 
  8   | const PW = process.env.PREVIEW_PW ?? '';
  9   | const COMMIT = process.env.COMMIT ?? '';
  10  | const OWNER = 'ysangyn@gmail.com';
  11  | const BORA = 'bora.preview@example.com';
  12  | const STRANGER = 'stranger.preview@example.com';
  13  | const TITLE = `미리보기 시험 여행 ${COMMIT}`;
  14  | 
  15  | test.describe.configure({ mode: 'serial' });
  16  | 
  17  | const problems: string[] = [];
  18  | function watch(page: Page) {
  19  |   page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  20  |   page.on('console', (m) => {
  21  |     // 뒷단(물어보기·소식·장소 링크)은 바깥 사이트에 기대는 덤 기능: 앱은 실패해도 조용히 넘어가고, 뒷단 자체는 ask-eval이 따로 점검한다
  22  |     if (m.type() === 'error' && !/permission|insufficient|Failed to load resource: the server responded with a status of 400/i.test(m.text()) && !/workers\.dev/.test(m.text()) && !/net::ERR_FAILED/.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  23  |   });
  24  |   return page;
  25  | }
  26  | async function newPage(browser: Browser) {
  27  |   const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  28  |   return watch(await ctx.newPage());
  29  | }
  30  | 
  31  | /** 사람처럼 메일·비밀번호를 쳐서 로그인 */
  32  | async function emailLogin(page: Page, email: string) {
  33  |   await page.goto('/');
  34  |   await page.getByTestId('email-open').click();
  35  |   const form = page.getByTestId('email-form');
  36  |   await form.getByLabel('메일 주소').click();
  37  |   await page.keyboard.type(email);
  38  |   await form.getByLabel('비밀번호').click();
  39  |   await page.keyboard.type(PW);
  40  |   await form.getByTestId('email-submit').click();
  41  | }
  42  | 
  43  | test('시험용 표시가 보이고, 이번 커밋이 올라가 있다', async ({ browser }) => {
  44  |   const page = await newPage(browser);
  45  |   await page.goto('/');
  46  |   await expect(page.getByTestId('preview-ribbon')).toBeVisible();
  47  |   const v = await page.locator('meta[name="borapin-version"]').getAttribute('content');
  48  |   expect(v).toMatch(new RegExp(`\\+${COMMIT}$`));
  49  |   await page.context().close();
  50  | });
  51  | 
  52  | test('메일로 로그인 → 기록 → 새로 고침 → 장소 → 사진 → 공유 → 공개 끄기', async ({ browser }) => {
  53  |   test.setTimeout(240_000);
  54  |   const page = await newPage(browser);
  55  |   await emailLogin(page, OWNER);
  56  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 30_000 });
  57  | 
  58  |   // 기록
  59  |   await page.getByRole('button', { name: '남기기', exact: true }).click();
  60  |   await page.getByRole('menuitem', { name: /여행 기록 남기기/ }).click();
  61  |   await page.getByLabel('어디 검색').click();
  62  |   await page.keyboard.type('강릉', { delay: 50 });
  63  |   await page.getByRole('option', { name: /강릉시/ }).first().click();
  64  |   await page.getByLabel('제목').click();
  65  |   await page.keyboard.type(TITLE);
  66  |   await page.getByRole('button', { name: '몇 년', exact: true }).click();
  67  |   await page.getByLabel('연도').selectOption('2025');
  68  |   await page.getByTestId('save').click();
  69  |   await expect(page.getByTestId('trip-title')).toHaveText(TITLE, { timeout: 30_000 });
  70  |   await page.reload();
  71  |   await expect(page.getByTestId('trip-title')).toHaveText(TITLE, { timeout: 30_000 });
  72  | 
  73  |   // 우리 장소
  74  |   await page.getByTestId('trip-places').getByRole('link', { name: '+ 맛집·카페 남기기' }).click();
  75  |   await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  76  |   await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  77  |   await page.getByTestId('place-save').click();
  78  |   await expect(page.getByTestId('trip-places')).toContainText('초당할머니순두부', { timeout: 30_000 });
  79  | 
  80  |   // 사진
  81  |   await page.getByRole('tab', { name: /사진/ }).click();
  82  |   await page.getByTestId('trip-photos').getByTestId('photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  83  |   await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 60_000 });
  84  |   await page.reload();
  85  |   await page.getByRole('tab', { name: /사진/ }).click();
  86  |   await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  87  | 
  88  |   // 공유: 로그인 안 한 사람이 링크로 본다
  89  |   await page.getByRole('tab', { name: '개요' }).click();
  90  |   const card = page.getByTestId('share-link');
  91  |   await card.getByTestId('share-on').click();
  92  |   const url = await card.getByLabel('공유 링크').inputValue();
  93  |   const anon = await newPage(browser);
  94  |   await anon.goto(url);
> 95  |   await expect(anon.getByTestId('shared-trip')).toContainText(TITLE, { timeout: 30_000 });
      |                                                 ^ Error: expect(locator).toContainText(expected) failed
  96  |   await expect(anon.getByTestId('shared-trip')).toContainText('초당할머니순두부');
  97  |   // 공개를 끄면 닫힌다
  98  |   await card.getByRole('button', { name: '공개 끄기' }).click();
  99  |   await expect(card.getByTestId('share-on')).toBeVisible();
  100 |   await anon.reload();
  101 |   await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible({ timeout: 30_000 });
  102 |   await anon.context().close();
  103 |   await page.context().close();
  104 | });
  105 | 
  106 | test('함께 쓰는 사람(보라)도 같은 기록을 본다', async ({ browser }) => {
  107 |   const page = await newPage(browser);
  108 |   await emailLogin(page, BORA);
  109 |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 30_000 });
  110 |   await page.goto('/trips');
  111 |   await expect(page.getByText(TITLE)).toBeVisible({ timeout: 30_000 });
  112 |   await page.context().close();
  113 | });
  114 | 
  115 | test('초대 안 된 계정은 메일·비밀번호가 맞아도 막힌다', async ({ browser }) => {
  116 |   const page = await newPage(browser);
  117 |   await emailLogin(page, STRANGER);
  118 |   await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible({ timeout: 30_000 });
  119 |   await page.context().close();
  120 | });
  121 | 
  122 | test('화면 오류 없음', () => {
  123 |   expect(problems, problems.join('\n')).toEqual([]);
  124 | });
  125 | 
```