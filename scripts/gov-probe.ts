/** 외교부·관광공사·수출입은행 API가 열렸는지 확인 (보고서만). 키는 출력에 남기지 않는다. */
const KEYS = { data: process.env.DATA_GO_KR_KEY ?? '', tour: process.env.TOUR_API_KEY ?? '', exim: process.env.KOREAEXIM_KEY ?? '' };
const hide = (s: string) => Object.values(KEYS).filter(Boolean).reduce((t, k) => t.split(k).join('***').split(encodeURIComponent(k)).join('***'), s);
async function hit(label: string, url: string) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    const ok = /"resultCode"\s*:\s*"0+"|<resultCode>0+<|NORMAL|"cur_unit"/i.test(t) && !/SERVICE_KEY_IS_NOT_REGISTERED|NO_OPENAPI|SERVICE ERROR|등록되지 않은/i.test(t);
    console.log(`${ok ? '✓' : '✗'} ${label}: ${r.status} ${hide(t.replace(/\s+/g, ' ').slice(0, 260))}`);
    return ok;
  } catch (e) { console.log(`✗ ${label}: ${(e as Error).message}`); return false; }
}
const D = (path: string, extra = '') => `https://apis.data.go.kr/${path}?serviceKey=${encodeURIComponent(KEYS.data)}&numOfRows=3&pageNo=1&_type=json&returnType=JSON${extra}`;
const T = (path: string, extra = '') => `https://apis.data.go.kr/B551011/${path}?serviceKey=${encodeURIComponent(KEYS.data)}&MobileOS=ETC&MobileApp=borapin&_type=json&numOfRows=3&pageNo=1${extra}`;

console.log('## 외교부 (1262000) — 맞는 주소 하나면 된다');
for (const [l, p] of [
  ['여행경보 a', '1262000/TravelAlarmService2/getTravelAlarmList2'], ['여행경보 b', '1262000/TravelAlarmService0404/getTravelAlarmList0404'], ['여행경보 c', '1262000/TravelWarningService/getTravelWarningList'],
  ['여행경보 조정 a', '1262000/TravelAlarmAdjustService/getTravelAlarmAdjustList'], ['여행경보 조정 b', '1262000/TravelWarningAdjustService/getTravelWarningAdjustList'], ['여행경보 조정 c', '1262000/TrvlWarningAdjustService/getTrvlWarningAdjustList'],
  ['입국허가요건 a', '1262000/EntranceVisaService2/getEntranceVisaList2'], ['입국허가요건 b', '1262000/EntranceVisaService/getEntranceVisaList'],
  ['안전공지', '1262000/CountrySafetyService7/getCountrySafetyList7'], ['여행경보 조정', '1262000/CountryHistoryService2/getCountryHistoryList2'],
  ['특별여행주의보 a', '1262000/SptravelWarningService2/getSptravelWarningList2'],
]) await hit(l, D(p));

console.log('\n## 한국관광공사 (B551011)');
await hit('국문 관광정보 (지역기반)', T('KorService2/areaBasedList2', '&areaCode=32&arrange=Q'));
await hit('국문 관광정보 (TOUR_API_KEY)', `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${encodeURIComponent(KEYS.tour)}&MobileOS=ETC&MobileApp=borapin&_type=json&numOfRows=1&areaCode=32`);
await hit('관광사진', T('PhotoGalleryService1/galleryList1'));
await hit('연관 관광지', T('TarRlteTarService1/areaBasedList1', '&baseYm=202509&areaCd=51&signguCd=51150'));
await hit('관광빅데이터 (광역 방문자)', T('DataLabService/metcoRegnVisitrDDList', '&startYmd=20260901&endYmd=20260902'));
await hit('무장애 여행', T('KorWithService2/areaBasedList2', '&areaCode=32'));
await hit('관광지 집중률', T('TatsCnctrRateService/tatsCnctrRatedList', '&areaCd=51&signguCd=51150'));

console.log('\n## 한국수출입은행 환율');
const day = new Date(Date.now() + 9 * 3600_000 - 86400_000 * 3).toISOString().slice(0, 10).replace(/-/g, '');
if (!KEYS.exim) console.log('✗ KOREAEXIM_KEY 없음');
else {
  await hit('환율 (oapi)', `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${KEYS.exim}&searchdate=${day}&data=AP01`);
  await hit('환율 (www)', `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${KEYS.exim}&searchdate=${day}&data=AP01`);
}
export {};
