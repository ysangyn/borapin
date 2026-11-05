import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import StreetMap, { type StreetPin } from '../components/StreetMap';
import PlaceRecRow from '../components/PlaceRecRow';
import { usePlaces } from '../lib/data';
import { disableMapShare, enableMapShare, mapShareUrl, savePlaceMap, useMyMaps, type MyMapView } from '../lib/placeMapData';
import { ALL, KIND_COLOR, publicPlaces, themeLabel, themeOf, themesOrder, type Theme } from '../lib/placeMaps';
import StoryCard from '../components/StoryCard';
import { spaceTitle } from '../lib/members';
import { placeLabel, placeLong, placeParam } from '../lib/geo';
import { shareAnyhow } from '../lib/kakao';
import { samePlace } from '../lib/wishes';
import type { PlaceRec } from '../lib/types';

/**
 * 내 지도: 우리 장소를 지역마다 지도 한 장으로. '한눈에'는 맛집·카페·내 꼬리표가 색만 다르게 한 지도에, 주제를 고르면 그 주제만.
 * 주제 = 종류(맛집·카페…) 또는 내가 만든 꼬리표(소품샵·옷가게…). 순위는 담을 때 견준 것(PlaceEdit → RankAsk).
 * 여행 상세·지역 창·계획하기와 같은 '우리 장소' 기록을 쓴다 (따로 저장하지 않는다). ?m=kr:11|cafe 로 바로 연다.
 */
export default function MyMaps() {
  const maps = useMyMaps();
  const { places } = usePlaces();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const [key, setKey] = useState<string | null>(sp.get('m'));
  const [picked, setPicked] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // 지역 목록 (곳이 많은 순) · 지금 지역의 주제들
  const regions = useMemo(() => {
    const out: { region: MyMapView['region']; n: number }[] = [];
    for (const m of maps ?? []) { if (m.theme === ALL) continue; const r = out.find((x) => samePlace(x.region, m.region)); if (r) r.n += m.recs.length; else out.push({ region: m.region, n: m.recs.length }); }
    return out.sort((a, b) => b.n - a.n);
  }, [maps]);
  const view = useMemo(() => (maps ?? []).find((m) => m.key === key) ?? null, [maps, key]);
  const region = view?.region ?? regions[0]?.region ?? null;
  const here = useMemo(() => (maps ?? []).filter((m) => region && samePlace(m.region, region)), [maps, region]);
  const themes = useMemo(() => [...(here.some((m) => m.theme === ALL) ? [ALL] : []), ...themesOrder(here.filter((m) => m.theme !== ALL).map((m) => m.theme))], [here]);
  // 처음: 주소의 지도 → 없으면 가장 큰 지역의 '한눈에'(주제가 둘 이상) 또는 하나뿐인 주제
  useEffect(() => {
    if (!maps?.length || view) return;
    // 주소에 지도 이름이 있는데 그 지도가 없으면(한눈에가 아직 없거나 그 주제가 비었으면) 같은 지역의 다른 지도로
    const want = key?.split('|')[0];
    const same = want ? maps.filter((m) => m.key.startsWith(want + '|')) : [];
    const pool = same.length ? same : maps.filter((m) => regions[0] && samePlace(m.region, regions[0].region));
    const first = pool.find((m) => m.theme === ALL) ?? pool[0];
    if (first) setKey(first.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maps?.length, view]);
  const choose = (k: string) => { setKey(k); setPicked(null); setEditing(false); setSp({ m: k }, { replace: true }); };
  const keyOf = (theme: Theme) => here.find((m) => m.theme === theme)?.key ?? null;

  const pins = useMemo<StreetPin[]>(() => {
    if (!view) return [];
    if (view.theme === ALL) {
      // 한눈에: 주제마다 1~3등은 크게, 색은 종류 색
      const rankIn = new Map<string, number>();
      for (const t of themesOrder(view.recs.map(themeOf))) view.recs.filter((r) => themeOf(r) === t).forEach((r, i) => rankIn.set(r.id, i + 1));
      return view.recs.filter((r) => r.lat != null && r.lng != null).map((r) => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng!, img: r.photoUrl, rank: rankIn.get(r.id), color: KIND_COLOR[r.kind] }));
    }
    return view.ranked.filter((r) => r.lat != null && r.lng != null).map((r, i) => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng!, img: r.photoUrl, rank: i + 1, color: KIND_COLOR[r.kind] }));
  }, [view]);
  const noPos = view ? view.ranked.length - pins.length : 0;
  const legend = useMemo(() => (view?.theme === ALL ? themesOrder(view.recs.map(themeOf)).map((t) => ({ t, color: KIND_COLOR[view.recs.find((r) => themeOf(r) === t)!.kind], n: view.recs.filter((r) => themeOf(r) === t).length })) : []), [view]);

  const [story, setStory] = useState(false);
  const share = async () => {
    if (!view) return;
    try {
      const token = await enableMapShare(view);
      const r = await shareAnyhow({ title: view.title, description: `${view.doc?.intro?.trim() || `${view.ranked.length}곳 · ${placeLong(view.region)}`} · 보라핀`, url: mapShareUrl(token), button: '지도 보기' }, () => toast('링크를 복사했어요'));
      if (r === 'kakao') toast('카카오톡을 열었어요 · 보낼 사람을 골라 주세요');
    } catch (e) { console.warn(e); toast('보내지 못했어요. 다시 해 주세요'); }
  };

  if (maps === null || places === null) return <><TopBar back title="내 지도" /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div></>;
  if (!maps.length) {
    return (
      <>
        <TopBar back title="내 지도" />
        <div className="page">
          <div className="empty" data-testid="mymaps-empty">
            <img src="/art/bora-think.webp" alt="" width={120} height={225} decoding="async" />
            <b>첫 지도를 만들어 볼까요?</b>
            <span className="small">맛집·카페부터 소품샵·옷가게까지, 다녀온 곳을 담으면 동네마다 내 지도가 돼요. 네이버·카카오 지도의 '공유' 글을 붙여 넣기만 하면 이름과 자리가 채워져요.</span>
            <Link to="/places/new" className="btn">첫 곳 담기</Link>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <TopBar back title="내 지도" right={<Link to={`/places/new${region ? `?region=${placeParam(region)}` : ''}`} className="btn sm" data-testid="mymaps-add"><Icon name="plus" size={16} stroke={2.4} />담기</Link>} />
      <div className="page mymaps" data-testid="mymaps">
        {/* 지역 */}
        {regions.length > 1 && (
          <div className="chips" role="tablist" aria-label="지역" data-testid="mymaps-regions">
            {regions.map((r) => { const on = !!region && samePlace(r.region, region); return <button key={placeParam(r.region)} role="tab" aria-selected={on} className={'chip' + (on ? ' on' : '')} onClick={() => { const mine = maps.filter((m) => samePlace(m.region, r.region)); const first = mine.find((m) => m.theme === ALL) ?? mine[0]; if (first) choose(first.key); }}>{placeLabel(r.region)} <small>{r.n}</small></button>; })}
          </div>
        )}
        {/* 주제: 한눈에 · 맛집 · 카페 · 내 꼬리표 … (꼬리표 하나가 지도 하나) */}
        <div className="chips" role="tablist" aria-label="주제" data-testid="mymaps-themes">
          {themes.map((t) => {
            const m = here.find((x) => x.theme === t)!;
            const on = view?.theme === t;
            const color = t === ALL ? undefined : KIND_COLOR[m.recs[0].kind];
            return <button key={t} role="tab" aria-selected={on} className={'chip' + (on ? ' on' : '')} onClick={() => { const k = keyOf(t); if (k) choose(k); }}>{color && <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: color, marginRight: 5 }} aria-hidden="true" />}{themeLabel(t)} <small>{t === ALL ? '' : m.recs.length}</small></button>;
          })}
        </div>

        {view && (
          <>
            {editing ? (
              <TitleEdit view={view} onDone={() => setEditing(false)} />
            ) : (
              <button type="button" className="mymap-title" onClick={() => setEditing(true)} aria-label="지도 이름·소개 고치기" data-testid="mymap-title">
                <h2 className="jua" style={{ margin: 0, fontSize: 26 }}>{view.title}</h2>
                <span className="small muted">{view.ranked.length}곳{view.doc?.intro?.trim() ? ` · ${view.doc.intro.trim()}` : ' · 누르면 이름과 소개를 고쳐요'}</span>
              </button>
            )}

            {pins.length > 0 ? <StreetMap pins={pins} height={320} picked={picked} onPick={(id) => setPicked(id === picked ? null : id)} /> : (
              <div className="card white" style={{ textAlign: 'center' }} data-testid="mymap-nopos"><span className="small muted">자리를 아는 곳이 아직 없어요. 네이버·카카오 지도 '공유' 글을 붙여 넣으면 지도에 찍혀요.</span></div>
            )}
            {legend.length > 0 && <div className="mymap-legend" data-testid="mymap-legend">{legend.map((l) => <span key={l.t}><i style={{ background: l.color }} />{themeLabel(l.t)} {l.n}</span>)}</div>}
            {noPos > 0 && pins.length > 0 && <span className="tiny muted">{noPos}곳은 자리를 몰라 지도엔 없어요 · 장소를 열어 지도 링크를 붙여 넣으면 찍혀요</span>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => void share()} data-testid="mymap-share"><Icon name="link" size={16} />이 지도 보내기</button>
              <button className="btn line" onClick={() => setStory(true)} data-testid="mymap-story">스토리 카드</button>
              {view.doc?.share?.token && <button className="btn line" onClick={() => { if (window.confirm('공개를 끌까요? 받은 사람은 더 볼 수 없어요.')) void disableMapShare(view).then(() => toast('공개를 껐어요'), () => toast('끄지 못했어요')); }} aria-label="공개 끄기">공개 중</button>}
            </div>
            {story && <StoryCard input={{ title: view.title, intro: view.doc?.intro ?? '', by: spaceTitle(), region: placeLong(view.region), places: publicPlaces(view.ranked) }} onClose={() => setStory(false)} />}

            {/* 순위 목록 (한눈에는 주제마다) */}
            <div className="row-between" style={{ alignItems: 'baseline' }}>
              <b className="jua" style={{ fontSize: 18 }}>{view.theme === ALL ? '주제마다 내 순위' : '내 순위'}</b>
              <span className="tiny muted">{view.theme === ALL ? '' : view.doc?.order?.length ? '담을 때 견준 순서' : '아직 견준 게 없어 최근 것부터'}</span>
            </div>
            <div className="list card white mymap-list" data-testid="mymap-list">
              {view.theme === ALL
                ? themesOrder(view.recs.map(themeOf)).map((t) => (
                  <div key={t}>
                    <div className="mymap-theme-head"><i style={{ background: KIND_COLOR[view.recs.find((r) => themeOf(r) === t)!.kind] }} />{themeLabel(t)}<button className="link-btn" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={() => { const k = keyOf(t); if (k) choose(k); }}>이 지도만</button></div>
                    {view.recs.filter((r) => themeOf(r) === t).slice(0, 3).map((r, i) => <Row key={r.id} r={r} i={i} picked={picked} onPick={setPicked} />)}
                  </div>
                ))
                : view.ranked.map((r, i) => <Row key={r.id} r={r} i={i} picked={picked} onPick={setPicked} />)}
            </div>
            <button className="btn soft block" onClick={() => nav(`/places/new?region=${encodeURIComponent(placeParam(view.region))}${view.theme === ALL ? '' : view.theme.startsWith('t:') ? `&kind=${view.recs[0]?.kind ?? 'shop'}&tag=${encodeURIComponent(view.theme.slice(2))}` : `&kind=${view.theme}`}`)}>{placeLabel(view.region)}에 {view.theme === ALL ? '' : themeLabel(view.theme) + ' '}더 담기</button>
          </>
        )}
      </div>
    </>
  );
}

function Row({ r, i, picked, onPick }: { r: PlaceRec; i: number; picked: string | null; onPick: (id: string) => void }) {
  return (
    <div className={'mymap-row' + (picked === r.id ? ' on' : '')} onClick={() => onPick(r.id)} role="presentation">
      <span className={'mymap-rank jua' + (i < 3 ? ' top' : '')}>{i + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}><PlaceRecRow rec={r} /></div>
    </div>
  );
}

function TitleEdit({ view, onDone }: { view: MyMapView; onDone: () => void }) {
  const toast = useToast();
  const [title, setTitle] = useState(view.doc?.title ?? '');
  const [intro, setIntro] = useState(view.doc?.intro ?? '');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try { await savePlaceMap(view.region, view.theme, { title: title.trim().slice(0, 60), intro: intro.trim().slice(0, 200) }); toast('고쳤어요'); onDone(); } catch { toast('저장하지 못했어요'); }
    setBusy(false);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} data-testid="mymap-title-edit">
      <input className="input" aria-label="지도 이름" placeholder={view.title} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
      <input className="input" aria-label="한 줄 소개" placeholder="이 지도를 한 줄로 (예: 조용히 오래 앉아 있을 수 있는 곳만)" value={intro} onChange={(e) => setIntro(e.target.value)} maxLength={200} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn sm" disabled={busy} onClick={() => void save()}>저장</button>
        <button className="link-btn" onClick={onDone}>그만두기</button>
      </div>
    </div>
  );
}
