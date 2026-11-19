/**
 * 지금 여기 남기기의 종류 짐작: 담기 화면(PlaceEdit)과 똑같은 종류(KINDS)·꼬리표(TAG_SUGGEST)로.
 * 이름이 먼저 (빵·커피·포차…), 그다음 근처 목록이 준 종류, 둘 다 없으면 맛집.
 */
import type { PlaceKind } from './types';

const BAKERY = /빵|베이커리|bakery|boulangerie|제과/i;
const BRUNCH = /브런치|brunch/i;
const CAFE = /카페|커피|cafe|coffee|로스터|디저트|티하우스/i;
const BAR = /술집|포차|호프|bar\b|pub|맥주|와인|이자카야|주점/i;
const PROPS = /소품샵|소품/;

export function guessKind(name: string, near: PlaceKind | null): { kind: PlaceKind; tag: string } {
  if (BAKERY.test(name)) return { kind: 'food', tag: '빵집' };
  if (BRUNCH.test(name)) return { kind: 'food', tag: '브런치' };
  if (CAFE.test(name)) return { kind: 'cafe', tag: '' };
  if (BAR.test(name)) return { kind: 'food', tag: '술집' };
  if (PROPS.test(name)) return { kind: 'shop', tag: '소품샵' };
  if (near && near !== 'food') return { kind: near, tag: '' };
  return { kind: 'food', tag: '' };
}
