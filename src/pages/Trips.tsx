import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatars, Icon, TopBar } from '../components/ui';
import TripRow from '../components/TripRow';
import { useTrips, useWishes } from '../lib/data';
import { normalizeQuery, placeLong } from '../lib/geo';
import type { Trip } from '../lib/types';

type Filter = 'all' | 'kr' | 'abroad';

export default function Trips() {
  const { trips } = useTrips();
  const { wishes } = useWishes();
  const [filter, setFilter] = useState<Filter>('all');
  const [who, setWho] = useState<string>('');
  const [q, setQ] = useState('');

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

  const planned = list.filter((t) => t.status === 'planned');
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
        <div className="chips" role="tablist">
          <button className={'chip' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>전체 {counts.all}</button>
          <button className={'chip' + (filter === 'kr' ? ' on' : '')} onClick={() => setFilter('kr')}>국내 {counts.kr}</button>
          <button className={'chip' + (filter === 'abroad' ? ' on' : '')} onClick={() => setFilter('abroad')}>해외 {counts.abroad}</button>
          {people.map((p) => (
            <button key={p} className={'chip' + (who === p ? ' soft-on' : '')} onClick={() => setWho(who === p ? '' : p)}>{p}와</button>
          ))}
        </div>

        <section>
          <div className="small" style={{ fontWeight: 700, color: 'var(--violet)', marginBottom: 2 }}>다가오는 여행</div>
          {planned.length ? (
            <div className="list">{planned.map((t) => <TripRow key={t.id} trip={t} />)}</div>
          ) : (
            <Link to="/record?status=planned" className="trip-row" style={{ color: 'var(--ink2)' }}>
              <span className="trip-tile planned"><Icon name="plus" size={20} stroke={2.2} /></span>
              <span style={{ fontWeight: 700 }}>여행 계획하기</span>
            </Link>
          )}
        </section>

        {wishes && wishes.length > 0 && (
          <div className="card small" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="flag" size={18} />
            <span style={{ flex: 1 }}>가고 싶은 곳 <b>{wishes.length}곳</b>을 가져왔어요. 화면은 다음 단계에서 열려요.</span>
          </div>
        )}

        <section>
          <h2 className="h2" style={{ marginBottom: 4 }}>다녀온 곳</h2>
          {trips && done.length === 0 && (
            <div className="empty">
              <b>{q || filter !== 'all' || who ? '조건에 맞는 기록이 없어요' : '아직 다녀온 기록이 없어요'}</b>
              {!q && <Link to="/record" className="btn sm">기록 남기기</Link>}
            </div>
          )}
          {[...byYear.entries()].map(([y, ts]) => (
            <div key={y}>
              <div className="year-head">{y} · {ts.length}번</div>
              <div className="list">{ts.map((t) => <TripRow key={t.id} trip={t} />)}</div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
