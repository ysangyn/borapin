# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름
- Location: tests/app.spec.ts:152:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('region-sheet').getByTestId('sheet-title')
Expected: "부산"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByTestId('region-sheet').getByTestId('sheet-title') with timeout 15000ms
  - waiting for getByTestId('region-sheet').getByTestId('sheet-title')

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "보라에게 물어봐":
  - /url: /ask
- link "우리 공간":
  - /url: /space
  - text: 보 영
- text: 보라 & 영상의 지도 2번의 여행, 핀 2개
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · 확대하면 이름이 보여요 1 다녀온 시·군 1 해외 나라 2 여행·나들이 0 예정
- textbox "보라에게 물어봐":
  - /placeholder: "보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳"
- img "서울 경복궁 경회루"
- text: 서울 경복궁 경회루 10월에 가기 좋은 곳 서울 과거와 미래가 공존하는 K-컬처의 심장 가기 좋은 때 4~6, 9·10월
- button "가고 싶은 곳에 담기"
- link "볼거리 보기":
  - /url: /ask?q=%EC%84%9C%EC%9A%B8%20%EB%B3%BC%EA%B1%B0%EB%A6%AC
- heading "가고 싶은 곳" [level=2]
- link "여행지 뽑기":
  - /url: /wishes
- text: 가고 싶은 곳 3곳만 담아볼까요? 전북 순창군 매콤한 고추장의 깊은 맛과 강천산 산책
- button "담기"
- text: 전남 광양시 매화 꽃길과 광양불고기의 풍미
- button "담기"
- text: 경기 구리시 왕의 쉼터와 한강변의 여유로운 산책
- button "담기"
- link "교토 작년 가을 교토 단풍 여행 2025년 가을":
  - /url: /trips/n7ENiZQLDONFNudEX5LY
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "일본 교토 단풍 여행 일본 교토 · 2025년 가을":
  - /url: /trips/n7ENiZQLDONFNudEX5LY
- link "강원 강릉시 여행 강원 강릉시 · 2024년쯤 엄마와 함께":
  - /url: /trips/ZsZbNQpOOg1l7ZvfzYxd
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
- link "보라에게 물어봐":
  - /url: /ask
- status
```

# Test source

```ts
  58  |     await page.goto('/');
  59  |     await expect(page.getByTestId('login')).toBeVisible();
  60  |     await shot(page, '01-login');
  61  |   });
  62  | 
  63  |   test('주인 계정으로 들어오면 빈 홈', async ({ page }) => {
  64  |     await signIn(page, OWNER);
  65  |     await expect(page.getByTestId('headline')).toHaveText('첫 핀을 꽂아 볼까요?');
  66  |     await expectMapDrawn(page);
  67  |     await shot(page, '02-home-empty');
  68  |   });
  69  | 
  70  |   test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
  71  |     await signIn(page, 'stranger@example.com');
  72  |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  73  |     await shot(page, '10-denied');
  74  |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  75  |     await signIn(page, OWNER);
  76  |     // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
  77  |     await page.goto('/space');
  78  |     await expect(page.getByTestId('space-title')).toHaveText('영상');
  79  |     await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
  80  |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  81  |     await page.getByRole('textbox', { name: '부를 이름' }).fill('보라');
  82  |     await page.getByRole('button', { name: '추가', exact: true }).click();
  83  |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  84  |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  85  |     await shot(page, '11-space');
  86  |     await page.getByRole('button', { name: '로그아웃' }).click();
  87  |     // 보라로 들어와도 같은 공간
  88  |     await signIn(page, 'bora@example.com');
  89  |     await expect(page.getByTestId('headline')).toBeVisible();
  90  |     await page.goto('/space');
  91  |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  92  |   });
  93  | 
  94  |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  95  |     await signIn(page, OWNER);
  96  |     await page.getByRole('link', { name: '기록하기' }).click();
  97  |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  98  |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  99  |     await page.getByLabel('연도').selectOption('2024');
  100 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  101 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  102 |     await shot(page, '03-record');
  103 |     await page.getByTestId('save').click();
  104 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  105 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  106 |     await expectMapDrawn(page);
  107 |     await shot(page, '04-detail');
  108 |   });
  109 | 
  110 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  111 |     await signIn(page, OWNER);
  112 |     await page.goto('/record');
  113 |     await pickPlace(page, '일본', '일본');
  114 |     await page.getByPlaceholder(/도시/).fill('교토');
  115 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  116 |     await page.getByRole('button', { name: '계절만' }).click();
  117 |     await page.getByLabel('연도').selectOption('2025');
  118 |     await page.getByRole('button', { name: '가을' }).click();
  119 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  120 |     await page.getByTestId('save').click();
  121 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  122 |   });
  123 | 
  124 |   test('여행 목록과 필터', async ({ page }) => {
  125 |     await signIn(page, OWNER);
  126 |     await page.goto('/trips');
  127 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  128 |     await page.getByRole('button', { name: /^해외/ }).click();
  129 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  130 |     await page.getByRole('button', { name: /^전체/ }).click();
  131 |     await shot(page, '05-trips');
  132 |   });
  133 | 
  134 |   test('홈 통계와 지도', async ({ page }) => {
  135 |     await signIn(page, OWNER);
  136 |     await expect(page.getByTestId('headline')).toHaveText('2번의 여행, 핀 2개');
  137 |     await expectMapDrawn(page);
  138 |     await shot(page, '06-home');
  139 |     await page.goto('/map');
  140 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  141 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  142 |     await expectMapDrawn(page);
  143 |     await page.waitForTimeout(800);
  144 |     await shot(page, '07-map');
  145 |     await page.getByRole('tab', { name: '세계' }).click();
  146 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  147 |     await page.waitForTimeout(1200);
  148 |     await expectMapDrawn(page);
  149 |     await shot(page, '08-map-world');
  150 |   });
  151 | 
  152 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  153 |     await signIn(page, OWNER);
  154 |     await expectMapDrawn(page);
  155 |     // 부산을 누른다
  156 |     await tapLngLat(page, 129.06, 35.2);
  157 |     const sheet = page.getByTestId('region-sheet');
> 158 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
      |                                                    ^ Error: expect(locator).toHaveText(expected) failed
  159 |     await expect(sheet).toContainText('아직 안 가본 곳');
  160 |     // 여행정보: 볼거리·먹거리, 더보기로 구·군
  161 |     const info = sheet.getByTestId('region-info');
  162 |     await expect(info).toContainText('볼거리');
  163 |     await info.getByRole('button', { name: /더보기/ }).click();
  164 |     await expect(info).toContainText('해운대구');
  165 |     await shot(page, '09a-region-info');
  166 |     await info.getByRole('button', { name: '접기' }).click();
  167 |     await sheet.getByTestId('quick-pin').click();
  168 |     await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
  169 |     await expect(sheet).toContainText('다녀왔어요');
  170 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  171 |     // 되돌리기
  172 |     await page.getByRole('button', { name: '되돌리기' }).click();
  173 |     await expect(sheet).toContainText('아직 안 가본 곳');
  174 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
  175 |     // 다시 꽂아 둔다
  176 |     await sheet.getByTestId('quick-pin').click();
  177 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  178 |     await expect(page.getByTestId('headline')).toHaveText('3번의 여행, 핀 3개');
  179 |     await shot(page, '09-sheet');
  180 |     await sheet.getByRole('button', { name: '닫기' }).click();
  181 |     await expect(sheet).toHaveCount(0);
  182 | 
  183 |     // 확대하면 시·군 이름이 보이고, 다녀온 곳은 진하게
  184 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [128.95, 35.25], zoom: 7.6 }));
  185 |     const busan = page.locator('.map-label', { hasText: /^부산$/ });
  186 |     await expect(busan).toBeVisible();
  187 |     await expect(busan).toHaveClass(/\bon\b/);
  188 |     await expect(page.locator('.map-label', { hasText: /^김해시$/ })).toBeVisible();
  189 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  190 |     await shot(page, '09b-labels-cells');
  191 | 
  192 |     // 큰 지도: 중간 확대에서는 도 이름
  193 |     await page.goto('/map');
  194 |     await expectMapDrawn(page);
  195 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [127.9, 36.3], zoom: 6.1 }));
  196 |     await expect(page.locator('.map-label.province', { hasText: '강원' })).toHaveClass(/\bon\b/);
  197 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).toBeVisible();
  198 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).not.toHaveClass(/\bon\b/);
  199 |     await shot(page, '09c-labels-provinces');
  200 | 
  201 |     // 세계: 나라 이름, 다녀온 일본은 진하게
  202 |     await page.getByRole('tab', { name: '세계' }).click();
  203 |     await page.waitForTimeout(900);
  204 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [131, 35], zoom: 3.4 }));
  205 |     await expect(page.locator('.map-label.country', { hasText: /^일본$/ })).toHaveClass(/\bon\b/);
  206 |     await expect(page.locator('.map-label.country', { hasText: /^한국$/ })).toHaveClass(/\bon\b/);
  207 |     await shot(page, '09d-labels-world');
  208 | 
  209 |     // 우리 공간에는 더 이상 가져오기 버튼이 없다
  210 |     await page.goto('/space');
  211 |     await expect(page.getByText('백업 파일 내려받기')).toBeVisible();
  212 |     await expect(page.getByText(/가져오기/)).toHaveCount(0);
  213 |   });
  214 | 
  215 |   test('가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기', async ({ page }) => {
  216 |     await signIn(page, OWNER);
  217 |     // 비어 있으면 홈에 이번 달 추천 3곳
  218 |     const homeWishes = page.getByTestId('home-wishes');
  219 |     await expect(homeWishes).toContainText('가고 싶은 곳 3곳만 담아볼까요?');
  220 |     await expect(homeWishes.getByRole('button', { name: '담기' })).toHaveCount(3);
  221 |     await expectMapDrawn(page);
  222 | 
  223 |     // 지도에서 제주를 눌러 하트로 담기 → 알림의 '메모 쓰기'
  224 |     await tapLngLat(page, 126.55, 33.38);
  225 |     const sheet = page.getByTestId('region-sheet');
  226 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('제주');
  227 |     await sheet.getByTestId('sheet-wish').click();
  228 |     await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
  229 |     await page.getByRole('button', { name: '메모 쓰기' }).click();
  230 |     await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  231 | 
  232 |     // 고치기: 둘 다 원해요, 1순위, 가볼 곳
  233 |     await expect(page.getByRole('button', { name: /제주 빼기/ })).toBeVisible();
  234 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  235 |     await expect(page.getByText('둘 다 원해요')).toBeVisible();
  236 |     await page.getByRole('button', { name: '1순위' }).click();
  237 |     await page.getByLabel('가볼 곳').fill('성산일출봉\n우도');
  238 |     await page.getByTestId('wish-save').click();
  239 |     // 저장하면 들어왔던 화면(홈)으로 돌아간다
  240 |     await expect(page.getByRole('status')).toContainText('고쳤어요');
  241 |     await expect(page).toHaveURL(/:5174\/$/);
  242 |     await page.goto('/wishes');
  243 |     const card = page.getByTestId('wish-card').filter({ hasText: '제주' });
  244 |     await expect(card).toContainText('둘 다 원해요');
  245 |     await expect(card).toContainText('가볼 곳 성산일출봉 외 1');
  246 |     await expect(card.getByLabel('1순위')).toBeVisible();
  247 |     await shot(page, '10-wishes');
  248 | 
  249 |     // 여행 만들기 → 예정된 여행, 카드는 '예정'
  250 |     await card.getByTestId('wish-plan').click();
  251 |     await expect(page).toHaveURL(/status=planned/);
  252 |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  253 |     await page.getByTestId('save').click();
  254 |     await expect(page.getByTestId('trip-title')).toHaveText('제주 여행');
  255 |     await page.goto('/wishes');
  256 |     await expect(page.getByTestId('wish-card').filter({ hasText: '제주' })).toContainText('예정');
  257 | 
  258 |     // 지도에 깃발
```