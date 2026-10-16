import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MapMode } from '../components/MapView';
import MapView from '../components/LazyMap';
import PlaceSheet from '../components/PlaceSheet';
import { computeStats, TOTAL_CELLS, TOTAL_GROUPS, usePlaces, useTrips, useWishes } from '../lib/data';
import { useWishFlags } from '../lib/wishFlags';
import { usePlaceSpots } from '../lib/placeSpots';
import { CONTINENTS, parsePlaceParam } from '../lib/geo';
import type { Place } from '../lib/types';

export default function MapPage() {
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const { places: recs } = usePlaces();
  const [sp] = useSearchParams();
  const initial = useMemo(() => parsePlaceParam(sp.get('sel'))[0] ?? null, [sp]);
  const [mode, setMode] = useState<MapMode>(initial?.t === 'country' ? 'world' : 'kr');
  const [sel, setSel] = useState<Place | null>(initial);
  const flags = useWishFlags(wishes, trips);
  const spots = usePlaceSpots(recs ?? null);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);

  return (
    <div className="map-full" style={{ bottom: 'calc(var(--nav-h) + var(--safe-b))' }}>
      <MapView
        mode={mode} stats={stats} height="100%" legend selected={sel} onSelect={(p) => setSel(p)} flags={flags} spots={spots} flyTo={initial}
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
        {stats && !sel && stats.tripsDone === 0 && (
          <div className="chip floating map-coach" data-testid="map-coach">지역을 눌러 첫 핀을 꽂아 보세요</div>
        )}
      </div>

      {sel && trips && <PlaceSheet key={JSON.stringify(sel)} place={sel} trips={trips} stats={stats} wishes={wishes ?? []} recs={recs ?? []} onClose={() => setSel(null)} />}
    </div>
  );
}
