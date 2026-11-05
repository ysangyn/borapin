import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arrived, isSealed, openLabel, yearLater } from '../../src/lib/capsule';

test('1년 뒤 같은 날, 윤년 2월 29일은 2월 28일', () => {
  assert.equal(yearLater(new Date(2026, 9, 28)), '2027-10-28');
  assert.equal(yearLater(new Date(2028, 1, 29)), '2029-02-28');
});

test('열리는 날 전엔 봉투, 그날부터 열림', () => {
  const now = new Date(2027, 9, 27);
  assert.equal(isSealed({ openAt: '2027-10-28' }, now), true);
  assert.equal(isSealed({ openAt: '2027-10-28' }, new Date(2027, 9, 28)), false);
  assert.equal(isSealed({}, now), false);
  assert.equal(openLabel('2027-10-28'), '2027년 10월 28일');
});

test('홈 봉투: 날이 지났고 안 연 것 중 가장 오래 기다린 것', () => {
  const now = new Date(2027, 11, 1);
  const ns = [{ id: 'a', openAt: '2027-11-20' }, { id: 'b', openAt: '2027-10-28' }, { id: 'c', openAt: '2028-01-01' }, { id: 'd' }];
  assert.equal(arrived(ns, new Set(), now)?.id, 'b');
  assert.equal(arrived(ns, new Set(['b']), now)?.id, 'a');
  assert.equal(arrived(ns, new Set(['a', 'b']), now), null);
});

test('여행 표지 한 줄: 봉한 타임캡슐은 건너뛰고 열린 글 중 가장 최근 것', async () => {
  const { coverNoteOf } = await import('../../src/lib/capsule');
  const now = new Date(2026, 10, 5);
  const notes = [{ id: 'a', text: '1년 뒤 우리에게 비밀', openAt: '2027-11-05' }, { id: 'b', text: '바다 좋았다', openAt: undefined }];
  assert.equal(coverNoteOf(notes, now)?.id, 'b');
  assert.equal(coverNoteOf([notes[0]], now), null);
});
