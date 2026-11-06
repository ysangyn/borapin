# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 폰 뒤로 가기: 쓰던 게 있으면 묻고, 취소하면 그대로, 앱의 뒤로·저장 뒤에는 묻지 않는다
- Location: tests/human.spec.ts:368:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e4]:
        - generic [ref=f2e5]:
          - button "뒤로" [ref=f2e6] [cursor=pointer]
          - heading "맛집·명소" [level=1] [ref=f2e9]
        - link "남기기" [ref=f2e10] [cursor=pointer]:
          - /url: /places/new
      - generic [ref=f2e13]:
        - textbox "장소 찾기" [ref=f2e14]:
          - /placeholder: 이름, 지역, 한 줄 평 찾기
        - generic [ref=f2e15]:
          - button "전체 0" [pressed] [ref=f2e16] [cursor=pointer]
          - button "또 갈래요" [ref=f2e17] [cursor=pointer]
          - button "맛집" [ref=f2e18] [cursor=pointer]
          - button "카페" [ref=f2e19] [cursor=pointer]
          - button "볼거리" [ref=f2e20] [cursor=pointer]
          - button "숙소" [ref=f2e21] [cursor=pointer]
          - button "쇼핑" [ref=f2e22] [cursor=pointer]
          - button "기타" [ref=f2e23] [cursor=pointer]
        - generic [ref=f2e24]:
          - generic [ref=f2e25]: 아직 남긴 장소가 없어요
          - generic [ref=f2e26]: 기억에 남은 맛집·카페·명소를 둘의 한 줄 평과 함께 남겨 보세요.지도에서 그 지역을 누르면 모아서 보여 드려요.
          - link "장소 남기기" [ref=f2e27] [cursor=pointer]:
            - /url: /places/new
      - navigation "주 메뉴" [ref=f2e28]:
        - link "홈" [ref=f2e29] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f2e32] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f2e35] [cursor=pointer]
        - link "지도" [ref=f2e38] [cursor=pointer]:
          - /url: /map
        - link [ref=f2e41] [cursor=pointer]:
          - /url: /feed
      - link "물어보기" [ref=f2e45] [cursor=pointer]:
        - /url: /ask
    - status
  - iframe [aria-hidden] [ref=f2e46]
```

# Test source

```ts
  285 |         return dt;
  286 |       }, files);
  287 | 
  288 |     // 글 파일은 올리지 않는다
  289 |     const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
  290 |     await grid.dispatchEvent('dragenter', { dataTransfer: txt });
  291 |     await grid.dispatchEvent('dragover', { dataTransfer: txt });
  292 |     await grid.dispatchEvent('drop', { dataTransfer: txt });
  293 |     await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');
  294 | 
  295 |     // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
  296 |     const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
  297 |     await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
  298 |     await grid.dispatchEvent('dragover', { dataTransfer: jpg });
  299 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
  300 |     await grid.dispatchEvent('drop', { dataTransfer: jpg });
  301 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
  302 |     await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
  303 |     await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
  304 |     await expect(page.getByTestId('photos-empty')).toHaveCount(0);
  305 | 
  306 |     // 새로 고침해도 사진이 남아 있다
  307 |     await page.reload();
  308 |     await page.getByRole('tab', { name: /사진/ }).click();
  309 |     await expect(page.getByTestId('photo-grid').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 20_000 });
  310 |     await page.context().close();
  311 |   });
  312 | 
  313 |   test('375px: 어느 화면도 옆으로 넘치지 않는다', { tag: '@webkit' }, async ({ browser }) => {
  314 |     const page = await phone(browser);
  315 |     await page.goto('/');
  316 |     await expect(page.getByTestId('login')).toBeVisible();
  317 |     const found: string[] = [];
  318 |     const check = async (where: string) => {
  319 |       const o = await overflowing(page);
  320 |       if (o.page) found.push(`${where}: ${o.page}`);
  321 |       for (const b of o.bad) found.push(`${where}: ${b}`);
  322 |     };
  323 |     await check('로그인');
  324 |     await signIn(page);
  325 |     const trip = await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href^="/trips/"]')?.getAttribute('href'));
  326 |     for (const route of ['/', '/trips', ...(trip ? [trip] : []), '/record', '/map', '/wishes', '/places', '/memories', '/ask', '/space', '/admin', '/credits']) {
  327 |       // 앱이 같은 주소로 한 번 더 옮기면(로그인 직후 등) 사파리는 앞 이동을 끊는다 → 한 번 더
  328 |       await page.goto(route).catch(async (e) => { if (!/interrupted by another navigation/.test(String(e))) throw e; await page.waitForLoadState('load'); await page.goto(route); });
  329 |       await page.waitForLoadState('load');
  330 |       await page.waitForTimeout(900);
  331 |       await check(route);
  332 |     }
  333 |     expect(found, found.join('\n')).toEqual([]);
  334 |     await page.context().close();
  335 |   });
  336 | 
  337 |   test('가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다', async ({ browser }) => {
  338 |     const page = await phone(browser);
  339 |     await signIn(page);
  340 |     await page.goto('/wishes/new');
  341 |     await page.getByLabel('어디 검색').fill('남해');
  342 |     await page.getByRole('option', { name: /남해군/ }).first().click();
  343 |     await page.getByTestId('wish-save').click();
  344 |     await expect(page).toHaveURL(/\/wishes$/);
  345 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  346 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  347 |     const back = page.getByRole('button', { name: '뒤로' });
  348 | 
  349 |     // 아무것도 안 바꿨으면 묻지 않고 나간다
  350 |     let asked = '';
  351 |     page.on('dialog', (d) => {
  352 |       asked = d.message();
  353 |       void d.dismiss();
  354 |     });
  355 |     await back.click();
  356 |     await expect(page).toHaveURL(/\/wishes$/);
  357 |     expect(asked).toBe('');
  358 | 
  359 |     // '누가 원해요'만 바꿔도 묻는다 (취소하면 그대로 머문다)
  360 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  361 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  362 |     await back.click();
  363 |     await expect.poll(() => asked).toContain('저장하지 않은 내용');
  364 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  365 |     await page.context().close();
  366 |   });
  367 | 
  368 |   test('폰 뒤로 가기: 쓰던 게 있으면 묻고, 취소하면 그대로, 앱의 뒤로·저장 뒤에는 묻지 않는다', async ({ browser }) => {
  369 |     const page = await phone(browser);
  370 |     await signIn(page);
  371 |     await page.goto('/places');
  372 |     await page.getByTestId('place-new').click();
  373 |     await expect(page).toHaveURL(/\/places\/new/);
  374 |     const asked: string[] = [];
  375 |     let accept = false;
  376 |     page.on('dialog', (d) => { asked.push(d.message()); void (accept ? d.accept() : d.dismiss()); });
  377 |     // 아무것도 안 썼으면 묻지 않고 나간다
  378 |     await page.goBack();
  379 |     await expect(page).toHaveURL(/\/places$/);
  380 |     expect(asked).toEqual([]);
  381 |     // 쓰던 게 있으면 폰 뒤로 가기에 묻는다 → 취소하면 그대로, 쓴 글도 그대로
  382 |     await page.getByTestId('place-new').click();
  383 |     await page.getByLabel('장소 이름').fill('뒤로 가기 시험 가게');
  384 |     await page.goBack();
> 385 |     await expect.poll(() => asked.length).toBe(1);
      |                                           ^ Error: expect(received).toBe(expected) // Object.is equality
  386 |     expect(asked[0]).toContain('저장하지 않은 내용');
  387 |     await expect(page).toHaveURL(/\/places\/new/);
  388 |     await expect(page.getByLabel('장소 이름')).toHaveValue('뒤로 가기 시험 가게');
  389 |     // 나가겠다고 하면 나간다
  390 |     accept = true;
  391 |     await page.goBack();
  392 |     await expect(page).toHaveURL(/\/places$/);
  393 |     expect(asked.length).toBe(2);
  394 |     await page.context().close();
  395 |   });
  396 | 
  397 |   test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
  398 |     const page = await phone(browser);
  399 |     await signIn(page);
  400 |     await page.goto('/places/new');
  401 |     // 네이버지도 입력 칸은 하나뿐
  402 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
  403 |     // 고른 종류에만 눌림·체크 표시
  404 |     const food = page.getByRole('button', { name: '맛집', exact: true });
  405 |     const cafe = page.getByRole('button', { name: '카페', exact: true });
  406 |     await expect(food).toHaveAttribute('aria-pressed', 'true');
  407 |     await expect(food.locator('.chip-check')).toBeVisible();
  408 |     await cafe.click();
  409 |     await expect(cafe).toHaveAttribute('aria-pressed', 'true');
  410 |     await expect(food).toHaveAttribute('aria-pressed', 'false');
  411 |     await expect(food.locator('.chip-check')).toHaveCount(0);
  412 |     const again = page.getByRole('button', { name: '또 갈래요', exact: true });
  413 |     await again.click();
  414 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  415 |     await expect(again.locator('.chip-check')).toBeVisible();
  416 |     // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
  417 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
  418 |     await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
  419 |     await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
  420 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
  421 |     await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
  422 |     // 링크를 빼면 다시 붙여 넣을 수 있다
  423 |     await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
  424 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  425 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  426 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  427 |     await page.context().close();
  428 |   });
  429 | 
  430 |   test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
  431 |     const page = await phone(browser);
  432 |     await signIn(page);
  433 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  434 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  435 |     // 여행 없이 장소만 (칠곡)
  436 |     await page.goto('/places/new');
  437 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  438 |     await page.getByLabel('어디 검색').fill('칠곡');
  439 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  440 |     await page.getByTestId('place-save').click();
  441 |     // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
  442 |     await expect(page.getByRole('status')).toContainText('담았어요');
  443 |     await page.goto('/');
  444 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  445 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
  446 |     await expect(spot).toHaveCount(1);
  447 |     await expect(spot).toContainText('1');
  448 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  449 |     await expect(page.getByTestId('headline')).toHaveText(before);
  450 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  451 |     await page.goto('/places/new');
  452 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  453 |     await page.getByLabel('어디 검색').fill('칠곡');
  454 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  455 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  456 |     await page.getByTestId('place-save').click();
  457 |     await expect(page.getByRole('status')).toContainText('담고 핀도 꽂았어요');
  458 |     await page.goto('/');
  459 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  460 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  461 |     await page.context().close();
  462 |   });
  463 | 
  464 |   test('우리 집을 정하면 다음 여행지까지 지도 앱 길찾기가 출발·도착이 채워져 열린다', async ({ browser }) => {
  465 |     const page = await phone(browser);
  466 |     await signIn(page);
  467 |     await page.goto('/space');
  468 |     await page.getByTestId('home-edit').click();
  469 |     await page.getByLabel('어디 검색').fill('고양');
  470 |     await page.getByRole('option', { name: /고양시/ }).first().click();
  471 |     await page.getByTestId('home-save').click();
  472 |     await expect(page.getByRole('status')).toContainText('우리 집을 정했어요');
  473 |     await expect(page.getByTestId('home-edit')).toContainText('고양시');
  474 |     await expect(page.getByTestId('home-edit')).toContainText('동네까지만');
  475 |     // 새로 고쳐도 남아 있다 (둘이 같은 집)
  476 |     await page.reload();
  477 |     await expect(page.getByTestId('home-edit')).toContainText('고양시');
  478 |     // 홈: 집에서 가장 가까운 빈 칸 한 줄 → 누르면 그 칸의 지역 창
  479 |     await page.goto('/');
  480 |     const next = page.getByTestId('next-cell');
  481 |     await expect(next).toContainText('집에서 가장 가까운 빈 칸은');
  482 |     await expect(next).toContainText(/차로 약 \d/);
  483 |     // 핀이 말풍선은 한 달에 한 번만: 처음엔 보이고, 다시 열면 한 줄만
  484 |     await expect(page.getByTestId('next-cell-say')).toContainText('이번 달엔');
  485 |     await page.reload();
```