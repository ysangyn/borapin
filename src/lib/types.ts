import type { Timestamp } from 'firebase/firestore';

export type Precision = 'day' | 'month' | 'season' | 'year' | 'unknown';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/** 기억이 흐릿해도 남길 수 있도록, 아는 만큼만 채우는 날짜 */
export interface When {
  p: Precision;
  y?: number;
  m?: number;
  d?: number;
  /** 끝나는 날(같은 해·달이면 생략 가능) */
  y2?: number;
  m2?: number;
  d2?: number;
  s?: Season;
}

export type Place =
  | { t: 'kr'; code: string }
  | { t: 'country'; id: string; city?: string };

export type TripKind = 'trip' | 'outing';
export type TripStatus = 'done' | 'planned';

export interface Trip {
  id: string;
  title: string;
  kind: TripKind;
  status: TripStatus;
  when: When;
  places: Place[];
  companions: string[];
  memo: string;
  tags: string[];
  source: 'app' | 'v22';
  createdBy?: { uid: string; email: string; name: string };
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  v: 1;
}

export type TripInput = Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'v'>;

export interface Wish {
  id: string;
  place: Place;
  note: string;
  todos: string[];
  foods: string[];
  spots: string[];
  priority: number | null;
  source: 'app' | 'v22';
  v: 1;
}

export interface Access {
  allowed: string[];
  admins: string[];
}
