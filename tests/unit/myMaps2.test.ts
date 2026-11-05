import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clusterScreen, fitPins, publicPlaces } from '../../src/lib/placeMaps';
import { wishBatch } from '../../src/lib/wishes';
import type { Wish } from '../../src/lib/types';

test("공개 지도엔 '별로'를 싣지 않는다 (순서는 그대로)", () => {
  const r = (id: string, verdict: string | null) => ({ id, verdict }) as never;
  assert.deepEqual(publicPlaces([r('a', 'again'), r('b', 'meh'), r('c', null), r('d', 'once')]).map((x: { id: string }) => x.id), ['a', 'c', 'd']);
});

test('겹치는 핀은 한 묶음 (가까운 것끼리, 묶음 자리는 가운데)', () => {
  const g = clusterScreen([
    { id: 'a', x: 100, y: 100 }, { id: 'b', x: 110, y: 104 }, { id: 'c', x: 300, y: 300 }, { id: 'd', x: 118, y: 96 },
  ], 30);
  assert.equal(g.length, 2);
  const big = g.find((x) => x.ids.length > 1)!;
  assert.deepEqual(big.ids.sort(), ['a', 'b', 'd']);
  assert.ok(Math.abs(big.x - 109.3) < 1 && Math.abs(big.y - 100) < 1);
  assert.deepEqual(g.find((x) => x.ids.length === 1)!.ids, ['c']);
});

test('스토리 카드: 좌표를 상자 안에 비율 그대로 (하나뿐이면 가운데)', () => {
  const box = { x: 0, y: 0, w: 1000, h: 500 };
  const pts = fitPins([{ lat: 37.5, lng: 127.0 }, { lat: 37.6, lng: 127.1 }], box, 0);
  // 북쪽이 위, 동쪽이 오른쪽
  assert.ok(pts[1].x > pts[0].x && pts[1].y < pts[0].y);
  for (const p of pts) assert.ok(p.x >= 0 && p.x <= 1000 && p.y >= 0 && p.y <= 500);
  assert.deepEqual(fitPins([{ lat: 37.5, lng: 127 }], box, 0), [{ x: 500, y: 250 }]);
});

test('받은 지도 한꺼번에 담기: 그 지역 가고 싶은 곳에 이어 담고, 이미 있는 이름은 건너뛴다', () => {
  const place = { t: 'kr', code: '51150' } as const;
  const w = { id: 'w1', place, spots: ['경포대'], foods: ['테라로사'], todos: [] } as unknown as Wish;
  const items = [
    { name: '테라로사', kind: 'cafe' }, { name: '툇마루', kind: 'cafe' }, { name: '초당순두부', kind: 'food' },
    { name: '강릉 소품가게', kind: 'shop' }, { name: '경포대 ', kind: 'sight' },
  ] as const;
  assert.deepEqual(wishBatch([w], place, items as never), { id: 'w1', foods: ['툇마루', '초당순두부'], spots: ['강릉 소품가게'], skipped: 2 });
  // 그 지역 가고 싶은 곳이 없으면 새로 (id: null)
  assert.deepEqual(wishBatch([], place, items as never), { id: null, foods: ['테라로사', '툇마루', '초당순두부'], spots: ['강릉 소품가게', '경포대'], skipped: 0 });
});

test('한 칸에 50개까지만 (넘치면 over)', () => {
  const place = { t: 'kr', code: '11' } as const;
  const w = { id: 'w', place, spots: [], foods: Array.from({ length: 49 }, (_, i) => `가게${i}`), todos: [] } as unknown as Wish;
  const r = wishBatch([w], place, [{ name: '새카페1', kind: 'cafe' }, { name: '새카페2', kind: 'cafe' }]);
  assert.deepEqual(r.foods, ['새카페1']);
  assert.equal(r.over, 1);
});
