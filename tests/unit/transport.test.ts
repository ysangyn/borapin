import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessFor, accessLine } from '../../src/lib/transport';

test('가까운 역·공항: 강릉은 강릉역·양양공항, 제주는 제주공항만, 해외는 공항 코드', () => {
  const g = accessFor({ t: 'kr', code: '51150' })!;
  assert.equal(g.station?.n, '강릉역');
  assert.equal(g.airport?.n, '양양공항');
  assert.ok(g.airport!.km > 30 && g.airport!.km < 60, String(g.airport!.km));
  const j = accessFor({ t: 'kr', code: '50' })!;
  assert.equal(j.airport?.n, '제주공항');
  assert.equal(j.station, undefined);
  assert.match(accessLine({ t: 'kr', code: '52' }), /전주역/);
  assert.match(accessLine({ t: 'kr', code: '48220' }), /진주역|창원중앙역/); // 통영: 가까운 KTX역
  assert.equal(accessLine({ t: 'country', id: 'JPN', city: '오사카' }), '공항 OSA');
});
