import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PlanTab from '../components/PlanTab';
import NotesTab from '../components/NotesTab';
import PackingCard from '../components/PackingCard';
import ShareLinkCard, { useShareSync } from '../components/ShareLinkCard';
import { useNotes } from '../lib/tripExtras';
import { Icon, Spinner, TopBar, useToast } from '../components/ui';
import MapView from '../components/LazyMap';
import { computeStats, deleteTripAll, patchTrip, usePlaces, useTrips } from '../lib/data';
import PhotoGrid from '../components/PhotoGrid';
import { openSlideshow } from '../components/slideshow';
import PhotoImg from '../components/PhotoImg';
import { deletePhoto, suggestPlaces, suggestWhen, useTripPhotos } from '../lib/photos';
import PlaceRecRow from '../components/PlaceRecRow';
import { dday, formatWhen, isUpcoming, nightsDays } from '../lib/dates';
import { josa } from 'es-hangul';
import { isOffline } from '../lib/writes';
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
  const tripPhotos = useTripPhotos(id);
  const nav = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sp, setSp] = useSearchParams();
  const tab = (sp.get('tab') as 'info' | 'plan' | 'photos' | 'notes' | null) ?? 'info';
  const setTab = (t: string) => setSp(t === 'info' ? {} : { tab: t }, { replace: true });
  const notes = useNotes(id);
  const trip = trips?.find((t) => t.id === id);
  const placesKey = trip ? JSON.stringify(trip.places) : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => (trip ? computeStats([{ ...trip, status: 'done' }]) : null), [placesKey]);
  const tripRecs = useMemo(() => (recs ? recs.filter((r) => r.tripId === id) : null), [recs, id]);
  useShareSync(trip, tripPhotos, tripRecs);

  if (!trips) return <Spinner />;
  if (!trip) {
    return (
      <>
        <TopBar back backTo="/trips" title="여행" />
        <div className="page"><div className="empty"><b>이 여행을 찾을 수 없어요</b><span className="small">지워졌거나 주소가 바뀌었어요.</span><Link to="/trips" className="btn sm">여행 목록으로</Link></div></div>
      </>
    );
  }
  const photos = tripPhotos ?? [];
  const tripPlace = () => (trip ? trip.places.map(placeLong).join(', ') : null);
  const dd = trip.status === 'planned' ? dday(trip.when) : null;
  const past = trip.status === 'planned' && trip.when.p !== 'unknown' && !isUpcoming(trip.when);
  const removeAll = async () => {
    if (deleting) return;
    if (isOffline()) return toast('인터넷에 연결된 뒤에 지울 수 있어요');
    setDeleting('지우는 중…');
    try {
      await deleteTripAll(trip, (d, t) => t > 30 && setDeleting(`지우는 중… ${Math.round((d / t) * 100)}%`));
      toast('지웠어요');
      nav('/trips', { replace: true });
    } catch (e) {
      console.warn(e);
      toast('다 지우지 못했어요. 다시 해 주세요');
      setDeleting(null);
    }
  };
  const sugWhen = suggestWhen(trip, photos);
  const sugPlaces = suggestPlaces(trip, photos);
  const nd = nightsDays(trip.when);
  const abroad = trip.places.every((p) => p.t === 'country');

  return (
    <>
      <TopBar
        back
        backTo="/trips"
        title={<span style={{ fontWeight: 800, fontSize: 17 }}>{trip.status === 'planned' ? '예정된 여행' : trip.kind === 'outing' ? '나들이' : '여행'}</span>}
        right={<Link to={`/trips/${trip.id}/edit`} className="btn sm line"><Icon name="edit" size={16} />고치기</Link>}
      />
      <div className="page" style={{ paddingTop: 4 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }} data-testid="trip-title">{trip.title}</div>
          <div className="muted" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{formatWhen(trip.when)}{nd ? ` · ${nd}` : ''}</span>
            {dd && <span className="tag violet" data-testid="dday">{dd}</span>}
          </div>
        </div>

        {past && (
          <div className="card coral-soft" style={{ display: 'flex', gap: 10, alignItems: 'center' }} data-testid="past-planned">
            <span className="small" style={{ flex: 1 }}><b>다녀오셨나요?</b> 날짜가 지났어요. 다녀왔으면 핀으로 바꿔 둘게요.</span>
            <button className="btn sm" onClick={() => patchTrip(trip.id, { status: 'done' }).then(() => toast('다녀온 여행으로 바꿨어요'), () => toast('저장하지 못했어요'))}>다녀왔어요</button>
          </div>
        )}

        {tab === 'info' && photos.length > 0 && (
          <button className="trip-cover" onClick={() => openSlideshow(photos, 0, { placeOf: tripPlace, onDelete: (x) => deletePhoto(x).then(() => toast('사진을 지웠어요'), () => toast('지우지 못했어요')) })} aria-label="표지 사진 크게 보기">
            <PhotoImg id={photos[0].id} size="l" />
          </button>
        )}

        <div className="seg tabs" role="tablist" aria-label="여행 보기">
          {([['info', '개요'], ['plan', '일정'], ['photos', `사진${photos.length ? ` ${photos.length}` : ''}`], ['notes', `글${notes?.length ? ` ${notes.length}` : ''}`]] as const).map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {tab === 'plan' && <PlanTab trip={trip} recs={recs ?? []} />}
        {tab === 'notes' && <NotesTab trip={trip} />}

        {tab === 'info' && <>
        <MapView mode={abroad ? 'world' : 'kr'} stats={stats} focus={trip.places} height={photos.length ? 170 : 220} controls={false} interactive={false} />

        {trip.status === 'planned' && <PackingCard trip={trip} trips={trips} />}

        <div className="card white" style={{ padding: '4px 16px' }}>
          <div className="kv"><span className="k">어디</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {trip.places.map((p, i) => {
                const l = mapLinks(p);
                return (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <b style={{ flex: 1 }}>{placeLong(p)}</b>
                    <a className="btn sm ghost" href={l.naver} target="_blank" rel="noreferrer">네이버지도</a>
                    <a className="btn sm ghost" href={l.google} target="_blank" rel="noreferrer">구글지도</a>
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

        </>}

        {tab === 'photos' && <section data-testid="trip-photos">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <h2 className="h2" style={{ fontSize: 17 }}>사진{photos.length ? ` · ${photos.length}` : ''}</h2>
            {photos.length > 1 && (
              <button className="link-btn" onClick={() => openSlideshow(photos, 0, { autoplay: true, placeOf: tripPlace })} data-testid="slideshow">▶ 슬라이드쇼</button>
            )}
          </div>
          {tripPhotos && tripPhotos.length === 0 && (
            <div className="art-row" style={{ padding: '2px 4px 14px' }} data-testid="photos-empty">
              <img src="/art/bora-camera.webp" alt="" aria-hidden="true" width={360} height={623} loading="lazy" decoding="async" />
              <span className="small">
                <b style={{ display: 'block', fontSize: 15, marginBottom: 2 }}>그날의 사진을 올려 주세요</b>
                <span className="muted">슬라이드쇼와 추억 화면에 나오고, 사진에 담긴 날짜·위치로 여행 정보도 채워 드려요.</span>
              </span>
            </div>
          )}
          <PhotoGrid photos={photos} tripId={trip.id} placeOf={tripPlace} />
          {(sugWhen || sugPlaces.length > 0) && (
            <div className="card coral-soft" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="photo-suggest">
              {sugWhen && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="small" style={{ flex: 1 }}>사진으로 보면 <b>{formatWhen({ ...sugWhen, est: false })}</b>{josa.pick(formatWhen({ ...sugWhen, est: false }), '이에요/예요')}. 날짜를 채울까요?</span>
                  <button className="btn sm" onClick={() => patchTrip(trip.id, { when: sugWhen }).then(() => toast('날짜를 채웠어요 (추정)'), () => toast('저장하지 못했어요'))}>채우기</button>
                </div>
              )}
              {sugPlaces.map((p) => (
                <div key={placeLong(p)} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="small" style={{ flex: 1 }}>사진 위치에 <b>{placeLong(p)}</b>도 있어요.</span>
                  <button className="btn sm soft" onClick={() => patchTrip(trip.id, { places: [...trip.places, p] }).then(() => toast('장소에 넣었어요'), () => toast('저장하지 못했어요'))}>넣기</button>
                </div>
              ))}
            </div>
          )}
        </section>}

        {tab === 'info' && <>
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

        <ShareLinkCard trip={trip} photos={photos} recs={tripRecs ?? []} />

        {!confirm ? (
          <button className="btn danger block" onClick={() => setConfirm(true)}><Icon name="trash" size={17} />이 여행 지우기</button>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <b>정말 지울까요? {photos.length ? `사진 ${photos.length}장과 일정·글도 함께 지워져요. ` : '일정·글도 함께 지워져요. '}되돌릴 수 없어요.</b>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>그대로 두기</button>
              <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} disabled={!!deleting} onClick={removeAll} data-testid="trip-delete">{deleting ?? '지우기'}</button>
            </div>
          </div>
        )}
        </>}
      </div>
    </>
  );
}
