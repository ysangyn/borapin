# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 기록이 없으면 빈 상태 카드가 지도 바로 아래(물어보기 다음)에, 묶음은 그 뒤에
- Location: tests/app.spec.ts:78:3

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

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - button "뒤로" [ref=e6] [cursor=pointer]
          - heading "가고 싶은 곳" [level=1] [ref=e9]
        - link "담기" [ref=e10] [cursor=pointer]:
          - /url: /wishes/new
      - generic [ref=e13]:
        - generic [ref=e16]:
          - generic [ref=e17]: 가고 싶은 곳 3곳만 담아볼까요?
          - generic [ref=e18]: 지도에서 지역을 누르거나, 아래 추천과 여행지 뽑기로 담을 수 있어요. 상대가 담은 곳에 하트를 누르면 '모두 원해요'가 돼요.
        - generic [ref=e19]:
          - heading "찾아보기" [level=2] [ref=e21]
          - generic [ref=e22]:
            - generic [ref=e23]:
              - generic [ref=e24]: 여행지 뽑기
              - generic [ref=e27]:
                - checkbox "안 가본 곳만" [checked] [ref=e28]
                - text: 안 가본 곳만
            - combobox "뽑을 범위" [ref=e29]:
              - option "국내 전체" [selected]
              - option "서울"
              - option "부산"
              - option "대구"
              - option "인천"
              - option "광주·전남"
              - option "대전"
              - option "울산"
              - option "세종"
              - option "경기"
              - option "충북"
              - option "충남"
              - option "경북"
              - option "경남"
              - option "제주"
              - option "강원"
              - option "전북"
              - option "해외 도시"
            - generic [ref=e30]:
              - button "바다" [ref=e31] [cursor=pointer]
              - button "산·숲" [ref=e32] [cursor=pointer]
              - button "섬" [ref=e33] [cursor=pointer]
              - button "온천" [ref=e34] [cursor=pointer]
              - button "야경" [ref=e35] [cursor=pointer]
              - button "역사·전통" [ref=e36] [cursor=pointer]
              - button "카페" [ref=e37] [cursor=pointer]
              - button "시장·먹거리" [ref=e38] [cursor=pointer]
              - button "실내" [ref=e39] [cursor=pointer]
            - button "뽑기" [ref=e40] [cursor=pointer]
          - generic [ref=e43]:
            - generic [ref=e44]: 10월에 가 볼 만한 곳
            - generic [ref=e45]:
              - generic [ref=e47]:
                - generic [ref=e48]: 경기 가평군
                - generic [ref=e49]: 숲과 강이 주는 이국적인 휴식
                - generic [ref=e50]: 가기 좋은 때 4~6, 9·10월
              - button "담기" [ref=e51] [cursor=pointer]
            - generic [ref=e54]:
              - generic [ref=e56]:
                - generic [ref=e57]: 경기 과천시
                - generic [ref=e58]: 아이들과 함께하는 동물원과 예술 산책
                - generic [ref=e59]: 가기 좋은 때 4~6, 9·10월
              - button "담기" [ref=e60] [cursor=pointer]
            - generic [ref=e63]:
              - generic [ref=e65]:
                - generic [ref=e66]: 경북 성주군
                - generic [ref=e67]: 성산동 고분군과 참외 향 가득한 마을
                - generic [ref=e68]: 가기 좋은 때 4·5, 9·10월
              - button "담기" [ref=e69] [cursor=pointer]
      - navigation "주 메뉴" [ref=e72]:
        - link "홈" [ref=e73] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=e76] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=e79] [cursor=pointer]
        - link "지도" [ref=e82] [cursor=pointer]:
          - /url: /map
        - link [ref=e85] [cursor=pointer]:
          - /url: /feed
      - link "물어보기" [ref=e89] [cursor=pointer]:
        - /url: /ask
        - generic [aria-hidden] [ref=e90]: 물어봐요
    - status
  - iframe [aria-hidden] [ref=e91]
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
  13  | /** 이 테스트에서 일부러 내는 오류 응답 (예: 틀린 비밀번호) */
  14  | let expected: RegExp[] = [];
  15  | test.beforeEach(({ page }) => {
  16  |   problems = [];
  17  |   expected = [];
  18  |   page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}\n${(e.stack ?? '').split('\n').slice(0, 6).join('\n')}`));
  19  |   page.on('console', (m) => {
  20  |     if (m.type() === 'error' && !IGNORED.some((r) => r.test(m.text()))) problems.push(`console: ${m.text().slice(0, 300)}`);
  21  |   });
  22  |   page.on('response', (r) => {
  23  |     if ((r.status() === 404 || r.status() === 400 || r.status() >= 500) && !expected.some((x) => x.test(r.url()))) problems.push(`${r.status()}: ${r.url().slice(0, 160)}`);
  24  |   });
  25  | });
  26  | test.afterEach(() => {
  27  |   // 일부러 낸 오류 응답은 브라우저도 콘솔에 'Failed to load resource'로 남긴다
  28  |   if (expected.length) problems = problems.filter((p) => !/^console: Failed to load resource: the server responded with a status of 400/.test(p));
> 29  |   expect(problems, problems.join('\n')).toEqual([]);
      |                                         ^ Error: 404: http://127.0.0.1:5174/data/abroad.json
  30  | });
  31  | 
  32  | /** 지도가 실제로 경계를 그렸는지 (그려진 칸 수 > 0) */
  33  | async function expectMapDrawn(page: Page) {
  34  |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  35  | }
  36  | 
  37  | /** 지도 위 경도·위도 지점을 누른다 */
  38  | async function tapLngLat(page: Page, lng: number, lat: number) {
  39  |   const project = () => page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  40  |   const box = await page.getByTestId('map').first().boundingBox();
  41  |   if (!box) throw new Error('지도가 없어요');
  42  |   let pt = await project();
  43  |   // 홈 지도는 최근 핀 둘레만 보여 주므로, 누를 곳이 화면 밖이면 사람처럼 '전체 보기'를 먼저 누른다
  44  |   if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) {
  45  |     await page.getByRole('button', { name: '전체 보기' }).click();
  46  |     await page.waitForFunction(() => (window as unknown as { __map: { isMoving: () => boolean } }).__map.isMoving() === false);
  47  |     await page.waitForTimeout(150);
  48  |     pt = await project();
  49  |   }
  50  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  51  | }
  52  | 
  53  | async function signIn(page: Page, email: string) {
  54  |   await page.goto('/');
  55  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  56  |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  57  | }
  58  | 
  59  | async function pickPlace(page: Page, q: string, label: string) {
  60  |   await page.getByLabel('어디 검색').fill(q);
  61  |   await page.getByRole('option', { name: new RegExp(label) }).first().click();
  62  | }
  63  | 
  64  | test.describe.serial('보라핀 1단계', () => {
  65  |   test('로그인 화면', async ({ page }) => {
  66  |     await page.goto('/');
  67  |     await expect(page.getByTestId('login')).toBeVisible();
  68  |     await shot(page, '01-login');
  69  |   });
  70  | 
  71  |   test('주인 계정으로 들어오면 빈 홈', async ({ page }) => {
  72  |     await signIn(page, OWNER);
  73  |     await expect(page.getByTestId('headline')).toHaveText('첫 핀을 꽂아 볼까요?');
  74  |     await expectMapDrawn(page);
  75  |     await shot(page, '02-home-empty');
  76  |   });
  77  | 
  78  |   test('기록이 없으면 빈 상태 카드가 지도 바로 아래(물어보기 다음)에, 묶음은 그 뒤에', async ({ page }) => {
  79  |     await signIn(page, OWNER);
  80  |     await expectMapDrawn(page);
  81  |     const empty = page.getByTestId('home-empty');
  82  |     await expect(empty).toBeVisible();
  83  |     await expect(empty).toContainText('아직 기록이 없어요');
  84  |     // 안내 글은 실제 흐름대로: 지역을 누르면 '핀 꽂기 단추'가 나온다 (바로 꽂히지 않는다)
  85  |     await expect(empty).toContainText('핀 꽂기 단추가 나와요');
  86  |     await expect(page.getByTestId('map-hint')).toContainText('지역을 누르면 핀 꽂기 단추가 나와요');
  87  |     await expect(page.getByTestId('map-hint')).not.toContainText('⛶');
  88  |     const map = (await page.locator('.map-card').boundingBox())!;
  89  |     const ask = (await page.getByTestId('home-ask').boundingBox())!;
  90  |     const card = (await empty.boundingBox())!;
  91  |     const hub = (await page.getByTestId('next-hub').boundingBox())!;
  92  |     expect(card.y).toBeGreaterThan(map.y + map.height);
  93  |     expect(card.y).toBeGreaterThan(ask.y + ask.height);
  94  |     expect(card.y + card.height).toBeLessThanOrEqual(hub.y + 1);
  95  |     // 기록이 없을 땐 '최근에 남긴 기록' 빈 칸을 또 보여 주지 않는다
  96  |     await expect(page.getByRole('heading', { name: '최근에 남긴 기록' })).toHaveCount(0);
  97  |     // 홈 위 돋보기는 없다 (입력칸과 떠 있는 보라가 물어보기 입구)
  98  |     await expect(page.locator('.topbar').getByRole('link', { name: '물어보기' })).toHaveCount(0);
  99  |     await expect(page.getByTestId('home-ask').getByLabel('물어보기')).toBeVisible();
  100 |     await expect(page.getByTestId('home-more')).toHaveCount(0);
  101 |     // '다가오는 여행' 칸은 없고(묶음이 맡음), 가고 싶은 곳이 없으면 '여행지 뽑기'는 뽑기를 바로 연다
  102 |     await expect(page.getByText('다가오는 여행', { exact: true })).toHaveCount(0);
  103 |     const nextHub = page.getByTestId('next-hub');
  104 |     await expect(nextHub.getByRole('link', { name: '여행지 뽑기' })).toHaveAttribute('href', '/wishes?find=dice');
  105 |     // 해외 예정 여행이 없으면 오늘의 영어는 큰 카드 대신 한 줄 링크
  106 |     await expect(nextHub.getByTestId('hub-english')).toHaveCount(0);
  107 |     await expect(nextHub.getByTestId('hub-english-line')).toHaveAttribute('href', '/study');
  108 |     await nextHub.getByRole('link', { name: '여행지 뽑기' }).click();
  109 |     await expect(page.getByTestId('dice-roll')).toBeVisible();
  110 |   });
  111 | 
  112 |   test('피드는 둘의 소식만: 일반 소식 묶음이 없고, 비어 있으면 다음 단추가 있다', async ({ page }) => {
  113 |     await signIn(page, OWNER);
  114 |     await page.goto('/feed');
  115 |     await expect(page.getByTestId('feed')).toBeVisible();
  116 |     await expect(page.getByTestId('feed-empty')).toBeVisible({ timeout: 15_000 });
  117 |     await expect(page.getByTestId('news-digest')).toHaveCount(0);
  118 |     await expect(page.getByTestId('feed-empty-wish')).toHaveAttribute('href', '/wishes');
  119 |     await page.getByTestId('feed-empty-record').click();
  120 |     await expect(page).toHaveURL(/\/record$/);
  121 |   });
  122 | 
  123 |   test('초대 링크: 관리자가 만들고 → 링크로 온 사람이 로그인하면 바로 들어온다 (한 번만)', async ({ page, browser }) => {
  124 |     await signIn(page, OWNER);
  125 |     await page.goto('/space');
  126 |     await page.getByLabel('초대 이름').fill('막내');
  127 |     await page.getByTestId('invite-make').click();
  128 |     await expect(page.getByRole('status')).toContainText('초대 링크를 만들었어요');
  129 |     const row = page.getByTestId('invite-row').first();
```