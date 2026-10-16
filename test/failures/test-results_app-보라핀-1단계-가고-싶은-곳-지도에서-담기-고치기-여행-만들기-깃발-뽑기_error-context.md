# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기
- Location: tests/app.spec.ts:186:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/wishes$/
Received string:  "http://127.0.0.1:5174/"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    - locator resolved to <html lang="ko">…</html>
    - unexpected value "http://127.0.0.1:5174/wishes/gGjnAQW5glGuuqTxDvSv"
    32 × locator resolved to <html lang="ko">…</html>
       - unexpected value "http://127.0.0.1:5174/"

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "찾아보기":
  - /url: /ask
- link "우리 공간":
  - /url: /space
  - text: 보 영
- text: 보라 & 영상의 지도 3번의 여행, 핀 3개
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 흑해 필리핀해 태즈먼해 벵골만 남중국해 아라비아해 카리브해 멕시코만 허드슨만 카스피해 알래스카만 홍해 오호츠크해 페르시아만 지중해 산호해 동해 술라웨시해 술루해 발트해 북해 자와해 안다만해 황해 동중국해 아라푸라해 티모르해 타이만 베링해 대한해협 1
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · 확대하면 이름이 보여요 2 다녀온 시·군 1 해외 나라 3 여행·나들이 0 예정
- heading "가고 싶은 곳" [level=2]
- link "모두 보기 1":
  - /url: /wishes
- link "제주 가고 싶은 곳 보기":
  - /url: /wishes/gGjnAQW5glGuuqTxDvSv
  - text: 제주 1 제주 보라 영상 둘 다 원해요 지금 가기 좋아요 5·6 · 9~11월
- link "여행 만들기":
  - /url: /record?status=planned&place=kr:50&wish=gGjnAQW5glGuuqTxDvSv
- link "교토 작년 가을 교토 단풍 여행 2025 가을":
  - /url: /trips/qpd1WW54uj3Fc2bzLkzC
- textbox "찾아보기":
  - /placeholder: "찾아보기: 영등포 맛집, 작년 여름에 간 곳"
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "부산 부산 여행 부산 · 날짜 모름":
  - /url: /trips/B1novZ24PMMDswEzSs8K
- link "일본 교토 단풍 여행 일본 교토 · 2025 가을":
  - /url: /trips/qpd1WW54uj3Fc2bzLkzC
- link "강원 강릉시 여행 강원 강릉시 · 2024년쯤 엄마와 함께":
  - /url: /trips/dcApGQOXttUkBhkmdCor
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - link "기록하기":
    - /url: /record
  - link "지도":
    - /url: /map
  - link "추억":
    - /url: /memories
```

# Test source

```ts
  110 |     await page.goto('/map');
  111 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  112 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  113 |     await expectMapDrawn(page);
  114 |     await page.waitForTimeout(800);
  115 |     await shot(page, '07-map');
  116 |     await page.getByRole('tab', { name: '세계' }).click();
  117 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  118 |     await page.waitForTimeout(1200);
  119 |     await expectMapDrawn(page);
  120 |     await shot(page, '08-map-world');
  121 |   });
  122 | 
  123 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  124 |     await signIn(page, OWNER);
  125 |     await expectMapDrawn(page);
  126 |     // 부산을 누른다
  127 |     await tapLngLat(page, 129.06, 35.2);
  128 |     const sheet = page.getByTestId('region-sheet');
  129 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
  130 |     await expect(sheet).toContainText('아직 안 가본 곳');
  131 |     // 여행정보: 볼거리·먹거리, 더보기로 구·군
  132 |     const info = sheet.getByTestId('region-info');
  133 |     await expect(info).toContainText('볼거리');
  134 |     await info.getByRole('button', { name: /더보기/ }).click();
  135 |     await expect(info).toContainText('해운대구');
  136 |     await shot(page, '09a-region-info');
  137 |     await info.getByRole('button', { name: '접기' }).click();
  138 |     await sheet.getByTestId('quick-pin').click();
  139 |     await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
  140 |     await expect(sheet).toContainText('다녀왔어요');
  141 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  142 |     // 되돌리기
  143 |     await page.getByRole('button', { name: '되돌리기' }).click();
  144 |     await expect(sheet).toContainText('아직 안 가본 곳');
  145 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
  146 |     // 다시 꽂아 둔다
  147 |     await sheet.getByTestId('quick-pin').click();
  148 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  149 |     await expect(page.getByTestId('headline')).toHaveText('3번의 여행, 핀 3개');
  150 |     await shot(page, '09-sheet');
  151 |     await sheet.getByRole('button', { name: '닫기' }).click();
  152 |     await expect(sheet).toHaveCount(0);
  153 | 
  154 |     // 확대하면 시·군 이름이 보이고, 다녀온 곳은 진하게
  155 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [128.95, 35.25], zoom: 7.6 }));
  156 |     const busan = page.locator('.map-label', { hasText: /^부산$/ });
  157 |     await expect(busan).toBeVisible();
  158 |     await expect(busan).toHaveClass(/\bon\b/);
  159 |     await expect(page.locator('.map-label', { hasText: /^김해시$/ })).toBeVisible();
  160 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  161 |     await shot(page, '09b-labels-cells');
  162 | 
  163 |     // 큰 지도: 중간 확대에서는 도 이름
  164 |     await page.goto('/map');
  165 |     await expectMapDrawn(page);
  166 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [127.9, 36.3], zoom: 6.1 }));
  167 |     await expect(page.locator('.map-label.province', { hasText: '강원' })).toHaveClass(/\bon\b/);
  168 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).toBeVisible();
  169 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).not.toHaveClass(/\bon\b/);
  170 |     await shot(page, '09c-labels-provinces');
  171 | 
  172 |     // 세계: 나라 이름, 다녀온 일본은 진하게
  173 |     await page.getByRole('tab', { name: '세계' }).click();
  174 |     await page.waitForTimeout(900);
  175 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [131, 35], zoom: 3.4 }));
  176 |     await expect(page.locator('.map-label.country', { hasText: /^일본$/ })).toHaveClass(/\bon\b/);
  177 |     await expect(page.locator('.map-label.country', { hasText: /^한국$/ })).toHaveClass(/\bon\b/);
  178 |     await shot(page, '09d-labels-world');
  179 | 
  180 |     // 우리 공간에는 더 이상 가져오기 버튼이 없다
  181 |     await page.goto('/space');
  182 |     await expect(page.getByText('백업 파일 내려받기')).toBeVisible();
  183 |     await expect(page.getByText(/가져오기/)).toHaveCount(0);
  184 |   });
  185 | 
  186 |   test('가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기', async ({ page }) => {
  187 |     await signIn(page, OWNER);
  188 |     // 비어 있으면 홈에 이번 달 추천 3곳
  189 |     const homeWishes = page.getByTestId('home-wishes');
  190 |     await expect(homeWishes).toContainText('가고 싶은 곳 3곳만 담아볼까요?');
  191 |     await expect(homeWishes.getByRole('button', { name: '담기' })).toHaveCount(3);
  192 |     await expectMapDrawn(page);
  193 | 
  194 |     // 지도에서 제주를 눌러 하트로 담기 → 알림의 '메모 쓰기'
  195 |     await tapLngLat(page, 126.55, 33.38);
  196 |     const sheet = page.getByTestId('region-sheet');
  197 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('제주');
  198 |     await sheet.getByTestId('sheet-wish').click();
  199 |     await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
  200 |     await page.getByRole('button', { name: '메모 쓰기' }).click();
  201 |     await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  202 | 
  203 |     // 고치기: 둘 다 원해요, 1순위, 가볼 곳
  204 |     await expect(page.getByRole('button', { name: /제주 빼기/ })).toBeVisible();
  205 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  206 |     await expect(page.getByText('둘 다 원해요')).toBeVisible();
  207 |     await page.getByRole('button', { name: '1순위' }).click();
  208 |     await page.getByLabel('가볼 곳').fill('성산일출봉\n우도');
  209 |     await page.getByTestId('wish-save').click();
> 210 |     await expect(page).toHaveURL(/\/wishes$/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  211 |     const card = page.getByTestId('wish-card').filter({ hasText: '제주' });
  212 |     await expect(card).toContainText('둘 다 원해요');
  213 |     await expect(card).toContainText('가볼 곳 성산일출봉 외 1');
  214 |     await expect(card.getByLabel('1순위')).toBeVisible();
  215 |     await shot(page, '10-wishes');
  216 | 
  217 |     // 여행 만들기 → 예정된 여행, 카드는 '예정'
  218 |     await card.getByTestId('wish-plan').click();
  219 |     await expect(page).toHaveURL(/status=planned/);
  220 |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  221 |     await page.getByTestId('save').click();
  222 |     await expect(page.getByTestId('trip-title')).toHaveText('제주 여행');
  223 |     await page.goto('/wishes');
  224 |     await expect(page.getByTestId('wish-card').filter({ hasText: '제주' })).toContainText('예정');
  225 | 
  226 |     // 지도에 깃발
  227 |     await page.goto('/map');
  228 |     await expectMapDrawn(page);
  229 |     await expect(page.getByTestId('wish-flag')).toHaveCount(1);
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
  309 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  310 |     // 촬영일(2019.5.3~4)로 날짜 채우기 → '(추정)'
```