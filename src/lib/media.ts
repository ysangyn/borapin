import { useEffect, useState } from 'react';
import media from '../data/media.json';
import type { Place } from './types';

/**
 * 앱을 꾸미는 여행지 사진·영상 (사용자 사진 아님). 위키미디어 공용의 자유 이용 자료를 줄여서 쓴다.
 * media.json엔 목록·크기·출처만 있고, 흐린 미리보기(data URL 230개, 58KB)는 media-blur.json에 따로 있다:
 * 첫 묶음을 가볍게 하려고 사진이 처음 뜰 때(useBlur) 받는다. 받기 전엔 lqip이 ''라 배경 없이 사진만 뜬다.
 */
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
  /** 아주 작은 흐린 미리보기 (data URL). media-blur.json을 받기 전엔 '' */
  readonly lqip: string;
  credit: Credit;
}
export interface VideoFiles {
  mp4: string;
  webm: string;
  poster: string;
  /** 흐린 미리보기 (data URL). 받기 전엔 '' */
  readonly lqip: string;
}
export interface SceneVideo extends VideoFiles {
  id: string;
  name: string;
  /** 세로 화면(폰)용 9:16 자른 판 */
  portrait?: VideoFiles;
  credit: Credit;
}

/** media-blur.json의 모양 (scripts/media-build.ts가 만든다) */
export interface BlurData { photos: Record<string, string>; videos: Record<string, { lqip: string; portrait?: string }> }

type RawPhoto = Omit<ScenePhoto, 'lqip'>;
type RawVideo = Omit<SceneVideo, 'lqip' | 'portrait'> & { portrait?: Omit<VideoFiles, 'lqip'> };

let blur: BlurData | null = null;
let blurLoading: Promise<BlurData | null> | null = null;
const listeners = new Set<() => void>();

/** 흐린 미리보기를 받는다 (한 번만, 실패하면 다음에 다시). 못 받아도 사진은 그대로 뜬다 */
export function loadBlur(): Promise<BlurData | null> {
  if (blur) return Promise.resolve(blur);
  blurLoading ??= import('../data/media-blur.json')
    .then((m) => { blur = m.default as BlurData; for (const f of listeners) f(); return blur; })
    .catch(() => { blurLoading = null; return null; });
  return blurLoading;
}
export const blurLoaded = () => !!blur;
/** 시험용: 받지 않고 바로 넣는다 */
export function setBlur(d: BlurData) { blur = d; for (const f of listeners) f(); }

/** 미리보기가 오면 다시 그리게 하는 훅. 처음 불릴 때 받기 시작한다. 돌려주는 값은 '받았는지' */
export function useBlur(): boolean {
  const [ok, setOk] = useState(() => !!blur);
  useEffect(() => {
    if (ok) return;
    let on = true;
    const tick = () => { if (on) setOk(true); };
    listeners.add(tick);
    void loadBlur();
    return () => { on = false; listeners.delete(tick); };
  }, [ok]);
  return ok;
}

/** 사진 목록(여행 네모·가고 싶은 곳 카드)이 쓰이기 시작하면 화면이 한가할 때 미리보기를 받아 둔다 (첫 그리기와 경쟁하지 않게) */
let idleAsked = false;
function blurWhenIdle() {
  if (idleAsked || blur || typeof window === 'undefined') return;
  idleAsked = true;
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(() => void loadBlur(), { timeout: 4000 });
  else window.setTimeout(() => void loadBlur(), 1500);
}

// lqip은 읽을 때마다 받아 둔 미리보기를 본다 (getter): 미리보기가 나중에 와도 같은 객체를 쓰는 화면이 다음 그리기에 바로 얻는다
export const PHOTOS: ScenePhoto[] = (media as { photos: RawPhoto[] }).photos.map((p) => ({ ...p, get lqip() { return blur?.photos[p.id] ?? ''; } }));
export const VIDEOS: SceneVideo[] = (media as { videos: RawVideo[] }).videos.map((v) => ({
  ...v,
  get lqip() { return blur?.videos[v.id]?.lqip ?? ''; },
  portrait: v.portrait ? { ...v.portrait, get lqip() { return blur?.videos[v.id]?.portrait ?? ''; } } : undefined,
}));
export const photoById = (id: string) => PHOTOS.find((p) => p.id === id) ?? null;
export const videoById = (id: string) => VIDEOS.find((v) => v.id === id) ?? null;

/** 그 지역 사진 (국내 칸 코드 또는 나라가 같으면) */
/** 장소 사진: 국내는 시·군, 해외는 도시가 맞는 것 → 없으면 그 나라의 아무 도시 사진 */
export function photoForPlace(p: Place): ScenePhoto | null {
  blurWhenIdle();
  if (p.t === 'kr') return PHOTOS.find((x) => x.place?.t === 'kr' && x.place.code === p.code) ?? null;
  const inCountry = PHOTOS.filter((x) => x.place?.t === 'country' && x.place.id === p.id);
  if (p.city) { const exact = inCountry.find((x) => x.place?.t === 'country' && x.place.city === p.city); if (exact) return exact; }
  return inCountry.find((x) => x.place?.t === 'country' && !x.place.city) ?? inCountry[0] ?? null;
}

/** 움직이는 그림을 아껴야 하는 기기 (데이터 절약·움직임 줄이기) */
export function preferStill(): boolean {
  if (typeof window === 'undefined') return true;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? ''));
}
