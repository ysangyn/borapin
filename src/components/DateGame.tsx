import { useMemo, useState } from 'react';
import { josa } from 'es-hangul';
import { Link } from 'react-router-dom';
import { useToast } from './ui';
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
    // 이미 정한 여행(dateGameDone)은 다시 묻지 않는다
    const pool = trips.filter((t) => t.status === 'done' && !t.dateGameDone && (t.when.p === 'unknown' || (t.when.p === 'year' && !t.when.s)));
    return dailyShuffle(pool, 'date-game')[0] ?? null;
  }, [trips]);
  // 고르던 답은 그 여행에만 (다른 여행으로 바뀌면 비운다)
  const [ans, setAns] = useState<{ id?: string; y?: number; s?: Season }>({});
  const cur = ans.id === pick?.id ? ans : { id: pick?.id, y: pick?.when.y };
  const y = cur.y, s = cur.s;
  const setY = (v: number | undefined) => setAns({ ...cur, y: v });
  const setS = (v: Season | undefined) => setAns({ ...cur, s: v });
  const toast = useToast();
  if (!pick) return null;
  const now = new Date().getFullYear();
  const guesses = pick.guesses ?? {};
  const mine = guesses[me];
  const others = Object.entries(guesses).filter(([k]) => k !== me);

  // 내 답만 고친다 (상대 답을 덮어쓰지 않게)
  const answer = () => patchTrip(pick.id, { [`guesses.${me}`]: { ...(y ? { y } : {}), ...(s ? { s } : {}) } }).then(() => toast('답했어요. 상대도 답하면 서로 비교해 봐요'), () => toast('저장하지 못했어요'));
  const decide = (g: { y?: number; s?: Season }) =>
    patchTrip(pick.id, { when: g.s && g.y ? { p: 'season', y: g.y, s: g.s } : g.s ? { p: 'season', s: g.s } : g.y ? { p: 'year', y: g.y } : { p: 'unknown' }, guesses: {}, dateGameDone: true }).then(() => toast('날짜를 정했어요'), () => toast('저장하지 못했어요'));

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
              <select className="select" style={{ height: 38, width: 'auto' }} aria-label="더 예전" value={y && y < now - 7 ? y : ''} onChange={(e) => setY(+e.target.value || undefined)}>
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
            <button key={who} className="chip soft-on" onClick={() => decide(g)}>{label(g) === '모르겠어요' ? '모르는 걸로 정하기' : `${josa(label(g), '으로/로')} 정하기`}</button>
          ))}
        </div>
      )}
    </section>
  );
}
