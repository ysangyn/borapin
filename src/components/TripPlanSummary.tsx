import { Link } from 'react-router-dom';
import { dayLabel, tripDays, usePlan } from '../lib/tripExtras';
import { pickTitle } from '../lib/way';
import { memberNames, toneOf } from '../lib/members';
import type { Trip } from '../lib/types';

/**
 * 예정 여행 개요의 '우리 계획' 한 장: 계획 다섯 걸음을 마치고 돌아왔을 때 무엇을 정했는지 한눈에.
 * 숙소 · 가는 길·돌아오는 길 · 날마다 갈 곳 · 둘의 기대 한 줄. 정한 게 하나도 없으면 그리지 않는다 (빈 카드 금지).
 */
export function TripPlanSummary({ trip }: { trip: Trip }) {
  const plan = usePlan(trip.id);
  const days = tripDays(trip.when);
  const byDay = days.map((d) => ({ d, list: (plan ?? []).filter((p) => p.day === d) })).filter((x) => x.list.length);
  const loose = (plan ?? []).filter((p) => !p.day || !days.includes(p.day)).length;
  const hopes = Object.entries(trip.hopes ?? {}).filter(([, v]) => v?.trim());
  const go = trip.way?.go, back = trip.way?.back;
  if (!trip.stay?.name && !go && !back && !byDay.length && !loose && !hopes.length) return null;
  return (
    <div className="card white plan-summary" data-testid="plan-summary">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <b className="jua" style={{ fontSize: 18 }}>우리 계획</b>
        <Link to={`/trips/${trip.id}?tab=plan`} className="small" style={{ fontWeight: 500 }}>일정 보기</Link>
      </div>
      <dl className="ps-rows">
        {trip.stay?.name && <div><dt>숙소</dt><dd>{trip.stay.name}</dd></div>}
        {(go || back) && <div><dt>가는 길</dt><dd>{go ? pickTitle(go) : '아직'}{back ? ` · 돌아올 땐 ${pickTitle(back)}` : ''}</dd></div>}
        {byDay.map(({ d, list }) => (
          <div key={d}><dt>{dayLabel(d, days).split(' · ')[0]}</dt><dd>{list[0].name}{list.length > 1 ? ` 외 ${list.length - 1}곳` : ''}</dd></div>
        ))}
        {loose > 0 && <div><dt>날짜 없이</dt><dd>{loose}곳</dd></div>}
      </dl>
      {hopes.length > 0 && <Hopes hopes={hopes} title="기대 한 줄" />}
    </div>
  );
}

/** 다녀온 여행 개요: 떠나기 전 둘이 적은 기대 한 줄을 다시 꺼내 '어땠는지'로 잇는다 */
export function TripHopesLookback({ trip }: { trip: Trip }) {
  const hopes = Object.entries(trip.hopes ?? {}).filter(([, v]) => v?.trim());
  if (!hopes.length) return null;
  return (
    <div className="card white plan-summary" data-testid="hopes-lookback">
      <b className="jua" style={{ fontSize: 18 }}>떠나기 전 우리 기대</b>
      <Hopes hopes={hopes} />
      <Link to={`/trips/${trip.id}?tab=notes`} className="btn sm soft" style={{ alignSelf: 'flex-start' }}>정말 그랬는지 한 줄 남기기</Link>
    </div>
  );
}

function Hopes({ hopes, title }: { hopes: [string, string][]; title?: string }) {
  const order = memberNames();
  const sorted = [...hopes].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  return (
    <div className="ps-hopes">
      {title && <span className="tiny muted">{title}</span>}
      {sorted.map(([who, text]) => (
        <span key={who} className={'ps-hope hand ' + (toneOf(who) === 1 ? 'blue' : 'pink')}>“{text}” — {who}</span>
      ))}
    </div>
  );
}
