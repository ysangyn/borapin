import { useMemo, useState } from 'react';
import type { MapMode } from '../components/MapView';
import MapView from '../components/LazyMap';
import PlaceSheet from '../components/PlaceSheet';
import { computeStats, TOTAL_CELLS, TOTAL_GROUPS, useTrips } from '../lib/data';
import { CONTINENTS } from '../lib/geo';
import type { Place } from '../lib/types';

export default function MapPage() {
  const { trips } = useTrips();
  const [mode, setMode] = useState<MapMode>('kr');
  const [sel, setSel] = useState<Place | null>(null);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);

  return (
    <div className="map-full" style={{ bottom: 'calc(var(--nav-h) + var(--safe-b))' }}>
      <MapView
        mode={mode} stats={stats} height="100%" legend selected={sel} onSelect={(p) => setSel(p)}
        controlsTop={112} legendBottom={sel ? 300 : 14} className="full"
      />
      <div className="map-top">
        <div className="seg dark floating" role="tablist" style={{ alignSelf: 'flex-start', borderRadius: 14 }}>
          <button role="tab" aria-selected={mode === 'kr'} className={mode === 'kr' ? 'on' : ''} onClick={() => { setMode('kr'); setSel(null); }}>국내</button>
          <button role="tab" aria-selected={mode === 'world'} className={mode === 'world' ? 'on' : ''} onClick={() => { setMode('world'); setSel(null); }}>세계</button>
        </div>
        {stats && (
          <div className="chips" data-testid="map-stats">
            {mode === 'kr' ? (
              <>
                <span className="chip floating" style={{ border: 'none' }}>시·군 <b style={{ color: 'var(--violet)' }}>{stats.cellVisits.size}</b>/{TOTAL_CELLS}</span>
                <span className="chip floating" style={{ border: 'none' }}>광역 <b style={{ color: 'var(--violet)' }}>{stats.groupsVisited.size}</b>/{TOTAL_GROUPS}</span>
                {stats.cellPlanned.size > 0 && <span className="chip floating" style={{ border: 'none' }}>예정 {stats.cellPlanned.size}</span>}
              </>
            ) : (
              <>
                <span className="chip floating" style={{ border: 'none' }}>나라 <b style={{ color: 'var(--violet)' }}>{stats.countryVisits.size}</b></span>
                <span className="chip floating" style={{ border: 'none' }}>도시 <b style={{ color: 'var(--violet)' }}>{stats.cities.size}</b></span>
                <span className="chip floating" style={{ border: 'none' }}>대륙 <b style={{ color: 'var(--violet)' }}>{stats.continents.size}</b>/{CONTINENTS.length}</span>
              </>
            )}
          </div>
        )}
      </div>

      {sel && trips && <PlaceSheet place={sel} trips={trips} stats={stats} onClose={() => setSel(null)} />}
    </div>
  );
}
