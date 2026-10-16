# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물
- Location: tests/app.spec.ts:354:3

# Error details

```
Error: console: Failed to load resource: the server responded with a status of 400 (Bad Request)
console: Failed to load resource: the server responded with a status of 400 (Bad Request)

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "console: Failed to load resource: the server responded with a status of 400 (Bad Request)",
+   "console: Failed to load resource: the server responded with a status of 400 (Bad Request)",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f4e1]:
  - generic [ref=f4e3]:
    - generic [ref=f4e4]:
      - generic [ref=f4e5]:
        - button "뒤로" [ref=f4e6] [cursor=pointer]
        - generic [ref=f4e9]: 예정된 여행
      - link "고치기" [ref=f4e10] [cursor=pointer]:
        - /url: /trips/IrHgqMHiedPL9QIzN0Nw/edit
    - generic [ref=f4e13]:
      - generic [ref=f4e14]:
        - generic [ref=f4e15]: 제주 여행
        - generic [ref=f4e16]: 2026년쯤
      - generic [ref=f4e18]:
        - generic [ref=f4e19]: 다녀오셨나요? 날짜가 지났어요. 다녀왔으면 핀으로 바꿔 둘게요.
        - button "다녀왔어요" [ref=f4e20] [cursor=pointer]
      - tablist "여행 보기" [ref=f4e21]:
        - tab "개요" [selected] [ref=f4e22] [cursor=pointer]
        - tab "일정" [ref=f4e23] [cursor=pointer]
        - tab "사진" [ref=f4e24] [cursor=pointer]
        - tab "글" [ref=f4e25] [cursor=pointer]
      - generic [ref=f4e26]:
        - generic [ref=f4e27]:
          - generic:
            - region "Map" [ref=f4e28]
            - generic: 대한해협
            - generic: 동해
            - generic: 서해
            - generic: 남해
        - generic [aria-hidden]:
          - generic: 제주
      - generic [ref=f4e29]:
        - generic [ref=f4e30]:
          - heading "준비물" [level=2] [ref=f4e31]
          - generic [ref=f4e32]: 0/14 챙김
        - generic [ref=f4e33]:
          - checkbox "신분증 챙김" [ref=f4e34]
          - generic [ref=f4e35]: 신분증
          - button "신분증 담당자" [ref=f4e36] [cursor=pointer]: 담당
          - button "신분증 빼기" [ref=f4e37] [cursor=pointer]
        - generic [ref=f4e40]:
          - checkbox "지갑·카드 챙김" [ref=f4e41]
          - generic [ref=f4e42]: 지갑·카드
          - button "지갑·카드 담당자" [ref=f4e43] [cursor=pointer]: 담당
          - button "지갑·카드 빼기" [ref=f4e44] [cursor=pointer]
        - generic [ref=f4e47]:
          - checkbox "휴대폰 충전기 챙김" [ref=f4e48]
          - generic [ref=f4e49]: 휴대폰 충전기
          - button "휴대폰 충전기 담당자" [ref=f4e50] [cursor=pointer]: 담당
          - button "휴대폰 충전기 빼기" [ref=f4e51] [cursor=pointer]
        - generic [ref=f4e54]:
          - checkbox "보조배터리 챙김" [ref=f4e55]
          - generic [ref=f4e56]: 보조배터리
          - button "보조배터리 담당자" [ref=f4e57] [cursor=pointer]: 담당
          - button "보조배터리 빼기" [ref=f4e58] [cursor=pointer]
        - generic [ref=f4e61]:
          - checkbox "상비약 챙김" [ref=f4e62]
          - generic [ref=f4e63]: 상비약
          - button "상비약 담당자" [ref=f4e64] [cursor=pointer]: 담당
          - button "상비약 빼기" [ref=f4e65] [cursor=pointer]
        - generic [ref=f4e68]:
          - checkbox "세면도구 챙김" [ref=f4e69]
          - generic [ref=f4e70]: 세면도구
          - button "세면도구 담당자" [ref=f4e71] [cursor=pointer]: 담당
          - button "세면도구 빼기" [ref=f4e72] [cursor=pointer]
        - generic [ref=f4e75]:
          - checkbox "갈아입을 옷 챙김" [ref=f4e76]
          - generic [ref=f4e77]: 갈아입을 옷
          - button "갈아입을 옷 담당자" [ref=f4e78] [cursor=pointer]: 담당
          - button "갈아입을 옷 빼기" [ref=f4e79] [cursor=pointer]
        - generic [ref=f4e82]:
          - checkbox "잠옷 챙김" [ref=f4e83]
          - generic [ref=f4e84]: 잠옷
          - button "잠옷 담당자" [ref=f4e85] [cursor=pointer]: 담당
          - button "잠옷 빼기" [ref=f4e86] [cursor=pointer]
        - generic [ref=f4e89]:
          - checkbox "수영복 챙김" [ref=f4e90]
          - generic [ref=f4e91]: 수영복
          - button "수영복 담당자" [ref=f4e92] [cursor=pointer]: 담당
          - button "수영복 빼기" [ref=f4e93] [cursor=pointer]
        - generic [ref=f4e96]:
          - checkbox "선크림 챙김" [ref=f4e97]
          - generic [ref=f4e98]: 선크림
          - button "선크림 담당자" [active] [ref=f4e99] [cursor=pointer]: 담당
          - button "선크림 빼기" [ref=f4e100] [cursor=pointer]
        - generic [ref=f4e103]:
          - checkbox "선글라스 챙김" [ref=f4e104]
          - generic [ref=f4e105]: 선글라스
          - button "선글라스 담당자" [ref=f4e106] [cursor=pointer]: 담당
          - button "선글라스 빼기" [ref=f4e107] [cursor=pointer]
        - generic [ref=f4e110]:
          - checkbox "모자 챙김" [ref=f4e111]
          - generic [ref=f4e112]: 모자
          - button "모자 담당자" [ref=f4e113] [cursor=pointer]: 담당
          - button "모자 빼기" [ref=f4e114] [cursor=pointer]
        - generic [ref=f4e117]:
          - checkbox "비치타월 챙김" [ref=f4e118]
          - generic [ref=f4e119]: 비치타월
          - button "비치타월 담당자" [ref=f4e120] [cursor=pointer]: 담당
          - button "비치타월 빼기" [ref=f4e121] [cursor=pointer]
        - generic [ref=f4e124]:
          - checkbox "샌들 챙김" [ref=f4e125]
          - generic [ref=f4e126]: 샌들
          - button "샌들 담당자" [ref=f4e127] [cursor=pointer]: 담당
          - button "샌들 빼기" [ref=f4e128] [cursor=pointer]
        - generic [ref=f4e131]:
          - textbox "준비물 추가" [ref=f4e132]:
            - /placeholder: 더 챙길 것
          - button "추가" [disabled] [ref=f4e133]
      - generic [ref=f4e134]:
        - generic [ref=f4e135]:
          - generic [ref=f4e136]: 어디
          - generic [ref=f4e138]:
            - generic [ref=f4e139]: 제주
            - link "네이버지도" [ref=f4e140] [cursor=pointer]:
              - /url: https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC
            - link "구글지도" [ref=f4e141] [cursor=pointer]:
              - /url: https://www.google.com/maps/search/?api=1&query=%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC
        - generic [ref=f4e142]:
          - generic [ref=f4e143]: 누구와
          - generic [ref=f4e144]: 보라, 영상
        - generic [ref=f4e145]:
          - generic [ref=f4e146]: 남긴 사람
          - generic [ref=f4e147]: 영상
      - generic [ref=f4e148]:
        - generic [ref=f4e149]:
          - heading "장소" [level=2] [ref=f4e150]
          - link "+ 장소 남기기" [ref=f4e151] [cursor=pointer]:
            - /url: /places/new?trip=IrHgqMHiedPL9QIzN0Nw
        - generic [ref=f4e152]: 기억에 남은 맛집·카페·명소를 둘의 한 줄 평과 함께 남겨 보세요.
      - generic [ref=f4e153]:
        - generic [ref=f4e154]:
          - generic [ref=f4e155]: 링크 공개
          - generic [ref=f4e158]: 우리만 보기
        - generic [ref=f4e159]: 앱이 없어도 이 여행을 볼 수 있는 링크를 만들어요. 제목·날짜·장소, 사진과 촬영 날짜·설명, 들른 곳 이름이 보여요. 메모와 글, 함께 간 사람 이름은 넣지 않아요.
        - button "링크 만들기" [ref=f4e160] [cursor=pointer]
      - button "이 여행 지우기" [ref=f4e161] [cursor=pointer]
    - navigation "주 메뉴" [ref=f4e164]:
      - link "홈" [ref=f4e165] [cursor=pointer]:
        - /url: /
      - link "여행" [ref=f4e168] [cursor=pointer]:
        - /url: /trips
      - link "기록하기" [ref=f4e171] [cursor=pointer]:
        - /url: /record
      - link "지도" [ref=f4e174] [cursor=pointer]:
        - /url: /map
      - link "추억" [ref=f4e177] [cursor=pointer]:
        - /url: /memories
  - iframe [aria-hidden] [ref=f4e180]
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
  20  |     if (r.status() === 404) problems.push(`404: ${r.url()}`);
  21  |   });
  22  | });
  23  | test.afterEach(() => {
> 24  |   expect(problems, problems.join('\n')).toEqual([]);
      |                                         ^ Error: console: Failed to load resource: the server responded with a status of 400 (Bad Request)
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