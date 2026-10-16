import { photoForPlace } from '../lib/media';
import { Link } from 'react-router-dom';
import { josa } from 'es-hangul';
import type { Trip } from '../lib/types';
import { dday, formatWhen, nightsDays } from '../lib/dates';
import { placeLabel, placeLong, REGION_BY_CODE, COUNTRY_BY_ID, areaShort } from '../lib/geo';
import { isMemberName } from '../lib/members';

export function tileText(t: Trip): string {
  const p = t.places[0];
  if (!p) return '?';
  if (p.t === 'kr') {
    const r = REGION_BY_CODE.get(p.code);
    return r ? areaShort(r) : '국내';
  }
  return COUNTRY_BY_ID.get(p.id)?.name.slice(0, 4) ?? '해외';
}

export function tripSubtitle(t: Trip): string {
  const where = t.places.length > 1 ? `${placeLong(t.places[0])} 외 ${t.places.length - 1}곳` : t.places[0] ? placeLong(t.places[0]) : '';
  const nd = nightsDays(t.when);
  return [where, formatWhen(t.when), nd].filter(Boolean).join(' · ');
}

export default function TripRow({ trip }: { trip: Trip }) {
  const abroad = trip.places.length > 0 && trip.places.every((p) => p.t === 'country');
  const cls = 'trip-tile' + (trip.status === 'planned' ? ' planned' : abroad ? ' abroad' : '');
  const others = trip.companions.filter((c) => !isMemberName(c));
  return (
    <Link to={`/trips/${trip.id}`} className="trip-row" data-testid="trip-row">
      {(() => { const ph = trip.places[0] ? photoForPlace(trip.places[0]) : null; return ph
        ? <span className={cls + ' photo'}><img src={ph.src.s} alt="" loading="lazy" decoding="async" />{trip.status === 'planned' && <span className="tile-mark">예정</span>}</span>
        : <span className={cls}>{tileText(trip)}</span>; })()}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span className="t">{trip.title || placeLabel(trip.places[0])}</span>
        <span className="s">{tripSubtitle(trip)}</span>
        {(others.length > 0 || trip.kind === 'outing' || trip.status === 'planned') && (
          <span className="chips" style={{ gap: 4 }}>
            {trip.status === 'planned' && <span className="tag violet">{dday(trip.when) ?? '예정'}</span>}
            {trip.kind === 'outing' && <span className="tag">나들이</span>}
            {others.length > 0 && <span className="tag coral">{josa(others.join('·'), '와/과')} 함께</span>}
          </span>
        )}
      </span>
    </Link>
  );
}
