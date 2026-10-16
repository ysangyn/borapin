# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다
- Location: tests/human.spec.ts:145:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('region-sheet').getByTestId('sheet-title')
Expected substring: "전주"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('region-sheet').getByTestId('sheet-title') with timeout 15000ms
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
- text: 보라 & 영상의 지도 3번의 여행, 핀 3개
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
- text: 지역을 누르면 바로 핀을 꽂을 수 있어요 · 확대하면 이름이 보여요 2 다녀온 시·군 1 해외 나라 3 여행·나들이 0 예정
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
- text: 가고 싶은 곳 3곳만 담아볼까요? 경기 군포시 철쭉 꽃물결과 산본의 활기찬 거리
- button "담기"
- text: 경기 과천시 아이들과 함께하는 동물원과 예술 산책
- button "담기"
- text: 충남 아산시 왕실 온천 휴양과 이순신의 얼
- button "담기"
- link "교토 작년 가을 교토 단풍 여행 2025년 가을":
  - /url: /trips/n7ENiZQLDONFNudEX5LY
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "경북 경주 첫 벚꽃 여행 경북 경주시 · 2024년쯤":
  - /url: /trips/crpdRKmzfWBVtAIn0GOs
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
  125 |     // 언제를 안 골랐으면 저장 버튼 아래에 무엇이 빠졌는지 알려 준다
  126 |     await expect(page.getByTestId('save')).toBeDisabled();
  127 |     await expect(page.getByTestId('save-hint')).toContainText('대략 언제');
  128 |     await page.getByRole('button', { name: '몇 년쯤' }).click();
  129 |     await page.getByLabel('연도').selectOption('2024');
  130 |     await expect(page.getByTestId('save-hint')).toHaveCount(0);
  131 |     await page.getByTestId('save').click();
  132 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행');
  133 |     const url = page.url();
  134 |     // 새로 고침해도 그대로
  135 |     await page.reload();
  136 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행', { timeout: 20_000 });
  137 |     expect(page.url()).toBe(url);
  138 |     await page.goto('/trips');
  139 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible();
  140 |     await page.reload();
  141 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible({ timeout: 20_000 });
  142 |     await page.context().close();
  143 |   });
  144 | 
  145 |   test('375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다', async ({ browser }) => {
  146 |     const page = await phone(browser);
  147 |     await signIn(page);
  148 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  149 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  150 |     // 전주 (꾸밈 사진이 있는 지역)
  151 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  152 |     await tapLngLat(page, 127.15, 35.82);
  153 |     const sheet = page.getByTestId('region-sheet');
> 154 |     await expect(sheet.getByTestId('sheet-title')).toContainText('전주');
      |                                                    ^ Error: expect(locator).toContainText(expected) failed
  155 |     // 가장 많이 쓰는 버튼은 창을 열자마자 보여야 한다 (스크롤해야 보이면 안 됨)
  156 |     await expect(sheet.getByTestId('quick-pin')).toBeInViewport({ ratio: 1 });
  157 |     await sheet.getByTestId('quick-pin').click();
  158 |     await expect(page.getByRole('status')).toContainText('핀을 꽂았어요');
  159 |     await sheet.getByRole('button', { name: '닫기' }).click();
  160 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  161 |     const after = await page.getByTestId('headline').textContent();
  162 |     await page.reload();
  163 |     await expect(page.getByTestId('headline')).toHaveText(after ?? '', { timeout: 20_000 });
  164 |     await page.context().close();
  165 |   });
  166 | 
  167 |   test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
  168 |     const page = await phone(browser);
  169 |     await signIn(page);
  170 |     await page.goto('/record');
  171 | 
  172 |     // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
  173 |     await page.getByLabel('어디 검색').click();
  174 |     const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
  175 |     await page.keyboard.press('Enter');
  176 |     await place.commit('강릉');
  177 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
  178 |     await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
  179 |     // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
  180 |     await page.keyboard.press('Enter');
  181 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  182 | 
  183 |     // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
  184 |     const who = page.getByLabel('함께 간 사람 이름');
  185 |     await who.click();
  186 |     const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
  187 |     await page.keyboard.press('Enter');
  188 |     await name.commit('할머니');
  189 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
  190 |     await expect(who).toHaveValue('할머니');
  191 |     await page.keyboard.press('Enter');
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
```