import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../lib/auth';
import { useHome } from '../lib/home';
import { fetchSpot, type AboutInfo, type SpotInfo } from '../lib/nearby';
import { straightKm } from '../lib/placeApps';
import { foodPlaceUrl, reviewUrl, videoUrl, type Row } from '../lib/explore';
import { MapAppButton, useWishItem } from './MapChoice';
import MiniStreet from './MiniStreet';
import { withRo } from '../lib/ko';
import type { Place } from '../lib/types';

/**
 * '알아보기' 창: 볼거리·먹거리·맛집 카드를 누르면 지도보다 먼저 '가고 싶은지 판단할 거리'를 보여 준다.
 * (사용자 의견 10-28: 지도부터 뜨지 않게 · 아내 의견 11-21: 사진 한 장·지도만으론 끌리지 않는다)
 * 사진 여러 장(넘겨 보기) → 소개 → 사람들 이야기(후기·영상) → 이용 시간 등 → 가고 싶어요 → 지도는 맨 아래 접어서.
 * 소개: 관광공사(뒷단 /spot, 사진 여러 장 포함) · 먹거리는 위키백과 요약(지역 창이 /about으로 받아 넘겨 준다).
 */
export interface SpotTarget {
  name: string;
  area: string;
  lat?: number | null;
  lng?: number | null;
  img?: string;
  crowd?: string | null;
  place: Place;
  /** spot 볼거리 · food 먹거리(음식 이름) · shop 가게 */
  kind?: 'spot' | 'food' | 'shop';
  /** 위키백과 요약 (있으면) */
  about?: AboutInfo;
  /** 먹거리 창에서 보여 줄 그 지역 맛집 (관광공사) */
  foods?: Row[];
}

export default function SpotDetail({ spot: first, onClose }: { spot: SpotTarget; onClose: () => void }) {
  const auth = useAuth();
  const home = useHome();
  const wi = useWishItem();
  const [spot, setSpot] = useState(first);
  const [info, setInfo] = useState<SpotInfo | null | undefined>(undefined);
  const [more, setMore] = useState(false);
  const [map, setMap] = useState(false);
  const food = spot.kind === 'food';
  useEffect(() => {
    let on = true;
    setInfo(undefined); setMore(false); setMap(false);
    // 음식 이름은 관광공사에서 찾지 않는다 (음식점 하나가 잘못 걸린다)
    if (food) { setInfo(null); return; }
    void fetchSpot(auth.status === 'ready' ? auth.user : null, spot.name, spot.lat, spot.lng).then((x) => on && setInfo(x));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot.name, food]);
  const km = home && spot.lat != null && spot.lng != null ? Math.round(straightKm(home, { lat: spot.lat, lng: spot.lng })) : null;
  const wishKind = food ? 'food' : 'spot';
  const wished = wi.has(spot.place, spot.name, wishKind);
  const pics = [...new Set([spot.img, info?.img, ...(info?.imgs ?? []), spot.about?.img].filter((x): x is string => !!x))].slice(0, 9);
  const [bad, setBad] = useState<Set<string>>(new Set());
  const shown = pics.filter((p) => !bad.has(p));
  const intro = info?.short ? { text: more && info.full ? info.full : info.short, full: !!info.full, src: '한국관광공사' } : spot.about?.short ? { text: spot.about.short, full: false, src: '위키백과' } : null;
  const searchName = food ? spot.name.split('/')[0].trim() : spot.name;
  return createPortal(
    <div className="map-choice-backdrop" onClick={onClose} data-testid="spot-detail">
      <div className="map-choice card spot-detail" role="dialog" aria-label={spot.name} onClick={(e) => e.stopPropagation()}>
        {shown.length > 0 ? (
          <div className="spot-gallery" data-testid="spot-gallery" aria-label={`사진 ${shown.length}장`}>
            {shown.map((p, i) => (
              <img key={p} src={p} alt={i === 0 ? spot.name : ''} loading={i < 2 ? 'eager' : 'lazy'} referrerPolicy="no-referrer" onError={() => setBad((b) => new Set(b).add(p))} />
            ))}
          </div>
        ) : info === undefined ? <div className="spot-gallery-empty" aria-hidden="true" /> : null}
        {shown.length > 1 && <span className="tiny muted" style={{ marginTop: -6 }}>사진 {shown.length}장 · 옆으로 넘겨 보세요</span>}
        <div>
          <b className="jua" style={{ fontSize: 22 }}>{spot.name}</b>
          <span className="tiny muted" style={{ display: 'block' }}>
            {food ? `${spot.area} 먹거리` : spot.area}{km != null && km >= 1 ? ` · 우리 집에서 직선 ${km}km` : ''}{spot.crowd && spot.crowd !== '보통' ? ` · 요즘 ${spot.crowd}` : ''}
          </span>
        </div>
        {info === undefined && !spot.about && <span className="small muted">소개를 찾는 중…</span>}
        {intro && (
          <p className="small" style={{ margin: 0, lineHeight: 1.65 }} data-testid="spot-intro">
            {intro.text}
            {intro.full && <button className="link-btn" style={{ marginLeft: 4 }} onClick={() => setMore(!more)}>{more ? '접기' : '더보기'}</button>}
          </p>
        )}

        {/* 사람들 이야기: 다녀온 사람의 말과 영상이 '가 보고 싶다'를 가장 빨리 만든다 */}
        <div className="spot-voices" data-testid="spot-voices">
          <a className="btn sm soft" href={reviewUrl(spot.area, searchName)} target="_blank" rel="noopener noreferrer" data-testid="spot-reviews">다녀온 사람들 후기</a>
          <a className="btn sm soft" href={videoUrl(spot.area, searchName)} target="_blank" rel="noopener noreferrer" data-testid="spot-videos">영상으로 보기</a>
          {food && <a className="btn sm soft" href={foodPlaceUrl(spot.area, searchName)} target="_blank" rel="noopener noreferrer">{searchName} 맛집 찾기</a>}
        </div>

        {info && (info.time || info.rest || info.addr || info.tel || info.parking) && (
          <dl className="city-facts spot-facts">
            {info.time && <div><dt>이용 시간</dt><dd>{info.time}</dd></div>}
            {info.rest && <div><dt>쉬는 날</dt><dd>{info.rest}</dd></div>}
            {info.parking && <div><dt>주차</dt><dd>{info.parking}</dd></div>}
            {info.addr && <div><dt>주소</dt><dd>{info.addr}</dd></div>}
            {info.tel && <div><dt>전화</dt><dd><a href={`tel:${info.tel}`}>{info.tel}</a></dd></div>}
          </dl>
        )}

        {food && (spot.foods?.length ?? 0) > 0 && (
          <div className="spot-more-places">
            <span className="small" style={{ fontWeight: 600 }}>{spot.area} 맛집</span>
            <div className="tour-strip">
              {spot.foods!.filter((r) => r[3]).slice(0, 8).map(([n, lat, lng, img]) => (
                <button key={n} type="button" className="tour-card" onClick={() => setSpot({ name: n, area: spot.area, lat, lng, img, place: spot.place, kind: 'shop' })}>
                  <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  <span>{n}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="button" className={'btn block ' + (wished ? 'line' : 'coral-soft')} disabled={wished || !!wi.saving} onClick={() => void wi.add(spot.place, spot.name, wishKind)} data-testid="spot-wish">{wished ? '♥ 담겨 있어요' : '♡ 가고 싶어요'}</button>

        {/* 지도는 맨 아래, 필요할 때 펼친다 */}
        {!food && (
          map ? (
            <>
              {spot.lat != null && spot.lng != null && <MiniStreet name={spot.name} lat={spot.lat} lng={spot.lng} height={150} />}
              <MapAppButton t={{ name: spot.name, area: spot.area, lat: spot.lat, lng: spot.lng }} label="지도 앱으로 길찾기" />
            </>
          ) : (
            <button type="button" className="btn block line" onClick={() => setMap(true)} data-testid="spot-show-map">지도로 위치 보기</button>
          )
        )}
        {(info || spot.about) && (
          <span className="tiny muted">
            {[info ? '한국관광공사' : '', spot.about ? '위키백과' : ''].filter(Boolean).join(' · ')}
            {spot.about?.url && <> · <a href={spot.about.url} target="_blank" rel="noopener noreferrer">위키백과에서 더 읽기</a></>}
            {info?.time || info?.rest ? ' · 시간은 바뀔 수 있어요, 가기 전에 확인' : ''}
          </span>
        )}
        {spot !== first && <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setSpot(first)}>← {withRo(first.name)} 돌아가기</button>}
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onClose}>닫기</button>
      </div>
    </div>,
    document.body,
  );
}
