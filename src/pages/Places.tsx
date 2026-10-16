import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, TopBar } from '../components/ui';
import PlaceRecRow from '../components/PlaceRecRow';
import { usePlaces } from '../lib/data';
import { normalizeQuery, placeLong } from '../lib/geo';
import { KINDS } from '../lib/placeRecs';
import type { PlaceKind } from '../lib/types';

/** 우리 장소 모아 보기: 또 갈래요·종류로 거르고 지역별로 묶는다 */
export default function Places() {
  const { places } = usePlaces();
  const [kind, setKind] = useState<PlaceKind | 'again' | null>(null);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const nq = normalizeQuery(q);
    return (places ?? []).filter((p) => {
      if (kind === 'again' && p.verdict !== 'again') return false;
      if (kind && kind !== 'again' && p.kind !== kind) return false;
      if (nq && !normalizeQuery([p.name, placeLong(p.region), p.memo ?? '', ...Object.values(p.reviews ?? {})].join(' ')).includes(nq)) return false;
      return true;
    });
  }, [places, kind, q]);
  const groups = useMemo(() => {
    const m = new Map<string, typeof list>();
    for (const p of list) {
      const k = placeLong(p.region);
      m.set(k, [...(m.get(k) ?? []), p]);
    }
    return [...m.entries()];
  }, [list]);

  return (
    <>
      <TopBar back title="우리 장소" right={<Link to="/places/new" className="btn sm" data-testid="place-new"><Icon name="plus" size={16} stroke={2.4} />남기기</Link>} />
      <div className="page" style={{ paddingTop: 4 }}>
        <input className="input" aria-label="장소 찾기" placeholder="이름, 지역, 한 줄 평 찾기" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">
          <button className={'chip' + (kind === null ? ' on' : '')} aria-pressed={kind === null} onClick={() => setKind(null)}>전체 {places?.length ?? 0}</button>
          <button className={'chip' + (kind === 'again' ? ' on-coral' : '')} onClick={() => setKind('again')}>또 갈래요</button>
          {KINDS.map((k) => (
            <button key={k.k} className={'chip' + (kind === k.k ? ' on' : '')} onClick={() => setKind(k.k)}>{k.label}</button>
          ))}
        </div>
        {!places && <div className="skeleton-list" aria-busy="true"><i /><i /><i /></div>}
        {places && places.length > 0 && groups.length === 0 && (
          <div className="small muted" style={{ textAlign: 'center' }}>찾는 장소가 없어요 · <button className="link-btn" style={{ display: 'inline' }} onClick={() => { setQ(''); setKind(null); }}>조건 지우기</button></div>
        )}
        {places && places.length === 0 && (
          <div className="empty">
            <b>아직 남긴 장소가 없어요</b>
            <span className="small">기억에 남은 맛집·카페·명소를 둘의 한 줄 평과 함께 남겨 보세요.<br />지도에서 그 지역을 누르면 모아서 보여 드려요.</span>
            <Link to="/places/new" className="btn sm">장소 남기기</Link>
          </div>
        )}
        {groups.map(([region, recs]) => (
          <section key={region}>
            <div className="year-head">{region} · {recs.length}</div>
            <div className="list">{recs.map((r) => <PlaceRecRow key={r.id} rec={r} />)}</div>
          </section>
        ))}
      </div>
    </>
  );
}
