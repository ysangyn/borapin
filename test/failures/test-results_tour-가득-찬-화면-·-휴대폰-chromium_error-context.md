# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:206:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('pick-card').filter({ hasText: '서피랑' })
Expected: visible
Error: strict mode violation: getByTestId('pick-card').filter({ hasText: '서피랑' }) resolved to 2 elements:
    1) <div class="pick-card mine" data-testid="pick-card">…</div> aka getByText('📍보영서피랑직접 담은 곳자세히')
    2) <div class="pick-card" data-testid="pick-card">…</div> aka getByText('📍보영동피랑/서피랑예술가가 사랑한 동양의 나폴리자세히')

Call log:
  - Expect "toBeVisible" getByTestId('pick-card').filter({ hasText: '서피랑' }) with timeout 15000ms
  - waiting for getByTestId('pick-card').filter({ hasText: '서피랑' })

```

# Page snapshot

```yaml
- generic [ref=f10e1]:
  - generic [ref=f10e2]:
    - generic [ref=f10e3]:
      - generic [ref=f10e5]:
        - button "뒤로" [ref=f10e6] [cursor=pointer]
        - generic [ref=f10e9]: 통영시 여행 계획
      - generic [ref=f10e10]:
        - tablist "계획 걸음" [ref=f10e11]:
          - tab "1. 언제 가요?" [ref=f10e12] [cursor=pointer]
          - tab "2. 어디서 자요?" [ref=f10e13] [cursor=pointer]
          - tab "3. 같이 찾아 담아요" [selected] [ref=f10e14] [cursor=pointer]
          - tab "4. 이렇게 다니면 어때요?" [ref=f10e15] [cursor=pointer]
          - tab "5. 제일 기대되는 건?" [ref=f10e16] [cursor=pointer]
        - generic [ref=f10e17]:
          - heading "같이 찾아 담아요" [level=1] [ref=f10e18]
          - paragraph [ref=f10e19]: 각자 폰에서 하트 · 둘 다 누르면 ★
        - generic [ref=f10e20]:
          - tablist [ref=f10e21]:
            - tab "볼 것 17" [selected] [ref=f10e22] [cursor=pointer]
            - tab "먹을 것 4" [ref=f10e23] [cursor=pointer]
            - tab "살 것 2" [ref=f10e24] [cursor=pointer]
          - generic [ref=f10e25]:
            - generic [ref=f10e26]:
              - button "서피랑 하트 빼기" [pressed] [ref=f10e27] [cursor=pointer]:
                - generic [aria-hidden] [ref=f10e28]: 📍
                - generic [ref=f10e29]:
                  - generic [ref=f10e30]: 보
                  - generic [ref=f10e31]: 영
                - generic [ref=f10e32]: 서피랑
                - generic [ref=f10e33]: 직접 담은 곳
              - button "서피랑 자세히" [ref=f10e34] [cursor=pointer]: 자세히
            - generic [ref=f10e35]:
              - button "동피랑/서피랑 담기" [ref=f10e36] [cursor=pointer]:
                - generic [aria-hidden] [ref=f10e37]: 📍
                - generic [ref=f10e38]:
                  - generic [ref=f10e39]: 보
                  - generic [ref=f10e40]: 영
                - generic [ref=f10e41]: 동피랑/서피랑
                - generic [ref=f10e42]: 예술가가 사랑한 동양의 나폴리
              - button "동피랑/서피랑 자세히" [ref=f10e43] [cursor=pointer]: 자세히
            - generic [ref=f10e44]:
              - button "중앙시장 담기" [ref=f10e45] [cursor=pointer]:
                - generic [aria-hidden] [ref=f10e46]: 📍
                - generic [ref=f10e47]:
                  - generic [ref=f10e48]: 보
                  - generic [ref=f10e49]: 영
                - generic [ref=f10e50]: 중앙시장
                - generic [ref=f10e51]: 예술가가 사랑한 동양의 나폴리
              - button "중앙시장 자세히" [ref=f10e52] [cursor=pointer]: 자세히
            - generic [ref=f10e53]:
              - button "루지 담기" [ref=f10e54] [cursor=pointer]:
                - generic [aria-hidden] [ref=f10e55]: 📍
                - generic [ref=f10e56]:
                  - generic [ref=f10e57]: 보
                  - generic [ref=f10e58]: 영
                - generic [ref=f10e59]: 루지
                - generic [ref=f10e60]: 예술가가 사랑한 동양의 나폴리
              - button "루지 자세히" [ref=f10e61] [cursor=pointer]: 자세히
            - generic [ref=f10e62]:
              - button "이순신공원 담기" [ref=f10e63] [cursor=pointer]:
                - generic [aria-hidden] [ref=f10e64]: 📍
                - generic [ref=f10e65]:
                  - generic [ref=f10e66]: 보
                  - generic [ref=f10e67]: 영
                - generic [ref=f10e68]: 이순신공원
                - generic [ref=f10e69]: 예술가가 사랑한 동양의 나폴리
              - button "이순신공원 자세히" [ref=f10e70] [cursor=pointer]: 자세히
            - generic [ref=f10e71]:
              - button "외도(인접) 담기" [ref=f10e72] [cursor=pointer]:
                - generic [aria-hidden] [ref=f10e73]: 📍
                - generic [ref=f10e74]:
                  - generic [ref=f10e75]: 보
                  - generic [ref=f10e76]: 영
                - generic [ref=f10e77]: 외도(인접)
                - generic [ref=f10e78]: 예술가가 사랑한 동양의 나폴리
              - button "외도(인접) 자세히" [ref=f10e79] [cursor=pointer]: 자세히
            - generic [ref=f10e80]:
              - button "흰작살해수욕장 담기" [ref=f10e81] [cursor=pointer]:
                - generic [ref=f10e82]:
                  - generic [ref=f10e83]: 보
                  - generic [ref=f10e84]: 영
                - generic [ref=f10e85]: 흰작살해수욕장
              - button "흰작살해수욕장 자세히" [ref=f10e86] [cursor=pointer]: 자세히
            - generic [ref=f10e87]:
              - button "삼덕항 담기" [ref=f10e88] [cursor=pointer]:
                - generic [ref=f10e89]:
                  - generic [ref=f10e90]: 보
                  - generic [ref=f10e91]: 영
                - generic [ref=f10e92]: 삼덕항
              - button "삼덕항 자세히" [ref=f10e93] [cursor=pointer]: 자세히
            - generic [ref=f10e94]:
              - button "안정근린공원 담기" [ref=f10e95] [cursor=pointer]:
                - generic [ref=f10e96]:
                  - generic [ref=f10e97]: 보
                  - generic [ref=f10e98]: 영
                - generic [ref=f10e99]: 안정근린공원
              - button "안정근린공원 자세히" [ref=f10e100] [cursor=pointer]: 자세히
            - generic [ref=f10e101]:
              - button "통영어드벤처타워 담기" [ref=f10e102] [cursor=pointer]:
                - generic [ref=f10e103]:
                  - generic [ref=f10e104]: 보
                  - generic [ref=f10e105]: 영
                - generic [ref=f10e106]: 통영어드벤처타워
              - button "통영어드벤처타워 자세히" [ref=f10e107] [cursor=pointer]: 자세히
            - generic [ref=f10e108]:
              - button "벽방산 담기" [ref=f10e109] [cursor=pointer]:
                - generic [ref=f10e110]:
                  - generic [ref=f10e111]: 보
                  - generic [ref=f10e112]: 영
                - generic [ref=f10e113]: 벽방산
              - button "벽방산 자세히" [ref=f10e114] [cursor=pointer]: 자세히
            - generic [ref=f10e115]:
              - button "제승당 담기" [ref=f10e116] [cursor=pointer]:
                - generic [ref=f10e117]:
                  - generic [ref=f10e118]: 보
                  - generic [ref=f10e119]: 영
                - generic [ref=f10e120]: 제승당
              - button "제승당 자세히" [ref=f10e121] [cursor=pointer]: 자세히
            - generic [ref=f10e122]:
              - button "가오치선착장 담기" [ref=f10e123] [cursor=pointer]:
                - generic [ref=f10e124]:
                  - generic [ref=f10e125]: 보
                  - generic [ref=f10e126]: 영
                - generic [ref=f10e127]: 가오치선착장
              - button "가오치선착장 자세히" [ref=f10e128] [cursor=pointer]: 자세히
            - generic [ref=f10e129]:
              - button "국립공원공단 한려해상생태탐방원 담기" [ref=f10e130] [cursor=pointer]:
                - generic [ref=f10e131]:
                  - generic [ref=f10e132]: 보
                  - generic [ref=f10e133]: 영
                - generic [ref=f10e134]: 국립공원공단 한려해상생태탐방원
              - button "국립공원공단 한려해상생태탐방원 자세히" [ref=f10e135] [cursor=pointer]: 자세히
            - generic [ref=f10e136]:
              - button "삼칭이길 담기" [ref=f10e137] [cursor=pointer]:
                - generic [ref=f10e138]:
                  - generic [ref=f10e139]: 보
                  - generic [ref=f10e140]: 영
                - generic [ref=f10e141]: 삼칭이길
              - button "삼칭이길 자세히" [ref=f10e142] [cursor=pointer]: 자세히
            - generic [ref=f10e143]:
              - button "청마거리 담기" [ref=f10e144] [cursor=pointer]:
                - generic [ref=f10e145]:
                  - generic [ref=f10e146]: 보
                  - generic [ref=f10e147]: 영
                - generic [ref=f10e148]: 청마거리
              - button "청마거리 자세히" [ref=f10e149] [cursor=pointer]: 자세히
            - generic [ref=f10e150]:
              - button "수륙해수욕장 담기" [ref=f10e151] [cursor=pointer]:
                - generic [ref=f10e152]:
                  - generic [ref=f10e153]: 보
                  - generic [ref=f10e154]: 영
                - generic [ref=f10e155]: 수륙해수욕장
              - button "수륙해수욕장 자세히" [ref=f10e156] [cursor=pointer]: 자세히
            - generic [ref=f10e157]:
              - button "남망산 조각공원 담기" [ref=f10e158] [cursor=pointer]:
                - generic [ref=f10e159]:
                  - generic [ref=f10e160]: 보
                  - generic [ref=f10e161]: 영
                - generic [ref=f10e162]: 남망산 조각공원
              - button "남망산 조각공원 자세히" [ref=f10e163] [cursor=pointer]: 자세히
          - generic [ref=f10e164]:
            - textbox "직접 담기" [active] [ref=f10e165]:
              - /placeholder: 찾는 곳이 없나요? 이름이나 지도 링크
            - button "담기" [disabled] [ref=f10e166]
          - generic [ref=f10e167]:
            - generic [ref=f10e168]: 담은 곳 1
            - generic [ref=f10e169]: ★ 0 · 보라 0 · 영상 1
            - button "동선 보기 ›" [ref=f10e170] [cursor=pointer]
        - button "건너뛰기" [ref=f10e171] [cursor=pointer]
      - navigation "주 메뉴" [ref=f10e172]:
        - link "홈" [ref=f10e173] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f10e176] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f10e179] [cursor=pointer]
        - link "지도" [ref=f10e182] [cursor=pointer]:
          - /url: /map
        - link "새 소식 5개 피드" [ref=f10e185] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 5개" [ref=f10e189]
          - text: 피드
    - status:
      - generic [ref=f10e190]: 담았어요
  - iframe [aria-hidden] [ref=f10e192]
```

# Test source

```ts
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
  181 |   await batch.commit();
  182 | 
  183 |   // 사진: 강릉 6장, 제주 4장, 도쿄 4장, 파리 2장
  184 |   const imgs = await makePhotos(page, 16);
  185 |   const plan: [string, string, { t: 'kr'; code: string } | { t: 'country'; id: string; city?: string }][] = [
  186 |     ...Array.from({ length: 6 }, (_, i) => ['t1', `2024-05-0${3 + (i % 3)}T${10 + i}:20`, { t: 'kr' as const, code: '51150' }] as [string, string, { t: 'kr'; code: string }]),
  187 |     ...Array.from({ length: 4 }, (_, i) => ['t2', `2023-10-1${2 + i}T1${i}:05`, { t: 'kr' as const, code: '50' }] as [string, string, { t: 'kr'; code: string }]),
  188 |     ...Array.from({ length: 4 }, (_, i) => ['t8', `2024-11-2${1 + i}T1${i + 2}:40`, { t: 'country' as const, id: 'JPN' }] as [string, string, { t: 'country'; id: string }]),
  189 |     ...Array.from({ length: 2 }, (_, i) => ['t10', `2019-09-0${3 + i}T15:00`, { t: 'country' as const, id: 'FRA' }] as [string, string, { t: 'country'; id: string }]),
  190 |   ];
  191 |   const pb = db.batch();
  192 |   plan.forEach(([tripId, taken, place], i) => {
  193 |     const id = `ph${String(i).padStart(2, '0')}`;
  194 |     const im = imgs[i];
  195 |     const l = Buffer.from(im.l, 'base64'), t = Buffer.from(im.t, 'base64');
  196 |     pb.set(sp.collection('photoData').doc(`${id}_l`), { photoId: id, tripId, kind: 'l', data: l, size: l.length, public: false, v: 1 });
  197 |     pb.set(sp.collection('photoData').doc(`${id}_t`), { photoId: id, tripId, kind: 't', data: t, size: t.length, public: false, v: 1 });
  198 |     pb.set(sp.collection('photos').doc(id), {
  199 |       tripId, w: im.w, h: im.h, taken, tz: '+09:00', takenGuess: false, lat: null, lng: null, place, camera: 'iPhone 15', bytes: l.length + t.length,
  200 |       ...(i === 0 ? { caption: '경포 해변 첫날' } : {}), createdBy: by, createdAt: Timestamp.now(), v: 1,
  201 |     });
  202 |   });
  203 |   await pb.commit();
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
  226 |   // 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서만 켜짐)
  227 |   await page.goto('/trips/t11/plan-next?step=when');
  228 |   await expect(page.getByTestId('flow-cal')).toBeVisible({ timeout: 15_000 });
  229 |   await expect(page.getByTestId('flow-nights')).toHaveText('2박 3일');
  230 |   await snap(page, 'm07a-plan-when');
  231 |   await page.getByTestId('flow-when-save').click();
  232 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'stay');
  233 |   await snap(page, 'm07b-plan-stay');
  234 |   await page.getByLabel('숙소').fill('통영 바다 앞 호텔');
  235 |   await page.getByTestId('flow-stay-save').click();
  236 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'pick');
  237 |   const own = page.getByLabel('직접 담기');
  238 |   await own.fill('서피랑');
  239 |   await own.press('Enter');
> 240 |   await expect(page.getByTestId('pick-card').filter({ hasText: '서피랑' })).toBeVisible();
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  241 |   await snap(page, 'm07c-plan-pick');
  242 |   await page.getByTestId('flow-pick-next').click();
  243 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'route');
  244 |   await expect(page.getByTestId('flow-day')).toHaveCount(3);
  245 |   await snap(page, 'm07d-plan-route');
  246 |   await page.getByTestId('flow-route-save').click();
  247 |   await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'hope');
  248 |   await page.getByLabel('기대 한 줄').fill('케이블카에서 보는 한려수도');
  249 |   await expect(page.getByTestId('flow-check')).toContainText('통영 바다 앞 호텔');
  250 |   await snap(page, 'm07e-plan-hope');
  251 |   await page.getByTestId('flow-hope-save').click();
  252 |   await expect(page).toHaveURL(/\/trips\/t11$/);
  253 |   await expect.poll(async () => (await sp.collection('trips').doc('t11').get()).data()?.planDone?.length).toBe(5);
  254 |   await page.goto('/trips/t10');
  255 |   await page.locator('.trip-cover').click();
  256 |   await page.waitForTimeout(1200);
  257 |   await page.screenshot({ path: path.join(OUT, 'm08-slideshow.jpg'), type: 'jpeg', quality: 82 });
  258 |   await page.keyboard.press('Escape');
  259 |   await page.goto('/record');
  260 |   await snap(page, 'm09-record');
  261 |   await page.goto('/trips/t1/edit');
  262 |   await snap(page, 'm10-trip-edit');
  263 |   await page.goto('/map');
  264 |   await snap(page, 'm11-map', false);
  265 |   await page.getByRole('tab', { name: '세계' }).first().click({ timeout: 5000 }).catch(() => undefined);
  266 |   await snap(page, 'm12-map-world', false);
  267 |   await page.goto('/wishes');
  268 |   await snap(page, 'm13-wishes');
  269 |   await page.goto('/wishes/w1');
  270 |   await snap(page, 'm14-wish-edit');
  271 |   await page.goto('/places');
  272 |   await snap(page, 'm15-places');
  273 |   await page.goto('/places/r1');
  274 |   await snap(page, 'm16-place-edit');
  275 |   await page.goto('/memories');
  276 |   await snap(page, 'm17-memories');
  277 |   await page.goto('/ask');
  278 |   const answersBefore = await page.getByTestId('answer').count();
  279 |   await page.getByRole('textbox').first().fill('강릉 몇 번 갔지?');
  280 |   await page.keyboard.press('Enter');
  281 |   // 첫 답이 붙은 뒤에 다음 질문 (고정 대기 대신)
  282 |   await expect.poll(() => page.getByTestId('answer').count()).toBeGreaterThan(answersBefore);
  283 |   await page.getByRole('textbox').first().fill('11월에 어디 가면 좋아?');
  284 |   await page.keyboard.press('Enter');
  285 |   await snap(page, 'm18-ask');
  286 |   await page.goto('/space');
  287 |   await snap(page, 'm19-space');
  288 |   await page.goto('/admin');
  289 |   await snap(page, 'm20-admin');
  290 |   // 지도 시트
  291 |   await page.goto('/');
  292 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  293 |   await page.goto('/map');
  294 |   await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  295 |   await settle(page);
  296 |   // 강릉을 눌러 지역 창 (위쪽에 여행지 사진)
  297 |   const pt = await page.evaluate(() => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([128.88, 37.74]));
  298 |   const box = await page.getByTestId('map').first().boundingBox();
  299 |   if (box) await page.mouse.click(box.x + pt.x, box.y + pt.y);
  300 |   // 지역 창이 뜨면 바로 (못 뜨면 전처럼 그냥 찍는다: 이 파일은 디자인 검수용 사진이 목적)
  301 |   await page.getByTestId('region-sheet').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  302 |   await snap(page, 'm22-sheet', false);
  303 |   await page.context().close();
  304 | });
  305 | 
  306 | test('가득 찬 화면 · PC', async ({ browser }) => {
  307 |   test.setTimeout(480_000);
  308 |   const page = await desktop(browser);
  309 |   await page.goto('/');
  310 |   await expect(page.getByTestId('email-open')).toBeVisible({ timeout: 20_000 });
  311 |   await page.waitForTimeout(2500);
  312 |   await snap(page, 'd00-login', false);
  313 |   await signIn(page);
  314 |   for (const [route, name] of [['/', 'd01-home'], ['/trips', 'd02-trips'], ['/trips/t1', 'd03-trip'], ['/trips/t11', 'd04-planned'], ['/record', 'd05-record'], ['/map', 'd06-map'], ['/wishes', 'd07-wishes'], ['/places', 'd08-places'], ['/memories', 'd09-memories'], ['/ask', 'd10-ask'], ['/space', 'd11-space'], ['/admin', 'd12-admin']] as const) {
  315 |     await page.goto(route);
  316 |     await snap(page, name, route !== '/map');
  317 |   }
  318 |   // 공유 페이지 (로그인 없이)
  319 |   await page.goto('/trips/t1');
  320 |   const card = page.getByTestId('share-link');
  321 |   await card.getByTestId('share-on').click();
  322 |   const url = await card.getByLabel('공유 링크').inputValue();
  323 |   const anon = await mobile(browser);
  324 |   await anon.goto(url);
  325 |   await expect(anon.getByTestId('shared-trip')).toBeVisible();
  326 |   await snap(anon, 'm21-shared');
  327 |   await anon.context().close();
  328 |   await page.context().close();
  329 | });
  330 | 
  331 | test('화면 오류 없음', () => {
  332 |   expect(problems, problems.join('\n')).toEqual([]);
  333 | });
  334 | 
```