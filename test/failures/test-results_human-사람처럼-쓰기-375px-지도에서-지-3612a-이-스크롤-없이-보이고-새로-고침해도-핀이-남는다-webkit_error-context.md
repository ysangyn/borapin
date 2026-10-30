# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다
- Location: tests/human.spec.ts:193:3

# Error details

```
Error: page.evaluate: TypeError: Illegal constructor
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - img "보라핀 로고" [ref=e6]
          - text: 보라핀
        - link "우리 공간" [ref=e10]:
          - /url: /space
          - generic "영상" [ref=e11]: 영
      - generic [ref=e13]:
        - generic [ref=e15]:
          - generic [ref=e16]: 영상의 지도
          - generic [ref=e17]: 한 번의 여행,핀 1개 꽂았어요
        - generic [ref=e18]:
          - generic [ref=e19]:
            - tablist [ref=e20]:
              - tab "국내" [selected] [ref=e21] [cursor=pointer]
              - tab "세계" [ref=e22] [cursor=pointer]
            - link "지도 크게 보기" [ref=e23]:
              - /url: /map
          - generic [ref=e24]:
            - generic [ref=e25]:
              - generic:
                - region "Map" [ref=e26] [cursor=pointer]
                - generic: 흑해
                - generic: 필리핀해
                - generic: 태즈먼해
                - generic: 벵골만
                - generic: 남중국해
                - generic: 아라비아해
                - generic: 카리브해
                - generic: 멕시코만
                - generic: 허드슨만
                - generic: 카스피해
                - generic: 알래스카만
                - generic: 홍해
                - generic: 오호츠크해
                - generic: 페르시아만
                - generic: 지중해
                - generic: 산호해
                - generic: 동해
                - generic: 술라웨시해
                - generic: 술루해
                - generic: 발트해
                - generic: 북해
                - generic: 자와해
                - generic: 안다만해
                - generic: 황해
                - generic: 동중국해
                - generic: 아라푸라해
                - generic: 티모르해
                - generic: 타이만
                - generic: 베링해
                - generic: 대한해협
                - generic: 동해
                - generic: 서해
                - generic: 남해
            - generic [aria-hidden]:
              - generic: 전남
              - generic: 경남
              - generic: 전북
              - generic: 광주
            - generic [ref=e27]:
              - button "확대" [ref=e28] [cursor=pointer]
              - separator [ref=e31]
              - button "축소" [ref=e32] [cursor=pointer]
              - separator [ref=e34]
              - button "전체 보기" [ref=e35] [cursor=pointer]
          - generic [ref=e38]: 지역을 누르면 핀 꽂기 단추가 나와요전체 보기 단추를 누르면 전국이 보여요
          - generic [ref=e39]:
            - generic [ref=e40]:
              - generic [ref=e41]: "1"
              - generic [ref=e42]: 다녀온 시·군
            - generic [ref=e43]:
              - generic [ref=e44]: "0"
              - generic [ref=e45]: 개국
            - generic [ref=e46]:
              - generic [ref=e47]: "1"
              - generic [ref=e48]: 여행·나들이
            - generic [ref=e49]:
              - generic [ref=e50]: "0"
              - generic [ref=e51]: 예정
        - textbox "물어보기" [ref=e53]:
          - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
        - generic [ref=e54]:
          - generic [ref=e55]:
            - heading "다음 여행 준비" [level=2] [ref=e56]
            - link "여행지 뽑기" [ref=e57]:
              - /url: /wishes?find=dice
          - generic [ref=e59]:
            - generic [ref=e60]: 가고 싶은 곳 3곳만 담아볼까요?
            - generic [ref=e61]:
              - link "경북 영주시 자세히 보기" [ref=e62]:
                - /url: /map?sel=kr:47210
                - generic [ref=e63]: 경북 영주시
                - generic [ref=e66]: 부석사의 무량수전과 소수서원의 선비길
              - button "담기" [ref=e67] [cursor=pointer]
            - generic [ref=e70]:
              - link "강원 동해시 자세히 보기" [ref=e71]:
                - /url: /map?sel=kr:51170
                - generic [ref=e72]: 강원 동해시
                - generic [ref=e75]: 푸른 동해와 신비로운 동굴 탐험
              - button "담기" [ref=e76] [cursor=pointer]
            - generic [ref=e79]:
              - link "충북 진천군 자세히 보기" [ref=e80]:
                - /url: /map?sel=kr:43750
                - generic [ref=e81]: 충북 진천군
                - generic [ref=e84]: 농다리의 신비와 초평호의 평화
              - button "담기" [ref=e85] [cursor=pointer]
          - link "오늘의 영어 3문장 · 90초" [ref=e88]:
            - /url: /study
        - generic [ref=e91]:
          - button "곡성군 Gokseong train village 어디인지 보기" [ref=e92] [cursor=pointer]:
            - img "곡성군 Gokseong train village" [ref=e93]
            - generic [ref=e94]: 곡성군 Gokseong train village
          - generic [ref=e97]:
            - generic [ref=e98]: 10월에 가기 좋은 곳
            - generic [ref=e99]: 전남 곡성군
            - generic [ref=e100]: 기차 마을의 추억과 장미 향기
            - generic [ref=e101]: 가기 좋은 때 4~6, 9·10월
            - generic [ref=e102]:
              - button "담기" [ref=e103] [cursor=pointer]
              - link "자세히" [ref=e106]:
                - /url: /map?sel=kr:46720
              - link "여기 기록" [ref=e107]:
                - /url: /record?place=kr:46720
        - link "전주시 오늘은 전주시를 다시 볼까요? 전주시 여행 날짜 모름" [ref=e108]:
          - /url: /trips/mzNopo2XkI33vbtfFoOe
          - generic [ref=e109]: 전주시
          - generic [ref=e110]:
            - generic [ref=e111]: 오늘은 전주시를 다시 볼까요?
            - generic [ref=e112]: 전주시 여행
            - generic [ref=e113]: 날짜 모름
        - generic [ref=e116]:
          - generic [ref=e117]:
            - heading "최근에 남긴 기록" [level=2] [ref=e118]
            - link "전체 보기" [ref=e119]:
              - /url: /trips
          - link "전주시 여행 전북 전주시 · 날짜 모름" [ref=e121]:
            - /url: /trips/mzNopo2XkI33vbtfFoOe
            - generic [ref=e123]:
              - generic [ref=e124]: 전주시 여행
              - generic [ref=e125]: 전북 전주시 · 날짜 모름
      - dialog "전북 전주시" [ref=e126]:
        - generic [ref=e127]:
          - button "전주 한옥마을 어디인지 보기" [ref=e130] [cursor=pointer]:
            - img "전주 한옥마을" [ref=e131]
            - generic [ref=e132]: 전주 한옥마을
          - generic [ref=e135]:
            - generic [ref=e136]:
              - generic [ref=e137]: 전북 전주시
              - generic [ref=e138]: 가기 좋은 때 4·5, 9·10월 · 선선하고 비가 적어요
              - generic [ref=e139]: 한 번 다녀왔어요
              - generic [ref=e141]:
                - generic [ref=e142]: 전주시의 꽃 · 개나리
                - generic [ref=e143]: 꽃이 피기 시작했어요
                - generic [ref=e144]: 한 줄 평이나 메모를 남기면 꽃이 늘어요
            - generic [ref=e145]:
              - generic [aria-hidden] [ref=e146]:
                - generic [ref=e147]: "1"
                - generic [ref=e148]: 번째 핀
              - button "닫기" [ref=e149] [cursor=pointer]
          - generic [ref=e152]:
            - generic [ref=e153]: 한옥의 곡선과 선비의 풍류가 머무는 곳
            - generic [ref=e154]:
              - generic [ref=e155]: 볼거리
              - generic [ref=e156]:
                - button "전주한옥마을" [ref=e157] [cursor=pointer]
                - button "전동성당" [ref=e158] [cursor=pointer]
                - button "경기전" [ref=e159] [cursor=pointer]
                - button "자만벽화마을" [ref=e160] [cursor=pointer]
                - button "덕진공원" [ref=e161] [cursor=pointer]
            - generic [ref=e162]:
              - generic [ref=e163]: 먹거리
              - generic [ref=e164]:
                - button "전주 비빔밥" [ref=e165] [cursor=pointer]
                - button "콩나물국밥(현대옥/삼백집)" [ref=e166] [cursor=pointer]
                - button "피순대" [ref=e167] [cursor=pointer]
                - button "전주 막걸리 골목" [ref=e168] [cursor=pointer]
            - generic [ref=e169]:
              - generic [ref=e170]:
                - generic [ref=e171]: 관광지
                - generic [ref=e172]: 한국관광공사 · 누르면 지도
              - generic [ref=e173]:
                - generic [ref=e174]:
                  - button "용담댐 조각공원" [ref=e175] [cursor=pointer]
                  - button "용담댐 조각공원 가고 싶어요" [ref=e178] [cursor=pointer]: ♡
                - generic [ref=e179]:
                  - button "마이산 벚꽃길" [ref=e180] [cursor=pointer]
                  - button "마이산 벚꽃길 가고 싶어요" [ref=e183] [cursor=pointer]: ♡
                - generic [ref=e184]:
                  - button "군산 시간여행마을" [ref=e185] [cursor=pointer]
                  - button "군산 시간여행마을 가고 싶어요" [ref=e188] [cursor=pointer]: ♡
                - generic [ref=e189]:
                  - button "순창건강장수체험과학관" [ref=e190] [cursor=pointer]
                  - button "순창건강장수체험과학관 가고 싶어요" [ref=e193] [cursor=pointer]: ♡
                - generic [ref=e194]:
                  - button "설화공원" [ref=e195] [cursor=pointer]
                  - button "설화공원 가고 싶어요" [ref=e198] [cursor=pointer]: ♡
                - generic [ref=e199]:
                  - button "서림공원" [ref=e200] [cursor=pointer]
                  - button "서림공원 가고 싶어요" [ref=e203] [cursor=pointer]: ♡
                - generic [ref=e204]:
                  - button "유유마을" [ref=e205] [cursor=pointer]
                  - button "유유마을 가고 싶어요" [ref=e208] [cursor=pointer]: ♡
                - generic [ref=e209]:
                  - button "고원화목원" [ref=e210] [cursor=pointer]
                  - button "고원화목원 가고 싶어요" [ref=e213] [cursor=pointer]: ♡
              - generic [ref=e214]:
                - generic [ref=e215]: 편하게
                - generic [ref=e216]: 휠체어·유모차로 다니기 편한 관광지 175곳 (무장애 정보)
            - generic [ref=e217]:
              - generic [ref=e218]: 가는 길
              - generic [ref=e219]: KTX 전주역 5km · 군산공항 46km
            - button "더보기" [ref=e220] [cursor=pointer]
          - link "전주시 여행 전북 전주시 · 날짜 모름" [ref=e222]:
            - /url: /trips/mzNopo2XkI33vbtfFoOe
            - generic [ref=e224]:
              - generic [ref=e225]: 전주시 여행
              - generic [ref=e226]: 전북 전주시 · 날짜 모름
          - generic [ref=e228]:
            - generic [ref=e229]: 우리 장소
            - link "+ 장소 남기기" [ref=e230]:
              - /url: /places/new?region=kr:52
          - generic [ref=e231]:
            - generic [ref=e232]: "'핀 꽂기'는 날짜 없이 다녀온 표시만 해요"
            - link "네이버지도" [ref=e233]:
              - /url: https://map.naver.com/p/search/%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C
            - link "구글지도" [ref=e234]:
              - /url: https://www.google.com/maps/search/?api=1&query=%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C
        - generic [ref=e235]:
          - button "핀 하나 더 꽂기" [ref=e236] [cursor=pointer]
          - link "자세히 기록" [ref=e239]:
            - /url: /record?place=kr:52
          - button "가고 싶은 곳에 담기" [ref=e240] [cursor=pointer]: 담기
    - status:
      - generic [ref=e243]:
        - generic [ref=e244]: 전주시에 핀을 꽂았어요 · '첫 핀' 배지를 받았어요
        - button "되돌리기" [ref=e245] [cursor=pointer]
  - iframe [aria-hidden] [ref=e246]
```

# Test source

```ts
  111 |       const r = el.getBoundingClientRect();
  112 |       if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') continue;
  113 |       if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
  114 |         bad.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} ${Math.round(r.left)}~${Math.round(r.right)}px "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  115 |       }
  116 |     }
  117 |     return { page: document.documentElement.scrollWidth > vw ? `가로 스크롤 ${document.documentElement.scrollWidth}px > ${vw}px` : null, bad: bad.slice(0, 8) };
  118 |   });
  119 | }
  120 | 
  121 | test.describe('사람처럼 쓰기', () => {
  122 |   test('구글 로그인 창을 거쳐 들어오고, 새로 고침해도 로그인이 유지된다', async ({ browser }) => {
  123 |     const page = await phone(browser);
  124 |     await googleSignIn(page);
  125 |     await page.reload();
  126 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  127 |     await expect(page.getByTestId('login')).toHaveCount(0);
  128 |     await page.context().close();
  129 |   });
  130 | 
  131 |   test('로그인 화면에서 이용약관 링크를 눌러 열고 로고로 돌아와도 화면이 살아 있다', async ({ browser }) => {
  132 |     // 약관 화면은 로그인 없이 보는 길(early return)이라, 앱 안에서 오갈 때 훅 개수가 달라지면 흰 화면이 됐다
  133 |     const page = await phone(browser);
  134 |     await page.goto('/');
  135 |     await expect(page.getByTestId('login')).toBeVisible();
  136 |     await page.getByRole('link', { name: '이용약관' }).click();
  137 |     await expect(page).toHaveURL(/\/terms$/);
  138 |     await expect(page.getByRole('heading', { name: '이용약관', level: 1 })).toBeVisible();
  139 |     // 약관 화면끼리도 오간다
  140 |     await page.getByRole('link', { name: '개인정보 처리방침' }).click();
  141 |     await expect(page).toHaveURL(/\/privacy$/);
  142 |     // 로고를 누르면 로그인 화면으로 돌아오고, 오류 화면이 아니어야 한다
  143 |     await page.getByRole('link', { name: /보라핀 로고/ }).click();
  144 |     await expect(page).toHaveURL(/\/$/);
  145 |     await expect(page.getByTestId('login')).toBeVisible();
  146 |     await expect(page.getByText('이 화면을 여는 중에 문제가 생겼어요')).toHaveCount(0);
  147 |     // 로그인한 뒤 우리 공간의 약관 링크로도 같은 길을 오간다
  148 |     await signIn(page);
  149 |     await page.goto('/space');
  150 |     await page.getByRole('link', { name: '이용약관' }).click();
  151 |     await expect(page.getByRole('heading', { name: '이용약관', level: 1 })).toBeVisible();
  152 |     await page.getByRole('link', { name: /보라핀 로고/ }).click();
  153 |     await expect(page.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  154 |     await expect(page.getByText('이 화면을 여는 중에 문제가 생겼어요')).toHaveCount(0);
  155 |     await page.context().close();
  156 |   });
  157 | 
  158 |   test('375px: 손으로 입력해 기록하고, 새로 고침해도 남아 있다', { tag: '@webkit' }, async ({ browser }) => {
  159 |     const page = await phone(browser);
  160 |     await googleSignIn(page);
  161 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  162 |     await page.getByRole('menuitem', { name: /다녀온 곳 남기기/ }).click();
  163 |     // 단추 말과 알림 말이 같은 동사: '기록 남기기' → '기록했어요'
  164 |     await expect(page.getByTestId('save')).toHaveText('기록 남기기');
  165 |     // 장소: 한 글자씩 쳐서 찾기
  166 |     await page.getByLabel('어디 검색').click();
  167 |     await page.keyboard.type('경주', { delay: 60 });
  168 |     await page.getByRole('option', { name: /경주시/ }).first().click();
  169 |     await expect(page.getByRole('button', { name: /경주시 빼기/ })).toBeVisible();
  170 |     await page.getByLabel('제목').click();
  171 |     await page.keyboard.type('경주 첫 벚꽃 여행', { delay: 30 });
  172 |     // 언제를 안 골랐으면 저장 버튼 아래에 무엇이 빠졌는지 알려 준다
  173 |     await expect(page.getByTestId('save')).toBeDisabled();
  174 |     await expect(page.getByTestId('save-hint')).toContainText('언제인지 골라');
  175 |     await page.getByRole('button', { name: '몇 년', exact: true }).click();
  176 |     await page.getByLabel('연도').selectOption('2024');
  177 |     await expect(page.getByTestId('save-hint')).toHaveCount(0);
  178 |     await page.getByTestId('save').click();
  179 |     await expect(page.getByRole('status')).toContainText('기록했어요');
  180 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행');
  181 |     const url = page.url();
  182 |     // 새로 고침해도 그대로
  183 |     await page.reload();
  184 |     await expect(page.getByTestId('trip-title')).toHaveText('경주 첫 벚꽃 여행', { timeout: 20_000 });
  185 |     expect(page.url()).toBe(url);
  186 |     await page.goto('/trips');
  187 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible();
  188 |     await page.reload();
  189 |     await expect(page.getByText('경주 첫 벚꽃 여행')).toBeVisible({ timeout: 20_000 });
  190 |     await page.context().close();
  191 |   });
  192 | 
  193 |   test('375px: 지도에서 지역을 누르면 핀 꽂기 버튼이 스크롤 없이 보이고, 새로 고침해도 핀이 남는다', { tag: '@webkit' }, async ({ browser }) => {
  194 |     const page = await phone(browser);
  195 |     await signIn(page);
  196 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  197 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  198 |     // 전주 (꾸밈 사진이 있는 지역)
  199 |     await page.getByTestId('map').first().scrollIntoViewIfNeeded();
  200 |     await tapLngLat(page, 127.15, 35.82);
  201 |     const sheet = page.getByTestId('region-sheet');
  202 |     await expect(sheet.getByTestId('sheet-title')).toContainText('전주');
  203 |     // 가장 많이 쓰는 버튼은 창을 열자마자 보여야 한다 (스크롤해야 보이면 안 됨)
  204 |     await expect(sheet.getByTestId('quick-pin')).toBeInViewport({ ratio: 1 });
  205 |     // 단추 '핀 꽂기' → 알림 '핀을 꽂았어요'. 가고 싶은 곳 담기는 하트가 아니라 핀 모양 '담기'
  206 |     await expect(sheet.getByTestId('quick-pin')).toContainText('핀 꽂기');
  207 |     await expect(sheet.getByTestId('sheet-wish').or(sheet.getByTestId('sheet-wished'))).toContainText(/담기|담겼어요/);
  208 |     await sheet.getByTestId('quick-pin').click();
  209 |     await expect(page.getByRole('status')).toContainText('핀을 꽂았어요');
  210 |     // 아래로 끌어서 닫기 (손잡이를 잡고 200px 내림)
> 211 |     await page.evaluate(() => {
      |                ^ Error: page.evaluate: TypeError: Illegal constructor
  212 |       const grip = document.querySelector('[data-testid="region-sheet"] .grip')!;
  213 |       const r = grip.getBoundingClientRect(), x = r.left + r.width / 2;
  214 |       const t = (y: number) => new Touch({ identifier: 1, target: grip, clientX: x, clientY: y });
  215 |       grip.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [t(r.top)], targetTouches: [t(r.top)], changedTouches: [t(r.top)] }));
  216 |       for (const d of [20, 60, 120, 200]) grip.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true, touches: [t(r.top + d)], targetTouches: [t(r.top + d)], changedTouches: [t(r.top + d)] }));
  217 |       grip.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: [t(r.top + 200)] }));
  218 |     });
  219 |     await expect(sheet).toHaveCount(0);
  220 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  221 |     const after = await page.getByTestId('headline').textContent();
  222 |     await page.reload();
  223 |     await expect(page.getByTestId('headline')).toHaveText(after ?? '', { timeout: 20_000 });
  224 |     await page.context().close();
  225 |   });
  226 | 
  227 |   test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
  228 |     const page = await phone(browser);
  229 |     await signIn(page);
  230 |     await page.goto('/record');
  231 | 
  232 |     // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
  233 |     await page.getByLabel('어디 검색').click();
  234 |     const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
  235 |     await page.keyboard.press('Enter');
  236 |     await place.commit('강릉');
  237 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
  238 |     await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
  239 |     // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
  240 |     await page.keyboard.press('Enter');
  241 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  242 | 
  243 |     // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
  244 |     const who = page.getByLabel('함께 간 사람 이름');
  245 |     await who.click();
  246 |     const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
  247 |     await page.keyboard.press('Enter');
  248 |     await name.commit('할머니');
  249 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
  250 |     await expect(who).toHaveValue('할머니');
  251 |     await page.keyboard.press('Enter');
  252 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
  253 |     await expect(who).toHaveValue('');
  254 |     await page.context().close();
  255 |   });
  256 | 
  257 |   test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
  258 |     const page = await desktop(browser);
  259 |     await signIn(page);
  260 |     // PC 양옆엔 흐린 배경 장면이 붙는다 (폰에선 없음)
  261 |     await expect(page.getByTestId('backdrop')).toBeAttached({ timeout: 10_000 });
  262 |     await page.goto('/record');
  263 |     await page.getByLabel('어디 검색').fill('단양');
  264 |     await page.getByRole('option', { name: /단양군/ }).first().click();
  265 |     await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
  266 |     await page.getByRole('button', { name: '몰라요' }).click();
  267 |     await page.getByTestId('save').click();
  268 |     await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
  269 |     await page.getByRole('tab', { name: /사진/ }).click();
  270 |     await expect(page.getByTestId('photos-empty')).toBeVisible();
  271 |     const grid = page.getByTestId('photo-grid');
  272 | 
  273 |     const drag = (files: { name: string; type: string; b64: string }[]) =>
  274 |       page.evaluateHandle((fs) => {
  275 |         const dt = new DataTransfer();
  276 |         for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
  277 |         return dt;
  278 |       }, files);
  279 | 
  280 |     // 글 파일은 올리지 않는다
  281 |     const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
  282 |     await grid.dispatchEvent('dragenter', { dataTransfer: txt });
  283 |     await grid.dispatchEvent('dragover', { dataTransfer: txt });
  284 |     await grid.dispatchEvent('drop', { dataTransfer: txt });
  285 |     await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');
  286 | 
  287 |     // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
  288 |     const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
  289 |     await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
  290 |     await grid.dispatchEvent('dragover', { dataTransfer: jpg });
  291 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
  292 |     await grid.dispatchEvent('drop', { dataTransfer: jpg });
  293 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
  294 |     await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
  295 |     await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
  296 |     await expect(page.getByTestId('photos-empty')).toHaveCount(0);
  297 | 
  298 |     // 새로 고침해도 사진이 남아 있다
  299 |     await page.reload();
  300 |     await page.getByRole('tab', { name: /사진/ }).click();
  301 |     await expect(page.getByTestId('photo-grid').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 20_000 });
  302 |     await page.context().close();
  303 |   });
  304 | 
  305 |   test('375px: 어느 화면도 옆으로 넘치지 않는다', { tag: '@webkit' }, async ({ browser }) => {
  306 |     const page = await phone(browser);
  307 |     await page.goto('/');
  308 |     await expect(page.getByTestId('login')).toBeVisible();
  309 |     const found: string[] = [];
  310 |     const check = async (where: string) => {
  311 |       const o = await overflowing(page);
```