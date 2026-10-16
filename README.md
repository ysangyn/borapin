# 보라핀 (BoraPin)

가본 곳마다, 우리 핀 하나. 둘이 다녀온 곳과 가고 싶은 곳을 지도에 핀으로 채워가는 여행 기록 서비스입니다.

- 주소: https://borapin.web.app
- 화면: React + TypeScript (Vite)
- 저장·로그인: Firebase (Spark 무료 요금제 · Firestore 서울 · 구글 로그인)
- 지도: MapLibre GL (외부 지도 타일 없이 자체 경계 데이터만 사용)
- 배포: `main`에 올리면 GitHub Actions가 자동 점검 → 통과하면 Firebase Hosting에 배포

## 개발

```bash
npm install
npm run dev          # 실제 Firebase에 연결
npm run test:e2e     # 가짜 Firebase(에뮬레이터)에서 화면 자동 점검 (Java 21 필요)
```

배포 열쇠(서비스 계정 JSON)는 저장소에 넣지 않고 GitHub Secrets의 `FIREBASE_SERVICE_ACCOUNT`에만 둡니다.

## 데이터 출처

- 국내 시·군·구 경계: [vuski/admdongkor](https://github.com/vuski/admdongkor) ver20260701 (CC BY 4.0) — 원자료 통계청 SGIS (공공누리 제1유형). 2026-07-01 전남광주통합특별시 출범, 인천 행정구역 개편 반영. v22 여행지도와 같은 160칸 기준으로 묶음.
- 세계 나라 경계·바다 이름: [Natural Earth](https://www.naturalearthdata.com/) 1:50m (Public Domain)
- 글꼴: [Pretendard](https://github.com/orioncactus/pretendard) (SIL Open Font License 1.1)
