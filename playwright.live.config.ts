import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'live.spec.ts',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.LIVE_URL || 'https://borapin.web.app',
    ...devices['Pixel 7'],
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
});
