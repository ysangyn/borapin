# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다
- Location: tests/human.spec.ts:195:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('region-sheet').getByTestId('sheet-wish').or(getByTestId('region-sheet').getByTestId('sheet-wished'))
Expected pattern: /담기|담겼어요/
Received string:  "가고 싶어요"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('region-sheet').getByTestId('sheet-wish').or(getByTestId('region-sheet').getByTestId('sheet-wished')) with timeout 15000ms
  - waiting for getByTestId('region-sheet').getByTestId('sheet-wish').or(getByTestId('region-sheet').getByTestId('sheet-wished'))
    34 × locator resolved to <button class="btn coral-soft" aria-label="가고 싶은 곳에 담기" data-testid="sheet-wish">…</button>
       - unexpected value "가고 싶어요"

```

```yaml
- button "가고 싶은 곳에 담기": 가고 싶어요
```

# Test source

```ts
  109 |       return false;
  110 |     };
  111 |     const bad: string[] = [];
  112 |     for (const el of document.querySelectorAll('body *')) {
  113 |       const r = el.getBoundingClientRect();
  114 |       if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
  115 |       if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
  116 |         bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  117 |       }
  118 |     }
  119 |     return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  120 |   });
  121 | }
  122 | 
  123 | test.describe('사람처럼 쓰기', () => {
  124 |   test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
  125 |     const page = await phone(browser);
  126 |     await googleSignIn(page);
  127 |     await page.reload();
  128 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  129 |     await expect(page.getByTestId('login')).toHaveCount(0);
  130 |     await page.context().close();
  131 |   });
  132 | 
  133 |   test('로그인 화면에서 이용약관 링크를 눌러 열고 로고로 돌아와도 화면이 살아 있다', async ({ browser }) => {
  134 |     // 약관 화면은 로그인 없이 보는 길(early return)이라, 앱 안에서 오갈 때 훅 개수가 달라지면 흰 화면이 됐다
  135 |     const page = await phone(browser);
  136 |     await page.goto('/');
  137 |     await expect(page.getByTestId('login')).toBeVisible();
  138 |     await page.getByRole('link', { name: '이용약관' }).click();
  139 |     await expect(page).toHaveURL(/\/terms$/);
  140 |     await expect(page.getByRole('heading', { name: '이용약관', level: 1 })).toBeVisible();
  141 |     // 약관 화면끼리도 오간다
  142 |     await page.getByRole('link', { name: '개인정보 처리방침' }).click();
  143 |     await expect(page).toHaveURL(/\/privacy$/);
  144 |     // 로고를 누르면 로그인 화면으로 돌아오고, 오류 화면이 아니어야 한다
  145 |     await page.getByRole('link', { name: /보라핀 로고/ }).click();
  146 |     await expect(page).toHaveURL(/\/$/);
  147 |     await expect(page.getByTestId('login')).toBeVisible();
  148 |     await expect(page.getByText('이 화면을 여는 중에 문제가 생겼어요')).toHaveCount(0);
  149 |     // 로그인한 뒤 우리 공간의 약관 링크로도 같은 길을 오간다
  150 |     await signIn(page);
  151 |     await page.goto('/space');
  152 |     await page.getByRole('link', { name: '이용약관' }).click();
  153 |     await expect(page.getByRole('heading', { name: '이용약관', level: 1 })).toBeVisible();
  154 |     await page.getByRole('link', { name: /보라핀 로고/ }).click();
  155 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  156 |     await expect(page.getByText('이 화면을 여는 중에 문제가 생겼어요')).toHaveCount(0);
  157 |     await page.context().close();
  158 |   });
  159 | 
  160 |   test('375px: 손으로 입력해 기록하고, 새로 고침해도 남아 있다', { tag: '@webkit' }, async ({ browser }) => {
  161 |     const page = await phone(browser);
  162 |     await googleSignIn(page);
  163 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  164 |     await page.getByRole('menuitem', { name: /여행 기록 남기기/ }).click();
  165 |     // 단추 말과 알림 말이 같은 동사: '기록 남기기' → '기록했어요'
  166 |     await expect(page.getByTestId('save')).toHaveText('기록 남기기');
  167 |     // 장소: 한 글자씩 쳐서 찾기
  168 |     await page.getByLabel('어디 검색').click();
  169 |     await page.keyboard.type('경주', { delay: 60 });
  170 |     await page.getByRole('option', { name: /경주시/ }).first().click();
  171 |     await expect(page.getByRole('button', { name: /경주시 빼기/ })).toBeVisible();
  172 |     await page.getByLabel('제목').click();
  173 |     await page.keyboard.type('경주 첫 벚꽃 여행', { delay: 30 });
  174 |     // 언제를 안 골랐으면 저장 버튼 아래에 무엇이 빠졌는지 알려 준다
  175 |     await expect(page.getByTestId('save')).toBeDisabled();
  176 |     await expect(page.getByTestId('save-hint')).toContainText('언제인지 골라');
  177 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  178 |     await page.getByLabel('연도').selectOption('2024');
  179 |     await expect(page.getByTestId('save-hint')).toHaveCount(0);
  180 |     await page.getByTestId('save').click();
  181 |     await expect(page.getByRole('status')).toContainText('기록했어요');
  182 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행');
  183 |     const url = page.url();
  184 |     // 새로 고침해도 그대로
  185 |     await page.reload();
  186 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행', { timeout: 20_000 });
  187 |     expect(page.url()).toBe(url);
  188 |     await page.goto('/trips');
  189 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible();
  190 |     await page.reload();
  191 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible({ timeout: 20_000 });
  192 |     await page.context().close();
  193 |   });
  194 | 
  195 |   test('375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다', { tag: '@webkit' }, async ({ browser }) => {
  196 |     const page = await phone(browser);
  197 |     await signIn(page);
  198 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  199 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  200 |     // 전주 (꾸밈 사진이 있는 지역)
  201 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  202 |     await tapLngLat(page, 127.15, 35.82);
  203 |     const sheet = page.getByTestId('region-sheet');
  204 |     await expect(sheet.getByTestId('sheet-title')).toContainText('전주');
  205 |     // 가장 많이 쓰는 버튼은 창을 열자마자 보여야 한다 (스크롤해야 보이면 안 됨)
  206 |     await expect(sheet.getByTestId('quick-pin')).toBeInViewport({ ratio: 1 });
  207 |     // 단추 '핀 꽂기' → 알림 '핀을 꽂았어요'. 가고 싶은 곳 담기는 하트가 아니라 핀 모양 '담기'
  208 |     await expect(sheet.getByTestId('quick-pin')).toContainText('핀 꽂기');
> 209 |     await expect(sheet.getByTestId('sheet-wish').or(sheet.getByTestId('sheet-wished'))).toContainText(/담기|담겼어요/);
      |                                                                                         ^ Error: expect(locator).toContainText(expected) failed
  210 |     await sheet.getByTestId('quick-pin').click();
  211 |     await expect(page.getByRole('status')).toContainText('핀을 꽂았어요');
  212 |     // 아래로 끌어서 닫기 (손잡이를 잡고 200px 내림)
  213 |     // 사파리(WebKit)는 new Touch()를 막아서, 손가락 자리만 담은 터치 이벤트를 만들어 보낸다 (앱은 touches[0].clientY만 읽음)
  214 |     await page.evaluate(() => {
  215 |       const grip = document.querySelector('[data-testid="region-sheet"] .grip')!;
  216 |       const r = grip.getBoundingClientRect(), x = r.left + r.width / 2;
  217 |       const fire = (type: string, y: number | null) => {
  218 |         const ev = new Event(type, { bubbles: true, cancelable: true });
  219 |         const list = y == null ? [] : [{ identifier: 1, target: grip, clientX: x, clientY: y }];
  220 |         for (const k of ['touches', 'targetTouches']) Object.defineProperty(ev, k, { value: list });
  221 |         Object.defineProperty(ev, 'changedTouches', { value: [{ identifier: 1, target: grip, clientX: x, clientY: y ?? r.top + 200 }] });
  222 |         grip.dispatchEvent(ev);
  223 |       };
  224 |       fire('touchstart', r.top);
  225 |       for (const d of [20, 60, 120, 200]) fire('touchmove', r.top + d);
  226 |       fire('touchend', null);
  227 |     });
  228 |     await expect(sheet).toHaveCount(0);
  229 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  230 |     const after = await page.getByTestId('headline').textContent();
  231 |     await page.reload();
  232 |     await expect(page.getByTestId('headline')).toHaveText(after ?? '', { timeout: 20_000 });
  233 |     await page.context().close();
  234 |   });
  235 | 
  236 |   test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
  237 |     const page = await phone(browser);
  238 |     await signIn(page);
  239 |     await page.goto('/record');
  240 | 
  241 |     // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
  242 |     await page.getByLabel('어디 검색').click();
  243 |     const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
  244 |     await page.keyboard.press('Enter');
  245 |     await place.commit('강릉');
  246 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
  247 |     await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
  248 |     // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
  249 |     await page.keyboard.press('Enter');
  250 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  251 | 
  252 |     // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
  253 |     const who = page.getByLabel('함께 간 사람 이름');
  254 |     await who.click();
  255 |     const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
  256 |     await page.keyboard.press('Enter');
  257 |     await name.commit('할머니');
  258 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
  259 |     await expect(who).toHaveValue('할머니');
  260 |     await page.keyboard.press('Enter');
  261 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
  262 |     await expect(who).toHaveValue('');
  263 |     await page.context().close();
  264 |   });
  265 | 
  266 |   test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
  267 |     const page = await desktop(browser);
  268 |     await signIn(page);
  269 |     // PC 양옆엔 흐린 배경 장면이 붙는다 (폰에선 없음)
  270 |     await expect(page.getByTestId('backdrop')).toBeAttached({ timeout: 10_000 });
  271 |     await page.goto('/record');
  272 |     await page.getByLabel('어디 검색').fill('단양');
  273 |     await page.getByRole('option', { name: /단양군/ }).first().click();
  274 |     await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
  275 |     await page.getByRole('button', { name: '몰라요' }).click();
  276 |     await page.getByTestId('save').click();
  277 |     await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
  278 |     await page.getByRole('tab', { name: /사진/ }).click();
  279 |     await expect(page.getByTestId('photos-empty')).toBeVisible();
  280 |     const grid = page.getByTestId('photo-grid');
  281 | 
  282 |     const drag = (files: { name: string; type: string; b64: string }[]) =>
  283 |       page.evaluateHandle((fs) => {
  284 |         const dt = new DataTransfer();
  285 |         for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
  286 |         return dt;
  287 |       }, files);
  288 | 
  289 |     // 글 파일은 올리지 않는다
  290 |     const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
  291 |     await grid.dispatchEvent('dragenter', { dataTransfer: txt });
  292 |     await grid.dispatchEvent('dragover', { dataTransfer: txt });
  293 |     await grid.dispatchEvent('drop', { dataTransfer: txt });
  294 |     await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');
  295 | 
  296 |     // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
  297 |     const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
  298 |     await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
  299 |     await grid.dispatchEvent('dragover', { dataTransfer: jpg });
  300 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
  301 |     await grid.dispatchEvent('drop', { dataTransfer: jpg });
  302 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
  303 |     await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
  304 |     await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
  305 |     await expect(page.getByTestId('photos-empty')).toHaveCount(0);
  306 | 
  307 |     // 새로 고침해도 사진이 남아 있다
  308 |     await page.reload();
  309 |     await page.getByRole('tab', { name: /사진/ }).click();
```