import { collection, deleteDoc, doc, getDoc, getDocFromCache, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, SPACE_ID } from './firebase';
import { setPhotosPublic } from './photoData';
import { isOffline, queued } from './writes';
import { formatWhen } from './dates';
import type { Photo, PlaceRec, SharedTrip, Trip } from './types';
import { spaceTitle } from './members';

const shareDoc = (token: string) => doc(db, 'shares', token);
const sp = (name: string) => collection(db, 'spaces', SPACE_ID, name);
const tripRef = (id: string) => doc(sp('trips'), id);

// 사본 안의 순서는 늘 같게 (화면에서 만든 것과 저장 뒤 갱신한 것이 서로 덮어쓰지 않도록)
const byTaken = (a: Photo, b: Photo) => (a.taken ?? '').localeCompare(b.taken ?? '') || a.id.localeCompare(b.id);
const ms = (r: PlaceRec) => r.createdAt?.toMillis?.() ?? 0;
const byNewest = (a: PlaceRec, b: PlaceRec) => ms(b) - ms(a) || a.id.localeCompare(b.id);

export function buildShared(trip: Trip, photos: Photo[], recs: PlaceRec[]): Omit<SharedTrip, 'updatedAt'> {
  return {
    title: trip.title,
    when: formatWhen(trip.when),
    places: trip.places,
    photos: [...photos].sort(byTaken).slice(0, 60).map((p) => ({ id: p.id, w: p.w, h: p.h, taken: p.taken, ...(p.caption ? { caption: p.caption } : {}) })),
    spots: [...recs].sort(byNewest).map((r) => ({ name: r.name, kind: r.kind, verdict: r.verdict ?? null })),
    space: spaceTitle(),
    v: 1,
  };
}

/** 칸 순서와 상관없이 같은지 */
function stable(x: unknown): string {
  if (Array.isArray(x)) return '[' + x.map(stable).join(',') + ']';
  if (x && typeof x === 'object') return '{' + Object.keys(x).sort().map((k) => JSON.stringify(k) + ':' + stable((x as Record<string, unknown>)[k])).join(',') + '}';
  return JSON.stringify(x ?? null);
}
const same = (a: unknown, b: unknown) => stable(a) === stable(b);

/**
 * 공개 사본을 맞춘다. 바뀐 게 없으면 아무것도 쓰지 않는다(열 때마다 읽기 1회).
 * 바뀌었으면 사본에 든 사진은 모두 공개로 다시 표시하고(앞서 실패한 것도 다시 시도), 빠진 사진은 닫는다.
 */
async function publish(token: string, trip: Trip, photos: Photo[], recs: PlaceRec[]) {
  const prev = await getDoc(shareDoc(token)).catch(() => null);
  const old = prev?.exists() ? (prev.data() as SharedTrip) : null;
  const data = buildShared(trip, photos, recs);
  if (old) {
    const { updatedAt: _u, ...rest } = old;
    void _u;
    if (same(rest, data)) return;
  }
  const before = new Set<string>((old?.photos ?? []).map((p) => p.id).filter(Boolean));
  const now = new Set(data.photos.map((p) => p.id));
  const exists = new Set(photos.map((p) => p.id));
  await setPhotosPublic([...now], true);
  await setDoc(shareDoc(token), { ...data, updatedAt: serverTimestamp() });
  await setPhotosPublic([...before].filter((id) => !now.has(id) && exists.has(id)), false);
}

const setTripShare = (id: string, share: { token: string } | null) => queued(updateDoc(tripRef(id), { share, updatedAt: serverTimestamp() }));

export async function enableShare(trip: Trip, photos: Photo[], recs: PlaceRec[]): Promise<string> {
  const token = trip.share?.token ?? Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
  await publish(token, trip, photos, recs);
  await setTripShare(trip.id, { token });
  return token;
}

/** 공개 중인 여행이 바뀌면 사본도 맞춘다 (여행 상세가 열려 있을 때, 손에 든 사진·장소로) */
export async function syncShare(trip: Trip, photos: Photo[], recs: PlaceRec[]) {
  if (!trip.share?.token) return;
  await publish(trip.share.token, trip, photos, recs);
}

/** 여행 문서 하나: 기기 캐시 먼저(읽기 0 — 방금 저장한 것도 반영돼 있다), 없으면 서버 */
async function readTrip(id: string): Promise<Trip | null> {
  const ref = tripRef(id);
  const s = await getDocFromCache(ref).catch(() => getDoc(ref));
  return s.exists() ? ({ id: s.id, ...s.data() } as Trip) : null;
}
const byTrip = async <T>(name: 'photos' | 'places', tripId: string): Promise<T[]> =>
  (await getDocs(query(sp(name), where('tripId', '==', tripId)))).docs.map((d) => ({ id: d.id, ...d.data() }) as T);

/**
 * 어느 화면에서 저장했든: 그 여행이 공개 중이면 사본을 다시 맞춘다.
 * 공개 중이 아니면 캐시에서 여행 하나만 보고 끝(읽기 0). 공개 중이면 그 여행의 사진·장소를 읽어 사본과 견준다.
 * @returns 사본을 맞추려 했는지(공개 중이었는지)
 */
export async function refreshShare(tripId: string | null | undefined): Promise<boolean> {
  if (!tripId) return false;
  // 오프라인이면 사본의 옛 모습을 볼 수 없어 사진 공개 표시를 몽땅 다시 쓰게 된다 → 미룬다 (상세를 열면 useShareSync가 맞춘다)
  if (isOffline()) return false;
  const trip = await readTrip(tripId);
  if (!trip?.share?.token) return false;
  const [photos, recs] = await Promise.all([byTrip<Photo>('photos', tripId), byTrip<PlaceRec>('places', tripId)]);
  await publish(trip.share.token, trip, photos, recs);
  return true;
}

// 저장 뒤 사본 맞추기는 한 줄로 세워 차례로 (같은 여행을 두 번 동시에 쓰지 않게), 실패해도 조용히
let chain: Promise<void> = Promise.resolve();
/** 저장 함수 끝에서 부른다. 기다리지 않아도 되고(저장은 이미 끝났다), 실패해도 저장에는 영향이 없다 */
export function syncShareAfterWrite(...tripIds: (string | null | undefined)[]) {
  const ids = [...new Set(tripIds.filter((x): x is string => !!x))];
  if (!ids.length) return;
  chain = chain.then(async () => {
    for (const id of ids) await refreshShare(id).catch((e) => console.warn('공유 사본 갱신 실패', e));
  });
}
/** 지금까지 걸어 둔 사본 맞추기가 끝날 때까지 (시험·백업용) */
export const whenShareSynced = () => chain;

export async function disableShare(trip: Trip, photos: Photo[]) {
  if (trip.share?.token) {
    const prev = await getDoc(shareDoc(trip.share.token)).catch(() => null);
    const ids = prev?.exists() ? ((prev.data() as SharedTrip).photos ?? []).map((p) => p.id).filter(Boolean) : [];
    await deleteDoc(shareDoc(trip.share.token)).catch(() => undefined);
    const exists = new Set(photos.map((p) => p.id));
    await setPhotosPublic(ids.filter((id) => exists.has(id)), false);
  }
  await setTripShare(trip.id, null);
}

export async function loadShared(token: string): Promise<SharedTrip | null> {
  const s = await getDoc(shareDoc(token));
  return s.exists() ? (s.data() as SharedTrip) : null;
}

export const shareUrl = (token: string) => `${location.origin}/s/${token}`;
