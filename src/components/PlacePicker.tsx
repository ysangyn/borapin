import { useMemo, useState } from 'react';
import { searchPlaces, placeLong, COUNTRY_BY_ID } from '../lib/geo';
import type { Place } from '../lib/types';
import { Icon } from './ui';

function samePlace(a: Place, b: Place) {
  if (a.t !== b.t) return false;
  return a.t === 'kr' ? a.code === (b as typeof a).code : a.id === (b as typeof a).id && (a.city ?? '') === ((b as typeof a).city ?? '');
}

export default function PlacePicker({ value, onChange }: { value: Place[]; onChange: (v: Place[]) => void }) {
  const [q, setQ] = useState('');
  const [cityFor, setCityFor] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const hits = useMemo(() => searchPlaces(q, 8), [q]);

  const add = (p: Place) => {
    if (!value.some((v) => samePlace(v, p))) onChange([...value, p]);
    setQ('');
    if (p.t === 'country') setCityFor(p.id);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const addCity = () => {
    if (!cityFor || !city.trim()) return;
    const without = value.filter((v) => !(v.t === 'country' && v.id === cityFor && !v.city));
    const p: Place = { t: 'country', id: cityFor, city: city.trim() };
    if (!without.some((v) => samePlace(v, p))) onChange([...without, p]);
    setCity('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.length > 0 && (
        <div className="chips">
          {value.map((p, i) => (
            <button key={i} type="button" className="chip soft-on" onClick={() => remove(i)} aria-label={`${placeLong(p)} 빼기`}>
              <Icon name="pin" size={14} stroke={2} />
              {placeLong(p)}
              <Icon name="x" size={13} stroke={2.4} />
            </button>
          ))}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: 13, color: 'var(--ink3)' }}><Icon name="search" size={18} stroke={2} /></span>
        <input
          className="input"
          style={{ paddingLeft: 38 }}
          placeholder="강릉, ㄱㄹ, 일본, 교토…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="어디 검색"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && hits[0]) {
              e.preventDefault();
              add(hits[0].place);
            }
          }}
        />
      </div>
      {q && (
        <div className="picker-results" role="listbox">
          {hits.length === 0 && <div className="small muted" style={{ padding: 12 }}>찾는 곳이 없어요. 다르게 적어 볼까요?</div>}
          {hits.map((h, i) => (
            <button key={i} type="button" role="option" onClick={() => add(h.place)}>
              <span style={{ fontWeight: 700 }}>{h.label}</span>
              <span className="tiny muted">{h.sub}</span>
            </button>
          ))}
        </div>
      )}
      {cityFor && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="input"
            placeholder={`${COUNTRY_BY_ID.get(cityFor)?.name ?? ''}의 도시 (선택, 예: 교토)`}
            aria-label="도시 이름"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                addCity();
              }
            }}
          />
          <button type="button" className="btn soft sm" style={{ height: 46 }} onClick={addCity}>도시 넣기</button>
        </div>
      )}
    </div>
  );
}
