# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로
- Location: tests/human.spec.ts:537:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.map-label').filter({ hasText: '고흥' }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.map-label').filter({ hasText: '고흥' }).first() with timeout 15000ms
  - waiting for locator('.map-label').filter({ hasText: '고흥' }).first()

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "우리 공간":
  - /url: /space
  - text: 보 영 m
- text: 보라 · 영상 외 1명의 지도 여덟 번의 여행, 핀 8개 꽂았어요
- link "속초시 여행 보기":
  - /url: /trips/Qa9HRnoU6bAdBRnGgPoQ
- text: 다가오는 여행 속초시 여행 D-9 · 속초시 계획 1/5 · 다음은 '어디서 자요' · 2026.11.14–15
- link "이어서 계획하기":
  - /url: /trips/Qa9HRnoU6bAdBRnGgPoQ/plan-next?step=stay
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해 1 1 2 1
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 핀 꽂기 단추가 나와요 전체 보기 단추를 누르면 전국이 보여요 7 다녀온 시·군 1 개국 8 여행·나들이 2 예정
- button "집에서 가장 가까운 빈 칸은 부천시예요 · 차로 약 20분"
- textbox "물어보기":
  - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 4곳":
  - /url: /wishes
- link "다음 여행 제주 여행 날짜는 아직 안 정했어요":
  - /url: /trips/J3BgnrtbTehBsAwnGZgB
- link "강원 영월군 그다음은 여기 · 영상":
  - /url: /wishes/CmHnK7aFeWOK6pc9wpse
- link "경남 남해군 영상":
  - /url: /wishes/B8CBVXMtDiCOfcz9UD0V
- link "날짜 정하기":
  - /url: /trips/J3BgnrtbTehBsAwnGZgB/edit
- text: 오늘의 한 질문
- paragraph: 제주에서 밤에는 뭘 하고 싶어?
- text: 나 흑돼지랑 고기국수
- button "메모에 넣기"
- text: 상대가 답하면 서로의 답이 열려요 제주 가는 길
- button "가기 좋은 때 5·6, 9~11월 · 덥지도 춥지도 않아요"
- text: 우리 집에서 직선 477km · 시·군 가운데까지
- button "길찾기"
- button "가는 길 제주공항 15km"
- group: 자세히 · 들러 가기 ▾
- link "오늘의 영어 3문장 · 90초":
  - /url: /study
- group: 이달의 추천 · 가고 싶은 곳
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "전남 고흥군 여행 전남 고흥군 · 날짜 모름":
  - /url: /trips/76VdwFcxY7OBIQ8fBIW3
- link "칠곡군 여행 경북 칠곡군 · 날짜 모름":
  - /url: /trips/cYeRAcZXKwHt0fodg7FN
- link "단양 끌어다 놓기 여행 충북 단양군 · 날짜 모름":
  - /url: /trips/Qneelq9YmTuC9qVIJLEE
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "남기기"
  - link "지도":
    - /url: /map
  - link "새 소식 2개 피드":
    - /url: /feed
    - text: 피드
- link "물어보기":
  - /url: /ask
- status
```

# Test source

```ts
  452 |     await expect(next).toContainText('집에서 가장 가까운 빈 칸은');
  453 |     await expect(next).toContainText(/차로 약 \d/);
  454 |     await next.click();
  455 |     await expect(page.getByTestId('region-sheet')).toBeVisible();
  456 |     await page.context().close();
  457 |   });
  458 | 
  459 |   test('가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 가운데로 나란히', async ({ browser }) => {
  460 |     const page = await phone(browser);
  461 |     // 긴 이름의 '지금 축제'를 제주에 하나 넣어 둔다 (실제 축제 자료는 매주 바뀌므로)
  462 |     const d = new Date(); const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  463 |     const s = new Date(d); s.setDate(d.getDate() - 1); const e = new Date(d); e.setDate(d.getDate() + 5);
  464 |     await page.route('**/data/festivals.json', (r) => r.fulfill({ json: { updated: ymd(d), source: '시험', cells: { '51750': [{ t: '영월 단종문화제 한마당 큰잔치 거리 퍼레이드', s: ymd(s), e: ymd(e), id: 'x' }] } } }));
  465 |     await signIn(page);
  466 |     // 영월을 가고 싶은 곳에 담는다 (다른 시험이 건드리지 않는 곳)
  467 |     await page.goto('/wishes/new?place=kr:51750');
  468 |     // 둘 다 원해요 + 1순위로 담아 홈 세 줄 안에 들게
  469 |     const chips = page.locator('.heart-chip');
  470 |     for (let i = 0; i < (await chips.count()); i++) {
  471 |       if ((await chips.nth(i).getAttribute('aria-pressed')) !== 'true') await chips.nth(i).click();
  472 |       await expect(chips.nth(i)).toHaveAttribute('aria-pressed', 'true');
  473 |     }
  474 |     await page.getByRole('button', { name: '1순위', exact: true }).click();
  475 |     await page.getByTestId('wish-save').click();
  476 |     await expect(page).not.toHaveURL(/wishes\/new/);
  477 |     // 홈 '다음 여행 준비'에 영월이 올라오고(예정 여행이 없을 때), 카드 모양은 가고 싶은 곳 목록에서 본다
  478 |     await page.goto('/');
  479 |     const hub = page.getByTestId('next-hub');
  480 |     if (await hub.isVisible() && (await hub.getAttribute('data-anchor')) === 'wish') await expect(hub.getByTestId('hub-first')).toContainText('영월');
  481 |     await page.goto('/wishes');
  482 |     // 축제 꼬리표는 한 줄, 오른쪽 단추(여행 만들기 또는 나도 원해요 하트)는 카드 안에
  483 |     const card = page.getByTestId('wish-card').filter({ hasText: '영월' }).first();
  484 |     await expect(card).toBeVisible();
  485 |     const tag = card.getByTestId('wish-festival');
  486 |     await expect(tag).toBeVisible();
  487 |     const tagBox = (await tag.boundingBox())!;
  488 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  489 |     const box = (await card.boundingBox())!;
  490 |     const cta = card.getByTestId('wish-plan').or(card.getByTestId('wish-heart')).first();
  491 |     await expect(cta).toBeVisible();
  492 |     const btn = (await cta.boundingBox())!;
  493 |     expect(btn.x + btn.width, '단추가 카드 밖으로 나가면 안 돼요').toBeLessThanOrEqual(box.x + box.width + 1);
  494 |     expect(tagBox.x + tagBox.width, '꼬리표가 단추와 겹치면 안 돼요').toBeLessThanOrEqual(btn.x + 1);
  495 |     await expect(card.locator('.t')).toContainText('영월');
  496 |     await page.context().close();
  497 |   });
  498 | 
  499 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  500 |     const page = await phone(browser);
  501 |     await signIn(page);
  502 |     const fab = page.getByTestId('ask-fab');
  503 |     await expect(fab).toBeVisible();
  504 |     await expect(fab).toBeInViewport({ ratio: 1 });
  505 |     // 아래 메뉴와 겹치지 않는다
  506 |     const f = (await fab.boundingBox())!;
  507 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  508 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  509 |     await fab.click();
  510 |     await expect(page).toHaveURL(/\/ask/);
  511 |     await expect(page.getByRole('heading', { name: '물어보기' })).toBeVisible();
  512 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  513 |     await page.goto('/map');
  514 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  515 |     await page.context().close();
  516 |   });
  517 | 
  518 |   test('폰에서 홈 지도는 한 손가락으로 끌면 움직인다 (두 손가락 안내 없이)', async ({ browser }) => {
  519 |     const page = await phone(browser);
  520 |     await signIn(page);
  521 |     const map = page.getByTestId('map').first();
  522 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  523 |     await map.scrollIntoViewIfNeeded();
  524 |     await page.waitForTimeout(800);
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
> 552 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
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
  625 |     await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
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
```