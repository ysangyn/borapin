import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { addNote, dayLabel, deleteNote, tripDays, useNotes } from '../lib/tripExtras';
import { localDate } from '../lib/dates';
import { useBusy, useToast } from './ui';
import type { Trip } from '../lib/types';
import { toneOf } from '../lib/members';
import { isSealed, markOpened, openLabel, yearLater } from '../lib/capsule';

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
  const [capsule, setCapsule] = useState(false);
  // 며칠째 이야기인지: 여행 날짜가 있으면 고를 수 있게 (여행 중이면 오늘로 미리)
  const days = tripDays(trip.when);
  const [day, setDay] = useState<string | null>(() => (days.includes(localDate()) ? localDate() : null));
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  // 글을 쓰는 중(또는 남기는 중)에는 새 버전 자동 새로 고침이 기다린다 (쓰던 글이 날아가지 않게)
  useBusy(!!text.trim() || busy);
  const writers = [...new Set((notes ?? []).map((n) => n.by.name))];
  const shown = (notes ?? []).filter((n) => (!who || n.by.name === who) && (!dayFilter || n.day === dayFilter));
  const usedDays = days.filter((d) => (notes ?? []).some((n) => n.day === d));

  const save = async () => {
    if (!text.trim() || auth.status !== 'ready' || busy) return;
    setBusy(true);
    const t = text;
    setText('');
    try {
      const openAt = capsule ? yearLater() : undefined;
      await addNote(trip.id, t, auth.user, openAt, capsule ? null : day);
      if (openAt) { toast(`봉했어요 · ${openLabel(openAt)}에 열려요`); setCapsule(false); }
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
        {days.length > 1 && !capsule && (
          <div className="chips" role="group" aria-label="며칠째 이야기" data-testid="note-day">
            {days.map((d, i) => <button key={d} type="button" className={'chip' + (day === d ? ' on' : '')} aria-pressed={day === d} onClick={() => setDay(day === d ? null : d)}>{i + 1}일째</button>)}
          </div>
        )}
        <div className="row-between" style={{ alignItems: 'center', gap: 8 }}>
          <button type="button" className={'chip' + (capsule ? ' on' : '')} aria-pressed={capsule} onClick={() => setCapsule(!capsule)} data-testid="capsule-toggle">✉ 1년 뒤 우리에게</button>
          <button className="btn sm" disabled={!text.trim() || busy} onClick={save} data-testid="note-save">{capsule ? '봉하기' : '남기기'}</button>
        </div>
        {capsule && <span className="tiny muted">{openLabel(yearLater())}까지는 봉투로만 보이고, 그날 홈에 도착해요.</span>}
      </div>
      {writers.length > 1 && (
        <div className="chips">
          <button className={'chip' + (who === null ? ' on' : '')} onClick={() => setWho(null)}>함께 보기</button>
          {writers.map((w) => <button key={w} className={'chip' + (who === w ? ' on' : '')} onClick={() => setWho(w)}>{w}만</button>)}
        </div>
      )}
      {usedDays.length > 0 && (
        <div className="chips" role="group" aria-label="날짜로 보기">
          <button className={'chip' + (dayFilter === null ? ' on' : '')} onClick={() => setDayFilter(null)}>모든 날</button>
          {usedDays.map((d) => <button key={d} className={'chip' + (dayFilter === d ? ' on' : '')} onClick={() => setDayFilter(d)}>{dayLabel(d, days).split(' · ')[0]}</button>)}
        </div>
      )}
      {notes && notes.length === 0 && <div className="small muted">아직 남긴 글이 없어요.</div>}
      {shown.map((n) => (
        <div key={n.id} className="note" data-testid="note">
          <div className="row-between" style={{ alignItems: 'center' }}>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span className={'note-by t' + Math.max(0, toneOf(n.by.name))}>{n.by.name}</span>{n.day && days.includes(n.day) && <span className="tag">{dayLabel(n.day, days)}</span>}</span>
            <span className="tiny muted">{n.createdAt?.toDate ? noteDate(n.createdAt.toDate()) : '방금'}</span>
          </div>
          {isSealed(n) ? (
            <div className="capsule-sealed" data-testid="capsule-sealed">✉ <b className="hand">{openLabel(n.openAt!)}</b>에 열려요</div>
          ) : (
            <>
              {n.openAt && <span className="tag violet" style={{ alignSelf: 'flex-start' }} ref={() => markOpened(n.id)}>타임캡슐 · {openLabel(n.openAt)}에 열림</span>}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{n.text}</div>
            </>
          )}
          {auth.status === 'ready' && auth.user.uid === n.by.uid && (
            <button className="link-btn" style={{ color: 'var(--ink3)', fontWeight: 600 }} onClick={() => window.confirm('이 글을 지울까요?') && deleteNote(n.id).then(() => toast('지웠어요'), () => toast('지우지 못했어요'))}>지우기</button>
          )}
        </div>
      ))}
    </div>
  );
}
