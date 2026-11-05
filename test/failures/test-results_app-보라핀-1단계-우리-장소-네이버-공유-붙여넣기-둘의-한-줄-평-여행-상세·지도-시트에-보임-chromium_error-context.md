# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임
- Location: tests/app.spec.ts:612:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('navigation', { name: '지도 앱으로 열기' }).getByRole('link')
Expected: 3
Received: 0
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" getByRole('navigation', { name: '지도 앱으로 열기' }).getByRole('link') with timeout 15000ms
  - waiting for getByRole('navigation', { name: '지도 앱으로 열기' }).getByRole('link')
    34 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [active] [ref=f6e1]:
  - generic [ref=f6e2]:
    - generic [ref=f6e3]:
      - generic [ref=f6e4]:
        - generic [ref=f6e5]:
          - button "뒤로" [ref=f6e6] [cursor=pointer]
          - heading "장소" [level=1] [ref=f6e9]
        - button "고치기" [ref=f6e10] [cursor=pointer]
      - generic [ref=f6e13]:
        - banner [ref=f6e14]:
          - generic [ref=f6e15]:
            - generic [ref=f6e16]: 맛집
            - generic [ref=f6e17]: 또 갈래요
          - heading "초당할머니순두부" [level=1] [ref=f6e18]
          - generic [ref=f6e19]: 강원 강릉시
          - 'button "주소 복사: 강원 강릉시 초당순두부길 77" [ref=f6e20] [cursor=pointer]':
            - generic [ref=f6e23]: 강원 강릉시 초당순두부길 77
            - generic [ref=f6e24]: 복사
        - link "지도 앱으로 길찾기" [ref=f6e25] [cursor=pointer]:
          - /url: https://naver.me/xYz12
          - generic [aria-hidden] [ref=f6e26]: "N"
          - text: 지도 앱으로 길찾기
        - generic [ref=f6e27]:
          - img "강릉시 안의 자리" [ref=f6e28]:
            - generic [ref=f6e43]: 강릉시
          - generic [ref=f6e44]: 정확한 자리는 지도 링크에서 찾는 중이에요
        - link "강릉시 여행 2024년쯤에 간 여행" [ref=f6e45] [cursor=pointer]:
          - /url: /trips/rtp3LJU2pzdgaQN5rxVw
          - generic [ref=f6e48]:
            - text: 강릉시 여행
            - generic [ref=f6e49]: 2024년쯤에 간 여행
        - generic [ref=f6e52]:
          - heading "한 줄 평" [level=2] [ref=f6e53]
          - generic [ref=f6e54]:
            - generic [aria-hidden] [ref=f6e55]: 보
            - generic [ref=f6e56]:
              - generic [ref=f6e57]: 보라
              - generic [ref=f6e58]: 아침으로 최고
          - generic [ref=f6e59]:
            - generic [aria-hidden] [ref=f6e60]: 영
            - generic [ref=f6e61]:
              - generic [ref=f6e62]: 영상
              - generic [ref=f6e63]: 순두부 젤라또까지 완벽
        - button "이 장소 지우기" [ref=f6e64] [cursor=pointer]
    - status
  - iframe [aria-hidden] [ref=f6e67]
```

# Test source

```ts
  562 |     await page.getByRole('button', { name: '다음 주말' }).click();
  563 |     await page.getByRole('button', { name: '1박 2일' }).click();
  564 |     await page.getByRole('button', { name: '국내', exact: true }).click();
  565 |     await shot(page, '10h-planner');
  566 |     await page.getByTestId('planner-go').click();
  567 |     await expect(page).toHaveURL(/\/plan\/[A-Za-z0-9]+$/);
  568 |     const cands = page.getByTestId('plan-cand');
  569 |     await expect(cands).toHaveCount(3);
  570 |     const url = page.url();
  571 |     // 나만 하트 → 상대를 기다린다
  572 |     await cands.first().getByTestId('plan-heart').click();
  573 |     await expect(cands.first().getByTestId('plan-heart')).toHaveAttribute('aria-pressed', 'true');
  574 |     await expect(cands.first()).toContainText('상대가 고르길 기다려요');
  575 |     await expect(cands.first().getByTestId('plan-decide')).toHaveCount(0);
  576 |     await shot(page, '10i-plan-pick');
  577 |     const name = (await cands.first().locator('.plan-cand-name').textContent())!.trim();
  578 |     // 보라가 같은 링크로 와서 같은 곳에 하트 → 여기로 정해요
  579 |     const bora = await browser.newPage();
  580 |     await signIn(bora, 'bora@example.com');
  581 |     await bora.goto(url);
  582 |     const bc = bora.getByTestId('plan-cand').filter({ hasText: name });
  583 |     await expect(bc).toContainText('영상');
  584 |     await bc.getByTestId('plan-heart').click();
  585 |     await expect(bc.getByTestId('plan-decide')).toBeVisible();
  586 |     await bora.close();
  587 |     // 내 화면에도 바로 '여기로 정해요'가 뜬다
  588 |     await expect(cands.first().getByTestId('plan-decide')).toBeVisible({ timeout: 15_000 });
  589 |     await cands.first().getByTestId('plan-decide').click();
  590 |     // 정하면 바로 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서 FLAGS.planFlow 켜짐)
  591 |     await expect(page.getByRole('status')).toContainText('이어서 계획해요');
  592 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\/plan-next/);
  593 |     const flow = page.getByTestId('plan-flow');
  594 |     await expect(flow).toHaveAttribute('data-step', 'when');
  595 |     await expect(page.getByTestId('flow-nights')).toHaveText('1박 2일');
  596 |     // 고른 날(다음 주말)이 달력에 칠해져 있다
  597 |     await expect(page.getByTestId('flow-cal').locator('.c.start')).toHaveCount(1);
  598 |     await shot(page, '10j-plan-when');
  599 |     await page.getByTestId('flow-when-save').click();
  600 |     await expect(flow).toHaveAttribute('data-step', 'stay');
  601 |     // 여기서 멈추고 여행으로 → 맨 위 '이어서 계획하기 1/5 · 다음은 어디서 자요'
  602 |     const tripUrl = page.url().replace(/\/plan-next.*$/, '');
  603 |     await page.goto(tripUrl);
  604 |     await expect(page.getByTestId('plan-continue')).toContainText("1/5 · 다음은 '어디서 자요'");
  605 |     await page.getByTestId('plan-continue').click();
  606 |     await expect(flow).toHaveAttribute('data-step', 'stay');
  607 |     // 정한 뒤 계획 화면은 '정했어요'
  608 |     await page.goto(url);
  609 |     await expect(page.getByTestId('plan-decided')).toBeVisible();
  610 |   });
  611 | 
  612 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  613 |     await signIn(page, OWNER);
  614 |     await page.goto('/trips');
  615 |     await page.getByText('강릉시 여행', { exact: true }).click();
  616 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 장소 남기기' }).click();
  617 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  618 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  619 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  620 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
  621 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  622 |     // 가리고 쓰기: 켜면 내 것을 쓰기 전엔 보라 칸이 가려지고, 쓰면 열린다 (끄면 그냥 보인다)
  623 |     await page.getByTestId('blind-toggle').click();
  624 |     await expect(page.getByTestId('review-hidden')).toBeVisible();
  625 |     await expect(page.getByLabel('보라 한 줄 평')).toHaveCount(0);
  626 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  627 |     await expect(page.getByLabel('보라 한 줄 평')).toBeVisible();
  628 |     await page.getByTestId('blind-toggle').click();
  629 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  630 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  631 |     await shot(page, '11-place-edit');
  632 |     await page.getByTestId('place-save').click();
  633 |     // 개요엔 들른 곳 요약 한 줄만, 평가·한 줄 평은 '들른 곳' 탭에
  634 |     const tp = page.getByTestId('trip-places');
  635 |     await expect(tp).toContainText('우리 장소 1곳');
  636 |     await expect(tp).toContainText('초당할머니순두부');
  637 |     await tp.getByTestId('places-summary').click();
  638 |     await expect(page.getByRole('tab', { name: '들른 곳' })).toHaveAttribute('aria-selected', 'true');
  639 |     const visited = page.getByTestId('trip-visited');
  640 |     await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
  641 |     await expect(visited).toContainText('또 갈래요');
  642 |     await expect(visited).toContainText('순두부 젤라또까지 완벽');
  643 | 
  644 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  645 |     await page.goto('/');
  646 |     await expectMapDrawn(page);
  647 |     await tapLngLat(page, 128.86, 37.73);
  648 |     const sheet = page.getByTestId('region-sheet');
  649 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  650 |     await expect(sheet).toContainText('우리 장소 · 1');
  651 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  652 | 
  653 |     // 우리 장소 목록과 '또 갈래요' 거르기
  654 |     await page.goto('/places');
  655 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  656 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  657 |     await shot(page, '11b-places');
  658 | 
  659 |     // 장소를 열면 '보기' 화면: 이름·지도 앱·자리 그림·한 줄 평, 고치기를 누르면 고치는 칸
  660 |     await page.getByTestId('place-rec').click();
  661 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
> 662 |     await expect(page.getByRole('navigation', { name: '지도 앱으로 열기' }).getByRole('link')).toHaveCount(3);
      |                                                                                         ^ Error: expect(locator).toHaveCount(expected) failed
  663 |     await expect(page.getByTestId('spot-map')).toBeVisible();
  664 |     await expect(page.getByText('아침으로 최고')).toBeVisible();
  665 |     await shot(page, '11c-place-view');
  666 |     await page.getByTestId('place-edit').click();
  667 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  668 |     await page.getByLabel('장소 메모').fill('줄 30분');
  669 |     await page.getByTestId('place-save').click();
  670 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  671 |     await expect(page.getByText('줄 30분')).toBeVisible();
  672 |   });
  673 | 
  674 |   test('사진: 촬영 정보로 날짜 채우기, 표지, 슬라이드쇼, 사진첩', async ({ page }) => {
  675 |     await signIn(page, OWNER);
  676 |     await page.goto('/trips');
  677 |     await page.getByText('강릉시 여행', { exact: true }).click();
  678 |     await page.getByRole('tab', { name: /사진/ }).click();
  679 |     const sec = page.getByTestId('trip-photos');
  680 |     await sec.getByTestId('photo-input').setInputFiles([
  681 |       'tests/fixtures/photo-gangneung.jpg',
  682 |       'tests/fixtures/photo-gangneung2.jpg',
  683 |       'tests/fixtures/photo-noexif.jpg',
  684 |     ]);
  685 |     await expect(page.getByRole('status')).toContainText('사진 3장을 올렸어요', { timeout: 40_000 });
  686 |     await expect(sec.locator('.photo-cell img[data-loaded]')).toHaveCount(3);
  687 |     // 촬영일(2019.5.3~4)로 날짜 채우기
  688 |     const sug = page.getByTestId('photo-suggest');
  689 |     await expect(sug).toContainText('2019.5.3–4');
  690 |     await sug.getByRole('button', { name: '채우기' }).click();
  691 |     await expect(page.getByText(/^2019\.5\.3–4( · 1박 2일)?$/).first()).toBeVisible();
  692 |     await expect(page.getByTestId('photo-suggest')).toHaveCount(0);
  693 |     await shot(page, '12-photos');
  694 |     // 표지 사진은 개요 탭 위에
  695 |     await page.getByRole('tab', { name: '개요' }).click();
  696 |     await expect(page.locator('.trip-cover img')).toBeVisible();
  697 |     await page.getByRole('tab', { name: /사진/ }).click();
  698 |     // 슬라이드쇼: 자막에 촬영 시각과 장소
  699 |     await sec.locator('.photo-cell img').first().click();
  700 |     const cap = page.locator('.pswp__caption-bp');
  701 |     await expect(cap).toContainText('2019.5.3 14:20');
  702 |     await expect(cap).toContainText('강원 강릉시');
  703 |     await page.waitForTimeout(600);
  704 |     await shot(page, '12b-slideshow');
  705 |     await expect(page.locator('.pswp__img').first()).toHaveAttribute('src', /^blob:/);
  706 |     await page.keyboard.press('Escape');
  707 |     // 추억 탭: 사진첩, 지도 다시 보기, 결산, 잔디, 뱃지
  708 |     await page.goto('/memories');
  709 |     await expect(page.getByTestId('album')).toContainText('강릉시 여행 · 3장');
  710 |     // 새로 열면 사진 파일을 DB에서 받아 그린다
  711 |     await page.getByTestId('album').scrollIntoViewIfNeeded();
  712 |     const albumImgs = page.getByTestId('album').locator('img[data-loaded]');
  713 |     await expect(albumImgs).toHaveCount(3);
  714 |     expect(await albumImgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(100);
  715 |     await expect(page.getByTestId('replay-year')).toBeVisible();
  716 |     await page.getByLabel('다시 보기 연도').fill('0');
  717 |     const firstYear = await page.getByTestId('replay-year').textContent();
  718 |     await page.getByTestId('replay-play').click();
  719 |     await expect(page.getByTestId('replay-year')).not.toHaveText(firstYear ?? '', { timeout: 5000 });
  720 |     await page.getByLabel('결산 연도').selectOption('2019');
  721 |     await expect(page.getByTestId('year-review')).toContainText('처음 가본 곳');
  722 |     await expect(page.getByTestId('year-review')).toContainText('2');
  723 |     await expect(page.getByTestId('heatmap')).toBeVisible();
  724 |     await expect(page.getByTestId('badges').locator('.badge.on').first()).toContainText('첫 핀');
  725 |     await shot(page, '12c-memories');
  726 |   });
  727 | 
  728 |   test('여행 상세: 탭 넷, 일정 3단계, 들른 곳, 둘의 기록, 예정 여행 준비물', async ({ page }) => {
  729 |     await signIn(page, OWNER);
  730 |     // 홈 단계 카드: 다음 주말 여행(계획하기로 만든 것). 단추는 말한 탭(준비)으로, 카드는 개요로
  731 |     await expect(page.getByTestId('headline')).toBeVisible();
  732 |     const stage = page.getByTestId('stage-card');
  733 |     await expect(stage).toHaveAttribute('data-stage', 'before');
  734 |     // 계획 걸음이 남았으면 단추는 '이어서 계획하기' (남은 첫 걸음으로)
  735 |     await expect(stage.getByTestId('stage-plan')).toHaveText('이어서 계획하기');
  736 |     await expect(stage.getByTestId('stage-plan')).toHaveAttribute('href', /^\/trips\/[^/?]+\/plan-next\?step=stay$/);
  737 |     await expect(stage).toContainText("계획 1/5 · 다음은 '어디서 자요'");
  738 |     // 접힌 둘러보기 칸 제목엔 '추억'이 없다 (추억 카드는 있으면 접힌 칸 안에)
  739 |     await expect(page.getByTestId('home-more').locator('summary')).toHaveText('이달의 추천 · 가고 싶은 곳');
  740 |     await page.goto((await stage.getByTestId('stage-link').getAttribute('href'))! + '?tab=prep');
  741 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\?tab=prep$/);
  742 |     await expect(page.getByRole('tab', { name: '준비' })).toHaveAttribute('aria-selected', 'true');
  743 |     // 예정 여행의 탭은 개요·일정·준비·사진 (글은 개요 아래)
  744 |     const tabs = page.getByTestId('trip-tabs').getByRole('tab');
  745 |     await expect(tabs).toHaveText(['개요', '일정', '준비', /^사진/]);
  746 |     // 주소로 없는 탭(글)을 열면 개요로, 개요 아래에 글 쓰는 칸
  747 |     await page.goto(page.url().replace(/\?tab=prep$/, '?tab=notes'));
  748 |     await expect(page.getByRole('tab', { name: '개요' })).toHaveAttribute('aria-selected', 'true');
  749 |     await expect(page.getByTestId('trip-notes').getByTestId('notes-tab')).toBeVisible();
  750 | 
  751 |     // 일정 ① 적기(한글 Enter·추가 단추) ② 날짜 ③ 시간
  752 |     await page.getByRole('tab', { name: '일정' }).click();
  753 |     const plan = page.getByTestId('plan-tab');
  754 |     // 이미 있던 일정이 다 그려진 뒤에 센다 (구독이 늦게 와서 0개로 세는 일이 없게: 개수가 1초 동안 그대로일 때)
  755 |     await expect(plan.getByLabel('가볼 곳 추가')).toBeVisible();
  756 |     let n0 = -1;
  757 |     for (let k = 0, same = 0; k < 40 && same < 4; k++) {
  758 |       const c = await plan.getByTestId('plan-item').count();
  759 |       same = c === n0 ? same + 1 : 0;
  760 |       n0 = c;
  761 |       await page.waitForTimeout(250);
  762 |     }
```