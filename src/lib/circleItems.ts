/**
 * 모임 (docs/design/SPACES-PUBLIC.md 4절)의 순수한 부분: 가게 기록 → 모임에 거는 사본.
 * 사본에는 이름·종류·꼬리표·자리·내 한 줄 평·다시 간다면만. 메모·함께 간 사람·주소·메일·남의 평은 넣지 않는다.
 * (규칙 firestore.rules validCircleItem과 같은 칸·같은 길이)
 */
import { newSpaceId } from './spaceAccess';
import { placeKey } from './placeRef';
import type { PlaceRef } from './placeRef';
import type { Place, PlaceKind, Verdict } from './types';

/** 규칙으로 셀 수 없어 앱이 지키는 한도 */
export const CIRCLE_LIMITS = { people: 30, items: 500, myCircles: 5 } as const;

export interface CircleItem {
  key: string;
  name: string;
  kind: PlaceKind;
  tag?: string;
  lat?: number;
  lng?: number;
  region?: Place;
  verdict?: Verdict;
  line?: string;
  photos?: string[];
  placeKey?: string;
  by: { uid: string; nick: string };
  /** 건 사람의 공간 (손님은 null). 같은 공간 사람이 내려 줄 수 있게 */
  spaceId: string | null;
  at?: unknown;
  v: 1;
}

type PlaceLike = { id: string; v?: number; name?: string; kind?: PlaceKind; tag?: string; region?: Place; reviews?: Record<string, string>; verdict?: Verdict | null; ref?: PlaceRef | null; naverUrl?: string; lat?: number; lng?: number };

/** 같은 가게를 묶는 열쇠: 카카오·네이버 번호가 있으면 그것, 없으면 내 기록 번호('p' + id) */
export function itemKeyOf(p: { id: string; ref?: PlaceRef | null; naverUrl?: string }): string {
  return placeKey(p) ?? `p${p.id.replace(/[^A-Za-z0-9]/g, '').slice(0, 59)}`;
}

/** 문서 이름: '열쇠_내 uid' (한 사람이 한 가게를 한 번만) */
export const circleItemId = (key: string, uid: string) => `${key}_${uid}`;

export function circleItemFromPlace(p: PlaceLike, o: { uid: string; nick: string; me: string; spaceId: string | null }): CircleItem {
  const key = itemKeyOf(p);
  const pk = placeKey(p);
  const line = o.me ? p.reviews?.[o.me]?.trim() : '';
  return {
    key,
    name: (p.name ?? '').trim().slice(0, 80),
    kind: p.kind ?? 'etc',
    ...(p.tag?.trim() ? { tag: p.tag.trim().slice(0, 20) } : {}),
    ...(typeof p.lat === 'number' && typeof p.lng === 'number' ? { lat: p.lat, lng: p.lng } : {}),
    ...(p.region ? { region: p.region } : {}),
    ...(p.verdict ? { verdict: p.verdict } : {}),
    ...(line ? { line: line.slice(0, 200) } : {}),
    ...(pk ? { placeKey: pk } : {}),
    by: { uid: o.uid, nick: (o.nick.trim() || '나').slice(0, 10) },
    spaceId: o.spaceId,
    v: 1,
  };
}

/** 내가 건 것 먼저, 그다음 새것 순 */
export function mineFirst<T extends { by: { uid: string }; at?: unknown }>(list: T[], uid: string): T[] {
  const t = (x: T) => (typeof x.at === 'number' ? x.at : (x.at as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0);
  return [...list].sort((a, b) => (a.by.uid === uid) !== (b.by.uid === uid) ? (a.by.uid === uid ? -1 : 1) : t(b) - t(a));
}

/** 새 모임 이름표: 영문·숫자 20자 (규칙과 같은 모양) */
export const newCircleId = newSpaceId;
