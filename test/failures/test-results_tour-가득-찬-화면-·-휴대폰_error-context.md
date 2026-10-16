# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:200:1

# Error details

```
Test timeout of 240000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f16e1]:
  - generic [ref=f16e3]:
    - generic [ref=f16e4]:
      - generic [ref=f16e5]:
        - generic [ref=f16e6]:
          - generic:
            - region "Map" [ref=f16e7]
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
            - generic: "1"
            - generic: "2"
        - generic [ref=f16e8]:
          - button "확대" [ref=f16e9] [cursor=pointer]
          - separator [ref=f16e12]
          - button "축소" [ref=f16e13] [cursor=pointer]
          - separator [ref=f16e15]
          - button "전체 보기" [ref=f16e16] [cursor=pointer]
        - generic [ref=f16e19]:
          - generic [ref=f16e20]: 다녀옴
          - generic [ref=f16e22]: 2번
          - generic [ref=f16e24]: 3번 이상
          - generic [ref=f16e26]: 예정
      - generic:
        - tablist [ref=f16e28]:
          - tab "국내" [selected] [ref=f16e29] [cursor=pointer]
          - tab "세계" [ref=f16e30] [cursor=pointer]
        - generic [ref=f16e31]:
          - generic [ref=f16e32]:
            - text: 시·군
            - generic [ref=f16e33]: "9"
            - text: /160
          - generic [ref=f16e34]:
            - text: 광역
            - generic [ref=f16e35]: "7"
            - text: /16
          - generic [ref=f16e36]: 예정 2
    - navigation "주 메뉴" [ref=f16e37]:
      - link "홈" [ref=f16e38] [cursor=pointer]:
        - /url: /
      - link "여행" [ref=f16e41] [cursor=pointer]:
        - /url: /trips
      - link "기록하기" [ref=f16e44] [cursor=pointer]:
        - /url: /record
      - link "지도" [ref=f16e47] [cursor=pointer]:
        - /url: /map
      - link "추억" [ref=f16e50] [cursor=pointer]:
        - /url: /memories
  - iframe [aria-hidden] [ref=f16e53]
```