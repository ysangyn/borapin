import { defineConfig, devices } from '@playwright/test';

/**
 * 화면 시험 (에뮬레이터)
 * - chromium: 모든 시험 (안드로이드 크롬 흉내, Pixel 7)
 * - webkit: 아이폰 사파리 흉내(iPhone 13). 시간이 두 배가 되지 않게 제목에 @webkit 표시가 있는 핵심 시험만
 *   (375px 넘침, 홈 지도·핀, 구글 창으로 들어와 기록 남기기, 로그인 화면 배치 — tests/human.spec.ts).
 *   app.spec.ts(순서 의존)와 tour.spec.ts(사진 찍기)는 webkit에서 돌지 않는다.
 */
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
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 7'] } },
    { name: 'webkit', use: { ...devices['iPhone 13'] }, grep: /@webkit/ },
  ],
  webServer: {
    // 실제 배포와 같은 묶음(build)으로 점검한다
    command: 'npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port 5174 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5174',
    env: { VITE_EMULATOR: '1' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
