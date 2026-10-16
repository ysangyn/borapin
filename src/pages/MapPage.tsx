import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MapMode } from '../components/MapView';
import MapView from '../components/LazyMap';
import TripRow from '../components/TripRow';
import { Icon } from '../components/ui';
import { computeStats, TOTAL_CELLS, TOTAL_GROUPS, tripsAtPlace, useTrips } from '../lib/data';
import { COUNTRY_BY_ID, REGION_BY_CODE, regionLong, CONTINENTS } from '../lib/geo';
import type { Place } from '../lib/types';

function links(p: Place) {
  const q = p.t === 'kr' ? `${REGION_BY_CODE.get(p.code)?.sido ?? ''} ${REGION_BY_CODE.get(p.code)?.name ?? ''}` : COUNTRY_BY_ID.get(p.id)?.name ?? '';
  const enc = encodeURIComponent(q.trim());
  return { naver: `https://map.naver.com/p/search/${enc}`, google: `https://www.google.com/maps/search/?api=1&query=${enc}` };
}

export default function MapPage() {
  const { trips } = useTrips();
  const [mode, setMode] = useState<MapMode>('kr');
  const [sel, setSel] = useState<Place | null>(null);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);

  const selTrips = useMemo(() => {
    if (!sel || !trips) return [];
    return tripsAtPlace(trips, (p) => (sel.t === 'kr' ? p.t === 'kr' && p.code === sel.code : p.t === 'country' && p.id === sel.id));
  }, [sel, trips]);
  const selName = sel ? (sel.t === 'kr' ? regionLong(sel.code) : COUNTRY_BY_ID.get(sel.id)?.name ?? sel.id) : '';
  const visits = sel ? (sel.t === 'kr' ? stats?.cellVisits.get(sel.code) : stats?.countryVisits.get(sel.id)) ?? 0 : 0;

  return (
    <div className="map-full" style={{ bottom: 'calc(var(--nav-h) + var(--safe-b))' }}>
      <MapView
        mode={mode} stats={stats} height="100%" legend selected={sel} onSelect={(p) => setSel(p)}
        controlsTop={112} legendBottom={sel ? 270 : 14} className="full"
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

      {sel && (
        <div className="sheet" role="dialog" aria-label={selName} data-testid="region-sheet">
          <div className="grip" />
          <div className="row-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{selName}</div>
              <div className="small muted">{visits >= 2 ? `${visits}번 다녀왔어요` : visits === 1 ? '다녀왔어요' : '아직 안 가본 곳'}</div>
            </div>
            <button className="icon-btn" aria-label="닫기" onClick={() => setSel(null)}><Icon name="x" size={18} stroke={2.2} /></button>
          </div>
          <div className="list" style={{ marginTop: 6 }}>{selTrips.slice(0, 4).map((t) => <TripRow key={t.id} trip={t} />)}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Link to={`/record?place=${sel.t === 'kr' ? `kr:${sel.code}` : `country:${sel.id}`}`} className="btn sm" style={{ flex: 1.3 }}>
              <Icon name="plus" size={16} stroke={2.4} />다녀왔어요
            </Link>
            <a href={links(sel).naver} target="_blank" rel="noreferrer" className="btn sm ghost" style={{ flex: 1 }}>네이버지도</a>
            <a href={links(sel).google} target="_blank" rel="noreferrer" className="btn sm ghost" style={{ flex: 1 }}>구글지도</a>
          </div>
        </div>
      )}
    </div>
  );
}
