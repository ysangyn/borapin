# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: solo.spec.ts >> 혼자 쓰는 공간: 주요 화면에 둘이 쓴다는 말이 없다
- Location: tests/solo.spec.ts:20:1

# Error details

```
Error: /space: '우리 공간' · 우리 공간의 공개

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "/space: '우리 공간' · 우리 공간의 공개",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f30e1]:
  - generic [ref=f30e2]:
    - generic [ref=f30e3]:
      - generic [ref=f30e4]:
        - generic [ref=f30e6]:
          - button "뒤로" [ref=f30e7] [cursor=pointer]
          - generic [ref=f30e10]: 내 공간
        - generic [ref=f30e11]:
          - generic [ref=f30e12]:
            - generic "혼자" [ref=f30e13]: 혼
            - generic [ref=f30e15]:
              - generic [ref=f30e16]: 혼자
              - generic [ref=f30e17]: 다닌 여행 0번 · 핀 0개
              - generic [ref=f30e18]: 혼자로 들어와 있어요 · solo@example.com
              - generic [ref=f30e19]: 짝이나 가족을 초대하면 같은 기록을 함께 봐요
          - generic [ref=f30e20]:
            - generic [ref=f30e21]: 이 공간을 쓰는 사람
            - generic [ref=f30e27]:
              - text: 혼자
              - generic [ref=f30e28]: 관리자
              - button "내 이름 바꾸기" [ref=f30e29] [cursor=pointer]: 이름 바꾸기
              - generic [ref=f30e30]: solo@example.com
          - generic [ref=f30e31]:
            - generic [ref=f30e32]: 초대 링크
            - generic [ref=f30e35]:
              - generic [ref=f30e36]: 링크를 받은 사람이 로그인하면 이 공간에 들어와요. 7일 동안, 한 번만 쓸 수 있어요.
              - generic [ref=f30e37]:
                - textbox "초대 이름" [ref=f30e38]:
                  - /placeholder: "부를 이름 (선택, 예: 남편)"
                - combobox "초대할 사람과의 관계" [ref=f30e39]:
                  - option "관계" [selected]
                  - option "부부"
                  - option "연인"
                  - option "가족"
                  - option "친구"
                  - option "친지"
                  - option "그 밖에"
              - button "초대 링크 만들기" [ref=f30e40] [cursor=pointer]
          - generic [ref=f30e43]:
            - generic [ref=f30e44]: 보라핀 사람들에게 나눈 평
            - generic [ref=f30e45]: 아직 없어요. 다녀온 가게 화면의 '보여 줄 사람'에서 나눌 수 있어요.
          - generic [ref=f30e48]:
            - generic [ref=f30e49]: 우리 공간의 공개
            - generic [ref=f30e51]:
              - generic [ref=f30e52]:
                - text: 보라핀 사람들에게 공개할 수 있어요
                - generic [ref=f30e53]: 끄면 이 공간 사람 모두가 새로 공개하지 못하고, 지금까지 공개한 평·사진도 거둬요
              - button "공개 끄기" [ref=f30e54] [cursor=pointer]
          - generic [ref=f30e55]:
            - generic [ref=f30e56]: 우리 집
            - button "우리 집 정하기 가고 싶은 곳까지 가는 길을 바로 열 수 있어요" [ref=f30e58] [cursor=pointer]:
              - generic [ref=f30e62]:
                - text: 우리 집 정하기
                - generic [ref=f30e63]: 가고 싶은 곳까지 가는 길을 바로 열 수 있어요
          - generic [ref=f30e66]:
            - generic [ref=f30e67]: 화면
            - generic [ref=f30e68]:
              - generic [ref=f30e69]:
                - button "밝게" [pressed] [ref=f30e70] [cursor=pointer]
                - button "어둡게" [ref=f30e71] [cursor=pointer]
                - button "자동" [ref=f30e72] [cursor=pointer]
              - generic [ref=f30e73]: 이 기기에만 적용돼요. '자동'은 폰·컴퓨터의 밝기 설정을 따라요.
          - generic [ref=f30e74]:
            - generic [ref=f30e75]: 장소를 누르면 열 지도
            - generic [ref=f30e76]:
              - generic [ref=f30e77]:
                - button "네이버지도" [pressed] [ref=f30e78] [cursor=pointer]
                - button "카카오맵" [ref=f30e79] [cursor=pointer]
                - button "누를 때마다 고르기" [ref=f30e80] [cursor=pointer]
              - generic [ref=f30e81]: 이 폰에만 적용돼요. 축제·볼거리·먹거리는 '자세히 보기'도 함께 나와요.
          - generic [ref=f30e82]:
            - generic [ref=f30e83]: 투어·티켓 찾을 곳
            - generic [ref=f30e84]:
              - generic [ref=f30e85]:
                - button "누를 때마다 고르기" [pressed] [ref=f30e86] [cursor=pointer]
                - button "마이리얼트립" [ref=f30e87] [cursor=pointer]
                - button "KKday" [ref=f30e88] [cursor=pointer]
                - button "클룩" [ref=f30e89] [cursor=pointer]
              - generic [ref=f30e90]: 이 폰에만 적용돼요. 해외 도시의 가고 싶은 곳·예정 여행 준비 탭에 단추가 나와요.
          - generic [ref=f30e91]:
            - generic [ref=f30e92]: 백업
            - generic [ref=f30e93]:
              - button "엑셀로 내려받기 여행 · 맛집·명소 · 가고 싶은 곳 · 여행정보 (시트 4개)" [ref=f30e94] [cursor=pointer]:
                - generic [ref=f30e98]:
                  - text: 엑셀로 내려받기
                  - generic [ref=f30e99]: 여행 · 맛집·명소 · 가고 싶은 곳 · 여행정보 (시트 4개)
              - link "사진 훑어보기 고른 사진을 폰 안에서만 읽어 사진·여행·중복·모르는 사진 수를 보여 줘요" [ref=f30e102] [cursor=pointer]:
                - /url: /desk
                - generic [ref=f30e106]:
                  - text: 사진 훑어보기
                  - generic [ref=f30e107]: 고른 사진을 폰 안에서만 읽어 사진·여행·중복·모르는 사진 수를 보여 줘요
              - button "여행 목록 내보내기 PC 사진함이 사진을 여행별로 나눌 때 써요 (다녀온 여행만, JSON)" [ref=f30e110] [cursor=pointer]:
                - generic [ref=f30e114]:
                  - text: 여행 목록 내보내기
                  - generic [ref=f30e115]: PC 사진함이 사진을 여행별로 나눌 때 써요 (다녀온 여행만, JSON)
              - button "백업 파일 내려받기 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건" [ref=f30e118] [cursor=pointer]:
                - generic [ref=f30e122]:
                  - text: 백업 파일 내려받기
                  - generic [ref=f30e123]: 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건
          - button "문제 신고 이상한 점을 알려 주시면 고칠게요" [ref=f30e127] [cursor=pointer]:
            - generic [ref=f30e131]:
              - text: 문제 신고
              - generic [ref=f30e132]: 이상한 점을 알려 주시면 고칠게요
          - button "로그아웃" [ref=f30e134] [cursor=pointer]
          - generic [ref=f30e139]:
            - link "이용약관" [ref=f30e140] [cursor=pointer]:
              - /url: /terms
            - text: ·
            - link "개인정보 처리방침" [ref=f30e141] [cursor=pointer]:
              - /url: /privacy
            - text: ·
            - link "출처와 버전" [ref=f30e142] [cursor=pointer]:
              - /url: /credits
      - navigation "주 메뉴" [ref=f30e143]:
        - link "홈" [ref=f30e144] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f30e147] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f30e150] [cursor=pointer]
        - link "지도" [ref=f30e153] [cursor=pointer]:
          - /url: /map
        - link [ref=f30e156] [cursor=pointer]:
          - /url: /feed
    - status
  - iframe [aria-hidden] [ref=f30e160]
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
  46 |       // 여행 계획의 동행 고르기 칩 '둘이'(누군가와 둘이 가요)는 혼자 쓰는 사람도 고를 수 있는 말이다
  47 |       if (line.trim() === '둘이') continue;
  48 |       const m = line.match(COUPLE_WORDS);
  49 |       if (m) found.push(`${where}: '${m[0]}' · ${line.trim().slice(0, 80)}`);
  50 |     }
  51 |   };
  52 |   // 환영 화면 세 장
  53 |   await check('환영 1');
  54 |   await page.getByTestId('welcome-next').click();
  55 |   await check('환영 2');
  56 |   await page.getByTestId('welcome-name-next').click();
  57 |   await check('환영 3');
  58 |   await page.getByTestId('welcome-done').click();
  59 |   await expect(page.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
  60 | 
  61 |   // 가고 싶은 곳 하나 (빈 화면과 카드가 있는 화면 둘 다 보도록)
  62 |   await page.goto('/wishes/new');
  63 |   await check('가고 싶은 곳 새로');
  64 |   await page.getByLabel('어디 검색').fill('남해');
  65 |   await page.getByRole('option', { name: /남해군/ }).first().click();
  66 |   await page.getByTestId('wish-save').click();
  67 |   await expect(page).toHaveURL(/\/wishes$/);
  68 | 
  69 |   for (const route of ['/', '/trips', '/wishes', '/places', '/feed', '/space', '/plan', '/record', '/here', '/maps', '/map', '/memories']) {
  70 |     await page.goto(route);
  71 |     await page.waitForLoadState('load');
  72 |     await check(route);
  73 |   }
  74 |   // 모은 말 목록을 먼저 (실패해도 어디에 무엇이 남았는지 한 번에 보이게)
> 75 |   expect.soft(found, found.join('\n')).toEqual([]);
     |                                        ^ Error: /space: '우리 공간' · 우리 공간의 공개
  76 |   // 설정의 제목
  77 |   await page.goto('/space');
  78 |   await expect(page.getByText('내 공간', { exact: true }).first()).toBeVisible();
  79 |   await ctx.close();
  80 | });
  81 | 
```