# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 손으로 입력해 기록하고, 새로 고침해도 남아 있다
- Location: tests/human.spec.ts:122:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: '기록하기' }) resolved to 2 elements:
    1) <a class="btn sm glass" data-discover="true" href="/record?place=kr:52" data-testid="month-pick-record">여기 기록하기</a> aka getByTestId('month-pick-record')
    2) <a class="plus" href="/record" aria-label="기록하기" data-discover="true">…</a> aka getByRole('link', { name: '기록하기', exact: true })

Call log:
  - waiting for getByRole('link', { name: '기록하기' })

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
          - generic [ref=e22]: 3번의 여행, 핀 3개
        - generic [ref=e23]:
          - generic [ref=e24]:
            - tablist [ref=e25]:
              - tab "국내" [selected] [ref=e26] [cursor=pointer]
              - tab "세계" [ref=e27] [cursor=pointer]
            - link "지도 크게 보기" [ref=e28] [cursor=pointer]:
              - /url: /map
          - generic [ref=e29]:
            - generic [ref=e30]:
              - generic:
                - region "Map" [ref=e31]
                - generic [aria-hidden]:
                  - generic: 두 손가락으로 움직여 주세요
            - generic [ref=e32]:
              - button "확대" [ref=e33] [cursor=pointer]
              - separator [ref=e36]
              - button "축소" [ref=e37] [cursor=pointer]
              - separator [ref=e39]
              - button "전체 보기" [ref=e40] [cursor=pointer]
          - generic [ref=e43]: 지역을 누르면 바로 핀을 꽂을 수 있어요 · ⛶ 를 누르면 전국이 보여요
          - generic [ref=e44]:
            - generic [ref=e45]:
              - text: "2"
              - generic [ref=e46]: 다녀온 시·군
            - generic [ref=e47]:
              - text: "1"
              - generic [ref=e48]: 해외 나라
            - generic [ref=e49]:
              - text: "3"
              - generic [ref=e50]: 여행·나들이
            - generic [ref=e51]:
              - text: "1"
              - generic [ref=e52]: 예정
        - textbox "보라에게 물어봐" [ref=e54]:
          - /placeholder: "보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳"
        - generic [ref=e55]:
          - generic [ref=e56]:
            - heading "다음 여행 준비" [level=2] [ref=e57]
            - link "가고 싶은 곳 1곳" [ref=e58] [cursor=pointer]:
              - /url: /wishes
          - generic [ref=e59]:
            - link "다음 여행 제주 여행 2026년쯤" [ref=e60] [cursor=pointer]:
              - /url: /trips/TGXVsrMOg7ZwyC4BZtkm
              - generic [ref=e61]:
                - generic [ref=e62]: 다음 여행
                - generic [ref=e63]: 제주 여행
                - generic [ref=e64]: 2026년쯤
            - link "강원 동해시 그다음은 여기 · 영상" [ref=e68] [cursor=pointer]:
              - /url: /wishes/gfOnj3E1xT4oxDH80MWQ
              - generic [ref=e69]: 강원 동해시
              - generic [ref=e70]: 그다음은 여기 · 영상
          - generic [ref=e71]:
            - generic [ref=e72]: 오늘의 한 질문
            - paragraph [ref=e73]: 제주 가는 길에 들렀다 가고 싶은 곳은?
            - generic [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]: 나
                - generic [ref=e77]: 흑돼지랑 고기국수
                - button "메모에 넣기" [ref=e78] [cursor=pointer]
              - generic [ref=e79]: 상대가 답하면 서로의 답이 열려요
          - link "오늘의 영어 Could we have extra towels? 수건을 더 받을 수 있을까요? 시작하기 · 3문장 · 90초" [ref=e83] [cursor=pointer]:
            - /url: /study
            - generic [ref=e84]: 오늘의 영어
            - generic [ref=e85]: Could we have extra towels?
            - generic [ref=e86]: 수건을 더 받을 수 있을까요?
            - generic [ref=e87]: 시작하기 · 3문장 · 90초
          - generic [ref=e88]:
            - generic [ref=e89]: 제주 가는 길
            - button "가기 좋은 때 5·6, 9~11월 · 덥지도 춥지도 않아요" [ref=e91] [cursor=pointer]
        - generic [ref=e95]:
          - generic [ref=e96]:
            - img "전주 한옥마을" [ref=e97]
            - generic [ref=e98]: 전주 한옥마을
          - generic [ref=e101]:
            - generic [ref=e102]: 10월에 가기 좋은 곳
            - generic [ref=e103]: 전북 전주시
            - generic [ref=e104]: 한옥의 곡선과 선비의 풍류가 머무는 곳
            - generic [ref=e105]: 가기 좋은 때 4·5, 9·10월
            - generic [ref=e106]:
              - button "가고 싶은 곳에 담기" [ref=e107] [cursor=pointer]
              - link "자세히" [ref=e110] [cursor=pointer]:
                - /url: /map?sel=kr:52
              - link "여기 기록하기" [ref=e111] [cursor=pointer]:
                - /url: /record?place=kr:52
        - link "교토 작년 가을 교토 단풍 여행 2025년 가을" [ref=e112] [cursor=pointer]:
          - /url: /trips/FgiAbLerENNP4QjjykDZ
          - generic [ref=e113]: 교토
          - generic [ref=e114]:
            - generic [ref=e115]: 작년 가을
            - generic [ref=e116]: 교토 단풍 여행
            - generic [ref=e117]: 2025년 가을
        - generic [ref=e120]:
          - generic [ref=e121]:
            - heading "최근에 남긴 기록" [level=2] [ref=e122]
            - link "전체 보기" [ref=e123] [cursor=pointer]:
              - /url: /trips
          - generic [ref=e124]:
            - link "경남 보라의 통영 나들이 경남 통영시 · 날짜 모름" [ref=e125] [cursor=pointer]:
              - /url: /trips/SuFD98snwHScA730SNRb
              - generic [ref=e126]: 경남
              - generic [ref=e127]:
                - generic [ref=e128]: 보라의 통영 나들이
                - generic [ref=e129]: 경남 통영시 · 날짜 모름
            - link "부산 여행 부산 · 날짜 모름" [ref=e130] [cursor=pointer]:
              - /url: /trips/i7C7FuPHZxkRb4O9oyE3
              - generic [ref=e132]:
                - generic [ref=e133]: 부산 여행
                - generic [ref=e134]: 부산 · 날짜 모름
            - link "일본 교토 단풍 여행 일본 교토 · 2025년 가을" [ref=e135] [cursor=pointer]:
              - /url: /trips/FgiAbLerENNP4QjjykDZ
              - generic [ref=e136]: 일본
              - generic [ref=e137]:
                - generic [ref=e138]: 교토 단풍 여행
                - generic [ref=e139]: 일본 교토 · 2025년 가을
      - navigation "주 메뉴" [ref=e140]:
        - link "홈" [ref=e141] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=e144] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=e147] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=e150] [cursor=pointer]:
          - /url: /map
        - link "새 소식 1개 피드" [ref=e153] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 1개" [ref=e157]
          - text: 피드
      - link "보라에게 물어봐" [ref=e158] [cursor=pointer]:
        - /url: /ask
        - generic [aria-hidden] [ref=e159]: 물어봐요
    - status
  - iframe [aria-hidden] [ref=e160]
```

# Test source

```ts
  25  | test.afterEach(() => {
  26  |   const p = problems.splice(0);
  27  |   expect(p, p.join('\n')).toEqual([]);
  28  | });
  29  | 
  30  | async function phone(browser: Browser, width = 375, height = 667) {
  31  |   const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  32  |   return watch(await ctx.newPage());
  33  | }
  34  | async function desktop(browser: Browser) {
  35  |   const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  36  |   return watch(await ctx.newPage());
  37  | }
  38  | 
  39  | /** 빠른 로그인 (구글 창 시험이 아닌 곳에서) */
  40  | async function signIn(page: Page, email = OWNER) {
  41  |   await page.goto('/');
  42  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  43  |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  44  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  45  | }
  46  | 
  47  | /** 구글 로그인: 버튼 → (에뮬레이터의) 구글 계정 창 → 계정 고르기 */
  48  | async function googleSignIn(page: Page, email = OWNER, name = '영상') {
  49  |   await page.goto('/');
  50  |   const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByTestId('login').click()]);
  51  |   await popup.waitForLoadState();
  52  |   const existing = popup.locator('#accounts-list').getByText(email);
  53  |   if (await existing.count()) {
  54  |     await existing.first().click();
  55  |   } else {
  56  |     await popup.locator('#add-account-button').click();
  57  |     await popup.locator('#email-input').fill(email);
  58  |     await popup.locator('#display-name-input').fill(name);
  59  |     await popup.locator('#sign-in').click();
  60  |   }
  61  |   await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  62  | }
  63  | 
  64  | /** IME로 한글을 조합하는 중 (아직 확정 전) */
  65  | async function composeKorean(page: Page, steps: string[]) {
  66  |   const cdp = await page.context().newCDPSession(page);
  67  |   for (const t of steps) await cdp.send('Input.imeSetComposition', { text: t, selectionStart: t.length, selectionEnd: t.length });
  68  |   return {
  69  |     commit: (text: string) => cdp.send('Input.insertText', { text }),
  70  |   };
  71  | }
  72  | 
  73  | /** 지도 위 경도·위도 지점을 누른다 */
  74  | async function tapLngLat(page: Page, lng: number, lat: number) {
  75  |   const project = () => page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  76  |   const box = await page.getByTestId('map').first().boundingBox();
  77  |   if (!box) throw new Error('지도가 없어요');
  78  |   let pt = await project();
  79  |   // 홈 지도는 최근 핀 둘레만 보여 주므로, 누를 곳이 화면 밖이면 사람처럼 '전체 보기'를 먼저 누른다
  80  |   if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) {
  81  |     await page.getByRole('button', { name: '전체 보기' }).click();
  82  |     await page.waitForFunction(() => (window as unknown as { __map: { isMoving: () => boolean } }).__map.isMoving() === false);
  83  |     await page.waitForTimeout(150);
  84  |     pt = await project();
  85  |   }
  86  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  87  | }
  88  | 
  89  | /** 화면 폭을 넘어 삐져나간 요소 (가로 스크롤 상자 안은 제외) */
  90  | function overflowing(page: Page) {
  91  |   return page.evaluate(() => {
  92  |     const vw = document.documentElement.clientWidth;
  93  |     const scrollsX = (el: Element) => {
  94  |       for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  95  |         const s = getComputedStyle(p);
  96  |         if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
  97  |       }
  98  |       return false;
  99  |     };
  100 |     const bad: string[] = [];
  101 |     for (const el of document.querySelectorAll('body *')) {
  102 |       const r = el.getBoundingClientRect();
  103 |       if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
  104 |       if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
  105 |         bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  106 |       }
  107 |     }
  108 |     return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  109 |   });
  110 | }
  111 | 
  112 | test.describe('사람처럼 쓰기', () => {
  113 |   test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
  114 |     const page = await phone(browser);
  115 |     await googleSignIn(page);
  116 |     await page.reload();
  117 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  118 |     await expect(page.getByTestId('login')).toHaveCount(0);
  119 |     await page.context().close();
  120 |   });
  121 | 
  122 |   test('375px: 손으로 입력해 기록하고, 새로 고침해도 남아 있다', async ({ browser }) => {
  123 |     const page = await phone(browser);
  124 |     await googleSignIn(page);
> 125 |     await page.getByRole('link', { name: '기록하기' }).click();
      |                                                    ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: '기록하기' }) resolved to 2 elements:
  126 |     // 장소: 한 글자씩 쳐서 찾기
  127 |     await page.getByLabel('어디 검색').click();
  128 |     await page.keyboard.type('경주', { delay: 60 });
  129 |     await page.getByRole('option', { name: /경주시/ }).first().click();
  130 |     await expect(page.getByRole('button', { name: /경주시 빼기/ })).toBeVisible();
  131 |     await page.getByLabel('제목').click();
  132 |     await page.keyboard.type('경주 첫 벚꽃 여행', { delay: 30 });
  133 |     // 언제를 안 골랐으면 저장 버튼 아래에 무엇이 빠졌는지 알려 준다
  134 |     await expect(page.getByTestId('save')).toBeDisabled();
  135 |     await expect(page.getByTestId('save-hint')).toContainText('대략 언제');
  136 |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  137 |     await page.getByLabel('연도').selectOption('2024');
  138 |     await expect(page.getByTestId('save-hint')).toHaveCount(0);
  139 |     await page.getByTestId('save').click();
  140 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행');
  141 |     const url = page.url();
  142 |     // 새로 고침해도 그대로
  143 |     await page.reload();
  144 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행', { timeout: 20_000 });
  145 |     expect(page.url()).toBe(url);
  146 |     await page.goto('/trips');
  147 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible();
  148 |     await page.reload();
  149 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible({ timeout: 20_000 });
  150 |     await page.context().close();
  151 |   });
  152 | 
  153 |   test('375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다', async ({ browser }) => {
  154 |     const page = await phone(browser);
  155 |     await signIn(page);
  156 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  157 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  158 |     // 전주 (꾸밈 사진이 있는 지역)
  159 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  160 |     await tapLngLat(page, 127.15, 35.82);
  161 |     const sheet = page.getByTestId('region-sheet');
  162 |     await expect(sheet.getByTestId('sheet-title')).toContainText('전주');
  163 |     // 가장 많이 쓰는 버튼은 창을 열자마자 보여야 한다 (스크롤해야 보이면 안 됨)
  164 |     await expect(sheet.getByTestId('quick-pin')).toBeInViewport({ ratio: 1 });
  165 |     await sheet.getByTestId('quick-pin').click();
  166 |     await expect(page.getByRole('status')).toContainText('핀을 꽂았어요');
  167 |     await sheet.getByRole('button', { name: '닫기' }).click();
  168 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  169 |     const after = await page.getByTestId('headline').textContent();
  170 |     await page.reload();
  171 |     await expect(page.getByTestId('headline')).toHaveText(after ?? '', { timeout: 20_000 });
  172 |     await page.context().close();
  173 |   });
  174 | 
  175 |   test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
  176 |     const page = await phone(browser);
  177 |     await signIn(page);
  178 |     await page.goto('/record');
  179 | 
  180 |     // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
  181 |     await page.getByLabel('어디 검색').click();
  182 |     const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
  183 |     await page.keyboard.press('Enter');
  184 |     await place.commit('강릉');
  185 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
  186 |     await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
  187 |     // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
  188 |     await page.keyboard.press('Enter');
  189 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  190 | 
  191 |     // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
  192 |     const who = page.getByLabel('함께 간 사람 이름');
  193 |     await who.click();
  194 |     const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
  195 |     await page.keyboard.press('Enter');
  196 |     await name.commit('할머니');
  197 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
  198 |     await expect(who).toHaveValue('할머니');
  199 |     await page.keyboard.press('Enter');
  200 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
  201 |     await expect(who).toHaveValue('');
  202 |     await page.context().close();
  203 |   });
  204 | 
  205 |   test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
  206 |     const page = await desktop(browser);
  207 |     await signIn(page);
  208 |     // PC 양옆엔 흐린 배경 장면이 붙는다 (폰에선 없음)
  209 |     await expect(page.getByTestId('backdrop')).toBeAttached({ timeout: 10_000 });
  210 |     await page.goto('/record');
  211 |     await page.getByLabel('어디 검색').fill('단양');
  212 |     await page.getByRole('option', { name: /단양군/ }).first().click();
  213 |     await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
  214 |     await page.getByRole('button', { name: '몰라요' }).click();
  215 |     await page.getByTestId('save').click();
  216 |     await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
  217 |     await page.getByRole('tab', { name: /사진/ }).click();
  218 |     await expect(page.getByTestId('photos-empty')).toBeVisible();
  219 |     const grid = page.getByTestId('photo-grid');
  220 | 
  221 |     const drag = (files: { name: string; type: string; b64: string }[]) =>
  222 |       page.evaluateHandle((fs) => {
  223 |         const dt = new DataTransfer();
  224 |         for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
  225 |         return dt;
```