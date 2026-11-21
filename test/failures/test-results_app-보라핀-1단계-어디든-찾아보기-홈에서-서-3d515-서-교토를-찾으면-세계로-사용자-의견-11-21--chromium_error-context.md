# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 어디든 찾아보기: 홈에서 서산을 찾으면 큰 지도에서 서산 창이 열리고, 지도에서 교토를 찾으면 세계로 (사용자 의견 11-21)
- Location: tests/app.spec.ts:1232:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('region-sheet').getByTestId('sheet-title')
Expected substring: "교토"
Received string:    "일본"
Timeout: 15000ms

Call log:
  - Expect "toContainText" getByTestId('region-sheet').getByTestId('sheet-title') with timeout 15000ms
  - waiting for getByTestId('region-sheet').getByTestId('sheet-title')
    33 × locator resolved to <a class="jua" data-discover="true" data-testid="sheet-title" href="/region/country:JPN">…</a>
       - unexpected value "일본"

```

```yaml
- link "일본":
  - /url: /region/country:JPN
```

# Test source

```ts
  1149 |     // 사진 올리기 멈춤 → 여행 사진 탭에서 막힘
  1150 |     await admin.getByLabel('멈추는 이유').fill('예산 점검');
  1151 |     await admin.getByTestId('uploads-off').click();
  1152 |     await expect(admin.getByTestId('cutoff')).toContainText('멈춤 · 예산 점검');
  1153 |     await shot(page, '16-admin');
  1154 |     await page.goto('/trips');
  1155 |     await page.getByText('강릉시 여행', { exact: true }).click();
  1156 |     await page.getByRole('tab', { name: /사진/ }).click();
  1157 |     await page.getByTestId('photo-add').click();
  1158 |     await expect(page.getByRole('status')).toContainText('사진 올리기를 잠시 멈췄어요');
  1159 |     await page.goto('/admin');
  1160 |     await page.getByTestId('uploads-on').click();
  1161 |     await expect(page.getByTestId('cutoff')).toContainText('켜짐');
  1162 |     await page.getByTestId('reports').getByRole('button', { name: '해결함' }).first().click();
  1163 |     await expect(page.getByTestId('reports')).toContainText('들어온 신고가 없어요');
  1164 |   });
  1165 | 
  1166 |   test('이메일로 가입하고 메일 인증 뒤 들어온다', async ({ page }) => {
  1167 |     const MAIL = 'mail.bora@example.com';
  1168 |     // 주인이 먼저 이 메일을 함께 쓰는 사람에 넣는다
  1169 |     await signIn(page, OWNER);
  1170 |     await page.goto('/space');
  1171 |     await page.getByLabel('추가할 계정').fill(MAIL);
  1172 |     await page.getByRole('button', { name: '추가', exact: true }).click();
  1173 |     await expect(page.getByText(MAIL).first()).toBeVisible();
  1174 |     await page.getByRole('button', { name: '로그아웃' }).click();
  1175 |     // 가입 (메일 칸은 접혀 있다)
  1176 |     await page.getByTestId('email-open').click();
  1177 |     const form = page.getByTestId('email-form');
  1178 |     await form.getByRole('radio', { name: '처음이에요' }).click();
  1179 |     await form.getByLabel('메일 주소').fill(MAIL);
  1180 |     await form.getByLabel('비밀번호').fill('borapin-1234');
  1181 |     await form.getByTestId('email-submit').click();
  1182 |     await expect(page.getByTestId('verify')).toContainText(MAIL);
  1183 |     await shot(page, '10b-verify');
  1184 |     // 인증 전에는 못 들어온다
  1185 |     await page.getByTestId('verified').click();
  1186 |     await expect(page.getByTestId('verify')).toContainText('아직 인증되지 않았어요');
  1187 |     // 메일 속 링크를 누른 것처럼 (에뮬레이터에서 인증 코드를 적용)
  1188 |     const host = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';
  1189 |     const codes = (await (await fetch(`http://${host}/emulator/v1/projects/demo-borapin/oobCodes`)).json()) as { oobCodes: { email: string; oobCode: string; requestType: string }[] };
  1190 |     const code = codes.oobCodes.reverse().find((c) => c.email === MAIL && c.requestType === 'VERIFY_EMAIL');
  1191 |     expect(code).toBeTruthy();
  1192 |     const r = await fetch(`http://${host}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ oobCode: code!.oobCode }) });
  1193 |     expect(r.ok).toBeTruthy();
  1194 |     await page.getByTestId('verified').click();
  1195 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  1196 |     // 다시 로그인: 틀린 비밀번호(400이 정상) → 맞는 비밀번호
  1197 |     expected = [/accounts:signInWithPassword/];
  1198 |     await page.goto('/space');
  1199 |     await page.getByRole('button', { name: '로그아웃' }).click();
  1200 |     // 지난번에 메일로 들어왔으면 메일 칸이 이미 펼쳐져 있다
  1201 |     await expect(page.getByTestId('email-form')).toBeVisible();
  1202 |     await page.getByLabel('메일 주소').fill(MAIL);
  1203 |     await page.getByLabel('비밀번호').fill('wrong-pass');
  1204 |     await page.getByTestId('email-submit').click();
  1205 |     await expect(page.getByTestId('email-form')).toContainText('메일 주소나 비밀번호가 맞지 않아요');
  1206 |     await page.getByLabel('비밀번호').fill('borapin-1234');
  1207 |     await page.getByTestId('email-submit').click();
  1208 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  1209 |     await page.goto('/space');
  1210 |     await page.getByRole('button', { name: '로그아웃' }).click();
  1211 |   });
  1212 | 
  1213 |   test('기록 고치기와 지우기', async ({ page }) => {
  1214 |     await signIn(page, OWNER);
  1215 |     await page.goto('/trips');
  1216 |     await expect(page.getByTestId('trip-row').first()).toBeVisible();
  1217 |     const before = await page.getByTestId('trip-row').count();
  1218 |     await page.getByText('강릉시 여행', { exact: true }).click();
  1219 |     await page.getByRole('link', { name: '고치기' }).click();
  1220 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  1221 |     await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
  1222 |     await page.getByLabel('제목').fill('엄마랑 강릉');
  1223 |     await page.getByTestId('save').click();
  1224 |     await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
  1225 |     await page.getByRole('button', { name: '이 여행 지우기' }).click();
  1226 |     await page.getByRole('button', { name: '지우기', exact: true }).click();
  1227 |     await expect(page).toHaveURL(/\/trips$/);
  1228 |     await expect(page.getByTestId('trip-row').filter({ hasText: '엄마랑 강릉' })).toHaveCount(0);
  1229 |     await expect(page.getByTestId('trip-row')).toHaveCount(before - 1);
  1230 |   });
  1231 | 
  1232 |   test('어디든 찾아보기: 홈에서 서산을 찾으면 큰 지도에서 서산 창이 열리고, 지도에서 교토를 찾으면 세계로 (사용자 의견 11-21)', async ({ page }) => {
  1233 |     await signIn(page, OWNER);
  1234 |     await page.goto('/');
  1235 |     const box = page.getByTestId('place-search').first();
  1236 |     await box.getByLabel('지역 찾기').fill('서산');
  1237 |     await box.getByRole('option', { name: /서산시/ }).first().click();
  1238 |     await expect(page).toHaveURL(/\/map\?sel=kr%3A|\/map\?sel=kr:/);
  1239 |     const sheet = page.getByTestId('region-sheet');
  1240 |     await expect(sheet.getByTestId('sheet-title')).toContainText('서산');
  1241 |     await expect(sheet.getByTestId('region-info')).toBeVisible();
  1242 |     await shot(page, '31-search-seosan');
  1243 |     // 지도 화면에서: 교토 (도시) → 세계 지도의 일본 교토 창
  1244 |     await sheet.getByRole('button', { name: '닫기' }).first().click();
  1245 |     const mbox = page.getByTestId('place-search');
  1246 |     await mbox.getByLabel('지역 찾기').fill('교토');
  1247 |     await mbox.getByLabel('지역 찾기').press('Enter');
  1248 |     await expect(page.getByRole('tab', { name: '세계' })).toHaveAttribute('aria-selected', 'true');
> 1249 |     await expect(page.getByTestId('region-sheet').getByTestId('sheet-title')).toContainText('교토');
       |                                                                               ^ Error: expect(locator).toContainText(expected) failed
  1250 |     // 초성으로도 찾는다
  1251 |     await mbox.getByLabel('지역 찾기').fill('ㄱㄹ');
  1252 |     await expect(mbox.getByRole('option', { name: /강릉/ }).first()).toBeVisible();
  1253 |   });
  1254 | 
  1255 |   test('지역 창의 볼거리를 누르면 알아보기 창에서 가고 싶어요 (아내 의견: 지도보다 사진·소개·후기)', async ({ page }) => {
  1256 |     await signIn(page, OWNER);
  1257 |     // 기록이 많이 쌓인 뒤라 홈은 지도가 아래로 밀려 있다: 큰 지도에서 누른다
  1258 |     await page.goto('/map');
  1259 |     await expectMapDrawn(page);
  1260 |     await tapLngLat(page, 129.06, 35.2);
  1261 |     const sheet = page.getByTestId('region-sheet');
  1262 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
  1263 |     // 볼거리는 사진 카드: 누르면 지도보다 먼저 '알아보기' 창 (사진·소개·후기·영상, 지도는 맨 아래 접어서) — 아내 의견 11-21
  1264 |     const item = sheet.getByTestId('explore-card').first();
  1265 |     const name = (await item.locator('.explore-name').innerText()).trim();
  1266 |     await item.click();
  1267 |     const dlg = page.getByTestId('spot-detail');
  1268 |     await expect(dlg).toContainText(name);
  1269 |     await expect(dlg.getByTestId('spot-reviews')).toHaveAttribute('href', /search\.naver\.com.*where=blog/);
  1270 |     await expect(dlg.getByTestId('spot-videos')).toHaveAttribute('href', /youtube\.com\/results/);
  1271 |     // 지도는 처음엔 접혀 있다
  1272 |     await expect(dlg.getByTestId('spot-show-map')).toBeVisible();
  1273 |     await dlg.getByTestId('spot-wish').click();
  1274 |     await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
  1275 |     await expect(dlg.getByTestId('spot-wish')).toHaveText(/담겨 있어요/);
  1276 |     await expect(dlg.getByTestId('spot-wish')).toBeDisabled();
  1277 |     await shot(page, '30-spot-detail-wish');
  1278 |     // 먹거리 카드도 같은 창 (음식이면 '맛집 찾기'가 더 있다)
  1279 |     await dlg.getByRole('button', { name: '닫기' }).click();
  1280 |     await expect(dlg).toHaveCount(0);
  1281 |     const food = sheet.getByTestId('explore-food').first();
  1282 |     if (await food.count()) {
  1283 |       await food.click();
  1284 |       await expect(dlg).toContainText('먹거리');
  1285 |       await expect(dlg.getByRole('link', { name: /맛집 찾기/ })).toBeVisible();
  1286 |       await shot(page, '30b-food-detail');
  1287 |       await dlg.getByRole('button', { name: '닫기' }).click();
  1288 |     }
  1289 |     await page.goto('/wishes');
  1290 |     await expect(page.getByTestId('wish-card').filter({ hasText: '부산' })).toContainText(name);
  1291 |     // 우리 공간: 투어·티켓 찾을 곳 (기본은 누를 때마다 고르기, 한 곳으로 정할 수 있음)
  1292 |     await page.goto('/space');
  1293 |     const tp = page.getByTestId('tour-pref');
  1294 |     await expect(tp.getByRole('button', { name: '누를 때마다 고르기' })).toHaveAttribute('aria-pressed', 'true');
  1295 |     await tp.getByRole('button', { name: '클룩' }).click();
  1296 |     await expect(tp.getByRole('button', { name: '클룩' })).toHaveAttribute('aria-pressed', 'true');
  1297 |   });
  1298 | });
  1299 | 
```