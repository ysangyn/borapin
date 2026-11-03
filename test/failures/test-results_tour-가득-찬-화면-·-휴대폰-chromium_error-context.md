# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:208:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "가는 길을 정했어요"
Received string:    ""
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByRole('status') with timeout 15000ms
  - waiting for getByRole('status')
    9 × locator resolved to <div role="status" aria-live="polite" class="toast-region">…</div>
      - unexpected value "저장하지 못했어요. 다시 해 주세요"
    24 × locator resolved to <div role="status" aria-live="polite" class="toast-region"></div>
       - unexpected value ""

```

```yaml
- button "뒤로"
- text: 예정된 여행
- link "고치기":
  - /url: /trips/t11/edit
- text: 통영 · 남해 드라이브 2026.11.7–9 · 2박 3일 D-3
- tablist "여행 보기":
  - tab "개요"
  - tab "일정"
  - tab "준비" [selected]
  - tab "사진"
- heading "준비물" [level=2]
- text: 1/3 챙김
- button "준비물 보내기": 보내기
- checkbox "여권 말고 신분증 챙김" [checked]
- text: 여권 말고 신분증
- button "여권 말고 신분증 담당자": 담당
- button "여권 말고 신분증 빼기"
- checkbox "충전기 챙김"
- text: 충전기
- button "충전기 담당자": 영상
- button "충전기 빼기"
- checkbox "선크림 챙김"
- text: 선크림
- button "선크림 담당자": 보라
- button "선크림 빼기"
- textbox "준비물 추가":
  - /placeholder: 더 챙길 것
- button "추가" [disabled]
- text: 가는 길 경남 통영시 가는 길
- button "정하기"
- text: 대중교통이면 갈아타는 길·들러 가는 길도 골라 드려요 돌아오는 길
- button "정하기"
- text: 대중교통이면 갈아타는 길·들러 가는 길도 골라 드려요 가까운 역·공항 KTX 진주역 37km · 사천공항 35km 가기 좋은 때 4~6, 10·11월 · 덥지도 춥지도 않아요
- link "통영시 지도·볼거리·우리 기록 보기":
  - /url: /map?sel=kr:48220
- text: 경남 남해군 가까운 역·공항 KTX 여수엑스포역 14km · 여수공항 25km 가기 좋은 때 4~6, 10·11월 · 덥지도 춥지도 않아요
- link "남해군 지도·볼거리·우리 기록 보기":
  - /url: /map?sel=kr:48840
- link "오늘의 영어 떠나기 전 하루 3문장씩 · 공항·호텔·식당 표현부터":
  - /url: /study
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "남기기"
  - link "지도":
    - /url: /map
  - link "새 소식 5개 피드":
    - /url: /feed
    - text: 피드
- status
- dialog "가는 길 고르기":
  - text: 가는 길 · 고양시 → 통영시
  - button "자동차로 가요"
  - tablist "탈것":
    - tab "통합" [selected]
    - tab "버스만"
    - tab "기차만"
  - tablist "요일":
    - tab "평일"
    - tab "토요일" [selected]
  - text: 가장 빠른 길 · 창원시에서 갈아타기 9:11 행신 KTX 12:29 창원중앙 11분 기다리기 · 창원까지 시내 이동 약 30분 13:10 창원 시외버스 14:40 통영터미널 차 타는 시간 4시간 48분 · 14:40 도착 · 막차 18:20 ·
  - button "이 길로"
  - text: 대전 들러 가기 9:11 행신 KTX 10:37 대전 2시간 33분 머물기 · 대전복합까지 시내 이동 약 30분 · 과학의 도시와 노잼을 거부하는 빵의 성지 13:40 대전복합 시외버스 17:00 통영터미널 차 타는 시간 4시간 46분 · 17:00 도착 · 막차 18:00 ·
  - button "이 길로"
  - text: 광주 들러 가기 10:10 행신 KTX 12:35 광주송정 3시간 25분 머물기 · 광주(유·스퀘어)까지 시내 이동 약 30분 · 민주주의의 상징과 예술의 향연 16:30 광주(유·스퀘어) 시외버스 19:00 통영터미널 차 타는 시간 4시간 55분 · 19:00 도착 · 이게 막차 ·
  - button "이 길로"
  - text: 창원시 들러 가기 9:11 행신 KTX 12:29 창원중앙 2시간 1분 머물기 · 창원까지 시내 이동 약 30분 · 벚꽃 가득한 진해와 예술의 문신 15:00 창원 시외버스 16:30 통영터미널 차 타는 시간 4시간 48분 · 16:30 도착 · 막차 18:20 ·
  - button "이 길로"
  - text: "11월 기준 토요일 시각표 · 일요일·공휴일은 다를 수 있어요 · 떠나기 전 확인:"
  - link "코레일":
    - /url: https://www.letskorail.com/
  - text: ·
  - link "시외버스 예매":
    - /url: https://txbus.t-money.co.kr/
  - text: 11월 기준 시각표로 골라요
  - button "닫기"
```

# Test source

```ts
  135 |       const w = portrait ? 1200 : 1600, h = portrait ? 1600 : 1200;
  136 |       const cv = document.createElement('canvas');
  137 |       cv.width = w; cv.height = h;
  138 |       const g = cv.getContext('2d')!;
  139 |       const sky = g.createLinearGradient(0, 0, 0, h * 0.7);
  140 |       sky.addColorStop(0, a); sky.addColorStop(1, b);
  141 |       g.fillStyle = sky; g.fillRect(0, 0, w, h);
  142 |       g.fillStyle = 'rgba(255,255,255,0.85)';
  143 |       g.beginPath(); g.arc(w * (0.25 + 0.5 * ((i * 37) % 10) / 10), h * 0.3, h * 0.07, 0, Math.PI * 2); g.fill();
  144 |       for (let k = 0; k < 3; k++) {
  145 |         g.fillStyle = k === 2 ? d : c;
  146 |         g.globalAlpha = 0.55 + k * 0.2;
  147 |         g.beginPath(); g.moveTo(0, h);
  148 |         const base = h * (0.55 + k * 0.12);
  149 |         for (let x = 0; x <= w; x += w / 8) g.lineTo(x, base - Math.sin((x / w) * Math.PI * (2 + k) + i) * h * 0.08);
  150 |         g.lineTo(w, h); g.closePath(); g.fill();
  151 |       }
  152 |       g.globalAlpha = 1;
  153 |       const t = document.createElement('canvas');
  154 |       const s = 400 / Math.max(w, h);
  155 |       t.width = Math.round(w * s); t.height = Math.round(h * s);
  156 |       t.getContext('2d')!.drawImage(cv, 0, 0, t.width, t.height);
  157 |       out.push({ l: enc(cv, 0.8), t: enc(t, 0.72), w, h });
  158 |     }
  159 |     return out;
  160 |   }, n);
  161 | }
  162 | 
  163 | async function seed(page: Page) {
  164 |   const batch = db.batch();
  165 |   await db.doc('config/access').set({ allowed: [OWNER, BORA], admins: [OWNER], updatedAt: Timestamp.now() });
  166 |   for (const [i, t] of TRIPS.entries()) {
  167 |     batch.set(sp.collection('trips').doc(t.id), { ...t, companions: ['보라', '영상', ...t.companions], source: 'app', createdBy: i % 3 === 0 ? byB : by, createdAt: ts(`2025-0${(i % 9) + 1}-10`), updatedAt: Timestamp.now(), v: 1 });
  168 |   }
  169 |   for (const w of WISHES) batch.set(sp.collection('wishes').doc(w.id), { ...w, source: 'app', createdBy: by, createdAt: ts('2025-06-01'), updatedAt: Timestamp.now(), v: 1 });
  170 |   for (const r of RECS) batch.set(sp.collection('places').doc(r.id), { ...r, createdBy: by, createdAt: ts('2025-06-01'), updatedAt: Timestamp.now(), v: 1 });
  171 |   const plans = [
  172 |     ['p1', 't11', '통영 케이블카', '2026-11-07', '10:00', true],
  173 |     ['p2', 't11', '동피랑 벽화마을', '2026-11-07', '14:00', false],
  174 |     ['p3', 't11', '남해 독일마을', '2026-11-08', null, false],
  175 |     ['p4', 't11', '다랭이마을 일몰', '2026-11-08', '17:30', false],
  176 |     ['p5', 't11', '멸치쌈밥 맛집 찾기', null, null, false],
  177 |   ] as const;
  178 |   plans.forEach(([id, tripId, name, day, time, done], i) => batch.set(sp.collection('plans').doc(id), { tripId, name, order: i, day, time, info: '', recId: null, done, createdAt: Timestamp.now(), v: 1 }));
  179 |   batch.set(sp.collection('notes').doc('n1'), { tripId: 't1', text: '비 오는 바다도 좋더라. 다음엔 겨울에 다시 오자.', by: { uid: 'bora', name: '보라' }, createdAt: ts('2024-05-06T21:00:00+09:00'), v: 1 });
  180 |   batch.set(sp.collection('notes').doc('n2'), { tripId: 't1', text: '초당 순두부 아침 7시 오픈, 7시 반부터 줄 섬', by: { uid: 'owner', name: '영상' }, createdAt: ts('2024-05-06T22:00:00+09:00'), v: 1 });
  181 |   // 우리 집: 고양 (기차·버스 한 번에 가는 길, 대중교통 들러 가기)
  182 |   batch.set(sp, { home: { label: '고양시', code: '41280', lat: 37.658, lng: 126.832, exact: false } }, { merge: true });
  183 |   await batch.commit();
  184 | 
  185 |   // 사진: 강릉 6장, 제주 4장, 도쿄 4장, 파리 2장
  186 |   const imgs = await makePhotos(page, 16);
  187 |   const plan: [string, string, { t: 'kr'; code: string } | { t: 'country'; id: string; city?: string }][] = [
  188 |     ...Array.from({ length: 6 }, (_, i) => ['t1', `2024-05-0${3 + (i % 3)}T${10 + i}:20`, { t: 'kr' as const, code: '51150' }] as [string, string, { t: 'kr'; code: string }]),
  189 |     ...Array.from({ length: 4 }, (_, i) => ['t2', `2023-10-1${2 + i}T1${i}:05`, { t: 'kr' as const, code: '50' }] as [string, string, { t: 'kr'; code: string }]),
  190 |     ...Array.from({ length: 4 }, (_, i) => ['t8', `2024-11-2${1 + i}T1${i + 2}:40`, { t: 'country' as const, id: 'JPN' }] as [string, string, { t: 'country'; id: string }]),
  191 |     ...Array.from({ length: 2 }, (_, i) => ['t10', `2019-09-0${3 + i}T15:00`, { t: 'country' as const, id: 'FRA' }] as [string, string, { t: 'country'; id: string }]),
  192 |   ];
  193 |   const pb = db.batch();
  194 |   plan.forEach(([tripId, taken, place], i) => {
  195 |     const id = `ph${String(i).padStart(2, '0')}`;
  196 |     const im = imgs[i];
  197 |     const l = Buffer.from(im.l, 'base64'), t = Buffer.from(im.t, 'base64');
  198 |     pb.set(sp.collection('photoData').doc(`${id}_l`), { photoId: id, tripId, kind: 'l', data: l, size: l.length, public: false, v: 1 });
  199 |     pb.set(sp.collection('photoData').doc(`${id}_t`), { photoId: id, tripId, kind: 't', data: t, size: t.length, public: false, v: 1 });
  200 |     pb.set(sp.collection('photos').doc(id), {
  201 |       tripId, w: im.w, h: im.h, taken, tz: '+09:00', takenGuess: false, lat: null, lng: null, place, camera: 'iPhone 15', bytes: l.length + t.length,
  202 |       ...(i === 0 ? { caption: '경포 해변 첫날' } : {}), createdBy: by, createdAt: Timestamp.now(), v: 1,
  203 |     });
  204 |   });
  205 |   await pb.commit();
  206 | }
  207 | 
  208 | test('가득 찬 화면 · 휴대폰', async ({ browser }) => {
  209 |   test.setTimeout(600_000);
  210 |   const page = await mobile(browser);
  211 |   await signIn(page);
  212 |   await seed(page);
  213 |   await page.goto('/');
  214 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  215 |   await snap(page, 'm01-home');
  216 |   await page.goto('/trips');
  217 |   await snap(page, 'm02-trips');
  218 |   await page.goto('/trips/t1');
  219 |   await snap(page, 'm03-trip-info');
  220 |   await page.getByRole('tab', { name: /사진/ }).click();
  221 |   await snap(page, 'm04-trip-photos');
  222 |   await page.getByRole('tab', { name: /글/ }).click();
  223 |   await snap(page, 'm05-trip-notes');
  224 |   await page.goto('/trips/t11');
  225 |   await snap(page, 'm06-planned-info');
  226 |   // 준비 탭: 가는 길 정하기 (고양 → 통영, 이달 시각표 · 떠나는 날이 토요일이라 토요일 시각표로)
  227 |   await page.goto('/trips/t11?tab=prep');
  228 |   await expect(page.getByTestId('way-go')).toContainText('가는 길');
  229 |   await page.getByTestId('way-go-open').click();
  230 |   const sheet = page.getByTestId('way-sheet');
  231 |   await expect(sheet.getByTestId('transit-plan').first()).toBeVisible({ timeout: 15_000 });
  232 |   await expect(sheet.getByTestId('transit-sat')).toHaveAttribute('aria-selected', 'true');
  233 |   await snap(page, 'm06b-transit-stops', false);
  234 |   await sheet.getByTestId('transit-plan').filter({ hasText: '들러 가기' }).first().getByTestId('transit-pick').click();
> 235 |   await expect(page.getByRole('status')).toContainText('가는 길을 정했어요');
      |                                          ^ Error: expect(locator).toContainText(expected) failed
  236 |   await expect(page.getByTestId('way-go')).toContainText('들러 가기');
  237 |   await expect(page.getByTestId('way-go')).toContainText('막차');
  238 |   await snap(page, 'm06c-way-picked');
  239 |   await page.getByRole('tab', { name: /일정/ }).click();
  240 |   await snap(page, 'm07-planned-plan');
  241 |   // 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서만 켜짐)
  242 |   await page.goto('/trips/t11/plan-next?step=when');
  243 |   await expect(page.getByTestId('flow-cal')).toBeVisible({ timeout: 15_000 });
  244 |   await expect(page.getByTestId('flow-nights')).toHaveText('2박 3일');
  245 |   await snap(page, 'm07a-plan-when');
  246 |   await page.getByTestId('flow-when-save').click();
  247 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'stay');
  248 |   await snap(page, 'm07b-plan-stay');
  249 |   await page.getByLabel('숙소').fill('통영 바다 앞 호텔');
  250 |   await page.getByTestId('flow-stay-save').click();
  251 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'pick');
  252 |   const own = page.getByLabel('직접 담기');
  253 |   await own.fill('서피랑');
  254 |   await own.press('Enter');
  255 |   await expect(page.getByTestId('pick-card').filter({ hasText: '직접 담은 곳' }).filter({ hasText: '서피랑' })).toBeVisible();
  256 |   await snap(page, 'm07c-plan-pick');
  257 |   await page.getByTestId('flow-pick-next').click();
  258 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'route');
  259 |   await expect(page.getByTestId('flow-day')).toHaveCount(3);
  260 |   await snap(page, 'm07d-plan-route');
  261 |   await page.getByTestId('flow-route-save').click();
  262 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'hope');
  263 |   await page.getByLabel('기대 한 줄').fill('케이블카에서 보는 한려수도');
  264 |   await expect(page.getByTestId('flow-check')).toContainText('통영 바다 앞 호텔');
  265 |   await snap(page, 'm07e-plan-hope');
  266 |   await page.getByTestId('flow-hope-save').click();
  267 |   await expect(page).toHaveURL(/\/trips\/t11$/);
  268 |   await expect.poll(async () => (await sp.collection('trips').doc('t11').get()).data()?.planDone?.length).toBe(5);
  269 |   await page.goto('/trips/t10');
  270 |   await page.locator('.trip-cover').click();
  271 |   await page.waitForTimeout(1200);
  272 |   await page.screenshot({ path: path.join(OUT, 'm08-slideshow.jpg'), type: 'jpeg', quality: 82 });
  273 |   await page.keyboard.press('Escape');
  274 |   await page.goto('/record');
  275 |   await snap(page, 'm09-record');
  276 |   await page.goto('/trips/t1/edit');
  277 |   await snap(page, 'm10-trip-edit');
  278 |   await page.goto('/map');
  279 |   await snap(page, 'm11-map', false);
  280 |   await page.getByRole('tab', { name: '세계' }).first().click({ timeout: 5000 }).catch(() => undefined);
  281 |   await snap(page, 'm12-map-world', false);
  282 |   await page.goto('/wishes');
  283 |   await snap(page, 'm13-wishes');
  284 |   await page.goto('/wishes/w1');
  285 |   await snap(page, 'm14-wish-edit');
  286 |   await page.goto('/places');
  287 |   await snap(page, 'm15-places');
  288 |   await page.goto('/places/r1');
  289 |   await snap(page, 'm16-place-edit');
  290 |   await page.goto('/memories');
  291 |   await snap(page, 'm17-memories');
  292 |   await page.goto('/ask');
  293 |   const answersBefore = await page.getByTestId('answer').count();
  294 |   await page.getByRole('textbox').first().fill('강릉 몇 번 갔지?');
  295 |   await page.keyboard.press('Enter');
  296 |   // 첫 답이 붙은 뒤에 다음 질문 (고정 대기 대신)
  297 |   await expect.poll(() => page.getByTestId('answer').count()).toBeGreaterThan(answersBefore);
  298 |   await page.getByRole('textbox').first().fill('11월에 어디 가면 좋아?');
  299 |   await page.keyboard.press('Enter');
  300 |   await snap(page, 'm18-ask');
  301 |   await page.goto('/space');
  302 |   await snap(page, 'm19-space');
  303 |   await page.goto('/admin');
  304 |   await snap(page, 'm20-admin');
  305 |   // 지도 시트
  306 |   await page.goto('/');
  307 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  308 |   await page.goto('/map');
  309 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  310 |   await settle(page);
  311 |   // 강릉을 눌러 지역 창 (위쪽에 여행지 사진)
  312 |   const pt = await page.evaluate(() => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([128.88, 37.74]));
  313 |   const box = await page.getByTestId('map').first().boundingBox();
  314 |   if (box) await page.mouse.click(box.x + pt.x, box.y + pt.y);
  315 |   // 지역 창이 뜨면 바로 (못 뜨면 전처럼 그냥 찍는다: 이 파일은 디자인 검수용 사진이 목적)
  316 |   await page.getByTestId('region-sheet').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  317 |   await snap(page, 'm22-sheet', false);
  318 |   await page.context().close();
  319 | });
  320 | 
  321 | test('가득 찬 화면 · PC', async ({ browser }) => {
  322 |   test.setTimeout(480_000);
  323 |   const page = await desktop(browser);
  324 |   await page.goto('/');
  325 |   await expect(page.getByTestId('email-open')).toBeVisible({ timeout: 20_000 });
  326 |   await page.waitForTimeout(2500);
  327 |   await snap(page, 'd00-login', false);
  328 |   await signIn(page);
  329 |   for (const [route, name] of [['/', 'd01-home'], ['/trips', 'd02-trips'], ['/trips/t1', 'd03-trip'], ['/trips/t11', 'd04-planned'], ['/record', 'd05-record'], ['/map', 'd06-map'], ['/wishes', 'd07-wishes'], ['/places', 'd08-places'], ['/memories', 'd09-memories'], ['/ask', 'd10-ask'], ['/space', 'd11-space'], ['/admin', 'd12-admin']] as const) {
  330 |     await page.goto(route);
  331 |     await snap(page, name, route !== '/map');
  332 |   }
  333 |   // 공유 페이지 (로그인 없이)
  334 |   await page.goto('/trips/t1');
  335 |   const card = page.getByTestId('share-link');
```