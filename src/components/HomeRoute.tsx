import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useHome } from '../lib/home';
import { routeLinks, straightKm } from '../lib/placeApps';
import { mapPref } from './MapChoice';

const touch = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

/**
 * 우리 집에서 가는 길: 단추 하나('길찾기') → 대중교통 / 자동차 고르기 → 지도 앱이 출발·도착을 채워 열린다.
 * 앱은 '장소를 누르면 열 지도' 설정을 따른다(기본 네이버). 네이버 길찾기는 앱으로만 열려서 폰이 아니면 카카오맵.
 */
export default function HomeRoute({ to, note }: { to: { name: string; lat: number; lng: number }; note?: string }) {
  const home = useHome();
  const [open, setOpen] = useState(false);
  if (home === undefined) return null;
  if (!home) return <Link to="/space#home" className="tiny home-route-empty" data-testid="home-route-empty">우리 집을 정하면 여기서 가는 길을 바로 열 수 있어요</Link>;
  const km = Math.round(straightKm(home, to));
  if (km < 1) return null;
  const l = routeLinks(home, to);
  const naver = mapPref() !== 'kakao' && touch();
  const transit = naver ? l.naverTransit : l.kakaoTransit, car = naver ? l.naverCar : l.kakaoCar;
  return (
    <div className="home-route" data-testid="home-route">
      <span className="tiny muted">우리 집에서 직선 {km}km{note ? ` · ${note}` : ''}</span>
      <button type="button" className="pv-app" onClick={() => setOpen(true)} data-testid="home-route-open">길찾기</button>
      {open && createPortal(
        <div className="map-choice-backdrop" onClick={() => setOpen(false)} data-testid="route-choice">
          <div className="map-choice card" role="dialog" aria-label={`${to.name} 가는 길`} onClick={(e) => e.stopPropagation()}>
            <b className="jua" style={{ fontSize: 19 }}>우리 집 → {to.name}</b>
            <span className="tiny muted">{naver ? '네이버지도' : '카카오맵'}에서 출발·도착을 채워 열어요</span>
            <div className="map-choice-row">
              <a className="btn" href={transit} target={naver ? undefined : '_blank'} rel="noreferrer" onClick={() => setOpen(false)}>대중교통</a>
              <a className="btn line" href={car} target={naver ? undefined : '_blank'} rel="noreferrer" onClick={() => setOpen(false)}>자동차</a>
            </div>
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setOpen(false)}>그대로 두기</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
