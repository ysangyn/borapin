import type { Place, PlaceKind, PlaceRec, Verdict } from './types';
import { COUNTRY_BY_ID, REGION_BY_CODE } from './geo';
import { samePlace } from './wishes';

export const KINDS: { k: PlaceKind; label: string }[] = [
  { k: 'food', label: '맛집' },
  { k: 'cafe', label: '카페' },
  { k: 'sight', label: '볼거리' },
  { k: 'stay', label: '숙소' },
  { k: 'shop', label: '쇼핑' },
  { k: 'etc', label: '기타' },
];
export const KIND_LABEL = Object.fromEntries(KINDS.map((x) => [x.k, x.label])) as Record<PlaceKind, string>;

export const VERDICTS: { v: Verdict; label: string }[] = [
  { v: 'again', label: '또 갈래요' },
  { v: 'once', label: '한 번이면 충분' },
  { v: 'meh', label: '별로' },
];
export const VERDICT_LABEL = Object.fromEntries(VERDICTS.map((x) => [x.v, x.label])) as Record<Verdict, string>;

/** 장소 이름 + 지역으로 지도 검색 링크 (가게 정보는 저장하지 않고 그쪽 앱에서 본다) */
export function placeRecLinks(p: Pick<PlaceRec, 'name' | 'region' | 'naverUrl'>) {
  const area = p.region.t === 'kr'
    ? REGION_BY_CODE.get(p.region.code)?.name ?? ''
    : p.region.city ?? COUNTRY_BY_ID.get(p.region.id)?.name ?? '';
  const q = encodeURIComponent(`${area} ${p.name}`.trim());
  return {
    naver: p.naverUrl || `https://map.naver.com/p/search/${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}

/**
 * 네이버지도 '공유'로 받은 글을 붙여넣으면 이름·주소·링크를 뽑는다.
 * 예) "[네이버지도]\n진진\n서울 마포구 잔다리로 123\nhttps://naver.me/abcd"
 */
export function parseNaverShare(text: string): { name?: string; address?: string; url?: string } {
  const url = text.match(/https?:\/\/[^\s]+/)?.[0];
  const rest = text
    .replace(/https?:\/\/[^\s]+/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^\[?네이버\s?지도\]?$/.test(l) && !/^NAVER/i.test(l));
  const name = rest[0];
  const address = rest.slice(1).find((l) => /(시|도|군|구|읍|면|동|로|길)\s|\d/.test(l));
  return { name, address, url };
}

export const recsAt = (recs: PlaceRec[], where: Place) => recs.filter((r) => samePlace(r.region, where));
