import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../components/ui';
import { computeStats, usePlaces, useTrips } from '../lib/data';
import { pickMemory } from '../lib/memories';
import { usePhotos } from '../lib/photos';
import { openSlideshow } from '../components/slideshow';
import MapReplay from '../components/MapReplay';
import DateGame from '../components/DateGame';
import ShareCards from '../components/ShareCards';
import { badges } from '../lib/achievements';

/** 스티커마다 아이콘 (ui.tsx Icon 이름) */
const BADGE_ICON: Record<string, string> = { first: 'pin', pins10: 'pin', pins30: 'pin', cells50: 'map', cells100: 'map', cells160: 'flag', groups: 'map', islands: 'wave', abroad: 'plane', countries10: 'globe', continents: 'globe', seasons: 'sun', family: 'heart', photos100: 'camera', again5: 'heart' };
import { monthGrid, yearReview } from '../lib/yearReview';
import { placeLong } from '../lib/geo';
import type { Photo } from '../lib/types';
import { Art } from '../components/Scene';
import PhotoImg from '../components/PhotoImg';
import { photoForPlace } from '../lib/media';
import { formatWhen } from '../lib/dates';
import { times } from '../lib/ko';
import { toneOf } from '../lib/members';
import { Icon } from '../components/ui';

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
  const [allLines, setAllLines] = useState(false);
  const ourLines = useMemo(() => {
    const tripById = new Map((trips ?? []).map((t) => [t.id, t]));
    return (recs ?? [])
      .flatMap((r) => Object.entries(r.reviews ?? {}).filter(([, v]) => v && v.trim()).map(([who, text]) => ({ key: `${r.id}:${who}`, placeId: r.id, who, text: text.trim().slice(0, 60), place: r.name, tripTitle: r.tripId ? tripById.get(r.tripId)?.title ?? '' : '', at: r.updatedAt?.toMillis?.() ?? r.createdAt?.toMillis?.() ?? 0 })))
      .sort((a, b) => b.at - a.at);
  }, [recs, trips]);
  // 사진에 위치가 없으면 그 여행의 장소로
  const placeOfPhoto = (p: Photo) => {
    const t = trips?.find((x) => x.id === p.tripId);
    return t ? t.places.map(placeLong).join(', ') : null;
  };

  if (!trips) return (<><TopBar title="추억" right={<Link to="/feed" className="btn sm soft">피드</Link>} /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div></>);
  if (doneCount === 0)
    return (
      <>
        <TopBar title="추억" right={<Link to="/feed" className="btn sm soft">피드</Link>} />
        <div className="page" style={{ paddingTop: 4 }}>
          <div className="empty" data-testid="memories-empty">
            <Art id="bora-walk" className="empty-art" size={260} />
            <b>다녀온 여행을 하나 남기면 추억이 시작돼요</b>
            <span className="small">기록이 쌓이면 여기에 이런 것들이 생겨요</span>
            <ul className="preview-list">
              <li><b>몇 년 전 오늘</b> 그날의 여행을 다시 꺼내 줘요</li>
              <li><b>지도 다시 보기</b> 해마다 지도가 채워진 순서</li>
              <li><b>한 해 결산</b> 처음 가본 곳, 가장 많이 간 곳</li>
              <li><b>도전 배지</b> 핀 10개, 섬 탐험가, 사계절 여행</li>
            </ul>
            <Link to="/record" className="btn sm">기록 남기기</Link>
          </div>
        </div>
      </>
    );
  const maxCell = Math.max(1, ...(grid?.rows.flatMap(([, r]) => r) ?? [1]));

  const memPhotos = memory ? albums.find((x) => x.trip.id === memory.trip.id)?.photos ?? [] : [];
  const memScene = memory && !memPhotos.length && memory.trip.places[0] ? photoForPlace(memory.trip.places[0]) : null;

  return (
    <>
      <TopBar title="추억" right={<Link to="/feed" className="btn sm soft">피드</Link>} />
      <div className="page mem-page" style={{ paddingTop: 4 }}>
        {memory && (
          <section className={'mem-hero' + (memPhotos.length || memScene ? ' has-photo' : '')} data-testid="memory-card">
            <Link to={`/trips/${memory.trip.id}`} className="mem-hero-img" aria-label={`${memory.trip.title} 보기`}>
              {memPhotos.length > 0 ? <PhotoImg id={memPhotos[0].id} size="l" /> : memScene ? <img src={memScene.src.l} alt="" decoding="async" style={{ backgroundImage: `url(${memScene.lqip})` }} /> : <Art id="bora-walk" size={200} />}
              <span className="mem-hero-text">
                <span className="mem-when">{memory.label}</span>
                <b>{memory.trip.title}</b>
                <span className="tiny">{formatWhen(memory.trip.when)}{memory.trip.places.length ? ` · ${memory.trip.places.map(placeLong).join(', ')}` : ''}</span>
              </span>
            </Link>
            <div className="mem-hero-actions">
              {memPhotos.length > 0 && <button className="btn sm" onClick={() => openSlideshow(memPhotos, 0, { autoplay: true, placeOf: placeOfPhoto })}><Icon name="play" size={14} />사진 {memPhotos.length}장 넘겨 보기</button>}
              <Link to={`/trips/${memory.trip.id}`} className="btn sm ghost">여행 보기</Link>
            </div>
          </section>
        )}

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
          {grid && grid.rows.length > 0 && (
            <details className="mem-more" data-testid="heatmap-wrap" open>
              <summary className="tiny">달마다 다닌 날 (여행 잔디)</summary>
              <div data-testid="heatmap">
                <div className="heatmap">
                  <span />
                  {Array.from({ length: 12 }, (_, i) => <span key={i} className="hm-m">{i + 1}</span>)}
                  {grid.rows.map(([y, row]) => (
                    <div key={y} style={{ display: 'contents' }}>
                      <span className="hm-y">{y}</span>
                      {row.map((n, i) => (
                        <span key={i} className="hm-c" style={{ background: n ? `rgba(91, 63, 209, ${0.25 + 0.75 * (n / maxCell)})` : undefined }} title={`${y}년 ${i + 1}월 ${times(n)}`} />
                      ))}
                    </div>
                  ))}
                </div>
                {grid.undated > 0 && <div className="tiny muted" style={{ marginTop: 6 }}>달을 모르는 기록 {grid.undated}건은 빠져 있어요.</div>}
              </div>
            </details>
          )}
        </section>

        <section data-testid="album">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <h2 className="h2">사진첩{photos?.length ? ` · ${photos.length}` : ''}</h2>
            {photos && photos.length > 1 && (
              <button className="link-btn" onClick={() => openSlideshow(photos, 0, { autoplay: true, shuffle: true, placeOf: placeOfPhoto })}>▶ 섞어서 보기</button>
            )}
          </div>
          {albums.length === 0 && <div className="small muted">여행 상세의 '사진'에서 올린 사진이 여기 여행별로 모여요.</div>}
          {albums.length > 0 && (
            <div className="mem-albums">
              {albums.map(({ trip, photos: ps }) => (
                <Link key={trip.id} to={`/trips/${trip.id}?tab=photos`} className="mem-album">
                  <span className={'mem-album-grid n' + Math.min(ps.length, 4)}>
                    {ps.slice(0, 4).map((p) => <PhotoImg key={p.id} id={p.id} />)}
                  </span>
                  <span className="mem-album-title">{trip.title} · {ps.length}장</span>
                  <span className="tiny muted">{formatWhen(trip.when)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {ourLines.length > 0 && (
          <section data-testid="our-lines">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <h2 className="h2">우리의 한 줄들</h2>
              <span className="small muted">{ourLines.length}줄</span>
            </div>
            <div className="list" style={{ gap: 8 }}>
              {ourLines.slice(0, allLines ? 30 : 4).map((l) => (
                <Link key={l.key} to={`/places/${l.placeId}`} className="card line-card">
                  <span className={'avatar t' + Math.max(0, toneOf(l.who))} aria-hidden="true">{[...l.who][0]}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className={'hand line-text ' + (toneOf(l.who) === 1 ? 'blue' : 'pink')}>“{l.text}”</span>
                    <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{l.place}{l.tripTitle ? ` · ${l.tripTitle}` : ''}</span>
                  </span>
                </Link>
              ))}
              {ourLines.length > 4 && <button className="link-btn" onClick={() => setAllLines(!allLines)}>{allLines ? '접기' : `${ourLines.length}줄 모두 보기`}</button>}
            </div>
          </section>
        )}

        <section data-testid="badges">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <h2 className="h2">캐리어 스티커 · {earned.length}/{list.length}</h2>
            {list.length > 6 && <button className="link-btn" onClick={() => setAllBadges(!allBadges)}>{allBadges ? '접기' : '모두 보기'}</button>}
          </div>
          <div className="badges">
            {badgeShown.map((b) => {
              const ok = b.have >= b.need;
              return (
                <div key={b.id} className={'badge' + (ok ? ' on' : '')} title={b.desc} data-badge={b.id}>
                  <span className="badge-ic" aria-hidden="true"><Icon name={BADGE_ICON[b.id] ?? 'star'} size={22} stroke={2.2} /></span>
                  <b>{b.name}</b>
                  <span>{ok ? b.desc : `${Math.min(b.have, b.need)}/${b.need}`}</span>
                  {!ok && <i style={{ width: `${Math.min(100, (b.have / b.need) * 100)}%` }} />}
                  {!ok && b.need > 1 && b.need - b.have === 1 && <em className="sticker-tag" data-testid="badge-one-left">하나 남았어요</em>}
                </div>
              );
            })}
          </div>
        </section>

        {trips && <DateGame trips={trips} />}

        {trips && <ShareCards trips={trips} year={year} />}
      </div>
    </>
  );
}
