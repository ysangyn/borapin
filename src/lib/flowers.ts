import flowers from '../data/flowers.json';
import kinds from '../data/flower-kinds.json';
import type { Place } from './types';

/**
 * 꽃 도감 (설계서 C2): 국내는 시·군의 꽃(시화·군화), 세계는 나라꽃. 그림은 public/art/flowers/<icon>.svg (scripts/flowers-build.ts).
 * 자료가 없는 곳은 들꽃.
 */
export interface FlowerKind { name: string; petal: string; mid: string }
export interface Flower { name: string; icon: string; /** 공식 시화가 아닐 때 (예: 지정 폐지) */ note?: string }
const F = flowers as { kr: Record<string, Flower>; world: Record<string, Flower> };
export const KINDS = kinds as Record<string, FlowerKind>;
export const WILD: Flower = { name: '들꽃', icon: 'wild' };

export function flowerOf(place: Place): Flower | null {
  const f = place.t === 'kr' ? F.kr[place.code] : F.world[place.id];
  return f ? { name: f.name, icon: KINDS[f.icon] ? f.icon : 'wild', ...(f.note ? { note: f.note } : {}) } : null;
}
export const flowerSrc = (icon: string, style: '' | '-ink' | '-gray' = '') => `/art/flowers/${KINDS[icon] ? icon : 'wild'}${style}.svg`;
export const krFlowerCount = () => Object.keys(F.kr).length;
export const worldFlowers = () => F.world;
export const krFlowers = () => F.kr;
