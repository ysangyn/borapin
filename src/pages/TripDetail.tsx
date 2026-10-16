import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon, Spinner, TopBar, useToast } from '../components/ui';
import MapView from '../components/LazyMap';
import { computeStats, deleteTrip, useTrips } from '../lib/data';
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

        {trip.status === 'planned' && <div className="card small">사진·일정·준비물은 다음 단계에서 열려요.</div>}

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
