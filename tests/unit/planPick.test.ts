import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickables } from '../../src/lib/planPick';

const info = { updated: '', areas: {}, cells: { '51150': { main: { name: '강릉시', theme: '커피 향 바다', spots: ['경포대', '오죽헌'], foods: ['초당 순두부'], goods: ['커피빵'], transport: [] }, subs: [] } } } as never;
const tour = { updated: '', cells: { '51150': { s: [['경포대', 37.79, 128.9, 'https://x/a.jpg'], ['주문진항', 37.89, 128.83, '']], easy: 0 } } } as never;
const fest = { updated: '', cells: { '51150': [{ t: '강릉 커피축제', s: '20261101', e: '20261110', id: 'f1' }, { t: '여름 축제', s: '20260701', e: '20260705', id: 'f2' }] } } as never;

test('국내: 볼거리·관광지(사진·자리)·먹거리·살 것·축제를 한 목록으로, 같은 이름은 하나로', () => {
  const p = pickables({ t: 'kr', code: '51150' }, { tour, info, festivals: fest, world: null }, { start: new Date(2026, 10, 8), days: 2 });
  const names = p.map((x) => x.name);
  assert.equal(names.filter((n) => n === '경포대').length, 1);
  const g = p.find((x) => x.name === '경포대')!;
  assert.equal(g.img, 'https://x/a.jpg');
  assert.equal(g.lat, 37.79);
  assert.ok(names.includes('주문진항') && names.includes('초당 순두부') && names.includes('커피빵'));
  assert.deepEqual(p.filter((x) => x.kind === 'fest').map((x) => x.name), ['강릉 커피축제']); // 여행 날짜와 겹치는 것만
});

test('해외: 세계 도시 자료의 볼거리·먹거리', () => {
  const world = { updated: '', note: '', cities: [{ c: 'JPN', city: '도쿄', en: 'Tokyo', see: ['메이지 신궁'], eat: ['스시'], line: '큰 도시' }] } as never;
  const p = pickables({ t: 'country', id: 'JPN', city: '도쿄' }, { tour: null, info: null, festivals: null, world });
  assert.deepEqual(p.map((x) => [x.kind, x.name]), [['see', '메이지 신궁'], ['eat', '스시']]);
});

test('국내: 관광공사 음식점·쇼핑(사진·자리)이 먹을 것·살 것 칸에 가게로 들어간다', () => {
  const t2 = { updated: '', cells: { '51150': { s: [], f: [['초당할머니순두부', 37.79, 128.91, 'https://x/f.jpg']], b: [['강릉중앙시장', 37.75, 128.9, 'https://x/b.jpg']], easy: 0 } } } as never;
  const p = pickables({ t: 'kr', code: '51150' }, { tour: t2, info, festivals: null, world: null });
  const f = p.find((x) => x.name === '초당할머니순두부')!;
  assert.equal(f.kind, 'eat');
  assert.equal(f.img, 'https://x/f.jpg');
  const b = p.find((x) => x.name === '강릉중앙시장')!;
  assert.equal(b.kind, 'buy');
  assert.equal(b.lat, 37.75);
});
