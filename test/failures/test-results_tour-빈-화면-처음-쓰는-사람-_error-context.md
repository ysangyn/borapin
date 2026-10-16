# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 빈 화면 (처음 쓰는 사람)
- Location: tests/tour.spec.ts:69:1

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img "보라핀 로고" [ref=e6]
        - text: 보라핀
      - generic [ref=e10]:
        - link "찾아보기" [ref=e11] [cursor=pointer]:
          - /url: /ask
        - link "우리 공간" [ref=e14] [cursor=pointer]:
          - /url: /space
          - generic "보라 · 영상" [ref=e15]:
            - generic [ref=e16]: 보
            - generic [ref=e17]: 영
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: 보라 & 영상의 지도
        - generic [ref=e21]: 첫 핀을 꽂아 볼까요?
      - generic [ref=e22]:
        - generic [ref=e23]:
          - tablist [ref=e24]:
            - tab "국내" [selected] [ref=e25] [cursor=pointer]
            - tab "세계" [ref=e26] [cursor=pointer]
          - link "지도 크게 보기" [ref=e27] [cursor=pointer]:
            - /url: /map
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic:
              - region "Map" [ref=e30]
              - generic [aria-hidden]:
                - generic: Use two fingers to move the map
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
          - generic [ref=e31]:
            - button "확대" [ref=e32] [cursor=pointer]
            - separator [ref=e35]
            - button "축소" [ref=e36] [cursor=pointer]
            - separator [ref=e38]
            - button "전체 보기" [ref=e39] [cursor=pointer]
        - generic [ref=e42]: 지역을 누르면 바로 핀을 꽂을 수 있어요 · 확대하면 이름이 보여요
        - generic [ref=e43]:
          - generic [ref=e44]:
            - text: "0"
            - generic [ref=e45]: 다녀온 시·군
          - generic [ref=e46]:
            - text: "0"
            - generic [ref=e47]: 해외 나라
          - generic [ref=e48]:
            - text: "0"
            - generic [ref=e49]: 여행·나들이
          - generic [ref=e50]:
            - text: "0"
            - generic [ref=e51]: 예정
      - generic [ref=e52]:
        - generic [ref=e53]:
          - heading "가고 싶은 곳" [level=2] [ref=e54]
          - link "여행지 뽑기" [ref=e55] [cursor=pointer]:
            - /url: /wishes
        - generic [ref=e56]:
          - generic [ref=e57]: 가고 싶은 곳 3곳만 담아볼까요?
          - generic [ref=e58]:
            - generic [ref=e59]:
              - text: 경기 용인시
              - generic [ref=e60]: 환상의 나라와 민속촌의 전통 체험
            - button "담기" [ref=e61] [cursor=pointer]
          - generic [ref=e64]:
            - generic [ref=e65]:
              - text: 경기 구리시
              - generic [ref=e66]: 왕의 쉼터와 한강변의 여유로운 산책
            - button "담기" [ref=e67] [cursor=pointer]
          - generic [ref=e70]:
            - generic [ref=e71]:
              - text: 경남 거창군
              - generic [ref=e72]: 수승대의 시원한 물놀이와 우두산 출렁다리
            - button "담기" [ref=e73] [cursor=pointer]
      - textbox "찾아보기" [ref=e79]:
        - /placeholder: "찾아보기: 영등포 맛집, 작년 여름에 간 곳"
      - generic [ref=e80]:
        - generic [ref=e81]:
          - heading "최근 기록" [level=2] [ref=e82]
          - link "전체 보기" [ref=e83] [cursor=pointer]:
            - /url: /trips
        - generic [ref=e84]:
          - generic [ref=e85]: 아직 기록이 없어요
          - generic [ref=e86]: 위 지도에서 다녀온 곳을 누르면 바로 핀이 꽂혀요.날짜·메모는 나중에 적어도 돼요.
          - link "기록 남기기" [ref=e87] [cursor=pointer]:
            - /url: /record
    - navigation "주 메뉴" [ref=e88]:
      - link "홈" [ref=e89] [cursor=pointer]:
        - /url: /
      - link "여행" [ref=e92] [cursor=pointer]:
        - /url: /trips
      - link "기록하기" [ref=e95] [cursor=pointer]:
        - /url: /record
      - link "지도" [ref=e98] [cursor=pointer]:
        - /url: /map
      - link "추억" [ref=e101] [cursor=pointer]:
        - /url: /memories
  - iframe [aria-hidden] [ref=e104]
```