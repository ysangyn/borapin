import { Bytes, doc, getDoc, getDocFromCache, updateDoc } from 'firebase/firestore';
import { db, SPACE_ID, USE_EMULATOR } from './firebase';

/**
 * 사진 파일은 Firestore 문서에 그대로 담는다 (무료 요금제, 카드 없이).
 * - spaces/main/photoData/{사진id}_l : 크게 보기용 (긴 변 1600px, 1MB 미만)
 * - spaces/main/photoData/{사진id}_t : 미리보기용 (긴 변 400px)
 * 한 번 받은 사진은 기기 캐시(IndexedDB)에 남아 다시 받지 않는다.
 */
export type PhotoSize = 'l' | 't';

export const dataDoc = (photoId: string, s: PhotoSize) => doc(db, 'spaces', SPACE_ID, 'photoData', `${photoId}_${s}`);

export const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Firestore 문서 한 개의 한도(1MiB)에 넉넉히 들어가는 크기 */
export const MAX_DATA_BYTES = 950 * 1024;

export async function toBytes(blob: Blob): Promise<Bytes> {
  return Bytes.fromUint8Array(new Uint8Array(await blob.arrayBuffer()));
}

// ---------- 한 번에 6장씩만 받기 ----------
let running = 0;
const waiting: (() => void)[] = [];
async function limited<T>(job: () => Promise<T>): Promise<T> {
  if (running >= 6) await new Promise<void>((r) => waiting.push(r));
  running++;
  try {
    return await job();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

async function fetchBytes(photoId: string, s: PhotoSize): Promise<Uint8Array> {
  const ref = dataDoc(photoId, s);
  // 사진은 바뀌지 않으므로 기기 캐시를 먼저 본다 (읽기 횟수 절약)
  let snap = await getDocFromCache(ref).catch(() => null);
  if (!snap?.exists()) snap = await getDoc(ref);
  const data = snap.exists() ? (snap.get('data') as Bytes | undefined) : undefined;
  if (!data) throw new Error('사진을 찾지 못했어요');
  return data.toUint8Array();
}

// 테스트(에뮬레이터)에서 권한을 확인하려고 쓴다
if (USE_EMULATOR) (window as unknown as { __testPhoto: unknown }).__testPhoto = (id: string, s: PhotoSize = 't') => fetchBytes(id, s).then((u) => u.length);

// ---------- 화면에 쓰는 주소(blob:) 캐시: 오래 안 본 것부터 비운다 ----------
const MAX: Record<PhotoSize, number> = { t: 600, l: 30 };
const pending: Record<PhotoSize, Map<string, Promise<string>>> = { t: new Map(), l: new Map() };
const ready: Record<PhotoSize, Map<string, string>> = { t: new Map(), l: new Map() };

function evict(s: PhotoSize) {
  const m = pending[s];
  while (m.size > MAX[s]) {
    const k = m.keys().next().value as string;
    m.delete(k);
    const u = ready[s].get(k);
    if (u) {
      ready[s].delete(k);
      URL.revokeObjectURL(u);
    }
  }
}

/** 이미 받아 둔 사진 주소 (없으면 undefined) */
export const peekPhotoUrl = (photoId: string, s: PhotoSize) => ready[s].get(photoId);

/** 사진 주소 받기 (같은 사진은 한 번만 받는다) */
export function photoUrl(photoId: string, s: PhotoSize): Promise<string> {
  const m = pending[s];
  const hit = m.get(photoId);
  if (hit) {
    m.delete(photoId);
    m.set(photoId, hit);
    return hit;
  }
  const p = limited(() => fetchBytes(photoId, s)).then((u8) => {
    const url = URL.createObjectURL(new Blob([u8 as BlobPart], { type: 'image/jpeg' }));
    if (m.get(photoId) === p) ready[s].set(photoId, url);
    return url;
  });
  p.catch(() => m.get(photoId) === p && m.delete(photoId));
  m.set(photoId, p);
  evict(s);
  return p;
}

/** 방금 올린 사진은 받지 않고 바로 보여 준다 */
export function primePhotoUrl(photoId: string, s: PhotoSize, blob: Blob) {
  const url = URL.createObjectURL(blob);
  pending[s].set(photoId, Promise.resolve(url));
  ready[s].set(photoId, url);
  evict(s);
}

export function forgetPhotoUrl(photoId: string) {
  for (const s of ['l', 't'] as const) {
    pending[s].delete(photoId);
    const u = ready[s].get(photoId);
    if (u) URL.revokeObjectURL(u);
    ready[s].delete(photoId);
  }
}

/** 공유 링크로 보는 사람(로그인 없음)도 읽을 수 있게 표시 */
export async function setPhotosPublic(ids: string[], on: boolean) {
  const jobs = ids.flatMap((id) => (['l', 't'] as const).map((s) => updateDoc(dataDoc(id, s), { public: on })));
  const r = await Promise.allSettled(jobs);
  const failed = r.filter((x) => x.status === 'rejected').length;
  if (failed) console.warn(`사진 공개 표시 ${failed}건 실패`);
}
