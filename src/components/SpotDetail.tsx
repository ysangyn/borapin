import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../lib/auth';
import { useHome } from '../lib/home';
import { fetchNearby, fetchSpot, fetchVideos, walkText, type AboutInfo, type NearbyItem, type SpotInfo, type VideoItem } from '../lib/nearby';
import { straightKm } from '../lib/placeApps';
import { foodPlaceUrl, reviewUrl, videoUrl, type Row } from '../lib/explore';
import { MapAppButton, useWishItem } from './MapChoice';
import MiniStreet from './MiniStreet';
import { withRo } from '../lib/ko';
import { bodyAfterLead, chipValue, leadLine } from '../lib/spotText';
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
  /** spot 볼거리 · food 먹거리(음식 이름) · shop 가게 · place 역·지명(+ 창에서 찾은 곳: 둘레 맛집·볼거리를 같이) */
  kind?: 'spot' | 'food' | 'shop' | 'place';
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
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  useEffect(() => {
    let on = true;
    setVideos(null);
    // 유튜브 영상 몇 개를 창 안에 (열쇠가 없거나 실패하면 null → 아래 '영상으로 보기' 링크만)
    const nm = spot.kind === 'food' ? spot.name.split('/')[0].trim() : spot.name;
    void fetchVideos(auth.status === 'ready' ? auth.user : null, nm, spot.area, spot.kind === 'food' ? 'food' : 'sight').then((v) => on && setVideos(v));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot.name, spot.kind]);
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
  // 사진 아래 한 줄 소개 + 본문은 세 줄까지 접어서 '더 보기' (사용자 의견 11-22: 가독성·집중)
  const introText = info?.full || info?.short || spot.about?.short || '';
  const lead = leadLine(introText);
  const body = bodyAfterLead(introText, lead);
  const chips = info ? [
    info.time && { k: '시간', v: chipValue(info.time) },
    info.rest && { k: '쉬는 날', v: chipValue(info.rest) },
    info.parking && { k: '주차', v: chipValue(info.parking, 10) },
  ].filter((x): x is { k: string; v: string } => !!x && !!x.v) : [];
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
        <div className="spot-head">
          <b className="jua" style={{ fontSize: 22 }}>{spot.name}</b>
          {lead && <p className="spot-lead" data-testid="spot-lead">{lead}</p>}
          <span className="tiny muted" style={{ display: 'block' }}>
            {food ? `${spot.area} 먹거리` : spot.area}{km != null && km >= 1 ? ` · 우리 집에서 직선 ${km}km` : ''}{spot.crowd && spot.crowd !== '보통' ? ` · 요즘 ${spot.crowd}` : ''}
          </span>
        </div>
        {chips.length > 0 && (
          <div className="spot-chips" data-testid="spot-chips">
            {chips.map((c) => <span key={c.k} className="spot-chip"><i>{c.k}</i>{c.v}</span>)}
          </div>
        )}
        {info === undefined && !spot.about && <span className="small muted">소개를 찾는 중…</span>}
        {body && (
          <div className="spot-body" data-testid="spot-intro">
            <p className={more ? '' : 'clamp3'}>{body}</p>
            {body.length > 90 && <button type="button" className="link-btn" onClick={() => setMore(!more)} data-testid="spot-more">{more ? '접기' : '더 보기'}</button>}
          </div>
        )}

        {/* 사람들 이야기: 다녀온 사람의 말과 영상이 '가 보고 싶다'를 가장 빨리 만든다 */}
        {!!videos?.length && (
          <div className="spot-videos-strip" data-testid="spot-video-strip">
            <span className="small" style={{ fontWeight: 600 }}>영상으로 미리 보기</span>
            <div className="tour-strip">
              {videos.slice(0, 6).map((v) => (
                <a key={v.id} className="tour-card video-card" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" data-testid="spot-video">
                  <img src={v.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  <span>{v.title}</span>
                  <span className="tiny muted">{v.channel}</span>
                </a>
              ))}
            </div>
            <span className="tiny muted">YouTube에서 열려요</span>
          </div>
        )}
        <div className="spot-voices" data-testid="spot-voices">
          <a className="btn sm soft" href={reviewUrl(spot.area, searchName)} target="_blank" rel="noopener noreferrer" data-testid="spot-reviews">네이버 블로그 후기 보기 ↗</a>
          <a className="btn sm soft" href={videoUrl(spot.area, searchName)} target="_blank" rel="noopener noreferrer" data-testid="spot-videos">{videos?.length ? '유튜브 영상 더 보기 ↗' : '유튜브 영상 보기 ↗'}</a>
          {food && <a className="btn sm soft" href={foodPlaceUrl(spot.area, searchName)} target="_blank" rel="noopener noreferrer">{searchName} 맛집 찾기</a>}
        </div>

        {info && (info.time || info.rest || info.addr || info.tel || info.parking) && (
          <dl className="city-facts spot-facts" aria-label="이용 안내">
            {info.time && <div><dt>이용 시간</dt><dd>{info.time}</dd></div>}
            {info.rest && <div><dt>쉬는 날</dt><dd>{info.rest}</dd></div>}
            {info.parking && <div><dt>주차</dt><dd>{info.parking}</dd></div>}
            {info.addr && <div><dt>주소</dt><dd>{info.addr}</dd></div>}
            {info.tel && <div><dt>전화</dt><dd><a href={`tel:${info.tel}`}>{info.tel}</a></dd></div>}
          </dl>
        )}

        <NearStrip spot={spot} onPick={setSpot} want={spot.kind === 'shop' ? 'see' : 'food'} />
        {spot.kind === 'place' && <NearStrip spot={spot} onPick={setSpot} want="see" />}

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

        <button type="button" className={'btn block ' + (wished ? 'line' : 'coral-soft')} disabled={wished || !!wi.saving} onClick={() => void wi.add(spot.place, spot.name, wishKind)} data-testid="spot-wish">{wished ? '♥ 가고 싶은 곳에 있어요' : '♡ 가고 싶어요'}</button>

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

/**
 * 근처 맛집 · 근처 볼거리 (사용자 의견 11-25): 볼거리를 보면 그 둘레 음식점을, 가게를 보면 둘레 관광지를.
 * 관광공사 위치 기반 목록(1km → 3km, 하루 캐시). 국내이고 자리를 알 때만.
 */
function NearStrip({ spot, onPick, want }: { spot: SpotTarget; onPick: (s: SpotTarget) => void; want: 'food' | 'see' }) {
  const auth = useAuth();
  const [list, setList] = useState<NearbyItem[] | null>(null);
  const ok = spot.place.t === 'kr' && spot.kind !== 'food' && spot.lat != null && spot.lng != null;
  useEffect(() => {
    if (!ok) return;
    let on = true;
    setList(null);
    void fetchNearby(auth.status === 'ready' ? auth.user : null, spot.lat!, spot.lng!, want).then((r) => {
      if (!on) return;
      const items = (r?.items ?? []).filter((x) => x.name !== spot.name && x.dist > 30);
      setList(items.slice(0, 8));
    });
    return () => { on = false; };
  }, [ok, spot.lat, spot.lng, spot.name, want, auth.status]);
  if (!ok || !list?.length) return null;
  return (
    <div className="spot-more-places" data-testid="spot-near">
      <span className="small" style={{ fontWeight: 600 }}>{want === 'food' ? '근처 맛집' : '근처 볼거리'}</span>
      <div className="tour-strip">
        {list.map((it) => (
          <button key={it.id} type="button" className={'tour-card' + (it.img ? '' : ' no-img')} onClick={() => onPick({ name: it.name, area: spot.area, lat: it.lat, lng: it.lng, img: it.img, place: spot.place, kind: want === 'food' ? 'shop' : 'spot' })}>
            {it.img ? <img src={it.img} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="tour-noimg" aria-hidden="true">{want === 'food' ? '🍽' : '📍'}</span>}
            <span>{it.name}</span>
            <span className="tiny muted">{it.dist > 1500 ? `${(it.dist / 1000).toFixed(1)}km` : walkText(it)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
