import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useStore } from './store';
import { queued } from './writes';
import type { Flags } from './store';

/** 앱 스위치 (관리자만 바꿈). 사진 올리기를 잠시 멈추는 데 쓴다. */
export type { Flags } from './store';
const flagsDoc = () => doc(db, 'config', 'flags');
export const useFlags = () => useStore().flags;
export const setFlags = (f: Flags) => queued(setDoc(flagsDoc(), { ...f, updatedAt: serverTimestamp() }, { merge: true }));

// ---------- 오류 기록 · 문제 신고 ----------
export interface Report {
  id: string;
  kind: 'error' | 'report';
  message: string;
  detail?: string;
  path: string;
  ua: string;
  by?: string;
  createdAt?: Timestamp | null;
}
const reportsCol = () => collection(db, 'reports');
let sent = 0;

/** 오류·신고 남기기. 문제 신고는 실패하면 알 수 있게 오류를 던진다. */
export async function sendReport(kind: Report['kind'], message: string, detail = '') {
  if (kind === 'error' && ++sent > 15) return; // 한 번 열 때 15건까지만
  const p = addDoc(reportsCol(), {
    kind,
    message: message.slice(0, 500),
    detail: detail.slice(0, 3000),
    path: location.pathname,
    ua: navigator.userAgent.slice(0, 200),
    by: auth.currentUser?.email ?? '',
    createdAt: serverTimestamp(),
  });
  if (kind === 'report') await queued(p);
  else await p.catch(() => undefined);
}

/** 앱에서 난 오류를 자동으로 남긴다 (로그인한 멤버일 때만 저장됨) */
export function installErrorReporting() {
  if (import.meta.env.VITE_EMULATOR === '1') return;
  window.addEventListener('error', (e) => {
    if (!e.message || /ResizeObserver/.test(e.message)) return;
    sendReport('error', e.message, `${e.filename}:${e.lineno}\n${(e.error as Error)?.stack ?? ''}`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason as Error | undefined;
    sendReport('error', r?.message ?? String(e.reason), r?.stack ?? '');
  });
}

export function useReports(n = 40) {
  const [items, setItems] = useState<Report[] | null>(null);
  useEffect(() => onSnapshot(query(reportsCol(), orderBy('createdAt', 'desc'), limit(n)), (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Report)), () => setItems([])), [n]);
  return items;
}
export const resolveReport = (id: string) => queued(deleteDoc(doc(reportsCol(), id)));
