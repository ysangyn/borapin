import { useMemo, useState } from 'react';
import { josa } from 'es-hangul';
import { Link, useSearchParams } from 'react-router-dom';
import { Avatars, Icon, TopBar } from '../components/ui';
import TripRow from '../components/TripRow';
import WishCard from '../components/WishCard';
import { useSeasons } from '../lib/seasons';
import { sortWishes, wishState } from '../lib/wishes';
import { usePlaces, useTrips, useWishes } from '../lib/data';
import { normalizeQuery, placeLong } from '../lib/geo';
import type { Trip } from '../lib/types';
import { whenSortKey } from '../lib/dates';
import { times } from '../lib/ko';

type Filter = 'all' | 'kr' | 'abroad';

export default function Trips() {
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const [filter, setFilter] = useState<Filter>('all');
  const [who, setWho] = useState<string>('');
  const [sp] = useSearchParams();
  const [q, setQ] = useState(() => sp.get('q') ?? '');
  const seasons = useSeasons();
  const { places: recs } = usePlaces();
  const activeWishes = useMemo(
    () => (wishes && trips ? sortWishes(wishes).map((w) => ({ w, s: wishState(w, trips) })).filter((x) => x.s.kind !== 'done') : []),
    [wishes, trips],
  );

  const people = useMemo(() => {
    const s = new Set<string>();
    trips?.forEach((t) => t.companions.forEach((c) => c !== '보라' && c !== '영상' && s.add(c)));
    return [...s];
  }, [trips]);

  const list = useMemo(() => {
    if (!trips) return [];
    const nq = normalizeQuery(q);
    return trips.filter((t) => {
      if (filter === 'kr' && !t.places.some((p) => p.t === 'kr')) return false;
      if (filter === 'abroad' && !t.places.some((p) => p.t === 'country')) return false;
      if (who && !t.companions.includes(who)) return false;
      if (nq) {
        const hay = normalizeQuery([t.title, t.memo, ...t.places.map(placeLong), ...t.companions].join(' '));
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [trips, filter, who, q]);

  // 다가오는 여행은 가까운 날부터 (날짜 모르는 계획은 맨 뒤)
  const planned = list.filter((t) => t.status === 'planned').sort((a, b) => (a.when.y ? whenSortKey(a.when) : 9e9) - (b.when.y ? whenSortKey(b.when) : 9e9));
  const done = list.filter((t) => t.status === 'done');
  const byYear = new Map<string, Trip[]>();
  for (const t of done) {
    const k = t.when.y ? String(t.when.y) : '날짜 모름';
    byYear.set(k, [...(byYear.get(k) ?? []), t]);
  }
  const counts = {
    all: trips?.length ?? 0,
    kr: trips?.filter((t) => t.places.some((p) => p.t === 'kr')).length ?? 0,
    abroad: trips?.filter((t) => t.places.some((p) => p.t === 'country')).length ?? 0,
  };

  return (
    <>
      <TopBar title="여행" right={<Link to="/space" aria-label="우리 공간"><Avatars /></Link>} />
      <div className="page" style={{ paddingTop: 4 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: 13, color: 'var(--ink3)' }}><Icon name="search" size={18} stroke={2} /></span>
          <input className="input" style={{ paddingLeft: 38 }} placeholder="여행, 장소, 메모, 함께 간 사람 찾기" value={q} onChange={(e) => setQ(e.target.value)} aria-label="여행 찾기" />
        </div>
        <div className="chips" role="group" aria-label="걸러 보기">
          <button className={'chip' + (filter === 'all' ? ' on' : '')} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>전체 {counts.all}</button>
          <button className={'chip' + (filter === 'kr' ? ' on' : '')} aria-pressed={filter === 'kr'} onClick={() => setFilter('kr')}>국내 {counts.kr}</button>
          <button className={'chip' + (filter === 'abroad' ? ' on' : '')} aria-pressed={filter === 'abroad'} onClick={() => setFilter('abroad')}>해외 {counts.abroad}</button>
          {people.map((p) => (
            <button key={p} className={'chip' + (who === p ? ' soft-on' : '')} aria-pressed={who === p} onClick={() => setWho(who === p ? '' : p)}>{josa(p, '와/과')}</button>
          ))}
        </div>

        <section>
          <h2 className="h2" style={{ marginBottom: 4 }}>다가오는 여행</h2>
          {planned.length ? (
            <div className="list">{planned.map((t) => <TripRow key={t.id} trip={t} />)}</div>
          ) : (
            <Link to="/record?status=planned" className="trip-row" style={{ color: 'var(--ink2)' }}>
              <span className="trip-tile planned"><Icon name="plus" size={20} stroke={2.2} /></span>
              <span style={{ fontWeight: 700 }}>여행 계획하기</span>
            </Link>
          )}
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 4 }}>다녀온 곳</h2>
          {!trips && <div className="skeleton-list" aria-busy="true"><i /><i /><i /></div>}
          {trips && done.length === 0 && (
            <div className="empty">
              {!(q || filter !== 'all' || who) && <img className="empty-figure" src="/art/bora-login.webp" alt="" aria-hidden="true" width={540} height={584} decoding="async" />}
              <b>{q || filter !== 'all' || who ? '조건에 맞는 기록이 없어요' : '아직 다녀온 기록이 없어요'}</b>
              {q || filter !== 'all' || who ? (
                <button className="btn sm ghost" onClick={() => { setQ(''); setFilter('all'); setWho(''); }}>조건 지우기</button>
              ) : (
                <Link to="/record" className="btn sm">기록 남기기</Link>
              )}
            </div>
          )}
          {[...byYear.entries()].map(([y, ts]) => (
            <div key={y}>
              <div className="year-head">{y}년 · {times(ts.length)}</div>
              <div className="list">{ts.map((t) => <TripRow key={t.id} trip={t} />)}</div>
            </div>
          ))}
        </section>
        <section data-testid="trips-wishes">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h2 className="h2">가고 싶은 곳</h2>
            <Link to="/wishes" className="small" style={{ fontWeight: 700 }}>{activeWishes.length ? `모두 보기 ${activeWishes.length}` : '담으러 가기'}</Link>
          </div>
          {!wishes || !trips ? null : activeWishes.length === 0 ? (
            <Link to="/wishes" className="trip-row" style={{ color: 'var(--ink2)' }}>
              <span className="trip-tile wish"><Icon name="heart" size={20} stroke={2.2} /></span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 700 }}>가고 싶은 곳 3곳만 담아볼까요?</span>
                <span className="tiny muted">이번 달 추천과 여행지 뽑기가 있어요</span>
              </span>
            </Link>
          ) : (
            <div className="list">{activeWishes.slice(0, 3).map(({ w, s }) => <WishCard key={w.id} wish={w} state={s} seasons={seasons} compact />)}</div>
          )}
        </section>

        <Link to="/places" className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit' }} data-testid="trips-places">
          <span className="kind-badge k-food" style={{ width: 40, height: 40 }}><Icon name="pin" size={18} /></span>
          <span style={{ flex: 1 }}>
            <b>우리 장소</b>
            <span className="tiny muted" style={{ display: 'block' }}>
              {recs?.length ? `${recs.length}곳 · 또 갈래요 ${recs.filter((r) => r.verdict === 'again').length}곳` : '맛집·카페·명소를 둘의 한 줄 평과 함께'}
            </span>
          </span>
          <Icon name="chev" size={18} />
        </Link>

      </div>
    </>
  );
}
