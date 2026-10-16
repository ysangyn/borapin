import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../../src/data/phrases.json' with { type: 'json' };
import world from '../../src/data/world.json' with { type: 'json' };
import { phraseLangFor, type PhraseData } from '../../src/lib/phrases';

const P = data as unknown as PhraseData;

test('현지어 표현: 말마다 30문장, 묶음 이름이 맞고, 칸이 비지 않는다', () => {
  assert.ok(Object.keys(P.langs).length >= 10);
  for (const [code, l] of Object.entries(P.langs)) {
    assert.equal(l.items.length, 30, code);
    for (const [g, ko, nat, snd] of l.items) {
      assert.ok(P.groups.includes(g), `${code} 모르는 묶음 ${g}`);
      assert.ok(ko && nat && snd, `${code} 빈 칸: ${ko}`);
      assert.ok(/[가-힣]/.test(snd), `${code} 발음은 한글로: ${snd}`);
    }
    // 급할 때 묶음은 꼭 있다
    assert.ok(l.items.some((p) => p[0] === '급할 때'), code);
  }
});

test('도시 자료의 말에서 표현 묶음을 고른다 (영어권은 en, 없는 말은 null)', () => {
  assert.equal(phraseLangFor('일본어'), 'ja');
  assert.equal(phraseLangFor('중국어(번체)'), 'zh');
  assert.equal(phraseLangFor('말레이어·영어'), 'id');
  assert.equal(phraseLangFor('영어·차모로어'), 'en');
  assert.equal(phraseLangFor('튀르키예어'), null);
  // 세계 도시 중 표현이 있는 말이 다수
  const cities = (world as { cities: { lang: string }[] }).cities;
  const covered = cities.filter((c) => { const k = phraseLangFor(c.lang); return k && (k === 'en' || P.langs[k]); }).length;
  assert.ok(covered / cities.length > 0.75, `${covered}/${cities.length}`);
});
