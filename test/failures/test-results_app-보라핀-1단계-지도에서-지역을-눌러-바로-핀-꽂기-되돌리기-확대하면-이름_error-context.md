# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름
- Location: tests/app.spec.ts:201:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.map-label').filter({ hasText: /^부산$/ })
Expected: visible
Error: strict mode violation: locator('.map-label').filter({ hasText: /^부산$/ }) resolved to 2 elements:
    1) <span class="map-label metro on">부산</span> aka getByText('부산').first()
    2) <span class="map-label cell on">부산</span> aka getByText('부산').nth(1)

Call log:
  - Expect "toBeVisible" locator('.map-label').filter({ hasText: /^부산$/ }) with timeout 15000ms
  - waiting for locator('.map-label').filter({ hasText: /^부산$/ })

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
            - generic "보라 · 영상" [ref=e15]:
              - generic [ref=e16]: 보
              - generic [ref=e17]: 영
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: 보라 & 영상의 지도
          - generic [ref=e21]: 3번의 여행, 핀 3개
        - generic [ref=e22]:
          - generic [ref=e23]:
            - tablist [ref=e24]:
              - tab "국내" [selected] [ref=e25] [cursor=pointer]
              - tab "세계" [ref=e26] [cursor=pointer]
            - link "지도 크게 보기" [ref=e27] [cursor=pointer]:
              - /url: /map
          - generic [ref=e28]:
            - generic [ref=e29]:
              - generic:
                - region "Map" [ref=e30] [cursor=pointer]
                - generic: 동해
                - generic: 서해
                - generic: 남해
            - generic [aria-hidden]:
              - generic: 부산
              - generic: 울산
              - generic: 창원시
              - generic: 밀양시
              - generic: 양산시
              - generic: 김해시
              - generic: 창녕군
              - generic: 함안군
            - generic [ref=e31]:
              - button "확대" [ref=e32] [cursor=pointer]
              - separator [ref=e35]
              - button "축소" [ref=e36] [cursor=pointer]
              - separator [ref=e38]
              - button "전체 보기" [ref=e39] [cursor=pointer]
          - generic [ref=e42]: 지역을 누르면 바로 핀을 꽂을 수 있어요⛶ 를 누르면 전국이 보여요
          - generic [ref=e43]:
            - generic [ref=e44]:
              - text: "2"
              - generic [ref=e45]: 다녀온 시·군
            - generic [ref=e46]:
              - text: "1"
              - generic [ref=e47]: 해외 나라
            - generic [ref=e48]:
              - text: "3"
              - generic [ref=e49]: 여행·나들이
            - generic [ref=e50]:
              - text: "0"
              - generic [ref=e51]: 예정
        - textbox "보라에게 물어봐" [ref=e53]:
          - /placeholder: "보라에게 물어봐: 강릉 맛집, 11월 축제"
        - generic [ref=e54]:
          - generic [ref=e55]:
            - heading "다음 여행 준비" [level=2] [ref=e56]
            - link "여행지 뽑기" [ref=e57] [cursor=pointer]:
              - /url: /wishes
          - generic [ref=e59]:
            - generic [ref=e60]: 가고 싶은 곳 3곳만 담아볼까요?
            - generic [ref=e61]:
              - link "경북 포항시 자세히 보기" [ref=e62] [cursor=pointer]:
                - /url: /map?sel=kr:47
                - generic [ref=e63]: 경북 포항시
                - generic [ref=e66]: 호미곶의 상생의 손과 영일만의 야경
              - button "담기" [ref=e67] [cursor=pointer]
            - generic [ref=e70]:
              - link "전남 함평군 자세히 보기" [ref=e71] [cursor=pointer]:
                - /url: /map?sel=kr:46860
                - generic [ref=e72]: 전남 함평군
                - generic [ref=e75]: 나비의 날갯짓과 황금박쥐의 전설
              - button "담기" [ref=e76] [cursor=pointer]
            - generic [ref=e79]:
              - link "경남 밀양시 자세히 보기" [ref=e80] [cursor=pointer]:
                - /url: /map?sel=kr:48270
                - generic [ref=e81]: 경남 밀양시
                - generic [ref=e84]: 영남루의 풍류와 얼음골의 시원한 바람
              - button "담기" [ref=e85] [cursor=pointer]
          - link "오늘의 영어 Do you have this in a bigger size? 이거 더 큰 사이즈 있나요? 시작하기 · 3문장 · 90초" [ref=e88] [cursor=pointer]:
            - /url: /study
            - generic [ref=e89]: 오늘의 영어
            - generic [ref=e90]: Do you have this in a bigger size?
            - generic [ref=e91]: 이거 더 큰 사이즈 있나요?
            - generic [ref=e92]: 시작하기 · 3문장 · 90초
        - generic [ref=e93]:
          - generic [ref=e94]:
            - img "김천시 직지사" [ref=e95]
            - generic [ref=e96]: 김천시 직지사
          - generic [ref=e99]:
            - generic [ref=e100]: 10월에 가기 좋은 곳
            - generic [ref=e101]: 경북 김천시
            - generic [ref=e102]: 직지사의 평화와 사명대사 공원
            - generic [ref=e103]: 가기 좋은 때 4·5, 9·10월
            - generic [ref=e104]:
              - button "담기" [ref=e105] [cursor=pointer]
              - link "자세히" [ref=e108] [cursor=pointer]:
                - /url: /map?sel=kr:47150
              - link "여기 기록" [ref=e109] [cursor=pointer]:
                - /url: /record?place=kr:47150
        - link "교토 작년 가을 교토 단풍 여행 2025년 가을" [ref=e110] [cursor=pointer]:
          - /url: /trips/dlUHOmrWeKNPfsUGiNoH
          - generic [ref=e111]: 교토
          - generic [ref=e112]:
            - generic [ref=e113]: 작년 가을
            - generic [ref=e114]: 교토 단풍 여행
            - generic [ref=e115]: 2025년 가을
        - generic [ref=e118]:
          - generic [ref=e119]:
            - heading "최근에 남긴 기록" [level=2] [ref=e120]
            - link "전체 보기" [ref=e121] [cursor=pointer]:
              - /url: /trips
          - generic [ref=e122]:
            - link "부산 여행 부산 · 날짜 모름" [ref=e123] [cursor=pointer]:
              - /url: /trips/C5xrvOpxsdtro67SdDdu
              - generic [ref=e125]:
                - generic [ref=e126]: 부산 여행
                - generic [ref=e127]: 부산 · 날짜 모름
            - link "교토 단풍 여행 일본 교토 · 2025년 가을" [ref=e128] [cursor=pointer]:
              - /url: /trips/dlUHOmrWeKNPfsUGiNoH
              - generic [ref=e130]:
                - generic [ref=e131]: 교토 단풍 여행
                - generic [ref=e132]: 일본 교토 · 2025년 가을
            - link "강릉시 여행 강원 강릉시 · 2024년쯤 엄마와 함께" [ref=e133] [cursor=pointer]:
              - /url: /trips/kpU6eAbO99suDQTV76ZH
              - generic [ref=e135]:
                - generic [ref=e136]: 강릉시 여행
                - generic [ref=e137]: 강원 강릉시 · 2024년쯤
                - generic [ref=e138]: 엄마와 함께
      - navigation "주 메뉴" [ref=e140]:
        - link "홈" [ref=e141] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=e144] [cursor=pointer]:
          - /url: /trips
        - button "기록하기" [ref=e147] [cursor=pointer]
        - link "지도" [ref=e150] [cursor=pointer]:
          - /url: /map
        - link [ref=e153] [cursor=pointer]:
          - /url: /feed
      - link "보라에게 물어봐":
        - /url: /ask
        - generic [aria-hidden]: 물어봐요
    - status:
      - generic [ref=e157]:
        - generic [ref=e158]: 부산에 핀을 꽂았어요 · 처음 가본 곳! 2번째 시·군이에요
        - button "되돌리기" [ref=e159] [cursor=pointer]
  - iframe [aria-hidden] [ref=e160]
```

# Test source

```ts
  135 |     // 보라로 들어와도 같은 공간
  136 |     await signIn(page, 'bora@example.com');
  137 |     await expect(page.getByTestId('headline')).toBeVisible();
  138 |     await page.goto('/space');
  139 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  140 |   });
  141 | 
  142 |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  143 |     await signIn(page, OWNER);
  144 |     await page.getByRole('button', { name: '기록하기', exact: true }).click();
  145 |     await page.getByRole('menuitem', { name: /다녀온 곳 기록하기/ }).click();
  146 |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  147 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  148 |     await page.getByLabel('연도').selectOption('2024');
  149 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
  150 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  151 |     await shot(page, '03-record');
  152 |     await page.getByTestId('save').click();
  153 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  154 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  155 |     await expectMapDrawn(page);
  156 |     await shot(page, '04-detail');
  157 |   });
  158 | 
  159 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  160 |     await signIn(page, OWNER);
  161 |     await page.goto('/record');
  162 |     await pickPlace(page, '일본', '일본');
  163 |     await page.getByPlaceholder(/도시/).fill('교토');
  164 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  165 |     await page.getByRole('button', { name: '계절', exact: true }).click();
  166 |     await page.getByLabel('연도').selectOption('2025');
  167 |     await page.getByRole('button', { name: '가을' }).click();
  168 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  169 |     await page.getByTestId('save').click();
  170 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  171 |   });
  172 | 
  173 |   test('여행 목록과 필터', async ({ page }) => {
  174 |     await signIn(page, OWNER);
  175 |     await page.goto('/trips');
  176 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  177 |     await page.getByRole('button', { name: /^해외/ }).click();
  178 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  179 |     await page.getByRole('button', { name: /^전체/ }).click();
  180 |     await shot(page, '05-trips');
  181 |   });
  182 | 
  183 |   test('홈 통계와 지도', async ({ page }) => {
  184 |     await signIn(page, OWNER);
  185 |     await expect(page.getByTestId('headline')).toHaveText('2번의 여행, 핀 2개');
  186 |     await expectMapDrawn(page);
  187 |     await shot(page, '06-home');
  188 |     await page.goto('/map');
  189 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  190 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  191 |     await expectMapDrawn(page);
  192 |     await page.waitForTimeout(800);
  193 |     await shot(page, '07-map');
  194 |     await page.getByRole('tab', { name: '세계' }).click();
  195 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  196 |     await page.waitForTimeout(1200);
  197 |     await expectMapDrawn(page);
  198 |     await shot(page, '08-map-world');
  199 |   });
  200 | 
  201 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  202 |     await signIn(page, OWNER);
  203 |     await expectMapDrawn(page);
  204 |     // 부산을 누른다
  205 |     await tapLngLat(page, 129.06, 35.2);
  206 |     const sheet = page.getByTestId('region-sheet');
  207 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
  208 |     await expect(sheet).toContainText('아직 안 가본 곳');
  209 |     // 여행정보: 볼거리·먹거리, 더보기로 구·군
  210 |     const info = sheet.getByTestId('region-info');
  211 |     await expect(info).toContainText('볼거리');
  212 |     await info.getByRole('button', { name: /더보기/ }).click();
  213 |     await expect(info).toContainText('해운대구');
  214 |     await shot(page, '09a-region-info');
  215 |     await info.getByRole('button', { name: '접기' }).click();
  216 |     await sheet.getByTestId('quick-pin').click();
  217 |     await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
  218 |     await expect(sheet).toContainText('다녀왔어요');
  219 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  220 |     // 되돌리기
  221 |     await page.getByRole('button', { name: '되돌리기' }).click();
  222 |     await expect(sheet).toContainText('아직 안 가본 곳');
  223 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
  224 |     // 다시 꽂아 둔다
  225 |     await sheet.getByTestId('quick-pin').click();
  226 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  227 |     await expect(page.getByTestId('headline')).toHaveText('3번의 여행, 핀 3개');
  228 |     await shot(page, '09-sheet');
  229 |     await sheet.getByRole('button', { name: '닫기' }).click();
  230 |     await expect(sheet).toHaveCount(0);
  231 | 
  232 |     // 확대하면 시·군 이름이 보이고, 다녀온 곳은 진하게
  233 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [128.95, 35.25], zoom: 7.6 }));
  234 |     const busan = page.locator('.map-label', { hasText: /^부산$/ });
> 235 |     await expect(busan).toBeVisible();
      |                         ^ Error: expect(locator).toBeVisible() failed
  236 |     await expect(busan).toHaveClass(/\bon\b/);
  237 |     await expect(page.locator('.map-label', { hasText: /^김해시$/ })).toBeVisible();
  238 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  239 |     await shot(page, '09b-labels-cells');
  240 | 
  241 |     // 큰 지도: 중간 확대에서는 도 이름
  242 |     await page.goto('/map');
  243 |     await expectMapDrawn(page);
  244 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [127.9, 36.3], zoom: 6.1 }));
  245 |     await expect(page.locator('.map-label.province', { hasText: '강원' })).toHaveClass(/\bon\b/);
  246 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).toBeVisible();
  247 |     await expect(page.locator('.map-label.province', { hasText: '경남' })).not.toHaveClass(/\bon\b/);
  248 |     await shot(page, '09c-labels-provinces');
  249 | 
  250 |     // 세계: 나라 이름, 다녀온 일본은 진하게
  251 |     await page.getByRole('tab', { name: '세계' }).click();
  252 |     await page.waitForTimeout(900);
  253 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [131, 35], zoom: 3.4 }));
  254 |     await expect(page.locator('.map-label.country', { hasText: /^일본$/ })).toHaveClass(/\bon\b/);
  255 |     await expect(page.locator('.map-label.country', { hasText: /^한국$/ })).toHaveClass(/\bon\b/);
  256 |     await shot(page, '09d-labels-world');
  257 | 
  258 |     // 우리 공간에는 더 이상 가져오기 버튼이 없다
  259 |     await page.goto('/space');
  260 |     await expect(page.getByText('백업 파일 내려받기')).toBeVisible();
  261 |     await expect(page.getByText(/가져오기/)).toHaveCount(0);
  262 |   });
  263 | 
  264 |   test('가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기', async ({ page }) => {
  265 |     await signIn(page, OWNER);
  266 |     // 비어 있으면 홈에 이번 달 추천 3곳
  267 |     const homeWishes = page.getByTestId('home-wishes');
  268 |     await expect(homeWishes).toContainText('가고 싶은 곳 3곳만 담아볼까요?');
  269 |     await expect(homeWishes.getByRole('button', { name: '담기' })).toHaveCount(3);
  270 |     await expectMapDrawn(page);
  271 |     // 추천지 이름을 누르면 지도의 지역 창이 열려 자세히 보고 바로 기록할 수 있다
  272 |     const firstPick = homeWishes.getByTestId('pick-detail').first();
  273 |     const pickName = (await firstPick.getAttribute('aria-label'))!.replace(' 자세히 보기', '');
  274 |     await firstPick.click();
  275 |     await expect(page).toHaveURL(/\/map\?sel=/);
  276 |     // 창 제목은 '전북 순창'처럼 시·군을 뗀 이름: 앞 두 글자(지역 이름 첫머리)로 맞춰 본다
  277 |     await expect(page.getByTestId('region-sheet').getByTestId('sheet-title')).toContainText(pickName.split(' ').pop()!.slice(0, 2));
  278 |     await expect(page.getByTestId('region-sheet').getByRole('link', { name: '자세히 기록' })).toBeVisible();
  279 |     // 오늘의 추천 사진 카드에도 자세히·기록하기
  280 |     await page.goto('/');
  281 |     await expect(page.getByTestId('month-pick-detail')).toBeVisible();
  282 |     await expect(page.getByTestId('month-pick-record')).toHaveAttribute('href', /\/record\?place=kr:\d+/);
  283 |     await expectMapDrawn(page);
  284 | 
  285 |     // 지도에서 제주를 눌러 하트로 담기 → 알림의 '메모 쓰기'
  286 |     await tapLngLat(page, 126.55, 33.38);
  287 |     const sheet = page.getByTestId('region-sheet');
  288 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('제주');
  289 |     await sheet.getByTestId('sheet-wish').click();
  290 |     await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
  291 |     await page.getByRole('button', { name: '메모 쓰기' }).click();
  292 |     await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  293 | 
  294 |     // 고치기: 둘 다 원해요, 1순위, 가볼 곳
  295 |     await expect(page.getByRole('button', { name: /제주 빼기/ })).toBeVisible();
  296 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  297 |     await expect(page.getByText('둘 다 원해요')).toBeVisible();
  298 |     await page.getByRole('button', { name: '1순위' }).click();
  299 |     await page.getByLabel('가볼 곳').fill('성산일출봉\n우도');
  300 |     await page.getByTestId('wish-save').click();
  301 |     // 저장하면 들어왔던 화면(홈)으로 돌아간다
  302 |     await expect(page.getByRole('status')).toContainText('고쳤어요');
  303 |     await expect(page).toHaveURL(/:5174\/$/);
  304 |     await page.goto('/wishes');
  305 |     const card = page.getByTestId('wish-card').filter({ hasText: '제주' });
  306 |     await expect(card).toContainText('둘 다 원해요');
  307 |     await expect(card).toContainText('가볼 곳 성산일출봉 외 1');
  308 |     await expect(card.getByLabel('1순위')).toBeVisible();
  309 |     await shot(page, '10-wishes');
  310 | 
  311 |     // 여행 만들기 → 예정된 여행, 카드는 '예정'
  312 |     await card.getByTestId('wish-plan').click();
  313 |     await expect(page).toHaveURL(/status=planned/);
  314 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  315 |     await page.getByTestId('save').click();
  316 |     await expect(page.getByTestId('trip-title')).toHaveText('제주 여행');
  317 |     await page.goto('/wishes');
  318 |     await expect(page.getByTestId('wish-card').filter({ hasText: '제주' })).toContainText('예정');
  319 | 
  320 |     // 지도에 깃발
  321 |     await page.goto('/map');
  322 |     await expectMapDrawn(page);
  323 |     await expect(page.getByTestId('wish-flag')).toHaveCount(1);
  324 |     // 깃발이 실제로 제주 위에 그려졌는지 (위치 확인)
  325 |     const jeju = await page.evaluate(() => {
  326 |       const w = window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } };
  327 |       return w.__map.project([126.55, 33.38]);
  328 |     });
  329 |     const mapBox = (await page.getByTestId('map').first().boundingBox())!;
  330 |     const flagBox = (await page.getByTestId('wish-flag').boundingBox())!;
  331 |     expect(Math.abs(flagBox.x + flagBox.width / 2 - (mapBox.x + jeju.x))).toBeLessThan(40);
  332 |     expect(Math.abs(flagBox.y + flagBox.height - (mapBox.y + jeju.y))).toBeLessThan(40);
  333 |     await shot(page, '10b-map-flags');
  334 | 
  335 |     // 여행지 뽑기: 강원 · 바다 → 담기
```