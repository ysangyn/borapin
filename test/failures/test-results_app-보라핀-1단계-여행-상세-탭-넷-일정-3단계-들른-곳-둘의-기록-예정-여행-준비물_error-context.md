# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물
- Location: tests/app.spec.ts:694:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('plan-tab').getByTestId('plan-item')
Expected: 2
Received: 10
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" getByTestId('plan-tab').getByTestId('plan-item') with timeout 15000ms
  - waiting for getByTestId('plan-tab').getByTestId('plan-item')
    - locator resolved to 9 elements
    - unexpected value "9"
    33 × locator resolved to 10 elements
       - unexpected value "10"

```

# Page snapshot

```yaml
- generic [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e4]:
        - generic [ref=f2e5]:
          - button "뒤로" [ref=f2e6] [cursor=pointer]
          - generic [ref=f2e9]: 예정된 여행
        - link "고치기" [ref=f2e10] [cursor=pointer]:
          - /url: /trips/AZUzX7hG60Je29IxEHf6/edit
      - generic [ref=f2e13]:
        - generic [ref=f2e14]:
          - generic [ref=f2e15]: 삼척시 여행
          - generic [ref=f2e16]:
            - generic [ref=f2e17]: 2026.10.31 – 11.1 · 1박 2일
            - generic [ref=f2e18]: D-8
        - tablist "여행 보기" [ref=f2e19]:
          - tab "개요" [ref=f2e20] [cursor=pointer]
          - tab "일정" [selected] [ref=f2e21] [cursor=pointer]
          - tab "준비" [ref=f2e22] [cursor=pointer]
          - tab "사진" [ref=f2e23] [cursor=pointer]
        - generic [ref=f2e24]:
          - generic [ref=f2e25]:
            - textbox "가볼 곳 추가" [ref=f2e26]:
              - /placeholder: "가볼 곳 적기 (예: 삼척 해양레일바이크)"
            - button "추가" [active] [ref=f2e27] [cursor=pointer]
          - generic [ref=f2e28]:
            - generic [ref=f2e29]: 1일째 · 10.31 (토)
            - generic [ref=f2e30]:
              - generic [ref=f2e32]:
                - checkbox "출발 다녀옴" [ref=f2e33]
                - 'button "09:00 출발 가는 길: KTX 동해역 27km · 양양공항 96km" [ref=f2e34] [cursor=pointer]':
                  - generic [ref=f2e35]: 09:00
                  - generic [ref=f2e36]: 출발
                  - generic [ref=f2e37]: "가는 길: KTX 동해역 27km · 양양공항 96km"
                - link "출발 네이버지도" [ref=f2e38] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EC%B6%9C%EB%B0%9C
                  - text: 지도
              - generic [ref=f2e40]:
                - checkbox "삼척 해양레일바이크 다녀옴" [ref=f2e41]
                - button "10:30 삼척 해양레일바이크" [ref=f2e42] [cursor=pointer]:
                  - generic [ref=f2e43]: 10:30
                  - generic [ref=f2e44]: 삼척 해양레일바이크
                - link "삼척 해양레일바이크 네이버지도" [ref=f2e45] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EC%82%BC%EC%B2%99%20%ED%95%B4%EC%96%91%EB%A0%88%EC%9D%BC%EB%B0%94%EC%9D%B4%ED%81%AC
                  - text: 지도
              - generic [ref=f2e47]:
                - checkbox "삼척 곰치국 다녀옴" [ref=f2e48]
                - button "12:30 삼척 곰치국 이 지역 먹거리" [ref=f2e49] [cursor=pointer]:
                  - generic [ref=f2e50]: 12:30
                  - generic [ref=f2e51]: 삼척 곰치국
                  - generic [ref=f2e52]: 이 지역 먹거리
                - link "삼척 곰치국 네이버지도" [ref=f2e53] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EC%82%BC%EC%B2%99%20%EA%B3%B0%EC%B9%98%EA%B5%AD
                  - text: 지도
              - generic [ref=f2e55]:
                - checkbox "대이리 동굴지대(환선굴) 다녀옴" [ref=f2e56]
                - button "14:30 대이리 동굴지대(환선굴)" [ref=f2e57] [cursor=pointer]:
                  - generic [ref=f2e58]: 14:30
                  - generic [ref=f2e59]: 대이리 동굴지대(환선굴)
                - link "대이리 동굴지대(환선굴) 네이버지도" [ref=f2e60] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EB%8C%80%EC%9D%B4%EB%A6%AC%20%EB%8F%99%EA%B5%B4%EC%A7%80%EB%8C%80(%ED%99%98%EC%84%A0%EA%B5%B4)
                  - text: 지도
              - generic [ref=f2e62]:
                - checkbox "한정식 다녀옴" [ref=f2e63]
                - button "18:30 한정식 이 지역 먹거리" [ref=f2e64] [cursor=pointer]:
                  - generic [ref=f2e65]: 18:30
                  - generic [ref=f2e66]: 한정식
                  - generic [ref=f2e67]: 이 지역 먹거리
                - link "한정식 네이버지도" [ref=f2e68] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%ED%95%9C%EC%A0%95%EC%8B%9D
                  - text: 지도
          - generic [ref=f2e69]:
            - generic [ref=f2e70]: 2일째 · 11.1 (일)
            - generic [ref=f2e71]:
              - generic [ref=f2e73]:
                - checkbox "장호항 다녀옴" [ref=f2e74]
                - button "10:30 장호항" [ref=f2e75] [cursor=pointer]:
                  - generic [ref=f2e76]: 10:30
                  - generic [ref=f2e77]: 장호항
                - link "장호항 네이버지도" [ref=f2e78] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EC%9E%A5%ED%98%B8%ED%95%AD
                  - text: 지도
              - generic [ref=f2e80]:
                - checkbox "물회 다녀옴" [ref=f2e81]
                - button "12:30 물회 이 지역 먹거리" [ref=f2e82] [cursor=pointer]:
                  - generic [ref=f2e83]: 12:30
                  - generic [ref=f2e84]: 물회
                  - generic [ref=f2e85]: 이 지역 먹거리
                - link "물회 네이버지도" [ref=f2e86] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EB%AC%BC%ED%9A%8C
                  - text: 지도
              - generic [ref=f2e88]:
                - checkbox "집으로 다녀옴" [ref=f2e89]
                - button "16:00 집으로" [ref=f2e90] [cursor=pointer]:
                  - generic [ref=f2e91]: 16:00
                  - generic [ref=f2e92]: 집으로
                - link "집으로 네이버지도" [ref=f2e93] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EC%A7%91%EC%9C%BC%EB%A1%9C
                  - text: 지도
          - generic [ref=f2e94]:
            - generic [ref=f2e95]: 날짜 없이
            - generic [ref=f2e96]:
              - generic [ref=f2e98]:
                - checkbox "시장 구경 다녀옴" [ref=f2e99]
                - button "시장 구경" [ref=f2e100] [cursor=pointer]
                - link "시장 구경 네이버지도" [ref=f2e102] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EC%8B%9C%EC%9E%A5%20%EA%B5%AC%EA%B2%BD
                  - text: 지도
              - generic [ref=f2e104]:
                - checkbox "저녁 산책 다녀옴" [ref=f2e105]
                - button "저녁 산책" [ref=f2e106] [cursor=pointer]
                - link "저녁 산책 네이버지도" [ref=f2e108] [cursor=pointer]:
                  - /url: https://map.naver.com/p/search/%EC%82%BC%EC%B2%99%EC%8B%9C%20%EC%A0%80%EB%85%81%20%EC%82%B0%EC%B1%85
                  - text: 지도
      - navigation "주 메뉴" [ref=f2e109]:
        - link "홈" [ref=f2e110] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f2e113] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f2e116] [cursor=pointer]
        - link "지도" [ref=f2e119] [cursor=pointer]:
          - /url: /map
        - link "새 소식 1개 피드" [ref=f2e122] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 1개" [ref=f2e126]
          - text: 피드
    - status
  - iframe [aria-hidden] [ref=f2e127]
```

# Test source

```ts
  623 |     await shot(page, '11b-places');
  624 | 
  625 |     // 장소를 열면 '보기' 화면: 이름·지도 앱·자리 그림·한 줄 평, 고치기를 누르면 고치는 칸
  626 |     await page.getByTestId('place-rec').click();
  627 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  628 |     await expect(page.getByRole('navigation', { name: '지도 앱으로 열기' }).getByRole('link')).toHaveCount(3);
  629 |     await expect(page.getByTestId('spot-map')).toBeVisible();
  630 |     await expect(page.getByText('아침으로 최고')).toBeVisible();
  631 |     await shot(page, '11c-place-view');
  632 |     await page.getByTestId('place-edit').click();
  633 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  634 |     await page.getByLabel('장소 메모').fill('줄 30분');
  635 |     await page.getByTestId('place-save').click();
  636 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  637 |     await expect(page.getByText('줄 30분')).toBeVisible();
  638 |   });
  639 | 
  640 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  641 |     await signIn(page, OWNER);
  642 |     await page.goto('/trips');
  643 |     await page.getByText('강릉시 여행', { exact: true }).click();
  644 |     await page.getByRole('tab', { name: /사진/ }).click();
  645 |     const sec = page.getByTestId('trip-photos');
  646 |     await sec.getByTestId('photo-input').setInputFiles([
  647 |       'tests/fixtures/photo-gangneung.jpg',
  648 |       'tests/fixtures/photo-gangneung2.jpg',
  649 |       'tests/fixtures/photo-noexif.jpg',
  650 |     ]);
  651 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  652 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  653 |     // 촬영일(2019.5.3~4)로 날짜 채우기
  654 |     const sug = page.getByTestId('photo-suggest');
  655 |     await expect(sug).toContainText('2019.5.3–4');
  656 |     await sug.getByRole('button', { name: '채우기' }).click();
  657 |     await expect(page.getByText(/^2019\.5\.3–4( · 1박 2일)?$/).first()).toBeVisible();
  658 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  659 |     await shot(page, '12-photos');
  660 |     // 표지 사진은 개요 탭 위에
  661 |     await page.getByRole('tab', { name: '개요' }).click();
  662 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  663 |     await page.getByRole('tab', { name: /사진/ }).click();
  664 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  665 |     await sec.locator('.photo-cell img').first().click();
  666 |     const cap = page.locator('.pswp__caption-bp');
  667 |     await expect(cap).toContainText('2019.5.3 14:20');
  668 |     await expect(cap).toContainText('강원 강릉시');
  669 |     await page.waitForTimeout(600);
  670 |     await shot(page, '12b-slideshow');
  671 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  672 |     await page.keyboard.press('Escape');
  673 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  674 |     await page.goto('/memories');
  675 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  676 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  677 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  678 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  679 |     await expect(albumImgs).toHaveCount(3);
  680 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  681 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  682 |     await page.getByLabel('다시 보기 연도').fill('0');
  683 |     const firstYear = await page.getByTestId('replay-year').textContent();
  684 |     await page.getByTestId('replay-play').click();
  685 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  686 |     await page.getByLabel('결산 연도').selectOption('2019');
  687 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  688 |     await expect(page.getByTestId('year-review')).toContainText('2');
  689 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  690 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  691 |     await shot(page, '12c-memories');
  692 |   });
  693 | 
  694 |   test('여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  695 |     await signIn(page, OWNER);
  696 |     // 홈 단계 카드: 다음 주말 여행(계획하기로 만든 것). 단추는 말한 탭(준비)으로, 카드는 개요로
  697 |     await expect(page.getByTestId('headline')).toBeVisible();
  698 |     const stage = page.getByTestId('stage-card');
  699 |     await expect(stage).toHaveAttribute('data-stage', 'before');
  700 |     await expect(stage.getByTestId('stage-action')).toHaveText('준비물 보기');
  701 |     await expect(stage.getByTestId('stage-action')).toHaveAttribute('href', /^\/trips\/[^/?]+\?tab=prep$/);
  702 |     // 접힌 둘러보기 칸 제목엔 '추억'이 없다 (추억 카드는 있으면 접힌 칸 안에)
  703 |     await expect(page.getByTestId('home-more').locator('summary')).toHaveText('이달의 추천 · 가고 싶은 곳');
  704 |     await stage.getByTestId('stage-action').click();
  705 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=prep$/);
  706 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  707 |     // 예정 여행의 탭은 개요·일정·준비·사진 (글은 개요 아래)
  708 |     const tabs = page.getByTestId('trip-tabs').getByRole('tab');
  709 |     await expect(tabs).toHaveText(['개요', '일정', '준비', /^사진/]);
  710 |     // 주소로 없는 탭(글)을 열면 개요로, 개요 아래에 글 쓰는 칸
  711 |     await page.goto(page.url().replace(/\?tab=prep$/, '?tab=notes'));
  712 |     await expect(page.getByRole('tab', { name: '개요' })).toHaveAttribute('aria-selected', 'true');
  713 |     await expect(page.getByTestId('trip-notes').getByTestId('notes-tab')).toBeVisible();
  714 | 
  715 |     // 일정 ① 적기(한글 Enter·추가 단추) ② 날짜 ③ 시간
  716 |     await page.getByRole('tab', { name: '일정' }).click();
  717 |     const plan = page.getByTestId('plan-tab');
  718 |     const n0 = await plan.getByTestId('plan-item').count();
  719 |     await plan.getByLabel('가볼 곳 추가').fill('시장 구경');
  720 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  721 |     await plan.getByLabel('가볼 곳 추가').fill('저녁 산책');
  722 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
> 723 |     await expect(plan.getByTestId('plan-item')).toHaveCount(n0 + 2);
      |                                                 ^ Error: expect(locator).toHaveCount(expected) failed
  724 |     // 예정 여행의 일정엔 '또 갈래요' 하트가 없고 체크만
  725 |     await expect(plan.getByTestId('plan-again')).toHaveCount(0);
  726 |     await plan.locator('.plan-name', { hasText: '시장 구경' }).click();
  727 |     await plan.getByLabel('날짜').selectOption({ index: 2 });
  728 |     await expect(plan.getByLabel('날짜')).not.toHaveValue('');
  729 |     await plan.getByLabel('시간').selectOption('18:30');
  730 |     await expect(plan).toContainText('2일째');
  731 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '시장 구경' })).toContainText('18:30');
  732 |     await shot(page, '13-plan');
  733 | 
  734 |     // 다녀온 강릉 여행: 개요·들른 곳·사진·글, 탭 글은 375px에서도 한 줄
  735 |     const vp = page.viewportSize()!;
  736 |     await page.setViewportSize({ width: 375, height: 760 });
  737 |     await page.goto('/trips');
  738 |     await page.getByText('강릉시 여행', { exact: true }).click();
  739 |     await expect(tabs).toHaveText(['개요', '들른 곳', /^사진/, /^글/]);
  740 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveCount(0);
  741 |     const boxes = await tabs.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { y: r.y, h: r.height, wrap: getComputedStyle(e).whiteSpace, over: e.scrollWidth > e.clientWidth + 1 }; }));
  742 |     for (const b of boxes) {
  743 |       expect(b.y).toBe(boxes[0].y);
  744 |       expect(b.wrap).toBe('nowrap');
  745 |       expect(b.over).toBe(false);
  746 |     }
  747 |     // 개요엔 '장소' 목록 구역이 없고(요약 한 줄), 옛 개발자 글도 없다
  748 |     await expect(page.getByRole('heading', { name: '장소', exact: true })).toHaveCount(0);
  749 |     await expect(page.getByText('v22에서 가져옴')).toHaveCount(0);
  750 |     // 들른 곳 = 우리 장소 기록(평가·한 줄 평). 일정 줄의 '또 갈래요' 하트·적는 칸은 없다
  751 |     await page.getByRole('tab', { name: '들른 곳' }).click();
  752 |     const visited = page.getByTestId('trip-visited');
  753 |     await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
  754 |     await expect(page.getByTestId('plan-tab')).toHaveCount(0);
  755 |     await expect(page.getByTestId('plan-again')).toHaveCount(0);
  756 |     await expect(page.getByLabel('들른 곳 추가')).toHaveCount(0);
  757 |     await shot(page, '13a-visited');
  758 |     await page.setViewportSize(vp);
  759 | 
  760 |     // 기록: 쓴 사람이 보인다
  761 |     await page.getByRole('tab', { name: /글/ }).click();
  762 |     const notes = page.getByTestId('notes-tab');
  763 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  764 |     await notes.getByRole('button', { name: '남기기' }).click();
  765 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  766 |     await expect(notes.getByTestId('note')).toContainText('영상');
  767 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  768 | 
  769 |     // 준비물: 예정된 제주 여행
  770 |     await page.goto('/trips');
  771 |     await page.getByText('제주 여행', { exact: true }).click();
  772 |     // 개요엔 준비 요약 한 줄 → 누르면 '준비' 탭 (준비물·가는 길·현지어가 한곳에)
  773 |     await page.getByTestId('packing-summary').click();
  774 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  775 |     await expect(page.getByTestId('prep-way')).toContainText('제주공항');
  776 |     const pack = page.getByTestId('packing');
  777 |     await pack.getByRole('button', { name: '휴양' }).click();
  778 |     await expect(pack).toContainText('수영복');
  779 |     await pack.getByLabel('수영복 챙김').check();
  780 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  781 |     await pack.getByLabel('선크림 담당자').click();
  782 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  783 |     await shot(page, '13b-packing');
  784 |   });
  785 | 
  786 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  787 |     await signIn(page, OWNER);
  788 |     const box = page.getByTestId('home-ask').getByLabel('보라에게 물어봐');
  789 |     await box.fill('강릉 맛집');
  790 |     await box.press('Enter');
  791 |     await expect(page).toHaveURL(/\/ask/);
  792 |     const answers = page.getByTestId('answer');
  793 |     await expect(answers.last()).toContainText('초당 순두부');
  794 |     await expect(answers.last()).toContainText('초당할머니순두부');
  795 |     const input = page.getByLabel('질문');
  796 |     await input.fill('거기 언제 가면 좋아?');
  797 |     await input.press('Enter');
  798 |     await expect(answers.last()).toContainText('강원 강릉시는');
  799 |     await input.fill('강릉 몇 번 갔지?');
  800 |     await input.press('Enter');
  801 |     await expect(answers.last()).toContainText('한 번 다녀왔어요');
  802 |     await input.fill('고성 맛집');
  803 |     await input.press('Enter');
  804 |     await expect(answers.last()).toContainText('여러 곳');
  805 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  806 |     await expect(answers.last()).toContainText('강원 고성군');
  807 |     await shot(page, '14-ask');
  808 |     await page.getByRole('button', { name: '처음으로' }).click();
  809 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  810 |     await expect(answers.last()).toContainText('시·군');
  811 |   });
  812 | 
  813 |   test('피드: 둘이 남긴 사진·글·장소·핀이 시간순으로, 다른 사람 소식엔 아래 메뉴에 점', async ({ page, browser }) => {
  814 |     await signIn(page, OWNER);
  815 |     await page.getByTestId('nav-feed').click();
  816 |     await expect(page).toHaveURL(/\/feed$/);
  817 |     const items = page.getByTestId('feed-item');
  818 |     await expect(items.first()).toBeVisible({ timeout: 15_000 });
  819 |     // 앞 시험들이 남긴 것들이 다 보인다: 사진 묶음, 글, 우리 장소, 핀
  820 |     await expect(page.locator('[data-testid="feed-item"][data-kind="photos"]').first()).toContainText('사진');
  821 |     await expect(page.locator('[data-testid="feed-item"][data-kind="note"]').first()).toContainText('바다 보며 커피 마신 날');
  822 |     // 짧은 글은 배경 위에 크게 (강릉 사진이 있으니 사진 배경)
  823 |     const quote = page.locator('[data-testid="feed-item"][data-kind="note"]').first().getByTestId('feed-quote-card');
```