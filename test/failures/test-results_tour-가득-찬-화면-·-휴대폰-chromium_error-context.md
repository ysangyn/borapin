# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:213:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('stopover-find').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('stopover-find').first() with timeout 15000ms
  - waiting for getByTestId('stopover-find').first()

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "우리 공간":
  - /url: /space
  - text: 보 영
- text: 보라 & 영상의 지도 11번의 여행, 핀 13개 꽂았어요
- link "통영 · 남해 드라이브 보기":
  - /url: /trips/t11
- text: 다가오는 여행 통영 · 남해 드라이브 D-1 · 통영시 · 남해군 KTX 9:11 행신 출발 · 예매하셨어요? · 2026.11.7–9
- link "준비물 보기":
  - /url: /trips/t11?tab=prep
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 흑해 필리핀해 태즈먼해 벵골만 남중국해 아라비아해 카리브해 멕시코만 허드슨만 카스피해 알래스카만 홍해 오호츠크해 페르시아만 지중해 산호해 동해 술라웨시해 술루해 발트해 북해 자와해 안다만해 황해 동중국해 아라푸라해 티모르해 타이만 베링해 대한해협 동해 서해 남해 1 2 6 1 1 1
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 핀 꽂기 단추가 나와요 전체 보기 단추를 누르면 전국이 보여요 9 /160 시·군 7 /16 광역 4 개국 2 예정
- button "집에서 가장 가까운 빈 칸은 부천시예요 · 차로 약 20분"
- textbox "물어보기":
  - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
- text: 지금 근처
- button "근처에 담아 둔 곳"
- text: 그 동네에 가면 눌러 보세요. 담아 둔 카페·맛집이 가까운 순으로 나와요.
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 6곳":
  - /url: /wishes
- link "다음 여행 타이베이 겨울 2027년 1월쯤":
  - /url: /trips/t12
- link "하회마을 그다음은 여기 · 둘 다 원해요":
  - /url: /wishes/w1
- link "강원 춘천시 둘 다 원해요":
  - /url: /wishes/w4
- text: 오늘의 한 질문
- paragraph: 타이베이에서 꼭 사진으로 남기고 싶은 서로의 모습은?
- textbox "오늘의 질문 답":
  - /placeholder: 한 줄이면 돼요
- button "답하기" [disabled]
- text: 대만 타이베이 가는 길
- button "가기 좋은 때 3·4, 10~12월 · 덥지 않고 비가 덜해요"
- button "입국 무비자 90일 · 떠나기 전 확인"
- button "TWD 대만달러 · 중국어(번체) · 콘센트 A(110V) · 한국보다 1시간 느려요"
- group: 자세히 · 한마디 ▾
- link "오늘의 영어 3문장 · 90초":
  - /url: /study
- group: 이달의 추천 · 가고 싶은 곳
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "다낭 휴양 베트남 다낭 · 2025년 7월쯤":
  - /url: /trips/t9
- link "도쿄 첫 해외여행 일본 도쿄 · 2024.11.21–24 · 3박 4일":
  - /url: /trips/t8
- link "가평 캠핑 경기 가평군 · 2025.9.20 나들이 회사 동기들과 함께":
  - /url: /trips/t7
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "남기기"
  - link "지도":
    - /url: /map
  - link "피드":
    - /url: /feed
- link "물어보기":
  - /url: /ask
- status
```

# Test source

```ts
  301 |   await snap(page, 'm14-wish-edit');
  302 |   await page.goto('/places');
  303 |   await snap(page, 'm15-places');
  304 |   // 장소 한 곳: 앱 안의 작은 거리 지도 (좌표가 있으면 골목까지)
  305 |   await page.goto('/places/r7');
  306 |   await expect(page.getByTestId('mini-street')).toBeVisible({ timeout: 15_000 });
  307 |   await page.waitForTimeout(2500); // 타일
  308 |   await snap(page, 'm15a-place-street');
  309 |   // 내 지도: 강릉 카페 3곳 → 거리 지도 + 순위, 새 곳을 담으면 견주기, 보내기 → 앱 없이 보는 페이지
  310 |   await page.goto('/maps?m=kr:51150|cafe');
  311 |   await expect(page.getByTestId('mymaps')).toBeVisible();
  312 |   await expect(page.getByTestId('street-map')).toBeVisible();
  313 |   await expect(page.getByTestId('mymap-list').getByTestId('place-rec')).toHaveCount(3);
  314 |   await page.waitForTimeout(2500); // 타일
  315 |   await snap(page, 'm15b-mymaps');
  316 |   await page.goto('/places/new?region=kr:51150&kind=cafe');
  317 |   await page.getByLabel('장소 이름').fill('안목 커피거리 2호점');
  318 |   await page.getByTestId('place-save').click();
  319 |   await expect(page.getByTestId('rank-ask')).toBeVisible();
  320 |   await snap(page, 'm15c-rank-ask', false);
  321 |   await page.getByTestId('rank-better').click();
  322 |   // 3곳이면 많아야 2번 묻는다
  323 |   if (await page.getByTestId('rank-ask').isVisible().catch(() => false)) await page.getByTestId('rank-better').click();
  324 |   await expect(page).toHaveURL(/\/maps\?m=/);
  325 |   await expect(page.getByTestId('mymap-list').getByTestId('place-rec').first()).toContainText('안목 커피거리 2호점');
  326 |   // 보내기: 공개 사본이 생기고 토큰으로 열린다
  327 |   await page.getByTestId('mymap-share').click();
  328 |   // 기기 공유 창이 열리면 알림이 없을 수 있으니, 공개 토큰이 생기는 것으로 확인한다
  329 |   let token: string | undefined;
  330 |   await expect.poll(async () => { const d = await sp.collection('placeMaps').doc('kr:51150|cafe').get(); token = (d.data() as { share?: { token: string } } | undefined)?.share?.token; return token ?? ''; }, { timeout: 15_000 }).toMatch(/.{6,}/);
  331 |   await expect(page.getByTestId('mymap-share')).toBeVisible();
  332 |   const anon = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  333 |   const guest = await anon.newPage();
  334 |   await guest.goto(`/m/${token}`);
  335 |   await expect(guest.getByTestId('shared-map')).toBeVisible();
  336 |   await expect(guest.getByTestId('shared-map-item')).toHaveCount(4);
  337 |   await expect(guest.getByTestId('shared-map-cta')).toBeVisible();
  338 |   await guest.waitForTimeout(2500);
  339 |   await guest.screenshot({ path: path.join(OUT, 'm15d-shared-map.jpg'), fullPage: true, type: 'jpeg', quality: 82 });
  340 |   // 로그인 없이 ♡ 전부 → 이 폰에 적어 두고 '보라핀 가고 싶은 곳에 넣기'
  341 |   await guest.getByTestId('shared-heart-all').click();
  342 |   await expect(guest.getByTestId('shared-heart').first()).toHaveText('♥ 담아 뒀어요');
  343 |   await expect(guest.getByTestId('shared-take')).toContainText('4곳');
  344 |   await guest.screenshot({ path: path.join(OUT, 'm15d2-shared-hearts.jpg'), type: 'jpeg', quality: 82 });
  345 |   await anon.close();
  346 |   // 한눈에: 맛집·카페·소품샵(내 꼬리표)이 색만 다르게 한 지도에
  347 |   await page.goto('/maps?m=kr:51150|all');
  348 |   await expect(page.getByTestId('mymap-legend')).toContainText('소품샵');
  349 |   await expect(page.getByTestId('mymaps-themes')).toContainText('한눈에');
  350 |   await page.waitForTimeout(2000);
  351 |   await snap(page, 'm15e-mymaps-all');
  352 |   // 스토리 카드: 1080×1920 그림을 만들어 보여 준다 (그림 원본도 남긴다)
  353 |   await page.getByTestId('mymap-story').click();
  354 |   await expect(page.getByTestId('story-img')).toBeVisible({ timeout: 15_000 });
  355 |   await snap(page, 'm15g-story', false);
  356 |   const png = await page.getByTestId('story-img').evaluate(async (img) => { const b = await (await fetch((img as HTMLImageElement).src)).blob(); const r = new FileReader(); return await new Promise<string>((ok) => { r.onload = () => ok(String(r.result).split(',')[1]); r.readAsDataURL(b); }); });
  357 |   fs.writeFileSync(path.join(OUT, 'm15g-story-card.png'), Buffer.from(png, 'base64'));
  358 |   await page.keyboard.press('Escape');
  359 |   await page.getByTestId('story-card').click({ position: { x: 5, y: 5 } });
  360 |   // 받은 지도에서 ♡한 곳 → 홈 카드에서 가고 싶은 곳으로 한꺼번에
  361 |   await page.goto(`/m/${token}`);
  362 |   await page.getByTestId('shared-heart-all').click();
  363 |   await page.getByTestId('shared-take').getByRole('link').click();
  364 |   await expect(page.getByTestId('pending-wishes')).toBeVisible({ timeout: 15_000 });
  365 |   await snap(page, 'm15h-pending-wishes', false);
  366 |   await page.getByTestId('pending-take').click();
  367 |   await expect(page.getByRole('status')).toContainText(/담았어요|담겨 있어요/);
  368 |   await expect(page.getByTestId('pending-wishes')).toHaveCount(0);
  369 |   await page.goto('/places/r1');
  370 |   await snap(page, 'm16-place-edit');
  371 |   await page.goto('/memories');
  372 |   await snap(page, 'm17-memories');
  373 |   await page.goto('/ask');
  374 |   const answersBefore = await page.getByTestId('answer').count();
  375 |   await page.getByRole('textbox').first().fill('강릉 몇 번 갔지?');
  376 |   await page.keyboard.press('Enter');
  377 |   // 첫 답이 붙은 뒤에 다음 질문 (고정 대기 대신)
  378 |   await expect.poll(() => page.getByTestId('answer').count()).toBeGreaterThan(answersBefore);
  379 |   await page.getByRole('textbox').first().fill('11월에 어디 가면 좋아?');
  380 |   await page.keyboard.press('Enter');
  381 |   await snap(page, 'm18-ask');
  382 |   await page.goto('/space');
  383 |   await snap(page, 'm19-space');
  384 |   await page.goto('/admin');
  385 |   await snap(page, 'm20-admin');
  386 |   // 지도 시트
  387 |   await page.goto('/');
  388 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  389 |   await page.goto('/map');
  390 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  391 |   await settle(page);
  392 |   // 강릉을 눌러 지역 창 (위쪽에 여행지 사진)
  393 |   const pt = await page.evaluate(() => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([128.88, 37.74]));
  394 |   const box = await page.getByTestId('map').first().boundingBox();
  395 |   if (box) await page.mouse.click(box.x + pt.x, box.y + pt.y);
  396 |   // 지역 창이 뜨면 바로 (못 뜨면 전처럼 그냥 찍는다: 이 파일은 디자인 검수용 사진이 목적)
  397 |   await page.getByTestId('region-sheet').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  398 |   await snap(page, 'm22-sheet', false);
  399 |   // 경유지: 홈 다음 여행 카드와 준비 탭에 '가는 길에 들를 곳 찾기'가 늘 보이고, 누르면 들러 가기가 펼쳐진다
  400 |   await page.goto('/');
> 401 |   await expect(page.getByTestId('stopover-find').first()).toBeVisible({ timeout: 15_000 });
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  402 |   await page.goto('/trips/t11?tab=prep');
  403 |   await page.getByTestId('stopover-find').first().click();
  404 |   await expect(page.getByTestId('stopovers')).toBeVisible();
  405 |   await page.getByTestId('stopovers').scrollIntoViewIfNeeded();
  406 |   await snap(page, 'm23-stopover-find', false);
  407 |   // 밤 모드: 설정 → 화면 '어둡게' (새로 불러 지도 색까지 바뀜) → 주요 화면을 어둡게 한 번 더
  408 |   await page.goto('/space');
  409 |   await page.getByTestId('theme-dark').click();
  410 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 15_000 });
  411 |   for (const [route, name, full] of [['/', 'n01-home', true], ['/map', 'n02-map', false], ['/trips/t1', 'n03-trip', true], ['/trips/t11?tab=prep', 'n04-prep', true], ['/trips/t11/plan-next?step=pick', 'n05-plan-pick', true], ['/feed', 'n07-feed', true], ['/maps?m=kr:51150|all', 'n08-mymaps', true], ['/space', 'n06-space', true]] as const) {
  412 |     await page.goto(route);
  413 |     await snap(page, name, full);
  414 |   }
  415 |   await page.getByTestId('theme-light').click();
  416 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'light', { timeout: 15_000 });
  417 |   await page.context().close();
  418 | });
  419 | 
  420 | test('가득 찬 화면 · PC', async ({ browser }) => {
  421 |   test.setTimeout(480_000);
  422 |   const page = await desktop(browser);
  423 |   await page.goto('/');
  424 |   await expect(page.getByTestId('email-open')).toBeVisible({ timeout: 20_000 });
  425 |   await page.waitForTimeout(2500);
  426 |   await snap(page, 'd00-login', false);
  427 |   await signIn(page);
  428 |   for (const [route, name] of [['/', 'd01-home'], ['/trips', 'd02-trips'], ['/trips/t1', 'd03-trip'], ['/trips/t11', 'd04-planned'], ['/record', 'd05-record'], ['/map', 'd06-map'], ['/wishes', 'd07-wishes'], ['/places', 'd08-places'], ['/memories', 'd09-memories'], ['/ask', 'd10-ask'], ['/space', 'd11-space'], ['/admin', 'd12-admin']] as const) {
  429 |     await page.goto(route);
  430 |     await snap(page, name, route !== '/map');
  431 |   }
  432 |   // 공유 페이지 (로그인 없이)
  433 |   await page.goto('/trips/t1');
  434 |   const card = page.getByTestId('share-link');
  435 |   await card.getByTestId('share-on').click();
  436 |   const url = await card.getByLabel('공유 링크').inputValue();
  437 |   const anon = await mobile(browser);
  438 |   await anon.goto(url);
  439 |   await expect(anon.getByTestId('shared-trip')).toBeVisible();
  440 |   await snap(anon, 'm21-shared');
  441 |   await anon.context().close();
  442 |   await page.context().close();
  443 | });
  444 | 
  445 | test('화면 오류 없음', () => {
  446 |   expect(problems, problems.join('\n')).toEqual([]);
  447 | });
  448 | 
```