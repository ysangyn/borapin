import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { computeStats, createTrip, updateWish, usePlaces, useTrips, useWishes } from '../lib/data';
import { useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { useFestivals } from '../lib/festivals';
import { useWorld } from '../lib/world';
import { placeLabel, placeLong } from '../lib/geo';
import { photoForPlace } from '../lib/media';
import { memberNames, everyoneLabel } from '../lib/members';
import { addPlans } from '../lib/tripExtras';
import { candidateKey, dateRange, nightsLabel, planCandidates, skeleton, WHEN_LABEL, whenOf, type PlanConds, type WhenKind } from '../lib/planner';
import { createDraft, markDecided, rerollDraft, setMyHearts, useDraft } from '../lib/planDrafts';
import { shareAnyhow } from '../lib/kakao';
import { formatWhen } from '../lib/dates';

/** 여행 계획하기 ①: 어디를 몰라도 조건만 고르면 후보 3곳 */
export default function Planner() {
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const data = usePlannerData();
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

  return (
    <>
      <TopBar back title="여행 계획하기" />
      <div className="page planner" data-testid="planner">
        <div className="planner-lead">
          <img src="/art/bora-think.webp" alt="" aria-hidden="true" width={360} height={675} />
          <span><b>어디 갈지 몰라도 돼요</b><span className="small muted">언제·며칠·누구와만 고르면 가고 싶은 곳·제철·축제를 섞어 후보 3곳을 골라 드려요. 둘이 하트를 누르면 정해져요.</span></span>
        </div>
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
        <button className="btn block" onClick={go} disabled={busy || !data} data-testid="planner-go">{busy ? '고르는 중…' : '후보 3곳 보기'}</button>
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

/** 여행 계획하기 ②: 후보 3곳에 둘이 하트 → 모두 하트한 곳으로 '여기로 정해요' */
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
      await addPlans(tripId, skeleton(c.place, draft.conds, data));
      if (c.wishId) await updateWish(c.wishId, { tripId }).catch(() => undefined);
      await markDecided(draft.id, tripId);
      toast(`${placeLabel(c.place)}로 정했어요 · 하루 뼈대를 깔아 두었어요`);
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
    const r = await shareAnyhow({ title: '여행 후보 골라 줘', description: `${WHEN_LABEL[draft.conds.when]} · ${nightsLabel(draft.conds.nights)} · 후보 ${draft.cands.map((c) => placeLabel(c.place)).join(', ')}`, url: `${location.origin}/plan/${draft.id}`, button: '하트 누르러 가기' }, () => toast('링크를 복사했어요'));
    if (r === 'kakao') toast('카카오톡을 열었어요 · 보낼 사람을 골라 주세요');
  };
  const summary = [WHEN_LABEL[draft.conds.when] === '날짜 고르기' ? formatWhen(whenOf(draft.conds)) : WHEN_LABEL[draft.conds.when], nightsLabel(draft.conds.nights), draft.conds.who].filter(Boolean).join(' · ');

  return (
    <>
      <TopBar back title="어디로 갈까요" />
      <div className="page planner" data-testid="plan-pick">
        <div className="small muted">{summary} · {draft.by.uid === uid ? '내가 고른 조건' : `${draft.by.name}이(가) 고른 조건`}</div>
        {decidedTrip && <Link to={`/trips/${decidedTrip.id}`} className="card coral-soft" data-testid="plan-decided"><b>{decidedTrip.title}</b>로 정했어요 · 일정 보기 ›</Link>}
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
                  <div className="plan-cand-foot">
                    <button type="button" className={'my-heart' + (mine.includes(k) ? ' on' : '')} aria-pressed={mine.includes(k)} onClick={() => toggle(k)} data-testid="plan-heart">
                      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>
                      <span>{who.length ? who.join('·') : '여기 좋아요'}</span>
                    </button>
                    {all && !draft.tripId && <button className="btn sm" onClick={() => decide(k)} disabled={busy} data-testid="plan-decide">{need > 1 ? `${everyoneLabel()} · ` : ''}여기로 정해요</button>}
                    {!all && who.length > 0 && need > 1 && <span className="tiny muted">상대 하트를 기다려요</span>}
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
        <div className="tiny muted" style={{ textAlign: 'center' }}>정하면 갈 예정 여행이 생기고, 날짜별 오전·점심·오후·저녁 뼈대와 준비 탭이 채워져요.</div>
      </div>
    </>
  );
}
