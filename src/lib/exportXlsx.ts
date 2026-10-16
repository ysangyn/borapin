import { formatWhen } from './dates';
import { placeLong } from './geo';
import { KIND_LABEL, VERDICT_LABEL } from './placeRecs';
import { monthsLabel, seasonFor, type SeasonData } from './seasons';
import type { TravelInfo } from './travelinfo';
import type { Photo, PlaceRec, Trip, Wish } from './types';
import { REGIONS } from './geo';
import { memberNames } from './members';

type Cell = { value: string | number; fontWeight?: 'bold' } | null;

const head = (cols: string[]): Cell[] => cols.map((c) => ({ value: c, fontWeight: 'bold' as const }));
const v = (x: string | number | undefined | null): Cell => (x === undefined || x === null || x === '' ? null : { value: x });

/** 엑셀 내보내기: 여행 · 우리 장소 · 가고 싶은 곳 · 여행정보를 시트별로 */
export async function exportXlsx(d: { trips: Trip[]; recs: PlaceRec[]; wishes: Wish[]; photos: Photo[]; info: TravelInfo; seasons: SeasonData | null }): Promise<Blob> {
  const { default: writeXlsxFile } = await import('write-excel-file');
  const trips: Cell[][] = [
    head(['제목', '종류', '상태', '언제', '장소', '함께', '메모', '사진']),
    ...d.trips.map((t) => [
      v(t.title), v(t.kind === 'outing' ? '나들이' : '여행'), v(t.status === 'planned' ? '예정' : '다녀옴'), v(formatWhen(t.when)),
      v(t.places.map(placeLong).join(', ')), v(t.companions.join(', ')), v(t.memo), v(d.photos.filter((p) => p.tripId === t.id).length),
    ]),
  ];
  // 한 줄 평 칸: 지금 멤버 + 예전에 평을 남긴 사람
  const writers = [...new Set([...memberNames(), ...d.recs.flatMap((r) => Object.keys(r.reviews ?? {}))])];
  const recs: Cell[][] = [
    head(['이름', '종류', '지역', '다시 간다면', ...writers, '네이버지도', '주소', '메모']),
    ...d.recs.map((r) => [
      v(r.name), v(KIND_LABEL[r.kind]), v(placeLong(r.region)), v(r.verdict ? VERDICT_LABEL[r.verdict] : ''),
      ...writers.map((w) => v(r.reviews?.[w])), v(r.naverUrl), v(r.address), v(r.memo),
    ]),
  ];
  const wishes: Cell[][] = [
    head(['장소', '가게·명소', '원해요', '우선순위', '가볼 곳', '해볼 것', '먹을 것', '가기 좋은 때', '링크', '메모']),
    ...d.wishes.map((w) => {
      const s = seasonFor(d.seasons, w.place, w.months);
      return [
        v(placeLong(w.place)), v(w.spotName), v((w.wantedBy ?? []).join(', ')), v(w.priority ? `${w.priority}순위` : ''),
        v(w.spots.join(', ')), v(w.todos.join(', ')), v(w.foods.join(', ')), v(s ? monthsLabel(s.m) : ''), v((w.links ?? []).join(' ')), v(w.note),
      ];
    }),
  ];
  const info: Cell[][] = [
    head(['지역', '구·군·섬', '테마', '볼거리', '먹거리', '특산물', '교통', '가기 좋은 때']),
    ...REGIONS.flatMap((r) => {
      const c = d.info.cells[r.code];
      if (!c) return [];
      const s = seasonFor(d.seasons, { t: 'kr', code: r.code });
      const row = (e: typeof c.main, sub: string): Cell[] => [
        v(placeLong({ t: 'kr', code: r.code })), v(sub), v(e.theme), v(e.spots.join(', ')), v(e.foods.join(', ')), v(e.goods.join(', ')), v(e.transport.join(', ')), v(s ? monthsLabel(s.m) : ''),
      ];
      return [row(c.main, ''), ...c.subs.map((x) => row(x, x.name))];
    }),
  ];
  const w = (n: number[]) => n.map((width) => ({ width }));
  return writeXlsxFile([trips, recs, wishes, info] as never, {
    sheets: ['여행', '우리 장소', '가고 싶은 곳', '여행정보'],
    columns: [w([24, 8, 8, 18, 28, 18, 40, 6]), w([22, 8, 18, 12, 30, 30, 30, 30, 30]), w([20, 16, 12, 8, 30, 30, 30, 14, 30, 30]), w([16, 12, 30, 50, 50, 30, 30, 14])] as never,
  }) as unknown as Promise<Blob>;
}

export function saveBlob(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
