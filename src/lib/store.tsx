import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { collection, doc, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { db, SPACE_ID } from './firebase';
import type { PlaceRec, Trip, Wish } from './types';

/**
 * 앱 전체가 함께 쓰는 기록 구독.
 * 화면을 옮겨 다녀도 다시 받지 않아 바로 보이고, 무료 읽기 횟수도 아낀다.
 */
export interface Flags {
  uploadsPaused?: boolean;
  reason?: string;
}

interface Store {
  trips: Trip[] | null;
  wishes: Wish[] | null;
  places: PlaceRec[] | null;
  flags: Flags;
  error: string | null;
  retry: () => void;
}

const Ctx = createContext<Store>({ trips: null, wishes: null, places: null, flags: {}, error: null, retry: () => {} });
export const useStore = () => useContext(Ctx);

/** 빠진 칸이 있어도 화면이 깨지지 않게 기본값을 채운다 */
function normTrip(id: string, d: Record<string, unknown>): Trip {
  return {
    title: '',
    kind: 'trip',
    status: 'done',
    when: { p: 'unknown' },
    places: [],
    memo: '',
    source: 'app',
    v: 1,
    ...d,
    companions: Array.isArray(d.companions) ? (d.companions as string[]) : [],
    tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
    id,
  } as Trip;
}
function normWish(id: string, d: Record<string, unknown>): Wish {
  return {
    priority: null,
    note: '',
    source: 'app',
    v: 1,
    ...d,
    spots: Array.isArray(d.spots) ? (d.spots as string[]) : [],
    todos: Array.isArray(d.todos) ? (d.todos as string[]) : [],
    foods: Array.isArray(d.foods) ? (d.foods as string[]) : [],
    wantedBy: Array.isArray(d.wantedBy) ? (d.wantedBy as string[]) : [],
    id,
  } as Wish;
}
function normPlace(id: string, d: Record<string, unknown>): PlaceRec {
  return {
    kind: 'etc',
    verdict: null,
    v: 1,
    ...d,
    name: typeof d.name === 'string' ? d.name : '',
    reviews: d.reviews && typeof d.reviews === 'object' ? (d.reviews as Record<string, string>) : {},
    id,
  } as PlaceRec;
}

/** Firestore 오류를 사람이 알아들을 말로 */
export function errorText(e: unknown): string {
  const code = (e as FirestoreError)?.code ?? '';
  if (code === 'resource-exhausted') return '오늘 무료 사용량을 다 써서 잠시 멈췄어요. 오후 4~5시쯤 다시 열려요.';
  if (code === 'permission-denied') return '이 계정으로는 볼 수 없어요.';
  if (code === 'unavailable' || code === 'deadline-exceeded') return '인터넷 연결이 불안정해요.';
  return '기록을 불러오지 못했어요.';
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [places, setPlaces] = useState<PlaceRec[] | null>(null);
  const [flags, setFlags] = useState<Flags>({});
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    setError(null);
    const fail = (e: FirestoreError) => {
      console.warn(e);
      setError(errorText(e));
    };
    const sp = (name: string) => collection(db, 'spaces', SPACE_ID, name);
    const offs = [
      onSnapshot(sp('trips'), (s) => setTrips(s.docs.map((d) => normTrip(d.id, d.data()))), fail),
      onSnapshot(sp('wishes'), (s) => setWishes(s.docs.map((d) => normWish(d.id, d.data()))), fail),
      onSnapshot(sp('places'), (s) => setPlaces(s.docs.map((d) => normPlace(d.id, d.data()))), fail),
      onSnapshot(doc(db, 'config', 'flags'), (s) => setFlags((s.data() as Flags) ?? {}), () => setFlags({})),
    ];
    return () => offs.forEach((off) => off());
  }, [round]);

  const value = useMemo(() => ({ trips, wishes, places, flags, error, retry: () => setRound((r) => r + 1) }), [trips, wishes, places, flags, error]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
