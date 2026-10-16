import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, OWNER_EMAIL, SPACE_ID, USE_EMULATOR } from './firebase';
import type { Access } from './types';

type State =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'denied'; user: User }
  | { status: 'ready'; user: User; access: Access; isAdmin: boolean };

const Ctx = createContext<State>({ status: 'loading' });

export const useAuth = () => useContext(Ctx);

export function displayName(user: User | null | undefined): string {
  if (!user) return '';
  if (user.email === OWNER_EMAIL) return '영상';
  return user.displayName?.split(' ')[0] || user.email?.split('@')[0] || '나';
}

/** 주인 계정이 처음 들어오면 허용 목록과 공간을 만든다. */
async function bootstrapIfOwner(user: User) {
  if (user.email !== OWNER_EMAIL) return;
  const accessRef = doc(db, 'config', 'access');
  const snap = await getDoc(accessRef);
  if (!snap.exists()) {
    await setDoc(accessRef, { allowed: [OWNER_EMAIL], admins: [OWNER_EMAIL], updatedAt: serverTimestamp() });
  }
  const spaceRef = doc(db, 'spaces', SPACE_ID);
  const s = await getDoc(spaceRef);
  if (!s.exists()) {
    await setDoc(spaceRef, { name: '보라 & 영상', createdAt: serverTimestamp(), v: 1 });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let unsubAccess: (() => void) | null = null;
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsubAccess?.();
      unsubAccess = null;
      if (!user) return setState({ status: 'signedOut' });
      try {
        await bootstrapIfOwner(user);
      } catch (e) {
        console.warn('bootstrap failed', e);
      }
      unsubAccess = onSnapshot(
        doc(db, 'config', 'access'),
        (snap) => {
          const a = (snap.data() as Access | undefined) ?? { allowed: [], admins: [] };
          const email = (user.email || '').toLowerCase();
          const isOwner = email === OWNER_EMAIL;
          if (!isOwner && !a.allowed.includes(email)) return setState({ status: 'denied', user });
          setState({ status: 'ready', user, access: a, isAdmin: isOwner || a.admins.includes(email) });
        },
        () => setState({ status: 'denied', user }),
      );
    });
    return () => {
      unsub();
      unsubAccess?.();
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
    } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
      throw e;
    }
  }
}

export const logOut = () => signOut(auth);

// 테스트(에뮬레이터)에서만: 구글 계정 흉내 로그인
if (USE_EMULATOR) {
  (window as unknown as Record<string, unknown>).__testSignIn = async (email: string, name = '테스트') => {
    const cred = GoogleAuthProvider.credential(
      JSON.stringify({ sub: email, email, email_verified: true, name }),
    );
    await signInWithCredential(auth, cred);
  };
}
