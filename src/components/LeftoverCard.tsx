import { useMemo, useState } from 'react';
import { useToast } from './ui';
import { useAuth } from '../lib/auth';
import { addWishItem, updateWish, useWishes } from '../lib/data';
import { usePlan } from '../lib/tripExtras';
import { wishItem } from '../lib/wishActions';
import { leftoverPlans, samePlace, sameName } from '../lib/wishes';
import { placeLabel } from '../lib/geo';
import type { Trip } from '../lib/types';

/**
 * 다녀온 여행의 '못 간 곳': 일정에 넣었지만 체크하지 않은 곳을 그 지역 가고 싶은 곳에 이어서 담는다.
 * 담을 때 체크한 일정(다녀온 곳)은 가고 싶은 곳에 '다녀옴'으로 표시 — 남은 것이 있으면 '다시 가고 싶어요'로 남는다.
 */
export default function LeftoverCard({ trip }: { trip: Trip }) {
  const plan = usePlan(trip.id);
  const { wishes } = useWishes();
  const auth = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const place = trip.places[0];
  const wish = useMemo(() => (wishes ?? []).find((w) => samePlace(w.place, place) && (!w.tripId || w.tripId === trip.id)) ?? null, [wishes, place, trip.id]);
  const left = useMemo(() => (plan ? leftoverPlans(plan, wish) : []), [plan, wish]);
  if (trip.status !== 'done' || !plan || !left.length || auth.status !== 'ready') return null;
  const save = async () => {
    setBusy(true);
    try {
      // 첫 곳으로 그 지역 가고 싶은 곳을 찾거나 만들고, 나머지는 그 카드에 이어 담는다 (카드가 여러 장 생기지 않게)
      // 이 여행이 나온 가고 싶은 곳(또는 그 지역 카드)이 있으면 거기에 이어 담는다
      const [first, ...rest] = left;
      const id = wish ? wish.id : (await wishItem(place, first.name, first.food ? 'food' : 'spot', auth.user, wishes ?? [])).id;
      for (const it of wish ? left : rest) await addWishItem(id, it.food ? 'foods' : 'spots', it.name);
      // 체크한 일정은 '다녀옴'으로 (그 지역 가고 싶은 곳에 같은 이름이 있으면)
      const w = wish;
      if (w) {
        const went = plan.filter((p) => p.done).map((p) => p.name);
        const gone = [...new Set([...(w.gone ?? []), ...[...w.spots, ...w.foods].filter((n) => went.some((g) => sameName(g, n)))])];
        if (gone.length !== (w.gone ?? []).length) await updateWish(w.id, { gone });
      }
      toast(`${placeLabel(place)} 가고 싶은 곳에 남겼어요`);
    } catch { toast('남기지 못했어요. 다시 해 주세요'); }
    setBusy(false);
  };
  return (
    <div className="card white leftover" data-testid="leftover">
      <b>이번에 못 간 곳 {left.length}</b>
      <span className="small muted">{left.slice(0, 4).map((x) => x.name).join(' · ')}{left.length > 4 ? ` 외 ${left.length - 4}` : ''}</span>
      <button className="btn sm" disabled={busy} onClick={() => void save()} data-testid="leftover-save">{busy ? '남기는 중…' : '가고 싶은 곳에 남기기'}</button>
    </div>
  );
}
