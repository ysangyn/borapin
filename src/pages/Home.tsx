import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatars, Icon, Logo } from '../components/ui';
import type { MapMode } from '../components/MapView';
import MapView from '../components/LazyMap';
import TripRow from '../components/TripRow';
import { computeStats, TOTAL_CELLS, TOTAL_GROUPS, useTrips } from '../lib/data';
import { pickMemory } from '../lib/memories';
import { formatWhen } from '../lib/dates';
import { placeLabel } from '../lib/geo';

export default function Home() {
  const { trips } = useTrips();
  const [mode, setMode] = useState<MapMode>('kr');
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  const planned = trips?.filter((t) => t.status === 'planned') ?? [];
  const recent = trips?.filter((t) => t.status === 'done').slice(0, 3) ?? [];
  const memory = useMemo(() => (trips ? pickMemory(trips) : null), [trips]);
  const few = stats ? stats.cellVisits.size < 8 : true;

  return (
    <>
      <div className="topbar">
        <span className="brand"><Logo />보라핀</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/trips" className="icon-btn" aria-label="여행 찾기"><Icon name="search" size={20} stroke={2} /></Link>
          <Link to="/space" aria-label="우리 공간"><Avatars size={34} /></Link>
        </div>
      </div>
      <div className="page" style={{ paddingTop: 4 }}>
        <div>
          <div className="small muted">보라 &amp; 영상의 지도</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }} data-testid="headline">
            {stats ? (stats.tripsDone ? `${stats.tripsDone}번의 여행, 핀 ${stats.pins}개` : '첫 핀을 꽂아 볼까요?') : '…'}
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 8 }}>
            <div className="seg dark" role="tablist">
              <button role="tab" aria-selected={mode === 'kr'} className={mode === 'kr' ? 'on' : ''} onClick={() => setMode('kr')}>국내</button>
              <button role="tab" aria-selected={mode === 'world'} className={mode === 'world' ? 'on' : ''} onClick={() => setMode('world')}>세계</button>
            </div>
            <Link to="/map" className="small" style={{ fontWeight: 700 }}>지도 크게 보기</Link>
          </div>
          <MapView mode={mode} stats={stats} height={290} cooperative controls={true} />
          {stats && (
            <div className="stats" data-testid="stats">
              {few ? (
                <>
                  <div className="stat"><b>{stats.cellVisits.size}</b><span>다녀온 시·군</span></div>
                  <div className="stat"><b>{stats.countryVisits.size}</b><span>해외 나라</span></div>
                  <div className="stat"><b>{stats.tripsDone}</b><span>여행·나들이</span></div>
                  <div className="stat"><b>{planned.length}</b><span>예정</span></div>
                </>
              ) : (
                <>
                  <div className="stat"><b>{stats.cellVisits.size}<small> /{TOTAL_CELLS}</small></b><span>시·군</span></div>
                  <div className="stat"><b>{stats.groupsVisited.size}<small> /{TOTAL_GROUPS}</small></b><span>광역</span></div>
                  <div className="stat"><b>{stats.countryVisits.size}</b><span>해외 나라</span></div>
                  <div className="stat"><b>{stats.cities.size}</b><span>해외 도시</span></div>
                </>
              )}
            </div>
          )}
        </div>

        {planned.length > 0 && (
          <section>
            <div className="small" style={{ fontWeight: 700, color: 'var(--violet)', marginBottom: 4 }}>다가오는 여행</div>
            <div className="list">{planned.slice(0, 2).map((t) => <TripRow key={t.id} trip={t} />)}</div>
          </section>
        )}

        {memory && (
          <Link to={`/trips/${memory.trip.id}`} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'inherit' }} data-testid="memory">
            <span className="trip-tile">{placeLabel(memory.trip.places[0]).slice(0, 4)}</span>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="tiny" style={{ color: 'var(--violet)', fontWeight: 800 }}>{memory.label}</span>
              <span style={{ fontWeight: 700 }}>{memory.trip.title}</span>
              <span className="tiny muted">{formatWhen(memory.trip.when)}</span>
            </span>
            <Icon name="chev" size={18} />
          </Link>
        )}

        <section>
          <div className="row-between" style={{ marginBottom: 2 }}>
            <h2 className="h2">최근 기록</h2>
            <Link to="/trips" className="small" style={{ fontWeight: 600 }}>전체 보기</Link>
          </div>
          {trips && recent.length === 0 && (
            <div className="empty">
              <b>아직 기록이 없어요</b>
              <span className="small">어디, 대략 언제만 있으면 기록 하나가 돼요.<br />예전 여행지도(v22) 기록은 '우리 공간'에서 가져올 수 있어요.</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/record" className="btn sm">첫 기록 남기기</Link>
                <Link to="/space" className="btn sm soft">v22 가져오기</Link>
              </div>
            </div>
          )}
          <div className="list">{recent.map((t) => <TripRow key={t.id} trip={t} />)}</div>
        </section>
      </div>
    </>
  );
}
