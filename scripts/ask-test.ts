/**
 * 찾아보기 채점: tests/ask/cases.ts의 질문을 모두 물어보고 맞힌 비율을 낸다.
 * 기준(95%)보다 낮으면 실패 → CI에서 배포가 멈춘다.
 */
import travelinfo from '../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../src/data/seasons.json' with { type: 'json' };
import world from '../src/data/world.json' with { type: 'json' };
import { ask, type AskCtx, type AskData } from '../src/lib/ask/engine';
import { placeParam } from '../src/lib/geo';
import type { Note, PlaceRec, Trip, Wish } from '../src/lib/types';
import type { FestivalData } from '../src/lib/festivals';
import { CASES } from '../tests/ask/cases';
import { setMembers } from '../src/lib/members';

// 채점용 공간: 보라·영상 두 사람
setMembers([{ email: 'ysangyn@gmail.com', name: '영상' }, { email: 'bora@example.com', name: '보라' }]);

const T = (id: string, title: string, places: Trip['places'], when: Trip['when'], extra: Partial<Trip> = {}): Trip =>
  ({ id, title, kind: 'trip', status: 'done', when, places, companions: ['보라', '영상'], memo: '', tags: [], source: 'app', v: 1, ...extra }) as Trip;
const trips: Trip[] = [
  T('t1', '강릉시 여행', [{ t: 'kr', code: '51150' }], { p: 'day', y: 2019, m: 5, d: 3, d2: 4 }, { companions: ['보라', '영상', '엄마'] }),
  T('t2', '부산 여행', [{ t: 'kr', code: '26' }], { p: 'year', y: 2021 }),
  T('t3', '교토 단풍 여행', [{ t: 'country', id: 'JPN', city: '교토' }], { p: 'season', y: 2025, s: 'autumn' }),
  T('t4', '속초 여름 바다', [{ t: 'kr', code: '51210' }], { p: 'month', y: 2024, m: 8 }),
  T('t5', '제주 여행', [{ t: 'kr', code: '50' }], { p: 'year', y: 2026 }, { status: 'planned' }),
];
const recs: PlaceRec[] = [
  { id: 'r1', name: '초당할머니순두부', kind: 'food', region: { t: 'kr', code: '51150' }, reviews: { 영상: '최고' }, verdict: 'again', v: 1 } as PlaceRec,
];
const wishes: Wish[] = [{ id: 'w1', place: { t: 'kr', code: '50' }, priority: 1, spots: [], todos: [], foods: [], note: '', source: 'app', v: 1 } as Wish];
const notes: Note[] = [{ id: 'n1', tripId: 't1', text: '바다 보며 커피 마신 날', by: { uid: 'u', name: '영상' }, v: 1 }];
const festivals: FestivalData = { updated: '2026-10-16', cells: { '51150': [{ t: '강릉커피축제', s: '20261023', e: '20261026', id: 'f1' }], '50': [{ t: '제주 올레걷기축제', s: '20261105', e: '20261107', id: 'f2' }], '26': [{ t: '부산불꽃축제', s: '20261017', e: '20261017', id: 'f3' }] } };
const data: AskData = { trips, wishes, recs, notes, festivals, info: travelinfo as never, seasons: seasons as never, world: world as never, now: new Date('2026-10-16T12:00:00+09:00') };

let ok = 0;
const fails: string[] = [];
for (const c of CASES) {
  let ctx: AskCtx = {};
  if (c.after) ctx = ask(c.after, {}, data).ctx;
  const a = ask(c.q, ctx, data);
  const all = [a.text, ...(a.lines ?? []), ...a.buttons.map((b) => b.label)].join(' / ');
  const problems: string[] = [];
  if (a.intent !== c.intent) problems.push(`틀: ${a.intent} (기대 ${c.intent})`);
  if (c.place && (!a.ctx.place || placeParam(a.ctx.place).split(':').slice(0, 2).join(':') !== c.place)) problems.push(`장소: ${a.ctx.place ? placeParam(a.ctx.place) : '없음'} (기대 ${c.place})`);
  if (c.has && !all.includes(c.has)) problems.push(`'${c.has}' 없음`);
  if (problems.length) fails.push(`✗ "${c.q}" → ${problems.join(', ')}\n    답: ${all.slice(0, 160)}`);
  else ok++;
}
const pct = Math.round((ok / CASES.length) * 1000) / 10;
console.log(`찾아보기 채점: ${ok}/${CASES.length} (${pct}%)`);
for (const f of fails) console.log(f);
if (pct < 95) {
  console.error('✗ 기준(95%)보다 낮아요');
  process.exit(1);
}
