import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import PlaceRecRow from '../components/PlaceRecRow';
import TripRow from '../components/TripRow';
import StreetMap, { type StreetPin } from '../components/StreetMap';
import StopoverFind from '../components/StopoverFind';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { createPlace } from '../lib/data';
import { guessKind } from '../lib/recordStops';
import { withJosa } from '../lib/ko';
import { parsePlaceParam, placeLabel, placeLong, placeParam } from '../lib/geo';
import { defaultTab, emptyLine, statusChips, summarize, type RegionTab } from '../lib/region';
import { areaLabel, areasOf } from '../lib/area';
import { KIND_COLOR, themeLabel, themeOf, themesOrder } from '../lib/placeMaps';
import { rankedRecs } from '../lib/placeMaps';
import { usePlaceMaps } from '../lib/placeMapData';
import { mapKey } from '../lib/placeMaps';
import { flowerOf, flowerSrc } from '../lib/flowers';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { festivalPeriod, isOngoing, upcomingFestivals, useFestivals } from '../lib/festivals';
import { dday, formatWhen } from '../lib/dates';
import { leftItems, recNames } from '../lib/wishes';
import { PLAN_STEPS, PLAN_STEP_LABEL } from '../lib/planPick';
import { usePhotos } from '../lib/photos';
import PhotoImg from '../components/PhotoImg';
import { times } from '../lib/ko';
import type { PlaceRec } from '../lib/types';

/**
 * 지역 한 장 (/region/:param?tab=): 한 지역의 모든 것이 한 곳에.
 * 탭 셋 — 한눈에(내 지도·다음 계획·가고 싶은 이유·여행·때·사진) · 맛집·명소(가고 싶어요 | 다녀왔어요, 동네 칩) · 여행(계획 중·다녀온).
 * 아래엔 늘: ♥ 가게 담기 · 기록 남기기 · 여기로 계획. 시안: claude.ai/artifact/W2TtuySiJUg1e8kewJt5GX
 */
export default function RegionPage() {
  const { param = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const place = parsePlaceParam(param)[0] ?? null;
  const { trips, wishes, places } = useStore();
  const s = useMemo(() => (place ? summarize(place, places ?? [], trips ?? [], wishes ?? []) : null), [place, places, trips, wishes]);
  const tab: RegionTab = s ? defaultTab(sp.get('tab'), s) : 'glance';
  const setTab = (t: RegionTab) => setSp((q) => { q.set('tab', t); return q; }, { replace: true });
  if (!place) return <><TopBar back title="지역" /><div className="empty"><b>어느 지역인지 모르겠어요</b></div></>;
  if (!s || !trips || !places || !wishes) return <><TopBar back title={placeLabel(place)} /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div></>;
  const name = placeLabel(place);
  const pp = placeParam(place);
  const chips = statusChips(s);
  const flower = place.t === 'kr' ? flowerOf(place) : null;
  return (
    <>
      <div className="region-head" data-testid="region-page">
        <div className="row-between" style={{ alignItems: 'center' }}>
          <TopBarBack />
          <span className="tiny muted">{placeLong(place).replace(name, '').trim() || (place.t === 'country' ? '해외' : '')}</span>
          <Link to={`/maps?m=${encodeURIComponent(`${pp}|all`)}`} className="chip" style={{ height: 34 }} data-testid="region-share">보내기</Link>
        </div>
        <div className="row-between" style={{ alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 className="jua region-name">{name}</h1>
            <div className="chips" style={{ gap: 6 }}>
              {chips.map((c) => <span key={c} className={'chip sm ' + (c.startsWith('♥') ? 'coral-soft' : c === '계획 중' ? 'soft-on' : 'soft-on')}>{c}</span>)}
              {!chips.length && <span className="tiny muted">아직 아무것도 없어요</span>}
            </div>
          </div>
          {flower && <img src={flowerSrc(flower.icon)} alt="" aria-hidden="true" className="region-flower" />}
        </div>
        <div className="seg region-tabs" role="tablist" aria-label="지역 한 장">
          <button role="tab" aria-selected={tab === 'glance'} className={tab === 'glance' ? 'on' : ''} onClick={() => setTab('glance')} data-testid="region-tab-glance">한눈에</button>
          <button role="tab" aria-selected={tab === 'places'} className={tab === 'places' ? 'on' : ''} onClick={() => setTab('places')} data-testid="region-tab-places">맛집·명소{s.recs.length ? <span className="n">{s.recs.length}</span> : null}</button>
          <button role="tab" aria-selected={tab === 'trips'} className={tab === 'trips' ? 'on' : ''} onClick={() => setTab('trips')} data-testid="region-tab-trips">여행{s.done.length + s.planned.length ? <span className="n">{s.done.length + s.planned.length}</span> : null}</button>
        </div>
      </div>
      <div className="page region-body" style={{ paddingTop: 6 }}>
        {tab === 'glance' && <Glance place={place} s={s} onTab={setTab} />}
        {tab === 'places' && <PlacesTab place={place} s={s} />}
        {tab === 'trips' && <TripsTab place={place} s={s} />}
      </div>
      <div className="region-actions" data-testid="region-actions">
        <div className="card white region-actions-bar">
          <Link to={`/places/new?region=${pp}&status=want`} className="btn coral" style={{ flex: 1.15 }} data-testid="region-add-want">♥ 가게 담기</Link>
          <Link to={`/record?place=${pp}`} className="btn line" style={{ flex: 1 }}>기록 남기기</Link>
          <Link to={`/plan?place=${pp}`} className="btn line" style={{ flex: 1 }}>여기로 계획</Link>
        </div>
      </div>
    </>
  );
}

function TopBarBack() {
  const nav = useNavigate();
  return <button type="button" className="back" aria-label="뒤로" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} style={{ width: 40, height: 40, border: 'none', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} /></button>;
}

/** 내 지도: 다녀온 곳은 채운 핀(1~3등은 크게), 가고 싶어요는 빈 핀 */
function usePins(place: ReturnType<typeof parsePlaceParam>[number], s: ReturnType<typeof summarize>) {
  const docs = usePlaceMaps();
  return useMemo<StreetPin[]>(() => {
    const themes = themesOrder([...new Set(s.been.map(themeOf))]);
    const ranked = themes.flatMap((t) => rankedRecs(s.been.filter((r) => themeOf(r) === t), docs?.find((d) => d.id === mapKey(place, t))?.order));
    const beenPins: StreetPin[] = ranked.filter((r) => r.lat != null && r.lng != null).map((r, i) => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng!, img: r.photoUrl, rank: i < 3 ? i + 1 : undefined, color: KIND_COLOR[r.kind] }));
    const wantPins: StreetPin[] = s.want.filter((r) => r.lat != null && r.lng != null).map((r) => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng!, color: KIND_COLOR[r.kind], hollow: true }));
    return [...beenPins, ...wantPins];
  }, [place, s, docs]);
}

function Glance({ place, s, onTab }: { place: ReturnType<typeof parsePlaceParam>[number]; s: ReturnType<typeof summarize>; onTab: (t: RegionTab) => void }) {
  const nav = useNavigate();
  const pins = usePins(place, s);
  const seasons = useSeasons();
  const fest = useFestivals();
  const { photos } = usePhotos();
  const season = seasonFor(seasons, place);
  const f = place.t === 'kr' ? upcomingFestivals(fest, place.code, new Date(), 120)[0] : undefined;
  const next = s.planned[0] ?? null;
  const myPhotos = useMemo(() => { const ids = new Set(s.done.map((t) => t.id)); return (photos ?? []).filter((p) => p.tripId && ids.has(p.tripId)); }, [photos, s.done]);
  const empty = !s.recs.length && !s.done.length && !s.planned.length && !s.wish;
  const kinds = useMemo(() => { const m = new Map<string, number>(); for (const r of s.recs) { const k = themeOf(r); m.set(k, (m.get(k) ?? 0) + 1); } return themesOrder([...m.keys()]).map((k) => ({ k, n: m.get(k)!, color: KIND_COLOR[s.recs.find((r) => themeOf(r) === k)!.kind] })); }, [s.recs]);
  const name = placeLabel(place);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="region-glance">
      {empty && (
        <div className="card art-row">
          <img src="/art/bora-think.webp" alt="" aria-hidden="true" width={120} height={225} decoding="async" />
          <span><b style={{ display: 'block', fontSize: 17 }}>{emptyLine('glance', name).title}</b><span className="small muted" style={{ display: 'block', marginTop: 4 }}>{emptyLine('glance', name).sub}</span></span>
        </div>
      )}
      {/* 내 지도 */}
      {(pins.length > 0 || s.recs.length > 0) && (
        <div className="card white" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="row-between"><button type="button" className="link-btn jua" style={{ fontSize: 18, color: 'inherit' }} onClick={() => onTab('places')}>내 지도</button><span className="tiny muted">채운 핀 다녀옴 {s.been.length} · 빈 핀 가고 싶어요 {s.want.length}</span></div>
          {pins.length > 0 ? <StreetMap pins={pins} height={220} onPick={(id) => nav(`/places/${id}`)} /> : <div className="small muted" style={{ padding: 8 }}>자리를 아는 곳이 아직 없어요. 지도 앱 공유 글을 붙여 넣으면 지도에 찍혀요.</div>}
          <div className="chips" style={{ gap: 6 }}>
            {kinds.map((x) => <button key={x.k} type="button" className="chip sm" onClick={() => onTab('places')}><i className="dot" style={{ background: x.color }} aria-hidden="true" />{themeLabel(x.k)} {x.n}</button>)}
          </div>
        </div>
      )}
      {/* 다음 계획 */}
      {next && (
        <Link to={`/trips/${next.id}`} className="card region-next" data-testid="region-next">
          <span className="region-dday"><span className="tiny">D</span><span className="jua">{(dday(next.when) ?? '').replace('D', '') || '·'}</span></span>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="jua" style={{ fontSize: 17 }}>{formatWhen(next.when)} · {next.title}</span>
            <span className="tiny" style={{ color: '#E4DDFF' }}>{next.planDone?.length ? `계획 ${next.planDone.length}/${PLAN_STEPS.length} 걸음` : '계획 시작 전'}{s.want.length ? ` · 가고 싶어요 ${s.want.length}곳` : ''}</span>
          </span>
          <span className="btn sm" style={{ background: '#fff', color: 'var(--ink)' }}>이어서</span>
        </Link>
      )}
      {/* 가고 싶은 이유 */}
      {s.wish && (s.wish.note || (s.wish.wantedBy?.length ?? 0) > 0 || leftItems(s.wish, recNames(s.recs, place)).length > 0) && (
        <Link to={`/wishes/${s.wish.id}`} className="card white" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6, color: 'inherit' }} data-testid="region-wish">
          <div className="row-between"><span className="jua" style={{ fontSize: 16 }}>가고 싶은 이유</span>{!!s.wish.wantedBy?.length && <span className="tiny muted">{s.wish.wantedBy.join(' · ')} ♥</span>}</div>
          {s.wish.note ? <span className="hand" style={{ fontSize: 20, lineHeight: 1.3, color: 'var(--pink-ink)' }}>“{s.wish.note.slice(0, 80)}”</span> : null}
          {leftItems(s.wish, recNames(s.recs, place)).length > 0 && <span className="tiny muted">적어 둔 곳 {leftItems(s.wish, recNames(s.recs, place)).slice(0, 4).join(' · ')}</span>}
        </Link>
      )}
      {/* 여행 */}
      {s.done.length > 0 && (
        <div className="card white" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="row-between"><span className="jua" style={{ fontSize: 16 }}>다녀온 여행 {times(s.done.length)}</span><button type="button" className="link-btn small" onClick={() => onTab('trips')}>모두 보기</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {s.done.slice(0, 3).map((t) => { const ph = myPhotos.find((p) => p.tripId === t.id); return (
              <Link key={t.id} to={`/trips/${t.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'inherit' }}>
                <span className="region-trip-thumb">{ph ? <PhotoImg id={ph.id} /> : null}</span>
                <span className="tiny" style={{ fontWeight: 600 }}>{formatWhen(t.when)} {t.title.replace(name, '').trim() || t.title}</span>
              </Link>
            ); })}
          </div>
        </div>
      )}
      {/* 때·축제·가는 길 */}
      {(season || f) && (
        <div className="card white" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {season && <div className="row" style={{ gap: 8 }}><Icon name="sun" size={18} /><span className="small">가기 좋은 때 <b>{monthsLabel(season.m)}</b>{season.why ? ` · ${season.why}` : ''}</span></div>}
          {f && <Link to={`/map?sel=${placeParam(place)}`} className="row" style={{ gap: 8, color: 'inherit' }}><Icon name="flag" size={18} /><span className="small">{isOngoing(f) ? '지금 열리는 축제' : '다가오는 축제'} <b>{f.t}</b> · {festivalPeriod(f)}</span></Link>}
          {place.t === 'kr' && <StopoverFind destCode={place.code} />}
        </div>
      )}
      {/* 사진 */}
      {myPhotos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="row-between" style={{ padding: '0 2px' }}><span className="jua" style={{ fontSize: 16 }}>사진 {myPhotos.length}장</span><Link to="/feed" className="small" style={{ fontWeight: 600 }}>피드</Link></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
            {myPhotos.slice(0, 3).map((p) => <span key={p.id} className="region-photo"><PhotoImg id={p.id} /></span>)}
            {myPhotos.length > 3 && <Link to={`/trips/${s.done[0].id}?tab=photos`} className="region-photo more">+{myPhotos.length - 3}</Link>}
          </div>
        </div>
      )}
    </div>
  );
}

function PlacesTab({ place, s }: { place: ReturnType<typeof parsePlaceParam>[number]; s: ReturnType<typeof summarize> }) {
  const [filter, setFilter] = useState<'all' | 'want' | 'been'>('all');
  const [area, setArea] = useState<string | null>(null);
  const docs = usePlaceMaps();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const areas = useMemo(() => areasOf(s.recs), [s.recs]);
  const inArea = (r: PlaceRec) => !area || areaLabel(r) === area;
  const want = s.want.filter(inArea);
  const themes = themesOrder([...new Set(s.been.map(themeOf))]);
  const been = themes.flatMap((t) => rankedRecs(s.been.filter((r) => themeOf(r) === t), docs?.find((d) => d.id === mapKey(place, t))?.order)).filter(inArea);
  const name = placeLabel(place);
  const left = s.wish ? leftItems(s.wish, recNames(s.recs, place)) : [];
  const [busy, setBusy] = useState<string | null>(null);
  /** 적어 둔 글 줄 → 가고 싶어요 가게 (이름·종류 짐작만, 자세한 건 가게 화면에서) */
  const adoptLine = async (n: string) => {
    if (auth.status !== 'ready') { toast('로그인하면 담을 수 있어요'); return; }
    setBusy(n);
    try {
      const id = await createPlace({ name: n.slice(0, 80), kind: guessKind(n, s.wish), region: place, status: 'want', reviews: {}, verdict: null }, auth.user);
      toast(`${withJosa(n, '을/를')} 가고 싶어요로 담았어요`, { label: '자세히 쓰기', onClick: () => nav(`/places/${id}`) });
    } catch { toast('담지 못했어요. 다시 해 주세요'); }
    setBusy(null);
  };
  const markBeen = async (r: PlaceRec) => {
    // 가고 싶어요 → 다녀왔어요: 평가·한 줄 평을 쓰러 가게 화면으로 (상태는 거기서 저장)
    nav(`/places/${r.id}?been=1`);
  };
  if (!s.recs.length && !left.length) {
    const e = emptyLine('places', name);
    return (
      <div className="empty" data-testid="region-places-empty">
        <b>{e.title}</b><span className="small">{e.sub}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/places/new?region=${placeParam(place)}&status=want`} className="btn sm coral">♥ 가고 싶어요</Link>
          <Link to={`/places/new?region=${placeParam(place)}`} className="btn sm">다녀왔어요</Link>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="region-places">
      <div className="seg" role="group" aria-label="상태">
        <button className={filter === 'all' ? 'on' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>전체 {s.recs.length}</button>
        <button className={filter === 'been' ? 'on' : ''} aria-pressed={filter === 'been'} onClick={() => setFilter('been')} data-testid="region-filter-been"><i className="dot" style={{ background: 'var(--violet)' }} aria-hidden="true" />다녀왔어요 {s.been.length}</button>
        <button className={filter === 'want' ? 'on' : ''} aria-pressed={filter === 'want'} onClick={() => setFilter('want')} data-testid="region-filter-want"><i className="dot hollow" aria-hidden="true" />가고 싶어요 {s.want.length}</button>
      </div>
      {areas.length >= 2 && (
        <div className="chips" style={{ gap: 6 }} data-testid="region-areas">
          <button type="button" className={'chip sm' + (!area ? ' on' : '')} onClick={() => setArea(null)}>동네 전체</button>
          {areas.slice(0, 8).map((a) => <button key={a.name} type="button" className={'chip sm' + (area === a.name ? ' on' : '')} onClick={() => setArea(area === a.name ? null : a.name)}>{a.name} <span className="n">{a.n}</span></button>)}
        </div>
      )}
      {filter !== 'been' && (want.length > 0 || left.length > 0) && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="row-between" style={{ padding: '0 2px' }}><span className="jua" style={{ fontSize: 16, color: 'var(--pink-ink)' }}>가고 싶어요 {want.length}</span>{s.planned[0] && <Link to={`/trips/${s.planned[0].id}/plan-next?step=pick`} className="tiny" style={{ fontWeight: 600 }}>계획에 담기</Link>}</div>
          <div className="list">
            {want.map((r) => (
              <div key={r.id} className="rec-row-wrap" data-testid="region-want">
                <PlaceRecRow rec={r} />
                <button type="button" className="icon-btn region-check" aria-label={`${r.name} 다녀왔어요로 바꾸기`} onClick={() => void markBeen(r)} data-testid="region-mark-been"><Icon name="check" size={18} stroke={2.4} /></button>
              </div>
            ))}
            {left.length > 0 && (
              <div className="card" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }} data-testid="region-left">
                <span className="tiny muted">가고 싶은 곳에 적어 둔 곳 · 누르면 가게로 담아요 (한 번에)</span>
                <div className="chips" style={{ gap: 6 }}>
                  {left.slice(0, 12).map((n) => <button key={n} type="button" className="chip sm dashed" disabled={busy === n} onClick={() => void adoptLine(n)} data-testid="region-left-chip">{busy === n ? '담는 중…' : n}</button>)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      {filter !== 'want' && been.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="row-between" style={{ padding: '0 2px' }}><span className="jua" style={{ fontSize: 16, color: 'var(--violet-dark)' }}>다녀왔어요 {been.length} · 우리 순위</span><Link to={`/maps?m=${encodeURIComponent(`${placeParam(place)}|all`)}`} className="tiny" style={{ fontWeight: 600 }} data-testid="region-mymap">내 지도 보내기</Link></div>
          <div className="list">
            {been.map((r, i) => (
              <div key={r.id} className="rec-row-wrap" data-testid="region-been">
                <span className="jua region-rank">{i + 1}</span>
                <PlaceRecRow rec={r} />
              </div>
            ))}
          </div>
        </section>
      )}
      {filter === 'want' && !want.length && <div className="small muted" style={{ textAlign: 'center', padding: 12 }}>가고 싶어요로 담은 곳이 없어요</div>}
      {filter === 'been' && !been.length && <div className="small muted" style={{ textAlign: 'center', padding: 12 }}>다녀온 곳이 아직 없어요</div>}
      {auth.status !== 'ready' && <span className="tiny muted" onClick={() => toast('로그인하면 담을 수 있어요')} />}
    </div>
  );
}

function TripsTab({ place, s }: { place: ReturnType<typeof parsePlaceParam>[number]; s: ReturnType<typeof summarize> }) {
  const name = placeLabel(place);
  const pp = placeParam(place);
  if (!s.done.length && !s.planned.length) {
    const e = emptyLine('trips', name);
    return (
      <div className="empty" data-testid="region-trips-empty">
        <b>{e.title}</b><span className="small">{e.sub}</span>
        <div style={{ display: 'flex', gap: 8 }}><Link to={`/record?place=${pp}`} className="btn sm">기록 남기기</Link><Link to={`/plan?place=${pp}`} className="btn sm line">여기로 계획</Link></div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} data-testid="region-trips">
      {s.planned.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="jua" style={{ fontSize: 16, padding: '0 2px' }}>계획 중</span>
          {s.planned.map((t) => (
            <div key={t.id} className="card white" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, border: '1.5px solid var(--violet)' }} data-testid="region-planned">
              <div className="row-between">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="jua" style={{ fontSize: 19 }}>{t.title}</span><span className="tiny muted">{formatWhen(t.when)}{t.companions.length ? ` · ${t.companions.join(', ')}` : ''}{dday(t.when) ? ` · ${dday(t.when)}` : ''}</span></div>
                <span className="chip sm soft-on">{t.planDone?.length ?? 0}/{PLAN_STEPS.length} 걸음</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {PLAN_STEPS.map((st) => <span key={st} className={'region-step' + (t.planDone?.includes(st) ? ' done' : '')}><i /><span className="tiny">{PLAN_STEP_LABEL[st].split(' ')[0]}</span></span>)}
              </div>
              {s.want.length > 0 && <div className="row" style={{ gap: 8, padding: '8px 10px', borderRadius: 12, background: 'var(--pink-mist)' }}><i className="dot hollow" aria-hidden="true" /><span className="small" style={{ flex: 1 }}>가고 싶어요 {s.want.length}곳 · {s.want.slice(0, 2).map((r) => r.name).join(', ')}{s.want.length > 2 ? ' …' : ''}</span><Link to={`/trips/${t.id}/plan-next?step=pick`} className="tiny" style={{ fontWeight: 700 }}>담기</Link></div>}
              <Link to={`/trips/${t.id}/plan-next`} className="btn block">이어서 계획하기</Link>
            </div>
          ))}
        </section>
      )}
      {s.done.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="jua" style={{ fontSize: 16, padding: '0 2px' }}>다녀온 여행 {times(s.done.length)}</span>
          <div className="list">{s.done.map((t) => <TripRow key={t.id} trip={t} />)}</div>
        </section>
      )}
    </div>
  );
}
