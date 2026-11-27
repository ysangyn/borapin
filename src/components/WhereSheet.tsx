import { useEffect, useMemo, useState, type ClipboardEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from './ui';
import { useStore } from '../lib/store';
import { useHome } from '../lib/home';
import { placeLabel, placeParam, searchPlaces } from '../lib/geo';
import { parseNaverShare } from '../lib/placeRecs';
import { samePlace } from '../lib/wishes';
import { dday } from '../lib/dates';
import type { Place } from '../lib/types';
import { useAuth } from '../lib/auth';
import { loadStations, type Station } from '../lib/stations';
import { fuzzyFind } from '../lib/fuzzyKo';
import { lookupGeo } from '../lib/placeLookup';
import { locate } from '../lib/geodata';
import SpotDetail, { type SpotTarget } from './SpotDetail';

/**
 * + 단추 = '어디?': 지역을 고르면 그 지역 한 장(/region/…)이 열리고 거기서 다녀왔어요·가고 싶어요를 남긴다.
 * 지도 앱 '공유' 글을 붙여 넣으면 가게 담기로 바로 (주소에서 지역·동네를 알아서). 아래엔 바로 가기 세 줄.
 */
export default function WhereSheet({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const { trips, wishes, places } = useStore();
  const home = useHome();
  const [q, setQ] = useState('');
  const hits = useMemo(() => (q.trim() ? searchPlaces(q, 6) : []), [q]);
  // 역 이름으로도 찾는다: 치는 동안 자동완성, 한 끗 틀리면 '혹시' (사용자 의견 11-25: '대회역' → 대화역)
  const auth = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  useEffect(() => { void loadStations(auth.status === 'ready' ? auth.user : null).then(setStations); }, [auth.status]);
  const stationHits = useMemo(() => (q.trim().length >= 1 && !/^[ㄱ-ㅎ]+$/.test(q.trim()) ? fuzzyFind(q, stations, (s) => s[0], 5) : []), [q, stations]);
  const [near, setNear] = useState<SpotTarget | null>(null);
  const [finding, setFinding] = useState(false);
  /** 역·지명을 고르면 그 자리의 알아보기 창: 둘레 맛집·볼거리 */
  const openNear = async (name: string, lat: number, lng: number) => {
    const place = await locate(lng, lat).catch(() => null);
    if (!place) return;
    setNear({ name, area: placeLabel(place), lat, lng, place, kind: 'place' });
  };
  /** 지역도 역도 아닌 이름(롯데월드, 광장시장…): 오픈스트리트맵에서 자리를 찾아 둘레를 본다 */
  const findLandmark = async () => {
    const name = q.trim();
    if (!name || finding) return;
    setFinding(true);
    const g = await lookupGeo(name).catch(() => null);
    setFinding(false);
    if (g) void openNear(g.name?.split(',')[0] || name, g.lat, g.lng);
    else setNotFound(name);
  };
  const [notFound, setNotFound] = useState<string | null>(null);
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
        <span className="small muted">지역을 고르면 그곳에서 다녀왔어요·가고 싶어요를 남겨요</span>
      </div>
      <label className="where-search">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onPaste={onPaste} placeholder="강릉, 교토, 대화역, 광장시장… 또는 지도 공유 글" aria-label="지역 찾기" autoFocus data-testid="where-search" />
      </label>
      {hits.length > 0 && (
        <div className="list" style={{ gap: 2 }} data-testid="where-hits">
          {hits.map((h) => <button key={placeParam(h.place)} type="button" className="plus-item" onClick={() => go(h.place)} style={{ padding: '10px 14px' }}><Icon name="pin" size={18} /><span><b>{h.label}</b><span className="tiny muted" style={{ marginLeft: 6 }}>{h.sub}</span></span></button>)}
        </div>
      )}
      {stationHits.length > 0 && (
        <div className="list" style={{ gap: 2 }} data-testid="where-stations">
          {!stationHits[0].exact && <span className="tiny muted" style={{ padding: '4px 14px 0' }}>혹시 이 역인가요?</span>}
          {stationHits.map((h) => (
            <button key={`${h.item[0]}${h.item[1]}`} type="button" className="plus-item" onClick={() => void openNear(h.item[0], h.item[1], h.item[2])} style={{ padding: '10px 14px' }} data-testid="where-station">
              <span aria-hidden="true" style={{ width: 18, textAlign: 'center' }}>🚉</span><span><b>{h.item[0]}</b><span className="tiny muted">주변 맛집·볼거리</span></span>
            </button>
          ))}
        </div>
      )}
      {q.trim().length >= 2 && !/^[ㄱ-ㅎ]+$/.test(q.trim()) && (
        <button type="button" className="plus-item" onClick={() => void findLandmark()} disabled={finding} style={{ padding: '10px 14px' }} data-testid="where-landmark">
          <Icon name="search" size={18} /><span><b>{finding ? '찾는 중…' : `'${q.trim()}' 둘레 보기`}</b><span className="tiny muted">{notFound === q.trim() ? '자리를 찾지 못했어요. 다른 이름으로 찾아 주세요' : '장소 이름으로 그 둘레 맛집·볼거리'}</span></span>
        </button>
      )}
      {near && <SpotDetail spot={near} onClose={() => setNear(null)} />}
      {!q.trim() && (
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
        {/* 가장 자주 쓸 것: 오늘 간 가게를 지금 자리로 바로 — 한 줄 넓게 */}
        <NavLink to="/here" role="menuitem" className="here-big" data-testid="plus-here"><Icon name="pin" size={20} /><span><b>지금 여기 남기기</b><small>오늘 간 가게·카페를 지금 자리로 바로</small></span></NavLink>
        {/* 말은 둘뿐: 다녀왔어요(핀) / 가고 싶어요(♡). 계획은 한 길(/plan) — 사용자 의견 11-22: 남기는 곳이 여기저기 겹쳤다 */}
        <NavLink to="/record" role="menuitem" className="plus-item sm" data-testid="plus-record"><Icon name="pin" size={18} /><span><b>다녀온 여행</b></span></NavLink>
        <NavLink to="/places/new?status=want" role="menuitem" className="plus-item sm" data-testid="plus-place"><Icon name="heart" size={18} /><span><b>가고 싶어요</b></span></NavLink>
        <NavLink to="/plan" role="menuitem" className="plus-item sm" data-testid="plus-plan"><Icon name="calendar" size={18} /><span><b>여행 계획하기</b></span></NavLink>
      </div>
    </div>
  );
}
