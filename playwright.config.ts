import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: 'live.spec.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    ...devices['Pixel 7'],
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx vite --port 5174 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5174',
    env: { VITE_EMULATOR: '1' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
