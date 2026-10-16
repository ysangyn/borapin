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
test.beforeEach(({ page }) => {
  problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORED.some((r) => r.test(m.text()))) problems.push(`console: ${m.text().slice(0, 300)}`);
  });
  page.on('response', (r) => {
    if (r.status() === 404) problems.push(`404: ${r.url()}`);
  });
});
test.afterEach(() => {
  expect(problems, problems.join('\n')).toEqual([]);
});

/** 지도가 실제로 경계를 그렸는지 (그려진 칸 수 > 0) */
async function expectMapDrawn(page: Page) {
  await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
}

/** 지도 위 경도·위도 지점을 누른다 */
async function tapLngLat(page: Page, lng: number, lat: number) {
  const pt = await page.evaluate(([x, y]) => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([x, y]), [lng, lat] as [number, number]);
  const box = await page.getByTestId('map').first().boundingBox();
  if (!box) throw new Error('지도가 없어요');
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

  test('국내 여행 기록 (초성 검색, 연도만)', async ({ page }) => {
    await signIn(page, OWNER);
    await page.getByRole('link', { name: '기록하기' }).click();
    await pickPlace(page, 'ㄱㄹ', '강릉시');
    await page.getByRole('button', { name: '몇 년쯤' }).click();
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
    await page.getByRole('button', { name: '계절만' }).click();
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
    await expect(page.getByTestId('headline')).toHaveText('2번의 여행, 핀 2개');
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
    await expect(page.getByTestId('headline')).toHaveText('3번의 여행, 핀 3개');
    await shot(page, '09-sheet');
    await sheet.getByRole('button', { name: '닫기' }).click();
    await expect(sheet).toHaveCount(0);

    // 확대하면 시·군 이름이 보이고, 다녀온 곳은 진하게
    await page.evaluate(() => (window as unknown as { __map: { jumpTo: (o: object) => void } }).__map.jumpTo({ center: [128.95, 35.25], zoom: 7.6 }));
    const busan = page.locator('.map-label', { hasText: /^부산$/ });
    await expect(busan).toBeVisible();
    await expect(busan).toHaveClass(/\bon\b/);
    await expect(page.locator('.map-label', { hasText: /^김해시$/ })).toBeVisible();
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

    // 지도에서 제주를 눌러 하트로 담기 → 알림의 '메모 쓰기'
    await tapLngLat(page, 126.55, 33.38);
    const sheet = page.getByTestId('region-sheet');
    await expect(sheet.getByTestId('sheet-title')).toHaveText('제주');
    await sheet.getByTestId('sheet-wish').click();
    await expect(page.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
    await page.getByRole('button', { name: '메모 쓰기' }).click();
    await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);

    // 고치기: 둘 다 원해요, 1순위, 가볼 곳
    await expect(page.getByRole('button', { name: /제주 빼기/ })).toBeVisible();
    await page.getByRole('button', { name: '보라', exact: true }).click();
    await expect(page.getByText('둘 다 원해요')).toBeVisible();
    await page.getByRole('button', { name: '1순위' }).click();
    await page.getByLabel('가볼 곳').fill('성산일출봉\n우도');
    await page.getByTestId('wish-save').click();
    await expect(page).toHaveURL(/\/wishes$/);
    const card = page.getByTestId('wish-card').filter({ hasText: '제주' });
    await expect(card).toContainText('둘 다 원해요');
    await expect(card).toContainText('가볼 곳 성산일출봉 외 1');
    await expect(card.getByLabel('1순위')).toBeVisible();
    await shot(page, '10-wishes');

    // 여행 만들기 → 예정된 여행, 카드는 '예정'
    await card.getByTestId('wish-plan').click();
    await expect(page).toHaveURL(/status=planned/);
    await page.getByRole('button', { name: '몇 년쯤' }).click();
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('제주 여행');
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

    // 홈 롤링, 여행 탭에도 보인다
    await page.goto('/');
    await expect(page.getByTestId('home-wishes').getByTestId('wish-card').first()).toBeVisible();
    await expect(page.getByTestId('home-wishes')).toContainText('제주');
    await page.goto('/trips');
    await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  });

  test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
    await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
    await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
    await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
    await expect(page.getByLabel('네이버지도 링크')).toHaveValue('https://naver.me/xYz12');
    await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
    await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
    await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
    await page.getByRole('button', { name: '또 갈래요' }).click();
    await shot(page, '11-place-edit');
    await page.getByTestId('place-save').click();
    const tp = page.getByTestId('trip-places');
    await expect(tp).toContainText('초당할머니순두부');
    await expect(tp).toContainText('또 갈래요');
    await expect(tp).toContainText('순두부 젤라또까지 완벽');

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
  });

  test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    const sec = page.getByTestId('trip-photos');
    await sec.getByTestId('photo-input').setInputFiles([
      'tests/fixtures/photo-gangneung.jpg',
      'tests/fixtures/photo-gangneung2.jpg',
      'tests/fixtures/photo-noexif.jpg',
    ]);
    await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
    await expect(sec.locator('.photo-cell img')).toHaveCount(3);
    // 촬영일(2019.5.3~4)로 날짜 채우기 → '(추정)'
    const sug = page.getByTestId('photo-suggest');
    await expect(sug).toContainText('2019.5.3–4');
    await sug.getByRole('button', { name: '채우기' }).click();
    await expect(page.getByText('2019.5.3–4 (추정)')).toBeVisible();
    await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
    await expect(page.locator('.trip-cover img')).toBeVisible();
    await shot(page, '12-photos');
    // 슬라이드쇼: 자막에 촬영 시각과 장소
    await sec.locator('.photo-cell img').first().click();
    const cap = page.locator('.pswp__caption-bp');
    await expect(cap).toContainText('2019.5.3 14:20');
    await expect(cap).toContainText('강원 강릉시');
    await page.waitForTimeout(600);
    await shot(page, '12b-slideshow');
    await page.keyboard.press('Escape');
    // 추억 탭 사진첩
    await page.goto('/memories');
    await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  });

  test('초대 안 된 계정은 막고, 추가하면 들어온다', async ({ page }) => {
    await signIn(page, 'stranger@example.com');
    await expect(page.getByText('아직 초대되지 않은 계정이에요')).toBeVisible();
    await shot(page, '10-denied');
    await page.getByRole('button', { name: '다른 계정으로 로그인' }).click();
    await signIn(page, OWNER);
    await page.goto('/space');
    await page.getByLabel('추가할 계정').fill('bora@example.com');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await expect(page.getByText('bora@example.com', { exact: false }).first()).toBeVisible();
    await shot(page, '11-space');
    await page.getByRole('button', { name: '로그아웃' }).click();
    await signIn(page, 'bora@example.com');
    await expect(page.getByTestId('headline')).toHaveText(/번의 여행/);
  });

  test('기록 고치기와 지우기', async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto('/trips');
    await page.getByText('강릉시 여행', { exact: true }).click();
    await page.getByRole('link', { name: '고치기' }).click();
    await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
    await expect(page.getByLabel('제목')).toHaveValue('강릉시 여행');
    await page.getByLabel('제목').fill('엄마랑 강릉');
    await page.getByTestId('save').click();
    await expect(page.getByTestId('trip-title')).toHaveText('엄마랑 강릉');
    await page.getByRole('button', { name: '이 기록 지우기' }).click();
    await page.getByRole('button', { name: '지우기', exact: true }).click();
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByTestId('trip-row')).toHaveCount(3);
  });
});
