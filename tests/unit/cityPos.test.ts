import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import world from '../../src/data/world.json' with { type: 'json' };
import cp from '../../src/data/citypos.json' with { type: 'json' };
import { nearestCity } from '../../src/lib/cityPos';

const POS = (cp as unknown as { pos: Record<string, [number, number]> }).pos;

test('세계 도시 모두 자리가 있다', () => {
  const keys = (world as { cities: { c: string; city: string }[] }).cities.map((w) => `${w.c}:${w.city}`);
  for (const k of keys) assert.ok(POS[k], `${k} 자리 없음`);
  assert.equal(Object.keys(POS).length, keys.length);
});

test('도시 자리가 다른 나라 안에 찍혀 있지 않다 (작은 섬은 경계 단순화로 바다일 수 있음)', () => {
  const topo = JSON.parse(readFileSync('public/data/world.topojson', 'utf8'));
  const fc = feature(topo, topo.objects[Object.keys(topo.objects)[0]]) as unknown as { features: { properties: { ADM0_A3: string }; geometry: { type: string; coordinates: number[][][] | number[][][][] } | null }[] };
  const inRing = (x: number, y: number, r: number[][]) => { let o = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) o = !o; } return o; };
  const where = (lng: number, lat: number) => fc.features.find((f) => f.geometry && (f.geometry.type === 'Polygon' ? [f.geometry.coordinates as number[][][]] : (f.geometry.coordinates as number[][][][])).some((p) => inRing(lng, lat, p[0])))?.properties.ADM0_A3;
  const wrong: string[] = [];
  for (const [k, [lat, lng]] of Object.entries(POS)) {
    const got = where(lng, lat);
    const want = k.split(':')[0];
    // 홍콩·마카오는 지도에서 중국 안일 수 있다
    if (got && got !== want && !(['HKG', 'MAC'].includes(want) && got === 'CHN')) wrong.push(`${k} → ${got}`);
  }
  assert.deepEqual(wrong, []);
});

test('가까운 도시: 교토역 근처 → 교토, 오사카 난바 → 오사카, 일본 시골 한가운데 → 없음', () => {
  assert.equal(nearestCity('JPN', 34.985, 135.758), '교토');
  assert.equal(nearestCity('JPN', 34.666, 135.501), '오사카');
  assert.equal(nearestCity('JPN', 37.5, 140.0), null);
  assert.equal(nearestCity('BRN', 4.94, 114.95), '반다르스리브가완');
  assert.equal(nearestCity('ZZZ', 0, 0), null);
});
