import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../components/ui';
import TripRow from '../components/TripRow';
import { computeStats, useTrips } from '../lib/data';
import { pickMemory } from '../lib/memories';
import { usePhotos } from '../lib/photos';
import { openSlideshow } from '../components/slideshow';
import PhotoGrid from '../components/PhotoGrid';

export default function Memories() {
  const { trips } = useTrips();
  const { photos } = usePhotos();
  const albums = useMemo(() => {
    if (!photos || !trips) return [];
    return trips
      .map((t) => ({ trip: t, photos: photos.filter((p) => p.tripId === t.id) }))
      .filter((a) => a.photos.length > 0);
  }, [photos, trips]);
  const memory = useMemo(() => (trips ? pickMemory(trips) : null), [trips]);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  const thisYear = new Date().getFullYear();
  const yearTrips = trips?.filter((t) => t.status === 'done' && t.when.y === thisYear) ?? [];
  const firsts = useMemo(() => {
    if (!trips) return 0;
    const before = new Set<string>();
    for (const t of trips) if (t.status === 'done' && t.when.y && t.when.y < thisYear) t.places.forEach((p) => before.add(p.t === 'kr' ? p.code : p.id));
    const now = new Set<string>();
    for (const t of yearTrips) t.places.forEach((p) => { const k = p.t === 'kr' ? p.code : p.id; if (!before.has(k)) now.add(k); });
    return now.size;
  }, [trips, yearTrips, thisYear]);

  return (
    <>
      <TopBar title="추억" />
      <div className="page" style={{ paddingTop: 4 }}>
        {memory ? (
          <section className="card" data-testid="memory-card">
            <div className="tiny" style={{ color: 'var(--violet)', fontWeight: 800 }}>{memory.label}</div>
            <div className="list"><TripRow trip={memory.trip} /></div>
          </section>
        ) : (
          <div className="empty"><b>꺼내 볼 추억이 아직 없어요</b><span className="small">지난 여행 3개만 남겨 보세요.</span><Link to="/record" className="btn sm">기록 남기기</Link></div>
        )}

        <section className="card white">
          <div className="h2" style={{ fontSize: 16 }}>{thisYear}년 결산</div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat"><b>{yearTrips.length}</b><span>여행·나들이</span></div>
            <div className="stat"><b>{firsts}</b><span>처음 가본 곳</span></div>
            <div className="stat"><b>{stats?.pins ?? 0}</b><span>지금까지 핀</span></div>
          </div>
        </section>

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
              <Link to={`/trips/${trip.id}`} className="year-head" style={{ display: 'block', color: 'inherit' }}>{trip.title} · {ps.length}장</Link>
              <PhotoGrid photos={ps} tripId={trip.id} max={6} />
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
