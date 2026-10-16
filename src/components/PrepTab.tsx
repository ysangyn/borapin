import { Link } from 'react-router-dom';
import PackingCard from './PackingCard';
import CityInfo from './CityInfo';
import { Icon } from './ui';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { flightLinks } from '../lib/flights';
import { accessLine } from '../lib/transport';
import { cityFor, useWorld } from '../lib/world';
import { LANG_LABEL, phraseLangFor } from '../lib/phrases';
import { placeLabel, placeLong, placeParam } from '../lib/geo';
import { festivalPeriod, isOngoing, upcomingFestivals, useFestivals } from '../lib/festivals';
import type { Trip } from '../lib/types';

/**
 * 갈 예정 여행의 '준비' 탭: 흩어져 있던 준비를 한곳에.
 * 준비물 → 가는 길(가까운 역·공항, 항공권) → 도시 정보(통화·말·입국·먹을 것) → 현지어 한마디 → 가기 좋은 때·축제
 */
export default function PrepTab({ trip, trips }: { trip: Trip; trips: Trip[] }) {
  const seasons = useSeasons();
  const world = useWorld();
  const fest = useFestivals();
  const places = trip.places;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="prep-tab">
      <PackingCard trip={trip} trips={trips} />

      <section className="card white prep-card" data-testid="prep-way">
        <div className="hub-label">가는 길</div>
        <div className="hub-way-rows">
          {places.map((p) => {
            const s = seasonFor(seasons, p);
            const m = trip.when.m ?? s?.m[0] ?? null;
            const f = flightLinks(p, m);
            const line = accessLine(p);
            const fs = p.t === 'kr' ? upcomingFestivals(fest, p.code, new Date(), 120)[0] : undefined;
            return (
              <div key={placeParam(p)} className="prep-place">
                <div className="prep-place-name">{placeLong(p)}</div>
                {line && <div className="hub-way-row static"><Icon name="pin" size={16} /><span>{p.t === 'kr' ? '가까운 역·공항' : '공항'} <b>{line}</b></span></div>}
                {f && <a className="hub-way-row" href={f.skyscanner} target="_blank" rel="noreferrer"><Icon name="external" size={16} /><span>항공권 보기 · {f.label}{m ? ` · ${m}월` : ''}</span></a>}
                {f && <a className="hub-way-row" href={f.google} target="_blank" rel="noreferrer"><Icon name="external" size={16} /><span>가격 알림 켜기 (구글 항공권)</span></a>}
                {s && <div className="hub-way-row static"><Icon name="sun" size={16} /><span>가기 좋은 때 <b>{monthsLabel(s.m)}</b> · {s.why}</span></div>}
                {fs && <Link className="hub-way-row" to={`/map?sel=${placeParam(p)}`}><Icon name="flag" size={16} /><span>{isOngoing(fs) ? '지금 열리는 축제' : '축제'} <b>{fs.t}</b> · {festivalPeriod(fs)}</span></Link>}
                <Link className="hub-way-row" to={`/map?sel=${placeParam(p)}`}><Icon name="map" size={16} /><span>{placeLabel(p)} 지도·볼거리·우리 기록 보기</span></Link>
              </div>
            );
          })}
        </div>
      </section>

      {places.filter((p) => p.t === 'country').map((p) => {
        const c = cityFor(world, p);
        const code = c ? phraseLangFor(c.lang) : null;
        return (
          <section key={placeParam(p)} className="card white prep-card" data-testid="prep-city">
            <div className="hub-label">{placeLong(p)} 기본 정보</div>
            {c ? <CityInfo place={p} compact /> : <div className="small muted">이 곳의 도시 정보는 아직 없어요. 나라만 고른 여행이면 도시를 넣어 보세요.</div>}
            {code && code !== 'en' && <Link to={`/phrases/${code}?city=${encodeURIComponent(c!.city)}`} className="btn soft block" style={{ marginTop: 8 }}>{LANG_LABEL[code]} 한마디 30문장 익히기</Link>}
          </section>
        );
      })}

      <Link to="/study" className="card white prep-card" style={{ color: 'inherit' }}>
        <div className="hub-label">오늘의 영어</div>
        <div className="small">떠나기 전 하루 3문장씩 · 공항·호텔·식당 표현부터</div>
      </Link>
    </div>
  );
}
