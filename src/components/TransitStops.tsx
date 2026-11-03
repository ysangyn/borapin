import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './ui';
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
 * 시각은 이달 시각표(평일) 기준이라 '○월 기준'과 예매 링크를 같이 둔다.
 */
export default function TransitStops({ from, to, visited, onWish }: { from: string; to: string; visited: Set<string> | Map<string, number>; onWish: (code: string) => void }) {
  const d = useRoutes();
  const info = useTravelInfo();
  const [mode, setMode] = useState<Mode>('all');
  const plans = useMemo(() => (d ? transitPlans(d, from, to, { mode, visited, themeOf: (c) => info?.cells[c]?.main.theme }) : []), [d, from, to, mode, visited, info]);
  if (d === undefined) return <div className="skeleton-text" aria-busy="true" />;
  if (!d) return null;
  const svcs = [...new Set(plans.flatMap((p) => p.legs.map((l) => l.svc)))];
  return (
    <div className="transit-stops" data-testid="transit-stops">
      <div className="seg" role="tablist" aria-label="탈것">
        {MODES.map(([m, l]) => <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{l}</button>)}
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
                  {p.move ? ` · ${l.from}까지 시내 이동 약 ${p.move}분` : ''}
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
            {p.mid && p.kind !== 'fast' && (
              <>
                {' · '}<Link to={`/map?sel=${placeParam({ t: 'kr', code: p.mid })}`}>둘러보기</Link>
                {' · '}<button className="link-btn" onClick={() => onWish(p.mid!)}>가고 싶은 곳에 담기</button>
              </>
            )}
          </div>
        </div>
      ))}
      {plans.length > 0 && (
        <span className="tiny muted">
          {basisLabel(d)} 평일 시각표 · 떠나기 전 확인:{' '}
          {svcs.map((s, i) => <span key={s}>{i ? ' · ' : ''}<a href={BOOK[s].url} target="_blank" rel="noreferrer">{BOOK[s].name}<Icon name="external" size={11} /></a></span>)}
        </span>
      )}
    </div>
  );
}
