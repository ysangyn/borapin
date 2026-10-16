# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기
- Location: tests/app.spec.ts:419:3

# Error details

```
Error: expect(received).toMatch(expected)

Expected pattern: /permission/i
Received string:  "
evaluation error at L157:23 for 'get' @ L157, false for 'get' @ L198, false for 'get' @ L157, false for 'get' @ L198"
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e4]:
        - generic [ref=f2e5]:
          - button "뒤로" [ref=f2e6] [cursor=pointer]
          - generic [ref=f2e9]: 여행
        - link "고치기" [ref=f2e10] [cursor=pointer]:
          - /url: /trips/5vMNKGqx2QCJoF1m7KNf/edit
      - generic [ref=f2e13]:
        - generic [ref=f2e14]:
          - generic [ref=f2e15]: 강릉시 여행
          - generic [ref=f2e16]: 2019.5.3–4 (추정) · 1박 2일
        - button "표지 사진 크게 보기" [ref=f2e17] [cursor=pointer]
        - tablist "여행 보기" [ref=f2e18]:
          - tab "개요" [selected] [ref=f2e19] [cursor=pointer]
          - tab "일정" [ref=f2e20] [cursor=pointer]
          - tab "사진 3" [ref=f2e21] [cursor=pointer]
          - tab "기록 1" [ref=f2e22] [cursor=pointer]
        - generic [ref=f2e23]:
          - generic [ref=f2e24]:
            - generic:
              - region "Map" [ref=f2e25]
              - generic: 동해
              - generic: 서해
              - generic: 남해
          - generic [aria-hidden]:
            - generic: 강릉시
            - generic: 동해시
            - generic: 홍천군
            - generic: 평창군
            - generic: 횡성군
            - generic: 양양군
        - generic [ref=f2e26]:
          - generic [ref=f2e27]:
            - generic [ref=f2e28]: 어디
            - generic [ref=f2e30]:
              - generic [ref=f2e31]: 강원 강릉시
              - link "네이버지도" [ref=f2e32] [cursor=pointer]:
                - /url: https://map.naver.com/p/search/%EA%B0%95%EC%9B%90%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EA%B0%95%EB%A6%89%EC%8B%9C
              - link "구글지도" [ref=f2e33] [cursor=pointer]:
                - /url: https://www.google.com/maps/search/?api=1&query=%EA%B0%95%EC%9B%90%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EA%B0%95%EB%A6%89%EC%8B%9C
          - generic [ref=f2e34]:
            - generic [ref=f2e35]: 누구와
            - generic [ref=f2e36]: 보라, 영상, 엄마
          - generic [ref=f2e37]:
            - generic [ref=f2e38]: 남긴 사람
            - generic [ref=f2e39]: 영상
        - generic [ref=f2e40]:
          - generic [ref=f2e41]:
            - heading "장소" [level=2] [ref=f2e42]
            - link "+ 장소 남기기" [ref=f2e43] [cursor=pointer]:
              - /url: /places/new?trip=5vMNKGqx2QCJoF1m7KNf
          - link "맛집 초당할머니순두부 또 갈래요 영상 순두부 젤라또까지 완벽 보라 아침으로 최고" [ref=f2e45] [cursor=pointer]:
            - /url: /places/KdHr15VqJfO4hKPzQSUK
            - generic [ref=f2e46]: 맛집
            - generic [ref=f2e47]:
              - generic [ref=f2e48]:
                - generic [ref=f2e49]: 초당할머니순두부
                - generic [ref=f2e50]: 또 갈래요
              - generic [ref=f2e51]: 영상 순두부 젤라또까지 완벽
              - generic [ref=f2e52]: 보라 아침으로 최고
        - generic [ref=f2e53]:
          - generic [ref=f2e54]:
            - generic [ref=f2e55]: 링크 공개
            - generic [ref=f2e58]: 우리만 보기
          - generic [ref=f2e59]: 앱이 없어도 이 여행의 지도·사진·들른 곳을 볼 수 있는 링크를 만들어요. 메모와 글, 함께 간 사람 이름은 넣지 않아요.
          - button "링크 만들기" [ref=f2e60] [cursor=pointer]
        - button "이 기록 지우기" [ref=f2e61] [cursor=pointer]
      - navigation "주 메뉴" [ref=f2e64]:
        - link "홈" [ref=f2e65] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f2e68] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f2e71] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f2e74] [cursor=pointer]:
          - /url: /map
        - link "추억" [ref=f2e77] [cursor=pointer]:
          - /url: /memories
    - status [ref=f2e80]:
      - generic [ref=f2e81]: 공개를 껐어요
  - iframe [aria-hidden] [ref=f2e82]
```

# Test source

```ts
  348 |   test('여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  349 |     await signIn(page, OWNER);
  350 |     // 일정: 날짜가 있는 강릉 여행(사진으로 2019.5.3–4)
  351 |     await page.goto('/trips');
  352 |     await page.getByText('강릉시 여행', { exact: true }).click();
  353 |     await page.getByRole('tab', { name: '일정' }).click();
  354 |     const plan = page.getByTestId('plan-tab');
  355 |     await plan.getByLabel('가볼 곳 추가').fill('경포대');
  356 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  357 |     await plan.getByLabel('가볼 곳 추가').fill('안목 커피거리');
  358 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  359 |     // 우리 장소에서 바로 넣기
  360 |     await plan.getByRole('button', { name: '초당할머니순두부' }).click();
  361 |     await expect(plan.getByTestId('plan-item')).toHaveCount(3);
  362 |     // ② 날짜 ③ 시간·예약
  363 |     await plan.getByRole('button', { name: /경포대/ }).click();
  364 |     await plan.getByLabel('날짜').selectOption('2019-05-04');
  365 |     await plan.getByLabel('시간').fill('18:30');
  366 |     await expect(plan).toContainText('2일째 · 5.4 (토)');
  367 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '경포대' })).toContainText('18:30');
  368 |     await shot(page, '13-plan');
  369 | 
  370 |     // 기록: 쓴 사람이 보인다
  371 |     await page.getByRole('tab', { name: /기록/ }).click();
  372 |     const notes = page.getByTestId('notes-tab');
  373 |     await notes.getByLabel('여행 기록 쓰기').fill('바다 보며 커피 마신 날');
  374 |     await notes.getByRole('button', { name: '남기기' }).click();
  375 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  376 |     await expect(notes.getByTestId('note')).toContainText('영상');
  377 |     await expect(page.getByRole('tab', { name: '기록 1' })).toBeVisible();
  378 | 
  379 |     // 준비물: 예정된 제주 여행
  380 |     await page.goto('/trips');
  381 |     await page.getByText('제주 여행', { exact: true }).click();
  382 |     const pack = page.getByTestId('packing');
  383 |     await pack.getByRole('button', { name: '휴양' }).click();
  384 |     await expect(pack).toContainText('수영복');
  385 |     await pack.getByLabel('수영복 챙김').check();
  386 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  387 |     await pack.getByLabel('선크림 담당자').click();
  388 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  389 |     await shot(page, '13b-packing');
  390 |   });
  391 | 
  392 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  393 |     await signIn(page, OWNER);
  394 |     const box = page.getByTestId('home-ask').getByLabel('찾아보기');
  395 |     await box.fill('강릉 맛집');
  396 |     await box.press('Enter');
  397 |     await expect(page).toHaveURL(/\/ask/);
  398 |     const answers = page.getByTestId('answer');
  399 |     await expect(answers.last()).toContainText('초당 순두부');
  400 |     await expect(answers.last()).toContainText('초당할머니순두부');
  401 |     const input = page.getByLabel('질문');
  402 |     await input.fill('거기 언제 가면 좋아?');
  403 |     await input.press('Enter');
  404 |     await expect(answers.last()).toContainText('강원 강릉시은(는)');
  405 |     await input.fill('강릉 몇 번 갔지?');
  406 |     await input.press('Enter');
  407 |     await expect(answers.last()).toContainText('1번 다녀왔어요');
  408 |     await input.fill('고성 맛집');
  409 |     await input.press('Enter');
  410 |     await expect(answers.last()).toContainText('여러 곳');
  411 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  412 |     await expect(answers.last()).toContainText('강원 고성군');
  413 |     await shot(page, '14-ask');
  414 |     await page.getByRole('button', { name: '처음으로' }).click();
  415 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  416 |     await expect(answers.last()).toContainText('시·군');
  417 |   });
  418 | 
  419 |   test('공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기', async ({ page, browser }) => {
  420 |     await signIn(page, OWNER);
  421 |     await page.goto('/trips');
  422 |     await page.getByText('강릉시 여행', { exact: true }).click();
  423 |     const card = page.getByTestId('share-link');
  424 |     await card.getByTestId('share-on').click();
  425 |     const url = await card.getByLabel('공유 링크').inputValue();
  426 |     expect(url).toMatch(/\/s\/[a-z0-9]{8,}$/);
  427 | 
  428 |     // 로그인하지 않은 사람이 링크로 연다
  429 |     const anon = await (await browser.newContext({ locale: 'ko-KR', serviceWorkers: 'block' })).newPage();
  430 |     await anon.goto(url);
  431 |     const shared = anon.getByTestId('shared-trip');
  432 |     await expect(shared).toContainText('강릉시 여행');
  433 |     await expect(shared).toContainText('초당할머니순두부');
  434 |     await shared.locator('.photo-grid').scrollIntoViewIfNeeded();
  435 |     await expect(shared.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  436 |     await expect(shared.locator('.trip-cover img[data-loaded]')).toHaveCount(1);
  437 |     await expect(shared).not.toContainText('바다 보며 커피 마신 날');
  438 |     const photoId = await shared.locator('.photo-cell img').first().getAttribute('data-photo');
  439 |     await anon.screenshot({ path: `${SHOTS}/15-shared-trip.png` });
  440 | 
  441 |     // 공개를 끄면 링크가 닫힌다
  442 |     await card.getByRole('button', { name: '공개 끄기' }).click();
  443 |     await expect(card.getByTestId('share-on')).toBeVisible();
  444 |     await anon.reload();
  445 |     await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible();
  446 |     // 공개를 끈 사진 파일은 로그인 없이 못 읽는다
  447 |     const denied = await anon.evaluate((id) => (window as unknown as { __testPhoto: (id: string) => Promise<number> }).__testPhoto(id!).then(() => 'read', (e: Error) => e.message), photoId);
> 448 |     expect(denied).toMatch(/permission/i);
      |                    ^ Error: expect(received).toMatch(expected)
  449 |     await anon.context().close();
  450 | 
  451 |     // 공유 카드: 1080×1350 그림
  452 |     await page.goto('/memories');
  453 |     const sc = page.getByTestId('share-cards');
  454 |     await sc.getByRole('button', { name: '나의 지도' }).click();
  455 |     await expect(sc.getByTestId('card-img')).toBeVisible();
  456 |     const size = await sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
  457 |     expect(size).toEqual([1080, 1350]);
  458 |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15b-card-map.png` });
  459 |     await sc.getByRole('button', { name: '메모 인용' }).click();
  460 |     await page.waitForTimeout(800);
  461 |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15c-card-quote.png` });
  462 | 
  463 |     // 엑셀: 시트 4개짜리 .xlsx
  464 |     await page.goto('/space');
  465 |     const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('xlsx').click()]);
  466 |     expect(dl.suggestedFilename()).toMatch(/^보라핀_.*\.xlsx$/);
  467 |     const fs = await import('node:fs');
  468 |     const buf = fs.readFileSync((await dl.path())!);
  469 |     expect(buf.subarray(0, 2).toString()).toBe('PK');
  470 |     expect(buf.length).toBeGreaterThan(5000);
  471 |   });
  472 | 
  473 |   test('관리자: 사용량, 사진 올리기 멈춤, 문제 신고', async ({ page }) => {
  474 |     await signIn(page, OWNER);
  475 |     await page.goto('/space');
  476 |     // 문제 신고
  477 |     page.once('dialog', (d) => d.accept('지도가 가끔 늦게 떠요'));
  478 |     await page.getByTestId('report').click();
  479 |     await expect(page.getByRole('status')).toContainText('보내 주셔서 고마워요');
  480 |     await page.getByTestId('admin-link').click();
  481 |     const admin = page.getByTestId('admin');
  482 |     await expect(admin.getByTestId('usage')).toContainText('사진 3장');
  483 |     await expect(admin.getByTestId('usage')).toContainText('/ 1GB');
  484 |     await expect(admin.getByTestId('plan')).toContainText('무료(Spark)');
  485 |     await expect(admin.getByTestId('reports')).toContainText('지도가 가끔 늦게 떠요');
  486 |     // 사진 올리기 멈춤 → 여행 사진 탭에서 막힘
  487 |     await admin.getByLabel('멈추는 이유').fill('예산 점검');
  488 |     await admin.getByTestId('uploads-off').click();
  489 |     await expect(admin.getByTestId('cutoff')).toContainText('멈춤 · 예산 점검');
  490 |     await shot(page, '16-admin');
  491 |     await page.goto('/trips');
  492 |     await page.getByText('강릉시 여행', { exact: true }).click();
  493 |     await page.getByRole('tab', { name: /사진/ }).click();
  494 |     await page.getByTestId('photo-add').click();
  495 |     await expect(page.getByRole('status')).toContainText('사진 올리기를 잠시 멈췄어요');
  496 |     await page.goto('/admin');
  497 |     await page.getByTestId('uploads-on').click();
  498 |     await expect(page.getByTestId('cutoff')).toContainText('켜짐');
  499 |     await page.getByTestId('reports').getByRole('button', { name: '해결함' }).first().click();
  500 |     await expect(page.getByTestId('reports')).toContainText('들어온 신고가 없어요');
  501 |   });
  502 | 
  503 |   test('초대 안 된 계정은 막고, 추가하면 들어온다', async ({ page }) => {
  504 |     await signIn(page, 'stranger@example.com');
  505 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  506 |     await shot(page, '10-denied');
  507 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  508 |     await signIn(page, OWNER);
  509 |     await page.goto('/space');
  510 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  511 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  512 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  513 |     await shot(page, '11-space');
  514 |     await page.getByRole('button', { name: '로그아웃' }).click();
  515 |     await signIn(page, 'bora@example.com');
  516 |     await expect(page.getByTestId('headline')).toHaveText(/번의 여행/);
  517 |   });
  518 | 
  519 |   test('기록 고치기와 지우기', async ({ page }) => {
  520 |     await signIn(page, OWNER);
  521 |     await page.goto('/trips');
  522 |     await page.getByText('강릉시 여행', { exact: true }).click();
  523 |     await page.getByRole('link', { name: '고치기' }).click();
  524 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  525 |     await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
  526 |     await page.getByLabel('제목').fill('엄마랑 강릉');
  527 |     await page.getByTestId('save').click();
  528 |     await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
  529 |     await page.getByRole('button', { name: '이 기록 지우기' }).click();
  530 |     await page.getByRole('button', { name: '지우기', exact: true }).click();
  531 |     await expect(page).toHaveURL(/\/trips$/);
  532 |     await expect(page.getByTestId('trip-row')).toHaveCount(3);
  533 |   });
  534 | });
  535 | 
```