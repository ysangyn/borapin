# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour.spec.ts >> 가득 찬 화면 · 휴대폰
- Location: tests/tour.spec.ts:213:1

# Error details

```
Test timeout of 600000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f73e1]:
  - generic [ref=f73e2]:
    - generic [ref=f73e3]:
      - generic [ref=f73e4]:
        - generic [ref=f73e5]:
          - button "뒤로" [ref=f73e6] [cursor=pointer]
          - heading "내 지도" [level=1] [ref=f73e9]
        - link "담기" [ref=f73e10] [cursor=pointer]:
          - /url: /places/new?region=kr:51150
      - generic [ref=f73e13]:
        - tablist "지역" [ref=f73e14]:
          - tab "강릉시 6" [selected] [ref=f73e15] [cursor=pointer]:
            - text: 강릉시
            - generic [ref=f73e16]: "6"
          - tab "제주 1" [ref=f73e17] [cursor=pointer]:
            - text: 제주
            - generic [ref=f73e18]: "1"
          - tab "부산 1" [ref=f73e19] [cursor=pointer]:
            - text: 부산
            - generic [ref=f73e20]: "1"
          - tab "도쿄 1" [ref=f73e21] [cursor=pointer]:
            - text: 도쿄
            - generic [ref=f73e22]: "1"
          - tab "전주시 1" [ref=f73e23] [cursor=pointer]:
            - text: 전주시
            - generic [ref=f73e24]: "1"
        - tablist "주제" [ref=f73e25]:
          - tab "한눈에" [selected] [ref=f73e26] [cursor=pointer]
          - tab "맛집 1" [ref=f73e27] [cursor=pointer]:
            - text: 맛집
            - generic [ref=f73e29]: "1"
          - tab "카페 4" [ref=f73e30] [cursor=pointer]:
            - text: 카페
            - generic [ref=f73e32]: "4"
          - tab "소품샵 1" [ref=f73e33] [cursor=pointer]:
            - text: 소품샵
            - generic [ref=f73e35]: "1"
        - button "지도 이름·소개 고치기" [ref=f73e36] [cursor=pointer]:
          - heading "강원 강릉시 지도" [level=2] [ref=f73e37]
          - generic [ref=f73e38]: 6곳 · 누르면 이름과 소개를 고쳐요
        - generic [ref=f73e40]:
          - generic:
            - region "Map" [ref=f73e41]
            - button "초당할머니순두부" [ref=f73e42] [cursor=pointer]:
              - generic [ref=f73e43]: "1"
            - button "보헤미안 박이추 커피" [ref=f73e47] [cursor=pointer]:
              - generic [ref=f73e48]: "2"
            - button "테라로사 커피공장" [ref=f73e52] [cursor=pointer]:
              - generic [ref=f73e53]: "3"
            - button "카페 툇마루" [ref=f73e57] [cursor=pointer]
            - button "강릉 월화거리 소품가게" [ref=f73e59] [cursor=pointer]:
              - generic [ref=f73e60]: "1"
          - group [ref=f73e64]:
            - generic "Toggle attribution" [ref=f73e65] [cursor=pointer]
            - generic [ref=f73e66]:
              - link "OpenFreeMap" [ref=f73e67] [cursor=pointer]:
                - /url: https://openfreemap.org
              - link "© OpenMapTiles" [ref=f73e68] [cursor=pointer]:
                - /url: https://www.openmaptiles.org/
              - text: Data from
              - link "OpenStreetMap" [ref=f73e69] [cursor=pointer]:
                - /url: https://www.openstreetmap.org/copyright
        - generic [ref=f73e70]:
          - generic [ref=f73e71]: 맛집 1
          - generic [ref=f73e73]: 카페 4
          - generic [ref=f73e75]: 소품샵 1
        - generic [ref=f73e77]: 1곳은 자리를 몰라 지도엔 없어요 · 장소를 열어 지도 링크를 붙여 넣으면 찍혀요
        - generic [ref=f73e78]:
          - button "이 지도 보내기" [ref=f73e79] [cursor=pointer]
          - button "스토리 카드" [ref=f73e82] [cursor=pointer]
        - generic [ref=f73e83]: 주제마다 내 순위
        - generic [ref=f73e85]:
          - generic [ref=f73e86]:
            - generic [ref=f73e87]:
              - text: 맛집
              - button "이 지도만" [ref=f73e89] [cursor=pointer]
            - generic [ref=f73e90]: "1"
            - link "맛집 초당할머니순두부 또 갈래요 영상 아침으로 최고 보라 짬뽕순두부가 더 맛있었어" [ref=f73e92] [cursor=pointer]:
              - /url: /places/r1
              - generic [ref=f73e93]: 맛집
              - generic [ref=f73e94]:
                - generic [ref=f73e95]:
                  - generic [ref=f73e96]: 초당할머니순두부
                  - generic [ref=f73e97]: 또 갈래요
                - generic [ref=f73e98]: 영상 아침으로 최고
                - generic [ref=f73e99]: 보라 짬뽕순두부가 더 맛있었어
          - generic [ref=f73e100]:
            - generic [ref=f73e101]:
              - text: 카페
              - button "이 지도만" [ref=f73e103] [cursor=pointer]
            - generic [ref=f73e104]: "1"
            - link "카페 안목 커피거리 2호점" [ref=f73e106] [cursor=pointer]:
              - /url: /places/fsDZJDk9ZDmLk9Vbry82
              - generic [ref=f73e107]: 카페
              - generic [ref=f73e108]: 안목 커피거리 2호점
            - generic [ref=f73e111]: "2"
            - link "카페 보헤미안 박이추 커피 또 갈래요 보라 바다 뷰" [ref=f73e113] [cursor=pointer]:
              - /url: /places/r2
              - generic [ref=f73e114]: 카페
              - generic [ref=f73e115]:
                - generic [ref=f73e116]:
                  - generic [ref=f73e117]: 보헤미안 박이추 커피
                  - generic [ref=f73e118]: 또 갈래요
                - generic [ref=f73e119]: 보라 바다 뷰
            - generic [ref=f73e120]: "3"
            - link "카페 테라로사 커피공장 또 갈래요 영상 공장 구경하다 한 시간" [ref=f73e122] [cursor=pointer]:
              - /url: /places/r7
              - generic [ref=f73e123]: 카페
              - generic [ref=f73e124]:
                - generic [ref=f73e125]:
                  - generic [ref=f73e126]: 테라로사 커피공장
                  - generic [ref=f73e127]: 또 갈래요
                - generic [ref=f73e128]: 영상 공장 구경하다 한 시간
          - generic [ref=f73e129]:
            - generic [ref=f73e130]:
              - text: 소품샵
              - button "이 지도만" [ref=f73e132] [cursor=pointer]
            - generic [ref=f73e133]: "1"
            - link "쇼핑 강릉 월화거리 소품가게 또 갈래요 보라 엽서 샀어" [ref=f73e135] [cursor=pointer]:
              - /url: /places/r9
              - generic [ref=f73e136]: 쇼핑
              - generic [ref=f73e137]:
                - generic [ref=f73e138]:
                  - generic [ref=f73e139]: 강릉 월화거리 소품가게
                  - generic [ref=f73e140]: 또 갈래요
                - generic [ref=f73e141]: 보라 엽서 샀어
        - button "강릉시에 더 담기" [ref=f73e142] [cursor=pointer]
      - navigation "주 메뉴" [ref=f73e143]:
        - link "홈" [ref=f73e144] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f73e147] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f73e150] [cursor=pointer]
        - link "지도" [ref=f73e153] [cursor=pointer]:
          - /url: /map
        - link [ref=f73e156] [cursor=pointer]:
          - /url: /feed
    - status
  - iframe [aria-hidden] [ref=f73e160]
```