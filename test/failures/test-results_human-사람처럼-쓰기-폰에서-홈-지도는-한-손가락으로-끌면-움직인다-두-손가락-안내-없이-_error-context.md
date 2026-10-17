# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 폰에서 홈 지도는 한 손가락으로 끌면 움직인다 (두 손가락 안내 없이)
- Location: tests/human.spec.ts:434:3

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "128.480,36.022"

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - img "보라핀 로고" [ref=e6]
          - text: 보라핀
        - generic [ref=e10]:
          - link "보라에게 물어봐" [ref=e11] [cursor=pointer]:
            - /url: /ask
          - link "우리 공간" [ref=e14] [cursor=pointer]:
            - /url: /space
            - generic "보라 · 영상 · mail.bora" [ref=e15]:
              - generic [ref=e16]: 보
              - generic [ref=e17]: 영
              - generic [ref=e18]: m
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: 보라 · 영상 외 1명의 지도
          - generic [ref=e22]: 7번의 여행, 핀 7개
        - link "다가오는 여행 삼척시 여행 D-7 · 삼척시 준비물 목록을 아직 안 만들었어요 · 2026.10.24–25 준비물 보기" [ref=e23] [cursor=pointer]:
          - /url: /trips/U4eps5fjABrJKSi9LYEw
          - generic [ref=e24]:
            - generic [ref=e25]: 다가오는 여행
            - generic [ref=e26]: 삼척시 여행
            - generic [ref=e27]: D-7 · 삼척시
            - generic [ref=e28]: 준비물 목록을 아직 안 만들었어요 · 2026.10.24–25
            - generic [ref=e29]: 준비물 보기
        - generic [ref=e32]:
          - generic [ref=e33]:
            - tablist [ref=e34]:
              - tab "국내" [selected] [ref=e35] [cursor=pointer]
              - tab "세계" [ref=e36] [cursor=pointer]
            - link "지도 크게 보기" [ref=e37] [cursor=pointer]:
              - /url: /map
          - generic [ref=e38]:
            - generic [ref=e39]:
              - generic:
                - region "Map" [ref=e40]
                - generic [aria-hidden]:
                  - generic: 두 손가락으로 움직여 주세요
                - generic: 동해
                - generic: 서해
                - generic: 남해
                - generic: "1"
                - generic: "1"
                - generic:
                  - generic "우리 장소 2곳": "2"
                - generic:
                  - generic "우리 장소 1곳": "1"
            - generic [aria-hidden]:
              - generic: 칠곡군
              - generic: 대구
              - generic: 상주시
              - generic: 김천시
              - generic: 영천시
              - generic: 구미시
              - generic: 경산시
              - generic: 의성군
              - generic: 합천군
              - generic: 거창군
              - generic: 청도군
              - generic: 성주군
              - generic: 고령군
            - generic [ref=e41]:
              - button "확대" [ref=e42] [cursor=pointer]
              - separator [ref=e45]
              - button "축소" [ref=e46] [cursor=pointer]
              - separator [ref=e48]
              - button "전체 보기" [ref=e49] [cursor=pointer]
          - generic [ref=e52]: 지역을 누르면 바로 핀을 꽂을 수 있어요⛶ 를 누르면 전국이 보여요
          - generic [ref=e53]:
            - generic [ref=e54]:
              - text: "6"
              - generic [ref=e55]: 다녀온 시·군
            - generic [ref=e56]:
              - text: "1"
              - generic [ref=e57]: 해외 나라
            - generic [ref=e58]:
              - text: "7"
              - generic [ref=e59]: 여행·나들이
            - generic [ref=e60]:
              - text: "2"
              - generic [ref=e61]: 예정
        - textbox "보라에게 물어봐" [ref=e63]:
          - /placeholder: "보라에게 물어봐: 강릉 맛집, 11월 축제"
        - generic [ref=e64]:
          - generic [ref=e65]: 다가오는 여행
          - link "예정 제주 여행 제주 · 2026년쯤 예정" [ref=e67] [cursor=pointer]:
            - /url: /trips/2vauibi8UWkhPlZVQ94b
            - generic [ref=e68]: 예정
            - generic [ref=e70]:
              - generic [ref=e71]: 제주 여행
              - generic [ref=e72]: 제주 · 2026년쯤
              - generic [ref=e73]: 예정
        - generic [ref=e75]:
          - generic [ref=e76]:
            - heading "다음 여행 준비" [level=2] [ref=e77]
            - link "가고 싶은 곳 3곳" [ref=e78] [cursor=pointer]:
              - /url: /wishes
          - generic [ref=e79]:
            - link "다음 여행 제주 여행 2026년쯤" [ref=e80] [cursor=pointer]:
              - /url: /trips/2vauibi8UWkhPlZVQ94b
              - generic [ref=e81]:
                - generic [ref=e82]: 다음 여행
                - generic [ref=e83]: 제주 여행
                - generic [ref=e84]: 2026년쯤
            - generic [ref=e87]:
              - link "강원 영월군 그다음은 여기 · 영상" [ref=e88] [cursor=pointer]:
                - /url: /wishes/M1EexaHPVfqW7DPp4dbB
                - generic [ref=e89]: 강원 영월군
                - generic [ref=e90]: 그다음은 여기 · 영상
              - link "경남 남해군 영상" [ref=e91] [cursor=pointer]:
                - /url: /wishes/V53JAQ6q2ZdmOGC6dBWR
                - generic [ref=e92]: 경남 남해군
                - generic [ref=e93]: 영상
          - generic [ref=e94]:
            - generic [ref=e95]: 오늘의 한 질문
            - paragraph [ref=e96]: 제주 가는 길에 들렀다 가고 싶은 곳은?
            - generic [ref=e97]:
              - generic [ref=e98]:
                - generic [ref=e99]: 나
                - generic [ref=e100]: 흑돼지랑 고기국수
                - button "메모에 넣기" [ref=e101] [cursor=pointer]
              - generic [ref=e102]: 상대가 답하면 서로의 답이 열려요
          - link "오늘의 영어 How long is the boat tour? 보트 투어는 얼마나 걸려요? 시작하기 · 3문장 · 90초" [ref=e106] [cursor=pointer]:
            - /url: /study
            - generic [ref=e107]: 오늘의 영어
            - generic [ref=e108]: How long is the boat tour?
            - generic [ref=e109]: 보트 투어는 얼마나 걸려요?
            - generic [ref=e110]: 시작하기 · 3문장 · 90초
          - generic [ref=e111]:
            - generic [ref=e112]: 제주 가는 길
            - generic [ref=e113]:
              - button "가기 좋은 때 5·6, 9~11월 · 덥지도 춥지도 않아요" [ref=e114] [cursor=pointer]
              - button "가는 길 제주공항 15km" [ref=e118] [cursor=pointer]
        - group [ref=e122]:
          - generic "이달의 추천 · 가고 싶은 곳 · 추억" [ref=e123] [cursor=pointer]
        - generic [ref=e127]:
          - generic [ref=e128]:
            - heading "최근에 남긴 기록" [level=2] [ref=e129]
            - link "전체 보기" [ref=e130] [cursor=pointer]:
              - /url: /trips
          - generic [ref=e131]:
            - link "경북 칠곡군 여행 경북 칠곡군 · 날짜 모름" [ref=e132] [cursor=pointer]:
              - /url: /trips/Nj5DVaQnA3tjCa6e5IVF
              - generic [ref=e133]: 경북
              - generic [ref=e134]:
                - generic [ref=e135]: 칠곡군 여행
                - generic [ref=e136]: 경북 칠곡군 · 날짜 모름
            - link "단양 끌어다 놓기 여행 충북 단양군 · 날짜 모름" [ref=e137] [cursor=pointer]:
              - /url: /trips/Vd8vOfC9mzwHO2gk9qUz
              - generic [ref=e139]:
                - generic [ref=e140]: 단양 끌어다 놓기 여행
                - generic [ref=e141]: 충북 단양군 · 날짜 모름
            - link "전주시 여행 전북 전주시 · 날짜 모름" [ref=e142] [cursor=pointer]:
              - /url: /trips/5wgxbGWZUCPznreRuL5g
              - generic [ref=e144]:
                - generic [ref=e145]: 전주시 여행
                - generic [ref=e146]: 전북 전주시 · 날짜 모름
      - navigation "주 메뉴" [ref=e147]:
        - link "홈" [ref=e148] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=e151] [cursor=pointer]:
          - /url: /trips
        - button "기록하기" [ref=e154] [cursor=pointer]
        - link "지도" [ref=e157] [cursor=pointer]:
          - /url: /map
        - link "새 소식 2개 피드" [ref=e160] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 2개" [ref=e164]
          - text: 피드
      - link "보라에게 물어봐" [ref=e165] [cursor=pointer]:
        - /url: /ask
    - status
  - iframe [aria-hidden] [ref=e166]
```

# Test source

```ts
  348 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  349 |     await page.getByLabel('어디 검색').fill('칠곡');
  350 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  351 |     await page.getByTestId('place-save').click();
  352 |     // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
  353 |     await expect(page.getByRole('status')).toContainText('장소를 남겼어요');
  354 |     await page.goto('/');
  355 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  356 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
  357 |     await expect(spot).toHaveCount(1);
  358 |     await expect(spot).toContainText('1');
  359 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  360 |     await expect(page.getByTestId('headline')).toHaveText(before);
  361 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  362 |     await page.goto('/places/new');
  363 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  364 |     await page.getByLabel('어디 검색').fill('칠곡');
  365 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  366 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  367 |     await page.getByTestId('place-save').click();
  368 |     await expect(page.getByRole('status')).toContainText('장소를 남기고 핀도 꽂았어요');
  369 |     await page.goto('/');
  370 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  371 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  372 |     await page.context().close();
  373 |   });
  374 | 
  375 |   test('가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 가운데로 나란히', async ({ browser }) => {
  376 |     const page = await phone(browser);
  377 |     // 긴 이름의 '지금 축제'를 제주에 하나 넣어 둔다 (실제 축제 자료는 매주 바뀌므로)
  378 |     const d = new Date(); const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  379 |     const s = new Date(d); s.setDate(d.getDate() - 1); const e = new Date(d); e.setDate(d.getDate() + 5);
  380 |     await page.route('**/data/festivals.json', (r) => r.fulfill({ json: { updated: ymd(d), source: '시험', cells: { '51750': [{ t: '영월 단종문화제 한마당 큰잔치 거리 퍼레이드', s: ymd(s), e: ymd(e), id: 'x' }] } } }));
  381 |     await signIn(page);
  382 |     // 영월을 가고 싶은 곳에 담는다 (다른 시험이 건드리지 않는 곳)
  383 |     await page.goto('/wishes/new?place=kr:51750');
  384 |     // 둘 다 원해요 + 1순위로 담아 홈 세 줄 안에 들게
  385 |     const chips = page.locator('.heart-chip');
  386 |     for (let i = 0; i < (await chips.count()); i++) {
  387 |       if ((await chips.nth(i).getAttribute('aria-pressed')) !== 'true') await chips.nth(i).click();
  388 |       await expect(chips.nth(i)).toHaveAttribute('aria-pressed', 'true');
  389 |     }
  390 |     await page.getByRole('button', { name: '1순위', exact: true }).click();
  391 |     await page.getByTestId('wish-save').click();
  392 |     await expect(page).not.toHaveURL(/wishes\/new/);
  393 |     // 홈 '다음 여행 준비'에 영월이 올라오고(예정 여행이 없을 때), 카드 모양은 가고 싶은 곳 목록에서 본다
  394 |     await page.goto('/');
  395 |     const hub = page.getByTestId('next-hub');
  396 |     if (await hub.isVisible() && (await hub.getAttribute('data-anchor')) === 'wish') await expect(hub.getByTestId('hub-first')).toContainText('영월');
  397 |     await page.goto('/wishes');
  398 |     // 축제 꼬리표는 한 줄, 오른쪽 단추(여행 만들기 또는 나도 원해요 하트)는 카드 안에
  399 |     const card = page.getByTestId('wish-card').filter({ hasText: '영월' }).first();
  400 |     await expect(card).toBeVisible();
  401 |     const tag = card.getByTestId('wish-festival');
  402 |     await expect(tag).toBeVisible();
  403 |     const tagBox = (await tag.boundingBox())!;
  404 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  405 |     const box = (await card.boundingBox())!;
  406 |     const cta = card.getByTestId('wish-plan').or(card.getByTestId('wish-heart')).first();
  407 |     await expect(cta).toBeVisible();
  408 |     const btn = (await cta.boundingBox())!;
  409 |     expect(btn.x + btn.width, '단추가 카드 밖으로 나가면 안 돼요').toBeLessThanOrEqual(box.x + box.width + 1);
  410 |     expect(tagBox.x + tagBox.width, '꼬리표가 단추와 겹치면 안 돼요').toBeLessThanOrEqual(btn.x + 1);
  411 |     await expect(card.locator('.t')).toContainText('영월');
  412 |     await page.context().close();
  413 |   });
  414 | 
  415 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  416 |     const page = await phone(browser);
  417 |     await signIn(page);
  418 |     const fab = page.getByTestId('ask-fab');
  419 |     await expect(fab).toBeVisible();
  420 |     await expect(fab).toBeInViewport({ ratio: 1 });
  421 |     // 아래 메뉴와 겹치지 않는다
  422 |     const f = (await fab.boundingBox())!;
  423 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  424 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  425 |     await fab.click();
  426 |     await expect(page).toHaveURL(/\/ask/);
  427 |     await expect(page.getByText('보라에게 물어봐')).toBeVisible();
  428 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  429 |     await page.goto('/map');
  430 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  431 |     await page.context().close();
  432 |   });
  433 | 
  434 |   test('폰에서 홈 지도는 한 손가락으로 끌면 움직인다 (두 손가락 안내 없이)', async ({ browser }) => {
  435 |     const page = await phone(browser);
  436 |     await signIn(page);
  437 |     const map = page.getByTestId('map').first();
  438 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  439 |     await map.scrollIntoViewIfNeeded();
  440 |     await page.waitForTimeout(800);
  441 |     const before = await map.getAttribute('data-center');
  442 |     const box = (await map.boundingBox())!;
  443 |     const cdp = await page.context().newCDPSession(page);
  444 |     const x = box.x + box.width / 2, y = box.y + box.height / 2;
  445 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  446 |     for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 12, y: y - i * 6 }] });
  447 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
> 448 |     await expect.poll(async () => map.getAttribute('data-center'), { timeout: 5000 }).not.toBe(before);
      |                                                                                           ^ Error: expect(received).not.toBe(expected) // Object.is equality
  449 |     await expect(page.getByText('두 손가락으로 움직여 주세요')).toBeHidden();
  450 |     await page.context().close();
  451 |   });
  452 | 
  453 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  454 |     const page = await phone(browser);
  455 |     await signIn(page);
  456 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  457 |     await page.goto('/record');
  458 |     await page.getByLabel('어디 검색').fill('고흥');
  459 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  460 |     await page.getByRole('button', { name: '몰라요' }).click();
  461 |     await page.getByTestId('save').click();
  462 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  463 |     await page.goto('/');
  464 |     const map = page.getByTestId('map').first();
  465 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  466 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  467 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  468 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  469 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  470 |     await page.getByRole('button', { name: '전체 보기' }).click();
  471 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  472 |     await page.context().close();
  473 |   });
  474 | 
  475 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  476 |     const page = await phone(browser);
  477 |     await signIn(page);
  478 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  479 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  480 |     await page.goto('/record?status=planned');
  481 |     await page.getByLabel('어디 검색').fill('속초');
  482 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  483 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  484 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  485 |     await page.getByLabel('시작 날짜').fill(ymd);
  486 |     await page.getByTestId('save').click();
  487 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  488 |     await page.goto('/');
  489 |     const card = page.getByTestId('stage-card');
  490 |     await expect(card).toHaveAttribute('data-stage', 'before');
  491 |     await expect(card).toContainText('속초 단풍 여행');
  492 |     await expect(card).toContainText('D-5');
  493 |     await expect(card).toContainText('준비물');
  494 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  495 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  496 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  497 |     const more = page.getByTestId('home-more');
  498 |     await expect(more).toBeVisible();
  499 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  500 |     await more.locator('summary').click();
  501 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  502 |     await card.click();
  503 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  504 |     await page.context().close();
  505 |   });
  506 | 
  507 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  508 |     const page = await phone(browser);
  509 |     await signIn(page);
  510 |     await page.goto('/record');
  511 |     await page.getByLabel('어디 검색').fill('여수');
  512 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  513 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  514 |     await page.getByRole('button', { name: '몰라요' }).click();
  515 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  516 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  517 |     await page.getByTestId('save').click();
  518 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  519 |     await expect(page).toHaveURL(/tab=photos/);
  520 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  521 |     // 사진 탭 아래에 남은 공간 안내
  522 |     await expect(page.getByTestId('photo-space')).toContainText(/약 [\d,]+장 더 올릴 수 있어요/);
  523 |     await page.context().close();
  524 |   });
  525 | 
  526 |   test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
  527 |     const page = await phone(browser);
  528 |     await signIn(page);
  529 |     await page.goto('/feed');
  530 |     const sel = page.getByLabel('사진을 올릴 여행');
  531 |     await expect(sel).toBeVisible();
  532 |     const value = await sel.locator('option', { hasText: '여수 밤바다 사진' }).first().getAttribute('value');
  533 |     await sel.selectOption(value!);
  534 |     await page.getByTestId('quick-upload-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg', 'tests/fixtures/photo-gangneung.jpg']);
  535 |     await expect(page.getByRole('status')).toContainText('사진 2장을 올렸어요', { timeout: 60_000 });
  536 |     const first = page.getByTestId('feed-item').first();
  537 |     await expect(first).toHaveAttribute('data-kind', 'photos');
  538 |     await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
  539 |     await page.context().close();
  540 |   });
  541 | 
  542 |   test('오늘의 영어: 새 문장 3개가 뜨고, 외웠어요를 누르면 연속 학습일이 1이 되고, 고르기 퀴즈가 돈다', async ({ browser }) => {
  543 |     const page = await phone(browser);
  544 |     await signIn(page);
  545 |     await page.goto('/study');
  546 |     await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
  547 |     await page.getByTestId('study-know').first().click();
  548 |     await expect(page.getByRole('status')).toContainText('외웠어요');
```