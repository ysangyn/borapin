import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WishCard from './WishCard';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import type { Stats } from '../lib/data';
import { placeLong } from '../lib/geo';
import { monthlyPicks } from '../lib/recommend';
import { isGoodNow, seasonFor, useSeasons } from '../lib/seasons';
import { useTravelInfo } from '../lib/travelinfo';
import { quickWish, rollingOrder, wishState } from '../lib/wishes';
import type { Trip, Wish } from '../lib/types';

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
  const picks = useMemo(() => (items.length ? [] : monthlyPicks(3, stats, info, seasons, wishes)), [items.length, stats, info, seasons, wishes]);

  // 6초마다 다음 카드 (손으로 넘기면 15초 쉬기)
  useEffect(() => {
    if (items.length < 2) return;
    const t = window.setInterval(() => {
      if (Date.now() < paused.current || !box.current) return;
      const next = (idx + 1) % items.length;
      box.current.scrollTo({ left: next * box.current.clientWidth * 0.9, behavior: 'smooth' });
    }, 6000);
    return () => window.clearInterval(t);
  }, [items.length, idx]);

  const onScroll = () => {
    const el = box.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / (el.clientWidth * 0.9)));
  };

  const add = async (c: (typeof picks)[number]) => {
    if (auth.status !== 'ready') return;
    const id = await quickWish(c.place, auth.user);
    toast(`${c.name}을(를) 담았어요`, { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
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
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 700 }}>{placeLong(c.place)}</span>
                {c.theme && <span className="tiny muted" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.theme}</span>}
              </span>
              <button className="btn sm coral" onClick={() => add(c)}><Icon name="heart" size={14} stroke={2.2} />담기</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
