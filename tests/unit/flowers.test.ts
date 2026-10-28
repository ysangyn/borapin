import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { firstFlower, iconOf } from '../../scripts/flowers-normalize';
import { KINDS } from '../../scripts/flowers-build';

test('위키백과 꽃 칸 → 첫 꽃 이름', () => {
  assert.equal(firstFlower('철쭉, 진달래'), '철쭉');
  assert.equal(firstFlower('영산홍(Rhododendron indicum) [1]'), '영산홍');
  assert.equal(firstFlower('동백꽃'), '동백꽃');
  assert.equal(firstFlower(null), null);
});

test('꽃 이름 → 그림 종류 (다른 이름도), 모르면 들꽃', () => {
  assert.equal(iconOf('참꽃'), 'azalea');
  assert.equal(iconOf('영산홍'), 'royal-azalea');
  assert.equal(iconOf('동백꽃'), 'camellia');
  assert.equal(iconOf('왕벚꽃'), 'cherry');
  assert.equal(iconOf('복사꽃'), 'peach');
  assert.equal(iconOf('에델바이스'), 'wild');
});

test('모든 그림 종류에 그림 파일 세 벌이 있다', () => {
  for (const k of KINDS) for (const s of ['', '-ink', '-gray']) assert.ok(fs.existsSync(`public/art/flowers/${k.id}${s}.svg`), `${k.id}${s}`);
});

test('꽃 자료가 있으면 국내 대부분을 덮고, 그림 종류가 모두 있는 것', () => {
  const d = JSON.parse(fs.readFileSync('src/data/flowers.json', 'utf8')) as { updated: string | null; kr: Record<string, { name: string; icon: string }> };
  if (!d.updated) return; // 아직 만들기 전
  assert.ok(Object.keys(d.kr).length >= 150, `${Object.keys(d.kr).length}`);
  const ids = new Set(KINDS.map((k) => k.id));
  for (const [c, f] of Object.entries(d.kr)) { assert.ok(ids.has(f.icon), `${c} ${f.icon}`); assert.ok(f.name.length >= 1 && f.name.length <= 8, `${c} ${f.name}`); }
});
