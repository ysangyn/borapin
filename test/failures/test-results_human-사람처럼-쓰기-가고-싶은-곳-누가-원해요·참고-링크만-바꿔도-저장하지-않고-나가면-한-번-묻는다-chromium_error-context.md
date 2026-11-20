# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다
- Location: tests/human.spec.ts:338:3

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - generic [ref=f2e5]:
        - button "뒤로" [ref=f2e6] [cursor=pointer]
        - heading "가고 싶은 곳" [level=1] [ref=f2e9]
      - generic [ref=f2e10]:
        - generic [ref=f2e11]:
          - generic [ref=f2e12]: 어디*
          - generic [ref=f2e13]:
            - button "경남 남해군 빼기" [ref=f2e15] [cursor=pointer]: 경남 남해군
            - textbox "어디 검색" [ref=f2e24]:
              - /placeholder: 강릉, ㄱㄹ, 일본, 교토…
          - link "남해군 한 장 보기 · 맛집·명소·여행 모두" [ref=f2e25] [cursor=pointer]:
            - /url: /region/kr:48840
          - generic [ref=f2e26]: 딱 한 곳이면 그 이름 (선택)
          - textbox "특정 장소 이름" [ref=f2e27]:
            - /placeholder: "예: 성산일출봉, 단골 카페"
        - generic [ref=f2e28]:
          - generic [ref=f2e29]: 들를 곳 (한 줄에 하나 · 네이버·카카오 지도 '공유' 글을 붙여 넣어도 돼요)
          - generic [ref=f2e30]:
            - generic [ref=f2e31]: 맛집·카페
            - textbox "맛집·카페" [ref=f2e32]:
              - /placeholder: "고기국수\n단골 카페"
          - generic [ref=f2e33]:
            - generic [ref=f2e34]: 관광지·볼거리
            - textbox "관광지·볼거리" [ref=f2e35]:
              - /placeholder: "성산일출봉\n우도"
          - generic [ref=f2e36]:
            - generic [ref=f2e37]: 해볼 것
            - textbox "해볼 것" [ref=f2e38]:
              - /placeholder: 일출 보기
          - generic [ref=f2e39]: 여기 적은 곳은 여행을 계획할 때 '담기' 후보로 먼저 나와요.
        - generic [ref=f2e40]:
          - generic [ref=f2e41]: 누가 원해요
          - button "영상" [pressed] [ref=f2e43] [cursor=pointer]
        - generic [ref=f2e46]:
          - generic [ref=f2e47]: 우선순위
          - generic [ref=f2e48]:
            - button "없음" [ref=f2e49] [cursor=pointer]
            - button "1순위" [ref=f2e50] [cursor=pointer]
            - button "2순위" [ref=f2e53] [cursor=pointer]
            - button "3순위" [ref=f2e56] [cursor=pointer]
        - generic [ref=f2e59]:
          - generic [ref=f2e60]: 볼거리 지족해협 죽방렴 · 독일마을 · 다랭이마을 · 보리암
          - generic [ref=f2e61]: 먹거리 죽방멸치 쌈밥/회무침 · 남해 유자빵 · 독일 소시지/맥주
          - generic [ref=f2e62]: 가기 좋은 때 4~6, 10·11월 · 덥지도 춥지도 않아요
          - generic [ref=f2e63]: 가는 길 KTX 여수엑스포역 14km · 여수공항 25km
        - generic [ref=f2e64]:
          - generic [ref=f2e65]: 가기 좋은 때
          - generic [ref=f2e66]:
            - text: 4~6, 10·11월
            - generic [ref=f2e67]: · 덥지도 춥지도 않아요
          - button "직접 고르기" [ref=f2e68] [cursor=pointer]
        - generic [ref=f2e69]:
          - generic [ref=f2e70]: 참고한 글 (선택 · 한 줄에 주소 하나)
          - generic [ref=f2e71]: 이 곳을 알게 된 인스타·블로그·유튜브 주소를 넣어 두면, 계획 짤 때 여기서 바로 다시 열어 봐요.
          - textbox "참고한 글" [ref=f2e72]:
            - /placeholder: https://
        - generic [ref=f2e73]:
          - generic [ref=f2e74]: 메모
          - textbox "메모" [ref=f2e75]:
            - /placeholder: 안 써도 돼요
        - button "고친 내용 저장" [ref=f2e76] [cursor=pointer]
        - link "이곳으로 여행 만들기" [ref=f2e77] [cursor=pointer]:
          - /url: /plan?wish=pt4CaNjzOUX8fSY6OnO2
        - button "가고 싶은 곳에서 빼기" [ref=f2e78] [cursor=pointer]
    - status
  - iframe [aria-hidden] [ref=f2e81]
```