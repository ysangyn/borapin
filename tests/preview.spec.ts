/**
 * 미리보기 주소에서 진짜 Firebase(시험용 프로젝트 borapin-test)로 시험한다.
 * 실제 서비스에 올리기 전 마지막 관문: 여기서 하나라도 실패하면 실제 배포를 하지 않는다.
 * 시험 계정·기록은 scripts/preview-env.ts가 만들고, 끝나면 지운다.
 */
import { test, expect, type Browser, type Page } from '@playwright/test';

const PW = process.env.PREVIEW_PW ?? '';
const COMMIT = process.env.COMMIT ?? '';
const OWNER = 'ysangyn@gmail.com';
const BORA = 'bora.preview@example.com';
const STRANGER = 'stranger.preview@example.com';
const TITLE = `미리보기 시험 여행 ${COMMIT}`;

test.describe.configure({ mode: 'serial' });

const problems: string[] = [];
function watch(page: Page) {
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/permission|insufficient|Failed to load resource: the server responded with a status of 400/i.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  });
  return page;
}
async function newPage(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  return watch(await ctx.newPage());
}

/** 사람처럼 메일·비밀번호를 쳐서 로그인 */
async function emailLogin(page: Page, email: string) {
  await page.goto('/');
  const form = page.getByTestId('email-form');
  await form.getByLabel('메일 주소').click();
  await page.keyboard.type(email);
  await form.getByLabel('비밀번호').click();
  await page.keyboard.type(PW);
  await form.getByTestId('email-submit').click();
}

test('시험용 표시가 보이고, 이번 커밋이 올라가 있다', async ({ browser }) => {
  const page = await newPage(browser);
  await page.goto('/');
  await expect(page.getByTestId('preview-ribbon')).toBeVisible();
  const v = await page.locator('meta[name="borapin-version"]').getAttribute('content');
  expect(v).toMatch(new RegExp(`\\+${COMMIT}$`));
  await page.context().close();
});

test('메일로 로그인 → 기록 → 새로 고침 → 장소 → 사진 → 공유 → 공개 끄기', async ({ browser }) => {
  test.setTimeout(240_000);
  const page = await newPage(browser);
  await emailLogin(page, OWNER);
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 30_000 });

  // 기록
  await page.getByRole('button', { name: '기록하기', exact: true }).click();
  await page.getByRole('menuitem', { name: /다녀온 곳 기록하기/ }).click();
  await page.getByLabel('어디 검색').click();
  await page.keyboard.type('강릉', { delay: 50 });
  await page.getByRole('option', { name: /강릉시/ }).first().click();
  await page.getByLabel('제목').click();
  await page.keyboard.type(TITLE);
  await page.getByRole('button', { name: '몇 년', exact: true }).click();
  await page.getByLabel('연도').selectOption('2025');
  await page.getByTestId('save').click();
  await expect(page.getByTestId('trip-title')).toHaveText(TITLE, { timeout: 30_000 });
  await page.reload();
  await expect(page.getByTestId('trip-title')).toHaveText(TITLE, { timeout: 30_000 });

  // 우리 장소
  await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  await page.getByTestId('place-save').click();
  await expect(page.getByTestId('trip-places')).toContainText('초당할머니순두부', { timeout: 30_000 });

  // 사진
  await page.getByRole('tab', { name: /사진/ }).click();
  await page.getByTestId('trip-photos').getByTestId('photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
  await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 60_000 });
  await page.reload();
  await page.getByRole('tab', { name: /사진/ }).click();
  await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });

  // 공유: 로그인 안 한 사람이 링크로 본다
  await page.getByRole('tab', { name: '개요' }).click();
  const card = page.getByTestId('share-link');
  await card.getByTestId('share-on').click();
  const url = await card.getByLabel('공유 링크').inputValue();
  const anon = await newPage(browser);
  await anon.goto(url);
  await expect(anon.getByTestId('shared-trip')).toContainText(TITLE, { timeout: 30_000 });
  await expect(anon.getByTestId('shared-trip')).toContainText('초당할머니순두부');
  // 공개를 끄면 닫힌다
  await card.getByRole('button', { name: '공개 끄기' }).click();
  await expect(card.getByTestId('share-on')).toBeVisible();
  await anon.reload();
  await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible({ timeout: 30_000 });
  await anon.context().close();
  await page.context().close();
});

test('함께 쓰는 사람(보라)도 같은 기록을 본다', async ({ browser }) => {
  const page = await newPage(browser);
  await emailLogin(page, BORA);
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 30_000 });
  await page.goto('/trips');
  await expect(page.getByText(TITLE)).toBeVisible({ timeout: 30_000 });
  await page.context().close();
});

test('초대 안 된 계정은 메일·비밀번호가 맞아도 막힌다', async ({ browser }) => {
  const page = await newPage(browser);
  await emailLogin(page, STRANGER);
  await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible({ timeout: 30_000 });
  await page.context().close();
});

test('화면 오류 없음', () => {
  expect(problems, problems.join('\n')).toEqual([]);
});
