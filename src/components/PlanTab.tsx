import { useState } from 'react';
import { josa } from 'es-hangul';
import { Icon, useToast } from './ui';
import { addPlan, dayLabel, deletePlan, restorePlan, tripDays, updatePlan, usePlan } from '../lib/tripExtras';
import { placeRecLinks, recsAt } from '../lib/placeRecs';
import type { PlaceRec, PlanItem, Trip } from '../lib/types';

/** 일정은 필요한 만큼만: ① 가볼 곳 목록 → ② 날짜별 배치 → ③ 시간·예약 정보 */
export default function PlanTab({ trip, recs }: { trip: Trip; recs: PlaceRec[] }) {
  // 기기에 먼저 저장돼 누르면 바로 보이고, 상대가 바꾼 것도 그대로 보인다
  const items = usePlan(trip.id);
  const toast = useToast();
  const [name, setName] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const days = tripDays(trip.when);
  const ours = trip.places.flatMap((p) => recsAt(recs, p)).filter((r) => !items?.some((i) => i.recId === r.id));

  const add = async (n = name, recId?: string) => {
    if (!n.trim()) return;
    // 저장을 기다리지 않고 바로 비운다 (이어서 적는 글자가 지워지지 않게)
    if (n === name) setName('');
    try {
      await addPlan(trip.id, n, (items?.length ?? 0) + 1, recId);
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요');
      if (!recId) setName(n);
    }
  };

  const groups: { key: string; title: string; list: PlanItem[] }[] = [];
  if (items) {
    for (const d of days) {
      const list = items.filter((i) => i.day === d);
      if (list.length) groups.push({ key: d, title: dayLabel(d, days), list });
    }
    const rest = items.filter((i) => !i.day || !days.includes(i.day));
    if (rest.length) groups.push({ key: 'none', title: days.length ? '날짜 없이' : '가볼 곳', list: rest });
  }
  const region = trip.places[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="plan-tab">
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="input"
          aria-label="가볼 곳 추가"
          placeholder="가볼 곳 적기 (예: 경포대)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              add();
            }
          }}
          maxLength={80}
        />
        <button className="btn soft sm" style={{ height: 46 }} onClick={() => add()}>추가</button>
      </div>
      {ours.length > 0 && (
        <div className="chips">
          <span className="tiny muted" style={{ alignSelf: 'center' }}>우리 장소에서</span>
          {ours.slice(0, 6).map((r) => (
            <button key={r.id} className="chip" onClick={() => add(r.name, r.id)}><Icon name="plus" size={12} stroke={2.4} />{r.name}</button>
          ))}
        </div>
      )}
      {!days.length && items && items.length > 0 && (
        <div className="tiny muted">여행 날짜를 정하면 날짜별로 나눌 수 있어요.</div>
      )}
      {items && items.length === 0 && (
        <div className="empty" style={{ padding: '18px 8px' }}>
          <b>가볼 곳을 적어 보세요</b>
          <span className="small">순서와 날짜 없이 적기만 해도 돼요. 원하면 날짜와 시간, 예약 정보까지 넣어요.</span>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.key}>
          <div className="year-head">{g.title}</div>
          <div className="list">
            {g.list.map((it) => {
              const links = region ? placeRecLinks({ name: it.name, region, naverUrl: recs.find((r) => r.id === it.recId)?.naverUrl }) : null;
              const isOpen = open === it.id;
              return (
                <div key={it.id} className={'plan-row' + (it.done ? ' done' : '')} data-testid="plan-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={it.done} onChange={(e) => updatePlan(it.id, { done: e.target.checked }).catch(() => toast('저장하지 못했어요'))} aria-label={`${it.name} 다녀옴`} />
                    <button className="plan-name" onClick={() => setOpen(isOpen ? null : it.id)} aria-expanded={isOpen}>
                      {it.time && <span className="tag violet">{it.time}</span>}
                      <span>{it.name}</span>
                      {it.info && <span className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.info}</span>}
                    </button>
                    {links && <a href={links.naver} target="_blank" rel="noreferrer" className="btn sm ghost" aria-label={`${it.name} 네이버지도`}>지도</a>}
                  </div>
                  {isOpen && (
                    <div className="plan-more">
                      <input className="input" style={{ gridColumn: '1 / -1' }} aria-label="이름 고치기" defaultValue={it.name} maxLength={80} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== it.name) updatePlan(it.id, { name: v }); }} />
                      {days.length > 0 && (
                        <select className="select" aria-label="날짜" value={it.day ?? ''} onChange={(e) => updatePlan(it.id, { day: e.target.value || null })}>
                          <option value="">날짜 없이</option>
                          {days.map((d) => <option key={d} value={d}>{dayLabel(d, days)}</option>)}
                        </select>
                      )}
                      <input className="input" type="time" aria-label="시간" value={it.time ?? ''} onChange={(e) => updatePlan(it.id, { time: e.target.value || null })} />
                      <input className="input" aria-label="예약·메모" placeholder="예약번호, 메모" defaultValue={it.info} onBlur={(e) => e.target.value !== it.info && updatePlan(it.id, { info: e.target.value.trim() })} maxLength={200} />
                      <button className="btn sm line" onClick={() => { const copy = it; setOpen(null); deletePlan(copy.id).catch(() => toast('빼지 못했어요')); toast(`'${copy.name}'${josa.pick(copy.name, '을/를')} 일정에서 뺐어요`, { label: '되돌리기', onClick: () => void restorePlan(copy) }); }}><Icon name="trash" size={15} />일정에서 빼기</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
