import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// 배포 직후 실제 주소(borapin.web.app)가 열리는지 확인한다. 로그인은 하지 않는다.
const SHOTS = 'test-results/screens';
fs.mkdirSync(SHOTS, { recursive: true });

test('실제 주소에서 로그인 화면이 뜬다 (휴대폰)', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId('login')).toBeVisible();
  await expect(page).toHaveTitle(/보라핀/);
  await page.screenshot({ path: `${SHOTS}/live-mobile.png` });
});

test('실제 주소에서 로그인 화면이 뜬다 (PC)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ko-KR' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.getByTestId('login')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/live-desktop.png` });
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const geo = await page.request.get('/data/kr-cells.topojson');
  expect(geo.ok()).toBeTruthy();
  // 지도 그리기 일꾼(worker) 파일이 자바스크립트로 내려오는지
  if (process.env.WORKER_PATH) {
    const w = await page.request.get(process.env.WORKER_PATH);
    expect(w.ok()).toBeTruthy();
    expect(w.headers()['content-type']).toMatch(/javascript/);
  }
  await ctx.close();
});

test('실제 주소에 이번 커밋이 올라가 있다', async ({ page }) => {
  test.skip(!process.env.COMMIT, 'COMMIT이 없으면 건너뜀');
  await page.goto('/');
  const v = await page.locator('meta[name="borapin-version"]').getAttribute('content');
  expect(v).toMatch(new RegExp(`\\+${process.env.COMMIT}$`));
});

test('구글 로그인 창이 열린다 (허용된 도메인, 로그인은 하지 않음)', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByTestId('login').click()]);
  await expect.poll(() => popup.url(), { timeout: 20_000 }).toMatch(/accounts\.google\.com/);
  await popup.close();
  expect(errors.filter((e) => /unauthorized-domain|auth\/(?!popup-closed)/.test(e)), errors.join('\n')).toEqual([]);
});
