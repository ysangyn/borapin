import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { patchTrip } from './data';
import { formatWhen } from './dates';
import type { Photo, PlaceRec, SharedTrip, Trip } from './types';

const shareDoc = (token: string) => doc(db, 'shares', token);

export function buildShared(trip: Trip, photos: Photo[], recs: PlaceRec[]): Omit<SharedTrip, 'updatedAt'> {
  return {
    title: trip.title,
    when: formatWhen(trip.when),
    places: trip.places,
    photos: photos.slice(0, 60).map((p) => ({ url: p.url, thumb: p.thumb, w: p.w, h: p.h, taken: p.taken, ...(p.caption ? { caption: p.caption } : {}) })),
    spots: recs.map((r) => ({ name: r.name, kind: r.kind, verdict: r.verdict ?? null })),
    space: '보라 & 영상',
    v: 1,
  };
}

export async function enableShare(trip: Trip, photos: Photo[], recs: PlaceRec[]): Promise<string> {
  const token = trip.share?.token ?? Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
  await setDoc(shareDoc(token), { ...buildShared(trip, photos, recs), updatedAt: serverTimestamp() });
  await patchTrip(trip.id, { share: { token } });
  return token;
}

/** 공개 중인 여행이 바뀌면 사본도 맞춘다 */
export async function syncShare(trip: Trip, photos: Photo[], recs: PlaceRec[]) {
  if (!trip.share?.token) return;
  await setDoc(shareDoc(trip.share.token), { ...buildShared(trip, photos, recs), updatedAt: serverTimestamp() });
}

export async function disableShare(trip: Trip) {
  if (trip.share?.token) await deleteDoc(shareDoc(trip.share.token)).catch(() => undefined);
  await patchTrip(trip.id, { share: null });
}

export async function loadShared(token: string): Promise<SharedTrip | null> {
  const s = await getDoc(shareDoc(token));
  return s.exists() ? (s.data() as SharedTrip) : null;
}

export const shareUrl = (token: string) => `${location.origin}/s/${token}`;
