# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 홈 가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 위에서부터 나란히
- Location: tests/human.spec.ts:372:3

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
  - text: 보 영 m
- text: 보라 · 영상 외 1명의 지도 7번의 여행, 핀 7개
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
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · ⛶ 를 누르면 전국이 보여요 6 다녀온 시·군 1 해외 나라 7 여행·나들이 0 예정
- textbox "보라에게 물어봐":
  - /placeholder: "보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳"
- text: 제주 여행 다녀오셨나요? 날짜가 지났어요. 다녀왔으면 지도에 핀으로 바꿔 둘게요.
- button "다녀왔어요"
- img "담양 죽녹원"
- text: 담양 죽녹원 10월에 가기 좋은 곳 전남 담양군 대나무 숲길 따라 흐르는 초록빛 휴식 가기 좋은 때 4·5, 9·10월
- button "가고 싶은 곳에 담기"
- link "자세히":
  - /url: /map?sel=kr:46710
- link "여기 기록하기":
  - /url: /record?place=kr:46710
- heading "가고 싶은 곳" [level=2]
- link "모두 보기 4":
  - /url: /wishes
- link "강원 동해시 가고 싶은 곳 보기":
  - /url: /wishes/YzzyihbgrY9SK2lQo2lL
  - text: 강원 강원 동해시 보라 영상 mail.bora 가기 좋은 때 4~6, 9·10월
- link "여행 만들기":
  - /url: /record?status=planned&place=kr:51170&wish=YzzyihbgrY9SK2lQo2lL
- link "경남 남해군 가고 싶은 곳 보기":
  - /url: /wishes/dIQ6P45lMEZlHd9djMkc
  - text: 경남 경남 남해군 보라 영상 mail.bora 가기 좋은 때 4~6, 10·11월
- link "여행 만들기":
  - /url: /record?status=planned&place=kr:48840&wish=dIQ6P45lMEZlHd9djMkc
- link "제주 가고 싶은 곳 보기":
  - /url: /wishes/hgZrpyxNO4snFIfU2rKt
  - text: 제주 1 제주 보라 영상 mail.bora 가기 좋은 때 5·6, 9~11월
- link "예정 · 2026년쯤":
  - /url: /trips/q0O3TRZdajQFOwQnmorh
- link "외 1곳 더 보기":
  - /url: /wishes
- link "교토 작년 가을 교토 단풍 여행 2025년 가을":
  - /url: /trips/Z6sT9YgIm5jLaj7kcp0M
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "경북 칠곡군 여행 경북 칠곡군 · 날짜 모름":
  - /url: /trips/9HypfFQTx3ZXUkrCwp0w
- link "충북 단양 끌어다 놓기 여행 충북 단양군 · 날짜 모름":
  - /url: /trips/Gc085WXJ6SA06VkCA71Q
- link "전북 전주시 여행 전북 전주시 · 날짜 모름":
  - /url: /trips/VEzBVkGkZWNssDxPk7Y7
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
  291 |     });
  292 |     await back.click();
  293 |     await expect(page).toHaveURL(/\/wishes$/);
  294 |     expect(asked).toBe('');
  295 | 
  296 |     // '누가 원해요'만 바꿔도 묻는다 (취소하면 그대로 머문다)
  297 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  298 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  299 |     await back.click();
  300 |     await expect.poll(() => asked).toContain('저장하지 않은 내용');
  301 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  302 |     await page.context().close();
  303 |   });
  304 | 
  305 |   test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
  306 |     const page = await phone(browser);
  307 |     await signIn(page);
  308 |     await page.goto('/places/new');
  309 |     // 네이버지도 입력 칸은 하나뿐
  310 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
  311 |     // 고른 종류에만 눌림·체크 표시
  312 |     const food = page.getByRole('button', { name: '맛집', exact: true });
  313 |     const cafe = page.getByRole('button', { name: '카페', exact: true });
  314 |     await expect(food).toHaveAttribute('aria-pressed', 'true');
  315 |     await expect(food.locator('.chip-check')).toBeVisible();
  316 |     await cafe.click();
  317 |     await expect(cafe).toHaveAttribute('aria-pressed', 'true');
  318 |     await expect(food).toHaveAttribute('aria-pressed', 'false');
  319 |     await expect(food.locator('.chip-check')).toHaveCount(0);
  320 |     const again = page.getByRole('button', { name: '또 갈래요', exact: true });
  321 |     await again.click();
  322 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  323 |     await expect(again.locator('.chip-check')).toBeVisible();
  324 |     // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
  325 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
  326 |     await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
  327 |     await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
  328 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
  329 |     await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
  330 |     // 링크를 빼면 다시 붙여 넣을 수 있다
  331 |     await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
  332 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  333 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  334 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  335 |     await page.context().close();
  336 |   });
  337 | 
  338 |   test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
  339 |     const page = await phone(browser);
  340 |     await signIn(page);
  341 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  342 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  343 |     // 여행 없이 장소만 (칠곡)
  344 |     await page.goto('/places/new');
  345 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  346 |     await page.getByLabel('어디 검색').fill('칠곡');
  347 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  348 |     await page.getByTestId('place-save').click();
  349 |     // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
  350 |     await expect(page.getByRole('status')).toContainText('장소를 남겼어요');
  351 |     await page.goto('/');
  352 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  353 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
  354 |     await expect(spot).toHaveCount(1);
  355 |     await expect(spot).toContainText('1');
  356 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  357 |     await expect(page.getByTestId('headline')).toHaveText(before);
  358 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  359 |     await page.goto('/places/new');
  360 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  361 |     await page.getByLabel('어디 검색').fill('칠곡');
  362 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  363 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  364 |     await page.getByTestId('place-save').click();
  365 |     await expect(page.getByRole('status')).toContainText('장소를 남기고 핀도 꽂았어요');
  366 |     await page.goto('/');
  367 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  368 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  369 |     await page.context().close();
  370 |   });
  371 | 
  372 |   test('홈 가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 위에서부터 나란히', async ({ browser }) => {
  373 |     const page = await phone(browser);
  374 |     // 긴 이름의 '지금 축제'를 제주에 하나 넣어 둔다 (실제 축제 자료는 매주 바뀌므로)
  375 |     const d = new Date(); const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  376 |     const s = new Date(d); s.setDate(d.getDate() - 1); const e = new Date(d); e.setDate(d.getDate() + 5);
  377 |     await page.route('**/data/festivals.json', (r) => r.fulfill({ json: { updated: ymd(d), source: '시험', cells: { '51750': [{ t: '영월 단종문화제 한마당 큰잔치 거리 퍼레이드', s: ymd(s), e: ymd(e), id: 'x' }] } } }));
  378 |     await signIn(page);
  379 |     // 영월을 가고 싶은 곳에 담는다 (다른 시험이 건드리지 않는 곳)
  380 |     await page.goto('/wishes/new?place=kr:51750');
  381 |     // 둘 다 원해요 + 1순위로 담아 홈 세 줄 안에 들게
  382 |     for (const n of ['보라', '영상']) {
  383 |       const b = page.getByRole('button', { name: n, exact: true });
  384 |       if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click();
  385 |     }
  386 |     await page.getByRole('button', { name: '1순위', exact: true }).click();
  387 |     await page.getByTestId('wish-save').click();
  388 |     await expect(page).not.toHaveURL(/wishes\/new/);
  389 |     await page.goto('/');
  390 |     const card = page.getByTestId('home-wishes').getByTestId('wish-card').filter({ hasText: '영월' }).first();
> 391 |     await expect(card).toBeVisible();
      |                        ^ Error: expect(locator).toBeVisible() failed
  392 |     const tag = card.getByTestId('wish-festival');
  393 |     await expect(tag).toBeVisible();
  394 |     const tagBox = (await tag.boundingBox())!;
  395 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  396 |     const tile = (await card.locator('.trip-tile').boundingBox())!;
  397 |     const title = (await card.locator('.t').boundingBox())!;
  398 |     const btn = (await card.getByTestId('wish-plan').boundingBox())!;
  399 |     expect(Math.abs(tile.y - title.y), '네모가 제목과 같은 높이에서 시작해야 해요').toBeLessThan(10);
  400 |     expect(Math.abs(btn.y - title.y), '버튼이 제목과 같은 높이에서 시작해야 해요').toBeLessThan(14);
  401 |     await page.context().close();
  402 |   });
  403 | 
  404 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  405 |     const page = await phone(browser);
  406 |     await signIn(page);
  407 |     const fab = page.getByTestId('ask-fab');
  408 |     await expect(fab).toBeVisible();
  409 |     await expect(fab).toBeInViewport({ ratio: 1 });
  410 |     // 아래 메뉴와 겹치지 않는다
  411 |     const f = (await fab.boundingBox())!;
  412 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  413 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  414 |     await fab.click();
  415 |     await expect(page).toHaveURL(/\/ask/);
  416 |     await expect(page.getByText('보라에게 물어봐')).toBeVisible();
  417 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  418 |     await page.goto('/map');
  419 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  420 |     await page.context().close();
  421 |   });
  422 | 
  423 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  424 |     const page = await phone(browser);
  425 |     await signIn(page);
  426 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  427 |     await page.goto('/record');
  428 |     await page.getByLabel('어디 검색').fill('고흥');
  429 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  430 |     await page.getByRole('button', { name: '몰라요' }).click();
  431 |     await page.getByTestId('save').click();
  432 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  433 |     await page.goto('/');
  434 |     const map = page.getByTestId('map').first();
  435 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  436 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  437 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  438 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  439 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  440 |     await page.getByRole('button', { name: '전체 보기' }).click();
  441 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  442 |     await page.context().close();
  443 |   });
  444 | 
  445 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  446 |     const page = await phone(browser);
  447 |     await signIn(page);
  448 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  449 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  450 |     await page.goto('/record?status=planned');
  451 |     await page.getByLabel('어디 검색').fill('속초');
  452 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  453 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  454 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  455 |     await page.getByLabel('시작 날짜').fill(ymd);
  456 |     await page.getByTestId('save').click();
  457 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  458 |     await page.goto('/');
  459 |     const card = page.getByTestId('stage-card');
  460 |     await expect(card).toHaveAttribute('data-stage', 'before');
  461 |     await expect(card).toContainText('속초 단풍 여행');
  462 |     await expect(card).toContainText('D-5');
  463 |     await expect(card).toContainText('준비물');
  464 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  465 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  466 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  467 |     const more = page.getByTestId('home-more');
  468 |     await expect(more).toBeVisible();
  469 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  470 |     await more.locator('summary').click();
  471 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  472 |     await card.click();
  473 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  474 |     await page.context().close();
  475 |   });
  476 | 
  477 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  478 |     const page = await phone(browser);
  479 |     await signIn(page);
  480 |     await page.goto('/record');
  481 |     await page.getByLabel('어디 검색').fill('여수');
  482 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  483 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  484 |     await page.getByRole('button', { name: '몰라요' }).click();
  485 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  486 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  487 |     await page.getByTestId('save').click();
  488 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  489 |     await expect(page).toHaveURL(/tab=photos/);
  490 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  491 |     // 사진 탭 아래에 남은 공간 안내
```