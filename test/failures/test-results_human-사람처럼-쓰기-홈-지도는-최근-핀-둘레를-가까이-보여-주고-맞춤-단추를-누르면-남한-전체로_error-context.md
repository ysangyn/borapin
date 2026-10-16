# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로
- Location: tests/human.spec.ts:409:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('map').first().locator('.map-label').filter({ hasText: '고흥' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('map').first().locator('.map-label').filter({ hasText: '고흥' }) with timeout 15000ms
  - waiting for getByTestId('map').first().locator('.map-label').filter({ hasText: '고흥' })

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "보라에게 물어봐":
  - /url: /ask
- link "우리 공간":
  - /url: /space
  - text: 보 영
- text: 보라 & 영상의 지도 6번의 여행, 핀 6개
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해 2
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · 확대하면 이름이 보여요 5 다녀온 시·군 1 해외 나라 6 여행·나들이 0 예정
- textbox "보라에게 물어봐":
  - /placeholder: "보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳"
- img "서울 경복궁 경회루"
- text: 서울 경복궁 경회루 10월에 가기 좋은 곳 서울 과거와 미래가 공존하는 K-컬처의 심장 가기 좋은 때 4~6, 9·10월
- button "가고 싶은 곳에 담기"
- link "볼거리 보기":
  - /url: /ask?q=%EC%84%9C%EC%9A%B8%20%EB%B3%BC%EA%B1%B0%EB%A6%AC
- heading "가고 싶은 곳" [level=2]
- link "모두 보기 2":
  - /url: /wishes
- link "제주 가고 싶은 곳 보기":
  - /url: /wishes/4W21iKwCx280flRwcTyN
  - text: 제주 제주 보라 영상 가기 좋은 때 5·6, 9~11월
- link "여행 만들기":
  - /url: /record?status=planned&place=kr:50&wish=4W21iKwCx280flRwcTyN
- link "경남 남해군 가고 싶은 곳 보기":
  - /url: /wishes/FyiJPaX9TmbIIADBPBH3
  - text: 경남 경남 남해군 보라 영상 가기 좋은 때 4~6, 10·11월
- link "여행 만들기":
  - /url: /record?status=planned&place=kr:48840&wish=FyiJPaX9TmbIIADBPBH3
- link "교토 작년 가을 교토 단풍 여행 2025년 가을":
  - /url: /trips/n7ENiZQLDONFNudEX5LY
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "전남 고흥군 여행 전남 고흥군 · 날짜 모름":
  - /url: /trips/KQwRP16eqZLlKvbuYhmi
- link "경북 칠곡군 여행 경북 칠곡군 · 날짜 모름":
  - /url: /trips/C0OXESDOc8NtoUjBCtBm
- link "충북 단양 끌어다 놓기 여행 충북 단양군 · 날짜 모름":
  - /url: /trips/f7dmWzpvJ1DtiXkpzGsv
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - link "기록하기":
    - /url: /record
  - link "지도":
    - /url: /map
  - link "추억":
    - /url: /memories
- link "보라에게 물어봐":
  - /url: /ask
- status
```

# Test source

```ts
  324 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  325 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  326 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  327 |     await page.context().close();
  328 |   });
  329 | 
  330 |   test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
  331 |     const page = await phone(browser);
  332 |     await signIn(page);
  333 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  334 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  335 |     // 여행 없이 장소만 (칠곡)
  336 |     await page.goto('/places/new');
  337 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  338 |     await page.getByLabel('어디 검색').fill('칠곡');
  339 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  340 |     await page.getByTestId('place-save').click();
  341 |     // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
  342 |     await expect(page.getByRole('status')).toContainText('장소를 남겼어요');
  343 |     await page.goto('/');
  344 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  345 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
  346 |     await expect(spot).toHaveCount(1);
  347 |     await expect(spot).toContainText('1');
  348 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  349 |     await expect(page.getByTestId('headline')).toHaveText(before);
  350 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  351 |     await page.goto('/places/new');
  352 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  353 |     await page.getByLabel('어디 검색').fill('칠곡');
  354 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  355 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  356 |     await page.getByTestId('place-save').click();
  357 |     await expect(page.getByRole('status')).toContainText('장소를 남기고 핀도 꽂았어요');
  358 |     await page.goto('/');
  359 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  360 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  361 |     await page.context().close();
  362 |   });
  363 | 
  364 |   test('홈 가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 위에서부터 나란히', async ({ browser }) => {
  365 |     const page = await phone(browser);
  366 |     // 긴 이름의 '지금 축제'를 제주에 하나 넣어 둔다 (실제 축제 자료는 매주 바뀌므로)
  367 |     const d = new Date(); const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  368 |     const s = new Date(d); s.setDate(d.getDate() - 1); const e = new Date(d); e.setDate(d.getDate() + 5);
  369 |     await page.route('**/data/festivals.json', (r) => r.fulfill({ json: { updated: ymd(d), source: '시험', cells: { '50': [{ t: '제주 탐라문화제 한마당 큰잔치 거리 퍼레이드', s: ymd(s), e: ymd(e), id: 'x' }] } } }));
  370 |     await signIn(page);
  371 |     // 제주를 가고 싶은 곳에 담는다
  372 |     await page.goto('/wishes/new?place=kr:50');
  373 |     await page.getByTestId('wish-save').click();
  374 |     await expect(page).not.toHaveURL(/wishes\/new/);
  375 |     await page.goto('/');
  376 |     const card = page.getByTestId('home-wishes').getByTestId('wish-card').filter({ hasText: '제주' }).first();
  377 |     await expect(card).toBeVisible();
  378 |     const tag = card.getByTestId('wish-festival');
  379 |     await expect(tag).toBeVisible();
  380 |     const tagBox = (await tag.boundingBox())!;
  381 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  382 |     const tile = (await card.locator('.trip-tile').boundingBox())!;
  383 |     const title = (await card.locator('.t').boundingBox())!;
  384 |     const btn = (await card.getByTestId('wish-plan').boundingBox())!;
  385 |     expect(Math.abs(tile.y - title.y), '네모가 제목과 같은 높이에서 시작해야 해요').toBeLessThan(10);
  386 |     expect(Math.abs(btn.y - title.y), '버튼이 제목과 같은 높이에서 시작해야 해요').toBeLessThan(14);
  387 |     await page.context().close();
  388 |   });
  389 | 
  390 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  391 |     const page = await phone(browser);
  392 |     await signIn(page);
  393 |     const fab = page.getByTestId('ask-fab');
  394 |     await expect(fab).toBeVisible();
  395 |     await expect(fab).toBeInViewport({ ratio: 1 });
  396 |     // 아래 메뉴와 겹치지 않는다
  397 |     const f = (await fab.boundingBox())!;
  398 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  399 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  400 |     await fab.click();
  401 |     await expect(page).toHaveURL(/\/ask/);
  402 |     await expect(page.getByText('보라에게 물어봐')).toBeVisible();
  403 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  404 |     await page.goto('/map');
  405 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  406 |     await page.context().close();
  407 |   });
  408 | 
  409 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  410 |     const page = await phone(browser);
  411 |     await signIn(page);
  412 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  413 |     await page.goto('/record');
  414 |     await page.getByLabel('어디 검색').fill('고흥');
  415 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  416 |     await page.getByRole('button', { name: '몰라요' }).click();
  417 |     await page.getByTestId('save').click();
  418 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  419 |     await page.goto('/');
  420 |     const map = page.getByTestId('map').first();
  421 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  422 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  423 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
> 424 |     await expect(page.getByTestId('map').first().locator('.map-label', { hasText: '고흥' })).toBeVisible();
      |                                                                                            ^ Error: expect(locator).toBeVisible() failed
  425 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  426 |     await page.getByRole('button', { name: '전체 보기' }).click();
  427 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  428 |     await page.context().close();
  429 |   });
  430 | 
  431 |   for (const width of [360, 375, 390]) {
  432 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
  433 |       const page = await phone(browser, width, 740);
  434 |       await page.goto('/');
  435 |       const art = page.locator('.login-mascot');
  436 |       await expect(art).toBeVisible();
  437 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  438 |       const a = await art.boundingBox();
  439 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  440 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  441 |         const r = document.createRange();
  442 |         r.selectNodeContents(el);
  443 |         const b = r.getBoundingClientRect();
  444 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  445 |       });
  446 |       const t = await textBox('.login-tag');
  447 |       const b = await textBox('.login-brand');
  448 |       for (const r of [t, b]) {
  449 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  450 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  451 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  452 |       }
  453 |       await page.context().close();
  454 |     });
  455 |   }
  456 | });
  457 | 
```