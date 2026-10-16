# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드
- Location: tests/human.spec.ts:445:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('stage-card')
Expected substring: "D-5"
Received string:    "다가오는 여행속초 단풍 여행D-4 · 속초시준비물 목록을 아직 안 만들었어요 · 2026.10.21준비물 보기"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('stage-card') with timeout 15000ms
  - waiting for getByTestId('stage-card')
    34 × locator resolved to <a data-stage="before" data-discover="true" data-testid="stage-card" class="stage-card before" href="/trips/A5mj6o1yvfBKX16PkreN">…</a>
       - unexpected value "다가오는 여행속초 단풍 여행D-4 · 속초시준비물 목록을 아직 안 만들었어요 · 2026.10.21준비물 보기"

```

```yaml
- link "다가오는 여행 속초 단풍 여행 D-4 · 속초시 준비물 목록을 아직 안 만들었어요 · 2026.10.21 준비물 보기":
  - /url: /trips/A5mj6o1yvfBKX16PkreN
```

# Test source

```ts
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
  391 |     await expect(card).toBeVisible();
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
  448 |     const d = new Date(); d.setDate(d.getDate() + 5);
  449 |     const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
> 462 |     await expect(card).toContainText('D-5');
      |                        ^ Error: expect(locator).toContainText(expected) failed
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
  492 |     await expect(page.getByTestId('photo-space')).toContainText(/약 [\d,]+장 더 올릴 수 있어요/);
  493 |     await page.context().close();
  494 |   });
  495 | 
  496 |   test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
  497 |     const page = await phone(browser);
  498 |     await signIn(page);
  499 |     await page.goto('/feed');
  500 |     const sel = page.getByLabel('사진을 올릴 여행');
  501 |     await expect(sel).toBeVisible();
  502 |     const value = await sel.locator('option', { hasText: '여수 밤바다 사진' }).first().getAttribute('value');
  503 |     await sel.selectOption(value!);
  504 |     await page.getByTestId('quick-upload-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg', 'tests/fixtures/photo-gangneung.jpg']);
  505 |     await expect(page.getByRole('status')).toContainText('사진 2장을 올렸어요', { timeout: 60_000 });
  506 |     const first = page.getByTestId('feed-item').first();
  507 |     await expect(first).toHaveAttribute('data-kind', 'photos');
  508 |     await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
  509 |     await page.context().close();
  510 |   });
  511 | 
  512 |   for (const width of [360, 375, 390]) {
  513 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
  514 |       const page = await phone(browser, width, 740);
  515 |       await page.goto('/');
  516 |       const art = page.locator('.login-mascot');
  517 |       await expect(art).toBeVisible();
  518 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  519 |       const a = await art.boundingBox();
  520 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  521 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  522 |         const r = document.createRange();
  523 |         r.selectNodeContents(el);
  524 |         const b = r.getBoundingClientRect();
  525 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  526 |       });
  527 |       const t = await textBox('.login-tag');
  528 |       const b = await textBox('.login-brand');
  529 |       for (const r of [t, b]) {
  530 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  531 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  532 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  533 |       }
  534 |       await page.context().close();
  535 |     });
  536 |   }
  537 | });
  538 | 
```