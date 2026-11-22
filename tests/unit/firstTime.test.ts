import { test } from 'node:test';
import assert from 'node:assert/strict';
import world from '../../src/data/world.json' with { type: 'json' };
import ft from '../../src/data/firsttime.json' with { type: 'json' };
import { firstPlanFor, planDays } from '../../src/lib/firstTime';
import type { WorldData } from '../../src/lib/world';

const W = world as unknown as WorldData;

test("'보통 이렇게 다녀요' 자료: 모든 도시가 세계 도시 자료에 있고, 2박 3일은 3일·4박 5일은 5일, 꼭 알 것이 있다", () => {
  const plans = (ft as { plans: Record<string, { know: string; d2: string[][]; d4: string[][] }> }).plans;
  assert.ok(Object.keys(plans).length >= 25);
  const known = new Set(W.cities.map((w) => `${w.c}:${w.city}`));
  for (const [k, p] of Object.entries(plans)) {
    assert.ok(known.has(k), `${k}가 world.json에 없어요`);
    assert.equal(p.d2.length, 3, k); assert.equal(p.d4.length, 5, k);
    assert.ok(p.know.length > 5, k);
    for (const d of [...p.d2, ...p.d4]) { assert.equal(d.length, 3, k); assert.ok(d[1].length > 2, k); assert.ok(!/\d+원|\$\d/.test(d.join(' ')), `가격 숫자는 넣지 않아요: ${k}`); }
  }
});

test('브루나이: 나라만 골라도 대표 도시의 일정이 나온다', () => {
  const r = firstPlanFor(W, { t: 'country', id: 'BRN' });
  assert.equal(r?.city.city, '반다르스리브가완');
  assert.ok(r?.plan);
  assert.equal(planDays(r!.plan!, 2)[0].title, '첫날');
  assert.equal(planDays(r!.plan!, 4).length, 5);
  assert.match(r!.plan!.know, /술/);
});

test('도시를 고르면 그 도시, 손으로 쓴 일정이 없는 도시는 plan 없이 도시 자료만, 국내는 null', () => {
  assert.equal(firstPlanFor(W, { t: 'country', id: 'JPN', city: '교토' })?.city.city, '교토');
  const r = firstPlanFor(W, { t: 'country', id: 'JPN', city: '하코다테' });
  assert.equal(r?.city.city, '하코다테');
  assert.equal(r?.plan, null);
  assert.equal(firstPlanFor(W, { t: 'kr', code: '11' }), null);
  assert.equal(firstPlanFor(null, { t: 'country', id: 'JPN' }), null);
});

test('손으로 쓴 일정이 없으면 도시 자료의 볼거리·먹을 것으로만 뼈대를 짠다 (지어낸 곳 없음)', async () => {
  const { roughPlan } = await import('../../src/lib/firstTime');
  const c = W.cities.find((w) => w.city === '하코다테')!;
  const p = roughPlan(c);
  assert.equal(p.d2.length, 3); assert.equal(p.d4.length, 5);
  const text = [...p.d2, ...p.d4].map((d) => d[1]).join(' ');
  for (const s of c.see) assert.ok(text.includes(s), s);
  const allowed = new Set([...c.see, ...c.eat, '시내 산책', '공항']);
  for (const d of [...p.d2, ...p.d4]) for (const part of d[1].replace(/저녁 /g, '').split(' → ')) assert.ok(allowed.has(part), `지어낸 곳: ${part}`);
});

test('이 일정으로 계획하기: 곳마다 일정 하나, 날짜는 떠나는 날부터, 공항은 빼고', async () => {
  const { planItems } = await import('../../src/lib/firstTime');
  const r = firstPlanFor(W, { t: 'country', id: 'BRN' })!;
  const items = planItems(r.plan!, 2, new Date(2026, 11, 5));
  assert.deepEqual(items.slice(0, 3).map((x) => [x.day, x.name]), [['2026-12-05', '오마르 알리 사이푸딘 모스크'], ['2026-12-05', '왕실 박물관'], ['2026-12-05', '가동 야시장']]);
  assert.equal(items[0].info, '시내는 걸어서, 저녁은 야시장');
  assert.ok(!items.some((x) => x.name === '공항'));
  assert.equal(items[items.length - 1].day, '2026-12-07');
  assert.ok(planItems(r.plan!, 4, null).every((x) => x.day === null));
});
