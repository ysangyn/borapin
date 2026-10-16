# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다
- Location: tests/human.spec.ts:482:3

# Error details

```
Error: locator.selectOption: options[0].label: expected string, got object
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e4]:
        - heading "피드" [level=1] [ref=f2e6]
        - link "추억 돌아보기" [ref=f2e7] [cursor=pointer]:
          - /url: /memories
      - generic [ref=f2e8]:
        - generic [ref=f2e9]:
          - combobox "사진을 올릴 여행" [ref=f2e10]:
            - option "여수 밤바다 사진 · 날짜 모름" [selected]
            - option "고흥군 여행 · 날짜 모름"
            - option "칠곡군 여행 · 날짜 모름"
            - option "단양 끌어다 놓기 여행 · 날짜 모름"
            - option "전주시 여행 · 날짜 모름"
            - option "경주 첫 벚꽃 여행 · 2024년쯤"
            - option "보라의 통영 나들이 · 날짜 모름"
            - option "부산 여행 · 날짜 모름"
            - option "속초 단풍 여행 · 2026.10.21"
          - button "사진 올리기" [ref=f2e11] [cursor=pointer]
        - list [ref=f2e14]:
          - listitem [ref=f2e15]:
            - article [ref=f2e16]:
              - generic [ref=f2e17]:
                - generic [ref=f2e18]:
                  - generic [aria-hidden] [ref=f2e19]: 영
                  - generic [ref=f2e20]: 나
                - generic [ref=f2e21]: 여수 밤바다 사진에 사진 1장
                - generic [ref=f2e22]: 방금
              - button "사진 1 크게 보기" [ref=f2e24] [cursor=pointer]
              - link "여행 보기" [ref=f2e25] [cursor=pointer]:
                - /url: /trips/oSJhZJSZpuGGIjqy3kI4
          - listitem [ref=f2e26]:
            - article [ref=f2e27]:
              - generic [ref=f2e28]:
                - generic [ref=f2e29]:
                  - generic [aria-hidden] [ref=f2e30]: 영
                  - generic [ref=f2e31]: 나
                - generic [ref=f2e32]: 핀을 꽂음
                - generic [ref=f2e33]: 방금
              - paragraph [ref=f2e34]:
                - text: 여수 밤바다 사진
                - generic [ref=f2e35]: · 여수시
              - link "여행 보기" [ref=f2e36] [cursor=pointer]:
                - /url: /trips/oSJhZJSZpuGGIjqy3kI4
          - listitem [ref=f2e37]:
            - article [ref=f2e38]:
              - generic [ref=f2e39]:
                - generic [ref=f2e40]:
                  - generic [aria-hidden] [ref=f2e41]: 영
                  - generic [ref=f2e42]: 나
                - generic [ref=f2e43]: 여행 계획을 만듦
                - generic [ref=f2e44]: 방금
              - paragraph [ref=f2e45]:
                - text: 속초 단풍 여행
                - generic [ref=f2e46]: · 속초시
              - link "여행 보기" [ref=f2e47] [cursor=pointer]:
                - /url: /trips/BVFOgbueliuU4umntIO4
          - listitem [ref=f2e48]:
            - article [ref=f2e49]:
              - generic [ref=f2e50]:
                - generic [ref=f2e51]:
                  - generic [aria-hidden] [ref=f2e52]: 영
                  - generic [ref=f2e53]: 나
                - generic [ref=f2e54]: 핀을 꽂음
                - generic [ref=f2e55]: 방금
              - paragraph [ref=f2e56]:
                - text: 고흥군 여행
                - generic [ref=f2e57]: · 고흥군
              - link "여행 보기" [ref=f2e58] [cursor=pointer]:
                - /url: /trips/qSZSiU35BFk0o28XArWJ
          - listitem [ref=f2e59]:
            - article [ref=f2e60]:
              - generic [ref=f2e61]:
                - generic [ref=f2e62]:
                  - generic [aria-hidden] [ref=f2e63]: 영
                  - generic [ref=f2e64]: 나
                - generic [ref=f2e65]: 가고 싶은 곳에 담음
                - generic [ref=f2e66]: 방금
              - paragraph [ref=f2e67]: 강원 영월군
              - link "보기" [ref=f2e68] [cursor=pointer]:
                - /url: /wishes/lxU5aacgDLhEQpRpDsPS
          - listitem [ref=f2e69]:
            - article [ref=f2e70]:
              - generic [ref=f2e71]:
                - generic [ref=f2e72]:
                  - generic [aria-hidden] [ref=f2e73]: 영
                  - generic [ref=f2e74]: 나
                - generic [ref=f2e75]: 칠곡군에 맛집 남김
                - generic [ref=f2e76]: 방금
              - paragraph [ref=f2e77]: 칠곡 가산수피아
              - link "장소 보기" [ref=f2e78] [cursor=pointer]:
                - /url: /places/12J27rwAzC8AiSg21OpC
          - listitem [ref=f2e79]:
            - article [ref=f2e80]:
              - generic [ref=f2e81]:
                - generic [ref=f2e82]:
                  - generic [aria-hidden] [ref=f2e83]: 영
                  - generic [ref=f2e84]: 나
                - generic [ref=f2e85]: 핀을 꽂음
                - generic [ref=f2e86]: 방금
              - paragraph [ref=f2e87]:
                - text: 칠곡군 여행
                - generic [ref=f2e88]: · 칠곡군
              - link "여행 보기" [ref=f2e89] [cursor=pointer]:
                - /url: /trips/pqYmnkNTmI6CTkjdn1jo
          - listitem [ref=f2e90]:
            - article [ref=f2e91]:
              - generic [ref=f2e92]:
                - generic [ref=f2e93]:
                  - generic [aria-hidden] [ref=f2e94]: 영
                  - generic [ref=f2e95]: 나
                - generic [ref=f2e96]: 칠곡군에 맛집 남김
                - generic [ref=f2e97]: 방금
              - paragraph [ref=f2e98]: 칠곡 호국평화기념관
              - link "장소 보기" [ref=f2e99] [cursor=pointer]:
                - /url: /places/1RnbmUtlszwgBIUbC5VB
          - listitem [ref=f2e100]:
            - article [ref=f2e101]:
              - generic [ref=f2e102]:
                - generic [ref=f2e103]:
                  - generic [aria-hidden] [ref=f2e104]: 영
                  - generic [ref=f2e105]: 나
                - generic [ref=f2e106]: 가고 싶은 곳에 담음
                - generic [ref=f2e107]: 방금
              - paragraph [ref=f2e108]: 경남 남해군
              - link "보기" [ref=f2e109] [cursor=pointer]:
                - /url: /wishes/K616BTLeTNc6rbDNrmJ0
          - listitem [ref=f2e110]:
            - article [ref=f2e111]:
              - generic [ref=f2e112]:
                - generic [ref=f2e113]:
                  - generic [aria-hidden] [ref=f2e114]: 영
                  - generic [ref=f2e115]: 나
                - generic [ref=f2e116]: 단양 끌어다 놓기 여행에 사진 1장
                - generic [ref=f2e117]: 방금
              - button "사진 1 크게 보기" [ref=f2e119] [cursor=pointer]
              - link "여행 보기" [ref=f2e120] [cursor=pointer]:
                - /url: /trips/q6aRJignnRYqIDph6CuB
          - listitem [ref=f2e121]:
            - article [ref=f2e122]:
              - generic [ref=f2e123]:
                - generic [ref=f2e124]:
                  - generic [aria-hidden] [ref=f2e125]: 영
                  - generic [ref=f2e126]: 나
                - generic [ref=f2e127]: 핀을 꽂음
                - generic [ref=f2e128]: 방금
              - paragraph [ref=f2e129]:
                - text: 단양 끌어다 놓기 여행
                - generic [ref=f2e130]: · 단양군
              - link "여행 보기" [ref=f2e131] [cursor=pointer]:
                - /url: /trips/q6aRJignnRYqIDph6CuB
          - listitem [ref=f2e132]:
            - article [ref=f2e133]:
              - generic [ref=f2e134]:
                - generic [ref=f2e135]:
                  - generic [aria-hidden] [ref=f2e136]: 영
                  - generic [ref=f2e137]: 나
                - generic [ref=f2e138]: 핀을 꽂음
                - generic [ref=f2e139]: 방금
              - paragraph [ref=f2e140]:
                - text: 전주시 여행
                - generic [ref=f2e141]: · 전주시
              - link "여행 보기" [ref=f2e142] [cursor=pointer]:
                - /url: /trips/YtP2aUelKFV9I7wSuw83
          - listitem [ref=f2e143]:
            - article [ref=f2e144]:
              - generic [ref=f2e145]:
                - generic [ref=f2e146]:
                  - generic [aria-hidden] [ref=f2e147]: 영
                  - generic [ref=f2e148]: 나
                - generic [ref=f2e149]: 핀을 꽂음
                - generic [ref=f2e150]: 1분 전
              - paragraph [ref=f2e151]:
                - text: 경주 첫 벚꽃 여행
                - generic [ref=f2e152]: · 경주시
              - link "여행 보기" [ref=f2e153] [cursor=pointer]:
                - /url: /trips/hvQgXqE83VgmjhatU3V4
          - listitem [ref=f2e154]:
            - article [ref=f2e155]:
              - generic [ref=f2e156]:
                - generic [ref=f2e157]:
                  - generic [aria-hidden] [ref=f2e158]: 보
                  - generic [ref=f2e159]: 보라
                - generic [ref=f2e160]: 핀을 꽂음
                - generic [ref=f2e161]: 1분 전
              - paragraph [ref=f2e162]:
                - text: 보라의 통영 나들이
                - generic [ref=f2e163]: · 통영시
              - link "여행 보기" [ref=f2e164] [cursor=pointer]:
                - /url: /trips/vwrNEsDr4YxZAT8pwxTb
          - listitem [ref=f2e165]:
            - article [ref=f2e166]:
              - generic [ref=f2e167]:
                - generic [ref=f2e168]:
                  - generic [aria-hidden] [ref=f2e169]: 영
                  - generic [ref=f2e170]: 나
                - generic [ref=f2e171]: 강릉시에 맛집 남김
                - generic [ref=f2e172]: 2분 전
              - paragraph [ref=f2e173]:
                - text: 초당할머니순두부
                - generic [ref=f2e174]: 또 갈래요
                - generic [ref=f2e175]: · “순두부 젤라또까지 완벽”
              - link "장소 보기" [ref=f2e176] [cursor=pointer]:
                - /url: /places/xB1UKowCdT0C8y0sT5rp
          - listitem [ref=f2e177]:
            - article [ref=f2e178]:
              - generic [ref=f2e179]:
                - generic [ref=f2e180]:
                  - generic [aria-hidden] [ref=f2e181]: 영
                  - generic [ref=f2e182]: 나
                - generic [ref=f2e183]: 가고 싶은 곳에 담음
                - generic [ref=f2e184]: 2분 전
              - paragraph [ref=f2e185]: 강원 동해시
              - link "보기" [ref=f2e186] [cursor=pointer]:
                - /url: /wishes/UqNi68GUmc9INGOecCwS
          - listitem [ref=f2e187]:
            - article [ref=f2e188]:
              - generic [ref=f2e189]:
                - generic [ref=f2e190]:
                  - generic [aria-hidden] [ref=f2e191]: 영
                  - generic [ref=f2e192]: 나
                - generic [ref=f2e193]: 여행 계획을 만듦
                - generic [ref=f2e194]: 2분 전
              - paragraph [ref=f2e195]:
                - text: 제주 여행
                - generic [ref=f2e196]: · 제주
              - link "여행 보기" [ref=f2e197] [cursor=pointer]:
                - /url: /trips/HTg8dId6nZXS2IWrgd52
          - listitem [ref=f2e198]:
            - article [ref=f2e199]:
              - generic [ref=f2e200]:
                - generic [ref=f2e201]:
                  - generic [aria-hidden] [ref=f2e202]: 영
                  - generic [ref=f2e203]: 나
                - generic [ref=f2e204]: 가고 싶은 곳에 담음
                - generic [ref=f2e205]: 2분 전
              - paragraph [ref=f2e206]: 제주
              - link "보기" [ref=f2e207] [cursor=pointer]:
                - /url: /wishes/30XdZH9C112bCLO5IgKL
          - listitem [ref=f2e208]:
            - article [ref=f2e209]:
              - generic [ref=f2e210]:
                - generic [ref=f2e211]:
                  - generic [aria-hidden] [ref=f2e212]: 영
                  - generic [ref=f2e213]: 나
                - generic [ref=f2e214]: 핀을 꽂음
                - generic [ref=f2e215]: 2분 전
              - paragraph [ref=f2e216]:
                - text: 부산 여행
                - generic [ref=f2e217]: · 부산
              - link "여행 보기" [ref=f2e218] [cursor=pointer]:
                - /url: /trips/VgHGVZ6bH2GZG3KPKwHr
          - listitem [ref=f2e219]:
            - article [ref=f2e220]:
              - generic [ref=f2e221]:
                - generic [ref=f2e222]:
                  - generic [aria-hidden] [ref=f2e223]: 영
                  - generic [ref=f2e224]: 나
                - generic [ref=f2e225]: 핀을 꽂음
                - generic [ref=f2e226]: 3분 전
              - paragraph [ref=f2e227]:
                - text: 교토 단풍 여행
                - generic [ref=f2e228]: · 교토
              - link "여행 보기" [ref=f2e229] [cursor=pointer]:
                - /url: /trips/PnsrQIIR4lA7DDml8acR
      - navigation "주 메뉴" [ref=f2e230]:
        - link "홈" [ref=f2e231] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f2e234] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f2e237] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f2e240] [cursor=pointer]:
          - /url: /map
        - link [ref=f2e243] [cursor=pointer]:
          - /url: /feed
      - link "보라에게 물어봐" [ref=f2e247] [cursor=pointer]:
        - /url: /ask
        - generic [aria-hidden] [ref=f2e248]: 물어봐요
    - status
  - iframe [aria-hidden] [ref=f2e249]
```

# Test source

```ts
  388 |     const tagBox = (await tag.boundingBox())!;
  389 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  390 |     const tile = (await card.locator('.trip-tile').boundingBox())!;
  391 |     const title = (await card.locator('.t').boundingBox())!;
  392 |     const btn = (await card.getByTestId('wish-plan').boundingBox())!;
  393 |     expect(Math.abs(tile.y - title.y), '네모가 제목과 같은 높이에서 시작해야 해요').toBeLessThan(10);
  394 |     expect(Math.abs(btn.y - title.y), '버튼이 제목과 같은 높이에서 시작해야 해요').toBeLessThan(14);
  395 |     await page.context().close();
  396 |   });
  397 | 
  398 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  399 |     const page = await phone(browser);
  400 |     await signIn(page);
  401 |     const fab = page.getByTestId('ask-fab');
  402 |     await expect(fab).toBeVisible();
  403 |     await expect(fab).toBeInViewport({ ratio: 1 });
  404 |     // 아래 메뉴와 겹치지 않는다
  405 |     const f = (await fab.boundingBox())!;
  406 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  407 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  408 |     await fab.click();
  409 |     await expect(page).toHaveURL(/\/ask/);
  410 |     await expect(page.getByText('보라에게 물어봐')).toBeVisible();
  411 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  412 |     await page.goto('/map');
  413 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  414 |     await page.context().close();
  415 |   });
  416 | 
  417 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  418 |     const page = await phone(browser);
  419 |     await signIn(page);
  420 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  421 |     await page.goto('/record');
  422 |     await page.getByLabel('어디 검색').fill('고흥');
  423 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  424 |     await page.getByRole('button', { name: '몰라요' }).click();
  425 |     await page.getByTestId('save').click();
  426 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  427 |     await page.goto('/');
  428 |     const map = page.getByTestId('map').first();
  429 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  430 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  431 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  432 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  433 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  434 |     await page.getByRole('button', { name: '전체 보기' }).click();
  435 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  436 |     await page.context().close();
  437 |   });
  438 | 
  439 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  440 |     const page = await phone(browser);
  441 |     await signIn(page);
  442 |     const d = new Date(); d.setDate(d.getDate() + 5);
  443 |     const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  444 |     await page.goto('/record?status=planned');
  445 |     await page.getByLabel('어디 검색').fill('속초');
  446 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  447 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  448 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  449 |     await page.getByLabel('시작 날짜').fill(ymd);
  450 |     await page.getByTestId('save').click();
  451 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  452 |     await page.goto('/');
  453 |     const card = page.getByTestId('stage-card');
  454 |     await expect(card).toHaveAttribute('data-stage', 'before');
  455 |     await expect(card).toContainText('속초 단풍 여행');
  456 |     await expect(card).toContainText('D-5');
  457 |     await expect(card).toContainText('준비물');
  458 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  459 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  460 |     await card.click();
  461 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  462 |     await page.context().close();
  463 |   });
  464 | 
  465 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  466 |     const page = await phone(browser);
  467 |     await signIn(page);
  468 |     await page.goto('/record');
  469 |     await page.getByLabel('어디 검색').fill('여수');
  470 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  471 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  472 |     await page.getByRole('button', { name: '몰라요' }).click();
  473 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  474 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  475 |     await page.getByTestId('save').click();
  476 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  477 |     await expect(page).toHaveURL(/tab=photos/);
  478 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  479 |     await page.context().close();
  480 |   });
  481 | 
  482 |   test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
  483 |     const page = await phone(browser);
  484 |     await signIn(page);
  485 |     await page.goto('/feed');
  486 |     const sel = page.getByLabel('사진을 올릴 여행');
  487 |     await expect(sel).toBeVisible();
> 488 |     await sel.selectOption({ label: /여수 밤바다 사진/ });
      |               ^ Error: locator.selectOption: options[0].label: expected string, got object
  489 |     await page.getByTestId('quick-upload-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg', 'tests/fixtures/photo-gangneung.jpg']);
  490 |     await expect(page.getByRole('status')).toContainText('사진 2장을 올렸어요', { timeout: 60_000 });
  491 |     const first = page.getByTestId('feed-item').first();
  492 |     await expect(first).toHaveAttribute('data-kind', 'photos');
  493 |     await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
  494 |     await page.context().close();
  495 |   });
  496 | 
  497 |   for (const width of [360, 375, 390]) {
  498 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
  499 |       const page = await phone(browser, width, 740);
  500 |       await page.goto('/');
  501 |       const art = page.locator('.login-mascot');
  502 |       await expect(art).toBeVisible();
  503 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  504 |       const a = await art.boundingBox();
  505 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  506 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  507 |         const r = document.createRange();
  508 |         r.selectNodeContents(el);
  509 |         const b = r.getBoundingClientRect();
  510 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  511 |       });
  512 |       const t = await textBox('.login-tag');
  513 |       const b = await textBox('.login-brand');
  514 |       for (const r of [t, b]) {
  515 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  516 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  517 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  518 |       }
  519 |       await page.context().close();
  520 |     });
  521 |   }
  522 | });
  523 | 
```