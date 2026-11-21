# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: circles.spec.ts >> 모임: 만들고 → 가게를 걸고 → 손님 친구가 들어와 보고 → 손님도 건다
- Location: tests/circles.spec.ts:20:1

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e3]:
      - generic [ref=f4e4]:
        - generic [ref=f4e5]:
          - button "뒤로" [ref=f4e6] [cursor=pointer]
          - heading "대학 친구" [level=1] [ref=f4e9]
        - button "닫기" [ref=f4e10] [cursor=pointer]
      - generic [ref=f4e11]:
        - generic [ref=f4e12]:
          - button "영상 · 방장 (나)" [ref=f4e13] [cursor=pointer]
          - generic [ref=f4e16]: 민지
        - generic [ref=f4e17]:
          - generic [ref=f4e18]:
            - generic [ref=f4e19]: 링크를 받은 사람이 로그인하면 이 모임에 들어와요. 보라핀을 안 쓰던 사람도 모임만 볼 수 있어요. 7일 동안, 한 번만 쓸 수 있어요.
            - button "초대 링크 만들기" [ref=f4e20] [cursor=pointer]
          - generic [ref=f4e23]:
            - generic [ref=f4e24]: 민지
            - button "내보내기" [ref=f4e25] [cursor=pointer]
          - generic [ref=f4e26]:
            - button "모임 이름 바꾸기" [ref=f4e27] [cursor=pointer]
            - button "모임 없애기" [ref=f4e28] [cursor=pointer]
        - button "내 가게 걸기" [ref=f4e29] [cursor=pointer]
        - generic [ref=f4e32]:
          - generic [ref=f4e33]:
            - generic [ref=f4e34]:
              - generic [ref=f4e36]: 모임빵집
              - generic [ref=f4e37]: 맛집
            - generic [ref=f4e38]:
              - text: 영상
              - generic [ref=f4e39]: · 고양시
            - button "내리기" [ref=f4e41] [cursor=pointer]
          - generic [ref=f4e42]:
            - generic [ref=f4e43]:
              - generic [ref=f4e45]: 민지네 단골 국수
              - generic [ref=f4e46]: 맛집
            - generic [ref=f4e47]:
              - text: 민지
              - generic [ref=f4e48]: 또 갈래요
              - generic [ref=f4e49]: · 면이 쫄깃해요
            - generic [ref=f4e50]:
              - button "가고 싶은 곳에 담기" [ref=f4e51] [cursor=pointer]
              - button "내리기" [ref=f4e52] [cursor=pointer]
      - navigation "주 메뉴" [ref=f4e53]:
        - link "홈" [ref=f4e54] [cursor=pointer]:
          - /url: /
        - link "여행" [ref=f4e57] [cursor=pointer]:
          - /url: /trips
        - button "남기기" [ref=f4e60] [cursor=pointer]
        - link "지도" [ref=f4e63] [cursor=pointer]:
          - /url: /map
        - link "새 소식 2개 피드" [ref=f4e66] [cursor=pointer]:
          - /url: /feed
          - generic "새 소식 2개" [ref=f4e70]
          - text: 피드
      - link "물어보기" [ref=f4e71] [cursor=pointer]:
        - /url: /ask
    - status
  - iframe [aria-hidden] [ref=f4e72]
```