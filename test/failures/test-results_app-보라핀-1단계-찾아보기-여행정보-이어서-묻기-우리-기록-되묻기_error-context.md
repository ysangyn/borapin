# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 찾아보기: 여행정보, 이어서 묻기, 우리 기록, 되묻기
- Location: tests/app.spec.ts:386:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('answer').last()
Expected substring: "초당 순두부"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('answer').last() with timeout 15000ms
  - waiting for getByTestId('answer').last()

```

```
Error: pageerror: l is not a function
TypeError: l is not a function
    at Vl (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:95501)
    at od (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121489)
    at ad (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121399)
    at od (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121701)
    at ad (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121399)
pageerror: l is not a function
TypeError: l is not a function
    at Vl (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:95501)
    at cd (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:122099)
    at ad (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121337)
    at od (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121519)
    at yf (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:133009)

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 16

- Array []
+ Array [
+   "pageerror: l is not a function
+ TypeError: l is not a function
+     at Vl (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:95501)
+     at od (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121489)
+     at ad (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121399)
+     at od (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121701)
+     at ad (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121399)",
+   "pageerror: l is not a function
+ TypeError: l is not a function
+     at Vl (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:95501)
+     at cd (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:122099)
+     at ad (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121337)
+     at od (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:121519)
+     at yf (http://127.0.0.1:5174/assets/index-BeDyxLT8.js:9:133009)",
+ ]
```

# Page snapshot

```yaml
- iframe [aria-hidden] [ref=e3]
```