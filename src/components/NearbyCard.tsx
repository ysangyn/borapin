import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './ui';
import { usePlaces } from '../lib/data';
import { meters, nearby } from '../lib/placeMaps';
import { KIND_LABEL } from '../lib/placeRecs';
import { MapAppButton } from './MapChoice';
import { placeLabel } from '../lib/geo';

/**
 * 홈 '지금 근처': 내 지도가 쓰이는 순간은 그 동네에 서 있을 때. 누르면 위치를 묻고(그때만, 어디에도 보내지 않음) 2km 안에 담아 둔 곳을 가까운 순으로.
 * 담아 둔 곳에 자리(위경도)가 하나도 없으면 카드를 그리지 않는다.
 */
export default function NearbyCard() {
  const { places } = usePlaces();
  const [st, setSt] = useState<{ s: 'idle' } | { s: 'busy' } | { s: 'ok'; here: { lat: number; lng: number } } | { s: 'none' } | { s: 'fail' }>({ s: 'idle' });
  const withPos = (places ?? []).filter((p) => p.lat != null && p.lng != null);
  if (!withPos.length || typeof navigator === 'undefined' || !navigator.geolocation) return null;
  const find = () => {
    setSt({ s: 'busy' });
    navigator.geolocation.getCurrentPosition(
      (pos) => { const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setSt(nearby(withPos, here, 2).length ? { s: 'ok', here } : { s: 'none' }); },
      () => setSt({ s: 'fail' }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  };
  const list = st.s === 'ok' ? nearby(withPos, st.here, 2).slice(0, 5) : [];
  return (
    <section className="card white nearby" data-testid="nearby">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div className="hub-label" style={{ margin: 0 }}>지금 근처</div>
        {st.s !== 'ok' && <button className="btn sm soft" onClick={find} disabled={st.s === 'busy'} data-testid="nearby-find"><Icon name="pin" size={15} />{st.s === 'busy' ? '찾는 중…' : '근처에 담아 둔 곳'}</button>}
        {st.s === 'ok' && <Link to="/maps" className="small" style={{ fontWeight: 500 }}>내 지도</Link>}
      </div>
      {st.s === 'idle' && <span className="tiny muted">그 동네에 가면 눌러 보세요. 담아 둔 카페·맛집이 가까운 순으로 나와요.</span>}
      {st.s === 'none' && <span className="small muted">2km 안에 담아 둔 곳이 없어요. 오늘 새 곳을 담아 볼까요?</span>}
      {st.s === 'fail' && <span className="small muted">위치를 못 읽었어요. 폰의 위치 권한을 켜 주세요.</span>}
      {st.s === 'ok' && (
        <div className="list" style={{ gap: 0 }}>
          {list.map(({ rec, m }) => {
            return (
              <div key={rec.id} className="nearby-row">
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><b>{rec.name}</b><span className="tag">{KIND_LABEL[rec.kind]}</span></span>
                  <span className="tiny muted">{meters(m)}{rec.verdict === 'again' ? ' · 또 갈래요' : ''}{Object.values(rec.reviews ?? {})[0] ? ` · ${Object.values(rec.reviews ?? {})[0]}` : ''}</span>
                </div>
                <MapAppButton t={{ name: rec.name, area: placeLabel(rec.region), lat: rec.lat, lng: rec.lng }} naverUrl={rec.naverUrl} label="길찾기" className="btn sm line" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
