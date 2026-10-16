# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄
- Location: tests/human.spec.ts:297:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByLabel(/네이버/)
Expected: 1
Received: 2
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" getByLabel(/네이버/) with timeout 15000ms
  - waiting for getByLabel(/네이버/)
    3 × locator resolved to 0 elements
      - unexpected value "0"
    31 × locator resolved to 2 elements
       - unexpected value "2"

```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e5]:
        - button "뒤로" [ref=f2e6] [cursor=pointer]
        - heading "장소 남기기" [level=1] [ref=f2e9]
      - generic [ref=f2e10]:
        - generic [ref=f2e11]:
          - generic [ref=f2e12]: 네이버지도에서 공유한 글 붙여넣기 (선택)
          - textbox "네이버지도 공유 글" [ref=f2e13]:
            - /placeholder: "[네이버지도]\n가게 이름\nhttps://naver.me/…"
        - generic [ref=f2e14]:
          - generic [ref=f2e15]: 이름*
          - textbox "장소 이름" [ref=f2e16]:
            - /placeholder: "예: 초당할머니순두부"
        - generic [ref=f2e17]:
          - generic [ref=f2e18]: 종류
          - generic [ref=f2e19]:
            - button "맛집" [ref=f2e20] [cursor=pointer]
            - button "카페" [ref=f2e21] [cursor=pointer]
            - button "볼거리" [ref=f2e22] [cursor=pointer]
            - button "숙소" [ref=f2e23] [cursor=pointer]
            - button "쇼핑" [ref=f2e24] [cursor=pointer]
            - button "기타" [ref=f2e25] [cursor=pointer]
        - generic [ref=f2e26]:
          - generic [ref=f2e27]: 어디*
          - textbox "어디 검색" [ref=f2e33]:
            - /placeholder: 강릉, ㄱㄹ, 일본, 교토…
        - generic [ref=f2e34]:
          - generic [ref=f2e35]: 한 줄 평
          - generic [ref=f2e36]:
            - generic [aria-hidden] [ref=f2e37]: 보
            - textbox "보라 한 줄 평" [ref=f2e38]:
              - /placeholder: 어땠어요?
          - generic [ref=f2e39]:
            - generic [aria-hidden] [ref=f2e40]: 영
            - textbox "영상 한 줄 평" [ref=f2e41]:
              - /placeholder: 어땠어요?
        - generic [ref=f2e42]:
          - generic [ref=f2e43]: 다시 간다면
          - generic [ref=f2e44]:
            - button "또 갈래요" [ref=f2e45] [cursor=pointer]
            - button "한 번이면 충분" [ref=f2e46] [cursor=pointer]
            - button "별로" [ref=f2e47] [cursor=pointer]
        - generic [ref=f2e48]:
          - generic [ref=f2e49]: 네이버지도 링크 · 주소 (선택)
          - textbox "네이버지도 링크" [ref=f2e50]:
            - /placeholder: https://naver.me/…
          - textbox "주소" [ref=f2e51]
        - generic [ref=f2e52]:
          - generic [ref=f2e53]: 메모
          - textbox "장소 메모" [ref=f2e54]:
            - /placeholder: 주문한 메뉴, 웨이팅, 주차…
        - button "남기기" [disabled] [ref=f2e55]
    - status
  - iframe [aria-hidden] [ref=f2e56]
```

# Test source

```ts
  202 |     await page.getByRole('option', { name: /단양군/ }).first().click();
  203 |     await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
  204 |     await page.getByRole('button', { name: '몰라요' }).click();
  205 |     await page.getByTestId('save').click();
  206 |     await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
  207 |     await page.getByRole('tab', { name: /사진/ }).click();
  208 |     await expect(page.getByTestId('photos-empty')).toBeVisible();
  209 |     const grid = page.getByTestId('photo-grid');
  210 | 
  211 |     const drag = (files: { name: string; type: string; b64: string }[]) =>
  212 |       page.evaluateHandle((fs) => {
  213 |         const dt = new DataTransfer();
  214 |         for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
  215 |         return dt;
  216 |       }, files);
  217 | 
  218 |     // 글 파일은 올리지 않는다
  219 |     const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
  220 |     await grid.dispatchEvent('dragenter', { dataTransfer: txt });
  221 |     await grid.dispatchEvent('dragover', { dataTransfer: txt });
  222 |     await grid.dispatchEvent('drop', { dataTransfer: txt });
  223 |     await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');
  224 | 
  225 |     // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
  226 |     const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
  227 |     await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
  228 |     await grid.dispatchEvent('dragover', { dataTransfer: jpg });
  229 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
  230 |     await grid.dispatchEvent('drop', { dataTransfer: jpg });
  231 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
  232 |     await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
  233 |     await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
  234 |     await expect(page.getByTestId('photos-empty')).toHaveCount(0);
  235 | 
  236 |     // 새로 고침해도 사진이 남아 있다
  237 |     await page.reload();
  238 |     await page.getByRole('tab', { name: /사진/ }).click();
  239 |     await expect(page.getByTestId('photo-grid').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 20_000 });
  240 |     await page.context().close();
  241 |   });
  242 | 
  243 |   test('375px: 어느 화면도 옆으로 넘치지 않는다', async ({ browser }) => {
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
> 302 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
      |                                          ^ Error: expect(locator).toHaveCount(expected) failed
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
  344 |     await expect(spot).toHaveCount(1);
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