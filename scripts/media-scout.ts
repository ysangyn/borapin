/**
 * 꾸밈 사진·영상 후보 찾기 (CI에서만 실행: 위키미디어 공용 API)
 * - 장소마다 자유 이용 허락(CC0·퍼블릭 도메인·CC BY·CC BY-SA)된 큰 가로 사진을 찾아
 *   번호를 붙인 모아보기 그림(contact sheet)과 후보 목록(JSON)을 만든다.
 * - 영상은 구름·계곡·파도 반복 영상 후보를 찾아 한 장면씩 뽑아 모아 본다.
 * 사람이 모아보기를 보고 고른 것만 media-build에서 실제로 받는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const OUT = 'media-scout';
fs.mkdirSync(OUT, { recursive: true });
const UA = 'borapin-media-bot/1.0 (https://github.com/ysangyn/borapin)';
const API = 'https://commons.wikimedia.org/w/api.php';

interface Cand {
  title: string;
  url: string;
  thumb: string;
  w: number;
  h: number;
  mime: string;
  license: string;
  artist: string;
  desc: string;
  page: string;
}

const OK_LICENSE = /^(cc0|public domain|pd|cc by(-sa)? ?[0-9.]*)/i;
const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function api(params: Record<string, string>) {
  const u = new URL(API);
  for (const [k, v] of Object.entries({ format: 'json', origin: '*', ...params })) u.searchParams.set(k, v);
  for (let i = 0; i < 3; i++) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.ok) return r.json() as Promise<{ query?: { pages?: Record<string, { title: string; imageinfo?: { url: string; thumburl?: string; width: number; height: number; mime: string; descriptionshorturl?: string; extmetadata?: Record<string, { value: string }> }[] }> } }>;
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error(`API 실패 ${u}`);
}

async function search(q: string, kind: 'bitmap' | 'video', n = 40): Promise<Cand[]> {
  const j = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: `${q} filetype:${kind}`,
    gsrnamespace: '6',
    gsrlimit: String(n),
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: kind === 'video' ? '640' : '640',
  });
  const out: Cand[] = [];
  for (const p of Object.values(j.query?.pages ?? {})) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata ?? {};
    const license = strip(m.LicenseShortName?.value ?? '');
    if (!OK_LICENSE.test(license)) continue;
    if (/nc|nd/i.test(license.replace(/^cc by(-sa)?/i, ''))) continue;
    out.push({
      title: p.title,
      url: ii.url,
      thumb: ii.thumburl ?? ii.url,
      w: ii.width,
      h: ii.height,
      mime: ii.mime,
      license,
      artist: strip(m.Artist?.value ?? '').slice(0, 120),
      desc: strip(m.ImageDescription?.value ?? '').slice(0, 200),
      page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`,
    });
  }
  return out;
}

async function download(url: string): Promise<Buffer> {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
  }
  throw new Error(`받기 실패 ${url}`);
}

/** 번호 붙인 모아보기 (4칸 × n줄) */
async function sheet(name: string, items: { buf: Buffer; label: string }[]) {
  const W = 360, H = 240, COLS = 4;
  const rows = Math.ceil(items.length / COLS);
  const tiles = await Promise.all(
    items.map(async (it, i) => {
      const img = await sharp(it.buf).resize(W, H, { fit: 'cover' }).toBuffer();
      const tag = Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="${Math.max(44, it.label.length * 9 + 16)}" height="30" fill="rgba(0,0,0,0.65)"/><text x="8" y="21" font-size="18" font-family="sans-serif" fill="#fff">${it.label.replace(/[<&]/g, '')}</text></svg>`);
      return { input: await sharp(img).composite([{ input: tag }]).toBuffer(), left: (i % COLS) * W, top: Math.floor(i / COLS) * H };
    }),
  );
  await sharp({ create: { width: W * COLS, height: H * rows, channels: 3, background: '#222' } })
    .composite(tiles)
    .jpeg({ quality: 78 })
    .toFile(path.join(OUT, `${name}.jpg`));
}

// ---------- 사진 후보 ----------
const PLACES_ALL: { id: string; q: string[] }[] = [
  { id: 'jeju', q: ['Seongsan Ilchulbong', 'Seongsan Ilchulbong sunrise', 'Udo Jeju', 'Hyeopjae Beach', 'Sanbangsan', 'Seopjikoji', 'Jeju canola flowers', 'Jusangjeolli'] },
  { id: 'gangneung', q: ['Gangneung beach', 'Gyeongpo beach', 'Jumunjin'] },
  { id: 'gyeongju', q: ['Bulguksa', 'Donggung Palace Wolji Pond', 'Gyeongju Daereungwon'] },
  { id: 'jeonju', q: ['Jeonju Hanok Village'] },
  { id: 'yeosu', q: ['Yeosu night', 'Dolsan bridge Yeosu', 'Yeosu'] },
  { id: 'seorak', q: ['Seoraksan', 'Seoraksan autumn'] },
  { id: 'busan', q: ['Gamcheon Culture Village', 'Haeundae beach', 'Gwangan bridge'] },
  { id: 'namhae', q: ['Darangyi village Namhae', 'Namhae'] },
  { id: 'seoul', q: ['Gyeongbokgung', 'Bukchon Hanok Village'] },
  { id: 'andong', q: ['Hahoe Folk Village', 'Andong Hahoe'] },
  { id: 'tongyeong', q: ['Tongyeong harbor', 'Tongyeong Gangguan', 'Dongpirang', 'Tongyeong cable car', 'Mireuksan'] },
  { id: 'damyang', q: ['Juknokwon Damyang bamboo', 'Damyang'] },
  { id: 'suncheon', q: ['Suncheon Bay reed', 'Suncheonman'] },
  { id: 'danyang', q: ['Dodamsambong', 'Danyang'] },
];

const VIDEOS_ALL: { id: string; q: string[] }[] = [
  { id: 'clouds', q: ['clouds time-lapse', 'timelapse clouds sky', 'cloud timelapse mountain'] },
  { id: 'stream', q: ['brook forest', 'mountain creek', 'small waterfall forest', 'stream water rocks', 'Bach Wasser', 'river rapids calm', 'cascade forest stream'] },
  { id: 'waves', q: ['ocean waves beach', 'sea waves shore'] },
];

// 'npx tsx scripts/media-scout.ts jeju stream' 처럼 이름을 주면 그것만 다시 찾는다
const only = process.argv.slice(2);
const PLACES = PLACES_ALL.filter((p) => !only.length || only.includes(p.id));
const VIDEOS = VIDEOS_ALL.filter((v) => !only.length || only.includes(v.id));
// 행사·군사·사람 위주 사진은 뺀다
const NOISE = /coast guard|navy|uscgc|seminar|soldier|marine|military|conference|ceremony|raft|kayak|gopro|tsunami|forecast|hurricane|satellite/i;
const report: Record<string, Cand[]> = {};

for (const p of PLACES) {
  const seen = new Set<string>();
  let all: Cand[] = [];
  for (const q of p.q) {
    try {
      for (const c of await search(q, 'bitmap')) if (!seen.has(c.title)) { seen.add(c.title); all.push(c); }
    } catch (e) {
      console.warn(p.id, q, e);
    }
  }
  // 크고 가로로 긴 사진만, 큰 것부터
  all = all.filter((c) => !NOISE.test(c.title + ' ' + c.desc) && c.w >= 2000 && c.w / c.h >= 1.3 && c.w / c.h <= 2.2 && /jpeg|png/.test(c.mime)).sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 16);
  report[p.id] = all;
  const items: { buf: Buffer; label: string }[] = [];
  for (const [i, c] of all.entries()) {
    try {
      items.push({ buf: await download(c.thumb), label: `${p.id} ${i}` });
    } catch (e) {
      console.warn(e);
    }
  }
  if (items.length) await sheet(`photo-${p.id}`, items);
  console.log(`${p.id}: 후보 ${all.length}장`);
}

for (const v of VIDEOS) {
  const seen = new Set<string>();
  let all: Cand[] = [];
  for (const q of v.q) {
    try {
      for (const c of await search(q, 'video', 30)) if (!seen.has(c.title)) { seen.add(c.title); all.push(c); }
    } catch (e) {
      console.warn(v.id, q, e);
    }
  }
  all = all.filter((c) => !NOISE.test(c.title + ' ' + c.desc) && c.w >= 1280 && c.w > c.h).slice(0, 12);
  report[`video-${v.id}`] = all;
  const items: { buf: Buffer; label: string }[] = [];
  for (const [i, c] of all.entries()) {
    try {
      const file = path.join('/tmp', `scout-${v.id}-${i}`);
      // 너무 큰 원본(500MB 넘음)은 건너뛴다
      const head = await fetch(c.url, { method: 'HEAD', headers: { 'User-Agent': UA } });
      if (Number(head.headers.get('content-length') ?? 0) > 500 * 1024 * 1024) continue;
      fs.writeFileSync(file, await download(c.url));
      // 1초 지점 한 장면 (짧은 영상도 되게)
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1', '-i', file, '-frames:v', '1', `${file}.jpg`]);
      const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim();
      items.push({ buf: fs.readFileSync(`${file}.jpg`), label: `${v.id} ${i} ${Math.round(+dur)}s` });
      fs.rmSync(file);
      fs.rmSync(`${file}.jpg`);
    } catch (e) {
      console.warn(e);
    }
  }
  if (items.length) await sheet(`video-${v.id}`, items);
  console.log(`영상 ${v.id}: 후보 ${all.length}개`);
}

fs.writeFileSync(path.join(OUT, 'candidates.json'), JSON.stringify(report, null, 1));
