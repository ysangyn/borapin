import type { Item } from './types';

export interface VaultRow { root: string; files: number; bytes: number; /** 이 보관처에만 있는 사진 수 */ onlyHere: number }
export interface VaultResult {
  roots: VaultRow[];
  /** 사진(서로 다른 것) 단위: 두 보관처 이상에 있으면 안전, 한 곳뿐이면 위험 */
  byLevel: { safe: number; risky: number };
}

/** 보관처 표: 사진마다 몇 군데 보관처에 있는지 (같은 디스크 안의 중복은 보관처 하나로 센다) */
export function vaultTable(items: Item[]): VaultResult {
  const rootsOf = new Map<string, Set<string>>(); // 사진 키 → 보관처들
  const key = (i: Item, n: number) => i.sha ?? `nosha:${n}`;
  items.forEach((i, n) => rootsOf.set(key(i, n), new Set([...(rootsOf.get(key(i, n)) ?? []), i.root])));
  let safe = 0, risky = 0;
  const onlyHere = new Map<string, number>();
  for (const roots of rootsOf.values()) {
    if (roots.size >= 2) safe++;
    else { risky++; const r = [...roots][0]; onlyHere.set(r, (onlyHere.get(r) ?? 0) + 1); }
  }
  const rows = new Map<string, VaultRow>();
  for (const i of items) {
    const r = rows.get(i.root) ?? { root: i.root, files: 0, bytes: 0, onlyHere: onlyHere.get(i.root) ?? 0 };
    r.files++; r.bytes += i.size; rows.set(i.root, r);
  }
  return { roots: [...rows.values()], byLevel: { safe, risky } };
}
