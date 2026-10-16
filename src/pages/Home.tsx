import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatars, Icon, Logo, useToast } from '../components/ui';
import type { MapMode } from '../components/MapView';
import MapView from '../components/LazyMap';
import TripRow from '../components/TripRow';
import PlaceSheet from '../components/PlaceSheet';
import type { Place } from '../lib/types';
import { computeStats, overdueTrips, patchTrip, recentlyAdded, TOTAL_CELLS, TOTAL_GROUPS, upcomingTrips, usePlaces, useTrips, useWishes } from '../lib/data';
import { useWishFlags } from '../lib/wishFlags';
import { usePlaceSpots } from '../lib/placeSpots';
import WishRolling from '../components/WishRolling';
import MonthPick from '../components/MonthPick';
import { pickMemory } from '../lib/memories';
import { formatWhen } from '../lib/dates';
import { placeLabel } from '../lib/geo';
import { spaceTitle } from '../lib/members';

export default function Home() {
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const { places: recs } = usePlaces();
  const flags = useWishFlags(wishes, trips);
  const spots = usePlaceSpots(recs ?? null);
  const [mode, setMode] = useState<MapMode>('kr');
  const [sel, setSel] = useState<Place | null>(null);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  const toast = useToast();
  const planned = useMemo(() => (trips ? upcomingTrips(trips) : []), [trips]);
  const overdue = useMemo(() => (trips ? overdueTrips(trips) : []), [trips]);
  const recent = useMemo(() => (trips ? recentlyAdded(trips, 3) : []), [trips]);
  const memory = useMemo(() => (trips ? pickMemory(trips) : null), [trips]);
  const few = stats ? stats.cellVisits.size < 8 : true;

  return (
    <>
      <div className="topbar">
        <span className="brand"><Logo />보라핀</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/ask" className="icon-btn" aria-label="보라에게 물어봐"><Icon name="search" size={20} stroke={2} /></Link>
          <Link to="/space" aria-label="우리 공간"><Avatars size={34} /></Link>
        </div>
      </div>
      <div className="page" style={{ paddingTop: 4 }}>
        <div>
          <div className="small muted">{spaceTitle()}의 지도</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }} data-testid="headline">
            {stats ? (stats.tripsDone ? `${stats.tripsDone}번의 여행, 핀 ${stats.pins}개` : '첫 핀을 꽂아 볼까요?') : <span className="skeleton-text" aria-busy="true" />}
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 8 }}>
            <div className="seg dark" role="tablist">
              <button role="tab" aria-selected={mode === 'kr'} className={mode === 'kr' ? 'on' : ''} onClick={() => { setMode('kr'); setSel(null); }}>국내</button>
              <button role="tab" aria-selected={mode === 'world'} className={mode === 'world' ? 'on' : ''} onClick={() => { setMode('world'); setSel(null); }}>세계</button>
            </div>
            <Link to="/map" className="small" style={{ fontWeight: 700 }}>지도 크게 보기</Link>
          </div>
          <MapView mode={mode} stats={stats} height={290} cooperative controls={true} selected={sel} onSelect={setSel} flags={flags} spots={spots} />
          <div className="tiny muted" style={{ textAlign: 'center', marginTop: 6 }}>지역을 누르면 바로 핀을 꽂을 수 있어요 · 확대하면 이름이 보여요</div>
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

        <form className="ask-home" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav(`/ask?q=${encodeURIComponent(q.trim())}`); }} data-testid="home-ask">
          <img src="/art/bora-face.webp" alt="" width={30} height={30} decoding="async" />
          <input aria-label="보라에게 물어봐" placeholder="보라에게 물어봐: 영등포 맛집, 작년 여름에 간 곳" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        {overdue[0] && (
          <div className="card coral-soft" style={{ display: 'flex', gap: 10, alignItems: 'center' }} data-testid="overdue">
            <span className="small" style={{ flex: 1 }}><b>{overdue[0].title}</b> 다녀오셨나요?<span className="tiny muted" style={{ display: 'block' }}>날짜가 지났어요. 다녀왔으면 지도에 핀으로 바꿔 둘게요.</span></span>
            <button className="btn sm" onClick={() => patchTrip(overdue[0].id, { status: 'done' }).then(() => toast('다녀온 여행으로 바꿨어요'))}>다녀왔어요</button>
          </div>
        )}

        {planned.length > 0 && (
          <section>
            <div className="small" style={{ fontWeight: 700, color: 'var(--violet)', marginBottom: 4 }}>다가오는 여행</div>
            <div className="list">{planned.slice(0, 2).map((t) => <TripRow key={t.id} trip={t} />)}</div>
          </section>
        )}

        {trips && wishes && <WishRolling wishes={wishes} trips={trips} stats={stats} />}

        {trips && wishes && <MonthPick stats={stats} wishes={wishes} />}

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
            <h2 className="h2">최근에 남긴 기록</h2>
            <Link to="/trips" className="small" style={{ fontWeight: 600 }}>전체 보기</Link>
          </div>
          {trips && recent.length === 0 && (
            <div className="empty">
              <b>아직 기록이 없어요</b>
              <span className="small">위 지도에서 다녀온 곳을 누르면 바로 핀이 꽂혀요.<br />날짜·메모는 나중에 적어도 돼요.</span>
              <Link to="/record" className="btn sm">기록 남기기</Link>
            </div>
          )}
          <div className="list">{recent.map((t) => <TripRow key={t.id} trip={t} />)}</div>
        </section>
      </div>
      {sel && trips && <PlaceSheet key={JSON.stringify(sel)} place={sel} trips={trips} stats={stats} wishes={wishes ?? []} recs={recs ?? []} onClose={() => setSel(null)} />}
    </>
  );
}
