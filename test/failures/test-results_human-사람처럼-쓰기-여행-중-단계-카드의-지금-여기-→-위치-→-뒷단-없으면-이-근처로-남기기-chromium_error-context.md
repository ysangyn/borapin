# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 여행 중: 단계 카드의 '지금 여기' → 위치 → (뒷단 없으면) 이 근처로 남기기
- Location: tests/human.spec.ts:739:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "이 근처 남겼어요"
Received string:    ""
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByRole('status') with timeout 15000ms
  - waiting for getByRole('status')
    3 × locator resolved to <div role="status" aria-live="polite" class="toast-region"></div>
      - unexpected value ""
    11 × locator resolved to <div role="status" aria-live="polite" class="toast-region">…</div>
       - unexpected value "강릉시 이 근처를 남겼어요한 줄 쓰기"
    19 × locator resolved to <div role="status" aria-live="polite" class="toast-region"></div>
       - unexpected value ""

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "우리 공간":
  - /url: /space
  - text: 보 영 m
- text: 보라 · 영상 외 1명의 지도 아홉 번의 여행, 핀 9개 꽂았어요
- link "강릉 지금 여행 보기":
  - /url: /trips/X4qsucO3C3XXgnPTWdOC
- text: 여행 중 강릉 지금 여행 D-day · 강릉시 오늘 찍은 사진을 바로 올려 두세요 · 2026.11.5–6
- link "사진 올리기":
  - /url: /trips/X4qsucO3C3XXgnPTWdOC?tab=photos
- button "지금 여기"
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해 1 1 2 2
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 핀 꽂기 단추가 나와요 전체 보기 단추를 누르면 전국이 보여요 8 /160 시·군 6 /16 광역 1 개국 5 예정
- button "집에서 가장 가까운 빈 칸은 부천시예요 · 차로 약 20분"
- textbox "물어보기":
  - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 4곳":
  - /url: /wishes
- link "다음 여행 · D-5 속초 단풍 여행 2026.11.10":
  - /url: /trips/8SadEbjQVm4dZLc675CJ
- link "통영시 여행 2026.11.14–15":
  - /url: /trips/coF2XZmcfBgPH7sD3PDi
- link "고성군 여행 2026.11.14–15":
  - /url: /trips/wYv3xb8TfDukBMpn4CnN
- text: 오늘의 한 질문
- paragraph: 제주에서 밤에는 뭘 하고 싶어?
- text: 나 흑돼지랑 고기국수 상대가 답하면 서로의 답이 열려요 강원 속초시 가는 길
- button "가기 좋은 때 4~6, 9·10월 · 선선하고 비가 적어요"
- text: 우리 집에서 직선 158km · 시·군 가운데까지
- button "길찾기"
- link "한 번에 시외버스 고양종합→속초 약 3시간 10분 · 하루 3편 · 시외버스 예매에서 예매 · 11월 기준":
  - /url: https://txbus.t-money.co.kr/
- group: 자세히 · 교통·들러 가기 ▾
- link "오늘의 영어 10문장 · 오늘 했어요":
  - /url: /study
- group: 이달의 추천 · 가고 싶은 곳
- heading "최근에 남긴 기록" [level=2]
- link "전체 보기":
  - /url: /trips
- link "여수 밤바다 사진 전남 여수시 · 날짜 모름":
  - /url: /trips/EgtGgYh3okbHoDm6sIsZ
- link "전남 고흥군 여행 전남 고흥군 · 날짜 모름":
  - /url: /trips/R34lGRAsRy2Yq99D52Jx
- link "칠곡군 여행 경북 칠곡군 · 날짜 모름":
  - /url: /trips/vK6D2XZzbgR9EhOWUFCV
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "남기기"
  - link "지도":
    - /url: /map
  - link "새 소식 2개 피드":
    - /url: /feed
    - text: 피드
- link "물어보기":
  - /url: /ask
- status
```

# Test source

```ts
  658 |     await page.getByRole('tab', { name: '단어장' }).click();
  659 |     await expect(page.getByText(/깃발/)).toBeVisible();
  660 |     await page.context().close();
  661 |   });
  662 | 
  663 |   test('로그인: 구글 단추가 맨 위, 메일은 접혀 있다가 누르면 펼쳐진다', { tag: '@webkit' }, async ({ browser }) => {
  664 |     const page = await phone(browser);
  665 |     await page.goto('/');
  666 |     const google = page.getByTestId('login');
  667 |     const open = page.getByTestId('email-open');
  668 |     await expect(google).toBeVisible();
  669 |     await expect(page.getByTestId('email-form')).toHaveCount(0);
  670 |     expect((await google.boundingBox())!.y).toBeLessThan((await open.boundingBox())!.y);
  671 |     await open.click();
  672 |     await expect(page.getByTestId('email-form')).toBeVisible();
  673 |     await page.getByRole('radio', { name: '처음이에요' }).click();
  674 |     await expect(page.getByTestId('email-submit')).toHaveText('가입하기');
  675 |     await page.context().close();
  676 |   });
  677 | 
  678 |   test('카카오톡 안 브라우저로 열면 바깥 브라우저 안내와 주소 복사 단추가 먼저 보인다', async ({ browser }) => {
  679 |     const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.4.0', permissions: ['clipboard-read', 'clipboard-write'] });
  680 |     const page = watch(await ctx.newPage());
  681 |     await page.goto('/');
  682 |     const note = page.getByTestId('inapp-notice');
  683 |     await expect(note).toBeVisible();
  684 |     await expect(note).toContainText('카카오톡');
  685 |     await note.getByRole('button', { name: '주소 복사' }).click();
  686 |     await expect(page.getByRole('status')).toContainText(/복사했어요|복사하지 못했어요/);
  687 |     await ctx.close();
  688 |   });
  689 | 
  690 |   test('가고 싶은 곳에서 여행 만들기: /plan?wish= 로 가서 목적지가 미리 채워지고, 뽑기는 ?find=dice 로 바로 열린다', async ({ browser }) => {
  691 |     const page = await phone(browser);
  692 |     await signIn(page);
  693 |     await page.goto('/wishes/new');
  694 |     await page.getByLabel('어디 검색').fill('통영');
  695 |     await page.getByRole('option', { name: /통영시/ }).first().click();
  696 |     await page.getByTestId('wish-save').click();
  697 |     await expect(page).toHaveURL(/\/wishes$/);
  698 |     await page.getByRole('link', { name: /통영시.*가고 싶은 곳 보기/ }).first().click();
  699 |     const id = page.url().split('/wishes/')[1];
  700 |     await page.getByTestId('wish-edit-plan').click();
  701 |     await expect(page).toHaveURL(new RegExp(`/plan\\?wish=${id}$`));
  702 |     await expect(page.getByTestId('planner-dest')).toContainText('통영');
  703 |     await expect(page.getByTestId('planner-make')).toHaveText('여행 만들기');
  704 |     await page.getByTestId('planner-make').click();
  705 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\/plan-next/);
  706 |     await expect(page.getByTestId('plan-flow')).toBeVisible();
  707 |     // 여행 탭·메뉴의 '여행 계획하기'도 /plan 하나로
  708 |     await page.goto('/wishes?find=dice');
  709 |     await expect(page.getByTestId('dice')).toBeVisible();
  710 |     await page.context().close();
  711 |   });
  712 | 
  713 |   for (const width of [360, 375, 390]) {
  714 |     test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, { tag: '@webkit' }, async ({ browser }) => {
  715 |       const page = await phone(browser, width, 740);
  716 |       await page.goto('/');
  717 |       const art = page.locator('.login-mascot');
  718 |       await expect(art).toBeVisible();
  719 |       await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  720 |       const a = await art.boundingBox();
  721 |       // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
  722 |       const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
  723 |         const r = document.createRange();
  724 |         r.selectNodeContents(el);
  725 |         const b = r.getBoundingClientRect();
  726 |         return { x: b.x, y: b.y, width: b.width, height: b.height };
  727 |       });
  728 |       const t = await textBox('.login-tag');
  729 |       const b = await textBox('.login-brand');
  730 |       for (const r of [t, b]) {
  731 |         if (!a || !r) throw new Error('그림이나 문구가 없어요');
  732 |         const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
  733 |         expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
  734 |       }
  735 |       await page.context().close();
  736 |     });
  737 |   }
  738 | 
  739 |   test('여행 중: 단계 카드의 \'지금 여기\' → 위치 → (뒷단 없으면) 이 근처로 남기기', async ({ browser }) => {
  740 |     test.setTimeout(120_000);
  741 |     const page = await phone(browser);
  742 |     await page.context().grantPermissions(['geolocation']);
  743 |     await page.context().setGeolocation({ latitude: 37.7956, longitude: 128.8961 }); // 강릉 경포
  744 |     await signIn(page);
  745 |     const t = new Date(); const t2 = new Date(t); t2.setDate(t.getDate() + 1);
  746 |     const id = await page.evaluate((w) => (window as unknown as { __testAddTrip: (i: unknown) => Promise<string> }).__testAddTrip({
  747 |       title: '강릉 지금 여행', kind: 'trip', status: 'planned', when: w, places: [{ t: 'kr', code: '51150' }], companions: [], memo: '', tags: [], source: 'app',
  748 |     }), { p: 'day', y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate(), y2: t2.getFullYear(), m2: t2.getMonth() + 1, d2: t2.getDate() });
  749 |     try {
  750 |       await page.goto('/');
  751 |       const stage = page.getByTestId('stage-card');
  752 |       await expect(stage).toHaveAttribute('data-stage', 'during');
  753 |       await stage.getByTestId('here-now').click({ timeout: 15_000 });
  754 |       const sheet = page.getByTestId('here-sheet');
  755 |       // 에뮬레이터에선 뒷단(관광공사)을 부르지 않으므로 '이 근처로 남기기'만
  756 |       await expect(sheet).toContainText('지금은 근처 장소를 찾을 수 없어요');
  757 |       await sheet.getByTestId('here-fallback').click({ timeout: 15_000 });
> 758 |       await expect(page.getByRole('status')).toContainText('이 근처 남겼어요');
      |                                              ^ Error: expect(locator).toContainText(expected) failed
  759 |       await expect(sheet).toHaveCount(0);
  760 |     } finally {
  761 |       // 지우기가 막혀도 시험 실패 이유가 가려지지 않게 10초만 기다린다
  762 |       await Promise.race([page.evaluate((x) => (window as unknown as { __testDeleteTrip: (i: string) => Promise<void> }).__testDeleteTrip(x), id).catch(() => {}), new Promise((r) => setTimeout(r, 10_000))]);
  763 |       await page.context().close();
  764 |     }
  765 |   });
  766 | });
  767 | 
```