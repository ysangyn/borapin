# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 관리자: 사용량, 사진 올리기 멈춤, 문제 신고
- Location: tests/app.spec.ts:473:3

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f4e1]:
  - generic [ref=f4e3]:
    - generic [ref=f4e4]:
      - generic [ref=f4e5]:
        - button "뒤로" [ref=f4e6] [cursor=pointer]
        - generic [ref=f4e9]: 여행
      - link "고치기" [ref=f4e10] [cursor=pointer]:
        - /url: /trips/405kYMW9y1rpUivx2TfB/edit
    - generic [ref=f4e13]:
      - generic [ref=f4e14]:
        - generic [ref=f4e15]: 강릉시 여행
        - generic [ref=f4e16]: 2019.5.3–4 (추정) · 1박 2일
      - button "표지 사진 크게 보기" [ref=f4e17] [cursor=pointer]
      - tablist "여행 보기" [ref=f4e18]:
        - tab "개요" [ref=f4e19] [cursor=pointer]
        - tab "일정" [ref=f4e20] [cursor=pointer]
        - tab "사진 3" [active] [selected] [ref=f4e21] [cursor=pointer]
        - tab "기록 1" [ref=f4e22] [cursor=pointer]
      - generic [ref=f4e23]:
        - generic [ref=f4e24]:
          - heading "사진 · 3" [level=2] [ref=f4e25]
          - button "▶ 슬라이드쇼" [ref=f4e26] [cursor=pointer]
        - generic [ref=f4e27]:
          - button "사진 1 크게 보기" [ref=f4e28] [cursor=pointer]
          - button "사진 2 크게 보기" [ref=f4e29] [cursor=pointer]
          - button "사진 3 크게 보기" [ref=f4e30] [cursor=pointer]
          - button "사진" [disabled] [ref=f4e31] [cursor=pointer]
    - navigation "주 메뉴" [ref=f4e35]:
      - link "홈" [ref=f4e36] [cursor=pointer]:
        - /url: /
      - link "여행" [ref=f4e39] [cursor=pointer]:
        - /url: /trips
      - link "기록하기" [ref=f4e42] [cursor=pointer]:
        - /url: /record
      - link "지도" [ref=f4e45] [cursor=pointer]:
        - /url: /map
      - link "추억" [ref=f4e48] [cursor=pointer]:
        - /url: /memories
  - iframe [aria-hidden] [ref=f4e51]
```