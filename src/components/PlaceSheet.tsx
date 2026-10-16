import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TripRow from './TripRow';
import RegionInfo from './RegionInfo';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import { createTrip, deleteTrip, tripsAtPlace, type Stats } from '../lib/data';
import { COUNTRY_BY_ID, placeLabel, REGION_BY_CODE, regionLong } from '../lib/geo';
import type { Place, Trip } from '../lib/types';

function mapLinks(p: Place) {
  const q = p.t === 'kr'
    ? `${REGION_BY_CODE.get(p.code)?.sido ?? ''} ${REGION_BY_CODE.get(p.code)?.name ?? ''}`
    : COUNTRY_BY_ID.get(p.id)?.name ?? '';
  const enc = encodeURIComponent(q.trim());
  return { naver: `https://map.naver.com/p/search/${enc}`, google: `https://www.google.com/maps/search/?api=1&query=${enc}` };
}

const samePlace = (sel: Place) => (p: Place) =>
  sel.t === 'kr' ? p.t === 'kr' && p.code === sel.code : p.t === 'country' && p.id === sel.id;

/** 지도에서 지역을 누르면 뜨는 아래 시트: 그곳 기록 보기 + 바로 핀 꽂기 */
export default function PlaceSheet({ place, trips, stats, onClose }: {
  place: Place;
  trips: Trip[];
  stats: Stats | null;
  onClose: () => void;
}) {
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
    return () => document.body.classList.remove('sheet-open');
  }, []);

  const quickPin = async () => {
    if (auth.status !== 'ready' || busy) return;
    setBusy(true);
    try {
      const id = await createTrip(
        {
          title: `${placeLabel(place)} 여행`,
          kind: 'trip',
          status: 'done',
          when: { p: 'unknown' },
          places: [place],
          companions: ['보라', '영상'],
          memo: '',
          tags: [],
          source: 'app',
        },
        auth.user,
      );
      toast(`${placeLabel(place)}에 핀을 꽂았어요`, { label: '되돌리기', onClick: () => void deleteTrip(id) });
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet" role="dialog" aria-label={name} data-testid="region-sheet">
      <div className="grip" />
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }} data-testid="sheet-title">{name}</div>
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
          {here.length > 3 && <div className="tiny muted" style={{ padding: '4px 0' }}>외 {here.length - 3}건 · 여행 탭에서 '{placeLabel(place)}'로 찾아보세요</div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" style={{ flex: 1.15 }} disabled={busy || auth.status !== 'ready'} onClick={quickPin} data-testid="quick-pin">
          <Icon name="plus" size={17} stroke={2.4} />
          {busy ? '꽂는 중…' : done.length ? '또 다녀왔어요' : '다녀왔어요'}
        </button>
        <Link to={`/record?place=${placeParam}`} className="btn soft" style={{ flex: 1 }}>날짜·메모까지</Link>
      </div>
      <div className="tiny muted" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
        <span style={{ flex: 1 }}>'다녀왔어요'는 날짜 없이 핀만 꽂아요</span>
        <a href={links.naver} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>네이버지도</a>
        <a href={links.google} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>구글지도</a>
      </div>
    </div>
  );
}
