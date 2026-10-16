# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다
- Location: tests/app.spec.ts:70:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('부를 이름') resolved to 2 elements:
    1) <button class="link-btn" aria-label="ysangyn@gmail.com 부를 이름 바꾸기">이름 바꾸기</button> aka getByRole('button', { name: 'ysangyn@gmail.com 부를 이름 바꾸기' })
    2) <input value="" class="input" maxlength="20" aria-label="부를 이름" placeholder="앱에서 부를 이름 (예: 보라)"/> aka getByRole('textbox', { name: '부를 이름' })

Call log:
  - waiting for getByLabel('부를 이름')

```

# Page snapshot

```yaml
- generic [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e3]:
      - generic [ref=f4e4]:
        - generic [ref=f4e6]:
          - button "뒤로" [ref=f4e7] [cursor=pointer]
          - generic [ref=f4e10]: 우리 공간
        - generic [ref=f4e11]:
          - generic [ref=f4e12]:
            - generic "영상" [ref=f4e13]: 영
            - generic [ref=f4e15]:
              - generic [ref=f4e16]: 영상
              - generic [ref=f4e17]: 여행 0번 · 핀 0개
              - generic [ref=f4e18]: 영상 · ysangyn@gmail.com
          - generic [ref=f4e19]:
            - generic [ref=f4e20]: 함께 쓰는 사람
            - generic [ref=f4e21]:
              - generic [ref=f4e26]:
                - text: 영상
                - generic [ref=f4e27]: 관리자
                - button "ysangyn@gmail.com 부를 이름 바꾸기" [ref=f4e28] [cursor=pointer]: 이름 바꾸기
                - generic [ref=f4e29]: ysangyn@gmail.com
              - generic [ref=f4e30]:
                - generic [ref=f4e31]:
                  - textbox "추가할 계정" [active] [ref=f4e32]:
                    - /placeholder: 함께 쓸 사람의 메일 주소
                    - text: bora@example.com
                  - textbox "부를 이름" [ref=f4e33]:
                    - /placeholder: "앱에서 부를 이름 (예: 보라)"
                - button "추가" [ref=f4e34] [cursor=pointer]
            - generic [ref=f4e35]: 추가한 메일로 구글 로그인이나 이메일 로그인을 하면 들어올 수 있어요.
          - generic [ref=f4e36]:
            - generic [ref=f4e37]: 백업
            - generic [ref=f4e38]:
              - button "엑셀로 내려받기 여행 · 우리 장소 · 가고 싶은 곳 · 여행정보 (시트 4개)" [ref=f4e39] [cursor=pointer]:
                - generic [ref=f4e43]:
                  - text: 엑셀로 내려받기
                  - generic [ref=f4e44]: 여행 · 우리 장소 · 가고 싶은 곳 · 여행정보 (시트 4개)
              - button "백업 파일 내려받기 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건" [ref=f4e47] [cursor=pointer]:
                - generic [ref=f4e51]:
                  - text: 백업 파일 내려받기
                  - generic [ref=f4e52]: 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건
          - generic [ref=f4e55]:
            - link "관리자 화면 무료 요금제 · 저장 공간 · 사진 올리기 멈춤 · 오류 신고" [ref=f4e56] [cursor=pointer]:
              - /url: /admin
              - generic [ref=f4e60]:
                - text: 관리자 화면
                - generic [ref=f4e61]: 무료 요금제 · 저장 공간 · 사진 올리기 멈춤 · 오류 신고
            - button "문제 신고 이상한 점을 알려 주시면 고칠게요" [ref=f4e64] [cursor=pointer]:
              - generic [ref=f4e68]:
                - text: 문제 신고
                - generic [ref=f4e69]: 이상한 점을 알려 주시면 고칠게요
          - button "로그아웃" [ref=f4e71] [cursor=pointer]
          - generic [ref=f4e76]:
            - generic [ref=f4e77]:
              - link "이용약관" [ref=f4e78] [cursor=pointer]:
                - /url: /terms
              - text: ·
              - link "개인정보 처리방침" [ref=f4e79] [cursor=pointer]:
                - /url: /privacy
              - text: ·
              - link "사진·영상·지도 출처" [ref=f4e80] [cursor=pointer]:
                - /url: /credits
            - generic [ref=f4e81]: 보라핀 v0.1.0 (fe03368)
            - generic [ref=f4e82]: "지도 경계: 통계청 SGIS(공공누리 1유형) · vuski/admdongkor(CC BY 4.0) · Natural Earth"
      - navigation "주 메뉴" [ref=f4e83]:
        - link "홈" [ref=f4e84] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f4e87] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f4e90] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f4e93] [cursor=pointer]:
          - /url: /map
        - link "추억" [ref=f4e96] [cursor=pointer]:
          - /url: /memories
    - status
  - iframe [aria-hidden] [ref=f4e99]
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
  29  |   expect(problems, problems.join('\n')).toEqual([]);
  30  | });
  31  | 
  32  | /** 지도가 실제로 경계를 그렸는지 (그려진 칸 수 > 0) */
  33  | async function expectMapDrawn(page: Page) {
  34  |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  35  | }
  36  | 
  37  | /** 지도 위 경도·위도 지점을 누른다 */
  38  | async function tapLngLat(page: Page, lng: number, lat: number) {
  39  |   const pt = await page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  40  |   const box = await page.getByTestId('map').first().boundingBox();
  41  |   if (!box) throw new Error('지도가 없어요');
  42  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  43  | }
  44  | 
  45  | async function signIn(page: Page, email: string) {
  46  |   await page.goto('/');
  47  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  48  |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  49  | }
  50  | 
  51  | async function pickPlace(page: Page, q: string, label: string) {
  52  |   await page.getByLabel('어디 검색').fill(q);
  53  |   await page.getByRole('option', { name: new RegExp(label) }).first().click();
  54  | }
  55  | 
  56  | test.describe.serial('보라핀 1단계', () => {
  57  |   test('로그인 화면', async ({ page }) => {
  58  |     await page.goto('/');
  59  |     await expect(page.getByTestId('login')).toBeVisible();
  60  |     await shot(page, '01-login');
  61  |   });
  62  | 
  63  |   test('주인 계정으로 들어오면 빈 홈', async ({ page }) => {
  64  |     await signIn(page, OWNER);
  65  |     await expect(page.getByTestId('headline')).toHaveText('첫 핀을 꽂아 볼까요?');
  66  |     await expectMapDrawn(page);
  67  |     await shot(page, '02-home-empty');
  68  |   });
  69  | 
  70  |   test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
  71  |     await signIn(page, 'stranger@example.com');
  72  |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  73  |     await shot(page, '10-denied');
  74  |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  75  |     await signIn(page, OWNER);
  76  |     // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
  77  |     await page.goto('/space');
  78  |     await expect(page.getByTestId('space-title')).toHaveText('영상');
  79  |     await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
  80  |     await page.getByLabel('추가할 계정').fill('bora@example.com');
> 81  |     await page.getByLabel('부를 이름').fill('보라');
      |                                    ^ Error: locator.fill: Error: strict mode violation: getByLabel('부를 이름') resolved to 2 elements:
  82  |     await page.getByRole('button', { name: '추가', exact: true }).click();
  83  |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  84  |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  85  |     await shot(page, '11-space');
  86  |     await page.getByRole('button', { name: '로그아웃' }).click();
  87  |     // 보라로 들어와도 같은 공간
  88  |     await signIn(page, 'bora@example.com');
  89  |     await expect(page.getByTestId('headline')).toBeVisible();
  90  |     await page.goto('/space');
  91  |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  92  |   });
  93  | 
  94  |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  95  |     await signIn(page, OWNER);
  96  |     await page.getByRole('link', { name: '기록하기' }).click();
  97  |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  98  |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  99  |     await page.getByLabel('연도').selectOption('2024');
  100 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  101 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  102 |     await shot(page, '03-record');
  103 |     await page.getByTestId('save').click();
  104 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  105 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  106 |     await expectMapDrawn(page);
  107 |     await shot(page, '04-detail');
  108 |   });
  109 | 
  110 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  111 |     await signIn(page, OWNER);
  112 |     await page.goto('/record');
  113 |     await pickPlace(page, '일본', '일본');
  114 |     await page.getByPlaceholder(/도시/).fill('교토');
  115 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  116 |     await page.getByRole('button', { name: '계절만' }).click();
  117 |     await page.getByLabel('연도').selectOption('2025');
  118 |     await page.getByRole('button', { name: '가을' }).click();
  119 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  120 |     await page.getByTestId('save').click();
  121 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  122 |   });
  123 | 
  124 |   test('여행 목록과 필터', async ({ page }) => {
  125 |     await signIn(page, OWNER);
  126 |     await page.goto('/trips');
  127 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  128 |     await page.getByRole('button', { name: /^해외/ }).click();
  129 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  130 |     await page.getByRole('button', { name: /^전체/ }).click();
  131 |     await shot(page, '05-trips');
  132 |   });
  133 | 
  134 |   test('홈 통계와 지도', async ({ page }) => {
  135 |     await signIn(page, OWNER);
  136 |     await expect(page.getByTestId('headline')).toHaveText('2번의 여행, 핀 2개');
  137 |     await expectMapDrawn(page);
  138 |     await shot(page, '06-home');
  139 |     await page.goto('/map');
  140 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  141 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  142 |     await expectMapDrawn(page);
  143 |     await page.waitForTimeout(800);
  144 |     await shot(page, '07-map');
  145 |     await page.getByRole('tab', { name: '세계' }).click();
  146 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  147 |     await page.waitForTimeout(1200);
  148 |     await expectMapDrawn(page);
  149 |     await shot(page, '08-map-world');
  150 |   });
  151 | 
  152 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  153 |     await signIn(page, OWNER);
  154 |     await expectMapDrawn(page);
  155 |     // 부산을 누른다
  156 |     await tapLngLat(page, 129.06, 35.2);
  157 |     const sheet = page.getByTestId('region-sheet');
  158 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
  159 |     await expect(sheet).toContainText('아직 안 가본 곳');
  160 |     // 여행정보: 볼거리·먹거리, 더보기로 구·군
  161 |     const info = sheet.getByTestId('region-info');
  162 |     await expect(info).toContainText('볼거리');
  163 |     await info.getByRole('button', { name: /더보기/ }).click();
  164 |     await expect(info).toContainText('해운대구');
  165 |     await shot(page, '09a-region-info');
  166 |     await info.getByRole('button', { name: '접기' }).click();
  167 |     await sheet.getByTestId('quick-pin').click();
  168 |     await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
  169 |     await expect(sheet).toContainText('다녀왔어요');
  170 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  171 |     // 되돌리기
  172 |     await page.getByRole('button', { name: '되돌리기' }).click();
  173 |     await expect(sheet).toContainText('아직 안 가본 곳');
  174 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
  175 |     // 다시 꽂아 둔다
  176 |     await sheet.getByTestId('quick-pin').click();
  177 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  178 |     await expect(page.getByTestId('headline')).toHaveText('3번의 여행, 핀 3개');
  179 |     await shot(page, '09-sheet');
  180 |     await sheet.getByRole('button', { name: '닫기' }).click();
  181 |     await expect(sheet).toHaveCount(0);
```