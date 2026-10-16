# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다
- Location: tests/human.spec.ts:191:3

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f2e1]:
  - generic [ref=f2e3]:
    - generic [ref=f2e5]:
      - button "뒤로" [ref=f2e6] [cursor=pointer]
      - heading "기록 남기기" [level=1] [ref=f2e9]
    - generic [ref=f2e10]:
      - generic [ref=f2e11]: 어디, 대략 언제만 있으면 저장돼요.
      - generic [ref=f2e12]:
        - radiogroup "종류" [ref=f2e13]:
          - radio "여행" [checked] [ref=f2e14] [cursor=pointer]
          - radio "나들이" [ref=f2e15] [cursor=pointer]
        - radiogroup "상태" [ref=f2e16]:
          - radio "다녀왔어요" [checked] [ref=f2e17] [cursor=pointer]
          - radio "갈 예정" [ref=f2e18] [cursor=pointer]
      - generic [ref=f2e19]:
        - generic [ref=f2e20]: 어디*
        - generic [ref=f2e21]:
          - button "충북 단양군 빼기" [ref=f2e23] [cursor=pointer]: 충북 단양군
          - textbox "어디 검색" [ref=f2e32]:
            - /placeholder: 강릉, ㄱㄹ, 일본, 교토…
      - generic [ref=f2e33]:
        - generic [ref=f2e34]: 대략 언제*
        - generic [ref=f2e35]:
          - button "날짜" [pressed] [ref=f2e36] [cursor=pointer]
          - button "몇 월쯤" [ref=f2e37] [cursor=pointer]
          - button "계절만" [ref=f2e38] [cursor=pointer]
          - button "몇 년쯤" [ref=f2e39] [cursor=pointer]
          - button "몰라요" [ref=f2e40] [cursor=pointer]
        - generic [ref=f2e41]:
          - textbox "시작 날짜" [ref=f2e42]
          - generic [ref=f2e43]: –
          - textbox "끝 날짜 (선택)" [ref=f2e44]
      - generic [ref=f2e45]:
        - generic [ref=f2e46]: 누구와
        - generic [ref=f2e47]:
          - button "보라" [pressed] [ref=f2e48] [cursor=pointer]
          - button "영상" [pressed] [ref=f2e51] [cursor=pointer]
        - generic [ref=f2e54]:
          - textbox "함께 간 사람 이름" [ref=f2e55]:
            - /placeholder: 함께 간 사람 이름 (엄마, 동생…)
          - button "추가" [ref=f2e56] [cursor=pointer]
      - generic [ref=f2e57]:
        - generic [ref=f2e58]: 제목
        - textbox "제목" [active] [ref=f2e59]:
          - /placeholder: 단양군 여행
          - text: 단양 끌어다 놓기 여행
      - generic [ref=f2e60]:
        - generic [ref=f2e61]: 메모
        - textbox "메모" [ref=f2e62]:
          - /placeholder: 안 써도 돼요
      - button "저장하기" [disabled] [ref=f2e63]
  - iframe [aria-hidden] [ref=f2e64]
```