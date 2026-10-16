import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, questionFor, questionText } from '../../src/lib/askOfDay';

test('질문 은행: 번호가 겹치지 않고 모두 {place} 자리가 있다', () => {
  assert.ok(QUESTIONS.length >= 60);
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (const q of QUESTIONS) {
    assert.ok(q.t.includes('{place}'), q.id);
    assert.ok(q.t.length <= 60, `${q.id} 너무 길어요: ${q.t}`);
    if (q.save) assert.ok(['foods', 'spots', 'todos'].includes(q.save));
  }
  // 메모로 들어가는 질문이 절반쯤은 되어야 '준비'가 쌓인다
  assert.ok(QUESTIONS.filter((q) => q.save).length >= 25);
});

test('같은 날은 같은 질문, 60일 동안은 겹치지 않는다', () => {
  assert.equal(questionFor('2026-10-17').id, questionFor('2026-10-17').id);
  const seen = new Set<string>();
  const d = new Date(Date.UTC(2026, 9, 17));
  for (let i = 0; i < QUESTIONS.length; i++) {
    const day = d.toISOString().slice(0, 10);
    const id = questionFor(day).id;
    assert.ok(!seen.has(id), `${day} 에 ${id} 가 또 나왔어요`);
    seen.add(id);
    d.setUTCDate(d.getUTCDate() + 1);
  }
});

test('이튿날 질문은 어제와 다르다 (1년 내내)', () => {
  const d = new Date(Date.UTC(2026, 0, 1));
  let prev = '';
  for (let i = 0; i < 366; i++) {
    const id = questionFor(d.toISOString().slice(0, 10)).id;
    assert.notEqual(id, prev);
    prev = id;
    d.setUTCDate(d.getUTCDate() + 1);
  }
});

test('질문 글에 지역 이름이 들어간다', () => {
  const q = { id: 'x', t: '{place}에서 꼭 먹고 싶은 것은?' };
  assert.equal(questionText(q, { t: 'kr', code: '51150' }), '강릉에서 꼭 먹고 싶은 것은?');
  assert.match(questionText(q, { t: 'country', id: 'JP', city: '오사카' }), /^오사카에서/);
  assert.match(questionText(q, { t: 'kr', code: '52770' }), /^순창에서/);
  assert.match(questionText(q, { t: 'kr', code: '11' }), /^서울에서/);
});
