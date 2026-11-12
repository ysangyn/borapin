# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:223:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByTestId('way-sheet').getByTestId('transit-sat')
Expected: "true"
Received: "false"
Timeout:  15000ms

Call log:
  - Expect "toHaveAttribute" getByTestId('way-sheet').getByTestId('transit-sat') with timeout 15000ms
  - waiting for getByTestId('way-sheet').getByTestId('transit-sat')
    34 × locator resolved to <button class="" role="tab" aria-selected="false" data-testid="transit-sat">토요일</button>
       - unexpected value "false"

```

```yaml
- tab "토요일"
```

# Test source

```ts
  184 |   for (const w of WISHES) batch.set(sp.collection('wishes').doc(w.id), { ...w, source: 'app', createdBy: by, createdAt: ts('2025-06-01'), updatedAt: Timestamp.now(), v: 1 });
  185 |   for (const r of RECS) batch.set(sp.collection('places').doc(r.id), { ...r, createdBy: by, createdAt: ts('2025-06-01'), updatedAt: Timestamp.now(), v: 1 });
  186 |   const plans = [
  187 |     ['p1', 't11', '통영 케이블카', ymd(GO), '10:00', true],
  188 |     ['p2', 't11', '동피랑 벽화마을', ymd(GO), '14:00', false],
  189 |     ['p3', 't11', '남해 독일마을', ymd(GO2), null, false],
  190 |     ['p4', 't11', '다랭이마을 일몰', ymd(GO2), '17:30', false],
  191 |     ['p5', 't11', '멸치쌈밥 맛집 찾기', null, null, false],
  192 |   ] as const;
  193 |   plans.forEach(([id, tripId, name, day, time, done], i) => batch.set(sp.collection('plans').doc(id), { tripId, name, order: i, day, time, info: '', recId: null, done, createdAt: Timestamp.now(), v: 1 }));
  194 |   batch.set(sp.collection('notes').doc('n1'), { tripId: 't1', text: '비 오는 바다도 좋더라. 다음엔 겨울에 다시 오자.', by: { uid: 'bora', name: '보라' }, createdAt: ts('2024-05-06T21:00:00+09:00'), v: 1 });
  195 |   batch.set(sp.collection('notes').doc('n2'), { tripId: 't1', text: '초당 순두부 아침 7시 오픈, 7시 반부터 줄 섬', by: { uid: 'owner', name: '영상' }, createdAt: ts('2024-05-06T22:00:00+09:00'), v: 1 });
  196 |   // 우리 집: 고양 (기차·버스 한 번에 가는 길, 대중교통 들러 가기)
  197 |   batch.set(sp, { home: { label: '고양시', code: '41280', lat: 37.658, lng: 126.832, exact: false } }, { merge: true });
  198 |   await batch.commit();
  199 | 
  200 |   // 사진: 강릉 6장, 제주 4장, 도쿄 4장, 파리 2장
  201 |   const imgs = await makePhotos(page, 16);
  202 |   const plan: [string, string, { t: 'kr'; code: string } | { t: 'country'; id: string; city?: string }][] = [
  203 |     ...Array.from({ length: 6 }, (_, i) => ['t1', `2024-05-0${3 + (i % 3)}T${10 + i}:20`, { t: 'kr' as const, code: '51150' }] as [string, string, { t: 'kr'; code: string }]),
  204 |     ...Array.from({ length: 4 }, (_, i) => ['t2', `2023-10-1${2 + i}T1${i}:05`, { t: 'kr' as const, code: '50' }] as [string, string, { t: 'kr'; code: string }]),
  205 |     ...Array.from({ length: 4 }, (_, i) => ['t8', `2024-11-2${1 + i}T1${i + 2}:40`, { t: 'country' as const, id: 'JPN' }] as [string, string, { t: 'country'; id: string }]),
  206 |     ...Array.from({ length: 2 }, (_, i) => ['t10', `2019-09-0${3 + i}T15:00`, { t: 'country' as const, id: 'FRA' }] as [string, string, { t: 'country'; id: string }]),
  207 |   ];
  208 |   const pb = db.batch();
  209 |   plan.forEach(([tripId, taken, place], i) => {
  210 |     const id = `ph${String(i).padStart(2, '0')}`;
  211 |     const im = imgs[i];
  212 |     const l = Buffer.from(im.l, 'base64'), t = Buffer.from(im.t, 'base64');
  213 |     pb.set(sp.collection('photoData').doc(`${id}_l`), { photoId: id, tripId, kind: 'l', data: l, size: l.length, public: false, v: 1 });
  214 |     pb.set(sp.collection('photoData').doc(`${id}_t`), { photoId: id, tripId, kind: 't', data: t, size: t.length, public: false, v: 1 });
  215 |     pb.set(sp.collection('photos').doc(id), {
  216 |       tripId, w: im.w, h: im.h, taken, tz: '+09:00', takenGuess: false, lat: null, lng: null, place, camera: 'iPhone 15', bytes: l.length + t.length,
  217 |       ...(i === 0 ? { caption: '경포 해변 첫날' } : {}), createdBy: by, createdAt: Timestamp.now(), v: 1,
  218 |     });
  219 |   });
  220 |   await pb.commit();
  221 | }
  222 | 
  223 | test('가득 찬 화면 · 휴대폰', async ({ browser }) => {
  224 |   test.setTimeout(600_000);
  225 |   const page = await mobile(browser);
  226 |   await signIn(page);
  227 |   await seed(page);
  228 |   await page.goto('/');
  229 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  230 |   await snap(page, 'm01-home');
  231 |   // 맛집 지도로 가는 문: 홈 '내 지도' 카드(동네별 칩) → + 메뉴 첫 줄 '맛집·카페 담기' → 지역은 우리 집 동네가 기본
  232 |   await expect(page.getByTestId('mymaps-card')).toBeVisible();
  233 |   await expect(page.getByTestId('mymaps-card-chip').first()).toContainText(/강릉시 (카페|맛집)/);
  234 |   // + 단추 = 어디?: 우리 집·자주 가는 곳 칩 → 지역 한 장 / 공유 글 붙여 넣기 → 가게 담기 / 바로 가기 세 줄
  235 |   await page.getByRole('button', { name: '남기기' }).click();
  236 |   await expect(page.getByTestId('where-home')).toContainText('고양시');
  237 |   await expect(page.getByTestId('where-frequent').first()).toContainText('강릉시');
  238 |   await snap(page, 'm01b-plus-sheet', false);
  239 |   await page.getByTestId('where-search').fill('통영');
  240 |   await page.getByTestId('where-hits').getByRole('button', { name: /통영/ }).click();
  241 |   await expect(page).toHaveURL(/\/region\/kr:48220/);
  242 |   await expect(page.getByTestId('region-page')).toBeVisible();
  243 |   await snap(page, 'm01b2-region-tongyeong', false);
  244 |   await page.goto('/');
  245 |   await page.getByRole('button', { name: '남기기' }).click();
  246 |   await page.getByTestId('where-search').focus();
  247 |   await page.evaluate(() => {
  248 |     const dt = new DataTransfer();
  249 |     dt.setData('text', '[네이버 지도]\n오미사꿀빵\n경남 통영시 항남동 123\nhttps://naver.me/tongyeong');
  250 |     document.activeElement?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  251 |   });
  252 |   await expect(page).toHaveURL(/\/places\/new\?paste=/);
  253 |   await expect(page.getByLabel('장소 이름')).toHaveValue('오미사꿀빵');
  254 |   await expect(page.getByText('경남 통영시').first()).toBeVisible(); // 주소에서 지역을 알아서
  255 |   await page.goto('/');
  256 |   await page.getByRole('button', { name: '남기기' }).click();
  257 |   await expect(page.getByTestId('plus-sheet').getByRole('menuitem').first()).toContainText('맛집·카페 담기');
  258 |   await page.getByTestId('plus-place').click();
  259 |   await expect(page.getByTestId('region-auto')).toBeVisible({ timeout: 15_000 });
  260 |   await expect(page.getByText('고양시').first()).toBeVisible();
  261 |   await snap(page, 'm01c-place-new-home', false);
  262 |   await page.goto('/trips');
  263 |   await snap(page, 'm02-trips');
  264 |   await page.goto('/trips/t1');
  265 |   await snap(page, 'm03-trip-info');
  266 |   await page.getByRole('tab', { name: /사진/ }).click();
  267 |   await snap(page, 'm04-trip-photos');
  268 |   await page.getByRole('tab', { name: /글/ }).click();
  269 |   await snap(page, 'm05-trip-notes');
  270 |   // 피드: 여행 일기장 (이번 주 한 줄 · 달력 띠 · 폴라로이드 · 기차표 장소)
  271 |   await page.goto('/feed');
  272 |   await expect(page.getByTestId('feed-month')).toBeVisible({ timeout: 15_000 });
  273 |   await expect(page.getByTestId('feed-week')).toBeVisible();
  274 |   await expect(page.getByTestId('feed-month-day').first()).toBeVisible();
  275 |   await snap(page, 'm05b-feed');
  276 |   await page.goto('/trips/t11');
  277 |   await snap(page, 'm06-planned-info');
  278 |   // 준비 탭: 가는 길 정하기 (고양 → 통영, 이달 시각표 · 떠나는 날이 토요일이라 토요일 시각표로)
  279 |   await page.goto('/trips/t11?tab=prep');
  280 |   await expect(page.getByTestId('way-go')).toContainText('가는 길');
  281 |   await page.getByTestId('way-go-open').click();
  282 |   const sheet = page.getByTestId('way-sheet');
  283 |   await expect(sheet.getByTestId('transit-plan').first()).toBeVisible({ timeout: 15_000 });
> 284 |   await expect(sheet.getByTestId('transit-sat')).toHaveAttribute('aria-selected', 'true');
      |                                                  ^ Error: expect(locator).toHaveAttribute(expected) failed
  285 |   await snap(page, 'm06b-transit-stops', false);
  286 |   await sheet.getByTestId('transit-plan').filter({ hasText: '들러 가기' }).first().getByTestId('transit-pick').click();
  287 |   await expect(page.getByRole('status')).toContainText('가는 길을 정했어요');
  288 |   await expect(page.getByTestId('way-go')).toContainText('들러 가기');
  289 |   await expect(page.getByTestId('way-go')).toContainText('막차');
  290 |   await snap(page, 'm06c-way-picked');
  291 |   await page.getByRole('tab', { name: /일정/ }).click();
  292 |   await snap(page, 'm07-planned-plan');
  293 |   // 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서만 켜짐)
  294 |   await page.goto('/trips/t11/plan-next?step=when');
  295 |   await expect(page.getByTestId('flow-cal')).toBeVisible({ timeout: 15_000 });
  296 |   await expect(page.getByTestId('flow-nights')).toHaveText('2박 3일');
  297 |   await snap(page, 'm07a-plan-when');
  298 |   await page.getByTestId('flow-when-save').click();
  299 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'stay');
  300 |   await snap(page, 'm07b-plan-stay');
  301 |   await page.getByLabel('숙소').fill('통영 바다 앞 호텔');
  302 |   await page.getByTestId('flow-stay-save').click();
  303 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'pick');
  304 |   const own = page.getByLabel('직접 담기');
  305 |   await own.fill('서피랑');
  306 |   await own.press('Enter');
  307 |   await expect(page.getByTestId('pick-card').filter({ hasText: '직접 담은 곳' }).filter({ hasText: '서피랑' })).toBeVisible();
  308 |   await snap(page, 'm07c-plan-pick');
  309 |   await page.getByTestId('flow-pick-next').click();
  310 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'route');
  311 |   await expect(page.getByTestId('flow-day')).toHaveCount(3);
  312 |   await snap(page, 'm07d-plan-route');
  313 |   await page.getByTestId('flow-route-save').click();
  314 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'hope');
  315 |   await page.getByLabel('기대 한 줄').fill('케이블카에서 보는 한려수도');
  316 |   await expect(page.getByTestId('flow-check')).toContainText('통영 바다 앞 호텔');
  317 |   await snap(page, 'm07e-plan-hope');
  318 |   await page.getByTestId('flow-hope-save').click();
  319 |   await expect(page).toHaveURL(/\/trips\/t11$/);
  320 |   await expect.poll(async () => (await sp.collection('trips').doc('t11').get()).data()?.planDone?.length).toBe(5);
  321 |   await page.goto('/trips/t10');
  322 |   await page.locator('.trip-cover').click();
  323 |   await page.waitForTimeout(1200);
  324 |   await page.screenshot({ path: path.join(OUT, 'm08-slideshow.jpg'), type: 'jpeg', quality: 82 });
  325 |   await page.keyboard.press('Escape');
  326 |   // 여행 기록 안의 '들른 맛집·명소': 그 지역의 가고 싶어요 가게가 체크 후보로
  327 |   await page.goto('/record?place=kr:51150');
  328 |   await expect(page.getByTestId('record-stop-cand').first()).toContainText('버드나무 브루어리');
  329 |   await snap(page, 'm09-record');
  330 |   // 새로 적은 곳은 저장하면 가게로 만들어 여행에 묶인다
  331 |   await page.goto('/record?place=kr:47170');
  332 |   await page.getByRole('button', { name: '날짜', exact: true }).click();
  333 |   await page.getByLabel('시작 날짜').fill('2026-10-03');
  334 |   await page.getByLabel('들른 곳 이름').fill('안동찜닭 골목');
  335 |   await page.getByTestId('record-stop-add').click();
  336 |   await expect(page.getByTestId('record-stop-list')).toContainText('안동찜닭 골목');
  337 |   await page.getByTestId('save').click();
  338 |   await expect(page.getByRole('status')).toContainText('맛집·명소 1곳 함께');
  339 |   await page.goto('/region/kr:47170?tab=places');
  340 |   await expect(page.getByTestId('region-been').first()).toContainText('안동찜닭 골목');
  341 |   await page.goto('/trips/t1/edit');
  342 |   await snap(page, 'm10-trip-edit');
  343 |   await page.goto('/map');
  344 |   await snap(page, 'm11-map', false);
  345 |   await page.getByRole('tab', { name: '세계' }).first().click({ timeout: 5000 }).catch(() => undefined);
  346 |   await snap(page, 'm12-map-world', false);
  347 |   await page.goto('/wishes');
  348 |   await expect(page.getByTestId('wish-again').first()).toContainText('못 간 곳 2');
  349 |   await snap(page, 'm13-wishes');
  350 |   // 가고 싶은 곳 담기: '들를 곳'(맛집·카페·관광지)이 어디 바로 밑에, 지도 공유 글을 붙여 넣으면 이름만
  351 |   await page.goto('/wishes/new');
  352 |   await expect(page.getByTestId('wish-stops')).toBeVisible();
  353 |   await page.getByLabel('맛집·카페').focus();
  354 |   await page.evaluate(() => {
  355 |     const dt = new DataTransfer();
  356 |     dt.setData('text', '[네이버 지도]\n테라로사 커피공장\n강원 강릉시 구정면 현천길 7\nhttps://naver.me/xyz');
  357 |     document.activeElement?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  358 |   });
  359 |   await expect(page.getByLabel('맛집·카페')).toHaveValue('테라로사 커피공장');
  360 |   await snap(page, 'm13b-wish-new', false);
  361 |   await page.goto('/wishes/w6');
  362 |   await expect(page.getByTestId('wish-gone')).toBeVisible();
  363 |   await expect(page.getByTestId('wish-gone-rec')).toContainText('보헤미안 박이추 커피');
  364 |   await snap(page, 'm13b-wish-gone');
  365 |   await page.goto('/wishes/w1');
  366 |   await snap(page, 'm14-wish-edit');
  367 |   await page.goto('/places');
  368 |   await snap(page, 'm15-places');
  369 |   // 장소 한 곳: 앱 안의 작은 거리 지도 (좌표가 있으면 골목까지)
  370 |   await page.goto('/places/r7');
  371 |   await expect(page.getByTestId('mini-street')).toBeVisible({ timeout: 15_000 });
  372 |   await page.waitForTimeout(2500); // 타일
  373 |   await snap(page, 'm15a-place-street');
  374 |   // 내 지도: 강릉 카페 3곳 → 거리 지도 + 순위, 새 곳을 담으면 견주기, 보내기 → 앱 없이 보는 페이지
  375 |   await page.goto('/maps?m=kr:51150|cafe');
  376 |   await expect(page.getByTestId('mymaps')).toBeVisible();
  377 |   await expect(page.getByTestId('street-map')).toBeVisible();
  378 |   await expect(page.getByTestId('mymap-list').getByTestId('place-rec')).toHaveCount(3);
  379 |   await page.waitForTimeout(2500); // 타일
  380 |   await snap(page, 'm15b-mymaps');
  381 |   await page.goto('/places/new?region=kr:51150&kind=cafe');
  382 |   await page.getByLabel('장소 이름').fill('안목 커피거리 2호점');
  383 |   await page.getByTestId('place-save').click();
  384 |   await expect(page.getByTestId('rank-ask')).toBeVisible();
```