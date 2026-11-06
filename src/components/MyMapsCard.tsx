import { Link } from 'react-router-dom';
import { Icon } from './ui';
import { useMyMaps } from '../lib/placeMapData';
import { ALL, KIND_COLOR, themeLabel } from '../lib/placeMaps';
import { placeLabel, placeParam } from '../lib/geo';
import type { PlaceKind } from '../lib/types';

/**
 * 홈 '내 지도' 카드: 여행과 상관없이 동네마다 쌓이는 맛집·카페 지도로 가는 가장 넓은 문.
 * 지도가 있으면 많은 순으로 칩 몇 개 + 담기, 없으면 첫 지도를 권한다.
 */
export default function MyMapsCard() {
  const maps = useMyMaps();
  if (maps === null) return null;
  const themed = maps.filter((m) => m.theme !== ALL).sort((a, b) => b.recs.length - a.recs.length);
  if (!themed.length) {
    return (
      <Link to="/places/new" className="card white mymaps-card empty" data-testid="mymaps-card-empty">
        <span className="mymaps-card-head"><b className="jua">우리 동네 맛집 지도 만들기</b><Icon name="chev" size={16} /></span>
        <span className="small muted">여행 아니어도 돼요. 자주 가는 식당·카페를 담으면 동네마다 내 지도가 되고, 링크 하나로 친구에게 보낼 수 있어요.</span>
      </Link>
    );
  }
  const total = themed.reduce((a, m) => a + m.recs.length, 0);
  return (
    <div className="card white mymaps-card" data-testid="mymaps-card">
      <span className="mymaps-card-head">
        <Link to="/maps" className="jua" style={{ color: 'inherit' }}>내 지도 <span className="muted" style={{ fontSize: 13, fontFamily: 'inherit', fontWeight: 400 }}>{total}곳</span></Link>
        <Link to="/places/new" className="btn sm" data-testid="mymaps-card-add"><Icon name="plus" size={14} stroke={2.4} />담기</Link>
      </span>
      <div className="chips" style={{ marginTop: 2 }}>
        {themed.slice(0, 5).map((m) => (
          <Link key={m.key} to={`/region/${placeParam(m.region)}?tab=places`} className="chip" data-testid="mymaps-card-chip">
            <i className="dot" style={{ background: KIND_COLOR[(m.recs[0]?.kind ?? 'etc') as PlaceKind] }} aria-hidden="true" />
            {placeLabel(m.region)} {themeLabel(m.theme)} <b>{m.recs.length}</b>
          </Link>
        ))}
        {themed.length > 5 && <Link to="/maps" className="chip">모두 보기</Link>}
      </div>
    </div>
  );
}
