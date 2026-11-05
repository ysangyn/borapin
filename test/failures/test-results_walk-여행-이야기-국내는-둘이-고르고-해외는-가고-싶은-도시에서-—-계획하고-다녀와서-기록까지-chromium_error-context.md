# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: walk.spec.ts >> 여행 이야기: 국내는 둘이 고르고, 해외는 가고 싶은 도시에서 — 계획하고 다녀와서 기록까지
- Location: tests/walk.spec.ts:116:1

# Error details

```
Test timeout of 1500000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f10e1]:
  - generic [ref=f10e2]:
    - generic [ref=f10e3]:
      - generic [ref=f10e5]:
        - button "뒤로" [ref=f10e6] [cursor=pointer]
        - generic [ref=f10e9]: 안동시 여행 계획
      - generic [ref=f10e10]:
        - tablist "계획 걸음" [ref=f10e11]:
          - tab "1. 언제 가요?" [ref=f10e12] [cursor=pointer]
          - tab "2. 어디서 자요?" [ref=f10e13] [cursor=pointer]
          - tab "3. 같이 찾아 담아요" [ref=f10e14] [cursor=pointer]
          - tab "4. 이렇게 다니면 어때요?" [selected] [ref=f10e15] [cursor=pointer]
          - tab "5. 제일 기대되는 건?" [ref=f10e16] [cursor=pointer]
        - generic [ref=f10e17]:
          - heading "이렇게 다니면 어때요?" [level=1] [ref=f10e18]
          - paragraph [ref=f10e19]: 가까운 곳끼리 날마다 묶었어요 · 바꿔도 돼요
        - generic [ref=f10e20]:
          - generic [ref=f10e21]:
            - generic [ref=f10e22]:
              - generic [ref=f10e23]: 가는 길
              - button "정하기" [ref=f10e24] [cursor=pointer]
            - generic [ref=f10e25]: 대중교통이면 갈아타는 길·들러 가는 길도 골라 드려요
          - paragraph [ref=f10e26]: 아직 담은 곳이 없어요. '같이 찾아 담기'에서 하트를 눌러 보세요.
          - generic [ref=f10e27]:
            - generic [ref=f10e28]:
              - generic [ref=f10e29]: 돌아오는 길
              - button "정하기" [ref=f10e30] [cursor=pointer]
            - generic [ref=f10e31]: 대중교통이면 갈아타는 길·들러 가는 길도 골라 드려요
          - button "다음" [ref=f10e32] [cursor=pointer]
        - button "건너뛰기" [active] [ref=f10e33] [cursor=pointer]
      - navigation "주 메뉴" [ref=f10e34]:
        - link "홈" [ref=f10e35] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f10e38] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f10e41] [cursor=pointer]
        - link "지도" [ref=f10e44] [cursor=pointer]:
          - /url: /map
        - link "새 소식 5개 피드" [ref=f10e47] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 5개" [ref=f10e51]
          - text: 피드
    - status
  - iframe [aria-hidden] [ref=f10e52]
```