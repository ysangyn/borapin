/**
 * 6걸음: 보라핀 사람들에게 공개 (docs/design/SPACES-PUBLIC.md 5절)
 * 주인이 다녀온 가게 평을 공개 → 설정에 '나눈 평' → 보라가 같은 가게 화면에서 보고 신고 → 신고한 폰에선 바로 사라짐
 * → 주인 신고함에서 가리기 → 글쓴이 화면에 '가려졌어요' → '별로'로 바꾸면 공개 사본도 거둔다.
 * (app.spec 다음에 돈다: 주인·보라 계정, 강릉시 여행이 이미 있다)
 */
import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { OWNER_EMAIL as OWNER } from '../src/lib/owner';

const SHOTS = path.join('test-results', 'screens');
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
const BORA = 'bora@example.com';

async function signIn(page: Page, email: string) {
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
}

test('공개 평: 공개하기 → 나눈 평 → 보라가 보고 신고 → 주인이 가리기 → 별로로 바꾸면 거둔다', async ({ browser }) => {
  test.setTimeout(150_000);
  const owner = await browser.newPage({ viewport: { width: 375, height: 760 } });
  await owner.goto('/');
  await signIn(owner, OWNER);
  await owner.goto('/trips');
  await owner.getByText('강릉시 여행', { exact: true }).click();
  await owner.getByTestId('trip-places').getByRole('link', { name: '+ 맛집·카페 남기기' }).click();
  // 네이버 공유 글(장소 번호가 있는 주소)로 담은 가게만 공개할 수 있다
  await owner.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n경포 소금빵\n강원 강릉시 난설헌로 1\nhttps://map.naver.com/p/entry/place/1234567');
  await owner.getByLabel('영상 한 줄 평').fill('소금빵이 짭짤해요');
  await owner.getByRole('button', { name: '또 갈래요' }).click();
  await owner.getByTestId('place-save').click();
  await owner.getByTestId('trip-places').getByTestId('places-summary').click();
  await owner.getByTestId('trip-visited').getByTestId('place-rec').filter({ hasText: '경포 소금빵' }).first().click();
  await expect(owner.getByTestId('pub-row')).toBeVisible();
  const placeUrl = owner.url();

  // 공개하기: 무엇이 보이는지 미리 보고, 이름·별명을 확인
  await owner.getByTestId('pub-on').click();
  const dlg = owner.getByTestId('pub-confirm');
  await expect(dlg).toContainText('소금빵이 짭짤해요');
  await expect(dlg).toContainText('메모, 함께 간 사람');
  await expect(dlg.getByTestId('pub-name')).toHaveValue('경포 소금빵');
  await shot(owner, '50-pub-confirm');
  await dlg.getByTestId('pub-confirm-go').click();
  await expect(owner.getByRole('status')).toContainText('공개했어요');
  await expect(owner.getByTestId('pub-on')).toHaveAttribute('aria-checked', 'true');

  // 설정: 나눈 평
  await owner.goto('/space');
  await expect(owner.getByTestId('my-pubs').getByTestId('my-pub')).toHaveCount(1);
  await expect(owner.getByTestId('flag-box')).toContainText('들어온 신고가 없어요');

  // 보라: 같은 가게 화면에 '보라핀 사람들' 칸 → 신고하면 이 폰에선 바로 사라진다
  const bora = await browser.newPage({ viewport: { width: 375, height: 760 } });
  await bora.goto('/');
  await signIn(bora, BORA);
  await bora.goto(new URL(placeUrl).pathname);
  const voices = bora.getByTestId('pub-voices');
  await expect(voices).toContainText('소금빵이 짭짤해요', { timeout: 20_000 });
  await expect(voices).toContainText('또 갈래요 1명');
  await shot(bora, '51-pub-voices');
  await voices.getByTestId('pub-flag').click();
  await voices.getByTestId('pub-flag-reasons').getByRole('button', { name: '광고' }).click();
  await expect(bora.getByRole('status')).toContainText('신고했어요');
  await expect(bora.getByTestId('pub-voices')).toHaveCount(0);

  // 주인 신고함: 가리기 → 글쓴이 화면에 '가려졌어요'
  await owner.goto('/space');
  const box = owner.getByTestId('flag-box');
  await expect(box.getByTestId('flag-item')).toHaveCount(1, { timeout: 20_000 });
  await expect(box).toContainText('광고');
  await box.getByTestId('flag-hide').click();
  await expect(owner.getByRole('status')).toContainText('평을 가렸어요');
  await expect(box).toContainText('들어온 신고가 없어요');
  await owner.goto(new URL(placeUrl).pathname);
  await expect(owner.getByTestId('pub-hidden')).toContainText('가려졌어요');

  // '별로'로 바꾸면 공개 사본도 거둔다
  await owner.getByTestId('place-edit').click();
  await owner.getByRole('button', { name: '별로' }).click();
  await owner.getByTestId('place-save').click();
  await owner.goto('/space');
  await expect(owner.getByTestId('my-pubs')).toContainText('아직 없어요', { timeout: 20_000 });
  await owner.close();
  await bora.close();
});
