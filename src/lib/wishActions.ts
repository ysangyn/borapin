import type { User } from 'firebase/auth';
import { createWish } from './data';
import { displayName } from './auth';
import { COUPLE } from './wishes';
import type { Place } from './types';

/** 버튼 하나로 담기: 담은 사람이 보라·영상이면 하트를 미리 켜 둔다 */
export function quickWish(place: Place, user: User): Promise<string> {
  const me = displayName(user);
  return createWish(
    {
      place,
      wantedBy: (COUPLE as readonly string[]).includes(me) ? [me] : [],
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
}
