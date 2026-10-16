import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, SPACE_ID } from './firebase';
import { displayName } from './auth';
import type { Place, Trip, TripInput, Wish } from './types';
import { whenSortKey } from './dates';
import { COUNTRY_BY_ID, REGION_BY_CODE, GROUPS } from './geo';

const tripsCol = () => collection(db, 'spaces', SPACE_ID, 'trips');
const wishesCol = () => collection(db, 'spaces', SPACE_ID, 'wishes');

function useCollection<T>(col: () => ReturnType<typeof collection>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(
    () =>
      onSnapshot(
        col(),
        (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)),
        (e) => setError(e.message),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return { items, error };
}

export function useTrips() {
  const { items, error } = useCollection<Trip>(tripsCol);
  const sorted = useMemo(
    () => (items ? [...items].sort((a, b) => whenSortKey(b.when) - whenSortKey(a.when)) : null),
    [items],
  );
  return { trips: sorted, error };
}

export function useWishes() {
  const { items, error } = useCollection<Wish>(wishesCol);
  return { wishes: items, error };
}

function clean<T extends object>(o: T): T {
  // Firestore는 undefined 값을 받지 않는다
  return JSON.parse(JSON.stringify(o));
}

export async function createTrip(input: TripInput, user: User): Promise<string> {
  const ref = await addDoc(tripsCol(), {
    ...clean(input),
    createdBy: { uid: user.uid, email: user.email ?? '', name: displayName(user) },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    v: 1,
  });
  return ref.id;
}

export async function updateTrip(id: string, input: TripInput) {
  await updateDoc(doc(tripsCol(), id), { ...clean(input), updatedAt: serverTimestamp() });
}

export async function deleteTrip(id: string) {
  await deleteDoc(doc(tripsCol(), id));
}

export async function setAccessList(field: 'allowed' | 'admins', email: string, add: boolean) {
  await updateDoc(doc(db, 'config', 'access'), {
    [field]: add ? arrayUnion(email.toLowerCase().trim()) : arrayRemove(email.toLowerCase().trim()),
    updatedAt: serverTimestamp(),
  });
}

export async function renameSpace(name: string) {
  await setDoc(doc(db, 'spaces', SPACE_ID), { name, updatedAt: serverTimestamp() }, { merge: true });
}

/** 한꺼번에 쓰기 (가져오기용). 문서 id를 정해 두어 여러 번 가져와도 겹치지 않는다. */
export async function batchWrite(
  items: { coll: 'trips' | 'wishes'; id: string; data: Record<string, unknown> }[],
  user: User,
) {
  for (let i = 0; i < items.length; i += 400) {
    const b = writeBatch(db);
    for (const it of items.slice(i, i + 400)) {
      const ref = doc(it.coll === 'trips' ? tripsCol() : wishesCol(), it.id);
      b.set(ref, {
        ...clean(it.data),
        ...(it.coll === 'trips'
          ? { createdBy: { uid: user.uid, email: user.email ?? '', name: displayName(user) }, updatedAt: serverTimestamp() }
          : {}),
        createdAt: serverTimestamp(),
        v: 1,
      });
    }
    await b.commit();
  }
}

// ---------- 통계 ----------
export interface Stats {
  /** 시·군 칸별 다녀온 횟수 */
  cellVisits: Map<string, number>;
  /** 예정만 있는 칸 */
  cellPlanned: Set<string>;
  countryVisits: Map<string, number>;
  countryPlanned: Set<string>;
  cities: Set<string>;
  groupsVisited: Set<string>;
  continents: Set<string>;
  tripsDone: number;
  pins: number;
}

export function computeStats(trips: Trip[]): Stats {
  const cellVisits = new Map<string, number>();
  const countryVisits = new Map<string, number>();
  const cellPlanned = new Set<string>();
  const countryPlanned = new Set<string>();
  const cities = new Set<string>();
  const groupsVisited = new Set<string>();
  const continents = new Set<string>();
  let tripsDone = 0;
  for (const t of trips) {
    const done = t.status === 'done';
    if (done) tripsDone++;
    const seenCells = new Set<string>();
    const seenCountries = new Set<string>();
    for (const p of t.places) {
      if (p.t === 'kr') {
        if (seenCells.has(p.code)) continue;
        seenCells.add(p.code);
        if (done) {
          cellVisits.set(p.code, (cellVisits.get(p.code) ?? 0) + 1);
          const r = REGION_BY_CODE.get(p.code);
          if (r) groupsVisited.add(r.group);
        } else cellPlanned.add(p.code);
      } else {
        if (done && p.city) cities.add(`${p.id}:${p.city}`);
        if (seenCountries.has(p.id)) continue;
        seenCountries.add(p.id);
        if (done) {
          countryVisits.set(p.id, (countryVisits.get(p.id) ?? 0) + 1);
          const c = COUNTRY_BY_ID.get(p.id);
          if (c) continents.add(c.continent);
        } else countryPlanned.add(p.id);
      }
    }
  }
  for (const c of cellVisits.keys()) cellPlanned.delete(c);
  for (const c of countryVisits.keys()) countryPlanned.delete(c);
  if (cellVisits.size) continents.add('아시아');
  return {
    cellVisits,
    cellPlanned,
    countryVisits,
    countryPlanned,
    cities,
    groupsVisited,
    continents,
    tripsDone,
    pins: cellVisits.size + countryVisits.size,
  };
}

export const TOTAL_CELLS = REGION_BY_CODE.size;
export const TOTAL_GROUPS = GROUPS.length;

export function tripsAtPlace(trips: Trip[], match: (p: Place) => boolean) {
  return trips.filter((t) => t.places.some(match));
}

/** 같이 간 사람 칩 후보: 자주 쓴 순 */
export function companionSuggestions(trips: Trip[]): string[] {
  const count = new Map<string, number>();
  for (const t of trips) for (const c of t.companions) count.set(c, (count.get(c) ?? 0) + 1);
  const base = ['보라', '영상'];
  const rest = [...count.entries()].filter(([n]) => !base.includes(n)).sort((a, b) => b[1] - a[1]).map(([n]) => n);
  return [...base, ...rest];
}
