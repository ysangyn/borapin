/**
 * 매일 받는 자료(해외·축제·관광공사)에 내용이 있는지 — 저장소의 자리표시 파일을 '지난 자료'로 착각하지 않게
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { abroadHealth, festivalsHealth, pickPrevious, readJson, seedFiles, tourHealth } from '../../scripts/data-health';

const root = path.resolve(import.meta.dirname, '../..');
const countries = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`C${i}`, { lvl: 1 }]));
const cells = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`${10000 + i}`, []]));

test('해외 자료: 저장소의 자리표시({note})는 내용 없음, 여행경보 나라 30곳 넘어야 내용 있음', () => {
  assert.equal(abroadHealth({ note: '아직 받지 않음' }).ok, false);
  assert.equal(abroadHealth(null).ok, false);
  assert.equal(abroadHealth('<!doctype html>').ok, false); // 호스팅이 없는 파일 대신 준 index.html
  assert.equal(abroadHealth({ alarm: countries(30) }).ok, false);
  assert.equal(abroadHealth({ alarm: countries(31), alarmAt: '2026-10-22' }).ok, true);
  assert.match(abroadHealth({ alarm: countries(31) }).why, /31/);
});

test('축제: cells가 0~1곳이면 자리표시, 2곳 넘으면 내용 있음', () => {
  assert.equal(festivalsHealth({ updated: null, source: '한국관광공사 TourAPI', cells: {} }).ok, false);
  assert.equal(festivalsHealth({ updated: '2026-10-22', cells: cells(1) }).ok, false);
  assert.equal(festivalsHealth({ updated: '2026-10-22', cells: cells(2) }).ok, true);
  assert.equal(festivalsHealth(undefined).ok, false);
});

test('관광공사: 시·군 100곳 넘어야 내용 있음', () => {
  assert.equal(tourHealth({ cells: {} }).ok, false);
  assert.equal(tourHealth({ cells: cells(100) }).ok, false);
  assert.equal(tourHealth({ cells: cells(101) }).ok, true);
  assert.equal(tourHealth([]).ok, false);
});

test('지난 자료 고르기: 내용 있는 로컬 파일이 먼저, 로컬이 자리표시면 실제 주소 것, 둘 다 없으면 null', () => {
  const good: Record<string, unknown> = { alarm: countries(40) };
  const live: Record<string, unknown> = { alarm: countries(45) };
  assert.deepEqual(pickPrevious([{ file: 'a.json', data: good }], live, abroadHealth).from, 'local');
  const p = pickPrevious([{ file: 'src/data/abroad.json', data: { note: '아직 받지 않음' } }, { file: 'public/data/abroad.json', data: null }], live, abroadHealth);
  assert.equal(p.from, 'live');
  assert.equal(p.data, live);
  const second = pickPrevious([{ file: 'a.json', data: { note: 'x' } }, { file: 'b.json', data: good }], null, abroadHealth);
  assert.equal(second.from, 'local');
  assert.equal(second.why, 'b.json');
  const none = pickPrevious([{ file: 'a.json', data: { note: 'x' } }], null, abroadHealth);
  assert.equal(none.from, null);
  assert.equal(none.data, null);
});

test('저장소에 든 파일: 세 파일 모두 JSON으로 읽히고, tour.json은 실제 자료다 (abroad·festivals는 자리표시일 수 있다)', () => {
  const abroad = readJson(path.join(root, 'src/data/abroad.json'));
  const fest = readJson(path.join(root, 'public/data/festivals.json'));
  const tour = readJson(path.join(root, 'src/data/tour.json'));
  assert.ok(abroad && fest && tour, '세 파일 모두 JSON이어야');
  assert.equal(tourHealth(tour).ok, true, '저장소의 tour.json은 실제 자료');
  assert.equal(typeof abroadHealth(abroad).ok, 'boolean');
  assert.equal(typeof festivalsHealth(fest).ok, 'boolean');
  assert.equal(readJson(path.join(root, 'no-such-file.json')), null);
  assert.equal(fs.existsSync(path.join(root, 'public/data')), true, '공개 자료 폴더(public/data)가 있어야 abroad·tour 사본을 쓸 수 있다');
});

test('자리에 두기: 자리표시·없는 파일에만 지난 자료를 쓰고, 내용 있는 파일은 건드리지 않는다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'borapin-seed-'));
  const placeholder = path.join(dir, 'festivals.json');
  const missing = path.join(dir, 'public-copy.json');
  const healthy = path.join(dir, 'healthy.json');
  fs.writeFileSync(placeholder, JSON.stringify({ updated: null, cells: {} }));
  const mine = { updated: '2026-10-01', cells: cells(5) };
  fs.writeFileSync(healthy, JSON.stringify(mine));
  const live = { updated: '2026-10-21', cells: cells(140) };
  assert.deepEqual(seedFiles([placeholder, missing, healthy], live, festivalsHealth).sort(), [missing, placeholder].sort());
  assert.deepEqual(readJson(placeholder), live);
  assert.deepEqual(readJson(missing), live);
  assert.deepEqual(readJson(healthy), mine);
  // 지난 자료 자체가 비어 있으면(실제 주소도 자리표시) 아무것도 쓰지 않는다
  fs.writeFileSync(placeholder, JSON.stringify({ cells: {} }));
  assert.deepEqual(seedFiles([placeholder], { cells: {} }, festivalsHealth), []);
  assert.deepEqual(seedFiles([placeholder], null, festivalsHealth), []);
  assert.deepEqual(readJson(placeholder), { cells: {} });
  fs.rmSync(dir, { recursive: true, force: true });
});
