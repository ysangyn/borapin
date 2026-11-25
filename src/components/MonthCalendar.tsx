import { useState } from 'react';

/** 날짜 문자열 'YYYY-MM-DD' ↔ 날 (현지 시각) */
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

/** 달 한 장의 칸들: 앞은 빈칸, 그다음 1일부터 말일까지 (일요일 시작) */
export function monthCells(y: number, m: number): (number | null)[] {
  const first = new Date(y, m, 1).getDay();
  const last = new Date(y, m + 1, 0).getDate();
  return [...Array<null>(first).fill(null), ...Array.from({ length: last }, (_, i) => i + 1)];
}

/** 고른 두 날 → 몇 박 (같은 날이면 0 = 당일) */
export const nightsBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);

/**
 * 떠나는 날 · 오는 날 고르기 달력 (사용자 의견 11-25: 휴대폰의 빈 날짜 칸은 달력처럼 안 보였고, 끝나는 날도 고르고 싶었다).
 * 처음 누른 날 = 떠나는 날, 다음에 누른 날 = 오는 날 → 몇 박 며칠은 저절로. 떠나는 날보다 앞을 누르면 다시 떠나는 날부터.
 * 지난날은 못 고른다. nights는 오는 날까지의 박 수 (오는 날을 아직 안 골랐으면 null).
 */
export default function MonthCalendar({ value, nights, onChange, label = '여행 날짜' }: { value: string; nights: number | null; onChange: (start: string, nights: number | null) => void; label?: string }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sel = value ? parse(value) : null;
  const [view, setView] = useState(() => { const b = sel ?? today; return { y: b.getFullYear(), m: b.getMonth() }; });
  const end = sel && nights != null ? new Date(sel.getFullYear(), sel.getMonth(), sel.getDate() + nights) : null;
  const pick = (day: Date) => {
    const v = ymd(day);
    // 떠나는 날만 고른 상태에서 같은 날이나 뒷날을 누르면 오는 날. 그 밖엔 새로 떠나는 날
    if (sel && nights == null && day >= sel) onChange(value, nightsBetween(value, v));
    else onChange(v, null);
  };
  const atStart = view.y === today.getFullYear() && view.m === today.getMonth();
  const move = (k: number) => setView((v) => { const d = new Date(v.y, v.m + k, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  return (
    <div className="mcal" role="group" aria-label={`${label} 달력`} data-testid="month-calendar">
      <div className="mcal-head">
        <button type="button" className="mcal-nav" onClick={() => move(-1)} disabled={atStart} aria-label="지난달">‹</button>
        <b aria-live="polite">{view.y}년 {view.m + 1}월</b>
        <button type="button" className="mcal-nav" onClick={() => move(1)} aria-label="다음 달" data-testid="mcal-next">›</button>
      </div>
      <div className="mcal-grid" role="grid">
        {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => <span key={w} className={'mcal-w' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '')} aria-hidden="true">{w}</span>)}
        {monthCells(view.y, view.m).map((d, i) => {
          if (d == null) return <span key={`e${i}`} />;
          const day = new Date(view.y, view.m, d);
          const past = day < today;
          const isStart = !!sel && day.getTime() === sel.getTime();
          const inRange = !!sel && !!end && day > sel && day < end;
          const isEnd = !!end && !!sel && end > sel && day.getTime() === end.getTime();
          const dow = day.getDay();
          return (
            <button key={d} type="button" role="gridcell" disabled={past}
              className={'mcal-d' + (isStart ? ' start' : '') + (inRange ? ' range' : '') + (isEnd ? ' end' : '') + (dow === 0 ? ' sun' : dow === 6 ? ' sat' : '') + (day.getTime() === today.getTime() ? ' today' : '')}
              aria-pressed={isStart} aria-label={`${view.m + 1}월 ${d}일${isStart ? ', 떠나는 날' : isEnd ? ', 오는 날' : inRange ? ', 여행 중' : ''}`}
              onClick={() => pick(day)}>{d}</button>
          );
        })}
      </div>
      <div className="mcal-sum" data-testid="mcal-sum">
        {!sel ? <span className="muted">떠나는 날을 눌러 주세요</span>
          : !end ? <span><b>{sel.getMonth() + 1}월 {sel.getDate()}일</b> 떠나요 <span className="muted">· 오는 날을 눌러 주세요 (당일이면 같은 날)</span></span>
          : <span><b>{sel.getMonth() + 1}월 {sel.getDate()}일 ~ {end.getMonth() + 1}월 {end.getDate()}일</b> · <b className="mcal-n">{nights === 0 ? '당일' : `${nights}박 ${(nights ?? 0) + 1}일`}</b></span>}
      </div>
    </div>
  );
}
