# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 새 공간 열어 주기: 주인이 링크를 만들고 → 받은 사람은 우리와 따로 쓰는 자기 공간의 관리자가 된다
- Location: tests/app.spec.ts:168:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "처제로 불려요"
Received string:    ""
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByRole('status') with timeout 15000ms
  - waiting for getByRole('status')
    34 × locator resolved to <div role="status" aria-live="polite" class="toast-region"></div>
       - unexpected value ""

```

```yaml
- heading "우리 집은 어디예요?" [level=1]
- paragraph: 집을 알면 '가까운 곳'과 가는 길을 바로 알려 드려요. 시·군까지만 적어도 돼요.
- text: 우리 집
- button "우리 집 정하기 가고 싶은 곳까지 가는 길을 바로 열 수 있어요"
- button "지도 보러 가기"
- status
```

# Test source

```ts
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
  197 |     await p2.getByLabel('내 이름').fill('처제');
  198 |     await p2.getByTestId('welcome-name-next').click();
> 199 |     await expect(p2.getByRole('status')).toContainText('처제로 불려요');
      |                                          ^ Error: expect(locator).toContainText(expected) failed
  200 |     await p2.getByTestId('welcome-done').click();
  201 |     await expect(p2.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
  202 |     // 설정: 함께 쓰는 사람은 나 하나(관리자). 우리 공간 사람은 보이지 않고, 새 공간 열어 주기는 주인에게만
  203 |     await p2.goto('/space');
  204 |     await expect(p2.getByText('sister@example.com')).toBeVisible();
  205 |     await expect(p2.getByText(OWNER)).toHaveCount(0);
  206 |     await expect(p2.getByText('관리자', { exact: true }).first()).toBeVisible();
  207 |     await expect(p2.getByTestId('new-space-section')).toHaveCount(0);
  208 |     await expect(p2.getByTestId('admin-link')).toHaveCount(0);
  209 |     // 자기 공간에 짝을 들이는 초대 링크를 만든다
  210 |     await p2.getByLabel('초대 이름').fill('제부');
  211 |     await p2.getByTestId('invite-make').click();
  212 |     await expect(p2.getByTestId('invite-row').first()).toContainText('제부 초대');
  213 |     await shot(p2, '02f-new-space-settings');
  214 |     await ctx.close();
  215 |     // 주인 화면: 그 링크는 쓰여서 사라졌고, 우리 함께 쓰는 사람에 처제는 없다
  216 |     await page.reload();
  217 |     await expect(page.getByTestId('new-space-section').getByTestId('invite-row')).toHaveCount(0);
  218 |     await expect(page.getByText('sister@example.com')).toHaveCount(0);
  219 |   });
  220 | 
  221 |   test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
  222 |     await signIn(page, 'stranger@example.com');
  223 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  224 |     // 다음에 뭘 해야 하는지와 복사할 메일 주소가 보인다
  225 |     await expect(page.getByText(/우리 공간 → 함께 쓰는 사람 → 추가/)).toBeVisible();
  226 |     await expect(page.getByTestId('denied-mail')).toContainText('stranger@example.com');
  227 |     await shot(page, '10-denied');
  228 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  229 |     await signIn(page, OWNER);
  230 |     // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
  231 |     await page.goto('/space');
  232 |     await expect(page.getByTestId('space-title')).toHaveText('영상');
  233 |     await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
  234 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  235 |     await page.getByRole('textbox', { name: '부를 이름' }).fill('보라');
  236 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  237 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  238 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  239 |     await shot(page, '11-space');
  240 |     await page.getByRole('button', { name: '로그아웃' }).click();
  241 |     // 보라로 들어와도 같은 공간
  242 |     await signIn(page, 'bora@example.com');
  243 |     await expect(page.getByTestId('headline')).toBeVisible();
  244 |     await page.goto('/space');
  245 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  246 |   });
  247 | 
  248 |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  249 |     await signIn(page, OWNER);
  250 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  251 |     await page.getByRole('menuitem', { name: /여행 기록 남기기/ }).click();
  252 |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  253 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  254 |     await page.getByLabel('연도').selectOption('2024');
  255 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  256 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  257 |     await shot(page, '03-record');
  258 |     await page.getByTestId('save').click();
  259 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  260 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  261 |     await expectMapDrawn(page);
  262 |     await shot(page, '04-detail');
  263 |   });
  264 | 
  265 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  266 |     await signIn(page, OWNER);
  267 |     await page.goto('/record');
  268 |     await pickPlace(page, '일본', '일본');
  269 |     await page.getByPlaceholder(/도시/).fill('교토');
  270 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  271 |     await page.getByRole('button', { name: '계절', exact: true }).click();
  272 |     await page.getByLabel('연도').selectOption('2025');
  273 |     await page.getByRole('button', { name: '가을' }).click();
  274 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  275 |     await page.getByTestId('save').click();
  276 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  277 |   });
  278 | 
  279 |   test('여행 목록과 필터', async ({ page }) => {
  280 |     await signIn(page, OWNER);
  281 |     await page.goto('/trips');
  282 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  283 |     await page.getByRole('button', { name: /^해외/ }).click();
  284 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  285 |     await page.getByRole('button', { name: /^전체/ }).click();
  286 |     await shot(page, '05-trips');
  287 |   });
  288 | 
  289 |   test('홈 통계와 지도', async ({ page }) => {
  290 |     await signIn(page, OWNER);
  291 |     // 횟수는 우리말로 (times): '2번'이 아니라 '두 번'
  292 |     await expect(page.getByTestId('headline')).toContainText('두 번의 여행, 핀 2개 꽂았어요');
  293 |     await expectMapDrawn(page);
  294 |     await shot(page, '06-home');
  295 |     await page.goto('/map');
  296 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  297 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  298 |     await expectMapDrawn(page);
  299 |     await page.waitForTimeout(800);
```