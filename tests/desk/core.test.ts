import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { groupDupes } from '../../desk/src/dupes';
import { vaultTable } from '../../desk/src/vaults';
import { matchTrips, type DeskTrip } from '../../desk/src/trips';
import { summarize, toCsv } from '../../desk/src/inventory';
import { renderReport } from '../../desk/src/report';
import { readFileMeta } from '../../desk/src/meta';
import { scanRoots } from '../../desk/src/scan';
import { sha256File, quickHashFile } from '../../desk/src/hash';
import type { Item } from '../../desk/src/types';

const FIX = join(import.meta.dirname, 'fixtures');
const item = (p: Partial<Item> & { path: string }): Item => ({
  root: 'D:/사진', rel: p.path, size: 100, mtime: '2024-05-03T10:15', kind: 'photo', ext: 'jpg', quick: 'q', sha: null,
  taken: null, takenFrom: null, tz: null, lat: null, lng: null, camera: null, hint: null, received: false, ...p,
});

test('완전 중복: 같은 해시끼리 묶고, 보관처가 다른 것만 "안전한 사본"으로 센다', () => {
  const items = [
    item({ path: 'a.jpg', sha: 'h1', root: 'D:/사진' }),
    item({ path: 'b/a.jpg', sha: 'h1', root: 'D:/사진' }), // 같은 디스크 안 중복
    item({ path: 'a.jpg', sha: 'h1', root: 'E:/백업' }), // 다른 디스크 사본
    item({ path: 'c.jpg', sha: 'h2' }),
    item({ path: 'd.jpg', sha: null }), // 해시 못 읽음 → 따로
  ];
  const g = groupDupes(items);
  assert.equal(g.unique, 3); // h1, h2, d(해시 없음) — 해시 없는 것은 각각 한 장으로
  assert.equal(g.extraFiles, 2); // h1이 3개 → 2개 더
  assert.equal(g.groups.length, 1);
  assert.deepEqual(g.groups[0].paths, ['D:/사진/a.jpg', 'D:/사진/b/a.jpg', 'E:/백업/a.jpg']);
  const v = vaultTable(items);
  assert.deepEqual(v.byLevel, { safe: 1, risky: 2 }); // h1만 두 보관처, h2·d는 한 곳
  assert.deepEqual(v.roots.map((r) => [r.root, r.files, r.onlyHere]), [['D:/사진', 4, 2], ['E:/백업', 1, 0]]);
});

test('여행 대조: 날짜 여행은 그날 안이면, 달·해 여행은 느슨하게, 밖이면 없음', () => {
  const trips: DeskTrip[] = [
    { id: 't1', title: '강릉 바다', when: { p: 'day', y: 2024, m: 5, d: 3, d2: 5 }, places: [{ t: 'kr', code: '51150' }] },
    { id: 't2', title: '커피 축제', when: { p: 'month', y: 2022, m: 10 }, places: [{ t: 'kr', code: '51150' }] },
    { id: 't3', title: '첫 강릉', when: { p: 'year', y: 2019 }, places: [{ t: 'kr', code: '51150' }] },
  ];
  const items = [
    item({ path: '1.jpg', taken: '2024-05-04T09:00', takenFrom: 'exif' }),
    item({ path: '2.jpg', taken: '2022-10-08T09:00', takenFrom: 'exif' }),
    item({ path: '3.jpg', taken: '2019-08-12T18:30', takenFrom: 'filename' }),
    item({ path: '4.jpg', taken: '2024-05-09T09:00', takenFrom: 'exif' }),
    item({ path: '5.jpg', taken: null }),
    item({ path: 'KakaoTalk_20240504_090000000.jpg', taken: '2024-05-04T09:00', takenFrom: 'filename', received: true }), // 받은 날일 뿐
  ];
  const m = matchTrips(items, trips);
  assert.deepEqual(m.map((x) => [x.tripId, x.confidence]), [['t1', 'sure'], ['t2', 'guess'], ['t3', 'weak'], [null, null], [null, null], ['t1', 'weak']]);
});

test('네 숫자와 CSV', () => {
  const trips: DeskTrip[] = [{ id: 't1', title: '강릉 바다', when: { p: 'day', y: 2024, m: 5, d: 3, d2: 5 }, places: [{ t: 'kr', code: '51150' }] }];
  const items = [
    item({ path: 'a.jpg', sha: 'h1', taken: '2024-05-04T09:00', takenFrom: 'exif', lat: 37.8, lng: 128.9 }),
    item({ path: 'a (1).jpg', sha: 'h1', taken: '2024-05-04T09:00', takenFrom: 'exif', lat: 37.8, lng: 128.9 }),
    item({ path: 'b.jpg', sha: 'h2', taken: '2024-05-04T10:00', takenFrom: 'exif' }), // GPS 없지만 여행 안 → 어디는 앎
    item({ path: 'c.jpg', sha: 'h3', taken: '2021-01-01T10:00', takenFrom: 'mtime' }), // 언제 추정·어디 모름
    item({ path: 'd.png', sha: 'h4', taken: null, hint: 'screenshot' }),
  ];
  const s = summarize(items, trips);
  assert.equal(s.photos, 4);
  assert.equal(s.files, 5);
  assert.equal(s.dupes, 1);
  assert.equal(s.trips, 1);
  assert.equal(s.unknownWhen, 2); // c(mtime), d
  assert.equal(s.unknownWhere, 2); // c, d
  assert.equal(s.unknown, 2);
  const csv = toCsv(items, trips);
  const lines = csv.split('\n');
  assert.ok(lines[0].startsWith('경로,보관처,크기,해시,촬영,근거,시간대,위도,경도,카메라,여행,여행 확신,출처'), lines[0]);
  assert.equal(lines.length, 6);
  assert.ok(lines[2].includes('"D:/사진/a (1).jpg"') || lines[2].includes('D:/사진/a (1).jpg'));
  assert.ok(lines[1].includes('강릉 바다'));
});

test('HTML 보고서에 네 숫자와 표가 들어간다', () => {
  const trips: DeskTrip[] = [{ id: 't1', title: '강릉 바다', when: { p: 'day', y: 2024, m: 5, d: 3, d2: 5 }, places: [{ t: 'kr', code: '51150' }] }];
  const items = [item({ path: 'a.jpg', sha: 'h1', taken: '2024-05-04T09:00', takenFrom: 'exif' }), item({ path: 'b.jpg', sha: 'h1' })];
  const html = renderReport(items, trips, { generatedAt: '2026-11-07T10:00', roots: ['D:/사진'] });
  assert.match(html, /사진 <b>1<\/b>장/);
  assert.match(html, /중복 <b>1<\/b>장/);
  assert.match(html, /강릉 바다/);
  assert.match(html, /<details open><summary>여행/); // 서랍은 접히는 목록, 여행은 펼쳐서
  assert.doesNotMatch(html, /<script/); // 보고서는 스크립트 없이, 어디서 열어도 안전하게
});

test('진짜 파일: EXIF → 파일명 → 수정시각 순으로 촬영 정보를 읽는다', async () => {
  const a = await readFileMeta(join(FIX, 'exif-gangneung.jpg'));
  assert.equal(a.taken, '2024-05-03T10:15');
  assert.equal(a.takenFrom, 'exif');
  assert.equal(a.tz, '+09:00');
  assert.ok(a.lat && Math.abs(a.lat - 37.8056) < 0.001, String(a.lat));
  assert.ok(a.lng && Math.abs(a.lng - 128.9089) < 0.001, String(a.lng));
  assert.equal(a.camera, 'samsung SM-S918N');
  const b = await readFileMeta(join(FIX, '20190812_183000.jpg'));
  assert.equal(b.taken, '2019-08-12T18:30');
  assert.equal(b.takenFrom, 'filename');
  assert.equal(b.lat, null);
  const c = await readFileMeta(join(FIX, 'IMG_0421.JPG'));
  assert.equal(c.taken, '2024-05-03T10:20');
  assert.equal(c.takenFrom, 'exif');
  assert.equal(c.camera, 'Canon EOS M50');
  assert.equal(c.lat, null);
});

test('진짜 폴더: 훑기는 사진만 모으고 숨김·캐시 폴더는 건너뛴다, 해시는 같은 파일에 같게', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'desk-'));
  mkdirSync(join(dir, '2024', '2024-05-03 강릉'), { recursive: true });
  mkdirSync(join(dir, '.thumbnails'));
  mkdirSync(join(dir, '@eaDir'));
  copyFileSync(join(FIX, 'exif-gangneung.jpg'), join(dir, '2024', '2024-05-03 강릉', 'a.jpg'));
  copyFileSync(join(FIX, 'exif-gangneung.jpg'), join(dir, '2024', 'a-copy.jpg'));
  copyFileSync(join(FIX, '20190812_183000.jpg'), join(dir, '.thumbnails', 't.jpg'));
  writeFileSync(join(dir, '@eaDir', 'x.jpg'), 'junk');
  writeFileSync(join(dir, 'memo.txt'), 'not a photo');
  const items = await scanRoots([dir]);
  assert.deepEqual(items.map((i) => i.rel).sort(), ['2024/2024-05-03 강릉/a.jpg', '2024/a-copy.jpg']);
  assert.equal(items[0].sha, items[1].sha);
  assert.equal(items[0].sha, await sha256File(join(FIX, 'exif-gangneung.jpg')));
  assert.equal(items[0].quick, await quickHashFile(join(FIX, 'exif-gangneung.jpg')));
  assert.equal(items[0].taken, '2024-05-03T10:15');
  assert.equal(readFileSync(join(dir, 'memo.txt'), 'utf8'), 'not a photo'); // 아무것도 안 건드림
});
