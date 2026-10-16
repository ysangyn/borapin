# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다
- Location: tests/human.spec.ts:266:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "저장하지 않은 내용"
Received string:    ""

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e3]:
    - generic [ref=f2e4]:
      - generic [ref=f2e5]:
        - button "뒤로" [ref=f2e6] [cursor=pointer]
        - heading "가고 싶은 곳" [level=1] [ref=f2e9]
      - link "담기" [ref=f2e10] [cursor=pointer]:
        - /url: /wishes/new
    - generic [ref=f2e13]:
      - group "걸러 보기" [ref=f2e14]:
        - button "전체 3" [pressed] [ref=f2e15] [cursor=pointer]
        - button "둘 다 원해요 1" [ref=f2e16] [cursor=pointer]
        - button "국내" [ref=f2e17] [cursor=pointer]
        - button "해외" [ref=f2e18] [cursor=pointer]
      - generic [ref=f2e19]:
        - generic [ref=f2e20]:
          - link "제주 가고 싶은 곳 보기" [ref=f2e21] [cursor=pointer]:
            - /url: /wishes/1qR2cqpQ4x4oEbDEPxpj
            - generic [ref=f2e22]:
              - text: 제주
              - generic "1순위" [ref=f2e23]: "1"
            - generic [ref=f2e26]:
              - generic [ref=f2e27]: 제주
              - generic [ref=f2e28]:
                - 'generic "원하는 사람: 영상, 보라" [ref=f2e29]':
                  - generic [ref=f2e30]: 보라
                  - generic [ref=f2e33]: 영상
                - generic [ref=f2e36]: 둘 다 원해요
              - generic [ref=f2e37]:
                - generic [ref=f2e38]: 지금 가기 좋아요
                - generic [ref=f2e39]: 5·6, 9~11월
              - generic [ref=f2e40]: 가볼 곳 성산일출봉 외 1
          - link "예정 · 2026년쯤" [ref=f2e41] [cursor=pointer]:
            - /url: /trips/IIZwj9VQFkg57flGiS8E
        - generic [ref=f2e42]:
          - link "경남 남해군 가고 싶은 곳 보기" [ref=f2e43] [cursor=pointer]:
            - /url: /wishes/kJrKg29jg1RKVrZ56CCU
            - generic [ref=f2e44]: 경남
            - generic [ref=f2e45]:
              - generic [ref=f2e46]: 경남 남해군
              - 'generic "원하는 사람: 영상" [ref=f2e48]':
                - generic [ref=f2e49]: 보라
                - generic [ref=f2e52]: 영상
              - generic [ref=f2e55]:
                - generic [ref=f2e56]: 지금 가기 좋아요
                - generic [ref=f2e57]: 4~6, 10·11월
          - link "여행 만들기" [ref=f2e58] [cursor=pointer]:
            - /url: /record?status=planned&place=kr:48840&wish=kJrKg29jg1RKVrZ56CCU
        - generic [ref=f2e59]:
          - link "강원 동해시 가고 싶은 곳 보기" [ref=f2e60] [cursor=pointer]:
            - /url: /wishes/HMeYMZGxQe5V87BGqVR0
            - generic [ref=f2e61]: 강원
            - generic [ref=f2e62]:
              - generic [ref=f2e63]: 강원 동해시
              - 'generic "원하는 사람: 영상" [ref=f2e65]':
                - generic [ref=f2e66]: 보라
                - generic [ref=f2e69]: 영상
              - generic [ref=f2e72]:
                - generic [ref=f2e73]: 지금 가기 좋아요
                - generic [ref=f2e74]: 4~6, 9·10월
          - link "여행 만들기" [ref=f2e75] [cursor=pointer]:
            - /url: /record?status=planned&place=kr:51170&wish=HMeYMZGxQe5V87BGqVR0
      - button "여행지 뽑기" [ref=f2e76] [cursor=pointer]
    - navigation "주 메뉴" [ref=f2e79]:
      - link "홈" [ref=f2e80] [cursor=pointer]:
        - /url: /
      - link "여행" [ref=f2e83] [cursor=pointer]:
        - /url: /trips
      - link "기록하기" [ref=f2e86] [cursor=pointer]:
        - /url: /record
      - link "지도" [ref=f2e89] [cursor=pointer]:
        - /url: /map
      - link "추억" [ref=f2e92] [cursor=pointer]:
        - /url: /memories
  - iframe [aria-hidden] [ref=f2e95]
```

# Test source

```ts
  192 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
  193 |     await expect(who).toHaveValue('');
  194 |     await page.context().close();
  195 |   });
  196 | 
  197 |   test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
  198 |     const page = await desktop(browser);
  199 |     await signIn(page);
  200 |     await page.goto('/record');
  201 |     await page.getByLabel('어디 검색').fill('단양');
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
> 292 |     await expect.poll(() => asked).toContain('저장하지 않은 내용');
      |                                    ^ Error: expect(received).toContain(expected) // indexOf
  293 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  294 |     await page.context().close();
  295 |   });
  296 | 
  297 |   for (const width of [360, 375, 390]) {
  298 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
  299 |       const page = await phone(browser, width, 740);
  300 |       await page.goto('/');
  301 |       const art = page.locator('.login-mascot');
  302 |       await expect(art).toBeVisible();
  303 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  304 |       const a = await art.boundingBox();
  305 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  306 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  307 |         const r = document.createRange();
  308 |         r.selectNodeContents(el);
  309 |         const b = r.getBoundingClientRect();
  310 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  311 |       });
  312 |       const t = await textBox('.login-tag');
  313 |       const b = await textBox('.login-brand');
  314 |       for (const r of [t, b]) {
  315 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  316 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  317 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  318 |       }
  319 |       await page.context().close();
  320 |     });
  321 |   }
  322 | });
  323 | 
```