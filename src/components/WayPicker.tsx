import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import TransitStops from './TransitStops';
import { Icon, useToast } from './ui';
import { useHome } from '../lib/home';
import { patchTrip, computeStats, useTrips } from '../lib/data';
import { addPlans } from '../lib/tripExtras';
import { BOOK, basisLabel, directWays, useRoutes, wayLine } from '../lib/transit';
import { clock, type TransitPlan } from '../lib/transitStop';
import { CAR, legLine, pickOf, pickSvcs, pickTitle } from '../lib/way';
import { daysOf } from '../lib/planCal';
import { REGION_BY_CODE } from '../lib/geo';
import { straightKm } from '../lib/placeApps';
import type { Trip, WayPick } from '../lib/types';

const hhmm = (m: number) => clock(m).padStart(5, '0');

/**
 * 가는 길·돌아오는 길 한 칸 (계획하기 '동선'·준비 탭).
 * 고르기 전: 한 번에 가는 길 한 줄 + '정하기' → 자동차 / 대중교통(바로·가장 빠른·들러 가기·1박) 중 하나.
 * 고른 뒤: 구간·막차·예매 + '바꾸기'. 들러 가는 도시는 그날 일정에 같이 넣는다.
 */
export default function WayPicker({ trip, dir }: { trip: Trip; dir: 'go' | 'back' }) {
  const home = useHome();
  const d = useRoutes();
  const toast = useToast();
  const { trips } = useTrips();
  const visited = useMemo(() => (trips ? computeStats(trips).cellVisits : new Map<string, number>()), [trips]);
  const [open, setOpen] = useState(false);
  const place = trip.places[0];
  const days = daysOf(trip.when);
  const pick = trip.way?.[dir] ?? null;
  if (place.t !== 'kr') return null;
  const dest = REGION_BY_CODE.get(place.code);
  if (!dest) return null;
  const label = dir === 'go' ? '가는 길' : '돌아오는 길';
  if (home === undefined) return null;
  if (!home) return <div className="way-card empty" data-testid={`way-${dir}`}><b>{label}</b><Link to="/space#home" className="tiny">우리 집을 정하면 가는 길을 골라 드려요</Link></div>;
  if (home.code === dest.code || straightKm(home, dest) < 30) return null;
  const from = dir === 'go' ? home.code : dest.code, to = dir === 'go' ? dest.code : home.code;
  const day = dir === 'go' ? days[0] ?? null : days[days.length - 1] ?? null;
  const hint = d ? directWays(d, from, to)[0] : undefined;

  const save = async (w: WayPick, p?: TransitPlan) => {
    try {
      await patchTrip(trip.id, { [`way.${dir}`]: w });
      // 들러 가기·1박: 들르는 도시를 그날 일정에 (도착 시각에)
      if (p?.mid && (p.kind === 'stop' || p.kind === 'overnight')) {
        const m = REGION_BY_CODE.get(p.mid)?.name ?? '';
        await addPlans(trip.id, [{ day, time: hhmm(p.legs[0].arr), name: p.kind === 'overnight' ? `${m}에서 하룻밤` : `${m} 들르기`, info: (w.legs ?? []).map(legLine).join(' · ').slice(0, 200) }]);
      }
      toast(`${label}을 정했어요`);
      setOpen(false);
    } catch { toast('저장하지 못했어요. 다시 해 주세요'); }
  };

  return (
    <div className={'way-card' + (pick ? ' picked' : '')} data-testid={`way-${dir}`}>
      <div className="way-head">
        <b>{label}</b>
        {pick && <span className="way-title">{pickTitle(pick)}</span>}
        <button className="way-btn" onClick={() => setOpen(true)} data-testid={`way-${dir}-open`}>{pick ? '바꾸기' : '정하기'}</button>
      </div>
      {!pick && <span className="tiny muted">{hint ? `한 번에 ${wayLine(hint)}` : '대중교통이면 갈아타는 길·들러 가는 길도 골라 드려요'}</span>}
      {pick?.mode === 'transit' && (
        <>
          {(pick.legs ?? []).map((l, i) => <span key={i} className="way-leg">{i > 0 && pick.kind === 'overnight' ? '다음 날 ' : ''}{legLine(l)}</span>)}
          <span className="tiny muted">
            {pick.last != null ? `막차 ${clock(pick.last)} · ` : ''}{pick.day === 'sat' ? '토요일' : pick.day === 'sun' ? '일요일' : '평일'} 시각표 · 떠나기 전 확인:{' '}
            {pickSvcs(pick).map((s, i) => <span key={s}>{i ? ' · ' : ''}<a href={BOOK[s].url} target="_blank" rel="noreferrer">{BOOK[s].name}<Icon name="external" size={11} /></a></span>)}
          </span>
        </>
      )}
      {open && createPortal(
        <div className="map-choice-backdrop" onClick={() => setOpen(false)}>
          <div className="map-choice card way-sheet" role="dialog" aria-label={`${label} 고르기`} onClick={(e) => e.stopPropagation()} data-testid="way-sheet">
            <b className="jua" style={{ fontSize: 19 }}>{label} · {dir === 'go' ? `${home.label} → ${dest.name}` : `${dest.name} → ${home.label}`}</b>
            <button className="way-car" onClick={() => void save(CAR)} data-testid="way-car"><Icon name="map" size={16} />자동차로 가요</button>
            <TransitStops from={from} to={to} visited={visited} firstDay={day} start={dir === 'back' ? 11 * 60 : undefined} onPick={(p, dd) => void save(pickOf(p, dd), p)} />
            {d && <span className="tiny muted">{basisLabel(d)} 시각표로 골라요</span>}
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setOpen(false)}>닫기</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
