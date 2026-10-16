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
  const project = () => page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  const box = await page.getByTestId('map').first().boundingBox();
  if (!box) throw new Error('지도가 없어요');
  let pt = await project();
  // 홈 지도는 최근 핀 둘레만 보여 주므로, 누를 곳이 화면 밖이면 사람처럼 '전체 보기'를 먼저 누른다
  if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) {
    await page.getByRole('button', { name: '전체 보기' }).click();
    await page.waitForFunction(() => (window as unknown as { __map: { isMoving: () => boolean } }).__map.isMoving() === false);
    await page.waitForTimeout(150);
    pt = await project();
  }
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
    await page.getByRole('link', { name: '기록하기', exact: true }).click();
    // 장소: 한 글자씩 쳐서 찾기
    await page.getByLabel('어디 검색').click();
    await page.keyboard.type('경주', { delay: 60 });
    await page.getByRole('option', { name: /경주시/ }).first().click();
    await expect(page.getByRole('button', { name: /경주시 빼기/ })).toBeVisible();
    await page.getByLabel('제목').click();
    await page.keyboard.type('경주 첫 벚꽃 여행', { delay: 30 });
    // 언제를 안 골랐으면 저장 버튼 아래에 무엇이 빠졌는지 알려 준다
    await expect(page.getByTestId('save')).toBeDisabled();
    await expect(page.getByTestId('save-hint')).toContainText('대략 언제');
    await page.getByRole('button', { name: '몇 년', exact: true }).click();
    await page.getByLabel('연도').selectOption('2024');
    await expect(page.getByTestId('save-hint')).toHaveCount(0);
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
    // PC 양옆엔 흐린 배경 장면이 붙는다 (폰에선 없음)
    await expect(page.getByTestId('backdrop')).toBeAttached({ timeout: 10_000 });
    await page.goto('/record');
    await page.getByLabel('어디 검색').fill('단양');
    await page.getByRole('option', { name: /단양군/ }).first().click();
    await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
    await page.getByRole('button', { name: '몰라요' }).click();
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

  test('가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await page.goto('/wishes/new');
    await page.getByLabel('어디 검색').fill('남해');
    await page.getByRole('option', { name: /남해군/ }).first().click();
    await page.getByTestId('wish-save').click();
    await expect(page).toHaveURL(/\/wishes$/);
    await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
    await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
    const back = page.getByRole('button', { name: '뒤로' });

    // 아무것도 안 바꿨으면 묻지 않고 나간다
    let asked = '';
    page.on('dialog', (d) => {
      asked = d.message();
      void d.dismiss();
    });
    await back.click();
    await expect(page).toHaveURL(/\/wishes$/);
    expect(asked).toBe('');

    // '누가 원해요'만 바꿔도 묻는다 (취소하면 그대로 머문다)
    await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
    await page.getByRole('button', { name: '보라', exact: true }).click();
    await back.click();
    await expect.poll(() => asked).toContain('저장하지 않은 내용');
    await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
    await page.context().close();
  });

  test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await page.goto('/places/new');
    // 네이버지도 입력 칸은 하나뿐
    await expect(page.getByLabel(/네이버/)).toHaveCount(1);
    // 고른 종류에만 눌림·체크 표시
    const food = page.getByRole('button', { name: '맛집', exact: true });
    const cafe = page.getByRole('button', { name: '카페', exact: true });
    await expect(food).toHaveAttribute('aria-pressed', 'true');
    await expect(food.locator('.chip-check')).toBeVisible();
    await cafe.click();
    await expect(cafe).toHaveAttribute('aria-pressed', 'true');
    await expect(food).toHaveAttribute('aria-pressed', 'false');
    await expect(food.locator('.chip-check')).toHaveCount(0);
    const again = page.getByRole('button', { name: '또 갈래요', exact: true });
    await again.click();
    await expect(again).toHaveAttribute('aria-pressed', 'true');
    await expect(again.locator('.chip-check')).toBeVisible();
    // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
    await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
    await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
    await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
    await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
    await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
    // 링크를 빼면 다시 붙여 넣을 수 있다
    await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
    await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
    await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
    await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
    await page.context().close();
  });

  test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
    const before = (await page.getByTestId('headline').textContent()) ?? '';
    // 여행 없이 장소만 (칠곡)
    await page.goto('/places/new');
    await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
    await page.getByLabel('어디 검색').fill('칠곡');
    await page.getByRole('option', { name: /칠곡군/ }).first().click();
    await page.getByTestId('place-save').click();
    // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
    await expect(page.getByRole('status')).toContainText('장소를 남겼어요');
    await page.goto('/');
    await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
    const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
    await expect(spot).toHaveCount(1);
    await expect(spot).toContainText('1');
    // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
    await expect(page.getByTestId('headline')).toHaveText(before);
    // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
    await page.goto('/places/new');
    await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
    await page.getByLabel('어디 검색').fill('칠곡');
    await page.getByRole('option', { name: /칠곡군/ }).first().click();
    await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
    await page.getByTestId('place-save').click();
    await expect(page.getByRole('status')).toContainText('장소를 남기고 핀도 꽂았어요');
    await page.goto('/');
    await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
    await expect(page.getByTestId('headline')).not.toHaveText(before);
    await page.context().close();
  });

  test('가고 싶은 곳 카드: 축제 이름이 길어도 꼬리표는 한 줄, 네모와 버튼은 가운데로 나란히', async ({ browser }) => {
    const page = await phone(browser);
    // 긴 이름의 '지금 축제'를 제주에 하나 넣어 둔다 (실제 축제 자료는 매주 바뀌므로)
    const d = new Date(); const ymd = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
    const s = new Date(d); s.setDate(d.getDate() - 1); const e = new Date(d); e.setDate(d.getDate() + 5);
    await page.route('**/data/festivals.json', (r) => r.fulfill({ json: { updated: ymd(d), source: '시험', cells: { '51750': [{ t: '영월 단종문화제 한마당 큰잔치 거리 퍼레이드', s: ymd(s), e: ymd(e), id: 'x' }] } } }));
    await signIn(page);
    // 영월을 가고 싶은 곳에 담는다 (다른 시험이 건드리지 않는 곳)
    await page.goto('/wishes/new?place=kr:51750');
    // 둘 다 원해요 + 1순위로 담아 홈 세 줄 안에 들게
    const chips = page.locator('.heart-chip');
    for (let i = 0; i < (await chips.count()); i++) {
      if ((await chips.nth(i).getAttribute('aria-pressed')) !== 'true') await chips.nth(i).click();
      await expect(chips.nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: '1순위', exact: true }).click();
    await page.getByTestId('wish-save').click();
    await expect(page).not.toHaveURL(/wishes\/new/);
    // 홈 '다음 여행 준비'에 영월이 올라오고(예정 여행이 없을 때), 카드 모양은 가고 싶은 곳 목록에서 본다
    await page.goto('/');
    const hub = page.getByTestId('next-hub');
    if (await hub.isVisible() && (await hub.getAttribute('data-anchor')) === 'wish') await expect(hub.getByTestId('hub-first')).toContainText('영월');
    await page.goto('/wishes');
    // 축제 꼬리표는 한 줄, 오른쪽 단추(여행 만들기 또는 나도 원해요 하트)는 카드 안에
    const card = page.getByTestId('wish-card').filter({ hasText: '영월' }).first();
    await expect(card).toBeVisible();
    const tag = card.getByTestId('wish-festival');
    await expect(tag).toBeVisible();
    const tagBox = (await tag.boundingBox())!;
    expect(tagBox.height, '축제 꼬리표가 여러 줄로 늘어났어요').toBeLessThan(28);
    const box = (await card.boundingBox())!;
    const cta = card.getByTestId('wish-plan').or(card.getByTestId('wish-heart')).first();
    await expect(cta).toBeVisible();
    const btn = (await cta.boundingBox())!;
    expect(btn.x + btn.width, '단추가 카드 밖으로 나가면 안 돼요').toBeLessThanOrEqual(box.x + box.width + 1);
    expect(tagBox.x + tagBox.width, '꼬리표가 단추와 겹치면 안 돼요').toBeLessThanOrEqual(btn.x + 1);
    await expect(card.locator('.t')).toContainText('영월');
    await page.context().close();
  });

  test('우하단 보라 얼굴(물어봐요)을 누르면 물어보기가 열리고, 물어보기·지도 화면엔 안 뜬다', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    const fab = page.getByTestId('ask-fab');
    await expect(fab).toBeVisible();
    await expect(fab).toBeInViewport({ ratio: 1 });
    // 아래 메뉴와 겹치지 않는다
    const f = (await fab.boundingBox())!;
    const nav = (await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox())!;
    expect(f.y + f.height).toBeLessThanOrEqual(nav.y + 1);
    await fab.click();
    await expect(page).toHaveURL(/\/ask/);
    await expect(page.getByText('보라에게 물어봐')).toBeVisible();
    await expect(page.getByTestId('ask-fab')).toHaveCount(0);
    await page.goto('/map');
    await expect(page.getByTestId('ask-fab')).toHaveCount(0);
    await page.context().close();
  });

  test('홈 지도는 최근 핀 둘레를 가까이 보여 주고, 맞춤 단추를 누르면 남한 전체로', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    // 방금 남긴 핀(고흥) 둘레가 보여야 한다
    await page.goto('/record');
    await page.getByLabel('어디 검색').fill('고흥');
    await page.getByRole('option', { name: /고흥군/ }).first().click();
    await page.getByRole('button', { name: '몰라요' }).click();
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toBeVisible();
    await page.goto('/');
    const map = page.getByTestId('map').first();
    await expect(map).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
    // 남한 전체는 약 5.6: 한 지역 둘레면 그보다 훨씬 가깝다
    await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeGreaterThan(6.4);
    await expect(page.locator('.map-label', { hasText: '고흥' }).first()).toBeVisible();
    const nearZoom = Number(await map.getAttribute('data-zoom'));
    await page.getByRole('button', { name: '전체 보기' }).click();
    await expect.poll(async () => Number(await map.getAttribute('data-zoom')), { timeout: 10_000 }).toBeLessThan(nearZoom - 0.2);
    await page.context().close();
  });

  test('홈은 여행 전·중·후에 따라 바뀐다: 닷새 뒤 떠나는 여행을 만들면 맨 위에 D-5 카드', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    // 날짜는 앱(한국 시간) 기준으로: CI 서버는 UTC라 자정 무렵이면 하루가 어긋난다
    const ymd = new Date(Date.now() + 5 * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
    await page.goto('/record?status=planned');
    await page.getByLabel('어디 검색').fill('속초');
    await page.getByRole('option', { name: /속초시/ }).first().click();
    await page.getByLabel('제목').fill('속초 단풍 여행');
    await page.getByRole('button', { name: '날짜', exact: true }).click();
    await page.getByLabel('시작 날짜').fill(ymd);
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('속초 단풍 여행');
    await page.goto('/');
    const card = page.getByTestId('stage-card');
    await expect(card).toHaveAttribute('data-stage', 'before');
    await expect(card).toContainText('속초 단풍 여행');
    await expect(card).toContainText('D-5');
    await expect(card).toContainText('준비물');
    // 다가오는 여행 목록에 같은 여행이 또 나오지 않는다
    await expect(page.getByTestId('trip-row').filter({ hasText: '속초 단풍 여행' })).toHaveCount(0);
    // 지금 중요한 것만 크게: 추천·가고 싶은 곳은 접혀 있고, 펼치면 보인다
    const more = page.getByTestId('home-more');
    await expect(more).toBeVisible();
    await expect(page.getByTestId('month-pick')).toBeHidden();
    await more.locator('summary').click();
    await expect(page.getByTestId('month-pick')).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(/\/trips\/[^/]+$/);
    await page.context().close();
  });

  test('기록 남기기에서 사진을 같이 고르면 저장과 함께 올라가고 사진 탭이 열린다', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await page.goto('/record');
    await page.getByLabel('어디 검색').fill('여수');
    await page.getByRole('option', { name: /여수시/ }).first().click();
    await page.getByLabel('제목').fill('여수 밤바다 사진');
    await page.getByRole('button', { name: '몰라요' }).click();
    await page.getByTestId('record-photo-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg']);
    await expect(page.locator('.pending-photo')).toHaveCount(1);
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('여수 밤바다 사진', { timeout: 30_000 });
    await expect(page).toHaveURL(/tab=photos/);
    await expect(page.getByTestId('trip-photos').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 30_000 });
    // 사진 탭 아래에 남은 공간 안내
    await expect(page.getByTestId('photo-space')).toContainText(/약 [\d,]+장 더 올릴 수 있어요/);
    await page.context().close();
  });

  test('피드 맨 위에서 여행을 골라 사진을 바로 올리면 피드에 묶음으로 뜬다', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await page.goto('/feed');
    const sel = page.getByLabel('사진을 올릴 여행');
    await expect(sel).toBeVisible();
    const value = await sel.locator('option', { hasText: '여수 밤바다 사진' }).first().getAttribute('value');
    await sel.selectOption(value!);
    await page.getByTestId('quick-upload-input').setInputFiles(['tests/fixtures/photo-gangneung.jpg', 'tests/fixtures/photo-gangneung.jpg']);
    await expect(page.getByRole('status')).toContainText('사진 2장을 올렸어요', { timeout: 60_000 });
    const first = page.getByTestId('feed-item').first();
    await expect(first).toHaveAttribute('data-kind', 'photos');
    await expect(first).toContainText('여수 밤바다 사진에 사진 3장');
    await page.context().close();
  });

  test('오늘의 영어: 새 문장 3개가 뜨고, 외웠어요를 누르면 연속 학습일이 1이 되고, 고르기 퀴즈가 돈다', async ({ browser }) => {
    const page = await phone(browser);
    await signIn(page);
    await page.goto('/study');
    await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
    await page.getByTestId('study-know').first().click();
    await expect(page.getByRole('status')).toContainText('외웠어요');
    await expect(page.getByTestId('study-summary')).toContainText('1');
    // 새로 고쳐도 진도가 남고, 외운 문장도 오늘 묶음에 그대로 있다
    await page.reload();
    await expect(page.getByTestId('study-card')).toHaveCount(3, { timeout: 15_000 });
    await expect(page.getByTestId('study-card').first()).toContainText('1단계');
    await page.getByTestId('study-more').click();
    await expect(page.getByTestId('study-card')).toHaveCount(6);
    // 고르기: 보기 4개, 하나 고르면 다음으로
    await page.getByRole('tab', { name: '고르기' }).click();
    const quiz = page.getByTestId('study-pick');
    await expect(quiz.locator('.study-opt')).toHaveCount(4);
    await quiz.locator('.study-opt').first().click();
    await expect(quiz.getByRole('button', { name: /다음|끝/ })).toBeVisible();
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
