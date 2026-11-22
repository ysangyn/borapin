import DirectWays from './DirectWays';
import { useEffect, useMemo, useState } from 'react';
import { useTravelInfo } from '../lib/travelinfo';
import { accessLine } from '../lib/transport';
import { crowdOf, loadTour, trendAt, trendTags, useTrend, type TourCell } from '../lib/trend';
import { festivalPeriod, upcomingFestivals, useFestivals } from '../lib/festivals';
import { fetchAbout, type AboutInfo } from '../lib/nearby';
import { spotCards, type ExploreCard } from '../lib/explore';
import { useAuth } from '../lib/auth';
import TourSpots from './TourSpots';
import SpotDetail, { type SpotTarget } from './SpotDetail';
import { useWishItem } from './MapChoice';
import { REGION_BY_CODE } from '../lib/geo';

/**
 * 지역 여행정보 (아내 의견 11-21: 처음 보는 곳은 이름·지도만으론 가고 싶은지 알 수 없다)
 * 위에서부터: 요즘 꼬리표 → 한 줄 테마 → 볼거리·먹거리·맛집·카페 사진 카드(누르면 '알아보기' 창: 사진 여러 장·소개·후기·영상)
 * → 곧 열리는 축제 → 함께 많이 찾는 곳 → 맨 아래 가는 길·편하게 → 더보기(특산물·교통·구·군)
 */
export default function RegionInfo({ code }: { code: string }) {
  const info = useTravelInfo();
  const trend = useTrend();
  const auth = useAuth();
  const fest = useFestivals();
  const wi = useWishItem();
  const [more, setMore] = useState(false);
  const [tour, setTour] = useState<TourCell | null>(null);
  const [about, setAbout] = useState<Record<string, AboutInfo>>({});
  const [detail, setDetail] = useState<SpotTarget | null>(null);
  const cell = info?.cells[code];
  const area = REGION_BY_CODE.get(code)?.name ?? '';
  const here = { t: 'kr' as const, code };
  useEffect(() => {
    let on = true;
    setTour(null);
    loadTour().then((d) => on && setTour(d?.cells[code] ?? null), () => {});
    return () => { on = false; };
  }, [code]);
  const spots = useMemo(() => (cell ? spotCards(cell.main.spots, tour?.s ?? []) : []), [cell, tour]);
  const foods = cell?.main.foods ?? [];
  // 사진이 없는 볼거리와 먹거리만 '어떤 곳·어떤 음식인지' 한 번에 묻는다 (위키백과, 지역 창 하나에 한 번)
  const ask = useMemo(() => [...spots.filter((s) => !s.img).map((s) => s.name), ...foods].join('|'), [spots, foods]);
  const user = auth.status === 'ready' ? auth.user : null;
  useEffect(() => {
    let on = true;
    setAbout({});
    if (ask) void fetchAbout(user, ask.split('|'), area).then((x) => on && setAbout(x));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask, area, user?.uid]);
  if (!info || !cell) return null;
  const m = cell.main;
  const tags = trendTags(code, trend);
  const shops = (tour?.f ?? []).filter((r) => r[3]).slice(0, 10);
  const festivals = upcomingFestivals(fest, code).slice(0, 6);
  const line = (label: string, items: string[]) =>
    items.length ? <div className="info-line"><span className="k">{label}</span><span>{items.join(' · ')}</span></div> : null;
  const open = (t: Omit<SpotTarget, 'place' | 'area'> & { area?: string }) => setDetail({ area, place: here, ...t });
  const openSpot = (c: ExploreCard) => open({ name: c.name, img: c.img, lat: c.lat, lng: c.lng, crowd: crowdOf(code, trend, c.name), kind: 'spot', about: about[c.name] });
  const openFood = (f: string, where = area) => open({ name: f, area: where, kind: 'food', about: about[f], foods: tour?.f });
  // 구·군 안의 볼거리·먹거리 (더보기): 이름 칩, 누르면 같은 '알아보기' 창
  const tapLine = (label: '볼거리' | '먹거리', items: string[], where: string) =>
    items.length ? (
      <div className="info-line"><span className="k">{label}</span>
        <span className="tap-items">{items.map((x) => <button key={x} type="button" className="tap-item" onClick={() => (label === '먹거리' ? openFood(x, where) : open({ name: x, area: where, kind: 'spot', about: about[x] }))}>{x}</button>)}</span>
      </div>
    ) : null;
  const heart = (name: string, kind: 'spot' | 'food') => {
    const on = wi.has(here, name, kind);
    return <button type="button" className={'tour-heart' + (on ? ' on' : '')} aria-pressed={on} aria-label={on ? `${name} 담겨 있어요` : `${name} 가고 싶어요`} disabled={on || wi.saving === name} onClick={() => wi.add(here, name, kind)}>{on ? '♥' : '♡'}</button>;
  };
  const card = (name: string, img: string | undefined, sub: string | undefined, onTap: () => void, kind: 'spot' | 'food' | null, testid: string) => (
    <span key={name} className="tour-cell">
      <button type="button" className="tour-card explore-card" onClick={onTap} data-testid={testid}>
        <span className="tour-pic">
          {img ? <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="explore-ph" aria-hidden="true">{name.slice(0, 1)}</span>}
        </span>
        <span className="explore-name">{name}</span>
        {sub && <span className="explore-sub">{sub}</span>}
      </button>
      {kind && heart(name, kind)}
    </span>
  );
  // 사진이 있는 곳은 카드 줄로 앞에, 사진이 없는 곳은 큰 글자 네모 대신 '이름 · 한 줄' 작은 줄로 (사용자 의견 11-22)
  type Item = { name: string; img?: string; sub?: string; tap: () => void; kind: 'spot' | 'food' | null };
  const rows = (items: Item[], testid: string) => {
    const pics = items.filter((x) => x.img);
    const rest = items.filter((x) => !x.img);
    return (
      <>
        {pics.length > 0 && <div className="tour-strip">{pics.map((x) => card(x.name, x.img, x.sub, x.tap, x.kind, testid))}</div>}
        {rest.length > 0 && (
          <div className="explore-list">
            {rest.map((x) => (
              <span key={x.name} className="explore-li">
                <button type="button" onClick={x.tap} data-testid={testid}>
                  <b>{x.name}</b>{x.sub && <span>{x.sub}</span>}
                </button>
                {x.kind && heart(x.name, x.kind)}
              </span>
            ))}
          </div>
        )}
      </>
    );
  };
  const firstLine = (a?: AboutInfo) => a?.short.split(/(?<=[.!?])\s/)[0]?.replace(/^.*?(은|는|이란)\s/, '').slice(0, 40);

  return (
    <div className="region-info" data-testid="region-info">
      {tags.length > 0 && (
        <div className="trend-tags" data-testid="trend-tags">
          {tags.map((t) => <span key={t.k} className={`chip trend-${t.k}`}>{t.t}{t.why && <small> · {t.why}</small>}</span>)}
          {trendAt(trend) && <span className="tiny muted">{trendAt(trend)}</span>}
        </div>
      )}
      <div className="info-theme">{m.theme}</div>

      {spots.length > 0 && (
        <section className="explore-row" data-testid="explore-spots">
          <div className="explore-head"><b>볼거리</b><span>누르면 사진·소개·후기</span></div>
          {rows(spots.map((c) => ({ name: c.name, img: c.img ?? about[c.name]?.img, sub: firstLine(about[c.name]), tap: () => openSpot(c), kind: 'spot' as const })), 'explore-card')}
        </section>
      )}
      {foods.length > 0 && (
        <section className="explore-row" data-testid="explore-foods">
          <div className="explore-head"><b>먹거리</b><span>어떤 음식인지 · 어디서 먹는지</span></div>
          {rows(foods.map((f) => ({ name: f, img: about[f]?.img, sub: firstLine(about[f]), tap: () => openFood(f), kind: 'food' as const })), 'explore-food')}
        </section>
      )}
      {shops.length > 0 && (
        <section className="explore-row" data-testid="explore-shops">
          <div className="explore-head"><b>맛집·카페</b><span>한국관광공사</span></div>
          <div className="tour-strip">
            {shops.map(([n, lat, lng, img]) => card(n, img, undefined, () => open({ name: n, lat, lng, img, kind: 'shop' }), null, 'explore-shop'))}
          </div>
        </section>
      )}
      {festivals.length > 0 && (
        <section className="explore-row" data-testid="explore-festivals">
          <div className="explore-head"><b>곧 열리는 축제</b><span>누르면 검색</span></div>
          <div className="trend-chips">
            {festivals.map((f) => (
              <a key={f.id} className="chip trend-chip" href={`https://search.naver.com/search.naver?query=${encodeURIComponent(f.t)}`} target="_blank" rel="noopener noreferrer">{f.t} <small>{festivalPeriod(f)}</small></a>
            ))}
          </div>
        </section>
      )}

      <TourSpots code={code} />
      <div className="region-foot">
        <div className="hub-way-rows region-ways"><DirectWays code={code} /></div>
        {accessLine(here) && <div className="info-line" data-testid="region-access"><span className="k">가는 길</span><span>{accessLine(here)}</span></div>}
        {tour && tour.easy > 0 && <div className="info-line" data-testid="tour-easy"><span className="k">편하게</span><span>휠체어·유모차로 다니기 편한 관광지 {tour.easy}곳</span></div>}
      </div>
      {more && (
        <>
          {line('특산물', m.goods)}
          {line('교통', m.transport)}
          {m.note && <div className="info-line"><span className="k">참고</span><span>{m.note}</span></div>}
          {cell.subs.length > 0 && (
            <div className="info-subs">
              {cell.subs.map((s) => (
                <details key={s.name}>
                  <summary><b>{s.name}</b> <span className="muted">{s.theme}</span></summary>
                  {tapLine('볼거리', s.spots, `${area} ${s.name}`)}
                  {tapLine('먹거리', s.foods, `${area} ${s.name}`)}
                  {line('특산물', s.goods)}
                  {line('교통', s.transport)}
                  {s.note && <div className="info-line"><span className="k">참고</span><span>{s.note}</span></div>}
                </details>
              ))}
            </div>
          )}
          <div className="tiny muted" style={{ marginTop: 6 }}>보라핀 여행정보 · {info.updated} 확인</div>
        </>
      )}
      {(m.goods.length > 0 || m.transport.length > 0 || cell.subs.length > 0) && (
        <button className="link-btn" onClick={() => setMore(!more)} aria-expanded={more}>
          {more ? '접기' : cell.subs.length ? `더보기 · ${cell.subs.length}개 구·군·섬` : '더보기'}
        </button>
      )}
      {detail && <SpotDetail spot={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
