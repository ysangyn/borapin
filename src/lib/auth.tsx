import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, OWNER_EMAIL, SPACE_ID, USE_EMULATOR } from './firebase';
import type { Access } from './types';
import { setMembers } from './members';
export { memberNames } from './members';

type State =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'denied'; user: User }
  | { status: 'verify'; user: User }
  | { status: 'error'; user: User; message: string }
  | { status: 'ready'; user: User; access: Access; isAdmin: boolean };

const Ctx = createContext<State>({ status: 'loading' });
const RecheckCtx = createContext<() => Promise<boolean>>(async () => false);

export const useAuth = () => useContext(Ctx);
/** 메일 인증을 마친 뒤 다시 확인 */
export const useRecheckAuth = () => useContext(RecheckCtx);

/** 멤버를 앱 안에서 부르는 이름. 관리자가 정한 이름 → 주인은 '영상', 처음 초대한 사람은 '보라' → 구글 이름 */
let access: Access = { allowed: [], admins: [] };
export function nameOf(email: string | null | undefined, fallback = ''): string {
  const e = (email ?? '').toLowerCase();
  if (!e) return fallback;
  const set = access.names?.[e];
  if (set) return set;
  if (e === OWNER_EMAIL) return '영상';
  const partner = access.allowed.find((x) => x !== OWNER_EMAIL);
  if (partner && e === partner) return '보라';
  return fallback || e.split('@')[0];
}
export function displayName(user: User | null | undefined): string {
  if (!user) return '';
  return nameOf(user.email, user.displayName?.split(' ')[0] || user.email?.split('@')[0] || '나');
}

/**
 * 초대 목록(config/access) 스냅샷을 보고 들어갈지 정한다.
 * - 주인 계정은 목록이 없어도 들어간다 (처음 설정을 만드는 쪽)
 * - 서버가 '없다'고 한 것과, 오프라인 첫 실행이라 기기 캐시에 아직 없는 것(fromCache)은 다르다:
 *   뒤쪽은 거부하지 않고 연결을 기다린다 (연결되면 같은 구독으로 진짜 목록이 온다)
 */
export function accessVerdict(snap: { exists: boolean; fromCache: boolean; allowed: string[] }, email: string | null | undefined): 'ready' | 'denied' | 'waiting' {
  const e = (email ?? '').toLowerCase();
  if (e === OWNER_EMAIL) return 'ready';
  if (!snap.exists) return snap.fromCache ? 'waiting' : 'denied';
  return snap.allowed.includes(e) ? 'ready' : 'denied';
}
export const WAITING_TEXT = '연결을 기다리는 중이에요. 인터넷이 연결되면 바로 열려요.';

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
  const [round, setRound] = useState(0);

  useEffect(() => {
    let unsubAccess: (() => void) | null = null;
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsubAccess?.();
      unsubAccess = null;
      if (!user) return setState({ status: 'signedOut' });
      // 이메일로 가입한 계정은 메일 인증을 마쳐야 들어온다 (남의 메일로 가입하는 것 막기)
      if (!user.emailVerified) return setState({ status: 'verify', user });
      try {
        await bootstrapIfOwner(user);
      } catch (e) {
        console.warn('bootstrap failed', e);
      }
      // 기다리는 사이 다른 계정으로 바뀌었거나 나갔으면 멈춘다
      if (auth.currentUser?.uid !== user.uid) return;
      unsubAccess = onSnapshot(
        doc(db, 'config', 'access'),
        (snap) => {
          const email = (user.email || '').toLowerCase();
          const verdict = accessVerdict({ exists: snap.exists(), fromCache: snap.metadata.fromCache, allowed: (snap.data() as Access | undefined)?.allowed ?? [] }, email);
          // 오프라인 첫 실행(캐시에 목록이 아직 없음): '초대되지 않은 계정'이 아니라 연결을 기다린다. 구독은 그대로 두어 연결되면 이어진다
          if (verdict === 'waiting') return setState({ status: 'error', user, message: WAITING_TEXT });
          const a = (snap.data() as Access | undefined) ?? { allowed: [], admins: [] };
          access = { allowed: a.allowed ?? [], admins: a.admins ?? [], names: a.names ?? {}, relations: a.relations ?? {} };
          setMembers(access.allowed.map((e) => ({ email: e, name: nameOf(e), relation: access.relations?.[e] })));
          const isOwner = email === OWNER_EMAIL;
          if (verdict === 'denied') return setState({ status: 'denied', user });
          setState({ status: 'ready', user, access, isAdmin: isOwner || access.admins.includes(email) });
        },
        (e) => {
          // 권한 문제일 때만 '초대되지 않음', 나머지(무료 한도·연결)는 다시 시도할 수 있게
          if (e.code === 'permission-denied') setState({ status: 'denied', user });
          else setState({ status: 'error', user, message: e.code === 'resource-exhausted' ? '오늘 무료 사용량을 다 써서 잠시 멈췄어요. 오후 4~5시쯤 다시 열려요.' : '연결이 불안정해 기록을 불러오지 못했어요.' });
        },
      );
    });
    return () => {
      unsub();
      unsubAccess?.();
    };
  }, [round]);

  // 인증 메일의 링크를 누른 뒤: 계정 정보를 새로 받아 다시 확인
  const recheck = async () => {
    const u = auth.currentUser;
    if (!u) return false;
    await u.reload();
    if (!u.emailVerified) return false;
    await u.getIdToken(true);
    setRound((r) => r + 1);
    return true;
  };

  return (
    <RecheckCtx.Provider value={recheck}>
      <Ctx.Provider value={state}>{children}</Ctx.Provider>
    </RecheckCtx.Provider>
  );
}

/** 이메일 로그인 오류를 알아듣기 쉬운 말로 */
export function authErrorText(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(code)) return '메일 주소나 비밀번호가 맞지 않아요';
  if (code === 'auth/email-already-in-use') return '이미 가입한 메일이에요. 로그인해 주세요. 구글로 가입했다면 "구글로 계속하기"를 눌러 주세요';
  if (code === 'auth/weak-password') return '비밀번호는 6자 이상으로 해 주세요';
  if (code === 'auth/invalid-email' || code === 'auth/missing-email') return '메일 주소를 확인해 주세요';
  if (code === 'auth/operation-not-allowed') return '아직 이메일 로그인이 켜지지 않았어요. 관리자에게 알려 주세요';
  if (code === 'auth/too-many-requests') return '여러 번 시도해서 잠시 막혔어요. 조금 뒤 다시 해 주세요';
  if (code === 'auth/network-request-failed') return '인터넷 연결을 확인해 주세요';
  return '로그인하지 못했어요. 잠시 뒤 다시 해 주세요';
}

const verifyLink = () => ({ url: `${location.origin}/` });

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}
export async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(cred.user, verifyLink()).catch((e) => console.warn(e));
}
export async function resendVerification() {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser, verifyLink());
}
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email.trim(), verifyLink());
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
