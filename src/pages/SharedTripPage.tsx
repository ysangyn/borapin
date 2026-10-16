import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Logo } from '../components/ui';
import MapView from '../components/LazyMap';
import { openSlideshow } from '../components/slideshow';
import PhotoImg from '../components/PhotoImg';
import { computeStats } from '../lib/stats';
import { placeLong } from '../lib/geo';
import { KIND_LABEL, VERDICT_LABEL } from '../lib/placeRecs';
import { loadShared } from '../lib/share';
import type { Photo, PlaceKind, SharedTrip, Trip, Verdict } from '../lib/types';

/** 링크 공개된 여행: 로그인 없이 보는 읽기 전용 페이지 */
export default function SharedTripPage() {
  const { token } = useParams();
  const [d, setD] = useState<SharedTrip | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (!token) return;
    setFailed(false);
    loadShared(token).then(setD, (e: { code?: string }) => (e?.code === 'permission-denied' ? setD(null) : setFailed(true)));
  }, [token, round]);
  const stats = useMemo(() => (d ? computeStats([{ id: 's', title: d.title, kind: 'trip', status: 'done', when: { p: 'unknown' }, places: d.places, companions: [], memo: '', tags: [], source: 'app', v: 1 } as Trip]) : null), [d]);
  const photos = useMemo(() => (d?.photos ?? []).filter((p) => p.id).map((p) => ({ ...p, tripId: null, takenGuess: false, bytes: 0, v: 1 }) as Photo), [d]);

  if (failed)
    return (
      <div className="center-screen">
        <Logo size={56} />
        <b>여행을 불러오지 못했어요</b>
        <span className="small muted">인터넷 연결을 확인한 뒤 다시 열어 주세요.</span>
        <button className="btn" onClick={() => setRound((r) => r + 1)}>다시 불러오기</button>
      </div>
    );
  if (d === undefined) return <div className="center-screen muted">불러오는 중…</div>;
  if (d === null) return <div className="center-screen"><Logo size={56} /><b>공개가 끝났거나 없는 여행이에요</b></div>;
  const abroad = d.places.every((p) => p.t === 'country');
  return (
    <div className="page" style={{ paddingTop: 20, paddingBottom: 40 }} data-testid="shared-trip">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}><Logo />보라핀 <span className="muted small" style={{ fontWeight: 600 }}>· {d.space}의 여행</span></div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{d.title}</div>
        <div className="muted">{d.when} · {d.places.map(placeLong).join(', ')}</div>
      </div>
      {photos[0] && (
        <button className="trip-cover" onClick={() => openSlideshow(photos, 0)} aria-label="사진 크게 보기"><PhotoImg id={photos[0].id} size="l" /></button>
      )}
      <MapView mode={abroad ? 'world' : 'kr'} stats={stats} focus={d.places} height={220} controls={false} interactive={false} />
      {photos.length > 1 && (
        <section>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <h2 className="h2" style={{ fontSize: 17 }}>사진 · {photos.length}</h2>
            <button className="link-btn" onClick={() => openSlideshow(photos, 0, { autoplay: true })}>▶ 슬라이드쇼</button>
          </div>
          <div className="photo-grid">
            {photos.map((p, i) => (
              <button key={p.id} className="photo-cell" onClick={() => openSlideshow(photos, i)} aria-label={`사진 ${i + 1}`}><PhotoImg id={p.id} /></button>
            ))}
          </div>
        </section>
      )}
      {(d.spots ?? []).length > 0 && (
        <section>
          <h2 className="h2" style={{ fontSize: 17, marginBottom: 4 }}>들른 곳</h2>
          <div className="list">
            {(d.spots ?? []).map((s, i) => (
              <div key={i} className="rec-row">
                <span className={`kind-badge k-${s.kind}`}>{KIND_LABEL[s.kind as PlaceKind] ?? s.kind}</span>
                <b style={{ flex: 1 }}>{s.name}</b>
                {s.verdict && <span className={`tag verdict v-${s.verdict}`}>{VERDICT_LABEL[s.verdict as Verdict]}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="shared-foot"><Logo size={20} /><span>보라핀으로 남긴 여행이에요 · 가본 곳마다, 우리 핀 하나</span></div>
    </div>
  );
}
