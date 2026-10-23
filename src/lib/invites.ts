import { arrayUnion, collection, deleteDoc, doc, FieldPath, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { db } from './firebase';

/**
 * 초대 링크 (서버 없이): 관리자가 코드를 만들면 /join/코드 링크가 생긴다.
 * 링크로 온 사람은 로그인 → 코드에 자기 메일로 '썼음' 표시 → 자기 메일을 허용 목록에 넣는다 (규칙이 그 둘만 허용).
 * 코드는 7일, 한 번만. 기기엔 코드만 잠깐 남겨 두고(로그인 뒤 이어 가게) 들어오면 지운다.
 */
import type { Relation } from './types';
export interface Invite { by: string; name?: string; relation?: Relation; createdAt?: unknown; expiresAt: number; usedBy?: string; usedAt?: number; v: 1 }
export const INVITE_DAYS = 7;
const KEY = 'borapin:invite';

export const inviteUrl = (code: string) => `${location.origin}/join/${code}`;

function randomCode(n = 20) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => chars[b % chars.length]).join('');
}

export async function createInvite(user: User, name: string, relation: Relation | null = null): Promise<string> {
  const code = randomCode();
  const data: Omit<Invite, 'createdAt'> & { createdAt: unknown } = { by: (user.email ?? '').toLowerCase(), createdAt: serverTimestamp(), expiresAt: Date.now() + INVITE_DAYS * 86400000, v: 1 };
  if (name.trim()) data.name = name.trim().slice(0, 20);
  if (relation) data.relation = relation;
  await setDoc(doc(db, 'invites', code), data);
  return code;
}

export const deleteInvite = (code: string) => deleteDoc(doc(db, 'invites', code));

/** 관리자용: 아직 안 쓴 초대 */
export function useOpenInvites(enabled: boolean): ({ code: string } & Invite)[] | null {
  const [list, setList] = useState<({ code: string } & Invite)[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    return onSnapshot(query(collection(db, 'invites'), orderBy('expiresAt', 'desc')), (s) => {
      setList(s.docs.map((d) => ({ code: d.id, ...(d.data() as Invite) })).filter((i) => !i.usedBy && i.expiresAt > Date.now()));
    }, () => setList([]));
  }, [enabled]);
  return list;
}

export async function readInvite(code: string): Promise<Invite | null> {
  const s = await getDoc(doc(db, 'invites', code));
  return s.exists() ? (s.data() as Invite) : null;
}

export type JoinResult = 'joined' | 'used' | 'expired' | 'missing' | 'failed';
/** 링크로 온 사람이 들어가기: 두 번 쓰기 (코드에 표시 → 허용 목록에 내 메일) */
export async function joinByInvite(code: string, user: User): Promise<JoinResult> {
  const email = (user.email ?? '').toLowerCase();
  if (!email) return 'failed';
  const inv = await readInvite(code).catch(() => null);
  if (!inv) return 'missing';
  if (inv.usedBy && inv.usedBy !== email) return 'used';
  if (inv.expiresAt < Date.now()) return 'expired';
  try {
    if (!inv.usedBy) await updateDoc(doc(db, 'invites', code), { usedBy: email, usedAt: Date.now() });
    const name = inv.name?.trim();
    const fields: unknown[] = ['allowed', arrayUnion(email), 'via', code, 'updatedAt', serverTimestamp()];
    if (name) fields.push(new FieldPath('names', email), name);
    if (inv.relation) fields.push(new FieldPath('relations', email), inv.relation);
    await updateDoc(doc(db, 'config', 'access'), fields[0] as string, fields[1], ...fields.slice(2));
    return 'joined';
  } catch (e) {
    console.warn('join failed', e);
    return 'failed';
  }
}

/** 주소의 /join/코드 를 기기에 잠깐 적어 둔다 (로그인 창을 지나 돌아와도 이어 가게) */
export function rememberInviteFromUrl(pathname = location.pathname) {
  const m = pathname.match(/^\/join\/([a-z0-9]{8,64})$/i);
  if (m) { try { localStorage.setItem(KEY, m[1]); } catch { /* */ } }
  return m?.[1] ?? null;
}
export function pendingInvite(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function clearPendingInvite() {
  try { localStorage.removeItem(KEY); } catch { /* */ }
}

/** 앱에서 쓸 내 이름 바꾸기: config/access의 names.<내 메일> 한 칸만 (규칙 renamingSelf) */
export async function renameSelf(user: User, name: string) {
  const email = (user.email || '').toLowerCase();
  const clean = name.trim().slice(0, 10);
  if (!email || !clean) throw new Error('이름이 비었어요');
  await updateDoc(doc(db, 'config', 'access'), new FieldPath('names', email), clean, 'updatedAt', serverTimestamp());
}
