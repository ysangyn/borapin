import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon, Spinner, TopBar, useToast } from '../components/ui';
import MapView from '../components/LazyMap';
import { computeStats, deleteTrip, usePlaces, useTrips } from '../lib/data';
import PlaceRecRow from '../components/PlaceRecRow';
import { formatWhen, nightsDays } from '../lib/dates';
import { COUNTRY_BY_ID, placeLong, REGION_BY_CODE } from '../lib/geo';
import type { Place } from '../lib/types';

function mapLinks(p: Place) {
  let q = '';
  if (p.t === 'kr') q = REGION_BY_CODE.get(p.code)?.sido + ' ' + (REGION_BY_CODE.get(p.code)?.name ?? '');
  else q = [COUNTRY_BY_ID.get(p.id)?.name, p.city].filter(Boolean).join(' ');
  const enc = encodeURIComponent(q.trim());
  return {
    naver: `https://map.naver.com/p/search/${enc}`,
    google: `https://www.google.com/maps/search/?api=1&query=${enc}`,
  };
}

export default function TripDetail() {
  const { id } = useParams();
  const { trips } = useTrips();
  const { places: recs } = usePlaces();
  const nav = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const trip = trips?.find((t) => t.id === id);
  const stats = useMemo(() => (trip ? computeStats([{ ...trip, status: 'done' }]) : null), [trip]);

  if (!trips) return <Spinner />;
  if (!trip) {
    return (
      <>
        <TopBar back title="여행" />
        <div className="page"><div className="empty"><b>기록을 찾을 수 없어요</b><Link to="/trips" className="btn sm">여행 목록으로</Link></div></div>
      </>
    );
  }
  const nd = nightsDays(trip.when);
  const abroad = trip.places.every((p) => p.t === 'country');

  return (
    <>
      <TopBar
        back
        title={<span style={{ fontWeight: 800, fontSize: 17 }}>{trip.status === 'planned' ? '예정된 여행' : trip.kind === 'outing' ? '나들이' : '여행'}</span>}
        right={<Link to={`/trips/${trip.id}/edit`} className="btn sm line"><Icon name="edit" size={16} />고치기</Link>}
      />
      <div className="page" style={{ paddingTop: 4 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }} data-testid="trip-title">{trip.title}</div>
          <div className="muted">{formatWhen(trip.when)}{nd ? ` · ${nd}` : ''}</div>
        </div>

        <MapView mode={abroad ? 'world' : 'kr'} stats={stats} focus={trip.places} height={220} controls={false} />

        <div className="card white" style={{ padding: '4px 16px' }}>
          <div className="kv"><span className="k">어디</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {trip.places.map((p, i) => {
                const l = mapLinks(p);
                return (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <b style={{ flex: 1 }}>{placeLong(p)}</b>
                    <a className="tag" href={l.naver} target="_blank" rel="noreferrer">네이버지도</a>
                    <a className="tag" href={l.google} target="_blank" rel="noreferrer">구글지도</a>
                  </span>
                );
              })}
            </span>
          </div>
          <div className="kv"><span className="k">누구와</span><span>{trip.companions.length ? trip.companions.join(', ') : <span className="muted">적지 않음</span>}</span></div>
          {trip.memo && <div className="kv"><span className="k">메모</span><span style={{ whiteSpace: 'pre-wrap' }}>{trip.memo}</span></div>}
          {trip.tags.length > 0 && <div className="kv"><span className="k">태그</span><span className="chips">{trip.tags.map((t) => <span key={t} className="tag">{t}</span>)}</span></div>}
          <div className="kv"><span className="k">남긴 사람</span><span className="muted small">{trip.createdBy?.name ?? '-'}{trip.source === 'v22' ? ' · v22에서 가져옴' : ''}</span></div>
        </div>

        <section data-testid="trip-places">
          <div className="row-between" style={{ marginBottom: 2 }}>
            <h2 className="h2" style={{ fontSize: 17 }}>장소</h2>
            <Link to={`/places/new?trip=${trip.id}`} className="small" style={{ fontWeight: 700 }}>+ 장소 남기기</Link>
          </div>
          {(recs ?? []).filter((r) => r.tripId === trip.id).length === 0 ? (
            <div className="tiny muted">기억에 남은 맛집·카페·명소를 둘의 한 줄 평과 함께 남겨 보세요.</div>
          ) : (
            <div className="list">{(recs ?? []).filter((r) => r.tripId === trip.id).map((r) => <PlaceRecRow key={r.id} rec={r} />)}</div>
          )}
        </section>

        {!confirm ? (
          <button className="btn danger block" onClick={() => setConfirm(true)}><Icon name="trash" size={17} />이 기록 지우기</button>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <b>정말 지울까요? 되돌릴 수 없어요.</b>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>그대로 두기</button>
              <button
                className="btn" style={{ flex: 1, background: 'var(--danger)' }}
                onClick={async () => {
                  await deleteTrip(trip.id);
                  toast('지웠어요');
                  nav('/trips', { replace: true });
                }}
              >지우기</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
