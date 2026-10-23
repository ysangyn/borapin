# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 이메일로 가입하고 메일 인증 뒤 들어온다
- Location: tests/app.spec.ts:989:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByTestId('email-open')

```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e4]:
      - banner [ref=f4e8]:
        - generic [ref=f4e9]:
          - img "보라핀 로고" [ref=f4e11]
          - generic [ref=f4e15]: 보라핀
        - paragraph [ref=f4e16]: 가본 곳마다, 우리 핀 하나
      - main [ref=f4e17]:
        - button "구글로 계속하기" [ref=f4e18] [cursor=pointer]
        - generic [ref=f4e24]: 초대받은 메일 주소로만 들어올 수 있어요.
        - generic [ref=f4e25]: 또는
        - generic [ref=f4e27]:
          - radiogroup "로그인 또는 가입" [ref=f4e28]:
            - radio "로그인" [checked] [ref=f4e29] [cursor=pointer]
            - radio "처음이에요" [ref=f4e30] [cursor=pointer]
          - textbox "메일 주소" [ref=f4e31]
          - textbox "비밀번호" [ref=f4e32]
          - button "로그인" [disabled] [ref=f4e33]
          - button "비밀번호를 잊었어요" [ref=f4e34] [cursor=pointer]
        - generic [ref=f4e35]:
          - link "이용약관" [ref=f4e36] [cursor=pointer]:
            - /url: /terms
          - link "개인정보 처리방침" [ref=f4e37] [cursor=pointer]:
            - /url: /privacy
          - link "사진 출처" [ref=f4e38] [cursor=pointer]:
            - /url: /credits
    - status
  - iframe [aria-hidden] [ref=f4e39]
```

# Test source

```ts
  923  |     await page.goto('/memories');
  924  |     const sc = page.getByTestId('share-cards');
  925  |     await sc.getByRole('button', { name: '우리 지도' }).click();
  926  |     await expect(sc.getByTestId('card-img')).toBeVisible();
  927  |     const size = await sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
  928  |     expect(size).toEqual([1080, 1350]);
  929  |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15b-card-map.png` });
  930  |     await sc.getByRole('button', { name: '메모 인용' }).click();
  931  |     await page.waitForTimeout(800);
  932  |     await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15c-card-quote.png` });
  933  | 
  934  |     // 엑셀: 시트 4개짜리 .xlsx
  935  |     await page.goto('/space');
  936  |     const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('xlsx').click()]);
  937  |     expect(dl.suggestedFilename()).toMatch(/^보라핀_.*\.xlsx$/);
  938  |     const fs = await import('node:fs');
  939  |     const buf = fs.readFileSync((await dl.path())!);
  940  |     expect(buf.subarray(0, 2).toString()).toBe('PK');
  941  |     expect(buf.length).toBeGreaterThan(5000);
  942  |   });
  943  | 
  944  |   test('우리 공간엔 개발자 글 대신 출처와 버전 링크, 버전·지도 출처는 /credits에', async ({ page }) => {
  945  |     await signIn(page, OWNER);
  946  |     await page.goto('/space');
  947  |     await expect(page.getByTestId('space-title')).toBeVisible();
  948  |     // 횟수는 우리말로 ('3번'이 아니라 '세 번')
  949  |     await expect(page.locator('.page')).not.toContainText(/여행 \d+번/);
  950  |     await expect(page.getByTestId('app-version')).toHaveCount(0);
  951  |     await expect(page.getByText(/SGIS/)).toHaveCount(0);
  952  |     await page.getByTestId('credits-link').click();
  953  |     await expect(page).toHaveURL(/\/credits$/);
  954  |     await expect(page.getByRole('heading', { name: '출처와 버전' })).toBeVisible();
  955  |     await expect(page.getByTestId('app-version')).toContainText(/보라핀 v\S+ · 빌드 /);
  956  |     await expect(page.getByTestId('map-credits')).toContainText('통계청 SGIS');
  957  |   });
  958  | 
  959  |   test('관리자: 사용량, 사진 올리기 멈춤, 문제 신고', async ({ page }) => {
  960  |     await signIn(page, OWNER);
  961  |     await page.goto('/space');
  962  |     // 문제 신고
  963  |     page.once('dialog', (d) => d.accept('지도가 가끔 늦게 떠요'));
  964  |     await page.getByTestId('report').click();
  965  |     await expect(page.getByRole('status')).toContainText('보내 주셔서 고마워요');
  966  |     await page.getByTestId('admin-link').click();
  967  |     const admin = page.getByTestId('admin');
  968  |     await expect(admin.getByTestId('usage')).toContainText('사진 3장');
  969  |     await expect(admin.getByTestId('usage')).toContainText('/ 1GB');
  970  |     await expect(admin.getByTestId('plan')).toContainText('무료(Spark)');
  971  |     await expect(admin.getByTestId('reports')).toContainText('지도가 가끔 늦게 떠요');
  972  |     // 사진 올리기 멈춤 → 여행 사진 탭에서 막힘
  973  |     await admin.getByLabel('멈추는 이유').fill('예산 점검');
  974  |     await admin.getByTestId('uploads-off').click();
  975  |     await expect(admin.getByTestId('cutoff')).toContainText('멈춤 · 예산 점검');
  976  |     await shot(page, '16-admin');
  977  |     await page.goto('/trips');
  978  |     await page.getByText('강릉시 여행', { exact: true }).click();
  979  |     await page.getByRole('tab', { name: /사진/ }).click();
  980  |     await page.getByTestId('photo-add').click();
  981  |     await expect(page.getByRole('status')).toContainText('사진 올리기를 잠시 멈췄어요');
  982  |     await page.goto('/admin');
  983  |     await page.getByTestId('uploads-on').click();
  984  |     await expect(page.getByTestId('cutoff')).toContainText('켜짐');
  985  |     await page.getByTestId('reports').getByRole('button', { name: '해결함' }).first().click();
  986  |     await expect(page.getByTestId('reports')).toContainText('들어온 신고가 없어요');
  987  |   });
  988  | 
  989  |   test('이메일로 가입하고 메일 인증 뒤 들어온다', async ({ page }) => {
  990  |     const MAIL = 'mail.bora@example.com';
  991  |     // 주인이 먼저 이 메일을 함께 쓰는 사람에 넣는다
  992  |     await signIn(page, OWNER);
  993  |     await page.goto('/space');
  994  |     await page.getByLabel('추가할 계정').fill(MAIL);
  995  |     await page.getByRole('button', { name: '추가', exact: true }).click();
  996  |     await expect(page.getByText(MAIL).first()).toBeVisible();
  997  |     await page.getByRole('button', { name: '로그아웃' }).click();
  998  |     // 가입 (메일 칸은 접혀 있다)
  999  |     await page.getByTestId('email-open').click();
  1000 |     const form = page.getByTestId('email-form');
  1001 |     await form.getByRole('radio', { name: '처음이에요' }).click();
  1002 |     await form.getByLabel('메일 주소').fill(MAIL);
  1003 |     await form.getByLabel('비밀번호').fill('borapin-1234');
  1004 |     await form.getByTestId('email-submit').click();
  1005 |     await expect(page.getByTestId('verify')).toContainText(MAIL);
  1006 |     await shot(page, '10b-verify');
  1007 |     // 인증 전에는 못 들어온다
  1008 |     await page.getByTestId('verified').click();
  1009 |     await expect(page.getByTestId('verify')).toContainText('아직 인증되지 않았어요');
  1010 |     // 메일 속 링크를 누른 것처럼 (에뮬레이터에서 인증 코드를 적용)
  1011 |     const host = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';
  1012 |     const codes = (await (await fetch(`http://${host}/emulator/v1/projects/demo-borapin/oobCodes`)).json()) as { oobCodes: { email: string; oobCode: string; requestType: string }[] };
  1013 |     const code = codes.oobCodes.reverse().find((c) => c.email === MAIL && c.requestType === 'VERIFY_EMAIL');
  1014 |     expect(code).toBeTruthy();
  1015 |     const r = await fetch(`http://${host}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ oobCode: code!.oobCode }) });
  1016 |     expect(r.ok).toBeTruthy();
  1017 |     await page.getByTestId('verified').click();
  1018 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  1019 |     // 다시 로그인: 틀린 비밀번호(400이 정상) → 맞는 비밀번호
  1020 |     expected = [/accounts:signInWithPassword/];
  1021 |     await page.goto('/space');
  1022 |     await page.getByRole('button', { name: '로그아웃' }).click();
> 1023 |     await page.getByTestId('email-open').click();
       |                                          ^ Error: locator.click: Test timeout of 60000ms exceeded.
  1024 |     await page.getByLabel('메일 주소').fill(MAIL);
  1025 |     await page.getByLabel('비밀번호').fill('wrong-pass');
  1026 |     await page.getByTestId('email-submit').click();
  1027 |     await expect(page.getByTestId('email-form')).toContainText('메일 주소나 비밀번호가 맞지 않아요');
  1028 |     await page.getByLabel('비밀번호').fill('borapin-1234');
  1029 |     await page.getByTestId('email-submit').click();
  1030 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  1031 |     await page.goto('/space');
  1032 |     await page.getByRole('button', { name: '로그아웃' }).click();
  1033 |   });
  1034 | 
  1035 |   test('기록 고치기와 지우기', async ({ page }) => {
  1036 |     await signIn(page, OWNER);
  1037 |     await page.goto('/trips');
  1038 |     await expect(page.getByTestId('trip-row').first()).toBeVisible();
  1039 |     const before = await page.getByTestId('trip-row').count();
  1040 |     await page.getByText('강릉시 여행', { exact: true }).click();
  1041 |     await page.getByRole('link', { name: '고치기' }).click();
  1042 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  1043 |     await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
  1044 |     await page.getByLabel('제목').fill('엄마랑 강릉');
  1045 |     await page.getByTestId('save').click();
  1046 |     await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
  1047 |     await page.getByRole('button', { name: '이 여행 지우기' }).click();
  1048 |     await page.getByRole('button', { name: '지우기', exact: true }).click();
  1049 |     await expect(page).toHaveURL(/\/trips$/);
  1050 |     await expect(page.getByTestId('trip-row').filter({ hasText: '엄마랑 강릉' })).toHaveCount(0);
  1051 |     await expect(page.getByTestId('trip-row')).toHaveCount(before - 1);
  1052 |   });
  1053 | });
  1054 | 
```