# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다
- Location: tests/human.spec.ts:613:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('feed-item').first()
Expected substring: "여수 밤바다 사진에 사진 3장"
Received string:    "영나사진 3장방금여수 밤바다 사진강릉시강릉시+1장 더 보기이 여행 펼치기"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('feed-item').first() with timeout 15000ms
  - waiting for getByTestId('feed-item').first()
    34 × locator resolved to <article data-kind="photos" class="feed-item scrap" data-testid="feed-item">…</article>
       - unexpected value "영나사진 3장방금여수 밤바다 사진강릉시강릉시+1장 더 보기이 여행 펼치기"

```

```yaml
- article:
  - text: 나 사진 3장 방금 여수 밤바다 사진
  - button "사진 1 크게 보기": 강릉시
  - button "사진 2 크게 보기": 강릉시
  - button "+1장 더 보기"
  - link "이 여행 펼치기":
    - /url: /trips/EN0ILdAygQQDOv947DER
  - button "하트"
```

# Test source

```ts
  525 |     const before = await map.getAttribute('data-center');
  526 |     const box = (await map.boundingBox())!;
  527 |     const cdp = await page.context().newCDPSession(page);
  528 |     const x = box.x + box.width / 2, y = box.y + box.height / 2;
  529 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  530 |     for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 12, y: y - i * 6 }] });
  531 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  532 |     await expect.poll(async () => map.getAttribute('data-center'), { timeout: 5000 }).not.toBe(before);
  533 |     await expect(page.getByText('두 손가락으로 움직여 주세요')).toBeHidden();
  534 |     await page.context().close();
  535 |   });
  536 | 
  537 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  538 |     const page = await phone(browser);
  539 |     await signIn(page);
  540 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  541 |     await page.goto('/record');
  542 |     await page.getByLabel('어디 검색').fill('고흥');
  543 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  544 |     await page.getByRole('button', { name: '몰라요' }).click();
  545 |     await page.getByTestId('save').click();
  546 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  547 |     await page.goto('/');
  548 |     const map = page.getByTestId('map').first();
  549 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  550 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  551 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  552 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  553 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  554 |     await page.getByRole('button', { name: '전체 보기' }).click();
  555 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  556 |     await page.context().close();
  557 |   });
  558 | 
  559 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  560 |     const page = await phone(browser);
  561 |     await signIn(page);
  562 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  563 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  564 |     await page.goto('/record?status=planned');
  565 |     await page.getByLabel('어디 검색').fill('속초');
  566 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  567 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  568 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  569 |     await page.getByLabel('시작 날짜').fill(ymd);
  570 |     // 갈 거예요로 남기면 단추는 '계획 남기기', 알림은 '계획을 남겼어요'
  571 |     await expect(page.getByTestId('save')).toHaveText('계획 남기기');
  572 |     await page.getByTestId('save').click();
  573 |     await expect(page.getByRole('status')).toContainText('계획을 남겼어요');
  574 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  575 |     await page.goto('/');
  576 |     const card = page.getByTestId('stage-card');
  577 |     await expect(card).toHaveAttribute('data-stage', 'before');
  578 |     await expect(card).toContainText('속초 단풍 여행');
  579 |     await expect(card).toContainText('D-5');
  580 |     await expect(card).toContainText('준비물');
  581 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  582 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  583 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  584 |     const more = page.getByTestId('home-more');
  585 |     await expect(more).toBeVisible();
  586 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  587 |     await more.locator('summary').click();
  588 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  589 |     await card.click();
  590 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  591 |     await page.context().close();
  592 |   });
  593 | 
  594 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  595 |     const page = await phone(browser);
  596 |     await signIn(page);
  597 |     await page.goto('/record');
  598 |     await page.getByLabel('어디 검색').fill('여수');
  599 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  600 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  601 |     await page.getByRole('button', { name: '몰라요' }).click();
  602 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  603 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  604 |     await page.getByTestId('save').click();
  605 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  606 |     await expect(page).toHaveURL(/tab=photos/);
  607 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  608 |     // 사진 탭 아래에 남은 공간 안내
  609 |     await expect(page.getByTestId('photo-space')).toContainText(/약 [\d,]+장 더 올릴 수 있어요/);
  610 |     await page.context().close();
  611 |   });
  612 | 
  613 |   test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
  614 |     const page = await phone(browser);
  615 |     await signIn(page);
  616 |     await page.goto('/feed');
  617 |     const sel = page.getByLabel('사진을 올릴 여행');
  618 |     await expect(sel).toBeVisible();
  619 |     const value = await sel.locator('option', { hasText: '여수 밤바다 사진' }).first().getAttribute('value');
  620 |     await sel.selectOption(value!);
  621 |     await page.getByTestId('quick-upload-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg', 'tests/fixtures/photo-gangneung.jpg']);
  622 |     await expect(page.getByRole('status')).toContainText('사진 2장을 올렸어요', { timeout: 60_000 });
  623 |     const first = page.getByTestId('feed-item').first();
  624 |     await expect(first).toHaveAttribute('data-kind', 'photos');
> 625 |     await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
      |                         ^ Error: expect(locator).toContainText(expected) failed
  626 |     await page.context().close();
  627 |   });
  628 | 
  629 |   test('오늘의 영어: 새 문장 3개가 뜨고, 외웠어요를 누르면 연속 학습일이 1이 되고, 고르기 퀴즈가 돈다', async ({ browser }) => {
  630 |     const page = await phone(browser);
  631 |     await signIn(page);
  632 |     await page.goto('/study');
  633 |     await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
  634 |     await page.getByTestId('study-know').first().click();
  635 |     await expect(page.getByRole('status')).toContainText('외웠어요');
  636 |     await expect(page.getByTestId('study-summary')).toContainText('1');
  637 |     // 새로 고쳐도 진도가 남고, 외운 문장도 오늘 묶음에 그대로 있다
  638 |     await page.reload();
  639 |     await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
  640 |     await expect(page.getByTestId('study-card').first()).toContainText('1단계');
  641 |     await page.getByTestId('study-more').click();
  642 |     await expect(page.getByTestId('study-card')).toHaveCount(6);
  643 |     // 고르기: 보기 4개, 하나 고르면 다음으로
  644 |     await page.getByRole('tab', { name: '고르기' }).click();
  645 |     const quiz = page.getByTestId('study-pick');
  646 |     await expect(quiz.locator('.study-opt')).toHaveCount(4);
  647 |     await quiz.locator('.study-opt').first().click();
  648 |     await expect(quiz.getByRole('button', { name: /다음|끝/ })).toBeVisible();
  649 |     // 끝까지 풀면 막다른 곳이 아니라 다음 공부(빈칸)로 가는 단추가 있다
  650 |     for (let n = 0; n < 30 && (await page.getByTestId('study-finish').count()) === 0; n++) {
  651 |       if (await quiz.locator('.study-opt:not([disabled])').count()) await quiz.locator('.study-opt').first().click();
  652 |       await quiz.getByRole('button', { name: /다음|끝/ }).click();
  653 |     }
  654 |     await expect(page.getByTestId('study-finish')).toBeVisible();
  655 |     await page.getByTestId('study-next').click();
  656 |     await expect(page.getByTestId('study-blank')).toBeVisible();
  657 |     // 단어장 안내는 실제 아이콘(깃발) 이름으로
  658 |     await page.getByRole('tab', { name: '단어장' }).click();
  659 |     await expect(page.getByText(/깃발/)).toBeVisible();
  660 |     await page.context().close();
  661 |   });
  662 | 
  663 |   test('로그인: 구글 단추가 맨 위, 메일은 접혀 있다가 누르면 펼쳐진다', { tag: '@webkit' }, async ({ browser }) => {
  664 |     const page = await phone(browser);
  665 |     await page.goto('/');
  666 |     const google = page.getByTestId('login');
  667 |     const open = page.getByTestId('email-open');
  668 |     await expect(google).toBeVisible();
  669 |     await expect(page.getByTestId('email-form')).toHaveCount(0);
  670 |     expect((await google.boundingBox())!.y).toBeLessThan((await open.boundingBox())!.y);
  671 |     await open.click();
  672 |     await expect(page.getByTestId('email-form')).toBeVisible();
  673 |     await page.getByRole('radio', { name: '처음이에요' }).click();
  674 |     await expect(page.getByTestId('email-submit')).toHaveText('가입하기');
  675 |     await page.context().close();
  676 |   });
  677 | 
  678 |   test('카카오톡 안 브라우저로 열면 바깥 브라우저 안내와 주소 복사 단추가 먼저 보인다', async ({ browser }) => {
  679 |     const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.4.0', permissions: ['clipboard-read', 'clipboard-write'] });
  680 |     const page = watch(await ctx.newPage());
  681 |     await page.goto('/');
  682 |     const note = page.getByTestId('inapp-notice');
  683 |     await expect(note).toBeVisible();
  684 |     await expect(note).toContainText('카카오톡');
  685 |     await note.getByRole('button', { name: '주소 복사' }).click();
  686 |     await expect(page.getByRole('status')).toContainText(/복사했어요|복사하지 못했어요/);
  687 |     await ctx.close();
  688 |   });
  689 | 
  690 |   test('가고 싶은 곳에서 여행 만들기: /plan?wish= 로 가서 목적지가 미리 채워지고, 뽑기는 ?find=dice 로 바로 열린다', async ({ browser }) => {
  691 |     const page = await phone(browser);
  692 |     await signIn(page);
  693 |     await page.goto('/wishes/new');
  694 |     await page.getByLabel('어디 검색').fill('통영');
  695 |     await page.getByRole('option', { name: /통영시/ }).first().click();
  696 |     await page.getByTestId('wish-save').click();
  697 |     await expect(page).toHaveURL(/\/wishes$/);
  698 |     await page.getByRole('link', { name: /통영시.*가고 싶은 곳 보기/ }).first().click();
  699 |     const id = page.url().split('/wishes/')[1];
  700 |     await page.getByTestId('wish-edit-plan').click();
  701 |     await expect(page).toHaveURL(new RegExp(`/plan\\?wish=${id}$`));
  702 |     await expect(page.getByTestId('planner-dest')).toContainText('통영');
  703 |     await expect(page.getByTestId('planner-make')).toHaveText('여행 만들기');
  704 |     await page.getByTestId('planner-make').click();
  705 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\/plan-next/);
  706 |     await expect(page.getByTestId('plan-flow')).toBeVisible();
  707 |     // 여행 탭·메뉴의 '여행 계획하기'도 /plan 하나로
  708 |     await page.goto('/wishes?find=dice');
  709 |     await expect(page.getByTestId('dice')).toBeVisible();
  710 |     await page.context().close();
  711 |   });
  712 | 
  713 |   for (const width of [360, 375, 390]) {
  714 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, { tag: '@webkit' }, async ({ browser }) => {
  715 |       const page = await phone(browser, width, 740);
  716 |       await page.goto('/');
  717 |       const art = page.locator('.login-mascot');
  718 |       await expect(art).toBeVisible();
  719 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  720 |       const a = await art.boundingBox();
  721 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  722 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  723 |         const r = document.createRange();
  724 |         r.selectNodeContents(el);
  725 |         const b = r.getBoundingClientRect();
```