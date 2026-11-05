# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:212:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected pattern: /복사했어요|열었어요/
Received string:  ""
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByRole('status') with timeout 15000ms
  - waiting for getByRole('status')
    8 × locator resolved to <div role="status" aria-live="polite" class="toast-region">…</div>
      - unexpected value "카페 지도 1등에 넣었어요"
    25 × locator resolved to <div role="status" aria-live="polite" class="toast-region"></div>
       - unexpected value ""

```

```yaml
- button "뒤로"
- heading "내 지도" [level=1]
- link "담기":
  - /url: /places/new
- tablist "주제":
  - tab "맛집 3"
  - tab "카페 4" [selected]
  - tab "볼거리 1"
  - tab "숙소 1"
- button "지도 이름·소개 고치기":
  - heading "강원 강릉시 카페 지도" [level=2]
  - text: 4곳 · 누르면 이름과 소개를 고쳐요
- region "Map"
- button "보헤미안 박이추 커피": 1 보헤미안 박이추 커피
- button "테라로사 커피공장": 2 테라로사 커피공장
- button "카페 툇마루": 3 카페 툇마루
- group:
  - link "OpenFreeMap":
    - /url: https://openfreemap.org
  - link "© OpenMapTiles":
    - /url: https://www.openmaptiles.org/
  - text: Data from
  - link "OpenStreetMap":
    - /url: https://www.openstreetmap.org/copyright
- text: 한곳은 자리를 몰라 지도엔 없어요 · 장소를 열어 지도 링크를 붙여 넣으면 찍혀요
- button "이 지도 보내기"
- button "공개 끄기": 공개 중
- text: 내 순위 담을 때 견준 순서 1
- link "카페 안목 커피거리 2호점":
  - /url: /places/SLCDzyEZ0ddBZiwfqpem
- text: "2"
- link "카페 보헤미안 박이추 커피 또 갈래요 보라 바다 뷰":
  - /url: /places/r2
- text: "3"
- link "카페 테라로사 커피공장 또 갈래요 영상 공장 구경하다 한 시간":
  - /url: /places/r7
- text: "4"
- link "카페 카페 툇마루 한 번이면 충분 보라 흑임자 라테":
  - /url: /places/r8
- button "강릉시에 카페 더 담기"
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "남기기"
  - link "지도":
    - /url: /map
  - link "새 소식 5개 피드":
    - /url: /feed
    - text: 피드
- status
```

# Test source

```ts
  216 |   await seed(page);
  217 |   await page.goto('/');
  218 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  219 |   await snap(page, 'm01-home');
  220 |   await page.goto('/trips');
  221 |   await snap(page, 'm02-trips');
  222 |   await page.goto('/trips/t1');
  223 |   await snap(page, 'm03-trip-info');
  224 |   await page.getByRole('tab', { name: /사진/ }).click();
  225 |   await snap(page, 'm04-trip-photos');
  226 |   await page.getByRole('tab', { name: /글/ }).click();
  227 |   await snap(page, 'm05-trip-notes');
  228 |   await page.goto('/trips/t11');
  229 |   await snap(page, 'm06-planned-info');
  230 |   // 준비 탭: 가는 길 정하기 (고양 → 통영, 이달 시각표 · 떠나는 날이 토요일이라 토요일 시각표로)
  231 |   await page.goto('/trips/t11?tab=prep');
  232 |   await expect(page.getByTestId('way-go')).toContainText('가는 길');
  233 |   await page.getByTestId('way-go-open').click();
  234 |   const sheet = page.getByTestId('way-sheet');
  235 |   await expect(sheet.getByTestId('transit-plan').first()).toBeVisible({ timeout: 15_000 });
  236 |   await expect(sheet.getByTestId('transit-sat')).toHaveAttribute('aria-selected', 'true');
  237 |   await snap(page, 'm06b-transit-stops', false);
  238 |   await sheet.getByTestId('transit-plan').filter({ hasText: '들러 가기' }).first().getByTestId('transit-pick').click();
  239 |   await expect(page.getByRole('status')).toContainText('가는 길을 정했어요');
  240 |   await expect(page.getByTestId('way-go')).toContainText('들러 가기');
  241 |   await expect(page.getByTestId('way-go')).toContainText('막차');
  242 |   await snap(page, 'm06c-way-picked');
  243 |   await page.getByRole('tab', { name: /일정/ }).click();
  244 |   await snap(page, 'm07-planned-plan');
  245 |   // 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서만 켜짐)
  246 |   await page.goto('/trips/t11/plan-next?step=when');
  247 |   await expect(page.getByTestId('flow-cal')).toBeVisible({ timeout: 15_000 });
  248 |   await expect(page.getByTestId('flow-nights')).toHaveText('2박 3일');
  249 |   await snap(page, 'm07a-plan-when');
  250 |   await page.getByTestId('flow-when-save').click();
  251 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'stay');
  252 |   await snap(page, 'm07b-plan-stay');
  253 |   await page.getByLabel('숙소').fill('통영 바다 앞 호텔');
  254 |   await page.getByTestId('flow-stay-save').click();
  255 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'pick');
  256 |   const own = page.getByLabel('직접 담기');
  257 |   await own.fill('서피랑');
  258 |   await own.press('Enter');
  259 |   await expect(page.getByTestId('pick-card').filter({ hasText: '직접 담은 곳' }).filter({ hasText: '서피랑' })).toBeVisible();
  260 |   await snap(page, 'm07c-plan-pick');
  261 |   await page.getByTestId('flow-pick-next').click();
  262 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'route');
  263 |   await expect(page.getByTestId('flow-day')).toHaveCount(3);
  264 |   await snap(page, 'm07d-plan-route');
  265 |   await page.getByTestId('flow-route-save').click();
  266 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'hope');
  267 |   await page.getByLabel('기대 한 줄').fill('케이블카에서 보는 한려수도');
  268 |   await expect(page.getByTestId('flow-check')).toContainText('통영 바다 앞 호텔');
  269 |   await snap(page, 'm07e-plan-hope');
  270 |   await page.getByTestId('flow-hope-save').click();
  271 |   await expect(page).toHaveURL(/\/trips\/t11$/);
  272 |   await expect.poll(async () => (await sp.collection('trips').doc('t11').get()).data()?.planDone?.length).toBe(5);
  273 |   await page.goto('/trips/t10');
  274 |   await page.locator('.trip-cover').click();
  275 |   await page.waitForTimeout(1200);
  276 |   await page.screenshot({ path: path.join(OUT, 'm08-slideshow.jpg'), type: 'jpeg', quality: 82 });
  277 |   await page.keyboard.press('Escape');
  278 |   await page.goto('/record');
  279 |   await snap(page, 'm09-record');
  280 |   await page.goto('/trips/t1/edit');
  281 |   await snap(page, 'm10-trip-edit');
  282 |   await page.goto('/map');
  283 |   await snap(page, 'm11-map', false);
  284 |   await page.getByRole('tab', { name: '세계' }).first().click({ timeout: 5000 }).catch(() => undefined);
  285 |   await snap(page, 'm12-map-world', false);
  286 |   await page.goto('/wishes');
  287 |   await expect(page.getByTestId('wish-again').first()).toContainText('못 간 곳 2');
  288 |   await snap(page, 'm13-wishes');
  289 |   await page.goto('/wishes/w6');
  290 |   await expect(page.getByTestId('wish-gone')).toBeVisible();
  291 |   await expect(page.getByTestId('wish-gone-rec')).toContainText('보헤미안 박이추 커피');
  292 |   await snap(page, 'm13b-wish-gone');
  293 |   await page.goto('/wishes/w1');
  294 |   await snap(page, 'm14-wish-edit');
  295 |   await page.goto('/places');
  296 |   await snap(page, 'm15-places');
  297 |   // 내 지도: 강릉 카페 3곳 → 거리 지도 + 순위, 새 곳을 담으면 견주기, 보내기 → 앱 없이 보는 페이지
  298 |   await page.goto('/maps?m=kr:51150|cafe');
  299 |   await expect(page.getByTestId('mymaps')).toBeVisible();
  300 |   await expect(page.getByTestId('street-map')).toBeVisible();
  301 |   await expect(page.getByTestId('mymap-list').getByTestId('place-rec')).toHaveCount(3);
  302 |   await page.waitForTimeout(2500); // 타일
  303 |   await snap(page, 'm15b-mymaps');
  304 |   await page.goto('/places/new?region=kr:51150&kind=cafe');
  305 |   await page.getByLabel('장소 이름').fill('안목 커피거리 2호점');
  306 |   await page.getByTestId('place-save').click();
  307 |   await expect(page.getByTestId('rank-ask')).toBeVisible();
  308 |   await snap(page, 'm15c-rank-ask', false);
  309 |   await page.getByTestId('rank-better').click();
  310 |   // 3곳이면 많아야 2번 묻는다
  311 |   if (await page.getByTestId('rank-ask').isVisible().catch(() => false)) await page.getByTestId('rank-better').click();
  312 |   await expect(page).toHaveURL(/\/maps\?m=/);
  313 |   await expect(page.getByTestId('mymap-list').getByTestId('place-rec').first()).toContainText('안목 커피거리 2호점');
  314 |   // 보내기: 공개 사본이 생기고 토큰으로 열린다
  315 |   await page.getByTestId('mymap-share').click();
> 316 |   await expect(page.getByRole('status')).toContainText(/복사했어요|열었어요/);
      |                                          ^ Error: expect(locator).toContainText(expected) failed
  317 |   const mapDoc = await sp.collection('placeMaps').doc('kr:51150|cafe').get();
  318 |   const token = (mapDoc.data() as { share?: { token: string } }).share?.token;
  319 |   expect(token).toBeTruthy();
  320 |   const anon = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  321 |   const guest = await anon.newPage();
  322 |   await guest.goto(`/m/${token}`);
  323 |   await expect(guest.getByTestId('shared-map')).toBeVisible();
  324 |   await expect(guest.getByTestId('shared-map-item')).toHaveCount(4);
  325 |   await expect(guest.getByTestId('shared-map-cta')).toBeVisible();
  326 |   await guest.waitForTimeout(2500);
  327 |   await guest.screenshot({ path: path.join(OUT, 'm15d-shared-map.jpg'), fullPage: true, type: 'jpeg', quality: 82 });
  328 |   await anon.close();
  329 |   await page.goto('/places/r1');
  330 |   await snap(page, 'm16-place-edit');
  331 |   await page.goto('/memories');
  332 |   await snap(page, 'm17-memories');
  333 |   await page.goto('/ask');
  334 |   const answersBefore = await page.getByTestId('answer').count();
  335 |   await page.getByRole('textbox').first().fill('강릉 몇 번 갔지?');
  336 |   await page.keyboard.press('Enter');
  337 |   // 첫 답이 붙은 뒤에 다음 질문 (고정 대기 대신)
  338 |   await expect.poll(() => page.getByTestId('answer').count()).toBeGreaterThan(answersBefore);
  339 |   await page.getByRole('textbox').first().fill('11월에 어디 가면 좋아?');
  340 |   await page.keyboard.press('Enter');
  341 |   await snap(page, 'm18-ask');
  342 |   await page.goto('/space');
  343 |   await snap(page, 'm19-space');
  344 |   await page.goto('/admin');
  345 |   await snap(page, 'm20-admin');
  346 |   // 지도 시트
  347 |   await page.goto('/');
  348 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  349 |   await page.goto('/map');
  350 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  351 |   await settle(page);
  352 |   // 강릉을 눌러 지역 창 (위쪽에 여행지 사진)
  353 |   const pt = await page.evaluate(() => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([128.88, 37.74]));
  354 |   const box = await page.getByTestId('map').first().boundingBox();
  355 |   if (box) await page.mouse.click(box.x + pt.x, box.y + pt.y);
  356 |   // 지역 창이 뜨면 바로 (못 뜨면 전처럼 그냥 찍는다: 이 파일은 디자인 검수용 사진이 목적)
  357 |   await page.getByTestId('region-sheet').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  358 |   await snap(page, 'm22-sheet', false);
  359 |   // 밤 모드: 설정 → 화면 '어둡게' (새로 불러 지도 색까지 바뀜) → 주요 화면을 어둡게 한 번 더
  360 |   await page.goto('/space');
  361 |   await page.getByTestId('theme-dark').click();
  362 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 15_000 });
  363 |   for (const [route, name, full] of [['/', 'n01-home', true], ['/map', 'n02-map', false], ['/trips/t1', 'n03-trip', true], ['/trips/t11?tab=prep', 'n04-prep', true], ['/trips/t11/plan-next?step=pick', 'n05-plan-pick', true], ['/space', 'n06-space', true]] as const) {
  364 |     await page.goto(route);
  365 |     await snap(page, name, full);
  366 |   }
  367 |   await page.getByTestId('theme-light').click();
  368 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'light', { timeout: 15_000 });
  369 |   await page.context().close();
  370 | });
  371 | 
  372 | test('가득 찬 화면 · PC', async ({ browser }) => {
  373 |   test.setTimeout(480_000);
  374 |   const page = await desktop(browser);
  375 |   await page.goto('/');
  376 |   await expect(page.getByTestId('email-open')).toBeVisible({ timeout: 20_000 });
  377 |   await page.waitForTimeout(2500);
  378 |   await snap(page, 'd00-login', false);
  379 |   await signIn(page);
  380 |   for (const [route, name] of [['/', 'd01-home'], ['/trips', 'd02-trips'], ['/trips/t1', 'd03-trip'], ['/trips/t11', 'd04-planned'], ['/record', 'd05-record'], ['/map', 'd06-map'], ['/wishes', 'd07-wishes'], ['/places', 'd08-places'], ['/memories', 'd09-memories'], ['/ask', 'd10-ask'], ['/space', 'd11-space'], ['/admin', 'd12-admin']] as const) {
  381 |     await page.goto(route);
  382 |     await snap(page, name, route !== '/map');
  383 |   }
  384 |   // 공유 페이지 (로그인 없이)
  385 |   await page.goto('/trips/t1');
  386 |   const card = page.getByTestId('share-link');
  387 |   await card.getByTestId('share-on').click();
  388 |   const url = await card.getByLabel('공유 링크').inputValue();
  389 |   const anon = await mobile(browser);
  390 |   await anon.goto(url);
  391 |   await expect(anon.getByTestId('shared-trip')).toBeVisible();
  392 |   await snap(anon, 'm21-shared');
  393 |   await anon.context().close();
  394 |   await page.context().close();
  395 | });
  396 | 
  397 | test('화면 오류 없음', () => {
  398 |   expect(problems, problems.join('\n')).toEqual([]);
  399 | });
  400 | 
```