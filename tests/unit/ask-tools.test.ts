import { test } from 'node:test';
import assert from 'node:assert/strict';
import travelinfo from '../../src/data/travelinfo.json' with { type: 'json' };
import seasons from '../../src/data/seasons.json' with { type: 'json' };
import { runTools } from '../../src/lib/ask/tools';
import type { AskData } from '../../src/lib/ask/engine';
import type { PlaceRec, Trip } from '../../src/lib/types';

const trips: Trip[] = [{ id: 't1', title: '강릉시 여행', kind: 'trip', status: 'done', when: { p: 'day', y: 2019, m: 5, d: 3 }, places: [{ t: 'kr', code: '51150' }], companions: ['보라', '영상'], memo: '', tags: [], source: 'app', v: 1 }];
const recs = [{ id: 'r1', name: '초당할머니순두부', kind: 'food', region: { t: 'kr', code: '51150' }, reviews: { 영상: '최고' }, verdict: 'again', v: 1 } as unknown as PlaceRec];
const d: AskData = { trips, wishes: [], recs, notes: [], festivals: { updated: '2026-10-16', cells: { '51150': [{ t: '강릉커피축제', s: '20261023', e: '20261026', id: 'f' }] } }, info: travelinfo as never, seasons: seasons as never, now: new Date(2026, 9, 16) };

test('도구: 지명을 맞추고 여행정보·우리 기록·축제를 사실로 만든다 (단추는 id로)', () => {
  const f = runTools([
    { tool: 'resolve_place', args: { name: '강능' } },
    { tool: 'place_info', args: { place: '강릉' } },
    { tool: 'our_trips', args: { place: '강릉' } },
    { tool: 'our_places', args: { place: '강릉' } },
    { tool: 'festivals', args: { place: '강릉' } },
  ], d, null, new Date(2026, 9, 16));
  assert.match(f.text, /강원 강릉시/);
  assert.match(f.text, /안목 커피거리/);
  assert.match(f.text, /2019.*강릉시 여행/);
  assert.match(f.text, /초당할머니순두부.*또 갈래요/);
  assert.match(f.text, /강릉커피축제/);
  assert.ok(f.actions.some((x) => x.btn.label.includes('담기')));
  assert.ok(f.actions.every((x) => /^a\d+$/.test(x.id)));
});

test('도구: 모르는 지명은 앞 대화 지역을 쓰고, 추천은 조건대로', () => {
  const f = runTools([{ tool: 'recommend', args: { month: 10, themes: ['바다'], unvisited: true, count: 3 } }], d, { t: 'kr', code: '51150' });
  assert.match(f.text, /추천 후보 \(10월\) \(바다\) \(안 가본 곳\)/);
  assert.doesNotMatch(f.text, /강릉시 ·/);
});
