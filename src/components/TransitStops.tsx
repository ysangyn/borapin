import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, useToast } from './ui';
import { addPlans } from '../lib/tripExtras';
import { BOOK, basisLabel, SVC_LABEL, useRoutes } from '../lib/transit';
import { clock, span, transitPlans, type Leg, type Mode, type TransitPlan } from '../lib/transitStop';
import { useTravelInfo } from '../lib/travelinfo';
import { placeParam, REGION_BY_CODE } from '../lib/geo';

const MODES: [Mode, string][] = [['all', '통합'], ['bus', '버스만'], ['train', '기차만']];
const title = (p: TransitPlan) => {
  const m = p.mid ? REGION_BY_CODE.get(p.mid)?.name ?? '' : '';
  return p.kind === 'direct' ? '바로 가기' : p.kind === 'fast' ? `가장 빠른 길 · ${m}에서 갈아타기` : p.kind === 'overnight' ? `${m}에서 하룻밤` : `${m} 들러 가기`;
};
const legName = (l: Leg) => (l.ktx ? 'KTX' : SVC_LABEL[l.svc]);

/**
 * 대중교통으로 가는 길: 바로 가기 · 가장 빠른 길 · 중간 도시에서 2~5시간 머물다 가기 · 1박.
 * 시각은 이달 시각표(평일·토요일) 기준이라 '○월 기준'과 예매 링크를 같이 둔다. 여행 안에서 열면 '일정에 넣기'로 들르는 도시를 계획에 담는다.
 */
const hhmm = (m: number) => clock(m).padStart(5, '0');
/** 떠나는 날이 토·일이면 토요일 시각표로 시작 */
const weekdayKind = (ymd?: string | null): 'weekday' | 'sat' | 'sun' => { if (!ymd) return 'weekday'; const w = new Date(ymd + 'T00:00:00').getDay(); return w === 6 ? 'sat' : w === 0 ? 'sun' : 'weekday'; };

export default function TransitStops({ from, to, visited, onWish, trip, onPick, start, firstDay }: { from: string; to: string; visited: Set<string> | Map<string, number>; onWish?: (code: string) => void; trip?: { id: string; firstDay: string | null }; onPick?: (p: TransitPlan, day: 'weekday' | 'sat' | 'sun') => void; start?: number; firstDay?: string | null }) {
  const d = useRoutes();
  const info = useTravelInfo();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('all');
  const [day, setDay] = useState<'weekday' | 'sat' | 'sun'>(() => weekdayKind(firstDay ?? trip?.firstDay));
  const plans = useMemo(() => (d ? transitPlans(d, from, to, { day, mode, visited, start, themeOf: (c) => info?.cells[c]?.main.theme }) : []), [d, from, to, day, mode, visited, info, start]);
  const toPlan = async (p: TransitPlan) => {
    if (!trip) return;
    const [l1, l2] = p.legs;
    if (!p.mid || !l2) {
      // 바로 가기: '행신 → 강릉 KTX'를 첫날 떠나는 시각에
      try {
        await addPlans(trip.id, [{ day: trip.firstDay, time: hhmm(l1.dep), name: `${l1.from} → ${l1.to} ${legName(l1)}`.slice(0, 80), info: `${clock(l1.dep)} 출발 · ${clock(l1.arr)} 도착` }]);
        toast('일정에 넣었어요');
      } catch { toast('넣지 못했어요. 다시 해 주세요'); }
      return;
    }
    const m = REGION_BY_CODE.get(p.mid)?.name ?? '';
    const line = `${clock(l1.dep)} ${l1.from} ${legName(l1)} → ${clock(l1.arr)} ${l1.to} · ${p.kind === 'overnight' ? '다음 날 ' : ''}${clock(l2.dep)} ${l2.from} ${legName(l2)} → ${clock(l2.arr)} ${l2.to}`;
    try {
      await addPlans(trip.id, [{ day: trip.firstDay, time: hhmm(l1.arr), name: p.kind === 'overnight' ? `${m}에서 하룻밤` : `${m} 들르기`, info: line.slice(0, 200) }]);
      toast('일정에 넣었어요');
    } catch { toast('넣지 못했어요. 다시 해 주세요'); }
  };
  if (d === undefined) return <div className="skeleton-text" aria-busy="true" />;
  if (!d) return null;
  const svcs = [...new Set(plans.flatMap((p) => p.legs.map((l) => l.svc)))];
  return (
    <div className="transit-stops" data-testid="transit-stops">
      <div className="transit-segs">
        <div className="seg" role="tablist" aria-label="탈것">
          {MODES.map(([m, l]) => <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{l}</button>)}
        </div>
        <div className="seg" role="tablist" aria-label="요일">
          {([['weekday', '평일'], ['sat', '토요일'], ['sun', '일요일']] as const).map(([v, l]) => <button key={v} role="tab" aria-selected={day === v} className={day === v ? 'on' : ''} onClick={() => setDay(v)} data-testid={`transit-${v}`}>{l}</button>)}
        </div>
      </div>
      {!plans.length && <span className="tiny muted">{mode === 'all' ? '시각표로 이어지는 길을 찾지 못했어요' : `${mode === 'bus' ? '버스' : '기차'}로만 이어지는 길이 없어요`}</span>}
      {plans.map((p, i) => (
        <div key={i} className={'transit-plan ' + p.kind} data-testid="transit-plan" data-kind={p.kind}>
          <b className="transit-title">{title(p)}</b>
          {p.legs.map((l, k) => (
            <div key={k}>
              {k > 0 && p.mid && (
                <div className="transit-mid">
                  {p.kind === 'overnight' ? '자고 다음 날 아침' : p.kind === 'stop' ? `${span(p.stay ?? 0)} 머물기` : `${span(p.stay ?? 0)} 기다리기`}
                  {p.move ? ` · ${l.from}까지 ${p.moveHow === 'walk' ? '걸어서' : p.moveHow === 'taxi' ? '택시로' : '시내 이동'} 약 ${p.move}분` : ''}
                  {p.kind !== 'fast' && info?.cells[p.mid]?.main.theme ? <span className="muted"> · {info.cells[p.mid].main.theme}</span> : null}
                </div>
              )}
              <div className="transit-leg">
                <span className="t">{clock(l.dep)}</span><span>{l.from}</span>
                <span className={'transit-svc ' + l.svc}>{legName(l)}</span>
                <span className="t">{clock(l.arr)}</span><span>{l.to}</span>
              </div>
            </div>
          ))}
          <div className="transit-foot tiny muted">
            차 타는 시간 {span(p.ride)} · {p.kind === 'overnight' ? '다음 날 ' : ''}{clock(p.end)} 도착
            {p.last != null && p.last > p.legs[p.legs.length - 1].dep % 1440 ? <> · <span className="transit-last">막차 {clock(p.last)}</span></> : p.last != null ? <> · <span className="transit-last">이게 막차</span></> : null}
            {onPick && <>{' · '}<button className="link-btn transit-pick" onClick={() => onPick(p, day)} data-testid="transit-pick">이 길로</button></>}
            {!onPick && trip && (p.kind === 'direct' || p.kind === 'fast') && <>{' · '}<button className="link-btn" onClick={() => void toPlan(p)} data-testid="transit-to-plan">일정에 넣기</button></>}
            {!onPick && p.mid && p.kind !== 'fast' && onWish && (
              <>
                {' · '}<Link to={`/map?sel=${placeParam({ t: 'kr', code: p.mid })}`}>둘러보기</Link>
                {' · '}<button className="link-btn" onClick={() => onWish(p.mid!)}>가고 싶은 곳에 담기</button>
                {trip && <>{' · '}<button className="link-btn" onClick={() => void toPlan(p)} data-testid="transit-to-plan">일정에 넣기</button></>}
              </>
            )}
          </div>
        </div>
      ))}
      {plans.length > 0 && (
        <span className="tiny muted">
          {basisLabel(d)} {day === 'sat' ? '토요일' : day === 'sun' ? '일요일' : '평일'} 시각표 · 공휴일은 다를 수 있어요 · 떠나기 전 확인:{' '}
          {svcs.map((s, i) => <span key={s}>{i ? ' · ' : ''}<a href={BOOK[s].url} target="_blank" rel="noreferrer">{BOOK[s].name}<Icon name="external" size={11} /></a></span>)}
        </span>
      )}
    </div>
  );
}
