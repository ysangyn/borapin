# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: circles.spec.ts >> 모임: 만들고 → 가게를 걸고 → 손님 친구가 들어와 보고 → 손님도 건다
- Location: tests/circles.spec.ts:20:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('circle-news')
Expected substring: "대학 친구 모임에 새 가게 2곳"
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('circle-news') with timeout 20000ms
  - waiting for getByTestId('circle-news')

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "우리 공간":
  - /url: /space
  - text: 보 영 m
- text: 보라 · 영상 외 1명의 지도 세 번의 여행, 핀 3개 꽂았어요
- searchbox "지역 찾기"
- link "삼척시 여행 보기":
  - /url: /trips/c5bWmwq6DaPBfndo4nP9
- text: 다가오는 여행 삼척시 여행 D-13 · 삼척시 계획 1/5 · 다음은 '어디서 자요' · 2026.12.5–6
- link "이어서 계획하기":
  - /url: /trips/c5bWmwq6DaPBfndo4nP9/plan-next?step=stay
- link "내 지도 2곳":
  - /url: /maps
- link "담기":
  - /url: /places/new
- link "강릉시 맛집 1":
  - /url: /region/kr:51150?tab=places
- link "고양시 맛집 1":
  - /url: /region/kr:41280?tab=places
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 동해 서해 남해 1 1 1
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 핀 꽂기 단추가 나와요 전체 보기 단추를 누르면 전국이 보여요 2 다녀온 시·군 1 개국 3 여행·나들이 3 예정
- textbox "물어보기":
  - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 2곳":
  - /url: /wishes
- link "다음 여행 · D-13 반다르스리브가완 여행 2026.12.5–9":
  - /url: /trips/xPUx6hPZ6JdIm0tDNyPP
- link "제주 여행 날짜 미정":
  - /url: /trips/CXnDfRDsQ01uSOejhTEa
- link "부산 영상":
  - /url: /wishes/Xxw8Gt4Sy0LuVcWIkJzC
- text: 오늘의 한 질문
- paragraph: 제주에 가면 꼭 듣고 싶은 노래나 틀고 싶은 음악은?
- text: 나 흑돼지랑 고기국수 상대가 답하면 서로의 답이 열려요 브루나이 반다르스리브가완 가는 길
- button "가기 좋은 때 2~4월 · 비가 조금 덜 와요"
- button "입국 무비자 30일 · 입국 전 전자 도착 카드 · 떠나기 전 확인"
- button "BND 브루나이 달러 · 말레이어 · 콘센트 G(230V) · 한국보다 1시간 느려요"
- group: 자세히 · 한마디 ▾
- link "오늘의 영어 3문장 · 90초":
  - /url: /study
- group: 이달의 추천 · 가고 싶은 곳 · 최근 기록
- navigation "주 메뉴":
  - link "홈":
    - /url: /
  - link "여행":
    - /url: /trips
  - button "남기기"
  - link "지도":
    - /url: /map
  - link "새 소식 2개 피드":
    - /url: /feed
    - text: 피드
- link "물어보기":
  - /url: /ask
- status
```

# Test source

```ts
  23  |   await owner.goto('/');
  24  |   await signIn(owner, OWNER);
  25  |   await expect(owner.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 20_000 });
  26  | 
  27  |   // 걸 가게 하나 담기 (메모는 모임에 보이면 안 된다)
  28  |   await owner.goto('/places/new');
  29  |   await owner.getByLabel('장소 이름').fill('모임빵집');
  30  |   await owner.getByLabel('어디 검색').fill('고양');
  31  |   await owner.getByRole('option', { name: /고양시/ }).first().click();
  32  |   await owner.getByTestId('place-save').click();
  33  |   await expect(owner.getByRole('status')).toContainText('담았어요');
  34  | 
  35  |   // 지도 → 모임 → 새 모임
  36  |   await owner.goto('/map');
  37  |   await owner.getByTestId('map-circles').click();
  38  |   await expect(owner.getByTestId('circles')).toBeVisible();
  39  |   await owner.getByLabel('모임 이름').fill('대학 친구');
  40  |   await owner.getByTestId('circle-make').click();
  41  |   await expect(owner.getByTestId('circle-page')).toBeVisible({ timeout: 20_000 });
  42  |   await expect(owner.getByTestId('circle-people')).toContainText('방장');
  43  | 
  44  |   // 내 가게 걸기
  45  |   await owner.getByTestId('circle-add').click();
  46  |   const sheet = owner.getByTestId('circle-pick');
  47  |   await sheet.getByLabel('가게 이름 찾기').fill('모임빵집');
  48  |   await sheet.getByTestId('circle-hang').first().click();
  49  |   await expect(owner.getByRole('status')).toContainText('걸었어요');
  50  |   await sheet.getByRole('button', { name: '닫기' }).click();
  51  |   await expect(owner.getByTestId('circle-item')).toHaveCount(1);
  52  |   await expect(owner.getByTestId('circle-item').first()).toContainText('모임빵집');
  53  | 
  54  |   // 초대 링크
  55  |   await owner.getByTestId('circle-manage').click();
  56  |   await owner.getByTestId('circle-invite-make').click();
  57  |   const url = (await owner.getByTestId('circle-invite-row').first().getByTestId('invite-url').textContent())!.trim();
  58  |   expect(url).toMatch(/\/join\/[a-z0-9]{8,}$/);
  59  |   await shot(owner, '40-circle-owner');
  60  | 
  61  |   // 보라핀을 처음 쓰는 친구: 링크 → 로그인 → 모임에 들어가기 → 손님 화면
  62  |   const ctx = await browser.newContext({ locale: 'ko-KR', viewport: { width: 375, height: 760 } });
  63  |   const fr = await ctx.newPage();
  64  |   await fr.goto(url);
  65  |   await signIn(fr, FRIEND);
  66  |   await expect(fr.getByTestId('circle-join')).toBeVisible({ timeout: 20_000 });
  67  |   await expect(fr.getByTestId('join-title')).toContainText('대학 친구');
  68  |   await fr.getByLabel('모임 별명').fill('민지');
  69  |   await fr.getByTestId('join-go').click();
  70  |   await expect(fr.getByTestId('circle-page')).toBeVisible({ timeout: 20_000 });
  71  |   await expect(fr.getByTestId('circle-item').first()).toContainText('모임빵집');
  72  |   await expect(fr.getByTestId('circle-people')).toContainText('민지');
  73  |   // 손님은 남의 가게를 '가고 싶은 곳에 담기'·'내리기' 할 수 없다
  74  |   await expect(fr.getByTestId('circle-want')).toHaveCount(0);
  75  |   await expect(fr.getByTestId('circle-down')).toHaveCount(0);
  76  |   await shot(fr, '41-circle-guest');
  77  | 
  78  |   // 손님도 이름만 적어 건다
  79  |   await fr.getByTestId('circle-add').click();
  80  |   const g = fr.getByTestId('circle-guest-hang');
  81  |   await g.getByLabel('가게 이름').fill('민지네 단골 국수');
  82  |   await g.getByRole('button', { name: '또 갈래요' }).click();
  83  |   await g.getByLabel('한 줄').fill('면이 쫄깃해요');
  84  |   await g.getByTestId('circle-guest-save').click();
  85  |   await expect(fr.getByRole('status')).toContainText('걸었어요');
  86  |   await expect(fr.getByTestId('circle-item')).toHaveCount(2);
  87  | 
  88  |   // 손님도 지역을 고를 수 있다 (고르면 다른 사람이 가고 싶은 곳에 바로 담는다)
  89  |   await fr.getByTestId('circle-add').click();
  90  |   await g.getByLabel('가게 이름').fill('해운대 돼지국밥');
  91  |   await g.getByLabel('어디 검색').fill('부산');
  92  |   await g.getByRole('option', { name: /부산/ }).first().click();
  93  |   await g.getByTestId('circle-guest-save').click();
  94  |   await expect(fr.getByRole('status')).toContainText('걸었어요');
  95  |   await expect(fr.getByTestId('circle-item').filter({ hasText: '해운대 돼지국밥' })).toContainText('부산');
  96  | 
  97  |   // 별명 바꾸기 (이 모임에서만)
  98  |   await fr.getByTestId('circle-my-nick').click();
  99  |   await fr.getByTestId('circle-nick-edit').getByLabel('이 모임에서 쓸 별명').fill('민지짱');
  100 |   await fr.getByTestId('circle-nick-save').click();
  101 |   await expect(fr.getByRole('status')).toContainText('별명을 바꿨어요');
  102 |   await expect(fr.getByTestId('circle-people')).toContainText('민지짱');
  103 | 
  104 |   // 내가 건 가게에 사진 걸기 (사람처럼: 가게를 누르면 사진 칸이 열린다)
  105 |   const noodle = fr.getByTestId('circle-item').filter({ hasText: '민지네 단골 국수' });
  106 |   await noodle.click();
  107 |   await expect(noodle.getByTestId('circle-photos')).toBeVisible();
  108 |   await noodle.getByTestId('circle-photo-file').setInputFiles('tests/fixtures/photo-noexif.jpg');
  109 |   await expect(fr.getByRole('status')).toContainText('사진을 걸었어요', { timeout: 20_000 });
  110 |   await expect(noodle.getByTestId('circle-photo')).toHaveCount(1);
  111 |   await shot(fr, '43-circle-photo');
  112 | 
  113 |   // 손님은 우리 여행 기록·홈에 들어가지 못한다 (어디로 가도 모임으로)
  114 |   await fr.goto('/trips');
  115 |   await expect(fr).toHaveURL(/\/circles$/);
  116 |   await expect(fr.getByTestId('circle-row')).toHaveCount(1);
  117 |   await expect(fr.getByTestId('guest-note')).toBeVisible();
  118 |   await expect(fr.getByText('모임빵집')).toHaveCount(0);
  119 |   await ctx.close();
  120 | 
  121 |   // 주인 홈: 마지막으로 본 뒤 친구가 건 가게 두 곳이 '새 가게'로
  122 |   await owner.goto('/');
> 123 |   await expect(owner.getByTestId('circle-news')).toContainText('대학 친구 모임에 새 가게 2곳', { timeout: 20_000 });
      |                                                  ^ Error: expect(locator).toContainText(expected) failed
  124 |   await owner.getByTestId('circle-news').click();
  125 |   await expect(owner.getByTestId('circle-page')).toBeVisible();
  126 |   // 주인 화면에 친구가 건 가게가 보이고, 가고 싶은 곳에 담을 수 있다
  127 |   await expect(owner.getByTestId('circle-item')).toHaveCount(3, { timeout: 20_000 });
  128 |   await expect(owner.getByTestId('circle-people')).toContainText('민지짱');
  129 |   // 친구가 건 사진이 보인다
  130 |   const nood = owner.getByTestId('circle-item').filter({ hasText: '민지네 단골 국수' });
  131 |   await nood.click();
  132 |   await expect(nood.getByTestId('circle-photo')).toHaveCount(1, { timeout: 20_000 });
  133 |   // 지역을 고른 가게는 바로 담긴다
  134 |   await owner.getByTestId('circle-item').filter({ hasText: '해운대 돼지국밥' }).getByTestId('circle-want').click();
  135 |   await expect(owner.getByRole('status')).toContainText('가고 싶은 곳에 담았어요');
  136 |   // 다시 홈: 이제 본 뒤라 새 가게 줄이 없다
  137 |   await owner.goto('/');
  138 |   await expect(owner.getByTestId('place-search')).toBeVisible();
  139 |   await owner.waitForTimeout(1500);
  140 |   await expect(owner.getByTestId('circle-news')).toHaveCount(0);
  141 |   await owner.goto('/circles');
  142 |   await owner.getByTestId('circle-row').first().click();
  143 |   const theirs = owner.getByTestId('circle-item').filter({ hasText: '민지네 단골 국수' });
  144 |   await expect(theirs).toContainText('면이 쫄깃해요');
  145 |   await shot(owner, '42-circle-both');
  146 |   // 지역을 모르는 가게: 담기 화면으로 가서 이름이 들어가 있고 지역을 고른다
  147 |   await theirs.getByTestId('circle-want').click();
  148 |   await expect(owner.getByLabel('장소 이름')).toHaveValue('민지네 단골 국수');
  149 |   await owner.getByLabel('어디 검색').fill('고양');
  150 |   await owner.getByRole('option', { name: /고양시/ }).first().click();
  151 |   await owner.getByTestId('place-save').click();
  152 |   await expect(owner.getByRole('status')).toContainText('담았어요');
  153 | 
  154 |   // 가게 화면에서도: 이미 걸린 모임은 체크
  155 |   await owner.goto('/places');
  156 |   await owner.getByTestId('place-rec').filter({ hasText: '모임빵집' }).first().click();
  157 |   await expect(owner.getByTestId('circle-hang-row')).toBeVisible();
  158 |   await expect(owner.getByTestId('hang-대학 친구')).toHaveAttribute('aria-pressed', 'true');
  159 |   await owner.getByTestId('hang-대학 친구').click();
  160 |   await expect(owner.getByRole('status')).toContainText('대학 친구에서 내렸어요');
  161 |   await expect(owner.getByTestId('hang-대학 친구')).toHaveAttribute('aria-pressed', 'false');
  162 |   await owner.close();
  163 | });
  164 | 
```