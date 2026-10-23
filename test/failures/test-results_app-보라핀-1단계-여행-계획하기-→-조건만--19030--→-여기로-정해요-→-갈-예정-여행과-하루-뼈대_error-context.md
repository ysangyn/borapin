# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 계획하기: + → 조건만 고르면 후보 3곳 → 둘이 하트 → 여기로 정해요 → 갈 예정 여행과 하루 뼈대
- Location: tests/app.spec.ts:530:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('plan-cand').first()
Expected substring: "상대 하트를 기다려요"
Received string:    "강원 삼척시영상가 가고 싶다고 한 곳10월에 좋아요 · 선선하고 비가 적어요아직 안 가본 곳나상대가 고르길 기다려요"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('plan-cand').first() with timeout 15000ms
  - waiting for getByTestId('plan-cand').first()
    34 × locator resolved to <article class="plan-cand" data-testid="plan-cand">…</article>
       - unexpected value "강원 삼척시영상가 가고 싶다고 한 곳10월에 좋아요 · 선선하고 비가 적어요아직 안 가본 곳나상대가 고르길 기다려요"

```

```yaml
- article:
  - text: 강원 삼척시
  - list:
    - listitem: · 영상가 가고 싶다고 한 곳
    - listitem: · 10월에 좋아요 · 선선하고 비가 적어요
    - listitem: · 아직 안 가본 곳
  - button "삼척시 고른 것 빼기" [pressed]: 나
  - text: 상대가 고르길 기다려요
```

# Test source

```ts
  449 |     await expect(page.getByTestId('phrase-row').first()).toContainText('도와주세요');
  450 |     await shot(page, '10g-phrases');
  451 |     await page.goto('/phrases/tr');
  452 |     await expect(page.getByTestId('phrases')).toContainText('아직 없어요');
  453 | 
  454 |     // 홈 '다음 여행 준비'는 예정된 제주 여행을 맡고, 여행 탭에도 보인다
  455 |     await page.goto('/');
  456 |     await expect(page.getByTestId('next-hub')).toHaveAttribute('data-anchor', 'trip');
  457 |     await expect(page.getByTestId('hub-first')).toContainText('제주 여행');
  458 |     await page.goto('/trips');
  459 |     await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  460 |   });
  461 | 
  462 |   test('홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다', async ({ page, browser }) => {
  463 |     await signIn(page, OWNER);
  464 |     const hub = page.getByTestId('next-hub');
  465 |     await expect(hub).toBeVisible();
  466 |     // 1. 다음은 어디: 예정된 제주 여행이 맨 위, 그다음은 가고 싶은 곳(강원)
  467 |     await expect(hub.getByTestId('hub-first')).toContainText('제주 여행');
  468 |     await expect(hub.locator('.hub-others')).toContainText('강원');
  469 |     // 2. 오늘의 한 질문: 제주 이야기. 내가 답하면 상대 답은 잠겨 있다
  470 |     const ask = hub.getByTestId('hub-ask');
  471 |     await expect(ask).toContainText('제주');
  472 |     await ask.getByLabel('오늘의 질문 답').fill('흑돼지랑 고기국수');
  473 |     await ask.getByTestId('hub-ask-send').click();
  474 |     await expect(page.getByRole('status')).toContainText('답을 남겼어요');
  475 |     await expect(ask.locator('.hub-answer.mine')).toContainText('흑돼지랑 고기국수');
  476 |     await expect(ask.getByTestId('hub-ask-waiting')).toBeVisible();
  477 |     await expect(ask.getByTestId('hub-answer-other')).toHaveCount(0);
  478 |     await shot(page, '10d-home-hub');
  479 |     // 보라가 들어와 같은 질문을 보고 답하면 → 서로의 답이 열린다 (내 화면은 새로 고침 없이)
  480 |     const bora = await browser.newPage();
  481 |     await signIn(bora, 'bora@example.com');
  482 |     const bAsk = bora.getByTestId('hub-ask');
  483 |     await expect(bAsk).toContainText('제주');
  484 |     await expect(bAsk.getByTestId('hub-answer-other')).toHaveCount(0);
  485 |     await bAsk.getByLabel('오늘의 질문 답').fill('한라산 보이는 카페');
  486 |     await bAsk.getByTestId('hub-ask-send').click();
  487 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('흑돼지랑 고기국수');
  488 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('영상');
  489 |     await bora.close();
  490 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('한라산 보이는 카페');
  491 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('보라');
  492 |     await expect(ask.getByTestId('hub-ask-waiting')).toHaveCount(0);
  493 |     // 상대의 답은 새 소식: 아래 메뉴에 점, 피드에 '오늘의 질문에 답함'
  494 |     await expect.poll(async () => page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen)), { timeout: 15_000, message: '점 계산 자료에 질문 답' }).toContain('"kind":"ask"');
  495 |     await expect(page.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
  496 |     await page.getByTestId('nav-feed').click();
  497 |     const askItem = page.locator('[data-testid="feed-item"][data-kind="ask"]').first();
  498 |     await expect(askItem).toContainText('한라산 보이는 카페');
  499 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  500 |     await page.goto('/');
  501 |     // 먹을 것·가볼 곳 질문이면 답을 가고 싶은 곳 메모에 넣을 수 있다 (오늘 질문이 그런 종류일 때)
  502 |     const save = ask.locator('.hub-answer.mine').getByRole('button', { name: '메모에 넣기' });
  503 |     if (await save.count()) {
  504 |       await save.click();
  505 |       await expect(page.getByRole('status')).toContainText('메모에 넣었어요');
  506 |       await page.getByRole('status').getByRole('button', { name: '보기' }).click();
  507 |       await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  508 |       await expect.poll(() => page.locator('textarea').evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value).join('\n')), { timeout: 15_000 }).toContain('흑돼지랑 고기국수');
  509 |       await page.goto('/');
  510 |     }
  511 |     // 3. 오늘의 영어: 다음 예정 여행(제주)이 국내라 큰 카드 대신 묶음 맨 아래 한 줄 링크
  512 |     await expect(hub.getByTestId('hub-english')).toHaveCount(0);
  513 |     const en = hub.getByTestId('hub-english-line');
  514 |     await expect(en).toContainText('오늘의 영어');
  515 |     await expect(en).toContainText(/\d문장 · 90초/);
  516 |     // 한 줄 링크는 묶음의 맨 아래 (가는 길 뒤)
  517 |     expect((await en.boundingBox())!.y).toBeGreaterThan((await hub.getByTestId('hub-way').boundingBox())!.y);
  518 |     // 4. 가는 길: 같은 곳(제주)의 가기 좋은 때
  519 |     const way = hub.getByTestId('hub-way');
  520 |     await expect(way).toContainText('제주');
  521 |     await expect(way).toContainText('가기 좋은 때');
  522 |     // 바깥 링크(항공권·뉴스)는 국내 여행지엔 없다
  523 |     await expect(way.locator('a[target="_blank"]')).toHaveCount(0);
  524 |     // 우리 집을 안 정했으면 정하러 가는 안내만
  525 |     await expect(way.getByTestId('home-route-empty')).toBeVisible();
  526 |     await en.click();
  527 |     await expect(page).toHaveURL(/\/study$/);
  528 |   });
  529 | 
  530 |   test('여행 계획하기: + → 조건만 고르면 후보 3곳 → 둘이 하트 → 여기로 정해요 → 갈 예정 여행과 하루 뼈대', async ({ page, browser }) => {
  531 |     await signIn(page, OWNER);
  532 |     await expect(page.getByTestId('headline')).toBeVisible();
  533 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  534 |     await expect(page.getByTestId('plus-sheet')).toBeVisible();
  535 |     await page.getByRole('menuitem', { name: /여행 계획하기/ }).click();
  536 |     await expect(page).toHaveURL(/\/plan$/);
  537 |     await page.getByRole('button', { name: '다음 주말' }).click();
  538 |     await page.getByRole('button', { name: '1박 2일' }).click();
  539 |     await page.getByRole('button', { name: '국내', exact: true }).click();
  540 |     await shot(page, '10h-planner');
  541 |     await page.getByTestId('planner-go').click();
  542 |     await expect(page).toHaveURL(/\/plan\/[A-Za-z0-9]+$/);
  543 |     const cands = page.getByTestId('plan-cand');
  544 |     await expect(cands).toHaveCount(3);
  545 |     const url = page.url();
  546 |     // 나만 하트 → 상대를 기다린다
  547 |     await cands.first().getByTestId('plan-heart').click();
  548 |     await expect(cands.first().getByTestId('plan-heart')).toHaveAttribute('aria-pressed', 'true');
> 549 |     await expect(cands.first()).toContainText('상대 하트를 기다려요');
      |                                 ^ Error: expect(locator).toContainText(expected) failed
  550 |     await expect(cands.first().getByTestId('plan-decide')).toHaveCount(0);
  551 |     await shot(page, '10i-plan-pick');
  552 |     const name = (await cands.first().locator('.plan-cand-name').textContent())!.trim();
  553 |     // 보라가 같은 링크로 와서 같은 곳에 하트 → 여기로 정해요
  554 |     const bora = await browser.newPage();
  555 |     await signIn(bora, 'bora@example.com');
  556 |     await bora.goto(url);
  557 |     const bc = bora.getByTestId('plan-cand').filter({ hasText: name });
  558 |     await expect(bc).toContainText('영상');
  559 |     await bc.getByTestId('plan-heart').click();
  560 |     await expect(bc.getByTestId('plan-decide')).toBeVisible();
  561 |     await bora.close();
  562 |     // 내 화면에도 바로 '여기로 정해요'가 뜬다
  563 |     await expect(cands.first().getByTestId('plan-decide')).toBeVisible({ timeout: 15_000 });
  564 |     await cands.first().getByTestId('plan-decide').click();
  565 |     await expect(page.getByRole('status')).toContainText('하루 뼈대를 깔아 두었어요');
  566 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=plan$/);
  567 |     const plan = page.getByTestId('plan-tab');
  568 |     await expect(plan.getByTestId('plan-item').first()).toBeVisible();
  569 |     expect(await plan.getByTestId('plan-item').count()).toBeGreaterThanOrEqual(4);
  570 |     await expect(plan).toContainText('1일째');
  571 |     await expect(plan).toContainText('2일째');
  572 |     await shot(page, '10j-plan-skeleton');
  573 |     // 정한 뒤 계획 화면은 '정했어요'
  574 |     await page.goto(url);
  575 |     await expect(page.getByTestId('plan-decided')).toBeVisible();
  576 |   });
  577 | 
  578 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  579 |     await signIn(page, OWNER);
  580 |     await page.goto('/trips');
  581 |     await page.getByText('강릉시 여행', { exact: true }).click();
  582 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  583 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  584 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  585 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  586 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
  587 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  588 |     // 가리고 쓰기: 켜면 내 것을 쓰기 전엔 보라 칸이 가려지고, 쓰면 열린다 (끄면 그냥 보인다)
  589 |     await page.getByTestId('blind-toggle').click();
  590 |     await expect(page.getByTestId('review-hidden')).toBeVisible();
  591 |     await expect(page.getByLabel('보라 한 줄 평')).toHaveCount(0);
  592 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  593 |     await expect(page.getByLabel('보라 한 줄 평')).toBeVisible();
  594 |     await page.getByTestId('blind-toggle').click();
  595 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  596 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  597 |     await shot(page, '11-place-edit');
  598 |     await page.getByTestId('place-save').click();
  599 |     // 개요엔 들른 곳 요약 한 줄만, 평가·한 줄 평은 '들른 곳' 탭에
  600 |     const tp = page.getByTestId('trip-places');
  601 |     await expect(tp).toContainText('우리 장소 1곳');
  602 |     await expect(tp).toContainText('초당할머니순두부');
  603 |     await tp.getByTestId('places-summary').click();
  604 |     await expect(page.getByRole('tab', { name: '들른 곳' })).toHaveAttribute('aria-selected', 'true');
  605 |     const visited = page.getByTestId('trip-visited');
  606 |     await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
  607 |     await expect(visited).toContainText('또 갈래요');
  608 |     await expect(visited).toContainText('순두부 젤라또까지 완벽');
  609 | 
  610 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  611 |     await page.goto('/');
  612 |     await expectMapDrawn(page);
  613 |     await tapLngLat(page, 128.86, 37.73);
  614 |     const sheet = page.getByTestId('region-sheet');
  615 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  616 |     await expect(sheet).toContainText('우리 장소 · 1');
  617 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  618 | 
  619 |     // 우리 장소 목록과 '또 갈래요' 거르기
  620 |     await page.goto('/places');
  621 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  622 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  623 |     await shot(page, '11b-places');
  624 | 
  625 |     // 장소를 열면 '보기' 화면: 이름·지도 앱·자리 그림·한 줄 평, 고치기를 누르면 고치는 칸
  626 |     await page.getByTestId('place-rec').click();
  627 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  628 |     await expect(page.getByRole('navigation', { name: '지도 앱으로 열기' }).getByRole('link')).toHaveCount(3);
  629 |     await expect(page.getByTestId('spot-map')).toBeVisible();
  630 |     await expect(page.getByText('아침으로 최고')).toBeVisible();
  631 |     await shot(page, '11c-place-view');
  632 |     await page.getByTestId('place-edit').click();
  633 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  634 |     await page.getByLabel('장소 메모').fill('줄 30분');
  635 |     await page.getByTestId('place-save').click();
  636 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  637 |     await expect(page.getByText('줄 30분')).toBeVisible();
  638 |   });
  639 | 
  640 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  641 |     await signIn(page, OWNER);
  642 |     await page.goto('/trips');
  643 |     await page.getByText('강릉시 여행', { exact: true }).click();
  644 |     await page.getByRole('tab', { name: /사진/ }).click();
  645 |     const sec = page.getByTestId('trip-photos');
  646 |     await sec.getByTestId('photo-input').setInputFiles([
  647 |       'tests/fixtures/photo-gangneung.jpg',
  648 |       'tests/fixtures/photo-gangneung2.jpg',
  649 |       'tests/fixtures/photo-noexif.jpg',
```