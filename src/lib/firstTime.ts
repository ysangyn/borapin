/**
 * '처음 가 보는 나라' 한 장 (사용자 의견 11-21: 브루나이처럼 처음 가는 곳은 판단할 거리가 없다).
 * 일정 예시는 손으로 쓴 src/data/firsttime.json이 먼저 — AI를 부르지 않아 비용·한도가 없고 내용을 미리 확인할 수 있다.
 * 없는 도시는 뒷단 /itinerary(Workers AI 무료 한도, 30일 캐시)가 '초안'으로 만든다.
 */
import data from '../data/firsttime.json';
import { cityFor, type WorldCity, type WorldData } from './world';
import type { Place } from './types';

export interface DayPlan { title: string; where: string; note: string }
export interface FirstPlan { know: string; d2: string[][]; d4: string[][] }
const PLANS = (data as { plans: Record<string, FirstPlan> }).plans;

export function firstPlanFor(world: WorldData | null, place: Place): { city: WorldCity; plan: FirstPlan | null } | null {
  if (place.t !== 'country') return null;
  const city = cityFor(world, place);
  if (!city) return null;
  return { city, plan: PLANS[`${city.c}:${city.city}`] ?? null };
}

export function planDays(p: FirstPlan, nights: 2 | 4): DayPlan[] {
  return (nights === 2 ? p.d2 : p.d4).map(([title, where, note]) => ({ title, where, note: note ?? '' }));
}

/**
 * 손으로 쓴 일정이 없는 도시: 도시 자료의 볼거리 셋·먹을 것 셋으로 짠 간단한 뼈대.
 * AI를 부르지 않아 없는 곳 이름을 지어낼 일이 없다 (화면엔 '도시 자료로 짠 뼈대'라고 밝힌다).
 */
export function roughPlan(c: WorldCity): FirstPlan {
  const [s0, s1, s2] = c.see;
  const [e0, e1, e2] = c.eat;
  return {
    know: [c.lang, c.cur, c.plug ? `콘센트 ${c.plug}` : ''].filter(Boolean).join(' · '),
    d2: [['첫날', `${s0} → 저녁 ${e0}`, '도착한 날은 가볍게'], ['둘째 날', `${s1} → ${s2}`, ''], ['셋째 날', `시내 산책 → ${e1} → 공항`, '']],
    d4: [['첫날', `시내 산책 → 저녁 ${e0}`, '도착한 날은 가볍게'], ['둘째 날', s0, ''], ['셋째 날', s1, ''], ['넷째 날', `${s2} → ${e1}`, ''], ['다섯째 날', `${e2} → 공항`, '']],
  };
}

/** '이 일정으로 계획하기': 날마다 '→'로 이은 곳을 하나씩 일정으로 (날짜를 알면 그날로, 한 줄은 첫 곳에) */
export function planItems(p: FirstPlan, nights: 2 | 4, start: Date | null): { day: string | null; time: null; name: string; info: string }[] {
  const out: { day: string | null; time: null; name: string; info: string }[] = [];
  planDays(p, nights).forEach((d, i) => {
    let day: string | null = null;
    if (start) { const t = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i); day = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; }
    d.where.split(' → ').map((x) => x.replace(/^저녁 /, '').trim()).filter((x) => x && x !== '공항').forEach((name, j) => out.push({ day, time: null, name: name.slice(0, 80), info: j === 0 ? d.note : '' }));
  });
  return out;
}
