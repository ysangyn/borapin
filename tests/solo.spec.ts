/**
 * 혼자 쓰는 공간 (docs/design/SPACES-PUBLIC.md 3-6절)
 * 주인이 새 공간 링크를 만들고 → 한 사람이 들어와 혼자 쓴다. 주요 화면을 휴대폰 폭으로 돌며
 * 둘이 쓴다는 전제의 말('둘이', '상대', '서로', '우리 공간'…)이 하나도 보이지 않는지 모은다.
 * (app.spec 다음에 돈다: 주인 계정과 우리 공간이 이미 있다)
 */
import { test, expect, type Page } from '@playwright/test';
import { OWNER_EMAIL as OWNER } from '../src/lib/owner';

const SOLO = 'solo@example.com';

async function signIn(page: Page, email: string) {
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
}

/** 혼자일 때 보이면 안 되는 말 */
const COUPLE_WORDS = /둘이|둘의|둘 다|상대|서로|각자|우리 공간|우리 둘|함께 다닌|함께 다녀|커플/;

test('혼자 쓰는 공간: 주요 화면에 둘이 쓴다는 말이 없다', async ({ browser }) => {
  // 주인이 새 공간 링크를 만든다
  const owner = await browser.newPage({ viewport: { width: 375, height: 740 } });
  await owner.goto('/');
  await signIn(owner, OWNER);
  await expect(owner.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  await owner.goto('/space');
  const sec = owner.getByTestId('new-space-section');
  await sec.getByLabel('새 공간 받는 사람 이름').fill('혼자');
  await sec.getByTestId('new-space-make').click();
  const url = (await sec.getByTestId('invite-row').first().getByTestId('invite-url').textContent())!.trim();
  await owner.close();

  // 한 사람이 들어와 혼자 쓴다
  const ctx = await browser.newContext({ locale: 'ko-KR', viewport: { width: 375, height: 740 } });
  const page = await ctx.newPage();
  await page.goto(url);
  await signIn(page, SOLO);
  await page.getByTestId('join-go').click();
  await expect(page.getByTestId('welcome')).toBeVisible({ timeout: 20_000 });

  const found: string[] = [];
  const check = async (where: string) => {
    await page.waitForTimeout(700);
    const text = await page.locator('body').innerText();
    for (const line of text.split('\n')) {
      // 여행 계획의 동행 고르기 칩 '둘이'(누군가와 둘이 가요)는 혼자 쓰는 사람도 고를 수 있는 말이다
      if (line.trim() === '둘이') continue;
      const m = line.match(COUPLE_WORDS);
      if (m) found.push(`${where}: '${m[0]}' · ${line.trim().slice(0, 80)}`);
    }
  };
  // 환영 화면 세 장
  await check('환영 1');
  await page.getByTestId('welcome-next').click();
  await check('환영 2');
  await page.getByTestId('welcome-name-next').click();
  await check('환영 3');
  await page.getByTestId('welcome-done').click();
  await expect(page.getByTestId('headline')).toBeVisible({ timeout: 20_000 });

  // 가고 싶은 곳 하나 (빈 화면과 카드가 있는 화면 둘 다 보도록)
  await page.goto('/wishes/new');
  await check('가고 싶은 곳 새로');
  await page.getByLabel('어디 검색').fill('남해');
  await page.getByRole('option', { name: /남해군/ }).first().click();
  await page.getByTestId('wish-save').click();
  await expect(page).toHaveURL(/\/wishes$/);

  for (const route of ['/', '/trips', '/wishes', '/places', '/feed', '/space', '/plan', '/record', '/here', '/maps', '/map', '/memories']) {
    await page.goto(route);
    await page.waitForLoadState('load');
    await check(route);
  }
  // 모은 말 목록을 먼저 (실패해도 어디에 무엇이 남았는지 한 번에 보이게)
  expect.soft(found, found.join('\n')).toEqual([]);
  // 설정의 제목
  await page.goto('/space');
  await expect(page.getByText('내 공간', { exact: true }).first()).toBeVisible();
  await ctx.close();
});
