import { useEffect, useMemo, useState } from 'react';
import { collection, count, doc, getAggregateFromServer, getDocFromCache, getDocs, onSnapshot, query, serverTimestamp, sum, updateDoc, where, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { dataDoc, forgetPhotoUrl, MAX_DATA_BYTES, primePhotoUrl, toBytes } from './photoData';
import { queued } from './writes';
import { displayName } from './auth';
import { locate } from './geodata';
import { countByTrip, useTripCount } from './tripExtras';
import { syncShareAfterWrite } from './share';
import type { Photo, Place, Trip, When } from './types';
import { samePlace } from './wishes';

const photosCol = () => collection(db, 'spaces', SPACE_ID, 'photos');

const byTaken = (a: Photo, b: Photo) => (a.taken ?? '').localeCompare(b.taken ?? '');

/** 한 여행의 사진 수만 (홈 단계 카드): 사진을 받지 않고 서버에서 센다 — 읽기 1회 */
export const countTripPhotos = (tripId: string) => countByTrip(photosCol, tripId);
export const useTripPhotoCount = (tripId: string | undefined) => useTripCount(photosCol, tripId);

/** 모든 사진을 한 번 읽는다 (물어보기: 첫 질문 때. 오프라인이면 기기 캐시에서). 촬영 순 */
export const readPhotosOnce = async (): Promise<Photo[]> => (await getDocs(photosCol())).docs.map((d) => ({ id: d.id, ...d.data() }) as Photo).sort(byTaken);

/** 한 여행의 사진만 (여행 상세) */
export function useTripPhotos(tripId: string | undefined) {
  const [state, setState] = useState<{ tripId?: string; items: Photo[] | null }>({ items: null });
  useEffect(() => {
    if (!tripId) return;
    return onSnapshot(
      query(photosCol(), where('tripId', '==', tripId)),
      (snap) => setState({ tripId, items: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Photo).sort(byTaken) }),
      () => setState({ tripId, items: [] }),
    );
  }, [tripId]);
  return state.tripId === tripId ? state.items : null;
}

/** 저장 공간 확인용: 사진 수와 용량을 서버에서 세기만 한다 (사진 목록을 받지 않음) */
export async function photoUsage(): Promise<{ count: number; bytes: number }> {
  const r = await getAggregateFromServer(photosCol(), { bytes: sum('bytes'), n: count() });
  return { count: r.data().n, bytes: r.data().bytes ?? 0 };
}

export function usePhotos() {
  const [items, setItems] = useState<Photo[] | null>(null);
  useEffect(() => onSnapshot(photosCol(), (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Photo)), () => setItems([])), []);
  const sorted = useMemo(() => (items ? [...items].sort(byTaken) : null), [items]);
  return { photos: sorted };
}

export interface PhotoMeta {
  taken: string | null;
  tz: string | null;
  takenGuess: boolean;
  lat: number | null;
  lng: number | null;
  camera: string | null;
}

/** 원본에서 촬영 정보 읽기 (압축하면 지워지므로 먼저 읽는다) */
export async function readMeta(file: File): Promise<PhotoMeta> {
  let taken: string | null = null, tz: string | null = null, camera: string | null = null;
  let lat: number | null = null, lng: number | null = null;
  // 사진을 올릴 때만 필요해 그때 불러온다
  const exifr = (await import('exifr')).default;
  try {
    const t = await exifr.parse(file, { pick: ['DateTimeOriginal', 'CreateDate', 'OffsetTimeOriginal', 'Make', 'Model'], reviveValues: false });
    const raw: string | undefined = t?.DateTimeOriginal ?? t?.CreateDate;
    const m = typeof raw === 'string' ? raw.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/) : null;
    if (m && m[1] !== '0000') taken = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
    tz = typeof t?.OffsetTimeOriginal === 'string' ? t.OffsetTimeOriginal : null;
    const make = (t?.Make ?? '').trim(), model = (t?.Model ?? '').trim();
    camera = model ? (model.toLowerCase().startsWith(make.toLowerCase()) || !make ? model : `${make} ${model}`) : null;
  } catch {
    /* 촬영 정보 없음 */
  }
  try {
    const g = await exifr.gps(file);
    if (g && Number.isFinite(g.latitude) && Number.isFinite(g.longitude) && !(g.latitude === 0 && g.longitude === 0)) {
      lat = Math.round(g.latitude * 1e5) / 1e5;
      lng = Math.round(g.longitude * 1e5) / 1e5;
    }
  } catch {
    /* 위치 없음 */
  }
  let takenGuess = false;
  if (!taken && file.lastModified) {
    const d = new Date(file.lastModified);
    const p = (n: number) => String(n).padStart(2, '0');
    taken = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    takenGuess = true;
  }
  return { taken, tz, takenGuess, lat, lng, camera };
}

/** 사진 열기 (회전 정보 반영) */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  } catch {
    throw new Error('이 브라우저에서 열 수 없는 사진 형식이에요 (HEIC는 휴대폰에서 올려 주세요)');
  }
}

/** 긴 변을 maxSide로 줄인 JPEG */
async function encode(bmp: ImageBitmap, maxSide: number, quality: number): Promise<{ blob: Blob; w: number; h: number }> {
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('압축 실패'))), 'image/jpeg', quality));
  return { blob, w, h };
}

/** 크게 보기용: 1600px부터, 문서 한도(1MB)에 맞을 때까지 조금씩 줄인다 */
const LARGE_STEPS: [number, number][] = [[1600, 0.8], [1600, 0.7], [1280, 0.7], [1024, 0.65]];
const LARGE_SOFT = 600 * 1024;

async function encodeLarge(bmp: ImageBitmap) {
  let last: Awaited<ReturnType<typeof encode>> | null = null;
  for (const [side, q] of LARGE_STEPS) {
    last = await encode(bmp, side, q);
    if (last.blob.size <= LARGE_SOFT) return last;
  }
  if (last && last.blob.size <= MAX_DATA_BYTES) return last;
  throw new Error('사진이 너무 커서 올리지 못했어요');
}

/** 사진 한 장 올리기: 촬영 정보 → 압축본·미리보기 → Firestore에 한 번에 저장 */
export async function uploadPhoto(file: File, tripId: string | null, user: User, onProgress?: (f: number) => void): Promise<Photo> {
  const meta = await readMeta(file);
  onProgress?.(0.1);
  const bmp = await decode(file);
  let large, small;
  try {
    large = await encodeLarge(bmp);
    small = await encode(bmp, 400, 0.72);
  } finally {
    bmp.close();
  }
  onProgress?.(0.4);
  const id = doc(photosCol()).id;
  const place = meta.lat != null && meta.lng != null ? await locate(meta.lng, meta.lat).catch(() => null) : null;
  const data: Omit<Photo, 'id'> = {
    tripId,
    w: large.w,
    h: large.h,
    taken: meta.taken,
    tz: meta.tz,
    takenGuess: meta.takenGuess,
    // 위치는 100m 단위로만 남긴다 (시·군 찾기는 원래 값으로 이미 했음)
    lat: meta.lat != null ? Math.round(meta.lat * 1e3) / 1e3 : null,
    lng: meta.lng != null ? Math.round(meta.lng * 1e3) / 1e3 : null,
    place,
    camera: meta.camera,
    bytes: large.blob.size + small.blob.size,
    v: 1,
  };
  const batch = writeBatch(db);
  batch.set(dataDoc(id, 'l'), { photoId: id, tripId, kind: 'l', data: await toBytes(large.blob), size: large.blob.size, public: false, v: 1 });
  batch.set(dataDoc(id, 't'), { photoId: id, tripId, kind: 't', data: await toBytes(small.blob), size: small.blob.size, public: false, v: 1 });
  batch.set(doc(photosCol(), id), {
    ...JSON.parse(JSON.stringify(data)),
    createdBy: { uid: user.uid, email: user.email ?? '', name: displayName(user) },
    createdAt: serverTimestamp(),
  });
  // 올리자마자 다시 받지 않도록 화면 캐시에 먼저 넣어 둔다
  primePhotoUrl(id, 't', small.blob);
  primePhotoUrl(id, 'l', large.blob);
  onProgress?.(0.6);
  await batch.commit();
  onProgress?.(1);
  // 공개 링크가 켜진 여행이면 사본에도 새 사진이 들어가게 (실패해도 조용히)
  syncShareAfterWrite(tripId);
  return { id, ...data };
}

export async function deletePhoto(p: Photo) {
  const batch = writeBatch(db);
  batch.delete(dataDoc(p.id, 'l'));
  batch.delete(dataDoc(p.id, 't'));
  batch.delete(doc(photosCol(), p.id));
  await batch.commit();
  forgetPhotoUrl(p.id);
  syncShareAfterWrite(p.tripId);
}

/** 사진 설명 저장 (슬라이드쇼 등 어디서든). 그 여행이 공개 중이면 사본의 설명도 따라간다 */
export async function captionPhoto(id: string, caption: string) {
  const ref = doc(photosCol(), id);
  await queued(updateDoc(ref, { caption: caption.trim().slice(0, 500) }));
  // 어느 여행 사진인지는 캐시에서 (보고 있던 사진이라 이미 있다, 읽기 0)
  const tripId = await getDocFromCache(ref).then((s) => (s.data()?.tripId as string | null | undefined) ?? null, () => null);
  syncShareAfterWrite(tripId);
}

// ---------- 사진으로 여행 채우기 ----------
const ymd = (t: string) => ({ y: +t.slice(0, 4), m: +t.slice(5, 7), d: +t.slice(8, 10) });

/** 사진 촬영일로 여행 날짜 제안 (정확한 날짜가 아직 없을 때만) */
export function suggestWhen(trip: Trip, photos: Photo[]): When | null {
  if (trip.when.p === 'day' && trip.when.d) return null;
  const dates = photos.filter((p) => p.taken && !p.takenGuess).map((p) => p.taken!.slice(0, 10)).sort();
  if (!dates.length) return null;
  const a = ymd(dates[0]), b = ymd(dates[dates.length - 1]);
  const w: When = { p: 'day', y: a.y, m: a.m, d: a.d, est: true };
  if (dates[0] !== dates[dates.length - 1]) Object.assign(w, { y2: b.y, m2: b.m, d2: b.d });
  return w;
}

/** 사진 위치 중 여행 장소에 없는 곳 */
export function suggestPlaces(trip: Trip, photos: Photo[]): Place[] {
  const out: Place[] = [];
  for (const p of photos) {
    const pl = p.place;
    if (!pl) continue;
    if (trip.places.some((x) => samePlace(x, pl)) || out.some((x) => samePlace(x, pl))) continue;
    out.push(pl);
  }
  return out;
}

/** '2019-05-03T14:20' → '2019.5.3 14:20' */
export function takenLabel(p: Photo): string {
  if (!p.taken) return '';
  const { y, m, d } = ymd(p.taken);
  return `${y}.${m}.${d} ${p.taken.slice(11, 16)}${p.takenGuess ? ' (추정)' : ''}`;
}
