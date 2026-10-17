import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTravelNews, newsScore, pickNews } from '../../src/lib/newsFilter';

const now = Date.UTC(2026, 9, 17);
const N = (title: string, daysAgo = 1, link = title) => ({ title, link, source: '신문', at: new Date(now - daysAgo * 86400000).toISOString() });

test('여행 소식 거르기: 축제·명소는 남기고 사건·재난·정치·경제는 뺀다', () => {
  assert.ok(isTravelNews({ title: '강릉 커피축제 10월 개막…바다 보며 즐기는 한 잔' }));
  assert.ok(!isTravelNews({ title: '제주 해안도로서 렌터카 사고…2명 사망' }));
  assert.ok(!isTravelNews({ title: '태풍 북상에 강릉 해수욕장 통제' }));
  assert.ok(!isTravelNews({ title: '전주시의원 후보 토론회' }));
  assert.ok(!isTravelNews({ title: '고창군 내년 예산안 5천억 편성' }));
  assert.ok(!isTravelNews({ title: '광주시 아파트 분양 일정' }));
});

test('점수: 여행 준비에 쓰이는 말·지역 이름·최근일수록 높고, 30일 넘으면 뺀다', () => {
  assert.ok(newsScore(N('고창 청보리밭 축제 개막, 가볼 만한 곳'), '고창', now) > newsScore(N('고창 소식 모음'), '고창', now));
  assert.equal(newsScore(N('강릉 축제', 40), '강릉', now), -99);
  assert.ok(newsScore(N('11월 유류할증료 인하…항공권 싸진다'), '', now) >= 3);
});

test('합치기: 같은 보도는 하나만, 점수순, 낮은 점수는 버린다', () => {
  const a = [N('11월 유류할증료 인하…항공권 싸진다', 1, 'a'), N('코스피 하락 마감', 1, 'b')];
  const b = [N('11월 유류할증료 인하… 항공권 싸진다', 2, 'c'), N('일본 무비자 입국 연장', 3, 'd'), N('제주 신규 취항 노선 특가', 0, 'e')];
  const out = pickNews([a, b], '', 5, now);
  assert.deepEqual(out.map((x) => x.link), ['e', 'a', 'd']);
});

test('검색어: 군·시를 떼고 찾고, 이름이 겹치는 곳은 도 이름을 붙인다', async () => {
  const { newsSpec, GENERAL_QUERIES } = await import('../../src/lib/newsFilter');
  const { REGIONS } = await import('../../src/lib/geo');
  const code = (name: string, area?: string) => REGIONS.find((r) => r.name === name && (!area || r.groupName === area))!.code;
  const gc = newsSpec({ t: 'kr', code: code('고창군') });
  assert.equal(gc.match, '고창');
  assert.ok(gc.queries[0].startsWith('고창 여행'));
  const gj = newsSpec({ t: 'kr', code: code('광주시', '경기') });
  assert.ok(gj.queries[0].startsWith('경기 광주'), gj.queries[0]);
  const gwangju = newsSpec({ t: 'kr', code: '29' });
  assert.ok(gwangju.queries[0].startsWith('광주 여행'), gwangju.queries[0]);
  assert.ok(GENERAL_QUERIES.length >= 4 && GENERAL_QUERIES.every((q) => q.length <= 60));
});

test('소식 탭: 새 소식 있는 곳부터 최근 순, 빈 곳은 뒤로', async () => {
  const { orderNewsTabs } = await import('../../src/lib/newsFilter');
  const T = (key: string) => ({ key, label: key, queries: [], match: '' });
  const got = { a: [], b: [N('b 축제', 5)], c: [N('c 축제', 1)], general: [N('항공권', 3)] };
  assert.deepEqual(orderNewsTabs([T('a'), T('b'), T('c'), T('general')], got).map((t) => t.key), ['c', 'general', 'b', 'a']);
});
