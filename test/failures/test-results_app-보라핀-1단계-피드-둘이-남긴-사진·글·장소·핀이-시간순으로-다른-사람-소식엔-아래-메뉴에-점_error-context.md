# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 피드: 둘이 남긴 사진·글·장소·핀이 시간순으로, 다른 사람 소식엔 아래 메뉴에 점
- Location: tests/app.spec.ts:475:3

# Error details

```
Error: 새 소식 점이 없어요: {"seen":1792155622115,"me":"영상","items":[{"kind":"trip","at":1792155622115,"by":"보라"},{"kind":"place","at":1792155600396,"by":"영상"},{"kind":"wish","at":1792155597786,"by":"영상"},{"kind":"trip","at":1792155593816,"by":"영상"},{"kind":"wish","at":1792155591920,"by":"영상"}]}

expect(locator).toBeVisible() failed

Locator: getByTestId('feed-dot')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - 새 소식 점이 없어요: {"seen":1792155622115,"me":"영상","items":[{"kind":"trip","at":1792155622115,"by":"보라"},{"kind":"place","at":1792155600396,"by":"영상"},{"kind":"wish","at":1792155597786,"by":"영상"},{"kind":"trip","at":1792155593816,"by":"영상"},{"kind":"wish","at":1792155591920,"by":"영상"}]} getByTestId('feed-dot') with timeout 15000ms
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
- text: 보라 & 영상의 지도 4번의 여행, 핀 4개
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해 1 1
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · ⛶ 를 누르면 전국이 보여요 3 다녀온 시·군 1 해외 나라 4 여행·나들이 0 예정
- textbox "보라에게 물어봐":
  - /placeholder: "보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳"
- text: 제주 여행 다녀오셨나요? 날짜가 지났어요. 다녀왔으면 지도에 핀으로 바꿔 둘게요.
- button "다녀왔어요"
- img "서울 경복궁 경회루"
- text: 서울 경복궁 경회루 10월에 가기 좋은 곳 서울 과거와 미래가 공존하는 K-컬처의 심장 가기 좋은 때 4~6, 9·10월
- button "가고 싶은 곳에 담기"
- link "자세히":
  - /url: /map?sel=kr:11
- link "여기 기록하기":
  - /url: /record?place=kr:11
- heading "가고 싶은 곳" [level=2]
- link "모두 보기 2":
  - /url: /wishes
- link "제주 가고 싶은 곳 보기":
  - /url: /wishes/iW2usuAl6d899LitH0TK
  - text: 제주 1 제주 보라 영상 둘 다 원해요 가기 좋은 때 5·6, 9~11월
- link "예정 · 2026년쯤":
  - /url: /trips/7pOjhkKfzhTFeq8r8LE1
- link "강원 동해시 가고 싶은 곳 보기":
  - /url: /wishes/W4hlUXP1VEEFUlL2h05j
  - text: 강원 강원 동해시 보라 영상 가기 좋은 때 4~6, 9·10월
- link "여행 만들기":
  - /url: /record?status=planned&place=kr:51170&wish=W4hlUXP1VEEFUlL2h05j
- link "교토 작년 가을 교토 단풍 여행 2025년 가을":
  - /url: /trips/GJbi4omQrJ9tKqLHsyU3
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "경남 보라의 통영 나들이 경남 통영시 · 날짜 모름":
  - /url: /trips/UothNaO4GOcpNl4daxrb
- link "부산 부산 여행 부산 · 날짜 모름":
  - /url: /trips/VRpLWznnWNoHI4IIpxAu
- link "일본 교토 단풍 여행 일본 교토 · 2025년 가을":
  - /url: /trips/GJbi4omQrJ9tKqLHsyU3
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
  408 |     await page.getByText('강릉시 여행', { exact: true }).click();
  409 |     await page.getByRole('tab', { name: '일정' }).click();
  410 |     const plan = page.getByTestId('plan-tab');
  411 |     await plan.getByLabel('가볼 곳 추가').fill('경포대');
  412 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  413 |     await plan.getByLabel('가볼 곳 추가').fill('안목 커피거리');
  414 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  415 |     // 우리 장소에서 바로 넣기
  416 |     await plan.getByRole('button', { name: '초당할머니순두부' }).click();
  417 |     await expect(plan.getByTestId('plan-item')).toHaveCount(3);
  418 |     // ② 날짜 ③ 시간·예약
  419 |     await plan.getByRole('button', { name: /경포대/ }).click();
  420 |     await plan.getByLabel('날짜').selectOption('2019-05-04');
  421 |     await plan.getByLabel('시간').fill('18:30');
  422 |     await expect(plan).toContainText('2일째 · 5.4 (토)');
  423 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '경포대' })).toContainText('18:30');
  424 |     await shot(page, '13-plan');
  425 | 
  426 |     // 기록: 쓴 사람이 보인다
  427 |     await page.getByRole('tab', { name: /글/ }).click();
  428 |     const notes = page.getByTestId('notes-tab');
  429 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  430 |     await notes.getByRole('button', { name: '남기기' }).click();
  431 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  432 |     await expect(notes.getByTestId('note')).toContainText('영상');
  433 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  434 | 
  435 |     // 준비물: 예정된 제주 여행
  436 |     await page.goto('/trips');
  437 |     await page.getByText('제주 여행', { exact: true }).click();
  438 |     const pack = page.getByTestId('packing');
  439 |     await pack.getByRole('button', { name: '휴양' }).click();
  440 |     await expect(pack).toContainText('수영복');
  441 |     await pack.getByLabel('수영복 챙김').check();
  442 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  443 |     await pack.getByLabel('선크림 담당자').click();
  444 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  445 |     await shot(page, '13b-packing');
  446 |   });
  447 | 
  448 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  449 |     await signIn(page, OWNER);
  450 |     const box = page.getByTestId('home-ask').getByLabel('보라에게 물어봐');
  451 |     await box.fill('강릉 맛집');
  452 |     await box.press('Enter');
  453 |     await expect(page).toHaveURL(/\/ask/);
  454 |     const answers = page.getByTestId('answer');
  455 |     await expect(answers.last()).toContainText('초당 순두부');
  456 |     await expect(answers.last()).toContainText('초당할머니순두부');
  457 |     const input = page.getByLabel('질문');
  458 |     await input.fill('거기 언제 가면 좋아?');
  459 |     await input.press('Enter');
  460 |     await expect(answers.last()).toContainText('강원 강릉시는');
  461 |     await input.fill('강릉 몇 번 갔지?');
  462 |     await input.press('Enter');
  463 |     await expect(answers.last()).toContainText('한 번 다녀왔어요');
  464 |     await input.fill('고성 맛집');
  465 |     await input.press('Enter');
  466 |     await expect(answers.last()).toContainText('여러 곳');
  467 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  468 |     await expect(answers.last()).toContainText('강원 고성군');
  469 |     await shot(page, '14-ask');
  470 |     await page.getByRole('button', { name: '처음으로' }).click();
  471 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  472 |     await expect(answers.last()).toContainText('시·군');
  473 |   });
  474 | 
  475 |   test('피드: 둘이 남긴 사진·글·장소·핀이 시간순으로, 다른 사람 소식엔 아래 메뉴에 점', async ({ page, browser }) => {
  476 |     await signIn(page, OWNER);
  477 |     await page.getByTestId('nav-feed').click();
  478 |     await expect(page).toHaveURL(/\/feed$/);
  479 |     const items = page.getByTestId('feed-item');
  480 |     await expect(items.first()).toBeVisible({ timeout: 15_000 });
  481 |     // 앞 시험들이 남긴 것들이 다 보인다: 사진 묶음, 글, 우리 장소, 핀
  482 |     await expect(page.locator('[data-testid="feed-item"][data-kind="photos"]').first()).toContainText('사진');
  483 |     await expect(page.locator('[data-testid="feed-item"][data-kind="note"]').first()).toContainText('바다 보며 커피 마신 날');
  484 |     await expect(page.locator('[data-testid="feed-item"][data-kind="place"]').first()).toBeVisible();
  485 |     await expect(page.locator('[data-testid="feed-item"][data-kind="trip"]').first()).toBeVisible();
  486 |     // 시간순(최신 먼저): 각 줄의 '얼마 전' 글이 거꾸로 가지 않는지는 단위 시험이 보고, 여기선 내가 남긴 건 '나'로 보이는지
  487 |     await expect(items.first().locator('.feed-who')).toContainText('나');
  488 |     // 내 소식만 있으니 점은 없다
  489 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  490 |     await shot(page, '17-feed');
  491 | 
  492 |     // 보라가 핀을 꽂으면 → 내 화면 아래 메뉴에 새 소식 점, 피드에 들어가면 사라진다
  493 |     const bora = await browser.newPage();
  494 |     await signIn(bora, 'bora@example.com');
  495 |     await expect(bora.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  496 |     await bora.goto('/record');
  497 |     await bora.getByLabel('어디 검색').fill('통영');
  498 |     await bora.getByRole('option', { name: /통영시/ }).first().click();
  499 |     await bora.getByLabel('제목').fill('보라의 통영 나들이');
  500 |     await bora.getByRole('button', { name: '몰라요' }).click();
  501 |     await bora.getByTestId('save').click();
  502 |     await expect(bora.getByTestId('trip-title')).toHaveText('보라의 통영 나들이');
  503 |     await bora.close();
  504 |     await page.goto('/');
  505 |     await expect(page.getByTestId('nav-feed')).toBeVisible();
  506 |     await expect.poll(async () => page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen)), { timeout: 15_000, message: '점 계산 자료' }).toContain('"by":"보라"');
  507 |     const dbg = await page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen));
> 508 |     await expect(page.getByTestId('feed-dot'), `새 소식 점이 없어요: ${dbg}`).toBeVisible({ timeout: 15_000 });
      |                                                                       ^ Error: 새 소식 점이 없어요: {"seen":1792155622115,"me":"영상","items":[{"kind":"trip","at":1792155622115,"by":"보라"},{"kind":"place","at":1792155600396,"by":"영상"},{"kind":"wish","at":1792155597786,"by":"영상"},{"kind":"trip","at":1792155593816,"by":"영상"},{"kind":"wish","at":1792155591920,"by":"영상"}]}
  509 |     await page.getByTestId('nav-feed').click();
  510 |     await expect(items.first()).toContainText('보라의 통영 나들이');
  511 |     await expect(items.first().locator('.feed-who')).toContainText('보라');
  512 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  513 |     // 추억 돌아보기로 넘어갈 수 있다
  514 |     await page.getByTestId('to-memories').click();
  515 |     await expect(page).toHaveURL(/\/memories$/);
  516 |   });
  517 | 
  518 |   test('공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기', async ({ page, browser }) => {
  519 |     await signIn(page, OWNER);
  520 |     await page.goto('/trips');
  521 |     await page.getByText('강릉시 여행', { exact: true }).click();
  522 |     const card = page.getByTestId('share-link');
  523 |     await card.getByTestId('share-on').click();
  524 |     const url = await card.getByLabel('공유 링크').inputValue();
  525 |     expect(url).toMatch(/\/s\/[a-z0-9]{8,}$/);
  526 |     // 보내기: 시험 주소는 카카오에 등록돼 있지 않으니 기기 공유하기로 (제목과 링크를 넘긴다)
  527 |     await expect(card.getByTestId('share-send')).toHaveText('보내기');
  528 |     await page.evaluate(() => { (navigator as unknown as { share: (d: ShareData) => Promise<void> }).share = async (d) => { (window as unknown as { __shared: ShareData }).__shared = d; }; });
  529 |     await card.getByTestId('share-send').click();
  530 |     await expect.poll(() => page.evaluate(() => (window as unknown as { __shared?: ShareData }).__shared)).toMatchObject({ title: '강릉시 여행', url });
  531 | 
  532 |     // 로그인하지 않은 사람이 링크로 연다
  533 |     const anon = await (await browser.newContext({ locale: 'ko-KR', serviceWorkers: 'block' })).newPage();
  534 |     await anon.goto(url);
  535 |     const shared = anon.getByTestId('shared-trip');
  536 |     await expect(shared).toContainText('강릉시 여행');
  537 |     await expect(shared).toContainText('초당할머니순두부');
  538 |     await shared.locator('.photo-grid').scrollIntoViewIfNeeded();
  539 |     await expect(shared.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  540 |     await expect(shared.locator('.trip-cover img[data-loaded]')).toHaveCount(1);
  541 |     await expect(shared).not.toContainText('바다 보며 커피 마신 날');
  542 |     const photoId = await shared.locator('.photo-cell img').first().getAttribute('data-photo');
  543 |     // 로그인 없이도 지도가 그려진다
  544 |     await expectMapDrawn(anon);
  545 |     await anon.screenshot({ path: `${SHOTS}/15-shared-trip.png` });
  546 | 
  547 |     // 공개를 끄면 링크가 닫힌다
  548 |     await card.getByRole('button', { name: '공개 끄기' }).click();
  549 |     await expect(card.getByTestId('share-on')).toBeVisible();
  550 |     await anon.reload();
  551 |     await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible();
  552 |     // 공개를 끈 사진 파일은 로그인 없이 못 읽는다
  553 |     const denied = await anon.evaluate((id) => (window as unknown as { __testPhoto: (id: string) => Promise<number> }).__testPhoto(id!).then(() => 'read', (e: { code?: string; message: string }) => e.code ?? e.message), photoId);
  554 |     expect(denied).toBe('permission-denied');
  555 |     await anon.context().close();
  556 | 
  557 |     // 공유 카드: 1080×1350 그림
  558 |     await page.goto('/memories');
  559 |     const sc = page.getByTestId('share-cards');
  560 |     await sc.getByRole('button', { name: '우리 지도' }).click();
  561 |     await expect(sc.getByTestId('card-img')).toBeVisible();
  562 |     const size = await sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
  563 |     expect(size).toEqual([1080, 1350]);
  564 |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15b-card-map.png` });
  565 |     await sc.getByRole('button', { name: '메모 인용' }).click();
  566 |     await page.waitForTimeout(800);
  567 |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15c-card-quote.png` });
  568 | 
  569 |     // 엑셀: 시트 4개짜리 .xlsx
  570 |     await page.goto('/space');
  571 |     const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('xlsx').click()]);
  572 |     expect(dl.suggestedFilename()).toMatch(/^보라핀_.*\.xlsx$/);
  573 |     const fs = await import('node:fs');
  574 |     const buf = fs.readFileSync((await dl.path())!);
  575 |     expect(buf.subarray(0, 2).toString()).toBe('PK');
  576 |     expect(buf.length).toBeGreaterThan(5000);
  577 |   });
  578 | 
  579 |   test('관리자: 사용량, 사진 올리기 멈춤, 문제 신고', async ({ page }) => {
  580 |     await signIn(page, OWNER);
  581 |     await page.goto('/space');
  582 |     // 문제 신고
  583 |     page.once('dialog', (d) => d.accept('지도가 가끔 늦게 떠요'));
  584 |     await page.getByTestId('report').click();
  585 |     await expect(page.getByRole('status')).toContainText('보내 주셔서 고마워요');
  586 |     await page.getByTestId('admin-link').click();
  587 |     const admin = page.getByTestId('admin');
  588 |     await expect(admin.getByTestId('usage')).toContainText('사진 3장');
  589 |     await expect(admin.getByTestId('usage')).toContainText('/ 1GB');
  590 |     await expect(admin.getByTestId('plan')).toContainText('무료(Spark)');
  591 |     await expect(admin.getByTestId('reports')).toContainText('지도가 가끔 늦게 떠요');
  592 |     // 사진 올리기 멈춤 → 여행 사진 탭에서 막힘
  593 |     await admin.getByLabel('멈추는 이유').fill('예산 점검');
  594 |     await admin.getByTestId('uploads-off').click();
  595 |     await expect(admin.getByTestId('cutoff')).toContainText('멈춤 · 예산 점검');
  596 |     await shot(page, '16-admin');
  597 |     await page.goto('/trips');
  598 |     await page.getByText('강릉시 여행', { exact: true }).click();
  599 |     await page.getByRole('tab', { name: /사진/ }).click();
  600 |     await page.getByTestId('photo-add').click();
  601 |     await expect(page.getByRole('status')).toContainText('사진 올리기를 잠시 멈췄어요');
  602 |     await page.goto('/admin');
  603 |     await page.getByTestId('uploads-on').click();
  604 |     await expect(page.getByTestId('cutoff')).toContainText('켜짐');
  605 |     await page.getByTestId('reports').getByRole('button', { name: '해결함' }).first().click();
  606 |     await expect(page.getByTestId('reports')).toContainText('들어온 신고가 없어요');
  607 |   });
  608 | 
```