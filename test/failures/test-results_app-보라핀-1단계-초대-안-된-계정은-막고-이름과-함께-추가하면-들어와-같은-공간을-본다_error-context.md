# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다
- Location: tests/app.spec.ts:115:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByRole('textbox', { name: '부를 이름' }) resolved to 2 elements:
    1) <input value="" class="input" maxlength="20" aria-label="부를 이름" placeholder="앱에서 부를 이름 (예: 보라)"/> aka getByRole('textbox', { name: '부를 이름', exact: true })
    2) <input value="" class="input" maxlength="20" aria-label="초대할 사람을 부를 이름" placeholder="앱에서 부를 이름 (선택, 예: 어머니)"/> aka getByRole('textbox', { name: '초대할 사람을 부를 이름' })

Call log:
  - waiting for getByRole('textbox', { name: '부를 이름' })

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
            - generic [ref=f4e37]: 초대 링크
            - generic [ref=f4e40]:
              - generic [ref=f4e41]: 메일 주소를 몰라도 돼요. 링크를 받은 사람이 로그인하면 바로 들어와요. 7일 동안, 한 번만 쓸 수 있어요.
              - textbox "초대할 사람을 부를 이름" [ref=f4e42]:
                - /placeholder: "앱에서 부를 이름 (선택, 예: 어머니)"
              - button "초대 링크 만들기" [ref=f4e43] [cursor=pointer]
          - generic [ref=f4e46]:
            - generic [ref=f4e47]: 백업
            - generic [ref=f4e48]:
              - button "엑셀로 내려받기 여행 · 우리 장소 · 가고 싶은 곳 · 여행정보 (시트 4개)" [ref=f4e49] [cursor=pointer]:
                - generic [ref=f4e53]:
                  - text: 엑셀로 내려받기
                  - generic [ref=f4e54]: 여행 · 우리 장소 · 가고 싶은 곳 · 여행정보 (시트 4개)
              - button "백업 파일 내려받기 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건" [ref=f4e57] [cursor=pointer]:
                - generic [ref=f4e61]:
                  - text: 백업 파일 내려받기
                  - generic [ref=f4e62]: 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건
          - generic [ref=f4e65]:
            - link "관리자 화면 무료 요금제 · 저장 공간 · 사진 올리기 멈춤 · 오류 신고" [ref=f4e66] [cursor=pointer]:
              - /url: /admin
              - generic [ref=f4e70]:
                - text: 관리자 화면
                - generic [ref=f4e71]: 무료 요금제 · 저장 공간 · 사진 올리기 멈춤 · 오류 신고
            - button "문제 신고 이상한 점을 알려 주시면 고칠게요" [ref=f4e74] [cursor=pointer]:
              - generic [ref=f4e78]:
                - text: 문제 신고
                - generic [ref=f4e79]: 이상한 점을 알려 주시면 고칠게요
          - button "로그아웃" [ref=f4e81] [cursor=pointer]
          - generic [ref=f4e86]:
            - generic [ref=f4e87]:
              - link "이용약관" [ref=f4e88] [cursor=pointer]:
                - /url: /terms
              - text: ·
              - link "개인정보 처리방침" [ref=f4e89] [cursor=pointer]:
                - /url: /privacy
              - text: ·
              - link "사진·영상·지도 출처" [ref=f4e90] [cursor=pointer]:
                - /url: /credits
            - generic [ref=f4e91]: 보라핀 v0.1.0 (1eacec7)
            - generic [ref=f4e92]: "지도 경계: 통계청 SGIS(공공누리 1유형) · vuski/admdongkor(CC BY 4.0) · Natural Earth"
      - navigation "주 메뉴" [ref=f4e93]:
        - link "홈" [ref=f4e94] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f4e97] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f4e100] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f4e103] [cursor=pointer]:
          - /url: /map
        - link [ref=f4e106] [cursor=pointer]:
          - /url: /feed
    - status
  - iframe [aria-hidden] [ref=f4e110]
```

# Test source

```ts
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
  78  |   test('초대 링크: 관리자가 만들고 → 링크로 온 사람이 로그인하면 바로 들어온다 (한 번만)', async ({ page, browser }) => {
  79  |     await signIn(page, OWNER);
  80  |     await page.goto('/space');
  81  |     await page.getByLabel('초대할 사람을 부를 이름').fill('막내');
  82  |     await page.getByTestId('invite-make').click();
  83  |     await expect(page.getByRole('status')).toContainText('초대 링크를 만들었어요');
  84  |     const row = page.getByTestId('invite-row').first();
  85  |     await expect(row).toContainText('막내 초대');
  86  |     const url = (await row.getByTestId('invite-url').textContent())!.trim();
  87  |     expect(url).toMatch(/\/join\/[a-z0-9]{8,}$/);
  88  |     await shot(page, '02b-invite');
  89  | 
  90  |     // 새 사람: 링크를 열면 로그인 화면에 '초대 링크로 오셨네요', 로그인하면 들어가기 화면 → 들어가기
  91  |     const ctx = await browser.newContext({ locale: 'ko-KR' });
  92  |     const p2 = await ctx.newPage();
  93  |     await p2.goto(url);
  94  |     await expect(p2.getByTestId('login-invite')).toBeVisible();
  95  |     await p2.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  96  |     await p2.evaluate(() => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn('newbie@example.com'));
  97  |     await expect(p2.getByTestId('join')).toContainText('보라핀에 초대받았어요');
  98  |     await expect(p2.getByTestId('join')).toContainText('막내');
  99  |     await shot(p2, '02c-join');
  100 |     await p2.getByTestId('join-go').click();
  101 |     await expect(p2.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
  102 |     await p2.goto('/space');
  103 |     await expect(p2.getByText('막내', { exact: true })).toBeVisible();
  104 |     await ctx.close();
  105 |     // 관리자 화면에서 그 링크는 사라졌고(한 번 쓰면 끝), 막내가 함께 쓰는 사람에 있다
  106 |     await page.reload();
  107 |     await expect(page.getByTestId('invite-row')).toHaveCount(0);
  108 |     await expect(page.getByText('newbie@example.com')).toBeVisible();
  109 |     // 정리: 막내를 빼서 다음 시험들이 둘만 있는 공간을 보게
  110 |     await page.getByLabel('newbie@example.com 빼기').click();
  111 |     await page.getByRole('button', { name: '빼기', exact: true }).click();
  112 |     await expect(page.getByText('newbie@example.com')).toHaveCount(0);
  113 |   });
  114 | 
  115 |   test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
  116 |     await signIn(page, 'stranger@example.com');
  117 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  118 |     // 다음에 뭘 해야 하는지와 복사할 메일 주소가 보인다
  119 |     await expect(page.getByText(/우리 공간 → 함께 쓰는 사람 → 추가/)).toBeVisible();
  120 |     await expect(page.getByTestId('denied-mail')).toContainText('stranger@example.com');
  121 |     await shot(page, '10-denied');
  122 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  123 |     await signIn(page, OWNER);
  124 |     // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
  125 |     await page.goto('/space');
  126 |     await expect(page.getByTestId('space-title')).toHaveText('영상');
  127 |     await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
  128 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
> 129 |     await page.getByRole('textbox', { name: '부를 이름' }).fill('보라');
      |                                                        ^ Error: locator.fill: Error: strict mode violation: getByRole('textbox', { name: '부를 이름' }) resolved to 2 elements:
  130 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  131 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  132 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  133 |     await shot(page, '11-space');
  134 |     await page.getByRole('button', { name: '로그아웃' }).click();
  135 |     // 보라로 들어와도 같은 공간
  136 |     await signIn(page, 'bora@example.com');
  137 |     await expect(page.getByTestId('headline')).toBeVisible();
  138 |     await page.goto('/space');
  139 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  140 |   });
  141 | 
  142 |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  143 |     await signIn(page, OWNER);
  144 |     await page.getByRole('link', { name: '기록하기', exact: true }).click();
  145 |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  146 |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  147 |     await page.getByLabel('연도').selectOption('2024');
  148 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  149 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  150 |     await shot(page, '03-record');
  151 |     await page.getByTestId('save').click();
  152 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  153 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  154 |     await expectMapDrawn(page);
  155 |     await shot(page, '04-detail');
  156 |   });
  157 | 
  158 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  159 |     await signIn(page, OWNER);
  160 |     await page.goto('/record');
  161 |     await pickPlace(page, '일본', '일본');
  162 |     await page.getByPlaceholder(/도시/).fill('교토');
  163 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  164 |     await page.getByRole('button', { name: '계절만' }).click();
  165 |     await page.getByLabel('연도').selectOption('2025');
  166 |     await page.getByRole('button', { name: '가을' }).click();
  167 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  168 |     await page.getByTestId('save').click();
  169 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  170 |   });
  171 | 
  172 |   test('여행 목록과 필터', async ({ page }) => {
  173 |     await signIn(page, OWNER);
  174 |     await page.goto('/trips');
  175 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  176 |     await page.getByRole('button', { name: /^해외/ }).click();
  177 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  178 |     await page.getByRole('button', { name: /^전체/ }).click();
  179 |     await shot(page, '05-trips');
  180 |   });
  181 | 
  182 |   test('홈 통계와 지도', async ({ page }) => {
  183 |     await signIn(page, OWNER);
  184 |     await expect(page.getByTestId('headline')).toHaveText('2번의 여행, 핀 2개');
  185 |     await expectMapDrawn(page);
  186 |     await shot(page, '06-home');
  187 |     await page.goto('/map');
  188 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  189 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  190 |     await expectMapDrawn(page);
  191 |     await page.waitForTimeout(800);
  192 |     await shot(page, '07-map');
  193 |     await page.getByRole('tab', { name: '세계' }).click();
  194 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  195 |     await page.waitForTimeout(1200);
  196 |     await expectMapDrawn(page);
  197 |     await shot(page, '08-map-world');
  198 |   });
  199 | 
  200 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  201 |     await signIn(page, OWNER);
  202 |     await expectMapDrawn(page);
  203 |     // 부산을 누른다
  204 |     await tapLngLat(page, 129.06, 35.2);
  205 |     const sheet = page.getByTestId('region-sheet');
  206 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
  207 |     await expect(sheet).toContainText('아직 안 가본 곳');
  208 |     // 여행정보: 볼거리·먹거리, 더보기로 구·군
  209 |     const info = sheet.getByTestId('region-info');
  210 |     await expect(info).toContainText('볼거리');
  211 |     await info.getByRole('button', { name: /더보기/ }).click();
  212 |     await expect(info).toContainText('해운대구');
  213 |     await shot(page, '09a-region-info');
  214 |     await info.getByRole('button', { name: '접기' }).click();
  215 |     await sheet.getByTestId('quick-pin').click();
  216 |     await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
  217 |     await expect(sheet).toContainText('다녀왔어요');
  218 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  219 |     // 되돌리기
  220 |     await page.getByRole('button', { name: '되돌리기' }).click();
  221 |     await expect(sheet).toContainText('아직 안 가본 곳');
  222 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
  223 |     // 다시 꽂아 둔다
  224 |     await sheet.getByTestId('quick-pin').click();
  225 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  226 |     await expect(page.getByTestId('headline')).toHaveText('3번의 여행, 핀 3개');
  227 |     await shot(page, '09-sheet');
  228 |     await sheet.getByRole('button', { name: '닫기' }).click();
  229 |     await expect(sheet).toHaveCount(0);
```