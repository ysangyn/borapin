import { useEffect, useRef, useState } from 'react';
import { Icon, useToast } from './ui';
import { useAuth, displayName } from '../lib/auth';
import { createPlace, reviewPlace } from '../lib/data';
import { captionPhoto, uploadPhoto } from '../lib/photos';
import { updatePlan } from '../lib/tripExtras';
import { arriveKind } from '../lib/today';
import type { PlanItem, Trip, Verdict } from '../lib/types';

const VERDICTS: { v: Verdict; label: string }[] = [
  { v: 'again', label: '또 올래요' },
  { v: 'once', label: '한 번이면 충분' },
  { v: 'meh', label: '별로' },
];

/**
 * 도착했어요 (여행 중 '오늘'): 다녀옴 표시 + 사진 한두 장 + 어땠어요 + 한 줄을 한 번에.
 * 사진은 그 여행 사진으로(캡션 = 곳 이름), 어땠어요·한 줄은 연결된 가게 기록에(없으면 다녀온 곳으로 새로) 남긴다.
 */
export default function ArriveSheet({ trip, item, onClose }: { trip: Trip; item: PlanItem; onClose: () => void }) {
  const auth = useAuth();
  const toast = useToast();
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const [files, setFiles] = useState<File[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [line, setLine] = useState('');
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const previews = useRef<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    previews.current.forEach((u) => URL.revokeObjectURL(u));
    previews.current = files.map((f) => URL.createObjectURL(f));
    setUrls(previews.current);
  }, [files]);
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !saving) onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose, saving]);

  const save = async () => {
    if (auth.status !== 'ready' || saving) return;
    setSaving(true);
    try {
      await updatePlan(item.id, { done: true });
      const text = line.trim().slice(0, 200);
      if (verdict || text) {
        if (item.recId) {
          await reviewPlace(item.recId, trip.id, me, verdict, text);
        } else if (trip.places[0] && item.kind !== 'stay') {
          const id = await createPlace({
            name: item.name.slice(0, 80), kind: arriveKind(item.kind), region: trip.places[0], status: 'been', tripId: trip.id,
            reviews: text && me ? { [me]: text } : {}, verdict,
            ...(item.lat != null && item.lng != null ? { lat: item.lat, lng: item.lng } : {}),
          }, auth.user);
          await updatePlan(item.id, { recId: id });
        }
      }
      let up = 0;
      for (const f of files.slice(0, 6)) {
        try { const p = await uploadPhoto(f, trip.id, auth.user); await captionPhoto(p.id, item.name.slice(0, 80)); up++; } catch { /* 한 장 실패는 건너뛴다 */ }
      }
      toast(up ? `${item.name} 도착했어요 · 사진 ${up}장 남겼어요` : `${item.name} 도착했어요`);
      onClose();
    } catch {
      toast('남기지 못했어요. 잠시 뒤 다시 해 주세요');
      setSaving(false);
    }
  };

  return (
    <div className="arrive-scrim" onClick={() => { if (!saving) onClose(); }}>
      <div className="arrive-sheet" role="dialog" aria-modal="true" aria-label={`${item.name} 도착`} onClick={(e) => e.stopPropagation()} data-testid="arrive-sheet">
        <span className="arrive-grip" aria-hidden="true" />
        <span className="small" style={{ color: 'var(--green-ink, #1E7A4A)', fontWeight: 700 }}>도착했어요</span>
        <b className="jua" style={{ fontSize: 24 }}>{item.name}</b>
        <span className="small muted">지금 남기면 나중에 여행책에 그대로 들어가요</span>

        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) setFiles((x) => [...x, ...f].slice(0, 6)); e.target.value = ''; }} data-testid="arrive-files" />
        <div className="arrive-photos">
          <button type="button" className="arrive-add" onClick={() => input.current?.click()} data-testid="arrive-pick"><Icon name="camera" size={24} />사진</button>
          {urls.map((u, i) => (
            <button key={u} type="button" className="arrive-thumb" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`${i + 1}번째 사진 빼기`}><img src={u} alt="" /><span>빼기</span></button>
          ))}
        </div>

        <div className="field">
          <span className="label">어땠어요?</span>
          <div className="chips" role="radiogroup" aria-label="어땠어요">
            {VERDICTS.map((x) => <button key={x.v} type="button" role="radio" aria-checked={verdict === x.v} className={'chip' + (verdict === x.v ? ' on' : '')} onClick={() => setVerdict(verdict === x.v ? null : x.v)} data-testid={`arrive-verdict-${x.v}`}>{x.label}</button>)}
          </div>
        </div>
        <label className="field">
          <span className="label">한 줄 <span className="muted small">(안 써도 돼요)</span></span>
          <input className="input" value={line} onChange={(e) => setLine(e.target.value)} placeholder="예: 유리 바닥 아래 강이 반짝반짝" maxLength={200} data-testid="arrive-line" />
        </label>

        <button className="btn primary block" disabled={saving} onClick={save} data-testid="arrive-save">{saving ? '남기는 중…' : '남기기'}</button>
        <button className="link-btn" style={{ alignSelf: 'center' }} disabled={saving} onClick={onClose}>나중에 할게요</button>
      </div>
    </div>
  );
}
