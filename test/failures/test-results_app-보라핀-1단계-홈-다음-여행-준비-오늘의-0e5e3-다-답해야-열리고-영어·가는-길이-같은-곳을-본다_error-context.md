# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다
- Location: tests/app.spec.ts:362:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('feed-dot')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('feed-dot') with timeout 15000ms
  - waiting for getByTestId('feed-dot')

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "보라에게 물어봐":
  - /url: /ask
- link "우리 공간":
  - /url: /space
  - text: 보 영
- text: 보라 & 영상의 지도 3번의 여행, 핀 3개
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해 1
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · ⛶ 를 누르면 전국이 보여요 2 다녀온 시·군 1 해외 나라 3 여행·나들이 1 예정
- textbox "보라에게 물어봐":
  - /placeholder: "보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳"
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 2곳":
  - /url: /wishes
- link "다음 여행 제주 여행 2026년쯤":
  - /url: /trips/Cg4Gscr2e5YrZP5SkwkZ
- link "대만 가오슝 그다음은 여기 · 영상":
  - /url: /wishes/TkbfBBeuQwcH8lAOYut7
- link "강원 동해시 그다음은 여기 · 영상":
  - /url: /wishes/CeV4HQSJN6MNu4cuOgd2
- text: 오늘의 한 질문
- paragraph: 제주 가는 길에 들렀다 가고 싶은 곳은?
- text: 나 흑돼지랑 고기국수
- button "메모에 넣기"
- text: 보라 한라산 보이는 카페
- button "메모에 넣기"
- link "오늘의 영어 How long is the boat tour? 보트 투어는 얼마나 걸려요? 시작하기 · 3문장 · 90초":
  - /url: /study
- text: 제주 가는 길
- button "가기 좋은 때 5·6, 9~11월 · 덥지도 춥지도 않아요"
- img "전주 한옥마을"
- text: 전주 한옥마을 10월에 가기 좋은 곳 전북 전주시 한옥의 곡선과 선비의 풍류가 머무는 곳 가기 좋은 때 4·5, 9·10월
- button "가고 싶은 곳에 담기"
- link "자세히":
  - /url: /map?sel=kr:52
- link "여기 기록하기":
  - /url: /record?place=kr:52
- link "교토 작년 가을 교토 단풍 여행 2025년 가을":
  - /url: /trips/4WIBuDDCwY9Rl1UnX77p
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "부산 여행 부산 · 날짜 모름":
  - /url: /trips/bXbVwboriFgGyVbULnj8
- link "일본 교토 단풍 여행 일본 교토 · 2025년 가을":
  - /url: /trips/4WIBuDDCwY9Rl1UnX77p
- link "강릉시 여행 강원 강릉시 · 2024년쯤 엄마와 함께":
  - /url: /trips/XVh5JTQNwrRxQK5Q6CUa
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - link "기록하기":
    - /url: /record
  - link "지도":
    - /url: /map
  - link "피드":
    - /url: /feed
- link "보라에게 물어봐":
  - /url: /ask
- status
```

# Test source

```ts
  294 |     expect(Math.abs(flagBox.y + flagBox.height - (mapBox.y + jeju.y))).toBeLessThan(40);
  295 |     await shot(page, '10b-map-flags');
  296 | 
  297 |     // 여행지 뽑기: 강원 · 바다 → 담기
  298 |     await page.goto('/wishes');
  299 |     await page.getByTestId('dice-open').click();
  300 |     await page.getByLabel('뽑을 범위').selectOption('gangwon');
  301 |     await page.getByRole('button', { name: '바다', exact: true }).click();
  302 |     await page.getByTestId('dice-roll').click();
  303 |     await expect(page.getByTestId('dice-add')).toBeVisible();
  304 |     await expect(page.getByTestId('dice-face')).toContainText('강원');
  305 |     await shot(page, '10c-dice');
  306 |     await page.getByTestId('dice-add').click();
  307 |     await expect(page.getByTestId('wish-card')).toHaveCount(2);
  308 | 
  309 |     // 해외 도시 고르기: 속성을 조합한다 (예산 가볍게 + 4시간 안 + 미식) → 목록이 줄고 → 담기
  310 |     await page.getByLabel('뽑을 범위').selectOption('world');
  311 |     const wp = page.getByTestId('world-picker');
  312 |     await expect(wp).toBeVisible();
  313 |     await wp.getByLabel('떠날 달').selectOption('1');
  314 |     const before = Number((await wp.getByTestId('world-count').textContent())!.match(/\d+/)![0]);
  315 |     await wp.getByRole('button', { name: '가볍게' }).click();
  316 |     await wp.getByRole('button', { name: '4시간 안' }).click();
  317 |     await wp.getByRole('button', { name: '미식', exact: true }).click();
  318 |     const after = Number((await wp.getByTestId('world-count').textContent())!.match(/\d+/)![0]);
  319 |     expect(after).toBeGreaterThan(0);
  320 |     expect(after).toBeLessThan(before);
  321 |     const rows = wp.getByTestId('world-city');
  322 |     await expect(rows.first()).toContainText('물가 가벼움');
  323 |     await expect(rows.first()).toContainText('인천에서');
  324 |     await shot(page, '10e-world-picker');
  325 |     const cityName = (await rows.first().locator('.t').textContent())!.trim().split(' ')[0];
  326 |     await rows.first().getByTestId('world-add').click();
  327 |     await expect(page.getByRole('status')).toContainText(`가고 싶은 곳에 담았어요`);
  328 |     await expect(page.getByTestId('wish-card')).toHaveCount(3);
  329 |     // 해외 도시 카드엔 도시 정보: 통화·입국·먹을 것, 눌러서 메모에 넣기
  330 |     await page.getByTestId('wish-card').filter({ hasText: cityName }).locator('.wish-main').click();
  331 |     await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  332 |     const info = page.getByTestId('city-info');
  333 |     await expect(info).toBeVisible();
  334 |     await expect(info).toContainText('입국');
  335 |     await expect(info).toContainText('떠나기 전 확인');
  336 |     const firstEat = info.getByRole('button', { name: /메모에 넣기$/ }).first();
  337 |     const eatText = (await firstEat.getAttribute('aria-label'))!.replace(' 메모에 넣기', '');
  338 |     await firstEat.click();
  339 |     await expect(page.getByLabel('먹을 것')).toHaveValue(new RegExp(eatText));
  340 |     await shot(page, '10f-city-info');
  341 |     await page.getByTestId('wish-save').click();
  342 |     await expect(page.getByRole('status')).toContainText('고쳤어요');
  343 |     // 현지어 한마디: 30문장, 묶음으로 거르기, 영어권은 오늘의 영어로
  344 |     await page.goto('/phrases/ja?city=교토');
  345 |     await expect(page.getByTestId('phrase-row')).toHaveCount(30);
  346 |     await expect(page.getByTestId('phrases')).toContainText('교토에서');
  347 |     await page.getByRole('tab', { name: '급할 때' }).click();
  348 |     await expect(page.getByTestId('phrase-row')).toHaveCount(4);
  349 |     await expect(page.getByTestId('phrase-row').first()).toContainText('도와주세요');
  350 |     await shot(page, '10g-phrases');
  351 |     await page.goto('/phrases/tr');
  352 |     await expect(page.getByTestId('phrases')).toContainText('아직 없어요');
  353 | 
  354 |     // 홈 '다음 여행 준비'는 예정된 제주 여행을 맡고, 여행 탭에도 보인다
  355 |     await page.goto('/');
  356 |     await expect(page.getByTestId('next-hub')).toHaveAttribute('data-anchor', 'trip');
  357 |     await expect(page.getByTestId('hub-first')).toContainText('제주 여행');
  358 |     await page.goto('/trips');
  359 |     await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  360 |   });
  361 | 
  362 |   test('홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다', async ({ page, browser }) => {
  363 |     await signIn(page, OWNER);
  364 |     const hub = page.getByTestId('next-hub');
  365 |     await expect(hub).toBeVisible();
  366 |     // 1. 다음은 어디: 예정된 제주 여행이 맨 위, 그다음은 가고 싶은 곳(강원)
  367 |     await expect(hub.getByTestId('hub-first')).toContainText('제주 여행');
  368 |     await expect(hub.locator('.hub-others')).toContainText('강원');
  369 |     // 2. 오늘의 한 질문: 제주 이야기. 내가 답하면 상대 답은 잠겨 있다
  370 |     const ask = hub.getByTestId('hub-ask');
  371 |     await expect(ask).toContainText('제주');
  372 |     await ask.getByLabel('오늘의 질문 답').fill('흑돼지랑 고기국수');
  373 |     await ask.getByTestId('hub-ask-send').click();
  374 |     await expect(page.getByRole('status')).toContainText('답을 남겼어요');
  375 |     await expect(ask.locator('.hub-answer.mine')).toContainText('흑돼지랑 고기국수');
  376 |     await expect(ask.getByTestId('hub-ask-waiting')).toBeVisible();
  377 |     await expect(ask.getByTestId('hub-answer-other')).toHaveCount(0);
  378 |     await shot(page, '10d-home-hub');
  379 |     // 보라가 들어와 같은 질문을 보고 답하면 → 서로의 답이 열린다 (내 화면은 새로 고침 없이)
  380 |     const bora = await browser.newPage();
  381 |     await signIn(bora, 'bora@example.com');
  382 |     const bAsk = bora.getByTestId('hub-ask');
  383 |     await expect(bAsk).toContainText('제주');
  384 |     await expect(bAsk.getByTestId('hub-answer-other')).toHaveCount(0);
  385 |     await bAsk.getByLabel('오늘의 질문 답').fill('한라산 보이는 카페');
  386 |     await bAsk.getByTestId('hub-ask-send').click();
  387 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('흑돼지랑 고기국수');
  388 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('영상');
  389 |     await bora.close();
  390 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('한라산 보이는 카페');
  391 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('보라');
  392 |     await expect(ask.getByTestId('hub-ask-waiting')).toHaveCount(0);
  393 |     // 상대의 답은 새 소식: 아래 메뉴에 점, 피드에 '오늘의 질문에 답함'
> 394 |     await expect(page.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
      |                                                ^ Error: expect(locator).toBeVisible() failed
  395 |     await page.getByTestId('nav-feed').click();
  396 |     const askItem = page.locator('[data-testid="feed-item"][data-kind="ask"]').first();
  397 |     await expect(askItem).toContainText('한라산 보이는 카페');
  398 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  399 |     await page.goto('/');
  400 |     // 먹을 것·가볼 곳 질문이면 답을 가고 싶은 곳 메모에 넣을 수 있다 (오늘 질문이 그런 종류일 때)
  401 |     const save = ask.locator('.hub-answer.mine').getByRole('button', { name: '메모에 넣기' });
  402 |     if (await save.count()) {
  403 |       await save.click();
  404 |       await expect(page.getByRole('status')).toContainText('메모에 넣었어요');
  405 |       await page.getByRole('status').getByRole('button', { name: '보기' }).click();
  406 |       await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  407 |       await expect.poll(() => page.locator('textarea').evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value).join('\n')), { timeout: 15_000 }).toContain('흑돼지랑 고기국수');
  408 |       await page.goto('/');
  409 |     }
  410 |     // 3. 오늘의 영어: 영어 한 문장이 보이고 누르면 공부 화면
  411 |     const en = hub.getByTestId('hub-english');
  412 |     await expect(en.locator('.hub-en')).toHaveText(/[A-Za-z]{3,}/);
  413 |     await expect(en).toContainText(/\d문장 · 90초/);
  414 |     // 4. 가는 길: 같은 곳(제주)의 가기 좋은 때
  415 |     const way = hub.getByTestId('hub-way');
  416 |     await expect(way).toContainText('제주');
  417 |     await expect(way).toContainText('가기 좋은 때');
  418 |     // 바깥 링크(항공권·뉴스)는 국내 여행지엔 없다
  419 |     await expect(way.getByRole('link')).toHaveCount(0);
  420 |     await en.click();
  421 |     await expect(page).toHaveURL(/\/study$/);
  422 |   });
  423 | 
  424 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  425 |     await signIn(page, OWNER);
  426 |     await page.goto('/trips');
  427 |     await page.getByText('강릉시 여행', { exact: true }).click();
  428 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  429 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  430 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  431 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  432 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
  433 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  434 |     // 가리고 쓰기: 켜면 내 것을 쓰기 전엔 보라 칸이 가려지고, 쓰면 열린다 (끄면 그냥 보인다)
  435 |     await page.getByTestId('blind-toggle').click();
  436 |     await expect(page.getByTestId('review-hidden')).toBeVisible();
  437 |     await expect(page.getByLabel('보라 한 줄 평')).toHaveCount(0);
  438 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  439 |     await expect(page.getByLabel('보라 한 줄 평')).toBeVisible();
  440 |     await page.getByTestId('blind-toggle').click();
  441 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  442 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  443 |     await shot(page, '11-place-edit');
  444 |     await page.getByTestId('place-save').click();
  445 |     const tp = page.getByTestId('trip-places');
  446 |     await expect(tp).toContainText('초당할머니순두부');
  447 |     await expect(tp).toContainText('또 갈래요');
  448 |     await expect(tp).toContainText('순두부 젤라또까지 완벽');
  449 | 
  450 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  451 |     await page.goto('/');
  452 |     await expectMapDrawn(page);
  453 |     await tapLngLat(page, 128.86, 37.73);
  454 |     const sheet = page.getByTestId('region-sheet');
  455 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  456 |     await expect(sheet).toContainText('우리 장소 · 1');
  457 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  458 | 
  459 |     // 우리 장소 목록과 '또 갈래요' 거르기
  460 |     await page.goto('/places');
  461 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  462 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  463 |     await shot(page, '11b-places');
  464 |   });
  465 | 
  466 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  467 |     await signIn(page, OWNER);
  468 |     await page.goto('/trips');
  469 |     await page.getByText('강릉시 여행', { exact: true }).click();
  470 |     await page.getByRole('tab', { name: /사진/ }).click();
  471 |     const sec = page.getByTestId('trip-photos');
  472 |     await sec.getByTestId('photo-input').setInputFiles([
  473 |       'tests/fixtures/photo-gangneung.jpg',
  474 |       'tests/fixtures/photo-gangneung2.jpg',
  475 |       'tests/fixtures/photo-noexif.jpg',
  476 |     ]);
  477 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  478 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  479 |     // 촬영일(2019.5.3~4)로 날짜 채우기 → '(추정)'
  480 |     const sug = page.getByTestId('photo-suggest');
  481 |     await expect(sug).toContainText('2019.5.3–4');
  482 |     await sug.getByRole('button', { name: '채우기' }).click();
  483 |     await expect(page.getByText('2019.5.3–4 (추정)')).toBeVisible();
  484 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  485 |     await shot(page, '12-photos');
  486 |     // 표지 사진은 개요 탭 위에
  487 |     await page.getByRole('tab', { name: '개요' }).click();
  488 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  489 |     await page.getByRole('tab', { name: /사진/ }).click();
  490 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  491 |     await sec.locator('.photo-cell img').first().click();
  492 |     const cap = page.locator('.pswp__caption-bp');
  493 |     await expect(cap).toContainText('2019.5.3 14:20');
  494 |     await expect(cap).toContainText('강원 강릉시');
```