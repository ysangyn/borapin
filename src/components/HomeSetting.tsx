import { useState } from 'react';
import { Icon, useToast } from './ui';
import PlacePicker from './PlacePicker';
import { clearHome, saveHome, useHome } from '../lib/home';
import { roundHome } from '../lib/placeApps';
import { lookupGeo } from '../lib/placeLookup';
import { REGION_BY_CODE, regionLong } from '../lib/geo';
import type { Place } from '../lib/types';

/** 우리 공간 › 우리 집: 시·군(필수) + 동네(선택). 기본은 약 500m로 반올림해 저장 */
export default function HomeSetting() {
  const home = useHome();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [region, setRegion] = useState<Place[]>([]);
  const [town, setTown] = useState('');
  const [exact, setExact] = useState(false);
  const [busy, setBusy] = useState(false);
  const where = region[region.length - 1];

  const save = async () => {
    if (!where || where.t !== 'kr' || busy) return;
    const r = REGION_BY_CODE.get(where.code);
    if (!r) return;
    setBusy(true);
    const g = town.trim() ? await lookupGeo(`${regionLong(where.code)} ${town.trim()}`) : null;
    const pos = g ?? { lat: r.lat, lng: r.lng };
    const label = `${regionLong(where.code)}${town.trim() ? ` ${town.trim()}` : ''}`.slice(0, 40);
    try {
      await saveHome({ label, code: where.code, exact: exact && !!g, ...roundHome(pos.lat, pos.lng, exact && !!g) });
      toast(town.trim() && !g ? '동네를 찾지 못해 시·군 가운데로 정했어요' : '우리 집을 정했어요');
      setEdit(false);
    } catch {
      toast('저장하지 못했어요. 다시 해 주세요');
    }
    setBusy(false);
  };

  return (
    <section id="home" data-testid="home-setting">
      <div className="label" style={{ padding: '0 4px 6px' }}>우리 집</div>
      <div className="setting-group" style={{ padding: edit ? 14 : 0 }}>
        {!edit ? (
          <button className="setting-row" onClick={() => setEdit(true)} data-testid="home-edit">
            <span className="ico"><Icon name="home" size={17} /></span>
            <span style={{ flex: 1 }}>
              {home ? home.label : home === null ? '우리 집 정하기' : '불러오는 중…'}
              <div className="tiny muted">{home ? `${home.exact ? '정확한 자리' : '동네까지만'} · 여기서 가는 길을 지도 앱으로 열어요` : '가고 싶은 곳까지 가는 길을 바로 열 수 있어요'}</div>
            </span>
            <Icon name="chev" size={16} />
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PlacePicker value={where ? [where] : []} onChange={(v) => setRegion(v.filter((x) => x.t === 'kr').slice(-1))} />
            <input className="input" aria-label="동네나 주소" value={town} onChange={(e) => setTown(e.target.value)} placeholder="동네나 주소 (선택) 예: 백석동" maxLength={30} />
            <label className="check-row"><input type="checkbox" checked={exact} onChange={(e) => setExact(e.target.checked)} /><span>정확한 자리로 저장 (기본은 500m쯤 흐리게)</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              {home && <button className="btn ghost" style={{ flex: 1 }} onClick={() => { void clearHome(); setEdit(false); toast('우리 집을 지웠어요'); }}>지우기</button>}
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setEdit(false)}>그만두기</button>
              <button className="btn" style={{ flex: 1 }} disabled={!where || busy} onClick={save} data-testid="home-save">{busy ? '찾는 중…' : '정하기'}</button>
            </div>
            <span className="tiny muted">우리 집 위치는 함께 쓰는 사람만 봐요. 공유 링크·엑셀·물어보기에는 넣지 않아요.</span>
          </div>
        )}
      </div>
    </section>
  );
}
