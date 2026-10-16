import { useEffect, useRef, useState } from 'react';
import { Icon, useToast } from './ui';
import { disableShare, enableShare, shareUrl, syncShare } from '../lib/share';
import type { Photo, PlaceRec, Trip } from '../lib/types';

/** 여행 공유 링크: 앱이 없어도 이 여행의 지도·사진·들른 곳을 보는 읽기 전용 페이지 */
export default function ShareLinkCard({ trip, photos, recs }: { trip: Trip; photos: Photo[]; recs: PlaceRec[] }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const token = trip.share?.token;
  const url = token ? shareUrl(token) : '';

  // 공개 중이면 여행·사진·장소가 바뀔 때 사본도 맞춘다 (잠깐 모아서)
  const sig = JSON.stringify([trip.title, trip.when, trip.places, photos.map((p) => p.id + (p.caption ?? '')), recs.map((r) => r.id + r.verdict)]);
  const first = useRef(true);
  useEffect(() => {
    if (!token) return;
    if (first.current) { first.current = false; return; }
    const t = window.setTimeout(() => syncShare(trip, photos, recs).catch((e) => console.warn(e)), 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, token]);

  const on = async () => {
    setBusy(true);
    try {
      await enableShare(trip, photos, recs);
      toast('링크를 만들었어요');
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('링크를 복사했어요');
    } catch {
      window.prompt('이 링크를 복사하세요', url);
    }
  };
  const share = async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) await nav.share({ title: trip.title, url }).catch(() => undefined);
    else copy();
  };

  return (
    <section className="card white" style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="share-link">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <b style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="link" size={17} />링크 공개</b>
        {token ? <span className="tag violet">공개 중</span> : <span className="tag">우리만 보기</span>}
      </div>
      {!token ? (
        <>
          <span className="small muted">앱이 없어도 이 여행의 지도·사진·들른 곳을 볼 수 있는 링크를 만들어요. 메모와 글, 함께 간 사람 이름은 넣지 않아요.</span>
          <button className="btn sm soft" style={{ alignSelf: 'flex-start' }} disabled={busy} onClick={on} data-testid="share-on">링크 만들기</button>
        </>
      ) : (
        <>
          <input className="input" readOnly value={url} aria-label="공유 링크" onFocus={(e) => e.target.select()} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm" onClick={share}>보내기</button>
            <button className="btn sm ghost" onClick={copy}>복사</button>
            <a className="btn sm ghost" href={url} target="_blank" rel="noreferrer">미리 보기</a>
            <button className="btn sm line" style={{ marginLeft: 'auto' }} disabled={busy} onClick={() => disableShare(trip).then(() => toast('공개를 껐어요'))}>공개 끄기</button>
          </div>
        </>
      )}
    </section>
  );
}
