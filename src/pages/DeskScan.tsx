import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, TopBar } from '../components/ui';
import DrawerBrowser, { type ThumbSource } from '../components/DrawerBrowser';
import { useTrips } from '../lib/data';
import { itemsFromFiles } from '../lib/deskWeb';
import type { DeskTrip } from '../../desk/src/trips';
import type { Item } from '../../desk/src/types';

const n = (x: number) => x.toLocaleString('ko-KR');

/**
 * 사진 서랍 (폰): 고른 사진을 폰 안에서만 읽어 서랍(탐색기)처럼 보여 준다. 아무것도 올리지 않는다.
 * 분류와 화면은 윈도우 앱(desk-app/)과 같다.
 */
export default function DeskScan() {
  const { trips } = useTrips();
  const nav = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [done, setDone] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const deskTrips = useMemo<DeskTrip[]>(() => (trips ?? []).filter((t) => t.status === 'done').map((t) => ({ id: t.id, title: t.title, when: t.when, places: t.places })), [trips]);
  const fileOf = useMemo(() => new Map(files.map((f) => [(f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name, f])), [files]);
  const thumb = useCallback<ThumbSource>((i) => { const f = fileOf.get(i.rel); return f && f.type.startsWith('image/') ? URL.createObjectURL(f) : null; }, [fileOf]);

  useEffect(() => {
    if (!files.length) return;
    let on = true;
    setItems(null); setDone(0);
    void itemsFromFiles(files, (d) => { if (on) setDone(d); }).then((list) => { if (on) setItems(list); });
    return () => { on = false; };
  }, [files]);

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

      {items && (
        <DrawerBrowser items={items} trips={deskTrips} thumb={thumb} onTrip={(id) => nav(`/trips/${id}`)}
          extra={<button className="linklike" onClick={() => input.current?.click()} data-testid="desk-repick">다른 사진 고르기</button>} />
      )}
    </div>
  );
}
