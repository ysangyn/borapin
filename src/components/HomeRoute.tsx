import { Link } from 'react-router-dom';
import { useHome } from '../lib/home';
import { routeLinks, straightKm } from '../lib/placeApps';

const touch = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

/** 우리 집에서 가는 길: 지도 앱(카카오·네이버)으로 출발지·도착지를 채워 연다 */
export default function HomeRoute({ to, note }: { to: { name: string; lat: number; lng: number }; note?: string }) {
  const home = useHome();
  if (home === undefined) return null;
  if (!home) return <Link to="/space#home" className="tiny home-route-empty" data-testid="home-route-empty">우리 집을 정하면 여기서 가는 길을 바로 열 수 있어요</Link>;
  const km = Math.round(straightKm(home, to));
  if (km < 1) return null;
  const l = routeLinks(home, to);
  return (
    <div className="home-route" data-testid="home-route">
      <span className="tiny muted">우리 집에서 직선 {km}km{note ? ` · ${note}` : ''}</span>
      <div className="home-route-btns">
        <a className="pv-app" href={l.kakaoTransit} target="_blank" rel="noreferrer"><span className="app-badge k" aria-hidden="true">K</span>대중교통</a>
        <a className="pv-app" href={l.kakaoCar} target="_blank" rel="noreferrer"><span className="app-badge k" aria-hidden="true">K</span>자동차</a>
        {touch() && <a className="pv-app" href={l.naverTransit}><span className="app-badge n" aria-hidden="true">N</span>대중교통</a>}
      </div>
    </div>
  );
}
