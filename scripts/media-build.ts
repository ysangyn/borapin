/**
 * 고른 꾸밈 사진·영상 만들기 (CI에서만 실행)
 * media/picks.json에 적은 위키미디어 공용 파일만 받아서
 * - 사진: 1280·640px WebP + 아주 작은 흐린 미리보기
 * - 영상: 이어 붙여도 티 나지 않는 반복 영상(끝과 처음을 겹쳐 녹임), 가로 1280px·세로 720px MP4·WebM, 소리 없음 + 정지 사진
 * 결과는 public/media/와 src/data/media.json(출처 포함)에 쓴다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const UA = 'borapin-media-bot/1.0 (https://github.com/ysangyn/borapin)';
const API = 'https://commons.wikimedia.org/w/api.php';
const OUT = 'public/media';
const PREVIEW = path.join(OUT, 'preview');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(PREVIEW, { recursive: true });

interface Pick {
  id: string;
  title: string;
  name: string;
  place?: { t: 'kr'; code: string } | { t: 'country'; id: string };
  /** 영상: 시작 초, 길이 초 */
  start?: number;
  dur?: number;
  /** 영상: 세로(폰)로 자를 때 가로 위치 0(왼쪽)~1(오른쪽), 기본 가운데 */
  px?: number;
  /** 사진: 잘라낼 때 남길 쪽 */
  focus?: 'center' | 'top' | 'bottom' | 'attention';
}
const picks = JSON.parse(fs.readFileSync('media/picks.json', 'utf8')) as { photos: Pick[]; videos: Pick[] };
const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function info(title: string, width?: number) {
  const u = new URL(API);
  const params: Record<string, string> = { action: 'query', format: 'json', origin: '*', titles: title, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata' };
  if (width) params.iiurlwidth = String(width);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const j = (await (await fetch(u, { headers: { 'User-Agent': UA } })).json()) as { query: { pages: Record<string, { imageinfo?: { url: string; thumburl?: string; width: number; height: number; extmetadata?: Record<string, { value: string }> }[] }> } };
  const ii = Object.values(j.query.pages)[0]?.imageinfo?.[0];
  if (!ii) throw new Error(`파일 없음: ${title}`);
  const m = ii.extmetadata ?? {};
  return {
    url: ii.url,
    thumb: ii.thumburl ?? ii.url,
    w: ii.width,
    h: ii.height,
    credit: {
      title: title.replace(/^File:/, ''),
      artist: strip(m.Artist?.value ?? '').slice(0, 120) || '작자 미상',
      license: strip(m.LicenseShortName?.value ?? ''),
      page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
    },
  };
}

async function download(url: string, file?: string): Promise<Buffer> {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) {
      const b = Buffer.from(await r.arrayBuffer());
      if (file) fs.writeFileSync(file, b);
      return b;
    }
    await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
  }
  throw new Error(`받기 실패 ${url}`);
}

const lqip = async (buf: Buffer) => `data:image/webp;base64,${(await sharp(buf).resize(24).webp({ quality: 40 }).toBuffer()).toString('base64')}`;
const kb = (f: string) => `${Math.round(fs.statSync(f).size / 1024)}KB`;

const out: { photos: unknown[]; videos: unknown[] } = { photos: [], videos: [] };

for (const p of picks.photos) {
  try {
    const i = await info(p.title, 1920);
    const src = await download(i.thumb);
    const pos = p.focus === 'top' ? 'top' : p.focus === 'bottom' ? 'bottom' : p.focus === 'attention' ? sharp.strategy.attention : 'centre';
    // 3:2로 맞춰 잘라 같은 틀에서 보기 좋게
    const l = await sharp(src).rotate().resize(1280, 853, { fit: 'cover', position: pos }).webp({ quality: 74 }).toBuffer();
    const s = await sharp(src).rotate().resize(640, 427, { fit: 'cover', position: pos }).webp({ quality: 70 }).toBuffer();
    fs.writeFileSync(path.join(OUT, `${p.id}-l.webp`), l);
    fs.writeFileSync(path.join(OUT, `${p.id}-s.webp`), s);
    fs.writeFileSync(path.join(PREVIEW, `photo-${p.id}.jpg`), await sharp(l).resize(640).jpeg({ quality: 75 }).toBuffer());
    out.photos.push({ id: p.id, name: p.name, place: p.place, src: { s: `/media/${p.id}-s.webp`, l: `/media/${p.id}-l.webp` }, w: 1280, h: 853, lqip: await lqip(s), credit: i.credit });
    console.log(`사진 ${p.id}: ${kb(path.join(OUT, `${p.id}-l.webp`))} / ${kb(path.join(OUT, `${p.id}-s.webp`))} · ${i.credit.license}`);
  } catch (e) {
    console.error(`사진 ${p.id} 실패`, e);
  }
}

const ff = (args: string[]) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

for (const v of picks.videos) {
  try {
    const i = await info(v.title);
    const raw = path.join('/tmp', `raw-${v.id}`);
    await download(i.url, raw);
    const S = v.start ?? 0, D = v.dur ?? 8, F = 1.2;
    const loop = path.join('/tmp', `loop-${v.id}.mkv`);
    // [머리 0..F] [몸 F..D] [꼬리 D..D+F]: 꼬리를 머리로 서서히 녹여 맨 앞에 두면 끝→처음이 이어진다
    ff([
      '-ss', String(S), '-t', String(D + F), '-i', raw, '-an',
      '-filter_complex',
      `[0:v]fps=24,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,split=3[a][b][c];` +
        `[a]trim=0:${F},setpts=PTS-STARTPTS[head];[b]trim=${F}:${D},setpts=PTS-STARTPTS[body];[c]trim=${D}:${D + F},setpts=PTS-STARTPTS[tail];` +
        `[tail][head]blend=all_expr='A*(1-T/${F})+B*(T/${F})'[mix];[mix][body]concat=n=2:v=1[out]`,
      '-map', '[out]', '-c:v', 'ffv1', loop,
    ]);
    // 가로(PC) 1280×720, 세로(폰) 9:16 가운데 자르기 406×720: 원본 화소를 그대로 써서 흐려지지 않게
    const make = async (suffix: string, crop?: string) => {
      const vf = crop ? ['-vf', crop] : [];
      const mp4 = path.join(OUT, `${v.id}${suffix}.mp4`), webm = path.join(OUT, `${v.id}${suffix}.webm`), poster = path.join(OUT, `${v.id}${suffix}.webp`);
      ff(['-i', loop, ...vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
      ff(['-i', loop, ...vf, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', webm]);
      const png = path.join('/tmp', `${v.id}${suffix}-first.png`);
      ff(['-i', loop, ...vf, '-frames:v', '1', png]);
      const first = fs.readFileSync(png);
      fs.writeFileSync(poster, await sharp(first).webp({ quality: 74 }).toBuffer());
      // 확인용: 처음·가운데·끝 장면
      for (const [k, t] of [['a', 0.1], ['b', D / 2], ['c', D - 0.1]] as const) {
        ff(['-ss', String(t), '-i', mp4, '-frames:v', '1', path.join(PREVIEW, `video-${v.id}${suffix}-${k}.jpg`)]);
      }
      console.log(`영상 ${v.id}${suffix}: mp4 ${kb(mp4)} · webm ${kb(webm)} · 정지 ${kb(poster)}`);
      return { mp4: `/media/${v.id}${suffix}.mp4`, webm: `/media/${v.id}${suffix}.webm`, poster: `/media/${v.id}${suffix}.webp`, lqip: await lqip(first) };
    };
    const wide = await make('');
    const tall = await make('-p', `crop=406:720:${Math.round((1280 - 406) * (v.px ?? 0.5))}:0`);
    out.videos.push({ id: v.id, name: v.name, ...wide, portrait: tall, credit: i.credit });
    console.log(`영상 ${v.id}: ${i.credit.license}`);
    fs.rmSync(raw);
  } catch (e) {
    console.error(`영상 ${v.id} 실패`, e);
  }
}

fs.writeFileSync('src/data/media.json', JSON.stringify(out, null, 1));
console.log(`사진 ${out.photos.length}장, 영상 ${out.videos.length}개`);
