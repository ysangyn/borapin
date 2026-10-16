/**
 * 영어 공부: 간격 반복(라이트너 상자) + 하루 10문장 뽑기. Firebase 없는 순수 모듈.
 * - 상자 0(새 것) → 1(1일 뒤) → 2(3일) → 3(7일) → 4(14일) → 5(30일) → 6(60일, 사실상 외움)
 * - 틀리면 상자를 두 칸 내린다(0 아래로는 안 감). 매일: 복습할 것(기한 지난 것) 먼저, 모자라면 새 것으로 채운다.
 */
import bank from '../../data/english.json';

export interface Item { id: string; en: string; ko: string; words: [string, string][]; topic: string; topicLabel: string }
export interface Progress { box: number; due: string; seen: number; right: number; wrong: number; saved?: boolean }
export type ProgressMap = Record<string, Progress>;

const DAYS = [0, 1, 3, 7, 14, 30, 60];
export const MAX_BOX = DAYS.length - 1;

export const ITEMS: Item[] = (bank as { topics: { id: string; label: string; items: { id: string; en: string; ko: string; words: [string, string][] }[] }[] }).topics
  .flatMap((t) => t.items.map((i) => ({ ...i, topic: t.id, topicLabel: t.label })));
export const TOPICS = (bank as { topics: { id: string; label: string }[] }).topics.map((t) => ({ id: t.id, label: t.label }));
export const itemById = (id: string) => ITEMS.find((i) => i.id === id);

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** 날짜 글자로 고정 섞기: 같은 날엔 같은 순서 (둘이 같은 10문장을 본다) */
function seeded<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 오늘 공부할 문장: 기한 지난 복습 최대 7개 + 새 문장 3개 (주제가 겹치지 않게).
 * 양을 작게 두는 게 매일 하게 하는 비결. 더 하고 싶으면 extra로 새 문장을 3개씩 더.
 */
export const DAILY_NEW = 3;
export const DAILY_REVIEW = 7;
export function todaySet(progress: ProgressMap, today = new Date(), extra = 0): Item[] {
  const t = ymd(today);
  const due = ITEMS.filter((i) => progress[i.id] && progress[i.id].due <= t && progress[i.id].box < MAX_BOX).sort((a, b) => progress[a.id].due.localeCompare(progress[b.id].due) || progress[a.id].box - progress[b.id].box);
  // 오늘 이미 본 새 문장(상자 0→1로 올라간 것)은 같은 날 다시 보여 흐름이 끊기지 않게
  const seenToday = ITEMS.filter((i) => progress[i.id] && progress[i.id].due > t && progress[i.id].seen === 1 && progress[i.id].box <= 1 && !due.includes(i));
  const fresh = seeded(ITEMS.filter((i) => !progress[i.id]), `fresh-${t}`);
  const picked: Item[] = [...due.slice(0, DAILY_REVIEW)];
  const wantNew = Math.max(0, DAILY_NEW + extra - seenToday.length);
  const topics = new Set<string>(picked.map((i) => i.topic));
  const news: Item[] = [];
  for (const i of fresh) { if (news.length >= wantNew) break; if (!topics.has(i.topic)) { news.push(i); topics.add(i.topic); } }
  for (const i of fresh) { if (news.length >= wantNew) break; if (!news.includes(i)) news.push(i); }
  return [...picked, ...seenToday.slice(0, DAILY_NEW + extra), ...news];
}

/** 답한 결과 반영: 맞으면 한 상자 위로, 틀리면 두 상자 아래로 */
export function grade(progress: ProgressMap, id: string, correct: boolean, today = new Date()): ProgressMap {
  const p = progress[id] ?? { box: 0, due: ymd(today), seen: 0, right: 0, wrong: 0 };
  const box = correct ? Math.min(MAX_BOX, p.box + 1) : Math.max(0, p.box - 2);
  return { ...progress, [id]: { ...p, box, due: ymd(addDays(today, DAYS[box])), seen: p.seen + 1, right: p.right + (correct ? 1 : 0), wrong: p.wrong + (correct ? 0 : 1) } };
}

export const toggleSaved = (progress: ProgressMap, id: string, today = new Date()): ProgressMap => {
  const p = progress[id] ?? { box: 0, due: ymd(today), seen: 0, right: 0, wrong: 0 };
  return { ...progress, [id]: { ...p, saved: !p.saved } };
};

/** 4지선다 보기: 정답 + 같은 주제 우선 오답 3개 */
export function choices(item: Item, seed: string): Item[] {
  const same = ITEMS.filter((i) => i.id !== item.id && i.topic === item.topic);
  const other = ITEMS.filter((i) => i.id !== item.id && i.topic !== item.topic);
  const pool = [...seeded(same, seed).slice(0, 2), ...seeded(other, seed + 'o')].slice(0, 3);
  return seeded([item, ...pool], seed + 'c');
}

/** 빈칸 문제: 핵심 단어 자리를 ___ 로 */
export function cloze(item: Item): { text: string; answer: string } | null {
  const w = item.words[0]?.[0];
  if (!w) return null;
  const head = w.split(' (')[0];
  const re = new RegExp(head.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (!re.test(item.en)) return null;
  return { text: item.en.replace(re, '＿＿＿'), answer: item.en.match(re)![0] };
}

/** 말하기 채점: 낱말 단위 일치율 (0~1) */
export function speakScore(target: string, heard: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
  const a = norm(target), b = new Set(norm(heard));
  if (!a.length) return 0;
  return a.filter((w) => b.has(w)).length / a.length;
}

export interface Summary { learned: number; learning: number; saved: number; streak: number; dueToday: number }
/** 요약: 외운 것(상자 5 이상), 공부 중, 단어장, 연속 학습일 */
export function summary(progress: ProgressMap, days: string[], today = new Date()): Summary {
  const vals = Object.values(progress);
  const t = ymd(today);
  let streak = 0;
  const set = new Set(days);
  for (let d = new Date(today); set.has(ymd(d)); d = addDays(d, -1)) streak++;
  if (!set.has(t) && set.has(ymd(addDays(today, -1)))) { streak = 0; for (let d = addDays(today, -1); set.has(ymd(d)); d = addDays(d, -1)) streak++; }
  return {
    learned: vals.filter((p) => p.box >= 5).length,
    learning: vals.filter((p) => p.box > 0 && p.box < 5).length,
    saved: vals.filter((p) => p.saved).length,
    streak,
    dueToday: ITEMS.filter((i) => progress[i.id] && progress[i.id].due <= t && progress[i.id].box < MAX_BOX).length,
  };
}
