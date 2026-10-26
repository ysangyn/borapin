import type { User } from 'firebase/auth';
import { addWishItem, createWish } from './data';
import { displayName } from './auth';
import { samePlace, fieldOfWishItem, planWishItem, type WishItemKind } from './wishes';
export { hasWishItem, type WishItemKind } from './wishes';
import { isMemberName } from './members';
import type { Place, Wish } from './types';

const inFlight = new Map<string, Promise<string>>();
const keyOf = (p: Place) => (p.t === 'kr' ? `kr:${p.code}` : `w:${p.id}:${p.city ?? ''}`);

/**
 * 버튼 하나로 담기: 담은 사람이 보라·영상이면 하트를 미리 켜 둔다.
 * 이미 담긴 곳이면 새로 만들지 않고, 두 번 눌러도 한 번만 담는다.
 */
export async function quickWish(place: Place, user: User, existing: Wish[] = []): Promise<{ id: string; already: boolean }> {
  const found = existing.find((w) => samePlace(w.place, place) && !w.tripId);
  if (found) return { id: found.id, already: true };
  const k = keyOf(place);
  const running = inFlight.get(k);
  if (running) return { id: await running, already: true };
  const me = displayName(user);
  const p = createWish(
    {
      place,
      wantedBy: isMemberName(me) ? [me] : [],
      priority: null,
      spots: [],
      todos: [],
      foods: [],
      links: [],
      note: '',
      source: 'app',
    },
    user,
  );
  inFlight.set(k, p);
  try {
    return { id: await p, already: false };
  } finally {
    window.setTimeout(() => inFlight.delete(k), 3000);
  }
}

/** 지도 고르기 창의 '가고 싶어요': 볼거리·먹거리를 그 지역 가고 싶은 곳에 담는다 (일일이 검색하지 않아도 되게) */
export async function wishItem(place: Place, name: string, kind: WishItemKind, user: User, existing: Wish[] = []): Promise<{ id: string; already: boolean }> {
  const plan = planWishItem(existing, place, name, kind);
  if (plan.action === 'already') return { id: plan.id, already: true };
  if (plan.action === 'append') { await addWishItem(plan.id, fieldOfWishItem(kind), name); return { id: plan.id, already: false }; }
  const me = displayName(user);
  const id = await createWish(
    { place, wantedBy: isMemberName(me) ? [me] : [], priority: null, spots: kind === 'spot' ? [name] : [], todos: [], foods: kind === 'food' ? [name] : [], links: [], note: '', source: 'app' },
    user,
  );
  return { id, already: false };
}

