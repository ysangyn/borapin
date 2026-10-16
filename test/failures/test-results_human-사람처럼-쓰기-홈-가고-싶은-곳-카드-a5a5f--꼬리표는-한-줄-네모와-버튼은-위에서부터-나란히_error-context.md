# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 홈 가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 위에서부터 나란히
- Location: tests/human.spec.ts:374:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('home-wishes').getByTestId('wish-card').filter({ hasText: '영월' }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('home-wishes').getByTestId('wish-card').filter({ hasText: '영월' }).first() with timeout 15000ms
  - waiting for getByTestId('home-wishes').getByTestId('wish-card').filter({ hasText: '영월' }).first()

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "보라에게 물어봐":
  - /url: /ask
- link "우리 공간":
  - /url: /space
  - text: 보 영
- text: 보라 & 영상의 지도 7번의 여행, 핀 7개
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해 1 1 2
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · ⛶ 를 누르면 전국이 보여요 6 다녀온 시·군 1 해외 나라 7 여행·나들이 0 예정
- textbox "보라에게 물어봐":
  - /placeholder: "보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳"
- text: 제주 여행 다녀오셨나요? 날짜가 지났어요. 다녀왔으면 지도에 핀으로 바꿔 둘게요.
- button "다녀왔어요"
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 3곳":
  - /url: /wishes
- 'link "지금 1순위 강원 영월군 원하는 사람: 영상 보라의 하트를 기다려요"':
  - /url: /wishes/Y5y8FcRs6VShHzeQAX7O
  - text: 지금 1순위 강원 영월군 보라 영상 보라의 하트를 기다려요
- link "경남 남해군 영상":
  - /url: /wishes/0vswNqgIFHtLQeSjQENA
- link "강원 고성군 영상":
  - /url: /wishes/jwYzMgk6VxVITtqBq9wV
- text: 오늘의 한 질문
- paragraph: 영월 가는 길에 들렀다 가고 싶은 곳은?
- textbox "오늘의 질문 답":
  - /placeholder: 한 줄이면 돼요
- button "답하기" [disabled]
- link "오늘의 영어 Could we have extra towels? 수건을 더 받을 수 있을까요? 시작하기 · 3문장 · 90초":
  - /url: /study
- text: 강원 영월군 가는 길
- button "가기 좋은 때 4~6, 9·10월 · 선선하고 비가 적어요"
- button "지금 열리는 축제 영월 단종문화제 한마당 큰잔치 거리 퍼레이드 · 10.15~21"
- img "담양 죽녹원"
- text: 담양 죽녹원 10월에 가기 좋은 곳 전남 담양군 대나무 숲길 따라 흐르는 초록빛 휴식 가기 좋은 때 4·5, 9·10월
- button "가고 싶은 곳에 담기"
- link "자세히":
  - /url: /map?sel=kr:46710
- link "여기 기록하기":
  - /url: /record?place=kr:46710
- link "교토 작년 가을 교토 단풍 여행 2025년 가을":
  - /url: /trips/wgmyapHQaAfVMXqNTII0
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "경북 칠곡군 여행 경북 칠곡군 · 날짜 모름":
  - /url: /trips/a0Hw8pFYPkrXlvaFk3mF
- link "단양 끌어다 놓기 여행 충북 단양군 · 날짜 모름":
  - /url: /trips/kSs9bUOT2emTRffIcdzE
- link "전주시 여행 전북 전주시 · 날짜 모름":
  - /url: /trips/hc9HGo6dPUTRb9R8XwQh
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
  293 |     });
  294 |     await back.click();
  295 |     await expect(page).toHaveURL(/\/wishes$/);
  296 |     expect(asked).toBe('');
  297 | 
  298 |     // '누가 원해요'만 바꿔도 묻는다 (취소하면 그대로 머문다)
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
  374 |   test('홈 가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 위에서부터 나란히', async ({ browser }) => {
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
  387 |     }
  388 |     await page.getByRole('button', { name: '1순위', exact: true }).click();
  389 |     await page.getByTestId('wish-save').click();
  390 |     await expect(page).not.toHaveURL(/wishes\/new/);
  391 |     await page.goto('/');
  392 |     const card = page.getByTestId('home-wishes').getByTestId('wish-card').filter({ hasText: '영월' }).first();
> 393 |     await expect(card).toBeVisible();
      |                        ^ Error: expect(locator).toBeVisible() failed
  394 |     const tag = card.getByTestId('wish-festival');
  395 |     await expect(tag).toBeVisible();
  396 |     const tagBox = (await tag.boundingBox())!;
  397 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  398 |     const tile = (await card.locator('.trip-tile').boundingBox())!;
  399 |     const title = (await card.locator('.t').boundingBox())!;
  400 |     const btn = (await card.getByTestId('wish-plan').boundingBox())!;
  401 |     expect(Math.abs(tile.y - title.y), '네모가 제목과 같은 높이에서 시작해야 해요').toBeLessThan(10);
  402 |     expect(Math.abs(btn.y - title.y), '버튼이 제목과 같은 높이에서 시작해야 해요').toBeLessThan(14);
  403 |     await page.context().close();
  404 |   });
  405 | 
  406 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  407 |     const page = await phone(browser);
  408 |     await signIn(page);
  409 |     const fab = page.getByTestId('ask-fab');
  410 |     await expect(fab).toBeVisible();
  411 |     await expect(fab).toBeInViewport({ ratio: 1 });
  412 |     // 아래 메뉴와 겹치지 않는다
  413 |     const f = (await fab.boundingBox())!;
  414 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  415 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  416 |     await fab.click();
  417 |     await expect(page).toHaveURL(/\/ask/);
  418 |     await expect(page.getByText('보라에게 물어봐')).toBeVisible();
  419 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  420 |     await page.goto('/map');
  421 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  422 |     await page.context().close();
  423 |   });
  424 | 
  425 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  426 |     const page = await phone(browser);
  427 |     await signIn(page);
  428 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  429 |     await page.goto('/record');
  430 |     await page.getByLabel('어디 검색').fill('고흥');
  431 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  432 |     await page.getByRole('button', { name: '몰라요' }).click();
  433 |     await page.getByTestId('save').click();
  434 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  435 |     await page.goto('/');
  436 |     const map = page.getByTestId('map').first();
  437 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  438 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  439 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  440 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  441 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  442 |     await page.getByRole('button', { name: '전체 보기' }).click();
  443 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  444 |     await page.context().close();
  445 |   });
  446 | 
  447 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  448 |     const page = await phone(browser);
  449 |     await signIn(page);
  450 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  451 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  452 |     await page.goto('/record?status=planned');
  453 |     await page.getByLabel('어디 검색').fill('속초');
  454 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  455 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  456 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  457 |     await page.getByLabel('시작 날짜').fill(ymd);
  458 |     await page.getByTestId('save').click();
  459 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  460 |     await page.goto('/');
  461 |     const card = page.getByTestId('stage-card');
  462 |     await expect(card).toHaveAttribute('data-stage', 'before');
  463 |     await expect(card).toContainText('속초 단풍 여행');
  464 |     await expect(card).toContainText('D-5');
  465 |     await expect(card).toContainText('준비물');
  466 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  467 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  468 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  469 |     const more = page.getByTestId('home-more');
  470 |     await expect(more).toBeVisible();
  471 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  472 |     await more.locator('summary').click();
  473 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  474 |     await card.click();
  475 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  476 |     await page.context().close();
  477 |   });
  478 | 
  479 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  480 |     const page = await phone(browser);
  481 |     await signIn(page);
  482 |     await page.goto('/record');
  483 |     await page.getByLabel('어디 검색').fill('여수');
  484 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  485 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  486 |     await page.getByRole('button', { name: '몰라요' }).click();
  487 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  488 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  489 |     await page.getByTestId('save').click();
  490 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  491 |     await expect(page).toHaveURL(/tab=photos/);
  492 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  493 |     // 사진 탭 아래에 남은 공간 안내
```