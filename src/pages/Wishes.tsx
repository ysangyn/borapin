import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import WishCard, { wishTitle } from '../components/WishCard';
import DicePicker from '../components/DicePicker';
import { useAuth } from '../lib/auth';
import { computeStats, deleteWish, reviveWish, useTrips, useWishes } from '../lib/data';
import { placeLong } from '../lib/geo';
import { monthlyPicks } from '../lib/recommend';
import { monthsLabel, seasonFor, useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { bothWant, sortWishes, wishState } from '../lib/wishes';
import { quickWish } from '../lib/wishActions';

type Filter = 'all' | 'both' | 'kr' | 'abroad';

export default function Wishes() {
  const { wishes } = useWishes();
  const { trips } = useTrips();
  const seasons = useSeasons();
  const info = useTravelInfo();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [dice, setDice] = useState(false);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);

  const withState = useMemo(
    () => (wishes && trips ? sortWishes(wishes).map((w) => ({ w, s: wishState(w, trips) })) : []),
    [wishes, trips],
  );
  const active = withState.filter((x) => x.s.kind !== 'done');
  const done = withState.filter((x) => x.s.kind === 'done');
  const shown = active.filter(({ w }) =>
    filter === 'both' ? bothWant(w) : filter === 'kr' ? w.place.t === 'kr' : filter === 'abroad' ? w.place.t === 'country' : true,
  );
  const picks = useMemo(() => monthlyPicks(3, stats, info, seasons, wishes ?? []), [stats, info, seasons, wishes]);
  const month = new Date().getMonth() + 1;

  const addPick = async (place: Parameters<typeof quickWish>[0], name: string) => {
    if (auth.status !== 'ready') return;
    const id = await quickWish(place, auth.user);
    toast(`${name}을(를) 담았어요`, { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
  };

  return (
    <>
      <TopBar
        back
        title="가고 싶은 곳"
        right={<Link to="/wishes/new" className="btn sm coral" data-testid="wish-new"><Icon name="plus" size={16} stroke={2.4} />담기</Link>}
      />
      <div className="page" style={{ paddingTop: 4 }}>
        {wishes && active.length > 0 && (
          <div className="chips" role="tablist">
            <button className={'chip' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>전체 {active.length}</button>
            <button className={'chip' + (filter === 'both' ? ' on' : '')} onClick={() => setFilter('both')}>둘 다 원해요 {active.filter((x) => bothWant(x.w)).length}</button>
            <button className={'chip' + (filter === 'kr' ? ' on' : '')} onClick={() => setFilter('kr')}>국내</button>
            <button className={'chip' + (filter === 'abroad' ? ' on' : '')} onClick={() => setFilter('abroad')}>해외</button>
          </div>
        )}

        {wishes && active.length === 0 && (
          <div className="card coral-soft" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-testid="wish-empty">
            <b style={{ fontSize: 17 }}>가고 싶은 곳 3곳만 담아볼까요?</b>
            <span className="small muted">지도에서 지역을 누르거나, 아래 추천과 여행지 뽑기로 담을 수 있어요.</span>
          </div>
        )}

        <div className="list">
          {shown.map(({ w, s }) => <WishCard key={w.id} wish={w} state={s} seasons={seasons} />)}
        </div>

        {(active.length < 3 || dice) && picks.length > 0 && (
          <section>
            <h2 className="h2" style={{ marginBottom: 6 }}>{month}월에 가 볼 만한 곳</h2>
            <div className="list">
              {picks.map((c) => {
                const season = seasonFor(seasons, c.place);
                return (
                  <div key={placeLong(c.place)} className="wish-card" data-testid="pick">
                    <div className="wish-main" style={{ cursor: 'default' }}>
                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="t">{placeLong(c.place)}</span>
                        {c.theme && <span className="tiny" style={{ color: '#33248a' }}>{c.theme}</span>}
                        {season && <span className="tiny muted">가기 좋은 때 {monthsLabel(season.m)}</span>}
                      </span>
                    </div>
                    <button className="btn sm coral" onClick={() => addPick(c.place, c.name)}><Icon name="heart" size={15} stroke={2.2} />담기</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {dice ? (
          <DicePicker stats={stats} info={info} seasons={seasons} wishes={wishes ?? []} />
        ) : (
          <button className="btn ghost block" onClick={() => setDice(true)} data-testid="dice-open"><Icon name="dice" size={18} />여행지 뽑기</button>
        )}

        {done.length > 0 && (
          <section>
            <h2 className="h2" style={{ marginBottom: 6 }}>다녀왔어요 · {done.length}</h2>
            <div className="list">
              {done.map(({ w }) => (
                <div key={w.id} className="wish-card done">
                  <span className="t" style={{ flex: 1 }}>{wishTitle(w)}</span>
                  <button className="btn sm ghost" onClick={() => reviveWish(w.id).then(() => toast('다시 가고 싶은 곳에 담았어요'))}>또 가고 싶어요</button>
                  <button className="btn sm line" onClick={() => deleteWish(w.id).then(() => toast('지웠어요'))}>지우기</button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
