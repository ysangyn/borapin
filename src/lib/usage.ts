import type { Photo } from './types';

/** 무료(Spark) 요금제의 Firestore 저장 한도 */
export const FREE_DB_BYTES = 1024 ** 3;
/** 사진 한 장의 정보 문서·색인 등 덤 (어림값) */
const PER_PHOTO_EXTRA = 1500;
/** 여행·장소·가고 싶은 곳 문서 하나 (어림값) */
export const PER_RECORD = 2000;

export const usedBytes = (photos: Photo[], records = 0) =>
  photos.reduce((n, p) => n + (p.bytes ?? 0) + PER_PHOTO_EXTRA, 0) + records * PER_RECORD;

/** 남은 공간에 더 올릴 수 있는 사진 수 (올린 사진 평균으로, 없으면 400KB로 어림) */
export function photosLeft(photos: Photo[], records = 0): number {
  const avg = photos.length ? photos.reduce((n, p) => n + (p.bytes ?? 0), 0) / photos.length + PER_PHOTO_EXTRA : 400 * 1024;
  return Math.max(0, Math.floor((FREE_DB_BYTES - usedBytes(photos, records)) / avg));
}
