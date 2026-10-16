# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다
- Location: tests/app.spec.ts:317:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "흑돼지랑 고기국수"
Received string:    ""
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - button "뒤로" [ref=e6] [cursor=pointer]
        - heading "가고 싶은 곳" [level=1] [ref=e9]
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: 어디*
          - generic [ref=e13]:
            - button "제주 빼기" [ref=e15] [cursor=pointer]: 제주
            - textbox "어디 검색" [ref=e24]:
              - /placeholder: 강릉, ㄱㄹ, 일본, 교토…
          - generic [ref=e25]: 특정 장소 (선택)
          - textbox "가게·명소 이름" [ref=e26]:
            - /placeholder: "예: 성산일출봉, 단골 카페"
        - generic [ref=e27]:
          - generic [ref=e28]: 누가 원해요
          - generic [ref=e29]:
            - button "보라" [pressed] [ref=e30] [cursor=pointer]
            - button "영상" [pressed] [ref=e33] [cursor=pointer]
            - generic [ref=e36]: 둘 다 원해요
        - generic [ref=e37]:
          - generic [ref=e38]: 우선순위
          - generic [ref=e39]:
            - button "없음" [ref=e40] [cursor=pointer]
            - button "1순위" [ref=e41] [cursor=pointer]
            - button "2순위" [ref=e44] [cursor=pointer]
            - button "3순위" [ref=e47] [cursor=pointer]
        - generic [ref=e50]:
          - generic [ref=e51]: 가볼 곳 (한 줄에 하나)
          - textbox "가볼 곳" [ref=e52]:
            - /placeholder: "성산일출봉\n우도"
            - text: 성산일출봉 우도 흑돼지랑 고기국수
        - generic [ref=e53]:
          - generic [ref=e54]: 해볼 것
          - textbox "해볼 것" [ref=e55]:
            - /placeholder: 일출 보기
        - generic [ref=e56]:
          - generic [ref=e57]: 먹을 것
          - textbox "먹을 것" [ref=e58]:
            - /placeholder: 고기국수
        - generic [ref=e59]:
          - generic [ref=e60]: 가기 좋은 때
          - generic [ref=e61]:
            - text: 5·6, 9~11월
            - generic [ref=e62]: · 덥지도 춥지도 않아요
          - button "직접 고르기" [ref=e63] [cursor=pointer]
        - generic [ref=e64]:
          - generic [ref=e65]: 참고 링크 (인스타·블로그·지도, 한 줄에 하나)
          - textbox "참고 링크" [ref=e66]:
            - /placeholder: https://
        - generic [ref=e67]:
          - generic [ref=e68]: 메모
          - textbox "메모" [ref=e69]:
            - /placeholder: 안 써도 돼요
        - button "고친 내용 저장" [ref=e70] [cursor=pointer]
        - button "가고 싶은 곳에서 빼기" [ref=e71] [cursor=pointer]
    - status
  - iframe [aria-hidden] [ref=e74]
```

# Test source

```ts
  255 | 
  256 |     // 고치기: 둘 다 원해요, 1순위, 가볼 곳
  257 |     await expect(page.getByRole('button', { name: /제주 빼기/ })).toBeVisible();
  258 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  259 |     await expect(page.getByText('둘 다 원해요')).toBeVisible();
  260 |     await page.getByRole('button', { name: '1순위' }).click();
  261 |     await page.getByLabel('가볼 곳').fill('성산일출봉\n우도');
  262 |     await page.getByTestId('wish-save').click();
  263 |     // 저장하면 들어왔던 화면(홈)으로 돌아간다
  264 |     await expect(page.getByRole('status')).toContainText('고쳤어요');
  265 |     await expect(page).toHaveURL(/:5174\/$/);
  266 |     await page.goto('/wishes');
  267 |     const card = page.getByTestId('wish-card').filter({ hasText: '제주' });
  268 |     await expect(card).toContainText('둘 다 원해요');
  269 |     await expect(card).toContainText('가볼 곳 성산일출봉 외 1');
  270 |     await expect(card.getByLabel('1순위')).toBeVisible();
  271 |     await shot(page, '10-wishes');
  272 | 
  273 |     // 여행 만들기 → 예정된 여행, 카드는 '예정'
  274 |     await card.getByTestId('wish-plan').click();
  275 |     await expect(page).toHaveURL(/status=planned/);
  276 |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  277 |     await page.getByTestId('save').click();
  278 |     await expect(page.getByTestId('trip-title')).toHaveText('제주 여행');
  279 |     await page.goto('/wishes');
  280 |     await expect(page.getByTestId('wish-card').filter({ hasText: '제주' })).toContainText('예정');
  281 | 
  282 |     // 지도에 깃발
  283 |     await page.goto('/map');
  284 |     await expectMapDrawn(page);
  285 |     await expect(page.getByTestId('wish-flag')).toHaveCount(1);
  286 |     // 깃발이 실제로 제주 위에 그려졌는지 (위치 확인)
  287 |     const jeju = await page.evaluate(() => {
  288 |       const w = window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } };
  289 |       return w.__map.project([126.55, 33.38]);
  290 |     });
  291 |     const mapBox = (await page.getByTestId('map').first().boundingBox())!;
  292 |     const flagBox = (await page.getByTestId('wish-flag').boundingBox())!;
  293 |     expect(Math.abs(flagBox.x + flagBox.width / 2 - (mapBox.x + jeju.x))).toBeLessThan(40);
  294 |     expect(Math.abs(flagBox.y + flagBox.height - (mapBox.y + jeju.y))).toBeLessThan(40);
  295 |     await shot(page, '10b-map-flags');
  296 | 
  297 |     // 여행지 뽑기: 강원 · 바다 → 담기
  298 |     await page.goto('/wishes');
  299 |     await page.getByTestId('dice-open').click();
  300 |     await page.getByLabel('뽑을 범위').selectOption('gangwon');
  301 |     await page.getByRole('button', { name: '바다', exact: true }).click();
  302 |     await page.getByTestId('dice-roll').click();
  303 |     await expect(page.getByTestId('dice-add')).toBeVisible();
  304 |     await expect(page.getByTestId('dice-face')).toContainText('강원');
  305 |     await shot(page, '10c-dice');
  306 |     await page.getByTestId('dice-add').click();
  307 |     await expect(page.getByTestId('wish-card')).toHaveCount(2);
  308 | 
  309 |     // 홈 '다음 여행 준비'는 예정된 제주 여행을 맡고, 여행 탭에도 보인다
  310 |     await page.goto('/');
  311 |     await expect(page.getByTestId('next-hub')).toHaveAttribute('data-anchor', 'trip');
  312 |     await expect(page.getByTestId('hub-first')).toContainText('제주 여행');
  313 |     await page.goto('/trips');
  314 |     await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  315 |   });
  316 | 
  317 |   test('홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다', async ({ page, browser }) => {
  318 |     await signIn(page, OWNER);
  319 |     const hub = page.getByTestId('next-hub');
  320 |     await expect(hub).toBeVisible();
  321 |     // 1. 다음은 어디: 예정된 제주 여행이 맨 위, 그다음은 가고 싶은 곳(강원)
  322 |     await expect(hub.getByTestId('hub-first')).toContainText('제주 여행');
  323 |     await expect(hub.locator('.hub-other')).toContainText([/강원/]);
  324 |     // 2. 오늘의 한 질문: 제주 이야기. 내가 답하면 상대 답은 잠겨 있다
  325 |     const ask = hub.getByTestId('hub-ask');
  326 |     await expect(ask).toContainText('제주');
  327 |     await ask.getByLabel('오늘의 질문 답').fill('흑돼지랑 고기국수');
  328 |     await ask.getByTestId('hub-ask-send').click();
  329 |     await expect(page.getByRole('status')).toContainText('답을 남겼어요');
  330 |     await expect(ask.locator('.hub-answer.mine')).toContainText('흑돼지랑 고기국수');
  331 |     await expect(ask.getByTestId('hub-ask-waiting')).toBeVisible();
  332 |     await expect(ask.getByTestId('hub-answer-other')).toHaveCount(0);
  333 |     await shot(page, '10d-home-hub');
  334 |     // 보라가 들어와 같은 질문을 보고 답하면 → 서로의 답이 열린다 (내 화면은 새로 고침 없이)
  335 |     const bora = await browser.newPage();
  336 |     await signIn(bora, 'bora@example.com');
  337 |     const bAsk = bora.getByTestId('hub-ask');
  338 |     await expect(bAsk).toContainText('제주');
  339 |     await expect(bAsk.getByTestId('hub-answer-other')).toHaveCount(0);
  340 |     await bAsk.getByLabel('오늘의 질문 답').fill('한라산 보이는 카페');
  341 |     await bAsk.getByTestId('hub-ask-send').click();
  342 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('흑돼지랑 고기국수');
  343 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('영상');
  344 |     await bora.close();
  345 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('한라산 보이는 카페');
  346 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('보라');
  347 |     await expect(ask.getByTestId('hub-ask-waiting')).toHaveCount(0);
  348 |     // 먹을 것·가볼 곳 질문이면 답을 가고 싶은 곳 메모에 넣을 수 있다 (오늘 질문이 그런 종류일 때)
  349 |     const save = ask.locator('.hub-answer.mine').getByRole('button', { name: '메모에 넣기' });
  350 |     if (await save.count()) {
  351 |       await save.click();
  352 |       await expect(page.getByRole('status')).toContainText('메모에 넣었어요');
  353 |       await page.getByRole('status').getByRole('button', { name: '보기' }).click();
  354 |       await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
> 355 |       expect(await page.locator('textarea').evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value).join('\n'))).toContain('흑돼지랑 고기국수');
      |                                                                                                                                ^ Error: expect(received).toContain(expected) // indexOf
  356 |       await page.goto('/');
  357 |     }
  358 |     // 3. 오늘의 영어: 영어 한 문장이 보이고 누르면 공부 화면
  359 |     const en = hub.getByTestId('hub-english');
  360 |     await expect(en.locator('.hub-en')).toHaveText(/[A-Za-z]{3,}/);
  361 |     await expect(en).toContainText(/\d문장 · 90초/);
  362 |     // 4. 가는 길: 같은 곳(제주)의 가기 좋은 때
  363 |     const way = hub.getByTestId('hub-way');
  364 |     await expect(way).toContainText('제주');
  365 |     await expect(way).toContainText('가기 좋은 때');
  366 |     // 바깥 링크(항공권·뉴스)는 국내 여행지엔 없다
  367 |     await expect(way.getByRole('link')).toHaveCount(0);
  368 |     await en.click();
  369 |     await expect(page).toHaveURL(/\/study$/);
  370 |   });
  371 | 
  372 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  373 |     await signIn(page, OWNER);
  374 |     await page.goto('/trips');
  375 |     await page.getByText('강릉시 여행', { exact: true }).click();
  376 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  377 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  378 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  379 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  380 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
  381 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  382 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  383 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  384 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  385 |     await shot(page, '11-place-edit');
  386 |     await page.getByTestId('place-save').click();
  387 |     const tp = page.getByTestId('trip-places');
  388 |     await expect(tp).toContainText('초당할머니순두부');
  389 |     await expect(tp).toContainText('또 갈래요');
  390 |     await expect(tp).toContainText('순두부 젤라또까지 완벽');
  391 | 
  392 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  393 |     await page.goto('/');
  394 |     await expectMapDrawn(page);
  395 |     await tapLngLat(page, 128.86, 37.73);
  396 |     const sheet = page.getByTestId('region-sheet');
  397 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  398 |     await expect(sheet).toContainText('우리 장소 · 1');
  399 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  400 | 
  401 |     // 우리 장소 목록과 '또 갈래요' 거르기
  402 |     await page.goto('/places');
  403 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  404 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  405 |     await shot(page, '11b-places');
  406 |   });
  407 | 
  408 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  409 |     await signIn(page, OWNER);
  410 |     await page.goto('/trips');
  411 |     await page.getByText('강릉시 여행', { exact: true }).click();
  412 |     await page.getByRole('tab', { name: /사진/ }).click();
  413 |     const sec = page.getByTestId('trip-photos');
  414 |     await sec.getByTestId('photo-input').setInputFiles([
  415 |       'tests/fixtures/photo-gangneung.jpg',
  416 |       'tests/fixtures/photo-gangneung2.jpg',
  417 |       'tests/fixtures/photo-noexif.jpg',
  418 |     ]);
  419 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  420 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  421 |     // 촬영일(2019.5.3~4)로 날짜 채우기 → '(추정)'
  422 |     const sug = page.getByTestId('photo-suggest');
  423 |     await expect(sug).toContainText('2019.5.3–4');
  424 |     await sug.getByRole('button', { name: '채우기' }).click();
  425 |     await expect(page.getByText('2019.5.3–4 (추정)')).toBeVisible();
  426 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  427 |     await shot(page, '12-photos');
  428 |     // 표지 사진은 개요 탭 위에
  429 |     await page.getByRole('tab', { name: '개요' }).click();
  430 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  431 |     await page.getByRole('tab', { name: /사진/ }).click();
  432 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  433 |     await sec.locator('.photo-cell img').first().click();
  434 |     const cap = page.locator('.pswp__caption-bp');
  435 |     await expect(cap).toContainText('2019.5.3 14:20');
  436 |     await expect(cap).toContainText('강원 강릉시');
  437 |     await page.waitForTimeout(600);
  438 |     await shot(page, '12b-slideshow');
  439 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  440 |     await page.keyboard.press('Escape');
  441 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  442 |     await page.goto('/memories');
  443 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  444 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  445 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  446 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  447 |     await expect(albumImgs).toHaveCount(3);
  448 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  449 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  450 |     await page.getByLabel('다시 보기 연도').fill('0');
  451 |     const firstYear = await page.getByTestId('replay-year').textContent();
  452 |     await page.getByTestId('replay-play').click();
  453 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  454 |     await page.getByLabel('결산 연도').selectOption('2019');
  455 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
```