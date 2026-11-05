import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '../components/ui';
import StreetMap, { type StreetPin } from '../components/StreetMap';
import { loadMapShare } from '../lib/placeMapData';
import { meters } from '../lib/placeMaps';
import { KIND_LABEL, VERDICT_LABEL } from '../lib/placeRecs';
import { mapApps } from '../lib/placeApps';
import type { MapShare } from '../lib/types';

/**
 * 링크로 받은 내 지도 (/m/토큰): 앱·로그인 없이 보는 한 쪽.
 * 표지(사진·제목·한 줄 소개) → 거리 지도 → 순위 목록(한 줄 평·길찾기) → '나도 만들기'.
 * '가까운 순'을 누르면 지금 자리에서 가까운 곳부터 (위치는 그때만 묻고 어디에도 보내지 않는다).
 */
export default function SharedMapPage() {
  const { token = '' } = useParams();
  const [data, setData] = useState<MapShare | null | undefined>(undefined);
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => { loadMapShare(token).then(setData, () => setData(null)); }, [token]);
  useEffect(() => { if (data) document.title = `${data.title} · 보라핀`; }, [data]);

  const places = useMemo(() => {
    if (!data) return [];
    if (!here) return data.places;
    const d = (p: MapShare['places'][number]) => (p.lat != null && p.lng != null ? Math.round(Math.hypot((p.lat - here.lat) * 111, (p.lng - here.lng) * 88) * 1000) : Infinity);
    return [...data.places].sort((a, b) => d(a) - d(b)).map((p) => ({ ...p, m: d(p) }));
  }, [data, here]);
  const pins = useMemo<StreetPin[]>(() => (data?.places ?? []).map((p, i) => ({ id: p.id, name: p.name, lat: p.lat as number, lng: p.lng as number, img: p.photoUrl, rank: i + 1 })).filter((p) => p.lat != null && p.lng != null), [data]);
  const covers = (data?.places ?? []).filter((p) => p.photoUrl).slice(0, 4);

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => { setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); }, () => setLocating(false), { enableHighAccuracy: true, timeout: 8000 });
  };

  if (data === undefined) return <div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div>;
  if (data === null) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <Logo />
        <h1 className="jua" style={{ fontSize: 24 }}>이 지도는 닫혔어요</h1>
        <p className="small muted">만든 사람이 공개를 껐거나 주소가 틀렸어요.</p>
        <Link to="/" className="btn">보라핀 열기</Link>
      </div>
    );
  }
  return (
    <div className="shared-map" data-testid="shared-map">
      <header className="shared-map-cover">
        {covers.length > 0 && (
          <div className={'shared-map-covers n' + Math.min(covers.length, 4)} aria-hidden="true">
            {covers.map((p) => <img key={p.id} src={p.photoUrl} alt="" referrerPolicy="no-referrer" loading="eager" />)}
          </div>
        )}
        <div className="shared-map-head">
          <span className="tiny" style={{ color: 'var(--v1)', fontWeight: 600 }}>{data.by}의 지도</span>
          <h1 className="jua" style={{ margin: '4px 0 0', fontSize: 34, lineHeight: 1.1 }}>{data.title}</h1>
          <span className="small" style={{ color: '#E4DDFF' }}>{data.regionLabel} · {KIND_LABEL[data.theme]} {data.places.length}곳</span>
        </div>
      </header>
      {data.intro && <p className="hand shared-map-intro">“{data.intro}”</p>}

      <div className="page" style={{ paddingTop: 0, gap: 12, display: 'flex', flexDirection: 'column' }}>
        {pins.length > 0 && <StreetMap pins={pins} height={260} picked={picked} onPick={(id) => setPicked(id)} here={here} />}

        <div className="row-between" style={{ alignItems: 'center' }}>
          <b className="jua" style={{ fontSize: 18 }}>{here ? '가까운 순' : '만든 사람의 순위'}</b>
          <button type="button" className={'chip' + (here ? ' on' : '')} onClick={() => (here ? setHere(null) : locate())} disabled={locating} data-testid="shared-near">{locating ? '찾는 중…' : here ? '순위로 보기' : '지금 가까운 순'}</button>
        </div>

        <div className="list" style={{ gap: 10 }}>
          {places.map((p, i) => {
            const apps = mapApps(p.name, data.regionLabel, p.lat, p.lng, p.naverUrl);
            const m = (p as { m?: number }).m;
            return (
              <article key={p.id} className={'card white shared-map-item' + (picked === p.id ? ' on' : '')} data-testid="shared-map-item" onClick={() => setPicked(p.id)}>
                {p.photoUrl ? <img src={p.photoUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="shared-map-thumb" /> : <span className="shared-map-thumb blank" aria-hidden="true" />}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{!here && <span className="jua" style={{ color: 'var(--violet)', fontSize: 16 }}>{i + 1}</span>}<b style={{ fontSize: 16 }}>{p.name}</b>{p.verdict && <span className={'tag' + (p.verdict === 'again' ? ' coral' : '')}>{VERDICT_LABEL[p.verdict]}</span>}</span>
                  {p.lines.map((l) => <span key={l.who} className="hand" style={{ fontSize: 17, lineHeight: 1.2, color: 'var(--pink-ink)' }}>{l.who} · {l.text}</span>)}
                  <span className="tiny muted">{[p.address, m != null && Number.isFinite(m) ? `여기서 ${meters(m)}` : null].filter(Boolean).join(' · ')}</span>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <a className="btn sm line" href={apps.naver} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>길찾기</a>
                    <Link className="btn sm soft" to={`/places/new?from=${encodeURIComponent(p.name)}`} onClick={(e) => e.stopPropagation()}>♡ 내 지도에 담기</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="card shared-map-cta" data-testid="shared-map-cta">
          <span className="jua" style={{ fontSize: 20, lineHeight: 1.25 }}>나도 우리 동네 {KIND_LABEL[data.theme]} 지도 만들어 볼까요?</span>
          <span className="small" style={{ color: 'var(--v1)' }}>네이버·카카오 지도의 '공유' 글을 붙여 넣기만 하면 돼요. 무료, 광고 없음.</span>
          <Link to="/" className="btn" style={{ alignSelf: 'flex-start', background: '#fff', color: 'var(--ink)' }}>보라핀 시작하기</Link>
        </div>
        <p className="tiny muted" style={{ textAlign: 'center', lineHeight: 1.5 }}>보라핀으로 만든 지도 · 만든 사람이 직접 다녀온 곳만 · 영업시간은 바뀔 수 있어요 · 지도 © OpenStreetMap 기여자</p>
      </div>
    </div>
  );
}
