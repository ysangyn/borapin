import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../components/ui';
import TripRow from '../components/TripRow';
import { computeStats, usePlaces, useTrips } from '../lib/data';
import { pickMemory } from '../lib/memories';
import { usePhotos } from '../lib/photos';
import { openSlideshow } from '../components/slideshow';
import PhotoGrid from '../components/PhotoGrid';
import MapReplay from '../components/MapReplay';
import DateGame from '../components/DateGame';
import ShareCards from '../components/ShareCards';
import { badges } from '../lib/achievements';
import { monthGrid, yearReview } from '../lib/yearReview';
import { placeLong } from '../lib/geo';
import { Art } from '../components/Scene';

export default function Memories() {
  const { trips } = useTrips();
  const { photos } = usePhotos();
  const { places: recs } = usePlaces();
  const thisYear = new Date().getFullYear();
  const years = useMemo(() => {
    const ys = new Set((trips ?? []).filter((t) => t.status === 'done' && t.when.y).map((t) => t.when.y!));
    ys.add(thisYear);
    return [...ys].sort((a, b) => b - a);
  }, [trips, thisYear]);
  // 결산은 기록이 있는 가장 최근 해부터
  const latestYear = useMemo(() => (trips ?? []).filter((t) => t.status === 'done' && t.when.y && t.when.y <= thisYear).reduce((m, t) => Math.max(m, t.when.y!), 0) || thisYear, [trips, thisYear]);
  const [pickedYear, setYear] = useState<number | null>(null);
  const year = pickedYear ?? latestYear;
  const memory = useMemo(() => (trips ? pickMemory(trips) : null), [trips]);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  const review = useMemo(() => (trips ? yearReview(trips, year) : null), [trips, year]);
  const grid = useMemo(() => (trips ? monthGrid(trips) : null), [trips]);
  const list = useMemo(() => (trips && stats ? badges(trips, stats, photos ?? [], recs ?? []) : []), [trips, stats, photos, recs]);
  const albums = useMemo(() => {
    if (!photos || !trips) return [];
    const by = new Map<string, typeof photos>();
    for (const p of photos) if (p.tripId) by.set(p.tripId, [...(by.get(p.tripId) ?? []), p]);
    return trips.filter((t) => by.has(t.id)).map((t) => ({ trip: t, photos: by.get(t.id)! }));
  }, [photos, trips]);
  const earned = list.filter((b) => b.have >= b.need);
  const doneCount = (trips ?? []).filter((t) => t.status === 'done').length;
  const [allBadges, setAllBadges] = useState(false);
  // 받은 뱃지 먼저, 그다음 거의 다 된 것부터
  const badgeOrder = [...list].sort((a, b) => { const ao = a.have >= a.need, bo = b.have >= b.need; return Number(bo) - Number(ao) || (ao ? 0 : b.have / b.need - a.have / a.need); });
  const badgeShown = allBadges ? badgeOrder : badgeOrder.slice(0, 6);

  if (!trips) return (<><TopBar title="추억" /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div></>);
  if (doneCount === 0)
    return (
      <>
        <TopBar title="추억" />
        <div className="page" style={{ paddingTop: 4 }}>
          <div className="empty" data-testid="memories-empty">
            <Art id="bora-walk" className="empty-art" size={260} />
            <b>다녀온 여행을 하나 남기면 추억이 시작돼요</b>
            <span className="small">기록이 쌓이면 여기에 이런 것들이 생겨요</span>
            <ul className="preview-list">
              <li><b>몇 년 전 오늘</b> 그날의 여행을 다시 꺼내 줘요</li>
              <li><b>지도 다시 보기</b> 해마다 지도가 채워진 순서</li>
              <li><b>한 해 결산</b> 처음 가본 곳, 가장 많이 간 곳</li>
              <li><b>도전 뱃지</b> 핀 10개, 섬 탐험가, 사계절 여행</li>
            </ul>
            <Link to="/record" className="btn sm">기록 남기기</Link>
          </div>
        </div>
      </>
    );
  const maxCell = Math.max(1, ...(grid?.rows.flatMap(([, r]) => r) ?? [1]));

  return (
    <>
      <TopBar title="추억" />
      <div className="page" style={{ paddingTop: 4 }}>
        {memory && (
          <section className="card" data-testid="memory-card">
            <div className="tiny" style={{ color: 'var(--violet)', fontWeight: 800 }}>{memory.label}</div>
            <div className="list"><TripRow trip={memory.trip} /></div>
          </section>
        )}

        {trips && <DateGame trips={trips} />}

        <section>
          <h2 className="h2" style={{ marginBottom: 6 }}>지도 다시 보기</h2>
          {trips && <MapReplay trips={trips} />}
        </section>

        <section className="card white" data-testid="year-review">
          <div className="row-between" style={{ alignItems: 'center' }}>
            <div className="h2" style={{ fontSize: 16 }}>{year}년 결산</div>
            <select className="select" style={{ height: 34, width: 'auto' }} aria-label="결산 연도" value={year} onChange={(e) => setYear(+e.target.value)}>
              {years.map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
          </div>
          {review && (
            <>
              <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat"><b>{review.trips}</b><span>여행·나들이</span></div>
                <div className="stat"><b>{review.days}{review.daysExact ? '' : '+'}</b><span>밖에서 보낸 날</span></div>
                <div className="stat"><b>{review.firsts.length}</b><span>처음 가본 곳</span></div>
              </div>
              {review.firsts.length > 0 && <div className="small" style={{ marginTop: 8 }}>처음: {review.firsts.slice(0, 6).map(placeLong).join(' · ')}{review.firsts.length > 6 ? ` 외 ${review.firsts.length - 6}` : ''}</div>}
              {review.top && <div className="small muted">가장 많이 간 곳: {review.top}</div>}
            </>
          )}
        </section>

        {grid && grid.rows.length > 0 && (
          <section data-testid="heatmap">
            <h2 className="h2" style={{ marginBottom: 6 }}>여행 잔디</h2>
            <div className="heatmap">
              <span />
              {Array.from({ length: 12 }, (_, i) => <span key={i} className="hm-m">{i + 1}</span>)}
              {grid.rows.map(([y, row]) => (
                <div key={y} style={{ display: 'contents' }}>
                  <span className="hm-y">{y}</span>
                  {row.map((n, i) => (
                    <span key={i} className="hm-c" style={{ background: n ? `rgba(91, 63, 209, ${0.25 + 0.75 * (n / maxCell)})` : undefined }} title={`${y}년 ${i + 1}월 ${n}번`} />
                  ))}
                </div>
              ))}
            </div>
            {grid.undated > 0 && <div className="tiny muted" style={{ marginTop: 6 }}>달을 모르는 기록 {grid.undated}건은 빠져 있어요.</div>}
          </section>
        )}

        <section data-testid="badges">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <h2 className="h2">도전 뱃지 · {earned.length}/{list.length}</h2>
            {list.length > 6 && <button className="link-btn" onClick={() => setAllBadges(!allBadges)}>{allBadges ? '접기' : '모두 보기'}</button>}
          </div>
          <div className="badges">
            {badgeShown.map((b) => {
              const ok = b.have >= b.need;
              return (
                <div key={b.id} className={'badge' + (ok ? ' on' : '')} title={b.desc}>
                  <b>{b.name}</b>
                  <span>{ok ? b.desc : `${Math.min(b.have, b.need)}/${b.need}`}</span>
                  {!ok && <i style={{ width: `${Math.min(100, (b.have / b.need) * 100)}%` }} />}
                </div>
              );
            })}
          </div>
        </section>

        {trips && <ShareCards trips={trips} year={year} />}

        <section data-testid="album">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <h2 className="h2">사진첩{photos?.length ? ` · ${photos.length}` : ''}</h2>
            {photos && photos.length > 1 && (
              <button className="link-btn" onClick={() => openSlideshow(photos, 0, { autoplay: true, shuffle: true })}>▶ 섞어서 보기</button>
            )}
          </div>
          {albums.length === 0 && <div className="small muted">여행 상세의 '사진'에서 올린 사진이 여기 여행별로 모여요.</div>}
          {albums.map(({ trip, photos: ps }) => (
            <div key={trip.id} style={{ marginBottom: 14 }}>
              <Link to={`/trips/${trip.id}?tab=photos`} className="year-head" style={{ display: 'block', color: 'inherit' }}>{trip.title} · {ps.length}장</Link>
              <PhotoGrid photos={ps} tripId={trip.id} max={6} readOnly />
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
