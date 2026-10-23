import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grounded, rulesConfident } from '../../src/lib/ask/confidence';
import type { Answer } from '../../src/lib/ask/engine';

const a = (intent: Answer['intent']): Answer => ({ intent, text: '', buttons: [], ctx: {} });

test('규칙형이 알아들은 짧은 질문은 규칙형으로 끝낸다', () => {
  assert.equal(rulesConfident('강릉 맛집', a('foods')), true);
  assert.equal(rulesConfident('제주 언제 가면 좋아', a('season')), true);
});
test('모르겠다·조건이 여럿·장소만 던진 긴 질문은 AI에게', () => {
  assert.equal(rulesConfident('오늘 저녁 뭐 해', a('unknown')), false);
  assert.equal(rulesConfident('다음 주말에 1박으로 둘 다 안 가본 바다 쪽 어디가 좋아', a('recommend')), false);
  assert.equal(rulesConfident('강릉 가는데 비 오면 실내에서 뭐 하지 아이도 같이 가', a('overview')), false);
});
test('답에 사실에 없는 숫자가 있으면 지어낸 것으로 본다', () => {
  assert.equal(grounded('강릉에 2019년에 한 번 다녀왔어요', '우리 기록 1건: 2019.5.3 강릉시 여행'), true);
  assert.equal(grounded('강릉에 2021년에 다녀왔어요', '우리 기록 1건: 2019.5.3 강릉시 여행'), false);
});

test('뒷단이 있으면 대화는 AI가: 이어지는 말·보통 질문은 AI, 되묻기·이동·지역 이름만은 규칙형', async () => {
  const { wantsAi } = await import('../../src/lib/ask/confidence');
  assert.equal(wantsAi('강릉 맛집 추천해 줘', a('foods')), true);
  assert.equal(wantsAi('거기 1박이면 어때', a('overview'), [{ q: '강릉 맛집' }]), true);
  assert.equal(wantsAi('강릉', a('overview')), false);
  assert.equal(wantsAi('지도 보여 줘', a('map')), false);
  assert.equal(wantsAi('고양시', { ...a('recommend'), pending: { need: 'home', q: '집 근처 단풍' } } as Answer), false);
});
test('달·날짜(31 이하)와 질문에 나온 숫자는 지어낸 것으로 보지 않는다', () => {
  assert.equal(grounded('11월 7일이 좋아요', '강릉 여행정보'), true);
  assert.equal(grounded('2박 3일에 120km', '질문: 120km 안에서'), true);
});
