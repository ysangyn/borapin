import { placeLabel } from './geo';
import type { Place, TripInput } from './types';

// ---------- 편집 화면 저장: 고친 칸만 (여행·장소·가고 싶은 곳이 같이 쓴다. Firebase를 모르는 순수 코드라 단위 시험이 된다) ----------

/** '이 칸을 지워라' 표시. data.ts가 Firestore의 deleteField()로 바꾼다 */
export const DELETE: unique symbol = Symbol('delete');
/** 보낼 칸 하나. path는 ['memo'] 또는 ['reviews', '보라']처럼 안쪽 칸까지 */
export interface Edit { path: string[]; value: unknown }

const sameValue = (x: unknown, y: unknown) => JSON.stringify(x ?? null) === JSON.stringify(y ?? null);
const blank = (v: unknown) => v === undefined || v === '';
const copy = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const asMap = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});

/**
 * 편집 화면을 연 때의 문서(opened)와 저장하려는 폼 값(form)을 견줘 고친 칸만 고른다.
 * opened는 반드시 '화면을 열 때 잡아 둔 스냅샷'(폼 초기값의 바탕)이어야 한다.
 * 실시간 최신 문서를 넘기면 그사이 상대가 고친 칸이 내 옛 값으로 덮인다.
 * - 값이 같은 칸(없음·null·빈 글은 같은 것으로)은 보내지 않는다 → 내가 안 건드린 칸은 상대 것이 그대로 남는다.
 * - 비운 선택 칸은 지운다(DELETE). 연 때도 없던 칸은 보내지 않는다.
 * - perPerson 칸(한 줄 평처럼 이름별 칸)은 통째로 보내지 않고 바뀐 이름 칸만 점 경로(reviews.이름)로 보낸다.
 *   지우는 건 내 이름(me) 칸뿐: 남의 한 줄 평은 내 화면에 없어도, 비워도 지우지 않는다.
 */
export function editsOf(opened: object, form: object, opts: { perPerson?: string[]; me?: string } = {}): Edit[] {
  const a = opened as Record<string, unknown>;
  const b = form as Record<string, unknown>;
  const out: Edit[] = [];
  for (const k of Object.keys(b)) {
    if (opts.perPerson?.includes(k)) {
      const ov = asMap(a[k]);
      const nv = asMap(b[k]);
      for (const who of new Set([...Object.keys(ov), ...Object.keys(nv)])) {
        if (sameValue(ov[who], nv[who])) continue;
        if (blank(nv[who])) {
          if (who === opts.me && !blank(ov[who])) out.push({ path: [k, who], value: DELETE });
          continue;
        }
        out.push({ path: [k, who], value: copy(nv[who]) });
      }
      continue;
    }
    if (sameValue(a[k], b[k])) continue;
    if (blank(b[k])) {
      if (!blank(a[k]) && a[k] !== null) out.push({ path: [k], value: DELETE });
      continue;
    }
    out.push({ path: [k], value: copy(b[k]) });
  }
  return out;
}

/** Firestore Timestamp처럼 toMillis()가 있는 값 (피드·정렬이 이것으로 시각을 읽는다) */
export const isTimestampLike = (v: unknown): boolean => !!v && typeof v === 'object' && typeof (v as { toMillis?: unknown }).toMillis === 'function';

/**
 * 되돌리기(지운 것 다시 넣기)용 문서: Firestore가 안 받는 undefined 칸만 빼고 Timestamp(createdAt 등)는 그대로 둔다.
 * JSON으로 복사하면 Timestamp가 일반 객체가 돼 되돌린 항목이 피드·정렬에서 빠진다.
 */
export function restoreFields<T extends object>(o: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    out[k] = isTimestampLike(v) ? v : copy(v);
  }
  return out;
}

/** '다녀왔어요' 한 번으로 꽂는 핀: 날짜 없이 장소만 (지도 창·장소 남기기에서 같이 쓴다) */
export const quickTripInput = (place: Place, companions: string[]): TripInput => ({
  title: `${placeLabel(place)} 여행`,
  kind: 'trip',
  status: 'done',
  when: { p: 'unknown' },
  places: [place],
  companions,
  memo: '',
  tags: [],
  source: 'app',
});
