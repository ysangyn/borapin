# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드
- Location: tests/human.spec.ts:550:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('stage-card')
Expected substring: "준비물"
Received string:    "다가오는 여행속초 단풍 여행D-5 · 속초시계획 0/5 · 다음은 '언제' · 2026.11.5이어서 계획하기"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('stage-card') with timeout 15000ms
  - waiting for getByTestId('stage-card')
    34 × locator resolved to <div data-stage="before" data-testid="stage-card" class="stage-card before">…</div>
       - unexpected value "다가오는 여행속초 단풍 여행D-5 · 속초시계획 0/5 · 다음은 '언제' · 2026.11.5이어서 계획하기"

```

```yaml
- link "속초 단풍 여행 보기":
  - /url: /trips/kAQPf0qCiNddTeck9fex
- text: 다가오는 여행 속초 단풍 여행 D-5 · 속초시 계획 0/5 · 다음은 '언제' · 2026.11.5
- link "이어서 계획하기":
  - /url: /trips/kAQPf0qCiNddTeck9fex/plan-next?step=when
```

# Test source

```ts
  471 |     if (await hub.isVisible() && (await hub.getAttribute('data-anchor')) === 'wish') await expect(hub.getByTestId('hub-first')).toContainText('영월');
  472 |     await page.goto('/wishes');
  473 |     // 축제 꼬리표는 한 줄, 오른쪽 단추(여행 만들기 또는 나도 원해요 하트)는 카드 안에
  474 |     const card = page.getByTestId('wish-card').filter({ hasText: '영월' }).first();
  475 |     await expect(card).toBeVisible();
  476 |     const tag = card.getByTestId('wish-festival');
  477 |     await expect(tag).toBeVisible();
  478 |     const tagBox = (await tag.boundingBox())!;
  479 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  480 |     const box = (await card.boundingBox())!;
  481 |     const cta = card.getByTestId('wish-plan').or(card.getByTestId('wish-heart')).first();
  482 |     await expect(cta).toBeVisible();
  483 |     const btn = (await cta.boundingBox())!;
  484 |     expect(btn.x + btn.width, '단추가 카드 밖으로 나가면 안 돼요').toBeLessThanOrEqual(box.x + box.width + 1);
  485 |     expect(tagBox.x + tagBox.width, '꼬리표가 단추와 겹치면 안 돼요').toBeLessThanOrEqual(btn.x + 1);
  486 |     await expect(card.locator('.t')).toContainText('영월');
  487 |     await page.context().close();
  488 |   });
  489 | 
  490 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  491 |     const page = await phone(browser);
  492 |     await signIn(page);
  493 |     const fab = page.getByTestId('ask-fab');
  494 |     await expect(fab).toBeVisible();
  495 |     await expect(fab).toBeInViewport({ ratio: 1 });
  496 |     // 아래 메뉴와 겹치지 않는다
  497 |     const f = (await fab.boundingBox())!;
  498 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  499 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  500 |     await fab.click();
  501 |     await expect(page).toHaveURL(/\/ask/);
  502 |     await expect(page.getByRole('heading', { name: '물어보기' })).toBeVisible();
  503 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  504 |     await page.goto('/map');
  505 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  506 |     await page.context().close();
  507 |   });
  508 | 
  509 |   test('폰에서 홈 지도는 한 손가락으로 끌면 움직인다 (두 손가락 안내 없이)', async ({ browser }) => {
  510 |     const page = await phone(browser);
  511 |     await signIn(page);
  512 |     const map = page.getByTestId('map').first();
  513 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  514 |     await map.scrollIntoViewIfNeeded();
  515 |     await page.waitForTimeout(800);
  516 |     const before = await map.getAttribute('data-center');
  517 |     const box = (await map.boundingBox())!;
  518 |     const cdp = await page.context().newCDPSession(page);
  519 |     const x = box.x + box.width / 2, y = box.y + box.height / 2;
  520 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  521 |     for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 12, y: y - i * 6 }] });
  522 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  523 |     await expect.poll(async () => map.getAttribute('data-center'), { timeout: 5000 }).not.toBe(before);
  524 |     await expect(page.getByText('두 손가락으로 움직여 주세요')).toBeHidden();
  525 |     await page.context().close();
  526 |   });
  527 | 
  528 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  529 |     const page = await phone(browser);
  530 |     await signIn(page);
  531 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  532 |     await page.goto('/record');
  533 |     await page.getByLabel('어디 검색').fill('고흥');
  534 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  535 |     await page.getByRole('button', { name: '몰라요' }).click();
  536 |     await page.getByTestId('save').click();
  537 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  538 |     await page.goto('/');
  539 |     const map = page.getByTestId('map').first();
  540 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  541 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  542 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  543 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  544 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  545 |     await page.getByRole('button', { name: '전체 보기' }).click();
  546 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  547 |     await page.context().close();
  548 |   });
  549 | 
  550 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  551 |     const page = await phone(browser);
  552 |     await signIn(page);
  553 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  554 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  555 |     await page.goto('/record?status=planned');
  556 |     await page.getByLabel('어디 검색').fill('속초');
  557 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  558 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  559 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  560 |     await page.getByLabel('시작 날짜').fill(ymd);
  561 |     // 갈 거예요로 남기면 단추는 '계획 남기기', 알림은 '계획을 남겼어요'
  562 |     await expect(page.getByTestId('save')).toHaveText('계획 남기기');
  563 |     await page.getByTestId('save').click();
  564 |     await expect(page.getByRole('status')).toContainText('계획을 남겼어요');
  565 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  566 |     await page.goto('/');
  567 |     const card = page.getByTestId('stage-card');
  568 |     await expect(card).toHaveAttribute('data-stage', 'before');
  569 |     await expect(card).toContainText('속초 단풍 여행');
  570 |     await expect(card).toContainText('D-5');
> 571 |     await expect(card).toContainText('준비물');
      |                        ^ Error: expect(locator).toContainText(expected) failed
  572 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  573 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  574 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  575 |     const more = page.getByTestId('home-more');
  576 |     await expect(more).toBeVisible();
  577 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  578 |     await more.locator('summary').click();
  579 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  580 |     await card.click();
  581 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  582 |     await page.context().close();
  583 |   });
  584 | 
  585 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  586 |     const page = await phone(browser);
  587 |     await signIn(page);
  588 |     await page.goto('/record');
  589 |     await page.getByLabel('어디 검색').fill('여수');
  590 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  591 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  592 |     await page.getByRole('button', { name: '몰라요' }).click();
  593 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  594 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  595 |     await page.getByTestId('save').click();
  596 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  597 |     await expect(page).toHaveURL(/tab=photos/);
  598 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  599 |     // 사진 탭 아래에 남은 공간 안내
  600 |     await expect(page.getByTestId('photo-space')).toContainText(/약 [\d,]+장 더 올릴 수 있어요/);
  601 |     await page.context().close();
  602 |   });
  603 | 
  604 |   test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
  605 |     const page = await phone(browser);
  606 |     await signIn(page);
  607 |     await page.goto('/feed');
  608 |     const sel = page.getByLabel('사진을 올릴 여행');
  609 |     await expect(sel).toBeVisible();
  610 |     const value = await sel.locator('option', { hasText: '여수 밤바다 사진' }).first().getAttribute('value');
  611 |     await sel.selectOption(value!);
  612 |     await page.getByTestId('quick-upload-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg', 'tests/fixtures/photo-gangneung.jpg']);
  613 |     await expect(page.getByRole('status')).toContainText('사진 2장을 올렸어요', { timeout: 60_000 });
  614 |     const first = page.getByTestId('feed-item').first();
  615 |     await expect(first).toHaveAttribute('data-kind', 'photos');
  616 |     await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
  617 |     await page.context().close();
  618 |   });
  619 | 
  620 |   test('오늘의 영어: 새 문장 3개가 뜨고, 외웠어요를 누르면 연속 학습일이 1이 되고, 고르기 퀴즈가 돈다', async ({ browser }) => {
  621 |     const page = await phone(browser);
  622 |     await signIn(page);
  623 |     await page.goto('/study');
  624 |     await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
  625 |     await page.getByTestId('study-know').first().click();
  626 |     await expect(page.getByRole('status')).toContainText('외웠어요');
  627 |     await expect(page.getByTestId('study-summary')).toContainText('1');
  628 |     // 새로 고쳐도 진도가 남고, 외운 문장도 오늘 묶음에 그대로 있다
  629 |     await page.reload();
  630 |     await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
  631 |     await expect(page.getByTestId('study-card').first()).toContainText('1단계');
  632 |     await page.getByTestId('study-more').click();
  633 |     await expect(page.getByTestId('study-card')).toHaveCount(6);
  634 |     // 고르기: 보기 4개, 하나 고르면 다음으로
  635 |     await page.getByRole('tab', { name: '고르기' }).click();
  636 |     const quiz = page.getByTestId('study-pick');
  637 |     await expect(quiz.locator('.study-opt')).toHaveCount(4);
  638 |     await quiz.locator('.study-opt').first().click();
  639 |     await expect(quiz.getByRole('button', { name: /다음|끝/ })).toBeVisible();
  640 |     // 끝까지 풀면 막다른 곳이 아니라 다음 공부(빈칸)로 가는 단추가 있다
  641 |     for (let n = 0; n < 30 && (await page.getByTestId('study-finish').count()) === 0; n++) {
  642 |       if (await quiz.locator('.study-opt:not([disabled])').count()) await quiz.locator('.study-opt').first().click();
  643 |       await quiz.getByRole('button', { name: /다음|끝/ }).click();
  644 |     }
  645 |     await expect(page.getByTestId('study-finish')).toBeVisible();
  646 |     await page.getByTestId('study-next').click();
  647 |     await expect(page.getByTestId('study-blank')).toBeVisible();
  648 |     // 단어장 안내는 실제 아이콘(깃발) 이름으로
  649 |     await page.getByRole('tab', { name: '단어장' }).click();
  650 |     await expect(page.getByText(/깃발/)).toBeVisible();
  651 |     await page.context().close();
  652 |   });
  653 | 
  654 |   test('로그인: 구글 단추가 맨 위, 메일은 접혀 있다가 누르면 펼쳐진다', { tag: '@webkit' }, async ({ browser }) => {
  655 |     const page = await phone(browser);
  656 |     await page.goto('/');
  657 |     const google = page.getByTestId('login');
  658 |     const open = page.getByTestId('email-open');
  659 |     await expect(google).toBeVisible();
  660 |     await expect(page.getByTestId('email-form')).toHaveCount(0);
  661 |     expect((await google.boundingBox())!.y).toBeLessThan((await open.boundingBox())!.y);
  662 |     await open.click();
  663 |     await expect(page.getByTestId('email-form')).toBeVisible();
  664 |     await page.getByRole('radio', { name: '처음이에요' }).click();
  665 |     await expect(page.getByTestId('email-submit')).toHaveText('가입하기');
  666 |     await page.context().close();
  667 |   });
  668 | 
  669 |   test('카카오톡 안 브라우저로 열면 바깥 브라우저 안내와 주소 복사 단추가 먼저 보인다', async ({ browser }) => {
  670 |     const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.4.0', permissions: ['clipboard-read', 'clipboard-write'] });
  671 |     const page = watch(await ctx.newPage());
```