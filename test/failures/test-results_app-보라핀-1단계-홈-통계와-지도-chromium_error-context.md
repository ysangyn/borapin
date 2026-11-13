# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 홈 통계와 지도
- Location: tests/app.spec.ts:236:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('headline')
Expected substring: "두 번의 여행,핀 2개 꽂았어요"
Received string:    "두 번의 여행, 핀 2개 꽂았어요"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('headline') with timeout 15000ms
  - waiting for getByTestId('headline')
    2 × locator resolved to <div class="headline" data-testid="headline">…</div>
      - unexpected value ""
    30 × locator resolved to <div class="headline" data-testid="headline">…</div>
       - unexpected value "두 번의 여행, 핀 2개 꽂았어요"

```

```yaml
- text: 두 번의 여행, 핀 2개 꽂았어요
```

# Test source

```ts
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
  168 |   test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
  169 |     await signIn(page, 'stranger@example.com');
  170 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  171 |     // 다음에 뭘 해야 하는지와 복사할 메일 주소가 보인다
  172 |     await expect(page.getByText(/우리 공간 → 함께 쓰는 사람 → 추가/)).toBeVisible();
  173 |     await expect(page.getByTestId('denied-mail')).toContainText('stranger@example.com');
  174 |     await shot(page, '10-denied');
  175 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  176 |     await signIn(page, OWNER);
  177 |     // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
  178 |     await page.goto('/space');
  179 |     await expect(page.getByTestId('space-title')).toHaveText('영상');
  180 |     await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
  181 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  182 |     await page.getByRole('textbox', { name: '부를 이름' }).fill('보라');
  183 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  184 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  185 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  186 |     await shot(page, '11-space');
  187 |     await page.getByRole('button', { name: '로그아웃' }).click();
  188 |     // 보라로 들어와도 같은 공간
  189 |     await signIn(page, 'bora@example.com');
  190 |     await expect(page.getByTestId('headline')).toBeVisible();
  191 |     await page.goto('/space');
  192 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  193 |   });
  194 | 
  195 |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  196 |     await signIn(page, OWNER);
  197 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  198 |     await page.getByRole('menuitem', { name: /여행 기록 남기기/ }).click();
  199 |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  200 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  201 |     await page.getByLabel('연도').selectOption('2024');
  202 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  203 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  204 |     await shot(page, '03-record');
  205 |     await page.getByTestId('save').click();
  206 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  207 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  208 |     await expectMapDrawn(page);
  209 |     await shot(page, '04-detail');
  210 |   });
  211 | 
  212 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  213 |     await signIn(page, OWNER);
  214 |     await page.goto('/record');
  215 |     await pickPlace(page, '일본', '일본');
  216 |     await page.getByPlaceholder(/도시/).fill('교토');
  217 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  218 |     await page.getByRole('button', { name: '계절', exact: true }).click();
  219 |     await page.getByLabel('연도').selectOption('2025');
  220 |     await page.getByRole('button', { name: '가을' }).click();
  221 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  222 |     await page.getByTestId('save').click();
  223 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  224 |   });
  225 | 
  226 |   test('여행 목록과 필터', async ({ page }) => {
  227 |     await signIn(page, OWNER);
  228 |     await page.goto('/trips');
  229 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  230 |     await page.getByRole('button', { name: /^해외/ }).click();
  231 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  232 |     await page.getByRole('button', { name: /^전체/ }).click();
  233 |     await shot(page, '05-trips');
  234 |   });
  235 | 
  236 |   test('홈 통계와 지도', async ({ page }) => {
  237 |     await signIn(page, OWNER);
  238 |     // 횟수는 우리말로 (times): '2번'이 아니라 '두 번'
> 239 |     await expect(page.getByTestId('headline')).toContainText('두 번의 여행,핀 2개 꽂았어요');
      |                                                ^ Error: expect(locator).toContainText(expected) failed
  240 |     await expectMapDrawn(page);
  241 |     await shot(page, '06-home');
  242 |     await page.goto('/map');
  243 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  244 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  245 |     await expectMapDrawn(page);
  246 |     await page.waitForTimeout(800);
  247 |     await shot(page, '07-map');
  248 |     await page.getByRole('tab', { name: '세계' }).click();
  249 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  250 |     await page.waitForTimeout(1200);
  251 |     await expectMapDrawn(page);
  252 |     await shot(page, '08-map-world');
  253 |   });
  254 | 
  255 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  256 |     await signIn(page, OWNER);
  257 |     await expectMapDrawn(page);
  258 |     // 부산을 누른다
  259 |     await tapLngLat(page, 129.06, 35.2);
  260 |     const sheet = page.getByTestId('region-sheet');
  261 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
  262 |     await expect(sheet).toContainText('아직 안 가본 곳');
  263 |     // 여행정보: 볼거리·먹거리, 더보기로 구·군
  264 |     const info = sheet.getByTestId('region-info');
  265 |     await expect(info).toContainText('볼거리');
  266 |     await info.getByRole('button', { name: /더보기/ }).click();
  267 |     await expect(info).toContainText('해운대구');
  268 |     await shot(page, '09a-region-info');
  269 |     await info.getByRole('button', { name: '접기' }).click();
  270 |     await sheet.getByTestId('quick-pin').click();
  271 |     await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
  272 |     await expect(sheet).toContainText('다녀왔어요');
  273 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  274 |     // 되돌리기
  275 |     await page.getByRole('button', { name: '되돌리기' }).click();
  276 |     await expect(sheet).toContainText('아직 안 가본 곳');
  277 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
  278 |     // 다시 꽂아 둔다
  279 |     await sheet.getByTestId('quick-pin').click();
  280 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  281 |     // 꽃 지도: 핀만 꽂아도 고장 꽃 따라 보랏빛으로 물들기 시작 (지도 칸 자료에 물빛 색이 들어가고, 시트에 한 줄)
  282 |     await expect(sheet.getByTestId('plant-line')).toContainText('보랏빛으로 물들기 시작했어요');
  283 |     await expect.poll(() => page.evaluate(() => {
  284 |       const m = (window as unknown as { __map: { querySourceFeatures: (s: string) => { properties: Record<string, unknown> }[] } }).__map;
  285 |       return m.querySourceFeatures('kr').find((f) => f.properties.cell === '26')?.properties.wash ?? null;
  286 |     })).toMatch(/^#[0-9A-F]{6}$/);
  287 |     await expect(page.getByTestId('headline')).toContainText('세 번의 여행,핀 3개 꽂았어요');
  288 |     await shot(page, '09-sheet');
  289 |     await sheet.getByRole('button', { name: '닫기' }).click();
  290 |     await expect(sheet).toHaveCount(0);
  291 | 
  292 |     // 확대하면 시·군 이름이 보이고, 다녀온 곳은 진하게
  293 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [128.95, 35.25], zoom: 7.6 }));
  294 |     // 이름표는 숨길 때 지우지 않고 display:none으로 두므로(끌 때 같이 움직이게), 보이는 것만 고른다
  295 |     const busan = page.locator('.map-label:visible', { hasText: /^부산$/ });
  296 |     await expect(busan).toBeVisible();
  297 |     await expect(busan).toHaveClass(/\bon\b/);
  298 |     await expect(page.locator('.map-label:visible', { hasText: /^김해시$/ })).toBeVisible();
  299 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  300 |     await shot(page, '09b-labels-cells');
  301 | 
  302 |     // 큰 지도: 중간 확대에서는 도 이름
  303 |     await page.goto('/map');
  304 |     await expectMapDrawn(page);
  305 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [127.9, 36.3], zoom: 6.1 }));
  306 |     await expect(page.locator('.map-label.province', { hasText: '강원' })).toHaveClass(/\bon\b/);
  307 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).toBeVisible();
  308 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).not.toHaveClass(/\bon\b/);
  309 |     await shot(page, '09c-labels-provinces');
  310 | 
  311 |     // 세계: 나라 이름, 다녀온 일본은 진하게
  312 |     await page.getByRole('tab', { name: '세계' }).click();
  313 |     await page.waitForTimeout(900);
  314 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [131, 35], zoom: 3.4 }));
  315 |     await expect(page.locator('.map-label.country', { hasText: /^일본$/ })).toHaveClass(/\bon\b/);
  316 |     await expect(page.locator('.map-label.country', { hasText: /^한국$/ })).toHaveClass(/\bon\b/);
  317 |     await shot(page, '09d-labels-world');
  318 | 
  319 |     // 우리 공간에는 더 이상 가져오기 버튼이 없다
  320 |     await page.goto('/space');
  321 |     await expect(page.getByText('백업 파일 내려받기')).toBeVisible();
  322 |     await expect(page.getByText(/가져오기/)).toHaveCount(0);
  323 |   });
  324 | 
  325 |   test('가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기', async ({ page }) => {
  326 |     await signIn(page, OWNER);
  327 |     // 비어 있으면 홈에 이번 달 추천 3곳
  328 |     const homeWishes = page.getByTestId('home-wishes');
  329 |     await expect(homeWishes).toContainText('가고 싶은 곳 3곳만 담아볼까요?');
  330 |     await expect(homeWishes.getByRole('button', { name: '담기' })).toHaveCount(3);
  331 |     await expectMapDrawn(page);
  332 |     // 추천지 이름을 누르면 지도의 지역 창이 열려 자세히 보고 바로 기록할 수 있다
  333 |     const firstPick = homeWishes.getByTestId('pick-detail').first();
  334 |     const pickName = (await firstPick.getAttribute('aria-label'))!.replace(' 자세히 보기', '');
  335 |     await firstPick.click();
  336 |     await expect(page).toHaveURL(/\/map\?sel=/);
  337 |     // 창 제목은 '전북 순창'처럼 시·군을 뗀 이름: 앞 두 글자(지역 이름 첫머리)로 맞춰 본다
  338 |     await expect(page.getByTestId('region-sheet').getByTestId('sheet-title')).toContainText(pickName.split(' ').pop()!.slice(0, 2));
  339 |     await expect(page.getByTestId('region-sheet').getByRole('link', { name: '자세히 기록' })).toBeVisible();
```