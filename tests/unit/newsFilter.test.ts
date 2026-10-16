import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTravelNews } from '../../src/lib/newsFilter';

test('여행 소식 거르기: 축제·명소는 남기고 사건·재난·정치는 뺀다', () => {
  assert.ok(isTravelNews({ title: '강릉 커피축제 10월 개막…바다 보며 즐기는 한 잔' }));
  assert.ok(isTravelNews({ title: '제주 가을 억새 명소 5곳' }));
  assert.ok(!isTravelNews({ title: '제주 해안도로서 렌터카 사고…2명 사망' }));
  assert.ok(!isTravelNews({ title: '태풍 북상에 강릉 해수욕장 통제' }));
  assert.ok(!isTravelNews({ title: '전주시의원 후보 토론회' }));
});
