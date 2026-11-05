import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import StreetMap, { type StreetPin } from '../components/StreetMap';
import PlaceRecRow from '../components/PlaceRecRow';
import { usePlaces } from '../lib/data';
import { disableMapShare, enableMapShare, mapShareUrl, savePlaceMap, useMyMaps, type MyMapView } from '../lib/placeMapData';
import { KIND_LABEL, KINDS } from '../lib/placeRecs';
import { placeLabel, placeLong } from '../lib/geo';
import { shareAnyhow } from '../lib/kakao';
import { times } from '../lib/ko';
import type { PlaceKind } from '../lib/types';

/**
 * 내 지도: 우리 장소를 '지역 × 주제'로 묶은 지도 한 장씩 ('성동구 카페 지도').
 * 주제 꼬리표 → 지역 → 거리 지도(1~3등은 사진으로) → 보내기 → 순위 목록. 순위는 담을 때 견준 것(PlaceEdit).
 * ?m=kr:11|cafe 로 바로 연다 (장소 저장 뒤·홈 카드에서).
 */
export default function MyMaps() {
  const maps = useMyMaps();
  const { places } = usePlaces();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const themes = useMemo(() => KINDS.filter((k) => maps?.some((m) => m.theme === k.k)), [maps]);
  const [theme, setTheme] = useState<PlaceKind | null>(null);
  const [key, setKey] = useState<string | null>(sp.get('m'));
  // 처음: 주소의 지도 → 없으면 가장 큰 지도
  useEffect(() => {
    if (!maps?.length) return;
    const want = key ? maps.find((m) => m.key === key) : null;
    const pick = want ?? maps.find((m) => !theme || m.theme === theme) ?? maps[0];
    if (!want || theme !== pick.theme) { setTheme(pick.theme); setKey(pick.key); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maps?.length]);
  const ofTheme = useMemo(() => (maps ?? []).filter((m) => m.theme === theme), [maps, theme]);
  const view = useMemo(() => (maps ?? []).find((m) => m.key === key) ?? ofTheme[0] ?? null, [maps, key, ofTheme]);
  const [picked, setPicked] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const pins = useMemo<StreetPin[]>(() => (view ? view.ranked.filter((r) => r.lat != null && r.lng != null).map((r, i) => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng!, img: r.photoUrl, rank: i + 1 })) : []), [view]);
  const noPos = view ? view.ranked.length - pins.length : 0;
  const choose = (m: MyMapView) => { setKey(m.key); setPicked(null); setSp({ m: m.key }, { replace: true }); };

  const share = async () => {
    if (!view) return;
    try {
      const token = await enableMapShare(view);
      const url = mapShareUrl(token);
      const r = await shareAnyhow({ title: view.title, description: `${view.doc?.intro?.trim() || `${view.ranked.length}곳 · ${placeLong(view.region)}`} · 보라핀`, url, button: '지도 보기' }, () => toast('링크를 복사했어요'));
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
            <span className="small">카페·맛집·빵집·옷가게… 다녀온 곳을 담으면 지역마다 내 지도가 돼요. 네이버·카카오 지도의 '공유' 글을 붙여 넣기만 하면 이름과 자리가 채워져요.</span>
            <Link to="/places/new" className="btn">첫 곳 담기</Link>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <TopBar back title="내 지도" right={<Link to="/places/new" className="btn sm" data-testid="mymaps-add"><Icon name="plus" size={16} stroke={2.4} />담기</Link>} />
      <div className="page mymaps" data-testid="mymaps">
        {/* 주제 꼬리표: 꼬리표 하나가 지도 하나 */}
        <div className="chips" role="tablist" aria-label="주제">
          {themes.map((k) => {
            const n = maps.filter((m) => m.theme === k.k).reduce((a, m) => a + m.recs.length, 0);
            return <button key={k.k} role="tab" aria-selected={theme === k.k} className={'chip' + (theme === k.k ? ' on' : '')} onClick={() => { setTheme(k.k); const first = maps.find((m) => m.theme === k.k); if (first) choose(first); }}>{k.label} <small>{n}</small></button>;
          })}
        </div>

        {view && (
          <>
            {/* 지역: 같은 주제의 다른 지역 */}
            <div className="row-between" style={{ alignItems: 'baseline', gap: 8 }}>
              {editing ? (
                <TitleEdit view={view} onDone={() => setEditing(false)} />
              ) : (
                <button type="button" className="mymap-title" onClick={() => setEditing(true)} aria-label="지도 이름·소개 고치기" data-testid="mymap-title">
                  <h2 className="jua" style={{ margin: 0, fontSize: 26 }}>{view.title}</h2>
                  <span className="small muted">{view.ranked.length}곳{view.doc?.intro?.trim() ? ` · ${view.doc.intro.trim()}` : ' · 누르면 이름과 소개를 고쳐요'}</span>
                </button>
              )}
              {ofTheme.length > 1 && (
                <select className="select" aria-label="지역" value={view.key} onChange={(e) => { const m = ofTheme.find((x) => x.key === e.target.value); if (m) choose(m); }} style={{ height: 36, width: 'auto', flex: 'none' }}>
                  {ofTheme.map((m) => <option key={m.key} value={m.key}>{placeLabel(m.region)} {m.recs.length}</option>)}
                </select>
              )}
            </div>

            {pins.length > 0 ? <StreetMap pins={pins} height={320} picked={picked} onPick={(id) => setPicked(id === picked ? null : id)} /> : (
              <div className="card white" style={{ textAlign: 'center' }} data-testid="mymap-nopos"><span className="small muted">자리를 아는 곳이 아직 없어요. 네이버·카카오 지도 '공유' 글을 붙여 넣으면 지도에 찍혀요.</span></div>
            )}
            {noPos > 0 && pins.length > 0 && <span className="tiny muted">{times(noPos).replace(' 번', '곳')}은 자리를 몰라 지도엔 없어요 · 장소를 열어 지도 링크를 붙여 넣으면 찍혀요</span>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => void share()} data-testid="mymap-share"><Icon name="link" size={16} />이 지도 보내기</button>
              {view.doc?.share?.token && <button className="btn line" onClick={() => { if (window.confirm('공개를 끌까요? 받은 사람은 더 볼 수 없어요.')) void disableMapShare(view).then(() => toast('공개를 껐어요'), () => toast('끄지 못했어요')); }} aria-label="공개 끄기">공개 중</button>}
            </div>

            {/* 순위 목록 */}
            <div className="row-between" style={{ alignItems: 'baseline' }}>
              <b className="jua" style={{ fontSize: 18 }}>내 순위</b>
              <span className="tiny muted">{view.doc?.order?.length ? '담을 때 견준 순서' : '아직 견준 게 없어 최근 것부터'}</span>
            </div>
            <div className="list card white mymap-list" data-testid="mymap-list">
              {view.ranked.map((r, i) => (
                <div key={r.id} className={'mymap-row' + (picked === r.id ? ' on' : '')} onClick={() => setPicked(r.id)} role="presentation">
                  <span className={'mymap-rank jua' + (i < 3 ? ' top' : '')}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><PlaceRecRow rec={r} /></div>
                </div>
              ))}
            </div>
            <button className="btn soft block" onClick={() => nav(`/places/new?region=${encodeURIComponent(`${view.region.t === 'kr' ? 'kr:' + view.region.code : 'country:' + view.region.id}`)}&kind=${view.theme}`)}>{placeLabel(view.region)}에 {KIND_LABEL[view.theme]} 더 담기</button>
          </>
        )}
      </div>
    </>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }} data-testid="mymap-title-edit">
      <input className="input" aria-label="지도 이름" placeholder={view.title} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
      <input className="input" aria-label="한 줄 소개" placeholder="이 지도를 한 줄로 (예: 조용히 오래 앉아 있을 수 있는 곳만)" value={intro} onChange={(e) => setIntro(e.target.value)} maxLength={200} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn sm" disabled={busy} onClick={() => void save()}>저장</button>
        <button className="link-btn" onClick={onDone}>그만두기</button>
      </div>
    </div>
  );
}
