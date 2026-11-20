# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 새 공간 열어 주기: 주인이 링크를 만들고 → 받은 사람은 우리와 따로 쓰는 자기 공간의 관리자가 된다
- Location: tests/app.spec.ts:168:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('sister@example.com')
Expected: visible
Error: strict mode violation: getByText('sister@example.com') resolved to 2 elements:
    1) <div class="tiny muted">파랑새로 들어와 있어요 · sister@example.com</div> aka getByText('파랑새로 들어와 있어요 · sister@example')
    2) <div class="tiny muted">sister@example.com</div> aka getByText('sister@example.com', { exact: true })

Call log:
  - Expect "toBeVisible" getByText('sister@example.com') with timeout 15000ms
  - waiting for getByText('sister@example.com')

```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e4]:
        - generic [ref=f2e6]:
          - button "뒤로" [ref=f2e7] [cursor=pointer]
          - generic [ref=f2e10]: 우리 공간
        - generic [ref=f2e11]:
          - generic [ref=f2e12]:
            - generic "영상" [ref=f2e13]: 영
            - generic [ref=f2e15]:
              - generic [ref=f2e16]: 영상
              - generic [ref=f2e17]: 함께 다닌 여행 0번 · 핀 0개
              - generic [ref=f2e18]: 영상으로 들어와 있어요 · ysangyn@gmail.com
              - generic [ref=f2e19]: 각자 계정으로 들어와도 같은 기록을 함께 봐요
          - generic [ref=f2e20]:
            - generic [ref=f2e21]: 함께 쓰는 사람
            - generic [ref=f2e22]:
              - generic [ref=f2e27]:
                - text: 영상
                - generic [ref=f2e28]: 관리자
                - button "ysangyn@gmail.com 부를 이름 바꾸기" [ref=f2e29] [cursor=pointer]: 이름 바꾸기
                - generic [ref=f2e30]: ysangyn@gmail.com
              - generic [ref=f2e31]:
                - generic [ref=f2e32]:
                  - textbox "추가할 계정" [ref=f2e33]:
                    - /placeholder: 함께 쓸 사람의 메일 주소
                  - textbox "부를 이름" [ref=f2e34]:
                    - /placeholder: "앱에서 부를 이름 (예: 보라)"
                - button "추가" [ref=f2e35] [cursor=pointer]
            - generic [ref=f2e36]: 추가한 메일로 구글 로그인이나 이메일 로그인을 하면 들어올 수 있어요.
          - generic [ref=f2e37]:
            - generic [ref=f2e38]: 초대 링크
            - generic [ref=f2e41]:
              - generic [ref=f2e42]: 메일 주소를 몰라도 돼요. 링크를 받은 사람이 로그인하면 바로 들어와요. 7일 동안, 한 번만 쓸 수 있어요.
              - generic [ref=f2e43]:
                - textbox "초대 이름" [ref=f2e44]:
                  - /placeholder: "부를 이름 (선택, 예: 어머니)"
                - combobox "초대할 사람과의 관계" [ref=f2e45]:
                  - option "관계" [selected]
                  - option "부부"
                  - option "연인"
                  - option "가족"
                  - option "친구"
                  - option "친지"
                  - option "그 밖에"
              - button "초대 링크 만들기" [ref=f2e46] [cursor=pointer]
          - generic [ref=f2e49]:
            - generic [ref=f2e50]: 새 공간 열어 주기
            - generic [ref=f2e53]:
              - generic [ref=f2e54]: 우리 기록과 따로 쓰는 공간을 열어 줘요. 받은 사람이 그 공간의 관리자가 되고, 짝이나 가족을 직접 초대해요. 우리도 그 공간은 볼 수 없어요.
              - textbox "새 공간 받는 사람 이름" [ref=f2e55]:
                - /placeholder: "받는 사람을 부를 이름 (선택, 예: 처제)"
              - textbox "새 공간 이름" [ref=f2e56]:
                - /placeholder: "공간 이름 (선택, 예: 꿈꾸는파랑새)"
              - button "새 공간 링크 만들기" [ref=f2e57] [cursor=pointer]
          - generic [ref=f2e60]:
            - generic [ref=f2e61]: 우리 집
            - button "우리 집 정하기 가고 싶은 곳까지 가는 길을 바로 열 수 있어요" [ref=f2e63] [cursor=pointer]:
              - generic [ref=f2e67]:
                - text: 우리 집 정하기
                - generic [ref=f2e68]: 가고 싶은 곳까지 가는 길을 바로 열 수 있어요
          - generic [ref=f2e71]:
            - generic [ref=f2e72]: 화면
            - generic [ref=f2e73]:
              - generic [ref=f2e74]:
                - button "밝게" [pressed] [ref=f2e75] [cursor=pointer]
                - button "어둡게" [ref=f2e76] [cursor=pointer]
                - button "자동" [ref=f2e77] [cursor=pointer]
              - generic [ref=f2e78]: 이 기기에만 적용돼요. '자동'은 폰·컴퓨터의 밝기 설정을 따라요.
          - generic [ref=f2e79]:
            - generic [ref=f2e80]: 장소를 누르면 열 지도
            - generic [ref=f2e81]:
              - generic [ref=f2e82]:
                - button "네이버지도" [pressed] [ref=f2e83] [cursor=pointer]
                - button "카카오맵" [ref=f2e84] [cursor=pointer]
                - button "누를 때마다 고르기" [ref=f2e85] [cursor=pointer]
              - generic [ref=f2e86]: 이 폰에만 적용돼요. 축제·볼거리·먹거리는 '자세히 보기'도 함께 나와요.
          - generic [ref=f2e87]:
            - generic [ref=f2e88]: 투어·티켓 찾을 곳
            - generic [ref=f2e89]:
              - generic [ref=f2e90]:
                - button "누를 때마다 고르기" [pressed] [ref=f2e91] [cursor=pointer]
                - button "마이리얼트립" [ref=f2e92] [cursor=pointer]
                - button "KKday" [ref=f2e93] [cursor=pointer]
                - button "클룩" [ref=f2e94] [cursor=pointer]
              - generic [ref=f2e95]: 이 폰에만 적용돼요. 해외 도시의 가고 싶은 곳·예정 여행 준비 탭에 단추가 나와요.
          - generic [ref=f2e96]:
            - generic [ref=f2e97]: 백업
            - generic [ref=f2e98]:
              - button "엑셀로 내려받기 여행 · 맛집·명소 · 가고 싶은 곳 · 여행정보 (시트 4개)" [ref=f2e99] [cursor=pointer]:
                - generic [ref=f2e103]:
                  - text: 엑셀로 내려받기
                  - generic [ref=f2e104]: 여행 · 맛집·명소 · 가고 싶은 곳 · 여행정보 (시트 4개)
              - link "사진 훑어보기 고른 사진을 폰 안에서만 읽어 사진·여행·중복·모르는 사진 수를 보여 줘요" [ref=f2e107] [cursor=pointer]:
                - /url: /desk
                - generic [ref=f2e111]:
                  - text: 사진 훑어보기
                  - generic [ref=f2e112]: 고른 사진을 폰 안에서만 읽어 사진·여행·중복·모르는 사진 수를 보여 줘요
              - button "여행 목록 내보내기 PC 사진함이 사진을 여행별로 나눌 때 써요 (다녀온 여행만, JSON)" [ref=f2e115] [cursor=pointer]:
                - generic [ref=f2e119]:
                  - text: 여행 목록 내보내기
                  - generic [ref=f2e120]: PC 사진함이 사진을 여행별로 나눌 때 써요 (다녀온 여행만, JSON)
              - button "백업 파일 내려받기 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건" [ref=f2e123] [cursor=pointer]:
                - generic [ref=f2e127]:
                  - text: 백업 파일 내려받기
                  - generic [ref=f2e128]: 모든 기록·일정·글 (사진 파일은 빼고) · 여행 0건
          - generic [ref=f2e131]:
            - link "관리자 화면 무료 요금제 · 저장 공간 · 사진 올리기 멈춤 · 오류 신고" [ref=f2e132] [cursor=pointer]:
              - /url: /admin
              - generic [ref=f2e136]:
                - text: 관리자 화면
                - generic [ref=f2e137]: 무료 요금제 · 저장 공간 · 사진 올리기 멈춤 · 오류 신고
            - button "문제 신고 이상한 점을 알려 주시면 고칠게요" [ref=f2e140] [cursor=pointer]:
              - generic [ref=f2e144]:
                - text: 문제 신고
                - generic [ref=f2e145]: 이상한 점을 알려 주시면 고칠게요
          - button "로그아웃" [ref=f2e147] [cursor=pointer]
          - generic [ref=f2e152]:
            - link "이용약관" [ref=f2e153] [cursor=pointer]:
              - /url: /terms
            - text: ·
            - link "개인정보 처리방침" [ref=f2e154] [cursor=pointer]:
              - /url: /privacy
            - text: ·
            - link "출처와 버전" [ref=f2e155] [cursor=pointer]:
              - /url: /credits
      - navigation "주 메뉴" [ref=f2e156]:
        - link "홈" [ref=f2e157] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f2e160] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f2e163] [cursor=pointer]
        - link "지도" [ref=f2e166] [cursor=pointer]:
          - /url: /map
        - link [ref=f2e169] [cursor=pointer]:
          - /url: /feed
    - status
  - iframe [aria-hidden] [ref=f2e173]
```

# Test source

```ts
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
  130 |     await expect(row).toContainText('막내 초대');
  131 |     const url = (await row.getByTestId('invite-url').textContent())!.trim();
  132 |     expect(url).toMatch(/\/join\/[a-z0-9]{8,}$/);
  133 |     await shot(page, '02b-invite');
  134 | 
  135 |     // 새 사람: 링크를 열면 로그인 화면에 '초대 링크로 오셨네요', 로그인하면 들어가기 화면 → 들어가기
  136 |     const ctx = await browser.newContext({ locale: 'ko-KR' });
  137 |     const p2 = await ctx.newPage();
  138 |     await p2.goto(url);
  139 |     await expect(p2.getByTestId('login-invite')).toBeVisible();
  140 |     await p2.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  141 |     await p2.evaluate(() => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn('newbie@example.com'));
  142 |     await expect(p2.getByTestId('join')).toContainText('보라핀에 초대받았어요');
  143 |     await expect(p2.getByTestId('join')).toContainText('막내');
  144 |     await shot(p2, '02c-join');
  145 |     await p2.getByTestId('join-go').click();
  146 |     // 처음 들어오면 환영 3장면: 어서 와요 → 내 이름(바꾸면 공간 문서의 names에 내 칸만) → 우리 집 → 지도
  147 |     await expect(p2.getByTestId('welcome')).toBeVisible({ timeout: 20_000 });
  148 |     await expect(p2.getByTestId('welcome')).toContainText('어서 와요');
  149 |     await p2.getByTestId('welcome-next').click();
  150 |     await p2.getByLabel('내 이름').fill('막내둥이');
  151 |     await p2.getByTestId('welcome-name-next').click();
  152 |     await expect(p2.getByRole('status')).toContainText('막내둥이로 불려요');
  153 |     await p2.getByTestId('welcome-done').click();
  154 |     await expect(p2.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
  155 |     await p2.goto('/space');
  156 |     await expect(p2.getByText('막내둥이', { exact: true })).toBeVisible();
  157 |     await ctx.close();
  158 |     // 관리자 화면에서 그 링크는 사라졌고(한 번 쓰면 끝), 막내가 함께 쓰는 사람에 있다
  159 |     await page.reload();
  160 |     await expect(page.getByTestId('invite-row')).toHaveCount(0);
  161 |     await expect(page.getByText('newbie@example.com')).toBeVisible();
  162 |     // 정리: 막내를 빼서 다음 시험들이 둘만 있는 공간을 보게
  163 |     await page.getByLabel('newbie@example.com 빼기').click();
  164 |     await page.getByRole('button', { name: '빼기', exact: true }).click();
  165 |     await expect(page.getByText('newbie@example.com')).toHaveCount(0);
  166 |   });
  167 | 
  168 |   test('새 공간 열어 주기: 주인이 링크를 만들고 → 받은 사람은 우리와 따로 쓰는 자기 공간의 관리자가 된다', async ({ page, browser }) => {
  169 |     await signIn(page, OWNER);
  170 |     await page.goto('/space');
  171 |     const sec = page.getByTestId('new-space-section');
  172 |     await sec.getByLabel('새 공간 받는 사람 이름').fill('처제');
  173 |     await sec.getByLabel('새 공간 이름').fill('꿈꾸는파랑새');
  174 |     await sec.getByTestId('new-space-make').click();
  175 |     await expect(page.getByRole('status')).toContainText('새 공간 링크를 만들었어요');
  176 |     const row = sec.getByTestId('invite-row').first();
  177 |     await expect(row).toContainText('꿈꾸는파랑새 열어 주기');
  178 |     const url = (await row.getByTestId('invite-url').textContent())!.trim();
  179 |     expect(url).toMatch(/\/join\/[a-z0-9]{8,}$/);
  180 |     // 우리 공간 초대 목록에는 섞이지 않는다
  181 |     await expect(page.getByTestId('invite-section').getByTestId('invite-row')).toHaveCount(0);
  182 |     await shot(page, '02d-new-space-link');
  183 | 
  184 |     // 받은 사람: 링크 → 로그인 → '새로 시작해요' → 들어가기 → 환영 → 홈
  185 |     const ctx = await browser.newContext({ locale: 'ko-KR' });
  186 |     const p2 = await ctx.newPage();
  187 |     await p2.goto(url);
  188 |     await expect(p2.getByTestId('login-invite')).toBeVisible();
  189 |     await p2.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  190 |     await p2.evaluate(() => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn('sister@example.com'));
  191 |     await expect(p2.getByTestId('join-title')).toHaveText('보라핀을 새로 시작해요');
  192 |     await expect(p2.getByTestId('join')).toContainText('처제');
  193 |     await shot(p2, '02e-join-new-space');
  194 |     await p2.getByTestId('join-go').click();
  195 |     await expect(p2.getByTestId('welcome')).toBeVisible({ timeout: 20_000 });
  196 |     await p2.getByTestId('welcome-next').click();
  197 |     // 초대장에 적힌 이름('처제')이 이미 들어가 있다. 바꾸면 이 공간의 내 구성원 문서에 (옛 목록이 아니라)
  198 |     await expect(p2.getByLabel('내 이름')).toHaveValue('처제');
  199 |     await p2.getByLabel('내 이름').fill('파랑새');
  200 |     await p2.getByTestId('welcome-name-next').click();
  201 |     await expect(p2.getByRole('status')).toContainText('파랑새로 불려요');
  202 |     await p2.getByTestId('welcome-done').click();
  203 |     await expect(p2.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
  204 |     // 설정: 함께 쓰는 사람은 나 하나(관리자). 우리 공간 사람은 보이지 않고, 새 공간 열어 주기는 주인에게만
  205 |     await p2.goto('/space');
> 206 |     await expect(p2.getByText('sister@example.com')).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  207 |     await expect(p2.getByText('파랑새', { exact: true }).first()).toBeVisible();
  208 |     await expect(p2.getByText(OWNER)).toHaveCount(0);
  209 |     await expect(p2.getByText('관리자', { exact: true }).first()).toBeVisible();
  210 |     await expect(p2.getByTestId('new-space-section')).toHaveCount(0);
  211 |     await expect(p2.getByTestId('admin-link')).toHaveCount(0);
  212 |     // 자기 공간에 짝을 들이는 초대 링크를 만든다
  213 |     await p2.getByLabel('초대 이름').fill('제부');
  214 |     await p2.getByTestId('invite-make').click();
  215 |     await expect(p2.getByTestId('invite-row').first()).toContainText('제부 초대');
  216 |     await shot(p2, '02f-new-space-settings');
  217 |     await ctx.close();
  218 |     // 주인 화면: 그 링크는 쓰여서 사라졌고, 우리 함께 쓰는 사람에 처제는 없다
  219 |     await page.reload();
  220 |     await expect(page.getByTestId('new-space-section').getByTestId('invite-row')).toHaveCount(0);
  221 |     await expect(page.getByText('sister@example.com')).toHaveCount(0);
  222 |   });
  223 | 
  224 |   test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
  225 |     await signIn(page, 'stranger@example.com');
  226 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  227 |     // 다음에 뭘 해야 하는지와 복사할 메일 주소가 보인다
  228 |     await expect(page.getByText(/우리 공간 → 함께 쓰는 사람 → 추가/)).toBeVisible();
  229 |     await expect(page.getByTestId('denied-mail')).toContainText('stranger@example.com');
  230 |     await shot(page, '10-denied');
  231 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  232 |     await signIn(page, OWNER);
  233 |     // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
  234 |     await page.goto('/space');
  235 |     await expect(page.getByTestId('space-title')).toHaveText('영상');
  236 |     await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
  237 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  238 |     await page.getByRole('textbox', { name: '부를 이름' }).fill('보라');
  239 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  240 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  241 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  242 |     await shot(page, '11-space');
  243 |     await page.getByRole('button', { name: '로그아웃' }).click();
  244 |     // 보라로 들어와도 같은 공간
  245 |     await signIn(page, 'bora@example.com');
  246 |     await expect(page.getByTestId('headline')).toBeVisible();
  247 |     await page.goto('/space');
  248 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  249 |   });
  250 | 
  251 |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  252 |     await signIn(page, OWNER);
  253 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  254 |     await page.getByRole('menuitem', { name: /여행 기록 남기기/ }).click();
  255 |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  256 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  257 |     await page.getByLabel('연도').selectOption('2024');
  258 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  259 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  260 |     await shot(page, '03-record');
  261 |     await page.getByTestId('save').click();
  262 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  263 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  264 |     await expectMapDrawn(page);
  265 |     await shot(page, '04-detail');
  266 |   });
  267 | 
  268 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  269 |     await signIn(page, OWNER);
  270 |     await page.goto('/record');
  271 |     await pickPlace(page, '일본', '일본');
  272 |     await page.getByPlaceholder(/도시/).fill('교토');
  273 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  274 |     await page.getByRole('button', { name: '계절', exact: true }).click();
  275 |     await page.getByLabel('연도').selectOption('2025');
  276 |     await page.getByRole('button', { name: '가을' }).click();
  277 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  278 |     await page.getByTestId('save').click();
  279 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  280 |   });
  281 | 
  282 |   test('여행 목록과 필터', async ({ page }) => {
  283 |     await signIn(page, OWNER);
  284 |     await page.goto('/trips');
  285 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  286 |     await page.getByRole('button', { name: /^해외/ }).click();
  287 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  288 |     await page.getByRole('button', { name: /^전체/ }).click();
  289 |     await shot(page, '05-trips');
  290 |   });
  291 | 
  292 |   test('홈 통계와 지도', async ({ page }) => {
  293 |     await signIn(page, OWNER);
  294 |     // 횟수는 우리말로 (times): '2번'이 아니라 '두 번'
  295 |     await expect(page.getByTestId('headline')).toContainText('두 번의 여행, 핀 2개 꽂았어요');
  296 |     await expectMapDrawn(page);
  297 |     await shot(page, '06-home');
  298 |     await page.goto('/map');
  299 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  300 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  301 |     await expectMapDrawn(page);
  302 |     await page.waitForTimeout(800);
  303 |     await shot(page, '07-map');
  304 |     await page.getByRole('tab', { name: '세계' }).click();
  305 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  306 |     await page.waitForTimeout(1200);
```