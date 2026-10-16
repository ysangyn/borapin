# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 가운데로 나란히
- Location: tests/human.spec.ts:374:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('wish-group-both').getByTestId('wish-card').filter({ hasText: '영월' }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('wish-group-both').getByTestId('wish-card').filter({ hasText: '영월' }).first() with timeout 15000ms
  - waiting for getByTestId('wish-group-both').getByTestId('wish-card').filter({ hasText: '영월' }).first()

```

```yaml
- button "뒤로"
- heading "가고 싶은 곳" [level=1]
- link "담기":
  - /url: /wishes/new
- tablist "누가 원하는 곳":
  - tab "전체 5" [selected]
  - tab "둘 다 원해요 1"
  - tab "내 하트 5"
- heading "한 명만 원해요" [level=2]
- text: 4곳
- link "강원 영월군 가고 싶은 곳 보기":
  - /url: /wishes/4GfyHp6b6Xod070nY67O
  - text: 강원 1 강원 영월군 지금 축제 · 영월 단종문화제 한마당 큰잔치 거리 퍼레이드 10.15~21 가기 좋은 때 4~6, 9·10월
- button "내 하트 빼기" [pressed]: 나
- link "경남 남해군 가고 싶은 곳 보기":
  - /url: /wishes/3WXABdSxy86koRhKwe0M
  - text: 경남 남해군 가기 좋은 때 4~6, 10·11월
- button "내 하트 빼기" [pressed]: 나
- link "대만 가오슝 가고 싶은 곳 보기":
  - /url: /wishes/Azl2TyfKvcy2VuPkhoDA
  - text: 대만 대만 가오슝 가기 좋은 때 11~3월 먹을 것 해산물
- button "내 하트 빼기" [pressed]: 나
- link "강원 속초시 가고 싶은 곳 보기":
  - /url: /wishes/aIM7fjcWvy4jU6vlBB9w
  - text: 강원 속초시 가기 좋은 때 4~6, 9·10월
- button "내 하트 빼기" [pressed]: 나
- heading "예정" [level=2]
- text: 1곳
- link "제주 가고 싶은 곳 보기":
  - /url: /wishes/sil919Dy6Sy7a36vw06T
  - text: 1 제주 가기 좋은 때 5·6, 9~11월 가볼 곳 성산일출봉 외 1
- link "예정 · 2026년쯤":
  - /url: /trips/poP5J59gNZFUSAUuw7Gj
- heading "찾아보기" [level=2]
- button "여행지 뽑기 국내 160곳 · 테마로"
- button "해외 도시 고르기 125곳 · 예산·비행·누구와"
- text: 담아 둔 곳 소식 · 한 곳에 한 줄
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - link "기록하기":
    - /url: /record
  - link "지도":
    - /url: /map
  - link "새 소식 1개 피드":
    - /url: /feed
    - text: 피드
- link "보라에게 물어봐":
  - /url: /ask
- status
```

# Test source

```ts
  299 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  300 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  301 |     await back.click();
  302 |     await expect.poll(() => asked).toContain('저장하지 않은 내용');
  303 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  304 |     await page.context().close();
  305 |   });
  306 | 
  307 |   test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
  308 |     const page = await phone(browser);
  309 |     await signIn(page);
  310 |     await page.goto('/places/new');
  311 |     // 네이버지도 입력 칸은 하나뿐
  312 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
  313 |     // 고른 종류에만 눌림·체크 표시
  314 |     const food = page.getByRole('button', { name: '맛집', exact: true });
  315 |     const cafe = page.getByRole('button', { name: '카페', exact: true });
  316 |     await expect(food).toHaveAttribute('aria-pressed', 'true');
  317 |     await expect(food.locator('.chip-check')).toBeVisible();
  318 |     await cafe.click();
  319 |     await expect(cafe).toHaveAttribute('aria-pressed', 'true');
  320 |     await expect(food).toHaveAttribute('aria-pressed', 'false');
  321 |     await expect(food.locator('.chip-check')).toHaveCount(0);
  322 |     const again = page.getByRole('button', { name: '또 갈래요', exact: true });
  323 |     await again.click();
  324 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  325 |     await expect(again.locator('.chip-check')).toBeVisible();
  326 |     // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
  327 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
  328 |     await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
  329 |     await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
  330 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
  331 |     await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
  332 |     // 링크를 빼면 다시 붙여 넣을 수 있다
  333 |     await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
  334 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  335 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  336 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  337 |     await page.context().close();
  338 |   });
  339 | 
  340 |   test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
  341 |     const page = await phone(browser);
  342 |     await signIn(page);
  343 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  344 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  345 |     // 여행 없이 장소만 (칠곡)
  346 |     await page.goto('/places/new');
  347 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  348 |     await page.getByLabel('어디 검색').fill('칠곡');
  349 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  350 |     await page.getByTestId('place-save').click();
  351 |     // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
  352 |     await expect(page.getByRole('status')).toContainText('장소를 남겼어요');
  353 |     await page.goto('/');
  354 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  355 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
  356 |     await expect(spot).toHaveCount(1);
  357 |     await expect(spot).toContainText('1');
  358 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  359 |     await expect(page.getByTestId('headline')).toHaveText(before);
  360 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  361 |     await page.goto('/places/new');
  362 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  363 |     await page.getByLabel('어디 검색').fill('칠곡');
  364 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  365 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  366 |     await page.getByTestId('place-save').click();
  367 |     await expect(page.getByRole('status')).toContainText('장소를 남기고 핀도 꽂았어요');
  368 |     await page.goto('/');
  369 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  370 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  371 |     await page.context().close();
  372 |   });
  373 | 
  374 |   test('가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 가운데로 나란히', async ({ browser }) => {
  375 |     const page = await phone(browser);
  376 |     // 긴 이름의 '지금 축제'를 제주에 하나 넣어 둔다 (실제 축제 자료는 매주 바뀌므로)
  377 |     const d = new Date(); const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  378 |     const s = new Date(d); s.setDate(d.getDate() - 1); const e = new Date(d); e.setDate(d.getDate() + 5);
  379 |     await page.route('**/data/festivals.json', (r) => r.fulfill({ json: { updated: ymd(d), source: '시험', cells: { '51750': [{ t: '영월 단종문화제 한마당 큰잔치 거리 퍼레이드', s: ymd(s), e: ymd(e), id: 'x' }] } } }));
  380 |     await signIn(page);
  381 |     // 영월을 가고 싶은 곳에 담는다 (다른 시험이 건드리지 않는 곳)
  382 |     await page.goto('/wishes/new?place=kr:51750');
  383 |     // 둘 다 원해요 + 1순위로 담아 홈 세 줄 안에 들게
  384 |     const chips = page.locator('.heart-chip');
  385 |     for (let i = 0; i < (await chips.count()); i++) {
  386 |       if ((await chips.nth(i).getAttribute('aria-pressed')) !== 'true') await chips.nth(i).click();
  387 |       await expect(chips.nth(i)).toHaveAttribute('aria-pressed', 'true');
  388 |     }
  389 |     await page.getByRole('button', { name: '1순위', exact: true }).click();
  390 |     await page.getByTestId('wish-save').click();
  391 |     await expect(page).not.toHaveURL(/wishes\/new/);
  392 |     // 홈 '다음 여행 준비'에 영월이 올라오고(예정 여행이 없을 때), 카드 모양은 가고 싶은 곳 목록에서 본다
  393 |     await page.goto('/');
  394 |     const hub = page.getByTestId('next-hub');
  395 |     if (await hub.isVisible() && (await hub.getAttribute('data-anchor')) === 'wish') await expect(hub.getByTestId('hub-first')).toContainText('영월');
  396 |     await page.goto('/wishes');
  397 |     // 둘 다 원하는 곳은 큰 카드(사진 자리 + 아래 줄)로, 축제 꼬리표는 한 줄, 주요 단추는 '여행 만들기'
  398 |     const card = page.getByTestId('wish-group-both').getByTestId('wish-card').filter({ hasText: '영월' }).first();
> 399 |     await expect(card).toBeVisible();
      |                        ^ Error: expect(locator).toBeVisible() failed
  400 |     const tag = card.getByTestId('wish-festival');
  401 |     await expect(tag).toBeVisible();
  402 |     const tagBox = (await tag.boundingBox())!;
  403 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  404 |     const box = (await card.boundingBox())!;
  405 |     const pageW = (await page.viewportSize())!.width;
  406 |     expect(box.width, '큰 카드는 화면 너비를 꽉 써야 해요').toBeGreaterThan(pageW - 40);
  407 |     const btn = (await card.getByTestId('wish-plan').boundingBox())!;
  408 |     expect(btn.x + btn.width, '단추가 카드 밖으로 나가면 안 돼요').toBeLessThanOrEqual(box.x + box.width + 1);
  409 |     await expect(card.locator('.t')).toContainText('영월');
  410 |     await page.context().close();
  411 |   });
  412 | 
  413 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  414 |     const page = await phone(browser);
  415 |     await signIn(page);
  416 |     const fab = page.getByTestId('ask-fab');
  417 |     await expect(fab).toBeVisible();
  418 |     await expect(fab).toBeInViewport({ ratio: 1 });
  419 |     // 아래 메뉴와 겹치지 않는다
  420 |     const f = (await fab.boundingBox())!;
  421 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  422 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  423 |     await fab.click();
  424 |     await expect(page).toHaveURL(/\/ask/);
  425 |     await expect(page.getByText('보라에게 물어봐')).toBeVisible();
  426 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  427 |     await page.goto('/map');
  428 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  429 |     await page.context().close();
  430 |   });
  431 | 
  432 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  433 |     const page = await phone(browser);
  434 |     await signIn(page);
  435 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  436 |     await page.goto('/record');
  437 |     await page.getByLabel('어디 검색').fill('고흥');
  438 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  439 |     await page.getByRole('button', { name: '몰라요' }).click();
  440 |     await page.getByTestId('save').click();
  441 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  442 |     await page.goto('/');
  443 |     const map = page.getByTestId('map').first();
  444 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  445 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  446 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  447 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  448 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  449 |     await page.getByRole('button', { name: '전체 보기' }).click();
  450 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  451 |     await page.context().close();
  452 |   });
  453 | 
  454 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  455 |     const page = await phone(browser);
  456 |     await signIn(page);
  457 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  458 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  459 |     await page.goto('/record?status=planned');
  460 |     await page.getByLabel('어디 검색').fill('속초');
  461 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  462 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  463 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  464 |     await page.getByLabel('시작 날짜').fill(ymd);
  465 |     await page.getByTestId('save').click();
  466 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  467 |     await page.goto('/');
  468 |     const card = page.getByTestId('stage-card');
  469 |     await expect(card).toHaveAttribute('data-stage', 'before');
  470 |     await expect(card).toContainText('속초 단풍 여행');
  471 |     await expect(card).toContainText('D-5');
  472 |     await expect(card).toContainText('준비물');
  473 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  474 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  475 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  476 |     const more = page.getByTestId('home-more');
  477 |     await expect(more).toBeVisible();
  478 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  479 |     await more.locator('summary').click();
  480 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  481 |     await card.click();
  482 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  483 |     await page.context().close();
  484 |   });
  485 | 
  486 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  487 |     const page = await phone(browser);
  488 |     await signIn(page);
  489 |     await page.goto('/record');
  490 |     await page.getByLabel('어디 검색').fill('여수');
  491 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  492 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  493 |     await page.getByRole('button', { name: '몰라요' }).click();
  494 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  495 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  496 |     await page.getByTestId('save').click();
  497 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  498 |     await expect(page).toHaveURL(/tab=photos/);
  499 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
```