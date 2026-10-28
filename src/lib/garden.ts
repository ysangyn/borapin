import type { PlaceRec, Trip } from './types';

/**
 * 심는 지도 (설계서 C1): 다녀온 칸마다 식물이 자란다. 다시 간 횟수가 아니라 '그곳에 남긴 마음'으로.
 * 다녀온 칸은 한 번만 가도 꽃이 핀다(지도 무늬). 단계는 꽃의 양:
 * - 씨앗(꽃 몇 송이): 핀만 꽂음
 * - 새싹(꽃이 늘어남): 누군가 마음을 하나 남김 (한 줄 평 한 사람, 또는 여행 메모, 또는 장소 기록)
 * - 꽃:   마음이 둘 이상 (두 사람의 한 줄 평, 한 줄 평 + 메모 …) — 혼자 쓰는 공간도 같은 규칙으로 핀다
 * 새싹이 한 사람의 한 줄 평이면 그 사람 색 테두리 ('나도 한 줄 써야지'의 전부, 알림·숙제 없음).
 * 사진·글 수는 읽기 횟수가 늘어 아직 넣지 않았다(이미 받아 둔 여행·장소 자료만 쓴다).
 * 꽃 종류(고장의 꽃)는 꽃 도감(C2)에서, 지금은 들꽃.
 */
export type Stage = 'seed' | 'sprout' | 'flower';
export interface Plant { code: string; stage: Stage; visits: number; by: string[]; years: number[] }

export function garden(trips: Trip[], recs: PlaceRec[]): Map<string, Plant> {
  const out = new Map<string, Plant>();
  const memo = new Set<string>();
  for (const t of trips) {
    if (t.status !== 'done') continue;
    const codes = [...new Set(t.places.flatMap((p) => (p.t === 'kr' ? [p.code] : [])))];
    for (const code of codes) {
      const p = out.get(code) ?? { code, stage: 'seed' as Stage, visits: 0, by: [], years: [] };
      p.visits++;
      if (t.when.y && !p.years.includes(t.when.y)) p.years.push(t.when.y);
      out.set(code, p);
      if (t.memo?.trim()) memo.add(code);
    }
  }
  const reviewers = new Map<string, Set<string>>();
  const plain = new Set<string>(); // 한 줄 평 없이 장소만 남긴 칸
  for (const r of recs) {
    if (r.region.t !== 'kr' || !out.has(r.region.code)) continue;
    const who = Object.entries(r.reviews ?? {}).filter(([, v]) => v?.trim()).map(([k]) => k);
    if (who.length) { const s = reviewers.get(r.region.code) ?? new Set<string>(); who.forEach((w) => s.add(w)); reviewers.set(r.region.code, s); }
    else plain.add(r.region.code);
  }
  for (const p of out.values()) {
    const by = [...(reviewers.get(p.code) ?? [])].sort();
    const score = by.length + (memo.has(p.code) ? 1 : 0) + (plain.has(p.code) ? 1 : 0);
    p.by = by;
    p.stage = score >= 2 ? 'flower' : score === 1 ? 'sprout' : 'seed';
    p.years.sort();
  }
  return out;
}

/** 지도 무늬 이름: 단계 + 촘촘함(두 번 이상 가면 촘촘) */
export const patternOf = (p: Plant) => `g-${p.stage}-${p.visits > 1 ? 2 : 1}`;

/** 지역 창 한 줄: '꽃이 피었어요 · 2019 · 2024' */
export function plantLine(p: Plant | undefined): string | null {
  if (!p) return null;
  const head = p.stage === 'flower' ? '꽃이 가득 피었어요' : p.stage === 'sprout' ? (p.by.length === 1 ? `${p.by[0]}의 마음으로 꽃이 늘었어요` : '꽃이 늘었어요') : '꽃이 피기 시작했어요';
  return [head, ...p.years.slice(-3)].join(' · ');
}
/** 다음 단계로 가는 말 (씨앗·새싹일 때만) */
export function growHint(p: Plant | undefined, me: string): string | null {
  if (!p || p.stage === 'flower') return null;
  if (p.stage === 'seed') return '한 줄 평이나 메모를 남기면 꽃이 늘어요';
  return p.by.length === 1 && p.by[0] !== me ? '나도 한 줄 남기면 꽃이 가득 피어요' : '마음을 하나 더 남기면 꽃이 가득 피어요';
}
