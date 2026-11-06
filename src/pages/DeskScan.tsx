import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, TopBar } from '../components/ui';
import { useTrips } from '../lib/data';
import { itemsFromFiles } from '../lib/deskWeb';
import { summarize, FROM_LABEL, CONF_LABEL } from '../../desk/src/inventory';
import { groupDupes } from '../../desk/src/dupes';
import { matchTrips, type DeskTrip } from '../../desk/src/trips';
import type { Item } from '../../desk/src/types';

const n = (x: number) => x.toLocaleString('ko-KR');
const mb = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)}GB` : b >= 1e6 ? `${Math.round(b / 1e6)}MB` : `${Math.max(1, Math.round(b / 1e3))}KB`);

/**
 * 사진 훑어보기 (폰): 고른 사진을 폰 안에서만 읽어 네 숫자를 보여 준다. 아무것도 올리지 않는다.
 * PC 사진함 0단계(desk/)와 같은 함수를 쓴다.
 */
export default function DeskScan() {
  const { trips } = useTrips();
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [done, setDone] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const deskTrips = useMemo<DeskTrip[]>(() => (trips ?? []).filter((t) => t.status === 'done').map((t) => ({ id: t.id, title: t.title, when: t.when, places: t.places })), [trips]);

  useEffect(() => {
    if (!files.length) return;
    let on = true;
    setItems(null); setDone(0);
    void itemsFromFiles(files, (d) => { if (on) setDone(d); }).then((list) => { if (on) setItems(list); });
    return () => { on = false; };
  }, [files]);

  const s = useMemo(() => (items ? summarize(items, deskTrips) : null), [items, deskTrips]);
  const dupes = useMemo(() => (items ? groupDupes(items) : null), [items]);
  const matches = useMemo(() => (items ? matchTrips(items, deskTrips) : []), [items, deskTrips]);
  const unknown = useMemo(() => (items ? items.map((i, k) => ({ i, k })).filter(({ i, k }) => !i.taken || i.takenFrom === 'mtime' || i.received || (i.lat == null && !matches[k].tripId)) : []), [items, matches]);

  return (
    <div className="page desk-scan">
      <TopBar title="사진 훑어보기" back backTo="/space" />
      <div className="small muted" style={{ padding: '0 16px 10px' }}>고른 사진을 폰 안에서만 읽어요. 어디에도 올리지 않고, 사진도 바뀌지 않아요. 폰 전체를 알아서 훑는 건 PC 사진함이 해요.</div>

      <input ref={input} type="file" accept="image/*,video/*" multiple hidden data-testid="desk-files" onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) setFiles(f); e.target.value = ''; }} />
      <div style={{ padding: '0 16px 14px' }}>
        <button className="btn primary" style={{ width: '100%' }} onClick={() => input.current?.click()} data-testid="desk-pick">
          <Icon name="camera" size={18} /> {items ? '다른 사진 고르기' : '사진 고르기'}
        </button>
        <div className="tiny muted" style={{ marginTop: 6, textAlign: 'center' }}>갤러리에서 여러 장을 한 번에 골라요 — 한 여행만큼 골라 보면 돼요</div>
      </div>

      {files.length > 0 && !items && (
        <div className="card" style={{ margin: '0 16px', padding: 14 }} data-testid="desk-progress">
          <div className="small">읽는 중 {n(done)} / {n(files.length)}</div>
          <div className="bar"><i style={{ width: `${Math.round((done / files.length) * 100)}%` }} /></div>
        </div>
      )}

      {items && s && dupes && (
        <>
          <div className="desk-nums" data-testid="desk-nums">
            <div className="card"><span className="jua">사진 <b>{n(s.photos)}</b>장</span><span className="tiny muted">파일 {n(s.files)}개 · {mb(s.bytes)}</span></div>
            <div className="card"><span className="jua">여행 <b>{n(s.trips)}</b>번</span><span className="tiny muted">우리 여행 {n(deskTrips.length)}번 중 사진이 붙은 것</span></div>
            <div className="card"><span className="jua">중복 <b>{n(s.dupes)}</b>장</span><span className="tiny muted">완전히 같은 파일 · {mb(s.dupeBytes)} 겹침</span></div>
            <div className="card"><span className="jua">모르는 사진 <b>{n(s.unknown)}</b>장</span><span className="tiny muted">언제 모름 {n(s.unknownWhen)} · 어디 모름 {n(s.unknownWhere)}</span></div>
          </div>

          {s.byTrip.length > 0 && (
            <section style={{ padding: '6px 16px' }}>
              <div className="label">여행별</div>
              <div className="card" style={{ padding: '4px 14px' }}>
                {s.byTrip.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <Link to={`/trips/${t.id}`} className="small" style={{ fontWeight: 600 }}>{t.title}</Link>
                    <span className="tiny muted">{n(t.files)}장 · 날짜로 확실 {n(t.sure)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={{ padding: '6px 16px' }}>
            <div className="label">촬영 시각을 어디서 읽었나</div>
            <div className="card" style={{ padding: '10px 14px' }}>
              {Object.entries(s.byTakenFrom).map(([k, c]) => <div key={k} className="small" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>{FROM_LABEL[k] ?? k}</span><span className="muted">{n(c)}장</span></div>)}
            </div>
          </section>

          {dupes.groups.length > 0 && (
            <section style={{ padding: '6px 16px' }}>
              <div className="label">중복 {n(dupes.groups.length)}묶음</div>
              <div className="card" style={{ padding: '10px 14px' }}>
                {dupes.groups.slice(0, 20).map((g) => <div key={g.sha} className="tiny" style={{ padding: '4px 0', borderBottom: '1px solid var(--line)', wordBreak: 'break-all' }}>{g.paths.map((p) => p.replace(/^폰\//, '')).join(' = ')}</div>)}
              </div>
            </section>
          )}

          <section style={{ padding: '6px 16px 24px' }}>
            <div className="label">모르는 사진 {n(unknown.length)}{unknown.length > 100 ? ' · 100장까지' : ''}</div>
            {unknown.length === 0 ? <div className="small muted" style={{ padding: '0 4px' }}>모두 언제·어디를 알아요.</div> : (
              <div className="card" style={{ padding: '4px 14px' }} data-testid="desk-unknown">
                {unknown.slice(0, 100).map(({ i, k }) => (
                  <div key={i.rel} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <div className="small" style={{ wordBreak: 'break-all' }}>{i.rel}</div>
                    <div className="tiny muted">{i.taken ?? '시각 없음'} · {FROM_LABEL[i.takenFrom ?? ''] ?? ''}{i.received ? ' · 받은 사진' : ''}{i.lat != null ? ' · 자리 있음' : ' · 자리 없음'}{matches[k].tripId ? ` · ${deskTrips.find((t) => t.id === matches[k].tripId)?.title} (${CONF_LABEL[matches[k].confidence!]})` : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
