import { useEffect, useMemo, useRef, useState } from 'react';
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

/** 홈 '가고 싶은 곳' 롤링: 둘 다 원하는 곳 → 이번 달이 좋은 곳 → 랜덤. 비어 있으면 이번 달 추천 3곳. */
export default function WishRolling({ wishes, trips, stats }: { wishes: Wish[]; trips: Trip[]; stats: Stats | null }) {
  const seasons = useSeasons();
  const info = useTravelInfo();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const box = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const paused = useRef(0);

  const items = useMemo(() => {
    const active = wishes.map((w) => ({ w, s: wishState(w, trips) })).filter((x) => x.s.kind !== 'done');
    const order = rollingOrder(active.map((x) => x.w), (w) => isGoodNow(seasonFor(seasons, w.place, w.months)));
    return order.map((w) => active.find((x) => x.w.id === w.id)!);
  }, [wishes, trips, seasons]);
  const festivals = useFestivals();
  const picks = useMemo(() => (items.length ? [] : monthlyPicks(3, stats, info, seasons, wishes, festivals)), [items.length, stats, info, seasons, wishes, festivals]);

  // 6초마다 다음 카드 (손으로 넘기면 15초 쉬기)
  useEffect(() => {
    if (items.length < 2) return;
    const t = window.setInterval(() => {
      if (Date.now() < paused.current || !box.current) return;
      const next = (idx + 1) % items.length;
      const child = box.current.children[next] as HTMLElement | undefined;
      if (child) box.current.scrollTo({ left: child.offsetLeft - box.current.offsetLeft - 20, behavior: 'smooth' });
    }, 6000);
    return () => window.clearInterval(t);
  }, [items.length, idx]);

  const onScroll = () => {
    const el = box.current;
    if (!el) return;
    // 왼쪽에 가장 가까운 카드가 지금 카드
    let best = 0, dist = Infinity;
    [...el.children].forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - el.offsetLeft - 20 - el.scrollLeft);
      if (d < dist) { dist = d; best = i; }
    });
    setIdx(best);
  };

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
        <>
          <div
            className="rolling"
            ref={box}
            onScroll={onScroll}
            onPointerDown={() => (paused.current = Date.now() + 15000)}
            onTouchStart={() => (paused.current = Date.now() + 15000)}
          >
            {items.map(({ w, s }) => (
              <div key={w.id} className="rolling-item"><WishCard wish={w} state={s} seasons={seasons} compact /></div>
            ))}
          </div>
          {items.length > 1 && (
            <div className="dots" aria-hidden="true">{items.map((x, i) => <i key={x.w.id} className={i === idx ? 'on' : ''} />)}</div>
          )}
        </>
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
