# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: solo.spec.ts >> 혼자 쓰는 공간: 주요 화면에 둘이 쓴다는 말이 없다
- Location: tests/solo.spec.ts:20:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('내 공간', { exact: true }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('내 공간', { exact: true }).first() with timeout 15000ms
  - waiting for getByText('내 공간', { exact: true }).first()

```

```yaml
- button "뒤로"
- text: 우리 공간 혼 혼자 함께 다닌 여행 0번 · 핀 0개 혼자로 들어와 있어요 · solo@example.com 각자 계정으로 들어와도 같은 기록을 함께 봐요 함께 쓰는 사람 혼자 관리자
- button "내 이름 바꾸기": 이름 바꾸기
- text: solo@example.com 초대 링크 링크를 받은 사람이 로그인하면 이 공간에 들어와요. 7일 동안, 한 번만 쓸 수 있어요.
- textbox "초대 이름":
  - /placeholder: "부를 이름 (선택, 예: 남편)"
- combobox "초대할 사람과의 관계":
  - option "관계" [selected]
  - option "부부"
  - option "연인"
  - option "가족"
  - option "친구"
  - option "친지"
  - option "그 밖에"
- button "초대 링크 만들기"
- text: 우리 집
- button "우리 집 정하기 가고 싶은 곳까지 가는 길을 바로 열 수 있어요"
- text: 화면
- button "밝게" [pressed]
- button "어둡게"
- button "자동"
- text: 이 기기에만 적용돼요. '자동'은 폰·컴퓨터의 밝기 설정을 따라요. 장소를 누르면 열 지도
- button "네이버지도" [pressed]
- button "카카오맵"
- button "누를 때마다 고르기"
- text: 이 폰에만 적용돼요. 축제·볼거리·먹거리는 '자세히 보기'도 함께 나와요. 투어·티켓 찾을 곳
- button "누를 때마다 고르기" [pressed]
- button "마이리얼트립"
- button "KKday"
- button "클룩"
- text: 이 폰에만 적용돼요. 해외 도시의 가고 싶은 곳·예정 여행 준비 탭에 단추가 나와요. 백업
- button "엑셀로 내려받기 여행 · 맛집·명소 · 가고 싶은 곳 · 여행정보 (시트 4개)"
- link "사진 훑어보기 고른 사진을 폰 안에서만 읽어 사진·여행·중복·모르는 사진 수를 보여 줘요":
  - /url: /desk
- button "여행 목록 내보내기 PC 사진함이 사진을 여행별로 나눌 때 써요 (다녀온 여행만, JSON)"
- button "백업 파일 내려받기 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건"
- button "문제 신고 이상한 점을 알려 주시면 고칠게요"
- button "로그아웃"
- link "이용약관":
  - /url: /terms
- text: ·
- link "개인정보 처리방침":
  - /url: /privacy
- text: ·
- link "출처와 버전":
  - /url: /credits
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "남기기"
  - link "지도":
    - /url: /map
  - link "피드":
    - /url: /feed
- status
```

# Test source

```ts
  1  | /**
  2  |  * 혼자 쓰는 공간 (docs/design/SPACES-PUBLIC.md 3-6절)
  3  |  * 주인이 새 공간 링크를 만들고 → 한 사람이 들어와 혼자 쓴다. 주요 화면을 휴대폰 폭으로 돌며
  4  |  * 둘이 쓴다는 전제의 말('둘이', '상대', '서로', '우리 공간'…)이 하나도 보이지 않는지 모은다.
  5  |  * (app.spec 다음에 돈다: 주인 계정과 우리 공간이 이미 있다)
  6  |  */
  7  | import { test, expect, type Page } from '@playwright/test';
  8  | import { OWNER_EMAIL as OWNER } from '../src/lib/owner';
  9  | 
  10 | const SOLO = 'solo@example.com';
  11 | 
  12 | async function signIn(page: Page, email: string) {
  13 |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  14 |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  15 | }
  16 | 
  17 | /** 혼자일 때 보이면 안 되는 말 */
  18 | const COUPLE_WORDS = /둘이|둘의|둘 다|상대|서로|각자|우리 공간|우리 둘|함께 다닌|함께 다녀|커플/;
  19 | 
  20 | test('혼자 쓰는 공간: 주요 화면에 둘이 쓴다는 말이 없다', async ({ browser }) => {
  21 |   // 주인이 새 공간 링크를 만든다
  22 |   const owner = await browser.newPage({ viewport: { width: 375, height: 740 } });
  23 |   await owner.goto('/');
  24 |   await signIn(owner, OWNER);
  25 |   await expect(owner.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  26 |   await owner.goto('/space');
  27 |   const sec = owner.getByTestId('new-space-section');
  28 |   await sec.getByLabel('새 공간 받는 사람 이름').fill('혼자');
  29 |   await sec.getByTestId('new-space-make').click();
  30 |   const url = (await sec.getByTestId('invite-row').first().getByTestId('invite-url').textContent())!.trim();
  31 |   await owner.close();
  32 | 
  33 |   // 한 사람이 들어와 혼자 쓴다
  34 |   const ctx = await browser.newContext({ locale: 'ko-KR', viewport: { width: 375, height: 740 } });
  35 |   const page = await ctx.newPage();
  36 |   await page.goto(url);
  37 |   await signIn(page, SOLO);
  38 |   await page.getByTestId('join-go').click();
  39 |   await expect(page.getByTestId('welcome')).toBeVisible({ timeout: 20_000 });
  40 | 
  41 |   const found: string[] = [];
  42 |   const check = async (where: string) => {
  43 |     await page.waitForTimeout(700);
  44 |     const text = await page.locator('body').innerText();
  45 |     for (const line of text.split('\n')) {
  46 |       const m = line.match(COUPLE_WORDS);
  47 |       if (m) found.push(`${where}: '${m[0]}' · ${line.trim().slice(0, 80)}`);
  48 |     }
  49 |   };
  50 |   // 환영 화면 세 장
  51 |   await check('환영 1');
  52 |   await page.getByTestId('welcome-next').click();
  53 |   await check('환영 2');
  54 |   await page.getByTestId('welcome-name-next').click();
  55 |   await check('환영 3');
  56 |   await page.getByTestId('welcome-done').click();
  57 |   await expect(page.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
  58 | 
  59 |   // 가고 싶은 곳 하나 (빈 화면과 카드가 있는 화면 둘 다 보도록)
  60 |   await page.goto('/wishes/new');
  61 |   await check('가고 싶은 곳 새로');
  62 |   await page.getByLabel('어디 검색').fill('남해');
  63 |   await page.getByRole('option', { name: /남해군/ }).first().click();
  64 |   await page.getByTestId('wish-save').click();
  65 |   await expect(page).toHaveURL(/\/wishes$/);
  66 | 
  67 |   for (const route of ['/', '/trips', '/wishes', '/places', '/feed', '/space', '/plan', '/record', '/here', '/maps', '/map', '/memories']) {
  68 |     await page.goto(route);
  69 |     await page.waitForLoadState('load');
  70 |     await check(route);
  71 |   }
  72 |   // 설정의 제목
  73 |   await page.goto('/space');
> 74 |   await expect(page.getByText('내 공간', { exact: true }).first()).toBeVisible();
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  75 | 
  76 |   expect(found, found.join('\n')).toEqual([]);
  77 |   await ctx.close();
  78 | });
  79 | 
```