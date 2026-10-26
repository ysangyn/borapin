import { useEffect, useState } from 'react';
import { crowdOf, loadTour, relatedOf, useTrend, type TourCell } from '../lib/trend';
import { REGION_BY_CODE } from '../lib/geo';
import { useMapChoice, useWishItem } from './MapChoice';

/**
 * 관광공사 관광지(사진·자리)와 무장애 관광지 수. 자료는 지역 창을 열 때만 받는다.
 * 요즘 자료(src/data/trend.json)가 있으면 사진 카드에 붐빔('붐벼요'·'한적') 칩, 아래에 '같이 가면 좋은 곳' 칩 묶음. 없으면 아무것도 안 보인다
 */
export default function TourSpots({ code }: { code: string }) {
  const [cell, setCell] = useState<TourCell | null>(null);
  const [bad, setBad] = useState<Set<string>>(new Set());
  const trend = useTrend();
  const [openMap, mapChoice] = useMapChoice();
  const wi = useWishItem();
  const here = { t: 'kr' as const, code };
  const area = REGION_BY_CODE.get(code)?.name ?? '';
  useEffect(() => {
    let on = true;
    setCell(null);
    loadTour().then((d) => on && setCell(d?.cells[code] ?? null), () => {});
    return () => { on = false; };
  }, [code]);
  const related = relatedOf(code, trend);
  const spots = cell?.s ?? [];
  if (!spots.length && !related.length) return null;
  const shown = spots.filter((x) => x[3] && !bad.has(x[0])).slice(0, 8);
  return (
    <div className="tour-spots" data-testid="tour-spots">
      {spots.length > 0 && (
        <>
          <div className="info-line"><span className="k">관광지</span><span className="tiny muted">한국관광공사 · 누르면 지도</span></div>
          <div className="tour-strip">
            {shown.map(([n, lat, lng, img]) => {
              const crowd = crowdOf(code, trend, n);
              return (
                <span key={n} className="tour-cell">
                <button type="button" className="tour-card" onClick={() => openMap({ name: n, area, lat, lng, wish: { place: here, kind: 'spot' } })}>
                  <span className="tour-pic">
                    <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad((b) => new Set(b).add(n))} />
                    {crowd && crowd !== '보통' && <span className={`tag crowd-tag ${crowd === '붐벼요' ? 'busy' : 'calm'}`} data-testid="tour-crowd">{crowd}</span>}
                  </span>
                  <span>{n}</span>
                </button>
                {(() => { const on = wi.has(here, n, 'spot'); return (
                  <button type="button" className={'tour-heart' + (on ? ' on' : '')} aria-pressed={on} aria-label={on ? `${n} 담겨 있어요` : `${n} 가고 싶어요`} disabled={on || wi.saving === n} onClick={() => wi.add(here, n, 'spot')} data-testid="tour-heart">{on ? '♥' : '♡'}</button>
                ); })()}
                </span>
              );
            })}
          </div>
        </>
      )}
      {related.length > 0 && (
        <div className="trend-related" data-testid="trend-related">
          <div className="info-line"><span className="k">같이</span><span className="tiny muted">같이 가면 좋은 곳 · 요즘 함께 많이 찾아요 · 누르면 지도</span></div>
          <div className="trend-chips">
            {related.map((x) => (
              <button type="button" key={x.n} className="chip trend-chip" onClick={() => openMap({ name: x.n, area: x.m })}>{x.n}</button>
            ))}
          </div>
        </div>
      )}
      {mapChoice}
      {cell && cell.easy > 0 && <div className="info-line" data-testid="tour-easy"><span className="k">편하게</span><span>휠체어·유모차로 다니기 편한 관광지 {cell.easy}곳 (무장애 정보)</span></div>}
    </div>
  );
}
