# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물
- Location: tests/app.spec.ts:821:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('plan-tab').locator('section').filter({ has: getByTestId('plan-tab').getByTestId('plan-item').filter({ hasText: '저녁 산책' }) }).locator('.year-head')
Expected: "날짜 없이"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByTestId('plan-tab').locator('section').filter({ has: getByTestId('plan-tab').getByTestId('plan-item').filter({ hasText: '저녁 산책' }) }).locator('.year-head') with timeout 15000ms
  - waiting for getByTestId('plan-tab').locator('section').filter({ has: getByTestId('plan-tab').getByTestId('plan-item').filter({ hasText: '저녁 산책' }) }).locator('.year-head')

```

```yaml
- button "뒤로"
- text: 예정된 여행
- link "고치기":
  - /url: /trips/itnR2ai5iGMKLpEESafW/edit
- text: 동해시 여행 2026.12.5–6 · 1박 2일 D-10
- tablist "여행 보기":
  - tab "개요"
  - tab "일정" [selected]
  - tab "준비"
  - tab "사진"
- textbox "가볼 곳 추가":
  - /placeholder: "가볼 곳 적기 (예: 추암 촛대바위)"
- button "추가"
- button "가까운 곳끼리 날짜 나누기"
- button "다 바꿨어요" [pressed]
- text: ↑ ↓ 로 차례를 바꿔요. 그날 맨 위·맨 아래에서 누르면 앞날·다음 날로 넘어가요. 2일째 · 12.6 (일) 18:30 시장 구경
- button "시장 구경 위로": ↑
- button "시장 구경 아래로": ↓
- button "시장 구경 빼기": ×
- text: 날짜 없이 저녁 산책
- button "저녁 산책 위로": ↑
- button "저녁 산책 아래로" [disabled]: ↓
- button "저녁 산책 빼기": ×
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
- status
```

# Test source

```ts
  775 |       'tests/fixtures/photo-gangneung2.jpg',
  776 |       'tests/fixtures/photo-noexif.jpg',
  777 |     ]);
  778 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  779 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  780 |     // 촬영일(2019.5.3~4)로 날짜 채우기
  781 |     const sug = page.getByTestId('photo-suggest');
  782 |     await expect(sug).toContainText('2019.5.3–4');
  783 |     await sug.getByRole('button', { name: '채우기' }).click();
  784 |     await expect(page.getByText(/^2019\.5\.3–4( · 1박 2일)?$/).first()).toBeVisible();
  785 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  786 |     await shot(page, '12-photos');
  787 |     // 표지 사진은 개요 탭 위에
  788 |     await page.getByRole('tab', { name: '개요' }).click();
  789 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  790 |     await page.getByRole('tab', { name: /사진/ }).click();
  791 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  792 |     await sec.locator('.photo-cell img').first().click();
  793 |     const cap = page.locator('.pswp__caption-bp');
  794 |     await expect(cap).toContainText('2019.5.3 14:20');
  795 |     await expect(cap).toContainText('강원 강릉시');
  796 |     await page.waitForTimeout(600);
  797 |     await shot(page, '12b-slideshow');
  798 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  799 |     await page.keyboard.press('Escape');
  800 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  801 |     await page.goto('/memories');
  802 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  803 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  804 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  805 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  806 |     await expect(albumImgs).toHaveCount(3);
  807 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  808 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  809 |     await page.getByLabel('다시 보기 연도').fill('0');
  810 |     const firstYear = await page.getByTestId('replay-year').textContent();
  811 |     await page.getByTestId('replay-play').click();
  812 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  813 |     await page.getByLabel('결산 연도').selectOption('2019');
  814 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  815 |     await expect(page.getByTestId('year-review')).toContainText('2');
  816 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  817 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  818 |     await shot(page, '12c-memories');
  819 |   });
  820 | 
  821 |   test('여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  822 |     await signIn(page, OWNER);
  823 |     // 홈 단계 카드: 다음 주말 여행(계획하기로 만든 것). 단추는 말한 탭(준비)으로, 카드는 개요로
  824 |     await expect(page.getByTestId('headline')).toBeVisible();
  825 |     const stage = page.getByTestId('stage-card');
  826 |     await expect(stage).toHaveAttribute('data-stage', 'before');
  827 |     // 계획 걸음이 남았으면 단추는 '이어서 계획하기' (남은 첫 걸음으로)
  828 |     await expect(stage.getByTestId('stage-plan')).toHaveText('이어서 계획하기');
  829 |     await expect(stage.getByTestId('stage-plan')).toHaveAttribute('href', /^\/trips\/[^/?]+\/plan-next\?step=stay$/);
  830 |     await expect(stage).toContainText("계획 1/5 · 다음은 '어디서 자요'");
  831 |     // 접힌 둘러보기 칸 제목엔 '추억'이 없다 (추억 카드는 있으면 접힌 칸 안에)
  832 |     await expect(page.getByTestId('home-more').locator('summary')).toHaveText('이달의 추천 · 가고 싶은 곳 · 최근 기록');
  833 |     await page.goto((await stage.getByTestId('stage-link').getAttribute('href'))! + '?tab=prep');
  834 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=prep$/);
  835 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  836 |     // 예정 여행의 탭은 개요·일정·준비·사진 (글은 개요 아래)
  837 |     const tabs = page.getByTestId('trip-tabs').getByRole('tab');
  838 |     await expect(tabs).toHaveText(['개요', '일정', '준비', /^사진/]);
  839 |     // 주소로 없는 탭(글)을 열면 개요로, 개요 아래에 글 쓰는 칸
  840 |     await page.goto(page.url().replace(/\?tab=prep$/, '?tab=notes'));
  841 |     await expect(page.getByRole('tab', { name: '개요' })).toHaveAttribute('aria-selected', 'true');
  842 |     await expect(page.getByTestId('trip-notes').getByTestId('notes-tab')).toBeVisible();
  843 | 
  844 |     // 일정 ① 적기(한글 Enter·추가 단추) ② 날짜 ③ 시간
  845 |     await page.getByRole('tab', { name: '일정' }).click();
  846 |     const plan = page.getByTestId('plan-tab');
  847 |     // 이미 있던 일정이 다 그려진 뒤에 센다 (구독이 늦게 와서 0개로 세는 일이 없게: 개수가 1초 동안 그대로일 때)
  848 |     await expect(plan.getByLabel('가볼 곳 추가')).toBeVisible();
  849 |     let n0 = -1;
  850 |     for (let k = 0, same = 0; k < 40 && same < 4; k++) {
  851 |       const c = await plan.getByTestId('plan-item').count();
  852 |       same = c === n0 ? same + 1 : 0;
  853 |       n0 = c;
  854 |       await page.waitForTimeout(250);
  855 |     }
  856 |     await plan.getByLabel('가볼 곳 추가').fill('시장 구경');
  857 |     await plan.getByLabel('가볼 곳 추가').press('Enter');
  858 |     await plan.getByLabel('가볼 곳 추가').fill('저녁 산책');
  859 |     await plan.getByRole('button', { name: '추가', exact: true }).click();
  860 |     await expect(plan.getByTestId('plan-item')).toHaveCount(n0 + 2);
  861 |     // 예정 여행의 일정엔 '또 갈래요' 하트가 없고 체크만
  862 |     await expect(plan.getByTestId('plan-again')).toHaveCount(0);
  863 |     await plan.locator('.plan-name', { hasText: '시장 구경' }).click();
  864 |     await plan.getByLabel('날짜').selectOption({ index: 2 });
  865 |     await expect(plan.getByLabel('날짜')).not.toHaveValue('');
  866 |     await plan.getByLabel('시간').selectOption('18:30');
  867 |     await expect(plan).toContainText('2일째');
  868 |     await expect(plan.getByTestId('plan-item').filter({ hasText: '시장 구경' })).toContainText('18:30');
  869 |     await shot(page, '13-plan');
  870 | 
  871 |     // 차례 바꾸기·빼기: ↑ ↓ × (사용자 의견 11-25). '날짜 없이' 맨 위에서 ↑ → 마지막 날로 올라간다
  872 |     await expect(plan.getByTestId('plan-near')).toHaveText('가까운 곳끼리 날짜 나누기');
  873 |     await plan.getByTestId('plan-arrange').click();
  874 |     const walkRow = plan.getByTestId('plan-item').filter({ hasText: '저녁 산책' });
> 875 |     await expect(plan.locator('section', { has: walkRow }).locator('.year-head')).toHaveText('날짜 없이');
      |                                                                                   ^ Error: expect(locator).toHaveText(expected) failed
  876 |     await walkRow.getByTestId('plan-up').click();
  877 |     await expect(plan.locator('section', { has: walkRow }).locator('.year-head')).not.toHaveText('날짜 없이');
  878 |     await shot(page, '13b-plan-arrange');
  879 |     await walkRow.getByTestId('plan-remove').click();
  880 |     await expect(plan.getByTestId('plan-item')).toHaveCount(n0 + 1);
  881 |     await page.getByRole('status').getByRole('button', { name: '되돌리기' }).click();
  882 |     await expect(plan.getByTestId('plan-item')).toHaveCount(n0 + 2);
  883 |     await plan.getByTestId('plan-arrange').click();
  884 |     await expect(plan.getByTestId('plan-up')).toHaveCount(0);
  885 |     // 자리 찾기가 안 되는 곳(시험 환경)에서는 묶지 못했다고 알려 주고 아무것도 안 바꾼다
  886 |     await plan.getByTestId('plan-near').click();
  887 |     await expect(page.getByRole('status')).toContainText(/묶지 못했어요|묶을 곳이/, { timeout: 30_000 });
  888 |     await expect(plan.getByTestId('plan-item')).toHaveCount(n0 + 2);
  889 | 
  890 |     // 다녀온 강릉 여행: 개요·들른 곳·사진·글, 탭 글은 375px에서도 한 줄
  891 |     const vp = page.viewportSize()!;
  892 |     await page.setViewportSize({ width: 375, height: 760 });
  893 |     await page.goto('/trips');
  894 |     await page.getByText('강릉시 여행', { exact: true }).click();
  895 |     await expect(tabs).toHaveText(['개요', '맛집·명소', /^사진/, /^글/]);
  896 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveCount(0);
  897 |     const boxes = await tabs.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { y: r.y, h: r.height, wrap: getComputedStyle(e).whiteSpace, over: e.scrollWidth > e.clientWidth + 1 }; }));
  898 |     for (const b of boxes) {
  899 |       expect(b.y).toBe(boxes[0].y);
  900 |       expect(b.wrap).toBe('nowrap');
  901 |       expect(b.over).toBe(false);
  902 |     }
  903 |     // 개요엔 '장소' 목록 구역이 없고(요약 한 줄), 옛 개발자 글도 없다
  904 |     await expect(page.getByRole('heading', { name: '장소', exact: true })).toHaveCount(0);
  905 |     await expect(page.getByText('v22에서 가져옴')).toHaveCount(0);
  906 |     // 들른 곳 = 우리 장소 기록(평가·한 줄 평). 일정 줄의 '또 갈래요' 하트·적는 칸은 없다
  907 |     await page.getByRole('tab', { name: '맛집·명소' }).click();
  908 |     const visited = page.getByTestId('trip-visited');
  909 |     await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
  910 |     await expect(page.getByTestId('plan-tab')).toHaveCount(0);
  911 |     await expect(page.getByTestId('plan-again')).toHaveCount(0);
  912 |     await expect(page.getByLabel('들른 곳 추가')).toHaveCount(0);
  913 |     await shot(page, '13a-visited');
  914 |     await page.setViewportSize(vp);
  915 | 
  916 |     // 기록: 쓴 사람이 보인다
  917 |     await page.getByRole('tab', { name: /글/ }).click();
  918 |     const notes = page.getByTestId('notes-tab');
  919 |     await notes.getByLabel('글 쓰기').fill('바다 보며 커피 마신 날');
  920 |     await notes.getByRole('button', { name: '남기기' }).click();
  921 |     await expect(notes.getByTestId('note')).toContainText('바다 보며 커피 마신 날');
  922 |     await expect(notes.getByTestId('note')).toContainText('영상');
  923 |     await expect(page.getByRole('tab', { name: '글 1' })).toBeVisible();
  924 |     // 타임캡슐 '1년 뒤 우리에게': 봉하면 봉투로만 보이고 글은 안 보인다
  925 |     await notes.getByTestId('capsule-toggle').click();
  926 |     await notes.getByLabel('글 쓰기').fill('1년 뒤에도 같이 커피 마시자');
  927 |     await notes.getByTestId('note-save').click();
  928 |     await expect(page.getByRole('status')).toContainText('봉했어요');
  929 |     await expect(notes.getByTestId('capsule-sealed')).toContainText('에 열려요');
  930 |     await expect(notes).not.toContainText('1년 뒤에도 같이 커피 마시자');
  931 | 
  932 |     // 준비물: 예정된 제주 여행
  933 |     await page.goto('/trips');
  934 |     await page.getByText('제주 여행', { exact: true }).click();
  935 |     // 개요엔 준비 요약 한 줄 → 누르면 '준비' 탭 (준비물·가는 길·현지어가 한곳에)
  936 |     await page.getByTestId('packing-summary').click();
  937 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  938 |     await expect(page.getByTestId('prep-way')).toContainText('제주공항');
  939 |     const pack = page.getByTestId('packing');
  940 |     await pack.getByRole('button', { name: '휴양' }).click();
  941 |     await expect(pack).toContainText('수영복');
  942 |     // 휴양 목록이 저장되며 한 번 다시 그려질 수 있어서: 체크가 남을 때까지 (사람도 안 되면 다시 누른다)
  943 |     await expect(async () => {
  944 |       const box = pack.getByLabel('수영복 챙김');
  945 |       await box.scrollIntoViewIfNeeded();
  946 |       if (!(await box.isChecked())) await box.click();
  947 |       await expect(pack).toContainText(/1\/\d+ 챙김/, { timeout: 2000 });
  948 |     }).toPass({ timeout: 15_000 });
  949 |     await pack.getByLabel('선크림 담당자').click();
  950 |     await expect(pack.getByLabel('선크림 담당자')).toHaveText('보라');
  951 |     await shot(page, '13b-packing');
  952 |   });
  953 | 
  954 |   test('찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기', async ({ page }) => {
  955 |     await signIn(page, OWNER);
  956 |     const box = page.getByTestId('home-ask').getByLabel('물어보기');
  957 |     await box.fill('강릉 맛집');
  958 |     await box.press('Enter');
  959 |     await expect(page).toHaveURL(/\/ask/);
  960 |     const answers = page.getByTestId('answer');
  961 |     await expect(answers.last()).toContainText('초당 순두부');
  962 |     await expect(answers.last()).toContainText('초당할머니순두부');
  963 |     const input = page.getByLabel('질문');
  964 |     await input.fill('거기 언제 가면 좋아?');
  965 |     await input.press('Enter');
  966 |     await expect(answers.last()).toContainText('강원 강릉시는');
  967 |     await input.fill('강릉 몇 번 갔지?');
  968 |     await input.press('Enter');
  969 |     await expect(answers.last()).toContainText('한 번 다녀왔어요');
  970 |     await input.fill('고성 맛집');
  971 |     await input.press('Enter');
  972 |     await expect(answers.last()).toContainText('여러 곳');
  973 |     await answers.last().getByRole('button', { name: '강원 고성군' }).click();
  974 |     await expect(answers.last()).toContainText('강원 고성군');
  975 |     await shot(page, '14-ask');
```