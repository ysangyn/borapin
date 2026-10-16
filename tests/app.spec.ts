import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const OWNER = 'ysangyn@gmail.com';
const SHOTS = 'test-results/screens';
fs.mkdirSync(SHOTS, { recursive: true });
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });

// 화면에서 난 오류는 모두 모아 두었다가 테스트 끝에 확인한다
const IGNORED = [/permission[-_ ]denied/i, /Missing or insufficient permissions/i];
let problems: string[] = [];
test.beforeEach(({ page }) => {
  problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORED.some((r) => r.test(m.text()))) problems.push(`console: ${m.text().slice(0, 300)}`);
  });
  page.on('response', (r) => {
    if (r.status() === 404) problems.push(`404: ${r.url()}`);
  });
});
test.afterEach(() => {
  expect(problems, problems.join('\n')).toEqual([]);
});

/** 지도가 실제로 경계를 그렸는지 (그려진 칸 수 > 0) */
async function expectMapDrawn(page: Page) {
  await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
}

async function signIn(page: Page, email: string) {
  await page.goto('/');
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
}

async function pickPlace(page: Page, q: string, label: string) {
  await page.getByLabel('어디 검색').fill(q);
  await page.getByRole('option', { name: new RegExp(label) }).first().click();
}

test.describe.serial('보라핀 1단계', () => {
  test('로그인 화면', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('login')).toBeVisible();
    await shot(page, '01-login');
  });

  test('주인 계정으로 들어오면 빈 홈', async ({ page }) => {
    await signIn(page, OWNER);
    await expect(page.getByTestId('headline')).toHaveText('첫 핀을 꽂아 볼까요?');
    await expectMapDrawn(page);
    await shot(page, '02-home-empty');
  });

  test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
    await signIn(page, OWNER);
    await page.getByRole('link', { name: '기록하기' }).click();
    await pickPlace(page, 'ㄱㄹ', '강릉시');
    await page.getByRole('button', { name: '몇 년쯤' }).click();
    await page.getByLabel('연도').selectOption('2024');
    await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await shot(page, '03-record');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
    await expect(page.getByText('2024년쯤')).toBeVisible();
    await expectMapDrawn(page);
    await shot(page, '04-detail');
  });

  test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/record');
    await pickPlace(page, '일본', '일본');
    await page.getByPlaceholder(/도시/).fill('교토');
    await page.getByRole('button', { name: '도시 넣기' }).click();
    await page.getByRole('button', { name: '계절만' }).click();
    await page.getByLabel('연도').selectOption('2025');
    await page.getByRole('button', { name: '가을' }).click();
    await page.getByLabel('제목').fill('교토 단풍 여행');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  });

  test('여행 목록과 필터', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await expect(page.getByTestId('trip-row')).toHaveCount(2);
    await page.getByRole('button', { name: /^해외/ }).click();
    await expect(page.getByTestId('trip-row')).toHaveCount(1);
    await page.getByRole('button', { name: /^전체/ }).click();
    await shot(page, '05-trips');
  });

  test('홈 통계와 지도', async ({ page }) => {
    await signIn(page, OWNER);
    await expect(page.getByTestId('headline')).toHaveText('2번의 여행, 핀 2개');
    await expectMapDrawn(page);
    await shot(page, '06-home');
    await page.goto('/map');
    await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
    await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
    await expectMapDrawn(page);
    await page.waitForTimeout(800);
    await shot(page, '07-map');
    await page.getByRole('tab', { name: '세계' }).click();
    await expect(page.getByTestId('map-stats')).toContainText('나라 1');
    await page.waitForTimeout(1200);
    await expectMapDrawn(page);
    await shot(page, '08-map-world');
  });

  test('v22 기록 가져오기', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/space');
    await page.getByTestId('v22-file').setInputFiles(path.resolve('tests/fixtures/v22-backup.json'));
    await expect(page.getByTestId('import-plan')).toContainText('다녀온 지역 2곳');
    await expect(page.getByTestId('import-plan')).toContainText('가고 싶은 곳 1곳');
    await shot(page, '09-import');
    await page.getByTestId('import-run').click();
    await expect(page.getByText(/여행 2건, 가고 싶은 곳 1곳을 가져왔어요/)).toBeVisible();
    await page.goto('/trips');
    await expect(page.getByTestId('trip-row')).toHaveCount(4);
    await expect(page.getByText('첫 강릉 바다')).toBeVisible();
    await page.getByLabel('여행 찾기').fill('안목');
    await expect(page.getByTestId('trip-row')).toHaveCount(1);
    // 다시 가져와도 겹치지 않는다
    await page.goto('/space');
    await page.getByTestId('v22-file').setInputFiles(path.resolve('tests/fixtures/v22-backup.json'));
    await page.getByTestId('import-run').click();
    await page.goto('/trips');
    await expect(page.getByTestId('trip-row')).toHaveCount(4);
  });

  test('초대 안 된 계정은 막고, 추가하면 들어온다', async ({ page }) => {
    await signIn(page, 'stranger@example.com');
    await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
    await shot(page, '10-denied');
    await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
    await signIn(page, OWNER);
    await page.goto('/space');
    await page.getByLabel('추가할 계정').fill('bora@example.com');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
    await shot(page, '11-space');
    await page.getByRole('button', { name: '로그아웃' }).click();
    await signIn(page, 'bora@example.com');
    await expect(page.getByTestId('headline')).toHaveText(/번의 여행/);
  });

  test('기록 고치기와 지우기', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    await page.getByRole('link', { name: '고치기' }).click();
    await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
    await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
    await page.getByLabel('제목').fill('엄마랑 강릉');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
    await page.getByRole('button', { name: '이 기록 지우기' }).click();
    await page.getByRole('button', { name: '지우기', exact: true }).click();
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByTestId('trip-row')).toHaveCount(3);
  });
});
