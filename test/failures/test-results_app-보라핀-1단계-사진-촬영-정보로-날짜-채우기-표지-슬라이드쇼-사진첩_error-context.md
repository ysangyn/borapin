# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩
- Location: tests/app.spec.ts:565:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('2019.5.3–4', { exact: true }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('2019.5.3–4', { exact: true }).first() with timeout 15000ms
  - waiting for getByText('2019.5.3–4', { exact: true }).first()

```

```yaml
- button "뒤로"
- text: 여행
- link "고치기":
  - /url: /trips/RHBsagivGiLW72R6swqf/edit
- text: 강릉시 여행 2019.5.3–4 · 1박 2일
- tablist "여행 보기":
  - tab "개요"
  - tab "들른 곳"
  - tab "사진 3" [selected]
  - tab "글"
- heading "사진 · 3" [level=2]
- button "▶ 슬라이드쇼"
- button "사진 1 크게 보기"
- button "사진 2 크게 보기"
- button "사진 3 크게 보기"
- button "사진"
- text: 여행마다 고른 사진 30장쯤을 남기는 앱이에요. 앞으로 약 5,000장 더 올릴 수 있어요.
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "기록하기"
  - link "지도":
    - /url: /map
  - link "새 소식 1개 피드":
    - /url: /feed
    - text: 피드
- status
```

# Test source

```ts
  482 |     await page.getByRole('button', { name: '다음 주말' }).click();
  483 |     await page.getByRole('button', { name: '1박 2일' }).click();
  484 |     await page.getByRole('button', { name: '국내', exact: true }).click();
  485 |     await shot(page, '10h-planner');
  486 |     await page.getByTestId('planner-go').click();
  487 |     await expect(page).toHaveURL(/\/plan\/[A-Za-z0-9]+$/);
  488 |     const cands = page.getByTestId('plan-cand');
  489 |     await expect(cands).toHaveCount(3);
  490 |     const url = page.url();
  491 |     // 나만 하트 → 상대를 기다린다
  492 |     await cands.first().getByTestId('plan-heart').click();
  493 |     await expect(cands.first().getByTestId('plan-heart')).toHaveAttribute('aria-pressed', 'true');
  494 |     await expect(cands.first()).toContainText('상대 하트를 기다려요');
  495 |     await expect(cands.first().getByTestId('plan-decide')).toHaveCount(0);
  496 |     await shot(page, '10i-plan-pick');
  497 |     const name = (await cands.first().locator('.plan-cand-name').textContent())!.trim();
  498 |     // 보라가 같은 링크로 와서 같은 곳에 하트 → 여기로 정해요
  499 |     const bora = await browser.newPage();
  500 |     await signIn(bora, 'bora@example.com');
  501 |     await bora.goto(url);
  502 |     const bc = bora.getByTestId('plan-cand').filter({ hasText: name });
  503 |     await expect(bc).toContainText('영상');
  504 |     await bc.getByTestId('plan-heart').click();
  505 |     await expect(bc.getByTestId('plan-decide')).toBeVisible();
  506 |     await bora.close();
  507 |     // 내 화면에도 바로 '여기로 정해요'가 뜬다
  508 |     await expect(cands.first().getByTestId('plan-decide')).toBeVisible({ timeout: 15_000 });
  509 |     await cands.first().getByTestId('plan-decide').click();
  510 |     await expect(page.getByRole('status')).toContainText('하루 뼈대를 깔아 두었어요');
  511 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=plan$/);
  512 |     const plan = page.getByTestId('plan-tab');
  513 |     await expect(plan.getByTestId('plan-item').first()).toBeVisible();
  514 |     expect(await plan.getByTestId('plan-item').count()).toBeGreaterThanOrEqual(4);
  515 |     await expect(plan).toContainText('1일째');
  516 |     await expect(plan).toContainText('2일째');
  517 |     await shot(page, '10j-plan-skeleton');
  518 |     // 정한 뒤 계획 화면은 '정했어요'
  519 |     await page.goto(url);
  520 |     await expect(page.getByTestId('plan-decided')).toBeVisible();
  521 |   });
  522 | 
  523 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  524 |     await signIn(page, OWNER);
  525 |     await page.goto('/trips');
  526 |     await page.getByText('강릉시 여행', { exact: true }).click();
  527 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  528 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  529 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  530 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  531 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
  532 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  533 |     // 가리고 쓰기: 켜면 내 것을 쓰기 전엔 보라 칸이 가려지고, 쓰면 열린다 (끄면 그냥 보인다)
  534 |     await page.getByTestId('blind-toggle').click();
  535 |     await expect(page.getByTestId('review-hidden')).toBeVisible();
  536 |     await expect(page.getByLabel('보라 한 줄 평')).toHaveCount(0);
  537 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  538 |     await expect(page.getByLabel('보라 한 줄 평')).toBeVisible();
  539 |     await page.getByTestId('blind-toggle').click();
  540 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  541 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  542 |     await shot(page, '11-place-edit');
  543 |     await page.getByTestId('place-save').click();
  544 |     const tp = page.getByTestId('trip-places');
  545 |     await expect(tp).toContainText('초당할머니순두부');
  546 |     await expect(tp).toContainText('또 갈래요');
  547 |     await expect(tp).toContainText('순두부 젤라또까지 완벽');
  548 | 
  549 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  550 |     await page.goto('/');
  551 |     await expectMapDrawn(page);
  552 |     await tapLngLat(page, 128.86, 37.73);
  553 |     const sheet = page.getByTestId('region-sheet');
  554 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  555 |     await expect(sheet).toContainText('우리 장소 · 1');
  556 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  557 | 
  558 |     // 우리 장소 목록과 '또 갈래요' 거르기
  559 |     await page.goto('/places');
  560 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  561 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  562 |     await shot(page, '11b-places');
  563 |   });
  564 | 
  565 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  566 |     await signIn(page, OWNER);
  567 |     await page.goto('/trips');
  568 |     await page.getByText('강릉시 여행', { exact: true }).click();
  569 |     await page.getByRole('tab', { name: /사진/ }).click();
  570 |     const sec = page.getByTestId('trip-photos');
  571 |     await sec.getByTestId('photo-input').setInputFiles([
  572 |       'tests/fixtures/photo-gangneung.jpg',
  573 |       'tests/fixtures/photo-gangneung2.jpg',
  574 |       'tests/fixtures/photo-noexif.jpg',
  575 |     ]);
  576 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  577 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  578 |     // 촬영일(2019.5.3~4)로 날짜 채우기
  579 |     const sug = page.getByTestId('photo-suggest');
  580 |     await expect(sug).toContainText('2019.5.3–4');
  581 |     await sug.getByRole('button', { name: '채우기' }).click();
> 582 |     await expect(page.getByText('2019.5.3–4', { exact: true }).first()).toBeVisible();
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  583 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  584 |     await shot(page, '12-photos');
  585 |     // 표지 사진은 개요 탭 위에
  586 |     await page.getByRole('tab', { name: '개요' }).click();
  587 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  588 |     await page.getByRole('tab', { name: /사진/ }).click();
  589 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  590 |     await sec.locator('.photo-cell img').first().click();
  591 |     const cap = page.locator('.pswp__caption-bp');
  592 |     await expect(cap).toContainText('2019.5.3 14:20');
  593 |     await expect(cap).toContainText('강원 강릉시');
  594 |     await page.waitForTimeout(600);
  595 |     await shot(page, '12b-slideshow');
  596 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  597 |     await page.keyboard.press('Escape');
  598 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  599 |     await page.goto('/memories');
  600 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  601 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  602 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  603 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  604 |     await expect(albumImgs).toHaveCount(3);
  605 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  606 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  607 |     await page.getByLabel('다시 보기 연도').fill('0');
  608 |     const firstYear = await page.getByTestId('replay-year').textContent();
  609 |     await page.getByTestId('replay-play').click();
  610 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  611 |     await page.getByLabel('결산 연도').selectOption('2019');
  612 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  613 |     await expect(page.getByTestId('year-review')).toContainText('2');
  614 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  615 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  616 |     await shot(page, '12c-memories');
  617 |   });
  618 | 
  619 |   test('여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  620 |     await signIn(page, OWNER);
  621 |     // 일정: 날짜가 있는 강릉 여행(사진으로 2019.5.3–4)
  622 |     await page.goto('/trips');
  623 |     await page.getByText('강릉시 여행', { exact: true }).click();
  624 |     // 다녀온 여행이라 '일정'이 아니라 '들른 곳', 보기는 그 지역 명소, 또 갈래요 하트
  625 |     await page.getByRole('tab', { name: '들른 곳' }).click();
  626 |     const plan = page.getByTestId('plan-tab');
  627 |     await expect(plan.getByLabel('들른 곳 추가')).toHaveAttribute('placeholder', /예: 안목 커피거리/);
  628 |     await plan.getByLabel('들른 곳 추가').fill('경포대');
  629 |     await plan.getByLabel('들른 곳 추가').press('Enter');
  630 |     await plan.getByLabel('들른 곳 추가').fill('안목 커피거리');
  631 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  632 |     // 우리 장소에서 바로 넣기
  633 |     await plan.getByRole('button', { name: '초당할머니순두부' }).click();
  634 |     await expect(plan.getByTestId('plan-item')).toHaveCount(3);
  635 |     const again = plan.getByTestId('plan-item').filter({ hasText: '경포대' }).getByTestId('plan-again');
  636 |     await again.click();
  637 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  638 |     // ② 날짜 ③ 시간·예약
  639 |     await plan.locator('.plan-name', { hasText: '경포대' }).click();
  640 |     await plan.getByLabel('날짜').selectOption('2019-05-04');
  641 |     await plan.getByLabel('시간').selectOption('18:30');
  642 |     await expect(plan).toContainText('2일째 · 5.4 (토)');
  643 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '경포대' })).toContainText('18:30');
  644 |     await shot(page, '13-plan');
  645 | 
  646 |     // 기록: 쓴 사람이 보인다
  647 |     await page.getByRole('tab', { name: /글/ }).click();
  648 |     const notes = page.getByTestId('notes-tab');
  649 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  650 |     await notes.getByRole('button', { name: '남기기' }).click();
  651 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  652 |     await expect(notes.getByTestId('note')).toContainText('영상');
  653 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  654 | 
  655 |     // 준비물: 예정된 제주 여행
  656 |     await page.goto('/trips');
  657 |     await page.getByText('제주 여행', { exact: true }).click();
  658 |     // 개요엔 준비 요약 한 줄 → 누르면 '준비' 탭 (준비물·가는 길·현지어가 한곳에)
  659 |     await page.getByTestId('packing-summary').click();
  660 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  661 |     await expect(page.getByTestId('prep-way')).toContainText('제주공항');
  662 |     const pack = page.getByTestId('packing');
  663 |     await pack.getByRole('button', { name: '휴양' }).click();
  664 |     await expect(pack).toContainText('수영복');
  665 |     await pack.getByLabel('수영복 챙김').check();
  666 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  667 |     await pack.getByLabel('선크림 담당자').click();
  668 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  669 |     await shot(page, '13b-packing');
  670 |   });
  671 | 
  672 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  673 |     await signIn(page, OWNER);
  674 |     const box = page.getByTestId('home-ask').getByLabel('보라에게 물어봐');
  675 |     await box.fill('강릉 맛집');
  676 |     await box.press('Enter');
  677 |     await expect(page).toHaveURL(/\/ask/);
  678 |     const answers = page.getByTestId('answer');
  679 |     await expect(answers.last()).toContainText('초당 순두부');
  680 |     await expect(answers.last()).toContainText('초당할머니순두부');
  681 |     const input = page.getByLabel('질문');
  682 |     await input.fill('거기 언제 가면 좋아?');
```