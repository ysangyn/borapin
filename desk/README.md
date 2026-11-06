# 보라핀 사진함 (PC) · 0단계 훑기

읽기만 하는 프로그램이에요. 사진 파일은 하나도 바꾸지 않고, 보고서 한 장과 인벤토리 CSV만 만들어요.

## 한 번만 준비 (Windows)

1. Node.js LTS 설치: https://nodejs.org (설치 뒤 PowerShell에서 `node -v`가 보이면 됨)
2. 보라핀 코드 받기: PowerShell에서
   ```
   git clone https://github.com/ysangyn/borapin.git
   cd borapin
   npm install
   ```
   (git이 없으면 GitHub에서 'Code → Download ZIP'을 풀어도 돼요)

## 훑기

```
npx tsx desk/bin/scan.ts --root "D:\사진" --root "E:\백업" --trips "C:\Users\나\Downloads\보라핀-여행목록.json" --out "D:\사진함-보고서"
```

- `--root` 는 여러 번 쓸 수 있어요 (PC 폴더, 외장 디스크, OneDrive·iCloud 사진 폴더, 폰을 USB로 연결했을 때의 DCIM…).
- `--trips` 는 보라핀 앱 → 우리 공간 → **여행 목록 내보내기**로 받은 JSON. 없으면 여행 없이 훑어요.
- 끝나면 `보고서.html`을 더블클릭해 열고, `인벤토리.csv`는 엑셀로.

보고서 맨 위에 네 숫자가 나와요: **사진 n장 · 여행 n번 · 중복 n장 · 모르는 사진 n장**.

## 무엇을 읽나

- 촬영 시각: 촬영 정보(EXIF) → 파일 이름(`20240503_101522`, `IMG_2024…`, `PXL_…`, `Screenshot_…`, `KakaoTalk_…`) → 폴더 이름(`2024-05-03 제주`, `190812 강릉`, `2024/05`) → 수정 시각(추정) 순. 어디서 읽었는지 CSV '근거' 칸에 남아요.
- 자리: 촬영 정보의 GPS만. 없으면 여행 날짜로 '어디'를 짐작해요(다음 단계에서 두 폰 GPS 기둥으로 사이를 채워요).
- 중복: **완전히 같은 파일**(SHA-256)만. 닮은 사진·연사는 다음 단계에서 제안만.
- 보관처: 같은 사진이 두 보관처(루트) 이상에 있으면 '안전', 한 곳뿐이면 '위험'.
- 건너뛰는 폴더: 숨김 폴더, `.thumbnails`, `@eaDir`, `$RECYCLE.BIN`, `node_modules`.

## 시험

```
npm run test:unit
```
`tests/desk/`에 순수 함수 시험과 작은 진짜 사진(촬영 정보 있음·없음·카메라)으로 끝까지 도는 시험이 있어요.
