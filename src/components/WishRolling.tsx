import { useMemo } from 'react';
import { josa } from 'es-hangul';
import { Link, useNavigate } from 'react-router-dom';
import WishCard from './WishCard';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import type { Stats } from '../lib/data';
import { placeLong, placeParam } from '../lib/geo';
import { monthlyPicks } from '../lib/recommend';
import { isGoodNow, seasonFor, useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { rollingOrder, wishState } from '../lib/wishes';
import { quickWish } from '../lib/wishActions';
import type { Trip, Wish } from '../lib/types';
import { useFestivals } from '../lib/festivals';

/** 홈 '가고 싶은 곳': 둘 다 원하는 곳 → 지금 가기 좋은 곳 → 나머지(날마다 섞음) 중 3곳을 조용히 보여 준다. 비어 있으면 이번 달 추천 3곳. */
export default function WishRolling({ wishes, trips, stats }: { wishes: Wish[]; trips: Trip[]; stats: Stats | null }) {
  const seasons = useSeasons();
  const info = useTravelInfo();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const items = useMemo(() => {
    const active = wishes.map((w) => ({ w, s: wishState(w, trips) })).filter((x) => x.s.kind !== 'done');
    const order = rollingOrder(active.map((x) => x.w), (w) => isGoodNow(seasonFor(seasons, w.place, w.months)));
    return order.map((w) => active.find((x) => x.w.id === w.id)!);
  }, [wishes, trips, seasons]);
  const festivals = useFestivals();
  const picks = useMemo(() => (items.length ? [] : monthlyPicks(3, stats, info, seasons, wishes, festivals)), [items.length, stats, info, seasons, wishes, festivals]);

  const add = async (c: (typeof picks)[number]) => {
    if (auth.status !== 'ready') return;
    try {
      const { id, already } = await quickWish(c.place, auth.user, wishes);
      toast(already ? '이미 담겨 있어요' : `${josa(c.name, '을/를')} 담았어요`, { label: already ? '보기' : '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch {
      toast('담지 못했어요. 다시 해 주세요');
    }
  };

  return (
    <section data-testid="home-wishes">
      <div className="row-between" style={{ marginBottom: 6 }}>
        <h2 className="h2" style={{ color: '#b4472c' }}>가고 싶은 곳</h2>
        <Link to="/wishes" className="small" style={{ fontWeight: 600 }}>{items.length ? `모두 보기 ${items.length}` : '여행지 뽑기'}</Link>
      </div>
      {items.length > 0 ? (
        <div className="card white wish-home" data-testid="wish-home">
          {items.slice(0, 3).map(({ w, s }) => (
            <WishCard key={w.id} wish={w} state={s} seasons={seasons} compact />
          ))}
          {items.length > 3 && <Link to="/wishes" className="small wish-home-more">외 {items.length - 3}곳 더 보기</Link>}
        </div>
      ) : (
        <div className="card coral-soft" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <b>가고 싶은 곳 3곳만 담아볼까요?</b>
          {picks.map((c) => (
            <div key={placeLong(c.place)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* 이름을 누르면 지도의 지역 창(볼거리·축제·우리 기록·다녀왔어요·자세히 기록)으로 */}
              <Link to={`/map?sel=${placeParam(c.place)}`} className="pick-link" style={{ flex: 1, minWidth: 0 }} aria-label={`${placeLong(c.place)} 자세히 보기`} data-testid="pick-detail">
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>{placeLong(c.place)}<Icon name="chev" size={14} /></span>
                {c.theme && <span className="tiny muted" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.theme}</span>}
              </Link>
              <button className="btn sm coral" onClick={() => add(c)}><Icon name="heart" size={14} stroke={2.2} />담기</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
