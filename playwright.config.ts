import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // 보안 규칙·순수 함수 시험은 node --test로 따로 돌린다
  testIgnore: ['live.spec.ts', 'preview.spec.ts', 'rules/**', 'unit/**'],
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
    serviceWorkers: 'block',
  },
  webServer: {
    // 실제 배포와 같은 묶음(build)으로 점검한다
    command: 'npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port 5174 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5174',
    env: { VITE_EMULATOR: '1' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
