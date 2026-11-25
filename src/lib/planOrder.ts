/**
 * 예정 여행 일정 다듬기 (순수 함수) — 사용자 의견 11-25:
 * 가볼 곳을 적으면 가까운 곳끼리 날짜별로 묶어 주고, 화살표로 순서를 바꾸거나 뺄 수 있어야.
 */
export interface Pt { id: string; lat: number; lng: number }
export interface Slot { id: string; day: string | null; order: number; time: string | null }

/** 두 점 사이 거리 (km, 대원 거리) */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 가까운 곳 잇기: 가운데서 가장 먼 곳(가장자리)에서 시작해 늘 가장 가까운 다음 곳으로 */
export function chain(pts: readonly Pt[]): Pt[] {
  if (pts.length <= 2) return [...pts];
  const c = { lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length, lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length };
  const left = [...pts];
  let cur = left.reduce((a, b) => (km(b, c) > km(a, c) ? b : a));
  const out: Pt[] = [];
  while (left.length) {
    out.push(cur);
    left.splice(left.indexOf(cur), 1);
    if (!left.length) break;
    const from = cur;
    cur = left.reduce((a, b) => (km(from, b) < km(from, a) ? b : a));
  }
  return out;
}

/**
 * 가까운 곳끼리 날짜 나누기: 이어진 길을 날 수만큼 고르게 자른다 (하루 몇 곳인지 비슷하게).
 * 자리를 아는 곳만 옮기고, 돌려준 순서(order)는 그날 안의 차례. 날짜가 없는 여행은 days를 [null]로 주면 가까운 차례로만 줄 세운다.
 */
export function groupByDistance(pts: readonly Pt[], days: readonly (string | null)[]): Slot[] {
  if (!pts.length || !days.length) return [];
  const line = chain(pts);
  const per = Math.ceil(line.length / days.length);
  return line.map((p, i) => ({ id: p.id, day: days[Math.min(days.length - 1, Math.floor(i / per))], order: (i % per) + 1, time: null }));
}

/**
 * 화살표로 한 칸 옮기기. list는 화면에 보이는 차례 그대로 (날짜순 → 그날 안 차례).
 * 같은 날 안이면 옆 곳과 자리(차례·시간)를 바꾼다: 10시 자리에 있던 곳이 내려가면 내려온 곳이 10시가 된다.
 * 그날 맨 위에서 ↑ → 앞 날 맨 뒤로, 맨 아래에서 ↓ → 다음 날 맨 앞으로 (시간은 지운다).
 * 바꿀 것만 돌려준다. 더 갈 데가 없으면 빈 목록.
 */
export function moveItem(list: readonly Slot[], id: string, dir: -1 | 1, days: readonly string[]): Slot[] {
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return [];
  const me = list[i];
  const same = list.filter((x) => x.day === me.day);
  const j = same.findIndex((x) => x.id === id);
  const nb = same[j + dir];
  if (nb) {
    return [
      { ...me, order: nb.order === me.order ? me.order + dir : nb.order, time: nb.time },
      { ...nb, order: me.order, time: me.time },
    ];
  }
  // 날 바꾸기 ('날짜 없이'는 마지막 날 뒤)
  const seq: (string | null)[] = [...days, null];
  const k = seq.indexOf(me.day && days.includes(me.day) ? me.day : null);
  const to = seq[k + dir];
  if (to === undefined || k + dir < 0) return [];
  const there = list.filter((x) => x.day === to).map((x) => x.order);
  const order = dir === 1 ? (there.length ? Math.min(...there) - 1 : 1) : (there.length ? Math.max(...there) + 1 : 1);
  return [{ ...me, day: to, order, time: null }];
}
