# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다
- Location: tests/human.spec.ts:330:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[data-testid="place-spot"][data-code="47850"]')
Expected: 1
Received: 0
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" locator('[data-testid="place-spot"][data-code="47850"]') with timeout 15000ms
  - waiting for locator('[data-testid="place-spot"][data-code="47850"]')
    34 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e3]:
      - generic [ref=f4e4]:
        - generic [ref=f4e5]:
          - img "보라핀 로고" [ref=f4e6]
          - text: 보라핀
        - generic [ref=f4e10]:
          - link "찾아보기" [ref=f4e11] [cursor=pointer]:
            - /url: /ask
          - link "우리 공간" [ref=f4e14] [cursor=pointer]:
            - /url: /space
            - generic "보라 · 영상" [ref=f4e15]:
              - generic [ref=f4e16]: 보
              - generic [ref=f4e17]: 영
      - generic [ref=f4e18]:
        - generic [ref=f4e19]:
          - generic [ref=f4e20]: 보라 & 영상의 지도
          - generic [ref=f4e21]: 5번의 여행, 핀 5개
        - generic [ref=f4e22]:
          - generic [ref=f4e23]:
            - tablist [ref=f4e24]:
              - tab "국내" [selected] [ref=f4e25] [cursor=pointer]
              - tab "세계" [ref=f4e26] [cursor=pointer]
            - link "지도 크게 보기" [ref=f4e27] [cursor=pointer]:
              - /url: /map
          - generic [ref=f4e28]:
            - generic [ref=f4e29]:
              - generic:
                - region "Map" [ref=f4e30]
                - generic [aria-hidden]:
                  - generic: 두 손가락으로 움직여 주세요
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
                - generic: "1"
                - generic:
                  - generic "우리 장소 1곳": "1"
            - generic [ref=f4e31]:
              - button "확대" [ref=f4e32] [cursor=pointer]
              - separator [ref=f4e35]
              - button "축소" [ref=f4e36] [cursor=pointer]
              - separator [ref=f4e38]
              - button "전체 보기" [ref=f4e39] [cursor=pointer]
          - generic [ref=f4e42]: 지역을 누르면 바로 핀을 꽂을 수 있어요 · 확대하면 이름이 보여요
          - generic [ref=f4e43]:
            - generic [ref=f4e44]:
              - text: "4"
              - generic [ref=f4e45]: 다녀온 시·군
            - generic [ref=f4e46]:
              - text: "1"
              - generic [ref=f4e47]: 해외 나라
            - generic [ref=f4e48]:
              - text: "5"
              - generic [ref=f4e49]: 여행·나들이
            - generic [ref=f4e50]:
              - text: "0"
              - generic [ref=f4e51]: 예정
        - generic [ref=f4e52]:
          - generic [ref=f4e53]:
            - text: 제주 여행 다녀오셨나요?
            - generic [ref=f4e54]: 날짜가 지났어요. 다녀왔으면 지도에 핀으로 바꿔 둘게요.
          - button "다녀왔어요" [ref=f4e55] [cursor=pointer]
        - generic [ref=f4e56]:
          - generic [ref=f4e57]:
            - heading "가고 싶은 곳" [level=2] [ref=f4e58]
            - link "모두 보기 3" [ref=f4e59] [cursor=pointer]:
              - /url: /wishes
          - generic [ref=f4e60]:
            - generic [ref=f4e62]:
              - link "제주 가고 싶은 곳 보기" [ref=f4e63] [cursor=pointer]:
                - /url: /wishes/7GCdGigLBxwRxfJCN2Wc
                - generic [ref=f4e64]:
                  - text: 제주
                  - generic "1순위" [ref=f4e65]: "1"
                - generic [ref=f4e68]:
                  - generic [ref=f4e69]: 제주
                  - generic [ref=f4e70]:
                    - 'generic "원하는 사람: 영상, 보라" [ref=f4e71]':
                      - generic [ref=f4e72]: 보라
                      - generic [ref=f4e75]: 영상
                    - generic [ref=f4e78]: 둘 다 원해요
                  - generic [ref=f4e79]: 가기 좋은 때 5·6, 9~11월
              - link "예정 · 2026년쯤" [ref=f4e81] [cursor=pointer]:
                - /url: /trips/Vpl1BmEs9ErbJWHu0apA
            - generic [ref=f4e83]:
              - link "강원 고성군 가고 싶은 곳 보기" [ref=f4e84] [cursor=pointer]:
                - /url: /wishes/UD44e6PKEXpbLN5RX1mB
                - generic [ref=f4e85]: 강원
                - generic [ref=f4e86]:
                  - generic [ref=f4e87]: 강원 고성군
                  - 'generic "원하는 사람: 영상" [ref=f4e89]':
                    - generic [ref=f4e90]: 보라
                    - generic [ref=f4e93]: 영상
                  - generic [ref=f4e96]: 가기 좋은 때 5·6, 9·10월
              - link "여행 만들기" [ref=f4e98] [cursor=pointer]:
                - /url: /record?status=planned&place=kr:51820&wish=UD44e6PKEXpbLN5RX1mB
            - generic [ref=f4e100]:
              - link "경남 남해군 가고 싶은 곳 보기" [ref=f4e101] [cursor=pointer]:
                - /url: /wishes/hCVzf0jRxkHWTmqh5sjd
                - generic [ref=f4e102]: 경남
                - generic [ref=f4e103]:
                  - generic [ref=f4e104]: 경남 남해군
                  - 'generic "원하는 사람: 영상" [ref=f4e106]':
                    - generic [ref=f4e107]: 보라
                    - generic [ref=f4e110]: 영상
                  - generic [ref=f4e113]: 가기 좋은 때 4~6, 10·11월
              - link "여행 만들기" [ref=f4e115] [cursor=pointer]:
                - /url: /record?status=planned&place=kr:48840&wish=hCVzf0jRxkHWTmqh5sjd
        - generic [ref=f4e120]:
          - generic [ref=f4e121]:
            - img "서울 경복궁 경회루" [ref=f4e122]
            - generic [ref=f4e123]: 서울 경복궁 경회루
          - generic [ref=f4e126]:
            - generic [ref=f4e127]: 10월에 가기 좋은 곳
            - generic [ref=f4e128]: 서울
            - generic [ref=f4e129]: 과거와 미래가 공존하는 K-컬처의 심장
            - generic [ref=f4e130]: 가기 좋은 때 4~6, 9·10월
            - generic [ref=f4e131]:
              - button "가고 싶은 곳에 담기" [ref=f4e132] [cursor=pointer]
              - link "볼거리 보기" [ref=f4e135] [cursor=pointer]:
                - /url: /ask?q=%EC%84%9C%EC%9A%B8%20%EB%B3%BC%EA%B1%B0%EB%A6%AC
        - link "교토 작년 가을 교토 단풍 여행 2025년 가을" [ref=f4e136] [cursor=pointer]:
          - /url: /trips/HTjE3npYXNtEsiG71nYD
          - generic [ref=f4e137]: 교토
          - generic [ref=f4e138]:
            - generic [ref=f4e139]: 작년 가을
            - generic [ref=f4e140]: 교토 단풍 여행
            - generic [ref=f4e141]: 2025년 가을
        - textbox "찾아보기" [ref=f4e147]:
          - /placeholder: "찾아보기: 영등포 맛집, 작년 여름에 간 곳"
        - generic [ref=f4e148]:
          - generic [ref=f4e149]:
            - heading "최근에 남긴 기록" [level=2] [ref=f4e150]
            - link "전체 보기" [ref=f4e151] [cursor=pointer]:
              - /url: /trips
          - generic [ref=f4e152]:
            - link "충북 단양 끌어다 놓기 여행 충북 단양군 · 날짜 모름" [ref=f4e153] [cursor=pointer]:
              - /url: /trips/iiY8VwVZ65ocDVHkQLaS
              - generic [ref=f4e154]: 충북
              - generic [ref=f4e155]:
                - generic [ref=f4e156]: 단양 끌어다 놓기 여행
                - generic [ref=f4e157]: 충북 단양군 · 날짜 모름
            - link "전북 전주시 여행 전북 전주시 · 날짜 모름 mail.bora와 함께" [ref=f4e158] [cursor=pointer]:
              - /url: /trips/a37et1Na7xJ1WIwz1hv6
              - generic [ref=f4e159]: 전북
              - generic [ref=f4e160]:
                - generic [ref=f4e161]: 전주시 여행
                - generic [ref=f4e162]: 전북 전주시 · 날짜 모름
                - generic [ref=f4e163]: mail.bora와 함께
            - link "경북 경주 첫 벚꽃 여행 경북 경주시 · 2024년쯤" [ref=f4e165] [cursor=pointer]:
              - /url: /trips/uQHr7pWRs1HITFe90uZD
              - generic [ref=f4e166]: 경북
              - generic [ref=f4e167]:
                - generic [ref=f4e168]: 경주 첫 벚꽃 여행
                - generic [ref=f4e169]: 경북 경주시 · 2024년쯤
      - navigation "주 메뉴" [ref=f4e170]:
        - link "홈" [ref=f4e171] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f4e174] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f4e177] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f4e180] [cursor=pointer]:
          - /url: /map
        - link "추억" [ref=f4e183] [cursor=pointer]:
          - /url: /memories
    - status
  - iframe [aria-hidden] [ref=f4e186]
```

# Test source

```ts
  244 |     const page = await phone(browser);
  245 |     await page.goto('/');
  246 |     await expect(page.getByTestId('email-form')).toBeVisible();
  247 |     const found: string[] = [];
  248 |     const check = async (where: string) => {
  249 |       const o = await overflowing(page);
  250 |       if (o.page) found.push(`${where}: ${o.page}`);
  251 |       for (const b of o.bad) found.push(`${where}: ${b}`);
  252 |     };
  253 |     await check('로그인');
  254 |     await signIn(page);
  255 |     const trip = await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href^="/trips/"]')?.getAttribute('href'));
  256 |     for (const route of ['/', '/trips', ...(trip ? [trip] : []), '/record', '/map', '/wishes', '/places', '/memories', '/ask', '/space', '/admin', '/credits']) {
  257 |       await page.goto(route);
  258 |       await page.waitForLoadState('load');
  259 |       await page.waitForTimeout(900);
  260 |       await check(route);
  261 |     }
  262 |     expect(found, found.join('\n')).toEqual([]);
  263 |     await page.context().close();
  264 |   });
  265 | 
  266 |   test('가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다', async ({ browser }) => {
  267 |     const page = await phone(browser);
  268 |     await signIn(page);
  269 |     await page.goto('/wishes/new');
  270 |     await page.getByLabel('어디 검색').fill('남해');
  271 |     await page.getByRole('option', { name: /남해군/ }).first().click();
  272 |     await page.getByTestId('wish-save').click();
  273 |     await expect(page).toHaveURL(/\/wishes$/);
  274 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  275 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  276 |     const back = page.getByRole('button', { name: '뒤로' });
  277 | 
  278 |     // 아무것도 안 바꿨으면 묻지 않고 나간다
  279 |     let asked = '';
  280 |     page.on('dialog', (d) => {
  281 |       asked = d.message();
  282 |       void d.dismiss();
  283 |     });
  284 |     await back.click();
  285 |     await expect(page).toHaveURL(/\/wishes$/);
  286 |     expect(asked).toBe('');
  287 | 
  288 |     // '누가 원해요'만 바꿔도 묻는다 (취소하면 그대로 머문다)
  289 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  290 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  291 |     await back.click();
  292 |     await expect.poll(() => asked).toContain('저장하지 않은 내용');
  293 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  294 |     await page.context().close();
  295 |   });
  296 | 
  297 |   test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
  298 |     const page = await phone(browser);
  299 |     await signIn(page);
  300 |     await page.goto('/places/new');
  301 |     // 네이버지도 입력 칸은 하나뿐
  302 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
  303 |     // 고른 종류에만 눌림·체크 표시
  304 |     const food = page.getByRole('button', { name: '맛집', exact: true });
  305 |     const cafe = page.getByRole('button', { name: '카페', exact: true });
  306 |     await expect(food).toHaveAttribute('aria-pressed', 'true');
  307 |     await expect(food.locator('.chip-check')).toBeVisible();
  308 |     await cafe.click();
  309 |     await expect(cafe).toHaveAttribute('aria-pressed', 'true');
  310 |     await expect(food).toHaveAttribute('aria-pressed', 'false');
  311 |     await expect(food.locator('.chip-check')).toHaveCount(0);
  312 |     const again = page.getByRole('button', { name: '또 갈래요', exact: true });
  313 |     await again.click();
  314 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  315 |     await expect(again.locator('.chip-check')).toBeVisible();
  316 |     // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
  317 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
  318 |     await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
  319 |     await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
  320 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
  321 |     await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
  322 |     // 링크를 빼면 다시 붙여 넣을 수 있다
  323 |     await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
  324 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  325 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  326 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  327 |     await page.context().close();
  328 |   });
  329 | 
  330 |   test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
  331 |     const page = await phone(browser);
  332 |     await signIn(page);
  333 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  334 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  335 |     // 여행 없이 장소만 (칠곡)
  336 |     await page.goto('/places/new');
  337 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  338 |     await page.getByLabel('어디 검색').fill('칠곡');
  339 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  340 |     await page.getByTestId('place-save').click();
  341 |     await page.goto('/');
  342 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  343 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
> 344 |     await expect(spot).toHaveCount(1);
      |                        ^ Error: expect(locator).toHaveCount(expected) failed
  345 |     await expect(spot).toContainText('1');
  346 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  347 |     await expect(page.getByTestId('headline')).toHaveText(before);
  348 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  349 |     await page.goto('/places/new');
  350 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  351 |     await page.getByLabel('어디 검색').fill('칠곡');
  352 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  353 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  354 |     await page.getByTestId('place-save').click();
  355 |     await page.goto('/');
  356 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  357 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  358 |     await page.context().close();
  359 |   });
  360 | 
  361 |   for (const width of [360, 375, 390]) {
  362 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
  363 |       const page = await phone(browser, width, 740);
  364 |       await page.goto('/');
  365 |       const art = page.locator('.login-mascot');
  366 |       await expect(art).toBeVisible();
  367 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  368 |       const a = await art.boundingBox();
  369 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  370 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  371 |         const r = document.createRange();
  372 |         r.selectNodeContents(el);
  373 |         const b = r.getBoundingClientRect();
  374 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  375 |       });
  376 |       const t = await textBox('.login-tag');
  377 |       const b = await textBox('.login-brand');
  378 |       for (const r of [t, b]) {
  379 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  380 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  381 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  382 |       }
  383 |       await page.context().close();
  384 |     });
  385 |   }
  386 | });
  387 | 
```