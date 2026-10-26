import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const OWNER = 'ysangyn@gmail.com';
const SHOTS = 'test-results/screens';
fs.mkdirSync(SHOTS, { recursive: true });
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });

// 화면에서 난 오류는 모두 모아 두었다가 테스트 끝에 확인한다
const IGNORED = [/permission[-_ ]denied/i, /Missing or insufficient permissions/i];
let problems: string[] = [];
/** 이 테스트에서 일부러 내는 오류 응답 (예: 틀린 비밀번호) */
let expected: RegExp[] = [];
test.beforeEach(({ page }) => {
  problems = [];
  expected = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}\n${(e.stack ?? '').split('\n').slice(0, 6).join('\n')}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORED.some((r) => r.test(m.text()))) problems.push(`console: ${m.text().slice(0, 300)}`);
  });
  page.on('response', (r) => {
    if ((r.status() === 404 || r.status() === 400 || r.status() >= 500) && !expected.some((x) => x.test(r.url()))) problems.push(`${r.status()}: ${r.url().slice(0, 160)}`);
  });
});
test.afterEach(() => {
  // 일부러 낸 오류 응답은 브라우저도 콘솔에 'Failed to load resource'로 남긴다
  if (expected.length) problems = problems.filter((p) => !/^console: Failed to load resource: the server responded with a status of 400/.test(p));
  expect(problems, problems.join('\n')).toEqual([]);
});

/** 지도가 실제로 경계를 그렸는지 (그려진 칸 수 > 0) */
async function expectMapDrawn(page: Page) {
  await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
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

async function signIn(page: Page, email: string) {
  await page.goto('/');
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate((e) => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn(e), email);
}

async function pickPlace(page: Page, q: string, label: string) {
  await page.getByLabel('어디 검색').fill(q);
  await page.getByRole('option', { name: new RegExp(label) }).first().click();
}

test.describe.serial('보라핀 1단계', () => {
  test('로그인 화면', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('login')).toBeVisible();
    await shot(page, '01-login');
  });

  test('주인 계정으로 들어오면 빈 홈', async ({ page }) => {
    await signIn(page, OWNER);
    await expect(page.getByTestId('headline')).toHaveText('첫 핀을 꽂아 볼까요?');
    await expectMapDrawn(page);
    await shot(page, '02-home-empty');
  });

  test('기록이 없으면 빈 상태 카드가 지도 바로 아래(물어보기 다음)에, 묶음은 그 뒤에', async ({ page }) => {
    await signIn(page, OWNER);
    await expectMapDrawn(page);
    const empty = page.getByTestId('home-empty');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText('아직 기록이 없어요');
    // 안내 글은 실제 흐름대로: 지역을 누르면 '핀 꽂기 단추'가 나온다 (바로 꽂히지 않는다)
    await expect(empty).toContainText('핀 꽂기 단추가 나와요');
    await expect(page.getByTestId('map-hint')).toContainText('지역을 누르면 핀 꽂기 단추가 나와요');
    await expect(page.getByTestId('map-hint')).not.toContainText('⛶');
    const map = (await page.locator('.map-card').boundingBox())!;
    const ask = (await page.getByTestId('home-ask').boundingBox())!;
    const card = (await empty.boundingBox())!;
    const hub = (await page.getByTestId('next-hub').boundingBox())!;
    expect(card.y).toBeGreaterThan(map.y + map.height);
    expect(card.y).toBeGreaterThan(ask.y + ask.height);
    expect(card.y + card.height).toBeLessThanOrEqual(hub.y + 1);
    // 기록이 없을 땐 '최근에 남긴 기록' 빈 칸을 또 보여 주지 않는다
    await expect(page.getByRole('heading', { name: '최근에 남긴 기록' })).toHaveCount(0);
    // 홈 위 돋보기는 없다 (입력칸과 떠 있는 보라가 물어보기 입구)
    await expect(page.locator('.topbar').getByRole('link', { name: '물어보기' })).toHaveCount(0);
    await expect(page.getByTestId('home-ask').getByLabel('물어보기')).toBeVisible();
    await expect(page.getByTestId('home-more')).toHaveCount(0);
    // '다가오는 여행' 칸은 없고(묶음이 맡음), 가고 싶은 곳이 없으면 '여행지 뽑기'는 뽑기를 바로 연다
    await expect(page.getByText('다가오는 여행', { exact: true })).toHaveCount(0);
    const nextHub = page.getByTestId('next-hub');
    await expect(nextHub.getByRole('link', { name: '여행지 뽑기' })).toHaveAttribute('href', '/wishes?find=dice');
    // 해외 예정 여행이 없으면 오늘의 영어는 큰 카드 대신 한 줄 링크
    await expect(nextHub.getByTestId('hub-english')).toHaveCount(0);
    await expect(nextHub.getByTestId('hub-english-line')).toHaveAttribute('href', '/study');
    await nextHub.getByRole('link', { name: '여행지 뽑기' }).click();
    await expect(page.getByTestId('dice-roll')).toBeVisible();
  });

  test('피드는 둘의 소식만: 일반 소식 묶음이 없고, 비어 있으면 다음 단추가 있다', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/feed');
    await expect(page.getByTestId('feed')).toBeVisible();
    await expect(page.getByTestId('feed-empty')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('news-digest')).toHaveCount(0);
    await expect(page.getByTestId('feed-empty-wish')).toHaveAttribute('href', '/wishes');
    await page.getByTestId('feed-empty-record').click();
    await expect(page).toHaveURL(/\/record$/);
  });

  test('초대 링크: 관리자가 만들고 → 링크로 온 사람이 로그인하면 바로 들어온다 (한 번만)', async ({ page, browser }) => {
    await signIn(page, OWNER);
    await page.goto('/space');
    await page.getByLabel('초대 이름').fill('막내');
    await page.getByTestId('invite-make').click();
    await expect(page.getByRole('status')).toContainText('초대 링크를 만들었어요');
    const row = page.getByTestId('invite-row').first();
    await expect(row).toContainText('막내 초대');
    const url = (await row.getByTestId('invite-url').textContent())!.trim();
    expect(url).toMatch(/\/join\/[a-z0-9]{8,}$/);
    await shot(page, '02b-invite');

    // 새 사람: 링크를 열면 로그인 화면에 '초대 링크로 오셨네요', 로그인하면 들어가기 화면 → 들어가기
    const ctx = await browser.newContext({ locale: 'ko-KR' });
    const p2 = await ctx.newPage();
    await p2.goto(url);
    await expect(p2.getByTestId('login-invite')).toBeVisible();
    await p2.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
    await p2.evaluate(() => (window as unknown as { __testSignIn: (e: string) => Promise<void> }).__testSignIn('newbie@example.com'));
    await expect(p2.getByTestId('join')).toContainText('보라핀에 초대받았어요');
    await expect(p2.getByTestId('join')).toContainText('막내');
    await shot(p2, '02c-join');
    await p2.getByTestId('join-go').click();
    // 처음 들어오면 환영 3장면: 어서 와요 → 내 이름(바꾸면 공간 문서의 names에 내 칸만) → 우리 집 → 지도
    await expect(p2.getByTestId('welcome')).toBeVisible({ timeout: 20_000 });
    await expect(p2.getByTestId('welcome')).toContainText('어서 와요');
    await p2.getByTestId('welcome-next').click();
    await p2.getByLabel('내 이름').fill('막내둥이');
    await p2.getByTestId('welcome-name-next').click();
    await expect(p2.getByRole('status')).toContainText('막내둥이로 불려요');
    await p2.getByTestId('welcome-done').click();
    await expect(p2.getByTestId('headline')).toBeVisible({ timeout: 20_000 });
    await p2.goto('/space');
    await expect(p2.getByText('막내둥이', { exact: true })).toBeVisible();
    await ctx.close();
    // 관리자 화면에서 그 링크는 사라졌고(한 번 쓰면 끝), 막내가 함께 쓰는 사람에 있다
    await page.reload();
    await expect(page.getByTestId('invite-row')).toHaveCount(0);
    await expect(page.getByText('newbie@example.com')).toBeVisible();
    // 정리: 막내를 빼서 다음 시험들이 둘만 있는 공간을 보게
    await page.getByLabel('newbie@example.com 빼기').click();
    await page.getByRole('button', { name: '빼기', exact: true }).click();
    await expect(page.getByText('newbie@example.com')).toHaveCount(0);
  });

  test('초대 안 된 계정은 막고, 이름과 함께 추가하면 들어와 같은 공간을 본다', async ({ page }) => {
    await signIn(page, 'stranger@example.com');
    await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
    // 다음에 뭘 해야 하는지와 복사할 메일 주소가 보인다
    await expect(page.getByText(/우리 공간 → 함께 쓰는 사람 → 추가/)).toBeVisible();
    await expect(page.getByTestId('denied-mail')).toContainText('stranger@example.com');
    await shot(page, '10-denied');
    await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
    await signIn(page, OWNER);
    // 혼자일 때는 내 이름만 (박아 둔 '보라 & 영상'이 아니라)
    await page.goto('/space');
    await expect(page.getByTestId('space-title')).toHaveText('영상');
    await expect(page.getByTestId('avatars').first()).toHaveAttribute('aria-label', '영상');
    await page.getByLabel('추가할 계정').fill('bora@example.com');
    await page.getByRole('textbox', { name: '부를 이름' }).fill('보라');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
    await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
    await shot(page, '11-space');
    await page.getByRole('button', { name: '로그아웃' }).click();
    // 보라로 들어와도 같은 공간
    await signIn(page, 'bora@example.com');
    await expect(page.getByTestId('headline')).toBeVisible();
    await page.goto('/space');
    await expect(page.getByTestId('space-title')).toHaveText('보라 & 영상');
  });

  test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
    await signIn(page, OWNER);
    await page.getByRole('button', { name: '남기기', exact: true }).click();
    await page.getByRole('menuitem', { name: /다녀온 곳 남기기/ }).click();
    await pickPlace(page, 'ㄱㄹ', '강릉시');
    await page.getByRole('button', { name: '몇 년', exact: true }).click();
    await page.getByLabel('연도').selectOption('2024');
    await page.getByPlaceholder('함께 간 사람 이름 (엄마, 동생…)').fill('엄마');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await shot(page, '03-record');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('강릉시 여행');
    await expect(page.getByText('2024년쯤')).toBeVisible();
    await expectMapDrawn(page);
    await shot(page, '04-detail');
  });

  test('해외 여행 기록 (도시, 계절만)', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/record');
    await pickPlace(page, '일본', '일본');
    await page.getByPlaceholder(/도시/).fill('교토');
    await page.getByRole('button', { name: '도시 넣기' }).click();
    await page.getByRole('button', { name: '계절', exact: true }).click();
    await page.getByLabel('연도').selectOption('2025');
    await page.getByRole('button', { name: '가을' }).click();
    await page.getByLabel('제목').fill('교토 단풍 여행');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText(/교토|일본/);
  });

  test('여행 목록과 필터', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await expect(page.getByTestId('trip-row')).toHaveCount(2);
    await page.getByRole('button', { name: /^해외/ }).click();
    await expect(page.getByTestId('trip-row')).toHaveCount(1);
    await page.getByRole('button', { name: /^전체/ }).click();
    await shot(page, '05-trips');
  });

  test('홈 통계와 지도', async ({ page }) => {
    await signIn(page, OWNER);
    // 횟수는 우리말로 (times): '2번'이 아니라 '두 번'
    await expect(page.getByTestId('headline')).toContainText('두 번의 여행,핀 2개 꽂았어요');
    await expectMapDrawn(page);
    await shot(page, '06-home');
    await page.goto('/map');
    await expect(page.getByTestId('map-stats')).toContainText('시·군 1/160');
    await expect(page.getByTestId('map-stats')).toContainText('광역 1/16');
    await expectMapDrawn(page);
    await page.waitForTimeout(800);
    await shot(page, '07-map');
    await page.getByRole('tab', { name: '세계' }).click();
    await expect(page.getByTestId('map-stats')).toContainText('나라 1');
    await page.waitForTimeout(1200);
    await expectMapDrawn(page);
    await shot(page, '08-map-world');
  });

  test('지도에서 지역을 눌러 바로 핀 꽂기, 되돌리기, 확대하면 이름', async ({ page }) => {
    await signIn(page, OWNER);
    await expectMapDrawn(page);
    // 부산을 누른다
    await tapLngLat(page, 129.06, 35.2);
    const sheet = page.getByTestId('region-sheet');
    await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
    await expect(sheet).toContainText('아직 안 가본 곳');
    // 여행정보: 볼거리·먹거리, 더보기로 구·군
    const info = sheet.getByTestId('region-info');
    await expect(info).toContainText('볼거리');
    await info.getByRole('button', { name: /더보기/ }).click();
    await expect(info).toContainText('해운대구');
    await shot(page, '09a-region-info');
    await info.getByRole('button', { name: '접기' }).click();
    await sheet.getByTestId('quick-pin').click();
    await expect(page.getByRole('status')).toContainText('부산에 핀을 꽂았어요');
    await expect(sheet).toContainText('다녀왔어요');
    await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
    // 되돌리기
    await page.getByRole('button', { name: '되돌리기' }).click();
    await expect(sheet).toContainText('아직 안 가본 곳');
    await expect(sheet.getByTestId('trip-row')).toHaveCount(0);
    // 다시 꽂아 둔다
    await sheet.getByTestId('quick-pin').click();
    await expect(sheet.getByTestId('trip-row')).toHaveCount(1);
    await expect(page.getByTestId('headline')).toContainText('세 번의 여행,핀 3개 꽂았어요');
    await shot(page, '09-sheet');
    await sheet.getByRole('button', { name: '닫기' }).click();
    await expect(sheet).toHaveCount(0);

    // 확대하면 시·군 이름이 보이고, 다녀온 곳은 진하게
    await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [128.95, 35.25], zoom: 7.6 }));
    // 이름표는 숨길 때 지우지 않고 display:none으로 두므로(끌 때 같이 움직이게), 보이는 것만 고른다
    const busan = page.locator('.map-label:visible', { hasText: /^부산$/ });
    await expect(busan).toBeVisible();
    await expect(busan).toHaveClass(/\bon\b/);
    await expect(page.locator('.map-label:visible', { hasText: /^김해시$/ })).toBeVisible();
    await page.getByTestId('map').first().scrollIntoViewIfNeeded();
    await shot(page, '09b-labels-cells');

    // 큰 지도: 중간 확대에서는 도 이름
    await page.goto('/map');
    await expectMapDrawn(page);
    await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [127.9, 36.3], zoom: 6.1 }));
    await expect(page.locator('.map-label.province', { hasText: '강원' })).toHaveClass(/\bon\b/);
    await expect(page.locator('.map-label.province', { hasText: '경남' })).toBeVisible();
    await expect(page.locator('.map-label.province', { hasText: '경남' })).not.toHaveClass(/\bon\b/);
    await shot(page, '09c-labels-provinces');

    // 세계: 나라 이름, 다녀온 일본은 진하게
    await page.getByRole('tab', { name: '세계' }).click();
    await page.waitForTimeout(900);
    await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [131, 35], zoom: 3.4 }));
    await expect(page.locator('.map-label.country', { hasText: /^일본$/ })).toHaveClass(/\bon\b/);
    await expect(page.locator('.map-label.country', { hasText: /^한국$/ })).toHaveClass(/\bon\b/);
    await shot(page, '09d-labels-world');

    // 우리 공간에는 더 이상 가져오기 버튼이 없다
    await page.goto('/space');
    await expect(page.getByText('백업 파일 내려받기')).toBeVisible();
    await expect(page.getByText(/가져오기/)).toHaveCount(0);
  });

  test('가고 싶은 곳: 지도에서 담기, 고치기, 여행 만들기, 깃발, 뽑기', async ({ page }) => {
    await signIn(page, OWNER);
    // 비어 있으면 홈에 이번 달 추천 3곳
    const homeWishes = page.getByTestId('home-wishes');
    await expect(homeWishes).toContainText('가고 싶은 곳 3곳만 담아볼까요?');
    await expect(homeWishes.getByRole('button', { name: '담기' })).toHaveCount(3);
    await expectMapDrawn(page);
    // 추천지 이름을 누르면 지도의 지역 창이 열려 자세히 보고 바로 기록할 수 있다
    const firstPick = homeWishes.getByTestId('pick-detail').first();
    const pickName = (await firstPick.getAttribute('aria-label'))!.replace(' 자세히 보기', '');
    await firstPick.click();
    await expect(page).toHaveURL(/\/map\?sel=/);
    // 창 제목은 '전북 순창'처럼 시·군을 뗀 이름: 앞 두 글자(지역 이름 첫머리)로 맞춰 본다
    await expect(page.getByTestId('region-sheet').getByTestId('sheet-title')).toContainText(pickName.split(' ').pop()!.slice(0, 2));
    await expect(page.getByTestId('region-sheet').getByRole('link', { name: '자세히 기록' })).toBeVisible();
    // 오늘의 추천 사진 카드에도 자세히·기록하기
    await page.goto('/');
    await expect(page.getByTestId('month-pick-detail')).toBeVisible();
    await expect(page.getByTestId('month-pick-record')).toHaveAttribute('href', /\/record\?place=kr:\d+/);
    await expectMapDrawn(page);

    // 지도에서 제주를 눌러 하트로 담기 → 알림의 '메모 쓰기'
    await tapLngLat(page, 126.55, 33.38);
    const sheet = page.getByTestId('region-sheet');
    await expect(sheet.getByTestId('sheet-title')).toHaveText('제주');
    await sheet.getByTestId('sheet-wish').click();
    await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
    await page.getByRole('button', { name: '메모 쓰기' }).click();
    await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);

    // 고치기: 둘 다 원해요, 1순위, 볼거리
    await expect(page.getByRole('button', { name: /제주 빼기/ })).toBeVisible();
    await page.getByRole('button', { name: '보라', exact: true }).click();
    await expect(page.getByText('둘 다 원해요')).toBeVisible();
    await page.getByRole('button', { name: '1순위' }).click();
    await page.getByLabel('볼거리').fill('성산일출봉\n우도');
    await page.getByTestId('wish-save').click();
    // 저장하면 들어왔던 화면(홈)으로 돌아간다
    await expect(page.getByRole('status')).toContainText('고쳤어요');
    await expect(page).toHaveURL(/:5174\/$/);
    await page.goto('/wishes');
    const card = page.getByTestId('wish-card').filter({ hasText: '제주' });
    await expect(card).toContainText('둘 다 원해요');
    await expect(card).toContainText('볼거리 성산일출봉 외 1');
    await expect(card.getByLabel('1순위')).toBeVisible();
    await shot(page, '10-wishes');

    // 여행 만들기 → 계획하기의 빠른 길(목적지는 정해짐, 언제만 고르기) → 예정된 여행, 카드는 '예정'
    await card.getByTestId('wish-plan').click();
    await expect(page).toHaveURL(/\/plan\?wish=/);
    await expect(page.getByTestId('planner-dest')).toContainText('제주');
    // 날짜는 아직 몰라요: 홈 위 단계 카드가 아니라 '다음 여행 준비' 묶음이 이 여행을 맡는다
    await page.getByRole('button', { name: '아직 몰라요' }).click();
    await page.getByTestId('planner-make').click();
    await expect(page.getByTestId('trip-title')).toHaveText('제주 여행');
    await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=plan$/);
    await page.goto('/wishes');
    await expect(page.getByTestId('wish-card').filter({ hasText: '제주' })).toContainText('예정');

    // 지도에 깃발
    await page.goto('/map');
    await expectMapDrawn(page);
    await expect(page.getByTestId('wish-flag')).toHaveCount(1);
    // 깃발이 실제로 제주 위에 그려졌는지 (위치 확인)
    const jeju = await page.evaluate(() => {
      const w = window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } };
      return w.__map.project([126.55, 33.38]);
    });
    const mapBox = (await page.getByTestId('map').first().boundingBox())!;
    const flagBox = (await page.getByTestId('wish-flag').boundingBox())!;
    expect(Math.abs(flagBox.x + flagBox.width / 2 - (mapBox.x + jeju.x))).toBeLessThan(40);
    expect(Math.abs(flagBox.y + flagBox.height - (mapBox.y + jeju.y))).toBeLessThan(40);
    await shot(page, '10b-map-flags');

    // 여행지 뽑기: 강원 · 바다 → 담기
    await page.goto('/wishes');
    await page.getByTestId('dice-open').click();
    await page.getByLabel('뽑을 범위').selectOption('gangwon');
    await page.getByRole('button', { name: '바다', exact: true }).click();
    await page.getByTestId('dice-roll').click();
    await expect(page.getByTestId('dice-add')).toBeVisible();
    await expect(page.getByTestId('dice-face')).toContainText('강원');
    await shot(page, '10c-dice');
    await page.getByTestId('dice-add').click();
    await expect(page.getByTestId('wish-card')).toHaveCount(2);
    // 한 명만 원하는 곳은 한 줄로, 오른쪽 하트로 바로 뺐다 넣었다 (목록에서 마음 맞추기)
    const gw = page.getByTestId('wish-card').filter({ hasText: '강원' });
    await expect(gw.getByTestId('wish-heart')).toHaveAttribute('aria-pressed', 'true');
    await gw.getByTestId('wish-heart').click();
    await expect(page.getByRole('status')).toContainText('내 하트를 뺐어요');
    await expect(gw.getByTestId('wish-heart')).toHaveAttribute('aria-pressed', 'false');
    await gw.getByTestId('wish-heart').click();
    await expect(gw.getByTestId('wish-heart')).toHaveAttribute('aria-pressed', 'true');
    // 둘 다 원하는 곳(제주, 예정)과 한 명만(강원)이 묶음으로 나뉜다
    await expect(page.getByTestId('wish-group-예정')).toContainText('제주');
    await expect(page.getByTestId('wish-group-한 명만 원해요')).toContainText('강원');
    await shot(page, '10c2-wishes-groups');

    // 해외 도시 고르기: 속성을 조합한다 (예산 가볍게 + 4시간 안 + 미식) → 목록이 줄고 → 담기
    await page.getByLabel('뽑을 범위').selectOption('world');
    const wp = page.getByTestId('world-picker');
    await expect(wp).toBeVisible();
    await wp.getByLabel('떠날 달').selectOption('1');
    const before = Number((await wp.getByTestId('world-count').textContent())!.match(/\d+/)![0]);
    await wp.getByRole('button', { name: '가볍게' }).click();
    await wp.getByRole('button', { name: '4시간 안' }).click();
    await wp.getByRole('button', { name: '미식', exact: true }).click();
    const after = Number((await wp.getByTestId('world-count').textContent())!.match(/\d+/)![0]);
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
    const rows = wp.getByTestId('world-city');
    await expect(rows.first()).toContainText('물가 가벼움');
    await expect(rows.first()).toContainText('인천에서');
    await shot(page, '10e-world-picker');
    const cityName = (await rows.first().locator('.t').textContent())!.trim().split(' ')[0];
    await rows.first().getByTestId('world-add').click();
    await expect(page.getByRole('status')).toContainText(`가고 싶은 곳에 담았어요`);
    await expect(page.getByTestId('wish-card')).toHaveCount(3);
    // 해외 도시 카드엔 도시 정보: 통화·입국·먹을 것, 눌러서 메모에 넣기
    await page.getByTestId('wish-card').filter({ hasText: cityName }).locator('.wish-main').click();
    await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
    const info = page.getByTestId('city-info');
    await expect(info).toBeVisible();
    await expect(info).toContainText('입국');
    await expect(info).toContainText('떠나기 전 확인');
    const firstEat = info.getByRole('button', { name: /메모에 넣기$/ }).first();
    const eatText = (await firstEat.getAttribute('aria-label'))!.replace(' 메모에 넣기', '');
    await firstEat.click();
    await expect(page.getByLabel('먹거리')).toHaveValue(new RegExp(eatText));
    await shot(page, '10f-city-info');
    await page.getByTestId('wish-save').click();
    await expect(page.getByRole('status')).toContainText('고쳤어요');
    // 현지어 한마디: 30문장, 묶음으로 거르기, 영어권은 오늘의 영어로
    await page.goto('/phrases/ja?city=교토');
    await expect(page.getByTestId('phrase-row')).toHaveCount(30);
    await expect(page.getByTestId('phrases')).toContainText('교토에서');
    await page.getByRole('tab', { name: '급할 때' }).click();
    await expect(page.getByTestId('phrase-row')).toHaveCount(4);
    await expect(page.getByTestId('phrase-row').first()).toContainText('도와주세요');
    await shot(page, '10g-phrases');
    await page.goto('/phrases/tr');
    await expect(page.getByTestId('phrases')).toContainText('아직 없어요');

    // 홈 '다음 여행 준비'는 예정된 제주 여행을 맡고, 여행 탭에도 보인다
    await page.goto('/');
    await expect(page.getByTestId('next-hub')).toHaveAttribute('data-anchor', 'trip');
    await expect(page.getByTestId('hub-first')).toContainText('제주 여행');
    await page.goto('/trips');
    await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  });

  test('홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다', async ({ page, browser }) => {
    await signIn(page, OWNER);
    const hub = page.getByTestId('next-hub');
    await expect(hub).toBeVisible();
    // 1. 다음은 어디: 예정된 제주 여행이 맨 위, 그다음은 가고 싶은 곳(강원)
    await expect(hub.getByTestId('hub-first')).toContainText('제주 여행');
    await expect(hub.locator('.hub-others')).toContainText('강원');
    // 2. 오늘의 한 질문: 제주 이야기. 내가 답하면 상대 답은 잠겨 있다
    const ask = hub.getByTestId('hub-ask');
    await expect(ask).toContainText('제주');
    await ask.getByLabel('오늘의 질문 답').fill('흑돼지랑 고기국수');
    await ask.getByTestId('hub-ask-send').click();
    await expect(page.getByRole('status')).toContainText('답을 남겼어요');
    await expect(ask.locator('.hub-answer.mine')).toContainText('흑돼지랑 고기국수');
    await expect(ask.getByTestId('hub-ask-waiting')).toBeVisible();
    await expect(ask.getByTestId('hub-answer-other')).toHaveCount(0);
    await shot(page, '10d-home-hub');
    // 보라가 들어와 같은 질문을 보고 답하면 → 서로의 답이 열린다 (내 화면은 새로 고침 없이)
    const bora = await browser.newPage();
    await signIn(bora, 'bora@example.com');
    const bAsk = bora.getByTestId('hub-ask');
    await expect(bAsk).toContainText('제주');
    await expect(bAsk.getByTestId('hub-answer-other')).toHaveCount(0);
    await bAsk.getByLabel('오늘의 질문 답').fill('한라산 보이는 카페');
    await bAsk.getByTestId('hub-ask-send').click();
    await expect(bAsk.getByTestId('hub-answer-other')).toContainText('흑돼지랑 고기국수');
    await expect(bAsk.getByTestId('hub-answer-other')).toContainText('영상');
    await bora.close();
    await expect(ask.getByTestId('hub-answer-other')).toContainText('한라산 보이는 카페');
    await expect(ask.getByTestId('hub-answer-other')).toContainText('보라');
    await expect(ask.getByTestId('hub-ask-waiting')).toHaveCount(0);
    // 상대의 답은 새 소식: 아래 메뉴에 점, 피드에 '오늘의 질문에 답함'
    await expect.poll(async () => page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen)), { timeout: 15_000, message: '점 계산 자료에 질문 답' }).toContain('"kind":"ask"');
    await expect(page.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('nav-feed').click();
    const askItem = page.locator('[data-testid="feed-item"][data-kind="ask"]').first();
    await expect(askItem).toContainText('한라산 보이는 카페');
    await expect(page.getByTestId('feed-dot')).toHaveCount(0);
    await page.goto('/');
    // 먹을 것·가볼 곳 질문이면 답을 가고 싶은 곳 메모에 넣을 수 있다 (오늘 질문이 그런 종류일 때)
    const save = ask.locator('.hub-answer.mine').getByRole('button', { name: '메모에 넣기' });
    if (await save.count()) {
      await save.click();
      await expect(page.getByRole('status')).toContainText('메모에 넣었어요');
      await page.getByRole('status').getByRole('button', { name: '보기' }).click();
      await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
      await expect.poll(() => page.locator('textarea').evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value).join('\n')), { timeout: 15_000 }).toContain('흑돼지랑 고기국수');
      await page.goto('/');
    }
    // 3. 오늘의 영어: 다음 예정 여행(제주)이 국내라 큰 카드 대신 묶음 맨 아래 한 줄 링크
    await expect(hub.getByTestId('hub-english')).toHaveCount(0);
    const en = hub.getByTestId('hub-english-line');
    await expect(en).toContainText('오늘의 영어');
    await expect(en).toContainText(/\d문장 · 90초/);
    // 한 줄 링크는 묶음의 맨 아래 (가는 길 뒤)
    expect((await en.boundingBox())!.y).toBeGreaterThan((await hub.getByTestId('hub-way').boundingBox())!.y);
    // 4. 가는 길: 같은 곳(제주)의 가기 좋은 때
    const way = hub.getByTestId('hub-way');
    await expect(way).toContainText('제주');
    await expect(way).toContainText('가기 좋은 때');
    // 바깥 링크(항공권·뉴스)는 국내 여행지엔 없다
    await expect(way.locator('a[target="_blank"]')).toHaveCount(0);
    // 우리 집을 안 정했으면 정하러 가는 안내만
    await expect(way.getByTestId('home-route-empty')).toBeVisible();
    await en.click();
    await expect(page).toHaveURL(/\/study$/);
  });

  test('여행 계획하기: + → 조건만 고르면 후보 3곳 → 둘이 하트 → 여기로 정해요 → 갈 예정 여행과 하루 뼈대', async ({ page, browser }) => {
    await signIn(page, OWNER);
    await expect(page.getByTestId('headline')).toBeVisible();
    await page.getByRole('button', { name: '남기기', exact: true }).click();
    await expect(page.getByTestId('plus-sheet')).toBeVisible();
    await page.getByRole('menuitem', { name: /여행 계획하기/ }).click();
    await expect(page).toHaveURL(/\/plan$/);
    await page.getByRole('button', { name: '다음 주말' }).click();
    await page.getByRole('button', { name: '1박 2일' }).click();
    await page.getByRole('button', { name: '국내', exact: true }).click();
    await shot(page, '10h-planner');
    await page.getByTestId('planner-go').click();
    await expect(page).toHaveURL(/\/plan\/[A-Za-z0-9]+$/);
    const cands = page.getByTestId('plan-cand');
    await expect(cands).toHaveCount(3);
    const url = page.url();
    // 나만 하트 → 상대를 기다린다
    await cands.first().getByTestId('plan-heart').click();
    await expect(cands.first().getByTestId('plan-heart')).toHaveAttribute('aria-pressed', 'true');
    await expect(cands.first()).toContainText('상대가 고르길 기다려요');
    await expect(cands.first().getByTestId('plan-decide')).toHaveCount(0);
    await shot(page, '10i-plan-pick');
    const name = (await cands.first().locator('.plan-cand-name').textContent())!.trim();
    // 보라가 같은 링크로 와서 같은 곳에 하트 → 여기로 정해요
    const bora = await browser.newPage();
    await signIn(bora, 'bora@example.com');
    await bora.goto(url);
    const bc = bora.getByTestId('plan-cand').filter({ hasText: name });
    await expect(bc).toContainText('영상');
    await bc.getByTestId('plan-heart').click();
    await expect(bc.getByTestId('plan-decide')).toBeVisible();
    await bora.close();
    // 내 화면에도 바로 '여기로 정해요'가 뜬다
    await expect(cands.first().getByTestId('plan-decide')).toBeVisible({ timeout: 15_000 });
    await cands.first().getByTestId('plan-decide').click();
    await expect(page.getByRole('status')).toContainText('하루 뼈대를 깔아 두었어요');
    await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=plan$/);
    const plan = page.getByTestId('plan-tab');
    await expect(plan.getByTestId('plan-item').first()).toBeVisible();
    expect(await plan.getByTestId('plan-item').count()).toBeGreaterThanOrEqual(4);
    await expect(plan).toContainText('1일째');
    await expect(plan).toContainText('2일째');
    await shot(page, '10j-plan-skeleton');
    // 정한 뒤 계획 화면은 '정했어요'
    await page.goto(url);
    await expect(page.getByTestId('plan-decided')).toBeVisible();
  });

  test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
    await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
    await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
    await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
    await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
    await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
    // 가리고 쓰기: 켜면 내 것을 쓰기 전엔 보라 칸이 가려지고, 쓰면 열린다 (끄면 그냥 보인다)
    await page.getByTestId('blind-toggle').click();
    await expect(page.getByTestId('review-hidden')).toBeVisible();
    await expect(page.getByLabel('보라 한 줄 평')).toHaveCount(0);
    await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
    await expect(page.getByLabel('보라 한 줄 평')).toBeVisible();
    await page.getByTestId('blind-toggle').click();
    await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
    await page.getByRole('button', { name: '또 갈래요' }).click();
    await shot(page, '11-place-edit');
    await page.getByTestId('place-save').click();
    // 개요엔 들른 곳 요약 한 줄만, 평가·한 줄 평은 '들른 곳' 탭에
    const tp = page.getByTestId('trip-places');
    await expect(tp).toContainText('우리 장소 1곳');
    await expect(tp).toContainText('초당할머니순두부');
    await tp.getByTestId('places-summary').click();
    await expect(page.getByRole('tab', { name: '들른 곳' })).toHaveAttribute('aria-selected', 'true');
    const visited = page.getByTestId('trip-visited');
    await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
    await expect(visited).toContainText('또 갈래요');
    await expect(visited).toContainText('순두부 젤라또까지 완벽');

    // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
    await page.goto('/');
    await expectMapDrawn(page);
    await tapLngLat(page, 128.86, 37.73);
    const sheet = page.getByTestId('region-sheet');
    await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
    await expect(sheet).toContainText('우리 장소 · 1');
    await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');

    // 우리 장소 목록과 '또 갈래요' 거르기
    await page.goto('/places');
    await page.getByRole('button', { name: '또 갈래요' }).click();
    await expect(page.getByTestId('place-rec')).toHaveCount(1);
    await shot(page, '11b-places');

    // 장소를 열면 '보기' 화면: 이름·지도 앱·자리 그림·한 줄 평, 고치기를 누르면 고치는 칸
    await page.getByTestId('place-rec').click();
    await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: '지도 앱으로 열기' }).getByRole('link')).toHaveCount(3);
    await expect(page.getByTestId('spot-map')).toBeVisible();
    await expect(page.getByText('아침으로 최고')).toBeVisible();
    await shot(page, '11c-place-view');
    await page.getByTestId('place-edit').click();
    await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
    await page.getByLabel('장소 메모').fill('줄 30분');
    await page.getByTestId('place-save').click();
    await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
    await expect(page.getByText('줄 30분')).toBeVisible();
  });

  test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    await page.getByRole('tab', { name: /사진/ }).click();
    const sec = page.getByTestId('trip-photos');
    await sec.getByTestId('photo-input').setInputFiles([
      'tests/fixtures/photo-gangneung.jpg',
      'tests/fixtures/photo-gangneung2.jpg',
      'tests/fixtures/photo-noexif.jpg',
    ]);
    await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
    await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
    // 촬영일(2019.5.3~4)로 날짜 채우기
    const sug = page.getByTestId('photo-suggest');
    await expect(sug).toContainText('2019.5.3–4');
    await sug.getByRole('button', { name: '채우기' }).click();
    await expect(page.getByText(/^2019\.5\.3–4( · 1박 2일)?$/).first()).toBeVisible();
    await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
    await shot(page, '12-photos');
    // 표지 사진은 개요 탭 위에
    await page.getByRole('tab', { name: '개요' }).click();
    await expect(page.locator('.trip-cover img')).toBeVisible();
    await page.getByRole('tab', { name: /사진/ }).click();
    // 슬라이드쇼: 자막에 촬영 시각과 장소
    await sec.locator('.photo-cell img').first().click();
    const cap = page.locator('.pswp__caption-bp');
    await expect(cap).toContainText('2019.5.3 14:20');
    await expect(cap).toContainText('강원 강릉시');
    await page.waitForTimeout(600);
    await shot(page, '12b-slideshow');
    await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
    await page.keyboard.press('Escape');
    // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
    await page.goto('/memories');
    await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
    // 새로 열면 사진 파일을 DB에서 받아 그린다
    await page.getByTestId('album').scrollIntoViewIfNeeded();
    const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
    await expect(albumImgs).toHaveCount(3);
    expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
    await expect(page.getByTestId('replay-year')).toBeVisible();
    await page.getByLabel('다시 보기 연도').fill('0');
    const firstYear = await page.getByTestId('replay-year').textContent();
    await page.getByTestId('replay-play').click();
    await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
    await page.getByLabel('결산 연도').selectOption('2019');
    await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
    await expect(page.getByTestId('year-review')).toContainText('2');
    await expect(page.getByTestId('heatmap')).toBeVisible();
    await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
    await shot(page, '12c-memories');
  });

  test('여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
    await signIn(page, OWNER);
    // 홈 단계 카드: 다음 주말 여행(계획하기로 만든 것). 단추는 말한 탭(준비)으로, 카드는 개요로
    await expect(page.getByTestId('headline')).toBeVisible();
    const stage = page.getByTestId('stage-card');
    await expect(stage).toHaveAttribute('data-stage', 'before');
    await expect(stage.getByTestId('stage-action')).toHaveText('준비물 보기');
    await expect(stage.getByTestId('stage-action')).toHaveAttribute('href', /^\/trips\/[^/?]+\?tab=prep$/);
    // 접힌 둘러보기 칸 제목엔 '추억'이 없다 (추억 카드는 있으면 접힌 칸 안에)
    await expect(page.getByTestId('home-more').locator('summary')).toHaveText('이달의 추천 · 가고 싶은 곳');
    await stage.getByTestId('stage-action').click();
    await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=prep$/);
    await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
    // 예정 여행의 탭은 개요·일정·준비·사진 (글은 개요 아래)
    const tabs = page.getByTestId('trip-tabs').getByRole('tab');
    await expect(tabs).toHaveText(['개요', '일정', '준비', /^사진/]);
    // 주소로 없는 탭(글)을 열면 개요로, 개요 아래에 글 쓰는 칸
    await page.goto(page.url().replace(/\?tab=prep$/, '?tab=notes'));
    await expect(page.getByRole('tab', { name: '개요' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('trip-notes').getByTestId('notes-tab')).toBeVisible();

    // 일정 ① 적기(한글 Enter·추가 단추) ② 날짜 ③ 시간
    await page.getByRole('tab', { name: '일정' }).click();
    const plan = page.getByTestId('plan-tab');
    // 이미 있던 일정이 다 그려진 뒤에 센다 (구독이 늦게 와서 0개로 세는 일이 없게: 개수가 1초 동안 그대로일 때)
    await expect(plan.getByLabel('가볼 곳 추가')).toBeVisible();
    let n0 = -1;
    for (let k = 0, same = 0; k < 40 && same < 4; k++) {
      const c = await plan.getByTestId('plan-item').count();
      same = c === n0 ? same + 1 : 0;
      n0 = c;
      await page.waitForTimeout(250);
    }
    await plan.getByLabel('가볼 곳 추가').fill('시장 구경');
    await plan.getByLabel('가볼 곳 추가').press('Enter');
    await plan.getByLabel('가볼 곳 추가').fill('저녁 산책');
    await plan.getByRole('button', { name: '추가', exact: true }).click();
    await expect(plan.getByTestId('plan-item')).toHaveCount(n0 + 2);
    // 예정 여행의 일정엔 '또 갈래요' 하트가 없고 체크만
    await expect(plan.getByTestId('plan-again')).toHaveCount(0);
    await plan.locator('.plan-name', { hasText: '시장 구경' }).click();
    await plan.getByLabel('날짜').selectOption({ index: 2 });
    await expect(plan.getByLabel('날짜')).not.toHaveValue('');
    await plan.getByLabel('시간').selectOption('18:30');
    await expect(plan).toContainText('2일째');
    await expect(plan.getByTestId('plan-item').filter({ hasText: '시장 구경' })).toContainText('18:30');
    await shot(page, '13-plan');

    // 다녀온 강릉 여행: 개요·들른 곳·사진·글, 탭 글은 375px에서도 한 줄
    const vp = page.viewportSize()!;
    await page.setViewportSize({ width: 375, height: 760 });
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    await expect(tabs).toHaveText(['개요', '들른 곳', /^사진/, /^글/]);
    await expect(page.getByRole('tab', { name: '준비' })).toHaveCount(0);
    const boxes = await tabs.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { y: r.y, h: r.height, wrap: getComputedStyle(e).whiteSpace, over: e.scrollWidth > e.clientWidth + 1 }; }));
    for (const b of boxes) {
      expect(b.y).toBe(boxes[0].y);
      expect(b.wrap).toBe('nowrap');
      expect(b.over).toBe(false);
    }
    // 개요엔 '장소' 목록 구역이 없고(요약 한 줄), 옛 개발자 글도 없다
    await expect(page.getByRole('heading', { name: '장소', exact: true })).toHaveCount(0);
    await expect(page.getByText('v22에서 가져옴')).toHaveCount(0);
    // 들른 곳 = 우리 장소 기록(평가·한 줄 평). 일정 줄의 '또 갈래요' 하트·적는 칸은 없다
    await page.getByRole('tab', { name: '들른 곳' }).click();
    const visited = page.getByTestId('trip-visited');
    await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
    await expect(page.getByTestId('plan-tab')).toHaveCount(0);
    await expect(page.getByTestId('plan-again')).toHaveCount(0);
    await expect(page.getByLabel('들른 곳 추가')).toHaveCount(0);
    await shot(page, '13a-visited');
    await page.setViewportSize(vp);

    // 기록: 쓴 사람이 보인다
    await page.getByRole('tab', { name: /글/ }).click();
    const notes = page.getByTestId('notes-tab');
    await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
    await notes.getByRole('button', { name: '남기기' }).click();
    await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
    await expect(notes.getByTestId('note')).toContainText('영상');
    await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();

    // 준비물: 예정된 제주 여행
    await page.goto('/trips');
    await page.getByText('제주 여행', { exact: true }).click();
    // 개요엔 준비 요약 한 줄 → 누르면 '준비' 탭 (준비물·가는 길·현지어가 한곳에)
    await page.getByTestId('packing-summary').click();
    await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('prep-way')).toContainText('제주공항');
    const pack = page.getByTestId('packing');
    await pack.getByRole('button', { name: '휴양' }).click();
    await expect(pack).toContainText('수영복');
    await pack.getByLabel('수영복 챙김').check();
    await expect(pack).toContainText(/1\/\d+ 챙김/);
    await pack.getByLabel('선크림 담당자').click();
    await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
    await shot(page, '13b-packing');
  });

  test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
    await signIn(page, OWNER);
    const box = page.getByTestId('home-ask').getByLabel('물어보기');
    await box.fill('강릉 맛집');
    await box.press('Enter');
    await expect(page).toHaveURL(/\/ask/);
    const answers = page.getByTestId('answer');
    await expect(answers.last()).toContainText('초당 순두부');
    await expect(answers.last()).toContainText('초당할머니순두부');
    const input = page.getByLabel('질문');
    await input.fill('거기 언제 가면 좋아?');
    await input.press('Enter');
    await expect(answers.last()).toContainText('강원 강릉시는');
    await input.fill('강릉 몇 번 갔지?');
    await input.press('Enter');
    await expect(answers.last()).toContainText('한 번 다녀왔어요');
    await input.fill('고성 맛집');
    await input.press('Enter');
    await expect(answers.last()).toContainText('여러 곳');
    await answers.last().getByRole('button', { name: '강원 고성군' }).click();
    await expect(answers.last()).toContainText('강원 고성군');
    await shot(page, '14-ask');
    await page.getByRole('button', { name: '처음으로' }).click();
    await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
    await expect(answers.last()).toContainText('시·군');
  });

  test('피드: 둘이 남긴 사진·글·장소·핀이 시간순으로, 다른 사람 소식엔 아래 메뉴에 점', async ({ page, browser }) => {
    await signIn(page, OWNER);
    await page.getByTestId('nav-feed').click();
    await expect(page).toHaveURL(/\/feed$/);
    const items = page.getByTestId('feed-item');
    await expect(items.first()).toBeVisible({ timeout: 15_000 });
    // 앞 시험들이 남긴 것들이 다 보인다: 사진 묶음, 글, 우리 장소, 핀
    await expect(page.locator('[data-testid="feed-item"][data-kind="photos"]').first()).toContainText('사진');
    await expect(page.locator('[data-testid="feed-item"][data-kind="note"]').first()).toContainText('바다 보며 커피 마신 날');
    // 짧은 글은 배경 위에 크게 (강릉 사진이 있으니 사진 배경)
    const quote = page.locator('[data-testid="feed-item"][data-kind="note"]').first().getByTestId('feed-quote-card');
    await expect(quote).toBeVisible();
    await expect(quote).toHaveClass(/has-photo/);
    await expect(page.locator('[data-testid="feed-item"][data-kind="place"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="feed-item"][data-kind="trip"]').first()).toBeVisible();
    // 시간순(최신 먼저): 각 줄의 '얼마 전' 글이 거꾸로 가지 않는지는 단위 시험이 보고, 여기선 내가 남긴 건 '나'로 보이는지
    await expect(items.first().locator('.feed-who')).toContainText('나');
    // 내 소식만 있으니 점은 없다
    await expect(page.getByTestId('feed-dot')).toHaveCount(0);
    await shot(page, '17-feed');
    // 내가 피드를 보고 있는 동안 들어온 소식은 본 것으로 치므로, 먼저 홈으로 나간다
    await page.goto('/');
    await expect(page.getByTestId('nav-feed')).toBeVisible();

    // 보라가 핀을 꽂으면 → 내 화면 아래 메뉴에 새 소식 점, 피드에 들어가면 사라진다
    const bora = await browser.newPage();
    await signIn(bora, 'bora@example.com');
    await expect(bora.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
    await bora.goto('/record');
    await bora.getByLabel('어디 검색').fill('통영');
    await bora.getByRole('option', { name: /통영시/ }).first().click();
    await bora.getByLabel('제목').fill('보라의 통영 나들이');
    await bora.getByRole('button', { name: '몰라요' }).click();
    await bora.getByTestId('save').click();
    await expect(bora.getByTestId('trip-title')).toHaveText('보라의 통영 나들이');
    await bora.close();
    await expect.poll(async () => page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen)), { timeout: 15_000, message: '점 계산 자료' }).toContain('"by":"보라"');
    const dbg = await page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen));
    await expect(page.getByTestId('feed-dot'), `새 소식 점이 없어요: ${dbg}`).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('nav-feed').click();
    await expect(items.first()).toContainText('보라의 통영 나들이');
    await expect(items.first().locator('.feed-who')).toContainText('보라');
    await expect(page.getByTestId('feed-dot')).toHaveCount(0);
    // 하트: 내가 누르면 '나', 보라가 보면 '영상'으로 보이고, 보라 화면 아래 메뉴에 점
    await items.first().getByTestId('feed-heart').click();
    await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'true');
    await expect(items.first().getByTestId('feed-heart-names')).toHaveText('나');
    const bora2 = await browser.newPage();
    await signIn(bora2, 'bora@example.com');
    await expect(bora2.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
    await bora2.getByTestId('nav-feed').click();
    await expect(bora2.getByTestId('feed-item').first().getByTestId('feed-heart-names')).toHaveText('영상');
    await expect(bora2.getByTestId('feed-dot')).toHaveCount(0);
    await bora2.close();
    // 다시 누르면 뺀다
    await items.first().getByTestId('feed-heart').click();
    await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'false');
    // 추억 돌아보기로 넘어갈 수 있다
    await page.getByTestId('to-memories').click();
    await expect(page).toHaveURL(/\/memories$/);
  });

  test('공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기', async ({ page, browser }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    const card = page.getByTestId('share-link');
    await card.getByTestId('share-on').click();
    const url = await card.getByLabel('공유 링크').inputValue();
    expect(url).toMatch(/\/s\/[a-z0-9]{8,}$/);
    // 보내기: 시험 주소는 카카오에 등록돼 있지 않으니 기기 공유하기로 (제목과 링크를 넘긴다)
    await expect(card.getByTestId('share-send')).toHaveText('보내기');
    await page.evaluate(() => { (navigator as unknown as { share: (d: ShareData) => Promise<void> }).share = async (d) => { (window as unknown as { __shared: ShareData }).__shared = d; }; });
    await card.getByTestId('share-send').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shared?: ShareData }).__shared)).toMatchObject({ title: '강릉시 여행', url });

    // 로그인하지 않은 사람이 링크로 연다
    const anon = await (await browser.newContext({ locale: 'ko-KR', serviceWorkers: 'block' })).newPage();
    await anon.goto(url);
    const shared = anon.getByTestId('shared-trip');
    await expect(shared).toContainText('강릉시 여행');
    await expect(shared).toContainText('초당할머니순두부');
    await shared.locator('.photo-grid').scrollIntoViewIfNeeded();
    await expect(shared.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
    await expect(shared.locator('.trip-cover img[data-loaded]')).toHaveCount(1);
    await expect(shared).not.toContainText('바다 보며 커피 마신 날');
    const photoId = await shared.locator('.photo-cell img').first().getAttribute('data-photo');
    // 로그인 없이도 지도가 그려진다
    await expectMapDrawn(anon);
    await anon.screenshot({ path: `${SHOTS}/15-shared-trip.png` });

    // 공개를 끄면 링크가 닫힌다
    await card.getByRole('button', { name: '공개 끄기' }).click();
    await expect(card.getByTestId('share-on')).toBeVisible();
    await anon.reload();
    await expect(anon.getByText('공개가 끝났거나 없는 여행이에요')).toBeVisible();
    // 공개를 끈 사진 파일은 로그인 없이 못 읽는다
    const denied = await anon.evaluate((id) => (window as unknown as { __testPhoto: (id: string) => Promise<number> }).__testPhoto(id!).then(() => 'read', (e: { code?: string; message: string }) => e.code ?? e.message), photoId);
    expect(denied).toBe('permission-denied');
    await anon.context().close();

    // 공유 카드: 1080×1350 그림
    await page.goto('/memories');
    const sc = page.getByTestId('share-cards');
    await sc.getByRole('button', { name: '우리 지도' }).click();
    await expect(sc.getByTestId('card-img')).toBeVisible();
    const size = await sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
    expect(size).toEqual([1080, 1350]);
    await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15b-card-map.png` });
    // 다른 카드를 고르면 새 그림(blob 주소)이 올 때까지 옛 그림이 남는다: 주소가 바뀌고 다 그려진 뒤에 찍는다
    const mapCardSrc = await sc.getByTestId('card-img').getAttribute('src');
    await sc.getByRole('button', { name: '메모 인용' }).click();
    await expect(sc.getByTestId('card-img')).not.toHaveAttribute('src', mapCardSrc ?? '');
    await expect.poll(() => sc.getByTestId('card-img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await sc.getByTestId('card-img').screenshot({ path: `${SHOTS}/15c-card-quote.png` });

    // 엑셀: 시트 4개짜리 .xlsx
    await page.goto('/space');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('xlsx').click()]);
    expect(dl.suggestedFilename()).toMatch(/^보라핀_.*\.xlsx$/);
    const fs = await import('node:fs');
    const buf = fs.readFileSync((await dl.path())!);
    expect(buf.subarray(0, 2).toString()).toBe('PK');
    expect(buf.length).toBeGreaterThan(5000);
  });

  test('우리 공간엔 개발자 글 대신 출처와 버전 링크, 버전·지도 출처는 /credits에', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/space');
    await expect(page.getByTestId('space-title')).toBeVisible();
    // 횟수는 우리말로 ('3번'이 아니라 '세 번')
    await expect(page.locator('.page')).not.toContainText(/여행 \d+번/);
    await expect(page.getByTestId('app-version')).toHaveCount(0);
    await expect(page.getByText(/SGIS/)).toHaveCount(0);
    await page.getByTestId('credits-link').click();
    await expect(page).toHaveURL(/\/credits$/);
    await expect(page.getByRole('heading', { name: '출처와 버전' })).toBeVisible();
    await expect(page.getByTestId('app-version')).toContainText(/보라핀 v\S+ · 빌드 /);
    await expect(page.getByTestId('map-credits')).toContainText('통계청 SGIS');
  });

  test('관리자: 사용량, 사진 올리기 멈춤, 문제 신고', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/space');
    // 문제 신고
    page.once('dialog', (d) => d.accept('지도가 가끔 늦게 떠요'));
    await page.getByTestId('report').click();
    await expect(page.getByRole('status')).toContainText('보내 주셔서 고마워요');
    await page.getByTestId('admin-link').click();
    const admin = page.getByTestId('admin');
    await expect(admin.getByTestId('usage')).toContainText('사진 3장');
    await expect(admin.getByTestId('usage')).toContainText('/ 1GB');
    await expect(admin.getByTestId('plan')).toContainText('무료(Spark)');
    await expect(admin.getByTestId('reports')).toContainText('지도가 가끔 늦게 떠요');
    // 사진 올리기 멈춤 → 여행 사진 탭에서 막힘
    await admin.getByLabel('멈추는 이유').fill('예산 점검');
    await admin.getByTestId('uploads-off').click();
    await expect(admin.getByTestId('cutoff')).toContainText('멈춤 · 예산 점검');
    await shot(page, '16-admin');
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    await page.getByRole('tab', { name: /사진/ }).click();
    await page.getByTestId('photo-add').click();
    await expect(page.getByRole('status')).toContainText('사진 올리기를 잠시 멈췄어요');
    await page.goto('/admin');
    await page.getByTestId('uploads-on').click();
    await expect(page.getByTestId('cutoff')).toContainText('켜짐');
    await page.getByTestId('reports').getByRole('button', { name: '해결함' }).first().click();
    await expect(page.getByTestId('reports')).toContainText('들어온 신고가 없어요');
  });

  test('이메일로 가입하고 메일 인증 뒤 들어온다', async ({ page }) => {
    const MAIL = 'mail.bora@example.com';
    // 주인이 먼저 이 메일을 함께 쓰는 사람에 넣는다
    await signIn(page, OWNER);
    await page.goto('/space');
    await page.getByLabel('추가할 계정').fill(MAIL);
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await expect(page.getByText(MAIL).first()).toBeVisible();
    await page.getByRole('button', { name: '로그아웃' }).click();
    // 가입 (메일 칸은 접혀 있다)
    await page.getByTestId('email-open').click();
    const form = page.getByTestId('email-form');
    await form.getByRole('radio', { name: '처음이에요' }).click();
    await form.getByLabel('메일 주소').fill(MAIL);
    await form.getByLabel('비밀번호').fill('borapin-1234');
    await form.getByTestId('email-submit').click();
    await expect(page.getByTestId('verify')).toContainText(MAIL);
    await shot(page, '10b-verify');
    // 인증 전에는 못 들어온다
    await page.getByTestId('verified').click();
    await expect(page.getByTestId('verify')).toContainText('아직 인증되지 않았어요');
    // 메일 속 링크를 누른 것처럼 (에뮬레이터에서 인증 코드를 적용)
    const host = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';
    const codes = (await (await fetch(`http://${host}/emulator/v1/projects/demo-borapin/oobCodes`)).json()) as { oobCodes: { email: string; oobCode: string; requestType: string }[] };
    const code = codes.oobCodes.reverse().find((c) => c.email === MAIL && c.requestType === 'VERIFY_EMAIL');
    expect(code).toBeTruthy();
    const r = await fetch(`http://${host}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ oobCode: code!.oobCode }) });
    expect(r.ok).toBeTruthy();
    await page.getByTestId('verified').click();
    await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
    // 다시 로그인: 틀린 비밀번호(400이 정상) → 맞는 비밀번호
    expected = [/accounts:signInWithPassword/];
    await page.goto('/space');
    await page.getByRole('button', { name: '로그아웃' }).click();
    // 지난번에 메일로 들어왔으면 메일 칸이 이미 펼쳐져 있다
    await expect(page.getByTestId('email-form')).toBeVisible();
    await page.getByLabel('메일 주소').fill(MAIL);
    await page.getByLabel('비밀번호').fill('wrong-pass');
    await page.getByTestId('email-submit').click();
    await expect(page.getByTestId('email-form')).toContainText('메일 주소나 비밀번호가 맞지 않아요');
    await page.getByLabel('비밀번호').fill('borapin-1234');
    await page.getByTestId('email-submit').click();
    await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
    await page.goto('/space');
    await page.getByRole('button', { name: '로그아웃' }).click();
  });

  test('기록 고치기와 지우기', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await expect(page.getByTestId('trip-row').first()).toBeVisible();
    const before = await page.getByTestId('trip-row').count();
    await page.getByText('강릉시 여행', { exact: true }).click();
    await page.getByRole('link', { name: '고치기' }).click();
    await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
    await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
    await page.getByLabel('제목').fill('엄마랑 강릉');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
    await page.getByRole('button', { name: '이 여행 지우기' }).click();
    await page.getByRole('button', { name: '지우기', exact: true }).click();
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByTestId('trip-row').filter({ hasText: '엄마랑 강릉' })).toHaveCount(0);
    await expect(page.getByTestId('trip-row')).toHaveCount(before - 1);
  });

  test('지역 창의 볼거리를 눌러 바로 가고 싶어요 (아내 의견: 일일이 검색 안 해도 되게)', async ({ page }) => {
    await signIn(page, OWNER);
    await expectMapDrawn(page);
    await tapLngLat(page, 129.06, 35.2);
    const sheet = page.getByTestId('region-sheet');
    await expect(sheet.getByTestId('sheet-title')).toHaveText('부산');
    const item = sheet.getByTestId('region-info').locator('.tap-item').first();
    const name = (await item.innerText()).trim();
    await item.click();
    const dlg = page.getByTestId('map-choice');
    await expect(dlg).toContainText(name);
    await dlg.getByTestId('map-choice-wish').click();
    await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
    await expect(dlg).toHaveCount(0);
    // 다시 누르면 '담겨 있어요'
    await item.click();
    await expect(dlg.getByTestId('map-choice-wish')).toHaveText(/담겨 있어요/);
    await expect(dlg.getByTestId('map-choice-wish')).toBeDisabled();
    await shot(page, '30-map-choice-wish');
    await dlg.getByRole('button', { name: '그대로 두기' }).click();
    await page.goto('/wishes');
    await expect(page.getByTestId('wish-card').filter({ hasText: '부산' })).toContainText(name);
  });
});
