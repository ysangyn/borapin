import { useState } from 'react';
import { searchPlaces } from '../lib/geo';
import type { Place } from '../lib/types';
import { Icon } from './ui';

/**
 * 어디든 찾아보기 (사용자 의견 11-21: 지도에서 서산을 못 찾겠다)
 * 시·군·나라·도시 이름으로 찾아 고르면 onPick. 초성(ㅅㅅ)·다른 이름(타이페이)도 된다.
 */
export default function PlaceSearch({ onPick, className = '', placeholder = '어디로 가 볼까요? 서산, 교토…' }: { onPick: (p: Place) => void; className?: string; placeholder?: string }) {
  const [q, setQ] = useState('');
  const hits = q.trim() ? searchPlaces(q, 6) : [];
  const pick = (p: Place) => { setQ(''); (document.activeElement as HTMLElement | null)?.blur(); onPick(p); };
  return (
    <div className={'place-search ' + className} data-testid="place-search">
      <span className="place-search-ico" aria-hidden="true"><Icon name="search" size={18} stroke={2} /></span>
      <input
        className="input"
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        aria-label="지역 찾기"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && hits[0]) { e.preventDefault(); pick(hits[0].place); }
          if (e.key === 'Escape') setQ('');
        }}
      />
      {q.trim() && (
        <div className="picker-results place-search-results" role="listbox" aria-label="찾은 곳">
          {hits.length === 0 && <div className="small muted" style={{ padding: 12 }}>찾는 곳이 없어요. 다르게 적어 볼까요?</div>}
          {hits.map((h, i) => (
            <button key={i} type="button" role="option" aria-selected={i === 0} onClick={() => pick(h.place)}>
              <span style={{ fontWeight: 500 }}>{h.label}</span>
              <span className="tiny muted">{h.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
