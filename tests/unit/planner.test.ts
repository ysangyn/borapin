import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import { dateRange, planCandidates, skeleton, whenOf, type PlanConds, type PlannerData } from '../../src/lib/planner';
import { setMembers } from '../../src/lib/members';
import type { PlaceRec, Wish } from '../../src/lib/types';

setMembers([{ email: 'a@x', name: '영상' }, { email: 'b@x', name: '보라' }]);
const now = new Date(2026, 9, 17, 10); // 2026-10-17 토요일
const wish = (id: string, code: string, wantedBy: string[]): Wish => ({ id, place: { t: 'kr', code }, wantedBy, priority: null, spots: [], todos: [], foods: [], note: '', source: 'app', v: 1 } as Wish);
const base: PlannerData = { wishes: [], trips: [], stats: null, info: travelinfo as never, seasons: seasons as never, festivals: { updated: null, cells: { '51150': [{ t: '강릉커피축제', s: '20261023', e: '20261026', id: 'f' }] } }, world: world as never, recs: [] };
const C = (o: Partial<PlanConds>): PlanConds => ({ when: 'nextweekend', nights: 1, who: '둘이', scope: 'kr', ...o });

test('날짜: 이번 주말은 오늘(토), 다음 주말은 24일, 다음 달은 11월 첫 토요일, 1박이면 다음 날까지', () => {
  assert.equal(dateRange(C({ when: 'weekend' }), now)!.start.getDate(), 17);
  const r = dateRange(C({ when: 'nextweekend' }), now)!;
  assert.equal(r.start.getDate(), 24); assert.equal(r.end.getDate(), 25);
  assert.equal(dateRange(C({ when: 'nextmonth' }), now)!.start.getDate(), 7);
  assert.equal(dateRange(C({ when: 'unknown' }), now), null);
  assert.deepEqual(whenOf(C({ when: 'nextweekend', nights: 1 }), now), { p: 'day', y: 2026, m: 10, d: 24, y2: 2026, m2: 10, d2: 25 });
});

test('후보: 둘 다 원하는 곳이 1순위, 한 명만은 그다음, 3곳, 축제가 겹치면 이유에 나온다', () => {
  const d = { ...base, wishes: [wish('w1', '48840', ['영상']), wish('w2', '50', ['영상', '보라'])] };
  const list = planCandidates(C({}), d, now);
  assert.equal(list.length, 3);
  assert.equal(list[0].wishId, 'w2');
  assert.ok(list[0].reasons.includes('둘 다 가고 싶다고 한 곳'));
  assert.ok(list.some((c) => c.wishId === 'w1'));
  // 강릉 커피축제(10.23~26)가 다음 주말(24~25)과 겹친다 → 가고 싶은 곳이 없으면 강릉이 나오기 쉽다
  const fest = planCandidates(C({}), base, now, [], 20);
  assert.ok(fest.some((c) => c.reasons.some((r) => r.includes('강릉커피축제'))), fest.map((c) => c.title).join(','));
});

test('당일치기는 수도권 근처만, 제주는 1박부터, 다시 고르면 겹치지 않는다', () => {
  const day = planCandidates(C({ nights: 0, wishes: undefined } as never), { ...base, wishes: [wish('w2', '50', ['영상', '보라'])] }, now);
  assert.ok(!day.some((c) => c.place.t === 'kr' && c.place.code === '50'));
  const first = planCandidates(C({}), base, now);
  const again = planCandidates(C({}), base, now, first.map((c) => (c.place.t === 'kr' ? `kr:${c.place.code}` : '')));
  assert.ok(again.every((c) => !first.some((f) => JSON.stringify(f.place) === JSON.stringify(c.place))));
});

test('해외: 2박이면 가까운 도시(비행 4.5시간 안)만', () => {
  const list = planCandidates(C({ scope: 'world', nights: 2 }), base, now);
  assert.ok(list.length >= 1);
  assert.ok(list.every((c) => c.place.t === 'country'));
});

test('뼈대: 1박 2일이면 날짜 둘, 첫날 출발·오전·점심·오후·저녁, 마지막 날 집으로, 또 갈래요 맛집이 먼저', () => {
  const recs = [{ id: 'r1', name: '초당할머니순두부', kind: 'food', region: { t: 'kr', code: '51150' }, verdict: 'again' } as PlaceRec];
  const items = skeleton({ t: 'kr', code: '51150' }, C({}), { ...base, recs }, now);
  const days = [...new Set(items.map((i) => i.day))];
  assert.deepEqual(days, ['2026-10-24', '2026-10-25']);
  assert.equal(items[0].name, '출발');
  assert.match(items[0].info, /강릉역/);
  assert.equal(items.find((i) => i.time === '12:30')!.name, '초당할머니순두부');
  assert.ok(items.some((i) => i.name === '강릉커피축제'));
  assert.equal(items[items.length - 1].name, '집으로');
  // 날짜를 모르면 날짜 없이
  assert.ok(skeleton({ t: 'kr', code: '51150' }, C({ when: 'unknown' }), base, now).every((i) => i.day === null));
});
