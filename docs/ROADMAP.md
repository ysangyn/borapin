# 보라핀 작업 목록 (이어서 하기용)

> 새 대화에서 이어 할 때: 이 파일과 CLAUDE.md를 먼저 읽고, '진행 중' 항목의 '다음 할 일'부터 시작한다.
> 멈출 때: 진행 중 항목의 '다음 할 일'과 '건드린 파일'을 갱신하고 커밋한다. 만들다 만 화면은 `FLAGS`(src/lib/flags.ts)로 숨겨 배포해도 안전하게 둔다.

## 지키는 것 (사용자 결정)
- 비용 0, 외부가 끊겨도 앱은 지난 자료로 동작, 앱이 쓰는 동안 바깥 API를 부르지 않는다(자료는 CI가 미리 받아 넣는다).
- 특정 낱말만 고치지 않는다: 고칠 때마다 채점 문제(tests/ask/cases.ts 또는 대량 문제)로 같은 종류 전체를 지킨다.
- 바뀌는 규정(보조배터리·액체·입국)은 숫자를 단정하지 않고 공식 링크로.
- 넣지 않기로 함: 항공권 특가, 영어 같이 하기, 제미나이 연결. 보류: 우리 동네 지도(동 단위).
- 공공데이터 키: GitHub Secrets `DATA_GO_KR_KEY` (시외·고속·열차 신청 완료). TourAPI·외교부는 같은 키로 신청 필요.

## 순서와 상태
| # | 항목 | 상태 | 다음 할 일 |
|---|---|---|---|
| 1 | 물어보기: 버린 핵심어 감지 → AI/모름 | 완료 (unusedWords · confidence.ts · tests/unit/askUnused.test.ts) | |
| 2 | 물어보기: 대량 채점 문제(주제×표현) | 완료 (tests/unit/askBulk.test.ts: 주제 20개×낱말×말투 8 + 모르는 활동 20×8) | 주제를 늘릴 때 topics.json만 고치면 시험이 같이 늘어남 |
| 3 | 물어보기: 여행 주제 사전 확장(자료로) | 완료 (src/data/topics.json 20주제·100곳, 지명 사전의 볼거리 이름도 자동 주제) | |
| 4 | 여행 상식 + 바뀌는 규정 감시 | 완료 (src/data/faq.json 42개·예시 질문으로 시험, 매주 .github/workflows/faq-watch.yml → ci-report/faq-watch) | 분기마다 faq.json updated 갱신 |
| 5 | 외교부 입국요건·여행경보 + 환율 | 완료 (scripts/abroad-build.ts → src/data/abroad.json, CI 매일 03:17 / lib/abroad.ts, 도시 카드·홈 가는 길·물어보기) | 여행경보 조정(changes)·안전공지(notices, CountrySafetyService7, 나라별 최근 60일 3개) 받기 완료. 화면: 가고 싶은·계획한 나라의 공지·경보 변화를 홈/도시 카드에 |
| 6 | 우리 집 설정 + 길찾기 버튼 | 완료 (HomeSetting·HomeRoute·home.ts, 공간 문서 home 칸·규칙, 뒷단 /geo) | |
| 7 | 차 경유 추천 | 완료 (src/lib/stopover.ts·Stopovers.tsx, 홈 '가는 길'에) | 여행 계획하기 뼈대에 끼우기는 9번과 함께 |
| 8 | TourAPI 관광정보·사진·연관 | 1차 완료 (scripts/tour-build.ts → src/data/tour.json 시·군 159/160, CI 빌드 때 갱신 / TourSpots.tsx 지역 창에 관광지 사진·무장애 수) · 2차 자료 단계 완료(10-23, 아직 CI에서 안 돌려 봄): scripts/tour-trend.ts → src/data/trend.json {at, window, regions[코드]{out 외지인 하루 평균·outPrev·growth·rank·related[{n,m}]·crowd[{n,r}]}, hot 15, quiet 20} (DataLabService 기초지자체 방문자 최근 28일 vs 364일 전, TarRlteTarService1 연관 관광지, TatsCnctrRateService 집중률 7일 평균 · 실패하거나 100곳 미만이면 지난 자료 · 오늘 자료 있으면 건너뜀(FORCE=1) · 시험 tests/unit/trend.test.ts) | 1) 첫 CI 실행 뒤 ci-report/check/trend-output.txt(SAMPLE 원본 2줄)로 확인: locgoRegnVisitrDDList가 areaCd 없이 전체를 주는지, 행정구(수원 41111 등)·세종 코드가 맞춰졌는지('짝 못 찾은' 줄), 연관 baseYm 달, 집중률 응답에 baseYmd가 있는지 2) 화면(다른 작업자): 요즘 뜨는 곳·한적한 곳·연관·붐빔 3) 무장애로 '많이 안 걷는' 답, 물어보기 연결 |
| 9 | 버스·KTX 여행답게 가는 길 | 자료 모으는 중 (백그라운드, 매일 새벽 .github/workflows/bus.yml → bus-data 브랜치 state.json) | 다 모이면(진행 100%) 노선표를 src/data/routes.json으로 줄이고 길 찾기 화면 (FLAGS.transitRoute) |
| 10 | AI 모델 비교 점검 | 완료: 기본 Llama 3.3 70B 유지 (2차: 사실 고친 뒤 기본 11/12·정확·짧음, Mistral 12/12·매끄럽지만 '밀양=바닷가'처럼 조금 지어냄·말투 섞임, gpt-oss 11/12·느림). 다시 비교하려면 커밋 메시지에 [모델비교] | 걷기 편한 국내 여행지 자료가 없어 '많이 안 걷는' 조건은 못 맞춤 → 8번 TourAPI 무장애 자료로 |
| 12 | 물어보기 되묻기 | 완료 (AskCtx.pending·lastQ: '우리 집 근처'인데 집을 모르면 '어디 사세요?' → 시·군 답하면 우리 집으로 저장하고 처음 질문 다시 풀기, 직전 추천에 조건만 덧붙이기) | 같은 틀로 다른 되묻기(언제·누구와)도 늘릴 수 있음 |
| 13 | 지금 여기 남기기 (+ SPEC 묶음 B '여기 뭐야' 한 줄) — 10-28 완료 (사진+현재 위치 → 근처 관광지·음식점 후보 → 장소 기록) | 대기 (사용자 승인: GPS 방식) | 8번 2차 다음. 새 메뉴 없이 여행 중 단계 카드 단추 하나로. 뒷단 /nearby(관광공사 locationBasedList2, 반경 500m, 캐시) · 카메라 입력+navigator.geolocation · 사진 위치(EXIF) 있으면 그것 · AI 이미지 인식은 후보 순서 보조만 · 후보 없으면 '이 근처(○○면)'로 저장 |
| 11 | 전반 기획 재검토·보완 | 검토 완료 · 덜어내기 R1~R6·묶기 M1~M6·M8·A2·A9 배포 완료(10-23) (docs/REVIEW-2026-10.md: 평가·덜어낼 것 R·묶을 것 M·고칠 것 F·보탤 것 A·디자인). 사용자 결정: 디자인 D, 여행 상세 탭 4개(R7), 챗봇은 '물어보기'+친구 '핀이'(M7). 치명·높음 버그 F1~F9 고침(10-22 밤, 커밋 bb07a78·b116be0) | 토요일부터: 덜어내기 R1~R6 → 묶기 M1~M6·M8 → 보태기 A1~A4·A9 → P1 F10~F17. 각 항목은 REVIEW 문서 번호로 부름 |
| 14 | 디자인 D 적용 (B 뼈대 + C 두 색 + A 순간) | 1~4차 배포 완료(10-23): 토큰·공통 부품·글꼴(주아·개구 @fontsource, 글꼴 조각 인라인 금지 vite assetsInlineLimit), 홈 머리·숫자 칩, 핀이(물어보기), 폴라로이드 대표 사진, 지도 시트 머리·도장, 우리의 한 줄들, 캐리어 스티커, 환영 3장면(/welcome, 규칙 renamingSelf) | 1) 토큰·공통 부품(카드 2px 윤곽+색종이 그림자, 칩, 알약 단추, 떠 있는 아래 메뉴, 아바타 두 색 t0=핑크 #F07A95·t1=파랑 #4D7FE0·둘=보라) 2) 글꼴: @fontsource/jua·@fontsource/gaegu(5.3.0, 구글식 글자 조각 87개, OFL) 앱 안에, 제목·D-day·한 줄 평·지역 이름에만 3) 화면별: 홈 → 여행 상세(탭 4) → 지도 시트(핀 꽂기/가고 싶어요/연필) → 기록 남기기 → 가고 싶은 곳 → 추억(우리의 한 줄들·캐리어 스티커) → 로그인·환영 3장면 4) '핀이' 아이콘 SVG(웃는 보라색 핀), 보라 얼굴은 사람 몫으로 5) 밤 모드는 토큰 정리 뒤 |
| 15 | 한 권(가이드북↔여행책) | 설계 완료(docs/SPEC-2026-11.md 묶음 A, 10-26. 사용자 결정: 계획이 곧 책, 도시 자료 미리 쓰지 않음). 순서 0 '가고 싶어요' 배포 완료(10-26) | 순서 0: 지도 고르기 창·관광지 카드에 가고 싶어요(아내 의견) → 4~5 한 권 → 8 담은 장소 채우기 |
| 16 | 심는 지도·꽃 도감·타임캡슐 | 설계 완료(SPEC 묶음 C). 10-26 배포: 다음 한 칸·추억 한 줄 평·도 첫 칸 축하·스티커 하나 남았어요(C4 일부·C5·C7) | 순서 2(심는 지도 뼈대)·6(꽃 도감: 그림체 '가' 결정, 세계는 나라꽃)·7(타임캡슐) |
| - | 옛 사진으로 지난 여행 복원 | 미룸(사용자: 더 고민) | |
| - | 우리 동네 지도(동 단위) | 보류 | |

## 진행 중: 여행 계획하기 이어가기 (핵심 기능, 사용자 10-29)
- 시안: https://claude.ai/artifact/2ECB6Vcaxs6jtoDsbqhLVm (5걸음 + 여행 상세 '이어서 계획하기') · 가이드북 시안 2: https://claude.ai/artifact/AKfyysCPGSaFjGAsY1C8X7
- 끝남(e57cff0): src/lib/route.ts(동선 정리)·src/lib/planPick.ts(담기 후보)·Trip.stay/hopes/planDone·PlanItem.by/lat/lng/kind/img·규칙
- 끝남(17ab947, 숨김): src/pages/PlanFlow.tsx 1차 — 다섯 걸음이 돌아감(저장·건너뛰기)
- 다음 할 일: ① 시안대로 다듬기(달력에 좋은 날·축제 점, 날씨·옷차림 칸, 숙소 동네 추천·링크 붙여넣기, 담기 아래 막대·자세히 창, 동선 지도·끌어 바꾸기·'이날은 많아요', 기대 둘 다·체크리스트) ② 담기 시 addPlan에 by·kind·lat·img 바로 넣기(지금은 뒤에 채움) ③ Planner '여기로 정해요'·make → 뼈대 대신 /trips/:id/plan-next ④ TripDetail·홈 단계 카드 '이어서 계획하기 n/5' ⑤ 화면 시험(tests/planflow.spec.ts) ⑥ FLAGS.planFlow 켜기 → 가이드북(한 권)
- 사용자 기준: 이 기능만으로 따로 앱이 될 만큼 정교하고 쓰기 쉽게

## 남은 일 (2026-10-26 정리 — 설계서 docs/SPEC-2026-11.md)
- 작은 일: 카카오 SDK SRI(사용자가 해시 복사) · 아이폰(WebKit) 지도 시험 실패 원인(배포는 안 막음) · 옷차림 기후 못 받은 4곳(카파도키아·코츠월드·퀘벡·마라케시: 지오코딩 이름 고치기)
- 10-28 꽃 도감: 국내 158/160 시·군 꽃(위키백과 정보 상자, scripts/flowers-collect.ts → flowers-normalize.ts), 꽃 그림 39종×3벌(scripts/flowers-build.ts), 지도 무늬가 고장 꽃 색, 지역 창 '○○의 꽃', 피어나기 그 꽃, 추억에 '모은 꽃'
- 10-28 배포: 안전 소식 한 줄(홈·도시 카드) · 타임캡슐(C6) · 달별 옷차림(scripts/wear.ts, data-build) · 투어·티켓 단추를 해외 가고 싶은 곳에도 · 지금 여기 남기기(13번+B, Worker /nearby·비밀값 DATA_GO_KR_KEY) · 심는 지도 뼈대(C1·C3·C4: 풀밭·새싹·들꽃 무늬, 피어나기, 시트 한 줄)
- 큰 일(주말): 한 권 국내판(A1·A2·A4~A8) → 꽃 도감 남은 것(나라꽃 표 읽기 고치기, 시흥·철원 꽃 확인, 사진·글도 마음으로 세기) → 해외 함께 찾기 /find(A3) · 동선 정리(A12) · 담은 장소 채우기(A9) → 9번 버스·KTX → 밤 모드
- 미룸: 옛 사진으로 지난 여행 복원 · 연간 한 권 · 우리 동네 지도
- 10-26 배포: '가고 싶어요'(지도 고르기 창·관광지 하트), 예정 여행이 있으면 '일정에 담기', 다음 한 칸, 추억 한 줄 평, 도 첫 칸 축하, 스티커 하나 남았어요, 투어·티켓 찾기(준비 탭 도시 카드 단추 하나 + 우리 공간 설정), 하트 톡 튀기
- 디자인 잔일(계절별 묶음·범례·등장 움직임·도장·woff 제외)과 F10~F17은 10-23·24에 배포 완료(커밋 bcd7cb2·db289d2). 남은 디자인: 밤 모드뿐

## 고침 기록 (2026-10-22 밤)
- F1 약관 링크 흰 화면(App.tsx 훅 순서) · F8 최상위 ErrorBoundary, 지도 WebGL 실패 격리, 추억 카드 빈 places · F7 물어보기 자료 실패 시 입력칸 열림+다시 받기 · F9 입력칸 16px
- F2 동시 편집: 편집 화면이 '연 때 스냅샷'을 before로(src/lib/tripActions.ts editsOf, data.ts patchEdits), 한 줄 평은 reviews.이름 점 경로·남의 칸 삭제 금지 · F3 여행 삭제: 규칙 notes delete에 `!existsAfter(trip)`, 여행 문서를 첫 묶음 맨 앞에 · 되돌리기 createdAt 보존
- F4 Worker: email_verified + config/access 읽기로 멤버 판정(uid 캐시 1h/거부 5m), /news 분당 20회, RSS https만(worker/src/guard.ts) · F6 자료 폴백: 로컬 → https://borapin.web.app/data/{abroad,tour,festivals}.json(scripts/data-health.ts), 스크립트가 src/data와 public/data 둘 다 씀(public 사본은 .gitignore) · F5 새 버전 교체는 작업 중이면 미루고 경로 변경·복귀 때(src/lib/updateGate.ts, useBusy를 글·질문 답·사진 올리기에도)
- F10~F17은 10-23·24 배포 완료(db289d2). 남은 것: 카카오 SDK SRI, CSP를 보고 전용에서 막기로, WebKit 지도 worker

## 항목별 결정 메모
### 8. 관광공사
- 관광빅데이터: 시·군 하루 방문자(현지인·외지인·외국인). '요즘 뜨는 곳'은 최근 4주 외지인을 작년 같은 4주와 비교. '한적한 곳'은 외지인 적은 곳. 장소 단위 혼잡은 집중률(TatsCnctrRateService).
- 시·군 코드: 관광공사 법정동 코드표(ldongCode2)로 이름 맞춤. 2026-10-19 저녁 공공데이터포털이 연결 실패(fetch failed)해 확인 못 함 → 다시 돌리기.

### 9. 버스·KTX
- API: `https://apis.data.go.kr/1613000/{SuburbsBusInfo|ExpBusInfo|TrainInfo}/Get…` (대문자 Get). 열차 역 목록은 도시별(cityCode)로만 됨. 역 이름 '판교(경기)'처럼 괄호.
- 범위: 시외 1,945곳(160개 중 145), 고속 453(117), 열차 349(91), KTX 역 70. 고양종합 시외는 자료상 노선 0 → 고양 출발은 고양백석·고양화정(고속), 행신(KTX).
- 설계: 대표 정류지 약 300곳(시·군 대표 터미널·역 + 여행지 입구 + 집 근처), 30km 넘는 짝만, 노선 있는 짝만 매달 갱신(동시 요청), 분기마다 새 노선 찾기. 평일+토요일 시간표.
- 화면: 들러 가기 → [자차 | 대중교통], 대중교통은 [통합(기본) | 버스만 | 기차만], 기차는 KTX 우선(마지막 구간은 버스·택시 허용). 바로 가기 / 들러 가기(2~5시간) / 참고: 가장 빠른 길. 막차·기준 달·예매 링크. 마지막 시내 구간은 카카오맵.
- 갈아타기: 걸어서 700m 안, 택시 직선 4km 안만. 일상 지역(집·직장)은 경유지 제외. 6시간 넘으면 1박 안.
