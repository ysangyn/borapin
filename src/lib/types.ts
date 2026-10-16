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
  /** 사진 촬영일 등으로 채운 추정값 */
  est?: boolean;
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
  /** 준비물 (예정된 여행) */
  packing?: PackItem[];
  source: 'app' | 'v22';
  createdBy?: { uid: string; email: string; name: string };
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  v: 1;
}

export type TripInput = Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'v'>;

export type WishPriority = 1 | 2 | 3 | null;

/** 가고 싶은 곳. 버튼 하나로 여행이 되고, 다녀오면 '다녀왔어요'로 옮겨간다. */
export interface Wish {
  id: string;
  place: Place;
  /** 특정 가게·명소 이름 (선택) */
  spotName?: string;
  /** 누가 원해요: '보라' · '영상' */
  wantedBy?: string[];
  priority: WishPriority;
  /** 메모 3칸 */
  spots: string[];
  todos: string[];
  foods: string[];
  links?: string[];
  note: string;
  /** 직접 고친 가기 좋은 달 (없으면 앱이 계산한 값) */
  months?: number[];
  /** '여행 만들기'로 생긴 여행 */
  tripId?: string | null;
  source: 'app' | 'v22';
  createdBy?: { uid: string; email: string; name: string };
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  v: 1;
}

export type WishInput = Omit<Wish, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'v'>;

export type PlaceKind = 'food' | 'cafe' | 'sight' | 'stay' | 'shop' | 'etc';
export type Verdict = 'again' | 'once' | 'meh';

/** 우리 장소: 여행에서 기억에 남은 맛집·카페·명소 */
export interface PlaceRec {
  id: string;
  name: string;
  kind: PlaceKind;
  /** 어느 지역 (국내 시·군 / 해외 나라·도시) */
  region: Place;
  tripId?: string | null;
  /** 둘의 한 줄 평 */
  reviews: Record<string, string>;
  verdict: Verdict | null;
  naverUrl?: string;
  address?: string;
  memo?: string;
  createdBy?: { uid: string; email: string; name: string };
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  v: 1;
}
export type PlaceRecInput = Omit<PlaceRec, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'v'>;

/** 사진 한 장 (압축본 + 미리보기). 촬영 정보는 압축 전에 원본에서 읽어 둔다. */
export interface Photo {
  id: string;
  tripId: string | null;
  url: string;
  thumb: string;
  w: number;
  h: number;
  /** 촬영 현지 시각 '2019-05-03T14:20' */
  taken: string | null;
  tz?: string | null;
  /** 촬영 정보가 없어 파일 날짜로 추정 */
  takenGuess: boolean;
  lat?: number | null;
  lng?: number | null;
  /** 위치로 찾은 시·군·나라 */
  place?: Place | null;
  camera?: string | null;
  caption?: string;
  bytes: number;
  createdBy?: { uid: string; email: string; name: string };
  createdAt?: Timestamp | null;
  v: 1;
}

/** 일정 한 줄: 가볼 곳 → (원하면) 날짜 → (원하면) 시간·예약 정보 */
export interface PlanItem {
  id: string;
  tripId: string;
  name: string;
  order: number;
  day: string | null;
  time: string | null;
  info: string;
  recId?: string | null;
  done: boolean;
  createdAt?: Timestamp | null;
  v: 1;
}

/** 여행에 남기는 글. 누가 썼는지 보인다. */
export interface Note {
  id: string;
  tripId: string;
  text: string;
  by: { uid: string; name: string };
  createdAt?: Timestamp | null;
  v: 1;
}

export interface PackItem {
  t: string;
  who: string | null;
  done: boolean;
}

export interface Access {
  allowed: string[];
  admins: string[];
}
