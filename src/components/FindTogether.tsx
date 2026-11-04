import { useState } from 'react';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import { useTrips, useWishes } from '../lib/data';
import { addPlan, usePlan } from '../lib/tripExtras';
import { wishItem } from '../lib/wishActions';
import { hasWishItem, plannedTripFor } from '../lib/wishes';
import { FIND_LABEL, FIND_SOURCE, useFind, type FindItem, type FindKind } from '../lib/find';
import { aiAvailable } from '../lib/ask/url';
import type { Place } from '../lib/types';

const KINDS: FindKind[] = ['see', 'do', 'eat', 'buy'];
const mapUrl = (x: FindItem, city: string) => (x.lat != null && x.lng != null ? `https://www.google.com/maps/search/?api=1&query=${x.lat},${x.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${x.name} ${city}`)}`);

/**
 * 해외 도시 카드 아래 '같이 찾아볼까요?': 위키보이지 볼 것·할 것·먹을 것·살 것.
 * 담기 → 예정 여행이 있으면 그 일정(날짜 없이, 좌표·한 줄과 함께), 없으면 가고 싶은 곳. 맛집은 앱이 고르지 않고 사람이 '지도에서 확인'하고 고른다.
 */
export default function FindTogether({ place, cityEn }: { place: Place; cityEn: string }) {
  const auth = useAuth();
  const user = auth.status === 'ready' ? auth.user : null;
  const [kind, setKind] = useState<FindKind | null>(null);
  const items = useFind(user, cityEn, kind);
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const trip = plannedTripFor(trips, place);
  const plan = usePlan(trip?.id ?? '');
  const toast = useToast();
  if (!aiAvailable() || !user) return null;
  const city = place.t === 'country' ? place.city ?? '' : '';
  const has = (x: FindItem) => (trip ? (plan ?? []).some((p) => p.name === x.name) : hasWishItem(wishes ?? [], place, x.name, x.kind === 'eat' ? 'food' : 'spot'));
  const put = async (x: FindItem) => {
    try {
      if (trip) await addPlan(trip.id, x.name.slice(0, 80), (plan?.length ?? 0) + 1, null, { kind: x.kind === 'do' ? 'do' : x.kind, lat: x.lat, lng: x.lng, info: [x.area, x.line].filter(Boolean).join(' · ').slice(0, 200) });
      else await wishItem(place, x.name, x.kind === 'eat' ? 'food' : 'spot', user, wishes ?? []);
      toast(trip ? `${trip.title} 일정에 담았어요` : '가고 싶은 곳에 담았어요');
    } catch { toast('담지 못했어요. 다시 해 주세요'); }
  };
  return (
    <div className="find-together" data-testid="find-together">
      <b className="small">같이 찾아볼까요?</b>
      <div className="find-chips">
        {KINDS.map((k) => <button key={k} className={'chip' + (kind === k ? ' on' : '')} onClick={() => setKind(kind === k ? null : k)} data-testid={`find-${k}`}>{FIND_LABEL[k]}</button>)}
      </div>
      {kind && items === undefined && <div className="skeleton-list" aria-busy="true"><i /><i /></div>}
      {kind && items === null && <span className="tiny muted">지금은 못 찾았어요. 지도 링크를 붙여 넣어도 돼요</span>}
      {kind && items && !items.length && <span className="tiny muted">이 도시 안내서에 {FIND_LABEL[kind]} 목록이 없어요</span>}
      {kind && items && items.length > 0 && (
        <>
          <ul className="find-list">
            {items.map((x) => {
              const got = has(x);
              return (
                <li key={x.name} className="find-item" data-testid="find-item">
                  <span className="find-main">
                    <b>{x.name}</b>
                    {x.area && <span className="tiny muted"> · {x.area}</span>}
                    {x.line && <span className="find-line">{x.line}</span>}
                  </span>
                  <span className="find-acts">
                    <a className="stopover-btn" href={mapUrl(x, city)} target="_blank" rel="noreferrer">지도</a>
                    <button className="stopover-btn" disabled={got} onClick={() => void put(x)}>{got ? '담겼어요' : '담기'}</button>
                  </span>
                </li>
              );
            })}
          </ul>
          <span className="tiny muted"><Icon name="external" size={11} /> {FIND_SOURCE} · 한 줄은 우리말로 옮긴 것 · 문을 여는지는 지도에서 확인</span>
        </>
      )}
    </div>
  );
}
