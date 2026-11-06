/**
 * 보라핀 사진함 · 0단계 훑기 (읽기만 한다 — 사진 파일은 하나도 바꾸지 않는다)
 *
 *   npx tsx desk/bin/scan.ts --root "D:/사진" --root "E:/백업" [--trips 여행목록.json] [--out 사진함-보고서]
 *
 * 결과: <out>/보고서.html (네 숫자·보관처·여행별·중복·모르는 사진) · <out>/인벤토리.csv (파일마다 한 줄)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { scanRoots } from '../src/scan';
import { renderReport } from '../src/report';
import { summarize, toCsv } from '../src/inventory';
import { parseTripsExport } from '../src/trips';
import { localMinute } from '../src/meta';

function args(argv: string[]) {
  const roots: string[] = [];
  let trips: string | null = null, out = '사진함-보고서';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) roots.push(resolve(argv[++i]));
    else if (argv[i] === '--trips' && argv[i + 1]) trips = resolve(argv[++i]);
    else if (argv[i] === '--out' && argv[i + 1]) out = resolve(argv[++i]);
    else if (!argv[i].startsWith('--')) roots.push(resolve(argv[i]));
  }
  return { roots, trips, out: resolve(out) };
}

async function main() {
  const a = args(process.argv.slice(2));
  if (!a.roots.length) {
    console.log('쓰는 법: npx tsx desk/bin/scan.ts --root "D:/사진" [--root "E:/백업"] [--trips 여행목록.json] [--out 사진함-보고서]');
    process.exit(1);
  }
  const trips = a.trips ? parseTripsExport(await readFile(a.trips, 'utf8')) : [];
  if (a.trips && !trips.length) console.log('여행 목록 파일을 읽지 못했어요 (보라핀 앱 → 우리 공간 → 여행 목록 내보내기로 받은 JSON인지 확인). 여행 없이 계속해요.');
  const t0 = Date.now();
  let last = 0;
  const items = await scanRoots(a.roots, {
    onProgress: (p) => {
      if (Date.now() - last < 500 && p.done !== p.found) return;
      last = Date.now();
      process.stdout.write(`\r훑는 중 ${p.root} · ${p.done}/${p.found}      `);
    },
  });
  process.stdout.write('\n');
  const s = summarize(items, trips);
  await mkdir(a.out, { recursive: true });
  const now = localMinute(new Date());
  await writeFile(join(a.out, '보고서.html'), renderReport(items, trips, { generatedAt: now, roots: a.roots }), 'utf8');
  await writeFile(join(a.out, '인벤토리.csv'), '\ufeff' + toCsv(items, trips), 'utf8');
  console.log(`사진 ${s.photos.toLocaleString()}장 · 여행 ${s.trips}번 · 중복 ${s.dupes.toLocaleString()}장 · 모르는 사진 ${s.unknown.toLocaleString()}장  (${((Date.now() - t0) / 1000).toFixed(0)}초)`);
  console.log(`보고서: ${join(a.out, '보고서.html')}`);
  console.log(`인벤토리: ${join(a.out, '인벤토리.csv')}`);
}

main().catch((e) => { console.error('훑기를 끝내지 못했어요:', e?.message ?? e); process.exit(1); });
