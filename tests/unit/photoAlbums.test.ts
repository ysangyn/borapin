import { test } from 'node:test';
import assert from 'node:assert/strict';
import { albumsByRegion } from '../../src/lib/photoAlbums';
import type { Photo, Trip } from '../../src/lib/types';

const G = { t: 'kr', code: '51150' } as const; // 강릉
const B = { t: 'kr', code: '26' } as const; // 부산
const trip = (id: string, y: number, places: Trip['places']) => ({ id, title: id, status: 'done', kind: 'trip', when: { p: 'month', y, m: 5 }, places, companions: [], memo: '', tags: [], source: 'app', v: 1 }) as Trip;
const photo = (id: string, tripId: string | null, taken: string | null = null) => ({ id, tripId, w: 1, h: 1, taken, takenGuess: false }) as Photo;

test('지역별 사진첩: 여행의 지역마다 사진이 모이고, 여러 번 간 지역은 한 앨범 · 사진 많은 지역부터 · 여행 없는 사진은 빠짐', () => {
  const trips = [trip('g1', 2019, [G]), trip('g2', 2024, [G, B]), trip('b1', 2022, [B])];
  const photos = [photo('p1', 'g1'), photo('p2', 'g1'), photo('p3', 'g2', '2024-05-03T10:00'), photo('p4', 'b1'), photo('p5', null)];
  const a = albumsByRegion(trips, photos);
  assert.deepEqual(a.map((x) => [x.place.t === 'kr' ? x.place.code : '', x.photos.map((p) => p.id), x.trips]), [
    ['51150', ['p3', 'p1', 'p2'], 2], // 최근 여행 사진 먼저
    ['26', ['p3', 'p4'], 2],
  ]);
});
