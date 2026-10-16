# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기
- Location: tests/app.spec.ts:226:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByTestId('next-hub')
Expected: "trip"
Received: "wish"
Timeout:  15000ms

Call log:
  - Expect "toHaveAttribute" getByTestId('next-hub') with timeout 15000ms
  - waiting for getByTestId('next-hub')
    30 × locator resolved to <section class="hub" data-anchor="wish" data-testid="next-hub">…</section>
       - unexpected value "wish"

```

```yaml
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 1곳":
  - /url: /wishes
- 'link "지금 1순위 강원 고성군 원하는 사람: 영상 보라의 하트를 기다려요"':
  - /url: /wishes/jwYzMgk6VxVITtqBq9wV
  - text: 지금 1순위 강원 고성군 보라 영상 보라의 하트를 기다려요
- text: 오늘의 한 질문
- paragraph: 고성 가는 길에 들렀다 가고 싶은 곳은?
- textbox "오늘의 질문 답":
  - /placeholder: 한 줄이면 돼요
- button "답하기" [disabled]
- link "오늘의 영어 Could we have extra towels? 수건을 더 받을 수 있을까요? 시작하기 · 3문장 · 90초":
  - /url: /study
- text: 강원 고성군 가는 길
- button "가기 좋은 때 5·6, 9·10월 · 선선하고 비가 적어요"
```

# Test source

```ts
  211 | 
  212 |     // 세계: 나라 이름, 다녀온 일본은 진하게
  213 |     await page.getByRole('tab', { name: '세계' }).click();
  214 |     await page.waitForTimeout(900);
  215 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [131, 35], zoom: 3.4 }));
  216 |     await expect(page.locator('.map-label.country', { hasText: /^일본$/ })).toHaveClass(/\bon\b/);
  217 |     await expect(page.locator('.map-label.country', { hasText: /^한국$/ })).toHaveClass(/\bon\b/);
  218 |     await shot(page, '09d-labels-world');
  219 | 
  220 |     // 우리 공간에는 더 이상 가져오기 버튼이 없다
  221 |     await page.goto('/space');
  222 |     await expect(page.getByText('백업 파일 내려받기')).toBeVisible();
  223 |     await expect(page.getByText(/가져오기/)).toHaveCount(0);
  224 |   });
  225 | 
  226 |   test('가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기', async ({ page }) => {
  227 |     await signIn(page, OWNER);
  228 |     // 비어 있으면 홈에 이번 달 추천 3곳
  229 |     const homeWishes = page.getByTestId('home-wishes');
  230 |     await expect(homeWishes).toContainText('가고 싶은 곳 3곳만 담아볼까요?');
  231 |     await expect(homeWishes.getByRole('button', { name: '담기' })).toHaveCount(3);
  232 |     await expectMapDrawn(page);
  233 |     // 추천지 이름을 누르면 지도의 지역 창이 열려 자세히 보고 바로 기록할 수 있다
  234 |     const firstPick = homeWishes.getByTestId('pick-detail').first();
  235 |     const pickName = (await firstPick.getAttribute('aria-label'))!.replace(' 자세히 보기', '');
  236 |     await firstPick.click();
  237 |     await expect(page).toHaveURL(/\/map\?sel=/);
  238 |     // 창 제목은 '전북 순창'처럼 시·군을 뗀 이름: 앞 두 글자(지역 이름 첫머리)로 맞춰 본다
  239 |     await expect(page.getByTestId('region-sheet').getByTestId('sheet-title')).toContainText(pickName.split(' ').pop()!.slice(0, 2));
  240 |     await expect(page.getByTestId('region-sheet').getByRole('link', { name: '자세히 기록' })).toBeVisible();
  241 |     // 오늘의 추천 사진 카드에도 자세히·기록하기
  242 |     await page.goto('/');
  243 |     await expect(page.getByTestId('month-pick-detail')).toBeVisible();
  244 |     await expect(page.getByTestId('month-pick-record')).toHaveAttribute('href', /\/record\?place=kr:\d+/);
  245 |     await expectMapDrawn(page);
  246 | 
  247 |     // 지도에서 제주를 눌러 하트로 담기 → 알림의 '메모 쓰기'
  248 |     await tapLngLat(page, 126.55, 33.38);
  249 |     const sheet = page.getByTestId('region-sheet');
  250 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('제주');
  251 |     await sheet.getByTestId('sheet-wish').click();
  252 |     await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
  253 |     await page.getByRole('button', { name: '메모 쓰기' }).click();
  254 |     await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
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
> 311 |     await expect(page.getByTestId('next-hub')).toHaveAttribute('data-anchor', 'trip');
      |                                                ^ Error: expect(locator).toHaveAttribute(expected) failed
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
  353 |       await page.getByRole('button', { name: '보기' }).click();
  354 |       await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  355 |       expect(await page.locator('textarea').evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value).join('\n'))).toContain('흑돼지랑 고기국수');
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
```