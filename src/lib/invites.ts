import { arrayUnion, collection, deleteDoc, doc, FieldPath, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { db, SPACE_ID } from './firebase';
import { newSpaceId } from './spaceAccess';
import { readCircleInvite, type CircleInvite } from './circles';

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
  // 우리 공간이 아니면 내 구성원 문서의 이름 (그 공간엔 옛 목록이 없다)
  if (SPACE_ID !== 'main') return void await updateDoc(doc(db, 'spaces', SPACE_ID, 'members', user.uid), { name: clean, updatedAt: serverTimestamp() });
  await updateDoc(doc(db, 'config', 'access'), new FieldPath('names', email), clean, 'updatedAt', serverTimestamp());
}

// ---------- 공간 초대장 (spaceInvites/{코드}) ----------
// 우리 공간(main)이 아닌 공간에 들이거나, 새 공간을 열어 줄 때. 초대장에 공간과 역할이 적혀 있다 (firestore.rules validSpaceInvite)
export interface SpaceInvite { by: string; spaceId: string; role: 'admin' | 'member'; spaceName?: string; name?: string; relation?: Relation; createdAt?: unknown; expiresAt: number; usedBy?: string; usedAt?: number; v: 1 }

/** 새 공간 열어 주기 (마을 주인만): 아직 없는 공간 이름표로 첫 관리자 자리 초대장 */
export async function createNewSpaceInvite(user: User, name: string, spaceName: string): Promise<string> {
  return writeSpaceInvite(user, { spaceId: newSpaceId(), role: 'admin', name, spaceName });
}
/** 지금 공간에 들이기 (그 공간 관리자만): 구성원 자리 초대장 */
export async function createMemberInvite(user: User, name: string, relation: Relation | null, spaceName: string): Promise<string> {
  return writeSpaceInvite(user, { spaceId: SPACE_ID, role: 'member', name, relation, spaceName });
}
async function writeSpaceInvite(user: User, o: { spaceId: string; role: 'admin' | 'member'; name: string; relation?: Relation | null; spaceName: string }) {
  const code = randomCode();
  const data: Record<string, unknown> = { by: (user.email ?? '').toLowerCase(), spaceId: o.spaceId, role: o.role, createdAt: serverTimestamp(), expiresAt: Date.now() + INVITE_DAYS * 86400000, v: 1 };
  if (o.name.trim()) data.name = o.name.trim().slice(0, 20);
  if (o.spaceName.trim()) data.spaceName = o.spaceName.trim().slice(0, 60);
  if (o.relation) data.relation = o.relation;
  await setDoc(doc(db, 'spaceInvites', code), data);
  return code;
}
export const deleteSpaceInvite = (code: string) => deleteDoc(doc(db, 'spaceInvites', code));

/** 내가 만든, 아직 안 쓴 공간 초대장 (규칙: 목록은 만든 사람이 자기 것만 → 'by == 나'로 물어야 한다) */
export function useMySpaceInvites(user: User | null, role: 'admin' | 'member'): ({ code: string } & SpaceInvite)[] | null {
  const [list, setList] = useState<({ code: string } & SpaceInvite)[] | null>(null);
  const email = (user?.email ?? '').toLowerCase();
  useEffect(() => {
    if (!email) return;
    return onSnapshot(query(collection(db, 'spaceInvites'), where('by', '==', email)), (s) => {
      setList(s.docs.map((d) => ({ code: d.id, ...(d.data() as SpaceInvite) }))
        .filter((i) => !i.usedBy && i.expiresAt > Date.now() && i.role === role && (role === 'admin' || i.spaceId === SPACE_ID))
        .sort((a, b) => b.expiresAt - a.expiresAt));
    }, () => setList([]));
  }, [email, role]);
  return list;
}

/** 링크의 코드가 어느 초대인지: 공간 초대장 → 모임 초대장 → 우리 공간의 옛 초대 */
export type AnyInvite = { kind: 'space'; invite: SpaceInvite } | { kind: 'circle'; invite: CircleInvite } | { kind: 'main'; invite: Invite } | null;
export async function readAnyInvite(code: string): Promise<AnyInvite> {
  const s = await getDoc(doc(db, 'spaceInvites', code)).catch(() => null);
  if (s?.exists()) return { kind: 'space', invite: s.data() as SpaceInvite };
  const c = await readCircleInvite(code).catch(() => null);
  if (c) return { kind: 'circle', invite: c };
  const m = await readInvite(code).catch(() => null);
  return m ? { kind: 'main', invite: m } : null;
}

/**
 * 공간 초대장으로 들어가기: 한 묶음으로 (규칙이 서로를 확인한다)
 * 초대장에 내 표시 + 내 구성원 문서 (+ 새 공간이면 공간 문서) + 별명 문서(지금 쓰는 공간을 이 공간으로)
 */
export async function joinSpaceInvite(code: string, inv: SpaceInvite, user: User, fallbackName: string): Promise<JoinResult> {
  const email = (user.email ?? '').toLowerCase();
  if (!email) return 'failed';
  if (inv.usedBy && inv.usedBy !== email) return 'used';
  if (inv.expiresAt < Date.now()) return 'expired';
  const name = (inv.name?.trim() || fallbackName.trim() || '나').slice(0, 20);
  try {
    const b = writeBatch(db);
    b.update(doc(db, 'spaceInvites', code), { usedBy: email, usedAt: Date.now() });
    b.set(doc(db, 'spaces', inv.spaceId, 'members', user.uid), {
      uid: user.uid, email, role: inv.role, name, ...(inv.relation ? { relation: inv.relation } : {}), via: code, joinedAt: serverTimestamp(), v: 1,
    });
    if (inv.role === 'admin') b.set(doc(db, 'spaces', inv.spaceId), { name: (inv.spaceName?.trim() || `${name}의 보라핀`).slice(0, 60), createdBy: user.uid, createdAt: serverTimestamp(), v: 1 });
    b.set(doc(db, 'profiles', user.uid), { nick: name.slice(0, 10), spaceId: inv.spaceId, updatedAt: serverTimestamp(), v: 1 });
    await b.commit();
    return 'joined';
  } catch (e) {
    console.warn('join space failed', e);
    return 'failed';
  }
}
