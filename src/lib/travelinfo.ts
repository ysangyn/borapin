import { useCallback, useEffect, useState } from 'react';

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

/** 자료가 없을 때 쓰는 빈 DB: 규칙형 답변기가 우리 기록만으로라도 답하게 */
export const EMPTY_TRAVEL_INFO: TravelInfo = { updated: '', cells: {}, areas: {} };

export interface TravelInfoState {
  info: TravelInfo | null;
  /** 조각(chunk)을 못 받았다 (오프라인·배포 직후 옛 파일 등). 다시 받기 전까지 true */
  failed: boolean;
  /** 받는 중 (처음 또는 다시 받기) */
  loading: boolean;
  retry: () => void;
}

/** 여행정보 DB + 받기 실패·다시 받기. 못 받아도 화면이 멈추지 않게 실패를 알려 준다 */
export function useTravelInfoState(): TravelInfoState {
  const [d, setD] = useState<TravelInfo | null>(null);
  const [failed, setFailed] = useState(false);
  const [tries, setTries] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadTravelInfo().then(
      (x) => {
        if (!alive) return;
        setD(x);
        setFailed(false);
        setLoading(false);
      },
      (e) => {
        if (!alive) return;
        console.warn(e);
        setFailed(true);
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, [tries]);
  const retry = useCallback(() => setTries((n) => n + 1), []);
  return { info: d, failed, loading, retry };
}

export function useTravelInfo(): TravelInfo | null {
  return useTravelInfoState().info;
}
