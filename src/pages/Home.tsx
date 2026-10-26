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
import NextTripHub from '../components/NextTripHub';
import MonthPick, { useMonthPick } from '../components/MonthPick';
import { nextCell, aboutMin } from '../lib/nextCell';
import { withIeyo } from '../lib/ko';
import type { Stats } from '../lib/stats';
import { useHome } from '../lib/home';
import { memoryLine, pickMemory, type Memory } from '../lib/memories';
import { tripStage } from '../lib/stage';
import StageCard from '../components/StageCard';
import { formatWhen } from '../lib/dates';
import { placeLabel } from '../lib/geo';
import { spaceTitle, toneOf } from '../lib/members';
import { times } from '../lib/ko';

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
  const stage = useMemo(() => (trips ? tripStage(trips) : null), [trips]);
  const few = stats ? stats.cellVisits.size < 8 : true;
  // 기록이 하나도 없으면(불러오기 끝) '아직 기록이 없어요'를 지도 바로 아래에 둔다
  const noRecords = !!trips && trips.length === 0;
  // 홈 지도는 최근 핀 둘레를 가까이, 기록이 없으면 오늘의 추천 둘레를
  const pick = useMonthPick(stats, wishes ?? []);
  // 최근 핀(국내)이 있으면 그 시·군이 보이게 가까이, 없으면(기록 없음·최근이 해외) 추천 둘레를 도 단위로만
  const { near, nearZoom } = useMemo(() => {
    const fromTrips = (recent[0]?.places ?? []).filter((p) => p.t === 'kr');
    if (fromTrips.length) return { near: fromTrips, nearZoom: 7.3 };
    return { near: pick?.place ? [pick.place] : [], nearZoom: 6.3 };
  }, [recent, pick]);

  return (
    <>
      <div className="topbar">
        <span className="brand"><Logo />보라핀</span>
        <Link to="/space" aria-label="우리 공간"><Avatars size={34} /></Link>
      </div>
      <div className="page" style={{ paddingTop: 4 }}>
        <div className="home-head">
          <div style={{ minWidth: 0 }}>
            <div className="small" style={{ fontWeight: 700, color: 'var(--ink3)' }}>{spaceTitle()}의 지도</div>
            <div className="headline" data-testid="headline">
              {stats ? (stats.tripsDone ? <>{times(stats.tripsDone)}의 여행,<br />핀 <b>{stats.pins}</b>개 꽂았어요</> : '첫 핀을 꽂아 볼까요?') : <span className="skeleton-text" aria-busy="true" />}
            </div>
          </div>
          <img className="home-bora" src="/art/bora-face.webp" alt="" width={80} height={80} decoding="async" />
        </div>

        {/* 단계 카드는 그 여행의 사진·글 개수만 서버에서 센다 (사진·글 전체 구독 없음) */}
        {stage && <StageCard key={stage.trip.id} stage={stage} />}

        <div className="card map-card" style={{ padding: 12 }}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 8 }}>
            <div className="seg dark" role="tablist">
              <button role="tab" aria-selected={mode === 'kr'} className={mode === 'kr' ? 'on' : ''} onClick={() => { setMode('kr'); setSel(null); }}>국내</button>
              <button role="tab" aria-selected={mode === 'world'} className={mode === 'world' ? 'on' : ''} onClick={() => { setMode('world'); setSel(null); }}>세계</button>
            </div>
            <Link to="/map" className="small" style={{ fontWeight: 700 }}>지도 크게 보기</Link>
          </div>
          <MapView mode={mode} stats={stats} height={290} cooperative controls={true} selected={sel} onSelect={setSel} flags={flags} spots={spots} near={near} nearZoom={nearZoom} />
          <div className="tiny muted" style={{ textAlign: 'center', marginTop: 6, lineHeight: 1.5 }} data-testid="map-hint">지역을 누르면 핀 꽂기 단추가 나와요<br />전체 보기 단추를 누르면 전국이 보여요</div>
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
          {stats && <NextCellLine stats={stats} onOpen={(code) => { setMode('kr'); setSel({ t: 'kr', code }); }} />}
        </div>

        <form className="ask-home" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav(`/ask?q=${encodeURIComponent(q.trim())}`); }} data-testid="home-ask">
          <img src="/art/pini.svg" alt="" width={30} height={30} decoding="async" />
          <input aria-label="물어보기" placeholder="물어보기: 강릉 맛집, 11월 축제" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        {/* 기록이 하나도 없으면 첫 핀으로 가는 길이 묶음보다 먼저 */}
        {noRecords && <EmptyRecords />}

        {overdue[0] && (
          <div className="card coral-soft" style={{ display: 'flex', gap: 10, alignItems: 'center' }} data-testid="overdue">
            <span className="small" style={{ flex: 1 }}><b>{overdue[0].title}</b> 다녀오셨나요?<span className="tiny muted" style={{ display: 'block' }}>날짜가 지났어요. 다녀왔으면 지도에 핀으로 바꿔 둘게요.</span></span>
            <button className="btn sm" onClick={() => patchTrip(overdue[0].id, { status: 'done' }).then(() => toast('다녀온 여행으로 바꿨어요'))}>다녀왔어요</button>
          </div>
        )}

        {/* 예정 여행은 아래 '다음 여행 준비' 묶음이 맡는다 (같은 여행을 두 번 보여 주지 않게) */}
        {/* 여행 전·중·후 카드가 있을 땐 지금 중요한 것만 크게 보이게, 둘러보기(추천·가고 싶은 곳·추억)는 접어 둔다 */}
        {trips && wishes && <NextTripHub wishes={wishes} trips={trips} stats={stats} excludeTripId={stage?.trip.id ?? null} />}
        {stage ? (
          <details className="home-more" data-testid="home-more">
            <summary><span>이달의 추천 · 가고 싶은 곳</span><Icon name="chev" size={16} /></summary>
            <div className="home-more-body">
              {trips && wishes && <MonthPick stats={stats} wishes={wishes} />}
              {trips && wishes && <WishRolling wishes={wishes} trips={trips} stats={stats} />}
              {memory && <MemoryCard memory={memory} />}
            </div>
          </details>
        ) : (
          <>
            {trips && wishes && <MonthPick stats={stats} wishes={wishes} />}
            {memory && <MemoryCard memory={memory} />}
          </>
        )}

        {!noRecords && (
          <section>
            <div className="row-between" style={{ marginBottom: 2 }}>
              <h2 className="h2">최근에 남긴 기록</h2>
              <Link to="/trips" className="small" style={{ fontWeight: 600 }}>전체 보기</Link>
            </div>
            {trips && recent.length === 0 && <EmptyRecords />}
            <div className="list">{recent.map((t) => <TripRow key={t.id} trip={t} />)}</div>
          </section>
        )}
      </div>
      {sel && trips && <PlaceSheet key={JSON.stringify(sel)} place={sel} trips={trips} stats={stats} wishes={wishes ?? []} recs={recs ?? []} onClose={() => setSel(null)} />}
    </>
  );
}

/** 아직 다녀온 기록이 없을 때: 지도에서 핀을 꽂는 길과 '기록 남기기' */
function EmptyRecords() {
  return (
    <div className="card art-row" data-testid="home-empty">
      <img src="/art/bora-camera.webp" alt="" aria-hidden="true" width={360} height={623} decoding="async" />
      <span>
        <b style={{ display: 'block', fontSize: 17, marginBottom: 4 }}>아직 기록이 없어요</b>
        <span className="small muted" style={{ display: 'block', marginBottom: 10 }}>위 지도에서 다녀온 곳을 누르면 핀 꽂기 단추가 나와요. 날짜·메모는 나중에 적어도 돼요.</span>
        <Link to="/record" className="btn sm">기록 남기기</Link>
      </span>
    </div>
  );
}

/** 다음 한 칸: 집에서 가장 가까운 빈 칸 하나 (집을 모르면 안 보임). 누르면 그 칸의 지역 창 */
function NextCellLine({ stats, onOpen }: { stats: Stats; onOpen: (code: string) => void }) {
  const home = useHome();
  const n = useMemo(() => nextCell(home, stats.cellVisits, stats.cellPlanned), [home, stats]);
  if (!n) return null;
  return (
    <button type="button" className="next-cell" onClick={() => onOpen(n.code)} data-testid="next-cell">
      <span className="next-cell-seed" aria-hidden="true" />
      <span>집에서 가장 가까운 빈 칸은 <b>{withIeyo(n.name)}</b> <span className="muted">· 차로 {aboutMin(n.min)}</span></span>
    </button>
  );
}

/** 몇 년 전 오늘 같은 추억 한 장 */
function MemoryCard({ memory }: { memory: Memory }) {
  const { places } = usePlaces();
  const line = places ? memoryLine(memory.trip, places) : null;
  return (
    <Link to={`/trips/${memory.trip.id}`} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'inherit' }} data-testid="memory">
      <span className="trip-tile">{memory.trip.places[0] ? placeLabel(memory.trip.places[0]).slice(0, 4) : '여행'}</span>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="tiny" style={{ color: 'var(--violet)', fontWeight: 800 }}>{memory.label}</span>
        <span style={{ fontWeight: 700 }}>{memory.trip.title}</span>
        <span className="tiny muted">{formatWhen(memory.trip.when)}</span>
        {line && <span className="hand mem-line" data-testid="memory-line"><span className={'who-dot t' + Math.max(0, toneOf(line.who))} aria-hidden="true" />“{line.text}” <span className="tiny muted">— {line.who}, {line.place}</span></span>}
      </span>
      <Icon name="chev" size={18} />
    </Link>
  );
}
