# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩
- Location: tests/app.spec.ts:300:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.trip-cover img')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.trip-cover img') with timeout 15000ms
  - waiting for locator('.trip-cover img')

```

```yaml
- button "뒤로"
- text: 여행
- link "고치기":
  - /url: /trips/RMddDCMo3dVrNi1fma7H/edit
- text: 강릉시 여행 2019.5.3–4 (추정) · 1박 2일
- tablist "여행 보기":
  - tab "개요"
  - tab "일정"
  - tab "사진 3" [selected]
  - tab "글"
- heading "사진 · 3" [level=2]
- button "▶ 슬라이드쇼"
- button "사진 1 크게 보기"
- button "사진 2 크게 보기"
- button "사진 3 크게 보기"
- button "사진"
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - link "기록하기":
    - /url: /record
  - link "지도":
    - /url: /map
  - link "추억":
    - /url: /memories
```

# Test source

```ts
  219 | 
  220 |     // 여행 만들기 → 예정된 여행, 카드는 '예정'
  221 |     await card.getByTestId('wish-plan').click();
  222 |     await expect(page).toHaveURL(/status=planned/);
  223 |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  224 |     await page.getByTestId('save').click();
  225 |     await expect(page.getByTestId('trip-title')).toHaveText('제주 여행');
  226 |     await page.goto('/wishes');
  227 |     await expect(page.getByTestId('wish-card').filter({ hasText: '제주' })).toContainText('예정');
  228 | 
  229 |     // 지도에 깃발
  230 |     await page.goto('/map');
  231 |     await expectMapDrawn(page);
  232 |     await expect(page.getByTestId('wish-flag')).toHaveCount(1);
  233 |     // 깃발이 실제로 제주 위에 그려졌는지 (위치 확인)
  234 |     const jeju = await page.evaluate(() => {
  235 |       const w = window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } };
  236 |       return w.__map.project([126.55, 33.38]);
  237 |     });
  238 |     const mapBox = (await page.getByTestId('map').first().boundingBox())!;
  239 |     const flagBox = (await page.getByTestId('wish-flag').boundingBox())!;
  240 |     expect(Math.abs(flagBox.x + flagBox.width / 2 - (mapBox.x + jeju.x))).toBeLessThan(40);
  241 |     expect(Math.abs(flagBox.y + flagBox.height - (mapBox.y + jeju.y))).toBeLessThan(40);
  242 |     await shot(page, '10b-map-flags');
  243 | 
  244 |     // 여행지 뽑기: 강원 · 바다 → 담기
  245 |     await page.goto('/wishes');
  246 |     await page.getByTestId('dice-open').click();
  247 |     await page.getByLabel('뽑을 범위').selectOption('gangwon');
  248 |     await page.getByRole('button', { name: '바다', exact: true }).click();
  249 |     await page.getByTestId('dice-roll').click();
  250 |     await expect(page.getByTestId('dice-add')).toBeVisible();
  251 |     await expect(page.getByTestId('dice-face')).toContainText('강원');
  252 |     await shot(page, '10c-dice');
  253 |     await page.getByTestId('dice-add').click();
  254 |     await expect(page.getByTestId('wish-card')).toHaveCount(2);
  255 | 
  256 |     // 홈 롤링, 여행 탭에도 보인다
  257 |     await page.goto('/');
  258 |     await expect(page.getByTestId('home-wishes').getByTestId('wish-card').first()).toBeVisible();
  259 |     await expect(page.getByTestId('home-wishes')).toContainText('제주');
  260 |     await page.goto('/trips');
  261 |     await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  262 |   });
  263 | 
  264 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  265 |     await signIn(page, OWNER);
  266 |     await page.goto('/trips');
  267 |     await page.getByText('강릉시 여행', { exact: true }).click();
  268 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  269 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  270 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  271 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  272 |     await expect(page.getByLabel('네이버지도 링크')).toHaveValue('https://naver.me/xYz12');
  273 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  274 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  275 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  276 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  277 |     await shot(page, '11-place-edit');
  278 |     await page.getByTestId('place-save').click();
  279 |     const tp = page.getByTestId('trip-places');
  280 |     await expect(tp).toContainText('초당할머니순두부');
  281 |     await expect(tp).toContainText('또 갈래요');
  282 |     await expect(tp).toContainText('순두부 젤라또까지 완벽');
  283 | 
  284 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  285 |     await page.goto('/');
  286 |     await expectMapDrawn(page);
  287 |     await tapLngLat(page, 128.86, 37.73);
  288 |     const sheet = page.getByTestId('region-sheet');
  289 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  290 |     await expect(sheet).toContainText('우리 장소 · 1');
  291 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  292 | 
  293 |     // 우리 장소 목록과 '또 갈래요' 거르기
  294 |     await page.goto('/places');
  295 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  296 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  297 |     await shot(page, '11b-places');
  298 |   });
  299 | 
  300 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  301 |     await signIn(page, OWNER);
  302 |     await page.goto('/trips');
  303 |     await page.getByText('강릉시 여행', { exact: true }).click();
  304 |     await page.getByRole('tab', { name: /사진/ }).click();
  305 |     const sec = page.getByTestId('trip-photos');
  306 |     await sec.getByTestId('photo-input').setInputFiles([
  307 |       'tests/fixtures/photo-gangneung.jpg',
  308 |       'tests/fixtures/photo-gangneung2.jpg',
  309 |       'tests/fixtures/photo-noexif.jpg',
  310 |     ]);
  311 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  312 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  313 |     // 촬영일(2019.5.3~4)로 날짜 채우기 → '(추정)'
  314 |     const sug = page.getByTestId('photo-suggest');
  315 |     await expect(sug).toContainText('2019.5.3–4');
  316 |     await sug.getByRole('button', { name: '채우기' }).click();
  317 |     await expect(page.getByText('2019.5.3–4 (추정)')).toBeVisible();
  318 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
> 319 |     await expect(page.locator('.trip-cover img')).toBeVisible();
      |                                                   ^ Error: expect(locator).toBeVisible() failed
  320 |     await shot(page, '12-photos');
  321 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  322 |     await sec.locator('.photo-cell img').first().click();
  323 |     const cap = page.locator('.pswp__caption-bp');
  324 |     await expect(cap).toContainText('2019.5.3 14:20');
  325 |     await expect(cap).toContainText('강원 강릉시');
  326 |     await page.waitForTimeout(600);
  327 |     await shot(page, '12b-slideshow');
  328 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  329 |     await page.keyboard.press('Escape');
  330 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  331 |     await page.goto('/memories');
  332 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  333 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  334 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  335 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  336 |     await expect(albumImgs).toHaveCount(3);
  337 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  338 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  339 |     await page.getByLabel('다시 보기 연도').fill('0');
  340 |     const firstYear = await page.getByTestId('replay-year').textContent();
  341 |     await page.getByTestId('replay-play').click();
  342 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  343 |     await page.getByLabel('결산 연도').selectOption('2019');
  344 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  345 |     await expect(page.getByTestId('year-review')).toContainText('2');
  346 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  347 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  348 |     await shot(page, '12c-memories');
  349 |   });
  350 | 
  351 |   test('여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  352 |     await signIn(page, OWNER);
  353 |     // 일정: 날짜가 있는 강릉 여행(사진으로 2019.5.3–4)
  354 |     await page.goto('/trips');
  355 |     await page.getByText('강릉시 여행', { exact: true }).click();
  356 |     await page.getByRole('tab', { name: '일정' }).click();
  357 |     const plan = page.getByTestId('plan-tab');
  358 |     await plan.getByLabel('가볼 곳 추가').fill('경포대');
  359 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  360 |     await plan.getByLabel('가볼 곳 추가').fill('안목 커피거리');
  361 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  362 |     // 우리 장소에서 바로 넣기
  363 |     await plan.getByRole('button', { name: '초당할머니순두부' }).click();
  364 |     await expect(plan.getByTestId('plan-item')).toHaveCount(3);
  365 |     // ② 날짜 ③ 시간·예약
  366 |     await plan.getByRole('button', { name: /경포대/ }).click();
  367 |     await plan.getByLabel('날짜').selectOption('2019-05-04');
  368 |     await plan.getByLabel('시간').fill('18:30');
  369 |     await expect(plan).toContainText('2일째 · 5.4 (토)');
  370 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '경포대' })).toContainText('18:30');
  371 |     await shot(page, '13-plan');
  372 | 
  373 |     // 기록: 쓴 사람이 보인다
  374 |     await page.getByRole('tab', { name: /글/ }).click();
  375 |     const notes = page.getByTestId('notes-tab');
  376 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  377 |     await notes.getByRole('button', { name: '남기기' }).click();
  378 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  379 |     await expect(notes.getByTestId('note')).toContainText('영상');
  380 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  381 | 
  382 |     // 준비물: 예정된 제주 여행
  383 |     await page.goto('/trips');
  384 |     await page.getByText('제주 여행', { exact: true }).click();
  385 |     const pack = page.getByTestId('packing');
  386 |     await pack.getByRole('button', { name: '휴양' }).click();
  387 |     await expect(pack).toContainText('수영복');
  388 |     await pack.getByLabel('수영복 챙김').check();
  389 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  390 |     await pack.getByLabel('선크림 담당자').click();
  391 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  392 |     await shot(page, '13b-packing');
  393 |   });
  394 | 
  395 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  396 |     await signIn(page, OWNER);
  397 |     const box = page.getByTestId('home-ask').getByLabel('찾아보기');
  398 |     await box.fill('강릉 맛집');
  399 |     await box.press('Enter');
  400 |     await expect(page).toHaveURL(/\/ask/);
  401 |     const answers = page.getByTestId('answer');
  402 |     await expect(answers.last()).toContainText('초당 순두부');
  403 |     await expect(answers.last()).toContainText('초당할머니순두부');
  404 |     const input = page.getByLabel('질문');
  405 |     await input.fill('거기 언제 가면 좋아?');
  406 |     await input.press('Enter');
  407 |     await expect(answers.last()).toContainText('강원 강릉시은(는)');
  408 |     await input.fill('강릉 몇 번 갔지?');
  409 |     await input.press('Enter');
  410 |     await expect(answers.last()).toContainText('1번 다녀왔어요');
  411 |     await input.fill('고성 맛집');
  412 |     await input.press('Enter');
  413 |     await expect(answers.last()).toContainText('여러 곳');
  414 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  415 |     await expect(answers.last()).toContainText('강원 고성군');
  416 |     await shot(page, '14-ask');
  417 |     await page.getByRole('button', { name: '처음으로' }).click();
  418 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  419 |     await expect(answers.last()).toContainText('시·군');
```