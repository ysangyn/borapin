import { useState } from 'react';
import { Link } from 'react-router-dom';
import Stopovers from './Stopovers';
import { Icon } from './ui';
import { useHome } from '../lib/home';
import { straightKm } from '../lib/placeApps';
import { REGION_BY_CODE } from '../lib/geo';

/**
 * '가는 길에 들를 곳 찾기' 단추 (경유지): 늘 보이는 한 줄 → 누르면 들러 가기(자동차·대중교통)가 펼쳐진다.
 * 집이 없으면 정하러 가는 줄, 집에서 60km 안이면 들를 만한 곳이 없다고 한 줄.
 */
export default function StopoverFind({ destCode, trip, noHomeHint = true }: { destCode: string; trip?: { id: string; firstDay: string | null }; /** 준비 탭은 '가는 길' 칸이 이미 집을 정하라고 하므로 끈다 */ noHomeHint?: boolean }) {
  const home = useHome();
  const [open, setOpen] = useState(false);
  const dest = REGION_BY_CODE.get(destCode);
  if (home === undefined || !dest) return null;
  if (!home) return !noHomeHint ? null : <Link to="/space#home" className="hub-way-row" data-testid="stopover-find-home"><Icon name="pin" size={16} /><span>가는 길에 들를 곳 찾기 · <b>우리 집을 정하면</b> 찾아 드려요</span></Link>;
  if (straightKm(home, dest) < 60) return <div className="hub-way-row static" data-testid="stopover-find-near"><Icon name="pin" size={16} /><span className="muted">집에서 가까워 들를 곳 없이 바로 가면 돼요</span></div>;
  return (
    <>
      <button type="button" className="hub-way-row stopover-find" aria-expanded={open} onClick={() => setOpen((v) => !v)} data-testid="stopover-find">
        <Icon name="pin" size={16} /><span><b>가는 길에 들를 곳 찾기</b> · 조금만 돌아가는 처음 가 보는 곳</span><span className="stopover-find-arrow" aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && <Stopovers destCode={destCode} trip={trip} />}
    </>
  );
}
