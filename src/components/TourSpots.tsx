import { relatedOf, useTrend } from '../lib/trend';

/**
 * 요즘 이 지역과 함께 많이 찾는 곳 (src/data/trend.json). 없으면 아무것도 안 보인다.
 * 관광공사 사진 카드·무장애 수는 지역 창의 볼거리·맨 아래로 옮겼다 (RegionInfo, 11-21)
 */
export default function TourSpots({ code }: { code: string }) {
  const trend = useTrend();
  const related = relatedOf(code, trend);
  if (!related.length) return null;
  return (
    <div className="tour-spots" data-testid="tour-spots">
      <div className="trend-related" data-testid="trend-related">
        <div className="explore-head"><b>함께 많이 찾는 곳</b><span>요즘 이 지역과 같이 가요 · 누르면 검색</span></div>
        <div className="trend-chips">
          {related.map((x) => (
            // 어떤 곳인지부터 알게: 지도 대신 네이버 검색(블로그·기사·리뷰)으로
            <a key={x.n} className="chip trend-chip" href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`${x.m ?? ''} ${x.n}`.trim())}`} target="_blank" rel="noopener noreferrer" data-testid="trend-chip">{x.n}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
