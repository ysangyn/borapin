import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../../src/data/world.json' with { type: 'json' };
import cities from '../../src/data/cities.json' with { type: 'json' };
import { cityFor, monthScore, pickCities, type WorldData } from '../../src/lib/world';
import { samePlace } from '../../src/lib/wishes';

const W = data as unknown as WorldData;

test('세계 도시 자료: 120곳 이상, 도시 목록과 맞고, 칸이 비지 않는다', () => {
  assert.ok(W.cities.length >= 120);
  const known = new Set((cities as string[][]).map((c) => `${c[0]}:${c[1]}`));
  for (const w of W.cities) {
    assert.ok(known.has(`${w.c}:${w.city}`), `${w.city}가 cities.json에 없어요`);
    assert.ok(w.best.length >= 2 && w.best.every((m) => m >= 1 && m <= 12), w.city);
    assert.ok(w.eat.length === 3 && w.see.length === 3, w.city);
    assert.ok(w.line.length > 8 && w.cur && w.lang && w.plug && w.entry, w.city);
  }
  // 겹치는 도시 없음
  assert.equal(new Set(W.cities.map((w) => `${w.c}:${w.city}`)).size, W.cities.length);
});

test('속성을 조합해 고른다: 7월 + 시원 + 가깝게 → 삿포로·하코다테 같은 곳, 우기는 빠진다', () => {
  const july = pickCities(W, { month: 7, fly: 'near' });
  const names = july.map((w) => w.city);
  assert.ok(names.indexOf('삿포로') < 5, `삿포로가 앞에 와야 해요: ${names.slice(0, 8)}`);
  assert.ok(!names.includes('방콕'), '7월 방콕(우기)은 빠져야 해요');
  // 1월 + 따뜻 + 아이와 → 세부·괌·다낭 같은 곳
  const jan = pickCities(W, { month: 1, with: '아이' }).map((w) => w.city);
  assert.ok(['세부', '괌', '다낭', '푸껫', '사이판'].some((c) => jan.slice(0, 6).includes(c)), jan.slice(0, 6).join(','));
  // 예산 가볍게 + 미식 → 비싼 곳은 없다
  const cheap = pickCities(W, { cost: 1, tags: ['미식'] });
  assert.ok(cheap.length >= 5 && cheap.every((w) => w.cost === 1 && w.tags.includes('미식')));
  // 부모님과 많이 안 걷는 곳
  const parents = pickCities(W, { with: '부모님', walk: 1 });
  assert.ok(parents.length >= 5 && parents.every((w) => w.walk === 1));
});

test('달 점수: 좋은 달 2점, 여름 시원 +1, 우기 -2', () => {
  const sapporo = W.cities.find((w) => w.city === '삿포로')!;
  const bangkok = W.cities.find((w) => w.city === '방콕')!;
  assert.equal(monthScore(sapporo, 7), 3);
  assert.ok(monthScore(bangkok, 7) < 0);
  assert.equal(monthScore(bangkok, 1), 3);
});

test('장소에서 도시 자료 찾기, 같은 곳 비교는 도시까지 본다', () => {
  assert.equal(cityFor(W, { t: 'country', id: 'JPN', city: '교토' })?.en, 'Kyoto');
  assert.equal(cityFor(W, { t: 'country', id: 'JPN' })?.c, 'JPN');
  assert.equal(cityFor(W, { t: 'kr', code: '11' }), null);
  assert.equal(samePlace({ t: 'country', id: 'JPN', city: '교토' }, { t: 'country', id: 'JPN', city: '도쿄' }), false);
  assert.equal(samePlace({ t: 'country', id: 'JPN', city: '교토' }, { t: 'country', id: 'JPN' }), true);
  assert.equal(samePlace({ t: 'country', id: 'JPN', city: '교토' }, { t: 'country', id: 'JPN', city: '교토' }), true);
});
