import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './ui';
import { summarize, FROM_LABEL } from '../../desk/src/inventory';
import { buildTree, type TreeNode } from '../../desk/src/tree';
import type { DeskTrip } from '../../desk/src/trips';
import type { Item } from '../../desk/src/types';

const n = (x: number) => x.toLocaleString('ko-KR');
const mb = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)}GB` : b >= 1e6 ? `${Math.round(b / 1e6)}MB` : `${Math.max(1, Math.round(b / 1e3))}KB`);
const ICON: Record<TreeNode['kind'], string> = { trips: 'bag', trip: 'bag', day: 'calendar', notrip: 'home', year: 'calendar', month: 'calendar', stuff: 'file', unknown: 'help', dupes: 'copy', dupe: 'copy', vaults: 'drive', vault: 'drive', bucket: 'folder' };

/** 미리보기를 어디서 가져올지: 폰은 고른 파일(object URL), 윈도우 앱은 IPC로 작은 그림 */
export type ThumbSource = (item: Item) => Promise<string | null> | string | null;

/**
 * 사진 서랍: 알아서 분류된 사진을 탐색기 폴더처럼 — 서랍 목록 → 들어가기(빵부스러기) → 격자 → 크게 보기.
 * 폰(사진 고르기)과 윈도우 앱(폴더 훑기)이 같이 쓴다. 분류는 desk/src/tree.ts.
 */
export default function DrawerBrowser({ items, trips, thumb, onTrip, wide, extra }: {
  items: Item[];
  trips: DeskTrip[];
  thumb: ThumbSource;
  /** 여행 서랍의 '여행 열기' */
  onTrip?: (tripId: string) => void;
  /** 넓은 화면(윈도우 앱): 격자 칸을 더 많이 */
  wide?: boolean;
  /** 맨 위 요약 줄 오른쪽에 붙일 것 (다른 사진 고르기 등) */
  extra?: React.ReactNode;
}) {
  const [path, setPath] = useState<TreeNode[]>([]);
  const [open, setOpen] = useState<Item | null>(null);
  const s = useMemo(() => summarize(items, trips), [items, trips]);
  const tree = useMemo(() => buildTree(items, trips), [items, trips]);
  useEffect(() => { setPath([]); setOpen(null); }, [items]);
  // 서랍 목록이 바뀌면(다시 훑기) 같은 이름의 서랍을 찾아 자리를 지킨다
  const here = useMemo(() => {
    let list = tree, node: TreeNode | null = null;
    for (const p of path) { const f = list.find((x) => x.name === p.name); if (!f) break; node = f; list = f.children; }
    return node;
  }, [tree, path]);
  const list = here ? here.children : tree;
  const leafFiles = here?.files ?? [];

  return (
    <div className={'drawer-browser' + (wide ? ' wide' : '')}>
      <div className="desk-sum" data-testid="desk-nums">
        <span>사진 <b>{n(s.photos)}</b>장</span><span>여행 <b>{n(s.trips)}</b>번</span><span>중복 <b>{n(s.dupes)}</b>장</span><span>모르는 사진 <b>{n(s.unknown)}</b>장</span>
        <span className="tiny muted" style={{ flexBasis: '100%' }}>파일 {n(s.files)}개 · {mb(s.bytes)}{extra ? <> · {extra}</> : null}</span>
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
              <span className="name">{d.name}{d.tripId && onTrip && <a href="#" className="tiny" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTrip(d.tripId!); }} style={{ marginLeft: 8 }}>여행 열기</a>}</span>
              <span className="cnt">{n(d.count)}{d.kind === 'vaults' ? '곳' : '장'}</span>
              <Icon name="chev" size={16} />
            </button>
          ))}
        </div>
      )}

      {leafFiles.length > 0 && (
        <div className="desk-grid" data-testid="desk-grid">
          {leafFiles.map((i) => <Thumb key={i.root + '/' + i.rel} item={i} thumb={thumb} onOpen={() => setOpen(i)} />)}
        </div>
      )}

      {list.length === 0 && leafFiles.length === 0 && <div className="small muted" style={{ padding: 16 }}>이 서랍은 비어 있어요.</div>}

      {open && (
        <div className="desk-view" role="dialog" aria-label={open.rel} onClick={() => setOpen(null)}>
          <Thumb item={open} thumb={thumb} big />
          <div className="desk-view-cap">
            <div className="small" style={{ wordBreak: 'break-all' }}>{open.root !== '폰' ? `${open.root}/` : ''}{open.rel}</div>
            <div className="tiny" style={{ opacity: .8 }}>{open.taken ? open.taken.replace('T', ' ') : '시각 없음'} · {FROM_LABEL[open.takenFrom ?? ''] ?? ''}{open.received ? ' · 받은 사진' : ''}{open.lat != null ? ' · 자리 있음' : ' · 자리 없음'}{open.camera ? ` · ${open.camera}` : ''}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 작은 미리보기: 화면에 보일 때만 만든다 (폰은 object URL, 앱은 IPC) */
function Thumb({ item, thumb, onOpen, big }: { item: Item; thumb: ThumbSource; onOpen?: () => void; big?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const ref = useRef<HTMLButtonElement | HTMLDivElement>(null);
  useEffect(() => {
    let on = true, made: string | null = null;
    const make = async () => {
      const u = await thumb(item);
      if (!on) { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); return; }
      made = u; setUrl(u);
    };
    if (big || !('IntersectionObserver' in window)) { void make(); }
    else {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { void make(); io.disconnect(); } }, { rootMargin: '300px' });
      if (ref.current) io.observe(ref.current);
      return () => { on = false; io.disconnect(); if (made && made.startsWith('blob:')) URL.revokeObjectURL(made); };
    }
    return () => { on = false; if (made && made.startsWith('blob:')) URL.revokeObjectURL(made); };
  }, [item, thumb, big]);
  const cap = item.taken ? (item.taken.length > 10 ? item.taken.slice(5, 16).replace('T', ' ').replace('-', '/') : item.taken) : '';
  if (big) return <div className="desk-big" ref={ref as React.RefObject<HTMLDivElement>}>{url ? <img src={url} alt="" /> : <span className="tiny muted">미리보기 없음</span>}</div>;
  return (
    <button ref={ref as React.RefObject<HTMLButtonElement>} className={'desk-thumb' + (item.takenFrom === 'mtime' || item.received ? ' guess' : '')} onClick={onOpen} aria-label={item.rel}>
      {url ? <img src={url} alt="" loading="lazy" /> : <span className="ph" />}
      <span className="cap">{cap}</span>
    </button>
  );
}
