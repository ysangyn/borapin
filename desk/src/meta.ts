import { open, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import exifr from 'exifr';
import { dateFromFilename, dateFromFolder, extKind, sourceHint } from './names';
import type { Item } from './types';

const p2 = (n: number) => String(n).padStart(2, '0');
export const localMinute = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;

export type FileMeta = Pick<Item, 'taken' | 'takenFrom' | 'tz' | 'lat' | 'lng' | 'camera' | 'hint' | 'received' | 'size' | 'mtime'>;

/**
 * 파일 하나의 촬영 정보. 근거의 사다리: EXIF → 파일 이름 → 폴더 이름 → 수정 시각.
 * 어디서 읽었는지(takenFrom)를 늘 남긴다. 파일은 읽기만 한다.
 */
export async function readFileMeta(path: string): Promise<FileMeta> {
  const st = await stat(path);
  const out: FileMeta = { taken: null, takenFrom: null, tz: null, lat: null, lng: null, camera: null, hint: sourceHint(path), received: false, size: st.size, mtime: localMinute(st.mtime) };
  const kind = extKind(path);
  if (kind === 'photo' || kind === 'raw') {
    try {
      // 큰 파일도 앞부분만 읽으면 EXIF는 대부분 나온다 (2MB)
      const buf = await readHead(path, Math.min(st.size, 2 * 1024 * 1024));
      const t = await exifr.parse(buf, { pick: ['DateTimeOriginal', 'CreateDate', 'OffsetTimeOriginal', 'Make', 'Model'], reviveValues: false, gps: true }).catch(() => null);
      const raw: unknown = t?.DateTimeOriginal ?? t?.CreateDate;
      const m = typeof raw === 'string' ? raw.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/) : null;
      if (m && m[1] !== '0000') { out.taken = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`; out.takenFrom = 'exif'; }
      out.tz = typeof t?.OffsetTimeOriginal === 'string' ? t.OffsetTimeOriginal : null;
      const make = String(t?.Make ?? '').trim(), model = String(t?.Model ?? '').trim();
      out.camera = model ? (model.toLowerCase().startsWith(make.toLowerCase()) || !make ? model : `${make} ${model}`) : null;
      const g = await exifr.gps(buf).catch(() => null);
      if (g && Number.isFinite(g.latitude) && Number.isFinite(g.longitude) && !(g.latitude === 0 && g.longitude === 0)) {
        out.lat = Math.round(g.latitude * 1e5) / 1e5;
        out.lng = Math.round(g.longitude * 1e5) / 1e5;
      }
    } catch {
      /* EXIF 없음·못 읽음 */
    }
  }
  if (!out.taken) {
    const n = dateFromFilename(basename(path));
    if (n) { out.taken = n.taken; out.takenFrom = 'filename'; out.received = !!n.received; }
  }
  if (!out.taken) {
    const f = dateFromFolder(path);
    if (f) { out.taken = f.taken; out.takenFrom = 'folder'; }
  }
  if (!out.taken) { out.taken = out.mtime; out.takenFrom = 'mtime'; }
  if (!out.received && out.hint === 'received') out.received = true;
  return out;
}

async function readHead(path: string, n: number): Promise<Buffer> {
  if (n <= 0) return Buffer.alloc(0);
  const fh = await open(path, 'r');
  try {
    const buf = Buffer.alloc(n);
    const { bytesRead } = await fh.read(buf, 0, n, 0);
    return bytesRead === n ? buf : buf.subarray(0, bytesRead);
  } finally {
    await fh.close();
  }
}
