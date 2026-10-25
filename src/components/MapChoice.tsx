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

/** [열기 함수, 창] — 창은 부모 안 어디에 두어도 화면 아래에 뜬다 */
export function useMapChoice(): [(t: MapTarget) => void, ReactNode] {
  const [t, setT] = useState<MapTarget | null>(null);
  const close = () => setT(null);
  const el = t ? (
    <div className="map-choice-backdrop" onClick={close} data-testid="map-choice">
      <div className="map-choice card" role="dialog" aria-label={`${t.name} 열기`} onClick={(e) => e.stopPropagation()}>
        <b className="jua" style={{ fontSize: 19 }}>{t.name}</b>
        {t.area && <span className="tiny muted">{t.area}</span>}
        <div className="map-choice-row">
          <a className="btn line" href={mapChoiceLinks(t).naver} target="_blank" rel="noreferrer" onClick={close}><span className="app-badge n" aria-hidden="true">N</span>네이버지도</a>
          <a className="btn line" href={mapChoiceLinks(t).kakao} target="_blank" rel="noreferrer" onClick={close}><span className="app-badge k" aria-hidden="true">K</span>카카오맵</a>
        </div>
        {t.search && <a className="btn soft block" href={mapChoiceLinks(t).web} target="_blank" rel="noreferrer" onClick={close}>네이버에서 자세히 보기</a>}
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={close}>그대로 두기</button>
      </div>
    </div>
  ) : null;
  return [setT, el];
}
