# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 여행 중: 단계 카드의 '지금 여기' → 위치 → (뒷단 없으면) 이 근처로 남기기
- Location: tests/human.spec.ts:720:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('here-sheet').getByTestId('here-fallback')
    - locator resolved to <button class="btn block" data-testid="here-fallback">이 근처로 남기기</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="plus" type="button" aria-label="남기기" aria-expanded="false">…</button> from <nav class="nav" aria-label="주 메뉴">…</nav> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="plus" type="button" aria-label="남기기" aria-expanded="false">…</button> from <nav class="nav" aria-label="주 메뉴">…</nav> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    28 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button class="plus" type="button" aria-label="남기기" aria-expanded="false">…</button> from <nav class="nav" aria-label="주 메뉴">…</nav> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Test source

```ts
  638 |     await expect(page.getByTestId('study-blank')).toBeVisible();
  639 |     // 단어장 안내는 실제 아이콘(깃발) 이름으로
  640 |     await page.getByRole('tab', { name: '단어장' }).click();
  641 |     await expect(page.getByText(/깃발/)).toBeVisible();
  642 |     await page.context().close();
  643 |   });
  644 | 
  645 |   test('로그인: 구글 단추가 맨 위, 메일은 접혀 있다가 누르면 펼쳐진다', { tag: '@webkit' }, async ({ browser }) => {
  646 |     const page = await phone(browser);
  647 |     await page.goto('/');
  648 |     const google = page.getByTestId('login');
  649 |     const open = page.getByTestId('email-open');
  650 |     await expect(google).toBeVisible();
  651 |     await expect(page.getByTestId('email-form')).toHaveCount(0);
  652 |     expect((await google.boundingBox())!.y).toBeLessThan((await open.boundingBox())!.y);
  653 |     await open.click();
  654 |     await expect(page.getByTestId('email-form')).toBeVisible();
  655 |     await page.getByRole('radio', { name: '처음이에요' }).click();
  656 |     await expect(page.getByTestId('email-submit')).toHaveText('가입하기');
  657 |     await page.context().close();
  658 |   });
  659 | 
  660 |   test('카카오톡 안 브라우저로 열면 바깥 브라우저 안내와 주소 복사 단추가 먼저 보인다', async ({ browser }) => {
  661 |     const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.4.0', permissions: ['clipboard-read', 'clipboard-write'] });
  662 |     const page = watch(await ctx.newPage());
  663 |     await page.goto('/');
  664 |     const note = page.getByTestId('inapp-notice');
  665 |     await expect(note).toBeVisible();
  666 |     await expect(note).toContainText('카카오톡');
  667 |     await note.getByRole('button', { name: '주소 복사' }).click();
  668 |     await expect(page.getByRole('status')).toContainText(/복사했어요|복사하지 못했어요/);
  669 |     await ctx.close();
  670 |   });
  671 | 
  672 |   test('가고 싶은 곳에서 여행 만들기: /plan?wish= 로 가서 목적지가 미리 채워지고, 뽑기는 ?find=dice 로 바로 열린다', async ({ browser }) => {
  673 |     const page = await phone(browser);
  674 |     await signIn(page);
  675 |     await page.goto('/wishes/new');
  676 |     await page.getByLabel('어디 검색').fill('통영');
  677 |     await page.getByRole('option', { name: /통영시/ }).first().click();
  678 |     await page.getByTestId('wish-save').click();
  679 |     await expect(page).toHaveURL(/\/wishes$/);
  680 |     await page.getByRole('link', { name: /통영시.*가고 싶은 곳 보기/ }).first().click();
  681 |     const id = page.url().split('/wishes/')[1];
  682 |     await page.getByTestId('wish-edit-plan').click();
  683 |     await expect(page).toHaveURL(new RegExp(`/plan\\?wish=${id}$`));
  684 |     await expect(page.getByTestId('planner-dest')).toContainText('통영');
  685 |     await expect(page.getByTestId('planner-make')).toHaveText('여행 만들기');
  686 |     await page.getByTestId('planner-make').click();
  687 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=plan/);
  688 |     // 여행 탭·메뉴의 '여행 계획하기'도 /plan 하나로
  689 |     await page.goto('/wishes?find=dice');
  690 |     await expect(page.getByTestId('dice')).toBeVisible();
  691 |     await page.context().close();
  692 |   });
  693 | 
  694 |   for (const width of [360, 375, 390]) {
  695 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, { tag: '@webkit' }, async ({ browser }) => {
  696 |       const page = await phone(browser, width, 740);
  697 |       await page.goto('/');
  698 |       const art = page.locator('.login-mascot');
  699 |       await expect(art).toBeVisible();
  700 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  701 |       const a = await art.boundingBox();
  702 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  703 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  704 |         const r = document.createRange();
  705 |         r.selectNodeContents(el);
  706 |         const b = r.getBoundingClientRect();
  707 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  708 |       });
  709 |       const t = await textBox('.login-tag');
  710 |       const b = await textBox('.login-brand');
  711 |       for (const r of [t, b]) {
  712 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  713 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  714 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  715 |       }
  716 |       await page.context().close();
  717 |     });
  718 |   }
  719 | 
  720 |   test('여행 중: 단계 카드의 \'지금 여기\' → 위치 → (뒷단 없으면) 이 근처로 남기기', async ({ browser }) => {
  721 |     test.setTimeout(120_000);
  722 |     const page = await phone(browser);
  723 |     await page.context().grantPermissions(['geolocation']);
  724 |     await page.context().setGeolocation({ latitude: 37.7956, longitude: 128.8961 }); // 강릉 경포
  725 |     await signIn(page);
  726 |     const t = new Date(); const t2 = new Date(t); t2.setDate(t.getDate() + 1);
  727 |     const id = await page.evaluate((w) => (window as unknown as { __testAddTrip: (i: unknown) => Promise<string> }).__testAddTrip({
  728 |       title: '강릉 지금 여행', kind: 'trip', status: 'planned', when: w, places: [{ t: 'kr', code: '51150' }], companions: [], memo: '', tags: [], source: 'app',
  729 |     }), { p: 'day', y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate(), y2: t2.getFullYear(), m2: t2.getMonth() + 1, d2: t2.getDate() });
  730 |     try {
  731 |       await page.goto('/');
  732 |       const stage = page.getByTestId('stage-card');
  733 |       await expect(stage).toHaveAttribute('data-stage', 'during');
  734 |       await stage.getByTestId('here-now').click({ timeout: 15_000 });
  735 |       const sheet = page.getByTestId('here-sheet');
  736 |       // 에뮬레이터에선 뒷단(관광공사)을 부르지 않으므로 '이 근처로 남기기'만
  737 |       await expect(sheet).toContainText('지금은 근처 장소를 찾을 수 없어요');
> 738 |       await sheet.getByTestId('here-fallback').click({ timeout: 15_000 });
      |                                                ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  739 |       await expect(page.getByRole('status')).toContainText('이 근처 남겼어요');
  740 |       await expect(sheet).toHaveCount(0);
  741 |     } finally {
  742 |       // 지우기가 막혀도 시험 실패 이유가 가려지지 않게 10초만 기다린다
  743 |       await Promise.race([page.evaluate((x) => (window as unknown as { __testDeleteTrip: (i: string) => Promise<void> }).__testDeleteTrip(x), id).catch(() => {}), new Promise((r) => setTimeout(r, 10_000))]);
  744 |       await page.context().close();
  745 |     }
  746 |   });
  747 | });
  748 | 
```