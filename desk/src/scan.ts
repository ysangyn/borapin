import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { quickHashFile, sha256File } from './hash';
import { readFileMeta } from './meta';
import { extKind, extOf, SKIP_DIR } from './names';
import type { Item } from './types';

export interface ScanProgress { root: string; done: number; found: number; path?: string }

/** 보관처(루트 폴더)들을 훑어 Item 목록을 만든다. 읽기만 한다. */
export async function scanRoots(roots: string[], opts: { onProgress?: (p: ScanProgress) => void; sha?: 'all' | 'dupes-only' } = {}): Promise<Item[]> {
  const sha = opts.sha ?? 'all';
  const items: Item[] = [];
  for (const root of roots) {
    const files: string[] = [];
    await walk(root, files);
    let done = 0;
    for (const path of files) {
      const kind = extKind(path);
      if (!kind) continue;
      try {
        const meta = await readFileMeta(path);
        const quick = await quickHashFile(path);
        items.push({ root, rel: relative(root, path).replace(/\\/g, '/'), kind, ext: extOf(path), quick, sha: null, ...meta });
      } catch {
        /* 못 읽는 파일은 건너뛴다 (잠김·권한) */
      }
      done++;
      opts.onProgress?.({ root, done, found: files.length, path });
    }
  }
  // 전체 해시: 빠른 해시가 같은 것끼리만(중복 후보) 또는 전부
  const byQuick = new Map<string, Item[]>();
  for (const i of items) byQuick.set(i.quick, [...(byQuick.get(i.quick) ?? []), i]);
  for (const group of byQuick.values()) {
    if (sha === 'dupes-only' && group.length < 2) continue;
    for (const i of group) {
      try { i.sha = await sha256File(join(i.root, i.rel)); } catch { i.sha = null; }
    }
  }
  return items;
}

async function walk(dir: string, out: string[]) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (SKIP_DIR.test(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile()) out.push(p);
  }
}
