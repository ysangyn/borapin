# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 국내 여행 기록 (초성 검색, 연도만)
- Location: tests/app.spec.ts:195:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: '추가', exact: true }) resolved to 2 elements:
    1) <button type="button" class="btn soft sm">추가</button> aka getByRole('button', { name: '추가' }).first()
    2) <button disabled type="button" class="btn sm" data-testid="record-stop-add">추가</button> aka getByTestId('record-stop-add')

Call log:
  - waiting for getByRole('button', { name: '추가', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - button "뒤로" [ref=e6] [cursor=pointer]
        - heading "기록 남기기" [level=1] [ref=e9]
      - generic [ref=e10]:
        - generic [ref=e11]: 어디와 언제만 있으면 남길 수 있어요.
        - generic [ref=e12]:
          - generic [ref=e13]:
            - generic [ref=e14]: 종류
            - radiogroup "종류" [ref=e15]:
              - radio "여행" [checked] [ref=e16] [cursor=pointer]
              - radio "나들이" [ref=e17] [cursor=pointer]
          - radiogroup "다녀왔어요 또는 갈 거예요" [ref=e19]:
            - radio "다녀왔어요" [checked] [ref=e20] [cursor=pointer]
            - radio "갈 거예요" [ref=e21] [cursor=pointer]
        - link "맛집·카페 한 곳만 남기나요? 여기는 여행 기록이에요. 가게 하나는 '맛집·카페 담기'에서 한 줄 평·순위와 함께 남겨요" [ref=e22] [cursor=pointer]:
          - /url: /places/new?region=kr:51150
          - generic [ref=e25]:
            - generic [ref=e26]: 맛집·카페 한 곳만 남기나요?
            - generic [ref=e27]: 여기는 여행 기록이에요. 가게 하나는 '맛집·카페 담기'에서 한 줄 평·순위와 함께 남겨요
        - generic [ref=e30]:
          - generic [ref=e31]: 어디*
          - generic [ref=e32]:
            - button "강원 강릉시 빼기" [ref=e34] [cursor=pointer]: 강원 강릉시
            - textbox "어디 검색" [ref=e43]:
              - /placeholder: 강릉, ㄱㄹ, 일본, 교토…
          - generic [ref=e44]:
            - generic [ref=e45]: 볼거리 안목 커피거리 · 오죽헌 · 선교장 · 경포대
            - generic [ref=e46]: 먹거리 초당 순두부 · 강릉 장칼국수 · 꼬막비빔밥
            - generic [ref=e47]: 가기 좋은 때 4~6, 9·10월 · 선선하고 비가 적어요
            - generic [ref=e48]: 가는 길 KTX 강릉역 7km · 양양공항 41km
        - generic [ref=e49]:
          - generic [ref=e50]: 언제* (대략이어도 돼요)
          - generic [ref=e51]:
            - button "날짜" [ref=e52] [cursor=pointer]
            - button "몇 월" [ref=e53] [cursor=pointer]
            - button "계절" [ref=e54] [cursor=pointer]
            - button "몇 년" [pressed] [ref=e55] [cursor=pointer]
            - button "몰라요" [ref=e56] [cursor=pointer]
          - combobox "연도" [ref=e58]:
            - option "2028년"
            - option "2027년"
            - option "2026년"
            - option "2025년"
            - option "2024년" [selected]
            - option "2023년"
            - option "2022년"
            - option "2021년"
            - option "2020년"
            - option "2019년"
            - option "2018년"
            - option "2017년"
            - option "2016년"
            - option "2015년"
            - option "2014년"
            - option "2013년"
            - option "2012년"
            - option "2011년"
            - option "2010년"
            - option "2009년"
            - option "2008년"
            - option "2007년"
            - option "2006년"
            - option "2005년"
            - option "2004년"
            - option "2003년"
            - option "2002년"
            - option "2001년"
            - option "2000년"
            - option "1999년"
            - option "1998년"
            - option "1997년"
            - option "1996년"
            - option "1995년"
            - option "1994년"
            - option "1993년"
            - option "1992년"
            - option "1991년"
            - option "1990년"
            - option "1989년"
            - option "1988년"
            - option "1987년"
            - option "1986년"
            - option "1985년"
            - option "1984년"
            - option "1983년"
            - option "1982년"
            - option "1981년"
            - option "1980년"
        - generic [ref=e59]:
          - generic [ref=e60]: 누구와
          - generic [ref=e61]:
            - button "보라" [pressed] [ref=e62] [cursor=pointer]
            - button "영상" [pressed] [ref=e65] [cursor=pointer]
          - generic [ref=e68]:
            - textbox "함께 간 사람 이름" [active] [ref=e69]:
              - /placeholder: 함께 간 사람 이름 (엄마, 동생…)
              - text: 엄마
            - button "추가" [ref=e70] [cursor=pointer]
        - generic [ref=e71]:
          - generic [ref=e72]: 들른 맛집·명소 (선택 · 한 줄 평은 나중에 써도 돼요)
          - generic [ref=e73]:
            - textbox "들른 곳 이름" [ref=e74]:
              - /placeholder: 가게·명소 이름
            - combobox "종류" [ref=e75]:
              - option "맛집" [selected]
              - option "카페"
              - option "볼거리"
              - option "쇼핑"
              - option "숙소"
              - option "기타"
            - button "추가" [disabled] [ref=e76]
        - generic [ref=e77]:
          - generic [ref=e78]: 제목
          - textbox "제목" [ref=e79]:
            - /placeholder: 강릉시 여행
        - generic [ref=e80]:
          - generic [ref=e81]: 사진 (선택 · 남기면 같이 올라가요)
          - button "사진 고르기" [ref=e83] [cursor=pointer]
        - generic [ref=e87]:
          - generic [ref=e88]: 메모
          - textbox "메모" [ref=e89]:
            - /placeholder: 안 써도 돼요
        - button "기록 남기기" [ref=e90] [cursor=pointer]
    - status
  - iframe [aria-hidden] [ref=e91]
```

# Test source

```ts
  103 |     const nextHub = page.getByTestId('next-hub');
  104 |     await expect(nextHub.getByRole('link', { name: '여행지 뽑기' })).toHaveAttribute('href', '/wishes?find=dice');
  105 |     // 해외 예정 여행이 없으면 오늘의 영어는 큰 카드 대신 한 줄 링크
  106 |     await expect(nextHub.getByTestId('hub-english')).toHaveCount(0);
  107 |     await expect(nextHub.getByTestId('hub-english-line')).toHaveAttribute('href', '/study');
  108 |     await nextHub.getByRole('link', { name: '여행지 뽑기' }).click();
  109 |     await expect(page.getByTestId('dice-roll')).toBeVisible();
  110 |   });
  111 | 
  112 |   test('피드는 둘의 소식만: 일반 소식 묶음이 없고, 비어 있으면 다음 단추가 있다', async ({ page }) => {
  113 |     await signIn(page, OWNER);
  114 |     await page.goto('/feed');
  115 |     await expect(page.getByTestId('feed')).toBeVisible();
  116 |     await expect(page.getByTestId('feed-empty')).toBeVisible({ timeout: 15_000 });
  117 |     await expect(page.getByTestId('news-digest')).toHaveCount(0);
  118 |     await expect(page.getByTestId('feed-empty-wish')).toHaveAttribute('href', '/wishes');
  119 |     await page.getByTestId('feed-empty-record').click();
  120 |     await expect(page).toHaveURL(/\/record$/);
  121 |   });
  122 | 
  123 |   test('초대 링크: 관리자가 만들고 → 링크로 온 사람이 로그인하면 바로 들어온다 (한 번만)', async ({ page, browser }) => {
  124 |     await signIn(page, OWNER);
  125 |     await page.goto('/space');
  126 |     await page.getByLabel('초대 이름').fill('막내');
  127 |     await page.getByTestId('invite-make').click();
  128 |     await expect(page.getByRole('status')).toContainText('초대 링크를 만들었어요');
  129 |     const row = page.getByTestId('invite-row').first();
  130 |     await expect(row).toContainText('막내 초대');
  131 |     const url = (await row.getByTestId('invite-url').textContent())!.trim();
  132 |     expect(url).toMatch(/\/join\/[a-z0-9]{8,}$/);
  133 |     await shot(page, '02b-invite');
  134 | 
  135 |     // 새 사람: 링크를 열면 로그인 화면에 '초대 링크로 오셨네요', 로그인하면 들어가기 화면 → 들어가기
  136 |     const ctx = await browser.newContext({ locale: 'ko-KR' });
  137 |     const p2 = await ctx.newPage();
  138 |     await p2.goto(url);
  139 |     await expect(p2.getByTestId('login-invite')).toBeVisible();
  140 |     await p2.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  141 |     await p2.evaluate(() => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn('newbie@example.com'));
  142 |     await expect(p2.getByTestId('join')).toContainText('보라핀에 초대받았어요');
  143 |     await expect(p2.getByTestId('join')).toContainText('막내');
  144 |     await shot(p2, '02c-join');
  145 |     await p2.getByTestId('join-go').click();
  146 |     // 처음 들어오면 환영 3장면: 어서 와요 → 내 이름(바꾸면 공간 문서의 names에 내 칸만) → 우리 집 → 지도
  147 |     await expect(p2.getByTestId('welcome')).toBeVisible({ timeout: 20_000 });
  148 |     await expect(p2.getByTestId('welcome')).toContainText('어서 와요');
  149 |     await p2.getByTestId('welcome-next').click();
  150 |     await p2.getByLabel('내 이름').fill('막내둥이');
  151 |     await p2.getByTestId('welcome-name-next').click();
  152 |     await expect(p2.getByRole('status')).toContainText('막내둥이로 불려요');
  153 |     await p2.getByTestId('welcome-done').click();
  154 |     await expect(p2.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
  155 |     await p2.goto('/space');
  156 |     await expect(p2.getByText('막내둥이', { exact: true })).toBeVisible();
  157 |     await ctx.close();
  158 |     // 관리자 화면에서 그 링크는 사라졌고(한 번 쓰면 끝), 막내가 함께 쓰는 사람에 있다
  159 |     await page.reload();
  160 |     await expect(page.getByTestId('invite-row')).toHaveCount(0);
  161 |     await expect(page.getByText('newbie@example.com')).toBeVisible();
  162 |     // 정리: 막내를 빼서 다음 시험들이 둘만 있는 공간을 보게
  163 |     await page.getByLabel('newbie@example.com 빼기').click();
  164 |     await page.getByRole('button', { name: '빼기', exact: true }).click();
  165 |     await expect(page.getByText('newbie@example.com')).toHaveCount(0);
  166 |   });
  167 | 
  168 |   test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
  169 |     await signIn(page, 'stranger@example.com');
  170 |     await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
  171 |     // 다음에 뭘 해야 하는지와 복사할 메일 주소가 보인다
  172 |     await expect(page.getByText(/우리 공간 → 함께 쓰는 사람 → 추가/)).toBeVisible();
  173 |     await expect(page.getByTestId('denied-mail')).toContainText('stranger@example.com');
  174 |     await shot(page, '10-denied');
  175 |     await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
  176 |     await signIn(page, OWNER);
  177 |     // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
  178 |     await page.goto('/space');
  179 |     await expect(page.getByTestId('space-title')).toHaveText('영상');
  180 |     await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
  181 |     await page.getByLabel('추가할 계정').fill('bora@example.com');
  182 |     await page.getByRole('textbox', { name: '부를 이름' }).fill('보라');
  183 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  184 |     await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
  185 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  186 |     await shot(page, '11-space');
  187 |     await page.getByRole('button', { name: '로그아웃' }).click();
  188 |     // 보라로 들어와도 같은 공간
  189 |     await signIn(page, 'bora@example.com');
  190 |     await expect(page.getByTestId('headline')).toBeVisible();
  191 |     await page.goto('/space');
  192 |     await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  193 |   });
  194 | 
  195 |   test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
  196 |     await signIn(page, OWNER);
  197 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  198 |     await page.getByRole('menuitem', { name: /여행 기록 남기기/ }).click();
  199 |     await pickPlace(page, 'ㄱㄹ', '강릉시');
  200 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  201 |     await page.getByLabel('연도').selectOption('2024');
  202 |     await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
> 203 |     await page.getByRole('button', { name: '추가', exact: true }).click();
      |                                                                 ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: '추가', exact: true }) resolved to 2 elements:
  204 |     await shot(page, '03-record');
  205 |     await page.getByTestId('save').click();
  206 |     await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
  207 |     await expect(page.getByText('2024년쯤')).toBeVisible();
  208 |     await expectMapDrawn(page);
  209 |     await shot(page, '04-detail');
  210 |   });
  211 | 
  212 |   test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
  213 |     await signIn(page, OWNER);
  214 |     await page.goto('/record');
  215 |     await pickPlace(page, '일본', '일본');
  216 |     await page.getByPlaceholder(/도시/).fill('교토');
  217 |     await page.getByRole('button', { name: '도시 넣기' }).click();
  218 |     await page.getByRole('button', { name: '계절', exact: true }).click();
  219 |     await page.getByLabel('연도').selectOption('2025');
  220 |     await page.getByRole('button', { name: '가을' }).click();
  221 |     await page.getByLabel('제목').fill('교토 단풍 여행');
  222 |     await page.getByTestId('save').click();
  223 |     await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  224 |   });
  225 | 
  226 |   test('여행 목록과 필터', async ({ page }) => {
  227 |     await signIn(page, OWNER);
  228 |     await page.goto('/trips');
  229 |     await expect(page.getByTestId('trip-row')).toHaveCount(2);
  230 |     await page.getByRole('button', { name: /^해외/ }).click();
  231 |     await expect(page.getByTestId('trip-row')).toHaveCount(1);
  232 |     await page.getByRole('button', { name: /^전체/ }).click();
  233 |     await shot(page, '05-trips');
  234 |   });
  235 | 
  236 |   test('홈 통계와 지도', async ({ page }) => {
  237 |     await signIn(page, OWNER);
  238 |     // 횟수는 우리말로 (times): '2번'이 아니라 '두 번'
  239 |     await expect(page.getByTestId('headline')).toContainText('두 번의 여행,핀 2개 꽂았어요');
  240 |     await expectMapDrawn(page);
  241 |     await shot(page, '06-home');
  242 |     await page.goto('/map');
  243 |     await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
  244 |     await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
  245 |     await expectMapDrawn(page);
  246 |     await page.waitForTimeout(800);
  247 |     await shot(page, '07-map');
  248 |     await page.getByRole('tab', { name: '세계' }).click();
  249 |     await expect(page.getByTestId('map-stats')).toContainText('나라 1');
  250 |     await page.waitForTimeout(1200);
  251 |     await expectMapDrawn(page);
  252 |     await shot(page, '08-map-world');
  253 |   });
  254 | 
  255 |   test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
  256 |     await signIn(page, OWNER);
  257 |     await expectMapDrawn(page);
  258 |     // 부산을 누른다
  259 |     await tapLngLat(page, 129.06, 35.2);
  260 |     const sheet = page.getByTestId('region-sheet');
  261 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
  262 |     await expect(sheet).toContainText('아직 안 가본 곳');
  263 |     // 여행정보: 볼거리·먹거리, 더보기로 구·군
  264 |     const info = sheet.getByTestId('region-info');
  265 |     await expect(info).toContainText('볼거리');
  266 |     await info.getByRole('button', { name: /더보기/ }).click();
  267 |     await expect(info).toContainText('해운대구');
  268 |     await shot(page, '09a-region-info');
  269 |     await info.getByRole('button', { name: '접기' }).click();
  270 |     await sheet.getByTestId('quick-pin').click();
  271 |     await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
  272 |     await expect(sheet).toContainText('다녀왔어요');
  273 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  274 |     // 되돌리기
  275 |     await page.getByRole('button', { name: '되돌리기' }).click();
  276 |     await expect(sheet).toContainText('아직 안 가본 곳');
  277 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
  278 |     // 다시 꽂아 둔다
  279 |     await sheet.getByTestId('quick-pin').click();
  280 |     await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
  281 |     // 꽃 지도: 핀만 꽂아도 고장 꽃 따라 보랏빛으로 물들기 시작 (지도 칸 자료에 물빛 색이 들어가고, 시트에 한 줄)
  282 |     await expect(sheet.getByTestId('plant-line')).toContainText('보랏빛으로 물들기 시작했어요');
  283 |     await expect.poll(() => page.evaluate(() => {
  284 |       const m = (window as unknown as { __map: { querySourceFeatures: (s: string) => { properties: Record<string, unknown> }[] } }).__map;
  285 |       return m.querySourceFeatures('kr').find((f) => f.properties.cell === '26')?.properties.wash ?? null;
  286 |     })).toMatch(/^#[0-9A-F]{6}$/);
  287 |     await expect(page.getByTestId('headline')).toContainText('세 번의 여행,핀 3개 꽂았어요');
  288 |     await shot(page, '09-sheet');
  289 |     await sheet.getByRole('button', { name: '닫기' }).click();
  290 |     await expect(sheet).toHaveCount(0);
  291 | 
  292 |     // 확대하면 시·군 이름이 보이고, 다녀온 곳은 진하게
  293 |     await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [128.95, 35.25], zoom: 7.6 }));
  294 |     // 이름표는 숨길 때 지우지 않고 display:none으로 두므로(끌 때 같이 움직이게), 보이는 것만 고른다
  295 |     const busan = page.locator('.map-label:visible', { hasText: /^부산$/ });
  296 |     await expect(busan).toBeVisible();
  297 |     await expect(busan).toHaveClass(/\bon\b/);
  298 |     await expect(page.locator('.map-label:visible', { hasText: /^김해시$/ })).toBeVisible();
  299 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  300 |     await shot(page, '09b-labels-cells');
  301 | 
  302 |     // 큰 지도: 중간 확대에서는 도 이름
  303 |     await page.goto('/map');
```