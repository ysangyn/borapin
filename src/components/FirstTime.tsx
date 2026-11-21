import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useWorld, flyLabel } from '../lib/world';
import { monthsLabel } from '../lib/seasons';
import { firstPlanFor, planDays, roughPlan } from '../lib/firstTime';
import { photoForPlace } from '../lib/media';
import { fetchVideos, type VideoItem } from '../lib/nearby';
import { reviewUrl, videoUrl } from '../lib/explore';
import { COUNTRY_BY_ID, placeParam } from '../lib/geo';
import { ScenicPhoto } from './Scene';
import SpotDetail, { type SpotTarget } from './SpotDetail';
import type { Place } from '../lib/types';

/**
 * '처음 가 보는 나라' 한 장 (사용자 의견 11-21: 브루나이처럼 처음 가는 곳은 판단할 거리가 없다).
 * 사진 → 한 줄 → 알아 둘 것 넷 → 대표 볼거리 → 보통 이렇게 다녀요(2박 3일·4박 5일) → 이 일정으로 계획하기 → 영상 → 여행기.
 * 일정은 손으로 쓴 자료가 먼저, 없으면 도시 자료로 짠 뼈대 (AI 없음, 비용 없음).
 */
export default function FirstTime({ place }: { place: Place }) {
  const auth = useAuth();
  const world = useWorld();
  const [nights, setNights] = useState<2 | 4>(2);
  const [spot, setSpot] = useState<SpotTarget | null>(null);
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const r = firstPlanFor(world, place);
  const country = place.t === 'country' ? COUNTRY_BY_ID.get(place.id)?.name ?? '' : '';
  const city = r?.city;
  // 나라만 골랐으면 나라 이름으로, 도시를 골랐으면 '나라 도시'로 찾는다 (브루나이 → '브루나이')
  const q = place.t === 'country' && place.city ? `${country} ${place.city}` : country;
  useEffect(() => {
    if (!city) return;
    let on = true;
    void fetchVideos(auth.status === 'ready' ? auth.user : null, q, '', 'sight').then((v) => on && setVideos(v));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  if (!r || !city) return null;
  const plan = r.plan ?? roughPlan(city);
  const days = planDays(plan, nights);
  const cityPlace: Place = { t: 'country', id: city.c, city: city.city };
  const photo = photoForPlace(cityPlace) ?? photoForPlace(place);
  const asOf = world?.updated ? `${Number(world.updated.slice(5, 7))}월` : '';
  return (
    <div className="card white first-time" data-testid="first-time">
      {photo && <ScenicPhoto photo={photo} className="first-photo" label="bottom" />}
      <div className="first-body">
        <div className="first-title">
          <b className="jua">{place.t === 'country' && place.city ? `${place.city} · ${country}` : country}</b>
          <span className="tiny muted">처음 가 보는 곳</span>
        </div>
        <p className="small" style={{ margin: 0, lineHeight: 1.6 }}>{city.line}</p>

        <div className="first-facts" data-testid="first-facts">
          <div><span>비행</span><b>{flyLabel(city.fly)}</b></div>
          <div><span>가기 좋은 때</span><b>{monthsLabel(city.best)}</b></div>
          <div><span>입국</span><b>{city.entry}</b></div>
          <div><span>꼭 알 것</span><b>{plan.know}</b></div>
        </div>
        <span className="tiny muted">{asOf ? `${asOf} 기준 · ` : ''}떠나기 전 <a href="https://www.0404.go.kr" target="_blank" rel="noopener noreferrer">외교부 해외안전여행</a>에서 확인하세요</span>

        <b className="jua first-h">대표 볼거리</b>
        <div className="chips" style={{ gap: 6 }}>
          {city.see.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => setSpot({ name: s, area: city.city, place: cityPlace, kind: 'spot' })} data-testid="first-see">{s}</button>
          ))}
        </div>
        <span className="tiny muted">먹어 볼 것: {city.eat.join(' · ')}</span>

        <div className="row-between first-h" style={{ alignItems: 'center' }}>
          <b className="jua">보통 이렇게 다녀요</b>
          <div className="seg" role="tablist" aria-label="며칠">
            <button role="tab" aria-selected={nights === 2} className={nights === 2 ? 'on' : ''} onClick={() => setNights(2)}>2박 3일</button>
            <button role="tab" aria-selected={nights === 4} className={nights === 4 ? 'on' : ''} onClick={() => setNights(4)} data-testid="first-4">4박 5일</button>
          </div>
        </div>
        <ol className="first-days" data-testid="first-days">
          {days.map((d) => (
            <li key={d.title}>
              <b>{d.title}</b>
              <span>{d.where}{d.note && <span className="tiny muted" style={{ display: 'block' }}>{d.note}</span>}</span>
            </li>
          ))}
        </ol>
        <span className="tiny muted">{r.plan ? '많이 다니는 길로 써 둔 예시예요 · 바꿔서 쓸 수 있어요' : '도시 자료로 짠 간단한 뼈대예요 · 바꿔서 쓸 수 있어요'}</span>
        <Link to={`/plan?place=${placeParam(cityPlace)}&first=${nights}`} className="btn block soft-on" data-testid="first-plan">이 일정으로 계획하기</Link>

        {!!videos?.length && (
          <>
            <b className="jua first-h">영상으로 미리 보기</b>
            <div className="tour-strip">
              {videos.slice(0, 6).map((v) => (
                <a key={v.id} className="tour-card video-card" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">
                  <img src={v.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  <span>{v.title}</span>
                </a>
              ))}
            </div>
            <span className="tiny muted">YouTube에서 열려요</span>
          </>
        )}
        <div className="spot-voices">
          <a className="btn sm soft" href={reviewUrl(q, '여행기')} target="_blank" rel="noopener noreferrer" data-testid="first-reviews">다녀온 사람들 여행기</a>
          {!videos?.length && <a className="btn sm soft" href={videoUrl(q, '여행')} target="_blank" rel="noopener noreferrer">영상으로 보기</a>}
        </div>
      </div>
      {spot && <SpotDetail spot={spot} onClose={() => setSpot(null)} />}
    </div>
  );
}
