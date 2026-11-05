# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: walk.spec.ts >> 여행 이야기: 국내는 둘이 고르고, 해외는 가고 싶은 도시에서 — 계획하고 다녀와서 기록까지
- Location: tests/walk.spec.ts:120:1

# Error details

```
Error: Value for argument "documentPath" is not a valid resource path. Path must be a non-empty string.
```

# Page snapshot

```yaml
- generic [active] [ref=f52e1]:
  - generic [ref=f52e2]:
    - generic [ref=f52e3]:
      - generic [ref=f52e4]:
        - generic [ref=f52e5]:
          - img "보라핀 로고" [ref=f52e6]
          - text: 보라핀
        - link "우리 공간" [ref=f52e10] [cursor=pointer]:
          - /url: /space
          - generic "보라 · 영상" [ref=f52e11]:
            - generic [ref=f52e12]: 보
            - generic [ref=f52e13]: 영
      - generic [ref=f52e14]:
        - generic [ref=f52e16]:
          - generic [ref=f52e17]: 보라 & 영상의 지도
          - generic [ref=f52e18]: 12번의 여행,핀 14개 꽂았어요
        - generic [ref=f52e19]:
          - link "통영 · 남해 드라이브 보기" [ref=f52e20] [cursor=pointer]:
            - /url: /trips/t11
          - generic [ref=f52e21]:
            - generic [ref=f52e22]: 다가오는 여행
            - generic [ref=f52e23]: 통영 · 남해 드라이브
            - generic [ref=f52e24]: D-2 · 통영시 · 남해군
            - generic [ref=f52e25]: KTX 9:11 행신 출발 · 예매하셨어요? · 2026.11.7–9
            - link "준비물 보기" [ref=f52e27] [cursor=pointer]:
              - /url: /trips/t11?tab=prep
        - generic [ref=f52e29]:
          - generic [ref=f52e30]:
            - tablist [ref=f52e31]:
              - tab "국내" [selected] [ref=f52e32] [cursor=pointer]
              - tab "세계" [ref=f52e33] [cursor=pointer]
            - link "지도 크게 보기" [ref=f52e34] [cursor=pointer]:
              - /url: /map
          - generic [ref=f52e35]:
            - generic [ref=f52e36]:
              - generic:
                - region "Map" [ref=f52e37]
                - generic: 동해
                - generic: 서해
                - generic: 남해
                - generic: "1"
                - generic: "2"
                - generic:
                  - generic "우리 장소 1곳": "1"
                - generic:
                  - generic "우리 장소 1곳": "1"
                - generic:
                  - generic "우리 장소 2곳": "2"
                - generic:
                  - generic "우리 장소 1곳": "1"
                - generic:
                  - generic "우리 장소 1곳": "1"
                - generic:
                  - generic "우리 장소 1곳": "1"
            - generic [aria-hidden]:
              - generic: 안동시
              - generic: 포항시
              - generic: 구미시
              - generic: 영주시
              - generic: 의성군
              - generic: 울진군
              - generic: 봉화군
              - generic: 청송군
              - generic: 단양군
              - generic: 예천군
              - generic: 영양군
              - generic: 영덕군
            - generic [ref=f52e38]:
              - button "확대" [ref=f52e39] [cursor=pointer]
              - separator [ref=f52e42]
              - button "축소" [ref=f52e43] [cursor=pointer]
              - separator [ref=f52e45]
              - button "전체 보기" [ref=f52e46] [cursor=pointer]
          - generic [ref=f52e49]: 지역을 누르면 핀 꽂기 단추가 나와요전체 보기 단추를 누르면 전국이 보여요
          - generic [ref=f52e50]:
            - generic [ref=f52e51]:
              - generic [ref=f52e52]:
                - text: "10"
                - generic [ref=f52e53]: /160
              - generic [ref=f52e54]: 시·군
            - generic [ref=f52e55]:
              - generic [ref=f52e56]:
                - text: "7"
                - generic [ref=f52e57]: /16
              - generic [ref=f52e58]: 광역
            - generic [ref=f52e59]:
              - generic [ref=f52e60]: "4"
              - generic [ref=f52e61]: 개국
            - generic [ref=f52e62]:
              - generic [ref=f52e63]: "2"
              - generic [ref=f52e64]: 예정
          - button "집에서 가장 가까운 빈 칸은 부천시예요 · 차로 약 20분" [ref=f52e65] [cursor=pointer]:
            - generic [ref=f52e67]:
              - text: 집에서 가장 가까운 빈 칸은 부천시예요
              - generic [ref=f52e68]: · 차로 약 20분
        - textbox "물어보기" [ref=f52e70]:
          - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
        - generic [ref=f52e71]:
          - generic [ref=f52e72]:
            - heading "다음 여행 준비" [level=2] [ref=f52e73]
            - link "가고 싶은 곳 4곳" [ref=f52e74] [cursor=pointer]:
              - /url: /wishes
          - generic [ref=f52e75]:
            - link "다음 여행 타이베이 겨울 2027년 1월쯤" [ref=f52e76] [cursor=pointer]:
              - /url: /trips/t12
              - generic [ref=f52e77]:
                - generic [ref=f52e78]: 다음 여행
                - generic [ref=f52e79]: 타이베이 겨울
                - generic [ref=f52e80]: 2027년 1월쯤
            - generic [ref=f52e83]:
              - link "강원 춘천시 그다음은 여기 · 둘 다 원해요" [ref=f52e84] [cursor=pointer]:
                - /url: /wishes/w4
                - generic [ref=f52e85]: 강원 춘천시
                - generic [ref=f52e86]: 그다음은 여기 · 둘 다 원해요
              - link "스페인 바르셀로나 영상" [ref=f52e87] [cursor=pointer]:
                - /url: /wishes/w3
                - generic [ref=f52e88]: 스페인 바르셀로나
                - generic [ref=f52e89]: 영상
          - generic [ref=f52e90]:
            - generic [ref=f52e91]: 오늘의 한 질문
            - paragraph [ref=f52e92]: 타이베이에서 밤에는 뭘 하고 싶어?
            - generic [ref=f52e93]:
              - textbox "오늘의 질문 답" [ref=f52e94]:
                - /placeholder: 한 줄이면 돼요
              - button "답하기" [disabled] [ref=f52e95]
          - generic [ref=f52e96]:
            - generic [ref=f52e97]: 대만 타이베이 가는 길
            - generic [ref=f52e98]:
              - button "가기 좋은 때 3·4, 10~12월 · 덥지 않고 비가 덜해요" [ref=f52e99] [cursor=pointer]
              - button "입국 무비자 90일 · 떠나기 전 확인" [ref=f52e103] [cursor=pointer]
              - button "TWD 대만달러 · 중국어(번체) · 콘센트 A(110V) · 한국보다 1시간 느려요" [ref=f52e107] [cursor=pointer]
              - group [ref=f52e111]:
                - generic "자세히 · 한마디 ▾" [ref=f52e112] [cursor=pointer]
          - link "오늘의 영어 3문장 · 90초" [ref=f52e113] [cursor=pointer]:
            - /url: /study
        - group [ref=f52e116]:
          - generic "이달의 추천 · 가고 싶은 곳" [ref=f52e117] [cursor=pointer]
        - generic [ref=f52e121]:
          - generic [ref=f52e122]:
            - heading "최근에 남긴 기록" [level=2] [ref=f52e123]
            - link "전체 보기" [ref=f52e124] [cursor=pointer]:
              - /url: /trips
          - generic [ref=f52e125]:
            - link "안동시 여행 경북 안동시 · 2026.11.2–3 · 1박 2일" [ref=f52e126] [cursor=pointer]:
              - /url: /trips/sIsgPgDqa04aOLw4oaTE
              - generic [ref=f52e128]:
                - generic [ref=f52e129]: 안동시 여행
                - generic [ref=f52e130]: 경북 안동시 · 2026.11.2–3 · 1박 2일
            - link "다낭 휴양 베트남 다낭 · 2025년 7월쯤" [ref=f52e131] [cursor=pointer]:
              - /url: /trips/t9
              - generic [ref=f52e133]:
                - generic [ref=f52e134]: 다낭 휴양
                - generic [ref=f52e135]: 베트남 다낭 · 2025년 7월쯤
            - link "도쿄 첫 해외여행 일본 도쿄 · 2024.11.21–24 · 3박 4일" [ref=f52e136] [cursor=pointer]:
              - /url: /trips/t8
              - generic [ref=f52e138]:
                - generic [ref=f52e139]: 도쿄 첫 해외여행
                - generic [ref=f52e140]: 일본 도쿄 · 2024.11.21–24 · 3박 4일
      - navigation "주 메뉴" [ref=f52e141]:
        - link "홈" [ref=f52e142] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f52e145] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f52e148] [cursor=pointer]
        - link "지도" [ref=f52e151] [cursor=pointer]:
          - /url: /map
        - link "새 소식 5개 피드" [ref=f52e154] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 5개" [ref=f52e158]
          - text: 피드
      - link "물어보기" [ref=f52e159] [cursor=pointer]:
        - /url: /ask
    - status
  - iframe [aria-hidden] [ref=f52e160]
```

# Test source

```ts
  5   |  * - 막힌 걸음은 실패로 멈추지 않고 보고서(test-results/walk/report.txt)에 '막힘'으로 남긴다 (배포를 막지 않음).
  6   |  */
  7   | import { test, type Browser, type Page } from '@playwright/test';
  8   | import fs from 'node:fs';
  9   | import path from 'node:path';
  10  | import { initializeApp, getApps } from 'firebase-admin/app';
  11  | import { getFirestore } from 'firebase-admin/firestore';
  12  | 
  13  | const OWNER = 'ysangyn@gmail.com';
  14  | const BORA = 'bora.test@gmail.com';
  15  | const db = getFirestore(getApps()[0] ?? initializeApp({ projectId: 'demo-borapin' }));
  16  | const tripsCol = db.collection('spaces').doc('main').collection('trips');
  17  | const OUT = 'test-results/walk';
  18  | fs.mkdirSync(OUT, { recursive: true });
  19  | test.describe.configure({ mode: 'serial' });
  20  | 
  21  | const lines: string[] = [];
  22  | let n = 0;
  23  | const log = (s: string) => { lines.push(s); console.log(s); try { fs.appendFileSync(path.join(OUT, 'report.txt'), s + '\n'); } catch { /* */ } };
  24  | try { fs.writeFileSync(path.join(OUT, 'report.txt'), ''); } catch { /* */ }
  25  | 
  26  | async function phone(browser: Browser) {
  27  |   const ctx = await browser.newContext({ viewport: { width: 375, height: 760 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  28  |   const page = await ctx.newPage();
  29  |   // 없는 단추를 끝없이 기다리지 않게: 8초 안에 못 찾으면 그 걸음은 '막힘'
  30  |   page.setDefaultTimeout(8000);
  31  |   page.setDefaultNavigationTimeout(20_000);
  32  |   page.on('pageerror', (e) => log(`  ! 오류: ${e.message.slice(0, 160)}`));
  33  |   page.on('console', (m) => { if (m.type() === 'error' && !/permission|insufficient|Failed to load resource/i.test(m.text())) log(`  ! 콘솔: ${m.text().slice(0, 160)}`); });
  34  |   return page;
  35  | }
  36  | 
  37  | async function signIn(page: Page, email = OWNER, nm = '영상') {
  38  |   await page.goto('/');
  39  |   await page.waitForFunction(() => typeof (window as unknown as { __testSignIn?: unknown }).__testSignIn === 'function');
  40  |   await page.evaluate(([e, x]) => (window as unknown as { __testSignIn: (e: string, n: string) => Promise<void> }).__testSignIn(e, x), [email, nm]);
  41  |   await page.getByRole('navigation', { name: '주 메뉴' }).waitFor({ timeout: 20_000 });
  42  | }
  43  | 
  44  | /** 지금 보이는 화면 점검 */
  45  | async function audit(page: Page) {
  46  |   return page.evaluate(() => {
  47  |     const vw = window.innerWidth, vh = window.innerHeight;
  48  |     const nav = document.querySelector('nav[aria-label="주 메뉴"]')?.getBoundingClientRect();
  49  |     const name = (el: Element) => (el.getAttribute('aria-label') || (el as HTMLElement).innerText || el.getAttribute('placeholder') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 24);
  50  |     const vis = (el: Element) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.top < vh; };
  51  |     const out = { overflow: Math.max(0, document.documentElement.scrollWidth - vw), small: [] as string[], clipped: [] as string[], offRight: [] as string[], under: [] as string[] };
  52  |     for (const el of document.querySelectorAll('button, [role=button], [role=tab], select, input:not([type=checkbox]):not([type=file]):not([type=hidden]), a.btn, a.chip')) {
  53  |       if (!vis(el)) continue;
  54  |       const r = el.getBoundingClientRect();
  55  |       if (r.height < 30 || r.width < 30) out.small.push(`${name(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  56  |       if (r.right > vw + 1) out.offRight.push(name(el));
  57  |       // 아래 메뉴 뒤에 깔린 단추 (스크롤해도 늘 가려지면 못 누름 — 화면 맨 아래 걸음에서 의미 있음)
  58  |       if (nav && !el.closest('nav') && r.top < nav.bottom && r.bottom > nav.top + 10 && r.left < nav.right && r.right > nav.left && document.documentElement.scrollHeight - window.scrollY - vh < 4) out.under.push(name(el));
  59  |     }
  60  |     for (const el of document.querySelectorAll('body *')) {
  61  |       const e = el as HTMLElement;
  62  |       if (e.childElementCount || !e.textContent?.trim() || !vis(e)) continue;
  63  |       const s = getComputedStyle(e);
  64  |       if (e.scrollWidth > e.clientWidth + 2 && s.overflowX !== 'visible' && s.textOverflow !== 'ellipsis') out.clipped.push(e.textContent.trim().slice(0, 28));
  65  |     }
  66  |     for (const k of ['small', 'clipped', 'offRight', 'under'] as const) out[k] = [...new Set(out[k])].slice(0, 12);
  67  |     return out;
  68  |   });
  69  | }
  70  | 
  71  | async function shot(page: Page, label: string, full = false) {
  72  |   await page.waitForTimeout(900);
  73  |   n++;
  74  |   const file = `${String(n).padStart(2, '0')}-${label}.jpg`;
  75  |   await page.screenshot({ path: path.join(OUT, file), fullPage: full, type: 'jpeg', quality: 80 }).catch(() => undefined);
  76  |   const a = await audit(page).catch(() => null);
  77  |   log(`[${file}] ${page.url().replace(/^https?:\/\/[^/]+/, '')}`);
  78  |   if (a) {
  79  |     if (a.overflow) log(`  - 옆으로 넘침 ${a.overflow}px`);
  80  |     if (a.offRight.length) log(`  - 화면 밖 단추: ${a.offRight.join(' / ')}`);
  81  |     if (a.clipped.length) log(`  - 잘린 글: ${a.clipped.join(' / ')}`);
  82  |     if (a.small.length) log(`  - 작은 누를 곳(<30px): ${a.small.join(' / ')}`);
  83  |     if (a.under.length) log(`  - 아래 메뉴에 가려짐: ${a.under.join(' / ')}`);
  84  |   }
  85  | }
  86  | 
  87  | /** 한 걸음: 막혀도 멈추지 않고 적어 둔다 */
  88  | async function step(page: Page, label: string, fn: () => Promise<void>, full = false) {
  89  |   try {
  90  |     await fn();
  91  |     await shot(page, label, full);
  92  |   } catch (e) {
  93  |     log(`[막힘] ${label}: ${(e as Error).message.split('\n')[0].slice(0, 200)}`);
  94  |     await shot(page, `${label}-막힘`);
  95  |   }
  96  | }
  97  | const toastText = async (page: Page) => (await page.getByRole('status').first().textContent({ timeout: 4000 }).catch(() => ''))?.trim() ?? '';
  98  | 
  99  | // ───────────────────────── 여행 이야기: 계획 → 떠나기 → 다녀와서 기록 ─────────────────────────
  100 | const kst = (offsetDays: number) => { const d = new Date(Date.now() + 9 * 3600_000 + offsetDays * 86400_000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
  101 | const ymdStr = (o: { y: number; m: number; d: number }) => `${o.y}-${String(o.m).padStart(2, '0')}-${String(o.d).padStart(2, '0')}`;
  102 | /** 시간이 흐른 셈 치기: 여행 날짜를 오늘 기준으로 옮긴다 (from~to: 오늘부터 며칠) */
  103 | async function moveTrip(id: string, from: number, to: number) {
  104 |   const a = kst(from), b = kst(to);
> 105 |   await tripsCol.doc(id).update({ when: { p: 'day', y: a.y, m: a.m, d: a.d, y2: b.y, m2: b.m, d2: b.d } });
      |                  ^ Error: Value for argument "documentPath" is not a valid resource path. Path must be a non-empty string.
  106 | }
  107 | /** 폰 사진첩에서 고른 것처럼: 색 다른 jpg 몇 장 */
  108 | async function photos(page: Page, k: number) {
  109 |   const urls = await page.evaluate((count) => Array.from({ length: count }, (_, i) => {
  110 |     const c = document.createElement('canvas'); c.width = 1200; c.height = 900;
  111 |     const g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 1200, 900);
  112 |     gr.addColorStop(0, `hsl(${(i * 67) % 360},70%,70%)`); gr.addColorStop(1, `hsl(${(i * 67 + 140) % 360},60%,40%)`);
  113 |     g.fillStyle = gr; g.fillRect(0, 0, 1200, 900); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(300 + i * 90, 300, 110, 0, 7); g.fill();
  114 |     return c.toDataURL('image/jpeg', 0.85);
  115 |   }), k);
  116 |   return urls.map((u, i) => ({ name: `IMG_${2000 + i}.jpg`, mimeType: 'image/jpeg', buffer: Buffer.from(u.split(',')[1], 'base64') }));
  117 | }
  118 | const say = (page: Page, s: string) => page.getByText(s).first().isVisible().catch(() => false);
  119 | 
  120 | test('여행 이야기: 국내는 둘이 고르고, 해외는 가고 싶은 도시에서 — 계획하고 다녀와서 기록까지', async ({ browser }) => {
  121 |   test.setTimeout(45 * 60_000);
  122 |   const me = await phone(browser);
  123 |   const bora = await phone(browser);
  124 |   await signIn(me);
  125 |   await signIn(bora, BORA, '보라');
  126 |   const both = [me, bora];
  127 |   void both;
  128 | 
  129 |   // ━━ 국내: 다음 달 1박 2일, 어디 갈지 모름 ━━
  130 |   log('\n==== 국내 여행: 다음 달 1박 2일, 어디 갈지 모르는 상태에서 ====');
  131 |   await step(me, 'k01-home-start', async () => { await me.goto('/'); });
  132 |   await step(me, 'k02-ask-where', async () => {
  133 |     await me.goto('/ask');
  134 |     await me.getByLabel('질문').fill('다음 달에 1박 2일로 어디 갈까');
  135 |     await me.getByRole('button', { name: '묻기' }).click();
  136 |     await me.getByTestId('answer').last().waitFor({ timeout: 15_000 });
  137 |     log(`  · 물어보기 답: ${(await me.getByTestId('answer').last().innerText()).replace(/\s+/g, ' ').slice(0, 260)}`);
  138 |   });
  139 |   await step(me, 'k03-plus', async () => { await me.goto('/'); await me.getByRole('button', { name: '남기기' }).click(); });
  140 |   await step(me, 'k04-planner', async () => { await me.goto('/plan'); });
  141 |   await step(me, 'k05-planner-conds', async () => {
  142 |     await me.getByRole('button', { name: '다음 달', exact: true }).click().catch(() => undefined);
  143 |     await me.getByRole('button', { name: /^1박 2일$/ }).click().catch(() => undefined);
  144 |     await me.getByRole('button', { name: '국내', exact: true }).click().catch(() => undefined);
  145 |   }, true);
  146 |   await step(me, 'k06-cands', async () => { await me.getByTestId('planner-go').click(); await me.getByTestId('plan-cand').first().waitFor(); }, true);
  147 |   const draftUrl = me.url();
  148 |   const candNames = await me.getByTestId('plan-cand').locator('.plan-cand-name').allInnerTexts().catch(() => []);
  149 |   log(`  · 후보: ${candNames.join(' / ')}`);
  150 |   await step(me, 'k07-my-heart', async () => { await me.getByTestId('plan-heart').first().click(); });
  151 |   await step(me, 'k08-share-hint', async () => { await me.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); });
  152 |   await step(bora, 'k09-bora-home', async () => { await bora.goto('/'); });
  153 |   await step(bora, 'k10-bora-feed', async () => { await bora.goto('/feed'); });
  154 |   await step(bora, 'k11-bora-draft', async () => { await bora.goto(draftUrl); await bora.getByTestId('plan-cand').first().waitFor(); }, true);
  155 |   await step(bora, 'k12-bora-heart', async () => { await bora.getByTestId('plan-heart').first().click(); });
  156 |   await step(me, 'k13-me-sees-match', async () => { await me.reload(); await me.getByTestId('plan-decide').first().waitFor({ timeout: 15_000 }); });
  157 |   await step(me, 'k14-decided', async () => { await me.getByTestId('plan-decide').first().click(); await me.waitForURL(/plan-next/, { timeout: 15_000 }); log(`  · 알림: ${await toastText(me)}`); });
  158 |   const krTrip = /\/trips\/([^/?]+)/.exec(me.url())?.[1] ?? '';
  159 |   log(`  · 만든 여행: ${krTrip}`);
  160 | 
  161 |   // 다섯 걸음
  162 |   await step(me, 'k15-flow-when', async () => { await me.getByTestId('flow-cal').waitFor(); }, true);
  163 |   await step(me, 'k16-flow-stay', async () => { await me.getByTestId('flow-when-save').click(); await me.getByTestId('plan-flow').and(me.locator('[data-step="stay"]')).waitFor(); });
  164 |   await step(me, 'k17-flow-stay-hood', async () => {
  165 |     const hood = me.getByTestId('flow-hood').first();
  166 |     if (await hood.count()) await hood.click(); else await me.getByLabel('숙소').fill('바다 보이는 숙소');
  167 |   });
  168 |   await step(me, 'k18-flow-pick', async () => {
  169 |     // 동네를 누르면 바로 다음 걸음으로 간다. 아직 숙소 걸음이면 저장
  170 |     if ((await me.getByTestId('plan-flow').getAttribute('data-step')) === 'stay') await me.getByTestId('flow-stay-save').click();
  171 |     await me.getByTestId('pick-card').first().waitFor();
  172 |   }, true);
  173 |   await step(me, 'k19-flow-pick-hearts', async () => { for (let i = 0; i < 3; i++) await me.getByTestId('pick-card').nth(i).locator('.pick-hit').click(); });
  174 |   await step(me, 'k20-flow-pick-eat', async () => { await me.getByRole('tab', { name: /먹을 것/ }).click(); await me.getByTestId('pick-card').first().locator('.pick-hit').click(); });
  175 |   await step(bora, 'k21-bora-pick', async () => {
  176 |     await bora.goto(`/trips/${krTrip}/plan-next?step=pick`);
  177 |     await bora.getByTestId('pick-card').first().waitFor();
  178 |     await bora.getByTestId('pick-card').nth(0).locator('.pick-hit').click();
  179 |     await bora.getByTestId('pick-card').nth(3).locator('.pick-hit').click();
  180 |   }, true);
  181 |   await step(bora, 'k22-bora-trip-home', async () => { await bora.goto('/'); });
  182 |   await step(me, 'k23-flow-route', async () => { await me.reload(); await me.getByTestId('flow-pick-next').click(); await me.getByTestId('flow-day').first().waitFor(); }, true);
  183 |   await step(me, 'k24-flow-way', async () => { const o = me.getByTestId('way-go-open'); if (await o.count()) { await o.click(); await me.getByTestId('way-sheet').waitFor(); } });
  184 |   await step(me, 'k25-flow-way-picked', async () => {
  185 |     const pick = me.getByTestId('transit-pick').first();
  186 |     if (await pick.count()) await pick.click(); else if (await me.getByTestId('way-car').count()) await me.getByTestId('way-car').click();
  187 |     log(`  · 알림: ${await toastText(me)}`);
  188 |   });
  189 |   await step(me, 'k26-flow-hope', async () => { await me.getByTestId('flow-route-save').click(); await me.getByLabel('기대 한 줄').waitFor(); }, true);
  190 |   await step(me, 'k27-flow-hope-write', async () => { await me.getByLabel('기대 한 줄').fill('바다 보면서 아침 먹기'); });
  191 |   await step(me, 'k28-flow-done', async () => { await me.getByTestId('flow-hope-save').click(); log(`  · 알림: ${await toastText(me)}`); });
  192 |   await step(me, 'k29-trip-after-plan', async () => { await me.goto(`/trips/${krTrip}`); }, true);
  193 |   await step(me, 'k30-trip-plan-tab', async () => { await me.getByRole('tab', { name: /일정/ }).click(); }, true);
  194 |   await step(me, 'k31-trip-prep-tab', async () => { await me.getByRole('tab', { name: /준비/ }).click(); }, true);
  195 |   await step(me, 'k32-home-before', async () => { await me.goto('/'); });
  196 |   await step(bora, 'k33-bora-hope', async () => { await bora.goto(`/trips/${krTrip}/plan-next?step=hope`); await bora.getByLabel('기대 한 줄').fill('노을 보면서 산책'); await bora.getByTestId('flow-hope-save').click(); });
  197 | 
  198 |   // 떠나기 하루 전 → 여행 중
  199 |   log('\n---- 시간이 흘러: 내일 떠나요 ----');
  200 |   await moveTrip(krTrip, 1, 2);
  201 |   await step(me, 'k34-home-dday1', async () => { await me.goto('/'); });
  202 |   await step(me, 'k35-prep-dday1', async () => { await me.goto(`/trips/${krTrip}?tab=prep`); }, true);
  203 |   log('\n---- 여행 중 (첫날) ----');
  204 |   await moveTrip(krTrip, 0, 1);
  205 |   await me.context().grantPermissions(['geolocation']);
```