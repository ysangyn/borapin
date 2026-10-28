import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../lib/auth';
import { useHome } from '../lib/home';
import { fetchSpot, type SpotInfo } from '../lib/nearby';
import { straightKm } from '../lib/placeApps';
import { mapChoiceLinks, useWishItem } from './MapChoice';
import type { Place } from '../lib/types';

/**
 * 관광지 사진을 누르면 바로 지도 앱으로 가지 않고, 먼저 크게 보여 준다 (사용자 의견 10-28):
 * 큰 사진 · 소개(더보기) · 이용 시간·쉬는 날 · 주소·전화 · 우리 집에서 거리 · 붐빔 → 네이버지도/카카오맵에서 보기 · 가고 싶어요.
 * 소개는 관광공사 자료(뒷단 /spot, 7일 캐시). 못 받으면 사진과 지도 단추만.
 */
export interface SpotTarget { name: string; area: string; lat?: number | null; lng?: number | null; img?: string; crowd?: string | null; place: Place }

export default function SpotDetail({ spot, onClose }: { spot: SpotTarget; onClose: () => void }) {
  const auth = useAuth();
  const home = useHome();
  const wi = useWishItem();
  const [info, setInfo] = useState<SpotInfo | null | undefined>(undefined);
  const [more, setMore] = useState(false);
  useEffect(() => {
    let on = true;
    void fetchSpot(auth.status === 'ready' ? auth.user : null, spot.name, spot.lat, spot.lng).then((x) => on && setInfo(x));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot.name]);
  const links = mapChoiceLinks({ name: spot.name, area: spot.area, lat: spot.lat, lng: spot.lng });
  const km = home && spot.lat != null && spot.lng != null ? Math.round(straightKm(home, { lat: spot.lat, lng: spot.lng })) : null;
  const wished = wi.has(spot.place, spot.name, 'spot');
  const img = spot.img || info?.img;
  return createPortal(
    <div className="map-choice-backdrop" onClick={onClose} data-testid="spot-detail">
      <div className="map-choice card spot-detail" role="dialog" aria-label={spot.name} onClick={(e) => e.stopPropagation()}>
        {img && <img className="spot-photo" src={img} alt={spot.name} referrerPolicy="no-referrer" />}
        <div>
          <b className="jua" style={{ fontSize: 22 }}>{spot.name}</b>
          <span className="tiny muted" style={{ display: 'block' }}>{spot.area}{km != null && km >= 1 ? ` · 우리 집에서 직선 ${km}km` : ''}{spot.crowd && spot.crowd !== '보통' ? ` · 요즘 ${spot.crowd}` : ''}</span>
        </div>
        {info === undefined && <span className="small muted">소개를 찾는 중…</span>}
        {info?.short && (
          <p className="small" style={{ margin: 0, lineHeight: 1.6 }}>
            {more && info.full ? info.full : info.short}
            {info.full && <button className="link-btn" style={{ marginLeft: 4 }} onClick={() => setMore(!more)}>{more ? '접기' : '더보기'}</button>}
          </p>
        )}
        {info && (info.time || info.rest || info.addr || info.tel || info.parking) && (
          <dl className="city-facts spot-facts">
            {info.time && <div><dt>이용 시간</dt><dd>{info.time}</dd></div>}
            {info.rest && <div><dt>쉬는 날</dt><dd>{info.rest}</dd></div>}
            {info.parking && <div><dt>주차</dt><dd>{info.parking}</dd></div>}
            {info.addr && <div><dt>주소</dt><dd>{info.addr}</dd></div>}
            {info.tel && <div><dt>전화</dt><dd><a href={`tel:${info.tel}`}>{info.tel}</a></dd></div>}
          </dl>
        )}
        {info && <span className="tiny muted">한국관광공사 · 시간은 바뀔 수 있어요, 가기 전에 확인</span>}
        <div className="map-choice-row">
          <a className="btn" href={links.naver} target="_blank" rel="noreferrer"><span className="app-badge n" aria-hidden="true">N</span>네이버지도</a>
          <a className="btn line" href={links.kakao} target="_blank" rel="noreferrer"><span className="app-badge k" aria-hidden="true">K</span>카카오맵</a>
        </div>
        <button type="button" className={'btn block ' + (wished ? 'line' : 'coral-soft')} disabled={wished || !!wi.saving} onClick={() => void wi.add(spot.place, spot.name, 'spot')} data-testid="spot-wish">{wished ? '♥ 담겨 있어요' : '♡ 가고 싶어요'}</button>
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onClose}>닫기</button>
      </div>
    </div>,
    document.body,
  );
}
