import { useEffect, useState } from 'react';
import { Icon, useToast } from './ui';
import { disableShare, enableShare, shareUrl, syncShare } from '../lib/share';
import { isOffline } from '../lib/writes';
import { kakaoReady, shareAnyhow } from '../lib/kakao';
import { photoForPlace } from '../lib/media';
import { formatWhen } from '../lib/dates';
import { placeLabel } from '../lib/geo';
import type { Photo, PlaceRec, Trip } from '../lib/types';

/**
 * 공개 중인 여행이 바뀌면(사진 올리기·지우기, 제목·장소 고치기) 사본도 맞춘다.
 * 여행 상세 화면이 열려 있는 동안 어느 탭에 있든 돈다. 바뀐 게 없으면 쓰지 않는다.
 */
export function useShareSync(trip: Trip | undefined, photos: Photo[] | null, recs: PlaceRec[] | null) {
  const token = trip?.share?.token;
  const sig = trip && photos && recs ? JSON.stringify([token, trip.title, trip.when, trip.places, photos.map((p) => p.id + (p.caption ?? '')), recs.map((r) => r.id + r.name + r.verdict)]) : '';
  useEffect(() => {
    if (!token || !sig || !trip || !photos || !recs) return;
    const t = window.setTimeout(() => syncShare(trip, photos, recs).catch((e) => console.warn(e)), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
}

/** 여행 공유 링크: 앱이 없어도 이 여행의 지도·사진·들른 곳을 보는 읽기 전용 페이지 */
export default function ShareLinkCard({ trip, photos, recs }: { trip: Trip; photos: Photo[]; recs: PlaceRec[] }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const token = trip.share?.token;
  const url = token ? shareUrl(token) : '';

  const run = async (job: () => Promise<unknown>, ok: string) => {
    if (busy) return;
    if (isOffline()) return toast('인터넷에 연결된 뒤에 할 수 있어요');
    setBusy(true);
    try {
      await job();
      toast(ok);
    } catch (e) {
      console.warn(e);
      toast('하지 못했어요. 잠시 뒤 다시 해 주세요');
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
  // 카카오톡(등록된 주소에서) → 기기 공유하기 → 복사
  const share = async () => {
    const photo = trip.places.map(photoForPlace).find(Boolean);
    const r = await shareAnyhow({
      title: trip.title,
      description: `${formatWhen(trip.when)} · ${trip.places.map(placeLabel).join(', ')}${photos.length ? ` · 사진 ${photos.length}장` : ''}`,
      imageUrl: photo ? `${location.origin}${photo.src.l}` : undefined,
      url,
      button: '여행 보기',
    }, () => toast('링크를 복사했어요'));
    if (r === 'kakao') toast('카카오톡으로 보냈어요');
  };

  return (
    <section className="card white" style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="share-link">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <b style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="link" size={17} />링크 공개</b>
        {token ? <span className="tag violet">공개 중</span> : <span className="tag">우리만 보기</span>}
      </div>
      {!token ? (
        <>
          <span className="small muted">
            앱이 없어도 이 여행을 볼 수 있는 링크를 만들어요. 제목·날짜·장소, 사진{photos.length > 60 ? '(앞의 60장)' : ''}과 촬영 날짜·설명, 들른 곳 이름이 보여요. 메모와 글, 함께 간 사람 이름은 넣지 않아요.
          </span>
          <button className="btn sm" style={{ alignSelf: 'flex-start' }} disabled={busy} onClick={() => run(() => enableShare(trip, photos, recs), '링크를 만들었어요 · 아래 보내기로 전하세요')} data-testid="share-on">
            {busy ? '만드는 중…' : '링크 만들기'}
          </button>
        </>
      ) : (
        <>
          <input className="input" readOnly value={url} aria-label="공유 링크" onFocus={(e) => e.target.select()} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm" onClick={share} data-testid="share-send">{kakaoReady() ? '카카오톡으로 보내기' : '보내기'}</button>
            <button className="btn sm ghost" onClick={copy}>복사</button>
            <a className="btn sm ghost" href={url} target="_blank" rel="noreferrer">미리 보기</a>
            <button className="btn sm line" style={{ marginLeft: 'auto' }} disabled={busy} onClick={() => run(() => disableShare(trip, photos), '공개를 껐어요')}>공개 끄기</button>
          </div>
        </>
      )}
    </section>
  );
}
