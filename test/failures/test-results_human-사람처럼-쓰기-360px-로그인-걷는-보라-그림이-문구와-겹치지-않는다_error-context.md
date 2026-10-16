# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 360px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다
- Location: tests/human.spec.ts:260:5

# Error details

```
Error: 그림 {"x":198,"y":123.09375,"width":146,"height":157.890625} / 문구 {"x":28,"y":160.265625,"width":171.453125,"height":23}

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e8]:
      - generic [ref=e9]:
        - img "보라핀 로고" [ref=e11]
        - generic [ref=e15]: 보라핀
      - paragraph [ref=e16]: 가본 곳마다, 우리 핀 하나
    - main [ref=e17]:
      - generic [ref=e18]:
        - radiogroup "로그인 또는 가입" [ref=e19]:
          - radio "로그인" [checked] [ref=e20] [cursor=pointer]
          - radio "처음이에요" [ref=e21] [cursor=pointer]
        - textbox "메일 주소" [ref=e22]
        - textbox "비밀번호" [ref=e23]
        - button "로그인" [disabled] [ref=e24]
        - button "비밀번호를 잊었어요" [ref=e25] [cursor=pointer]
      - generic [ref=e26]: 간편 로그인
      - button "구글로 계속하기" [ref=e28] [cursor=pointer]
      - generic [ref=e34]: 초대받은 메일 주소로만 들어올 수 있어요.
      - generic [ref=e35]:
        - link "이용약관" [ref=e36] [cursor=pointer]:
          - /url: /terms
        - link "개인정보 처리방침" [ref=e37] [cursor=pointer]:
          - /url: /privacy
        - link "사진 출처" [ref=e38] [cursor=pointer]:
          - /url: /credits
  - iframe [aria-hidden] [ref=e39]
```

# Test source

```ts
  179 |     await who.click();
  180 |     const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
  181 |     await page.keyboard.press('Enter');
  182 |     await name.commit('할머니');
  183 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
  184 |     await expect(who).toHaveValue('할머니');
  185 |     await page.keyboard.press('Enter');
  186 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
  187 |     await expect(who).toHaveValue('');
  188 |     await page.context().close();
  189 |   });
  190 | 
  191 |   test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
  192 |     const page = await desktop(browser);
  193 |     await signIn(page);
  194 |     await page.goto('/record');
  195 |     await page.getByLabel('어디 검색').fill('단양');
  196 |     await page.getByRole('option', { name: /단양군/ }).first().click();
  197 |     await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
  198 |     await page.getByTestId('save').click();
  199 |     await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
  200 |     await page.getByRole('tab', { name: /사진/ }).click();
  201 |     await expect(page.getByTestId('photos-empty')).toBeVisible();
  202 |     const grid = page.getByTestId('photo-grid');
  203 | 
  204 |     const drag = (files: { name: string; type: string; b64: string }[]) =>
  205 |       page.evaluateHandle((fs) => {
  206 |         const dt = new DataTransfer();
  207 |         for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
  208 |         return dt;
  209 |       }, files);
  210 | 
  211 |     // 글 파일은 올리지 않는다
  212 |     const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
  213 |     await grid.dispatchEvent('dragenter', { dataTransfer: txt });
  214 |     await grid.dispatchEvent('dragover', { dataTransfer: txt });
  215 |     await grid.dispatchEvent('drop', { dataTransfer: txt });
  216 |     await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');
  217 | 
  218 |     // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
  219 |     const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
  220 |     await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
  221 |     await grid.dispatchEvent('dragover', { dataTransfer: jpg });
  222 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
  223 |     await grid.dispatchEvent('drop', { dataTransfer: jpg });
  224 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
  225 |     await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
  226 |     await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
  227 |     await expect(page.getByTestId('photos-empty')).toHaveCount(0);
  228 | 
  229 |     // 새로 고침해도 사진이 남아 있다
  230 |     await page.reload();
  231 |     await page.getByRole('tab', { name: /사진/ }).click();
  232 |     await expect(page.getByTestId('photo-grid').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 20_000 });
  233 |     await page.context().close();
  234 |   });
  235 | 
  236 |   test('375px: 어느 화면도 옆으로 넘치지 않는다', async ({ browser }) => {
  237 |     const page = await phone(browser);
  238 |     await page.goto('/');
  239 |     await expect(page.getByTestId('email-form')).toBeVisible();
  240 |     const found: string[] = [];
  241 |     const check = async (where: string) => {
  242 |       const o = await overflowing(page);
  243 |       if (o.page) found.push(`${where}: ${o.page}`);
  244 |       for (const b of o.bad) found.push(`${where}: ${b}`);
  245 |     };
  246 |     await check('로그인');
  247 |     await signIn(page);
  248 |     const trip = await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href^="/trips/"]')?.getAttribute('href'));
  249 |     for (const route of ['/', '/trips', ...(trip ? [trip] : []), '/record', '/map', '/wishes', '/places', '/memories', '/ask', '/space', '/admin', '/credits']) {
  250 |       await page.goto(route);
  251 |       await page.waitForLoadState('load');
  252 |       await page.waitForTimeout(900);
  253 |       await check(route);
  254 |     }
  255 |     expect(found, found.join('\n')).toEqual([]);
  256 |     await page.context().close();
  257 |   });
  258 | 
  259 |   for (const width of [360, 375, 390]) {
  260 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
  261 |       const page = await phone(browser, width, 740);
  262 |       await page.goto('/');
  263 |       const art = page.locator('.login-mascot');
  264 |       await expect(art).toBeVisible();
  265 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  266 |       const a = await art.boundingBox();
  267 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  268 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  269 |         const r = document.createRange();
  270 |         r.selectNodeContents(el);
  271 |         const b = r.getBoundingClientRect();
  272 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  273 |       });
  274 |       const t = await textBox('.login-tag');
  275 |       const b = await textBox('.login-brand');
  276 |       for (const r of [t, b]) {
  277 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  278 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
> 279 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
      |                                                                              ^ Error: 그림 {"x":198,"y":123.09375,"width":146,"height":157.890625} / 문구 {"x":28,"y":160.265625,"width":171.453125,"height":23}
  280 |       }
  281 |       await page.context().close();
  282 |     });
  283 |   }
  284 | });
  285 | 
```