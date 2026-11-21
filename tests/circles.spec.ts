/**
 * 모임 (docs/design/SPACES-PUBLIC.md 4절): 고른 가게만 가족·친구와 나누기
 * 주인이 모임을 만들고 가게를 건다 → 보라핀을 처음 쓰는 친구가 초대 링크로 '손님'이 되어 본다 → 손님도 가게를 건다
 * → 주인 화면에 보인다 → 손님은 우리 여행 기록에 들어가지 못한다.
 * (app.spec 다음에 돈다: 주인 계정과 우리 공간이 이미 있다)
 */
import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { OWNER_EMAIL as OWNER } from '../src/lib/owner';

const SHOTS = path.join('test-results', 'screens');
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
const FRIEND = 'friend@example.com';

async function signIn(page: Page, email: string) {
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
}

test('모임: 만들고 → 가게를 걸고 → 손님 친구가 들어와 보고 → 손님도 건다', async ({ browser }) => {
  test.setTimeout(150_000);
  const owner = await browser.newPage({ viewport: { width: 375, height: 760 } });
  await owner.goto('/');
  await signIn(owner, OWNER);
  await expect(owner.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });

  // 걸 가게 하나 담기 (메모는 모임에 보이면 안 된다)
  await owner.goto('/places/new');
  await owner.getByLabel('장소 이름').fill('모임빵집');
  await owner.getByLabel('어디 검색').fill('고양');
  await owner.getByRole('option', { name: /고양시/ }).first().click();
  await owner.getByTestId('place-save').click();
  await expect(owner.getByRole('status')).toContainText('담았어요');

  // 지도 → 모임 → 새 모임
  await owner.goto('/map');
  await owner.getByTestId('map-circles').click();
  await expect(owner.getByTestId('circles')).toBeVisible();
  await owner.getByLabel('모임 이름').fill('대학 친구');
  await owner.getByTestId('circle-make').click();
  await expect(owner.getByTestId('circle-page')).toBeVisible({ timeout: 20_000 });
  await expect(owner.getByTestId('circle-people')).toContainText('방장');

  // 내 가게 걸기
  await owner.getByTestId('circle-add').click();
  const sheet = owner.getByTestId('circle-pick');
  await sheet.getByLabel('가게 이름 찾기').fill('모임빵집');
  await sheet.getByTestId('circle-hang').first().click();
  await expect(owner.getByRole('status')).toContainText('걸었어요');
  await sheet.getByRole('button', { name: '닫기' }).click();
  await expect(owner.getByTestId('circle-item')).toHaveCount(1);
  await expect(owner.getByTestId('circle-item').first()).toContainText('모임빵집');

  // 초대 링크
  await owner.getByTestId('circle-manage').click();
  await owner.getByTestId('circle-invite-make').click();
  const url = (await owner.getByTestId('circle-invite-row').first().getByTestId('invite-url').textContent())!.trim();
  expect(url).toMatch(/\/join\/[a-z0-9]{8,}$/);
  await shot(owner, '40-circle-owner');

  // 보라핀을 처음 쓰는 친구: 링크 → 로그인 → 모임에 들어가기 → 손님 화면
  const ctx = await browser.newContext({ locale: 'ko-KR', viewport: { width: 375, height: 760 } });
  const fr = await ctx.newPage();
  await fr.goto(url);
  await signIn(fr, FRIEND);
  await expect(fr.getByTestId('circle-join')).toBeVisible({ timeout: 20_000 });
  await expect(fr.getByTestId('join-title')).toContainText('대학 친구');
  await fr.getByLabel('모임 별명').fill('민지');
  await fr.getByTestId('join-go').click();
  await expect(fr.getByTestId('circle-page')).toBeVisible({ timeout: 20_000 });
  await expect(fr.getByTestId('circle-item').first()).toContainText('모임빵집');
  await expect(fr.getByTestId('circle-people')).toContainText('민지');
  // 손님은 남의 가게를 '가고 싶은 곳에 담기'·'내리기' 할 수 없다
  await expect(fr.getByTestId('circle-want')).toHaveCount(0);
  await expect(fr.getByTestId('circle-down')).toHaveCount(0);
  await shot(fr, '41-circle-guest');

  // 손님도 이름만 적어 건다
  await fr.getByTestId('circle-add').click();
  const g = fr.getByTestId('circle-guest-hang');
  await g.getByLabel('가게 이름').fill('민지네 단골 국수');
  await g.getByRole('button', { name: '또 갈래요' }).click();
  await g.getByLabel('한 줄').fill('면이 쫄깃해요');
  await g.getByTestId('circle-guest-save').click();
  await expect(fr.getByRole('status')).toContainText('걸었어요');
  await expect(fr.getByTestId('circle-item')).toHaveCount(2);

  // 손님도 지역을 고를 수 있다 (고르면 다른 사람이 가고 싶은 곳에 바로 담는다)
  await fr.getByTestId('circle-add').click();
  await g.getByLabel('가게 이름').fill('해운대 돼지국밥');
  await g.getByLabel('어디 검색').fill('부산');
  await g.getByRole('option', { name: /부산/ }).first().click();
  await g.getByTestId('circle-guest-save').click();
  await expect(fr.getByRole('status')).toContainText('걸었어요');
  await expect(fr.getByTestId('circle-item').filter({ hasText: '해운대 돼지국밥' })).toContainText('부산');

  // 별명 바꾸기 (이 모임에서만)
  await fr.getByTestId('circle-my-nick').click();
  await fr.getByTestId('circle-nick-edit').getByLabel('이 모임에서 쓸 별명').fill('민지짱');
  await fr.getByTestId('circle-nick-save').click();
  await expect(fr.getByRole('status')).toContainText('별명을 바꿨어요');
  await expect(fr.getByTestId('circle-people')).toContainText('민지짱');

  // 내가 건 가게에 사진 걸기 (사람처럼: 가게를 누르면 사진 칸이 열린다)
  const noodle = fr.getByTestId('circle-item').filter({ hasText: '민지네 단골 국수' });
  await noodle.click();
  await expect(noodle.getByTestId('circle-photos')).toBeVisible();
  await noodle.getByTestId('circle-photo-file').setInputFiles('tests/fixtures/photo-noexif.jpg');
  await expect(fr.getByRole('status')).toContainText('사진을 걸었어요', { timeout: 20_000 });
  await expect(noodle.getByTestId('circle-photo')).toHaveCount(1);
  await shot(fr, '43-circle-photo');

  // 손님은 우리 여행 기록·홈에 들어가지 못한다 (어디로 가도 모임으로)
  await fr.goto('/trips');
  await expect(fr).toHaveURL(/\/circles$/);
  await expect(fr.getByTestId('circle-row')).toHaveCount(1);
  await expect(fr.getByTestId('guest-note')).toBeVisible();
  await expect(fr.getByText('모임빵집')).toHaveCount(0);
  await ctx.close();

  // 주인 홈: 마지막으로 본 뒤 친구가 건 가게 두 곳이 '새 가게'로
  await owner.goto('/');
  await expect(owner.getByTestId('circle-news')).toContainText('대학 친구 모임에 새 가게 2곳', { timeout: 20_000 });
  await owner.getByTestId('circle-news').click();
  await expect(owner.getByTestId('circle-page')).toBeVisible();
  // 주인 화면에 친구가 건 가게가 보이고, 가고 싶은 곳에 담을 수 있다
  await expect(owner.getByTestId('circle-item')).toHaveCount(3, { timeout: 20_000 });
  await expect(owner.getByTestId('circle-people')).toContainText('민지짱');
  // 친구가 건 사진이 보인다
  const nood = owner.getByTestId('circle-item').filter({ hasText: '민지네 단골 국수' });
  await nood.click();
  await expect(nood.getByTestId('circle-photo')).toHaveCount(1, { timeout: 20_000 });
  // 지역을 고른 가게는 바로 담긴다
  await owner.getByTestId('circle-item').filter({ hasText: '해운대 돼지국밥' }).getByTestId('circle-want').click();
  await expect(owner.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
  // 다시 홈: 이제 본 뒤라 새 가게 줄이 없다
  await owner.goto('/');
  await expect(owner.getByTestId('place-search')).toBeVisible();
  await owner.waitForTimeout(1500);
  await expect(owner.getByTestId('circle-news')).toHaveCount(0);
  await owner.goto('/circles');
  await owner.getByTestId('circle-row').first().click();
  const theirs = owner.getByTestId('circle-item').filter({ hasText: '민지네 단골 국수' });
  await expect(theirs).toContainText('면이 쫄깃해요');
  await shot(owner, '42-circle-both');
  // 지역을 모르는 가게: 담기 화면으로 가서 이름이 들어가 있고 지역을 고른다
  await theirs.getByTestId('circle-want').click();
  await expect(owner.getByLabel('장소 이름')).toHaveValue('민지네 단골 국수');
  await owner.getByLabel('어디 검색').fill('고양');
  await owner.getByRole('option', { name: /고양시/ }).first().click();
  await owner.getByTestId('place-save').click();
  await expect(owner.getByRole('status')).toContainText('담았어요');

  // 가게 화면에서도: 이미 걸린 모임은 체크
  await owner.goto('/places');
  await owner.getByTestId('place-rec').filter({ hasText: '모임빵집' }).first().click();
  await expect(owner.getByTestId('circle-hang-row')).toBeVisible();
  await expect(owner.getByTestId('hang-대학 친구')).toHaveAttribute('aria-pressed', 'true');
  await owner.getByTestId('hang-대학 친구').click();
  await expect(owner.getByRole('status')).toContainText('대학 친구에서 내렸어요');
  await expect(owner.getByTestId('hang-대학 친구')).toHaveAttribute('aria-pressed', 'false');
  await owner.close();
});
