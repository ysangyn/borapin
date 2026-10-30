import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TopBar, useToast } from '../components/ui';
import { useAuth, displayName } from '../lib/auth';
import { patchTrip, useTrips } from '../lib/data';
import { addPlan, updatePlan, usePlan } from '../lib/tripExtras';
import { useTravelInfo } from '../lib/travelinfo';
import { useFestivals } from '../lib/festivals';
import { useWorld } from '../lib/world';
import { loadTour, type TourData } from '../lib/trend';
import { pickables, PICK_LABEL, type Pick, type PickKind } from '../lib/planPick';
import { arrange } from '../lib/route';
import { placeLabel } from '../lib/geo';
import { memberNames, toneOf } from '../lib/members';
import type { Trip, When } from '../lib/types';

/**
 * 계획 이어가기 (FLAGS.planFlow): 여행지를 정한 뒤 다섯 걸음 — 언제 · 어디서 자요 · 같이 찾아 담기 · 동선 정리 · 기대 한 줄.
 * 걸음마다 바로 저장되고 건너뛸 수 있다. 끝낸 걸음은 trip.planDone에 남아 여행 상세의 '이어서 계획하기'가 다음 걸음으로 연다.
 * 시안: https://claude.ai/artifact/2ECB6Vcaxs6jtoDsbqhLVm
 */
const STEPS = ['when', 'stay', 'pick', 'route', 'hope'] as const;
type Step = (typeof STEPS)[number];
const TITLE: Record<Step, string> = { when: '언제 가요?', stay: '어디서 자요?', pick: '같이 찾아 담아요', route: '이렇게 다니면 어때요?', hope: '제일 기대되는 건?' };

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysOf = (w: When): string[] => {
  if (w.p !== 'day' || !w.y || !w.m || !w.d) return [];
  const s = new Date(w.y, w.m - 1, w.d);
  const e = w.d2 ? new Date(w.y2 ?? w.y, (w.m2 ?? w.m) - 1, w.d2) : s;
  const out: string[] = [];
  for (let t = new Date(s); t <= e && out.length < 15; t.setDate(t.getDate() + 1)) out.push(ymd(t));
  return out;
};

export default function PlanFlow() {
  const { id = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const { trips } = useTrips();
  const trip = trips?.find((t) => t.id === id);
  const step: Step = (STEPS as readonly string[]).includes(sp.get('step') ?? '') ? (sp.get('step') as Step) : 'when';
  const i = STEPS.indexOf(step);
  const go = async (next: Step | 'end', done?: Step) => {
    if (trip && done && !(trip.planDone ?? []).includes(done)) await patchTrip(trip.id, { planDone: [...(trip.planDone ?? []), done] }).catch(() => {});
    if (next === 'end') nav(`/trips/${id}`, { replace: true });
    else setSp({ step: next }, { replace: true });
  };
  if (!trips) return <><TopBar back title="계획" /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /></div></div></>;
  if (!trip) return <><TopBar back title="계획" /><div className="page"><div className="empty"><b>여행을 찾을 수 없어요</b></div></div></>;
  const nextOf = (s: Step): Step | 'end' => STEPS[STEPS.indexOf(s) + 1] ?? 'end';
  return (
    <>
      <TopBar back backTo={`/trips/${id}`} title={<span style={{ fontWeight: 800 }}>{placeLabel(trip.places[0])} 여행 계획</span>} />
      <div className="page plan-flow" data-testid="plan-flow" data-step={step}>
        <div className="flow-steps" aria-label={`${i + 1}/5 걸음`}>{STEPS.map((s, k) => <i key={s} className={k < i || (trip.planDone ?? []).includes(s) ? 'done' : k === i ? 'on' : ''} />)}</div>
        <h1 className="jua flow-q">{TITLE[step]}</h1>
        {step === 'when' && <WhenStep trip={trip} onNext={() => go(nextOf('when'), 'when')} />}
        {step === 'stay' && <StayStep trip={trip} onNext={() => go(nextOf('stay'), 'stay')} />}
        {step === 'pick' && <PickStep trip={trip} onNext={() => go(nextOf('pick'), 'pick')} />}
        {step === 'route' && <RouteStep trip={trip} onNext={() => go(nextOf('route'), 'route')} />}
        {step === 'hope' && <HopeStep trip={trip} onNext={() => go('end', 'hope')} />}
        <button className="link-btn flow-skip" onClick={() => go(nextOf(step), step)} data-testid="flow-skip">건너뛰기</button>
      </div>
    </>
  );
}

function WhenStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const w = trip.when;
  const [start, setStart] = useState(w.p === 'day' && w.y && w.m && w.d ? `${w.y}-${pad(w.m)}-${pad(w.d)}` : '');
  const [nights, setNights] = useState(() => Math.max(0, daysOf(w).length - 1 || (trip.kind === 'outing' ? 0 : 1)));
  const toast = useToast();
  const save = async () => {
    if (!start) return toast('떠나는 날을 골라 주세요');
    const s = new Date(start), e = new Date(s); e.setDate(s.getDate() + nights);
    const when: When = { p: 'day', y: s.getFullYear(), m: s.getMonth() + 1, d: s.getDate(), ...(nights ? { y2: e.getFullYear(), m2: e.getMonth() + 1, d2: e.getDate() } : {}) };
    await patchTrip(trip.id, { when, kind: nights ? 'trip' : 'outing' }).then(() => toast('날짜를 정했어요'), () => toast('저장하지 못했어요'));
    onNext();
  };
  return (
    <div className="flow-body">
      <label className="field"><span className="label">떠나는 날</span><input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-label="떠나는 날" /></label>
      <div className="flow-stepper"><span>몇 박</span><button className="icon-btn" onClick={() => setNights(Math.max(0, nights - 1))} aria-label="하루 줄이기">−</button><b className="jua">{nights ? `${nights}박 ${nights + 1}일` : '당일'}</b><button className="icon-btn" onClick={() => setNights(Math.min(14, nights + 1))} aria-label="하루 늘리기">+</button></div>
      <button className="btn block" onClick={save} data-testid="flow-when-save">이 날짜로 정하기</button>
    </div>
  );
}

function StayStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const [name, setName] = useState(trip.stay?.name ?? '');
  const toast = useToast();
  const save = async () => {
    if (!name.trim()) return onNext();
    await patchTrip(trip.id, { stay: { name: name.trim().slice(0, 80) } }).then(() => toast('숙소를 적었어요'), () => toast('저장하지 못했어요'));
    onNext();
  };
  return (
    <div className="flow-body">
      <p className="small muted" style={{ margin: 0 }}>정해 두면 하루 동선이 숙소에서 시작해요. 동네 이름만 적어도 돼요.</p>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="숙소 이름이나 동네" aria-label="숙소" maxLength={80} />
      <button className="btn block" onClick={save} data-testid="flow-stay-save">{name.trim() ? '여기서 자요' : '다음'}</button>
    </div>
  );
}

function PickStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const auth = useAuth();
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const info = useTravelInfo(), festivals = useFestivals(), world = useWorld();
  const [tour, setTour] = useState<TourData | null>(null);
  useEffect(() => { void loadTour().then(setTour, () => {}); }, []);
  const plan = usePlan(trip.id);
  const days = daysOf(trip.when);
  const picks = useMemo(() => pickables(trip.places[0], { tour, info, festivals, world }, days.length ? { start: new Date(days[0]), days: days.length } : null), [trip.places, tour, info, festivals, world, days.length]);
  const [tab, setTab] = useState<PickKind>('see');
  const byName = new Map((plan ?? []).map((p) => [p.name, p]));
  const toggle = async (p: Pick) => {
    if (!me) return;
    const it = byName.get(p.name);
    if (!it) { await addPlan(trip.id, p.name, (plan?.length ?? 0) + 1).catch(() => {}); return; }
    const by = it.by ?? [];
    await updatePlan(it.id, { by: by.includes(me) ? by.filter((x) => x !== me) : [...by, me] }).catch(() => {});
  };
  // 새로 담은 항목에 하트·자리·사진을 채운다 (addPlan은 이름만 받으므로)
  useEffect(() => {
    if (!plan || !me) return;
    for (const p of picks) { const it = byName.get(p.name); if (it && it.by === undefined) void updatePlan(it.id, { by: [me], kind: p.kind, ...(p.lat != null ? { lat: p.lat, lng: p.lng } : {}), ...(p.img ? { img: p.img } : {}) }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, picks, me]);
  const shown = picks.filter((p) => p.kind === tab);
  const added = (plan ?? []).filter((p) => (p.by?.length ?? 0) > 0);
  const both = added.filter((p) => memberNames().every((n) => p.by?.includes(n)));
  return (
    <div className="flow-body">
      <div className="flow-tabs" role="tablist">{(['see', 'eat', 'buy', 'fest'] as PickKind[]).map((k) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{PICK_LABEL[k]} <small>{picks.filter((p) => p.kind === k).length}</small></button>)}</div>
      <div className="pick-grid">
        {shown.map((p) => {
          const it = byName.get(p.name);
          const by = it?.by ?? [];
          return (
            <button key={p.key} type="button" className={'pick-card' + (by.includes(me) ? ' mine' : '')} onClick={() => void toggle(p)} aria-pressed={by.includes(me)} data-testid="pick-card">
              {p.img ? <img src={p.img} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className={'pick-noimg ' + p.kind} aria-hidden="true" />}
              {memberNames().length > 1 && memberNames().every((n) => by.includes(n)) && <span className="pick-star">★ 둘 다</span>}
              <span className="pick-hearts">{memberNames().map((n) => <i key={n} className={'t' + Math.max(0, toneOf(n)) + (by.includes(n) ? ' on' : '')}>{[...n][0]}</i>)}</span>
              <b>{p.name}</b>
              {(p.line || p.area) && <span className="tiny muted">{p.area ?? p.line}</span>}
            </button>
          );
        })}
      </div>
      <div className="flow-bar"><span className="jua">담은 곳 {added.length}</span>{both.length > 0 && <span className="tiny">★ {both.length}</span>}<button className="btn sm" onClick={onNext} data-testid="flow-pick-next">동선 보기</button></div>
    </div>
  );
}

function RouteStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const plan = usePlan(trip.id);
  const toast = useToast();
  const days = daysOf(trip.when);
  const items = (plan ?? []).filter((p) => (p.by?.length ?? 0) > 0 || p.lat != null);
  const res = useMemo(() => arrange(items.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, day: p.day, time: p.time })), days), [items, days]);
  const apply = async () => {
    await Promise.all(res.map((r) => updatePlan(r.id, { day: r.day || null, order: r.order }))).then(() => toast('동선을 정했어요'), () => toast('저장하지 못했어요'));
    onNext();
  };
  if (!days.length) return <div className="flow-body"><p className="small muted">날짜를 정하면 날마다 묶어 드려요.</p><button className="btn block" onClick={onNext}>다음</button></div>;
  return (
    <div className="flow-body">
      {days.map((d, k) => (
        <div key={d} className="card white flow-day"><b className="jua">{k + 1}일째 · {+d.slice(5, 7)}월 {+d.slice(8, 10)}일</b>
          {res.filter((r) => r.day === d).sort((a, b) => a.order - b.order).map((r, n) => <div key={r.id} className="flow-it"><span className="n">{n + 1}</span>{items.find((p) => p.id === r.id)?.name}</div>)}
        </div>
      ))}
      <button className="btn block" onClick={apply} data-testid="flow-route-save">이대로 정하기</button>
    </div>
  );
}

function HopeStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const auth = useAuth();
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const [text, setText] = useState(trip.hopes?.[me] ?? '');
  const toast = useToast();
  const save = async () => {
    if (text.trim() && me) await patchTrip(trip.id, { [`hopes.${me}`]: text.trim().slice(0, 100) }).then(() => toast('기대 한 줄을 남겼어요'), () => toast('저장하지 못했어요'));
    onNext();
  };
  return (
    <div className="flow-body">
      {Object.entries(trip.hopes ?? {}).filter(([n]) => n !== me).map(([n, t]) => <div key={n} className="hand flow-hope">“{t}” — {n}</div>)}
      <textarea className="textarea" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="이번 여행에서 제일 기대되는 것 한 줄" aria-label="기대 한 줄" maxLength={100} />
      <button className="btn block" onClick={save} data-testid="flow-hope-save">계획 마치기</button>
      <Link to={`/trips/${trip.id}?tab=plan`} className="link-btn" style={{ alignSelf: 'center' }}>일정 보러 가기</Link>
    </div>
  );
}
