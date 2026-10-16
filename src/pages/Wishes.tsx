import { useMemo, useState } from 'react';
import { josa } from 'es-hangul';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import WishCard, { wishTitle } from '../components/WishCard';
import DicePicker from '../components/DicePicker';
import { useAuth, displayName } from '../lib/auth';
import { computeStats, deleteWish, restoreWish, reviveWish, useTrips, useWishes } from '../lib/data';
import { placeLabel, placeLong } from '../lib/geo';
import type { Place, Wish } from '../lib/types';
import { monthlyPicks } from '../lib/recommend';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { bothWant, sortWishes, wishState, type WishState } from '../lib/wishes';
import { everyoneLabel, memberNames } from '../lib/members';
import NewsStrip from '../components/NewsStrip';
import { quickWish } from '../lib/wishActions';
import { festivalPeriod, upcomingFestivals, useFestivals } from '../lib/festivals';

/**
 * 가고 싶은 곳: 둘의 버킷리스트.
 * 1) 둘 다 원해요 — 사진 크게, '여행 만들기'   2) 한 명만 — 한 줄, 오른쪽에 '나도 원해요' 하트   3) 예정 — 한 줄, 예정 꼬리표
 * 그 아래 '찾아보기'(뽑기·해외 도시·이달의 추천·소식), 맨 아래 접힌 '다녀왔어요'.
 */
export default function Wishes() {
  const { wishes } = useWishes();
  const { trips } = useTrips();
  const seasons = useSeasons();
  const info = useTravelInfo();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const [who, setWho] = useState<string>('all'); // all · both · 이름
  const [dice, setDice] = useState<false | 'kr' | 'world'>(false);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);

  const withState = useMemo(
    () => (wishes && trips ? sortWishes(wishes).map((w) => ({ w, s: wishState(w, trips) })) : []),
    [wishes, trips],
  );
  const active = withState.filter((x) => x.s.kind !== 'done');
  const done = withState.filter((x) => x.s.kind === 'done');
  const shown = active.filter(({ w }) => (who === 'all' ? true : who === 'both' ? bothWant(w) : (w.wantedBy ?? []).includes(who)));
  const both = shown.filter(({ w, s }) => bothWant(w) && s.kind === 'wish');
  const planned = shown.filter(({ s }) => s.kind === 'planned');
  // 한 명만: 상대가 담은 곳(내가 하트를 누를 차례)을 먼저
  const single = shown.filter(({ w, s }) => !bothWant(w) && s.kind === 'wish').sort((a, b) => Number((a.w.wantedBy ?? []).includes(me)) - Number((b.w.wantedBy ?? []).includes(me)));
  const festivals = useFestivals();
  const picks = useMemo(() => monthlyPicks(3, stats, info, seasons, wishes ?? [], festivals), [stats, info, seasons, wishes, festivals]);
  const month = new Date().getMonth() + 1;
  const names = memberNames();

  const addPick = async (place: Parameters<typeof quickWish>[0], name: string) => {
    if (auth.status !== 'ready') return;
    try {
      const { id, already } = await quickWish(place, auth.user, wishes ?? []);
      toast(already ? '이미 담겨 있어요' : `${josa(name, '을/를')} 담았어요`, { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch {
      toast('담지 못했어요. 다시 해 주세요');
    }
  };

  const group = (title: string, items: { w: Wish; s: WishState }[], hero = false, hint?: string) => items.length > 0 && (
    <section className="wish-group" data-testid={`wish-group-${hero ? 'both' : title}`}>
      <div className="wish-group-head"><h2 className="h2">{title}</h2><span className="tiny muted">{items.length}곳{hint ? ` · ${hint}` : ''}</span></div>
      <div className={hero ? 'wish-heroes' : 'list card white wish-rows'}>
        {items.map(({ w, s }) => <WishCard key={w.id} wish={w} state={s} seasons={seasons} hero={hero} />)}
      </div>
    </section>
  );

  return (
    <>
      <TopBar
        back
        title="가고 싶은 곳"
        right={<Link to="/wishes/new" className="btn sm coral" data-testid="wish-new"><Icon name="plus" size={16} stroke={2.4} />담기</Link>}
      />
      <div className="page" style={{ paddingTop: 4 }}>
        {(!wishes || !trips) && <div className="skeleton-list" aria-busy="true"><i /><i /><i /></div>}

        {wishes && active.length > 0 && (
          <div className="seg tabs" role="tablist" aria-label="누가 원하는 곳">
            <button role="tab" aria-selected={who === 'all'} className={who === 'all' ? 'on' : ''} onClick={() => setWho('all')}>전체 {active.length}</button>
            <button role="tab" aria-selected={who === 'both'} className={who === 'both' ? 'on' : ''} onClick={() => setWho('both')}>{everyoneLabel()} {active.filter((x) => bothWant(x.w)).length}</button>
            {names.map((n) => <button key={n} role="tab" aria-selected={who === n} className={who === n ? 'on' : ''} onClick={() => setWho(n)}>{n === me ? '나' : n} {active.filter((x) => (x.w.wantedBy ?? []).includes(n)).length}</button>)}
          </div>
        )}
        {wishes && active.length > 0 && shown.length === 0 && (
          <div className="small muted" style={{ textAlign: 'center' }}>이 조건에 맞는 곳이 없어요 · <button className="link-btn" style={{ display: 'inline' }} onClick={() => setWho('all')}>전체 보기</button></div>
        )}

        {wishes && trips && active.length === 0 && (
          <div className="card coral-soft art-row" data-testid="wish-empty">
            <img src="/art/bora-think.webp" alt="" aria-hidden="true" width={360} height={675} decoding="async" />
            <span>
              <b style={{ display: 'block', fontSize: 17, marginBottom: 4 }}>가고 싶은 곳 3곳만 담아볼까요?</b>
              <span className="small muted">지도에서 지역을 누르거나, 아래 추천과 여행지 뽑기로 담을 수 있어요. 상대가 담은 곳에 하트를 누르면 '{everyoneLabel()}'가 돼요.</span>
            </span>
          </div>
        )}

        {group(everyoneLabel(), both, true, '여행으로 만들 차례')}
        {group('한 명만 원해요', single, false, single.some(({ w }) => !(w.wantedBy ?? []).includes(me)) ? '하트를 눌러 마음을 맞춰요' : undefined)}
        {group('예정', planned)}

        {wishes && trips && (
          <section className="wish-group" data-testid="wish-find">
            <div className="wish-group-head"><h2 className="h2">찾아보기</h2></div>
            {dice ? (
              <DicePicker stats={stats} info={info} seasons={seasons} wishes={wishes} initialScope={dice} />
            ) : (
              <div className="find-tiles">
                <button className="find-tile" onClick={() => setDice('kr')} data-testid="dice-open"><Icon name="dice" size={22} /><b>여행지 뽑기</b><span className="tiny">국내 160곳 · 테마로</span></button>
                <button className="find-tile" onClick={() => setDice('world')} data-testid="world-open"><Icon name="globe" size={22} /><b>해외 도시 고르기</b><span className="tiny">125곳 · 예산·비행·누구와</span></button>
              </div>
            )}
            {(active.length < 3 || dice) && picks.length > 0 && (
              <div className="card white wish-rows" style={{ marginTop: 10 }}>
                <div className="tiny" style={{ fontWeight: 800, color: 'var(--ink3)', padding: '4px 0 2px' }}>{month}월에 가 볼 만한 곳</div>
                {picks.map((c) => {
                  const season = seasonFor(seasons, c.place);
                  const fest = c.place.t === 'kr' ? upcomingFestivals(festivals, c.place.code, new Date(), 40)[0] : undefined;
                  return (
                    <div key={placeLong(c.place)} className="wish-card" data-testid="pick">
                      <div className="wish-main" style={{ cursor: 'default' }}>
                        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className="t">{placeLong(c.place)}</span>
                          {c.theme && <span className="tiny" style={{ color: '#33248a' }}>{c.theme}</span>}
                          {fest && <span className="tiny" style={{ color: 'var(--coral-ink)', fontWeight: 700 }}>축제 · {fest.t} {festivalPeriod(fest)}</span>}
                          {season && <span className="tiny muted">가기 좋은 때 {monthsLabel(season.m)}</span>}
                        </span>
                      </div>
                      <button className="btn sm coral" onClick={() => addPick(c.place, c.name)}><Icon name="heart" size={15} stroke={2.2} />담기</button>
                    </div>
                  );
                })}
              </div>
            )}
            {active.length > 0 && who === 'all' && (
              <WishNews places={sortWishes(active.map((x) => x.w)).map((w) => w.place).filter((p): p is Place & { t: 'kr' } => p.t === 'kr').slice(0, 3)} />
            )}
          </section>
        )}

        {done.length > 0 && (
          <details className="wish-done">
            <summary><span>다녀왔어요 · {done.length}</span><Icon name="chev" size={16} /></summary>
            <div className="list card white wish-rows">
              {done.map(({ w }) => (
                <div key={w.id} className="wish-card done">
                  <span className="t" style={{ flex: 1 }}>{wishTitle(w)}</span>
                  <button className="btn sm ghost" onClick={() => reviveWish(w.id).then(() => toast('다시 가고 싶은 곳에 담았어요'), () => toast('바꾸지 못했어요'))}>또 가고 싶어요</button>
                  <button className="btn sm line" onClick={() => { deleteWish(w.id).catch(() => toast('지우지 못했어요')); toast('목록에서 지웠어요', { label: '되돌리기', onClick: () => void restoreWish(w) }); }}>지우기</button>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </>
  );
}

/** 가고 싶은 곳 소식 (뒷단이 있을 때만 보인다) */
function WishNews({ places }: { places: Place[] }) {
  if (!places.length) return null;
  return (
    <div className="card white" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }} data-testid="wish-news">
      <div className="tiny" style={{ fontWeight: 800, color: 'var(--ink3)' }}>담아 둔 곳 소식 · 한 곳에 한 줄</div>
      {places.map((p) => <NewsStrip key={placeLabel(p)} place={p} max={1} title={placeLabel(p)} />)}
    </div>
  );
}
