import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { setPhotosPublic } from './photoData';
import { patchTrip } from './data';
import { formatWhen } from './dates';
import type { Photo, PlaceRec, SharedTrip, Trip } from './types';

const shareDoc = (token: string) => doc(db, 'shares', token);

export function buildShared(trip: Trip, photos: Photo[], recs: PlaceRec[]): Omit<SharedTrip, 'updatedAt'> {
  return {
    title: trip.title,
    when: formatWhen(trip.when),
    places: trip.places,
    photos: photos.slice(0, 60).map((p) => ({ id: p.id, w: p.w, h: p.h, taken: p.taken, ...(p.caption ? { caption: p.caption } : {}) })),
    spots: recs.map((r) => ({ name: r.name, kind: r.kind, verdict: r.verdict ?? null })),
    space: '보라 & 영상',
    v: 1,
  };
}

/** 공개 사본에 들어간 사진만 로그인 없이 읽히게 하고, 빠진 사진은 다시 닫는다 */
async function publish(token: string, trip: Trip, photos: Photo[], recs: PlaceRec[]) {
  const prev = await getDoc(shareDoc(token)).catch(() => null);
  const before = new Set<string>(prev?.exists() ? ((prev.data() as SharedTrip).photos ?? []).map((p) => p.id).filter(Boolean) : []);
  const data = buildShared(trip, photos, recs);
  const now = new Set(data.photos.map((p) => p.id));
  const exists = new Set(photos.map((p) => p.id));
  await setPhotosPublic([...now].filter((id) => !before.has(id)), true);
  await setDoc(shareDoc(token), { ...data, updatedAt: serverTimestamp() });
  await setPhotosPublic([...before].filter((id) => !now.has(id) && exists.has(id)), false);
}

export async function enableShare(trip: Trip, photos: Photo[], recs: PlaceRec[]): Promise<string> {
  const token = trip.share?.token ?? Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
  await publish(token, trip, photos, recs);
  await patchTrip(trip.id, { share: { token } });
  return token;
}

/** 공개 중인 여행이 바뀌면 사본도 맞춘다 */
export async function syncShare(trip: Trip, photos: Photo[], recs: PlaceRec[]) {
  if (!trip.share?.token) return;
  await publish(trip.share.token, trip, photos, recs);
}

export async function disableShare(trip: Trip, photos: Photo[]) {
  if (trip.share?.token) {
    const prev = await getDoc(shareDoc(trip.share.token)).catch(() => null);
    const ids = prev?.exists() ? ((prev.data() as SharedTrip).photos ?? []).map((p) => p.id).filter(Boolean) : [];
    await deleteDoc(shareDoc(trip.share.token)).catch(() => undefined);
    const exists = new Set(photos.map((p) => p.id));
    await setPhotosPublic(ids.filter((id) => exists.has(id)), false);
  }
  await patchTrip(trip.id, { share: null });
}

export async function loadShared(token: string): Promise<SharedTrip | null> {
  const s = await getDoc(shareDoc(token));
  return s.exists() ? (s.data() as SharedTrip) : null;
}

export const shareUrl = (token: string) => `${location.origin}/s/${token}`;
