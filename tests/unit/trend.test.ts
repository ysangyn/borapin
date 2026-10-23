/**
 * 관광빅데이터(scripts/tour-trend.ts) 계산 — 가짜 응답 item으로. 실제 호출은 CI에서만 하므로 여기서는 응답 모양을 가정한 순수 함수만 본다.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { addDays, avgOut, buildRegions, crowdTop, makeResolver, median, metroCodes, pickHot, pickQuiet, prevMonths, relatedTop, windowsOf, type CrowdItem, type RelatedItem, type VisitItem } from '../../scripts/tour-trend';
import { readJson, trendHealth } from '../../scripts/data-health';

const root = path.resolve(import.meta.dirname, '../..');
const regions = [
  { code: '11', name: '서울', sido: '서울특별시' }, { code: '26', name: '부산', sido: '부산광역시' }, { code: '29', name: '광주', sido: '전남광주통합특별시' },
  { code: '36110', name: '세종', sido: '세종특별자치시' }, { code: '41110', name: '수원시', sido: '경기도' }, { code: '41130', name: '성남시', sido: '경기도' },
  { code: '43', name: '청주시', sido: '충청북도' }, { code: '43740', name: '영동군', sido: '충청북도' }, { code: '43745', name: '증평군', sido: '충청북도' },
  { code: '46110', name: '목포시', sido: '전라남도' }, { code: '50', name: '제주', sido: '제주특별자치도' },
  { code: '51150', name: '강릉시', sido: '강원특별자치도' }, { code: '51210', name: '속초시', sido: '강원특별자치도' }, { code: '51820', name: '고성군', sido: '강원특별자치도' },
];
const resolve = makeResolver(regions);
/** 관광공사 방문자 item 한 줄 (광역 것과 같은 꼴) */
const row = (signguCode: string, baseYmd: string, touDivCd: string, touNum: number | string, signguNm = ''): VisitItem =>
  ({ signguCode, signguNm, touDivCd, touNum: String(touNum), baseYmd });
const days = (from: string, n: number) => Array.from({ length: n }, (_, i) => addDays(from, i));

test('시·군 코드 맞추기: 5자리 그대로, 광역시·제주는 구를 앞 2자리로, 행정구는 시로, 이름으로도', () => {
  assert.equal(resolve('51150', '강릉시'), '51150');
  assert.equal(resolve('36110', '세종특별자치시'), '36110');
  assert.equal(resolve('11110', '종로구'), '11'); // 광역시: 구 → 시
  assert.equal(resolve('26710', '기장군'), '26');
  assert.equal(resolve('29170', '북구'), '29');
  assert.equal(resolve('50130', '서귀포시'), '50'); // 제주도 전체가 한 칸
  assert.equal(resolve('41111', '수원시 장안구'), '41110'); // 행정구(이름으로)
  assert.equal(resolve('41117', '영통구'), '41110'); // 행정구(앞 4자리로)
  assert.equal(resolve('43111', '상당구'), '43'); // 청주시는 2자리 코드
  assert.equal(resolve('43110', '청주시'), '43');
  assert.equal(resolve('43745', '증평군'), '43745', '증평군은 영동군(43740)과 앞 4자리가 같아도 제 코드로');
  assert.equal(resolve('51820', '고성군'), '51820');
  assert.equal(resolve('48820', '고성군'), null, '목록에 없는 시도의 같은 이름은 섞지 않는다');
  assert.equal(resolve('99999', ''), null);
  assert.deepEqual(metroCodes(regions), ['11', '26', '29']);
});

test('(a) 외지인(touDivCd 2) 하루 평균·작년 대비·순위: 현지인·외국인 줄은 빼고, 날짜 수로 나눈다', () => {
  const cur = days('20260924', 28), prv = days('20250925', 28);
  const items: VisitItem[] = [];
  for (const d of cur) items.push(row('51150', d, '1', 100000), row('51150', d, '2', 50000), row('51150', d, '3', 1000), row('51210', d, '2', 20000));
  // 세종은 보름치만 있음 → 있는 날짜로만 평균
  for (const d of cur.slice(0, 14)) items.push(row('36110', d, '2', 3000));
  const avg = avgOut(items, resolve);
  assert.equal(avg['51150'].out, 50000);
  assert.equal(avg['51150'].days, 28);
  assert.equal(avg['36110'].out, 3000);
  assert.equal(avg['36110'].days, 14);
  const prevAvg = avgOut(prv.flatMap((d) => [row('51150', d, '2', 40000), row('51210', d, '2', 25000)]), resolve);
  const r = buildRegions(avg, prevAvg);
  assert.deepEqual(r['51150'], { out: 50000, outPrev: 40000, growth: 0.25, rank: 1 });
  assert.deepEqual(r['51210'], { out: 20000, outPrev: 25000, growth: -0.2, rank: 2 });
  assert.deepEqual(r['36110'], { out: 3000, outPrev: null, growth: null, rank: 3 }, '작년 자료가 없으면 outPrev·growth는 null');
  assert.equal(buildRegions({ a: { out: 10 } }, { a: { out: 0 } }).a.growth, null, '작년이 0이면 비교하지 않는다');
  assert.equal(avgOut([row('51150', '20260901', '2', 'abc')], resolve)['51150'], undefined, '숫자가 아닌 값은 버린다');
});

test('(b) 광역시는 구들을 날짜별로 더한 뒤 평균, sub는 외지인 많은 구 순', () => {
  const d = days('20261001', 2);
  const items = d.flatMap((day) => [row('11110', day, '2', 1000, '종로구'), row('11140', day, '2', 3000, '중구'), row('11680', day, '2', 2000, '강남구'), row('11110', day, '1', 99999, '종로구')]);
  const avg = avgOut(items, resolve);
  assert.deepEqual(Object.keys(avg), ['11']);
  assert.equal(avg['11'].out, 6000);
  assert.equal(avg['11'].days, 2);
  assert.deepEqual(avg['11'].sub, ['11140', '11680', '11110']);
  // 수원시 행정구도 하나로
  const su = avgOut([row('41111', '20261001', '2', 10, '장안구'), row('41113', '20261001', '2', 20, '권선구'), row('41111', '20261002', '2', 30, '장안구')], resolve);
  assert.equal(su['41110'].out, 30);
  assert.deepEqual(su['41110'].sub, ['41111', '41113']);
});

test('(c) 요즘 뜨는 곳은 growth 높은 순 중 out이 중앙값 이상인 곳만 15개, 한적한 곳은 out 낮은 순 20개(광역시 제외)', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(median([]), 0);
  // 40곳: out 1..40, growth는 out이 작을수록 큼 (작은 곳이 몇 배 뛴 것처럼)
  const regionsMap: Record<string, { out: number; growth: number | null }> = {};
  for (let i = 1; i <= 40; i++) regionsMap[`c${String(i).padStart(2, '0')}`] = { out: i * 100, growth: (41 - i) / 10 };
  regionsMap.c40.growth = null; // 작년 자료 없는 곳은 뜨는 곳에 못 든다
  regionsMap.metro = { out: 1, growth: 9 }; // 광역시(한적한 곳에서 빼야) — out이 중앙값 아래라 뜨는 곳에도 안 든다
  const hot = pickHot(regionsMap);
  assert.equal(hot.length, 15);
  assert.equal(hot[0], 'c20', '41곳의 중앙값(2000) 이상인 곳 가운데 growth가 가장 큰 곳');
  assert.ok(!hot.includes('c40') && !hot.includes('metro') && !hot.includes('c19'));
  assert.deepEqual(hot.slice(0, 3), ['c20', 'c21', 'c22']);
  const quiet = pickQuiet(regionsMap, ['metro']);
  assert.equal(quiet.length, 20);
  assert.deepEqual(quiet.slice(0, 3), ['c01', 'c02', 'c03']);
  assert.ok(!quiet.includes('metro'));
  assert.deepEqual(pickHot({ a: { out: 2, growth: 0.5 }, b: { out: 1, growth: 0.9 }, c: { out: 3, growth: null } }), ['a'], '중앙값(2) 아래인 b, 작년 없는 c는 빠진다');
});

test('(d) 연관 관광지: 이름이 많이 나온 순 최대 6개, 같으면 연관 순위 좋은 순, 자기 자신은 빼고, m은 연관 지역 시·군', () => {
  const it = (tAtsNm: string, rlteTatsNm: string, rlteRank: number, rlteSignguNm = '강릉시', rlteRegnNm = '강원특별자치도'): RelatedItem => ({ tAtsNm, rlteTatsNm, rlteRank: String(rlteRank), rlteSignguNm, rlteRegnNm });
  const items = [
    it('경포해변', '안목해변', 1), it('경포해변', '주문진', 2), it('경포해변', '오죽헌', 3), it('경포해변', '경포해변', 4),
    it('오죽헌', '안목해변', 2), it('오죽헌', '경포해변', 1), it('오죽헌', '하슬라아트월드', 5), it('오죽헌', '속초해변', 3, '속초시'),
    it('안목해변', '경포해변', 1), it('안목해변', '주문진', 1), it('안목해변', '남이섬', 4, '춘천시'), it('안목해변', '광안리', 6, '수영구', '부산광역시'),
    it('주문진', '안목해변', 1), it('주문진', '영진해변', 2), it('주문진', '', 3), it('주문진', '남이섬', 7, '춘천시'),
  ];
  const top = relatedTop(items);
  // 안목해변 3번 → 경포해변·주문진 2번(자기 자신 줄은 안 세서 경포해변은 3이 아니라 2, 같으면 이름순) → 남이섬 2번(순위 4·7) → 1번씩은 순위 좋은 순
  assert.deepEqual(top.map((x) => x.n), ['안목해변', '경포해변', '주문진', '남이섬', '영진해변', '속초해변']);
  assert.deepEqual(top[0], { n: '안목해변', m: '강릉시' });
  assert.deepEqual(top[3], { n: '남이섬', m: '춘천시' });
  assert.deepEqual(top[5], { n: '속초해변', m: '속초시' });
  assert.ok(top.every((x) => x.n !== ''), '빈 이름은 뺀다');
  assert.deepEqual(relatedTop([it('a', '광안리', 1, '수영구', '부산광역시')]), [{ n: '광안리', m: '부산 수영구' }], '광역시 구는 시 이름을 앞에');
  assert.deepEqual(relatedTop([it('a', '세종호수공원', 1, '세종시', '세종특별자치시')]), [{ n: '세종호수공원', m: '세종시' }]);
  assert.deepEqual(relatedTop([]), []);
  assert.equal(relatedTop(Array.from({ length: 10 }, (_, i) => it('a', `곳${i}`, i))).length, 6);
});

test('(e) 붐빔: 관광지마다 자료에 있는 마지막 7일 평균, 높은 순 8개', () => {
  const ds = days('20261001', 10); // 열흘치 → 뒤 7일만
  const items: CrowdItem[] = [];
  for (let s = 0; s < 10; s++) for (const [i, d] of ds.entries()) items.push({ tAtsNm: `관광지${s}`, cnctrRate: String(i < 3 ? 999 : s * 10 + (i % 2)), baseYmd: d });
  const top = crowdTop(items);
  assert.equal(top.length, 8);
  assert.equal(top[0].n, '관광지9');
  assert.equal(top[0].r, 90.6, '뒤 7일(홀짝 1·0·1·0·1·0·1 → 평균 0.571)만 썼다: 앞 사흘 999는 안 들어감');
  assert.equal(top[7].n, '관광지2');
  assert.ok(top.every((x) => x.r < 100));
  assert.deepEqual(crowdTop([{ tAtsNm: 'a', cnctrRate: '12.34' }, { tAtsNm: 'a', cnctrRate: '13' }]), [{ n: 'a', r: 12.7 }], '날짜가 없으면 전부 평균');
  assert.deepEqual(crowdTop([{ tAtsNm: '', cnctrRate: '50', baseYmd: '20261001' }, { tAtsNm: 'b', cnctrRate: 'x', baseYmd: '20261001' }]), []);
});

test('(f) trendHealth: regions 100곳 이상이어야 내용 있음, 저장소의 자리표시는 내용 없음', () => {
  const many = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`${10000 + i}`, { out: 1 }]));
  assert.equal(trendHealth({ regions: many(99) }).ok, false);
  assert.equal(trendHealth({ regions: many(100) }).ok, true);
  assert.match(trendHealth({ regions: many(100) }).why, /100/);
  assert.equal(trendHealth(null).ok, false);
  assert.equal(trendHealth('<!doctype html>').ok, false);
  const placeholder = readJson<{ at: string; window: { from: string; to: string }; regions: Record<string, unknown>; hot: string[]; quiet: string[] }>(path.join(root, 'src/data/trend.json'));
  assert.ok(placeholder, '저장소의 src/data/trend.json은 JSON이어야');
  assert.equal(trendHealth(placeholder).ok, false, '자리표시(regions 비어 있음)');
  assert.deepEqual(Object.keys(placeholder).sort(), ['at', 'hot', 'quiet', 'regions', 'window'], '화면이 기대하는 모양');
  assert.deepEqual(placeholder.hot, []);
});

test('기간: 최근 28일은 마지막 날까지, 작년은 364일 전(요일 맞춤) · 기준 달은 지난달부터', () => {
  assert.equal(addDays('20260301', -1), '20260228');
  assert.equal(addDays('20261231', 1), '20270101');
  const w = windowsOf('20261022');
  assert.deepEqual(w.cur, { from: '20260925', to: '20261022' });
  assert.deepEqual(w.prev, { from: '20250926', to: '20251023' });
  assert.deepEqual(prevMonths('20261023', 3), ['202609', '202608', '202607']);
  assert.deepEqual(prevMonths('20260115', 2), ['202512', '202511']);
});
