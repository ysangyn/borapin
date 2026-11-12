/** 지금 여기 남기기의 '어떤 곳이에요?' 칩: 장소 종류 + (빵집·술집은) 내 지도 꼬리표 */
import type { PlaceKind } from './types';

export type HereKind = 'food' | 'cafe' | 'bakery' | 'bar' | 'shop' | 'sight' | 'etc';
export const HERE_KINDS: { k: HereKind; label: string; kind: PlaceKind; tag?: string }[] = [
  { k: 'food', label: '맛집', kind: 'food' },
  { k: 'cafe', label: '카페', kind: 'cafe' },
  { k: 'bakery', label: '빵집', kind: 'food', tag: '빵집' },
  { k: 'bar', label: '술집', kind: 'food', tag: '술집' },
  { k: 'shop', label: '가게·쇼핑', kind: 'shop' },
  { k: 'sight', label: '볼거리', kind: 'sight' },
  { k: 'etc', label: '기타', kind: 'etc' },
];

const BAKERY = /빵|베이커리|bakery|boulangerie|제과/i;
const CAFE = /카페|커피|cafe|coffee|로스터|디저트|티하우스/i;
const BAR = /술집|포차|호프|bar\b|pub|맥주|와인|이자카야|주점/i;

/** 이름이 먼저 (빵·커피·포차…), 그다음 근처 목록이 준 종류, 둘 다 없으면 맛집 */
export function hereKind(name: string, near: PlaceKind | null): HereKind {
  if (BAKERY.test(name)) return 'bakery';
  if (CAFE.test(name)) return 'cafe';
  if (BAR.test(name)) return 'bar';
  if (near === 'cafe' || near === 'shop' || near === 'sight' || near === 'etc') return near;
  return 'food';
}
