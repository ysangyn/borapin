import media from '../data/media.json';
import type { Place } from './types';

/** 앱을 꾸미는 여행지 사진·영상 (사용자 사진 아님). 위키미디어 공용의 자유 이용 자료를 줄여서 쓴다. */
export interface Credit { title: string; artist: string; license: string; page: string }
export interface ScenePhoto {
  id: string;
  /** 이 사진이 보여 주는 곳 (국내 시·군 코드 또는 나라) */
  place?: Place;
  name: string;
  /** 640·1280px WebP */
  src: { s: string; l: string };
  w: number;
  h: number;
  /** 아주 작은 흐린 미리보기 (data URL) */
  lqip: string;
  credit: Credit;
}
export interface SceneVideo {
  id: string;
  name: string;
  mp4: string;
  webm: string;
  poster: string;
  lqip: string;
  credit: Credit;
}

export const PHOTOS = (media as { photos: ScenePhoto[] }).photos;
export const VIDEOS = (media as { videos: SceneVideo[] }).videos;
export const photoById = (id: string) => PHOTOS.find((p) => p.id === id) ?? null;
export const videoById = (id: string) => VIDEOS.find((v) => v.id === id) ?? null;

/** 그 지역 사진 (국내 칸 코드 또는 나라가 같으면) */
export function photoForPlace(p: Place): ScenePhoto | null {
  return PHOTOS.find((x) => x.place && (p.t === 'kr' ? x.place.t === 'kr' && x.place.code === p.code : x.place.t === 'country' && x.place.id === p.id)) ?? null;
}

/** 움직이는 그림을 아껴야 하는 기기 (데이터 절약·움직임 줄이기) */
export function preferStill(): boolean {
  if (typeof window === 'undefined') return true;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? ''));
}
