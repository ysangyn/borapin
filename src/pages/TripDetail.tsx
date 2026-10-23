import { toneOf } from '../lib/members';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PlanTab from '../components/PlanTab';
import NotesTab from '../components/NotesTab';
import PrepTab from '../components/PrepTab';
import ShareLinkCard, { useShareSync } from '../components/ShareLinkCard';
import { dayLabel, tripDays, useNotes, usePlan } from '../lib/tripExtras';
import { Icon, Spinner, TopBar, useToast } from '../components/ui';
import MapView from '../components/LazyMap';
import { computeStats, deleteTripAll, patchTrip, usePlaces, useTrips } from '../lib/data';
import PhotoGrid from '../components/PhotoGrid';
import { openSlideshow } from '../components/slideshow';
import PhotoImg from '../components/PhotoImg';
import { deletePhoto, photoUsage, suggestPlaces, suggestWhen, useTripPhotos } from '../lib/photos';
import { photosLeft } from '../lib/usage';
import { useStore } from '../lib/store';
import PlaceRecRow from '../components/PlaceRecRow';
import { dday, formatWhen, isUpcoming, nightsDays } from '../lib/dates';
import { josa } from 'es-hangul';
import { isOffline } from '../lib/writes';
import { COUNTRY_BY_ID, placeLabel, placeLong, REGION_BY_CODE } from '../lib/geo';
import { tripTabs, type TripTab } from '../lib/stage';
import type { Place, PlaceRec, Trip } from '../lib/types';

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
  // 주소의 tab이 이 여행에 없는 탭이면(예정 여행의 '글', 다녀온 여행의 '준비') 개요로
  const tabs = tripTabs(trip.status);
  const tab: TripTab = tabs.find((t) => t === sp.get('tab')) ?? 'info';
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
  const label: Record<TripTab, string> = {
    info: '개요',
    plan: trip.status === 'done' ? '들른 곳' : '일정',
    prep: '준비',
    photos: `사진${photos.length ? ` ${photos.length}` : ''}`,
    notes: `글${notes?.length ? ` ${notes.length}` : ''}`,
  };

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
          <div className="trip-title" data-testid="trip-title">{trip.title}</div>
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
          <button className={'trip-cover pola' + (notes?.[0] ? ' with-line' : '')} onClick={() => openSlideshow(photos, 0, { placeOf: tripPlace, onDelete: (x) => deletePhoto(x).then(() => toast('사진을 지웠어요'), () => toast('지우지 못했어요')) })} aria-label="표지 사진 크게 보기">
            <span className="tape" aria-hidden="true" />
            <PhotoImg id={photos[0].id} size="l" />
            {notes?.[0] && <span className={'pola-line hand ' + (toneOf(notes[0].by.name) === 1 ? 'blue' : 'pink')}>“{notes[0].text.split('\n')[0].slice(0, 36)}” — {notes[0].by.name}</span>}
            {photos.length > 1 && <span className="pola-count">1 / {photos.length}</span>}
          </button>
        )}

        <div className="seg tabs" role="tablist" aria-label="여행 보기" data-testid="trip-tabs">
          {tabs.map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label[k]}</button>
          ))}
        </div>

        {tab === 'plan' && (trip.status === 'done' ? <VisitedTab trip={trip} recs={tripRecs} /> : <PlanTab trip={trip} recs={recs ?? []} />)}
        {tab === 'prep' && trip.status === 'planned' && <PrepTab trip={trip} trips={trips} />}
        {tab === 'notes' && <NotesTab trip={trip} />}

        {tab === 'info' && <>
        <MapView mode={abroad ? 'world' : 'kr'} stats={stats} focus={trip.places} height={photos.length ? 170 : 220} controls={false} interactive={false} />

        {trip.status === 'planned' ? <PackingSummary trip={trip} onOpen={() => setTab('prep')} /> : <PlacesSummary trip={trip} recs={tripRecs} onOpen={() => setTab('plan')} />}

        <div className="card white" style={{ padding: '4px 16px' }}>
          <div className="kv"><span className="k">어디</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {trip.places.map((p, i) => {
                const l = mapLinks(p);
                return (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <b style={{ flex: 1 }}>{placeLong(p)}</b>
                    <a className="map-ico naver" href={l.naver} target="_blank" rel="noreferrer" aria-label={`${placeLabel(p)} 네이버지도`} title="네이버지도">N</a>
                    <a className="map-ico google" href={l.google} target="_blank" rel="noreferrer" aria-label={`${placeLabel(p)} 구글지도`} title="구글지도">G</a>
                  </span>
                );
              })}
            </span>
          </div>
          <div className="kv"><span className="k">누구와</span><span>{trip.companions.length ? trip.companions.join(', ') : <span className="muted">적지 않음</span>}</span></div>
          {trip.memo && <div className="kv"><span className="k">메모</span><span style={{ whiteSpace: 'pre-wrap' }}>{trip.memo}</span></div>}
          {trip.tags.length > 0 && <div className="kv"><span className="k">태그</span><span className="chips">{trip.tags.map((t) => <span key={t} className="tag">{t}</span>)}</span></div>}
          <div className="kv"><span className="k">남긴 사람</span><span className="muted small">{trip.createdBy?.name ?? '-'}</span></div>
        </div>

        {/* 예정 여행은 '글' 탭이 없는 대신 개요 아래에서 바로 쓴다 */}
        {trip.status === 'planned' && (
          <section data-testid="trip-notes">
            <h2 className="h2" style={{ fontSize: 17, marginBottom: 6 }}>메모·글{notes?.length ? ` · ${notes.length}` : ''}</h2>
            <NotesTab trip={trip} />
          </section>
        )}
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
          <PhotoSpaceNote count={photos.length} />
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
        <ShareLinkCard trip={trip} photos={photos} recs={tripRecs ?? []} />

        {!confirm ? (
          <button className="link-btn" style={{ alignSelf: 'center', color: 'var(--ink4)', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 700, fontSize: 12 }} onClick={() => setConfirm(true)}>이 여행 지우기</button>
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

/** 사진 탭 아래 작은 안내: 무료 저장 공간과 권장 장수 (앱이 어떤 앱인지 솔직하게) */
function PhotoSpaceNote({ count }: { count: number }) {
  const [left, setLeft] = useState<number | null>(null);
  const { trips, places, wishes } = useStore();
  const records = (trips?.length ?? 0) + (places?.length ?? 0) + (wishes?.length ?? 0);
  useEffect(() => {
    let on = true;
    // 관리자 화면과 같은 계산(기록 문서 수까지 포함)이라 두 화면 숫자가 같다
    photoUsage().then((u) => on && setLeft(photosLeft(u, records)), () => on && setLeft(null));
    return () => { on = false; };
  }, [count, records]);
  return (
    <div className="tiny muted" style={{ marginTop: 8, lineHeight: 1.5 }} data-testid="photo-space">
      여행마다 고른 사진 30장쯤을 남기는 앱이에요.
      {left !== null && <> 앞으로 <b>약 {(Math.round(left / 100) * 100).toLocaleString()}장</b> 더 올릴 수 있어요.</>}
      {count > 60 && <> 이 여행은 사진이 많아요 — 공유 링크에는 앞 60장만 보여요.</>}
    </div>
  );
}

/** 개요 탭의 준비 요약 한 줄 (자세한 건 '준비' 탭) */
function PackingSummary({ trip, onOpen }: { trip: Trip; onOpen: () => void }) {
  const list = trip.packing ?? [];
  const done = list.filter((x) => x.done).length;
  return (
    <button className="card white" style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={onOpen} data-testid="packing-summary">
      <span className="ico"><Icon name="check" size={17} /></span>
      <span style={{ flex: 1 }}><b>준비</b><div className="tiny muted">{list.length ? `준비물 ${done}/${list.length} 챙김 · 가는 길 · 항공권 · 현지어` : '준비물 목록 만들기 · 가는 길 · 항공권 · 현지어'}</div></span>
      <Icon name="chev" size={16} />
    </button>
  );
}

/** 다녀온 여행 개요의 들른 곳 요약 한 줄 (목록은 '들른 곳' 탭에만) */
function PlacesSummary({ trip, recs, onOpen }: { trip: Trip; recs: PlaceRec[] | null; onOpen: () => void }) {
  const names = (recs ?? []).map((r) => r.name);
  return (
    <div className="card white" style={{ display: 'flex', alignItems: 'center', gap: 10 }} data-testid="trip-places">
      <button style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', padding: 0, textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={onOpen} data-testid="places-summary">
        <span className="ico"><Icon name="pin" size={17} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <b>들른 곳</b>
          <div className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {names.length ? `우리 장소 ${names.length}곳 · ${names.slice(0, 3).join(', ')}${names.length > 3 ? ` 외 ${names.length - 3}` : ''}` : '맛집·카페·명소를 둘의 한 줄 평과 함께'}
          </div>
        </span>
      </button>
      <Link to={`/places/new?trip=${trip.id}`} className="small" style={{ fontWeight: 700, flex: 'none' }}>+ 장소 남기기</Link>
    </div>
  );
}

/**
 * 다녀온 여행의 '들른 곳' 탭: 위는 이 여행의 우리 장소(평가·한 줄 평), 아래는 일정에 적어 두었던 곳.
 * '또 갈래요'는 우리 장소의 평가로 남긴다 (일정 줄의 하트는 없앴다).
 */
function VisitedTab({ trip, recs }: { trip: Trip; recs: PlaceRec[] | null }) {
  const plans = usePlan(trip.id);
  const days = tripDays(trip.when);
  const recIds = new Set((recs ?? []).map((r) => r.id));
  // 우리 장소에서 넣었던 줄은 위에 이미 보이니 뺀다
  const rest = (plans ?? []).filter((p) => !(p.recId && recIds.has(p.recId)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} data-testid="trip-visited">
      <section>
        <div className="row-between" style={{ marginBottom: 2 }}>
          <h2 className="h2" style={{ fontSize: 17 }}>우리 장소{recs?.length ? ` · ${recs.length}` : ''}</h2>
          <Link to={`/places/new?trip=${trip.id}`} className="small" style={{ fontWeight: 700 }}>+ 장소 남기기</Link>
        </div>
        {recs && recs.length === 0 ? (
          <div className="small muted">기억에 남은 맛집·카페·명소를 둘의 한 줄 평과 함께 남겨 보세요. 또 가고 싶은 곳은 평가로 남겨요.</div>
        ) : (
          <div className="list">{(recs ?? []).map((r) => <PlaceRecRow key={r.id} rec={r} />)}</div>
        )}
      </section>
      {rest.length > 0 && (
        <section data-testid="trip-planned-places">
          <h2 className="h2" style={{ fontSize: 17, marginBottom: 2 }}>일정에 있던 곳</h2>
          <div className="list">
            {rest.map((it) => (
              <div key={it.id} className="plan-row" data-testid="planned-place">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {it.time && <span className="tag violet">{it.time}</span>}
                  <span style={{ fontWeight: 600 }}>{it.name}</span>
                  {it.day && days.includes(it.day) && <span className="tiny muted">{dayLabel(it.day, days)}</span>}
                  {it.info && <span className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.info}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
