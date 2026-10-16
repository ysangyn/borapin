# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> 보라핀 1단계 >> 주인 계정으로 들어오면 빈 홈
- Location: tests/app.spec.ts:71:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('headline')
Expected: "첫 핀을 꽂아 볼까요?"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByTestId('headline') with timeout 15000ms
  - waiting for getByTestId('headline')

```

```
Error: pageerror: Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
Error: Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
    at cs (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:9:50445)
    at Bs (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:9:56921)
    at Object.Hs [as useEffect] (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:9:57143)
    at e.useEffect (http://127.0.0.1:5174/assets/jsx-runtime-Cg2cgKPB.js:1:7090)
    at Fa (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:14:42317)

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 9

- Array []
+ Array [
+   "pageerror: Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
+ Error: Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
+     at cs (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:9:50445)
+     at Bs (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:9:56921)
+     at Object.Hs [as useEffect] (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:9:57143)
+     at e.useEffect (http://127.0.0.1:5174/assets/jsx-runtime-Cg2cgKPB.js:1:7090)
+     at Fa (http://127.0.0.1:5174/assets/index-B9aw8lqk.js:14:42317)",
+ ]
```

# Page snapshot

```yaml
- iframe [aria-hidden] [ref=e3]
```