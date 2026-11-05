/**
 * 화면 둘러보기: 빈 상태 → 실제처럼 채운 상태를 휴대폰·PC로 모두 찍어 둔다.
 * (기능 점검은 app.spec.ts가 하고, 이 파일은 디자인 검수용 사진을 만든다.)
 */
import { test, expect, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const OWNER = 'ysangyn@gmail.com';
const BORA = 'bora.test@gmail.com';
const OUT = 'test-results/tour';
fs.mkdirSync(OUT, { recursive: true });

test.describe.configure({ mode: 'serial' });

const HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const app = getApps()[0] ?? initializeApp({ projectId: 'demo-borapin' });
const db = getFirestore(app);
const sp = db.collection('spaces').doc('main');

const problems: string[] = [];
function watch(page: Page, label: string) {
  page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/permission|insufficient/i.test(m.text())) problems.push(`[${label}] console: ${m.text().slice(0, 200)}`);
  });
}

async function signIn(page: Page, email = OWNER, name = '테스트') {
  await page.goto('/');
  await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  await page.evaluate(([e, n]) => (window as unknown as { __testSignIn: (e: string, n: string) => Promise<void> }).__testSignIn(e, n), [email, name]);
  await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
}

// Firestore가 연결을 계속 열어 두므로 networkidle은 쓰지 않는다
async function settle(page: Page) {
  await page.waitForLoadState('load').catch(() => undefined);
  await page.waitForTimeout(1200);
}

async function snap(page: Page, name: string, full = true) {
  await settle(page);
  await page.screenshot({ path: path.join(OUT, `${name}.jpg`), fullPage: full, type: 'jpeg', quality: 82 });
}

async function mobile(browser: Browser) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true,
    locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block',
  });
  const page = await ctx.newPage();
  watch(page, 'mobile');
  return page;
}
async function desktop(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  watch(page, 'desktop');
  return page;
}

test.beforeAll(async () => {
  // 앞선 점검이 남긴 기록을 모두 비운다
  await fetch(`http://${HOST}/emulator/v1/projects/demo-borapin/databases/(default)/documents`, { method: 'DELETE' });
});

test('빈 화면 (처음 쓰는 사람)', async ({ browser }) => {
  test.setTimeout(300_000);
  const page = await mobile(browser);
  // 로그인 화면 (구름 영상이 움직이기 시작한 뒤)
  await page.goto('/');
  await expect(page.getByTestId('email-open')).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(2500);
  await snap(page, 'e00-login', false);
  await signIn(page);
  await snap(page, 'e01-home', false);
  for (const [route, name] of [['/trips', 'e02-trips'], ['/wishes', 'e03-wishes'], ['/places', 'e04-places'], ['/memories', 'e05-memories'], ['/map', 'e06-map'], ['/ask', 'e07-ask'], ['/space', 'e08-space'], ['/record', 'e09-record']] as const) {
    await page.goto(route);
    await snap(page, name, route !== '/map');
  }
  await page.context().close();
});

// ---------- 실제처럼 채우기 ----------
const by = { uid: 'owner', email: OWNER, name: '영상' };
const byB = { uid: 'bora', email: BORA, name: '보라' };
const ts = (s: string) => Timestamp.fromDate(new Date(s));

const TRIPS = [
  { id: 't1', title: '강릉 바다 여행', kind: 'trip', status: 'done', when: { p: 'day', y: 2024, m: 5, d: 3, d2: 5 }, places: [{ t: 'kr', code: '51150' }, { t: 'kr', code: '51830' }], companions: [], memo: '경포 바다 보며 커피, 초당 순두부. 둘째 날은 비가 와서 카페 투어.', tags: ['바다', '카페'] },
  { id: 't2', title: '제주 한 바퀴', kind: 'trip', status: 'done', when: { p: 'day', y: 2023, m: 10, d: 12, d2: 15 }, places: [{ t: 'kr', code: '50' }], companions: [], memo: '오름 세 개, 해녀의 집 전복죽.', tags: ['섬'] },
  { id: 't3', title: '경주 벚꽃', kind: 'trip', status: 'done', when: { p: 'month', y: 2023, m: 4 }, places: [{ t: 'kr', code: '47130' }], companions: [], memo: '', tags: [] },
  { id: 't4', title: '여수 밤바다', kind: 'trip', status: 'done', when: { p: 'season', y: 2022, s: 'summer' }, places: [{ t: 'kr', code: '46130' }], companions: ['보라 동생'], memo: '낭만포차', tags: ['야경'] },
  { id: 't5', title: '부산 먹방', kind: 'trip', status: 'done', when: { p: 'day', y: 2025, m: 2, d: 14, d2: 16 }, places: [{ t: 'kr', code: '26' }], companions: [], memo: '돼지국밥, 밀면, 씨앗호떡', tags: ['맛집'] },
  { id: 't6', title: '전주 한옥마을', kind: 'outing', status: 'done', when: { p: 'year', y: 2021 }, places: [{ t: 'kr', code: '52' }], companions: [], memo: '', tags: [] },
  { id: 't7', title: '가평 캠핑', kind: 'outing', status: 'done', when: { p: 'day', y: 2025, m: 9, d: 20 }, places: [{ t: 'kr', code: '41820' }], companions: ['회사 동기들'], memo: '', tags: ['캠핑'] },
  { id: 't8', title: '도쿄 첫 해외여행', kind: 'trip', status: 'done', when: { p: 'day', y: 2024, m: 11, d: 21, d2: 24 }, places: [{ t: 'country', id: 'JPN', city: '도쿄' }], companions: [], memo: '시부야, 츠키지 시장, 디즈니씨', tags: ['해외'] },
  { id: 't9', title: '다낭 휴양', kind: 'trip', status: 'done', when: { p: 'month', y: 2025, m: 7 }, places: [{ t: 'country', id: 'VNM', city: '다낭' }], companions: [], memo: '', tags: ['휴양'] },
  { id: 't10', title: '파리 · 로마', kind: 'trip', status: 'done', when: { p: 'day', y: 2019, m: 9, d: 2, d2: 10 }, places: [{ t: 'country', id: 'FRA', city: '파리' }, { t: 'country', id: 'ITA', city: '로마' }], companions: [], memo: '신혼여행', tags: ['해외'] },
  { id: 't11', title: '통영 · 남해 드라이브', kind: 'trip', status: 'planned', when: { p: 'day', y: 2026, m: 11, d: 7, d2: 9 }, places: [{ t: 'kr', code: '48220' }, { t: 'kr', code: '48840' }], companions: [], memo: '', tags: [], packing: [{ t: '여권 말고 신분증', who: null, done: true }, { t: '충전기', who: '영상', done: false }, { t: '선크림', who: '보라', done: false }] },
  { id: 't12', title: '타이베이 겨울', kind: 'trip', status: 'planned', when: { p: 'month', y: 2027, m: 1 }, places: [{ t: 'country', id: 'TWN', city: '타이베이' }], companions: [], memo: '', tags: [] },
  { id: 't13', title: '속초 당일치기', kind: 'outing', status: 'done', when: { p: 'unknown' }, places: [{ t: 'kr', code: '51210' }], companions: [], memo: '', tags: [] },
];
const WISHES = [
  { id: 'w1', place: { t: 'kr', code: '47170' }, spotName: '하회마을', wantedBy: ['보라', '영상'], priority: 1, spots: ['하회마을', '월영교'], todos: [], foods: ['안동찜닭'], note: '' },
  { id: 'w2', place: { t: 'kr', code: '44825' }, wantedBy: ['보라'], priority: 2, spots: ['꽃지 해변'], todos: ['일몰 보기'], foods: [], note: '' },
  { id: 'w3', place: { t: 'country', id: 'ESP', city: '바르셀로나' }, wantedBy: ['영상'], priority: 1, spots: ['사그라다 파밀리아'], todos: [], foods: ['빠에야'], note: '결혼 10주년에' },
  { id: 'w4', place: { t: 'kr', code: '51110' }, wantedBy: ['보라', '영상'], priority: null, spots: [], todos: [], foods: ['닭갈비'], note: '' },
  { id: 'w5', place: { t: 'country', id: 'AUS', city: '시드니' }, wantedBy: [], priority: 3, spots: [], todos: [], foods: [], note: '' },
  // 다녀온 강릉: 박이추 커피는 장소 기록이 있어 '가 봄', 경포대·오죽헌이 남아 '다시 가고 싶어요'
  { id: 'w6', place: { t: 'kr', code: '51150' }, tripId: 't1', wantedBy: ['보라'], priority: null, spots: ['경포대', '오죽헌', '보헤미안 박이추 커피'], todos: [], foods: [], note: '' },
];
const RECS = [
  { id: 'r1', name: '초당할머니순두부', kind: 'food', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: { 영상: '아침으로 최고', 보라: '짬뽕순두부가 더 맛있었어' }, verdict: 'again', address: '강원 강릉시 초당순두부길 77', lat: 37.7916, lng: 128.9129 },
  { id: 'r2', name: '보헤미안 박이추 커피', kind: 'cafe', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: { 보라: '바다 뷰' }, verdict: 'again', lat: 37.8003, lng: 128.9059 },
  { id: 'r7', name: '테라로사 커피공장', kind: 'cafe', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: { 영상: '공장 구경하다 한 시간' }, verdict: 'again', lat: 37.7008, lng: 128.8629 },
  { id: 'r8', name: '카페 툇마루', kind: 'cafe', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: { 보라: '흑임자 라테' }, verdict: 'once', lat: 37.7676, lng: 128.8763 },
  { id: 'r9', name: '강릉 월화거리 소품가게', kind: 'shop', tag: '소품샵', region: { t: 'kr', code: '51150' }, tripId: 't1', reviews: { 보라: '엽서 샀어' }, verdict: 'again', lat: 37.7519, lng: 128.8962 },
  { id: 'r3', name: '해녀의 집', kind: 'food', region: { t: 'kr', code: '50' }, tripId: 't2', reviews: { 영상: '전복죽' }, verdict: 'once' },
  { id: 'r4', name: '감천문화마을', kind: 'sight', region: { t: 'kr', code: '26' }, tripId: 't5', reviews: {}, verdict: 'once' },
  { id: 'r5', name: '이치란 시부야', kind: 'food', region: { t: 'country', id: 'JPN', city: '도쿄' }, tripId: 't8', reviews: { 영상: '줄이 길다' }, verdict: 'meh' },
  { id: 'r6', name: '한옥스테이 소담', kind: 'stay', region: { t: 'kr', code: '52' }, tripId: 't6', reviews: {}, verdict: null },
];

/** 그럴듯한 풍경 사진(하늘·해·산·바다)을 브라우저 캔버스로 만든다 */
async function makePhotos(page: Page, n: number): Promise<{ l: string; t: string; w: number; h: number }[]> {
  return page.evaluate(async (count) => {
    const palettes = [
      ['#8ec5fc', '#e0c3fc', '#5b7bd5', '#2f4a8a'], ['#fbd3a6', '#f7a07a', '#c96b5a', '#5a3d5c'], ['#a1e3d8', '#d8f3ec', '#3c9d8f', '#1f5c63'],
      ['#ffd194', '#ff9a8b', '#7b5ea7', '#3a2c5f'], ['#c2e9fb', '#a1c4fd', '#4f86c6', '#24476b'], ['#f6d365', '#fda085', '#b55d4c', '#4b2e39'],
    ];
    const enc = (c: HTMLCanvasElement, q: number) => c.toDataURL('image/jpeg', q).split(',')[1];
    const out = [];
    for (let i = 0; i < count; i++) {
      const [a, b, c, d] = palettes[i % palettes.length];
      const portrait = i % 4 === 3;
      const w = portrait ? 1200 : 1600, h = portrait ? 1600 : 1200;
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const g = cv.getContext('2d')!;
      const sky = g.createLinearGradient(0, 0, 0, h * 0.7);
      sky.addColorStop(0, a); sky.addColorStop(1, b);
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.beginPath(); g.arc(w * (0.25 + 0.5 * ((i * 37) % 10) / 10), h * 0.3, h * 0.07, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < 3; k++) {
        g.fillStyle = k === 2 ? d : c;
        g.globalAlpha = 0.55 + k * 0.2;
        g.beginPath(); g.moveTo(0, h);
        const base = h * (0.55 + k * 0.12);
        for (let x = 0; x <= w; x += w / 8) g.lineTo(x, base - Math.sin((x / w) * Math.PI * (2 + k) + i) * h * 0.08);
        g.lineTo(w, h); g.closePath(); g.fill();
      }
      g.globalAlpha = 1;
      const t = document.createElement('canvas');
      const s = 400 / Math.max(w, h);
      t.width = Math.round(w * s); t.height = Math.round(h * s);
      t.getContext('2d')!.drawImage(cv, 0, 0, t.width, t.height);
      out.push({ l: enc(cv, 0.8), t: enc(t, 0.72), w, h });
    }
    return out;
  }, n);
}

async function seed(page: Page) {
  const batch = db.batch();
  await db.doc('config/access').set({ allowed: [OWNER, BORA], admins: [OWNER], updatedAt: Timestamp.now() });
  for (const [i, t] of TRIPS.entries()) {
    batch.set(sp.collection('trips').doc(t.id), { ...t, companions: ['보라', '영상', ...t.companions], source: 'app', createdBy: i % 3 === 0 ? byB : by, createdAt: ts(`2025-0${(i % 9) + 1}-10`), updatedAt: Timestamp.now(), v: 1 });
  }
  for (const w of WISHES) batch.set(sp.collection('wishes').doc(w.id), { ...w, source: 'app', createdBy: by, createdAt: ts('2025-06-01'), updatedAt: Timestamp.now(), v: 1 });
  for (const r of RECS) batch.set(sp.collection('places').doc(r.id), { ...r, createdBy: by, createdAt: ts('2025-06-01'), updatedAt: Timestamp.now(), v: 1 });
  const plans = [
    ['p1', 't11', '통영 케이블카', '2026-11-07', '10:00', true],
    ['p2', 't11', '동피랑 벽화마을', '2026-11-07', '14:00', false],
    ['p3', 't11', '남해 독일마을', '2026-11-08', null, false],
    ['p4', 't11', '다랭이마을 일몰', '2026-11-08', '17:30', false],
    ['p5', 't11', '멸치쌈밥 맛집 찾기', null, null, false],
  ] as const;
  plans.forEach(([id, tripId, name, day, time, done], i) => batch.set(sp.collection('plans').doc(id), { tripId, name, order: i, day, time, info: '', recId: null, done, createdAt: Timestamp.now(), v: 1 }));
  batch.set(sp.collection('notes').doc('n1'), { tripId: 't1', text: '비 오는 바다도 좋더라. 다음엔 겨울에 다시 오자.', by: { uid: 'bora', name: '보라' }, createdAt: ts('2024-05-06T21:00:00+09:00'), v: 1 });
  batch.set(sp.collection('notes').doc('n2'), { tripId: 't1', text: '초당 순두부 아침 7시 오픈, 7시 반부터 줄 섬', by: { uid: 'owner', name: '영상' }, createdAt: ts('2024-05-06T22:00:00+09:00'), v: 1 });
  // 우리 집: 고양 (기차·버스 한 번에 가는 길, 대중교통 들러 가기)
  batch.set(sp, { home: { label: '고양시', code: '41280', lat: 37.658, lng: 126.832, exact: false } }, { merge: true });
  await batch.commit();

  // 사진: 강릉 6장, 제주 4장, 도쿄 4장, 파리 2장
  const imgs = await makePhotos(page, 16);
  const plan: [string, string, { t: 'kr'; code: string } | { t: 'country'; id: string; city?: string }][] = [
    ...Array.from({ length: 6 }, (_, i) => ['t1', `2024-05-0${3 + (i % 3)}T${10 + i}:20`, { t: 'kr' as const, code: '51150' }] as [string, string, { t: 'kr'; code: string }]),
    ...Array.from({ length: 4 }, (_, i) => ['t2', `2023-10-1${2 + i}T1${i}:05`, { t: 'kr' as const, code: '50' }] as [string, string, { t: 'kr'; code: string }]),
    ...Array.from({ length: 4 }, (_, i) => ['t8', `2024-11-2${1 + i}T1${i + 2}:40`, { t: 'country' as const, id: 'JPN' }] as [string, string, { t: 'country'; id: string }]),
    ...Array.from({ length: 2 }, (_, i) => ['t10', `2019-09-0${3 + i}T15:00`, { t: 'country' as const, id: 'FRA' }] as [string, string, { t: 'country'; id: string }]),
  ];
  const pb = db.batch();
  plan.forEach(([tripId, taken, place], i) => {
    const id = `ph${String(i).padStart(2, '0')}`;
    const im = imgs[i];
    const l = Buffer.from(im.l, 'base64'), t = Buffer.from(im.t, 'base64');
    pb.set(sp.collection('photoData').doc(`${id}_l`), { photoId: id, tripId, kind: 'l', data: l, size: l.length, public: false, v: 1 });
    pb.set(sp.collection('photoData').doc(`${id}_t`), { photoId: id, tripId, kind: 't', data: t, size: t.length, public: false, v: 1 });
    pb.set(sp.collection('photos').doc(id), {
      tripId, w: im.w, h: im.h, taken, tz: '+09:00', takenGuess: false, lat: null, lng: null, place, camera: 'iPhone 15', bytes: l.length + t.length,
      ...(i === 0 ? { caption: '경포 해변 첫날' } : {}), createdBy: by, createdAt: Timestamp.now(), v: 1,
    });
  });
  await pb.commit();
}

test('가득 찬 화면 · 휴대폰', async ({ browser }) => {
  test.setTimeout(600_000);
  const page = await mobile(browser);
  await signIn(page);
  await seed(page);
  await page.goto('/');
  await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  await snap(page, 'm01-home');
  await page.goto('/trips');
  await snap(page, 'm02-trips');
  await page.goto('/trips/t1');
  await snap(page, 'm03-trip-info');
  await page.getByRole('tab', { name: /사진/ }).click();
  await snap(page, 'm04-trip-photos');
  await page.getByRole('tab', { name: /글/ }).click();
  await snap(page, 'm05-trip-notes');
  // 피드: 여행 일기장 (이번 주 한 줄 · 달력 띠 · 폴라로이드 · 기차표 장소)
  await page.goto('/feed');
  await expect(page.getByTestId('feed-month')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('feed-week')).toBeVisible();
  await expect(page.getByTestId('feed-month-day').first()).toBeVisible();
  await snap(page, 'm05b-feed');
  await page.goto('/trips/t11');
  await snap(page, 'm06-planned-info');
  // 준비 탭: 가는 길 정하기 (고양 → 통영, 이달 시각표 · 떠나는 날이 토요일이라 토요일 시각표로)
  await page.goto('/trips/t11?tab=prep');
  await expect(page.getByTestId('way-go')).toContainText('가는 길');
  await page.getByTestId('way-go-open').click();
  const sheet = page.getByTestId('way-sheet');
  await expect(sheet.getByTestId('transit-plan').first()).toBeVisible({ timeout: 15_000 });
  await expect(sheet.getByTestId('transit-sat')).toHaveAttribute('aria-selected', 'true');
  await snap(page, 'm06b-transit-stops', false);
  await sheet.getByTestId('transit-plan').filter({ hasText: '들러 가기' }).first().getByTestId('transit-pick').click();
  await expect(page.getByRole('status')).toContainText('가는 길을 정했어요');
  await expect(page.getByTestId('way-go')).toContainText('들러 가기');
  await expect(page.getByTestId('way-go')).toContainText('막차');
  await snap(page, 'm06c-way-picked');
  await page.getByRole('tab', { name: /일정/ }).click();
  await snap(page, 'm07-planned-plan');
  // 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서만 켜짐)
  await page.goto('/trips/t11/plan-next?step=when');
  await expect(page.getByTestId('flow-cal')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('flow-nights')).toHaveText('2박 3일');
  await snap(page, 'm07a-plan-when');
  await page.getByTestId('flow-when-save').click();
  await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'stay');
  await snap(page, 'm07b-plan-stay');
  await page.getByLabel('숙소').fill('통영 바다 앞 호텔');
  await page.getByTestId('flow-stay-save').click();
  await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'pick');
  const own = page.getByLabel('직접 담기');
  await own.fill('서피랑');
  await own.press('Enter');
  await expect(page.getByTestId('pick-card').filter({ hasText: '직접 담은 곳' }).filter({ hasText: '서피랑' })).toBeVisible();
  await snap(page, 'm07c-plan-pick');
  await page.getByTestId('flow-pick-next').click();
  await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'route');
  await expect(page.getByTestId('flow-day')).toHaveCount(3);
  await snap(page, 'm07d-plan-route');
  await page.getByTestId('flow-route-save').click();
  await expect(page.getByTestId('plan-flow')).toHaveAttribute('data-step', 'hope');
  await page.getByLabel('기대 한 줄').fill('케이블카에서 보는 한려수도');
  await expect(page.getByTestId('flow-check')).toContainText('통영 바다 앞 호텔');
  await snap(page, 'm07e-plan-hope');
  await page.getByTestId('flow-hope-save').click();
  await expect(page).toHaveURL(/\/trips\/t11$/);
  await expect.poll(async () => (await sp.collection('trips').doc('t11').get()).data()?.planDone?.length).toBe(5);
  await page.goto('/trips/t10');
  await page.locator('.trip-cover').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'm08-slideshow.jpg'), type: 'jpeg', quality: 82 });
  await page.keyboard.press('Escape');
  await page.goto('/record');
  await snap(page, 'm09-record');
  await page.goto('/trips/t1/edit');
  await snap(page, 'm10-trip-edit');
  await page.goto('/map');
  await snap(page, 'm11-map', false);
  await page.getByRole('tab', { name: '세계' }).first().click({ timeout: 5000 }).catch(() => undefined);
  await snap(page, 'm12-map-world', false);
  await page.goto('/wishes');
  await expect(page.getByTestId('wish-again').first()).toContainText('못 간 곳 2');
  await snap(page, 'm13-wishes');
  await page.goto('/wishes/w6');
  await expect(page.getByTestId('wish-gone')).toBeVisible();
  await expect(page.getByTestId('wish-gone-rec')).toContainText('보헤미안 박이추 커피');
  await snap(page, 'm13b-wish-gone');
  await page.goto('/wishes/w1');
  await snap(page, 'm14-wish-edit');
  await page.goto('/places');
  await snap(page, 'm15-places');
  // 장소 한 곳: 앱 안의 작은 거리 지도 (좌표가 있으면 골목까지)
  await page.goto('/places/r7');
  await expect(page.getByTestId('mini-street')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(2500); // 타일
  await snap(page, 'm15a-place-street');
  // 내 지도: 강릉 카페 3곳 → 거리 지도 + 순위, 새 곳을 담으면 견주기, 보내기 → 앱 없이 보는 페이지
  await page.goto('/maps?m=kr:51150|cafe');
  await expect(page.getByTestId('mymaps')).toBeVisible();
  await expect(page.getByTestId('street-map')).toBeVisible();
  await expect(page.getByTestId('mymap-list').getByTestId('place-rec')).toHaveCount(3);
  await page.waitForTimeout(2500); // 타일
  await snap(page, 'm15b-mymaps');
  await page.goto('/places/new?region=kr:51150&kind=cafe');
  await page.getByLabel('장소 이름').fill('안목 커피거리 2호점');
  await page.getByTestId('place-save').click();
  await expect(page.getByTestId('rank-ask')).toBeVisible();
  await snap(page, 'm15c-rank-ask', false);
  await page.getByTestId('rank-better').click();
  // 3곳이면 많아야 2번 묻는다
  if (await page.getByTestId('rank-ask').isVisible().catch(() => false)) await page.getByTestId('rank-better').click();
  await expect(page).toHaveURL(/\/maps\?m=/);
  await expect(page.getByTestId('mymap-list').getByTestId('place-rec').first()).toContainText('안목 커피거리 2호점');
  // 보내기: 공개 사본이 생기고 토큰으로 열린다
  await page.getByTestId('mymap-share').click();
  // 기기 공유 창이 열리면 알림이 없을 수 있으니, 공개 토큰이 생기는 것으로 확인한다
  let token: string | undefined;
  await expect.poll(async () => { const d = await sp.collection('placeMaps').doc('kr:51150|cafe').get(); token = (d.data() as { share?: { token: string } } | undefined)?.share?.token; return token ?? ''; }, { timeout: 15_000 }).toMatch(/.{6,}/);
  await expect(page.getByTestId('mymap-share')).toBeVisible();
  const anon = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  const guest = await anon.newPage();
  await guest.goto(`/m/${token}`);
  await expect(guest.getByTestId('shared-map')).toBeVisible();
  await expect(guest.getByTestId('shared-map-item')).toHaveCount(4);
  await expect(guest.getByTestId('shared-map-cta')).toBeVisible();
  await guest.waitForTimeout(2500);
  await guest.screenshot({ path: path.join(OUT, 'm15d-shared-map.jpg'), fullPage: true, type: 'jpeg', quality: 82 });
  // 로그인 없이 ♡ 전부 → 이 폰에 적어 두고 '보라핀 가고 싶은 곳에 넣기'
  await guest.getByTestId('shared-heart-all').click();
  await expect(guest.getByTestId('shared-heart').first()).toHaveText('♥ 담아 뒀어요');
  await expect(guest.getByTestId('shared-take')).toContainText('4곳');
  await guest.screenshot({ path: path.join(OUT, 'm15d2-shared-hearts.jpg'), type: 'jpeg', quality: 82 });
  await anon.close();
  // 한눈에: 맛집·카페·소품샵(내 꼬리표)이 색만 다르게 한 지도에
  await page.goto('/maps?m=kr:51150|all');
  await expect(page.getByTestId('mymap-legend')).toContainText('소품샵');
  await expect(page.getByTestId('mymaps-themes')).toContainText('한눈에');
  await page.waitForTimeout(2000);
  await snap(page, 'm15e-mymaps-all');
  // 스토리 카드: 1080×1920 그림을 만들어 보여 준다 (그림 원본도 남긴다)
  await page.getByTestId('mymap-story').click();
  await expect(page.getByTestId('story-img')).toBeVisible({ timeout: 15_000 });
  await snap(page, 'm15g-story', false);
  const png = await page.getByTestId('story-img').evaluate(async (img) => { const b = await (await fetch((img as HTMLImageElement).src)).blob(); const r = new FileReader(); return await new Promise<string>((ok) => { r.onload = () => ok(String(r.result).split(',')[1]); r.readAsDataURL(b); }); });
  fs.writeFileSync(path.join(OUT, 'm15g-story-card.png'), Buffer.from(png, 'base64'));
  await page.keyboard.press('Escape');
  await page.getByTestId('story-card').click({ position: { x: 5, y: 5 } });
  // 받은 지도에서 ♡한 곳 → 홈 카드에서 가고 싶은 곳으로 한꺼번에
  await page.goto(`/m/${token}`);
  await page.getByTestId('shared-heart-all').click();
  await page.getByTestId('shared-take').getByRole('link').click();
  await expect(page.getByTestId('pending-wishes')).toBeVisible({ timeout: 15_000 });
  await snap(page, 'm15h-pending-wishes', false);
  await page.getByTestId('pending-take').click();
  await expect(page.getByRole('status')).toContainText(/담았어요|담겨 있어요/);
  await expect(page.getByTestId('pending-wishes')).toHaveCount(0);
  await page.goto('/places/r1');
  await snap(page, 'm16-place-edit');
  await page.goto('/memories');
  await snap(page, 'm17-memories');
  await page.goto('/ask');
  const answersBefore = await page.getByTestId('answer').count();
  await page.getByRole('textbox').first().fill('강릉 몇 번 갔지?');
  await page.keyboard.press('Enter');
  // 첫 답이 붙은 뒤에 다음 질문 (고정 대기 대신)
  await expect.poll(() => page.getByTestId('answer').count()).toBeGreaterThan(answersBefore);
  await page.getByRole('textbox').first().fill('11월에 어디 가면 좋아?');
  await page.keyboard.press('Enter');
  await snap(page, 'm18-ask');
  await page.goto('/space');
  await snap(page, 'm19-space');
  await page.goto('/admin');
  await snap(page, 'm20-admin');
  // 지도 시트
  await page.goto('/');
  await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  await page.goto('/map');
  await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  await settle(page);
  // 강릉을 눌러 지역 창 (위쪽에 여행지 사진)
  const pt = await page.evaluate(() => (window as unknown as { __map: { project: (l: [number, number]) => { x: number; y: number } } }).__map.project([128.88, 37.74]));
  const box = await page.getByTestId('map').first().boundingBox();
  if (box) await page.mouse.click(box.x + pt.x, box.y + pt.y);
  // 지역 창이 뜨면 바로 (못 뜨면 전처럼 그냥 찍는다: 이 파일은 디자인 검수용 사진이 목적)
  await page.getByTestId('region-sheet').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  await snap(page, 'm22-sheet', false);
  // 경유지: 준비 탭 '가는 길' 밑에 '가는 길에 들를 곳 찾기'가 늘 보이고, 누르면 들러 가기가 펼쳐진다
  // (홈 다음 여행 칸에도 같은 줄: 집에서 60km 넘는 국내일 때 — 이 시험 자료의 다음 여행은 해당 없음)
  await page.goto('/trips/t11?tab=prep');
  await page.getByTestId('stopover-find').first().click({ timeout: 15_000 });
  await expect(page.getByTestId('stopovers')).toBeVisible();
  await page.getByTestId('stopovers').scrollIntoViewIfNeeded();
  await snap(page, 'm23-stopover-find', false);
  // 밤 모드: 설정 → 화면 '어둡게' (새로 불러 지도 색까지 바뀜) → 주요 화면을 어둡게 한 번 더
  await page.goto('/space');
  await page.getByTestId('theme-dark').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 15_000 });
  for (const [route, name, full] of [['/', 'n01-home', true], ['/map', 'n02-map', false], ['/trips/t1', 'n03-trip', true], ['/trips/t11?tab=prep', 'n04-prep', true], ['/trips/t11/plan-next?step=pick', 'n05-plan-pick', true], ['/feed', 'n07-feed', true], ['/maps?m=kr:51150|all', 'n08-mymaps', true], ['/space', 'n06-space', true]] as const) {
    await page.goto(route);
    await snap(page, name, full);
  }
  await page.getByTestId('theme-light').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light', { timeout: 15_000 });
  await page.context().close();
});

test('가득 찬 화면 · PC', async ({ browser }) => {
  test.setTimeout(480_000);
  const page = await desktop(browser);
  await page.goto('/');
  await expect(page.getByTestId('email-open')).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(2500);
  await snap(page, 'd00-login', false);
  await signIn(page);
  for (const [route, name] of [['/', 'd01-home'], ['/trips', 'd02-trips'], ['/trips/t1', 'd03-trip'], ['/trips/t11', 'd04-planned'], ['/record', 'd05-record'], ['/map', 'd06-map'], ['/wishes', 'd07-wishes'], ['/places', 'd08-places'], ['/memories', 'd09-memories'], ['/ask', 'd10-ask'], ['/space', 'd11-space'], ['/admin', 'd12-admin']] as const) {
    await page.goto(route);
    await snap(page, name, route !== '/map');
  }
  // 공유 페이지 (로그인 없이)
  await page.goto('/trips/t1');
  const card = page.getByTestId('share-link');
  await card.getByTestId('share-on').click();
  const url = await card.getByLabel('공유 링크').inputValue();
  const anon = await mobile(browser);
  await anon.goto(url);
  await expect(anon.getByTestId('shared-trip')).toBeVisible();
  await snap(anon, 'm21-shared');
  await anon.context().close();
  await page.context().close();
});

test('화면 오류 없음', () => {
  expect(problems, problems.join('\n')).toEqual([]);
});
