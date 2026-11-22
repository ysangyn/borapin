/**
 * 6걸음 공개 평 — 순수 함수 (firebase 없음, 단위 시험이 읽는다).
 * 무엇을 공개하나: 다녀온 가게의 내 한 줄, '또 갈래요 / 한 번이면 충분', 지역·종류·꼬리표, 별명, 달까지만.
 * 빠지는 것: '별로', 메모, 자리(위경도)·주소, 함께 간 사람, 여행 이름·날짜, 올린 시각. (docs/design/SPACES-PUBLIC.md 5절, firestore.rules pubReviews)
 */
import { placeKey } from './placeRef';
import type { PlaceRec, When } from './types';

/** '지금 여기'가 카카오 이름 대신 상가정보 이름을 쓰기 시작한 때 (11-22 KST 아침). 그 전 카카오 번호 기록은 이름이 카카오에서 왔을 수 있다 */
export const KAKAO_NAME_CUTOFF = Date.UTC(2026, 10, 21, 22, 0);

export const pubId = (key: string, uid: string) => `${key}_${uid}`;

/** 공개할 수 없으면 까닭(화면에 그대로), 되면 null */
export function pubBlock(rec: PlaceRec): string | null {
  if (rec.status === 'want') return '다녀온 가게만 공개할 수 있어요';
  if (rec.verdict !== 'again' && rec.verdict !== 'once') return "'또 갈래요'나 '한 번이면 충분'을 고르면 공개할 수 있어요";
  if (!placeKey(rec)) return '지금 여기 근처 목록이나 네이버 공유로 담은 가게만 공개할 수 있어요';
  return null;
}

/** 내 한 줄만 (이름이 같아도 쓴 사람 uid가 나여야) */
export function myLine(rec: PlaceRec, me: string, uid: string): string {
  const line = rec.reviews?.[me]?.trim() ?? '';
  if (!line) return '';
  const by = rec.reviewBy?.[me];
  return !by || by === uid ? line : '';
}

/** 카카오 가게 번호가 붙은 옛 기록은 이름이 카카오에서 왔을 수 있다 → 공개할 때 이름을 직접 다시 적는다 */
export function nameNeedsRetype(rec: PlaceRec): boolean {
  if (rec.ref?.src !== 'kakao') return false;
  const ms = (rec.createdAt as { toMillis?: () => number } | null | undefined)?.toMillis?.();
  return ms == null || ms < KAKAO_NAME_CUTOFF;
}

/** 공개에 적는 달: 여행이 있으면 여행 달, 없으면 남긴 달 */
export function monthOf(rec: PlaceRec, when: When | null | undefined, now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  if (when?.y && when.m) return `${when.y}-${pad(when.m)}`;
  const ms = (rec.createdAt as { toMillis?: () => number } | null | undefined)?.toMillis?.();
  const d = ms != null ? new Date(ms) : now;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export interface PubReview {
  placeKey: string; name: string; kind: PlaceRec['kind']; region?: PlaceRec['region']; tag?: string;
  verdict: 'again' | 'once'; line: string; nick: string; uid: string; spaceId: string; month: string;
  photos?: string[]; hidden: boolean; hiddenReason?: string; v: 1;
}

export function buildPub(rec: PlaceRec, o: { uid: string; nick: string; spaceId: string; name: string; line: string; month: string }): PubReview {
  const key = placeKey(rec)!;
  const region = rec.region?.t === 'kr' ? { t: 'kr' as const, code: rec.region.code }
    : rec.region?.t === 'country' ? { t: 'country' as const, id: rec.region.id, ...(rec.region.city ? { city: rec.region.city.slice(0, 40) } : {}) } : undefined;
  return {
    placeKey: key, name: o.name.trim().slice(0, 80), kind: rec.kind, ...(region ? { region } : {}), ...(rec.tag ? { tag: rec.tag.slice(0, 20) } : {}),
    verdict: rec.verdict as 'again' | 'once', line: o.line.trim().slice(0, 200), nick: o.nick.trim().slice(0, 10) || '보라핀',
    uid: o.uid, spaceId: o.spaceId, month: o.month, hidden: false, v: 1,
  };
}

export function summarize(list: readonly { uid: string; verdict: string }[], muted: Set<string>): { again: number; once: number } {
  const l = list.filter((r) => !muted.has(r.uid));
  return { again: l.filter((r) => r.verdict === 'again').length, once: l.filter((r) => r.verdict === 'once').length };
}
