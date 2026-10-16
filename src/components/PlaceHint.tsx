import { Link } from 'react-router-dom';
import CityInfo from './CityInfo';
import { COUNTRY_BY_ID } from '../lib/geo';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { cityFor, useWorld } from '../lib/world';
import { festivalPeriod, upcomingFestivals, useFestivals } from '../lib/festivals';
import type { Place } from '../lib/types';
import { accessLine } from '../lib/transport';

/**
 * 장소를 고르면 바로 아래에 한 눈 정보: 국내는 볼거리·먹거리·축제, 해외 도시는 도시 정보, 나라만 고르면 가기 좋은 때 + 그 나라 도시들
 * (기록 남기기·가고 싶은 곳 담기에서 고른 곳이 맞는지, 뭐가 있는지 바로 보이게)
 */
export default function PlaceHint({ place }: { place: Place | null }) {
  const info = useTravelInfo();
  const seasons = useSeasons();
  const world = useWorld();
  const fest = useFestivals();
  if (!place) return null;
  const season = seasonFor(seasons, place);
  if (place.t === 'kr') {
    const c = info?.cells[place.code]?.main;
    const f = upcomingFestivals(fest, place.code, new Date(), 60)[0];
    if (!c && !season) return null;
    return (
      <div className="place-hint" data-testid="place-hint">
        {c && <span><b>볼거리</b> {c.spots.slice(0, 4).join(' · ')}</span>}
        {c && c.foods.length > 0 && <span><b>먹거리</b> {c.foods.slice(0, 3).join(' · ')}</span>}
        {f && <span><b>축제</b> {f.t} · {festivalPeriod(f)}</span>}
        {season && <span><b>가기 좋은 때</b> {monthsLabel(season.m)} · {season.why}</span>}
        {accessLine(place) && <span data-testid="place-access"><b>가는 길</b> {accessLine(place)}</span>}
      </div>
    );
  }
  const city = cityFor(world, place);
  if (place.city && city) return <CityInfo place={place} compact />;
  const country = COUNTRY_BY_ID.get(place.id);
  const cities = (world?.cities ?? []).filter((w) => w.c === place.id);
  return (
    <div className="place-hint" data-testid="place-hint">
      {country && <span><b>{country.name}</b> · {country.continent}</span>}
      {season && <span><b>가기 좋은 때</b> {monthsLabel(season.m)} · {season.why}{season.at ? ` (${season.at} 기준)` : ''}</span>}
      {cities.length > 0
        ? <span><b>도시 정보 있음</b> {cities.map((w) => w.city).join(' · ')} — 위 칸에 도시를 넣으면 통화·말·입국·먹을 것이 보여요</span>
        : <span className="muted">이 나라의 도시 정보는 아직 없어요. <Link to={`/ask?q=${encodeURIComponent(`${country?.name ?? ''} 여행 정보`)}`}>보라에게 물어보기</Link></span>}
    </div>
  );
}
