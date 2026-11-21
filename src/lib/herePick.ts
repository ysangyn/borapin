/**
 * '지금 여기'에서 근처 목록의 한 곳을 고를 때, 무엇을 기록으로 남기나 — 순수 함수.
 *
 * 카카오 정책 (데브톡 답변 2026): 로컬 API의 장소명·주소·좌표는 저장해 다시 쓸 수 없다. 사용자가 확인을 눌러도 같다.
 * 장소 ID와 카카오맵 링크는 저장해도 된다. 그래서
 *  - 카카오에서 고른 곳: 카카오 장소 번호 + 내 폰 위치. 이름·주소는 상가정보(공공데이터)와 맞으면 그 값.
 *  - 관광공사 목록: 공공데이터라 그대로 남긴다.
 * docs/kakao-devtalk-question.md 참고.
 */
import type { NearbyItem } from './nearby';
import type { PlaceKind } from './types';
import { guessKind } from './hereKinds';
import { refFromNearbyId, type PlaceRef } from './placeRef';

/**
 * 상가정보와 못 맞췄을 때 카카오 이름을 이름 칸에 채워 둘지 (사람이 고칠 수 있음).
 * 상가정보 활용 신청이 승인되어 매칭이 돌기 시작하면 false로 바꾼다 — docs/ROADMAP.md '지금 여기 카카오 정책'
 */
export const KAKAO_NAME_UNTIL_MATCH = false; // 11-22 상가정보 활용 승인·확인(resultCode 00) → 끔

export type Pos = { lat: number; lng: number };
export type Pick = { name: string; kind: PlaceKind; tag: string; pos: Pos | null; addr?: string; ref?: PlaceRef | null };
/** 소상공인시장진흥공단 상가(상권)정보에서 찾은 같은 가게 (worker/src/storeMatch.ts) */
export interface StoreMatch { id: string; name: string; addr?: string; lat: number; lng: number }

/**
 * @param kakaoNameOk 상가정보와 못 맞췄을 때 카카오 이름을 이름 칸에 채워 둘지.
 *   상가정보 활용 신청이 승인되기 전까지만 잠시 true (docs/ROADMAP.md), 승인 뒤 false로 바꾼다.
 */
export function pickFromItem(it: NearbyItem, me: Pos | null, match: StoreMatch | null | undefined, kakaoNameOk: boolean): Pick {
  // 종류 짐작은 고르는 그 순간에만 쓰고 남기지 않는다 (남는 건 보라핀의 종류·꼬리표)
  const k = guessKind(`${it.name} ${it.type}`, it.kind);
  const ref = refFromNearbyId(it.id);
  if (ref?.src !== 'kakao') return { name: it.name, ...k, pos: { lat: it.lat, lng: it.lng }, addr: it.addr, ref: null };
  if (match) return { name: match.name.slice(0, 80), ...k, pos: { lat: match.lat, lng: match.lng }, ...(match.addr ? { addr: match.addr.slice(0, 200) } : {}), ref };
  return { name: kakaoNameOk ? it.name : '', ...k, pos: me, ref };
}
