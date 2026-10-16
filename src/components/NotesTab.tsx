import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { addNote, deleteNote, useNotes } from '../lib/tripExtras';
import { useToast } from './ui';
import type { Trip } from '../lib/types';

/** '2024.5.6' (올해면 '5.6 21:00') */
function noteDate(d: Date) {
  const md = `${d.getMonth() + 1}.${d.getDate()}`;
  return d.getFullYear() === new Date().getFullYear() ? `${md} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : `${d.getFullYear()}.${md}`;
}

/** 여행에 남기는 글: 둘이 함께 보기 / 한 사람만 보기 */
export default function NotesTab({ trip }: { trip: Trip }) {
  const notes = useNotes(trip.id);
  const auth = useAuth();
  const toast = useToast();
  const [text, setText] = useState('');
  const [who, setWho] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const writers = [...new Set((notes ?? []).map((n) => n.by.name))];
  const shown = (notes ?? []).filter((n) => !who || n.by.name === who);

  const save = async () => {
    if (!text.trim() || auth.status !== 'ready' || busy) return;
    setBusy(true);
    const t = text;
    setText('');
    try {
      await addNote(trip.id, t, auth.user);
    } catch (e) {
      console.warn(e);
      setText(t);
      toast('남기지 못했어요. 잠시 뒤 다시 해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="notes-tab">
      <div className="card white" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea className="textarea" aria-label="글 쓰기" rows={3} placeholder="그날 있었던 일, 기억하고 싶은 말…" value={text} onChange={(e) => setText(e.target.value)} maxLength={5000} />
        <button className="btn sm" style={{ alignSelf: 'flex-end' }} disabled={!text.trim() || busy} onClick={save}>남기기</button>
      </div>
      {writers.length > 1 && (
        <div className="chips">
          <button className={'chip' + (who === null ? ' on' : '')} onClick={() => setWho(null)}>함께 보기</button>
          {writers.map((w) => <button key={w} className={'chip' + (who === w ? ' on' : '')} onClick={() => setWho(w)}>{w}만</button>)}
        </div>
      )}
      {notes && notes.length === 0 && <div className="small muted">아직 남긴 글이 없어요.</div>}
      {shown.map((n) => (
        <div key={n.id} className="note" data-testid="note">
          <div className="row-between" style={{ alignItems: 'center' }}>
            <span className={'note-by' + (n.by.name === '보라' ? ' bora' : '')}>{n.by.name}</span>
            <span className="tiny muted">{n.createdAt?.toDate ? noteDate(n.createdAt.toDate()) : '방금'}</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{n.text}</div>
          {auth.status === 'ready' && auth.user.uid === n.by.uid && (
            <button className="link-btn" style={{ color: 'var(--ink3)', fontWeight: 600 }} onClick={() => window.confirm('이 글을 지울까요?') && deleteNote(n.id).then(() => toast('지웠어요'), () => toast('지우지 못했어요'))}>지우기</button>
          )}
        </div>
      ))}
    </div>
  );
}
