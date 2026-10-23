/**
 * 요즘 자료(src/lib/trend.ts) 순수 함수: 꼬리표·붐빔·같이 가면 좋은 곳·기준 날·고르기.
 * 자리표시(regions 빈 것)나 깨진 자료에서도 화면이 그릴 게 없을 뿐 예외가 나면 안 된다.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crowdLevel, crowdOf, easyCount, hasTrend, kakaoSearchUrl, normalizeTrend, rankTrend, relatedOf, tagShort, trendAt, trendSummary, trendTags, type TourData, type TrendData } from '../../src/lib/trend';

const trend: TrendData = {
  at: '2026-10-20',
  window: { from: '2026-10-13', to: '2026-10-19' },
  regions: {
    '51150': { out: 50000, outPrev: 37000, growth: 0.35, rank: 3, related: [{ n: '경포해변', m: '강릉시' }, { n: '안목해변', m: '강릉시' }, { n: '경포해변', m: '강릉시' }], crowd: [{ n: '경포해변', r: 62.1 }, { n: '오죽헌', r: 12 }, { n: '선교장', r: 33 }] },
    '46130': { out: 20000, outPrev: 15000, growth: 0.333, rank: 10, related: [], crowd: [] },
    '51210': { out: 30000, outPrev: 25000, growth: 0.2, rank: 8, related: [{ n: '속초해수욕장', m: '속초시' }], crowd: [] },
    '47940': { out: 300, outPrev: 300, growth: 0, rank: 158, related: [], crowd: [] },
    '51810': { out: 500, outPrev: null, growth: null, rank: 150, related: [], crowd: [] },
  },
  hot: ['51150', '46130', '51210'],
  quiet: ['47940', '51810'],
};
const tour: TourData = { updated: '2026-10-21', cells: { '11': { s: [], easy: 297 }, '51150': { s: [['경포해변', 37.8, 128.9, 'x.jpg']], easy: 95 }, '47940': { s: [], easy: 0 }, '41280': { s: [], easy: 40 } } };
const empty = normalizeTrend({ at: '', window: { from: '', to: '' }, regions: {}, hot: [], quiet: [] });

test('자료 모양 다듬기: 자리표시·빠진 칸·엉뚱한 값에도 깨지지 않는다', () => {
  assert.equal(hasTrend(empty), false);
  assert.equal(hasTrend(trend), true);
  assert.equal(normalizeTrend(null), null);
  assert.equal(normalizeTrend('x'), null);
  const loose = normalizeTrend({ regions: { '11': { out: '많음', growth: 'NaN', related: [{ n: '남산' }, 3], crowd: [{ n: '경복궁', r: '70' }, { n: '덕수궁', r: 70 }] } }, hot: ['11', 7], quiet: null })!;
  assert.deepEqual(loose.hot, ['11']);
  assert.deepEqual(loose.quiet, []);
  assert.equal(loose.at, '');
  assert.deepEqual(loose.regions['11'], { out: 0, outPrev: null, growth: null, rank: 0, related: [{ n: '남산', m: '' }], crowd: [{ n: '덕수궁', r: 70 }] });
});

test('꼬리표: 뜨는 곳(왜: 외지인 늘어난 비율)·한적해요, 없으면 빈 목록', () => {
  assert.deepEqual(trendTags('51150', trend), [{ t: '요즘 뜨는 곳', k: 'hot', why: '외지인 35% 늘었어요' }]);
  assert.deepEqual(trendTags('46130', trend), [{ t: '요즘 뜨는 곳', k: 'hot', why: '외지인 33% 늘었어요' }]);
  assert.deepEqual(trendTags('47940', trend), [{ t: '한적해요', k: 'quiet' }]);
  assert.deepEqual(trendTags('51810', trend), [{ t: '한적해요', k: 'quiet' }]);
  assert.deepEqual(trendTags('26', trend), []);
  assert.deepEqual(trendTags('51150', empty), []);
  assert.deepEqual(trendTags('51150', null), []);
  assert.equal(tagShort('51150', trend), '요즘 뜨는 곳(외지인 35%↑)');
  assert.equal(tagShort('47940', trend), '한적해요');
  assert.equal(tagShort('26', trend), '');
});

test('붐빔: 20 미만 한적, 50 미만 보통, 그 밖은 붐벼요 · 관광지 이름으로 찾기(띄어쓰기 무시)', () => {
  assert.equal(crowdLevel(0), '한적');
  assert.equal(crowdLevel(19.9), '한적');
  assert.equal(crowdLevel(20), '보통');
  assert.equal(crowdLevel(49.9), '보통');
  assert.equal(crowdLevel(50), '붐벼요');
  assert.equal(crowdLevel(99), '붐벼요');
  assert.equal(crowdOf('51150', trend, '경포해변'), '붐벼요');
  assert.equal(crowdOf('51150', trend, '경포 해변'), '붐벼요');
  assert.equal(crowdOf('51150', trend, '오죽헌'), '한적');
  assert.equal(crowdOf('51150', trend, '선교장'), '보통');
  assert.equal(crowdOf('51150', trend, '안목해변'), null);
  assert.equal(crowdOf('51150', null, '경포해변'), null);
});

test('같이 가면 좋은 곳: 중복 없이, 없으면 빈 목록 · 카카오맵 검색 링크', () => {
  assert.deepEqual(relatedOf('51150', trend), [{ n: '경포해변', m: '강릉시' }, { n: '안목해변', m: '강릉시' }]);
  assert.deepEqual(relatedOf('46130', trend), []);
  assert.deepEqual(relatedOf('51150', empty), []);
  assert.deepEqual(relatedOf('51150', undefined), []);
  assert.equal(kakaoSearchUrl('강릉시 경포해변'), 'https://map.kakao.com/link/search/%EA%B0%95%EB%A6%89%EC%8B%9C%20%EA%B2%BD%ED%8F%AC%ED%95%B4%EB%B3%80');
});

test("기준 날: '10월 20일 기준', 날짜가 없으면 빈 글", () => {
  assert.equal(trendAt(trend), '10월 20일 기준');
  assert.equal(trendAt(empty), '');
  assert.equal(trendAt(null), '');
  assert.equal(trendAt({ ...trend, at: '2026-01-05' }), '1월 5일 기준');
});

test('한 지역 요약(물어보기·AI 사실용): 있는 칸만 글이 된다', () => {
  const f = trendSummary('51150', trend, tour);
  assert.equal(f.tag, '요즘 뜨는 곳(외지인 35% 늘었어요) · 10월 20일 기준');
  assert.equal(f.crowd, '경포해변 붐벼요, 오죽헌 한적, 선교장 보통');
  assert.equal(f.related, '경포해변, 안목해변');
  assert.equal(f.easy, '휠체어·유모차로 다니기 편한 관광지 95곳');
  assert.deepEqual(trendSummary('26', null, null), { tag: '', crowd: '', related: '', easy: '' });
  assert.equal(easyCount('47940', tour), 0);
  assert.equal(easyCount('11', null), 0);
});

test('고르기: 뜨는 곳은 hot 순서, 안 가본 곳 먼저, 집이 있으면 가까운 곳 가산·집은 뺌', () => {
  const none = new Set<string>();
  assert.deepEqual(rankTrend('hot', { trend, visited: none })!.map((x) => x.code), ['51150', '46130', '51210']);
  // 강릉을 가 봤으면 뒤로
  assert.deepEqual(rankTrend('hot', { trend, visited: new Set(['51150']) })!.map((x) => x.code), ['46130', '51210', '51150']);
  // '안 가본 곳만'이면 아예 뺀다
  assert.deepEqual(rankTrend('hot', { trend, visited: new Set(['51150']), unvisitedOnly: true })!.map((x) => x.code), ['46130', '51210']);
  // 집이 속초면 속초는 빼고, 가까운 강릉이 먼 여수보다 앞 (여수는 300km 넘게 멀어 5자리 넘게 밀린다)
  const home = { lat: 38.207, lng: 128.592, code: '51210' };
  assert.deepEqual(rankTrend('hot', { trend, visited: none, home })!.map((x) => x.code), ['51150', '46130']);
  // 집이 순천이면 가까운 여수가 더 많이 늘어난 강릉보다 앞으로 온다
  assert.deepEqual(rankTrend('hot', { trend, visited: none, home: { lat: 34.95, lng: 127.49, code: '46150' } })!.map((x) => x.code), ['46130', '51150', '51210']);
  assert.equal(rankTrend('hot', { trend, visited: none })![0].why, '외지인 35% 늘었어요');
  // 늘어난 비율이 없는 곳도 말은 붙는다
  assert.equal(rankTrend('quiet', { trend, visited: none })!.find((x) => x.code === '51810')!.why, '사람이 적어 조용해요');
});

test('고르기: 한적한 곳은 quiet 순서, 테마·광역 조건(allow)으로 거른다', () => {
  assert.deepEqual(rankTrend('quiet', { trend, visited: new Set() })!.map((x) => x.code), ['47940', '51810']);
  assert.deepEqual(rankTrend('quiet', { trend, visited: new Set(), allow: new Set(['51810']) })!.map((x) => x.code), ['51810']);
  assert.deepEqual(rankTrend('hot', { trend, visited: new Set(), allow: new Set(['99999']) }), []);
});

test('고르기: 많이 안 걷는 곳은 무장애 관광지 수 많은 순 (0곳은 뺌), 자료가 없으면 null', () => {
  const r = rankTrend('easy', { tour, visited: new Set() })!;
  assert.deepEqual(r.map((x) => x.code), ['11', '51150', '41280']);
  assert.equal(r[0].why, '휠체어·유모차로 다니기 편한 관광지 297곳');
  // 서울을 가 봤으면 뒤로
  assert.deepEqual(rankTrend('easy', { tour, visited: new Set(['11']) })!.map((x) => x.code), ['51150', '41280', '11']);
  assert.equal(rankTrend('easy', { tour: null, visited: new Set() }), null);
  assert.equal(rankTrend('hot', { trend: null, visited: new Set() }), null);
  assert.equal(rankTrend('hot', { trend: empty, visited: new Set() }), null);
  assert.equal(rankTrend('quiet', { trend: { ...trend, quiet: [] }, visited: new Set() }), null);
});
