/**
 * 써 보기: 사람이 폰으로 메뉴를 하나씩 눌러 보듯 걸어 다니며, 걸음마다 '보이는 화면 그대로' 찍고 점검한다.
 * - 둘러보기(tour.spec.ts)가 채워 둔 기록(보라·영상, 통영 예정 여행 등) 위에서 돈다 (파일 순서상 tour 다음).
 * - 화면 점검: 옆으로 넘침, 너무 작은 누를 곳, 잘린 글, 아래 메뉴에 가려진 단추, 오류 글.
 * - 막힌 걸음은 실패로 멈추지 않고 보고서(test-results/walk/report.txt)에 '막힘'으로 남긴다 (배포를 막지 않음).
 */
import { test, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OWNER = 'ysangyn@gmail.com';
const OUT = 'test-results/walk';
fs.mkdirSync(OUT, { recursive: true });
test.describe.configure({ mode: 'serial' });

const lines: string[] = [];
let n = 0;
const log = (s: string) => { lines.push(s); console.log(s); };

async function phone(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 760 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => log(`  ! 오류: ${e.message.slice(0, 160)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/permission|insufficient|Failed to load resource/i.test(m.text())) log(`  ! 콘솔: ${m.text().slice(0, 160)}`); });
  return page;
}

async function signIn(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate(([e, nm]) => (window as unknown as { __testSignIn: (e: string, n: string) => Promise<void> }).__testSignIn(e, nm), [OWNER, '영상']);
  await page.getByRole('navigation', { name: '주 메뉴' }).waitFor({ timeout: 20_000 });
}

/** 지금 보이는 화면 점검 */
async function audit(page: Page) {
  return page.evaluate(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const nav = document.querySelector('nav[aria-label="주 메뉴"]')?.getBoundingClientRect();
    const name = (el: Element) => (el.getAttribute('aria-label') || (el as HTMLElement).innerText || el.getAttribute('placeholder') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 24);
    const vis = (el: Element) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.top < vh; };
    const out = { overflow: Math.max(0, document.documentElement.scrollWidth - vw), small: [] as string[], clipped: [] as string[], offRight: [] as string[], under: [] as string[] };
    for (const el of document.querySelectorAll('button, [role=button], [role=tab], select, input:not([type=checkbox]):not([type=file]):not([type=hidden]), a.btn, a.chip')) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 30 || r.width < 30) out.small.push(`${name(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
      if (r.right > vw + 1) out.offRight.push(name(el));
      // 아래 메뉴 뒤에 깔린 단추 (스크롤해도 늘 가려지면 못 누름 — 화면 맨 아래 걸음에서 의미 있음)
      if (nav && !el.closest('nav') && r.top < nav.bottom && r.bottom > nav.top + 10 && r.left < nav.right && r.right > nav.left && document.documentElement.scrollHeight - window.scrollY - vh < 4) out.under.push(name(el));
    }
    for (const el of document.querySelectorAll('body *')) {
      const e = el as HTMLElement;
      if (e.childElementCount || !e.textContent?.trim() || !vis(e)) continue;
      const s = getComputedStyle(e);
      if (e.scrollWidth > e.clientWidth + 2 && s.overflowX !== 'visible' && s.textOverflow !== 'ellipsis') out.clipped.push(e.textContent.trim().slice(0, 28));
    }
    for (const k of ['small', 'clipped', 'offRight', 'under'] as const) out[k] = [...new Set(out[k])].slice(0, 12);
    return out;
  });
}

async function shot(page: Page, label: string, full = false) {
  await page.waitForTimeout(900);
  n++;
  const file = `${String(n).padStart(2, '0')}-${label}.jpg`;
  await page.screenshot({ path: path.join(OUT, file), fullPage: full, type: 'jpeg', quality: 80 }).catch(() => undefined);
  const a = await audit(page).catch(() => null);
  log(`[${file}] ${page.url().replace(/^https?:\/\/[^/]+/, '')}`);
  if (a) {
    if (a.overflow) log(`  - 옆으로 넘침 ${a.overflow}px`);
    if (a.offRight.length) log(`  - 화면 밖 단추: ${a.offRight.join(' / ')}`);
    if (a.clipped.length) log(`  - 잘린 글: ${a.clipped.join(' / ')}`);
    if (a.small.length) log(`  - 작은 누를 곳(<30px): ${a.small.join(' / ')}`);
    if (a.under.length) log(`  - 아래 메뉴에 가려짐: ${a.under.join(' / ')}`);
  }
}

/** 한 걸음: 막혀도 멈추지 않고 적어 둔다 */
async function step(page: Page, label: string, fn: () => Promise<void>, full = false) {
  try {
    await fn();
    await shot(page, label, full);
  } catch (e) {
    log(`[막힘] ${label}: ${(e as Error).message.split('\n')[0].slice(0, 200)}`);
    await shot(page, `${label}-막힘`);
  }
}
const toastText = async (page: Page) => (await page.getByRole('status').first().textContent({ timeout: 4000 }).catch(() => ''))?.trim() ?? '';

test('써 보기: 폰으로 메뉴를 하나씩', async ({ browser }) => {
  test.setTimeout(15 * 60_000);
  const page = await phone(browser);
  await signIn(page);

  // ── 1. 홈 ──
  log('\n== 홈 ==');
  await step(page, 'home-top', async () => { await page.goto('/'); });
  await step(page, 'home-scroll1', async () => { await page.mouse.wheel(0, 700); });
  await step(page, 'home-scroll2', async () => { await page.mouse.wheel(0, 700); });
  await step(page, 'home-bottom', async () => { await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); });
  await step(page, 'home-stage-card', async () => { await page.goto('/'); await page.getByRole('link', { name: /준비물 보기/ }).first().click({ timeout: 5000 }); });

  // ── 2. 남기기(+) ──
  log('\n== 남기기 (+) ==');
  await step(page, 'plus-open', async () => { await page.goto('/'); await page.getByRole('button', { name: '남기기' }).click(); });
  await step(page, 'record-new', async () => { await page.goto('/record'); });
  await step(page, 'record-search', async () => { await page.getByLabel('어디 검색').fill('속초'); });
  await step(page, 'record-picked', async () => { await page.getByRole('option', { name: /속초/ }).first().click(); });
  await step(page, 'record-dates', async () => {
    await page.getByLabel('시작 날짜').fill('2026-10-10');
    const end = page.getByLabel(/끝 날짜/);
    if (await end.count()) await end.fill('2026-10-11');
  });
  await step(page, 'record-memo', async () => { await page.getByLabel('메모').fill('대포항 회, 아바이마을 오징어순대'); });
  await step(page, 'record-saved', async () => { await page.getByTestId('save').click(); await page.waitForURL(/\/trips\/[^/]+$/, { timeout: 15_000 }); log(`  · 알림: ${await toastText(page)}`); });
  const newTrip = page.url();

  // ── 3. 방금 만든 여행 ──
  log('\n== 여행 상세 (방금 만든 속초) ==');
  await step(page, 'trip-tabs', async () => { await page.goto(newTrip); });
  for (const t of ['들른 곳', '사진', '글']) await step(page, `trip-tab-${t}`, async () => { await page.getByRole('tab', { name: new RegExp(t) }).first().click(); });
  await step(page, 'trip-note-write', async () => {
    await page.getByRole('tab', { name: /글/ }).first().click();
    const ta = page.locator('textarea').first();
    await ta.fill('바다가 너무 예뻤다');
    await page.getByRole('button', { name: '남기기' }).last().click();
    log(`  · 알림: ${await toastText(page)}`);
  });
  await step(page, 'trip-edit', async () => { await page.goto(newTrip + '/edit'); });

  // ── 4. 예정 여행 (통영) ──
  log('\n== 예정 여행 (통영) ==');
  await step(page, 'planned-info', async () => { await page.goto('/trips/t11'); });
  await step(page, 'planned-plan', async () => { await page.getByRole('tab', { name: /일정/ }).click(); });
  await step(page, 'planned-plan-add', async () => {
    const box = page.getByLabel('가볼 곳 추가');
    await box.fill('서피랑 99계단');
    await page.getByRole('button', { name: '추가' }).first().click();
    log(`  · 알림: ${await toastText(page)}`);
  });
  await step(page, 'planned-plan-open', async () => { await page.locator('.plan-name', { hasText: '서피랑 99계단' }).click(); });
  await step(page, 'planned-plan-time', async () => { await page.getByLabel('시간').first().selectOption({ index: 5 }); });
  await step(page, 'planned-prep', async () => { await page.getByRole('tab', { name: /준비/ }).click(); });
  await step(page, 'planned-prep-pack', async () => {
    const box = page.getByPlaceholder('더 챙길 것');
    await box.fill('우산');
    await box.press('Enter');
  });
  await step(page, 'planned-prep-back-way', async () => { await page.getByTestId('way-back-open').click(); });
  await step(page, 'planned-prep-back-way-car', async () => { await page.getByTestId('way-car').click(); log(`  · 알림: ${await toastText(page)}`); });
  await step(page, 'planned-photos', async () => { await page.getByRole('tab', { name: /사진/ }).click(); });
  await step(page, 'planned-continue', async () => { await page.goto('/trips/t11'); await page.getByTestId('plan-continue').click(); });

  // ── 5. 여행 목록 ──
  log('\n== 여행 목록 ==');
  await step(page, 'trips', async () => { await page.goto('/trips'); });
  await step(page, 'trips-search', async () => { await page.getByPlaceholder(/찾기/).first().fill('바다'); });
  await step(page, 'trips-search-none', async () => { await page.getByPlaceholder(/찾기/).first().fill('없는여행이름'); });
  await step(page, 'trips-filter-abroad', async () => { await page.getByPlaceholder(/찾기/).first().fill(''); await page.getByRole('button', { name: /^해외/ }).click(); });

  // ── 6. 지도 ──
  log('\n== 지도 ==');
  await step(page, 'map', async () => { await page.goto('/map'); });
  await step(page, 'map-sheet-visited', async () => { await page.goto('/map?sel=kr:51150'); await page.getByTestId('region-sheet').waitFor(); });
  await step(page, 'map-sheet-visited-scroll', async () => { await page.getByTestId('region-sheet').evaluate((e) => e.scrollBy(0, 600)); });
  await step(page, 'map-sheet-new', async () => { await page.goto('/map?sel=kr:46910'); await page.getByTestId('region-sheet').waitFor(); });
  await step(page, 'map-sheet-wish', async () => { await page.getByTestId('region-sheet').getByRole('button', { name: /가고 싶어요|담기/ }).first().click(); log(`  · 알림: ${await toastText(page)}`); });
  await step(page, 'map-world', async () => { await page.goto('/map'); await page.getByRole('tab', { name: '세계' }).first().click(); });
  await step(page, 'map-sheet-country', async () => { await page.goto('/map?sel=country:JPN'); await page.getByTestId('region-sheet').waitFor(); });

  // ── 7. 가고 싶은 곳 ──
  log('\n== 가고 싶은 곳 ==');
  await step(page, 'wishes', async () => { await page.goto('/wishes'); });
  await step(page, 'wishes-dice', async () => { await page.goto('/wishes?find=dice'); });
  await step(page, 'wishes-world', async () => { await page.goto('/wishes?find=world'); });
  await step(page, 'wish-new', async () => { await page.goto('/wishes/new'); await page.getByLabel('어디 검색').fill('경주'); await page.getByRole('option', { name: /경주/ }).first().click(); });
  await step(page, 'wish-new-saved', async () => { await page.getByTestId('wish-save').click(); log(`  · 알림: ${await toastText(page)}`); });
  await step(page, 'wish-open', async () => { await page.goto('/wishes/w1'); });
  await step(page, 'wish-make-trip', async () => { await page.getByTestId('wish-edit-plan').click(); });

  // ── 8. 계획하기 (조건으로 고르기) ──
  log('\n== 계획하기 ==');
  await step(page, 'plan', async () => { await page.goto('/plan'); });
  await step(page, 'plan-go', async () => { await page.getByTestId('planner-go').click(); });
  await step(page, 'plan-heart', async () => { await page.getByTestId('plan-heart').first().click(); });

  // ── 9. 물어보기 ──
  log('\n== 물어보기 ==');
  await step(page, 'ask', async () => { await page.goto('/ask'); });
  for (const q of ['이번 주말 어디 갈까', '강릉 맛집', '우리 여행 몇 번 했어', '제주 언제 갔지', '비 오는 날 갈 만한 곳', '통영 가는 길', '부모님이랑 가기 좋은 곳', '도쿄에서 산 거']) {
    await step(page, `ask-${q.replace(/\s+/g, '_')}`, async () => {
      const box = page.getByLabel('질문');
      await box.fill(q);
      await page.getByRole('button', { name: '묻기' }).click();
      await page.getByTestId('answer').last().waitFor({ timeout: 15_000 });
      const a = (await page.getByTestId('answer').last().innerText()).replace(/\s+/g, ' ').slice(0, 220);
      log(`  · 물음 '${q}' → ${a}`);
    });
  }

  // ── 10. 추억 · 피드 · 장소 ──
  log('\n== 추억 · 피드 · 우리 장소 ==');
  await step(page, 'memories', async () => { await page.goto('/memories'); });
  await step(page, 'memories-scroll', async () => { await page.mouse.wheel(0, 900); });
  await step(page, 'memories-scroll2', async () => { await page.mouse.wheel(0, 900); });
  await step(page, 'feed', async () => { await page.goto('/feed'); });
  await step(page, 'feed-scroll', async () => { await page.mouse.wheel(0, 900); });
  await step(page, 'places', async () => { await page.goto('/places'); });
  await step(page, 'place-new', async () => { await page.goto('/places/new'); });
  await step(page, 'place-open', async () => { await page.goto('/places/r1'); });

  // ── 11. 익히기 ──
  log('\n== 오늘의 영어 · 현지어 ==');
  await step(page, 'study', async () => { await page.goto('/study'); });
  await step(page, 'study-next', async () => { await page.getByRole('button').filter({ hasText: /다음|외웠어요|시작/ }).first().click(); });
  await step(page, 'phrases-ja', async () => { await page.goto('/phrases/ja'); });

  // ── 12. 우리 공간 · 밤 화면 ──
  log('\n== 우리 공간 ==');
  await step(page, 'space', async () => { await page.goto('/space'); });
  await step(page, 'space-home', async () => { await page.goto('/space#home'); });
  await step(page, 'space-dark', async () => { await page.goto('/space'); await page.getByTestId('theme-dark').click(); await page.waitForTimeout(1500); await page.goto('/'); });
  await step(page, 'dark-trip', async () => { await page.goto('/trips/t11'); });
  await step(page, 'dark-wishes', async () => { await page.goto('/wishes'); });
  await step(page, 'space-light', async () => { await page.goto('/space'); await page.getByTestId('theme-light').click(); await page.waitForTimeout(1500); await page.goto('/'); });

  // ── 13. 인터넷이 끊겼을 때 ──
  log('\n== 인터넷 끊김 ==');
  await step(page, 'offline-home', async () => { await page.context().setOffline(true); await page.goto('/').catch(() => undefined); });
  await step(page, 'offline-plan-add', async () => {
    await page.goto('/trips/t11?tab=plan').catch(() => undefined);
    const box = page.getByLabel('가볼 곳 추가');
    await box.fill('오프라인에서 적은 곳');
    await page.getByRole('button', { name: '추가' }).first().click();
    log(`  · 알림: ${await toastText(page)}`);
  });
  await page.context().setOffline(false);

  // ── 14. 없는 주소 · 공유 ──
  log('\n== 없는 주소 ==');
  await step(page, 'not-found', async () => { await page.goto('/없는주소'); });
  await step(page, 'trip-missing', async () => { await page.goto('/trips/없는여행'); });

  fs.writeFileSync(path.join(OUT, 'report.txt'), lines.join('\n') + '\n');
  await page.context().close();
});
