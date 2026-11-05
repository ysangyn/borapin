import { useState } from 'react';
import { Icon, useToast } from './ui';
import { patchTrip } from '../lib/data';
import { BOOKING_HINT, BOOKING_LABEL, bookingLine, sortBookings } from '../lib/booking';
import { tripDays } from '../lib/tripExtras';
import type { Booking, BookingKind, Trip } from '../lib/types';

const KINDS: BookingKind[] = ['flight', 'stay', 'train', 'bus', 'car', 'ticket', 'etc'];
const ICON: Record<BookingKind, string> = { flight: '✈️', stay: '🏨', train: '🚄', bus: '🚌', car: '🚗', ticket: '🎟️', etc: '📌' };
const blank = (kind: BookingKind = 'flight', date: string | null = null): Booking => ({ id: '', kind, title: '', date, time: null, code: '', memo: '' });

/**
 * 준비 탭 '예약': 비행기 편명·숙소 체크인·기차·표의 날짜·시각·예약번호를 한곳에 (메일함을 뒤지지 않게).
 * 홈 여행 카드에는 다음 예약 한 줄, 가이드북에는 첫 쪽에 실린다. 여행 문서의 bookings 목록(30개까지)에 둔다.
 */
export default function BookingsCard({ trip }: { trip: Trip }) {
  const toast = useToast();
  const list = sortBookings(trip.bookings ?? []);
  const days = tripDays(trip.when);
  const [edit, setEdit] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const save = async (next: Booking[], msg: string) => {
    setSaving(true);
    try { await patchTrip(trip.id, { bookings: next }); toast(msg); setEdit(null); } catch { toast('저장하지 못했어요. 다시 해 주세요'); }
    setSaving(false);
  };
  const submit = () => {
    if (!edit || !edit.title.trim()) return;
    const b = { ...edit, title: edit.title.trim().slice(0, 80), code: edit.code.trim().slice(0, 40), memo: edit.memo.trim().slice(0, 200) };
    if (b.id) void save((trip.bookings ?? []).map((x) => (x.id === b.id ? b : x)), '예약을 고쳤어요');
    else void save([...(trip.bookings ?? []), { ...b, id: Math.random().toString(36).slice(2, 10) }], '예약을 넣었어요');
  };
  const remove = (b: Booking) => { if (window.confirm(`'${b.title}' 예약을 지울까요?`)) void save((trip.bookings ?? []).filter((x) => x.id !== b.id), '예약을 지웠어요'); };
  const copy = (code: string) => { void navigator.clipboard?.writeText(code).then(() => toast('예약번호를 복사했어요'), () => undefined); };

  return (
    <section className="card white prep-card" data-testid="bookings">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div className="hub-label" style={{ margin: 0 }}>예약</div>
        {!edit && <button type="button" className="link-btn" onClick={() => setEdit(blank(trip.places.some((p) => p.t === 'country') ? 'flight' : 'stay', days[0] ?? null))} data-testid="booking-add">+ 넣기</button>}
      </div>
      {!list.length && !edit && <span className="small muted">비행기 편명, 숙소 체크인, 기차표 예약번호를 적어 두면 여행 날 홈에서 바로 보여요.</span>}
      {list.map((b) => (
        <div key={b.id} className="booking-row" data-testid="booking">
          <span className="booking-ico" aria-hidden="true">{ICON[b.kind]}</span>
          <button type="button" className="booking-main" onClick={() => setEdit(b)} aria-label={`${b.title} 고치기`}>
            <b>{b.title}</b>
            <span className="tiny muted">{bookingLine({ ...b, title: '', code: '' }).trim() || BOOKING_LABEL[b.kind]}{b.memo ? ` · ${b.memo}` : ''}</span>
          </button>
          {b.code && <button type="button" className="chip booking-code" onClick={() => copy(b.code)} aria-label={`예약번호 ${b.code} 복사`}>{b.code}</button>}
        </div>
      ))}
      {edit && (
        <div className="booking-form" data-testid="booking-form">
          <div className="chips">{KINDS.map((k) => <button key={k} type="button" className={'chip' + (edit.kind === k ? ' on' : '')} aria-pressed={edit.kind === k} onClick={() => setEdit({ ...edit, kind: k })}>{BOOKING_LABEL[k]}</button>)}</div>
          <input className="input" aria-label="예약 이름" placeholder={BOOKING_HINT[edit.kind]} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} maxLength={80} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" type="date" aria-label={edit.kind === 'stay' ? '체크인 날짜' : '날짜'} value={edit.date ?? ''} onChange={(e) => setEdit({ ...edit, date: e.target.value || null })} style={{ flex: 1.3 }} />
            <input className="input" type="time" aria-label={edit.kind === 'stay' ? '체크인 시각' : '시각'} value={edit.time ?? ''} onChange={(e) => setEdit({ ...edit, time: e.target.value || null })} style={{ flex: 1 }} />
          </div>
          <input className="input" aria-label="예약번호" placeholder="예약번호 (선택)" value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} maxLength={40} />
          <input className="input" aria-label="예약 메모" placeholder="메모 (터미널·좌석·조식 등, 선택)" value={edit.memo} onChange={(e) => setEdit({ ...edit, memo: e.target.value })} maxLength={200} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="btn sm" disabled={saving || !edit.title.trim()} onClick={submit} data-testid="booking-save">{saving ? '저장하는 중…' : edit.id ? '고치기' : '넣기'}</button>
            <button type="button" className="link-btn" onClick={() => setEdit(null)}>그만두기</button>
            {edit.id && <button type="button" className="link-btn" style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => remove(edit)}><Icon name="trash" size={14} />지우기</button>}
          </div>
        </div>
      )}
    </section>
  );
}
