# 보라핀 작업 규칙

보라·영상 커플의 여행 기록 PWA. React + Vite + Firebase(Auth·Firestore, 무료 Spark 요금제). 서버 코드 없음: 데이터 보호는 `firestore.rules`가 전부다.

## 버그는 테스트부터
1. 버그를 재현하는 테스트를 먼저 만든다 (순수 함수 → `tests/unit`, 권한 → `tests/rules`, 화면 → `tests/*.spec.ts`).
2. 고치기 전에 그 테스트가 **실패하는 기록**을 남긴다 (로컬 출력 또는 CI 실행 링크).
3. 고친 뒤 **통과하는 기록**을 남기고, 둘 다 사용자에게 보여 준다.

## 시험 종류
| 무엇 | 어디서 | 명령 |
|---|---|---|
| 순수 기능 (날짜·계절·조사) | 내 컴퓨터에서도 | `npm run test:unit` |
| 보안 규칙 (허용·막힘) | Firestore 에뮬레이터 | `npm run test:rules` |
| 화면 (사람처럼: 구글 창 로그인, 한글 IME Enter, 끌어다 놓기, 375px, 새로 고침) | Auth+Firestore 에뮬레이터 | `npm run test:e2e` |
| 미리보기 주소에서 진짜 Firebase | 시험용 프로젝트 `borapin-test` | CI의 3단계 (`tests/preview.spec.ts`) |
| 실제 주소 확인 (버전·빠진 파일·옛 버전 교체·구글 창) | borapin.web.app | CI의 4단계 |

- 에뮬레이터는 `demo-` 프로젝트라 실제 서버에 닿지 않는다. 이 작업 공간에서는 에뮬레이터 jar를 받을 수 없어서 에뮬레이터 시험은 CI에서만 돈다.
- 시험용 프로젝트의 기록·계정은 `scripts/preview-env.ts`가 만들고 매번 지운다. 실제 프로젝트(`borapin`) 데이터로는 절대 시험하지 않는다.

## 배포 관문 (.github/workflows/ci.yml)
코드 검사·빌드 → 에뮬레이터 시험 → 미리보기 채널 배포 + 파일·버전 확인 + 진짜 Firebase 시험 → (main만) 실제 배포 → 실제 주소 확인.
빌드는 한 번만 하고 같은 파일을 끝까지 쓴다. 하나라도 실패하면 실제 배포는 하지 않는다.
결과(캡처·출력)는 `ci-report` 브랜치에 올라간다: `git clone --depth 1 --branch ci-report https://github.com/ysangyn/borapin.git`.

## 물어보기(챗봇) 두 단계
- 1단계 규칙형(`src/lib/ask/engine.ts`): 공짜·즉시. `tests/ask/cases.ts`로 채점(95% 미만이면 배포 중단). 못 알아듣는 질문은 먼저 여기에 문제로 보태고 규칙을 늘린다.
- 2단계 보라(AI): 규칙형이 자신 없을 때만(`confidence.ts`). `worker/`의 Cloudflare Worker(무료)가 로그인 토큰을 확인하고 Workers AI를 부른다. 자료 조회는 폰 안에서(`tools.ts`), 모델엔 사실만 보낸다. 주소는 CI가 `VITE_ASK_URL`로 빌드에 넣는다(비밀값 `CLOUDFLARE_API_TOKEN`·`CLOUDFLARE_ACCOUNT_ID`가 없으면 규칙형만). 에뮬레이터 시험에서는 AI를 부르지 않는다.

## 지킬 것
- 서비스 계정 키는 GitHub Secrets(`FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_SERVICE_ACCOUNT_TEST`)에만 둔다. 채팅·저장소에 올리지 않는다.
- firebaseConfig 값은 공개값이라 코드에 둬도 된다.
- 실제 기록을 지우거나 옮기는 일은 사용자 확인 뒤에만 한다.
- 화면 글은 쉬운 우리말로. 버튼과 알림의 동사를 맞춘다 (예: '담기' → '담았어요'). 횟수는 `times()`, '로/으로'는 `withRo()`(src/lib/ko.ts).
- 꾸밈: 장소는 위키미디어 공용의 실제 사진(media/picks.json → CI가 줄임), 사람이 나오는 순간은 보라 그림(public/art). 출처는 /credits에 자동으로 나온다.

## 손으로 정리한 자료 (빌드에 고정, 바깥 서비스 없음)
- `src/data/world.json` 세계 도시 125곳 속성(좋은 달·물가·비행시간·꼬리표·걷기·동행·통화·말·콘센트·시차·입국 메모·먹을 것·볼 것). 원본은 작업 공간 `scratchpad/world/rows.py`가 아니라 이 JSON이 기준. 고칠 땐 `tests/unit/world.test.ts`가 지킴.
- `src/data/phrases.json` 현지어 여행 표현 10개 말 × 30문장(우리말·현지 글·한글 발음). `tests/unit/phrases.test.ts`.
- `src/data/questions.json` 오늘의 한 질문 60개(`{place}` 자리). `tests/unit/askOfDay.test.ts`.
- 입국 조건·물가는 바뀌니 화면엔 '기준 달'과 '떠나기 전 확인'을 같이 보여 준다. 가격 숫자는 넣지 않는다.
