import { fullPath, type Item } from './types';

export interface DupeGroup { sha: string; size: number; paths: string[]; roots: string[] }
export interface DupeResult {
  /** 서로 다른 사진 수 (해시 없는 파일은 각각 한 장으로) */
  unique: number;
  /** 같은 사진이 더 있는 파일 수 (= 파일 수 − 서로 다른 사진 수) */
  extraFiles: number;
  /** 겹치는 용량 (bytes) */
  extraBytes: number;
  groups: DupeGroup[];
}

/** 완전히 같은 파일(SHA-256)끼리 묶는다. 닮은 사진은 여기서 다루지 않는다 — 자동은 확실한 것만. */
export function groupDupes(items: Item[]): DupeResult {
  const by = new Map<string, Item[]>();
  let noSha = 0;
  for (const i of items) {
    if (!i.sha) { noSha++; continue; }
    by.set(i.sha, [...(by.get(i.sha) ?? []), i]);
  }
  const groups: DupeGroup[] = [];
  let extraFiles = 0, extraBytes = 0;
  for (const [sha, list] of by) {
    if (list.length < 2) continue;
    extraFiles += list.length - 1;
    extraBytes += list[0].size * (list.length - 1);
    groups.push({ sha, size: list[0].size, paths: list.map(fullPath), roots: [...new Set(list.map((i) => i.root))] });
  }
  groups.sort((a, b) => b.size * (b.paths.length - 1) - a.size * (a.paths.length - 1));
  return { unique: by.size + noSha, extraFiles, extraBytes, groups };
}

/** 같은 사진(해시)은 하나만 — 촬영 정보가 더 좋은 쪽(exif > filename > folder > mtime)을 대표로 */
export function uniquePhotos(items: Item[]): Item[] {
  const rank = { exif: 0, filename: 1, folder: 2, mtime: 3 } as const;
  const rep = new Map<string, Item>();
  items.forEach((i, n) => {
    const k = i.sha ?? `nosha:${n}`;
    const prev = rep.get(k);
    if (!prev || rank[i.takenFrom ?? 'mtime'] < rank[prev.takenFrom ?? 'mtime']) rep.set(k, i);
  });
  return [...rep.values()];
}
