# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:218:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('region-been').first()
Expected substring: "안목 커피거리 2호점"
Received string:    "1맛집초당할머니순두부또 갈래요영상 아침으로 최고보라 짬뽕순두부가 더 맛있었어"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('region-been').first() with timeout 15000ms
  - waiting for getByTestId('region-been').first()
    34 × locator resolved to <div class="rec-row-wrap" data-testid="region-been">…</div>
       - unexpected value "1맛집초당할머니순두부또 갈래요영상 아침으로 최고보라 짬뽕순두부가 더 맛있었어"

```

```yaml
- text: "1"
- link "맛집 초당할머니순두부 또 갈래요 영상 아침으로 최고 보라 짬뽕순두부가 더 맛있었어":
  - /url: /places/r1
```

# Test source

```ts
  286 |   await page.getByRole('tab', { name: /일정/ }).click();
  287 |   await snap(page, 'm07-planned-plan');
  288 |   // 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서만 켜짐)
  289 |   await page.goto('/trips/t11/plan-next?step=when');
  290 |   await expect(page.getByTestId('flow-cal')).toBeVisible({ timeout: 15_000 });
  291 |   await expect(page.getByTestId('flow-nights')).toHaveText('2박 3일');
  292 |   await snap(page, 'm07a-plan-when');
  293 |   await page.getByTestId('flow-when-save').click();
  294 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'stay');
  295 |   await snap(page, 'm07b-plan-stay');
  296 |   await page.getByLabel('숙소').fill('통영 바다 앞 호텔');
  297 |   await page.getByTestId('flow-stay-save').click();
  298 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'pick');
  299 |   const own = page.getByLabel('직접 담기');
  300 |   await own.fill('서피랑');
  301 |   await own.press('Enter');
  302 |   await expect(page.getByTestId('pick-card').filter({ hasText: '직접 담은 곳' }).filter({ hasText: '서피랑' })).toBeVisible();
  303 |   await snap(page, 'm07c-plan-pick');
  304 |   await page.getByTestId('flow-pick-next').click();
  305 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'route');
  306 |   await expect(page.getByTestId('flow-day')).toHaveCount(3);
  307 |   await snap(page, 'm07d-plan-route');
  308 |   await page.getByTestId('flow-route-save').click();
  309 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'hope');
  310 |   await page.getByLabel('기대 한 줄').fill('케이블카에서 보는 한려수도');
  311 |   await expect(page.getByTestId('flow-check')).toContainText('통영 바다 앞 호텔');
  312 |   await snap(page, 'm07e-plan-hope');
  313 |   await page.getByTestId('flow-hope-save').click();
  314 |   await expect(page).toHaveURL(/\/trips\/t11$/);
  315 |   await expect.poll(async () => (await sp.collection('trips').doc('t11').get()).data()?.planDone?.length).toBe(5);
  316 |   await page.goto('/trips/t10');
  317 |   await page.locator('.trip-cover').click();
  318 |   await page.waitForTimeout(1200);
  319 |   await page.screenshot({ path: path.join(OUT, 'm08-slideshow.jpg'), type: 'jpeg', quality: 82 });
  320 |   await page.keyboard.press('Escape');
  321 |   // 여행 기록 안의 '들른 맛집·명소': 그 지역의 가고 싶어요 가게가 체크 후보로
  322 |   await page.goto('/record?place=kr:51150');
  323 |   await expect(page.getByTestId('record-stop-cand').first()).toContainText('버드나무 브루어리');
  324 |   await snap(page, 'm09-record');
  325 |   // 새로 적은 곳은 저장하면 가게로 만들어 여행에 묶인다
  326 |   await page.goto('/record?place=kr:47170');
  327 |   await page.getByRole('button', { name: '날짜', exact: true }).click();
  328 |   await page.getByLabel('시작 날짜').fill('2026-10-03');
  329 |   await page.getByLabel('들른 곳 이름').fill('안동찜닭 골목');
  330 |   await page.getByTestId('record-stop-add').click();
  331 |   await expect(page.getByTestId('record-stop-list')).toContainText('안동찜닭 골목');
  332 |   await page.getByTestId('save').click();
  333 |   await expect(page.getByRole('status')).toContainText('맛집·명소 1곳 함께');
  334 |   await page.goto('/region/kr:47170?tab=places');
  335 |   await expect(page.getByTestId('region-been').first()).toContainText('안동찜닭 골목');
  336 |   await page.goto('/trips/t1/edit');
  337 |   await snap(page, 'm10-trip-edit');
  338 |   await page.goto('/map');
  339 |   await snap(page, 'm11-map', false);
  340 |   await page.getByRole('tab', { name: '세계' }).first().click({ timeout: 5000 }).catch(() => undefined);
  341 |   await snap(page, 'm12-map-world', false);
  342 |   await page.goto('/wishes');
  343 |   await expect(page.getByTestId('wish-again').first()).toContainText('못 간 곳 2');
  344 |   await snap(page, 'm13-wishes');
  345 |   // 가고 싶은 곳 담기: '들를 곳'(맛집·카페·관광지)이 어디 바로 밑에, 지도 공유 글을 붙여 넣으면 이름만
  346 |   await page.goto('/wishes/new');
  347 |   await expect(page.getByTestId('wish-stops')).toBeVisible();
  348 |   await page.getByLabel('맛집·카페').focus();
  349 |   await page.evaluate(() => {
  350 |     const dt = new DataTransfer();
  351 |     dt.setData('text', '[네이버 지도]\n테라로사 커피공장\n강원 강릉시 구정면 현천길 7\nhttps://naver.me/xyz');
  352 |     document.activeElement?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  353 |   });
  354 |   await expect(page.getByLabel('맛집·카페')).toHaveValue('테라로사 커피공장');
  355 |   await snap(page, 'm13b-wish-new', false);
  356 |   await page.goto('/wishes/w6');
  357 |   await expect(page.getByTestId('wish-gone')).toBeVisible();
  358 |   await expect(page.getByTestId('wish-gone-rec')).toContainText('보헤미안 박이추 커피');
  359 |   await snap(page, 'm13b-wish-gone');
  360 |   await page.goto('/wishes/w1');
  361 |   await snap(page, 'm14-wish-edit');
  362 |   await page.goto('/places');
  363 |   await snap(page, 'm15-places');
  364 |   // 장소 한 곳: 앱 안의 작은 거리 지도 (좌표가 있으면 골목까지)
  365 |   await page.goto('/places/r7');
  366 |   await expect(page.getByTestId('mini-street')).toBeVisible({ timeout: 15_000 });
  367 |   await page.waitForTimeout(2500); // 타일
  368 |   await snap(page, 'm15a-place-street');
  369 |   // 내 지도: 강릉 카페 3곳 → 거리 지도 + 순위, 새 곳을 담으면 견주기, 보내기 → 앱 없이 보는 페이지
  370 |   await page.goto('/maps?m=kr:51150|cafe');
  371 |   await expect(page.getByTestId('mymaps')).toBeVisible();
  372 |   await expect(page.getByTestId('street-map')).toBeVisible();
  373 |   await expect(page.getByTestId('mymap-list').getByTestId('place-rec')).toHaveCount(3);
  374 |   await page.waitForTimeout(2500); // 타일
  375 |   await snap(page, 'm15b-mymaps');
  376 |   await page.goto('/places/new?region=kr:51150&kind=cafe');
  377 |   await page.getByLabel('장소 이름').fill('안목 커피거리 2호점');
  378 |   await page.getByTestId('place-save').click();
  379 |   await expect(page.getByTestId('rank-ask')).toBeVisible();
  380 |   await snap(page, 'm15c-rank-ask', false);
  381 |   await page.getByTestId('rank-better').click();
  382 |   // 3곳이면 많아야 2번 묻는다
  383 |   if (await page.getByTestId('rank-ask').isVisible().catch(() => false)) await page.getByTestId('rank-better').click();
  384 |   // 담고 나면 그 지역 한 장(맛집·명소 탭)으로
  385 |   await expect(page).toHaveURL(/\/region\/kr:51150\?tab=places/);
> 386 |   await expect(page.getByTestId('region-been').first()).toContainText('안목 커피거리 2호점');
      |                                                         ^ Error: expect(locator).toContainText(expected) failed
  387 |   await expect(page.getByTestId('region-want')).toHaveCount(1); // 버드나무 브루어리 (가고 싶어요)
  388 |   await snap(page, 'm15c2-region-places');
  389 |   // 한눈에: 채운 핀·빈 핀 지도 · 여행 · 때
  390 |   await page.getByTestId('region-tab-glance').click();
  391 |   await expect(page.getByTestId('region-glance')).toBeVisible();
  392 |   await page.waitForTimeout(2500);
  393 |   await snap(page, 'm15c3-region-glance');
  394 |   await page.getByTestId('region-tab-trips').click();
  395 |   await expect(page.getByTestId('region-trips')).toBeVisible();
  396 |   await snap(page, 'm15c4-region-trips', false);
  397 |   // 큰 도시는 동네 칩으로 (주소에서): 서울 → 성동구 2 · 마포구 1
  398 |   await page.goto('/region/kr:11?tab=places');
  399 |   await expect(page.getByTestId('region-areas')).toContainText('성동구');
  400 |   await page.getByTestId('region-areas').getByRole('button', { name: /성동구/ }).click();
  401 |   await expect(page.getByTestId('region-been')).toHaveCount(2);
  402 |   await expect(page.getByTestId('region-want')).toHaveCount(0);
  403 |   await snap(page, 'm15c5-region-seoul', false);
  404 |   // 가고 싶어요 → 다녀왔어요: ✓ 누르면 평가 쓰는 화면이 '다녀왔어요'로 열린다
  405 |   await page.goto('/region/kr:51150?tab=places');
  406 |   await page.getByTestId('region-mark-been').first().click();
  407 |   await expect(page.getByTestId('status-been')).toHaveAttribute('aria-checked', 'true');
  408 |   await page.getByTestId('place-save').click();
  409 |   await expect(page).toHaveURL(/\/region\/kr:51150/);
  410 |   await expect(page.getByTestId('region-want')).toHaveCount(0);
  411 |   await page.goto('/maps?m=kr:51150|cafe');
  412 |   await expect(page.getByTestId('mymaps')).toBeVisible();
  413 |   // 보내기: 공개 사본이 생기고 토큰으로 열린다
  414 |   await page.getByTestId('mymap-share').click();
  415 |   // 기기 공유 창이 열리면 알림이 없을 수 있으니, 공개 토큰이 생기는 것으로 확인한다
  416 |   let token: string | undefined;
  417 |   await expect.poll(async () => { const d = await sp.collection('placeMaps').doc('kr:51150|cafe').get(); token = (d.data() as { share?: { token: string } } | undefined)?.share?.token; return token ?? ''; }, { timeout: 15_000 }).toMatch(/.{6,}/);
  418 |   await expect(page.getByTestId('mymap-share')).toBeVisible();
  419 |   const anon = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  420 |   const guest = await anon.newPage();
  421 |   await guest.goto(`/m/${token}`);
  422 |   await expect(guest.getByTestId('shared-map')).toBeVisible();
  423 |   await expect(guest.getByTestId('shared-map-item')).toHaveCount(4);
  424 |   await expect(guest.getByTestId('shared-map-cta')).toBeVisible();
  425 |   await guest.waitForTimeout(2500);
  426 |   await guest.screenshot({ path: path.join(OUT, 'm15d-shared-map.jpg'), fullPage: true, type: 'jpeg', quality: 82 });
  427 |   // 로그인 없이 ♡ 전부 → 이 폰에 적어 두고 '보라핀 가고 싶은 곳에 넣기'
  428 |   await guest.getByTestId('shared-heart-all').click();
  429 |   await expect(guest.getByTestId('shared-heart').first()).toHaveText('♥ 담아 뒀어요');
  430 |   await expect(guest.getByTestId('shared-take')).toContainText('4곳');
  431 |   await guest.screenshot({ path: path.join(OUT, 'm15d2-shared-hearts.jpg'), type: 'jpeg', quality: 82 });
  432 |   await anon.close();
  433 |   // 한눈에: 맛집·카페·소품샵(내 꼬리표)이 색만 다르게 한 지도에
  434 |   await page.goto('/maps?m=kr:51150|all');
  435 |   await expect(page.getByTestId('mymap-legend')).toContainText('소품샵');
  436 |   await expect(page.getByTestId('mymaps-themes')).toContainText('한눈에');
  437 |   await page.waitForTimeout(2000);
  438 |   await snap(page, 'm15e-mymaps-all');
  439 |   // 스토리 카드: 1080×1920 그림을 만들어 보여 준다 (그림 원본도 남긴다)
  440 |   await page.getByTestId('mymap-story').click();
  441 |   await expect(page.getByTestId('story-img')).toBeVisible({ timeout: 15_000 });
  442 |   await snap(page, 'm15g-story', false);
  443 |   const png = await page.getByTestId('story-img').evaluate(async (img) => { const b = await (await fetch((img as HTMLImageElement).src)).blob(); const r = new FileReader(); return await new Promise<string>((ok) => { r.onload = () => ok(String(r.result).split(',')[1]); r.readAsDataURL(b); }); });
  444 |   fs.writeFileSync(path.join(OUT, 'm15g-story-card.png'), Buffer.from(png, 'base64'));
  445 |   await page.keyboard.press('Escape');
  446 |   await page.getByTestId('story-card').click({ position: { x: 5, y: 5 } });
  447 |   // 받은 지도에서 ♡한 곳 → 홈 카드에서 가고 싶은 곳으로 한꺼번에
  448 |   await page.goto(`/m/${token}`);
  449 |   await page.getByTestId('shared-heart-all').click();
  450 |   await page.getByTestId('shared-take').getByRole('link').click();
  451 |   await expect(page.getByTestId('pending-wishes')).toBeVisible({ timeout: 15_000 });
  452 |   await snap(page, 'm15h-pending-wishes', false);
  453 |   await page.getByTestId('pending-take').click();
  454 |   await expect(page.getByRole('status')).toContainText(/담았어요|담겨 있어요/);
  455 |   await expect(page.getByTestId('pending-wishes')).toHaveCount(0);
  456 |   await page.goto('/places/r1');
  457 |   await snap(page, 'm16-place-edit');
  458 |   await page.goto('/memories');
  459 |   await snap(page, 'm17-memories');
  460 |   await page.goto('/ask');
  461 |   const answersBefore = await page.getByTestId('answer').count();
  462 |   await page.getByRole('textbox').first().fill('강릉 몇 번 갔지?');
  463 |   await page.keyboard.press('Enter');
  464 |   // 첫 답이 붙은 뒤에 다음 질문 (고정 대기 대신)
  465 |   await expect.poll(() => page.getByTestId('answer').count()).toBeGreaterThan(answersBefore);
  466 |   await page.getByRole('textbox').first().fill('11월에 어디 가면 좋아?');
  467 |   await page.keyboard.press('Enter');
  468 |   await snap(page, 'm18-ask');
  469 |   await page.goto('/space');
  470 |   await snap(page, 'm19-space');
  471 |   await page.goto('/admin');
  472 |   await snap(page, 'm20-admin');
  473 |   // 지도 시트
  474 |   await page.goto('/');
  475 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  476 |   await page.goto('/map');
  477 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  478 |   await settle(page);
  479 |   // 강릉을 눌러 지역 창 (위쪽에 여행지 사진)
  480 |   const pt = await page.evaluate(() => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([128.88, 37.74]));
  481 |   const box = await page.getByTestId('map').first().boundingBox();
  482 |   if (box) await page.mouse.click(box.x + pt.x, box.y + pt.y);
  483 |   // 지역 창이 뜨면 바로 (못 뜨면 전처럼 그냥 찍는다: 이 파일은 디자인 검수용 사진이 목적)
  484 |   await page.getByTestId('region-sheet').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  485 |   await snap(page, 'm22-sheet', false);
  486 |   // 경유지: 준비 탭 '가는 길' 밑에 '가는 길에 들를 곳 찾기'가 늘 보이고, 누르면 들러 가기가 펼쳐진다
```