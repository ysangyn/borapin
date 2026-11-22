# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pub.spec.ts >> 공개 평: 공개하기 → 나눈 평 → 보라가 보고 신고 → 주인이 가리기 → 별로로 바꾸면 거둔다
- Location: tests/pub.spec.ts:20:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('my-pubs')
Expected substring: "아직 없어요"
Received string:    "보라핀 사람들에게 나눈 평 1곳경포 소금빵 또 갈래요가려졌어요 · 광고거두기"
Timeout: 20000ms

Call log:
  - Expect "toContainText" getByTestId('my-pubs') with timeout 20000ms
  - waiting for getByTestId('my-pubs')
    41 × locator resolved to <section data-testid="my-pubs">…</section>
       - unexpected value "보라핀 사람들에게 나눈 평 1곳경포 소금빵 또 갈래요가려졌어요 · 광고거두기"

```

```yaml
- text: 보라핀 사람들에게 나눈 평 1곳 경포 소금빵 또 갈래요 가려졌어요 · 광고
- button "거두기"
```

# Test source

```ts
  1  | /**
  2  |  * 6걸음: 보라핀 사람들에게 공개 (docs/design/SPACES-PUBLIC.md 5절)
  3  |  * 주인이 다녀온 가게 평을 공개 → 설정에 '나눈 평' → 보라가 같은 가게 화면에서 보고 신고 → 신고한 폰에선 바로 사라짐
  4  |  * → 주인 신고함에서 가리기 → 글쓴이 화면에 '가려졌어요' → '별로'로 바꾸면 공개 사본도 거둔다.
  5  |  * (app.spec 다음에 돈다: 주인·보라 계정, 강릉시 여행이 이미 있다)
  6  |  */
  7  | import { test, expect, type Page } from '@playwright/test';
  8  | import path from 'node:path';
  9  | import { OWNER_EMAIL as OWNER } from '../src/lib/owner';
  10 | 
  11 | const SHOTS = path.join('test-results', 'screens');
  12 | const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
  13 | const BORA = 'bora@example.com';
  14 | 
  15 | async function signIn(page: Page, email: string) {
  16 |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  17 |   await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  18 | }
  19 | 
  20 | test('공개 평: 공개하기 → 나눈 평 → 보라가 보고 신고 → 주인이 가리기 → 별로로 바꾸면 거둔다', async ({ browser }) => {
  21 |   test.setTimeout(150_000);
  22 |   const owner = await browser.newPage({ viewport: { width: 375, height: 760 } });
  23 |   await owner.goto('/');
  24 |   await signIn(owner, OWNER);
  25 |   await owner.goto('/places/new?region=kr:51150');
  26 |   // 네이버 공유 글(장소 번호가 있는 주소)로 담은 가게만 공개할 수 있다
  27 |   await owner.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n경포 소금빵\n강원 강릉시 난설헌로 1\nhttps://map.naver.com/p/entry/place/1234567');
  28 |   await owner.getByLabel('영상 한 줄 평').fill('소금빵이 짭짤해요');
  29 |   await owner.getByRole('button', { name: '또 갈래요' }).click();
  30 |   await owner.getByTestId('place-save').click();
  31 |   // 저장 뒤 '몇 번째로 좋았나' 묻는 창이 뜰 수 있다. 저장이 서버에 닿을 틈을 두고 장소 목록으로
  32 |   await expect(owner.getByTestId('place-save')).toHaveCount(0, { timeout: 15_000 }).catch(() => undefined);
  33 |   await owner.waitForTimeout(2500);
  34 |   await owner.goto('/places');
  35 |   await owner.getByTestId('place-rec').filter({ hasText: '경포 소금빵' }).first().click();
  36 |   await expect(owner.getByTestId('pub-row')).toBeVisible();
  37 |   const placeUrl = owner.url();
  38 | 
  39 |   // 공개하기: 무엇이 보이는지 미리 보고, 이름·별명을 확인
  40 |   await owner.getByTestId('pub-on').click();
  41 |   const dlg = owner.getByTestId('pub-confirm');
  42 |   await expect(dlg).toContainText('소금빵이 짭짤해요');
  43 |   await expect(dlg).toContainText('메모, 함께 간 사람');
  44 |   await expect(dlg.getByTestId('pub-name')).toHaveValue('경포 소금빵');
  45 |   await shot(owner, '50-pub-confirm');
  46 |   await dlg.getByTestId('pub-confirm-go').click();
  47 |   await expect(owner.getByRole('status')).toContainText('공개했어요');
  48 |   await expect(owner.getByTestId('pub-on')).toHaveAttribute('aria-checked', 'true');
  49 | 
  50 |   // 설정: 나눈 평
  51 |   await owner.goto('/space');
  52 |   await expect(owner.getByTestId('my-pubs').getByTestId('my-pub')).toHaveCount(1);
  53 |   await expect(owner.getByTestId('flag-box')).toContainText('들어온 신고가 없어요');
  54 | 
  55 |   // 보라: 같은 가게 화면에 '보라핀 사람들' 칸 → 신고하면 이 폰에선 바로 사라진다
  56 |   const bora = await browser.newPage({ viewport: { width: 375, height: 760 } });
  57 |   await bora.goto('/');
  58 |   await signIn(bora, BORA);
  59 |   await bora.goto(new URL(placeUrl).pathname);
  60 |   const voices = bora.getByTestId('pub-voices');
  61 |   await expect(voices).toContainText('소금빵이 짭짤해요', { timeout: 20_000 });
  62 |   await expect(voices).toContainText('또 갈래요 1명');
  63 |   await shot(bora, '51-pub-voices');
  64 |   await voices.getByTestId('pub-flag').click();
  65 |   await voices.getByTestId('pub-flag-reasons').getByRole('button', { name: '광고' }).click();
  66 |   await expect(bora.getByRole('status')).toContainText('신고했어요');
  67 |   await expect(bora.getByTestId('pub-voices')).toHaveCount(0);
  68 | 
  69 |   // 주인 신고함: 가리기 → 글쓴이 화면에 '가려졌어요'
  70 |   await owner.goto('/space');
  71 |   const box = owner.getByTestId('flag-box');
  72 |   await expect(box.getByTestId('flag-item')).toHaveCount(1, { timeout: 20_000 });
  73 |   await expect(box).toContainText('광고');
  74 |   await box.getByTestId('flag-hide').click();
  75 |   await expect(owner.getByRole('status')).toContainText('평을 가렸어요');
  76 |   await expect(box).toContainText('들어온 신고가 없어요');
  77 |   await owner.goto(new URL(placeUrl).pathname);
  78 |   await expect(owner.getByTestId('pub-hidden')).toContainText('가려졌어요');
  79 | 
  80 |   // '별로'로 바꾸면 공개 사본도 거둔다
  81 |   await owner.getByTestId('place-edit').click();
  82 |   await owner.getByRole('button', { name: '별로' }).click();
  83 |   await owner.getByTestId('place-save').click();
  84 |   await owner.goto('/space');
> 85 |   await expect(owner.getByTestId('my-pubs')).toContainText('아직 없어요', { timeout: 20_000 });
     |                                              ^ Error: expect(locator).toContainText(expected) failed
  86 |   await owner.close();
  87 |   await bora.close();
  88 | });
  89 | 
```