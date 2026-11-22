import { useTripMemories } from '../lib/gardenCounts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TripRow from './TripRow';
import RegionInfo from './RegionInfo';
import { Icon } from './ui';
import { displayName, useAuth } from '../lib/auth';
import { useMapChoice } from './MapChoice';
import { tripsAtPlace, type Stats } from '../lib/data';
import { citiesOf, COUNTRY_BY_ID, placeLabel, regionLong } from '../lib/geo';
import type { Place, PlaceRec, Trip, Wish } from '../lib/types';
import PlaceRecRow from './PlaceRecRow';
import { recsAt } from '../lib/placeRecs';
import { leftItems, recNames, samePlace as samePlaceW } from '../lib/wishes';
import { garden, growHint, plantLine } from '../lib/garden';
import { useSwipeDown } from '../lib/swipe';
import { flowerOf, flowerSrc } from '../lib/flowers';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { photoForPlace } from '../lib/media';
import { ScenicPhoto } from './Scene';
import { times } from '../lib/ko';
import { festivalPeriod, isOngoing, upcomingFestivals, useFestivals } from '../lib/festivals';
import NewsStrip from './NewsStrip';
import CountryCities from './CountryCities';
import BeenWant from './BeenWant';

const recsHere = (recs: PlaceRec[], p: Place) => recsAt(recs, p);

const samePlace = (sel: Place) => (p: Place) =>
  sel.t === 'kr' ? p.t === 'kr' && p.code === sel.code : p.t === 'country' && p.id === sel.id;

/** 지도에서 지역을 누르면 뜨는 아래 시트: 다녀온 기록 / 가고 싶어요 두 칸 + 아래 두 단추 */
export default function PlaceSheet({ place, trips, stats, wishes = [], recs = [], onClose, onPlace }: {
  place: Place;
  trips: Trip[];
  stats: Stats | null;
  wishes?: Wish[];
  recs?: PlaceRec[];
  onClose: () => void;
  /** 나라 창에서 도시를 고르면 그 도시 창으로 (지도는 나라로 칠해도 기록은 도시로, 사용자 의견 11-22) */
  onPlace?: (p: Place) => void;
}) {
  const seasons = useSeasons();
  const festData = useFestivals();
  const fests = place.t === 'kr' ? upcomingFestivals(festData, place.code, new Date(), 120).slice(0, 2) : [];
  const wish = wishes.find((w) => samePlaceW(w.place, place));
  const season = seasonFor(seasons, place, wish?.months);
  const left = useMemo(() => (wish ? leftItems(wish, recNames(recs, wish.place)) : []), [wish, recs]);
  const auth = useAuth();
  // 심는 지도: 이 칸의 식물 (다녀온 칸만)
  const mem = useTripMemories(trips);
  const plant = useMemo(() => (place.t === 'kr' ? garden(trips, recs, mem).get(place.code) : undefined), [place, trips, recs, mem]);
  const flower = flowerOf(place);
  const hint = growHint(plant, auth.status === 'ready' ? displayName(auth.user) : '');
  const here = useMemo(() => tripsAtPlace(trips, samePlace(place)), [trips, place]);
  const done = here.filter((t) => t.status === 'done');
  const planned = here.filter((t) => t.status !== 'done');
  const allRecs = recsHere(recs, place);
  const beenRecs = allRecs.filter((r) => r.status !== 'want');
  const wantRecs = allRecs.filter((r) => r.status === 'want');
  const countryName = place.t === 'country' ? COUNTRY_BY_ID.get(place.id)?.name ?? place.id : '';
  // 도시를 찾아 열었으면 도시 이름 (교토 · 일본). 지도에서 나라를 눌렀으면 나라 이름
  const name = place.t === 'kr' ? regionLong(place.code) : place.city ? place.city : countryName;
  const visits = (place.t === 'kr' ? stats?.cellVisits.get(place.code) : stats?.countryVisits.get(place.id)) ?? 0;
  const placeParam = place.t === 'kr' ? `kr:${place.code}` : `country:${place.id}${place.city ? `:${encodeURIComponent(place.city)}` : ''}`;

  // 시트가 열려 있으면 알림을 위로 올려 버튼을 가리지 않게
  useEffect(() => {
    document.body.classList.add('sheet-open');
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => {
      document.body.classList.remove('sheet-open');
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  // 핀을 꽂아 횟수가 늘면 도장이 '쾅' 찍힌다
  const [stamped, setStamped] = useState(false);
  // 처음 꽂은 칸이면 도장 뒤에 새싹이 돋는다 (창을 닫을 때까지 그대로)
  const [sprouted, setSprouted] = useState(false);
  const [openMap, mapChoice] = useMapChoice();
  const prevVisits = useRef(visits);
  // 아래로 끌어서 닫기
  const sheetRef = useRef<HTMLDivElement>(null), scrollRef = useRef<HTMLDivElement>(null);
  useSwipeDown(sheetRef, scrollRef, onClose);
  useEffect(() => {
    if (visits > prevVisits.current) { if (prevVisits.current === 0) setSprouted(true); setStamped(true); const t = setTimeout(() => setStamped(false), 600); prevVisits.current = visits; return () => clearTimeout(t); }
    prevVisits.current = visits;
  }, [visits]);
  return (
    <div className="sheet split" ref={sheetRef} role="dialog" aria-modal="false" aria-label={name} data-testid="region-sheet">
      <div className="sheet-scroll" ref={scrollRef}>
      <div className="grip" aria-hidden="true" />
      {photoForPlace(place) && (
        <div style={{ position: 'relative' }}>
          <ScenicPhoto photo={photoForPlace(place)} className="sheet-photo" label="bottom" onTap={(p) => openMap({ name: p.name, search: true, wish: { place, kind: 'spot' } })} />
        </div>
      )}
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <div>
          {place.t === 'country' && place.city && (
            <div className="sheet-crumb" data-testid="sheet-crumb">
              {onPlace ? <button type="button" onClick={() => onPlace({ t: 'country', id: place.id })}>{countryName}</button> : <span>{countryName}</span>}
              <span aria-hidden="true">›</span><span>{place.city}</span>
            </div>
          )}
          <Link to={`/region/${placeParam}`} className="jua" style={{ fontSize: 28, lineHeight: 1.1, color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }} data-testid="sheet-title">{name}<Icon name="chev" size={18} /></Link>
          <Link to={`/region/${placeParam}`} className="tiny" style={{ fontWeight: 600, display: 'block', marginTop: 3 }} data-testid="sheet-region">{(place.t === 'kr' ? name.split(' ').pop() : place.city ?? name.split(' · ')[0])} 자세히 보기 · 볼거리·먹거리·우리 기록 ›</Link>
          {place.t === 'country' && !place.city && onPlace && citiesOf(place.id).length > 0 && (() => {
            const been = new Set(trips.filter((t) => t.status === 'done').flatMap((t) => t.places).filter((p) => p.t === 'country' && p.id === place.id && p.city).map((p) => (p as { city: string }).city));
            const list = [...new Set([...been, ...citiesOf(place.id)])].slice(0, 12);
            return (
              <div className="sheet-cities" data-testid="sheet-cities">
                <span className="tiny muted">어느 도시예요? 도시로 남기면 그 도시 정보가 함께 보여요</span>
                <div className="chips" style={{ gap: 6 }}>
                  {list.map((c) => <button key={c} type="button" className={'chip' + (been.has(c) ? ' soft-on' : '')} onClick={() => onPlace({ t: 'country', id: place.id, city: c })} data-testid={`sheet-city-${c}`}>{been.has(c) ? '✓ ' : ''}{c}</button>)}
                </div>
              </div>
            );
          })()}
          {season && <div className="tiny" style={{ color: '#b4472c', fontWeight: 600 }}>가기 좋은 때 {monthsLabel(season.m)}{season.why ? ` · ${season.why}` : ''}{season.at ? ` (${season.at} 기준)` : ''}</div>}
          {fests.length > 0 && (
            <div className="sheet-fests" data-testid="sheet-festivals">
              {fests.map((f) => (
                <span key={f.id || f.t + f.s} className="fest">
                  <span className={'tag ' + (isOngoing(f) ? 'coral' : 'violet')}>{isOngoing(f) ? '지금 축제' : '축제'}</span>
                  <button type="button" className="fest-name tap-item" onClick={() => openMap({ name: f.t, search: true, wish: { place, kind: 'spot' } })}>{f.t}</button>
                  <span className="muted">{festivalPeriod(f)}</span>
                </span>
              ))}
            </div>
          )}
          {(plant || flower) && (
            <div className="plant-line" data-testid="plant-line">
              <img src={flowerSrc(flower?.icon ?? 'wild', plant ? '' : '-gray')} alt="" width={26} height={26} />
              <span>
                {flower && <span data-testid="region-flower">{placeLabel(place)}의 {flower.note ? '대표 꽃' : '꽃'} · {flower.name}{plant ? '' : ' · 다녀오면 피어요'}</span>}
                {flower?.note && <span className="tiny muted" style={{ display: 'block' }}>{flower.note}</span>}
                {plant && <span style={{ display: 'block' }}>{plantLine(plant)}</span>}
                {hint && <span className="tiny muted" style={{ display: 'block' }}>{hint}</span>}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 'none' }}>
          {visits > 0 && <span className={'stamp hand' + (stamped ? ' stamp-in' : '')} aria-hidden="true"><span style={{ fontSize: 20 }}>{visits}</span><span style={{ fontSize: 9 }}>번째 핀</span></span>}
          {sprouted && <span className="sprout-in" aria-hidden="true" data-testid="sprout"><i /><i /></span>}
          <button className="icon-btn" aria-label="닫기" onClick={onClose}><Icon name="x" size={18} stroke={2.2} /></button>
        </div>
      </div>

      {mapChoice}
      {place.t === 'kr' && <RegionInfo code={place.code} />}
      {place.t === 'kr' && <NewsStrip place={place} />}
      {place.t === 'country' && <CountryCities place={place} wishes={wishes} />}

      {/* 다녀온 기록 / 가고 싶어요를 칸으로 나눈다 (사용자 의견 11-22: 둘의 구획이 흐렸다) */}
      <section className="sheet-block" data-testid="sheet-been-block">
        <div className="sheet-block-head">
          <b><Icon name="pin" size={16} />다녀온 기록</b>
          {beenRecs.length > 0 && <Link to={`/region/${placeParam}?tab=places`} className="small" style={{ fontWeight: 500 }} data-testid="sheet-mymap">맛집·명소 모두 보기</Link>}
        </div>
        <div className="hand" style={{ fontSize: 18, color: visits ? 'var(--violet)' : 'var(--ink3)', lineHeight: 1.1 }}>
          {visits >= 2 ? `${times(visits)} 다녀왔어요` : visits === 1 ? '한 번 다녀왔어요' : '아직 안 가본 곳'}
        </div>
        {done.length > 0 && (
          <div className="list">
            {done.slice(0, 3).map((t) => <TripRow key={t.id} trip={t} />)}
            {done.length > 3 && <Link to={`/trips?q=${encodeURIComponent(placeLabel(place))}`} className="small" style={{ padding: '6px 0', fontWeight: 500 }}>{done.length - 3}건 더 보기</Link>}
          </div>
        )}
        {beenRecs.length > 0 && <span className="small" style={{ fontWeight: 600 }}>다녀온 맛집·명소 · {beenRecs.length}</span>}
        {beenRecs.slice(0, 3).map((r) => <PlaceRecRow key={r.id} rec={r} />)}
      </section>

      <section className="sheet-block" data-testid="sheet-want-block">
        <div className="sheet-block-head">
          <b><span className="mark" aria-hidden="true" style={{ color: '#d9534f' }}>{wish ? '♥' : '♡'}</span>가고 싶어요</b>
          {wish && <Link to={`/wishes/${wish.id}`} className="small" style={{ fontWeight: 500 }} data-testid="sheet-wish-memo">메모 보기</Link>}
        </div>
        {!wish && !planned.length && !wantRecs.length && <span className="empty-line">아직 없어요 · 아래 ♡ 가고 싶어요로 남겨요</span>}
        {wish && <span className="small">가고 싶은 곳에 있어요{wish.months?.length ? ` · ${monthsLabel(wish.months)}` : ''}</span>}
        {wish && visits > 0 && left.length > 0 && (
          <Link to={`/wishes/${wish.id}`} className="leftover-line tiny" data-testid="sheet-left">
            못 가 본 곳 {left.length} · {left.slice(0, 3).join(', ')}{left.length > 3 ? ' …' : ''}
          </Link>
        )}
        {planned.length > 0 && (
          <div className="list">
            {planned.slice(0, 2).map((t) => <TripRow key={t.id} trip={t} />)}
          </div>
        )}
        {wantRecs.length > 0 && <span className="small" style={{ fontWeight: 600 }}>가고 싶은 맛집·명소 · {wantRecs.length}</span>}
        {wantRecs.slice(0, 3).map((r) => <PlaceRecRow key={r.id} rec={r} />)}
      </section>
      </div>
      {/* 가장 많이 쓰는 버튼은 창 아래에 늘 보이게 (내용이 길어도 스크롤 밖) */}
      <div className="sheet-actions">
        <BeenWant place={place} trips={trips} wishes={wishes} againCount={done.length} inline />
      </div>
    </div>
  );
}
