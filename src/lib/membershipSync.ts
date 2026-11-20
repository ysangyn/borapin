/**
 * 여러 공간 4걸음: 우리 공간(main)에 들어오기 전에 내 구성원 문서(와 별명 문서)를 스스로 만든다.
 * - 규칙: 우리 공간은 옛 목록에 있고 + 구성원 문서가 있어야 읽힌다. 목록에 있는 사람은 자기 문서를 만들 수 있다.
 * - 폰에 '마지막으로 쓴 내용'을 적어 둔다. 같으면 바로 들어가고(읽기 0), 뒤에서 한 번 확인한다.
 */
import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { legacyMemberDoc, memberSignature, profileSeed } from './membership';
import type { Relation } from './types';

const KEY = (uid: string) => `bp.member.v1:main:${uid}`;
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* 저장소를 못 써도 다음에 다시 하면 된다 */ } };

export type MemberInfo = { name: string; isAdmin: boolean; relation?: Relation | null };

/** 이 폰에서 같은 내용으로 이미 만들어 둔 적이 있나 (읽기 없이) */
export function membershipKnown(user: User, info: MemberInfo): boolean {
  return read(KEY(user.uid)) === memberSignature(legacyMemberDoc(user, info));
}

/**
 * 내 구성원 문서를 확인하고, 없거나 달라졌으면 쓴다.
 * 'ok' 있었다(고쳤을 수도) · 'created' 없어서 새로 만들었다 · 'failed' 못 했다(연결·권한)
 */
export async function ensureMembership(user: User, info: MemberInfo): Promise<'ok' | 'created' | 'failed'> {
  const want = legacyMemberDoc(user, info);
  if (!want.email) return 'failed';
  const sig = memberSignature(want);
  const memberRef = doc(db, 'spaces', 'main', 'members', user.uid);
  const profileRef = doc(db, 'profiles', user.uid);
  try {
    // 문서가 없으면 규칙이 읽기를 막는다(권한 없음) → '없음'으로 본다
    const m = await getDoc(memberRef).then((s) => (s.exists() ? (s.data() as Record<string, unknown>) : null), (e: { code?: string }) => {
      if (e?.code === 'permission-denied') return null;
      throw e;
    });
    const same = !!m && m.email === want.email && m.role === want.role && m.name === want.name && (m.relation ?? null) === (want.relation ?? null);
    if (!same) {
      const p = await getDoc(profileRef);
      const b = writeBatch(db);
      // joinedAt은 처음 만들 때만
      b.set(memberRef, { ...want, ...(m ? {} : { joinedAt: serverTimestamp() }), updatedAt: serverTimestamp() }, { merge: true });
      // 별명 문서는 없을 때만 만든다 (스스로 고친 별명이나 다른 공간을 가리키는 것을 덮어쓰지 않게)
      if (!p.exists()) b.set(profileRef, { ...profileSeed(want.name, 'main'), updatedAt: serverTimestamp() });
      await b.commit();
    }
    write(KEY(user.uid), sig);
    return m ? 'ok' : 'created';
  } catch (e) {
    console.warn('membership sync failed', (e as { code?: string })?.code ?? e);
    return 'failed';
  }
}
