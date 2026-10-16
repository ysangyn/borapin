# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩
- Location: tests/app.spec.ts:297:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('연도') resolved to 2 elements:
    1) <input min="0" max="1" value="1" type="range" aria-label="연도"/> aka getByRole('slider', { name: '연도' })
    2) <select class="select" aria-label="결산 연도">…</select> aka getByLabel('결산 연도')

Call log:
  - waiting for getByLabel('연도')

```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e3]:
    - heading "추억" [level=1] [ref=f4e6]
    - generic [ref=f4e7]:
      - generic [ref=f4e8]:
        - generic [ref=f4e9]: 작년 가을
        - link "일본 교토 단풍 여행 일본 교토 · 2025 가을" [ref=f4e11] [cursor=pointer]:
          - /url: /trips/1m74Fn5FaVvCyhq4yVOg
          - generic [ref=f4e12]: 일본
          - generic [ref=f4e13]:
            - generic [ref=f4e14]: 교토 단풍 여행
            - generic [ref=f4e15]: 일본 교토 · 2025 가을
      - generic [ref=f4e16]:
        - generic [ref=f4e17]: 날짜 채우기 놀이
        - generic [ref=f4e18]:
          - text: 이 여행, 언제였을까요?
          - link "부산 여행" [ref=f4e19] [cursor=pointer]:
            - /url: /trips/bkXotixveVNgqm9bKrUB
        - generic [ref=f4e20]:
          - button "2026" [ref=f4e21] [cursor=pointer]
          - button "2025" [ref=f4e22] [cursor=pointer]
          - button "2024" [ref=f4e23] [cursor=pointer]
          - button "2023" [ref=f4e24] [cursor=pointer]
          - button "2022" [ref=f4e25] [cursor=pointer]
          - button "2021" [ref=f4e26] [cursor=pointer]
          - button "2020" [ref=f4e27] [cursor=pointer]
          - button "2019" [ref=f4e28] [cursor=pointer]
          - combobox "더 예전" [ref=f4e29]:
            - option "더 예전" [selected]
            - option "2018"
            - option "2017"
            - option "2016"
            - option "2015"
            - option "2014"
            - option "2013"
            - option "2012"
            - option "2011"
            - option "2010"
            - option "2009"
            - option "2008"
            - option "2007"
            - option "2006"
            - option "2005"
            - option "2004"
            - option "2003"
            - option "2002"
            - option "2001"
            - option "2000"
            - option "1999"
            - option "1998"
            - option "1997"
            - option "1996"
            - option "1995"
            - option "1994"
            - option "1993"
            - option "1992"
            - option "1991"
            - option "1990"
            - option "1989"
        - generic [ref=f4e30]:
          - button "봄" [ref=f4e31] [cursor=pointer]
          - button "여름" [ref=f4e32] [cursor=pointer]
          - button "가을" [ref=f4e33] [cursor=pointer]
          - button "겨울" [ref=f4e34] [cursor=pointer]
        - button "답하기" [disabled] [ref=f4e35]
      - generic [ref=f4e36]:
        - heading "지도 다시 보기" [level=2] [ref=f4e37]
        - generic [ref=f4e38]:
          - generic [ref=f4e39]:
            - generic [ref=f4e40]:
              - text: "2025"
              - generic [ref=f4e41]: · 시·군 1 · 나라 1 · 새로 1곳
            - tablist [ref=f4e42]:
              - tab "국내" [selected] [ref=f4e43] [cursor=pointer]
              - tab "세계" [ref=f4e44] [cursor=pointer]
          - generic [ref=f4e46]:
            - generic:
              - region "Map" [ref=f4e47]
              - generic [aria-hidden]:
                - generic: Use two fingers to move the map
              - generic: 북극해
              - generic: 남극해
              - generic: 대서양
              - generic: 태평양
              - generic: 태평양
              - generic: 인도양
              - generic: 대서양
              - generic: 흑해
              - generic: 필리핀해
              - generic: 태즈먼해
              - generic: 벵골만
              - generic: 남중국해
              - generic: 아라비아해
              - generic: 카리브해
              - generic: 멕시코만
              - generic: 허드슨만
              - generic: 카스피해
              - generic: 알래스카만
              - generic: 홍해
              - generic: 오호츠크해
              - generic: 페르시아만
              - generic: 지중해
              - generic: 산호해
              - generic: 동해
              - generic: 술라웨시해
              - generic: 술루해
              - generic: 발트해
              - generic: 북해
              - generic: 자와해
              - generic: 안다만해
              - generic: 황해
              - generic: 동중국해
              - generic: 아라푸라해
              - generic: 티모르해
              - generic: 타이만
              - generic: 베링해
              - generic: 대한해협
          - generic [ref=f4e48]:
            - button "재생" [ref=f4e49] [cursor=pointer]: ▶
            - slider "연도" [ref=f4e50]: "1"
      - generic [ref=f4e51]:
        - generic [ref=f4e52]:
          - generic [ref=f4e53]: 2026년 결산
          - combobox "결산 연도" [ref=f4e54]:
            - option "2026년" [selected]
            - option "2025년"
            - option "2019년"
        - generic [ref=f4e55]:
          - generic [ref=f4e56]:
            - text: "0"
            - generic [ref=f4e57]: 여행·나들이
          - generic [ref=f4e58]:
            - text: "0"
            - generic [ref=f4e59]: 밖에서 보낸 날
          - generic [ref=f4e60]:
            - text: "0"
            - generic [ref=f4e61]: 처음 가본 곳
      - generic [ref=f4e62]:
        - heading "여행 잔디" [level=2] [ref=f4e63]
        - generic [ref=f4e64]:
          - generic [ref=f4e65]: "1"
          - generic [ref=f4e66]: "2"
          - generic [ref=f4e67]: "3"
          - generic [ref=f4e68]: "4"
          - generic [ref=f4e69]: "5"
          - generic [ref=f4e70]: "6"
          - generic [ref=f4e71]: "7"
          - generic [ref=f4e72]: "8"
          - generic [ref=f4e73]: "9"
          - generic [ref=f4e74]: "10"
          - generic [ref=f4e75]: "11"
          - generic [ref=f4e76]: "12"
          - generic [ref=f4e77]:
            - generic [ref=f4e78]: "2025"
            - generic "2025년 1월 0번" [ref=f4e79]
            - generic "2025년 2월 0번" [ref=f4e80]
            - generic "2025년 3월 0번" [ref=f4e81]
            - generic "2025년 4월 0번" [ref=f4e82]
            - generic "2025년 5월 0번" [ref=f4e83]
            - generic "2025년 6월 0번" [ref=f4e84]
            - generic "2025년 7월 0번" [ref=f4e85]
            - generic "2025년 8월 0번" [ref=f4e86]
            - generic "2025년 9월 0번" [ref=f4e87]
            - generic "2025년 10월 1번" [ref=f4e88]
            - generic "2025년 11월 0번" [ref=f4e89]
            - generic "2025년 12월 0번" [ref=f4e90]
          - generic [ref=f4e91]:
            - generic [ref=f4e92]: "2019"
            - generic "2019년 1월 0번" [ref=f4e93]
            - generic "2019년 2월 0번" [ref=f4e94]
            - generic "2019년 3월 0번" [ref=f4e95]
            - generic "2019년 4월 0번" [ref=f4e96]
            - generic "2019년 5월 1번" [ref=f4e97]
            - generic "2019년 6월 0번" [ref=f4e98]
            - generic "2019년 7월 0번" [ref=f4e99]
            - generic "2019년 8월 0번" [ref=f4e100]
            - generic "2019년 9월 0번" [ref=f4e101]
            - generic "2019년 10월 0번" [ref=f4e102]
            - generic "2019년 11월 0번" [ref=f4e103]
            - generic "2019년 12월 0번" [ref=f4e104]
        - generic [ref=f4e105]: 달을 모르는 기록 1건은 빠져 있어요.
      - generic [ref=f4e106]:
        - heading "도전 뱃지 · 3/15" [level=2] [ref=f4e107]
        - generic [ref=f4e108]:
          - generic "첫 기록을 남겼어요" [ref=f4e109]: 첫 핀
          - generic "서로 다른 곳 10곳" [ref=f4e112]:
            - generic [ref=f4e113]: 핀 10개
            - generic [ref=f4e114]: 3/10
          - generic "서로 다른 곳 30곳" [ref=f4e116]:
            - generic [ref=f4e117]: 핀 30개
            - generic [ref=f4e118]: 3/30
          - generic "국내 시·군 50곳" [ref=f4e120]:
            - generic [ref=f4e121]: 시·군 50
            - generic [ref=f4e122]: 2/50
          - generic "국내 시·군 100곳" [ref=f4e124]:
            - generic [ref=f4e125]: 시·군 100
            - generic [ref=f4e126]: 2/100
          - generic "시·군 160곳을 모두 칠했어요" [ref=f4e128]:
            - generic [ref=f4e129]: 전국 완주
            - generic [ref=f4e130]: 2/160
          - generic "모든 광역에 한 번씩" [ref=f4e132]:
            - generic [ref=f4e133]: 광역 16곳
            - generic [ref=f4e134]: 2/16
          - generic "제주·울릉·신안·완도·진도·거제·남해" [ref=f4e136]:
            - generic [ref=f4e137]: 섬 탐험가
            - generic [ref=f4e138]: 0/4
          - generic "처음으로 나라 밖으로" [ref=f4e139]: 첫 해외
          - generic "서로 다른 나라 10곳" [ref=f4e142]:
            - generic [ref=f4e143]: 나라 10곳
            - generic [ref=f4e144]: 1/10
          - generic "6개 대륙 중 3곳" [ref=f4e146]:
            - generic [ref=f4e147]: 대륙 3곳
            - generic [ref=f4e148]: 1/3
          - generic "한 해에 봄·여름·가을·겨울 모두" [ref=f4e150]:
            - generic [ref=f4e151]: 사계절 여행
            - generic [ref=f4e152]: 1/4
          - generic "보라·영상 말고 다른 사람과도" [ref=f4e154]: 함께라서
          - generic "사진첩에 100장" [ref=f4e157]:
            - generic [ref=f4e158]: 사진 100장
            - generic [ref=f4e159]: 3/100
          - generic "다시 가고 싶은 장소 5곳" [ref=f4e161]:
            - generic [ref=f4e162]: 또 갈래요 5곳
            - generic [ref=f4e163]: 1/5
      - generic [ref=f4e165]:
        - generic [ref=f4e166]:
          - heading "사진첩 · 3" [level=2] [ref=f4e167]
          - button "▶ 섞어서 보기" [ref=f4e168] [cursor=pointer]
        - generic [ref=f4e169]:
          - link "강릉시 여행 · 3장" [ref=f4e170] [cursor=pointer]:
            - /url: /trips/21NIHN2sMF4ZBSNZoChc?tab=photos
          - generic [ref=f4e171]:
            - button "사진 1 크게 보기" [ref=f4e172] [cursor=pointer]
            - button "사진 2 크게 보기" [ref=f4e173] [cursor=pointer]
            - button "사진 3 크게 보기" [ref=f4e174] [cursor=pointer]
            - button "사진" [ref=f4e175] [cursor=pointer]
    - navigation "주 메뉴" [ref=f4e179]:
      - link "홈" [ref=f4e180] [cursor=pointer]:
        - /url: /
      - link "여행" [ref=f4e183] [cursor=pointer]:
        - /url: /trips
      - link "기록하기" [ref=f4e186] [cursor=pointer]:
        - /url: /record
      - link "지도" [ref=f4e189] [cursor=pointer]:
        - /url: /map
      - link "추억" [ref=f4e192] [cursor=pointer]:
        - /url: /memories
  - iframe [aria-hidden] [ref=f4e195]
```

# Test source

```ts
  230 |     // 깃발이 실제로 제주 위에 그려졌는지 (위치 확인)
  231 |     const jeju = await page.evaluate(() => {
  232 |       const w = window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } };
  233 |       return w.__map.project([126.55, 33.38]);
  234 |     });
  235 |     const mapBox = (await page.getByTestId('map').first().boundingBox())!;
  236 |     const flagBox = (await page.getByTestId('wish-flag').boundingBox())!;
  237 |     expect(Math.abs(flagBox.x + flagBox.width / 2 - (mapBox.x + jeju.x))).toBeLessThan(40);
  238 |     expect(Math.abs(flagBox.y + flagBox.height - (mapBox.y + jeju.y))).toBeLessThan(40);
  239 |     await shot(page, '10b-map-flags');
  240 | 
  241 |     // 여행지 뽑기: 강원 · 바다 → 담기
  242 |     await page.goto('/wishes');
  243 |     await page.getByTestId('dice-open').click();
  244 |     await page.getByLabel('뽑을 범위').selectOption('gangwon');
  245 |     await page.getByRole('button', { name: '바다', exact: true }).click();
  246 |     await page.getByTestId('dice-roll').click();
  247 |     await expect(page.getByTestId('dice-add')).toBeVisible();
  248 |     await expect(page.getByTestId('dice-face')).toContainText('강원');
  249 |     await shot(page, '10c-dice');
  250 |     await page.getByTestId('dice-add').click();
  251 |     await expect(page.getByTestId('wish-card')).toHaveCount(2);
  252 | 
  253 |     // 홈 롤링, 여행 탭에도 보인다
  254 |     await page.goto('/');
  255 |     await expect(page.getByTestId('home-wishes').getByTestId('wish-card').first()).toBeVisible();
  256 |     await expect(page.getByTestId('home-wishes')).toContainText('제주');
  257 |     await page.goto('/trips');
  258 |     await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  259 |   });
  260 | 
  261 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  262 |     await signIn(page, OWNER);
  263 |     await page.goto('/trips');
  264 |     await page.getByText('강릉시 여행', { exact: true }).click();
  265 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  266 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  267 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  268 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  269 |     await expect(page.getByLabel('네이버지도 링크')).toHaveValue('https://naver.me/xYz12');
  270 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  271 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  272 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  273 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  274 |     await shot(page, '11-place-edit');
  275 |     await page.getByTestId('place-save').click();
  276 |     const tp = page.getByTestId('trip-places');
  277 |     await expect(tp).toContainText('초당할머니순두부');
  278 |     await expect(tp).toContainText('또 갈래요');
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
> 330 |     await page.getByLabel('연도').fill('0');
      |                                 ^ Error: locator.fill: Error: strict mode violation: getByLabel('연도') resolved to 2 elements:
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
  379 |     await pack.getByLabel('수영복 챙김').check();
  380 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  381 |     await pack.getByLabel('선크림 담당자').click();
  382 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  383 |     await shot(page, '13b-packing');
  384 |   });
  385 | 
  386 |   test('초대 안 된 계정은 막고, 추가하면 들어온다', async ({ page }) => {
  387 |     await signIn(page, 'stranger@example.com');
  388 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  389 |     await shot(page, '10-denied');
  390 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  391 |     await signIn(page, OWNER);
  392 |     await page.goto('/space');
  393 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  394 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  395 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  396 |     await shot(page, '11-space');
  397 |     await page.getByRole('button', { name: '로그아웃' }).click();
  398 |     await signIn(page, 'bora@example.com');
  399 |     await expect(page.getByTestId('headline')).toHaveText(/번의 여행/);
  400 |   });
  401 | 
  402 |   test('기록 고치기와 지우기', async ({ page }) => {
  403 |     await signIn(page, OWNER);
  404 |     await page.goto('/trips');
  405 |     await page.getByText('강릉시 여행', { exact: true }).click();
  406 |     await page.getByRole('link', { name: '고치기' }).click();
  407 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  408 |     await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
  409 |     await page.getByLabel('제목').fill('엄마랑 강릉');
  410 |     await page.getByTestId('save').click();
  411 |     await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
  412 |     await page.getByRole('button', { name: '이 기록 지우기' }).click();
  413 |     await page.getByRole('button', { name: '지우기', exact: true }).click();
  414 |     await expect(page).toHaveURL(/\/trips$/);
  415 |     await expect(page.getByTestId('trip-row')).toHaveCount(3);
  416 |   });
  417 | });
  418 | 
```