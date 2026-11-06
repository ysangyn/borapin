import { groupDupes, uniquePhotos } from './dupes';
import { matchTrips, type DeskTrip } from './trips';
import { fullPath, type Item } from './types';

export interface Summary {
  /** 파일 수 */
  files: number;
  /** 서로 다른 사진 수 */
  photos: number;
  /** 같은 사진이 더 있는 파일 수 */
  dupes: number;
  dupeBytes: number;
  /** 사진이 한 장이라도 붙은 여행 수 */
  trips: number;
  /** 언제를 모름(수정 시각으로 추정했거나 없음) */
  unknownWhen: number;
  /** 어디를 모름(GPS도 없고 여행도 못 찾음) */
  unknownWhere: number;
  /** 언제 또는 어디를 모르는 사진(파일 수 아닌 사진 수가 아니라, 파일 기준) */
  unknown: number;
  bytes: number;
  byKind: Record<string, number>;
  byTakenFrom: Record<string, number>;
  byTrip: { id: string; title: string; files: number; sure: number }[];
  byYear: { year: string; files: number }[];
}

const CONF_LABEL = { sure: '확실', guess: '추정', weak: '약한 추정' } as const;
const FROM_LABEL: Record<string, string> = { exif: '촬영 정보', filename: '파일 이름', folder: '폴더 이름', mtime: '수정 시각(추정)' };
const HINT_LABEL: Record<string, string> = { screenshot: '스크린샷', received: '받은 사진', download: '다운로드' };

export function summarize(items: Item[], trips: DeskTrip[]): Summary {
  const d = groupDupes(items);
  // 언제·어디·여행은 '사진' 단위(같은 사진은 하나로), 파일 수·용량·종류는 파일 단위
  const photos = uniquePhotos(items);
  const m = matchTrips(photos, trips);
  const byKind: Record<string, number> = {}, byTakenFrom: Record<string, number> = {};
  const tripRows = new Map<string, { id: string; title: string; files: number; sure: number }>();
  const years = new Map<string, number>();
  let unknownWhen = 0, unknownWhere = 0, unknown = 0, bytes = 0;
  for (const i of items) { bytes += i.size; byKind[i.kind] = (byKind[i.kind] ?? 0) + 1; }
  photos.forEach((i, n) => {
    byTakenFrom[i.takenFrom ?? 'none'] = (byTakenFrom[i.takenFrom ?? 'none'] ?? 0) + 1;
    const when = !!i.taken && i.takenFrom !== 'mtime' && !i.received;
    const where = (i.lat != null && i.lng != null) || !!m[n].tripId;
    if (!when) unknownWhen++;
    if (!where) unknownWhere++;
    if (!when || !where) unknown++;
    if (i.taken && when) years.set(i.taken.slice(0, 4), (years.get(i.taken.slice(0, 4)) ?? 0) + 1);
    const tid = m[n].tripId;
    if (tid) {
      const t = trips.find((x) => x.id === tid)!;
      const r = tripRows.get(tid) ?? { id: tid, title: t.title, files: 0, sure: 0 };
      r.files++; if (m[n].confidence === 'sure') r.sure++; tripRows.set(tid, r);
    }
  });
  return {
    files: items.length, photos: d.unique, dupes: d.extraFiles, dupeBytes: d.extraBytes, trips: tripRows.size,
    unknownWhen, unknownWhere, unknown, bytes, byKind, byTakenFrom,
    byTrip: [...tripRows.values()].sort((a, b) => b.files - a.files),
    byYear: [...years].sort().map(([year, files]) => ({ year, files })),
  };
}

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** 인벤토리 CSV: 프로그램이 없어도 엑셀로 열어 볼 수 있게 (명령줄 도구가 앞에 BOM을 붙여 엑셀이 한글을 바로 읽게 한다) */
export function toCsv(items: Item[], trips: DeskTrip[]): string {
  const m = matchTrips(items, trips);
  const head = ['경로', '보관처', '크기', '해시', '촬영', '근거', '시간대', '위도', '경도', '카메라', '여행', '여행 확신', '출처', '종류'];
  const rows = items.map((i, n) => {
    const t = m[n].tripId ? trips.find((x) => x.id === m[n].tripId) : null;
    return [fullPath(i), i.root, i.size, i.sha ?? '', i.taken ?? '', FROM_LABEL[i.takenFrom ?? ''] ?? '', i.tz ?? '', i.lat ?? '', i.lng ?? '', i.camera ?? '', t?.title ?? '', m[n].confidence ? CONF_LABEL[m[n].confidence!] : '', i.received ? '받은 사진' : (HINT_LABEL[i.hint ?? ''] ?? ''), i.kind].map(csvCell).join(',');
  });
  return [head.join(','), ...rows].join('\n');
}

export { CONF_LABEL, FROM_LABEL, HINT_LABEL };
