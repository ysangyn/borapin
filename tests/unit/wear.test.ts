import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wearLine, type CityClimate } from '../../src/lib/wear';

const fill = (v: number) => Array(12).fill(v);
const c = (hi: number, lo: number, r = 1): CityClimate => ({ t: fill((hi + lo) / 2), hi: fill(hi), lo: fill(lo), r: fill(r) });

test('기온에 따라 옷차림', () => {
  assert.match(wearLine(c(32, 26), 7)!, /반팔·반바지/);
  assert.match(wearLine(c(27, 17), 9)!, /아침저녁 얇은 겉옷/);
  assert.match(wearLine(c(18, 9), 4)!, /가벼운 겉옷/);
  assert.match(wearLine(c(7, 0), 12)!, /코트·니트/);
  assert.match(wearLine(c(-3, -12), 1)!, /패딩/);
});

test('비가 잦으면 우산, 숫자는 반올림', () => {
  assert.equal(wearLine(c(23.6, 16.2, 7), 6), '낮 24°·아침 16°쯤 · 긴팔이나 반팔에 가디건 · 비 잦아요(우산)');
  assert.match(wearLine(c(23, 16, 4), 6)!, /가끔 비/);
});

test('자료가 없거나 달이 이상하면 null', () => {
  assert.equal(wearLine(undefined, 5), null);
  assert.equal(wearLine(c(20, 10), 13), null);
});

test('자료 파일이 있으면 세계 도시 대부분을 덮는다', async () => {
  const fs = await import('node:fs');
  const p = new URL('../../src/data/wear.json', import.meta.url);
  if (!fs.existsSync(p)) return; // 아직 CI로 만들기 전
  const w = JSON.parse(fs.readFileSync(p, 'utf8')) as { updated: string | null; cities: Record<string, CityClimate> };
  if (!w.updated) return; // 자리만 잡아 둔 파일
  const world = JSON.parse(fs.readFileSync(new URL('../../src/data/world.json', import.meta.url), 'utf8')) as { cities: { c: string; city: string }[] };
  const covered = world.cities.filter((x) => w.cities[`${x.c}:${x.city}`]).length;
  assert.ok(covered >= world.cities.length * 0.9, `${covered}/${world.cities.length}`);
  for (const v of Object.values(w.cities)) assert.equal(v.hi.length, 12);
});
