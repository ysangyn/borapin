import { REGION_BY_CODE } from './geo';
import type { Trip, Wish, When } from './types';

interface V22Entry {
  color?: string;
  dateY?: string | number;
  dateM?: string | number;
  dateD?: string | number;
  memo?: string;
  tags?: string[];
  photos?: unknown[];
}
interface V22Wish {
  code: string;
  name?: string;
  places?: string[];
  todos?: string[];
  foods?: string[];
  note?: string;
}

export interface ImportPlan {
  trips: { id: string; data: Omit<Trip, 'id'> }[];
  wishes: { id: string; data: Omit<Wish, 'id'> }[];
  skipped: string[];
  photoCount: number;
}

const num = (v: unknown) => {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function toWhen(e: V22Entry): When {
  const y = num(e.dateY), m = num(e.dateM), d = num(e.dateD);
  if (y && m && d) return { p: 'day', y, m, d };
  if (y && m) return { p: 'month', y, m };
  if (y) return { p: 'year', y };
  return { p: 'unknown' };
}

/** v22 '여지도_백업_*.json' 또는 'travel-날짜.json' 파일을 보라핀 기록으로 바꾼다 */
export function planV22Import(json: unknown): ImportPlan {
  if (!json || typeof json !== 'object') throw new Error('JSON 파일이 아니에요');
  const root = json as Record<string, unknown>;
  const tdata = (root.tdata && typeof root.tdata === 'object' ? root.tdata : root) as Record<string, V22Entry>;
  const wishlist = Array.isArray(root.wishlist) ? (root.wishlist as V22Wish[]) : [];
  const plan: ImportPlan = { trips: [], wishes: [], skipped: [], photoCount: 0 };
  let looked = 0;

  for (const [code, e] of Object.entries(tdata)) {
    if (!e || typeof e !== 'object') continue;
    looked++;
    const r = REGION_BY_CODE.get(code);
    if (!r) {
      plan.skipped.push(code);
      continue;
    }
    const visited = e.color && e.color !== '#reset';
    if (!visited) continue;
    plan.photoCount += Array.isArray(e.photos) ? e.photos.length : 0;
    const memo = (e.memo ?? '').trim();
    const firstLine = memo.split('\n')[0].trim();
    const title = firstLine && firstLine.length <= 24 ? firstLine : `${r.name} 여행`;
    plan.trips.push({
      id: `v22-${code}`,
      data: {
        title,
        kind: 'trip',
        status: 'done',
        when: toWhen(e),
        places: [{ t: 'kr', code }],
        companions: [],
        memo,
        tags: Array.isArray(e.tags) ? e.tags.filter((x) => typeof x === 'string').slice(0, 30) : [],
        source: 'v22',
        v: 1,
      },
    });
  }
  if (!looked) throw new Error('여행지도 백업 파일이 아니에요');

  wishlist.forEach((w, i) => {
    if (!w || !REGION_BY_CODE.get(w.code)) return;
    plan.wishes.push({
      id: `v22w-${w.code}`,
      data: {
        place: { t: 'kr', code: w.code },
        note: (w.note ?? '').trim(),
        todos: (w.todos ?? []).filter(Boolean),
        foods: (w.foods ?? []).filter(Boolean),
        spots: (w.places ?? []).filter(Boolean),
        priority: i < 3 ? i + 1 : null,
        source: 'v22',
        v: 1,
      },
    });
  });
  return plan;
}
