import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bankLoaded, choices, cloze, grade, ITEMS, loadBank, speakScore, summary, todaySet, ymd } from '../../src/lib/study/srs';

const day = (s: string) => new Date(s + 'T09:00:00');

test('문장 은행은 첫 묶음에 없다: 받기 전엔 비어 있고, loadBank()로 채워진다 (같은 배열을 채운다)', async () => {
  assert.equal(bankLoaded(), false);
  assert.equal(ITEMS.length, 0);
  assert.equal(todaySet({}, day('2026-10-17')).length, 0);
  const got = await loadBank();
  assert.equal(bankLoaded(), true);
  assert.equal(got, ITEMS);
  assert.ok(ITEMS.length > 0);
});

test('문장 은행: 300문장 이상, 주제 30개, 빠진 칸 없음', async () => {
  await loadBank();
  assert.ok(ITEMS.length >= 300);
  assert.ok(new Set(ITEMS.map((i) => i.topic)).size >= 30);
  for (const i of ITEMS) { assert.ok(i.en && i.ko && i.words.length >= 1, i.id); assert.ok(/[a-z]/i.test(i.en)); }
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
});

test('오늘 묶음: 처음엔 새 문장 3개(주제 안 겹침), 같은 날엔 같은 묶음, 더 보기로 3개씩 추가', async () => {
  await loadBank();
  const a = todaySet({}, day('2026-10-17'));
  const b = todaySet({}, day('2026-10-17'));
  assert.equal(a.length, 3);
  assert.deepEqual(a.map((i) => i.id), b.map((i) => i.id));
  assert.equal(new Set(a.map((i) => i.topic)).size, 3);
  assert.notDeepEqual(a.map((i) => i.id), todaySet({}, day('2026-10-18')).map((i) => i.id));
  assert.equal(todaySet({}, day('2026-10-17'), 3).length, 6);
});

test('간격 반복: 맞으면 1→3→7일 뒤, 틀리면 두 상자 내려감, 복습이 새 것보다 먼저', async () => {
  await loadBank();
  let p = grade({}, 'ap1', true, day('2026-10-17'));
  assert.equal(p.ap1.box, 1); assert.equal(p.ap1.due, '2026-10-18');
  p = grade(p, 'ap1', true, day('2026-10-18'));
  assert.equal(p.ap1.box, 2); assert.equal(p.ap1.due, '2026-10-21');
  p = grade(p, 'ap1', true, day('2026-10-21'));
  assert.equal(p.ap1.box, 3); assert.equal(p.ap1.due, '2026-10-28');
  p = grade(p, 'ap1', false, day('2026-10-28'));
  assert.equal(p.ap1.box, 1);
  // 기한이 지난 복습은 오늘 묶음 맨 앞, 그 뒤에 새 문장 3개
  const set = todaySet(p, day('2026-11-01'));
  assert.equal(set[0].id, 'ap1');
  assert.equal(set.length, 4);
  // 오늘 처음 본 새 문장은 외웠다고 눌러도 오늘 묶음에 그대로 남는다 (흐름 유지)
  const q = grade({}, 'ca1', true, day('2026-10-17'));
  assert.ok(todaySet(q, day('2026-10-17')).some((i) => i.id === 'ca1'));
});

test('4지선다는 정답 포함 4개, 빈칸은 핵심 단어 자리', async () => {
  await loadBank();
  const it = ITEMS.find((i) => i.id === 're2')!;
  const c = choices(it, 'seed');
  assert.equal(c.length, 4);
  assert.ok(c.some((x) => x.id === 're2'));
  assert.equal(new Set(c.map((x) => x.id)).size, 4);
  const z = cloze(it)!;
  assert.equal(z.text, 'What do you ＿＿＿?');
  assert.equal(z.answer, 'recommend');
});

test('말하기 채점과 요약(연속 학습일)', async () => {
  await loadBank();
  assert.equal(speakScore('Could I have a window seat, please?', 'could i have a window seat please'), 1);
  assert.ok(speakScore('Could I have a window seat, please?', 'window seat') < 0.5);
  const p = grade(grade({}, 'ap1', true, day('2026-10-17')), 'ap2', true, day('2026-10-17'));
  const s = summary(p, ['2026-10-15', '2026-10-16', '2026-10-17'], day('2026-10-17'));
  assert.equal(s.streak, 3);
  assert.equal(s.learning, 2);
  assert.equal(ymd(day('2026-10-17')), '2026-10-17');
});
