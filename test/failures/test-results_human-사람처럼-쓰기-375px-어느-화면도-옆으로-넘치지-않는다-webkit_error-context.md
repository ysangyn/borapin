# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 어느 화면도 옆으로 넘치지 않는다
- Location: tests/human.spec.ts:314:3

# Error details

```
Error: page.goto: Frame load interrupted
Call log:
  - navigating to "http://127.0.0.1:5174/", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e3]: 불러오는 중…
    - status
  - iframe [aria-hidden] [ref=f4e5]
```

# Test source

```ts
  229 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  230 |     const after = await page.getByTestId('headline').textContent();
  231 |     await page.reload();
  232 |     await expect(page.getByTestId('headline')).toHaveText(after ?? '', { timeout: 20_000 });
  233 |     await page.context().close();
  234 |   });
  235 | 
  236 |   test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
  237 |     const page = await phone(browser);
  238 |     await signIn(page);
  239 |     await page.goto('/record');
  240 | 
  241 |     // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
  242 |     await page.getByLabel('어디 검색').click();
  243 |     const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
  244 |     await page.keyboard.press('Enter');
  245 |     await place.commit('강릉');
  246 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
  247 |     await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
  248 |     // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
  249 |     await page.keyboard.press('Enter');
  250 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  251 | 
  252 |     // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
  253 |     const who = page.getByLabel('함께 간 사람 이름');
  254 |     await who.click();
  255 |     const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
  256 |     await page.keyboard.press('Enter');
  257 |     await name.commit('할머니');
  258 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
  259 |     await expect(who).toHaveValue('할머니');
  260 |     await page.keyboard.press('Enter');
  261 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
  262 |     await expect(who).toHaveValue('');
  263 |     await page.context().close();
  264 |   });
  265 | 
  266 |   test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
  267 |     const page = await desktop(browser);
  268 |     await signIn(page);
  269 |     // PC 양옆엔 흐린 배경 장면이 붙는다 (폰에선 없음)
  270 |     await expect(page.getByTestId('backdrop')).toBeAttached({ timeout: 10_000 });
  271 |     await page.goto('/record');
  272 |     await page.getByLabel('어디 검색').fill('단양');
  273 |     await page.getByRole('option', { name: /단양군/ }).first().click();
  274 |     await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
  275 |     await page.getByRole('button', { name: '몰라요' }).click();
  276 |     await page.getByTestId('save').click();
  277 |     await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
  278 |     await page.getByRole('tab', { name: /사진/ }).click();
  279 |     await expect(page.getByTestId('photos-empty')).toBeVisible();
  280 |     const grid = page.getByTestId('photo-grid');
  281 | 
  282 |     const drag = (files: { name: string; type: string; b64: string }[]) =>
  283 |       page.evaluateHandle((fs) => {
  284 |         const dt = new DataTransfer();
  285 |         for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
  286 |         return dt;
  287 |       }, files);
  288 | 
  289 |     // 글 파일은 올리지 않는다
  290 |     const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
  291 |     await grid.dispatchEvent('dragenter', { dataTransfer: txt });
  292 |     await grid.dispatchEvent('dragover', { dataTransfer: txt });
  293 |     await grid.dispatchEvent('drop', { dataTransfer: txt });
  294 |     await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');
  295 | 
  296 |     // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
  297 |     const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
  298 |     await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
  299 |     await grid.dispatchEvent('dragover', { dataTransfer: jpg });
  300 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
  301 |     await grid.dispatchEvent('drop', { dataTransfer: jpg });
  302 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
  303 |     await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
  304 |     await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
  305 |     await expect(page.getByTestId('photos-empty')).toHaveCount(0);
  306 | 
  307 |     // 새로 고침해도 사진이 남아 있다
  308 |     await page.reload();
  309 |     await page.getByRole('tab', { name: /사진/ }).click();
  310 |     await expect(page.getByTestId('photo-grid').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 20_000 });
  311 |     await page.context().close();
  312 |   });
  313 | 
  314 |   test('375px: 어느 화면도 옆으로 넘치지 않는다', { tag: '@webkit' }, async ({ browser }) => {
  315 |     const page = await phone(browser);
  316 |     await page.goto('/');
  317 |     await expect(page.getByTestId('login')).toBeVisible();
  318 |     const found: string[] = [];
  319 |     const check = async (where: string) => {
  320 |       const o = await overflowing(page);
  321 |       if (o.page) found.push(`${where}: ${o.page}`);
  322 |       for (const b of o.bad) found.push(`${where}: ${b}`);
  323 |     };
  324 |     await check('로그인');
  325 |     await signIn(page);
  326 |     const trip = await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href^="/trips/"]')?.getAttribute('href'));
  327 |     for (const route of ['/', '/trips', ...(trip ? [trip] : []), '/record', '/map', '/wishes', '/places', '/memories', '/ask', '/space', '/admin', '/credits']) {
  328 |       // 앱이 같은 주소로 한 번 더 옮기면(로그인 직후 등) 사파리는 앞 이동을 끊는다 → 한 번 더
> 329 |       await page.goto(route).catch(async (e) => { if (!/interrupted by another navigation/.test(String(e))) throw e; await page.waitForLoadState('load'); await page.goto(route); });
      |                  ^ Error: page.goto: Frame load interrupted
  330 |       await page.waitForLoadState('load');
  331 |       await page.waitForTimeout(900);
  332 |       await check(route);
  333 |     }
  334 |     expect(found, found.join('\n')).toEqual([]);
  335 |     await page.context().close();
  336 |   });
  337 | 
  338 |   test('가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다', async ({ browser }) => {
  339 |     const page = await phone(browser);
  340 |     await signIn(page);
  341 |     await page.goto('/wishes/new');
  342 |     await page.getByLabel('어디 검색').fill('남해');
  343 |     await page.getByRole('option', { name: /남해군/ }).first().click();
  344 |     await page.getByTestId('wish-save').click();
  345 |     await expect(page).toHaveURL(/\/wishes$/);
  346 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  347 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  348 |     const back = page.getByRole('button', { name: '뒤로' });
  349 | 
  350 |     // 아무것도 안 바꿨으면 묻지 않고 나간다
  351 |     let asked = '';
  352 |     page.on('dialog', (d) => {
  353 |       asked = d.message();
  354 |       void d.dismiss();
  355 |     });
  356 |     await back.click();
  357 |     await expect(page).toHaveURL(/\/wishes$/);
  358 |     expect(asked).toBe('');
  359 | 
  360 |     // '누가 원해요'만 바꿔도 묻는다 (취소하면 그대로 머문다)
  361 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  362 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  363 |     await back.click();
  364 |     await expect.poll(() => asked).toContain('저장하지 않은 내용');
  365 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  366 |     await page.context().close();
  367 |   });
  368 | 
  369 |   test('폰 뒤로 가기: 쓰던 게 있으면 묻고, 취소하면 그대로, 앱의 뒤로·저장 뒤에는 묻지 않는다', async ({ browser }) => {
  370 |     const page = await phone(browser);
  371 |     await signIn(page);
  372 |     await page.goto('/places');
  373 |     await page.getByTestId('place-new').click();
  374 |     await expect(page).toHaveURL(/\/places\/new/);
  375 |     const asked: string[] = [];
  376 |     let accept = false;
  377 |     page.on('dialog', (d) => { asked.push(d.message()); void (accept ? d.accept() : d.dismiss()); });
  378 |     // 아무것도 안 썼으면 묻지 않고 나간다
  379 |     await page.goBack();
  380 |     await expect(page).toHaveURL(/\/places$/);
  381 |     expect(asked).toEqual([]);
  382 |     // 쓰던 게 있으면 폰 뒤로 가기에 묻는다 → 취소하면 그대로, 쓴 글도 그대로
  383 |     await page.getByTestId('place-new').click();
  384 |     await page.getByLabel('장소 이름').fill('뒤로 가기 시험 가게');
  385 |     await page.goBack();
  386 |     await expect.poll(() => asked.length).toBe(1);
  387 |     expect(asked[0]).toContain('저장하지 않은 내용');
  388 |     await expect(page).toHaveURL(/\/places\/new/);
  389 |     await expect(page.getByLabel('장소 이름')).toHaveValue('뒤로 가기 시험 가게');
  390 |     // 나가겠다고 하면 나간다
  391 |     accept = true;
  392 |     await page.goBack();
  393 |     await expect(page).toHaveURL(/\/places$/);
  394 |     expect(asked.length).toBe(2);
  395 |     await page.context().close();
  396 |   });
  397 | 
  398 |   test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
  399 |     const page = await phone(browser);
  400 |     await signIn(page);
  401 |     await page.goto('/places/new');
  402 |     // 네이버지도 입력 칸은 하나뿐
  403 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
  404 |     // 고른 종류에만 눌림·체크 표시
  405 |     const food = page.getByRole('button', { name: '맛집', exact: true });
  406 |     const cafe = page.getByRole('button', { name: '카페', exact: true });
  407 |     await expect(food).toHaveAttribute('aria-pressed', 'true');
  408 |     await expect(food.locator('.chip-check')).toBeVisible();
  409 |     await cafe.click();
  410 |     await expect(cafe).toHaveAttribute('aria-pressed', 'true');
  411 |     await expect(food).toHaveAttribute('aria-pressed', 'false');
  412 |     await expect(food.locator('.chip-check')).toHaveCount(0);
  413 |     const again = page.getByRole('button', { name: '또 갈래요', exact: true });
  414 |     await again.click();
  415 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  416 |     await expect(again.locator('.chip-check')).toBeVisible();
  417 |     // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
  418 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
  419 |     await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
  420 |     await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
  421 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
  422 |     await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
  423 |     // 링크를 빼면 다시 붙여 넣을 수 있다
  424 |     await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
  425 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  426 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  427 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  428 |     await page.context().close();
  429 |   });
```