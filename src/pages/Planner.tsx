import { FLAGS } from '../lib/flags';
import { straightKm } from '../lib/placeApps';
import { useHome } from '../lib/home';
import PlaceHint from '../components/PlaceHint';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { computeStats, createTrip, updateWish, usePlaces, useTrips, useWishes } from '../lib/data';
import { useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { useFestivals } from '../lib/festivals';
import { useWorld } from '../lib/world';
import { parsePlaceParam, placeLabel, placeLong, REGION_BY_CODE } from '../lib/geo';
import { photoForPlace } from '../lib/media';
import { memberNames } from '../lib/members';
import { addPlans } from '../lib/tripExtras';
import { candidateKey, dateRange, nightsLabel, planCandidates, skeleton, WHEN_LABEL, whenOf, type PlanConds, type WhenKind } from '../lib/planner';
import { createDraft, markDecided, rerollDraft, setMyHearts, useDraft } from '../lib/planDrafts';
import { shareAnyhow } from '../lib/kakao';
import { formatWhen } from '../lib/dates';
import { josaOnly, withRo } from '../lib/ko';
import type { Place } from '../lib/types';

/**
 * 여행 계획하기 ①: 어디를 몰라도 조건만 고르면 후보 3곳.
 * ?wish=<가고 싶은 곳 id> 또는 ?place=<곳> 으로 오면 목적지는 이미 정해진 것: 언제·며칠만 고르고 바로 '여행 만들기' (빠른 길).
 */
export default function Planner() {
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [sp] = useSearchParams();
  const data = usePlannerData();
  const { wishes } = useWishes();
  const wishId = sp.get('wish');
  const wish = wishId && wishes ? wishes.find((w) => w.id === wishId) : undefined;
  // 목적지가 정해져 왔는지: 가고 싶은 곳(id) 또는 곳 자체
  const fixed: Place | null = wish?.place ?? parsePlaceParam(sp.get('place'))[0] ?? null;
  const wishLoading = !!wishId && !wishes;
  const wishGone = !!wishId && !!wishes && !wish;
  const [when, setWhen] = useState<WhenKind>('nextweekend');
  const [start, setStart] = useState('');
  const [nights, setNights] = useState(1);
  const [who, setWho] = useState<string | null>('둘이');
  const [scope, setScope] = useState<PlanConds['scope']>('kr');
  const [busy, setBusy] = useState(false);
  const conds: PlanConds = { when, start: when === 'pick' ? start : undefined, nights, who, scope };
  const range = dateRange(conds);

  const go = async () => {
    if (auth.status !== 'ready' || !data || busy) return;
    if (when === 'pick' && !start) return toast('떠날 날을 골라 주세요');
    setBusy(true);
    try {
      const cands = planCandidates(conds, data);
      if (!cands.length) { setBusy(false); return toast('조건에 맞는 곳이 없어요. 조건을 하나 풀어 보세요'); }
      const id = await createDraft(conds, cands, auth.user);
      nav(`/plan/${id}`);
    } catch (e) { console.warn(e); toast('만들지 못했어요. 다시 해 주세요'); setBusy(false); }
  };

  /** 빠른 길: 정해진 곳으로 갈 예정 여행을 바로 만든다 (하루 뼈대까지) */
  const make = async () => {
    if (auth.status !== 'ready' || !data || busy || !fixed) return;
    if (when === 'pick' && !start) return toast('떠날 날을 골라 주세요');
    setBusy(true);
    try {
      const tripId = await createTrip({ title: `${placeLabel(fixed)} ${nights === 0 ? '나들이' : '여행'}`, kind: nights === 0 ? 'outing' : 'trip', status: 'planned', when: whenOf(conds), places: [fixed], companions: memberNames(), memo: '', tags: [], source: 'app' }, auth.user);
      if (wish) await updateWish(wish.id, { tripId }).catch(() => undefined);
      // 계획 이어가기가 켜져 있으면 뼈대 대신 다섯 걸음으로 (담은 곳으로 일정을 채운다)
      if (FLAGS.planFlow) { toast(`${placeLabel(fixed)} 여행을 만들었어요`); nav(`/trips/${tripId}/plan-next`, { replace: true }); return; }
      await addPlans(tripId, skeleton(fixed, conds, data));
      toast(`${placeLabel(fixed)} 여행을 만들었어요 · 하루 뼈대를 깔아 두었어요`);
      nav(`/trips/${tripId}?tab=plan`, { replace: true });
    } catch (e) { console.warn(e); toast('만들지 못했어요. 다시 해 주세요'); setBusy(false); }
  };

  if (wishLoading) return <><TopBar back title="여행 만들기" /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div></>;
  const photo = fixed ? photoForPlace(fixed) : null;

  return (
    <>
      <TopBar back title={fixed ? '여행 만들기' : '여행 계획하기'} />
      <div className="page planner" data-testid="planner">
        {fixed ? (
          <div className="planner-lead" data-testid="planner-dest">
            <img src={photo ? photo.src.s : '/art/bora-cheer.webp'} alt="" aria-hidden="true" width={360} height={360} style={photo ? { width: 64, height: 64, objectFit: 'cover', borderRadius: 14 } : undefined} />
            <span><b>{placeLong(fixed)}{wish?.spotName ? ` · ${wish.spotName}` : ''}</b><span className="small muted">목적지는 정해졌어요. 언제, 며칠인지만 고르면 갈 예정 여행이 생겨요.</span></span>
          </div>
        ) : (
          <div className="planner-lead">
            <img src="/art/bora-think.webp" alt="" aria-hidden="true" width={360} height={675} />
            <span><b>어디 갈지 몰라도 돼요</b><span className="small muted">언제·며칠·누구와만 고르면 가고 싶은 곳·제철·축제를 섞어 후보 3곳을 골라 드려요. 둘이 같은 곳을 고르면 정해져요.</span></span>
          </div>
        )}
        {wishGone && <div className="small muted" role="status">그 가고 싶은 곳은 이미 빠졌어요. 조건으로 골라 볼게요.</div>}
        <section className="planner-q">
          <div className="planner-label">언제</div>
          <div className="chips">
            {(['weekend', 'nextweekend', 'nextmonth', 'pick', 'unknown'] as WhenKind[]).map((k) => <button key={k} type="button" className={'chip' + (when === k ? ' on' : '')} aria-pressed={when === k} onClick={() => setWhen(k)}>{WHEN_LABEL[k]}</button>)}
          </div>
          {when === 'pick' && <input className="input" type="date" aria-label="떠날 날" value={start} onChange={(e) => setStart(e.target.value)} />}
          {range && <div className="tiny muted">{range.start.getMonth() + 1}월 {range.start.getDate()}일{nights > 0 ? ` ~ ${range.end.getMonth() + 1}월 ${range.end.getDate()}일` : ''}</div>}
        </section>
        <section className="planner-q">
          <div className="planner-label">며칠</div>
          <div className="chips">
            {[0, 1, 2, 3, 5].map((n) => <button key={n} type="button" className={'chip' + (nights === n ? ' on' : '')} aria-pressed={nights === n} onClick={() => setNights(n)}>{n === 5 ? '4박 이상' : nightsLabel(n)}</button>)}
          </div>
        </section>
        {!fixed && (
          <>
            <section className="planner-q">
              <div className="planner-label">누구와</div>
              <div className="chips">
                {['둘이', '부모님', '아이', '친구'].map((w) => <button key={w} type="button" className={'chip' + (who === w ? ' on' : '')} aria-pressed={who === w} onClick={() => setWho(w)}>{w}</button>)}
              </div>
            </section>
            <section className="planner-q">
              <div className="planner-label">어디쯤</div>
              <div className="chips">
                {([['kr', '국내'], ['world', '해외'], ['any', '상관없어요']] as const).map(([k, l]) => <button key={k} type="button" className={'chip' + (scope === k ? ' on' : '')} aria-pressed={scope === k} onClick={() => setScope(k)}>{l}</button>)}
              </div>
              {scope === 'world' && nights < 2 && <div className="tiny muted">해외는 2박부터 가까운 곳(4시간 안)이 나와요.</div>}
            </section>
          </>
        )}
        {fixed ? (
          <>
            <button className="btn block" onClick={make} disabled={busy || !data} data-testid="planner-make">{busy ? '만드는 중…' : '여행 만들기'}</button>
            <div className="tiny muted" style={{ textAlign: 'center' }}>만들면 갈 예정 여행이 생기고, 날짜별 오전·점심·오후·저녁 뼈대와 준비 탭이 채워져요.</div>
          </>
        ) : (
          <button className="btn block" onClick={go} disabled={busy || !data} data-testid="planner-go">{busy ? '고르는 중…' : '후보 3곳 보기'}</button>
        )}
      </div>
    </>
  );
}

function usePlannerData() {
  const { wishes } = useWishes();
  const { trips } = useTrips();
  const { places: recs } = usePlaces();
  const info = useTravelInfo();
  const seasons = useSeasons();
  const festivals = useFestivals();
  const world = useWorld();
  return useMemo(() => (wishes && trips && info ? { wishes, trips, stats: computeStats(trips), info, seasons, festivals, world, recs: recs ?? [] } : null), [wishes, trips, recs, info, seasons, festivals, world]);
}

/** 후보 고르기 표시: 체크 모양 (하트는 '마음'에만 쓴다) */
function CheckMark({ on }: { on: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'none' }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" strokeWidth={on ? 2.2 : 1.6} />
      <path d="m8 12.5 2.6 2.6L16 9.5" strokeWidth={on ? 2.6 : 2} />
    </svg>
  );
}

/** 여행 계획하기 ②: 후보 3곳에서 둘이 고르기 → 모두 고른 곳으로 '여기로 정해요' */
export function PlanPick() {
  const { id } = useParams();
  const draft = useDraft(id);
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const data = usePlannerData();
  const { trips } = useTrips();
  const [busy, setBusy] = useState(false);
  if (draft === undefined || auth.status !== 'ready') return <><TopBar back title="여행 계획하기" /><div className="page"><div className="skeleton-list" aria-busy="true"><i /><i /><i /></div></div></>;
  if (draft === null) return <><TopBar back title="여행 계획하기" /><div className="page"><div className="empty"><b>이 계획을 찾을 수 없어요</b><Link to="/plan" className="btn sm">새로 계획하기</Link></div></div></>;
  const uid = auth.user.uid;
  const mine = draft.hearts[uid] ?? [];
  const need = Math.max(1, memberNames().length);
  const heartsFor = (k: string) => Object.entries(draft.hearts).filter(([, ks]) => ks.includes(k)).map(([u]) => (u === uid ? '나' : draft.names[u] ?? '상대'));
  const decidedTrip = draft.tripId ? trips?.find((t) => t.id === draft.tripId) : null;
  const toggle = (k: string) => setMyHearts(draft.id, auth.user, mine.includes(k) ? mine.filter((x) => x !== k) : [...mine, k]).catch(() => toast('저장하지 못했어요'));

  const decide = async (k: string) => {
    if (!data || busy) return;
    const c = draft.cands.find((x) => candidateKey(x.place) === k);
    if (!c) return;
    setBusy(true);
    try {
      const tripId = await createTrip({ title: `${placeLabel(c.place)} ${draft.conds.nights === 0 ? '나들이' : '여행'}`, kind: draft.conds.nights === 0 ? 'outing' : 'trip', status: 'planned', when: whenOf(draft.conds), places: [c.place], companions: memberNames(), memo: '', tags: [], source: 'app' }, auth.user);
      if (!FLAGS.planFlow) await addPlans(tripId, skeleton(c.place, draft.conds, data));
      if (c.wishId) await updateWish(c.wishId, { tripId }).catch(() => undefined);
      await markDecided(draft.id, tripId);
      // 계획 이어가기가 켜져 있으면 정한 다음 바로 다섯 걸음으로
      if (FLAGS.planFlow) { toast(`${withRo(placeLabel(c.place))} 정했어요 · 이어서 계획해요`); nav(`/trips/${tripId}/plan-next`); return; }
      toast(`${withRo(placeLabel(c.place))} 정했어요 · 하루 뼈대를 깔아 두었어요`);
      nav(`/trips/${tripId}?tab=plan`);
    } catch (e) { console.warn(e); toast('만들지 못했어요. 다시 해 주세요'); setBusy(false); }
  };
  const reroll = async () => {
    if (!data) return;
    const skip = draft.cands.map((c) => candidateKey(c.place));
    const next = planCandidates(draft.conds, data, new Date(), skip);
    if (!next.length) return toast('더 고를 곳이 없어요. 조건을 바꿔 새로 계획해 보세요');
    await rerollDraft(draft.id, next, (draft.round ?? 1) + 1).then(() => toast('후보를 새로 골랐어요'), () => toast('바꾸지 못했어요'));
  };
  const share = async () => {
    const r = await shareAnyhow({ title: '여행 후보 골라 줘', description: `${WHEN_LABEL[draft.conds.when]} · ${nightsLabel(draft.conds.nights)} · 후보 ${draft.cands.map((c) => placeLabel(c.place)).join(', ')}`, url: `${location.origin}/plan/${draft.id}`, button: '고르러 가기' }, () => toast('링크를 복사했어요'));
    if (r === 'kakao') toast('카카오톡을 열었어요 · 보낼 사람을 골라 주세요');
  };
  const summary = [WHEN_LABEL[draft.conds.when] === '날짜 고르기' ? formatWhen(whenOf(draft.conds)) : WHEN_LABEL[draft.conds.when], nightsLabel(draft.conds.nights), draft.conds.who].filter(Boolean).join(' · ');

  return (
    <>
      <TopBar back title="어디로 갈까요" />
      <div className="page planner" data-testid="plan-pick">
        <div className="small muted">{summary} · {draft.by.uid === uid ? '내가 고른 조건' : `${draft.by.name}${josaOnly(draft.by.name, '이/가')} 고른 조건`}</div>
        {decidedTrip && <Link to={`/trips/${decidedTrip.id}`} className="card coral-soft" data-testid="plan-decided"><b>{decidedTrip.title}</b>{withRo(decidedTrip.title).slice(decidedTrip.title.length)} 정했어요 · 일정 보기 ›</Link>}
        <div className="plan-cands">
          {draft.cands.map((c) => {
            const k = candidateKey(c.place);
            const who = heartsFor(k);
            const all = who.length >= need;
            const ph = photoForPlace(c.place);
            return (
              <article key={k} className={'plan-cand' + (all ? ' all' : '')} data-testid="plan-cand">
                <div className={'plan-cand-photo' + (ph ? ' has-photo' : '')} style={ph ? { backgroundImage: `url(${ph.lqip})` } : undefined}>
                  {ph && <img src={ph.src.s} alt="" loading="lazy" />}
                  <span className="plan-cand-name"><b>{placeLong(c.place)}</b></span>
                </div>
                <div className="plan-cand-body">
                  <ul className="plan-reasons">{c.reasons.slice(0, 3).map((r) => <li key={r}>{r}</li>)}</ul>
                  <CandInfo place={c.place} />
                  <div className="plan-cand-foot">
                    <button type="button" className={'my-heart' + (mine.includes(k) ? ' on' : '')} aria-pressed={mine.includes(k)} aria-label={mine.includes(k) ? `${placeLabel(c.place)} 고른 것 빼기` : `${placeLabel(c.place)} 고르기`} onClick={() => toggle(k)} data-testid="plan-heart">
                      <CheckMark on={mine.includes(k)} />
                      <span>{who.length ? who.join('·') : '여기 고르기'}</span>
                    </button>
                    {all && !draft.tripId && <button className="btn sm" onClick={() => decide(k)} disabled={busy} data-testid="plan-decide">여기로 정해요</button>}
                    {!all && who.length > 0 && need > 1 && <span className="tiny muted">상대가 고르길 기다려요</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!draft.tripId && (
          <div className="plan-actions">
            {need > 1 && <button className="btn soft" onClick={share} data-testid="plan-share"><Icon name="link" size={16} />같이 고르자고 보내기</button>}
            <button className="btn ghost" onClick={reroll} data-testid="plan-reroll"><Icon name="dice" size={16} />다른 후보</button>
          </div>
        )}
        <div className="tiny muted" style={{ textAlign: 'center' }}>둘 다 같은 곳을 고르면 '여기로 정해요'가 떠요. 정하면 갈 예정 여행이 생기고, 날짜별 오전·점심·오후·저녁 뼈대와 준비 탭이 채워져요.</div>
      </div>
    </>
  );
}

/** 후보 기본 정보: 사진만 보고 고르지 않게 (볼거리·먹거리·축제·가기 좋은 때·가는 길 / 해외는 도시 정보 + 우리 집에서 거리) */
function CandInfo({ place }: { place: Place }) {
  const home = useHome();
  const r = place.t === 'kr' ? REGION_BY_CODE.get(place.code) : undefined;
  const km = home && r ? Math.round(straightKm(home, r)) : null;
  return (
    <details className="plan-info" data-testid="plan-info">
      <summary>기본 정보{km != null && km >= 1 ? ` · 우리 집에서 직선 ${km}km` : ''}</summary>
      <PlaceHint place={place} />
    </details>
  );
}
