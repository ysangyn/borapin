import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, displayName } from '../lib/auth';
import { patchTrip } from '../lib/data';
import { SEASON_LABEL } from '../lib/dates';
import type { Season, Trip } from '../lib/types';
import { dailyShuffle } from '../lib/wishes';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const label = (g: { y?: number; s?: Season }) => [g.y ? `${g.y}` : '', g.s ? SEASON_LABEL[g.s] : ''].filter(Boolean).join(' ') || '모르겠어요';

/** 날짜 채우기 놀이: "이 여행, 언제였을까요?" 둘의 답이 다르면 그것도 이야깃거리 */
export default function DateGame({ trips }: { trips: Trip[] }) {
  const auth = useAuth();
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const pick = useMemo(() => {
    const pool = trips.filter((t) => t.status === 'done' && (t.when.p === 'unknown' || (t.when.p === 'year' && !t.when.s)));
    return dailyShuffle(pool, 'date-game')[0] ?? null;
  }, [trips]);
  const [y, setY] = useState<number | undefined>(pick?.when.y);
  const [s, setS] = useState<Season | undefined>();
  if (!pick) return null;
  const now = new Date().getFullYear();
  const guesses = pick.guesses ?? {};
  const mine = guesses[me];
  const others = Object.entries(guesses).filter(([k]) => k !== me);

  const answer = () => patchTrip(pick.id, { guesses: { ...guesses, [me]: { ...(y ? { y } : {}), ...(s ? { s } : {}) } } });
  const decide = (g: { y?: number; s?: Season }) =>
    patchTrip(pick.id, { when: g.s && g.y ? { p: 'season', y: g.y, s: g.s } : g.s ? { p: 'season', s: g.s } : g.y ? { p: 'year', y: g.y } : { p: 'unknown' }, guesses: {} });

  return (
    <section className="card coral-soft" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-testid="date-game">
      <div className="tiny" style={{ color: 'var(--coral-ink)', fontWeight: 800 }}>날짜 채우기 놀이</div>
      <div><b>이 여행, 언제였을까요?</b> <Link to={`/trips/${pick.id}`} className="small">{pick.title}</Link></div>
      {!mine ? (
        <>
          {pick.when.p === 'unknown' && (
            <div className="chips">
              {Array.from({ length: 8 }, (_, i) => now - i).map((yy) => (
                <button key={yy} className={'chip' + (y === yy ? ' on' : '')} onClick={() => setY(yy)}>{yy}</button>
              ))}
              <select className="select" style={{ height: 34, width: 'auto' }} aria-label="더 예전" value={y && y < now - 7 ? y : ''} onChange={(e) => setY(+e.target.value || undefined)}>
                <option value="">더 예전</option>
                {Array.from({ length: 30 }, (_, i) => now - 8 - i).map((yy) => <option key={yy} value={yy}>{yy}</option>)}
              </select>
            </div>
          )}
          <div className="chips">
            {SEASONS.map((x) => <button key={x} className={'chip' + (s === x ? ' on' : '')} onClick={() => setS(s === x ? undefined : x)}>{SEASON_LABEL[x]}</button>)}
          </div>
          <button className="btn sm" style={{ alignSelf: 'flex-start' }} disabled={!y && !s} onClick={answer}>답하기</button>
        </>
      ) : (
        <div className="small">내 답: <b>{label(mine)}</b></div>
      )}
      {others.map(([who, g]) => (
        <div key={who} className="small">{who}의 답: <b>{label(g)}</b>{mine && label(mine) !== label(g) ? ' · 서로 달라요!' : ''}</div>
      ))}
      {mine && (
        <div className="chips">
          {[[me, mine] as const, ...others].map(([who, g]) => (
            <button key={who} className="chip soft-on" onClick={() => decide(g)}>{label(g)}(으)로 정하기</button>
          ))}
        </div>
      )}
    </section>
  );
}
