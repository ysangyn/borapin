import { useState } from 'react';
import { Icon } from './ui';
import ArriveSheet from './ArriveSheet';
import NightCard from './NightCard';
import { useMapChoice } from './MapChoice';
import { updatePlan, usePlan } from '../lib/tripExtras';
import { localDate } from '../lib/dates';
import { hhmm, moveGuess, nextStop, sunsetAt, todayPool } from '../lib/today';
import { placeLabel } from '../lib/geo';
import { withIGa } from '../lib/ko';
import type { PlanItem, Trip } from '../lib/types';

/**
 * 여행 중 '오늘' (홈 맨 위 단계 카드 바로 밑): 다음 갈 곳 큰 카드 + 오늘 다닐 곳 + 해 지는 시각.
 * 거리·시간은 폰 안에서 어림한다 (바로 앞에 다녀온 곳에서). 일정이 없는 날엔 아무것도 그리지 않는다.
 */
export default function TodayPanel({ trip }: { trip: Trip }) {
  const plan = usePlan(trip.id);
  const [openMap, mapSheet] = useMapChoice();
  const [arriving, setArriving] = useState<PlanItem | null>(null);
  const now = new Date();
  if (!plan) return null;
  const { list, mode } = todayPool(plan, localDate(now));
  if (!list.length) return null;
  const next = nextStop(list);
  const done = list.filter((p) => p.done).length;
  // 어디서 출발하나: 다음 곳 바로 앞에 다녀온 곳 (자리 있는 것)
  const before = next ? [...list.slice(0, list.indexOf(next))].reverse().find((p) => p.done && p.lat != null) : null;
  const move = next && before ? moveGuess(before, next) : null;
  const anchor = list.find((p) => p.lat != null && p.lng != null);
  const sunset = anchor ? sunsetAt(anchor.lat!, anchor.lng!, now) : null;
  const area = trip.places[0] ? placeLabel(trip.places[0]) : '';

  // 도착했어요: 사진·어땠어요·한 줄을 한 번에 남기는 창 (다녀옴 표시도 거기서)
  const arrive = () => { if (next) setArriving(next); };

  // 밤 8시 뒤엔 하루 끝 카드가 먼저 (시험·미리보기: ?night=1)
  const night = now.getHours() >= 20 || new URLSearchParams(window.location.search).get('night') === '1';

  return (
    <section className="today" aria-label="오늘 다닐 곳" data-testid="today">
      {night && <NightCard trip={trip} plan={plan} day={localDate(now)} />}
      {next ? (
        <div className="today-next" data-testid="today-next">
          {next.img ? <img className="today-img" src={next.img} alt="" referrerPolicy="no-referrer" /> : null}
          <div className="today-body">
            <span className="today-when">{next.time ? `다음 갈 곳 · ${next.time}` : '다음 갈 곳'}</span>
            <b className="jua today-name">{next.name}</b>
            <span className="small today-sub">
              {[move ? `${move.mode === 'walk' ? '걸어서' : '차로'} ${move.min}분 · ${move.km}km` : null, next.by?.length ? `${withIGa(next.by.join('·'))}${next.by.length > 1 ? ' 같이' : ''} 하트한 곳` : null].filter(Boolean).join(' · ') || area}
            </span>
            <div className="today-acts">
              <button className="btn primary" onClick={() => openMap({ name: next.name, area, lat: next.lat, lng: next.lng })} data-testid="today-go"><Icon name="nav" size={18} />길찾기</button>
              <button className="btn line" onClick={arrive} data-testid="today-arrive"><Icon name="pin" size={18} />도착했어요</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="today-next done" data-testid="today-next"><div className="today-body"><b className="jua today-name">오늘 일정 다 다녀왔어요</b><span className="small today-sub">사진과 한 줄을 남겨 두면 여행책에 그대로 들어가요</span></div></div>
      )}

      <div className="today-head"><b className="jua">{mode === 'today' ? '오늘 다닐 곳' : mode === 'loose' ? '가 볼 곳 (날짜 안 정함)' : '아직 안 간 곳'}</b><span className="small muted">{mode === 'left' ? `${list.length}곳` : `${list.length}곳 중 ${done}곳`}</span></div>
      <ol className="today-list" data-testid="today-list">
        {list.map((p) => (
          <li key={p.id} className={(p.done ? 'done' : '') + (p === next ? ' next' : '')}>
            <span className="t">{p.time ?? ''}</span>
            <button className="dot" onClick={() => void updatePlan(p.id, { done: !p.done, doneDay: p.done ? null : localDate(new Date()) })} aria-pressed={p.done} aria-label={`${p.name} ${p.done ? '다녀옴 빼기' : '다녀왔어요'}`}>{p.done && <Icon name="check" size={13} />}</button>
            <span className="n">{p.name}</span>
            {p === next && <span className="tag violet">다음</span>}
          </li>
        ))}
      </ol>

      {sunset && sunset.getTime() > now.getTime() && (
        <div className="today-sun small" data-testid="today-sun"><Icon name="sun" size={18} />해 지는 시각 {hhmm(sunset)}</div>
      )}
      {mapSheet}
      {arriving && <ArriveSheet trip={trip} item={arriving} onClose={() => setArriving(null)} />}
    </section>
  );
}
