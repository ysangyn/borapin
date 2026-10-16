/**
 * 사람이 쓰는 그대로 시험한다 (에뮬레이터 + 실제 firestore.rules)
 * - 구글 로그인 창을 실제로 거쳐 들어오기
 * - 한글 입력 중 Enter (IME 조합 중에는 저장하지 않기)
 * - PC에서 사진 끌어다 놓기
 * - 375px 휴대폰 화면에서 옆으로 넘치지 않기, 로그인 그림이 문구를 가리지 않기
 * - 새로 고침해도 기록이 남아 있기
 */
import { test, expect, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';

const OWNER = 'ysangyn@gmail.com';

const problems: string[] = [];
function watch(page: Page) {
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/permission|insufficient/i.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  });
  page.on('response', (r) => {
    if (r.status() === 404 || r.status() >= 500) problems.push(`${r.status()}: ${r.url().slice(0, 160)}`);
  });
  return page;
}
test.afterEach(() => {
  const p = problems.splice(0);
  expect(p, p.join('\n')).toEqual([]);
});

async function phone(browser: Browser, width = 375, height = 667) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  return watch(await ctx.newPage());
}
async function desktop(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  return watch(await ctx.newPage());
}

/** 빠른 로그인 (구글 창 시험이 아닌 곳에서) */
async function signIn(page: Page, email = OWNER) {
  await page.goto('/');
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
}

/** 구글 로그인: 버튼 → (에뮬레이터의) 구글 계정 창 → 계정 고르기 */
async function googleSignIn(page: Page, email = OWNER, name = '영상') {
  await page.goto('/');
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByTestId('login').click()]);
  await popup.waitForLoadState();
  const existing = popup.locator('#accounts-list').getByText(email);
  if (await existing.count()) {
    await existing.first().click();
  } else {
    await popup.locator('#add-account-button').click();
    await popup.locator('#email-input').fill(email);
    await popup.locator('#display-name-input').fill(name);
    await popup.locator('#sign-in').click();
  }
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
}

/** IME로 한글을 조합하는 중 (아직 확정 전) */
async function composeKorean(page: Page, steps: string[]) {
  const cdp = await page.context().newCDPSession(page);
  for (const t of steps) await cdp.send('Input.imeSetComposition', { text: t, selectionStart: t.length, selectionEnd: t.length });
  return {
    commit: (text: string) => cdp.send('Input.insertText', { text }),
  };
}

/** 지도 위 경도·위도 지점을 누른다 */
async function tapLngLat(page: Page, lng: number, lat: number) {
  const pt = await page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  const box = await page.getByTestId('map').first().boundingBox();
  if (!box) throw new Error('지도가 없어요');
  await page.mouse.click(box.x + pt.x, box.y + pt.y);
}

/** 화면 폭을 넘어 삐져나간 요소 (가로 스크롤 상자 안은 제외) */
function overflowing(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const scrollsX = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
      }
      return false;
    };
    const bad: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
      if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
        bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
      }
    }
    return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  });
}

test.describe('사람처럼 쓰기', () => {
  test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
    const page = await phone(browser);
    await googleSignIn(page);
    await page.reload();
    await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('login')).toHaveCount(0);
    await page.context().close();
  });

  test('375px: 손으로 입력해 기록하고, 새로 고침해도 남아 있다', async ({ browser }) => {
    const page = await phone(browser);
    await googleSignIn(page);
    await page.getByRole('link', { name: '기록하기' }).click();
    // 장소: 한 글자씩 쳐서 찾기
    await page.getByLabel('어디 검색').click();
    await page.keyboard.type('경주', { delay: 60 });
    await page.getByRole('option', { name: /경주시/ }).first().click();
    await expect(page.getByRole('button', { name: /경주시 빼기/ })).toBeVisible();
    await page.getByLabel('제목').click();
    await page.keyboard.type('경주 첫 벚꽃 여행', { delay: 30 });
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행');
    const url = page.url();
    // 새로 고침해도 그대로
    await page.reload();
    await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행', { timeout: 20_000 });
    expect(page.url()).toBe(url);
    await page.goto('/trips');
    await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible();
    await page.reload();
    await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible({ timeout: 20_000 });
    await page.context().close();
  });

  test('375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
    const before = (await page.getByTestId('headline').textContent()) ?? '';
    // 전주 (꾸밈 사진이 있는 지역)
    await page.getByTestId('map').first().scrollIntoViewIfNeeded();
    await tapLngLat(page, 127.15, 35.82);
    const sheet = page.getByTestId('region-sheet');
    await expect(sheet.getByTestId('sheet-title')).toContainText('전주');
    // 가장 많이 쓰는 버튼은 창을 열자마자 보여야 한다 (스크롤해야 보이면 안 됨)
    await expect(sheet.getByTestId('quick-pin')).toBeInViewport({ ratio: 1 });
    await sheet.getByTestId('quick-pin').click();
    await expect(page.getByRole('status')).toContainText('핀을 꽂았어요');
    await sheet.getByRole('button', { name: '닫기' }).click();
    await expect(page.getByTestId('headline')).not.toHaveText(before);
    const after = await page.getByTestId('headline').textContent();
    await page.reload();
    await expect(page.getByTestId('headline')).toHaveText(after ?? '', { timeout: 20_000 });
    await page.context().close();
  });

  test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await page.goto('/record');

    // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
    await page.getByLabel('어디 검색').click();
    const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
    await page.keyboard.press('Enter');
    await place.commit('강릉');
    await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
    await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
    // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();

    // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
    const who = page.getByLabel('함께 간 사람 이름');
    await who.click();
    const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
    await page.keyboard.press('Enter');
    await name.commit('할머니');
    await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
    await expect(who).toHaveValue('할머니');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
    await expect(who).toHaveValue('');
    await page.context().close();
  });

  test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
    const page = await desktop(browser);
    await signIn(page);
    await page.goto('/record');
    await page.getByLabel('어디 검색').fill('단양');
    await page.getByRole('option', { name: /단양군/ }).first().click();
    await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
    await page.getByRole('tab', { name: /사진/ }).click();
    await expect(page.getByTestId('photos-empty')).toBeVisible();
    const grid = page.getByTestId('photo-grid');

    const drag = (files: { name: string; type: string; b64: string }[]) =>
      page.evaluateHandle((fs) => {
        const dt = new DataTransfer();
        for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
        return dt;
      }, files);

    // 글 파일은 올리지 않는다
    const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
    await grid.dispatchEvent('dragenter', { dataTransfer: txt });
    await grid.dispatchEvent('dragover', { dataTransfer: txt });
    await grid.dispatchEvent('drop', { dataTransfer: txt });
    await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');

    // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
    const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
    await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
    await grid.dispatchEvent('dragover', { dataTransfer: jpg });
    await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
    await grid.dispatchEvent('drop', { dataTransfer: jpg });
    await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
    await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
    await expect(page.getByTestId('photos-empty')).toHaveCount(0);

    // 새로 고침해도 사진이 남아 있다
    await page.reload();
    await page.getByRole('tab', { name: /사진/ }).click();
    await expect(page.getByTestId('photo-grid').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 20_000 });
    await page.context().close();
  });

  test('375px: 어느 화면도 옆으로 넘치지 않는다', async ({ browser }) => {
    const page = await phone(browser);
    await page.goto('/');
    await expect(page.getByTestId('email-form')).toBeVisible();
    const found: string[] = [];
    const check = async (where: string) => {
      const o = await overflowing(page);
      if (o.page) found.push(`${where}: ${o.page}`);
      for (const b of o.bad) found.push(`${where}: ${b}`);
    };
    await check('로그인');
    await signIn(page);
    const trip = await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href^="/trips/"]')?.getAttribute('href'));
    for (const route of ['/', '/trips', ...(trip ? [trip] : []), '/record', '/map', '/wishes', '/places', '/memories', '/ask', '/space', '/admin', '/credits']) {
      await page.goto(route);
      await page.waitForLoadState('load');
      await page.waitForTimeout(900);
      await check(route);
    }
    expect(found, found.join('\n')).toEqual([]);
    await page.context().close();
  });

  for (const width of [360, 375, 390]) {
    test(`${width}px 로그인: 걷는 보라 그림이 문구와 겹치지 않는다`, async ({ browser }) => {
      const page = await phone(browser, width, 740);
      await page.goto('/');
      const art = page.locator('.login-mascot');
      await expect(art).toBeVisible();
      await expect.poll(() => art.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
      const a = await art.boundingBox();
      // 글자가 실제로 차지하는 자리 (문단 상자가 아니라 글자 범위)
      const textBox = (sel: string) => page.locator(sel).evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const b = r.getBoundingClientRect();
        return { x: b.x, y: b.y, width: b.width, height: b.height };
      });
      const t = await textBox('.login-tag');
      const b = await textBox('.login-brand');
      for (const r of [t, b]) {
        if (!a || !r) throw new Error('그림이나 문구가 없어요');
        const overlap = a.x < r.x + r.width && r.x < a.x + a.width && a.y < r.y + r.height && r.y < a.y + a.height;
        expect(overlap, `그림 ${JSON.stringify(a)} / 문구 ${JSON.stringify(r)}`).toBe(false);
      }
      await page.context().close();
    });
  }
});
