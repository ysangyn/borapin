import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, TopBar, useToast } from './ui';
import SpotMap from './SpotMap';
import HomeRoute from './HomeRoute';
import { useAuth, displayName } from '../lib/auth';
import { hideReview, useBlind } from '../lib/blind';
import { formatWhen } from '../lib/dates';
import { placeLabel, placeLong } from '../lib/geo';
import { KIND_LABEL, VERDICT_LABEL } from '../lib/placeRecs';
import { mapApps } from '../lib/placeApps';
import { lookupLink } from '../lib/placeLookup';
import { memberNames, toneOf } from '../lib/members';
import type { PlaceRec, Trip } from '../lib/types';

/**
 * 장소 보기: 사진(있으면) → 이름·종류·평가 → 주소 → 지도 앱 바로가기 → 자리 그림 → 여행 → 둘의 한 줄 평 → 메모.
 * 사진·자리가 비어 있고 지도 링크가 있으면 한 번 가져와 조용히 채운다.
 */
export default function PlaceView({ rec, trip, onEdit, onRemove, onEnrich }: {
  rec: PlaceRec;
  trip: Trip | null;
  onEdit: () => void;
  onRemove: () => void;
  onEnrich: (f: { photoUrl?: string; lat?: number; lng?: number }) => void;
}) {
  const toast = useToast();
  const auth = useAuth();
  const [blind] = useBlind();
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const [photoOk, setPhotoOk] = useState(true);
  const [confirm, setConfirm] = useState(false);

  // 예전에 남긴 장소: 링크는 있는데 사진·자리가 없으면 한 번 채운다
  useEffect(() => {
    if (!rec.naverUrl || (rec.photoUrl && rec.lat != null)) return;
    let on = true;
    lookupLink(rec.naverUrl, rec.address ?? '').then((info) => {
      if (!on || !info) return;
      onEnrich({
        photoUrl: !rec.photoUrl && info.image ? info.image : undefined,
        lat: rec.lat == null ? info.lat : undefined,
        lng: rec.lng == null ? info.lng : undefined,
      });
    });
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.id]);

  const apps = mapApps(rec.name, rec.region.t === 'kr' ? placeLabel(rec.region) : placeLong(rec.region), rec.lat, rec.lng, rec.naverUrl);
  const writers = [...new Set([...memberNames(), ...Object.keys(rec.reviews ?? {})])].filter((w) => rec.reviews?.[w]);
  const photo = rec.photoUrl && photoOk ? rec.photoUrl : '';

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast('주소를 복사했어요'); } catch { toast('복사하지 못했어요'); }
  };

  return (
    <>
      <TopBar back backTo="/places" title="장소" right={<button className="btn sm ghost" onClick={onEdit} data-testid="place-edit"><Icon name="edit" size={15} />고치기</button>} />
      <div className="page place-view" style={{ paddingTop: 4 }}>
        {photo && (
          <div className="pv-photo">
            <img src={photo} alt={`${rec.name} 사진`} referrerPolicy="no-referrer" onError={() => setPhotoOk(false)} />
            <span className="pv-photo-src tiny">사진 · 지도 링크</span>
          </div>
        )}

        <header className="pv-head">
          <div className="pv-tags">
            <span className={`kind-badge k-${rec.kind}`}>{KIND_LABEL[rec.kind]}</span>
            {rec.verdict && <span className={`tag verdict v-${rec.verdict}`}>{VERDICT_LABEL[rec.verdict]}</span>}
          </div>
          <h1 className="pv-name">{rec.name}</h1>
          <div className="pv-where small muted">{placeLong(rec.region)}</div>
          {rec.address && (
            <button className="pv-addr" onClick={() => copy(rec.address!)} aria-label={`주소 복사: ${rec.address}`}>
              <Icon name="pin" size={14} /><span>{rec.address}</span><span className="tiny">복사</span>
            </button>
          )}
        </header>

        <nav className="pv-apps" aria-label="지도 앱으로 열기">
          <a href={apps.naver} target="_blank" rel="noreferrer" className="pv-app"><span className="app-badge n" aria-hidden="true">N</span>네이버</a>
          <a href={apps.kakao} target="_blank" rel="noreferrer" className="pv-app"><span className="app-badge k" aria-hidden="true">K</span>카카오</a>
          <a href={apps.google} target="_blank" rel="noreferrer" className="pv-app"><span className="app-badge g" aria-hidden="true">G</span>구글</a>
          {apps.route && <a href={apps.route} target="_blank" rel="noreferrer" className="pv-app route"><Icon name="flag" size={15} />길찾기</a>}
        </nav>

        {rec.lat != null && rec.lng != null && <HomeRoute to={{ name: rec.name, lat: rec.lat, lng: rec.lng }} />}

        {rec.region.t === 'kr' && (
          <div className="pv-map card white">
            <SpotMap region={rec.region} lat={rec.lat} lng={rec.lng} height={photo ? 130 : 170} />
            {rec.lat == null && <span className="tiny muted pv-map-note">{rec.naverUrl ? '정확한 자리는 지도 링크에서 찾는 중이에요' : '네이버지도 링크를 넣으면 정확한 자리에 핀이 꽂혀요'}</span>}
          </div>
        )}

        {trip && (
          <Link to={`/trips/${trip.id}`} className="pv-trip card white">
            <Icon name="calendar" size={17} />
            <span style={{ flex: 1, minWidth: 0 }}><b>{trip.title}</b><span className="tiny muted" style={{ display: 'block' }}>{formatWhen(trip.when)}에 간 여행</span></span>
            <Icon name="chev" size={16} />
          </Link>
        )}

        <section className="pv-reviews">
          <h2 className="h2">한 줄 평</h2>
          {writers.length === 0 && <button className="pv-empty small" onClick={onEdit}>아직 없어요 · 한 줄 남기기</button>}
          {writers.map((w) => (
            <div key={w} className="pv-review">
              <span className={'avatar t' + Math.max(0, toneOf(w))} aria-hidden="true">{[...w][0]}</span>
              <span className="pv-bubble">
                <b className="tiny">{w}</b>
                {hideReview(rec.reviews, w, me, blind)
                  ? <span className="muted small" data-testid="review-hidden">내 한 줄 평을 쓰면 열려요 🔒</span>
                  : <span>{rec.reviews[w]}</span>}
              </span>
            </div>
          ))}
        </section>

        {rec.memo && (
          <section className="pv-memo card white">
            <div className="tiny" style={{ fontWeight: 800, color: 'var(--ink3)' }}>메모</div>
            <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{rec.memo}</p>
          </section>
        )}

        {!confirm ? (
          <button className="link-btn pv-remove" onClick={() => setConfirm(true)}><Icon name="trash" size={14} />이 장소 지우기</button>
        ) : (
          <div className="card" style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>그대로 두기</button>
            <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} onClick={onRemove}>지우기</button>
          </div>
        )}
      </div>
    </>
  );
}
