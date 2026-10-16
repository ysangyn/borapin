import { useEffect, useState } from 'react';
import { Icon, useToast } from './ui';
import { mutatePacking } from '../lib/data';
import { packFromTemplate, PACK_TEMPLATES } from '../lib/tripExtras';
import { COUPLE } from '../lib/wishes';
import type { PackItem, Trip } from '../lib/types';

/** 준비물 (예정된 여행): 유형별 기본 목록, 담당자, 지난 여행에서 불러오기 */
export default function PackingCard({ trip, trips }: { trip: Trip; trips: Trip[] }) {
  // 누르면 바로 바뀌게 화면 먼저 고치고 저장한다
  const [list, setList] = useState<PackItem[]>(trip.packing ?? []);
  const remote = JSON.stringify(trip.packing ?? []);
  useEffect(() => {
    setList(JSON.parse(remote));
  }, [remote]);
  const [text, setText] = useState('');
  const abroad = trip.places.some((p) => p.t === 'country');
  const toast = useToast();
  // 화면은 바로 바꾸고, 저장은 서버 최신 목록에 같은 변화를 더해서 한다
  const apply = (fn: (l: PackItem[]) => PackItem[]) => {
    setList((l) => fn(l));
    mutatePacking(trip, fn).catch((e) => {
      console.warn(e);
      toast('준비물을 저장하지 못했어요');
      setList(JSON.parse(remote));
    });
  };
  const save = (next: PackItem[]) => apply(() => next);
  /** 같은 이름의 준비물을 찾아 고친다 (순서가 바뀌어도 맞게) */
  const edit = (x: PackItem, patch: Partial<PackItem> | null) =>
    apply((l) => (patch === null ? l.filter((y) => y.t !== x.t) : l.map((y) => (y.t === x.t ? { ...y, ...patch } : y))));
  const addItem = (t: string) => apply((l) => (l.some((y) => y.t === t) ? l : [...l, { t, who: null, done: false }]));
  const past = trips.filter((t) => t.id !== trip.id && (t.packing?.length ?? 0) > 0);
  const done = list.filter((x) => x.done).length;
  const nextWho = (w: string | null) => (w === null ? COUPLE[0] : w === COUPLE[0] ? COUPLE[1] : null);

  return (
    <section className="card white" data-testid="packing" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row-between" style={{ alignItems: 'center' }}>
        <h2 className="h2" style={{ fontSize: 17 }}>준비물</h2>
        {list.length > 0 && <span className="small" style={{ fontWeight: 700, color: done === list.length ? 'var(--ok)' : 'var(--ink3)' }}>{done}/{list.length} 챙김</span>}
      </div>
      {list.length === 0 && (
        <>
          <span className="small muted">어떤 여행인가요? 기본 목록을 채워 드려요.</span>
          <div className="chips">
            {Object.entries(PACK_TEMPLATES).map(([k, v]) => (
              <button key={k} className="chip" onClick={() => save(packFromTemplate(k, abroad))}>{v.label}</button>
            ))}
          </div>
          {past.length > 0 && (
            <select className="select" aria-label="지난 여행에서 불러오기" defaultValue="" onChange={(e) => {
              const t = past.find((x) => x.id === e.target.value);
              if (t) save((t.packing ?? []).map((x) => ({ ...x, done: false })));
            }}>
              <option value="">지난 여행에서 불러오기</option>
              {past.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          )}
        </>
      )}
      {list.map((x) => (
        <div key={x.t} className={'pack-row' + (x.done ? ' done' : '')}>
          <input type="checkbox" checked={x.done} aria-label={`${x.t} 챙김`} onChange={(e) => edit(x, { done: e.target.checked })} />
          <span style={{ flex: 1 }}>{x.t}</span>
          <button className={'chip tiny-chip' + (x.who ? ' soft-on' : '')} onClick={() => edit(x, { who: nextWho(x.who) })} aria-label={`${x.t} 담당자`}>{x.who ?? '담당'}</button>
          <button className="icon-btn" style={{ width: 36, height: 36 }} aria-label={`${x.t} 빼기`} onClick={() => { edit(x, null); toast(`'${x.t}' 뺐어요`, { label: '되돌리기', onClick: () => addItem(x.t) }); }}><Icon name="x" size={14} /></button>
        </div>
      ))}
      {list.length > 0 && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="input" aria-label="준비물 추가" placeholder="더 챙길 것" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && text.trim()) { addItem(text.trim()); setText(''); }
          }} />
          <button className="btn soft sm" style={{ height: 46 }} disabled={!text.trim()} onClick={() => { addItem(text.trim()); setText(''); }}>추가</button>
        </div>
      )}
    </section>
  );
}
