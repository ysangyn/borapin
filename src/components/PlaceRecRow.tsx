import { Link } from 'react-router-dom';
import { KIND_LABEL, VERDICT_LABEL } from '../lib/placeRecs';
import { placeLong } from '../lib/geo';
import type { PlaceRec } from '../lib/types';

/** 우리 장소 한 줄: 종류 · 이름 · 평가 · 둘의 한 줄 평 */
export default function PlaceRecRow({ rec, showRegion }: { rec: PlaceRec; showRegion?: boolean }) {
  const reviews = Object.entries(rec.reviews ?? {}).filter(([, v]) => v);
  return (
    <Link to={`/places/${rec.id}`} className="rec-row" data-testid="place-rec">
      <span className={`kind-badge k-${rec.kind}`}>{KIND_LABEL[rec.kind]}</span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <b className="rec-name">{rec.name}</b>
          {rec.verdict && <span className={`tag verdict v-${rec.verdict}`}>{VERDICT_LABEL[rec.verdict]}</span>}
        </span>
        {showRegion && <span className="tiny muted">{placeLong(rec.region)}</span>}
        {reviews.map(([who, text]) => (
          <span key={who} className="small" style={{ color: 'var(--ink2)' }}><b className="tiny" style={{ color: 'var(--ink3)' }}>{who}</b> {text}</span>
        ))}
      </span>
    </Link>
  );
}
