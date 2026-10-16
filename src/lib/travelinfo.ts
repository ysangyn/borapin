import { useEffect, useState } from 'react';

/** 여행정보 DB (data/travelinfo.csv → src/data/travelinfo.json). 처음 필요할 때 한 번만 불러온다. */
export interface InfoEntry {
  name: string;
  theme: string;
  spots: string[];
  foods: string[];
  goods: string[];
  transport: string[];
  note?: string;
}
export interface TravelInfo {
  updated: string;
  cells: Record<string, { main: InfoEntry; subs: InfoEntry[] }>;
  areas: Record<string, InfoEntry>;
}

let cache: Promise<TravelInfo> | null = null;
export function loadTravelInfo(): Promise<TravelInfo> {
  if (!cache) {
    cache = import('../data/travelinfo.json').then((m) => m.default as unknown as TravelInfo);
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

export function useTravelInfo(): TravelInfo | null {
  const [d, setD] = useState<TravelInfo | null>(null);
  useEffect(() => {
    let alive = true;
    loadTravelInfo().then((x) => alive && setD(x));
    return () => {
      alive = false;
    };
  }, []);
  return d;
}
