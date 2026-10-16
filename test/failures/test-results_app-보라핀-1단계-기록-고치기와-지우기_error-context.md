# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 기록 고치기와 지우기
- Location: tests/app.spec.ts:597:3

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e4]:
        - generic [ref=f2e5]:
          - button "뒤로" [ref=f2e6] [cursor=pointer]
          - generic [ref=f2e9]: 여행
        - link "고치기" [ref=f2e10] [cursor=pointer]:
          - /url: /trips/UrM3YTleDjYgfxlTjIu2/edit
      - generic [ref=f2e13]:
        - generic [ref=f2e14]:
          - generic [ref=f2e15]: 엄마랑 강릉
          - generic [ref=f2e16]: 2019.5.3–4 (추정) · 1박 2일
        - button "표지 사진 크게 보기" [ref=f2e18] [cursor=pointer]
        - tablist "여행 보기" [ref=f2e19]:
          - tab "개요" [selected] [ref=f2e20] [cursor=pointer]
          - tab "일정" [ref=f2e21] [cursor=pointer]
          - tab "사진 3" [ref=f2e22] [cursor=pointer]
          - tab "글 1" [ref=f2e23] [cursor=pointer]
        - generic [ref=f2e24]:
          - generic [ref=f2e25]:
            - generic:
              - region "Map" [ref=f2e26]
              - generic: 동해
              - generic: 서해
              - generic: 남해
          - generic [aria-hidden]:
            - generic: 강릉시
            - generic: 동해시
            - generic: 홍천군
            - generic: 평창군
            - generic: 횡성군
            - generic: 양양군
        - generic [ref=f2e27]:
          - generic [ref=f2e28]:
            - generic [ref=f2e29]: 어디
            - generic [ref=f2e31]:
              - generic [ref=f2e32]: 강원 강릉시
              - link "네이버지도" [ref=f2e33] [cursor=pointer]:
                - /url: https://map.naver.com/p/search/%EA%B0%95%EC%9B%90%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EA%B0%95%EB%A6%89%EC%8B%9C
              - link "구글지도" [ref=f2e34] [cursor=pointer]:
                - /url: https://www.google.com/maps/search/?api=1&query=%EA%B0%95%EC%9B%90%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EA%B0%95%EB%A6%89%EC%8B%9C
          - generic [ref=f2e35]:
            - generic [ref=f2e36]: 누구와
            - generic [ref=f2e37]: 보라, 영상, 엄마
          - generic [ref=f2e38]:
            - generic [ref=f2e39]: 남긴 사람
            - generic [ref=f2e40]: 영상
        - generic [ref=f2e41]:
          - generic [ref=f2e42]:
            - heading "장소" [level=2] [ref=f2e43]
            - link "+ 장소 남기기" [ref=f2e44] [cursor=pointer]:
              - /url: /places/new?trip=UrM3YTleDjYgfxlTjIu2
          - link "맛집 초당할머니순두부 또 갈래요 영상 순두부 젤라또까지 완벽 보라 아침으로 최고" [ref=f2e46] [cursor=pointer]:
            - /url: /places/cQIMhGBbaMPuHM77Oatj
            - generic [ref=f2e47]: 맛집
            - generic [ref=f2e48]:
              - generic [ref=f2e49]:
                - generic [ref=f2e50]: 초당할머니순두부
                - generic [ref=f2e51]: 또 갈래요
              - generic [ref=f2e52]: 영상 순두부 젤라또까지 완벽
              - generic [ref=f2e53]: 보라 아침으로 최고
        - generic [ref=f2e54]:
          - generic [ref=f2e55]:
            - generic [ref=f2e56]: 링크 공개
            - generic [ref=f2e59]: 우리만 보기
          - generic [ref=f2e60]: 앱이 없어도 이 여행을 볼 수 있는 링크를 만들어요. 제목·날짜·장소, 사진과 촬영 날짜·설명, 들른 곳 이름이 보여요. 메모와 글, 함께 간 사람 이름은 넣지 않아요.
          - button "링크 만들기" [ref=f2e61] [cursor=pointer]
        - generic [ref=f2e62]:
          - generic [ref=f2e63]: 정말 지울까요? 사진 3장과 일정·글도 함께 지워져요. 되돌릴 수 없어요.
          - generic [ref=f2e64]:
            - button "그대로 두기" [ref=f2e65] [cursor=pointer]
            - button "지우기" [ref=f2e66] [cursor=pointer]
      - navigation "주 메뉴" [ref=f2e67]:
        - link "홈" [ref=f2e68] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f2e71] [cursor=pointer]:
          - /url: /trips
        - link "기록하기" [ref=f2e74] [cursor=pointer]:
          - /url: /record
        - link "지도" [ref=f2e77] [cursor=pointer]:
          - /url: /map
        - link "추억" [ref=f2e80] [cursor=pointer]:
          - /url: /memories
      - link "보라에게 물어봐" [ref=f2e83] [cursor=pointer]:
        - /url: /ask
        - generic [aria-hidden] [ref=f2e84]: 물어봐요
    - status
  - iframe [aria-hidden] [ref=f2e85]
```