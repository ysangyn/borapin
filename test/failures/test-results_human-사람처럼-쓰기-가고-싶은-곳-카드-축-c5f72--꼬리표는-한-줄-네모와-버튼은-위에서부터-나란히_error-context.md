# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 위에서부터 나란히
- Location: tests/human.spec.ts:374:3

# Error details

```
Error: 네모가 제목과 같은 높이에서 시작해야 해요

expect(received).toBeLessThan(expected)

Expected: < 10
Received:   17.265625
```

# Page snapshot

```yaml
- generic [active] [ref=f5e1]:
  - generic [ref=f5e2]:
    - generic [ref=f5e3]:
      - generic [ref=f5e4]:
        - generic [ref=f5e5]:
          - button "뒤로" [ref=f5e6] [cursor=pointer]
          - heading "가고 싶은 곳" [level=1] [ref=f5e9]
        - link "담기" [ref=f5e10] [cursor=pointer]:
          - /url: /wishes/new
      - generic [ref=f5e13]:
        - group "걸러 보기" [ref=f5e14]:
          - button "전체 4" [pressed] [ref=f5e15] [cursor=pointer]
          - button "둘 다 원해요 1" [ref=f5e16] [cursor=pointer]
          - button "국내" [ref=f5e17] [cursor=pointer]
          - button "해외" [ref=f5e18] [cursor=pointer]
        - generic [ref=f5e19]:
          - generic [ref=f5e20]:
            - link "제주 가고 싶은 곳 보기" [ref=f5e21] [cursor=pointer]:
              - /url: /wishes/s2ctxLk1UKI3m1nNeISU
              - generic "1순위" [ref=f5e23]: "1"
              - generic [ref=f5e26]:
                - generic [ref=f5e27]: 제주
                - generic [ref=f5e28]:
                  - 'generic "원하는 사람: 영상, 보라" [ref=f5e29]':
                    - generic [ref=f5e30]: 보라
                    - generic [ref=f5e33]: 영상
                  - generic [ref=f5e36]: 둘 다 원해요
                - generic [ref=f5e37]: 가기 좋은 때 5·6, 9~11월
                - generic [ref=f5e39]: 가볼 곳 성산일출봉 외 2
            - link "예정 · 2026년쯤" [ref=f5e40] [cursor=pointer]:
              - /url: /trips/smU27uKk67QdZcfblVCO
          - generic [ref=f5e41]:
            - link "강원 영월군 가고 싶은 곳 보기" [ref=f5e42] [cursor=pointer]:
              - /url: /wishes/KIkwTdoOP1WE8ObzXMvB
              - generic [ref=f5e43]:
                - text: 강원
                - generic "1순위" [ref=f5e44]: "1"
              - generic [ref=f5e47]:
                - generic [ref=f5e48]: 강원 영월군
                - 'generic "원하는 사람: 영상" [ref=f5e50]':
                  - generic [ref=f5e51]: 보라
                  - generic [ref=f5e54]: 영상
                - generic [ref=f5e57]:
                  - generic "영월 단종문화제 한마당 큰잔치 거리 퍼레이드 10.15~21" [ref=f5e58]:
                    - text: 지금 축제 ·
                    - generic [ref=f5e59]: 영월 단종문화제 한마당 큰잔치 거리 퍼레이드
                    - generic [ref=f5e60]: 10.15~21
                  - generic [ref=f5e61]: 가기 좋은 때 4~6, 9·10월
            - link "여행 만들기" [ref=f5e62] [cursor=pointer]:
              - /url: /record?status=planned&place=kr:51750&wish=KIkwTdoOP1WE8ObzXMvB
          - generic [ref=f5e63]:
            - link "경남 남해군 가고 싶은 곳 보기" [ref=f5e64] [cursor=pointer]:
              - /url: /wishes/EHSKxAG4jDDEXYm0IMwY
              - generic [ref=f5e66]:
                - generic [ref=f5e67]: 경남 남해군
                - 'generic "원하는 사람: 영상" [ref=f5e69]':
                  - generic [ref=f5e70]: 보라
                  - generic [ref=f5e73]: 영상
                - generic [ref=f5e76]: 가기 좋은 때 4~6, 10·11월
            - link "여행 만들기" [ref=f5e78] [cursor=pointer]:
              - /url: /record?status=planned&place=kr:48840&wish=EHSKxAG4jDDEXYm0IMwY
          - generic [ref=f5e79]:
            - link "강원 속초시 가고 싶은 곳 보기" [ref=f5e80] [cursor=pointer]:
              - /url: /wishes/b4b7RkoCA2yGrX0Wwot3
              - generic [ref=f5e82]:
                - generic [ref=f5e83]: 강원 속초시
                - 'generic "원하는 사람: 영상" [ref=f5e85]':
                  - generic [ref=f5e86]: 보라
                  - generic [ref=f5e89]: 영상
                - generic [ref=f5e92]: 가기 좋은 때 4~6, 9·10월
            - link "여행 만들기" [ref=f5e94] [cursor=pointer]:
              - /url: /record?status=planned&place=kr:51210&wish=b4b7RkoCA2yGrX0Wwot3
        - generic [ref=f5e95]:
          - heading "가고 싶은 곳 소식" [level=2] [ref=f5e96]
          - generic [ref=f5e97]: 담아 둔 곳의 요즘 여행 뉴스예요. 축제·새 명소 소식이 뜨면 여기서 먼저 봐요.
        - button "여행지 뽑기" [ref=f5e99] [cursor=pointer]
      - navigation "주 메뉴" [ref=f5e102]:
        - link "홈" [ref=f5e103] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f5e106] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f5e109] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f5e112] [cursor=pointer]:
          - /url: /map
        - link [ref=f5e115] [cursor=pointer]:
          - /url: /feed
      - link "보라에게 물어봐" [ref=f5e119] [cursor=pointer]:
        - /url: /ask
        - generic [aria-hidden] [ref=f5e120]: 물어봐요
    - status
  - iframe [aria-hidden] [ref=f5e121]
```

# Test source

```ts
  305 |   });
  306 | 
  307 |   test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
  308 |     const page = await phone(browser);
  309 |     await signIn(page);
  310 |     await page.goto('/places/new');
  311 |     // 네이버지도 입력 칸은 하나뿐
  312 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
  313 |     // 고른 종류에만 눌림·체크 표시
  314 |     const food = page.getByRole('button', { name: '맛집', exact: true });
  315 |     const cafe = page.getByRole('button', { name: '카페', exact: true });
  316 |     await expect(food).toHaveAttribute('aria-pressed', 'true');
  317 |     await expect(food.locator('.chip-check')).toBeVisible();
  318 |     await cafe.click();
  319 |     await expect(cafe).toHaveAttribute('aria-pressed', 'true');
  320 |     await expect(food).toHaveAttribute('aria-pressed', 'false');
  321 |     await expect(food.locator('.chip-check')).toHaveCount(0);
  322 |     const again = page.getByRole('button', { name: '또 갈래요', exact: true });
  323 |     await again.click();
  324 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  325 |     await expect(again.locator('.chip-check')).toBeVisible();
  326 |     // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
  327 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
  328 |     await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
  329 |     await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
  330 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
  331 |     await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
  332 |     // 링크를 빼면 다시 붙여 넣을 수 있다
  333 |     await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
  334 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  335 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  336 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  337 |     await page.context().close();
  338 |   });
  339 | 
  340 |   test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
  341 |     const page = await phone(browser);
  342 |     await signIn(page);
  343 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  344 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  345 |     // 여행 없이 장소만 (칠곡)
  346 |     await page.goto('/places/new');
  347 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  348 |     await page.getByLabel('어디 검색').fill('칠곡');
  349 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  350 |     await page.getByTestId('place-save').click();
  351 |     // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
  352 |     await expect(page.getByRole('status')).toContainText('장소를 남겼어요');
  353 |     await page.goto('/');
  354 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  355 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
  356 |     await expect(spot).toHaveCount(1);
  357 |     await expect(spot).toContainText('1');
  358 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  359 |     await expect(page.getByTestId('headline')).toHaveText(before);
  360 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  361 |     await page.goto('/places/new');
  362 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  363 |     await page.getByLabel('어디 검색').fill('칠곡');
  364 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  365 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  366 |     await page.getByTestId('place-save').click();
  367 |     await expect(page.getByRole('status')).toContainText('장소를 남기고 핀도 꽂았어요');
  368 |     await page.goto('/');
  369 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  370 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  371 |     await page.context().close();
  372 |   });
  373 | 
  374 |   test('가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 위에서부터 나란히', async ({ browser }) => {
  375 |     const page = await phone(browser);
  376 |     // 긴 이름의 '지금 축제'를 제주에 하나 넣어 둔다 (실제 축제 자료는 매주 바뀌므로)
  377 |     const d = new Date(); const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  378 |     const s = new Date(d); s.setDate(d.getDate() - 1); const e = new Date(d); e.setDate(d.getDate() + 5);
  379 |     await page.route('**/data/festivals.json', (r) => r.fulfill({ json: { updated: ymd(d), source: '시험', cells: { '51750': [{ t: '영월 단종문화제 한마당 큰잔치 거리 퍼레이드', s: ymd(s), e: ymd(e), id: 'x' }] } } }));
  380 |     await signIn(page);
  381 |     // 영월을 가고 싶은 곳에 담는다 (다른 시험이 건드리지 않는 곳)
  382 |     await page.goto('/wishes/new?place=kr:51750');
  383 |     // 둘 다 원해요 + 1순위로 담아 홈 세 줄 안에 들게
  384 |     const chips = page.locator('.heart-chip');
  385 |     for (let i = 0; i < (await chips.count()); i++) {
  386 |       if ((await chips.nth(i).getAttribute('aria-pressed')) !== 'true') await chips.nth(i).click();
  387 |     }
  388 |     await page.getByRole('button', { name: '1순위', exact: true }).click();
  389 |     await page.getByTestId('wish-save').click();
  390 |     await expect(page).not.toHaveURL(/wishes\/new/);
  391 |     // 홈 '다음 여행 준비'에 영월이 올라오고(예정 여행이 없을 때), 카드 모양은 가고 싶은 곳 목록에서 본다
  392 |     await page.goto('/');
  393 |     const hub = page.getByTestId('next-hub');
  394 |     if (await hub.isVisible() && (await hub.getAttribute('data-anchor')) === 'wish') await expect(hub.getByTestId('hub-first')).toContainText('영월');
  395 |     await page.goto('/wishes');
  396 |     const card = page.getByTestId('wish-card').filter({ hasText: '영월' }).first();
  397 |     await expect(card).toBeVisible();
  398 |     const tag = card.getByTestId('wish-festival');
  399 |     await expect(tag).toBeVisible();
  400 |     const tagBox = (await tag.boundingBox())!;
  401 |     expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
  402 |     const tile = (await card.locator('.trip-tile').boundingBox())!;
  403 |     const title = (await card.locator('.t').boundingBox())!;
  404 |     const btn = (await card.getByTestId('wish-plan').boundingBox())!;
> 405 |     expect(Math.abs(tile.y - title.y), '네모가 제목과 같은 높이에서 시작해야 해요').toBeLessThan(10);
      |                                                                   ^ Error: 네모가 제목과 같은 높이에서 시작해야 해요
  406 |     expect(Math.abs(btn.y - title.y), '버튼이 제목과 같은 높이에서 시작해야 해요').toBeLessThan(14);
  407 |     await page.context().close();
  408 |   });
  409 | 
  410 |   test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
  411 |     const page = await phone(browser);
  412 |     await signIn(page);
  413 |     const fab = page.getByTestId('ask-fab');
  414 |     await expect(fab).toBeVisible();
  415 |     await expect(fab).toBeInViewport({ ratio: 1 });
  416 |     // 아래 메뉴와 겹치지 않는다
  417 |     const f = (await fab.boundingBox())!;
  418 |     const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
  419 |     expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
  420 |     await fab.click();
  421 |     await expect(page).toHaveURL(/\/ask/);
  422 |     await expect(page.getByText('보라에게 물어봐')).toBeVisible();
  423 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  424 |     await page.goto('/map');
  425 |     await expect(page.getByTestId('ask-fab')).toHaveCount(0);
  426 |     await page.context().close();
  427 |   });
  428 | 
  429 |   test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
  430 |     const page = await phone(browser);
  431 |     await signIn(page);
  432 |     // 방금 남긴 핀(고흥) 둘레가 보여야 한다
  433 |     await page.goto('/record');
  434 |     await page.getByLabel('어디 검색').fill('고흥');
  435 |     await page.getByRole('option', { name: /고흥군/ }).first().click();
  436 |     await page.getByRole('button', { name: '몰라요' }).click();
  437 |     await page.getByTestId('save').click();
  438 |     await expect(page.getByTestId('trip-title')).toBeVisible();
  439 |     await page.goto('/');
  440 |     const map = page.getByTestId('map').first();
  441 |     await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  442 |     // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
  443 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
  444 |     await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
  445 |     const nearZoom = Number(await map.getAttribute('data-zoom'));
  446 |     await page.getByRole('button', { name: '전체 보기' }).click();
  447 |     await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
  448 |     await page.context().close();
  449 |   });
  450 | 
  451 |   test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
  452 |     const page = await phone(browser);
  453 |     await signIn(page);
  454 |     // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
  455 |     const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  456 |     await page.goto('/record?status=planned');
  457 |     await page.getByLabel('어디 검색').fill('속초');
  458 |     await page.getByRole('option', { name: /속초시/ }).first().click();
  459 |     await page.getByLabel('제목').fill('속초 단풍 여행');
  460 |     await page.getByRole('button', { name: '날짜', exact: true }).click();
  461 |     await page.getByLabel('시작 날짜').fill(ymd);
  462 |     await page.getByTestId('save').click();
  463 |     await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
  464 |     await page.goto('/');
  465 |     const card = page.getByTestId('stage-card');
  466 |     await expect(card).toHaveAttribute('data-stage', 'before');
  467 |     await expect(card).toContainText('속초 단풍 여행');
  468 |     await expect(card).toContainText('D-5');
  469 |     await expect(card).toContainText('준비물');
  470 |     // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
  471 |     await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
  472 |     // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
  473 |     const more = page.getByTestId('home-more');
  474 |     await expect(more).toBeVisible();
  475 |     await expect(page.getByTestId('month-pick')).toBeHidden();
  476 |     await more.locator('summary').click();
  477 |     await expect(page.getByTestId('month-pick')).toBeVisible();
  478 |     await card.click();
  479 |     await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  480 |     await page.context().close();
  481 |   });
  482 | 
  483 |   test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
  484 |     const page = await phone(browser);
  485 |     await signIn(page);
  486 |     await page.goto('/record');
  487 |     await page.getByLabel('어디 검색').fill('여수');
  488 |     await page.getByRole('option', { name: /여수시/ }).first().click();
  489 |     await page.getByLabel('제목').fill('여수 밤바다 사진');
  490 |     await page.getByRole('button', { name: '몰라요' }).click();
  491 |     await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  492 |     await expect(page.locator('.pending-photo')).toHaveCount(1);
  493 |     await page.getByTestId('save').click();
  494 |     await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
  495 |     await expect(page).toHaveURL(/tab=photos/);
  496 |     await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
  497 |     // 사진 탭 아래에 남은 공간 안내
  498 |     await expect(page.getByTestId('photo-space')).toContainText(/약 [\d,]+장 더 올릴 수 있어요/);
  499 |     await page.context().close();
  500 |   });
  501 | 
  502 |   test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
  503 |     const page = await phone(browser);
  504 |     await signIn(page);
  505 |     await page.goto('/feed');
```