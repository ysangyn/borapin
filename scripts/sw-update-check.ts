/**
 * '옛 버전이 남는 문제' 확인: 배포 전에 실제 주소를 한 번 열어 서비스 워커가 옛 버전을 저장하게 하고,
 * 배포 뒤 같은 브라우저(같은 저장소)로 다시 열었을 때 새 버전으로 바뀌는지 본다.
 *
 *   npx tsx scripts/sw-update-check.ts before https://borapin.web.app
 *   (배포)
 *   npx tsx scripts/sw-update-check.ts after https://borapin.web.app abc1234
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const [phase, base, commit] = process.argv.slice(2);
const dir = path.join(process.env.RUNNER_TEMP ?? os.tmpdir(), 'borapin-sw-profile');
const version = (p: import('@playwright/test').Page) => p.evaluate(() => document.querySelector('meta[name="borapin-version"]')?.getAttribute('content') ?? '');

if (phase === 'before') {
  fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(dir, { locale: 'ko-KR', executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'load' });
  // 서비스 워커가 자리 잡고 파일을 다 저장할 때까지
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.waitForTimeout(4000);
  const v = await version(page);
  fs.writeFileSync(path.join(dir, 'old-version.txt'), v);
  console.log(`배포 전 버전: ${v} (서비스 워커 저장 완료)`);
  await ctx.close();
} else if (phase === 'after') {
  if (!fs.existsSync(dir)) {
    console.log('배포 전 기록이 없어 건너뜁니다 (첫 배포)');
    process.exit(0);
  }
  const old = fs.readFileSync(path.join(dir, 'old-version.txt'), 'utf8');
  // 버전 표시가 생기기 전 빌드(2026-10-16 이전)는 비교할 수 없다: 한 번만 건너뛴다
  if (!old) {
    console.log('배포 전 버전이 버전 표시가 없는 옛 빌드라 이번에는 건너뜁니다 (다음 배포부터 비교)');
    process.exit(0);
  }
  const ctx = await chromium.launchPersistentContext(dir, { locale: 'ko-KR', executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'load' });
  const first = await version(page);
  console.log(`다시 열자마자: ${first} (배포 전 ${old})`);
  // 새 서비스 워커가 받아지면 앱이 스스로 새로 고친다. 사용자가 1분 안에 다시 열어 보는 것까지 허용.
  let now = first;
  for (let i = 0; i < 12 && !now.endsWith(`+${commit}`); i++) {
    await page.waitForTimeout(5000);
    if (i === 6) await page.reload({ waitUntil: 'load' });
    now = await version(page).catch(() => '');
  }
  await ctx.close();
  if (!now.endsWith(`+${commit}`)) {
    console.error(`✗ 1분이 지나도 옛 버전(${now})이 남아 있어요. 기대 …+${commit}`);
    process.exit(1);
  }
  console.log(`✓ 새 버전으로 바뀜: ${now}`);
} else {
  console.error('사용: sw-update-check.ts before <주소> | after <주소> <커밋>');
  process.exit(2);
}
