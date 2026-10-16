import { useEffect, useState } from 'react';
import { useToast } from './ui';
import { CARD_KINDS, drawCard, shareOrSave, type CardKind } from '../lib/shareCard';
import { useTravelInfo } from '../lib/travelinfo';
import { useAllNotes } from '../lib/tripExtras';
import type { Trip } from '../lib/types';
import { spaceTitle } from '../lib/members';

/** 공유카드 7종: 골라서 미리 보고, 휴대폰 공유창으로 보내거나 저장 */
export default function ShareCards({ trips, year }: { trips: Trip[]; year: number }) {
  const info = useTravelInfo();
  const toast = useToast();
  const [kind, setKind] = useState<CardKind | null>(null);
  // 글은 '메모 인용' 카드를 고를 때만 받는다 (읽기 횟수 절약)
  const notes = useAllNotes(kind === 'quote');
  const [img, setImg] = useState<{ url: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!kind) return;
    let alive = true;
    setBusy(true);
    drawCard(kind, { trips, notes: notes ?? [], info, year, space: spaceTitle() })
      .then((blob) => {
        if (!alive) return;
        setImg((old) => {
          if (old) URL.revokeObjectURL(old.url);
          return { url: URL.createObjectURL(blob), blob };
        });
      })
      .catch((e) => toast((e as Error).message))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, trips, notes, info, year]);

  const label = CARD_KINDS.find((c) => c.k === kind)?.label ?? '';
  return (
    <section data-testid="share-cards">
      <h2 className="h2" style={{ marginBottom: 6 }}>공유 카드</h2>
      <div className="chips">
        {CARD_KINDS.map((c) => (
          <button key={c.k} className={'chip' + (kind === c.k ? ' on' : '')} onClick={() => setKind(c.k)}>{c.label}</button>
        ))}
      </div>
      {kind && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <div className="share-preview">{img ? <img src={img.url} alt={`${label} 공유 카드`} data-testid="card-img" /> : <span className="small muted">만드는 중…</span>}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} disabled={!img || busy} onClick={async () => img && (await shareOrSave(img.blob, `보라핀_${label}.png`)) === 'saved' && toast('그림을 저장했어요')}>공유하기</button>
          </div>
        </div>
      )}
    </section>
  );
}
