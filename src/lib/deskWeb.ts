import { readMeta } from './photos';
import { dateFromFilename, extKind, extOf, sourceHint } from '../../desk/src/names';
import type { Item } from '../../desk/src/types';

/**
 * 폰·브라우저에서 고른 사진을 사진함의 Item으로 — 모두 폰 안에서, 아무것도 올리지 않는다.
 * PC 훑기(desk/src/meta.ts)와 같은 사다리: 촬영 정보 → 파일 이름 → 수정 시각.
 */
export async function itemFromFile(file: File): Promise<Item | null> {
  const kind = extKind(file.name);
  if (!kind) return null;
  const meta = kind === 'video' ? { taken: null, tz: null, takenGuess: true, lat: null, lng: null, camera: null } : await readMeta(file);
  const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
  const p2 = (n: number) => String(n).padStart(2, '0');
  const d = new Date(file.lastModified || Date.now());
  const mtime = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
  let taken: string | null = null, takenFrom: Item['takenFrom'] = null, received = false;
  if (meta.taken && !meta.takenGuess) { taken = meta.taken; takenFrom = 'exif'; }
  else {
    const n = dateFromFilename(file.name);
    if (n) { taken = n.taken; takenFrom = 'filename'; received = !!n.received; }
    else { taken = mtime; takenFrom = 'mtime'; }
  }
  const hint = sourceHint('/' + rel) ?? (/^Screenshot_/i.test(file.name) ? 'screenshot' : null);
  if (hint === 'received') received = true;
  const sha = await sha256(file);
  return { root: '폰', rel, size: file.size, mtime, kind, ext: extOf(file.name), quick: sha ? sha.slice(0, 24) : `nosha:${file.name}:${file.size}`, sha, taken, takenFrom, tz: meta.tz, lat: meta.lat, lng: meta.lng, camera: meta.camera, hint, received };
}

async function sha256(file: File): Promise<string | null> {
  try {
    const buf = await file.arrayBuffer();
    const h = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

/** 여러 장을 몇 개씩 나눠 읽는다 (폰 메모리 생각해서) */
export async function itemsFromFiles(files: File[], onProgress?: (done: number) => void, lanes = 3): Promise<Item[]> {
  const out: (Item | null)[] = new Array(files.length).fill(null);
  let next = 0, done = 0;
  const run = async () => {
    while (next < files.length) {
      const i = next++;
      out[i] = await itemFromFile(files[i]).catch(() => null);
      done++;
      onProgress?.(done);
    }
  };
  await Promise.all(Array.from({ length: Math.min(lanes, files.length) }, run));
  return out.filter((x): x is Item => !!x);
}
