# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물
- Location: tests/app.spec.ts:730:3

# Error details

```
Error: locator.check: Clicking the checkbox did not change its state
Call log:
  - waiting for getByTestId('packing').getByLabel('수영복 챙김')
    - locator resolved to <input type="checkbox" aria-label="수영복 챙김"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <a class="" href="/" data-discover="true">…</a> from <nav class="nav" aria-label="주 메뉴">…</nav> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

```

# Page snapshot

```yaml
- generic [ref=f8e1]:
  - generic [ref=f8e2]:
    - generic [ref=f8e3]:
      - generic [ref=f8e4]:
        - generic [ref=f8e5]:
          - button "뒤로" [ref=f8e6] [cursor=pointer]
          - generic [ref=f8e9]: 예정된 여행
        - link "고치기" [ref=f8e10] [cursor=pointer]:
          - /url: /trips/WdFlPdOdlMhDFxebZIsg/edit
      - generic [ref=f8e13]:
        - generic [ref=f8e14]:
          - generic [ref=f8e15]: 제주 여행
          - generic [ref=f8e16]: 날짜 모름
        - tablist "여행 보기" [ref=f8e18]:
          - tab "개요" [ref=f8e19] [cursor=pointer]
          - tab "일정" [ref=f8e20] [cursor=pointer]
          - tab "준비" [selected] [ref=f8e21] [cursor=pointer]
          - tab "사진" [ref=f8e22] [cursor=pointer]
        - generic [ref=f8e23]:
          - generic [ref=f8e24]:
            - generic [ref=f8e25]:
              - generic [ref=f8e26]: 예약
              - button "+ 넣기" [ref=f8e27] [cursor=pointer]
            - generic [ref=f8e28]: 비행기 편명, 숙소 체크인, 기차표 예약번호를 적어 두면 여행 날 홈에서 바로 보여요.
          - generic [ref=f8e29]:
            - generic [ref=f8e30]:
              - heading "준비물" [level=2] [ref=f8e31]
              - generic [ref=f8e32]:
                - generic [ref=f8e33]: 1/14 챙김
                - button "준비물 보내기" [ref=f8e34] [cursor=pointer]: 보내기
            - generic [ref=f8e35]:
              - checkbox "신분증 챙김" [ref=f8e36]
              - generic [ref=f8e37]: 신분증
              - button "신분증 담당자" [ref=f8e38] [cursor=pointer]: 담당
              - button "신분증 빼기" [ref=f8e39] [cursor=pointer]
            - generic [ref=f8e42]:
              - checkbox "지갑·카드 챙김" [ref=f8e43]
              - generic [ref=f8e44]: 지갑·카드
              - button "지갑·카드 담당자" [ref=f8e45] [cursor=pointer]: 담당
              - button "지갑·카드 빼기" [ref=f8e46] [cursor=pointer]
            - generic [ref=f8e49]:
              - checkbox "휴대폰 충전기 챙김" [ref=f8e50]
              - generic [ref=f8e51]: 휴대폰 충전기
              - button "휴대폰 충전기 담당자" [ref=f8e52] [cursor=pointer]: 담당
              - button "휴대폰 충전기 빼기" [ref=f8e53] [cursor=pointer]
            - generic [ref=f8e56]:
              - checkbox "보조배터리 챙김" [ref=f8e57]
              - generic [ref=f8e58]: 보조배터리
              - button "보조배터리 담당자" [ref=f8e59] [cursor=pointer]: 담당
              - button "보조배터리 빼기" [ref=f8e60] [cursor=pointer]
            - generic [ref=f8e63]:
              - checkbox "상비약 챙김" [ref=f8e64]
              - generic [ref=f8e65]: 상비약
              - button "상비약 담당자" [ref=f8e66] [cursor=pointer]: 담당
              - button "상비약 빼기" [ref=f8e67] [cursor=pointer]
            - generic [ref=f8e70]:
              - checkbox "세면도구 챙김" [ref=f8e71]
              - generic [ref=f8e72]: 세면도구
              - button "세면도구 담당자" [ref=f8e73] [cursor=pointer]: 담당
              - button "세면도구 빼기" [ref=f8e74] [cursor=pointer]
            - generic [ref=f8e77]:
              - checkbox "갈아입을 옷 챙김" [ref=f8e78]
              - generic [ref=f8e79]: 갈아입을 옷
              - button "갈아입을 옷 담당자" [ref=f8e80] [cursor=pointer]: 담당
              - button "갈아입을 옷 빼기" [ref=f8e81] [cursor=pointer]
            - generic [ref=f8e84]:
              - checkbox "잠옷 챙김" [ref=f8e85]
              - generic [ref=f8e86]: 잠옷
              - button "잠옷 담당자" [ref=f8e87] [cursor=pointer]: 담당
              - button "잠옷 빼기" [ref=f8e88] [cursor=pointer]
            - generic [ref=f8e91]:
              - checkbox "수영복 챙김" [checked] [active] [ref=f8e92]
              - generic [ref=f8e93]: 수영복
              - button "수영복 담당자" [ref=f8e94] [cursor=pointer]: 담당
              - button "수영복 빼기" [ref=f8e95] [cursor=pointer]
            - generic [ref=f8e98]:
              - checkbox "선크림 챙김" [ref=f8e99]
              - generic [ref=f8e100]: 선크림
              - button "선크림 담당자" [ref=f8e101] [cursor=pointer]: 담당
              - button "선크림 빼기" [ref=f8e102] [cursor=pointer]
            - generic [ref=f8e105]:
              - checkbox "선글라스 챙김" [ref=f8e106]
              - generic [ref=f8e107]: 선글라스
              - button "선글라스 담당자" [ref=f8e108] [cursor=pointer]: 담당
              - button "선글라스 빼기" [ref=f8e109] [cursor=pointer]
            - generic [ref=f8e112]:
              - checkbox "모자 챙김" [ref=f8e113]
              - generic [ref=f8e114]: 모자
              - button "모자 담당자" [ref=f8e115] [cursor=pointer]: 담당
              - button "모자 빼기" [ref=f8e116] [cursor=pointer]
            - generic [ref=f8e119]:
              - checkbox "비치타월 챙김" [ref=f8e120]
              - generic [ref=f8e121]: 비치타월
              - button "비치타월 담당자" [ref=f8e122] [cursor=pointer]: 담당
              - button "비치타월 빼기" [ref=f8e123] [cursor=pointer]
            - generic [ref=f8e126]:
              - checkbox "샌들 챙김" [ref=f8e127]
              - generic [ref=f8e128]: 샌들
              - button "샌들 담당자" [ref=f8e129] [cursor=pointer]: 담당
              - button "샌들 빼기" [ref=f8e130] [cursor=pointer]
            - generic [ref=f8e133]:
              - textbox "준비물 추가" [ref=f8e134]:
                - /placeholder: 더 챙길 것
              - button "추가" [disabled] [ref=f8e135]
          - generic [ref=f8e136]:
            - generic [ref=f8e137]: 가는 길
            - generic [ref=f8e139]:
              - generic [ref=f8e140]: 제주
              - generic [ref=f8e141]:
                - generic [ref=f8e142]: 가는 길
                - link "우리 집을 정하면 가는 길을 골라 드려요" [ref=f8e143] [cursor=pointer]:
                  - /url: /space#home
              - generic [ref=f8e144]:
                - generic [ref=f8e145]: 돌아오는 길
                - link "우리 집을 정하면 가는 길을 골라 드려요" [ref=f8e146] [cursor=pointer]:
                  - /url: /space#home
              - generic [ref=f8e147]: 가까운 역·공항 제주공항 15km
              - generic [ref=f8e151]: 가기 좋은 때 5·6, 9~11월 · 덥지도 춥지도 않아요
              - link "제주 지도·볼거리·우리 기록 보기" [ref=f8e155] [cursor=pointer]:
                - /url: /map?sel=kr:50
      - navigation "주 메뉴" [ref=f8e159]:
        - link "홈" [ref=f8e160] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f8e163] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f8e166] [cursor=pointer]
        - link "지도" [ref=f8e169] [cursor=pointer]:
          - /url: /map
        - link "새 소식 1개 피드" [ref=f8e172] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 1개" [ref=f8e176]
          - text: 피드
    - status
  - iframe [aria-hidden] [ref=f8e177]
```

# Test source

```ts
  732 |     // 홈 단계 카드: 다음 주말 여행(계획하기로 만든 것). 단추는 말한 탭(준비)으로, 카드는 개요로
  733 |     await expect(page.getByTestId('headline')).toBeVisible();
  734 |     const stage = page.getByTestId('stage-card');
  735 |     await expect(stage).toHaveAttribute('data-stage', 'before');
  736 |     // 계획 걸음이 남았으면 단추는 '이어서 계획하기' (남은 첫 걸음으로)
  737 |     await expect(stage.getByTestId('stage-plan')).toHaveText('이어서 계획하기');
  738 |     await expect(stage.getByTestId('stage-plan')).toHaveAttribute('href', /^\/trips\/[^/?]+\/plan-next\?step=stay$/);
  739 |     await expect(stage).toContainText("계획 1/5 · 다음은 '어디서 자요'");
  740 |     // 접힌 둘러보기 칸 제목엔 '추억'이 없다 (추억 카드는 있으면 접힌 칸 안에)
  741 |     await expect(page.getByTestId('home-more').locator('summary')).toHaveText('이달의 추천 · 가고 싶은 곳');
  742 |     await page.goto((await stage.getByTestId('stage-link').getAttribute('href'))! + '?tab=prep');
  743 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=prep$/);
  744 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  745 |     // 예정 여행의 탭은 개요·일정·준비·사진 (글은 개요 아래)
  746 |     const tabs = page.getByTestId('trip-tabs').getByRole('tab');
  747 |     await expect(tabs).toHaveText(['개요', '일정', '준비', /^사진/]);
  748 |     // 주소로 없는 탭(글)을 열면 개요로, 개요 아래에 글 쓰는 칸
  749 |     await page.goto(page.url().replace(/\?tab=prep$/, '?tab=notes'));
  750 |     await expect(page.getByRole('tab', { name: '개요' })).toHaveAttribute('aria-selected', 'true');
  751 |     await expect(page.getByTestId('trip-notes').getByTestId('notes-tab')).toBeVisible();
  752 | 
  753 |     // 일정 ① 적기(한글 Enter·추가 단추) ② 날짜 ③ 시간
  754 |     await page.getByRole('tab', { name: '일정' }).click();
  755 |     const plan = page.getByTestId('plan-tab');
  756 |     // 이미 있던 일정이 다 그려진 뒤에 센다 (구독이 늦게 와서 0개로 세는 일이 없게: 개수가 1초 동안 그대로일 때)
  757 |     await expect(plan.getByLabel('가볼 곳 추가')).toBeVisible();
  758 |     let n0 = -1;
  759 |     for (let k = 0, same = 0; k < 40 && same < 4; k++) {
  760 |       const c = await plan.getByTestId('plan-item').count();
  761 |       same = c === n0 ? same + 1 : 0;
  762 |       n0 = c;
  763 |       await page.waitForTimeout(250);
  764 |     }
  765 |     await plan.getByLabel('가볼 곳 추가').fill('시장 구경');
  766 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  767 |     await plan.getByLabel('가볼 곳 추가').fill('저녁 산책');
  768 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  769 |     await expect(plan.getByTestId('plan-item')).toHaveCount(n0 + 2);
  770 |     // 예정 여행의 일정엔 '또 갈래요' 하트가 없고 체크만
  771 |     await expect(plan.getByTestId('plan-again')).toHaveCount(0);
  772 |     await plan.locator('.plan-name', { hasText: '시장 구경' }).click();
  773 |     await plan.getByLabel('날짜').selectOption({ index: 2 });
  774 |     await expect(plan.getByLabel('날짜')).not.toHaveValue('');
  775 |     await plan.getByLabel('시간').selectOption('18:30');
  776 |     await expect(plan).toContainText('2일째');
  777 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '시장 구경' })).toContainText('18:30');
  778 |     await shot(page, '13-plan');
  779 | 
  780 |     // 다녀온 강릉 여행: 개요·들른 곳·사진·글, 탭 글은 375px에서도 한 줄
  781 |     const vp = page.viewportSize()!;
  782 |     await page.setViewportSize({ width: 375, height: 760 });
  783 |     await page.goto('/trips');
  784 |     await page.getByText('강릉시 여행', { exact: true }).click();
  785 |     await expect(tabs).toHaveText(['개요', '맛집·명소', /^사진/, /^글/]);
  786 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveCount(0);
  787 |     const boxes = await tabs.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { y: r.y, h: r.height, wrap: getComputedStyle(e).whiteSpace, over: e.scrollWidth > e.clientWidth + 1 }; }));
  788 |     for (const b of boxes) {
  789 |       expect(b.y).toBe(boxes[0].y);
  790 |       expect(b.wrap).toBe('nowrap');
  791 |       expect(b.over).toBe(false);
  792 |     }
  793 |     // 개요엔 '장소' 목록 구역이 없고(요약 한 줄), 옛 개발자 글도 없다
  794 |     await expect(page.getByRole('heading', { name: '장소', exact: true })).toHaveCount(0);
  795 |     await expect(page.getByText('v22에서 가져옴')).toHaveCount(0);
  796 |     // 들른 곳 = 우리 장소 기록(평가·한 줄 평). 일정 줄의 '또 갈래요' 하트·적는 칸은 없다
  797 |     await page.getByRole('tab', { name: '맛집·명소' }).click();
  798 |     const visited = page.getByTestId('trip-visited');
  799 |     await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
  800 |     await expect(page.getByTestId('plan-tab')).toHaveCount(0);
  801 |     await expect(page.getByTestId('plan-again')).toHaveCount(0);
  802 |     await expect(page.getByLabel('들른 곳 추가')).toHaveCount(0);
  803 |     await shot(page, '13a-visited');
  804 |     await page.setViewportSize(vp);
  805 | 
  806 |     // 기록: 쓴 사람이 보인다
  807 |     await page.getByRole('tab', { name: /글/ }).click();
  808 |     const notes = page.getByTestId('notes-tab');
  809 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  810 |     await notes.getByRole('button', { name: '남기기' }).click();
  811 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  812 |     await expect(notes.getByTestId('note')).toContainText('영상');
  813 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  814 |     // 타임캡슐 '1년 뒤 우리에게': 봉하면 봉투로만 보이고 글은 안 보인다
  815 |     await notes.getByTestId('capsule-toggle').click();
  816 |     await notes.getByLabel('글 쓰기').fill('1년 뒤에도 같이 커피 마시자');
  817 |     await notes.getByTestId('note-save').click();
  818 |     await expect(page.getByRole('status')).toContainText('봉했어요');
  819 |     await expect(notes.getByTestId('capsule-sealed')).toContainText('에 열려요');
  820 |     await expect(notes).not.toContainText('1년 뒤에도 같이 커피 마시자');
  821 | 
  822 |     // 준비물: 예정된 제주 여행
  823 |     await page.goto('/trips');
  824 |     await page.getByText('제주 여행', { exact: true }).click();
  825 |     // 개요엔 준비 요약 한 줄 → 누르면 '준비' 탭 (준비물·가는 길·현지어가 한곳에)
  826 |     await page.getByTestId('packing-summary').click();
  827 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  828 |     await expect(page.getByTestId('prep-way')).toContainText('제주공항');
  829 |     const pack = page.getByTestId('packing');
  830 |     await pack.getByRole('button', { name: '휴양' }).click();
  831 |     await expect(pack).toContainText('수영복');
> 832 |     await pack.getByLabel('수영복 챙김').check();
      |                                     ^ Error: locator.check: Clicking the checkbox did not change its state
  833 |     await expect(pack).toContainText(/1\/\d+ 챙김/);
  834 |     await pack.getByLabel('선크림 담당자').click();
  835 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  836 |     await shot(page, '13b-packing');
  837 |   });
  838 | 
  839 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  840 |     await signIn(page, OWNER);
  841 |     const box = page.getByTestId('home-ask').getByLabel('물어보기');
  842 |     await box.fill('강릉 맛집');
  843 |     await box.press('Enter');
  844 |     await expect(page).toHaveURL(/\/ask/);
  845 |     const answers = page.getByTestId('answer');
  846 |     await expect(answers.last()).toContainText('초당 순두부');
  847 |     await expect(answers.last()).toContainText('초당할머니순두부');
  848 |     const input = page.getByLabel('질문');
  849 |     await input.fill('거기 언제 가면 좋아?');
  850 |     await input.press('Enter');
  851 |     await expect(answers.last()).toContainText('강원 강릉시는');
  852 |     await input.fill('강릉 몇 번 갔지?');
  853 |     await input.press('Enter');
  854 |     await expect(answers.last()).toContainText('한 번 다녀왔어요');
  855 |     await input.fill('고성 맛집');
  856 |     await input.press('Enter');
  857 |     await expect(answers.last()).toContainText('여러 곳');
  858 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  859 |     await expect(answers.last()).toContainText('강원 고성군');
  860 |     await shot(page, '14-ask');
  861 |     await page.getByRole('button', { name: '처음으로' }).click();
  862 |     await page.getByRole('button', { name: '우리 몇 곳 갔어?' }).click();
  863 |     await expect(answers.last()).toContainText('시·군');
  864 |   });
  865 | 
  866 |   test('피드: 둘이 남긴 사진·글·장소·핀이 시간순으로, 다른 사람 소식엔 아래 메뉴에 점', async ({ page, browser }) => {
  867 |     await signIn(page, OWNER);
  868 |     await page.getByTestId('nav-feed').click();
  869 |     await expect(page).toHaveURL(/\/feed$/);
  870 |     const items = page.getByTestId('feed-item');
  871 |     await expect(items.first()).toBeVisible({ timeout: 15_000 });
  872 |     // 앞 시험들이 남긴 것들이 다 보인다: 사진 묶음, 글, 우리 장소, 핀
  873 |     await expect(page.locator('[data-testid="feed-item"][data-kind="photos"]').first()).toContainText('사진');
  874 |     await expect(page.locator('[data-testid="feed-item"][data-kind="note"]').first()).toContainText('바다 보며 커피 마신 날');
  875 |     // 짧은 글은 배경 위에 크게 (강릉 사진이 있으니 사진 배경)
  876 |     const quote = page.locator('[data-testid="feed-item"][data-kind="note"]').first().getByTestId('feed-quote-card');
  877 |     await expect(quote).toBeVisible();
  878 |     await expect(quote).toHaveClass(/has-photo/);
  879 |     await expect(page.locator('[data-testid="feed-item"][data-kind="place"]').first()).toBeVisible();
  880 |     await expect(page.locator('[data-testid="feed-item"][data-kind="trip"]').first()).toBeVisible();
  881 |     // 시간순(최신 먼저): 각 줄의 '얼마 전' 글이 거꾸로 가지 않는지는 단위 시험이 보고, 여기선 내가 남긴 건 '나'로 보이는지
  882 |     await expect(items.first().locator('.feed-who')).toContainText('나');
  883 |     // 내 소식만 있으니 점은 없다
  884 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  885 |     await shot(page, '17-feed');
  886 |     // 내가 피드를 보고 있는 동안 들어온 소식은 본 것으로 치므로, 먼저 홈으로 나간다
  887 |     await page.goto('/');
  888 |     await expect(page.getByTestId('nav-feed')).toBeVisible();
  889 | 
  890 |     // 보라가 핀을 꽂으면 → 내 화면 아래 메뉴에 새 소식 점, 피드에 들어가면 사라진다
  891 |     const bora = await browser.newPage();
  892 |     await signIn(bora, 'bora@example.com');
  893 |     await expect(bora.getByRole('navigation', { name: '주 메뉴' })).toBeVisible({ timeout: 15_000 });
  894 |     await bora.goto('/record');
  895 |     await bora.getByLabel('어디 검색').fill('통영');
  896 |     await bora.getByRole('option', { name: /통영시/ }).first().click();
  897 |     await bora.getByLabel('제목').fill('보라의 통영 나들이');
  898 |     await bora.getByRole('button', { name: '몰라요' }).click();
  899 |     await bora.getByTestId('save').click();
  900 |     await expect(bora.getByTestId('trip-title')).toHaveText('보라의 통영 나들이');
  901 |     await bora.close();
  902 |     await expect.poll(async () => page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen)), { timeout: 15_000, message: '점 계산 자료' }).toContain('"by":"보라"');
  903 |     const dbg = await page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen));
  904 |     await expect(page.getByTestId('feed-dot'), `새 소식 점이 없어요: ${dbg}`).toBeVisible({ timeout: 15_000 });
  905 |     await page.getByTestId('nav-feed').click();
  906 |     await expect(items.first()).toContainText('보라의 통영 나들이');
  907 |     await expect(items.first().locator('.feed-who')).toContainText('보라');
  908 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  909 |     // 하트: 내가 누르면 '나', 보라가 보면 '영상'으로 보이고, 보라 화면 아래 메뉴에 점
  910 |     await items.first().getByTestId('feed-heart').click();
  911 |     await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'true');
  912 |     await expect(items.first().getByTestId('feed-heart-names')).toHaveText('나');
  913 |     const bora2 = await browser.newPage();
  914 |     await signIn(bora2, 'bora@example.com');
  915 |     await expect(bora2.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
  916 |     await bora2.getByTestId('nav-feed').click();
  917 |     await expect(bora2.getByTestId('feed-item').first().getByTestId('feed-heart-names')).toHaveText('영상');
  918 |     await expect(bora2.getByTestId('feed-dot')).toHaveCount(0);
  919 |     await bora2.close();
  920 |     // 다시 누르면 뺀다
  921 |     await items.first().getByTestId('feed-heart').click();
  922 |     await expect(items.first().getByTestId('feed-heart')).toHaveAttribute('aria-pressed', 'false');
  923 |     // 추억 돌아보기로 넘어갈 수 있다
  924 |     await page.getByTestId('to-memories').click();
  925 |     await expect(page).toHaveURL(/\/memories$/);
  926 |   });
  927 | 
  928 |   test('공유: 링크 공개(로그인 없이 보기), 공유 카드, 엑셀 내보내기', async ({ page, browser }) => {
  929 |     await signIn(page, OWNER);
  930 |     await page.goto('/trips');
  931 |     await page.getByText('강릉시 여행', { exact: true }).click();
  932 |     const card = page.getByTestId('share-link');
```