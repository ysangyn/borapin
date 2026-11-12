import { useMemo, useState, type ClipboardEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from './ui';
import { useStore } from '../lib/store';
import { useHome } from '../lib/home';
import { placeLabel, placeParam, searchPlaces } from '../lib/geo';
import { parseNaverShare } from '../lib/placeRecs';
import { samePlace } from '../lib/wishes';
import { dday } from '../lib/dates';
import type { Place } from '../lib/types';

/**
 * + 단추 = '어디?': 지역을 고르면 그 지역 한 장(/region/…)이 열리고 거기서 담기·기록·계획을 한다.
 * 지도 앱 '공유' 글을 붙여 넣으면 가게 담기로 바로 (주소에서 지역·동네를 알아서). 아래엔 바로 가기 세 줄.
 */
export default function WhereSheet({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const { trips, wishes, places } = useStore();
  const home = useHome();
  const [q, setQ] = useState('');
  const hits = useMemo(() => (q.trim() ? searchPlaces(q, 6) : []), [q]);
  const go = (p: Place) => { onClose(); nav(`/region/${placeParam(p)}`); };
  // 자주 가는 곳: 가게·여행이 많은 지역 (우리 집 먼저)
  const frequent = useMemo(() => {
    const m = new Map<string, { place: Place; n: number }>();
    const bump = (p: Place, w: number) => { const k = placeParam(p); const cur = m.get(k) ?? { place: p, n: 0 }; cur.n += w; m.set(k, cur); };
    for (const r of places ?? []) bump(r.region, 1);
    for (const t of trips ?? []) for (const p of t.places) bump(p, 2);
    const list = [...m.values()].filter((x) => !(home && x.place.t === 'kr' && x.place.code === home.code)).sort((a, b) => b.n - a.n).slice(0, 5);
    return list;
  }, [places, trips, home]);
  // 요즘: 예정 여행 · 가고 싶은 곳
  const recent = useMemo(() => {
    const out: { place: Place; note: string }[] = [];
    for (const t of (trips ?? []).filter((x) => x.status === 'planned').slice(0, 2)) if (t.places[0]) out.push({ place: t.places[0], note: dday(t.when) ?? '계획 중' });
    for (const w of (wishes ?? []).filter((x) => !x.tripId).slice(0, 3)) if (!out.some((o) => samePlace(o.place, w.place))) out.push({ place: w.place, note: '가고 싶어요' });
    return out.slice(0, 4);
  }, [trips, wishes]);
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (/https?:\/\//.test(text) && parseNaverShare(text).name) {
      e.preventDefault();
      onClose();
      nav(`/places/new?paste=${encodeURIComponent(text.slice(0, 600))}`);
    }
  };
  return (
    <div className="plus-sheet where-sheet" role="dialog" aria-label="어디예요?" onClick={(e) => e.stopPropagation()} data-testid="plus-sheet">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 8px 0' }}>
        <span className="jua" style={{ fontSize: 24 }}>어디예요?</span>
        <span className="small muted">지역을 고르면 그 지역 한 장에서 담기·기록·계획을 해요</span>
      </div>
      <label className="where-search">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onPaste={onPaste} placeholder="강릉, 성수동, 교토, ㄱㄹ… 또는 지도 공유 글 붙여 넣기" aria-label="지역 찾기" autoFocus data-testid="where-search" />
      </label>
      {hits.length > 0 && (
        <div className="list" style={{ gap: 2 }} data-testid="where-hits">
          {hits.map((h) => <button key={placeParam(h.place)} type="button" className="plus-item" onClick={() => go(h.place)} style={{ padding: '10px 14px' }}><Icon name="pin" size={18} /><span><b>{h.label}</b><span className="tiny muted" style={{ marginLeft: 6 }}>{h.sub}</span></span></button>)}
        </div>
      )}
      {!hits.length && (
        <>
          <div className="where-group">
            <span className="tiny muted">자주 가는 곳</span>
            <div className="chips" style={{ gap: 6 }}>
              {home && <button type="button" className="chip" style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }} onClick={() => go({ t: 'kr', code: home.code })} data-testid="where-home"><Icon name="home" size={14} />{home.label.split(' ')[0]} <span className="n" style={{ color: 'var(--v1)' }}>우리 집</span></button>}
              {frequent.map((x) => <button key={placeParam(x.place)} type="button" className="chip" onClick={() => go(x.place)} data-testid="where-frequent">{placeLabel(x.place)} <span className="n muted">{x.n}</span></button>)}
              {!home && !frequent.length && <span className="tiny muted">아직 없어요 · 위에서 찾아 주세요</span>}
            </div>
          </div>
          {recent.length > 0 && (
            <div className="where-group">
              <span className="tiny muted">요즘</span>
              <div className="chips" style={{ gap: 6 }}>
                {recent.map((x) => <button key={placeParam(x.place)} type="button" className="chip" onClick={() => go(x.place)}>{placeLabel(x.place)} <span className="n muted">{x.note}</span></button>)}
              </div>
            </div>
          )}
        </>
      )}
      <div className="where-quick" role="menu" aria-label="바로 가기">
        <NavLink to="/here" role="menuitem" className="plus-item sm here-quick" data-testid="plus-here"><Icon name="pin" size={18} /><span><b>지금 여기 남기기</b></span></NavLink>
        <NavLink to="/places/new" role="menuitem" className="plus-item sm" data-testid="plus-place"><Icon name="heart" size={18} /><span><b>맛집·카페 담기</b></span></NavLink>
        <NavLink to="/record" role="menuitem" className="plus-item sm"><Icon name="pin" size={18} /><span><b>여행 기록 남기기</b></span></NavLink>
        <NavLink to="/plan" role="menuitem" className="plus-item sm"><Icon name="calendar" size={18} /><span><b>여행 계획하기</b></span></NavLink>
      </div>
    </div>
  );
}
