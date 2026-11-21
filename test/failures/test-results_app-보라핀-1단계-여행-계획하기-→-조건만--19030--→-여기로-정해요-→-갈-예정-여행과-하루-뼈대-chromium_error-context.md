# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 여행 계획하기: + → 조건만 고르면 후보 3곳 → 둘이 하트 → 여기로 정해요 → 갈 예정 여행과 하루 뼈대
- Location: tests/app.spec.ts:641:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('plan-cand')
Expected: 3
Received: 1
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" getByTestId('plan-cand') with timeout 15000ms
  - waiting for getByTestId('plan-cand')
    34 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - button "뒤로" [ref=e6] [cursor=pointer]
        - heading "어디로 갈까요" [level=1] [ref=e9]
      - generic [ref=e10]:
        - generic [ref=e11]: 다음 주말 · 1박 2일 · 둘이 · 내가 고른 조건
        - article [ref=e13]:
          - generic [ref=e14]: 강원 고성군
          - generic [ref=e16]:
            - list [ref=e17]:
              - listitem [ref=e18]: · 영상이 가고 싶다고 한 곳
              - listitem [ref=e19]: · 양양공항 42km
            - group [ref=e20]:
              - generic "기본 정보 ▾" [ref=e21] [cursor=pointer]
            - button "고성군 고르기" [ref=e23] [cursor=pointer]:
              - generic [ref=e27]: 여기 고르기
        - generic [ref=e28]:
          - button "같이 고르자고 보내기" [ref=e29] [cursor=pointer]
          - button "다른 후보" [ref=e32] [cursor=pointer]
        - generic [ref=e35]: 모두 같은 곳을 고르면 '여기로 정해요'가 떠요. 정하면 갈 예정 여행이 생기고, 날짜·숙소·갈 곳·동선을 차례로 같이 정해요.
      - navigation "주 메뉴" [ref=e36]:
        - link "홈" [ref=e37] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=e40] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=e43] [cursor=pointer]
        - link "지도" [ref=e46] [cursor=pointer]:
          - /url: /map
        - link "새 소식 1개 피드" [ref=e49] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 1개" [ref=e53]
          - text: 피드
    - status
  - iframe [aria-hidden] [ref=e54]
```

# Test source

```ts
  555 |     await page.goto('/phrases/ja?city=교토');
  556 |     await expect(page.getByTestId('phrase-row')).toHaveCount(30);
  557 |     await expect(page.getByTestId('phrases')).toContainText('교토에서');
  558 |     await page.getByRole('tab', { name: '급할 때' }).click();
  559 |     await expect(page.getByTestId('phrase-row')).toHaveCount(4);
  560 |     await expect(page.getByTestId('phrase-row').first()).toContainText('도와주세요');
  561 |     await shot(page, '10g-phrases');
  562 |     await page.goto('/phrases/tr');
  563 |     await expect(page.getByTestId('phrases')).toContainText('아직 없어요');
  564 | 
  565 |     // 홈 '다음 여행 준비'는 예정된 제주 여행을 맡고, 여행 탭에도 보인다
  566 |     await page.goto('/');
  567 |     await expect(page.getByTestId('next-hub')).toHaveAttribute('data-anchor', 'trip');
  568 |     await expect(page.getByTestId('hub-first')).toContainText('제주 여행');
  569 |     await page.goto('/trips');
  570 |     await expect(page.getByTestId('trips-wishes')).toContainText('제주');
  571 |   });
  572 | 
  573 |   test('홈 다음 여행 준비: 오늘의 한 질문은 둘 다 답해야 열리고, 영어·가는 길이 같은 곳을 본다', async ({ page, browser }) => {
  574 |     await signIn(page, OWNER);
  575 |     const hub = page.getByTestId('next-hub');
  576 |     await expect(hub).toBeVisible();
  577 |     // 1. 다음은 어디: 예정된 제주 여행이 맨 위, 그다음은 가고 싶은 곳(강원)
  578 |     await expect(hub.getByTestId('hub-first')).toContainText('제주 여행');
  579 |     await expect(hub.locator('.hub-others')).toContainText('강원');
  580 |     // 2. 오늘의 한 질문: 제주 이야기. 내가 답하면 상대 답은 잠겨 있다
  581 |     const ask = hub.getByTestId('hub-ask');
  582 |     await expect(ask).toContainText('제주');
  583 |     await ask.getByLabel('오늘의 질문 답').fill('흑돼지랑 고기국수');
  584 |     await ask.getByTestId('hub-ask-send').click();
  585 |     await expect(page.getByRole('status')).toContainText('답을 남겼어요');
  586 |     await expect(ask.locator('.hub-answer.mine')).toContainText('흑돼지랑 고기국수');
  587 |     await expect(ask.getByTestId('hub-ask-waiting')).toBeVisible();
  588 |     await expect(ask.getByTestId('hub-answer-other')).toHaveCount(0);
  589 |     await shot(page, '10d-home-hub');
  590 |     // 보라가 들어와 같은 질문을 보고 답하면 → 서로의 답이 열린다 (내 화면은 새로 고침 없이)
  591 |     const bora = await browser.newPage();
  592 |     await signIn(bora, 'bora@example.com');
  593 |     const bAsk = bora.getByTestId('hub-ask');
  594 |     await expect(bAsk).toContainText('제주');
  595 |     await expect(bAsk.getByTestId('hub-answer-other')).toHaveCount(0);
  596 |     await bAsk.getByLabel('오늘의 질문 답').fill('한라산 보이는 카페');
  597 |     await bAsk.getByTestId('hub-ask-send').click();
  598 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('흑돼지랑 고기국수');
  599 |     await expect(bAsk.getByTestId('hub-answer-other')).toContainText('영상');
  600 |     await bora.close();
  601 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('한라산 보이는 카페');
  602 |     await expect(ask.getByTestId('hub-answer-other')).toContainText('보라');
  603 |     await expect(ask.getByTestId('hub-ask-waiting')).toHaveCount(0);
  604 |     // 상대의 답은 새 소식: 아래 메뉴에 점, 피드에 '오늘의 질문에 답함'
  605 |     await expect.poll(async () => page.evaluate(() => JSON.stringify((window as unknown as { __unseen?: unknown }).__unseen)), { timeout: 15_000, message: '점 계산 자료에 질문 답' }).toContain('"kind":"ask"');
  606 |     await expect(page.getByTestId('feed-dot')).toBeVisible({ timeout: 15_000 });
  607 |     await page.getByTestId('nav-feed').click();
  608 |     const askItem = page.locator('[data-testid="feed-item"][data-kind="ask"]').first();
  609 |     await expect(askItem).toContainText('한라산 보이는 카페');
  610 |     await expect(page.getByTestId('feed-dot')).toHaveCount(0);
  611 |     await page.goto('/');
  612 |     // 먹을 것·가볼 곳 질문이면 답을 가고 싶은 곳 메모에 넣을 수 있다 (오늘 질문이 그런 종류일 때)
  613 |     const save = ask.locator('.hub-answer.mine').getByRole('button', { name: '메모에 넣기' });
  614 |     if (await save.count()) {
  615 |       await save.click();
  616 |       await expect(page.getByRole('status')).toContainText('메모에 넣었어요');
  617 |       await page.getByRole('status').getByRole('button', { name: '보기' }).click();
  618 |       await expect(page).toHaveURL(/\/wishes\/[A-Za-z0-9]+$/);
  619 |       await expect.poll(() => page.locator('textarea').evaluateAll((els) => els.map((e) => (e as HTMLTextAreaElement).value).join('\n')), { timeout: 15_000 }).toContain('흑돼지랑 고기국수');
  620 |       await page.goto('/');
  621 |     }
  622 |     // 3. 오늘의 영어: 다음 예정 여행(제주)이 국내라 큰 카드 대신 묶음 맨 아래 한 줄 링크
  623 |     await expect(hub.getByTestId('hub-english')).toHaveCount(0);
  624 |     const en = hub.getByTestId('hub-english-line');
  625 |     await expect(en).toContainText('오늘의 영어');
  626 |     await expect(en).toContainText(/\d문장 · 90초/);
  627 |     // 한 줄 링크는 묶음의 맨 아래 (가는 길 뒤)
  628 |     expect((await en.boundingBox())!.y).toBeGreaterThan((await hub.getByTestId('hub-way').boundingBox())!.y);
  629 |     // 4. 가는 길: 같은 곳(제주)의 가기 좋은 때
  630 |     const way = hub.getByTestId('hub-way');
  631 |     await expect(way).toContainText('제주');
  632 |     await expect(way).toContainText('가기 좋은 때');
  633 |     // 바깥 링크(항공권·뉴스)는 국내 여행지엔 없다
  634 |     await expect(way.locator('a[target="_blank"]')).toHaveCount(0);
  635 |     // 우리 집을 안 정했으면 정하러 가는 안내만
  636 |     await expect(way.getByTestId('home-route-empty')).toBeVisible();
  637 |     await en.click();
  638 |     await expect(page).toHaveURL(/\/study$/);
  639 |   });
  640 | 
  641 |   test('여행 계획하기: + → 조건만 고르면 후보 3곳 → 둘이 하트 → 여기로 정해요 → 갈 예정 여행과 하루 뼈대', async ({ page, browser }) => {
  642 |     await signIn(page, OWNER);
  643 |     await expect(page.getByTestId('headline')).toBeVisible();
  644 |     await page.getByRole('button', { name: '남기기', exact: true }).click();
  645 |     await expect(page.getByTestId('plus-sheet')).toBeVisible();
  646 |     await page.getByRole('menuitem', { name: /여행 계획하기/ }).click();
  647 |     await expect(page).toHaveURL(/\/plan$/);
  648 |     await page.getByRole('button', { name: '다음 주말' }).click();
  649 |     await page.getByRole('button', { name: '1박 2일' }).click();
  650 |     await page.getByRole('button', { name: '국내', exact: true }).click();
  651 |     await shot(page, '10h-planner');
  652 |     await page.getByTestId('planner-go').click();
  653 |     await expect(page).toHaveURL(/\/plan\/[A-Za-z0-9]+$/);
  654 |     const cands = page.getByTestId('plan-cand');
> 655 |     await expect(cands).toHaveCount(3);
      |                         ^ Error: expect(locator).toHaveCount(expected) failed
  656 |     const url = page.url();
  657 |     // 나만 하트 → 상대를 기다린다
  658 |     await cands.first().getByTestId('plan-heart').click();
  659 |     await expect(cands.first().getByTestId('plan-heart')).toHaveAttribute('aria-pressed', 'true');
  660 |     await expect(cands.first()).toContainText('상대가 고르길 기다려요');
  661 |     await expect(cands.first().getByTestId('plan-decide')).toHaveCount(0);
  662 |     await shot(page, '10i-plan-pick');
  663 |     const name = (await cands.first().locator('.plan-cand-name').textContent())!.trim();
  664 |     // 보라가 같은 링크로 와서 같은 곳에 하트 → 여기로 정해요
  665 |     const bora = await browser.newPage();
  666 |     await signIn(bora, 'bora@example.com');
  667 |     await bora.goto(url);
  668 |     const bc = bora.getByTestId('plan-cand').filter({ hasText: name });
  669 |     await expect(bc).toContainText('영상');
  670 |     await bc.getByTestId('plan-heart').click();
  671 |     await expect(bc.getByTestId('plan-decide')).toBeVisible();
  672 |     await bora.close();
  673 |     // 내 화면에도 바로 '여기로 정해요'가 뜬다
  674 |     await expect(cands.first().getByTestId('plan-decide')).toBeVisible({ timeout: 15_000 });
  675 |     await cands.first().getByTestId('plan-decide').click();
  676 |     // 정하면 바로 계획 이어가기 다섯 걸음 (에뮬레이터 빌드에서 FLAGS.planFlow 켜짐)
  677 |     await expect(page.getByRole('status')).toContainText('이어서 계획해요');
  678 |     await expect(page).toHaveURL(/\/trips\/[^/?]+\/plan-next/);
  679 |     const flow = page.getByTestId('plan-flow');
  680 |     await expect(flow).toHaveAttribute('data-step', 'when');
  681 |     await expect(page.getByTestId('flow-nights')).toHaveText('1박 2일');
  682 |     // 고른 날(다음 주말)이 달력에 칠해져 있다
  683 |     await expect(page.getByTestId('flow-cal').locator('.c.start')).toHaveCount(1);
  684 |     await shot(page, '10j-plan-when');
  685 |     await page.getByTestId('flow-when-save').click();
  686 |     await expect(flow).toHaveAttribute('data-step', 'stay');
  687 |     // 여기서 멈추고 여행으로 → 맨 위 '이어서 계획하기 1/5 · 다음은 어디서 자요'
  688 |     const tripUrl = page.url().replace(/\/plan-next.*$/, '');
  689 |     await page.goto(tripUrl);
  690 |     await expect(page.getByTestId('plan-continue')).toContainText("1/5 · 다음은 '어디서 자요'");
  691 |     await page.getByTestId('plan-continue').click();
  692 |     await expect(flow).toHaveAttribute('data-step', 'stay');
  693 |     // 정한 뒤 계획 화면은 '정했어요'
  694 |     await page.goto(url);
  695 |     await expect(page.getByTestId('plan-decided')).toBeVisible();
  696 |   });
  697 | 
  698 |   test('우리 장소: 네이버 공유 붙여넣기, 둘의 한 줄 평, 여행 상세·지도 시트에 보임', async ({ page }) => {
  699 |     await signIn(page, OWNER);
  700 |     await page.goto('/trips');
  701 |     await page.getByText('강릉시 여행', { exact: true }).click();
  702 |     await page.getByTestId('trip-places').getByRole('link', { name: '+ 맛집·카페 남기기' }).click();
  703 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  704 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n초당할머니순두부\n강원 강릉시 초당순두부길 77\nhttps://naver.me/xYz12');
  705 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  706 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/xYz12');
  707 |     await expect(page.getByLabel('주소')).toHaveValue('강원 강릉시 초당순두부길 77');
  708 |     // 가리고 쓰기: 켜면 내 것을 쓰기 전엔 보라 칸이 가려지고, 쓰면 열린다 (끄면 그냥 보인다)
  709 |     await page.getByTestId('blind-toggle').click();
  710 |     await expect(page.getByTestId('review-hidden')).toBeVisible();
  711 |     await expect(page.getByLabel('보라 한 줄 평')).toHaveCount(0);
  712 |     await page.getByLabel('영상 한 줄 평').fill('순두부 젤라또까지 완벽');
  713 |     await expect(page.getByLabel('보라 한 줄 평')).toBeVisible();
  714 |     await page.getByTestId('blind-toggle').click();
  715 |     await page.getByLabel('보라 한 줄 평').fill('아침으로 최고');
  716 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  717 |     await shot(page, '11-place-edit');
  718 |     await page.getByTestId('place-save').click();
  719 |     // 개요엔 들른 곳 요약 한 줄만, 평가·한 줄 평은 '들른 곳' 탭에
  720 |     const tp = page.getByTestId('trip-places');
  721 |     await expect(tp).toContainText('맛집·명소 1곳');
  722 |     await expect(tp).toContainText('초당할머니순두부');
  723 |     await tp.getByTestId('places-summary').click();
  724 |     await expect(page.getByRole('tab', { name: '맛집·명소' })).toHaveAttribute('aria-selected', 'true');
  725 |     const visited = page.getByTestId('trip-visited');
  726 |     await expect(visited.getByTestId('place-rec')).toContainText('초당할머니순두부');
  727 |     await expect(visited).toContainText('또 갈래요');
  728 |     await expect(visited).toContainText('순두부 젤라또까지 완벽');
  729 | 
  730 |     // 지도에서 강릉을 누르면 우리 장소가 모여 보인다
  731 |     await page.goto('/');
  732 |     await expectMapDrawn(page);
  733 |     await tapLngLat(page, 128.86, 37.73);
  734 |     const sheet = page.getByTestId('region-sheet');
  735 |     await expect(sheet.getByTestId('sheet-title')).toHaveText('강원 강릉시');
  736 |     await expect(sheet).toContainText('맛집·명소 · 1');
  737 |     await expect(sheet.getByTestId('place-rec')).toContainText('초당할머니순두부');
  738 | 
  739 |     // 우리 장소 목록과 '또 갈래요' 거르기
  740 |     await page.goto('/places');
  741 |     await page.getByRole('button', { name: '또 갈래요' }).click();
  742 |     await expect(page.getByTestId('place-rec')).toHaveCount(1);
  743 |     await shot(page, '11b-places');
  744 | 
  745 |     // 장소를 열면 '보기' 화면: 이름·지도 앱·자리 그림·한 줄 평, 고치기를 누르면 고치는 칸
  746 |     await page.getByTestId('place-rec').click();
  747 |     await expect(page.getByRole('heading', { name: '초당할머니순두부' })).toBeVisible();
  748 |     // 바깥으로 가는 단추는 설정한 지도 앱 길찾기 하나뿐 (11-05 바깥 링크 줄이기)
  749 |     await expect(page.getByTestId('map-app')).toHaveCount(1);
  750 |     await expect(page.getByTestId('spot-map')).toBeVisible();
  751 |     await expect(page.getByText('아침으로 최고')).toBeVisible();
  752 |     await shot(page, '11c-place-view');
  753 |     await page.getByTestId('place-edit').click();
  754 |     await expect(page.getByLabel('장소 이름')).toHaveValue('초당할머니순두부');
  755 |     await page.getByLabel('장소 메모').fill('줄 30분');
```