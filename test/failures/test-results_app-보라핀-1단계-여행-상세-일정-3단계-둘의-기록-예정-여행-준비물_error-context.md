# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물
- Location: tests/app.spec.ts:342:3

# Error details

```
Error: locator.check: Clicking the checkbox did not change its state
Call log:
  - waiting for getByTestId('packing').getByLabel('수영복 챙김')
    - locator resolved to <input type="checkbox" aria-label="수영복 챙김"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <nav class="nav" aria-label="주 메뉴">…</nav> intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

```

# Page snapshot

```yaml
- generic [ref=f4e1]:
  - generic [ref=f4e3]:
    - generic [ref=f4e4]:
      - generic [ref=f4e5]:
        - button "뒤로" [ref=f4e6] [cursor=pointer]
        - generic [ref=f4e9]: 예정된 여행
      - link "고치기" [ref=f4e10] [cursor=pointer]:
        - /url: /trips/781AVmbX6U1CklsIuXpj/edit
    - generic [ref=f4e13]:
      - generic [ref=f4e14]:
        - generic [ref=f4e15]: 제주 여행
        - generic [ref=f4e16]: 2026년쯤
      - tablist "여행 보기" [ref=f4e17]:
        - tab "개요" [selected] [ref=f4e18] [cursor=pointer]
        - tab "일정" [ref=f4e19] [cursor=pointer]
        - tab "사진" [ref=f4e20] [cursor=pointer]
        - tab "기록" [ref=f4e21] [cursor=pointer]
      - generic [ref=f4e22]:
        - generic [ref=f4e23]:
          - generic:
            - region "Map" [ref=f4e24]
            - generic: 대한해협
            - generic: 동해
            - generic: 서해
            - generic: 남해
        - generic [aria-hidden]:
          - generic: 제주
      - generic [ref=f4e25]:
        - generic [ref=f4e26]:
          - heading "준비물" [level=2] [ref=f4e27]
          - generic [ref=f4e28]: 1/14 챙김
        - generic [ref=f4e29]:
          - checkbox "신분증 챙김" [ref=f4e30]
          - generic [ref=f4e31]: 신분증
          - button "신분증 담당자" [ref=f4e32] [cursor=pointer]: 담당
          - button "신분증 빼기" [ref=f4e33] [cursor=pointer]
        - generic [ref=f4e36]:
          - checkbox "지갑·카드 챙김" [ref=f4e37]
          - generic [ref=f4e38]: 지갑·카드
          - button "지갑·카드 담당자" [ref=f4e39] [cursor=pointer]: 담당
          - button "지갑·카드 빼기" [ref=f4e40] [cursor=pointer]
        - generic [ref=f4e43]:
          - checkbox "휴대폰 충전기 챙김" [ref=f4e44]
          - generic [ref=f4e45]: 휴대폰 충전기
          - button "휴대폰 충전기 담당자" [ref=f4e46] [cursor=pointer]: 담당
          - button "휴대폰 충전기 빼기" [ref=f4e47] [cursor=pointer]
        - generic [ref=f4e50]:
          - checkbox "보조배터리 챙김" [ref=f4e51]
          - generic [ref=f4e52]: 보조배터리
          - button "보조배터리 담당자" [ref=f4e53] [cursor=pointer]: 담당
          - button "보조배터리 빼기" [ref=f4e54] [cursor=pointer]
        - generic [ref=f4e57]:
          - checkbox "상비약 챙김" [ref=f4e58]
          - generic [ref=f4e59]: 상비약
          - button "상비약 담당자" [ref=f4e60] [cursor=pointer]: 담당
          - button "상비약 빼기" [ref=f4e61] [cursor=pointer]
        - generic [ref=f4e64]:
          - checkbox "세면도구 챙김" [ref=f4e65]
          - generic [ref=f4e66]: 세면도구
          - button "세면도구 담당자" [ref=f4e67] [cursor=pointer]: 담당
          - button "세면도구 빼기" [ref=f4e68] [cursor=pointer]
        - generic [ref=f4e71]:
          - checkbox "갈아입을 옷 챙김" [ref=f4e72]
          - generic [ref=f4e73]: 갈아입을 옷
          - button "갈아입을 옷 담당자" [ref=f4e74] [cursor=pointer]: 담당
          - button "갈아입을 옷 빼기" [ref=f4e75] [cursor=pointer]
        - generic [ref=f4e78]:
          - checkbox "잠옷 챙김" [ref=f4e79]
          - generic [ref=f4e80]: 잠옷
          - button "잠옷 담당자" [ref=f4e81] [cursor=pointer]: 담당
          - button "잠옷 빼기" [ref=f4e82] [cursor=pointer]
        - generic [ref=f4e85]:
          - checkbox "수영복 챙김" [checked] [active] [ref=f4e86]
          - generic [ref=f4e87]: 수영복
          - button "수영복 담당자" [ref=f4e88] [cursor=pointer]: 담당
          - button "수영복 빼기" [ref=f4e89] [cursor=pointer]
        - generic [ref=f4e92]:
          - checkbox "선크림 챙김" [ref=f4e93]
          - generic [ref=f4e94]: 선크림
          - button "선크림 담당자" [ref=f4e95] [cursor=pointer]: 담당
          - button "선크림 빼기" [ref=f4e96] [cursor=pointer]
        - generic [ref=f4e99]:
          - checkbox "선글라스 챙김" [ref=f4e100]
          - generic [ref=f4e101]: 선글라스
          - button "선글라스 담당자" [ref=f4e102] [cursor=pointer]: 담당
          - button "선글라스 빼기" [ref=f4e103] [cursor=pointer]
        - generic [ref=f4e106]:
          - checkbox "모자 챙김" [ref=f4e107]
          - generic [ref=f4e108]: 모자
          - button "모자 담당자" [ref=f4e109] [cursor=pointer]: 담당
          - button "모자 빼기" [ref=f4e110] [cursor=pointer]
        - generic [ref=f4e113]:
          - checkbox "비치타월 챙김" [ref=f4e114]
          - generic [ref=f4e115]: 비치타월
          - button "비치타월 담당자" [ref=f4e116] [cursor=pointer]: 담당
          - button "비치타월 빼기" [ref=f4e117] [cursor=pointer]
        - generic [ref=f4e120]:
          - checkbox "샌들 챙김" [ref=f4e121]
          - generic [ref=f4e122]: 샌들
          - button "샌들 담당자" [ref=f4e123] [cursor=pointer]: 담당
          - button "샌들 빼기" [ref=f4e124] [cursor=pointer]
        - generic [ref=f4e127]:
          - textbox "준비물 추가" [ref=f4e128]:
            - /placeholder: 더 챙길 것
          - button "추가" [disabled] [ref=f4e129]
      - generic [ref=f4e130]:
        - generic [ref=f4e131]:
          - generic [ref=f4e132]: 어디
          - generic [ref=f4e134]:
            - generic [ref=f4e135]: 제주
            - link "네이버지도" [ref=f4e136] [cursor=pointer]:
              - /url: https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC
            - link "구글지도" [ref=f4e137] [cursor=pointer]:
              - /url: https://www.google.com/maps/search/?api=1&query=%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC
        - generic [ref=f4e138]:
          - generic [ref=f4e139]: 누구와
          - generic [ref=f4e140]: 보라, 영상
        - generic [ref=f4e141]:
          - generic [ref=f4e142]: 남긴 사람
          - generic [ref=f4e143]: 영상
      - generic [ref=f4e144]:
        - generic [ref=f4e145]:
          - heading "장소" [level=2] [ref=f4e146]
          - link "+ 장소 남기기" [ref=f4e147] [cursor=pointer]:
            - /url: /places/new?trip=781AVmbX6U1CklsIuXpj
        - generic [ref=f4e148]: 기억에 남은 맛집·카페·명소를 둘의 한 줄 평과 함께 남겨 보세요.
      - button "이 기록 지우기" [ref=f4e149] [cursor=pointer]
    - navigation "주 메뉴" [ref=f4e152]:
      - link "홈" [ref=f4e153] [cursor=pointer]:
        - /url: /
      - link "여행" [ref=f4e156] [cursor=pointer]:
        - /url: /trips
      - link "기록하기" [ref=f4e159] [cursor=pointer]:
        - /url: /record
      - link "지도" [ref=f4e162] [cursor=pointer]:
        - /url: /map
      - link "추억" [ref=f4e165] [cursor=pointer]:
        - /url: /memories
  - iframe [aria-hidden] [ref=f4e168]
```

# Test source

```ts
  279 |     await expect(tp).toContainText('순두부 젤라또까지 완벽');
  280 | 
  281 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  282 |     await page.goto('/');
  283 |     await expectMapDrawn(page);
  284 |     await tapLngLat(page, 128.86, 37.73);
  285 |     const sheet = page.getByTestId('region-sheet');
  286 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  287 |     await expect(sheet).toContainText('우리 장소 · 1');
  288 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  289 | 
  290 |     // 우리 장소 목록과 '또 갈래요' 거르기
  291 |     await page.goto('/places');
  292 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  293 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  294 |     await shot(page, '11b-places');
  295 |   });
  296 | 
  297 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  298 |     await signIn(page, OWNER);
  299 |     await page.goto('/trips');
  300 |     await page.getByText('강릉시 여행', { exact: true }).click();
  301 |     await page.getByRole('tab', { name: /사진/ }).click();
  302 |     const sec = page.getByTestId('trip-photos');
  303 |     await sec.getByTestId('photo-input').setInputFiles([
  304 |       'tests/fixtures/photo-gangneung.jpg',
  305 |       'tests/fixtures/photo-gangneung2.jpg',
  306 |       'tests/fixtures/photo-noexif.jpg',
  307 |     ]);
  308 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  309 |     await expect(sec.locator('.photo-cell img')).toHaveCount(3);
  310 |     // 촬영일(2019.5.3~4)로 날짜 채우기 → '(추정)'
  311 |     const sug = page.getByTestId('photo-suggest');
  312 |     await expect(sug).toContainText('2019.5.3–4');
  313 |     await sug.getByRole('button', { name: '채우기' }).click();
  314 |     await expect(page.getByText('2019.5.3–4 (추정)')).toBeVisible();
  315 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  316 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  317 |     await shot(page, '12-photos');
  318 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  319 |     await sec.locator('.photo-cell img').first().click();
  320 |     const cap = page.locator('.pswp__caption-bp');
  321 |     await expect(cap).toContainText('2019.5.3 14:20');
  322 |     await expect(cap).toContainText('강원 강릉시');
  323 |     await page.waitForTimeout(600);
  324 |     await shot(page, '12b-slideshow');
  325 |     await page.keyboard.press('Escape');
  326 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  327 |     await page.goto('/memories');
  328 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  329 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  330 |     await page.getByLabel('다시 보기 연도').fill('0');
  331 |     const firstYear = await page.getByTestId('replay-year').textContent();
  332 |     await page.getByTestId('replay-play').click();
  333 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  334 |     await page.getByLabel('결산 연도').selectOption('2019');
  335 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  336 |     await expect(page.getByTestId('year-review')).toContainText('2');
  337 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  338 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  339 |     await shot(page, '12c-memories');
  340 |   });
  341 | 
  342 |   test('여행 상세: 일정 3단계, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  343 |     await signIn(page, OWNER);
  344 |     // 일정: 날짜가 있는 강릉 여행(사진으로 2019.5.3–4)
  345 |     await page.goto('/trips');
  346 |     await page.getByText('강릉시 여행', { exact: true }).click();
  347 |     await page.getByRole('tab', { name: '일정' }).click();
  348 |     const plan = page.getByTestId('plan-tab');
  349 |     await plan.getByLabel('가볼 곳 추가').fill('경포대');
  350 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  351 |     await plan.getByLabel('가볼 곳 추가').fill('안목 커피거리');
  352 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  353 |     // 우리 장소에서 바로 넣기
  354 |     await plan.getByRole('button', { name: '초당할머니순두부' }).click();
  355 |     await expect(plan.getByTestId('plan-item')).toHaveCount(3);
  356 |     // ② 날짜 ③ 시간·예약
  357 |     await plan.getByRole('button', { name: /경포대/ }).click();
  358 |     await plan.getByLabel('날짜').selectOption('2019-05-04');
  359 |     await plan.getByLabel('시간').fill('18:30');
  360 |     await expect(plan).toContainText('2일째 · 5.4 (토)');
  361 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '경포대' })).toContainText('18:30');
  362 |     await shot(page, '13-plan');
  363 | 
  364 |     // 기록: 쓴 사람이 보인다
  365 |     await page.getByRole('tab', { name: /기록/ }).click();
  366 |     const notes = page.getByTestId('notes-tab');
  367 |     await notes.getByLabel('여행 기록 쓰기').fill('바다 보며 커피 마신 날');
  368 |     await notes.getByRole('button', { name: '남기기' }).click();
  369 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  370 |     await expect(notes.getByTestId('note')).toContainText('영상');
  371 |     await expect(page.getByRole('tab', { name: '기록 1' })).toBeVisible();
  372 | 
  373 |     // 준비물: 예정된 제주 여행
  374 |     await page.goto('/trips');
  375 |     await page.getByText('제주 여행', { exact: true }).click();
  376 |     const pack = page.getByTestId('packing');
  377 |     await pack.getByRole('button', { name: '휴양' }).click();
  378 |     await expect(pack).toContainText('수영복');
> 379 |     await pack.getByLabel('수영복 챙김').check();
      |                                     ^ Error: locator.check: Clicking the checkbox did not change its state
  380 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  381 |     await pack.getByLabel('선크림 담당자').click();
  382 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  383 |     await shot(page, '13b-packing');
  384 |   });
  385 | 
  386 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  387 |     await signIn(page, OWNER);
  388 |     const box = page.getByTestId('home-ask').getByLabel('찾아보기');
  389 |     await box.fill('강릉 맛집');
  390 |     await box.press('Enter');
  391 |     await expect(page).toHaveURL(/\/ask/);
  392 |     const answers = page.getByTestId('answer');
  393 |     await expect(answers.last()).toContainText('초당 순두부');
  394 |     await expect(answers.last()).toContainText('초당할머니순두부');
  395 |     const input = page.getByLabel('질문');
  396 |     await input.fill('거기 언제 가면 좋아?');
  397 |     await input.press('Enter');
  398 |     await expect(answers.last()).toContainText('강원 강릉시은(는)');
  399 |     await input.fill('강릉 몇 번 갔지?');
  400 |     await input.press('Enter');
  401 |     await expect(answers.last()).toContainText('1번 다녀왔어요');
  402 |     await input.fill('고성 맛집');
  403 |     await input.press('Enter');
  404 |     await expect(answers.last()).toContainText('여러 곳');
  405 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  406 |     await expect(answers.last()).toContainText('강원 고성군');
  407 |     await shot(page, '14-ask');
  408 |     await page.getByRole('button', { name: '처음으로' }).click();
  409 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  410 |     await expect(answers.last()).toContainText('시·군');
  411 |   });
  412 | 
  413 |   test('초대 안 된 계정은 막고, 추가하면 들어온다', async ({ page }) => {
  414 |     await signIn(page, 'stranger@example.com');
  415 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  416 |     await shot(page, '10-denied');
  417 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  418 |     await signIn(page, OWNER);
  419 |     await page.goto('/space');
  420 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  421 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  422 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  423 |     await shot(page, '11-space');
  424 |     await page.getByRole('button', { name: '로그아웃' }).click();
  425 |     await signIn(page, 'bora@example.com');
  426 |     await expect(page.getByTestId('headline')).toHaveText(/번의 여행/);
  427 |   });
  428 | 
  429 |   test('기록 고치기와 지우기', async ({ page }) => {
  430 |     await signIn(page, OWNER);
  431 |     await page.goto('/trips');
  432 |     await page.getByText('강릉시 여행', { exact: true }).click();
  433 |     await page.getByRole('link', { name: '고치기' }).click();
  434 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  435 |     await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
  436 |     await page.getByLabel('제목').fill('엄마랑 강릉');
  437 |     await page.getByTestId('save').click();
  438 |     await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
  439 |     await page.getByRole('button', { name: '이 기록 지우기' }).click();
  440 |     await page.getByRole('button', { name: '지우기', exact: true }).click();
  441 |     await expect(page).toHaveURL(/\/trips$/);
  442 |     await expect(page.getByTestId('trip-row')).toHaveCount(3);
  443 |   });
  444 | });
  445 | 
```