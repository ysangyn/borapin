import { useEffect, useState } from 'react';
import { crowdOf, kakaoSearchUrl, loadTour, relatedOf, useTrend, type TourCell } from '../lib/trend';

/**
 * 관광공사 관광지(사진·자리)와 무장애 관광지 수. 자료는 지역 창을 열 때만 받는다.
 * 요즘 자료(src/data/trend.json)가 있으면 사진 카드에 붐빔('붐벼요'·'한적') 칩, 아래에 '같이 가면 좋은 곳' 칩 묶음. 없으면 아무것도 안 보인다
 */
export default function TourSpots({ code }: { code: string }) {
  const [cell, setCell] = useState<TourCell | null>(null);
  const [bad, setBad] = useState<Set<string>>(new Set());
  const trend = useTrend();
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
                <a key={n} className="tour-card" href={`https://map.kakao.com/link/map/${encodeURIComponent(n)},${lat},${lng}`} target="_blank" rel="noreferrer">
                  <span className="tour-pic">
                    <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad((b) => new Set(b).add(n))} />
                    {crowd && crowd !== '보통' && <span className={`tag crowd-tag ${crowd === '붐벼요' ? 'busy' : 'calm'}`} data-testid="tour-crowd">{crowd}</span>}
                  </span>
                  <span>{n}</span>
                </a>
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
              <a key={x.n} className="chip trend-chip" href={kakaoSearchUrl(`${x.m} ${x.n}`)} target="_blank" rel="noreferrer">{x.n}</a>
            ))}
          </div>
        </div>
      )}
      {cell && cell.easy > 0 && <div className="info-line" data-testid="tour-easy"><span className="k">편하게</span><span>휠체어·유모차로 다니기 편한 관광지 {cell.easy}곳 (무장애 정보)</span></div>}
    </div>
  );
}
