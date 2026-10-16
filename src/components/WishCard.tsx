import { Link } from 'react-router-dom';
import { Icon, useToast } from './ui';
import { tileText } from './TripRow';
import { formatWhen } from '../lib/dates';
import { placeLabel, placeLong, placeParam } from '../lib/geo';
import { monthsLabel, seasonFor, type SeasonData } from '../lib/seasons';
import { bothWant, type WishState } from '../lib/wishes';
import { everyoneLabel, memberNames } from '../lib/members';
import type { Wish } from '../lib/types';
import { festivalPeriod, isOngoing, upcomingFestivals, useFestivals } from '../lib/festivals';
import { photoForPlace } from '../lib/media';
import { flightLinks } from '../lib/flights';
import { useAuth, displayName } from '../lib/auth';
import { updateWish } from '../lib/data';
import { accessLine } from '../lib/transport';

export function wishTitle(w: Wish) {
  return w.spotName ? `${w.spotName}` : placeLong(w.place);
}

export function Hearts({ wantedBy, size = 13 }: { wantedBy?: string[]; size?: number }) {
  const set = new Set(wantedBy ?? []);
  return (
    <span className="hearts" aria-label={`원하는 사람: ${[...set].join(', ') || '없음'}`}>
      {memberNames().map((n) => (
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

/** 목록에서 바로 누르는 내 하트: 상대가 담은 곳에 '나도 원해요' 하는 것이 이 화면의 핵심 동작 */
export function MyHeart({ wish, size = 'md' }: { wish: Wish; size?: 'sm' | 'md' }) {
  const auth = useAuth();
  const toast = useToast();
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const on = !!me && (wish.wantedBy ?? []).includes(me);
  const others = (wish.wantedBy ?? []).filter((n) => n !== me);
  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!me) return;
    const next = on ? (wish.wantedBy ?? []).filter((n) => n !== me) : [...(wish.wantedBy ?? []), me];
    try {
      await updateWish(wish.id, { wantedBy: next });
      toast(on ? '내 하트를 뺐어요' : next.length >= Math.max(2, memberNames().length) ? `${everyoneLabel()}! 여행 만들기를 눌러 보세요` : '나도 원해요에 하트를 눌렀어요');
    } catch { toast('바꾸지 못했어요. 다시 해 주세요'); }
  };
  return (
    <button type="button" className={`my-heart ${size}` + (on ? ' on' : '')} onClick={toggle} aria-pressed={on} aria-label={on ? '내 하트 빼기' : '나도 원해요'} data-testid="wish-heart" title={others.length ? `${others.join('·')}도 원해요` : undefined}>
      <svg width={size === 'sm' ? 16 : 20} height={size === 'sm' ? 16 : 20} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>
      <span>{on ? (others.length ? `${others.join('·')}·나` : '나') : others.length ? others.join('·') : '나도'}</span>
    </button>
  );
}

function useWishMeta(wish: Wish, seasons: SeasonData | null) {
  const season = seasonFor(seasons, wish.place, wish.months);
  const festData = useFestivals();
  const fest = wish.place.t === 'kr' ? upcomingFestivals(festData, wish.place.code, new Date(), 45)[0] : undefined;
  const memo = [
    wish.spots.length ? `가볼 곳 ${wish.spots[0]}${wish.spots.length > 1 ? ` 외 ${wish.spots.length - 1}` : ''}` : '',
    wish.foods.length ? `먹을 것 ${wish.foods[0]}` : '',
    wish.todos.length ? `해볼 것 ${wish.todos[0]}` : '',
  ].filter(Boolean);
  return { season, fest, memo, photo: photoForPlace(wish.place) };
}

function SeasonLine({ season, fest }: { season: ReturnType<typeof seasonFor>; fest: ReturnType<typeof upcomingFestivals>[number] | undefined }) {
  if (!season && !fest) return null;
  return (
    <span className="tiny season-line">
      {fest && <span className={'tag fest-tag ' + (isOngoing(fest) ? 'coral' : 'violet')} data-testid="wish-festival" title={`${fest.t} ${festivalPeriod(fest)}`}>{isOngoing(fest) ? '지금 축제' : '축제'} · <span className="fest-name">{fest.t}</span> <span className="fest-when">{festivalPeriod(fest)}</span></span>}
      {season && <span className="muted">가기 좋은 때 {monthsLabel(season.m)}</span>}
    </span>
  );
}

/**
 * 가고 싶은 곳 카드.
 * - hero: 둘 다 원하는 곳 — 사진 크게, 아래에 가기 좋은 때·메모, 주요 단추 '여행 만들기'
 * - row(기본): 한 명만 원하거나 예정인 곳 — 한 줄, 오른쪽에 내 하트(나도 원해요) 또는 예정 꼬리표
 * - compact: 홈 접힌 목록용 작은 줄
 */
export default function WishCard({ wish, state, seasons, compact, hero }: {
  wish: Wish;
  state: WishState;
  seasons: SeasonData | null;
  compact?: boolean;
  hero?: boolean;
}) {
  const { season, fest, memo, photo } = useWishMeta(wish, seasons);
  const both = bothWant(wish);
  const flights = !compact && wish.place.t === 'country' ? flightLinks(wish.place, season?.m[0] ?? null) : null;

  if (hero && !compact) {
    return (
      <div className={'wish-hero' + (photo ? ' has-photo' : '')} data-testid="wish-card">
        <Link to={`/wishes/${wish.id}`} className="wish-main wish-hero-photo" style={photo ? { backgroundImage: `url(${photo.lqip})` } : undefined} aria-label={`${wishTitle(wish)} 가고 싶은 곳 보기`}>
          {photo && <img src={photo.src.s} alt="" loading="lazy" decoding="async" />}
          <span className="wish-hero-top">
            <FlagBadge priority={wish.priority} />
            <span className="tag coral">{everyoneLabel()}</span>
          </span>
          <span className="wish-hero-copy">
            <b className="t">{wishTitle(wish)}</b>
            {wish.spotName && <span className="small">{placeLabel(wish.place)}</span>}
          </span>
        </Link>
        <div className="wish-hero-foot">
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <SeasonLine season={season} fest={fest} />
            {wish.place.t === 'kr' && accessLine(wish.place) && <span className="tiny muted ellipsis">가는 길 {accessLine(wish.place)}</span>}
            {memo.length > 0 && <span className="tiny muted ellipsis">{memo.join(' · ')}</span>}
            {flights && <span className="wish-flights row" data-testid="wish-flights"><a href={flights.skyscanner} target="_blank" rel="noreferrer">항공권</a><a href={flights.google} target="_blank" rel="noreferrer" title="구글 항공권에서 가격 알림을 켤 수 있어요">가격 알림</a></span>}
          </span>
          {state.kind === 'wish' && <Link to={`/record?status=planned&place=${placeParam(wish.place)}&wish=${wish.id}`} className="btn sm" data-testid="wish-plan">여행 만들기</Link>}
          {state.kind === 'planned' && <Link to={`/trips/${state.trip.id}`} className="tag violet">예정 · {formatWhen(state.trip.when)}</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className={'wish-card' + (compact ? ' compact' : '')} data-testid="wish-card">
      <Link to={`/wishes/${wish.id}`} className="wish-main" aria-label={`${wishTitle(wish)} 가고 싶은 곳 보기`}>
        <span className={'trip-tile wish' + (photo ? ' photo' : '')} style={photo ? { backgroundImage: `url(${photo.lqip}), url(${photo.src.s})` } : undefined}>
          {photo ? <img src={photo.src.s} alt="" loading="lazy" decoding="async" /> : tileText({ places: [wish.place] } as never)}
          <FlagBadge priority={wish.priority} />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span className="t">{wishTitle(wish)}{wish.spotName && <span className="muted small"> · {placeLabel(wish.place)}</span>}</span>
          {compact && <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}><Hearts wantedBy={wish.wantedBy} />{both && <span className="tag coral">{everyoneLabel()}</span>}</span>}
          <SeasonLine season={season} fest={fest} />
          {!compact && memo.length > 0 && <span className="tiny muted ellipsis">{memo.join(' · ')}</span>}
        </span>
      </Link>
      {state.kind === 'wish' && (compact ? <Link to={`/record?status=planned&place=${placeParam(wish.place)}&wish=${wish.id}`} className="btn sm soft" data-testid="wish-plan">여행 만들기</Link> : both ? <Link to={`/record?status=planned&place=${placeParam(wish.place)}&wish=${wish.id}`} className="btn sm soft" data-testid="wish-plan">여행 만들기</Link> : <MyHeart wish={wish} />)}
      {state.kind === 'planned' && <Link to={`/trips/${state.trip.id}`} className="tag violet">예정 · {formatWhen(state.trip.when)}</Link>}
      {state.kind === 'done' && <span className="tag">다녀왔어요</span>}
    </div>
  );
}
