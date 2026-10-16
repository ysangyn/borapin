import { defineConfig, devices } from '@playwright/test';

// 미리보기 채널 주소에서 진짜 Firebase(시험용 프로젝트)로 하는 시험
export default defineConfig({
  testDir: './tests',
  testMatch: 'preview.spec.ts',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.PREVIEW_URL,
    ...devices['Pixel 7'],
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
