import { useState } from 'react';
import { useToast } from './ui';
import PhotoImg from './PhotoImg';
import { useAuth } from '../lib/auth';
import { useTripPhotos } from '../lib/photos';
import { addNote, useNotes } from '../lib/tripExtras';
import { nightOf } from '../lib/today';
import type { PlanItem, Trip } from '../lib/types';

/**
 * 하루 끝 (여행 중 밤 8시 뒤 홈): 오늘 다닌 길·오늘 사진·둘이 남긴 오늘 한 줄·내일 첫 일정.
 * 한 줄은 그날 이야기(며칠째 글)로 남아 여행책에 날마다 묶인다.
 */
export default function NightCard({ trip, plan, day }: { trip: Trip; plan: PlanItem[]; day: string }) {
  const auth = useAuth();
  const toast = useToast();
  const photos = useTripPhotos(trip.id);
  const notes = useNotes(trip.id);
  const [line, setLine] = useState('');
  const [saving, setSaving] = useState(false);
  const n = nightOf(plan, photos ?? [], day);
  const lines = (notes ?? []).filter((x) => x.day === day && !x.openAt).slice(0, 4);

  const save = async () => {
    const text = line.trim();
    if (!text || auth.status !== 'ready' || saving) return;
    setSaving(true);
    try { await addNote(trip.id, text.slice(0, 500), auth.user, undefined, day); setLine(''); toast('오늘 한 줄을 남겼어요'); }
    catch { toast('남기지 못했어요'); }
    finally { setSaving(false); }
  };

  return (
    <section className="night-card" aria-label="오늘 하루" data-testid="night-card">
      <b className="jua night-title">오늘 하루, 이렇게 다녔어요</b>
      {n.photos.length > 0 && (
        <div className="night-photos">
          {n.photos.slice(0, 6).map((p, i) => (
            <span key={p.id} className="night-photo">
              <PhotoImg id={p.id} />
              {i === 5 && n.photos.length > 6 && <span className="more">+{n.photos.length - 6}</span>}
            </span>
          ))}
        </div>
      )}
      <span className="small night-route">{n.went.length ? n.went.map((p) => p.name).join(' → ') : '다녀온 곳의 동그라미를 누르면 오늘 다닌 길이 여기 모여요'}</span>
      {(n.went.length > 0 || n.photos.length > 0) && <span className="tiny night-sub">{n.went.length}곳 · 사진 {n.photos.length}장</span>}
      {lines.length > 0 && (
        <div className="night-lines">
          {lines.map((x) => <span key={x.id} className="night-line hand">{x.by.name} “{x.text}”</span>)}
        </div>
      )}
      <form className="night-form" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <label htmlFor="night-line" className="small" style={{ fontWeight: 700 }}>오늘을 한 줄로 남길까요?</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input id="night-line" className="input" value={line} onChange={(e) => setLine(e.target.value)} placeholder="예: 첫눈 같은 하루였다" maxLength={500} data-testid="night-line" />
          <button className="btn primary" disabled={!line.trim() || saving} data-testid="night-save">남기기</button>
        </div>
      </form>
      {n.tomorrow && (
        <span className="small night-next">내일 첫 일정 · {n.tomorrow.time ? `${n.tomorrow.time} ` : ''}{n.tomorrow.name}</span>
      )}
    </section>
  );
}
