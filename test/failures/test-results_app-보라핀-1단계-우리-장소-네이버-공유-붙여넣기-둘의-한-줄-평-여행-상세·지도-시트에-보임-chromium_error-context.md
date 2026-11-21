# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임
- Location: tests/app.spec.ts:696:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('region-sheet').getByTestId('sheet-title')
Expected: "강원 강릉시"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByTestId('region-sheet').getByTestId('sheet-title') with timeout 15000ms
  - waiting for getByTestId('region-sheet').getByTestId('sheet-title')

```

```yaml
- img "보라핀 로고"
- text: 보라핀
- link "우리 공간":
  - /url: /space
  - text: 보 영
- text: 보라 & 영상의 지도 세 번의 여행, 핀 3개 꽂았어요
- searchbox "지역 찾기"
- link "삼척시 여행 보기":
  - /url: /trips/ZESd2pZO7WgG40Ay6F5N
- text: 다가오는 여행 삼척시 여행 D-7 · 삼척시 계획 1/5 · 다음은 '어디서 자요' · 2026.11.28–29
- link "이어서 계획하기":
  - /url: /trips/ZESd2pZO7WgG40Ay6F5N/plan-next?step=stay
- link "내 지도 1곳":
  - /url: /maps
- link "담기":
  - /url: /places/new
- link "강릉시 맛집 1":
  - /url: /region/kr:51150?tab=places
- tablist:
  - tab "국내" [selected]
  - tab "세계"
- link "지도 크게 보기":
  - /url: /map
- region "Map"
- text: 흑해 필리핀해 태즈먼해 벵골만 남중국해 아라비아해 카리브해 멕시코만 허드슨만 카스피해 알래스카만 홍해 오호츠크해 페르시아만 지중해 산호해 동해 술라웨시해 술루해 발트해 북해 자와해 안다만해 황해 동중국해 아라푸라해 티모르해 타이만 베링해 대한해협 1 1
- button "확대"
- separator
- button "축소"
- separator
- button "전체 보기"
- text: 지역을 누르면 핀 꽂기 단추가 나와요 전체 보기 단추를 누르면 전국이 보여요 2 다녀온 시·군 1 개국 3 여행·나들이 2 예정
- textbox "물어보기":
  - /placeholder: "물어보기: 강릉 맛집, 11월 축제"
- heading "다음 여행 준비" [level=2]
- link "가고 싶은 곳 1곳":
  - /url: /wishes
- link "다음 여행 제주 여행 날짜는 아직 안 정했어요":
  - /url: /trips/yFZkL84eWtLTZFDsnHbL
- link "대만 가오슝 그다음은 여기 · 영상":
  - /url: /wishes/b9Or0VgclBeRcMuKY3O5
- link "날짜 정하기":
  - /url: /trips/yFZkL84eWtLTZFDsnHbL/edit
- text: 오늘의 한 질문
- paragraph: 제주까지 어떻게 가고 싶어? (기차·차·비행기·버스)
- text: 나 흑돼지랑 고기국수 보라 한라산 보이는 카페 제주 가는 길
- button "가기 좋은 때 5·6, 9~11월 · 덥지도 춥지도 않아요"
- link "우리 집을 정하면 여기서 가는 길을 바로 열 수 있어요":
  - /url: /space#home
- button "가는 길 제주공항 15km"
- link "가는 길에 들를 곳 찾기 · 우리 집을 정하면 찾아 드려요":
  - /url: /space#home
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
  - link "새 소식 1개 피드":
    - /url: /feed
    - text: 피드
- link "물어보기":
  - /url: /ask
- status
```

# Test source

```ts
  633 |     // 우리 집을 안 정했으면 정하러 가는 안내만
  634 |     await expect(way.getByTestId('home-route-empty')).toBeVisible();
  635 |     await en.click();
  636 |     await expect(page).toHaveURL(/\/study$/);
  637 |   });
  638 | 
  639 |   test('여행 계획하기: + → 조건만 고르면 후보 3곳 → 둘이 하트 → 여기로 정해요 → 갈 예정 여행과 하루 뼈대', async ({ page, browser }) => {
  640 |     await signIn(page, OWNER);
  641 |     await expect(page.getByTestId('headline')).toBeVisible();
  642 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  643 |     await expect(page.getByTestId('plus-sheet')).toBeVisible();
  644 |     await page.getByRole('menuitem', { name: /여행 계획하기/ }).click();
  645 |     await expect(page).toHaveURL(/\/plan$/);
  646 |     await page.getByRole('button', { name: '다음 주말' }).click();
  647 |     await page.getByRole('button', { name: '1박 2일' }).click();
  648 |     await page.getByRole('button', { name: '국내', exact: true }).click();
  649 |     await shot(page, '10h-planner');
  650 |     await page.getByTestId('planner-go').click();
  651 |     await expect(page).toHaveURL(/\/plan\/[A-Za-z0-9]+$/);
  652 |     const cands = page.getByTestId('plan-cand');
  653 |     await expect(cands).toHaveCount(3);
  654 |     const url = page.url();
  655 |     // 나만 하트 → 상대를 기다린다
  656 |     await cands.first().getByTestId('plan-heart').click();
  657 |     await expect(cands.first().getByTestId('plan-heart')).toHaveAttribute('aria-pressed', 'true');
  658 |     await expect(cands.first()).toContainText('상대가 고르길 기다려요');
  659 |     await expect(cands.first().getByTestId('plan-decide')).toHaveCount(0);
  660 |     await shot(page, '10i-plan-pick');
  661 |     const name = (await cands.first().locator('.plan-cand-name').textContent())!.trim();
  662 |     // 보라가 같은 링크로 와서 같은 곳에 하트 → 여기로 정해요
  663 |     const bora = await browser.newPage();
  664 |     await signIn(bora, 'bora@example.com');
  665 |     await bora.goto(url);
  666 |     const bc = bora.getByTestId('plan-cand').filter({ hasText: name });
  667 |     await expect(bc).toContainText('영상');
  668 |     await bc.getByTestId('plan-heart').click();
  669 |     await expect(bc.getByTestId('plan-decide')).toBeVisible();
  670 |     await bora.close();
  671 |     // 내 화면에도 바로 '여기로 정해요'가 뜬다
  672 |     await expect(cands.first().getByTestId('plan-decide')).toBeVisible({ timeout: 15_000 });
  673 |     await cands.first().getByTestId('plan-decide').click();
  674 |     // 정하면 바로 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서 FLAGS.planFlow 켜짐)
  675 |     await expect(page.getByRole('status')).toContainText('이어서 계획해요');
  676 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\/plan-next/);
  677 |     const flow = page.getByTestId('plan-flow');
  678 |     await expect(flow).toHaveAttribute('data-step', 'when');
  679 |     await expect(page.getByTestId('flow-nights')).toHaveText('1박 2일');
  680 |     // 고른 날(다음 주말)이 달력에 칠해져 있다
  681 |     await expect(page.getByTestId('flow-cal').locator('.c.start')).toHaveCount(1);
  682 |     await shot(page, '10j-plan-when');
  683 |     await page.getByTestId('flow-when-save').click();
  684 |     await expect(flow).toHaveAttribute('data-step', 'stay');
  685 |     // 여기서 멈추고 여행으로 → 맨 위 '이어서 계획하기 1/5 · 다음은 어디서 자요'
  686 |     const tripUrl = page.url().replace(/\/plan-next.*$/, '');
  687 |     await page.goto(tripUrl);
  688 |     await expect(page.getByTestId('plan-continue')).toContainText("1/5 · 다음은 '어디서 자요'");
  689 |     await page.getByTestId('plan-continue').click();
  690 |     await expect(flow).toHaveAttribute('data-step', 'stay');
  691 |     // 정한 뒤 계획 화면은 '정했어요'
  692 |     await page.goto(url);
  693 |     await expect(page.getByTestId('plan-decided')).toBeVisible();
  694 |   });
  695 | 
  696 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  697 |     await signIn(page, OWNER);
  698 |     await page.goto('/trips');
  699 |     await page.getByText('강릉시 여행', { exact: true }).click();
  700 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 맛집·카페 남기기' }).click();
  701 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  702 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  703 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  704 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
  705 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  706 |     // 가리고 쓰기: 켜면 내 것을 쓰기 전엔 보라 칸이 가려지고, 쓰면 열린다 (끄면 그냥 보인다)
  707 |     await page.getByTestId('blind-toggle').click();
  708 |     await expect(page.getByTestId('review-hidden')).toBeVisible();
  709 |     await expect(page.getByLabel('보라 한 줄 평')).toHaveCount(0);
  710 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  711 |     await expect(page.getByLabel('보라 한 줄 평')).toBeVisible();
  712 |     await page.getByTestId('blind-toggle').click();
  713 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  714 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  715 |     await shot(page, '11-place-edit');
  716 |     await page.getByTestId('place-save').click();
  717 |     // 개요엔 들른 곳 요약 한 줄만, 평가·한 줄 평은 '들른 곳' 탭에
  718 |     const tp = page.getByTestId('trip-places');
  719 |     await expect(tp).toContainText('맛집·명소 1곳');
  720 |     await expect(tp).toContainText('초당할머니순두부');
  721 |     await tp.getByTestId('places-summary').click();
  722 |     await expect(page.getByRole('tab', { name: '맛집·명소' })).toHaveAttribute('aria-selected', 'true');
  723 |     const visited = page.getByTestId('trip-visited');
  724 |     await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
  725 |     await expect(visited).toContainText('또 갈래요');
  726 |     await expect(visited).toContainText('순두부 젤라또까지 완벽');
  727 | 
  728 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  729 |     await page.goto('/');
  730 |     await expectMapDrawn(page);
  731 |     await tapLngLat(page, 128.86, 37.73);
  732 |     const sheet = page.getByTestId('region-sheet');
> 733 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
      |                                                    ^ Error: expect(locator).toHaveText(expected) failed
  734 |     await expect(sheet).toContainText('맛집·명소 · 1');
  735 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  736 | 
  737 |     // 우리 장소 목록과 '또 갈래요' 거르기
  738 |     await page.goto('/places');
  739 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  740 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  741 |     await shot(page, '11b-places');
  742 | 
  743 |     // 장소를 열면 '보기' 화면: 이름·지도 앱·자리 그림·한 줄 평, 고치기를 누르면 고치는 칸
  744 |     await page.getByTestId('place-rec').click();
  745 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  746 |     // 바깥으로 가는 단추는 설정한 지도 앱 길찾기 하나뿐 (11-05 바깥 링크 줄이기)
  747 |     await expect(page.getByTestId('map-app')).toHaveCount(1);
  748 |     await expect(page.getByTestId('spot-map')).toBeVisible();
  749 |     await expect(page.getByText('아침으로 최고')).toBeVisible();
  750 |     await shot(page, '11c-place-view');
  751 |     await page.getByTestId('place-edit').click();
  752 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  753 |     await page.getByLabel('장소 메모').fill('줄 30분');
  754 |     await page.getByTestId('place-save').click();
  755 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  756 |     await expect(page.getByText('줄 30분')).toBeVisible();
  757 |   });
  758 | 
  759 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  760 |     await signIn(page, OWNER);
  761 |     await page.goto('/trips');
  762 |     await page.getByText('강릉시 여행', { exact: true }).click();
  763 |     await page.getByRole('tab', { name: /사진/ }).click();
  764 |     const sec = page.getByTestId('trip-photos');
  765 |     await sec.getByTestId('photo-input').setInputFiles([
  766 |       'tests/fixtures/photo-gangneung.jpg',
  767 |       'tests/fixtures/photo-gangneung2.jpg',
  768 |       'tests/fixtures/photo-noexif.jpg',
  769 |     ]);
  770 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  771 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  772 |     // 촬영일(2019.5.3~4)로 날짜 채우기
  773 |     const sug = page.getByTestId('photo-suggest');
  774 |     await expect(sug).toContainText('2019.5.3–4');
  775 |     await sug.getByRole('button', { name: '채우기' }).click();
  776 |     await expect(page.getByText(/^2019\.5\.3–4( · 1박 2일)?$/).first()).toBeVisible();
  777 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  778 |     await shot(page, '12-photos');
  779 |     // 표지 사진은 개요 탭 위에
  780 |     await page.getByRole('tab', { name: '개요' }).click();
  781 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  782 |     await page.getByRole('tab', { name: /사진/ }).click();
  783 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  784 |     await sec.locator('.photo-cell img').first().click();
  785 |     const cap = page.locator('.pswp__caption-bp');
  786 |     await expect(cap).toContainText('2019.5.3 14:20');
  787 |     await expect(cap).toContainText('강원 강릉시');
  788 |     await page.waitForTimeout(600);
  789 |     await shot(page, '12b-slideshow');
  790 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  791 |     await page.keyboard.press('Escape');
  792 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  793 |     await page.goto('/memories');
  794 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  795 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  796 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  797 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  798 |     await expect(albumImgs).toHaveCount(3);
  799 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  800 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  801 |     await page.getByLabel('다시 보기 연도').fill('0');
  802 |     const firstYear = await page.getByTestId('replay-year').textContent();
  803 |     await page.getByTestId('replay-play').click();
  804 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  805 |     await page.getByLabel('결산 연도').selectOption('2019');
  806 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  807 |     await expect(page.getByTestId('year-review')).toContainText('2');
  808 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  809 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  810 |     await shot(page, '12c-memories');
  811 |   });
  812 | 
  813 |   test('여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  814 |     await signIn(page, OWNER);
  815 |     // 홈 단계 카드: 다음 주말 여행(계획하기로 만든 것). 단추는 말한 탭(준비)으로, 카드는 개요로
  816 |     await expect(page.getByTestId('headline')).toBeVisible();
  817 |     const stage = page.getByTestId('stage-card');
  818 |     await expect(stage).toHaveAttribute('data-stage', 'before');
  819 |     // 계획 걸음이 남았으면 단추는 '이어서 계획하기' (남은 첫 걸음으로)
  820 |     await expect(stage.getByTestId('stage-plan')).toHaveText('이어서 계획하기');
  821 |     await expect(stage.getByTestId('stage-plan')).toHaveAttribute('href', /^\/trips\/[^/?]+\/plan-next\?step=stay$/);
  822 |     await expect(stage).toContainText("계획 1/5 · 다음은 '어디서 자요'");
  823 |     // 접힌 둘러보기 칸 제목엔 '추억'이 없다 (추억 카드는 있으면 접힌 칸 안에)
  824 |     await expect(page.getByTestId('home-more').locator('summary')).toHaveText('이달의 추천 · 가고 싶은 곳 · 최근 기록');
  825 |     await page.goto((await stage.getByTestId('stage-link').getAttribute('href'))! + '?tab=prep');
  826 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=prep$/);
  827 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  828 |     // 예정 여행의 탭은 개요·일정·준비·사진 (글은 개요 아래)
  829 |     const tabs = page.getByTestId('trip-tabs').getByRole('tab');
  830 |     await expect(tabs).toHaveText(['개요', '일정', '준비', /^사진/]);
  831 |     // 주소로 없는 탭(글)을 열면 개요로, 개요 아래에 글 쓰는 칸
  832 |     await page.goto(page.url().replace(/\?tab=prep$/, '?tab=notes'));
  833 |     await expect(page.getByRole('tab', { name: '개요' })).toHaveAttribute('aria-selected', 'true');
```