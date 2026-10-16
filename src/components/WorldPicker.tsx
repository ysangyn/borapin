import { useMemo, useState } from 'react';
import { josa } from 'es-hangul';
import { useNavigate } from 'react-router-dom';
import { Icon, useToast } from './ui';
import { useAuth } from '../lib/auth';
import type { Stats } from '../lib/data';
import { monthsLabel } from '../lib/seasons';
import { quickWish } from '../lib/wishActions';
import { cityPlace, COST_LABEL, countryName, flyLabel, pickCities, TAG_CHOICES, useWorld, WALK_LABEL, type WorldCity, type WorldFilter } from '../lib/world';
import type { Wish } from '../lib/types';

/**
 * 해외 도시 고르기: 테마를 못 박지 않고 속성을 조합한다.
 * 떠날 달(날씨는 자동) × 예산 × 가는 시간 × 누구와 × 끌리는 것. 조건을 고를수록 목록이 줄고, '하나 뽑기'는 그 안에서 고른다.
 */
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
export default function WorldPicker({ stats, wishes, unvisitedOnly }: { stats: Stats | null; wishes: Wish[]; unvisitedOnly: boolean }) {
  const world = useWorld();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const now = new Date().getMonth() + 1;
  const [month, setMonth] = useState<number | null>(now % 12 + 1); // 기본은 다음 달
  const [cost, setCost] = useState<WorldFilter['cost']>(null);
  const [fly, setFly] = useState<WorldFilter['fly']>(null);
  const [withWho, setWithWho] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [picked, setPicked] = useState<WorldCity | null>(null);
  const [moreTags, setMoreTags] = useState(false);

  const list = useMemo(() => pickCities(world, { month, cost, fly, with: withWho, tags, unvisitedOnly }, stats, wishes), [world, month, cost, fly, withWho, tags, unvisitedOnly, stats, wishes]);
  const shown = picked ? [picked] : showAll ? list : list.slice(0, 3);

  const add = async (w: WorldCity) => {
    if (auth.status !== 'ready') return;
    try {
      const { id, already } = await quickWish(cityPlace(w), auth.user, wishes);
      toast(already ? '이미 담겨 있어요' : `${josa(w.city, '을/를')} 가고 싶은 곳에 담았어요`, { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch { toast('담지 못했어요. 다시 해 주세요'); }
  };
  const roll = () => { if (list.length) setPicked(list[Math.floor(Math.random() * Math.min(list.length, 12))]); };
  const toggleTag = (t: string) => { setPicked(null); setTags((xs) => (xs.includes(t) ? xs.filter((x) => x !== t) : [...xs, t])); };
  const set = <T,>(fn: (v: T) => void) => (v: T) => { setPicked(null); fn(v); };

  if (!world) return <div className="small muted">도시 자료를 불러오는 중…</div>;
  const visibleTags = moreTags ? TAG_CHOICES : TAG_CHOICES.slice(0, 8);
  return (
    <div className="world-picker" data-testid="world-picker">
      <div className="wp-row">
        <span className="wp-label">언제</span>
        <select className="select wp-select" aria-label="떠날 달" value={month ?? ''} onChange={(e) => set(setMonth)(e.target.value ? Number(e.target.value) : null)}>
          <option value="">아무 때나</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}월{m === now ? ' (이번 달)' : m === now % 12 + 1 ? ' (다음 달)' : ''}</option>)}
        </select>
      </div>
      <div className="wp-row"><span className="wp-label">예산</span><div className="chips">
        {([1, 2, 3] as const).map((c) => <button key={c} type="button" className={'chip' + (cost === c ? ' soft-on' : '')} onClick={() => set(setCost)(cost === c ? null : c)}>{c === 1 ? '가볍게' : c === 2 ? '보통까지' : '넉넉히'}</button>)}
      </div></div>
      <div className="wp-row"><span className="wp-label">비행</span><div className="chips">
        {([['near', '4시간 안'], ['mid', '8시간 안'], ['far', '멀어도 좋아요']] as const).map(([k, l]) => <button key={k} type="button" className={'chip' + (fly === k ? ' soft-on' : '')} onClick={() => set(setFly)(fly === k ? null : k)}>{l}</button>)}
      </div></div>
      <div className="wp-row"><span className="wp-label">누구와</span><div className="chips">
        {['둘이', '부모님', '아이', '친구'].map((w) => <button key={w} type="button" className={'chip' + (withWho === w ? ' soft-on' : '')} onClick={() => set(setWithWho)(withWho === w ? null : w)}>{w}</button>)}
      </div></div>
      <div className="wp-row"><span className="wp-label">끌리는 것</span><div className="chips">
        {visibleTags.map((t) => <button key={t} type="button" className={'chip' + (tags.includes(t) ? ' soft-on' : '')} onClick={() => toggleTag(t)}>{t}</button>)}
        <button type="button" className="chip dashed" onClick={() => setMoreTags((v) => !v)}>{moreTags ? '접기' : `더 보기 +${TAG_CHOICES.length - 8}`}</button>
      </div></div>

      <div className="row-between" style={{ alignItems: 'center', marginTop: 4 }}>
        <span className="small muted" data-testid="world-count">{list.length ? `${list.length}곳이 맞아요` : '조건에 맞는 곳이 없어요. 하나를 풀어 보세요.'}</span>
        <button className="btn sm soft" onClick={roll} disabled={!list.length} data-testid="world-roll"><Icon name="dice" size={16} />{picked ? '다시 뽑기' : '하나 뽑기'}</button>
      </div>
      <div className="list" data-testid="world-list">
        {shown.map((w) => <CityRow key={`${w.c}:${w.city}`} w={w} month={month} onAdd={() => add(w)} />)}
      </div>
      {!picked && list.length > 3 && <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setShowAll((v) => !v)}>{showAll ? '접기' : `${list.length - 3}곳 더 보기`}</button>}
      {picked && <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setPicked(null)}>목록으로</button>}
    </div>
  );
}

export function CityRow({ w, month, onAdd }: { w: WorldCity; month: number | null; onAdd: () => void }) {
  const goodNow = month ? w.best.includes(month) : false;
  return (
    <div className="wish-card world-city" data-testid="world-city">
      <div className="wish-main" style={{ cursor: 'default' }}>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span className="t">{w.city} <span className="small muted" style={{ fontWeight: 600 }}>{countryName(w)}</span></span>
          <span className="small" style={{ color: 'var(--ink2)' }}>{w.line}</span>
          <span className="tiny muted wp-meta">
            <span>{COST_LABEL[w.cost]}</span><span>인천에서 {flyLabel(w.fly)}</span><span>{WALK_LABEL[w.walk]}</span>
          </span>
          <span className="tiny" style={{ color: goodNow ? '#b4472c' : 'var(--ink3)', fontWeight: goodNow ? 700 : 500 }}>
            가기 좋은 때 {monthsLabel(w.best)}{month && !goodNow ? (w.summer === '시원' && [6, 7, 8].includes(month) ? ' · 여름에 시원해요' : w.winter === '따뜻' && [12, 1, 2].includes(month) ? ' · 겨울에 따뜻해요' : '') : ''} · {w.why}
          </span>
        </span>
      </div>
      <button className="btn sm coral" onClick={onAdd} data-testid="world-add"><Icon name="heart" size={15} stroke={2.2} />담기</button>
    </div>
  );
}
