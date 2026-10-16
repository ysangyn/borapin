# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물
- Location: tests/app.spec.ts:570:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByTestId('packing').getByRole('button', { name: '휴양' })

```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e3]:
      - generic [ref=f4e4]:
        - generic [ref=f4e5]:
          - button "뒤로" [ref=f4e6] [cursor=pointer]
          - generic [ref=f4e9]: 예정된 여행
        - link "고치기" [ref=f4e10] [cursor=pointer]:
          - /url: /trips/Si6jQZxcbWVVySbmpNbT/edit
      - generic [ref=f4e13]:
        - generic [ref=f4e14]:
          - generic [ref=f4e15]: 제주 여행
          - generic [ref=f4e16]: 2026년쯤
        - tablist "여행 보기" [ref=f4e18]:
          - tab "개요" [selected] [ref=f4e19] [cursor=pointer]
          - tab "일정" [ref=f4e20] [cursor=pointer]
          - tab "준비" [ref=f4e21] [cursor=pointer]
          - tab "사진" [ref=f4e22] [cursor=pointer]
          - tab "글" [ref=f4e23] [cursor=pointer]
        - generic [ref=f4e24]:
          - generic [ref=f4e25]:
            - generic:
              - region "Map" [ref=f4e26]
              - generic: 대한해협
              - generic: 동해
              - generic: 서해
              - generic: 남해
          - generic [aria-hidden]:
            - generic: 제주
        - button "준비 준비물 목록 만들기 · 가는 길 · 항공권 · 현지어" [ref=f4e27] [cursor=pointer]:
          - generic [ref=f4e31]:
            - text: 준비
            - generic [ref=f4e32]: 준비물 목록 만들기 · 가는 길 · 항공권 · 현지어
        - generic [ref=f4e35]:
          - generic [ref=f4e36]:
            - generic [ref=f4e37]: 어디
            - generic [ref=f4e39]:
              - generic [ref=f4e40]: 제주
              - link "제주 네이버지도" [ref=f4e41] [cursor=pointer]:
                - /url: https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC
                - text: "N"
              - link "제주 구글지도" [ref=f4e42] [cursor=pointer]:
                - /url: https://www.google.com/maps/search/?api=1&query=%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC
                - text: G
          - generic [ref=f4e43]:
            - generic [ref=f4e44]: 누구와
            - generic [ref=f4e45]: 보라, 영상
          - generic [ref=f4e46]:
            - generic [ref=f4e47]: 남긴 사람
            - generic [ref=f4e48]: 영상
        - generic [ref=f4e49]:
          - generic [ref=f4e50]:
            - heading "장소" [level=2] [ref=f4e51]
            - link "+ 장소 남기기" [ref=f4e52] [cursor=pointer]:
              - /url: /places/new?trip=Si6jQZxcbWVVySbmpNbT
          - generic [ref=f4e53]: 기억에 남은 맛집·카페·명소를 둘의 한 줄 평과 함께 남겨 보세요.
        - generic [ref=f4e54]:
          - generic [ref=f4e55]:
            - generic [ref=f4e56]: 링크 공개
            - generic [ref=f4e59]: 우리만 보기
          - generic [ref=f4e60]: 앱이 없어도 이 여행을 볼 수 있는 링크를 만들어요. 제목·날짜·장소, 사진과 촬영 날짜·설명, 들른 곳 이름이 보여요. 메모와 글, 함께 간 사람 이름은 넣지 않아요.
          - button "링크 만들기" [ref=f4e61] [cursor=pointer]
        - button "이 여행 지우기" [ref=f4e62] [cursor=pointer]
      - navigation "주 메뉴" [ref=f4e65]:
        - link "홈" [ref=f4e66] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f4e69] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f4e72] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f4e75] [cursor=pointer]:
          - /url: /map
        - link "새 소식 1개 피드" [ref=f4e78] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 1개" [ref=f4e82]
          - text: 피드
    - status
  - iframe [aria-hidden] [ref=f4e83]
```

# Test source

```ts
  510 |     await page.goto('/places');
  511 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  512 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  513 |     await shot(page, '11b-places');
  514 |   });
  515 | 
  516 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  517 |     await signIn(page, OWNER);
  518 |     await page.goto('/trips');
  519 |     await page.getByText('강릉시 여행', { exact: true }).click();
  520 |     await page.getByRole('tab', { name: /사진/ }).click();
  521 |     const sec = page.getByTestId('trip-photos');
  522 |     await sec.getByTestId('photo-input').setInputFiles([
  523 |       'tests/fixtures/photo-gangneung.jpg',
  524 |       'tests/fixtures/photo-gangneung2.jpg',
  525 |       'tests/fixtures/photo-noexif.jpg',
  526 |     ]);
  527 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  528 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  529 |     // 촬영일(2019.5.3~4)로 날짜 채우기
  530 |     const sug = page.getByTestId('photo-suggest');
  531 |     await expect(sug).toContainText('2019.5.3–4');
  532 |     await sug.getByRole('button', { name: '채우기' }).click();
  533 |     await expect(page.getByText('2019.5.3–4', { exact: true }).first()).toBeVisible();
  534 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  535 |     await shot(page, '12-photos');
  536 |     // 표지 사진은 개요 탭 위에
  537 |     await page.getByRole('tab', { name: '개요' }).click();
  538 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  539 |     await page.getByRole('tab', { name: /사진/ }).click();
  540 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  541 |     await sec.locator('.photo-cell img').first().click();
  542 |     const cap = page.locator('.pswp__caption-bp');
  543 |     await expect(cap).toContainText('2019.5.3 14:20');
  544 |     await expect(cap).toContainText('강원 강릉시');
  545 |     await page.waitForTimeout(600);
  546 |     await shot(page, '12b-slideshow');
  547 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  548 |     await page.keyboard.press('Escape');
  549 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  550 |     await page.goto('/memories');
  551 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  552 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  553 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  554 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  555 |     await expect(albumImgs).toHaveCount(3);
  556 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  557 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  558 |     await page.getByLabel('다시 보기 연도').fill('0');
  559 |     const firstYear = await page.getByTestId('replay-year').textContent();
  560 |     await page.getByTestId('replay-play').click();
  561 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  562 |     await page.getByLabel('결산 연도').selectOption('2019');
  563 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  564 |     await expect(page.getByTestId('year-review')).toContainText('2');
  565 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  566 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  567 |     await shot(page, '12c-memories');
  568 |   });
  569 | 
  570 |   test('여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  571 |     await signIn(page, OWNER);
  572 |     // 일정: 날짜가 있는 강릉 여행(사진으로 2019.5.3–4)
  573 |     await page.goto('/trips');
  574 |     await page.getByText('강릉시 여행', { exact: true }).click();
  575 |     // 다녀온 여행이라 '일정'이 아니라 '들른 곳', 보기는 그 지역 명소, 또 갈래요 하트
  576 |     await page.getByRole('tab', { name: '들른 곳' }).click();
  577 |     const plan = page.getByTestId('plan-tab');
  578 |     await expect(plan.getByLabel('들른 곳 추가')).toHaveAttribute('placeholder', /예: 안목 커피거리/);
  579 |     await plan.getByLabel('들른 곳 추가').fill('경포대');
  580 |     await plan.getByLabel('들른 곳 추가').press('Enter');
  581 |     await plan.getByLabel('들른 곳 추가').fill('안목 커피거리');
  582 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  583 |     // 우리 장소에서 바로 넣기
  584 |     await plan.getByRole('button', { name: '초당할머니순두부' }).click();
  585 |     await expect(plan.getByTestId('plan-item')).toHaveCount(3);
  586 |     const again = plan.getByTestId('plan-item').filter({ hasText: '경포대' }).getByTestId('plan-again');
  587 |     await again.click();
  588 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  589 |     // ② 날짜 ③ 시간·예약
  590 |     await plan.locator('.plan-name', { hasText: '경포대' }).click();
  591 |     await plan.getByLabel('날짜').selectOption('2019-05-04');
  592 |     await plan.getByLabel('시간').selectOption('18:30');
  593 |     await expect(plan).toContainText('2일째 · 5.4 (토)');
  594 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '경포대' })).toContainText('18:30');
  595 |     await shot(page, '13-plan');
  596 | 
  597 |     // 기록: 쓴 사람이 보인다
  598 |     await page.getByRole('tab', { name: /글/ }).click();
  599 |     const notes = page.getByTestId('notes-tab');
  600 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  601 |     await notes.getByRole('button', { name: '남기기' }).click();
  602 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  603 |     await expect(notes.getByTestId('note')).toContainText('영상');
  604 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  605 | 
  606 |     // 준비물: 예정된 제주 여행
  607 |     await page.goto('/trips');
  608 |     await page.getByText('제주 여행', { exact: true }).click();
  609 |     const pack = page.getByTestId('packing');
> 610 |     await pack.getByRole('button', { name: '휴양' }).click();
      |                                                    ^ Error: locator.click: Test timeout of 60000ms exceeded.
  611 |     await expect(pack).toContainText('수영복');
  612 |     await pack.getByLabel('수영복 챙김').check();
  613 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  614 |     await pack.getByLabel('선크림 담당자').click();
  615 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  616 |     await shot(page, '13b-packing');
  617 |   });
  618 | 
  619 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  620 |     await signIn(page, OWNER);
  621 |     const box = page.getByTestId('home-ask').getByLabel('보라에게 물어봐');
  622 |     await box.fill('강릉 맛집');
  623 |     await box.press('Enter');
  624 |     await expect(page).toHaveURL(/\/ask/);
  625 |     const answers = page.getByTestId('answer');
  626 |     await expect(answers.last()).toContainText('초당 순두부');
  627 |     await expect(answers.last()).toContainText('초당할머니순두부');
  628 |     const input = page.getByLabel('질문');
  629 |     await input.fill('거기 언제 가면 좋아?');
  630 |     await input.press('Enter');
  631 |     await expect(answers.last()).toContainText('강원 강릉시는');
  632 |     await input.fill('강릉 몇 번 갔지?');
  633 |     await input.press('Enter');
  634 |     await expect(answers.last()).toContainText('한 번 다녀왔어요');
  635 |     await input.fill('고성 맛집');
  636 |     await input.press('Enter');
  637 |     await expect(answers.last()).toContainText('여러 곳');
  638 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  639 |     await expect(answers.last()).toContainText('강원 고성군');
  640 |     await shot(page, '14-ask');
  641 |     await page.getByRole('button', { name: '처음으로' }).click();
  642 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  643 |     await expect(answers.last()).toContainText('시·군');
  644 |   });
  645 | 
  646 |   test('피드: 둘이 남긴 사진·글·장소·핀이 시간순으로, 다른 사람 소식엔 아래 메뉴에 점', async ({ page, browser }) => {
  647 |     await signIn(page, OWNER);
  648 |     await page.getByTestId('nav-feed').click();
  649 |     await expect(page).toHaveURL(/\/feed$/);
  650 |     const items = page.getByTestId('feed-item');
  651 |     await expect(items.first()).toBeVisible({ timeout: 15_000 });
  652 |     // 앞 시험들이 남긴 것들이 다 보인다: 사진 묶음, 글, 우리 장소, 핀
  653 |     await expect(page.locator('[data-testid="feed-item"][data-kind="photos"]').first()).toContainText('사진');
  654 |     await expect(page.locator('[data-testid="feed-item"][data-kind="note"]').first()).toContainText('바다 보며 커피 마신 날');
  655 |     // 짧은 글은 배경 위에 크게 (강릉 사진이 있으니 사진 배경)
  656 |     const quote = page.locator('[data-testid="feed-item"][data-kind="note"]').first().getByTestId('feed-quote-card');
  657 |     await expect(quote).toBeVisible();
  658 |     await expect(quote).toHaveClass(/has-photo/);
  659 |     await expect(page.locator('[data-testid="feed-item"][data-kind="place"]').first()).toBeVisible();
  660 |     await expect(page.locator('[data-testid="feed-item"][data-kind="trip"]').first()).toBeVisible();
  661 |     // 시간순(최신 먼저): 각 줄의 '얼마 전' 글이 거꾸로 가지 않는지는 단위 시험이 보고, 여기선 내가 남긴 건 '나'로 보이는지
  662 |     await expect(items.first().locator('.feed-who')).toContainText('나');
  663 |     // 내 소식만 있으니 점은 없다
  664 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  665 |     await shot(page, '17-feed');
  666 |     // 내가 피드를 보고 있는 동안 들어온 소식은 본 것으로 치므로, 먼저 홈으로 나간다
  667 |     await page.goto('/');
  668 |     await expect(page.getByTestId('nav-feed')).toBeVisible();
  669 | 
  670 |     // 보라가 핀을 꽂으면 → 내 화면 아래 메뉴에 새 소식 점, 피드에 들어가면 사라진다
  671 |     const bora = await browser.newPage();
  672 |     await signIn(bora, 'bora@example.com');
  673 |     await expect(bora.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  674 |     await bora.goto('/record');
  675 |     await bora.getByLabel('어디 검색').fill('통영');
  676 |     await bora.getByRole('option', { name: /통영시/ }).first().click();
  677 |     await bora.getByLabel('제목').fill('보라의 통영 나들이');
  678 |     await bora.getByRole('button', { name: '몰라요' }).click();
  679 |     await bora.getByTestId('save').click();
  680 |     await expect(bora.getByTestId('trip-title')).toHaveText('보라의 통영 나들이');
  681 |     await bora.close();
  682 |     await expect.poll(async () => page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen)), { timeout: 15_000, message: '점 계산 자료' }).toContain('"by":"보라"');
  683 |     const dbg = await page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen));
  684 |     await expect(page.getByTestId('feed-dot'), `새 소식 점이 없어요: ${dbg}`).toBeVisible({ timeout: 15_000 });
  685 |     await page.getByTestId('nav-feed').click();
  686 |     await expect(items.first()).toContainText('보라의 통영 나들이');
  687 |     await expect(items.first().locator('.feed-who')).toContainText('보라');
  688 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  689 |     // 하트: 내가 누르면 '나', 보라가 보면 '영상'으로 보이고, 보라 화면 아래 메뉴에 점
  690 |     await items.first().getByTestId('feed-heart').click();
  691 |     await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'true');
  692 |     await expect(items.first().getByTestId('feed-heart-names')).toHaveText('나');
  693 |     const bora2 = await browser.newPage();
  694 |     await signIn(bora2, 'bora@example.com');
  695 |     await expect(bora2.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
  696 |     await bora2.getByTestId('nav-feed').click();
  697 |     await expect(bora2.getByTestId('feed-item').first().getByTestId('feed-heart-names')).toHaveText('영상');
  698 |     await expect(bora2.getByTestId('feed-dot')).toHaveCount(0);
  699 |     await bora2.close();
  700 |     // 다시 누르면 뺀다
  701 |     await items.first().getByTestId('feed-heart').click();
  702 |     await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'false');
  703 |     // 추억 돌아보기로 넘어갈 수 있다
  704 |     await page.getByTestId('to-memories').click();
  705 |     await expect(page).toHaveURL(/\/memories$/);
  706 |   });
  707 | 
  708 |   test('공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기', async ({ page, browser }) => {
  709 |     await signIn(page, OWNER);
  710 |     await page.goto('/trips');
```