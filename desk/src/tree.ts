import { groupDupes, uniquePhotos } from './dupes';
import { HINT_LABEL } from './inventory';
import { matchTrips, type DeskTrip } from './trips';
import type { Item } from './types';

/**
 * 서랍 나무: 사진이 어디 있든 그대로 둔 채, 탐색기 폴더처럼 보이게 가상으로 묶는다.
 *   여행 → 여행 하나 → 날짜 / 여행 아닌 사진 → 해 → 달 / 자료(스크린샷·받은 사진·다운로드) / 모르는 사진 / 중복 / 보관처
 * 같은 사진(해시)은 한 번만 넣고, 중복·보관처 서랍만 파일 기준이다. 빈 서랍은 만들지 않는다.
 */
export interface TreeNode {
  name: string;
  /** 이 서랍(아래 서랍 포함)의 사진 수 */
  count: number;
  children: TreeNode[];
  /** 이 서랍에 바로 든 사진 */
  files: Item[];
  /** 서랍 종류 (화면에서 아이콘·정렬에 씀) */
  kind: 'trips' | 'trip' | 'day' | 'notrip' | 'year' | 'month' | 'stuff' | 'unknown' | 'dupes' | 'dupe' | 'vaults' | 'vault' | 'bucket';
  /** 여행 서랍이면 여행 id */
  tripId?: string;
}

const node = (name: string, kind: TreeNode['kind'], extra: Partial<TreeNode> = {}): TreeNode => ({ name, count: 0, children: [], files: [], kind, ...extra });
const total = (n: TreeNode): number => (n.count = n.files.length + n.children.reduce((s, c) => s + total(c), 0));
const MONTH = (m: string) => `${Number(m)}월`;
const DAY = (d: string) => `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일`;

export function buildTree(items: Item[], trips: DeskTrip[]): TreeNode[] {
  const photos = uniquePhotos(items);
  const m = matchTrips(photos, trips);

  const tripsNode = node('여행', 'trips');
  const notrip = node('여행 아닌 사진', 'notrip');
  const stuff = node('자료', 'stuff');
  const unknown = node('모르는 사진', 'unknown');
  const whenUnk = node('언제 모름', 'bucket'), whereUnk = node('어디 모름', 'bucket');
  const byTrip = new Map<string, TreeNode>();
  const byYear = new Map<string, TreeNode>();
  const byHint = new Map<string, TreeNode>();

  photos.forEach((i, n) => {
    const when = !!i.taken && i.takenFrom !== 'mtime' && !i.received;
    const where = (i.lat != null && i.lng != null) || !!m[n].tripId;
    if (!when) whenUnk.files.push(i);
    if (!where) whereUnk.files.push(i);
    const hintName = i.received ? HINT_LABEL.received : i.hint ? HINT_LABEL[i.hint] : null;
    if (hintName) {
      const h = byHint.get(hintName) ?? node(hintName, 'bucket');
      h.files.push(i); byHint.set(hintName, h);
    }
    const tid = m[n].tripId;
    if (tid) {
      const t = trips.find((x) => x.id === tid)!;
      const tn = byTrip.get(tid) ?? node(`${tripLabel(t)} ${t.title}`, 'trip', { tripId: tid });
      byTrip.set(tid, tn);
      const day = i.taken && i.taken.length >= 10 ? i.taken.slice(0, 10) : null;
      if (day) {
        let dn = tn.children.find((c) => c.name === DAY(day));
        if (!dn) { dn = node(DAY(day), 'day'); tn.children.push(dn); }
        dn.files.push(i);
      } else tn.files.push(i);
      return;
    }
    if (hintName || !when) return; // 자료·언제 모르는 사진은 '여행 아닌 사진'에 또 넣지 않는다 (추정 날짜로 해에 꽂으면 헷갈린다)
    const y = i.taken!.slice(0, 4), mo = i.taken!.length >= 7 ? i.taken!.slice(5, 7) : null;
    const yn = byYear.get(y) ?? node(y, 'year');
    byYear.set(y, yn);
    if (mo) {
      let mn = yn.children.find((c) => c.name === MONTH(mo));
      if (!mn) { mn = node(MONTH(mo), 'month'); yn.children.push(mn); }
      mn.files.push(i);
    } else yn.files.push(i);
  });

  // 정렬: 여행은 최근 먼저, 날짜는 오름차순, 해·달은 최근 먼저
  const tripKey = (id: string) => { const t = trips.find((x) => x.id === id)!; return (t.when.y ?? 0) * 10000 + (t.when.m ?? 0) * 100 + (t.when.d ?? 0); };
  tripsNode.children = [...byTrip.entries()].sort((a, b) => tripKey(b[0]) - tripKey(a[0])).map(([, tn]) => { tn.children.sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true })); return tn; });
  notrip.children = [...byYear.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([, yn]) => { yn.children.sort((a, b) => Number.parseInt(b.name) - Number.parseInt(a.name)); return yn; });
  stuff.children = [...byHint.values()].sort((a, b) => b.files.length - a.files.length);
  unknown.children = [whenUnk, whereUnk].filter((c) => c.files.length);

  const d = groupDupes(items);
  const dupes = node('중복', 'dupes');
  dupes.children = d.groups.map((g) => { const n = node(g.paths[0].split('/').pop() ?? g.sha, 'dupe'); n.files = items.filter((i) => i.sha === g.sha); return n; });
  const vaults = node('보관처', 'vaults');
  const roots = new Map<string, TreeNode>();
  for (const i of items) { const v = roots.get(i.root) ?? node(i.root, 'vault'); v.files.push(i); roots.set(i.root, v); }
  vaults.children = [...roots.values()];

  const out = [tripsNode, notrip, stuff, unknown, dupes, vaults];
  for (const n of out) total(n);
  unknown.count = new Set([...whenUnk.files, ...whereUnk.files]).size; // 한 사진이 둘 다일 수 있어 합집합
  dupes.count = d.extraFiles; // '중복 n장' = 더 있는 파일 수
  vaults.count = vaults.children.length; // 보관처는 몇 곳인지
  return out.filter((n) => n.count > 0);
}

const tripLabel = (t: DeskTrip) => {
  const w = t.when;
  return w.m ? `${w.y}-${String(w.m).padStart(2, '0')}` : String(w.y ?? '');
};

/** 나무를 경로 문자열로 납작하게 (검색·CSV) */
export function flatten(nodes: TreeNode[], prefix = ''): { path: string; count: number; files: Item[]; kind: TreeNode['kind'] }[] {
  const out: { path: string; count: number; files: Item[]; kind: TreeNode['kind'] }[] = [];
  for (const n of nodes) {
    const path = prefix ? `${prefix}/${n.name}` : n.name;
    out.push({ path, count: n.count, files: n.files, kind: n.kind });
    out.push(...flatten(n.children, path));
  }
  return out;
}
