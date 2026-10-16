import { useEffect, useMemo, useState } from 'react';
import MapView from './LazyMap';
import type { MapMode } from './MapView';
import { computeStats } from '../lib/data';
import type { Trip } from '../lib/types';

/** 지도 다시 보기: 연도를 넘기면 지도가 채워지던 순서가 재생된다 */
export default function MapReplay({ trips }: { trips: Trip[] }) {
  const done = useMemo(() => trips.filter((t) => t.status === 'done' && t.when.y), [trips]);
  const years = useMemo(() => [...new Set(done.map((t) => t.when.y!))].sort((a, b) => a - b), [done]);
  const [i, setI] = useState(Math.max(0, years.length - 1));
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<MapMode>('kr');
  useEffect(() => setI(Math.max(0, years.length - 1)), [years.length]);
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setI((x) => {
      if (x >= years.length - 1) { setPlaying(false); return x; }
      return x + 1;
    }), 1100);
    return () => window.clearInterval(t);
  }, [playing, years.length]);
  const y = years[i];
  const stats = useMemo(() => computeStats(done.filter((t) => t.when.y! <= y)), [done, y]);
  const newThisYear = useMemo(() => {
    const before = computeStats(done.filter((t) => t.when.y! < y));
    return [...stats.cellVisits.keys()].filter((c) => !before.cellVisits.has(c)).length + [...stats.countryVisits.keys()].filter((c) => !before.countryVisits.has(c)).length;
  }, [done, y, stats]);

  if (years.length < 2) {
    return <div className="small muted">두 해 이상 기록이 쌓이면, 지도가 채워지던 순서를 다시 볼 수 있어요.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="replay">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div>
          <b style={{ fontSize: 22 }} data-testid="replay-year">{y}</b>
          <span className="small muted"> · 시·군 {stats.cellVisits.size} · 나라 {stats.countryVisits.size}{newThisYear ? ` · 새로 ${newThisYear}곳` : ''}</span>
        </div>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={mode === 'kr'} className={mode === 'kr' ? 'on' : ''} onClick={() => setMode('kr')}>국내</button>
          <button role="tab" aria-selected={mode === 'world'} className={mode === 'world' ? 'on' : ''} onClick={() => setMode('world')}>세계</button>
        </div>
      </div>
      <MapView mode={mode} stats={stats} height={250} controls={false} cooperative />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn sm" onClick={() => { if (i >= years.length - 1) setI(0); setPlaying(!playing); }} data-testid="replay-play" aria-label={playing ? '멈추기' : '재생'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <input type="range" min={0} max={years.length - 1} value={i} onChange={(e) => { setPlaying(false); setI(+e.target.value); }} aria-label="연도" style={{ flex: 1 }} />
      </div>
    </div>
  );
}
