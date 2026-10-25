import { useState, type ReactNode } from 'react';

/** 누른 곳을 어느 지도 앱으로 열지 고르는 작은 창: 네이버지도 / 카카오맵 (축제는 네이버 검색도) */
export interface MapTarget { name: string; area?: string; lat?: number | null; lng?: number | null; search?: boolean }

const enc = encodeURIComponent;
export function mapChoiceLinks(t: MapTarget) {
  const q = [t.area, t.name].filter(Boolean).join(' ');
  const hasPos = t.lat != null && t.lng != null;
  return {
    naver: `https://map.naver.com/p/search/${enc(q)}`,
    kakao: hasPos ? `https://map.kakao.com/link/map/${enc(t.name)},${t.lat},${t.lng}` : `https://map.kakao.com/link/search/${enc(q)}`,
    web: `https://search.naver.com/search.naver?query=${enc(q)}`,
  };
}

/** 지도 앱 설정 (이 기기에만): 기본 네이버, 카카오, 또는 누를 때마다 고르기 */
export type MapPref = 'naver' | 'kakao' | 'ask';
const PREF_KEY = 'borapin:map-app';
export const mapPref = (): MapPref => { try { const v = localStorage.getItem(PREF_KEY); return v === 'kakao' || v === 'ask' ? v : 'naver'; } catch { return 'naver'; } };
export const setMapPref = (v: MapPref) => { try { localStorage.setItem(PREF_KEY, v); } catch { /* */ } };

/** [열기 함수, 창] — 설정이 네이버·카카오면 바로 그 앱으로, '고르기'면 창이 뜬다. 축제·볼거리처럼 자세히 볼 것도 창으로 */
export function useMapChoice(): [(t: MapTarget) => void, ReactNode] {
  const [t, setT0] = useState<MapTarget | null>(null);
  const setT = (x: MapTarget | null) => {
    const p = mapPref();
    if (x && p !== 'ask' && !x.search) { window.open(p === 'kakao' ? mapChoiceLinks(x).kakao : mapChoiceLinks(x).naver, '_blank', 'noopener'); return; }
    setT0(x);
  };
  const close = () => setT(null);
  const el = t ? (
    <div className="map-choice-backdrop" onClick={close} data-testid="map-choice">
      <div className="map-choice card" role="dialog" aria-label={`${t.name} 열기`} onClick={(e) => e.stopPropagation()}>
        <b className="jua" style={{ fontSize: 19 }}>{t.name}</b>
        {t.area && <span className="tiny muted">{t.area}</span>}
        <div className="map-choice-row">
          <a className={'btn ' + (mapPref() === 'kakao' ? 'line' : '')} href={mapChoiceLinks(t).naver} target="_blank" rel="noreferrer" onClick={close}><span className="app-badge n" aria-hidden="true">N</span>네이버지도</a>
          <a className={'btn ' + (mapPref() === 'kakao' ? '' : 'line')} href={mapChoiceLinks(t).kakao} target="_blank" rel="noreferrer" onClick={close}><span className="app-badge k" aria-hidden="true">K</span>카카오맵</a>
        </div>
        {t.search && <a className="btn soft block" href={mapChoiceLinks(t).web} target="_blank" rel="noreferrer" onClick={close}>네이버에서 자세히 보기</a>}
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={close}>그대로 두기</button>
      </div>
    </div>
  ) : null;
  return [setT, el];
}

/** 우리 공간의 설정 한 줄: 장소를 누르면 열 지도 앱 */
export function MapPrefSetting() {
  const [v, setV] = useState<MapPref>(mapPref);
  const pick = (x: MapPref) => { setMapPref(x); setV(x); };
  return (
    <section data-testid="map-pref">
      <div className="label" style={{ padding: '0 4px 6px' }}>장소를 누르면 열 지도</div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="chips">
          {([['naver', '네이버지도'], ['kakao', '카카오맵'], ['ask', '누를 때마다 고르기']] as const).map(([k, l]) => (
            <button key={k} className={'chip' + (v === k ? ' on' : '')} aria-pressed={v === k} onClick={() => pick(k)}>{l}</button>
          ))}
        </div>
        <span className="tiny muted">이 폰에만 적용돼요. 축제·볼거리·먹거리는 '자세히 보기'도 함께 나와요.</span>
      </div>
    </section>
  );
}
