import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TripRow from './TripRow';
import RegionInfo from './RegionInfo';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import { createTrip, deleteTrip, tripsAtPlace, type Stats } from '../lib/data';
import { COUNTRY_BY_ID, placeLabel, REGION_BY_CODE, regionLong } from '../lib/geo';
import type { Place, PlaceRec, Trip, Wish } from '../lib/types';
import PlaceRecRow from './PlaceRecRow';
import { recsAt } from '../lib/placeRecs';
import { samePlace as samePlaceW } from '../lib/wishes';
import { quickWish } from '../lib/wishActions';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { confetti, whatsNew } from '../lib/celebrate';
import { photoForPlace } from '../lib/media';
import { ScenicPhoto } from './Scene';

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
  const wish = wishes.find((w) => samePlaceW(w.place, place));
  const season = seasonFor(seasons, place, wish?.months);
  const auth = useAuth();
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
      const input = {
        title: `${placeLabel(place)} 여행`,
        kind: 'trip' as const,
        status: 'done' as const,
        when: { p: 'unknown' as const },
        places: [place],
        companions: ['보라', '영상'],
        memo: '',
        tags: [],
        source: 'app' as const,
      };
      const news = whatsNew(trips, [...trips, { ...input, id: 'new', v: 1 }]);
      const id = await createTrip(input, auth.user);
      if (news) confetti();
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

  return (
    <div className="sheet" role="dialog" aria-modal="false" aria-label={name} data-testid="region-sheet">
      <div className="grip" />
      {photoForPlace(place) && (
        <div style={{ position: 'relative' }}>
          <ScenicPhoto photo={photoForPlace(place)} className="sheet-photo" />
        </div>
      )}
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }} data-testid="sheet-title">{name}</div>
          {season && <div className="tiny" style={{ color: '#b4472c', fontWeight: 600 }}>가기 좋은 때 {monthsLabel(season.m)}{season.why ? ` · ${season.why}` : ''}{season.at ? ` (${season.at} 기준)` : ''}</div>}
          <div className="small muted">
            {visits >= 2 ? `${visits}번 다녀왔어요` : visits === 1 ? '다녀왔어요' : here.length ? '갈 예정이에요' : '아직 안 가본 곳'}
          </div>
        </div>
        <button className="icon-btn" aria-label="닫기" onClick={onClose}><Icon name="x" size={18} stroke={2.2} /></button>
      </div>

      {place.t === 'kr' && <RegionInfo code={place.code} />}

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

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" style={{ flex: 1.15 }} disabled={busy || auth.status !== 'ready'} onClick={quickPin} data-testid="quick-pin">
          <Icon name="plus" size={17} stroke={2.4} />
          {busy ? '꽂는 중…' : done.length ? '또 다녀왔어요' : '다녀왔어요'}
        </button>
        <Link to={`/record?place=${placeParam}`} className="btn soft" style={{ flex: 1 }}>자세히 기록</Link>
        {wish ? (
          <Link to={`/wishes/${wish.id}`} className="btn coral-soft" style={{ width: 52, padding: 0 }} aria-label="가고 싶은 곳에 담겨 있어요" data-testid="sheet-wished">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>
          </Link>
        ) : (
          <button className="btn coral-soft" style={{ width: 52, padding: 0 }} onClick={addWish} aria-label="가고 싶은 곳에 담기" data-testid="sheet-wish">
            <Icon name="heart" size={20} stroke={2.2} />
          </button>
        )}
      </div>
      <div className="tiny muted" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
        <span style={{ flex: 1 }}>'다녀왔어요'는 날짜 없이 핀만 꽂아요</span>
        <a href={links.naver} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>네이버지도</a>
        <a href={links.google} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>구글지도</a>
      </div>
    </div>
  );
}
