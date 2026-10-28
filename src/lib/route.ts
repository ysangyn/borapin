/**
 * 동선 정리 (설계서 A12): 담은 곳을 날짜 수만큼 가까운 것끼리 묶고, 하루 안에서는 숙소(없으면 그날 첫 곳)에서 가까운 순.
 * 시간이 적힌 곳은 그 날·자리에 못 박고, 자리(좌표)가 없는 곳은 그날 끝에. 순수 함수 — 사람이 바꾼 순서는 '다시 정리'를 눌렀을 때만 바뀐다.
 */
export interface Stop { id: string; lat?: number | null; lng?: number | null; day?: string | null; time?: string | null }
export interface Arranged { id: string; day: string; order: number }

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88);
const hasPos = (s: Stop): s is Stop & { lat: number; lng: number } => s.lat != null && s.lng != null;

/** 하루 안 순서: 최근접 이웃 → 2-opt 한 번 */
function orderDay<T extends { lat: number; lng: number }>(pts: T[], start?: { lat: number; lng: number } | null): T[] {
  if (pts.length < 2) return pts;
  const left = [...pts];
  const out: T[] = [];
  let cur: { lat: number; lng: number } = start ?? left[0];
  while (left.length) {
    let bi = 0;
    for (let i = 1; i < left.length; i++) if (km(cur, left[i]) < km(cur, left[bi])) bi = i;
    const next = left.splice(bi, 1)[0];
    out.push(next);
    cur = next;
  }
  const len = (r: T[]) => r.reduce((s, p, i) => s + (i ? km(r[i - 1], p) : start ? km(start, p) : 0), 0);
  let best = out;
  for (let i = 0; i < out.length - 1; i++) for (let j = i + 1; j < out.length; j++) {
    const c = [...out.slice(0, i), ...out.slice(i, j + 1).reverse(), ...out.slice(j + 1)];
    if (len(c) < len(best) - 1e-9) best = c;
  }
  return best;
}

export function arrange(stops: Stop[], days: string[], stay?: { lat: number; lng: number } | null): Arranged[] {
  if (!days.length) return stops.map((s, i) => ({ id: s.id, day: s.day ?? '', order: i + 1 }));
  const pinned = stops.filter((s) => s.time && s.day && days.includes(s.day));
  const free = stops.filter((s) => !pinned.includes(s));
  const pos = free.filter(hasPos), noPos = free.filter((s) => !hasPos(s));
  // 묶기: 가장 먼 둘을 씨앗으로 탐욕 묶기 (하루 수 균형 ±1)
  const groups: (Stop & { lat: number; lng: number })[][] = days.map(() => []);
  if (pos.length) {
    const cap = Math.ceil(pos.length / days.length);
    // 씨앗: 첫 날은 숙소(또는 첫 곳)에서 가장 가까운 곳, 다음 날들은 앞 씨앗들에서 가장 먼 곳
    const seeds: (Stop & { lat: number; lng: number })[] = [];
    const ref = stay ?? pos[0];
    seeds.push([...pos].sort((a, b) => km(ref, a) - km(ref, b))[0]);
    while (seeds.length < Math.min(days.length, pos.length)) {
      const far = pos.filter((p) => !seeds.includes(p)).sort((a, b) => Math.min(...seeds.map((s) => km(s, b))) - Math.min(...seeds.map((s) => km(s, a))))[0];
      seeds.push(far);
    }
    seeds.forEach((s, i) => groups[i].push(s));
    for (const p of pos.filter((x) => !seeds.includes(x)).sort((a, b) => km(ref, a) - km(ref, b))) {
      const order = groups.map((g, i) => ({ i, d: g.length ? Math.min(...g.map((q) => km(q, p))) : Infinity })).sort((a, b) => a.d - b.d);
      const pick = order.find((o) => groups[o.i].length < cap) ?? order[0];
      groups[pick.i].push(p);
    }
  }
  const out: Arranged[] = [];
  days.forEach((day, i) => {
    const seq: Stop[] = [...orderDay(groups[i], stay), ...(i === days.length - 1 ? noPos : [])];
    // 못 박은 곳(시간 있음)은 시간 순으로 섞어 넣는다
    const pins = pinned.filter((p) => p.day === day).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
    const merged = [...seq];
    for (const p of pins) {
      const at = Math.min(merged.length, Math.round(((Number(p.time!.slice(0, 2)) - 9) / 12) * merged.length));
      merged.splice(Math.max(0, at), 0, p);
    }
    merged.forEach((s, k) => out.push({ id: s.id, day, order: k + 1 }));
  });
  return out;
}

/** 하루 이동 거리(직선 합, km): '이날은 좀 많아요' 판단용 */
export function dayDistance(stops: Stop[], stay?: { lat: number; lng: number } | null): number {
  const pts = stops.filter(hasPos);
  return pts.reduce((s, p, i) => s + (i ? km(pts[i - 1], p) : stay ? km(stay, p) : 0), 0);
}
