import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TopBar, useToast } from '../components/ui';
import SpotDetail, { type SpotTarget } from '../components/SpotDetail';
import { useAuth, displayName } from '../lib/auth';
import { patchTrip, useTrips } from '../lib/data';
import { addPlan, updatePlan, usePlan } from '../lib/tripExtras';
import { useTravelInfo } from '../lib/travelinfo';
import { useFestivals } from '../lib/festivals';
import { useWorld } from '../lib/world';
import { loadTour, trendTags, useTrend, type TourData } from '../lib/trend';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { pickables, PICK_LABEL, PLAN_STEPS, type Pick, type PickKind } from '../lib/planPick';
import { arrange, dayDistance } from '../lib/route';
import { festsIn, monthCells } from '../lib/planCal';
import { accessFor } from '../lib/transport';
import { lookupLink } from '../lib/placeLookup';
import { placeLabel, REGION_BY_CODE } from '../lib/geo';
import { memberNames, toneOf } from '../lib/members';
import type { PlanItem, Trip, When } from '../lib/types';

/**
 * 계획 이어가기 (FLAGS.planFlow): 여행지를 정한 뒤 다섯 걸음 — 언제 · 어디서 자요 · 같이 찾아 담기 · 동선 정리 · 기대 한 줄.
 * 걸음마다 바로 저장되고 건너뛸 수 있다. 끝낸 걸음은 trip.planDone에 남아 여행 상세의 '이어서 계획하기'가 다음 걸음으로 연다.
 * 시안: https://claude.ai/artifact/2ECB6Vcaxs6jtoDsbqhLVm
 */
const STEPS = PLAN_STEPS;
type Step = (typeof STEPS)[number];
const TITLE: Record<Step, string> = { when: '언제 가요?', stay: '어디서 자요?', pick: '같이 찾아 담아요', route: '이렇게 다니면 어때요?', hope: '제일 기대되는 건?' };
const SUB: Record<Step, string> = {
  when: '떠나는 날을 누르고 며칠인지 정해요 · 분홍 점은 축제',
  stay: '정해 두면 하루 동선이 숙소에서 시작해요',
  pick: '각자 폰에서 하트 · 둘 다 누르면 ★',
  route: '가까운 곳끼리 날마다 묶었어요 · 바꿔도 돼요',
  hope: '한 줄씩 · 다녀오면 \'그때 기대\'로 다시 보여 줘요',
};
const DAY_COLORS = ['#F07A95', '#4D7FE0', '#5DAA6A', '#E58A00', '#8E5BD6', '#1E9C9C'];

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const md = (s: string) => `${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일`;
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const dow = (s: string) => WEEK[new Date(s).getDay()];
export const daysOf = (w: When): string[] => {
  if (w.p !== 'day' || !w.y || !w.m || !w.d) return [];
  const s = new Date(w.y, w.m - 1, w.d);
  const e = w.d2 ? new Date(w.y2 ?? w.y, (w.m2 ?? w.m) - 1, w.d2) : s;
  const out: string[] = [];
  for (let t = new Date(s); t <= e && out.length < 15; t.setDate(t.getDate() + 1)) out.push(ymd(t));
  return out;
};
const me = (auth: ReturnType<typeof useAuth>) => (auth.status === 'ready' ? displayName(auth.user) : '');

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
    else { setSp({ step: next }, { replace: true }); window.scrollTo(0, 0); }
  };
  if (!trips) return <><TopBar back title="계획" /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /></div></div></>;
  if (!trip) return <><TopBar back title="계획" /><div className="page"><div className="empty"><b>여행을 찾을 수 없어요</b></div></div></>;
  const nextOf = (s: Step): Step | 'end' => STEPS[STEPS.indexOf(s) + 1] ?? 'end';
  const done = new Set(trip.planDone ?? []);
  return (
    <>
      <TopBar back backTo={`/trips/${id}`} title={<span style={{ fontWeight: 800 }}>{placeLabel(trip.places[0])} 여행 계획</span>} />
      <div className="page plan-flow" data-testid="plan-flow" data-step={step}>
        <div className="flow-steps" role="tablist" aria-label="계획 걸음">
          {STEPS.map((s, k) => <button key={s} role="tab" aria-selected={k === i} aria-label={`${k + 1}. ${TITLE[s]}`} className={k === i ? 'on' : done.has(s) ? 'done' : ''} onClick={() => setSp({ step: s }, { replace: true })} />)}
        </div>
        <div>
          <h1 className="jua flow-q">{TITLE[step]}</h1>
          <p className="flow-sub">{SUB[step]}</p>
        </div>
        {step === 'when' && <WhenStep trip={trip} onNext={() => go(nextOf('when'), 'when')} />}
        {step === 'stay' && <StayStep trip={trip} onNext={() => go(nextOf('stay'), 'stay')} />}
        {step === 'pick' && <PickStep trip={trip} onNext={() => go(nextOf('pick'), 'pick')} />}
        {step === 'route' && <RouteStep trip={trip} onNext={() => go(nextOf('route'), 'route')} />}
        {step === 'hope' && <HopeStep trip={trip} onNext={() => go('end', 'hope')} />}
        {step !== 'hope' && <button className="link-btn flow-skip" onClick={() => go(nextOf(step), step)} data-testid="flow-skip">{step === 'when' ? '아직 몰라요 · 건너뛰기' : step === 'stay' ? '아직 안 정했어요 · 건너뛰기' : '건너뛰기'}</button>}
      </div>
    </>
  );
}

/* ───── 1. 언제 ───── */
function WhenStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const w = trip.when;
  const today = new Date();
  const init = w.p === 'day' && w.y && w.m && w.d ? `${w.y}-${pad(w.m)}-${pad(w.d)}` : '';
  const [start, setStart] = useState(init);
  const [nights, setNights] = useState(() => Math.max(0, daysOf(w).length - 1 || (trip.kind === 'outing' ? 0 : 1)));
  const [ym, setYm] = useState(() => { const b = init ? new Date(init) : w.y && w.m ? new Date(w.y, w.m - 1, 1) : today; return { y: b.getFullYear(), m: b.getMonth() + 1 }; });
  const seasons = useSeasons(), festivals = useFestivals(), trend = useTrend();
  const place = trip.places[0];
  const season = seasonFor(seasons, place);
  const fests = place.t === 'kr' ? festivals?.cells[place.code] ?? [] : [];
  const end = start ? (() => { const e = new Date(start); e.setDate(e.getDate() + nights); return ymd(e); })() : '';
  const goodMonth = !!season?.m.includes(ym.m);
  // 좋은 때는 달 단위 자료라 날마다 점을 찍으면 한 달이 다 초록 — 제목 옆 꼬리표로, 점은 축제만
  const cells = monthCells(ym.y, ym.m, { today, goodMonths: [], fests, start: start || null, nights });
  const f = start ? festsIn(fests, start, nights) : null;
  const tags = place.t === 'kr' ? trendTags(place.code, trend) : [];
  const toast = useToast();
  const move = (k: number) => setYm(({ y, m }) => { const d = new Date(y, m - 1 + k, 1); return { y: d.getFullYear(), m: d.getMonth() + 1 }; });
  const save = async () => {
    if (!start) return toast('떠나는 날을 달력에서 골라 주세요');
    const s = new Date(start), e = new Date(end);
    const when: When = { p: 'day', y: s.getFullYear(), m: s.getMonth() + 1, d: s.getDate(), ...(nights ? { y2: e.getFullYear(), m2: e.getMonth() + 1, d2: e.getDate() } : {}) };
    await patchTrip(trip.id, { when, kind: nights ? 'trip' : 'outing' }).then(() => toast('날짜를 정했어요'), () => toast('저장하지 못했어요'));
    onNext();
  };
  return (
    <div className="flow-body">
      <div className="card white flow-cal">
        <div className="flow-cal-head"><button className="icon-btn" onClick={() => move(-1)} aria-label="지난달">‹</button><b className="jua">{ym.y}년 {ym.m}월{goodMonth && <span className="flow-good">가기 좋은 달</span>}</b><button className="icon-btn" onClick={() => move(1)} aria-label="다음 달">›</button></div>
        <div className="flow-cal-grid" data-testid="flow-cal">
          {WEEK.map((d) => <span key={d} className="h">{d}</span>)}
          {cells.map((c, k) => c ? (
            <button key={c.ymd} type="button" disabled={c.past} className={['c', c.fest && 'fest', c.inRange && 'range', c.isStart && 'start', c.inRange && c.ymd === end && 'end'].filter(Boolean).join(' ')} onClick={() => setStart(c.ymd)} aria-label={`${c.d}일${c.fest ? ` ${c.fest}` : ''}`} aria-pressed={c.isStart}>{c.d}</button>
          ) : <span key={`e${k}`} />)}
        </div>
      </div>
      <div className="flow-stepper"><span>몇 박</span><button className="icon-btn" onClick={() => setNights(Math.max(0, nights - 1))} aria-label="하루 줄이기">−</button><b className="jua" data-testid="flow-nights">{nights ? `${nights}박 ${nights + 1}일` : '당일'}</b><button className="icon-btn" onClick={() => setNights(Math.min(14, nights + 1))} aria-label="하루 늘리기">+</button></div>
      <div className="flow-strip">
        <div><span className="k">가기 좋은 때</span><b>{season ? monthsLabel(season.m) : '자료 없음'}</b>{season && start ? (season.m.includes(+start.slice(5, 7)) ? '고른 때가 좋은 때예요' : season.why) : season?.why}</div>
        <div><span className="k">그때 축제</span><b>{f ? (f.during[0]?.t ?? '없어요') : '날짜를 고르면'}</b>{f?.near ? `${+f.near.s.slice(4, 6)}월 ${+f.near.s.slice(6, 8)}일엔 ${f.near.t}` : f?.during.length ? '여행 중에 열려요' : ''}</div>
        {tags.length > 0 && <div><span className="k">요즘</span><b>{tags[0].t}</b>{tags[0].why ?? ''}</div>}
      </div>
      <button className="btn block" onClick={save} data-testid="flow-when-save">{start ? `${md(start)} ${dow(start)}${nights ? ` – ${md(end)} ${dow(end)}` : ''}로 정하기` : '날짜를 골라 주세요'}</button>
    </div>
  );
}

/* ───── 2. 어디서 자요 ───── */
function StayStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const place = trip.places[0];
  const [text, setText] = useState(trip.stay?.name ?? '');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const info = useTravelInfo();
  const [tour, setTour] = useState<TourData | null>(null);
  useEffect(() => { void loadTour().then(setTour, () => {}); }, []);
  // 동네 고르기: 역 근처 · 구·군·섬 · 가장 많이 가는 관광지 근처 (자리가 있으면 동선 출발점으로)
  const hoods = useMemo(() => {
    const out: { name: string; line: string; lat?: number; lng?: number }[] = [];
    const acc = accessFor(place);
    if (acc?.station && acc.station.km <= 8) out.push({ name: `${acc.station.n} 근처`, line: '기차 내려 바로' });
    if (place.t === 'kr') {
      for (const s of info?.cells[place.code]?.subs.slice(0, 2) ?? []) out.push({ name: s.name, line: s.theme });
      for (const [n, lat, lng] of tour?.cells[place.code]?.s.slice(0, 2) ?? []) out.push({ name: `${n} 근처`, line: '많이 가는 곳 가까이', lat, lng });
    }
    return out.slice(0, 4);
  }, [place, info, tour]);
  const save = async (stay: { name: string; lat?: number; lng?: number; url?: string }) => {
    setBusy(true);
    await patchTrip(trip.id, { stay: JSON.parse(JSON.stringify({ ...stay, name: stay.name.slice(0, 80) })) }).then(() => toast('숙소를 적었어요'), () => toast('저장하지 못했어요'));
    setBusy(false);
    onNext();
  };
  const submit = async () => {
    const t = text.trim();
    if (!t) return onNext();
    if (/^https?:\/\//i.test(t)) {
      setBusy(true);
      const l = await lookupLink(t).catch(() => null);
      setBusy(false);
      if (!l?.name) return toast('링크에서 숙소를 못 읽었어요 · 이름을 적어 주세요');
      return save({ name: l.name, lat: l.lat, lng: l.lng, url: t });
    }
    return save({ name: t });
  };
  return (
    <div className="flow-body">
      <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="숙소 이름이나 지도 링크 붙여넣기" aria-label="숙소" maxLength={300} />
      <span className="tiny muted" style={{ marginTop: -4 }}>네이버·카카오 지도에서 '공유 → 링크 복사'한 걸 붙이면 자리까지 들어와요</span>
      {hoods.length > 0 && <>
        <b className="small" style={{ marginTop: 4 }}>{placeLabel(place)}에서 묵기 좋은 곳</b>
        <div className="flow-hoods">
          {hoods.map((h) => <button key={h.name} type="button" className="card white flow-hood" disabled={busy} onClick={() => void save(h)} data-testid="flow-hood"><b>{h.name}</b><span className="tiny muted">{h.line}</span></button>)}
        </div>
      </>}
      {(text.trim() || busy) && <button className="btn block" disabled={busy} onClick={() => void submit()} data-testid="flow-stay-save">{busy ? '찾는 중…' : '여기서 자요'}</button>}
    </div>
  );
}

/* ───── 3. 같이 찾아 담기 ───── */
function PickStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const auth = useAuth();
  const name = me(auth);
  const members = memberNames();
  const info = useTravelInfo(), festivals = useFestivals(), world = useWorld();
  const [tour, setTour] = useState<TourData | null>(null);
  useEffect(() => { void loadTour().then(setTour, () => {}); }, []);
  const plan = usePlan(trip.id);
  const days = daysOf(trip.when);
  const place = trip.places[0];
  const picks = useMemo(() => pickables(place, { tour, info, festivals, world }, days.length ? { start: new Date(days[0]), days: days.length } : null), [place, tour, info, festivals, world, days.length]);
  const [tab, setTab] = useState<PickKind>('see');
  const [detail, setDetail] = useState<SpotTarget | null>(null);
  const [own, setOwn] = useState('');
  const toast = useToast();
  const byName = new Map((plan ?? []).map((p) => [p.name, p]));
  const toggle = async (p: Pick) => {
    if (!name) return;
    const it = byName.get(p.name);
    if (!it) { await addPlan(trip.id, p.name, (plan?.length ?? 0) + 1, null, { by: [name], kind: p.kind, lat: p.lat, lng: p.lng, img: p.img, info: (p.area ?? p.line ?? '').slice(0, 200) }).catch(() => toast('담지 못했어요')); return; }
    const by = it.by ?? [];
    await updatePlan(it.id, { by: by.includes(name) ? by.filter((x) => x !== name) : [...by, name] }).catch(() => toast('저장하지 못했어요'));
  };
  const addOwn = async () => {
    const t = own.trim();
    if (!t || !name) return;
    setOwn('');
    if (/^https?:\/\//i.test(t)) {
      const l = await lookupLink(t).catch(() => null);
      if (!l?.name) return toast('링크에서 장소를 못 읽었어요 · 이름을 적어 주세요');
      await addPlan(trip.id, l.name, (plan?.length ?? 0) + 1, null, { by: [name], kind: tab === 'fest' ? 'see' : tab, lat: l.lat, lng: l.lng, img: l.image, info: (l.address ?? '').slice(0, 200) });
    } else await addPlan(trip.id, t.slice(0, 80), (plan?.length ?? 0) + 1, null, { by: [name], kind: tab === 'fest' ? 'see' : tab });
    toast('담았어요');
  };
  const shown = picks.filter((p) => p.kind === tab);
  const mine = (plan ?? []).filter((p) => (p.by?.length ?? 0) > 0);
  const both = mine.filter((p) => members.length > 1 && members.every((n) => p.by?.includes(n)));
  const extra = mine.filter((p) => !picks.some((x) => x.name === p.name) && (p.kind ?? 'see') === tab);
  const area = place.t === 'kr' ? REGION_BY_CODE.get(place.code)?.name ?? '' : placeLabel(place);
  return (
    <div className="flow-body" style={{ paddingBottom: 70 }}>
      <div className="flow-tabs" role="tablist">{(['see', 'eat', 'buy', 'fest'] as PickKind[]).filter((k) => k === 'see' || picks.some((p) => p.kind === k)).map((k) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{PICK_LABEL[k]} <small>{picks.filter((p) => p.kind === k).length}</small></button>)}</div>
      <div className="pick-grid">
        {[...extra.map((p): Pick => ({ key: `own:${p.id}`, name: p.name, kind: (p.kind as PickKind) ?? 'see', img: p.img, line: '직접 담은 곳' })), ...shown].map((p) => {
          const by = byName.get(p.name)?.by ?? [];
          return (
            <div key={p.key} className={'pick-card' + (by.includes(name) ? ' mine' : '')} data-testid="pick-card">
              <button type="button" className="pick-hit" onClick={() => void toggle(p)} aria-pressed={by.includes(name)} aria-label={`${p.name} ${by.includes(name) ? '하트 빼기' : '담기'}`}>
                {p.img ? <img src={p.img} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className={'pick-noimg ' + p.kind} aria-hidden="true">{p.kind === 'eat' ? '🍲' : p.kind === 'buy' ? '🛍' : p.kind === 'fest' ? '🎪' : '📍'}</span>}
                {members.length > 1 && members.every((n) => by.includes(n)) && <span className="pick-star">★ 둘 다</span>}
                <span className="pick-hearts">{members.map((n) => <i key={n} className={'t' + Math.max(0, toneOf(n)) + (by.includes(n) ? ' on' : '')}>{[...n][0]}</i>)}</span>
                <b>{p.name}</b>
                {(p.area || p.line) && <span className="tiny muted">{p.area ?? p.line}</span>}
              </button>
              {place.t === 'kr' && p.kind === 'see' && <button type="button" className="pick-more" onClick={() => setDetail({ name: p.name, area, lat: p.lat, lng: p.lng, img: p.img, place })} aria-label={`${p.name} 자세히`}>자세히</button>}
            </div>
          );
        })}
      </div>
      {!shown.length && !extra.length && <p className="small muted">이 칸엔 아직 후보가 없어요. 아래에 직접 담아 보세요.</p>}
      <div className="flow-own"><input className="input" value={own} onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) void addOwn(); }} placeholder="찾는 곳이 없나요? 이름이나 지도 링크" aria-label="직접 담기" /><button className="btn sm" onClick={() => void addOwn()} disabled={!own.trim()}>담기</button></div>
      <div className="flow-bar" data-testid="flow-bar"><span className="jua">담은 곳 {mine.length}</span>{members.length > 1 && <span className="tiny" style={{ color: '#CFC6F2' }}>★ {both.length} · {members.map((n) => `${n} ${mine.filter((p) => p.by?.includes(n)).length}`).join(' · ')}</span>}<button className="btn sm line" onClick={onNext} data-testid="flow-pick-next">동선 보기 ›</button></div>
      {detail && <SpotDetail spot={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

/* ───── 4. 동선 정리 ───── */
function RouteStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const plan = usePlan(trip.id);
  const toast = useToast();
  const days = daysOf(trip.when);
  const stay = trip.stay?.lat != null && trip.stay?.lng != null ? { lat: trip.stay.lat, lng: trip.stay.lng } : null;
  const items = useMemo(() => (plan ?? []).filter((p) => (p.by?.length ?? 0) > 0 || p.day), [plan]);
  const [draft, setDraft] = useState<Record<string, { day: string; order: number }> | null>(null);
  useEffect(() => {
    if (draft || !plan) return;
    const r = arrange(items.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, day: p.day, time: p.time })), days, stay);
    setDraft(Object.fromEntries(r.map((x) => [x.id, { day: x.day, order: x.order }])));
  }, [plan]);
  const reArrange = () => { const r = arrange(items.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })), days, stay); setDraft(Object.fromEntries(r.map((x) => [x.id, { day: x.day, order: x.order }]))); toast('다시 정리했어요'); };
  const dayItems = (d: string) => items.filter((p) => draft?.[p.id]?.day === d).sort((a, b) => (draft![a.id].order) - (draft![b.id].order));
  const moveIn = (id: string, k: number) => setDraft((dr) => {
    if (!dr) return dr;
    const d = dr[id].day; const list = items.filter((p) => dr[p.id]?.day === d).sort((a, b) => dr[a.id].order - dr[b.id].order).map((p) => p.id);
    const at = list.indexOf(id), to = at + k; if (to < 0 || to >= list.length) return dr;
    [list[at], list[to]] = [list[to], list[at]];
    return { ...dr, ...Object.fromEntries(list.map((x, n) => [x, { day: d, order: n + 1 }])) };
  });
  const toDay = (id: string, d: string) => setDraft((dr) => (dr ? { ...dr, [id]: { day: d, order: 999 } } : dr));
  const apply = async () => {
    if (!draft) return;
    await Promise.all(Object.entries(draft).map(([id, v]) => updatePlan(id, { day: v.day || null, order: v.order }))).then(() => toast('동선을 정했어요'), () => toast('저장하지 못했어요'));
    onNext();
  };
  if (!plan) return <div className="skeleton-list" aria-busy="true"><i /><i /></div>;
  if (!items.length) return <div className="flow-body"><p className="small muted">아직 담은 곳이 없어요. '같이 찾아 담기'에서 하트를 눌러 보세요.</p><button className="btn block" onClick={onNext}>다음</button></div>;
  if (!days.length) return <div className="flow-body"><p className="small muted">날짜를 정하면 날마다 묶어 드려요.</p><button className="btn block" onClick={onNext}>다음</button></div>;
  const abroad = trip.places[0].t === 'country';
  return (
    <div className="flow-body">
      <RouteMap days={days} items={(d) => dayItems(d)} stay={stay} />
      {days.map((d, k) => {
        const list = dayItems(d);
        const far = dayDistance(list.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })), stay) > (abroad ? 15 : 60);
        return (
          <div key={d} className="card white flow-day" data-testid="flow-day">
            <b className="jua"><i style={{ background: DAY_COLORS[k % DAY_COLORS.length] }} />{k + 1}일째 · {md(d)} {dow(d)}</b>
            {list.map((p, n) => (
              <div key={p.id} className="flow-it">
                <span className="n" style={{ background: DAY_COLORS[k % DAY_COLORS.length] }}>{n + 1}</span>
                <span className="nm">{p.name}{(p.by?.length ?? 0) > 1 ? ' ★' : ''}</span>
                <span className="ctl">
                  <button className="icon-btn" onClick={() => moveIn(p.id, -1)} disabled={n === 0} aria-label={`${p.name} 위로`}>↑</button>
                  <button className="icon-btn" onClick={() => moveIn(p.id, 1)} disabled={n === list.length - 1} aria-label={`${p.name} 아래로`}>↓</button>
                  {days.length > 1 && <select className="select" value={d} onChange={(e) => toDay(p.id, e.target.value)} aria-label={`${p.name} 날짜 바꾸기`}>{days.map((x, j) => <option key={x} value={x}>{j + 1}일째</option>)}</select>}
                </span>
              </div>
            ))}
            {!list.length && <span className="tiny muted">이날은 비어 있어요 · 쉬는 날도 좋아요</span>}
            {far && <span className="flow-warn">이날은 이동이 좀 많아요 · 하나 빼면 여유로워요</span>}
          </div>
        );
      })}
      <button className="btn block" onClick={() => void apply()} data-testid="flow-route-save">이대로 정하기</button>
      <button className="link-btn" style={{ alignSelf: 'center' }} onClick={reArrange}>다시 정리</button>
    </div>
  );
}

/** 작은 동선 그림: 담은 곳의 자리를 상자에 맞춰 찍고 날마다 다른 색 점선으로 잇는다 (자리 없는 곳은 빠짐) */
function RouteMap({ days, items, stay }: { days: string[]; items: (d: string) => PlanItem[]; stay: { lat: number; lng: number } | null }) {
  const all = days.flatMap((d) => items(d)).filter((p) => p.lat != null && p.lng != null);
  const pts = [...all.map((p) => ({ lat: p.lat!, lng: p.lng! })), ...(stay ? [stay] : [])];
  if (pts.length < 2) return null;
  const minLat = Math.min(...pts.map((p) => p.lat)), maxLat = Math.max(...pts.map((p) => p.lat));
  const minLng = Math.min(...pts.map((p) => p.lng)), maxLng = Math.max(...pts.map((p) => p.lng));
  const W = 300, H = 170, P = 18;
  const sx = (lng: number) => P + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 2 * P);
  const sy = (lat: number) => H - P - ((lat - minLat) / (maxLat - minLat || 1)) * (H - 2 * P);
  return (
    <svg className="flow-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="동선 그림" data-testid="flow-map">
      {days.map((d, k) => {
        const list = items(d).filter((p) => p.lat != null);
        const c = DAY_COLORS[k % DAY_COLORS.length];
        const path = [...(stay ? [stay] : []), ...list.map((p) => ({ lat: p.lat!, lng: p.lng! }))].map((p, n) => `${n ? 'L' : 'M'}${sx(p.lng).toFixed(1)} ${sy(p.lat).toFixed(1)}`).join(' ');
        return (
          <g key={d}>
            <path d={path} fill="none" stroke={c} strokeWidth={3} strokeDasharray="6 5" strokeLinecap="round" />
            {list.map((p, n) => <g key={p.id}><circle cx={sx(p.lng!)} cy={sy(p.lat!)} r={10} fill={c} stroke="#1E1640" strokeWidth={2} /><text x={sx(p.lng!)} y={sy(p.lat!) + 4} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={800}>{n + 1}</text></g>)}
          </g>
        );
      })}
      {stay && <g><circle cx={sx(stay.lng)} cy={sy(stay.lat)} r={11} fill="#fff" stroke="#1E1640" strokeWidth={2} /><text x={sx(stay.lng)} y={sy(stay.lat) + 4} textAnchor="middle" fontSize={11} fontWeight={800}>숙</text></g>}
    </svg>
  );
}

/* ───── 5. 기대 한 줄 → 끝 ───── */
function HopeStep({ trip, onNext }: { trip: Trip; onNext: () => void }) {
  const auth = useAuth();
  const name = me(auth);
  const [text, setText] = useState(trip.hopes?.[name] ?? '');
  const plan = usePlan(trip.id);
  const toast = useToast();
  const days = daysOf(trip.when);
  const save = async () => {
    if (text.trim() && name) await patchTrip(trip.id, { [`hopes.${name}`]: text.trim().slice(0, 100) }).then(() => toast('기대 한 줄을 남겼어요'), () => toast('저장하지 못했어요'));
    onNext();
  };
  const picked = (plan ?? []).filter((p) => (p.by?.length ?? 0) > 0);
  const routed = picked.some((p) => p.day);
  const list: [boolean, string][] = [
    [days.length > 0, days.length ? `${md(days[0])}${days.length > 1 ? ` – ${md(days[days.length - 1])}` : ''} · ${days.length > 1 ? `${days.length - 1}박 ${days.length}일` : '당일'}` : '날짜는 아직'],
    [!!trip.stay, trip.stay ? `${trip.stay.name}에서 자요` : '숙소는 아직'],
    [picked.length > 0, picked.length ? `담은 곳 ${picked.length}${routed ? ' · 날마다 동선' : ''}` : '담은 곳은 아직'],
    [!!trip.packing?.length, trip.packing?.length ? `준비물 ${trip.packing.length}개` : "준비물 · 나중에 '준비' 탭에서"],
  ];
  return (
    <div className="flow-body">
      {memberNames().map((n) => n === name ? (
        <div key={n}><div className="flow-who"><i className={'t' + Math.max(0, toneOf(n))}>{[...n][0]}</i>{n}</div>
          <textarea className={'textarea hand flow-hope-in t' + Math.max(0, toneOf(n))} rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="이번 여행에서 제일 기대되는 것 한 줄" aria-label="기대 한 줄" maxLength={100} /></div>
      ) : (
        <div key={n}><div className="flow-who"><i className={'t' + Math.max(0, toneOf(n))}>{[...n][0]}</i>{n}{!trip.hopes?.[n] && <span className="tiny muted"> · 아직 안 썼어요</span>}</div>
          <div className={'hand flow-hope t' + Math.max(0, toneOf(n)) + (trip.hopes?.[n] ? '' : ' empty')}>{trip.hopes?.[n] ?? '…'}</div></div>
      ))}
      <div className="card flow-check" data-testid="flow-check">
        <b className="jua">{list.every(([ok]) => ok) ? '계획이 다 됐어요' : '계획이 거의 다 됐어요'}</b>
        {list.map(([ok, t]) => <div key={t} className={ok ? 'ok' : ''}><span aria-hidden="true">{ok ? '✓' : '·'}</span>{t}</div>)}
      </div>
      <button className="btn block" onClick={() => void save()} data-testid="flow-hope-save">계획 마치기</button>
      <Link to={`/trips/${trip.id}?tab=plan`} className="link-btn" style={{ alignSelf: 'center' }}>일정 보러 가기</Link>
    </div>
  );
}
