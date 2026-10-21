import { useEffect, useState } from 'react';

/** 관광공사 관광지(사진·자리)와 무장애 관광지 수. 자료는 지역 창을 열 때만 받는다 */
type Cell = { s: [string, number, number, string][]; easy: number };
let cache: Promise<{ updated: string; cells: Record<string, Cell> }> | null = null;
const load = () => (cache ??= import('../data/tour.json').then((m) => m.default as never));

export default function TourSpots({ code }: { code: string }) {
  const [cell, setCell] = useState<Cell | null>(null);
  const [bad, setBad] = useState<Set<string>>(new Set());
  useEffect(() => { let on = true; load().then((d) => on && setCell(d.cells[code] ?? null), () => {}); return () => { on = false; }; }, [code]);
  if (!cell || !cell.s.length) return null;
  const shown = cell.s.filter((x) => x[3] && !bad.has(x[0])).slice(0, 8);
  return (
    <div className="tour-spots" data-testid="tour-spots">
      <div className="info-line"><span className="k">관광지</span><span className="tiny muted">한국관광공사 · 누르면 지도</span></div>
      <div className="tour-strip">
        {shown.map(([n, lat, lng, img]) => (
          <a key={n} className="tour-card" href={`https://map.kakao.com/link/map/${encodeURIComponent(n)},${lat},${lng}`} target="_blank" rel="noreferrer">
            <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad((b) => new Set(b).add(n))} />
            <span>{n}</span>
          </a>
        ))}
      </div>
      {cell.easy > 0 && <div className="info-line" data-testid="tour-easy"><span className="k">편하게</span><span>휠체어·유모차로 다니기 편한 관광지 {cell.easy}곳 (무장애 정보)</span></div>}
    </div>
  );
}
