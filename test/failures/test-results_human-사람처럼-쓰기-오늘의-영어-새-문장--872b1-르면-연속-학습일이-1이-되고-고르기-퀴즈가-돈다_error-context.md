# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 오늘의 영어: 새 문장 3개가 뜨고, 외웠어요를 누르면 연속 학습일이 1이 되고, 고르기 퀴즈가 돈다
- Location: tests/human.spec.ts:595:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('study-finish')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('study-finish') with timeout 15000ms
  - waiting for getByTestId('study-finish')

```

```yaml
- button "뒤로"
- heading "오늘의 영어" [level=1]
- text: 1 연속 학습일 0 외운 문장 4 공부 중 0 단어장
- tablist "공부 방법":
  - tab "보기"
  - tab "고르기" [selected]
  - tab "빈칸"
  - tab "말하기"
  - tab "단어장"
- text: 13 / 13 · 뜻에 맞는 영어를 고르세요 소스는 따로 주실 수 있나요?
- button "Is this dish very salty?"
- button "Could I get the sauce on the side?"
- button "No cilantro, please."
- button "Which exhibition would you recommend?"
- status
```

# Test source

```ts
  520 |     await page.getByRole('button', { name: '전체 보기' }).click();
  521 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  522 |     await page.context().close();
  523 |   });
  524 | 
  525 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  526 |     const page = await phone(browser);
  527 |     await signIn(page);
  528 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  529 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  530 |     await page.goto('/record?status=planned');
  531 |     await page.getByLabel('어디 검색').fill('속초');
  532 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  533 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  534 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  535 |     await page.getByLabel('시작 날짜').fill(ymd);
  536 |     // 갈 거예요로 남기면 단추는 '계획 남기기', 알림은 '계획을 남겼어요'
  537 |     await expect(page.getByTestId('save')).toHaveText('계획 남기기');
  538 |     await page.getByTestId('save').click();
  539 |     await expect(page.getByRole('status')).toContainText('계획을 남겼어요');
  540 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  541 |     await page.goto('/');
  542 |     const card = page.getByTestId('stage-card');
  543 |     await expect(card).toHaveAttribute('data-stage', 'before');
  544 |     await expect(card).toContainText('속초 단풍 여행');
  545 |     await expect(card).toContainText('D-5');
  546 |     await expect(card).toContainText('준비물');
  547 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  548 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  549 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  550 |     const more = page.getByTestId('home-more');
  551 |     await expect(more).toBeVisible();
  552 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  553 |     await more.locator('summary').click();
  554 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  555 |     await card.click();
  556 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  557 |     await page.context().close();
  558 |   });
  559 | 
  560 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  561 |     const page = await phone(browser);
  562 |     await signIn(page);
  563 |     await page.goto('/record');
  564 |     await page.getByLabel('어디 검색').fill('여수');
  565 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  566 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  567 |     await page.getByRole('button', { name: '몰라요' }).click();
  568 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  569 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  570 |     await page.getByTestId('save').click();
  571 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  572 |     await expect(page).toHaveURL(/tab=photos/);
  573 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  574 |     // 사진 탭 아래에 남은 공간 안내
  575 |     await expect(page.getByTestId('photo-space')).toContainText(/약 [\d,]+장 더 올릴 수 있어요/);
  576 |     await page.context().close();
  577 |   });
  578 | 
  579 |   test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
  580 |     const page = await phone(browser);
  581 |     await signIn(page);
  582 |     await page.goto('/feed');
  583 |     const sel = page.getByLabel('사진을 올릴 여행');
  584 |     await expect(sel).toBeVisible();
  585 |     const value = await sel.locator('option', { hasText: '여수 밤바다 사진' }).first().getAttribute('value');
  586 |     await sel.selectOption(value!);
  587 |     await page.getByTestId('quick-upload-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg', 'tests/fixtures/photo-gangneung.jpg']);
  588 |     await expect(page.getByRole('status')).toContainText('사진 2장을 올렸어요', { timeout: 60_000 });
  589 |     const first = page.getByTestId('feed-item').first();
  590 |     await expect(first).toHaveAttribute('data-kind', 'photos');
  591 |     await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
  592 |     await page.context().close();
  593 |   });
  594 | 
  595 |   test('오늘의 영어: 새 문장 3개가 뜨고, 외웠어요를 누르면 연속 학습일이 1이 되고, 고르기 퀴즈가 돈다', async ({ browser }) => {
  596 |     const page = await phone(browser);
  597 |     await signIn(page);
  598 |     await page.goto('/study');
  599 |     await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
  600 |     await page.getByTestId('study-know').first().click();
  601 |     await expect(page.getByRole('status')).toContainText('외웠어요');
  602 |     await expect(page.getByTestId('study-summary')).toContainText('1');
  603 |     // 새로 고쳐도 진도가 남고, 외운 문장도 오늘 묶음에 그대로 있다
  604 |     await page.reload();
  605 |     await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
  606 |     await expect(page.getByTestId('study-card').first()).toContainText('1단계');
  607 |     await page.getByTestId('study-more').click();
  608 |     await expect(page.getByTestId('study-card')).toHaveCount(6);
  609 |     // 고르기: 보기 4개, 하나 고르면 다음으로
  610 |     await page.getByRole('tab', { name: '고르기' }).click();
  611 |     const quiz = page.getByTestId('study-pick');
  612 |     await expect(quiz.locator('.study-opt')).toHaveCount(4);
  613 |     await quiz.locator('.study-opt').first().click();
  614 |     await expect(quiz.getByRole('button', { name: /다음|끝/ })).toBeVisible();
  615 |     // 끝까지 풀면 막다른 곳이 아니라 다음 공부(빈칸)로 가는 단추가 있다
  616 |     for (let n = 0; n < 12 && (await page.getByTestId('study-finish').count()) === 0; n++) {
  617 |       if (await quiz.locator('.study-opt:not([disabled])').count()) await quiz.locator('.study-opt').first().click();
  618 |       await quiz.getByRole('button', { name: /다음|끝/ }).click();
  619 |     }
> 620 |     await expect(page.getByTestId('study-finish')).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  621 |     await page.getByTestId('study-next').click();
  622 |     await expect(page.getByTestId('study-blank')).toBeVisible();
  623 |     // 단어장 안내는 실제 아이콘(깃발) 이름으로
  624 |     await page.getByRole('tab', { name: '단어장' }).click();
  625 |     await expect(page.getByText(/깃발/)).toBeVisible();
  626 |     await page.context().close();
  627 |   });
  628 | 
  629 |   test('로그인: 구글 단추가 맨 위, 메일은 접혀 있다가 누르면 펼쳐진다', async ({ browser }) => {
  630 |     const page = await phone(browser);
  631 |     await page.goto('/');
  632 |     const google = page.getByTestId('login');
  633 |     const open = page.getByTestId('email-open');
  634 |     await expect(google).toBeVisible();
  635 |     await expect(page.getByTestId('email-form')).toHaveCount(0);
  636 |     expect((await google.boundingBox())!.y).toBeLessThan((await open.boundingBox())!.y);
  637 |     await open.click();
  638 |     await expect(page.getByTestId('email-form')).toBeVisible();
  639 |     await page.getByRole('radio', { name: '처음이에요' }).click();
  640 |     await expect(page.getByTestId('email-submit')).toHaveText('가입하기');
  641 |     await page.context().close();
  642 |   });
  643 | 
  644 |   test('카카오톡 안 브라우저로 열면 바깥 브라우저 안내와 주소 복사 단추가 먼저 보인다', async ({ browser }) => {
  645 |     const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.4.0', permissions: ['clipboard-read', 'clipboard-write'] });
  646 |     const page = watch(await ctx.newPage());
  647 |     await page.goto('/');
  648 |     const note = page.getByTestId('inapp-notice');
  649 |     await expect(note).toBeVisible();
  650 |     await expect(note).toContainText('카카오톡');
  651 |     await note.getByRole('button', { name: '주소 복사' }).click();
  652 |     await expect(page.getByRole('status')).toContainText(/복사했어요|복사하지 못했어요/);
  653 |     await ctx.close();
  654 |   });
  655 | 
  656 |   test('가고 싶은 곳에서 여행 만들기: /plan?wish= 로 가서 목적지가 미리 채워지고, 뽑기는 ?find=dice 로 바로 열린다', async ({ browser }) => {
  657 |     const page = await phone(browser);
  658 |     await signIn(page);
  659 |     await page.goto('/wishes/new');
  660 |     await page.getByLabel('어디 검색').fill('통영');
  661 |     await page.getByRole('option', { name: /통영시/ }).first().click();
  662 |     await page.getByTestId('wish-save').click();
  663 |     await expect(page).toHaveURL(/\/wishes$/);
  664 |     await page.getByRole('link', { name: /통영시.*가고 싶은 곳 보기/ }).first().click();
  665 |     const id = page.url().split('/wishes/')[1];
  666 |     await page.getByTestId('wish-edit-plan').click();
  667 |     await expect(page).toHaveURL(new RegExp(`/plan\\?wish=${id}$`));
  668 |     await expect(page.getByTestId('planner-dest')).toContainText('통영');
  669 |     await expect(page.getByTestId('planner-make')).toHaveText('여행 만들기');
  670 |     await page.getByTestId('planner-make').click();
  671 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=plan/);
  672 |     // 여행 탭·메뉴의 '여행 계획하기'도 /plan 하나로
  673 |     await page.goto('/wishes?find=dice');
  674 |     await expect(page.getByTestId('dice')).toBeVisible();
  675 |     await page.context().close();
  676 |   });
  677 | 
  678 |   for (const width of [360, 375, 390]) {
  679 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
  680 |       const page = await phone(browser, width, 740);
  681 |       await page.goto('/');
  682 |       const art = page.locator('.login-mascot');
  683 |       await expect(art).toBeVisible();
  684 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  685 |       const a = await art.boundingBox();
  686 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  687 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  688 |         const r = document.createRange();
  689 |         r.selectNodeContents(el);
  690 |         const b = r.getBoundingClientRect();
  691 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  692 |       });
  693 |       const t = await textBox('.login-tag');
  694 |       const b = await textBox('.login-brand');
  695 |       for (const r of [t, b]) {
  696 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  697 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  698 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  699 |       }
  700 |       await page.context().close();
  701 |     });
  702 |   }
  703 | });
  704 | 
```