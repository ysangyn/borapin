# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 화면 오류 없음
- Location: tests/tour.spec.ts:303:1

# Error details

```
Error: [mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)
[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 16

- Array []
+ Array [
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "[desktop] console: Failed to load resource: the server responded with a status of 404 (Not Found)",
+ ]
```

# Test source

```ts
  204 | }
  205 | 
  206 | test('가득 찬 화면 · 휴대폰', async ({ browser }) => {
  207 |   test.setTimeout(600_000);
  208 |   const page = await mobile(browser);
  209 |   await signIn(page);
  210 |   await seed(page);
  211 |   await page.goto('/');
  212 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  213 |   await snap(page, 'm01-home');
  214 |   await page.goto('/trips');
  215 |   await snap(page, 'm02-trips');
  216 |   await page.goto('/trips/t1');
  217 |   await snap(page, 'm03-trip-info');
  218 |   await page.getByRole('tab', { name: /사진/ }).click();
  219 |   await snap(page, 'm04-trip-photos');
  220 |   await page.getByRole('tab', { name: /글/ }).click();
  221 |   await snap(page, 'm05-trip-notes');
  222 |   await page.goto('/trips/t11');
  223 |   await snap(page, 'm06-planned-info');
  224 |   await page.getByRole('tab', { name: /일정/ }).click();
  225 |   await snap(page, 'm07-planned-plan');
  226 |   await page.goto('/trips/t10');
  227 |   await page.locator('.trip-cover').click();
  228 |   await page.waitForTimeout(1200);
  229 |   await page.screenshot({ path: path.join(OUT, 'm08-slideshow.jpg'), type: 'jpeg', quality: 82 });
  230 |   await page.keyboard.press('Escape');
  231 |   await page.goto('/record');
  232 |   await snap(page, 'm09-record');
  233 |   await page.goto('/trips/t1/edit');
  234 |   await snap(page, 'm10-trip-edit');
  235 |   await page.goto('/map');
  236 |   await snap(page, 'm11-map', false);
  237 |   await page.getByRole('tab', { name: '세계' }).first().click({ timeout: 5000 }).catch(() => undefined);
  238 |   await snap(page, 'm12-map-world', false);
  239 |   await page.goto('/wishes');
  240 |   await snap(page, 'm13-wishes');
  241 |   await page.goto('/wishes/w1');
  242 |   await snap(page, 'm14-wish-edit');
  243 |   await page.goto('/places');
  244 |   await snap(page, 'm15-places');
  245 |   await page.goto('/places/r1');
  246 |   await snap(page, 'm16-place-edit');
  247 |   await page.goto('/memories');
  248 |   await snap(page, 'm17-memories');
  249 |   await page.goto('/ask');
  250 |   const answersBefore = await page.getByTestId('answer').count();
  251 |   await page.getByRole('textbox').first().fill('강릉 몇 번 갔지?');
  252 |   await page.keyboard.press('Enter');
  253 |   // 첫 답이 붙은 뒤에 다음 질문 (고정 대기 대신)
  254 |   await expect.poll(() => page.getByTestId('answer').count()).toBeGreaterThan(answersBefore);
  255 |   await page.getByRole('textbox').first().fill('11월에 어디 가면 좋아?');
  256 |   await page.keyboard.press('Enter');
  257 |   await snap(page, 'm18-ask');
  258 |   await page.goto('/space');
  259 |   await snap(page, 'm19-space');
  260 |   await page.goto('/admin');
  261 |   await snap(page, 'm20-admin');
  262 |   // 지도 시트
  263 |   await page.goto('/');
  264 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  265 |   await page.goto('/map');
  266 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  267 |   await settle(page);
  268 |   // 강릉을 눌러 지역 창 (위쪽에 여행지 사진)
  269 |   const pt = await page.evaluate(() => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([128.88, 37.74]));
  270 |   const box = await page.getByTestId('map').first().boundingBox();
  271 |   if (box) await page.mouse.click(box.x + pt.x, box.y + pt.y);
  272 |   // 지역 창이 뜨면 바로 (못 뜨면 전처럼 그냥 찍는다: 이 파일은 디자인 검수용 사진이 목적)
  273 |   await page.getByTestId('region-sheet').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  274 |   await snap(page, 'm22-sheet', false);
  275 |   await page.context().close();
  276 | });
  277 | 
  278 | test('가득 찬 화면 · PC', async ({ browser }) => {
  279 |   test.setTimeout(480_000);
  280 |   const page = await desktop(browser);
  281 |   await page.goto('/');
  282 |   await expect(page.getByTestId('email-open')).toBeVisible({ timeout: 20_000 });
  283 |   await page.waitForTimeout(2500);
  284 |   await snap(page, 'd00-login', false);
  285 |   await signIn(page);
  286 |   for (const [route, name] of [['/', 'd01-home'], ['/trips', 'd02-trips'], ['/trips/t1', 'd03-trip'], ['/trips/t11', 'd04-planned'], ['/record', 'd05-record'], ['/map', 'd06-map'], ['/wishes', 'd07-wishes'], ['/places', 'd08-places'], ['/memories', 'd09-memories'], ['/ask', 'd10-ask'], ['/space', 'd11-space'], ['/admin', 'd12-admin']] as const) {
  287 |     await page.goto(route);
  288 |     await snap(page, name, route !== '/map');
  289 |   }
  290 |   // 공유 페이지 (로그인 없이)
  291 |   await page.goto('/trips/t1');
  292 |   const card = page.getByTestId('share-link');
  293 |   await card.getByTestId('share-on').click();
  294 |   const url = await card.getByLabel('공유 링크').inputValue();
  295 |   const anon = await mobile(browser);
  296 |   await anon.goto(url);
  297 |   await expect(anon.getByTestId('shared-trip')).toBeVisible();
  298 |   await snap(anon, 'm21-shared');
  299 |   await anon.context().close();
  300 |   await page.context().close();
  301 | });
  302 | 
  303 | test('화면 오류 없음', () => {
> 304 |   expect(problems, problems.join('\n')).toEqual([]);
      |                                         ^ Error: [mobile] console: Failed to load resource: the server responded with a status of 404 (Not Found)
  305 | });
  306 | 
```