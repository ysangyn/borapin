/**
 * 꽃 도감 자료 만들기: data/flowers-raw.json(위키백과에서 모은 것) → src/data/flowers.json
 * 꽃 이름을 그림 종류(scripts/flowers-build.ts의 KINDS)에 맞춘다. 맞는 그림이 없으면 이름은 그대로, 그림은 들꽃.
 * 위키백과 칸이 비었거나 틀린 곳은 아래 FIX에 사람이 적는다(출처: 각 시·군 누리집).
 *
 *   npx tsx scripts/flowers-normalize.ts <flowers-raw.json 경로>
 */
import fs from 'node:fs';
import path from 'node:path';
import { KINDS } from './flowers-build';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = process.argv[2] ?? path.join(ROOT, 'data/flowers-raw.json');
const OUT = path.join(ROOT, 'src/data/flowers.json');

/** 사람이 고친 것 (코드 → 꽃 이름) */
export const FIX: Record<string, string> = {
  '51780': '철쭉', // 철원군: 위키백과 영문(Cheorwon County, Symbols: County flower Royal Azalea) — 한국어 문서엔 칸이 없음
  '41390': '연꽃', // 시흥시: 시화 지정을 2003년에 폐지(서울신문) — 관곡지·연꽃테마파크의 대표 꽃으로 (공식 아님, NOTE에 적음)
};
/** 공식 시화가 아닌 곳의 한 줄 (화면에 '대표 꽃'으로 보인다) */
export const NOTE: Record<string, string> = {
  '41390': '공식 시화는 2003년에 폐지 · 관곡지 연꽃이 대표해요',
};

const ALIAS = new Map<string, string>();
for (const k of KINDS) for (const n of k.ko) ALIAS.set(n, k.id);

/** '철쭉, 진달래' · '철쭉(Rhododendron)' · '영산홍 [1]' → 첫 꽃 이름 하나 */
export function firstFlower(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.replace(/\(.*?\)|\[.*?\]|（.*?）/g, ' ').split(/[,，·、\/및와과]|\s{2,}|<br/)[0]?.trim();
  return t && t.length <= 8 ? t : null;
}
export function iconOf(name: string): string {
  if (ALIAS.has(name)) return ALIAS.get(name)!;
  const hit = [...ALIAS.keys()].sort((a, b) => b.length - a.length).find((k) => name.includes(k) || k.includes(name));
  return hit ? ALIAS.get(hit)! : 'wild';
}

function main() {
  const raw = JSON.parse(fs.readFileSync(RAW, 'utf8')) as { kr: Record<string, { name: string; flower?: string | null }>; world: Record<string, string> };
  const kr: Record<string, { name: string; icon: string; note?: string }> = {};
  const miss: string[] = [];
  for (const [code, r] of Object.entries(raw.kr)) {
    const name = FIX[code] ?? firstFlower(r.flower);
    if (!name) { miss.push(`${code} ${r.name}`); continue; }
    kr[code] = { name, icon: iconOf(name), ...(NOTE[code] ? { note: NOTE[code] } : {}) };
  }
  // 나라꽃: 목록 표를 제대로 못 읽었으면(20나라 미만) 비워 둔다 — 반쪽짜리 '세계' 칸을 보이지 않게
  const world: Record<string, { name: string; icon: string }> = {};
  if (Object.keys(raw.world).length >= 20) for (const [id, v] of Object.entries(raw.world)) {
    const en = v.split('|')[0].trim();
    if (en) world[id] = { name: en, icon: 'wild' };
  }
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), source: '위키백과(각 시·군 문서 정보 상자) · 사람 확인', kr, world }, null, 1) + '\n');
  const wildKr = Object.entries(kr).filter(([, v]) => v.icon === 'wild').map(([c, v]) => `${c}:${v.name}`);
  console.log(`국내 ${Object.keys(kr).length}/160 · 그림 없음(들꽃) ${wildKr.length}: ${wildKr.join(' ')}\n빠진 곳 ${miss.length}: ${miss.join(', ')}\n나라 ${Object.keys(world).length}`);
}
if (process.argv[1]?.endsWith('flowers-normalize.ts')) main();
