/**
 * 여러 공간 2걸음: 들어올 때 내 구성원 문서와 별명 문서를 조용히 만들어 둔다.
 * - 화면은 아무것도 달라지지 않는다. 실패해도 앱은 그대로 쓴다 (문은 아직 옛 목록이다).
 * - 폰에 '마지막으로 쓴 내용'을 적어 두어, 바뀐 게 없으면 읽지도 쓰지도 않는다.
 */
import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, SPACE_ID } from './firebase';
import { legacyMemberDoc, memberSignature, profileSeed } from './membership';
import type { Relation } from './types';

const KEY = (uid: string) => `bp.member.v1:${SPACE_ID}:${uid}`;
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* 저장소를 못 써도 다음에 다시 하면 된다 */ } };

let busy = '';

export async function ensureMembership(user: User, info: { name: string; isAdmin: boolean; relation?: Relation | null }): Promise<void> {
  const want = legacyMemberDoc(user, info);
  const sig = memberSignature(want);
  if (!want.email || read(KEY(user.uid)) === sig || busy === sig) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  busy = sig;
  try {
    const memberRef = doc(db, 'spaces', SPACE_ID, 'members', user.uid);
    const profileRef = doc(db, 'profiles', user.uid);
    const [m, p] = await Promise.all([getDoc(memberRef), getDoc(profileRef)]);
    const b = writeBatch(db);
    // joinedAt은 처음 만들 때만
    b.set(memberRef, { ...want, ...(m.exists() ? {} : { joinedAt: serverTimestamp() }), updatedAt: serverTimestamp() }, { merge: true });
    // 별명 문서는 없을 때만 만든다 (나중에 스스로 고친 별명을 덮어쓰지 않게)
    if (!p.exists()) b.set(profileRef, { ...profileSeed(want.name, SPACE_ID), updatedAt: serverTimestamp() });
    await b.commit();
    write(KEY(user.uid), sig);
  } catch (e) {
    console.warn('membership sync skipped', (e as { code?: string })?.code ?? e);
  } finally {
    busy = '';
  }
}
