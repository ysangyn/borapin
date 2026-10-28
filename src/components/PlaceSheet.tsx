import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TripRow from './TripRow';
import RegionInfo from './RegionInfo';
import { Icon, useToast } from './ui';
import { displayName, useAuth } from '../lib/auth';
import { useMapChoice } from './MapChoice';
import { memberNames } from '../lib/members';
import { createTrip, deleteTrip, tripsAtPlace, type Stats } from '../lib/data';
import { COUNTRY_BY_ID, placeLabel, REGION_BY_CODE, regionLong } from '../lib/geo';
import type { Place, PlaceRec, Trip, Wish } from '../lib/types';
import PlaceRecRow from './PlaceRecRow';
import { recsAt } from '../lib/placeRecs';
import { samePlace as samePlaceW } from '../lib/wishes';
import { quickWish } from '../lib/wishActions';
import { garden, growHint, plantLine } from '../lib/garden';
import { useSwipeDown } from '../lib/swipe';
import { flowerOf, flowerSrc } from '../lib/flowers';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { celebrate, whatsNew } from '../lib/celebrate';
import { photoForPlace } from '../lib/media';
import { ScenicPhoto } from './Scene';
import { times } from '../lib/ko';
import { festivalPeriod, isOngoing, upcomingFestivals, useFestivals } from '../lib/festivals';
import { quickTripInput } from '../lib/tripActions';
import NewsStrip from './NewsStrip';
import CountryCities from './CountryCities';

function mapLinks(p: Place) {
  const q = p.t === 'kr'
    ? `${REGION_BY_CODE.get(p.code)?.sido ?? ''} ${REGION_BY_CODE.get(p.code)?.name ?? ''}`
    : COUNTRY_BY_ID.get(p.id)?.name ?? '';
  const enc = encodeURIComponent(q.trim());
  return { naver: `https://map.naver.com/p/search/${enc}`, google: `https://www.google.com/maps/search/?api=1&query=${enc}` };
}

const recsHere = (recs: PlaceRec[], p: Place) => recsAt(recs, p);

const samePlace = (sel: Place) => (p: Place) =>
  sel.t === 'kr' ? p.t === 'kr' && p.code === sel.code : p.t === 'country' && p.id === sel.id;

/** 지도에서 지역을 누르면 뜨는 아래 시트: 그곳 기록 보기 + 바로 핀 꽂기 */
export default function PlaceSheet({ place, trips, stats, wishes = [], recs = [], onClose }: {
  place: Place;
  trips: Trip[];
  stats: Stats | null;
  wishes?: Wish[];
  recs?: PlaceRec[];
  onClose: () => void;
}) {
  const nav = useNavigate();
  const seasons = useSeasons();
  const festData = useFestivals();
  const fests = place.t === 'kr' ? upcomingFestivals(festData, place.code, new Date(), 120).slice(0, 2) : [];
  const wish = wishes.find((w) => samePlaceW(w.place, place));
  const season = seasonFor(seasons, place, wish?.months);
  const auth = useAuth();
  // 심는 지도: 이 칸의 식물 (다녀온 칸만)
  const plant = useMemo(() => (place.t === 'kr' ? garden(trips, recs).get(place.code) : undefined), [place, trips, recs]);
  const flower = flowerOf(place);
  const hint = growHint(plant, auth.status === 'ready' ? displayName(auth.user) : '');
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const here = useMemo(() => tripsAtPlace(trips, samePlace(place)), [trips, place]);
  const done = here.filter((t) => t.status === 'done');
  const name = place.t === 'kr' ? regionLong(place.code) : COUNTRY_BY_ID.get(place.id)?.name ?? place.id;
  const visits = (place.t === 'kr' ? stats?.cellVisits.get(place.code) : stats?.countryVisits.get(place.id)) ?? 0;
  const placeParam = place.t === 'kr' ? `kr:${place.code}` : `country:${place.id}`;
  const links = mapLinks(place);

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

  const quickPin = async () => {
    if (auth.status !== 'ready' || busy) return;
    setBusy(true);
    try {
      const input = quickTripInput(place, memberNames());
      const news = whatsNew(trips, [...trips, { ...input, id: 'new', v: 1 }]);
      const id = await createTrip(input, auth.user);
      if (news) celebrate();
      toast(`${placeLabel(place)}에 핀을 꽂았어요${news ? ` · ${news}` : ''}`, { label: '되돌리기', onClick: () => void deleteTrip(id) });
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const addWish = async () => {
    if (auth.status !== 'ready') return;
    try {
      const { id, already } = await quickWish(place, auth.user, wishes);
      toast(already ? '이미 담겨 있어요' : '가고 싶은 곳에 담았어요', { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch {
      toast('담지 못했어요. 다시 해 주세요');
    }
  };

  // 핀을 꽂아 횟수가 늘면 도장이 '쾅' 찍힌다
  const [stamped, setStamped] = useState(false);
  const [openMap, mapChoice] = useMapChoice();
  const prevVisits = useRef(visits);
  // 아래로 끌어서 닫기
  const sheetRef = useRef<HTMLDivElement>(null), scrollRef = useRef<HTMLDivElement>(null);
  useSwipeDown(sheetRef, scrollRef, onClose);
  useEffect(() => {
    if (visits > prevVisits.current) { setStamped(true); const t = setTimeout(() => setStamped(false), 600); prevVisits.current = visits; return () => clearTimeout(t); }
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
          <div className="jua" style={{ fontSize: 28, lineHeight: 1.1 }} data-testid="sheet-title">{name}</div>
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
          <div className="hand" style={{ fontSize: 18, color: visits ? 'var(--violet)' : 'var(--ink3)', lineHeight: 1.1, marginTop: 2 }}>
            {visits >= 2 ? `${times(visits)} 다녀왔어요` : visits === 1 ? '한 번 다녀왔어요' : here.length ? '갈 예정이에요' : '아직 안 가본 곳'}
          </div>
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
          <button className="icon-btn" aria-label="닫기" onClick={onClose}><Icon name="x" size={18} stroke={2.2} /></button>
        </div>
      </div>

      {mapChoice}
      {place.t === 'kr' && <RegionInfo code={place.code} />}
      {place.t === 'kr' && <NewsStrip place={place} />}
      {place.t === 'country' && <CountryCities place={place} wishes={wishes} />}

      {here.length > 0 && (
        <div className="list" style={{ marginTop: 4 }}>
          {here.slice(0, 3).map((t) => <TripRow key={t.id} trip={t} />)}
          {here.length > 3 && <Link to={`/trips?q=${encodeURIComponent(placeLabel(place))}`} className="small" style={{ padding: '6px 0', fontWeight: 700 }}>{here.length - 3}건 더 보기</Link>}
        </div>
      )}

      <div className="sheet-recs">
        <div className="row-between" style={{ alignItems: 'center' }}>
          <span className="small" style={{ fontWeight: 800 }}>우리 장소{recsHere(recs, place).length ? ` · ${recsHere(recs, place).length}` : ''}</span>
          <Link to={`/places/new?region=${placeParam}`} className="small" style={{ fontWeight: 700 }} data-testid="sheet-place-new">+ 장소 남기기</Link>
        </div>
        {recsHere(recs, place).slice(0, 3).map((r) => <PlaceRecRow key={r.id} rec={r} />)}
      </div>

      <div className="tiny muted" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
        <span style={{ flex: 1 }}>'핀 꽂기'는 날짜 없이 다녀온 표시만 해요</span>
        <a href={links.naver} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>네이버지도</a>
        <a href={links.google} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>구글지도</a>
      </div>
      </div>
      {/* 가장 많이 쓰는 버튼은 창 아래에 늘 보이게 (내용이 길어도 스크롤 밖) */}
      <div className="sheet-actions">
        <button className="btn" style={{ flex: 1.15 }} disabled={busy || auth.status !== 'ready'} onClick={quickPin} data-testid="quick-pin">
          <Icon name="plus" size={17} stroke={2.4} />
          {busy ? '꽂는 중…' : done.length ? '핀 하나 더 꽂기' : '핀 꽂기'}
        </button>
        <Link to={`/record?place=${placeParam}`} className="btn soft" style={{ flex: 1 }}>자세히 기록</Link>
        {/* 담기(가고 싶은 곳)는 핀 모양: 하트는 '마음'(나도 원해요·좋아요)에만 쓴다 */}
        {wish ? (
          <Link to={`/wishes/${wish.id}`} className="btn coral-soft" style={{ width: 52, padding: 0, flexDirection: 'column', gap: 0, fontSize: 10 }} aria-label="가고 싶은 곳에 담겨 있어요" data-testid="sheet-wished">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" /></svg>
            담겼어요
          </Link>
        ) : (
          <button className="btn coral-soft" style={{ width: 52, padding: 0, flexDirection: 'column', gap: 0, fontSize: 10 }} onClick={addWish} aria-label="가고 싶은 곳에 담기" data-testid="sheet-wish">
            <Icon name="pin" size={20} stroke={2.2} />
            담기
          </button>
        )}
      </div>
    </div>
  );
}
