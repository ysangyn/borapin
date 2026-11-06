# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기
- Location: tests/app.spec.ts:933:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByTestId('desk-drawers').getByRole('button', { name: /^언제 모름/ })

```

# Page snapshot

```yaml
- generic [active] [ref=f6e1]:
  - generic [ref=f6e2]:
    - generic [ref=f6e3]:
      - generic [ref=f6e4]:
        - generic [ref=f6e6]:
          - button "뒤로" [ref=f6e7] [cursor=pointer]
          - heading "사진 서랍" [level=1] [ref=f6e10]
        - generic [ref=f6e11]:
          - generic [ref=f6e12]: 사진 3장
          - generic [ref=f6e13]: 여행 0번
          - generic [ref=f6e14]: 중복 2장
          - generic [ref=f6e15]: 모르는 사진 3장
          - generic [ref=f6e16]:
            - text: 파일 5개 · 4KB ·
            - button "다른 사진 고르기" [ref=f6e17] [cursor=pointer]
        - navigation "서랍 위치" [ref=f6e18]:
          - button "서랍" [ref=f6e19] [cursor=pointer]
          - generic [ref=f6e20]:
            - text: ›
            - button "모르는 사진" [ref=f6e21] [cursor=pointer]
        - button "어디 모름 2장" [ref=f6e23] [cursor=pointer]:
          - generic [ref=f6e27]: 어디 모름
          - generic [ref=f6e28]: 2장
      - navigation "주 메뉴" [ref=f6e31]:
        - link "홈" [ref=f6e32] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f6e35] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f6e38] [cursor=pointer]
        - link "지도" [ref=f6e41] [cursor=pointer]:
          - /url: /map
        - link "새 소식 2개 피드" [ref=f6e44] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 2개" [ref=f6e48]
          - text: 피드
    - status
  - iframe [aria-hidden] [ref=f6e49]
```

# Test source

```ts
  916  |     await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'true');
  917  |     await expect(items.first().getByTestId('feed-heart-names')).toHaveText('나');
  918  |     const bora2 = await browser.newPage();
  919  |     await signIn(bora2, 'bora@example.com');
  920  |     await expect(bora2.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
  921  |     await bora2.getByTestId('nav-feed').click();
  922  |     await expect(bora2.getByTestId('feed-item').first().getByTestId('feed-heart-names')).toHaveText('영상');
  923  |     await expect(bora2.getByTestId('feed-dot')).toHaveCount(0);
  924  |     await bora2.close();
  925  |     // 다시 누르면 뺀다
  926  |     await items.first().getByTestId('feed-heart').click();
  927  |     await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'false');
  928  |     // 추억 돌아보기로 넘어갈 수 있다
  929  |     await page.getByTestId('to-memories').click();
  930  |     await expect(page).toHaveURL(/\/memories$/);
  931  |   });
  932  | 
  933  |   test('공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기', async ({ page, browser }) => {
  934  |     await signIn(page, OWNER);
  935  |     await page.goto('/trips');
  936  |     await page.getByText('강릉시 여행', { exact: true }).click();
  937  |     const card = page.getByTestId('share-link');
  938  |     await card.getByTestId('share-on').click();
  939  |     const url = await card.getByLabel('공유 링크').inputValue();
  940  |     expect(url).toMatch(/\/s\/[a-z0-9]{8,}$/);
  941  |     // 보내기: 시험 주소는 카카오에 등록돼 있지 않으니 기기 공유하기로 (제목과 링크를 넘긴다)
  942  |     await expect(card.getByTestId('share-send')).toHaveText('보내기');
  943  |     await page.evaluate(() => { (navigator as unknown as { share: (d: ShareData) => Promise<void> }).share = async (d) => { (window as unknown as { __shared: ShareData }).__shared = d; }; });
  944  |     await card.getByTestId('share-send').click();
  945  |     await expect.poll(() => page.evaluate(() => (window as unknown as { __shared?: ShareData }).__shared)).toMatchObject({ title: '강릉시 여행', url });
  946  | 
  947  |     // 로그인하지 않은 사람이 링크로 연다
  948  |     const anon = await (await browser.newContext({ locale: 'ko-KR', serviceWorkers: 'block' })).newPage();
  949  |     await anon.goto(url);
  950  |     const shared = anon.getByTestId('shared-trip');
  951  |     await expect(shared).toContainText('강릉시 여행');
  952  |     await expect(shared).toContainText('초당할머니순두부');
  953  |     await shared.locator('.photo-grid').scrollIntoViewIfNeeded();
  954  |     await expect(shared.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  955  |     await expect(shared.locator('.trip-cover img[data-loaded]')).toHaveCount(1);
  956  |     await expect(shared).not.toContainText('바다 보며 커피 마신 날');
  957  |     const photoId = await shared.locator('.photo-cell img').first().getAttribute('data-photo');
  958  |     // 로그인 없이도 지도가 그려진다
  959  |     await expectMapDrawn(anon);
  960  |     await anon.screenshot({ path: `${SHOTS}/15-shared-trip.png` });
  961  | 
  962  |     // 공개를 끄면 링크가 닫힌다
  963  |     await card.getByRole('button', { name: '공개 끄기' }).click();
  964  |     await expect(card.getByTestId('share-on')).toBeVisible();
  965  |     await anon.reload();
  966  |     await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible();
  967  |     // 공개를 끈 사진 파일은 로그인 없이 못 읽는다
  968  |     const denied = await anon.evaluate((id) => (window as unknown as { __testPhoto: (id: string) => Promise<number> }).__testPhoto(id!).then(() => 'read', (e: { code?: string; message: string }) => e.code ?? e.message), photoId);
  969  |     expect(denied).toBe('permission-denied');
  970  |     await anon.context().close();
  971  | 
  972  |     // 공유 카드: 1080×1350 그림
  973  |     await page.goto('/memories');
  974  |     const sc = page.getByTestId('share-cards');
  975  |     await sc.getByRole('button', { name: '우리 지도' }).click();
  976  |     await expect(sc.getByTestId('card-img')).toBeVisible();
  977  |     const size = await sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
  978  |     expect(size).toEqual([1080, 1350]);
  979  |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15b-card-map.png` });
  980  |     // 다른 카드를 고르면 새 그림(blob 주소)이 올 때까지 옛 그림이 남는다: 주소가 바뀌고 다 그려진 뒤에 찍는다
  981  |     const mapCardSrc = await sc.getByTestId('card-img').getAttribute('src');
  982  |     await sc.getByRole('button', { name: '메모 인용' }).click();
  983  |     await expect(sc.getByTestId('card-img')).not.toHaveAttribute('src', mapCardSrc ?? '');
  984  |     await expect.poll(() => sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  985  |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15c-card-quote.png` });
  986  | 
  987  |     // 사진함용 여행 목록: 다녀온 여행만 든 JSON
  988  |     await page.goto('/space');
  989  |     const [tj] = await Promise.all([page.waitForEvent('download'), page.getByTestId('trips-json').click()]);
  990  |     expect(tj.suggestedFilename()).toMatch(/^보라핀-여행목록_.*\.json$/);
  991  |     const tjson = JSON.parse((await import('node:fs')).readFileSync((await tj.path())!, 'utf8'));
  992  |     expect(tjson.v).toBe(1);
  993  |     expect(tjson.trips.length).toBeGreaterThan(0);
  994  |     expect(tjson.trips.every((t: { status: string }) => t.status === 'done')).toBe(true);
  995  | 
  996  |     // 사진 훑어보기(폰): 고른 사진을 폰 안에서만 읽어 네 숫자 — 같은 사진 두 번 고르면 중복 1
  997  |     await page.getByTestId('desk-link').click();
  998  |     await expect(page).toHaveURL(/\/desk$/);
  999  |     const FIX = new URL('./desk/fixtures/', import.meta.url).pathname;
  1000 |     const nfs = await import('node:fs');
  1001 |     const pick = (name: string, from: string) => ({ name, mimeType: 'image/jpeg', buffer: nfs.readFileSync(`${FIX}${from}`) });
  1002 |     await page.getByTestId('desk-files').setInputFiles([
  1003 |       pick('exif-gangneung.jpg', 'exif-gangneung.jpg'), pick('20190812_183000.jpg', '20190812_183000.jpg'), pick('IMG_0421.JPG', 'IMG_0421.JPG'),
  1004 |       pick('copy.jpg', 'exif-gangneung.jpg'), // 같은 사진 → 중복
  1005 |       pick('DSC_9999.JPG', '20190812_183000.jpg'), // 촬영 정보도 파일명 날짜도 없음 → 모름
  1006 |     ]);
  1007 |     const nums = page.getByTestId('desk-nums');
  1008 |     await expect(nums).toContainText('사진 3장', { timeout: 15_000 });
  1009 |     await expect(nums).toContainText('파일 5개');
  1010 |     await expect(nums).toContainText('중복 2장');
  1011 |     // 서랍: 모르는 사진 → 언제 모름 → DSC_9999 (촬영 정보도 파일명 날짜도 없음)
  1012 |     const drawers = page.getByTestId('desk-drawers');
  1013 |     await expect(drawers).toContainText('모르는 사진');
  1014 |     await shot(page, '15d-desk-scan');
  1015 |     await drawers.getByRole('button', { name: /^모르는 사진/ }).click();
> 1016 |     await drawers.getByRole('button', { name: /^언제 모름/ }).click();
       |                                                           ^ Error: locator.click: Test timeout of 60000ms exceeded.
  1017 |     await expect(page.getByTestId('desk-crumb')).toContainText('언제 모름');
  1018 |     await expect(page.getByTestId('desk-grid').getByRole('button', { name: 'DSC_9999.JPG' })).toBeVisible();
  1019 |     await page.getByTestId('desk-grid').getByRole('button', { name: 'DSC_9999.JPG' }).click();
  1020 |     await expect(page.getByRole('dialog')).toContainText('수정 시각(추정)');
  1021 |     await shot(page, '15d2-desk-view');
  1022 |     await page.getByRole('dialog').click();
  1023 |     await page.getByTestId('desk-crumb').getByRole('button', { name: '서랍' }).click();
  1024 |     await expect(drawers).toContainText('중복');
  1025 |     await page.goto('/space');
  1026 | 
  1027 |     // 엑셀: 시트 4개짜리 .xlsx
  1028 |     const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('xlsx').click()]);
  1029 |     expect(dl.suggestedFilename()).toMatch(/^보라핀_.*\.xlsx$/);
  1030 |     const fs = await import('node:fs');
  1031 |     const buf = fs.readFileSync((await dl.path())!);
  1032 |     expect(buf.subarray(0, 2).toString()).toBe('PK');
  1033 |     expect(buf.length).toBeGreaterThan(5000);
  1034 |   });
  1035 | 
  1036 |   test('우리 공간엔 개발자 글 대신 출처와 버전 링크, 버전·지도 출처는 /credits에', async ({ page }) => {
  1037 |     await signIn(page, OWNER);
  1038 |     await page.goto('/space');
  1039 |     await expect(page.getByTestId('space-title')).toBeVisible();
  1040 |     // 횟수는 우리말로 ('3번'이 아니라 '세 번')
  1041 |     await expect(page.locator('.page')).not.toContainText(/여행 \d+번/);
  1042 |     await expect(page.getByTestId('app-version')).toHaveCount(0);
  1043 |     await expect(page.getByText(/SGIS/)).toHaveCount(0);
  1044 |     await page.getByTestId('credits-link').click();
  1045 |     await expect(page).toHaveURL(/\/credits$/);
  1046 |     await expect(page.getByRole('heading', { name: '출처와 버전' })).toBeVisible();
  1047 |     await expect(page.getByTestId('app-version')).toContainText(/보라핀 v\S+ · 빌드 /);
  1048 |     await expect(page.getByTestId('map-credits')).toContainText('통계청 SGIS');
  1049 |   });
  1050 | 
  1051 |   test('관리자: 사용량, 사진 올리기 멈춤, 문제 신고', async ({ page }) => {
  1052 |     await signIn(page, OWNER);
  1053 |     await page.goto('/space');
  1054 |     // 문제 신고
  1055 |     page.once('dialog', (d) => d.accept('지도가 가끔 늦게 떠요'));
  1056 |     await page.getByTestId('report').click();
  1057 |     await expect(page.getByRole('status')).toContainText('보내 주셔서 고마워요');
  1058 |     await page.getByTestId('admin-link').click();
  1059 |     const admin = page.getByTestId('admin');
  1060 |     await expect(admin.getByTestId('usage')).toContainText('사진 3장');
  1061 |     await expect(admin.getByTestId('usage')).toContainText('/ 1GB');
  1062 |     await expect(admin.getByTestId('plan')).toContainText('무료(Spark)');
  1063 |     await expect(admin.getByTestId('reports')).toContainText('지도가 가끔 늦게 떠요');
  1064 |     // 사진 올리기 멈춤 → 여행 사진 탭에서 막힘
  1065 |     await admin.getByLabel('멈추는 이유').fill('예산 점검');
  1066 |     await admin.getByTestId('uploads-off').click();
  1067 |     await expect(admin.getByTestId('cutoff')).toContainText('멈춤 · 예산 점검');
  1068 |     await shot(page, '16-admin');
  1069 |     await page.goto('/trips');
  1070 |     await page.getByText('강릉시 여행', { exact: true }).click();
  1071 |     await page.getByRole('tab', { name: /사진/ }).click();
  1072 |     await page.getByTestId('photo-add').click();
  1073 |     await expect(page.getByRole('status')).toContainText('사진 올리기를 잠시 멈췄어요');
  1074 |     await page.goto('/admin');
  1075 |     await page.getByTestId('uploads-on').click();
  1076 |     await expect(page.getByTestId('cutoff')).toContainText('켜짐');
  1077 |     await page.getByTestId('reports').getByRole('button', { name: '해결함' }).first().click();
  1078 |     await expect(page.getByTestId('reports')).toContainText('들어온 신고가 없어요');
  1079 |   });
  1080 | 
  1081 |   test('이메일로 가입하고 메일 인증 뒤 들어온다', async ({ page }) => {
  1082 |     const MAIL = 'mail.bora@example.com';
  1083 |     // 주인이 먼저 이 메일을 함께 쓰는 사람에 넣는다
  1084 |     await signIn(page, OWNER);
  1085 |     await page.goto('/space');
  1086 |     await page.getByLabel('추가할 계정').fill(MAIL);
  1087 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  1088 |     await expect(page.getByText(MAIL).first()).toBeVisible();
  1089 |     await page.getByRole('button', { name: '로그아웃' }).click();
  1090 |     // 가입 (메일 칸은 접혀 있다)
  1091 |     await page.getByTestId('email-open').click();
  1092 |     const form = page.getByTestId('email-form');
  1093 |     await form.getByRole('radio', { name: '처음이에요' }).click();
  1094 |     await form.getByLabel('메일 주소').fill(MAIL);
  1095 |     await form.getByLabel('비밀번호').fill('borapin-1234');
  1096 |     await form.getByTestId('email-submit').click();
  1097 |     await expect(page.getByTestId('verify')).toContainText(MAIL);
  1098 |     await shot(page, '10b-verify');
  1099 |     // 인증 전에는 못 들어온다
  1100 |     await page.getByTestId('verified').click();
  1101 |     await expect(page.getByTestId('verify')).toContainText('아직 인증되지 않았어요');
  1102 |     // 메일 속 링크를 누른 것처럼 (에뮬레이터에서 인증 코드를 적용)
  1103 |     const host = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';
  1104 |     const codes = (await (await fetch(`http://${host}/emulator/v1/projects/demo-borapin/oobCodes`)).json()) as { oobCodes: { email: string; oobCode: string; requestType: string }[] };
  1105 |     const code = codes.oobCodes.reverse().find((c) => c.email === MAIL && c.requestType === 'VERIFY_EMAIL');
  1106 |     expect(code).toBeTruthy();
  1107 |     const r = await fetch(`http://${host}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ oobCode: code!.oobCode }) });
  1108 |     expect(r.ok).toBeTruthy();
  1109 |     await page.getByTestId('verified').click();
  1110 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  1111 |     // 다시 로그인: 틀린 비밀번호(400이 정상) → 맞는 비밀번호
  1112 |     expected = [/accounts:signInWithPassword/];
  1113 |     await page.goto('/space');
  1114 |     await page.getByRole('button', { name: '로그아웃' }).click();
  1115 |     // 지난번에 메일로 들어왔으면 메일 칸이 이미 펼쳐져 있다
  1116 |     await expect(page.getByTestId('email-form')).toBeVisible();
```