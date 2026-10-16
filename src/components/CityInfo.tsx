import { Link } from 'react-router-dom';
import { josa } from 'es-hangul';
import { Icon } from './ui';
import { LANG_LABEL, phraseLangFor } from '../lib/phrases';
import { monthsLabel } from '../lib/seasons';
import { cityFor, COST_LABEL, flyLabel, tzLabel, useWorld, WALK_LABEL, type WorldCity } from '../lib/world';
import type { Place } from '../lib/types';

/**
 * 해외 도시 기본 정보 (world.json): 통화·말·콘센트·시차·비행시간·입국 메모 + 먹을 것·볼 것.
 * 준비에 바로 쓰이게, 먹을 것·볼 것은 눌러서 가고 싶은 곳 메모에 넣을 수 있다.
 */
export default function CityInfo({ place, onAdd, compact }: { place: Place; onAdd?: (kind: 'foods' | 'spots', text: string) => void; compact?: boolean }) {
  const world = useWorld();
  const w = cityFor(world, place);
  if (!w) return null;
  return <CityFacts w={w} onAdd={onAdd} compact={compact} updated={world?.updated} />;
}

export function CityFacts({ w, onAdd, compact, updated }: { w: WorldCity; onAdd?: (kind: 'foods' | 'spots', text: string) => void; compact?: boolean; updated?: string }) {
  return (
    <div className="city-info" data-testid="city-info">
      {!compact && <div className="small" style={{ color: 'var(--ink2)' }}>{w.line}</div>}
      <dl className="city-facts">
        <div><dt>가기 좋은 때</dt><dd>{monthsLabel(w.best)} · {w.why}</dd></div>
        <div><dt>비행</dt><dd>인천에서 {flyLabel(w.fly)} · {tzLabel(w.tz)}</dd></div>
        <div><dt>돈</dt><dd>{w.cur} · {COST_LABEL[w.cost]}</dd></div>
        <div><dt>말·콘센트</dt><dd>{w.lang} · {w.plug}</dd></div>
        <div><dt>걷기</dt><dd>{WALK_LABEL[w.walk]}{w.with.length ? ` · ${josa(w.with.join('·'), '와/과')} 좋아요` : ''}</dd></div>
        <div><dt>입국</dt><dd>{w.entry}{updated ? <span className="tiny muted"> · {updated.slice(0, 7).replace('-', '.')} 기준, 떠나기 전 확인</span> : null}</dd></div>
      </dl>
      {phraseLink(w)}
      <div className="city-picks">
        <span className="tiny muted" style={{ fontWeight: 800 }}>먹을 것</span>
        <div className="chips">{w.eat.map((t) => <Pick key={t} text={t} onAdd={onAdd ? () => onAdd('foods', t) : undefined} />)}</div>
        <span className="tiny muted" style={{ fontWeight: 800 }}>볼 것</span>
        <div className="chips">{w.see.map((t) => <Pick key={t} text={t} onAdd={onAdd ? () => onAdd('spots', t) : undefined} />)}</div>
      </div>
    </div>
  );
}

/** 현지어 한마디로 가는 길 (영어권은 오늘의 영어로) */
function phraseLink(w: WorldCity) {
  const code = phraseLangFor(w.lang);
  if (!code) return null;
  const to = code === 'en' ? '/study' : `/phrases/${code}?city=${encodeURIComponent(w.city)}`;
  return <Link to={to} className="btn sm soft" style={{ alignSelf: 'flex-start' }} data-testid="city-phrases"><Icon name="play" size={14} />{code === 'en' ? '영어 표현 익히기' : `${LANG_LABEL[code]} 한마디 30문장`}</Link>;
}

function Pick({ text, onAdd }: { text: string; onAdd?: () => void }) {
  if (!onAdd) return <span className="chip" style={{ cursor: 'default' }}>{text}</span>;
  return <button type="button" className="chip" onClick={onAdd} aria-label={`${text} 메모에 넣기`}>{text}<Icon name="plus" size={13} stroke={2.4} /></button>;
}
