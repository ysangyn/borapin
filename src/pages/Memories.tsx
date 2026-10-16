import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '../components/ui';
import TripRow from '../components/TripRow';
import { computeStats, useTrips } from '../lib/data';
import { pickMemory } from '../lib/memories';

export default function Memories() {
  const { trips } = useTrips();
  const memory = useMemo(() => (trips ? pickMemory(trips) : null), [trips]);
  const stats = useMemo(() => (trips ? computeStats(trips) : null), [trips]);
  const thisYear = new Date().getFullYear();
  const yearTrips = trips?.filter((t) => t.status === 'done' && t.when.y === thisYear) ?? [];
  const firsts = useMemo(() => {
    if (!trips) return 0;
    const before = new Set<string>();
    for (const t of trips) if (t.status === 'done' && t.when.y && t.when.y < thisYear) t.places.forEach((p) => before.add(p.t === 'kr' ? p.code : p.id));
    const now = new Set<string>();
    for (const t of yearTrips) t.places.forEach((p) => { const k = p.t === 'kr' ? p.code : p.id; if (!before.has(k)) now.add(k); });
    return now.size;
  }, [trips, yearTrips, thisYear]);

  return (
    <>
      <TopBar title="추억" />
      <div className="page" style={{ paddingTop: 4 }}>
        {memory ? (
          <section className="card" data-testid="memory-card">
            <div className="tiny" style={{ color: 'var(--violet)', fontWeight: 800 }}>{memory.label}</div>
            <div className="list"><TripRow trip={memory.trip} /></div>
          </section>
        ) : (
          <div className="empty"><b>꺼내 볼 추억이 아직 없어요</b><span className="small">지난 여행 3개만 남겨 보세요.</span><Link to="/record" className="btn sm">기록 남기기</Link></div>
        )}

        <section className="card white">
          <div className="h2" style={{ fontSize: 16 }}>{thisYear}년 결산</div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat"><b>{yearTrips.length}</b><span>여행·나들이</span></div>
            <div className="stat"><b>{firsts}</b><span>처음 가본 곳</span></div>
            <div className="stat"><b>{stats?.pins ?? 0}</b><span>지금까지 핀</span></div>
          </div>
        </section>

        <div className="card small muted">사진첩·슬라이드쇼·공유 카드는 2단계에서 이 자리에 열려요.</div>
      </div>
    </>
  );
}
