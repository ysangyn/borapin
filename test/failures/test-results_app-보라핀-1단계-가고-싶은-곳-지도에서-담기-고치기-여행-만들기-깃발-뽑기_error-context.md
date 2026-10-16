# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기
- Location: tests/app.spec.ts:226:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('world-picker')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('world-picker') with timeout 15000ms
  - waiting for getByTestId('world-picker')

```

```yaml
- button "뒤로"
- heading "가고 싶은 곳" [level=1]
- link "담기":
  - /url: /wishes/new
- group "걸러 보기":
  - button "전체 2" [pressed]
  - button "둘 다 원해요 1"
  - button "국내"
  - button "해외"
- link "제주 가고 싶은 곳 보기":
  - /url: /wishes/CbizD5U287viXEAW6IGK
  - text: 1 제주 보라 영상 둘 다 원해요 가기 좋은 때 5·6, 9~11월 가볼 곳 성산일출봉 외 1
- link "예정 · 2026년쯤":
  - /url: /trips/0br0FBkl727hT1I6zOWr
- link "강원 동해시 가고 싶은 곳 보기":
  - /url: /wishes/2cqbojcJfyOeQPB8dMgB
  - text: 강원 강원 동해시 보라 영상 가기 좋은 때 4~6, 9·10월
- link "여행 만들기":
  - /url: /record?status=planned&place=kr:51170&wish=2cqbojcJfyOeQPB8dMgB
- heading "가고 싶은 곳 소식" [level=2]
- text: 담아 둔 곳의 요즘 여행 소식, 한 곳에 한 줄씩.
- heading "10월에 가 볼 만한 곳" [level=2]
- text: 경북 울릉군 신비의 섬, 독도와 함께하는 태고의 풍경 가기 좋은 때 5~7, 10·11월
- button "담기"
- text: 서울 과거와 미래가 공존하는 K-컬처의 심장 가기 좋은 때 4~6, 9·10월
- button "담기"
- text: 경북 구미시 금오산의 절경과 젊음의 거리 가기 좋은 때 4·5, 9·10월
- button "담기"
- text: 여행지 뽑기
- checkbox "안 가본 곳만" [checked]
- text: 안 가본 곳만
- combobox "뽑을 범위":
  - option "국내 전체"
  - option "서울"
  - option "부산"
  - option "대구"
  - option "인천"
  - option "광주·전남"
  - option "대전"
  - option "울산"
  - option "세종"
  - option "경기"
  - option "충북"
  - option "충남"
  - option "경북"
  - option "경남"
  - option "제주"
  - option "강원"
  - option "전북"
  - option "해외 나라" [selected]
- button "뽑기"
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
  309 |     // 해외 도시 고르기: 속성을 조합한다 (예산 가볍게 + 4시간 안 + 미식) → 목록이 줄고 → 담기
  310 |     await page.getByLabel('뽑을 범위').selectOption('world');
  311 |     const wp = page.getByTestId('world-picker');
> 312 |     await expect(wp).toBeVisible();
      |                      ^ Error: expect(locator).toBeVisible() failed
  313 |     await wp.getByLabel('떠날 달').selectOption('1');
  314 |     const before = Number((await wp.getByTestId('world-count').textContent())!.match(/\d+/)![0]);
  315 |     await wp.getByRole('button', { name: '가볍게' }).click();
  316 |     await wp.getByRole('button', { name: '4시간 안' }).click();
  317 |     await wp.getByRole('button', { name: '미식', exact: true }).click();
  318 |     const after = Number((await wp.getByTestId('world-count').textContent())!.match(/\d+/)![0]);
  319 |     expect(after).toBeGreaterThan(0);
  320 |     expect(after).toBeLessThan(before);
  321 |     const rows = wp.getByTestId('world-city');
  322 |     await expect(rows.first()).toContainText('물가 가벼움');
  323 |     await expect(rows.first()).toContainText('인천에서');
  324 |     await shot(page, '10e-world-picker');
  325 |     const cityName = (await rows.first().locator('.t').textContent())!.trim().split(' ')[0];
  326 |     await rows.first().getByTestId('world-add').click();
  327 |     await expect(page.getByRole('status')).toContainText(`가고 싶은 곳에 담았어요`);
  328 |     await expect(page.getByTestId('wish-card')).toHaveCount(3);
  329 |     // 해외 도시 카드엔 도시 정보: 통화·입국·먹을 것, 눌러서 메모에 넣기
  330 |     await page.getByTestId('wish-card').filter({ hasText: cityName }).locator('.wish-main').click();
  331 |     await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  332 |     const info = page.getByTestId('city-info');
  333 |     await expect(info).toBeVisible();
  334 |     await expect(info).toContainText('입국');
  335 |     await expect(info).toContainText('떠나기 전 확인');
  336 |     const firstEat = info.getByRole('button', { name: /메모에 넣기$/ }).first();
  337 |     const eatText = (await firstEat.getAttribute('aria-label'))!.replace(' 메모에 넣기', '');
  338 |     await firstEat.click();
  339 |     await expect(page.getByLabel('먹을 것')).toHaveValue(new RegExp(eatText));
  340 |     await shot(page, '10f-city-info');
  341 |     await page.getByTestId('wish-save').click();
  342 |     await expect(page.getByRole('status')).toContainText('고쳤어요');
  343 | 
  344 |     // 홈 '다음 여행 준비'는 예정된 제주 여행을 맡고, 여행 탭에도 보인다
  345 |     await page.goto('/');
  346 |     await expect(page.getByTestId('next-hub')).toHaveAttribute('data-anchor', 'trip');
  347 |     await expect(page.getByTestId('hub-first')).toContainText('제주 여행');
  348 |     await page.goto('/trips');
  349 |     await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  350 |   });
  351 | 
  352 |   test('홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다', async ({ page, browser }) => {
  353 |     await signIn(page, OWNER);
  354 |     const hub = page.getByTestId('next-hub');
  355 |     await expect(hub).toBeVisible();
  356 |     // 1. 다음은 어디: 예정된 제주 여행이 맨 위, 그다음은 가고 싶은 곳(강원)
  357 |     await expect(hub.getByTestId('hub-first')).toContainText('제주 여행');
  358 |     await expect(hub.locator('.hub-others')).toContainText('강원');
  359 |     // 2. 오늘의 한 질문: 제주 이야기. 내가 답하면 상대 답은 잠겨 있다
  360 |     const ask = hub.getByTestId('hub-ask');
  361 |     await expect(ask).toContainText('제주');
  362 |     await ask.getByLabel('오늘의 질문 답').fill('흑돼지랑 고기국수');
  363 |     await ask.getByTestId('hub-ask-send').click();
  364 |     await expect(page.getByRole('status')).toContainText('답을 남겼어요');
  365 |     await expect(ask.locator('.hub-answer.mine')).toContainText('흑돼지랑 고기국수');
  366 |     await expect(ask.getByTestId('hub-ask-waiting')).toBeVisible();
  367 |     await expect(ask.getByTestId('hub-answer-other')).toHaveCount(0);
  368 |     await shot(page, '10d-home-hub');
  369 |     // 보라가 들어와 같은 질문을 보고 답하면 → 서로의 답이 열린다 (내 화면은 새로 고침 없이)
  370 |     const bora = await browser.newPage();
  371 |     await signIn(bora, 'bora@example.com');
  372 |     const bAsk = bora.getByTestId('hub-ask');
  373 |     await expect(bAsk).toContainText('제주');
  374 |     await expect(bAsk.getByTestId('hub-answer-other')).toHaveCount(0);
  375 |     await bAsk.getByLabel('오늘의 질문 답').fill('한라산 보이는 카페');
  376 |     await bAsk.getByTestId('hub-ask-send').click();
  377 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('흑돼지랑 고기국수');
  378 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('영상');
  379 |     await bora.close();
  380 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('한라산 보이는 카페');
  381 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('보라');
  382 |     await expect(ask.getByTestId('hub-ask-waiting')).toHaveCount(0);
  383 |     // 먹을 것·가볼 곳 질문이면 답을 가고 싶은 곳 메모에 넣을 수 있다 (오늘 질문이 그런 종류일 때)
  384 |     const save = ask.locator('.hub-answer.mine').getByRole('button', { name: '메모에 넣기' });
  385 |     if (await save.count()) {
  386 |       await save.click();
  387 |       await expect(page.getByRole('status')).toContainText('메모에 넣었어요');
  388 |       await page.getByRole('status').getByRole('button', { name: '보기' }).click();
  389 |       await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  390 |       await expect.poll(() => page.locator('textarea').evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value).join('\n')), { timeout: 15_000 }).toContain('흑돼지랑 고기국수');
  391 |       await page.goto('/');
  392 |     }
  393 |     // 3. 오늘의 영어: 영어 한 문장이 보이고 누르면 공부 화면
  394 |     const en = hub.getByTestId('hub-english');
  395 |     await expect(en.locator('.hub-en')).toHaveText(/[A-Za-z]{3,}/);
  396 |     await expect(en).toContainText(/\d문장 · 90초/);
  397 |     // 4. 가는 길: 같은 곳(제주)의 가기 좋은 때
  398 |     const way = hub.getByTestId('hub-way');
  399 |     await expect(way).toContainText('제주');
  400 |     await expect(way).toContainText('가기 좋은 때');
  401 |     // 바깥 링크(항공권·뉴스)는 국내 여행지엔 없다
  402 |     await expect(way.getByRole('link')).toHaveCount(0);
  403 |     await en.click();
  404 |     await expect(page).toHaveURL(/\/study$/);
  405 |   });
  406 | 
  407 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  408 |     await signIn(page, OWNER);
  409 |     await page.goto('/trips');
  410 |     await page.getByText('강릉시 여행', { exact: true }).click();
  411 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  412 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
```