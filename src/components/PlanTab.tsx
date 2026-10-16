import { useState } from 'react';
import { josa } from 'es-hangul';
import { Icon, useToast } from './ui';
import { addPlan, dayLabel, deletePlan, restorePlan, tripDays, updatePlan, usePlan } from '../lib/tripExtras';
import { placeRecLinks, recsAt } from '../lib/placeRecs';
import type { PlaceRec, PlanItem, Trip } from '../lib/types';
import { useTravelInfo } from '../lib/travelinfo';

/** 00:00~23:45, 15분 간격 (24시간 표기) */
const TIMES = Array.from({ length: 96 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`);

/** 일정은 필요한 만큼만: ① 가볼 곳 목록 → ② 날짜별 배치 → ③ 시간·예약 정보 */
export default function PlanTab({ trip, recs }: { trip: Trip; recs: PlaceRec[] }) {
  // 기기에 먼저 저장돼 누르면 바로 보이고, 상대가 바꾼 것도 그대로 보인다
  const items = usePlan(trip.id);
  const toast = useToast();
  const [name, setName] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const days = tripDays(trip.when);
  const ours = trip.places.flatMap((p) => recsAt(recs, p)).filter((r) => !items?.some((i) => i.recId === r.id));
  // 다녀온 여행이면 '가볼 곳'이 아니라 '들른 곳': 보기는 그 지역의 명소로, 다음에 또 갈지 표시할 수 있게
  const done = trip.status === 'done';
  const info = useTravelInfo();
  const first = trip.places[0];
  const example = (first?.t === 'kr' ? info?.cells[first.code]?.main.spots[0] : undefined) ?? (first?.t === 'country' ? '시내 시장' : '경포대');
  const noun = done ? '들른 곳' : '가볼 곳';

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
    if (rest.length) groups.push({ key: 'none', title: days.length ? '날짜 없이' : noun, list: rest });
  }
  const region = trip.places[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="plan-tab">
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="input"
          aria-label={`${noun} 추가`}
          placeholder={`${noun} 적기 (예: ${example})`}
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
          <b>{done ? '들른 곳을 적어 두세요' : '가볼 곳을 적어 보세요'}</b>
          <span className="small">{done ? '어디어디 들렀는지 적어 두면 다음에 또 갈 때 바로 꺼내 봐요. 또 가고 싶은 곳엔 하트를.' : '순서와 날짜 없이 적기만 해도 돼요. 원하면 날짜와 시간, 예약 정보까지 넣어요.'}</span>
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
                    {done ? (
                      <button type="button" className={'plan-again' + (it.again ? ' on' : '')} aria-pressed={!!it.again} aria-label={it.again ? `${it.name} 또 갈래요 취소` : `${it.name} 또 갈래요`} onClick={() => updatePlan(it.id, { again: !it.again }).then(() => toast(it.again ? '또 갈래요를 뺐어요' : '또 갈래요!'), () => toast('저장하지 못했어요'))} data-testid="plan-again">
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>
                      </button>
                    ) : (
                      <input type="checkbox" checked={it.done} onChange={(e) => updatePlan(it.id, { done: e.target.checked }).catch(() => toast('저장하지 못했어요'))} aria-label={`${it.name} 다녀옴`} />
                    )}
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
                      {/* 24시간 표기로 고르기 (기기 설정과 상관없이 같은 모양) */}
                      <select className="select" aria-label="시간" value={it.time ?? ''} onChange={(e) => updatePlan(it.id, { time: e.target.value || null })}>
                        <option value="">시간 없이</option>
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                        {it.time && !TIMES.includes(it.time) && <option value={it.time}>{it.time}</option>}
                      </select>
                      <input className="input" aria-label="예약·메모" placeholder="예약번호, 메모" defaultValue={it.info} onBlur={(e) => e.target.value !== it.info && updatePlan(it.id, { info: e.target.value.trim() })} maxLength={200} />
                      <button className="btn sm line" onClick={() => { const copy = it; setOpen(null); deletePlan(copy.id).catch(() => toast('빼지 못했어요')); toast(`'${copy.name}'${josa.pick(copy.name, '을/를')} 일정에서 뺐어요`, { label: '되돌리기', onClick: () => void restorePlan(copy) }); }}><Icon name="trash" size={15} />{done ? '목록에서 빼기' : '일정에서 빼기'}</button>
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
