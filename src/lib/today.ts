/**
 * 여행 중 '오늘': 그날 일정에서 다음 갈 곳, 거기까지 걸어서·차로 몇 분, 해 지는 시각.
 * 모두 폰 안에서 계산한다 (바깥 지도·날씨 서비스를 부르지 않아 인터넷이 끊겨도 된다).
 */
import type { PlanItem } from './types';

type Item = Pick<PlanItem, 'id' | 'name' | 'day' | 'time' | 'done' | 'order'> & Partial<Pick<PlanItem, 'kind' | 'lat' | 'lng' | 'img' | 'by'>>;

const mins = (t: string | null | undefined) => { const m = t ? /^(\d{1,2}):(\d{2})/.exec(t) : null; return m ? +m[1] * 60 + +m[2] : null; };

/** 그날 일정: 시각 있는 것은 시각 순, 시각 없는 것은 원래 순서대로 뒤에 */
export function todayList<T extends Item>(plan: T[], day: string): T[] {
  const list = plan.filter((p) => p.day === day);
  const timed = list.filter((p) => mins(p.time) != null).sort((a, b) => mins(a.time)! - mins(b.time)! || a.order - b.order);
  const rest = list.filter((p) => mins(p.time) == null).sort((a, b) => a.order - b.order);
  return [...timed, ...rest];
}

/**
 * 오늘 다닐 곳: 오늘로 정한 곳(today) → 없으면 날짜 안 정한 곳(loose)
 * → 그것도 없으면 아직 안 간 곳을 날짜·시각 순으로(left: 여행 날짜를 옮겨 일정 날짜가 어긋났을 때)
 */
export function todayPool<T extends Item>(plan: T[], day: string): { list: T[]; mode: 'today' | 'loose' | 'left' } {
  const list = todayList(plan, day);
  if (list.length) return { list, mode: 'today' };
  const loose = plan.filter((p) => !p.day).sort((a, b) => a.order - b.order);
  if (loose.length) return { list: loose, mode: 'loose' };
  const days = [...new Set(plan.filter((p) => !p.done && p.day).map((p) => p.day!))].sort();
  return { list: days.flatMap((d) => todayList(plan, d).filter((p) => !p.done)), mode: 'left' };
}

/** 다음 갈 곳: 아직 안 간 첫 곳. 숙소는 다른 곳을 다 다닌 뒤에 (체크인 시각이 낮이어도 구경이 먼저) */
export function nextStop<T extends Item>(list: T[]): T | null {
  const open = list.filter((p) => !p.done);
  return open.find((p) => p.kind !== 'stay') ?? open[0] ?? null;
}

interface Pt { lat?: number | null; lng?: number | null }
export function km(a: Pt, b: Pt): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 이동 어림: 1.2km까지는 걸어서(시속 4.5km), 그 위는 차로(시속 40km + 주차·출발 5분). 길이 굽은 만큼 1.3배 */
export function moveGuess(a: Pt, b: Pt): { mode: 'walk' | 'car'; min: number; km: number } | null {
  const d = km(a, b);
  if (d == null) return null;
  const road = d * 1.3;
  if (d <= 1.2) return { mode: 'walk', min: Math.max(1, Math.round((road / 4.5) * 60)), km: Math.round(road * 10) / 10 };
  return { mode: 'car', min: Math.round((road / 40) * 60 + 5), km: Math.round(road * 10) / 10 };
}

/** 해 지는 시각 (NOAA 간단식, 몇 분 오차). 그날 해가 지지 않으면 null */
export function sunsetAt(lat: number, lng: number, date: Date): Date | null {
  const rad = Math.PI / 180;
  const day0 = Date.UTC(date.getUTCFullYear(), 0, 0);
  const doy = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - day0) / 86400000);
  const g = (2 * Math.PI / 365) * (doy - 1 + 0.5);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const cosH = Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl);
  if (cosH < -1 || cosH > 1) return null;
  const ha = Math.acos(cosH) / rad;
  const utcMin = 720 - 4 * (lng - ha) - eqt;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) + utcMin * 60000);
}

export const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** 도착했어요로 새 기록을 만들 때: 일정 종류 → 장소 종류 (먹을 곳=맛집, 살 곳=가게, 그 밖=볼거리) */
export function arriveKind(kind: PlanItem['kind']): 'food' | 'shop' | 'sight' {
  return kind === 'eat' ? 'food' : kind === 'buy' ? 'shop' : 'sight';
}

const nextDay = (day: string) => { const d = new Date(`${day}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };

/** 하루 끝: 오늘 다녀온 곳(시각 순)·오늘 찍은 사진·내일 첫 일정 */
export function nightOf<T extends Item, P extends { id: string; taken: string | null }>(plan: T[], photos: P[], day: string): { went: T[]; photos: P[]; tomorrow: T | null } {
  return {
    went: todayList(plan, day).filter((p) => p.done),
    photos: photos.filter((p) => p.taken?.slice(0, 10) === day),
    tomorrow: todayList(plan, nextDay(day)).find((p) => p.kind !== 'stay') ?? null,
  };
}
