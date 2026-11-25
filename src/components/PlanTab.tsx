import { wayClash } from '../lib/way';
import { useState } from 'react';
import { josa } from 'es-hangul';
import { Icon, useToast } from './ui';
import { addPlan, dayLabel, deletePlan, restorePlan, tripDays, updatePlan, usePlan } from '../lib/tripExtras';
import { recsAt } from '../lib/placeRecs';
import SpotDetail, { type SpotTarget } from './SpotDetail';
import { placeLabel } from '../lib/geo';
import type { PlaceRec, PlanItem, Trip } from '../lib/types';
import { useTravelInfo } from '../lib/travelinfo';
import { groupByDistance, moveItem, type Slot } from '../lib/planOrder';
import { geoNearOf, lookupGeo } from '../lib/placeLookup';

/** 00:00~23:45, 15분 간격 (24시간 표기) */
const TIMES = Array.from({ length: 96 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`);

/**
 * 예정 여행의 일정은 필요한 만큼만: ① 가볼 곳 목록 → ② 날짜별 배치 → ③ 시간·예약 정보.
 * 다녀온 여행의 '들른 곳' 탭은 우리 장소(평가·한 줄 평)로 남기므로 여기 오지 않는다 (TripDetail VisitedTab).
 */
export default function PlanTab({ trip, recs }: { trip: Trip; recs: PlaceRec[] }) {
  // 기기에 먼저 저장돼 누르면 바로 보이고, 상대가 바꾼 것도 그대로 보인다
  const items = usePlan(trip.id);
  const toast = useToast();
  const [name, setName] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [spot, setSpot] = useState<SpotTarget | null>(null);
  // 차례 바꾸기: 줄마다 ↑ ↓ 빼기 (사용자 의견 11-25)
  const [arrange, setArrange] = useState(false);
  const [sorting, setSorting] = useState<string | null>(null);
  const days = tripDays(trip.when);
  const ours = trip.places.flatMap((p) => recsAt(recs, p)).filter((r) => !items?.some((i) => i.recId === r.id));
  const info = useTravelInfo();
  const first = trip.places[0];
  const example = (first?.t === 'kr' ? info?.cells[first.code]?.main.spots[0] : undefined) ?? (first?.t === 'country' ? '시내 시장' : '경포대');
  const noun = '가볼 곳';

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
  const slot = (i: PlanItem): Slot => ({ id: i.id, day: i.day && days.includes(i.day) ? i.day : null, order: i.order, time: i.time });
  const apply = (changes: Slot[]) => Promise.all(changes.map((c) => updatePlan(c.id, { day: c.day, order: c.order, time: c.time })));

  const move = (it: PlanItem, dir: -1 | 1) => {
    const changes = moveItem((items ?? []).map(slot), it.id, dir, days);
    if (!changes.length) return;
    apply(changes).catch(() => toast('저장하지 못했어요'));
  };
  const remove = (it: PlanItem) => {
    deletePlan(it.id).catch(() => toast('빼지 못했어요'));
    toast(`'${it.name}'${josa.pick(it.name, '을/를')} 일정에서 뺐어요`, { label: '되돌리기', onClick: () => void restorePlan(it) });
  };

  /**
   * 가까운 곳끼리 날짜 나누기: 자리를 모르는 곳은 먼저 찾아 두고(OpenStreetMap, 그 도시 둘레에서만),
   * 자리를 아는 곳을 가까운 차례로 이어 날 수만큼 고르게 나눈다. 시간을 정해 둔 곳과 다녀온 곳은 건드리지 않는다.
   */
  const sortNear = async () => {
    if (!items || sorting) return;
    const movable = items.filter((i) => !i.time && !i.done);
    const near = region ? geoNearOf(region) : null;
    const pos = new Map<string, { lat: number; lng: number }>();
    for (const i of movable) if (i.lat != null && i.lng != null) pos.set(i.id, { lat: i.lat, lng: i.lng });
    const todo = movable.filter((i) => !pos.has(i.id));
    try {
      for (let k = 0; k < todo.length; k++) {
        setSorting(`자리 찾는 중 ${k + 1}/${todo.length}`);
        const it = todo[k];
        const t0 = Date.now();
        const g = near ? await lookupGeo(it.name, near) : null;
        if (g) { pos.set(it.id, { lat: g.lat, lng: g.lng }); void updatePlan(it.id, { lat: g.lat, lng: g.lng }).catch(() => undefined); }
        // 자리 찾기는 1초에 한 번만 묻는다 (바로 돌아왔으면 묻지 않은 것이라 기다리지 않는다)
        if (k < todo.length - 1 && Date.now() - t0 > 50) await new Promise((r) => setTimeout(r, 1100));
      }
      const pts = movable.filter((i) => pos.has(i.id)).map((i) => ({ id: i.id, ...pos.get(i.id)! }));
      const missed = movable.length - pts.length;
      if (pts.length < 2) { toast(missed ? '자리를 찾지 못해서 묶지 못했어요. 지도에 나오는 이름으로 고쳐 보세요' : '묶을 곳이 두 곳은 있어야 해요'); return; }
      const before: Slot[] = items.filter((i) => pts.some((p) => p.id === i.id)).map((i) => ({ id: i.id, day: i.day, order: i.order, time: i.time }));
      setSorting('나누는 중');
      await apply(groupByDistance(pts, days.length ? days : [null]));
      toast(`가까운 곳끼리 ${pts.length}곳을 ${days.length > 1 ? '날짜별로 나눴어요' : '차례대로 놓았어요'}${missed ? ` · 자리를 못 찾은 ${missed}곳은 그대로 뒀어요` : ''}`, { label: '되돌리기', onClick: () => void apply(before) });
    } catch (e) {
      console.warn(e);
      toast('묶지 못했어요. 다시 해 주세요');
    } finally { setSorting(null); }
  };
  const clash = items ? wayClash(trip.way, days, items) : {};

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
          <span className="tiny muted" style={{ alignSelf: 'center' }}>우리 맛집·명소에서</span>
          {ours.slice(0, 6).map((r) => (
            <button key={r.id} className="chip" onClick={() => add(r.name, r.id)}><Icon name="plus" size={12} stroke={2.4} />{r.name}</button>
          ))}
        </div>
      )}
      {items && items.length >= 2 && (
        <div className="plan-tools" data-testid="plan-tools">
          <button type="button" className="btn sm soft" disabled={!!sorting} onClick={() => void sortNear()} data-testid="plan-near">{sorting ?? (days.length > 1 ? '가까운 곳끼리 날짜 나누기' : '가까운 차례로 놓기')}</button>
          <button type="button" className={'btn sm ' + (arrange ? 'soft-on' : 'ghost')} aria-pressed={arrange} onClick={() => { setArrange(!arrange); setOpen(null); }} data-testid="plan-arrange">{arrange ? '다 바꿨어요' : '차례 바꾸기·빼기'}</button>
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
      {/* 고른 버스·기차 시각과 맞지 않는 일정 (닿기 전·떠난 뒤) */}
      {clash.go && <div className="way-clash" data-testid="way-clash-go">{clash.go.at}에 {clash.go.place}에 닿아요 · 그 전에 잡은 {clash.go.names.slice(0, 2).join(', ')}{clash.go.names.length > 2 ? ` 외 ${clash.go.names.length - 2}` : ''}의 시간을 다시 봐 주세요</div>}
      {clash.back && <div className="way-clash" data-testid="way-clash-back">돌아오는 차가 {clash.back.at}에 {clash.back.place}에서 떠나요 · 그 뒤에 잡은 {clash.back.names.slice(0, 2).join(', ')}{clash.back.names.length > 2 ? ` 외 ${clash.back.names.length - 2}` : ''}의 시간을 다시 봐 주세요</div>}
      {arrange && <div className="tiny muted">↑ ↓ 로 차례를 바꿔요. 그날 맨 위·맨 아래에서 누르면 앞날·다음 날로 넘어가요.</div>}
      {groups.map((g, gi) => (
        <section key={g.key}>
          <div className="year-head">{g.title}</div>
          <div className="list">
            {g.list.map((it, idx) => {
              const isOpen = open === it.id;
              if (arrange) {
                // 첫날 맨 위 곳은 더 위로 못 가고 (앞날이 비어 있으면 그날로 올라간다), '날짜 없이'(또는 날짜 없는 여행)의 맨 끝 곳은 더 아래로 못 간다
                const first = idx === 0 && (days.length ? g.key === days[0] : gi === 0);
                const last = gi === groups.length - 1 && idx === g.list.length - 1 && (g.key === 'none' || !days.length);
                return (
                  <div key={it.id} className="plan-row" data-testid="plan-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="plan-text" style={{ flex: 1, minWidth: 0 }}>
                        <span className="plan-title">{it.time && <span className="tag violet" style={{ marginRight: 6 }}>{it.time}</span>}{it.name}</span>
                      </span>
                      <button type="button" className="plan-move" disabled={first} onClick={() => move(it, -1)} aria-label={`${it.name} 위로`} data-testid="plan-up">↑</button>
                      <button type="button" className="plan-move" disabled={last} onClick={() => move(it, 1)} aria-label={`${it.name} 아래로`} data-testid="plan-down">↓</button>
                      <button type="button" className="plan-move del" onClick={() => remove(it)} aria-label={`${it.name} 빼기`} data-testid="plan-remove">×</button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={it.id} className={'plan-row' + (it.done ? ' done' : '')} data-testid="plan-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={it.done} onChange={(e) => updatePlan(it.id, { done: e.target.checked }).catch(() => toast('저장하지 못했어요'))} aria-label={`${it.name} 다녀옴`} />
                    <button className="plan-name" onClick={() => setOpen(isOpen ? null : it.id)} aria-expanded={isOpen}>
                      {it.time && <span className="tag violet">{it.time}</span>}
                      {/* 이름은 한 줄로 두고, 긴 설명(가는 길 등)은 그 아래 작게 (좁은 화면에서 이름이 한 글자씩 꺾이지 않게) */}
                      <span className="plan-text">
                        <span className="plan-title">{it.name}</span>
                        {it.info && <span className="tiny muted plan-sub">{it.info}</span>}
                      </span>
                    </button>
                    {/* 밖으로 바로 나가지 않고 앱 안에서 사진·소개·시간을 먼저 (길찾기는 그 안에 하나) */}
                    {region && <button type="button" className="btn sm ghost" onClick={() => setSpot({ name: it.name, area: placeLabel(region), lat: it.lat, lng: it.lng, img: it.img, place: region })} aria-label={`${it.name} 자세히`}>자세히</button>}
                  </div>
                  {isOpen && (
                    <div className="plan-more">
                      <input className="input" style={{ gridColumn: '1 / -1' }} aria-label="이름 고치기" defaultValue={it.name} maxLength={80} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== it.name) updatePlan(it.id, { name: v }).catch(() => toast('저장하지 못했어요')); }} />
                      {days.length > 0 && (
                        <select className="select" aria-label="날짜" value={it.day ?? ''} onChange={(e) => updatePlan(it.id, { day: e.target.value || null }).catch(() => toast('저장하지 못했어요'))}>
                          <option value="">날짜 없이</option>
                          {days.map((d) => <option key={d} value={d}>{dayLabel(d, days)}</option>)}
                        </select>
                      )}
                      {/* 24시간 표기로 고르기 (기기 설정과 상관없이 같은 모양) */}
                      <select className="select" aria-label="시간" value={it.time ?? ''} onChange={(e) => updatePlan(it.id, { time: e.target.value || null }).catch(() => toast('저장하지 못했어요'))}>
                        <option value="">시간 없이</option>
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                        {it.time && !TIMES.includes(it.time) && <option value={it.time}>{it.time}</option>}
                      </select>
                      <input className="input" aria-label="예약·메모" placeholder="예약번호, 메모" defaultValue={it.info} onBlur={(e) => { if (e.target.value !== it.info) updatePlan(it.id, { info: e.target.value.trim() }).catch(() => toast('저장하지 못했어요')); }} maxLength={200} />
                      <button className="btn sm line" onClick={() => { const copy = it; setOpen(null); deletePlan(copy.id).catch(() => toast('빼지 못했어요')); toast(`'${copy.name}'${josa.pick(copy.name, '을/를')} 일정에서 뺐어요`, { label: '되돌리기', onClick: () => void restorePlan(copy) }); }}><Icon name="trash" size={15} />일정에서 빼기</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {spot && <SpotDetail spot={spot} onClose={() => setSpot(null)} />}
    </div>
  );
}
