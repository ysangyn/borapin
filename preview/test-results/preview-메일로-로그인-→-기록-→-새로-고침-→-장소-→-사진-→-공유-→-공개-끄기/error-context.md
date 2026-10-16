# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: preview.spec.ts >> 메일로 로그인 → 기록 → 새로 고침 → 장소 → 사진 → 공유 → 공개 끄기
- Location: tests/preview.spec.ts:50:1

# Error details

```
Test timeout of 240000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - button "뒤로" [ref=e6] [cursor=pointer]
        - heading "기록 남기기" [level=1] [ref=e9]
      - generic [ref=e10]:
        - generic [ref=e11]: 어디, 대략 언제만 있으면 저장돼요.
        - generic [ref=e12]:
          - radiogroup "종류" [ref=e13]:
            - radio "여행" [checked] [ref=e14] [cursor=pointer]
            - radio "나들이" [ref=e15] [cursor=pointer]
          - radiogroup "상태" [ref=e16]:
            - radio "다녀왔어요" [checked] [ref=e17] [cursor=pointer]
            - radio "갈 예정" [ref=e18] [cursor=pointer]
        - generic [ref=e19]:
          - generic [ref=e20]: 어디*
          - generic [ref=e21]:
            - button "강원 강릉시 빼기" [ref=e23] [cursor=pointer]: 강원 강릉시
            - textbox "어디 검색" [ref=e32]:
              - /placeholder: 강릉, ㄱㄹ, 일본, 교토…
        - generic [ref=e33]:
          - generic [ref=e34]: 대략 언제*
          - generic [ref=e35]:
            - button "날짜" [pressed] [ref=e36] [cursor=pointer]
            - button "몇 월쯤" [ref=e37] [cursor=pointer]
            - button "계절만" [ref=e38] [cursor=pointer]
            - button "몇 년쯤" [ref=e39] [cursor=pointer]
            - button "몰라요" [ref=e40] [cursor=pointer]
          - generic [ref=e41]:
            - textbox "시작 날짜" [ref=e42]
            - generic [ref=e43]: –
            - textbox "끝 날짜 (선택)" [ref=e44]
        - generic [ref=e45]:
          - generic [ref=e46]: 누구와
          - generic [ref=e47]:
            - button "보라" [pressed] [ref=e48] [cursor=pointer]
            - button "영상" [pressed] [ref=e51] [cursor=pointer]
          - generic [ref=e54]:
            - textbox "함께 간 사람 이름" [ref=e55]:
              - /placeholder: 함께 간 사람 이름 (엄마, 동생…)
            - button "추가" [ref=e56] [cursor=pointer]
        - generic [ref=e57]:
          - generic [ref=e58]: 제목
          - textbox "제목" [active] [ref=e59]:
            - /placeholder: 강릉시 여행
            - text: 미리보기 시험 여행 3cb2465
        - generic [ref=e60]:
          - generic [ref=e61]: 메모
          - textbox "메모" [ref=e62]:
            - /placeholder: 안 써도 돼요
        - button "저장하기" [disabled] [ref=e63]
        - generic [ref=e64]: 대략 언제인지 골라 주세요 · 모르면 '몰라요'를 눌러요
    - status
  - generic: 시험용 미리보기 · 실제 기록이 아니에요
  - iframe [aria-hidden] [ref=e65]
```