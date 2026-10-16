# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다
- Location: tests/human.spec.ts:139:3

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator:  getByTestId('region-sheet').getByTestId('quick-pin')
Expected: in viewport
Received: viewport ratio 0.369140625
Timeout:  15000ms

Call log:
  - Expect "toBeInViewport" getByTestId('region-sheet').getByTestId('quick-pin') with timeout 15000ms
  - waiting for getByTestId('region-sheet').getByTestId('quick-pin')
    34 × locator resolved to <button class="btn" data-testid="quick-pin">…</button>
       - unexpected value "viewport ratio 0.369140625"

```

```yaml
- button "다녀왔어요"
```

# Test source

```ts
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
  75  |   const pt = await page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  76  |   const box = await page.getByTestId('map').first().boundingBox();
  77  |   if (!box) throw new Error('지도가 없어요');
  78  |   await page.mouse.click(box.x + pt.x, box.y + pt.y);
  79  | }
  80  | 
  81  | /** 화면 폭을 넘어 삐져나간 요소 (가로 스크롤 상자 안은 제외) */
  82  | function overflowing(page: Page) {
  83  |   return page.evaluate(() => {
  84  |     const vw = document.documentElement.clientWidth;
  85  |     const scrollsX = (el: Element) => {
  86  |       for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  87  |         const s = getComputedStyle(p);
  88  |         if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
  89  |       }
  90  |       return false;
  91  |     };
  92  |     const bad: string[] = [];
  93  |     for (const el of document.querySelectorAll('body *')) {
  94  |       const r = el.getBoundingClientRect();
  95  |       if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
  96  |       if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
  97  |         bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  98  |       }
  99  |     }
  100 |     return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  101 |   });
  102 | }
  103 | 
  104 | test.describe('사람처럼 쓰기', () => {
  105 |   test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
  106 |     const page = await phone(browser);
  107 |     await googleSignIn(page);
  108 |     await page.reload();
  109 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  110 |     await expect(page.getByTestId('login')).toHaveCount(0);
  111 |     await page.context().close();
  112 |   });
  113 | 
  114 |   test('375px: 손으로 입력해 기록하고, 새로 고침해도 남아 있다', async ({ browser }) => {
  115 |     const page = await phone(browser);
  116 |     await googleSignIn(page);
  117 |     await page.getByRole('link', { name: '기록하기' }).click();
  118 |     // 장소: 한 글자씩 쳐서 찾기
  119 |     await page.getByLabel('어디 검색').click();
  120 |     await page.keyboard.type('경주', { delay: 60 });
  121 |     await page.getByRole('option', { name: /경주시/ }).first().click();
  122 |     await expect(page.getByRole('button', { name: /경주시 빼기/ })).toBeVisible();
  123 |     await page.getByLabel('제목').click();
  124 |     await page.keyboard.type('경주 첫 벚꽃 여행', { delay: 30 });
  125 |     await page.getByTestId('save').click();
  126 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행');
  127 |     const url = page.url();
  128 |     // 새로 고침해도 그대로
  129 |     await page.reload();
  130 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행', { timeout: 20_000 });
  131 |     expect(page.url()).toBe(url);
  132 |     await page.goto('/trips');
  133 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible();
  134 |     await page.reload();
  135 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible({ timeout: 20_000 });
  136 |     await page.context().close();
  137 |   });
  138 | 
  139 |   test('375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다', async ({ browser }) => {
  140 |     const page = await phone(browser);
  141 |     await signIn(page);
  142 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  143 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  144 |     // 전주 (꾸밈 사진이 있는 지역)
  145 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  146 |     await tapLngLat(page, 127.15, 35.82);
  147 |     const sheet = page.getByTestId('region-sheet');
  148 |     await expect(sheet.getByTestId('sheet-title')).toContainText('전주');
  149 |     // 가장 많이 쓰는 버튼은 창을 열자마자 보여야 한다 (스크롤해야 보이면 안 됨)
> 150 |     await expect(sheet.getByTestId('quick-pin')).toBeInViewport({ ratio: 1 });
      |                                                  ^ Error: expect(locator).toBeInViewport() failed
  151 |     await sheet.getByTestId('quick-pin').click();
  152 |     await expect(page.getByRole('status')).toContainText('핀을 꽂았어요');
  153 |     await sheet.getByRole('button', { name: '닫기' }).click();
  154 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  155 |     const after = await page.getByTestId('headline').textContent();
  156 |     await page.reload();
  157 |     await expect(page.getByTestId('headline')).toHaveText(after ?? '', { timeout: 20_000 });
  158 |     await page.context().close();
  159 |   });
  160 | 
  161 |   test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
  162 |     const page = await phone(browser);
  163 |     await signIn(page);
  164 |     await page.goto('/record');
  165 | 
  166 |     // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
  167 |     await page.getByLabel('어디 검색').click();
  168 |     const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
  169 |     await page.keyboard.press('Enter');
  170 |     await place.commit('강릉');
  171 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
  172 |     await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
  173 |     // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
  174 |     await page.keyboard.press('Enter');
  175 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  176 | 
  177 |     // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
  178 |     const who = page.getByLabel('함께 간 사람 이름');
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
```