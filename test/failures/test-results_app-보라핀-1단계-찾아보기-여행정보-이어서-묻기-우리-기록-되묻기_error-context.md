# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기
- Location: tests/app.spec.ts:398:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('answer').last()
Expected substring: "강원 강릉시은(는)"
Received string:    "강원 강릉시는 4~6 · 9·10월이 좋아요선선하고 비가 적어요우리가 갔던 때: 5월NASA POWER 월별 기후값으로 계산지도에서 보기가고 싶은 곳에 담기여행 만들기네이버지도"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('answer').last() with timeout 15000ms
  - waiting for getByTestId('answer').last()
    34 × locator resolved to <div class="bubble bot" data-testid="answer">…</div>
       - unexpected value "강원 강릉시는 4~6 · 9·10월이 좋아요선선하고 비가 적어요우리가 갔던 때: 5월NASA POWER 월별 기후값으로 계산지도에서 보기가고 싶은 곳에 담기여행 만들기네이버지도"

```

```yaml
- text: 강원 강릉시는 4~6 · 9·10월이 좋아요
- list:
  - listitem: 선선하고 비가 적어요
  - listitem: "우리가 갔던 때: 5월"
- text: NASA POWER 월별 기후값으로 계산
- button "지도에서 보기"
- button "가고 싶은 곳에 담기"
- button "여행 만들기"
- button "네이버지도"
```

# Test source

```ts
  310 |     ]);
  311 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  312 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  313 |     // 촬영일(2019.5.3~4)로 날짜 채우기 → '(추정)'
  314 |     const sug = page.getByTestId('photo-suggest');
  315 |     await expect(sug).toContainText('2019.5.3–4');
  316 |     await sug.getByRole('button', { name: '채우기' }).click();
  317 |     await expect(page.getByText('2019.5.3–4 (추정)')).toBeVisible();
  318 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  319 |     await shot(page, '12-photos');
  320 |     // 표지 사진은 개요 탭 위에
  321 |     await page.getByRole('tab', { name: '개요' }).click();
  322 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  323 |     await page.getByRole('tab', { name: /사진/ }).click();
  324 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  325 |     await sec.locator('.photo-cell img').first().click();
  326 |     const cap = page.locator('.pswp__caption-bp');
  327 |     await expect(cap).toContainText('2019.5.3 14:20');
  328 |     await expect(cap).toContainText('강원 강릉시');
  329 |     await page.waitForTimeout(600);
  330 |     await shot(page, '12b-slideshow');
  331 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  332 |     await page.keyboard.press('Escape');
  333 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  334 |     await page.goto('/memories');
  335 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  336 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  337 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  338 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  339 |     await expect(albumImgs).toHaveCount(3);
  340 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  341 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  342 |     await page.getByLabel('다시 보기 연도').fill('0');
  343 |     const firstYear = await page.getByTestId('replay-year').textContent();
  344 |     await page.getByTestId('replay-play').click();
  345 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  346 |     await page.getByLabel('결산 연도').selectOption('2019');
  347 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  348 |     await expect(page.getByTestId('year-review')).toContainText('2');
  349 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  350 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  351 |     await shot(page, '12c-memories');
  352 |   });
  353 | 
  354 |   test('여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  355 |     await signIn(page, OWNER);
  356 |     // 일정: 날짜가 있는 강릉 여행(사진으로 2019.5.3–4)
  357 |     await page.goto('/trips');
  358 |     await page.getByText('강릉시 여행', { exact: true }).click();
  359 |     await page.getByRole('tab', { name: '일정' }).click();
  360 |     const plan = page.getByTestId('plan-tab');
  361 |     await plan.getByLabel('가볼 곳 추가').fill('경포대');
  362 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  363 |     await plan.getByLabel('가볼 곳 추가').fill('안목 커피거리');
  364 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  365 |     // 우리 장소에서 바로 넣기
  366 |     await plan.getByRole('button', { name: '초당할머니순두부' }).click();
  367 |     await expect(plan.getByTestId('plan-item')).toHaveCount(3);
  368 |     // ② 날짜 ③ 시간·예약
  369 |     await plan.getByRole('button', { name: /경포대/ }).click();
  370 |     await plan.getByLabel('날짜').selectOption('2019-05-04');
  371 |     await plan.getByLabel('시간').fill('18:30');
  372 |     await expect(plan).toContainText('2일째 · 5.4 (토)');
  373 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '경포대' })).toContainText('18:30');
  374 |     await shot(page, '13-plan');
  375 | 
  376 |     // 기록: 쓴 사람이 보인다
  377 |     await page.getByRole('tab', { name: /글/ }).click();
  378 |     const notes = page.getByTestId('notes-tab');
  379 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  380 |     await notes.getByRole('button', { name: '남기기' }).click();
  381 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  382 |     await expect(notes.getByTestId('note')).toContainText('영상');
  383 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  384 | 
  385 |     // 준비물: 예정된 제주 여행
  386 |     await page.goto('/trips');
  387 |     await page.getByText('제주 여행', { exact: true }).click();
  388 |     const pack = page.getByTestId('packing');
  389 |     await pack.getByRole('button', { name: '휴양' }).click();
  390 |     await expect(pack).toContainText('수영복');
  391 |     await pack.getByLabel('수영복 챙김').check();
  392 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  393 |     await pack.getByLabel('선크림 담당자').click();
  394 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  395 |     await shot(page, '13b-packing');
  396 |   });
  397 | 
  398 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  399 |     await signIn(page, OWNER);
  400 |     const box = page.getByTestId('home-ask').getByLabel('찾아보기');
  401 |     await box.fill('강릉 맛집');
  402 |     await box.press('Enter');
  403 |     await expect(page).toHaveURL(/\/ask/);
  404 |     const answers = page.getByTestId('answer');
  405 |     await expect(answers.last()).toContainText('초당 순두부');
  406 |     await expect(answers.last()).toContainText('초당할머니순두부');
  407 |     const input = page.getByLabel('질문');
  408 |     await input.fill('거기 언제 가면 좋아?');
  409 |     await input.press('Enter');
> 410 |     await expect(answers.last()).toContainText('강원 강릉시은(는)');
      |                                  ^ Error: expect(locator).toContainText(expected) failed
  411 |     await input.fill('강릉 몇 번 갔지?');
  412 |     await input.press('Enter');
  413 |     await expect(answers.last()).toContainText('1번 다녀왔어요');
  414 |     await input.fill('고성 맛집');
  415 |     await input.press('Enter');
  416 |     await expect(answers.last()).toContainText('여러 곳');
  417 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  418 |     await expect(answers.last()).toContainText('강원 고성군');
  419 |     await shot(page, '14-ask');
  420 |     await page.getByRole('button', { name: '처음으로' }).click();
  421 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  422 |     await expect(answers.last()).toContainText('시·군');
  423 |   });
  424 | 
  425 |   test('공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기', async ({ page, browser }) => {
  426 |     await signIn(page, OWNER);
  427 |     await page.goto('/trips');
  428 |     await page.getByText('강릉시 여행', { exact: true }).click();
  429 |     const card = page.getByTestId('share-link');
  430 |     await card.getByTestId('share-on').click();
  431 |     const url = await card.getByLabel('공유 링크').inputValue();
  432 |     expect(url).toMatch(/\/s\/[a-z0-9]{8,}$/);
  433 | 
  434 |     // 로그인하지 않은 사람이 링크로 연다
  435 |     const anon = await (await browser.newContext({ locale: 'ko-KR', serviceWorkers: 'block' })).newPage();
  436 |     await anon.goto(url);
  437 |     const shared = anon.getByTestId('shared-trip');
  438 |     await expect(shared).toContainText('강릉시 여행');
  439 |     await expect(shared).toContainText('초당할머니순두부');
  440 |     await shared.locator('.photo-grid').scrollIntoViewIfNeeded();
  441 |     await expect(shared.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  442 |     await expect(shared.locator('.trip-cover img[data-loaded]')).toHaveCount(1);
  443 |     await expect(shared).not.toContainText('바다 보며 커피 마신 날');
  444 |     const photoId = await shared.locator('.photo-cell img').first().getAttribute('data-photo');
  445 |     // 로그인 없이도 지도가 그려진다
  446 |     await expectMapDrawn(anon);
  447 |     await anon.screenshot({ path: `${SHOTS}/15-shared-trip.png` });
  448 | 
  449 |     // 공개를 끄면 링크가 닫힌다
  450 |     await card.getByRole('button', { name: '공개 끄기' }).click();
  451 |     await expect(card.getByTestId('share-on')).toBeVisible();
  452 |     await anon.reload();
  453 |     await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible();
  454 |     // 공개를 끈 사진 파일은 로그인 없이 못 읽는다
  455 |     const denied = await anon.evaluate((id) => (window as unknown as { __testPhoto: (id: string) => Promise<number> }).__testPhoto(id!).then(() => 'read', (e: { code?: string; message: string }) => e.code ?? e.message), photoId);
  456 |     expect(denied).toBe('permission-denied');
  457 |     await anon.context().close();
  458 | 
  459 |     // 공유 카드: 1080×1350 그림
  460 |     await page.goto('/memories');
  461 |     const sc = page.getByTestId('share-cards');
  462 |     await sc.getByRole('button', { name: '나의 지도' }).click();
  463 |     await expect(sc.getByTestId('card-img')).toBeVisible();
  464 |     const size = await sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
  465 |     expect(size).toEqual([1080, 1350]);
  466 |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15b-card-map.png` });
  467 |     await sc.getByRole('button', { name: '메모 인용' }).click();
  468 |     await page.waitForTimeout(800);
  469 |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15c-card-quote.png` });
  470 | 
  471 |     // 엑셀: 시트 4개짜리 .xlsx
  472 |     await page.goto('/space');
  473 |     const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('xlsx').click()]);
  474 |     expect(dl.suggestedFilename()).toMatch(/^보라핀_.*\.xlsx$/);
  475 |     const fs = await import('node:fs');
  476 |     const buf = fs.readFileSync((await dl.path())!);
  477 |     expect(buf.subarray(0, 2).toString()).toBe('PK');
  478 |     expect(buf.length).toBeGreaterThan(5000);
  479 |   });
  480 | 
  481 |   test('관리자: 사용량, 사진 올리기 멈춤, 문제 신고', async ({ page }) => {
  482 |     await signIn(page, OWNER);
  483 |     await page.goto('/space');
  484 |     // 문제 신고
  485 |     page.once('dialog', (d) => d.accept('지도가 가끔 늦게 떠요'));
  486 |     await page.getByTestId('report').click();
  487 |     await expect(page.getByRole('status')).toContainText('보내 주셔서 고마워요');
  488 |     await page.getByTestId('admin-link').click();
  489 |     const admin = page.getByTestId('admin');
  490 |     await expect(admin.getByTestId('usage')).toContainText('사진 3장');
  491 |     await expect(admin.getByTestId('usage')).toContainText('/ 1GB');
  492 |     await expect(admin.getByTestId('plan')).toContainText('무료(Spark)');
  493 |     await expect(admin.getByTestId('reports')).toContainText('지도가 가끔 늦게 떠요');
  494 |     // 사진 올리기 멈춤 → 여행 사진 탭에서 막힘
  495 |     await admin.getByLabel('멈추는 이유').fill('예산 점검');
  496 |     await admin.getByTestId('uploads-off').click();
  497 |     await expect(admin.getByTestId('cutoff')).toContainText('멈춤 · 예산 점검');
  498 |     await shot(page, '16-admin');
  499 |     await page.goto('/trips');
  500 |     await page.getByText('강릉시 여행', { exact: true }).click();
  501 |     await page.getByRole('tab', { name: /사진/ }).click();
  502 |     await page.getByTestId('photo-add').click();
  503 |     await expect(page.getByRole('status')).toContainText('사진 올리기를 잠시 멈췄어요');
  504 |     await page.goto('/admin');
  505 |     await page.getByTestId('uploads-on').click();
  506 |     await expect(page.getByTestId('cutoff')).toContainText('켜짐');
  507 |     await page.getByTestId('reports').getByRole('button', { name: '해결함' }).first().click();
  508 |     await expect(page.getByTestId('reports')).toContainText('들어온 신고가 없어요');
  509 |   });
  510 | 
```