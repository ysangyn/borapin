import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, TopBar } from '../components/ui';
import { useTrips } from '../lib/data';
import { itemsFromFiles } from '../lib/deskWeb';
import { summarize, FROM_LABEL } from '../../desk/src/inventory';
import { buildTree, type TreeNode } from '../../desk/src/tree';
import type { DeskTrip } from '../../desk/src/trips';
import type { Item } from '../../desk/src/types';

const n = (x: number) => x.toLocaleString('ko-KR');
const mb = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)}GB` : b >= 1e6 ? `${Math.round(b / 1e6)}MB` : `${Math.max(1, Math.round(b / 1e3))}KB`);
const ICON: Record<TreeNode['kind'], string> = { trips: 'bag', trip: 'bag', day: 'calendar', notrip: 'home', year: 'calendar', month: 'calendar', stuff: 'file', unknown: 'help', dupes: 'copy', dupe: 'copy', vaults: 'drive', vault: 'drive', bucket: 'folder' };

/**
 * 사진 훑어보기 (폰): 고른 사진을 폰 안에서만 읽어 서랍(탐색기)처럼 보여 준다. 아무것도 올리지 않는다.
 * 분류는 PC 사진함 0단계(desk/)와 같은 함수.
 */
export default function DeskScan() {
  const { trips } = useTrips();
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [done, setDone] = useState(0);
  const [path, setPath] = useState<TreeNode[]>([]);
  const [open, setOpen] = useState<Item | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const deskTrips = useMemo<DeskTrip[]>(() => (trips ?? []).filter((t) => t.status === 'done').map((t) => ({ id: t.id, title: t.title, when: t.when, places: t.places })), [trips]);
  const fileOf = useMemo(() => new Map(files.map((f) => [(f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name, f])), [files]);

  useEffect(() => {
    if (!files.length) return;
    let on = true;
    setItems(null); setDone(0); setPath([]);
    void itemsFromFiles(files, (d) => { if (on) setDone(d); }).then((list) => { if (on) setItems(list); });
    return () => { on = false; };
  }, [files]);

  const s = useMemo(() => (items ? summarize(items, deskTrips) : null), [items, deskTrips]);
  const tree = useMemo(() => (items ? buildTree(items, deskTrips) : []), [items, deskTrips]);
  const here = path.length ? path[path.length - 1] : null;
  const list = here ? here.children : tree;
  const leafFiles = here?.files ?? [];

  return (
    <div className="page desk-scan">
      <TopBar title="사진 서랍" back backTo="/space" />
      {!items && (
        <div className="small muted" style={{ padding: '0 16px 10px' }}>고른 사진을 폰 안에서만 읽어 여행·날짜·자료·모르는 사진 서랍으로 나눠 보여 줘요. 어디에도 올리지 않고, 사진도 바뀌지 않아요. 폰 전체를 알아서 훑는 건 PC 사진함이 해요.</div>
      )}

      <input ref={input} type="file" accept="image/*,video/*" multiple hidden data-testid="desk-files" onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) setFiles(f); e.target.value = ''; }} />
      {!items && (
        <div style={{ padding: '0 16px 14px' }}>
          <button className="btn primary" style={{ width: '100%' }} onClick={() => input.current?.click()} data-testid="desk-pick">
            <Icon name="camera" size={18} /> 사진 고르기
          </button>
          <div className="tiny muted" style={{ marginTop: 6, textAlign: 'center' }}>갤러리에서 여러 장을 한 번에 골라요 — 한 여행만큼 골라 보면 돼요</div>
        </div>
      )}

      {files.length > 0 && !items && (
        <div className="card" style={{ margin: '0 16px', padding: 14 }} data-testid="desk-progress">
          <div className="small">읽는 중 {n(done)} / {n(files.length)}</div>
          <div className="bar"><i style={{ width: `${Math.round((done / files.length) * 100)}%` }} /></div>
        </div>
      )}

      {items && s && (
        <>
          <div className="desk-sum" data-testid="desk-nums">
            <span>사진 <b>{n(s.photos)}</b>장</span><span>여행 <b>{n(s.trips)}</b>번</span><span>중복 <b>{n(s.dupes)}</b>장</span><span>모르는 사진 <b>{n(s.unknown)}</b>장</span>
            <span className="tiny muted" style={{ flexBasis: '100%' }}>파일 {n(s.files)}개 · {mb(s.bytes)} · <button className="linklike" onClick={() => input.current?.click()} data-testid="desk-repick">다른 사진 고르기</button></span>
          </div>

          <nav className="desk-crumb" aria-label="서랍 위치" data-testid="desk-crumb">
            <button className={path.length ? '' : 'on'} onClick={() => setPath([])}>서랍</button>
            {path.map((p, i) => <span key={i}><i>›</i><button className={i === path.length - 1 ? 'on' : ''} onClick={() => setPath(path.slice(0, i + 1))}>{p.name}</button></span>)}
          </nav>

          {list.length > 0 && (
            <div className="desk-drawers" data-testid="desk-drawers">
              {list.map((d) => (
                <button key={d.name} className="desk-drawer" onClick={() => setPath([...path, d])} data-kind={d.kind}>
                  <span className="ico"><Icon name={ICON[d.kind]} size={20} /></span>
                  <span className="name">{d.name}{d.tripId && <Link to={`/trips/${d.tripId}`} className="tiny" onClick={(e) => e.stopPropagation()} style={{ marginLeft: 8 }}>여행 열기</Link>}</span>
                  <span className="cnt">{n(d.count)}{d.kind === 'vaults' ? '곳' : '장'}</span>
                  <Icon name="chev" size={16} />
                </button>
              ))}
            </div>
          )}

          {leafFiles.length > 0 && (
            <div className="desk-grid" data-testid="desk-grid">
              {leafFiles.map((i) => <Thumb key={i.root + '/' + i.rel} item={i} file={fileOf.get(i.rel)} onOpen={() => setOpen(i)} />)}
            </div>
          )}

          {list.length === 0 && leafFiles.length === 0 && <div className="small muted" style={{ padding: 16 }}>이 서랍은 비어 있어요.</div>}
        </>
      )}

      {open && (
        <div className="desk-view" role="dialog" aria-label={open.rel} onClick={() => setOpen(null)}>
          <Thumb item={open} file={fileOf.get(open.rel)} big />
          <div className="desk-view-cap">
            <div className="small" style={{ wordBreak: 'break-all' }}>{open.rel}</div>
            <div className="tiny" style={{ opacity: .8 }}>{open.taken ? open.taken.replace('T', ' ') : '시각 없음'} · {FROM_LABEL[open.takenFrom ?? ''] ?? ''}{open.received ? ' · 받은 사진' : ''}{open.lat != null ? ' · 자리 있음' : ' · 자리 없음'}{open.camera ? ` · ${open.camera}` : ''}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 폰 안의 파일로 작은 미리보기 (object URL, 화면에 보일 때만 만들고 사라지면 거둔다) */
function Thumb({ item, file, onOpen, big }: { item: Item; file?: File; onOpen?: () => void; big?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const ref = useRef<HTMLButtonElement | HTMLDivElement>(null);
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) return;
    let u: string | null = null;
    const make = () => { if (!u) { u = URL.createObjectURL(file); setUrl(u); } };
    if (big || !('IntersectionObserver' in window)) { make(); return () => { if (u) URL.revokeObjectURL(u); }; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { make(); io.disconnect(); } }, { rootMargin: '200px' });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); if (u) URL.revokeObjectURL(u); };
  }, [file, big]);
  const cap = item.taken ? (item.taken.length > 10 ? item.taken.slice(5, 16).replace('T', ' ').replace('-', '/') : item.taken) : '';
  if (big) return <div className="desk-big" ref={ref as React.RefObject<HTMLDivElement>}>{url ? <img src={url} alt="" /> : <span className="tiny muted">미리보기 없음</span>}</div>;
  return (
    <button ref={ref as React.RefObject<HTMLButtonElement>} className={'desk-thumb' + (item.takenFrom === 'mtime' || item.received ? ' guess' : '')} onClick={onOpen} aria-label={item.rel}>
      {url ? <img src={url} alt="" loading="lazy" /> : <span className="ph" />}
      <span className="cap">{cap}</span>
    </button>
  );
}
