import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bodyAfterLead, chipValue, cleanText, leadLine } from '../../src/lib/spotText';

test('꼬리표·줄바꿈 표시를 걷어 낸다', () => {
  assert.equal(cleanText('바다가<br />보이는 &nbsp; 마을'), '바다가 보이는 마을');
});

test('한 줄 소개는 첫 문장', () => {
  assert.equal(leadLine('감천문화마을은 산비탈 계단식 마을이다. 1950년대 피란민이 모여 살았다.'), '감천문화마을은 산비탈 계단식 마을이다.');
});

test('첫 문장이 길면 끊고 …', () => {
  const s = leadLine('가'.repeat(100));
  assert.equal(s.length, 60);
  assert.ok(s.endsWith('…'));
});

test('본문이 한 줄 소개와 거의 같으면 본문은 비운다', () => {
  const t = '짧은 소개 한 문장이다.';
  assert.equal(bodyAfterLead(t, leadLine(t)), '');
  const long = '첫 문장이다. 그리고 아주 긴 뒷이야기가 이어지는데 이건 본문으로 보여 줘야 한다.';
  assert.equal(bodyAfterLead(long, leadLine(long)), long);
});

test('칩 값은 첫 덩어리만 짧게', () => {
  assert.equal(chipValue('09:00~18:00 (입장 마감 17:00)'), '09:00~18:00');
  assert.equal(chipValue('매주 월요일 / 1월 1일'), '매주 월요일');
  assert.equal(chipValue('가능(무료)'), '가능');
  assert.equal(chipValue(''), '');
  assert.equal(chipValue('아주아주아주아주아주아주 긴 값이에요'), '아주아주아주아주아주아주 긴…');
});
