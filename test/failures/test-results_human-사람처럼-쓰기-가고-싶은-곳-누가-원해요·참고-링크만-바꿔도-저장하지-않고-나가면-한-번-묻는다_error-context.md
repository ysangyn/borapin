# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다
- Location: tests/human.spec.ts:266:3

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
          - generic [ref=f2e25]: 특정 장소 (선택)
          - textbox "가게·명소 이름" [ref=f2e26]:
            - /placeholder: "예: 성산일출봉, 단골 카페"
        - generic [ref=f2e27]:
          - generic [ref=f2e28]: 누가 원해요
          - button "영상" [pressed] [ref=f2e30] [cursor=pointer]
        - generic [ref=f2e33]:
          - generic [ref=f2e34]: 우선순위
          - generic [ref=f2e35]:
            - button "없음" [ref=f2e36] [cursor=pointer]
            - button "1순위" [ref=f2e37] [cursor=pointer]
            - button "2순위" [ref=f2e40] [cursor=pointer]
            - button "3순위" [ref=f2e43] [cursor=pointer]
        - generic [ref=f2e46]:
          - generic [ref=f2e47]: 가볼 곳 (한 줄에 하나)
          - textbox "가볼 곳" [ref=f2e48]:
            - /placeholder: "성산일출봉\n우도"
        - generic [ref=f2e49]:
          - generic [ref=f2e50]: 해볼 것
          - textbox "해볼 것" [ref=f2e51]:
            - /placeholder: 일출 보기
        - generic [ref=f2e52]:
          - generic [ref=f2e53]: 먹을 것
          - textbox "먹을 것" [ref=f2e54]:
            - /placeholder: 고기국수
        - generic [ref=f2e55]:
          - generic [ref=f2e56]: 가기 좋은 때
          - generic [ref=f2e57]:
            - text: 4~6, 10·11월
            - generic [ref=f2e58]: · 덥지도 춥지도 않아요
          - button "직접 고르기" [ref=f2e59] [cursor=pointer]
        - generic [ref=f2e60]:
          - generic [ref=f2e61]: 참고 링크 (인스타·블로그·지도, 한 줄에 하나)
          - textbox "참고 링크" [ref=f2e62]:
            - /placeholder: https://
        - generic [ref=f2e63]:
          - generic [ref=f2e64]: 메모
          - textbox "메모" [ref=f2e65]:
            - /placeholder: 안 써도 돼요
        - button "고친 내용 저장" [ref=f2e66] [cursor=pointer]
        - link "이곳으로 여행 만들기" [ref=f2e67] [cursor=pointer]:
          - /url: /record?status=planned&place=kr:48840&wish=F2zERATo3kopBlqUMXJW
        - button "가고 싶은 곳에서 빼기" [ref=f2e68] [cursor=pointer]
    - status
  - iframe [aria-hidden] [ref=f2e71]
```