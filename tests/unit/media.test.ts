import { test } from 'node:test';
import assert from 'node:assert/strict';
import media from '../../src/data/media.json' with { type: 'json' };
import blurJson from '../../src/data/media-blur.json' with { type: 'json' };
import { blurLoaded, loadBlur, photoById, PHOTOS, VIDEOS, videoById } from '../../src/lib/media';

type Photo = { id: string; name: string; src: { s: string; l: string }; w: number; h: number; credit: { title: string; license: string; page: string } };
type Video = { id: string; mp4: string; webm: string; poster: string; portrait?: { mp4: string; webm: string; poster: string } };
const photos = (media as { photos: Photo[] }).photos;
const videos = (media as { videos: Video[] }).videos;
const blur = blurJson as { photos: Record<string, string>; videos: Record<string, { lqip: string; portrait?: string }> };
const dataUrl = /^data:image\/webp;base64,[A-Za-z0-9+/=]+$/;

test('media.json엔 흐린 미리보기가 없다 (목록·크기·출처만, 첫 묶음을 가볍게)', () => {
  assert.ok(photos.length > 0);
  for (const p of photos) {
    assert.ok(!('lqip' in p), `${p.id}에 lqip이 남아 있어요 — scripts/media-build.ts가 media-blur.json으로 뺀다`);
    assert.ok(p.src.s && p.src.l && p.w > 0 && p.h > 0 && p.credit.title && p.credit.page, p.id);
  }
  for (const v of videos) {
    assert.ok(!('lqip' in v) && !(v.portrait && 'lqip' in v.portrait), `${v.id}에 lqip이 남아 있어요`);
  }
});

test('media-blur.json의 키가 media.json과 정확히 맞는다 (빠진 것도 남은 것도 없음)', () => {
  assert.deepEqual(Object.keys(blur.photos).sort(), photos.map((p) => p.id).sort());
  assert.deepEqual(Object.keys(blur.videos).sort(), videos.map((v) => v.id).sort());
  for (const [id, v] of Object.entries(blur.photos)) assert.match(v, dataUrl, id);
  for (const v of videos) {
    const b = blur.videos[v.id];
    assert.match(b.lqip, dataUrl, v.id);
    if (v.portrait) assert.match(b.portrait ?? '', dataUrl, `${v.id} 세로 판`);
    else assert.equal(b.portrait, undefined);
  }
});

test('lqip은 미리보기를 받기 전엔 빈 글자, 받은 뒤엔 같은 객체에서 바로 읽힌다', async () => {
  const jeju = photoById(photos[0].id)!;
  const clouds = videoById(videos[0].id);
  assert.equal(blurLoaded(), false);
  assert.equal(jeju.lqip, '');
  if (clouds) { assert.equal(clouds.lqip, ''); assert.equal(clouds.portrait?.lqip ?? '', ''); }
  const got = await loadBlur();
  assert.ok(got && blurLoaded());
  assert.equal(jeju.lqip, blur.photos[jeju.id]);
  assert.ok(PHOTOS.every((p) => p.lqip === blur.photos[p.id]));
  if (clouds) {
    assert.equal(clouds.lqip, blur.videos[clouds.id].lqip);
    assert.equal(clouds.portrait?.lqip, blur.videos[clouds.id].portrait);
  }
  assert.equal(VIDEOS.length, videos.length);
});
