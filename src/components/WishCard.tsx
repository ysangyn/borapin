import { Link } from 'react-router-dom';
import { Icon } from './ui';
import { tileText } from './TripRow';
import { formatWhen } from '../lib/dates';
import { placeLabel, placeLong, placeParam } from '../lib/geo';
import { monthsLabel, seasonFor, type SeasonData } from '../lib/seasons';
import { bothWant, COUPLE, type WishState } from '../lib/wishes';
import type { Wish } from '../lib/types';
import { festivalPeriod, isOngoing, upcomingFestivals, useFestivals } from '../lib/festivals';

export function wishTitle(w: Wish) {
  return w.spotName ? `${w.spotName}` : placeLong(w.place);
}

export function Hearts({ wantedBy, size = 13 }: { wantedBy?: string[]; size?: number }) {
  const set = new Set(wantedBy ?? []);
  return (
    <span className="hearts" aria-label={`원하는 사람: ${[...set].join(', ') || '없음'}`}>
      {COUPLE.map((n) => (
        <span key={n} className={'heart' + (set.has(n) ? ' on' : '')}>
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
          </svg>
          {n}
        </span>
      ))}
    </span>
  );
}

export function FlagBadge({ priority }: { priority: number | null }) {
  if (!priority) return null;
  return (
    <span className="flag-badge" aria-label={`${priority}순위`}>
      <Icon name="flag" size={12} stroke={2.4} />
      {priority}
    </span>
  );
}

/** 가고 싶은 곳 카드: 장소 · 누가 원해요 · 깃발 · 가기 좋은 때 · 메모 맛보기 · 여행 만들기 */
export default function WishCard({ wish, state, seasons, compact }: {
  wish: Wish;
  state: WishState;
  seasons: SeasonData | null;
  compact?: boolean;
}) {
  const season = seasonFor(seasons, wish.place, wish.months);
  const festData = useFestivals();
  const fest = wish.place.t === 'kr' ? upcomingFestivals(festData, wish.place.code, new Date(), 45)[0] : undefined;
  const memo = [
    wish.spots.length ? `가볼 곳 ${wish.spots[0]}${wish.spots.length > 1 ? ` 외 ${wish.spots.length - 1}` : ''}` : '',
    wish.foods.length ? `먹을 것 ${wish.foods[0]}` : '',
    wish.todos.length ? `해볼 것 ${wish.todos[0]}` : '',
  ].filter(Boolean);
  return (
    <div className={'wish-card' + (compact ? ' compact' : '')} data-testid="wish-card">
      <Link to={`/wishes/${wish.id}`} className="wish-main" aria-label={`${wishTitle(wish)} 가고 싶은 곳 보기`}>
        <span className="trip-tile wish">
          {tileText({ places: [wish.place] } as never)}
          <FlagBadge priority={wish.priority} />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span className="t">{wishTitle(wish)}{wish.spotName && <span className="muted small"> · {placeLabel(wish.place)}</span>}</span>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Hearts wantedBy={wish.wantedBy} />
            {bothWant(wish) && <span className="tag coral">둘 다 원해요</span>}
          </span>
          {(fest || season) && (
            <span className="tiny season-line">
              {fest && <span className={'tag ' + (isOngoing(fest) ? 'coral' : 'violet')} data-testid="wish-festival">{isOngoing(fest) ? '지금 축제' : '축제'} · {fest.t} {festivalPeriod(fest)}</span>}
              {season && <span className="muted">가기 좋은 때 {monthsLabel(season.m)}</span>}
            </span>
          )}
          {!compact && memo.length > 0 && <span className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{memo.join(' · ')}</span>}
        </span>
      </Link>
      {state.kind === 'wish' && (
        <Link to={`/record?status=planned&place=${placeParam(wish.place)}&wish=${wish.id}`} className="btn sm soft" data-testid="wish-plan">여행 만들기</Link>
      )}
      {state.kind === 'planned' && (
        <Link to={`/trips/${state.trip.id}`} className="tag" style={{ background: 'var(--mist)', color: '#33248a' }}>예정 · {formatWhen(state.trip.when)}</Link>
      )}
      {state.kind === 'done' && <span className="tag">다녀왔어요</span>}
    </div>
  );
}
