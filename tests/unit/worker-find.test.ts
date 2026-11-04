import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noPrice, parseListings, plain } from '../../worker/src/findParse';

const WT = `== See ==
=== Old Town ===
* {{see | name=[[Senso-ji]] | alt=浅草寺 | lat=35.7148 | long=139.7967 | url=https://www.senso-ji.jp | content=Tokyo's oldest temple, with a huge red lantern {{km|2}} from the station. Free entry.}}
* {{see|name=Tokyo Skytree|lat=35.71|long=139.81|content=Tall tower. Tickets ¥2,100–3,500.}}
== Eat ==
* {{eat | name=Ichiran | content='''Famous''' ramen in booths. Bowls around ¥980.}}
* {{listing | type=drink | name=Bar High Five | content=Classic cocktail bar.}}
* {{see|name=Senso-ji|content=dup}}
`;

test('위키보이지 목록 틀: 이름·좌표·한 줄·동네, 안쪽 틀이 있어도 끝까지', () => {
  const all = parseListings(WT);
  assert.deepEqual(all.map((x) => [x.kind, x.name]), [['see', 'Senso-ji'], ['see', 'Tokyo Skytree'], ['eat', 'Ichiran'], ['eat', 'Bar High Five']]);
  assert.equal(all[0].lat, 35.7148);
  assert.equal(all[0].area, 'Old Town');
  assert.equal(all[0].line, "Tokyo's oldest temple, with a huge red lantern from the station.");
  assert.equal(all[0].url, 'https://www.senso-ji.jp');
  assert.equal(all[2].area, undefined);
});

test('종류만 고르기', () => {
  assert.deepEqual(parseListings(WT, 'eat').map((x) => x.name), ['Ichiran', 'Bar High Five']);
});

test('가격 숫자는 지운다', () => {
  assert.equal(noPrice('Tall tower. Tickets ¥2,100–3,500.'), 'Tall tower. Tickets.');
  assert.equal(noPrice('Bowls around 980 yen, cheap'), 'Bowls around, cheap');
  assert.equal(parseListings(WT, 'eat')[0].line, 'Famous ramen in booths.');
});

test('위키 글씨 풀기', () => {
  assert.equal(plain("[[Shibuya|the Shibuya area]] is '''busy'''<ref>x</ref>"), 'the Shibuya area is busy');
});
