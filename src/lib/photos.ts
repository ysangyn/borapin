import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import type { User } from 'firebase/auth';
import exifr from 'exifr';
import { db, SPACE_ID, storage } from './firebase';
import { displayName } from './auth';
import { locate } from './geodata';
import type { Photo, Place, Trip, When } from './types';
import { samePlace } from './wishes';

const photosCol = () => collection(db, 'spaces', SPACE_ID, 'photos');
const folder = (id: string) => `spaces/${SPACE_ID}/photos/${id}`;

export function usePhotos() {
  const [items, setItems] = useState<Photo[] | null>(null);
  useEffect(() => onSnapshot(photosCol(), (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Photo))), []);
  const sorted = useMemo(() => (items ? [...items].sort((a, b) => (a.taken ?? '').localeCompare(b.taken ?? '')) : null), [items]);
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

/** 긴 변을 maxSide로 줄인 JPEG */
async function compress(file: File, maxSide: number, quality: number): Promise<{ blob: Blob; w: number; h: number }> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  } catch {
    throw new Error('이 브라우저에서 열 수 없는 사진 형식이에요 (HEIC는 휴대폰에서 올려 주세요)');
  }
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('압축 실패'))), 'image/jpeg', quality));
  return { blob, w, h };
}

function put(path: string, blob: Blob, onProgress?: (f: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, path), blob, { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' });
    task.on('state_changed', (s) => onProgress?.(s.bytesTransferred / s.totalBytes), reject, () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
  });
}

/** 사진 한 장 올리기: 촬영 정보 → 압축본·미리보기 → 저장소 → 기록 */
export async function uploadPhoto(file: File, tripId: string | null, user: User, onProgress?: (f: number) => void): Promise<Photo> {
  const meta = await readMeta(file);
  const large = await compress(file, 2000, 0.82);
  const small = await compress(file, 480, 0.74);
  const id = doc(photosCol()).id;
  const url = await put(`${folder(id)}/l.jpg`, large.blob, (f) => onProgress?.(f * 0.9));
  const thumb = await put(`${folder(id)}/t.jpg`, small.blob);
  onProgress?.(1);
  const place = meta.lat != null && meta.lng != null ? await locate(meta.lng, meta.lat).catch(() => null) : null;
  const data: Omit<Photo, 'id'> = {
    tripId,
    url,
    thumb,
    w: large.w,
    h: large.h,
    taken: meta.taken,
    tz: meta.tz,
    takenGuess: meta.takenGuess,
    lat: meta.lat,
    lng: meta.lng,
    place,
    camera: meta.camera,
    bytes: large.blob.size + small.blob.size,
    v: 1,
  };
  await setDoc(doc(photosCol(), id), {
    ...JSON.parse(JSON.stringify(data)),
    createdBy: { uid: user.uid, email: user.email ?? '', name: displayName(user) },
    createdAt: serverTimestamp(),
  });
  return { id, ...data };
}

export async function deletePhoto(p: Photo) {
  await Promise.all(['l.jpg', 't.jpg'].map((f) => deleteObject(ref(storage, `${folder(p.id)}/${f}`)).catch(() => undefined)));
  await deleteDoc(doc(photosCol(), p.id));
}

export async function captionPhoto(id: string, caption: string) {
  await updateDoc(doc(photosCol(), id), { caption: caption.trim() });
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
