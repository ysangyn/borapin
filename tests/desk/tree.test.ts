import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTree, flatten, type TreeNode } from '../../desk/src/tree';
import type { DeskTrip } from '../../desk/src/trips';
import type { Item } from '../../desk/src/types';

const item = (p: Partial<Item> & { path: string }): Item => ({
  root: 'D:/사진', rel: p.path, size: 100, mtime: '2024-05-03T10:15', kind: 'photo', ext: 'jpg', quick: 'q', sha: p.path,
  taken: null, takenFrom: null, tz: null, lat: null, lng: null, camera: null, hint: null, received: false, ...p,
});
const trips: DeskTrip[] = [
  { id: 't1', title: '강릉 바다', when: { p: 'day', y: 2024, m: 5, d: 3, d2: 5 }, places: [{ t: 'kr', code: '51150' }] },
  { id: 't2', title: '커피 축제', when: { p: 'month', y: 2022, m: 10 }, places: [{ t: 'kr', code: '51150' }] },
];
const names = (nodes: TreeNode[]) => nodes.map((n) => `${n.name} ${n.count}`);

test('서랍 나무: 여행 → 날짜, 여행 아닌 사진 → 해 → 달, 자료, 모르는 사진, 중복, 보관처', () => {
  const items = [
    item({ path: 'a.jpg', taken: '2024-05-03T10:00', takenFrom: 'exif', lat: 37.8, lng: 128.9 }),
    item({ path: 'b.jpg', taken: '2024-05-04T10:00', takenFrom: 'exif' }),
    item({ path: 'b2.jpg', taken: '2024-05-04T18:00', takenFrom: 'exif' }),
    item({ path: 'c.jpg', taken: '2022-10-08T10:00', takenFrom: 'exif', lat: 37.8, lng: 128.9 }),
    item({ path: 'd.jpg', taken: '2026-11-01T10:00', takenFrom: 'exif', lat: 37.6, lng: 126.8 }), // 여행 아님, 자리 있음
    item({ path: 'e.jpg', taken: '2026-10-02T10:00', takenFrom: 'filename' }), // 여행 아님, 어디 모름
    item({ path: 'Screenshots/s.png', taken: '2026-11-02T10:00', takenFrom: 'filename', hint: 'screenshot' }),
    item({ path: 'KakaoTalk_20240504_100000000.jpg', taken: '2024-05-04T10:00', takenFrom: 'filename', received: true, hint: 'received' }),
    item({ path: 'x.jpg', taken: '2021-01-01T00:00', takenFrom: 'mtime' }), // 언제 모름
    item({ path: 'a-copy.jpg', sha: 'a.jpg', taken: '2024-05-03T10:00', takenFrom: 'exif', lat: 37.8, lng: 128.9, root: 'E:/백업' }),
  ];
  const t = buildTree(items, trips);
  assert.deepEqual(names(t), ['여행 5', '여행 아닌 사진 2', '자료 2', '모르는 사진 4', '중복 1', '보관처 2']);
  const trip = t[0];
  assert.deepEqual(names(trip.children), ['2024-05 강릉 바다 4', '2022-10 커피 축제 1']); // 최근 여행 먼저, 받은 사진도 여행에(약한 추정), 같은 사진은 한 번만
  assert.deepEqual(names(trip.children[0].children), ['5월 3일 1', '5월 4일 3']);
  assert.deepEqual(trip.children[0].children[0].files.map((f) => f.rel), ['a.jpg']);
  const not = t[1];
  assert.deepEqual(names(not.children), ['2026 2']);
  assert.deepEqual(names(not.children[0].children), ['11월 1', '10월 1']);
  assert.deepEqual(names(t[2].children), ['스크린샷 1', '받은 사진 1']);
  assert.deepEqual(names(t[3].children), ['언제 모름 2', '어디 모름 3']); // 언제: x(수정 시각)·받은 사진 / 어디: e·스크린샷·x (b·b2는 여행이 있어 앎)
  assert.deepEqual(t[4].children[0].files.map((f) => f.rel), ['a.jpg', 'a-copy.jpg']);
  assert.deepEqual(names(t[5].children), ['D:/사진 9', 'E:/백업 1']);
  // 납작하게: 경로 문자열로 (CSV·검색에 씀)
  const flat = flatten(t);
  assert.ok(flat.some((f) => f.path === '여행/2024-05 강릉 바다/5월 3일' && f.count === 1), JSON.stringify(flat.slice(0, 5)));
});

test('여행이 없으면 모두 "여행 아닌 사진"에 해·달로, 빈 서랍은 빠진다', () => {
  const items = [item({ path: 'a.jpg', taken: '2024-05-03T10:00', takenFrom: 'exif', lat: 1, lng: 1 })];
  const t = buildTree(items, []);
  assert.deepEqual(names(t), ['여행 아닌 사진 1', '보관처 1']);
  assert.deepEqual(names(t[0].children[0].children), ['5월 1']);
});
