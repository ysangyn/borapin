import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { createPlace } from '../lib/data';
import { locate } from '../lib/geodata';
import { placeLabel } from '../lib/geo';
import { fetchNearby, here, walkText, type NearbyItem } from '../lib/nearby';
import { useBusy, useToast } from './ui';
import type { Place, Trip } from '../lib/types';

/**
 * 지금 여기 남기기 (13번): 여행 중 단계 카드의 단추 하나 → 지금 위치 → 근처 관광지 세 곳(사진·한 줄·걸어서 몇 분)
 * → 하나 누르면 그 여행의 장소로 바로 기록. 후보가 없거나 못 찾으면 '이 근처'로 남긴다.
 */
type St = { s: 'idle' } | { s: 'busy'; msg: string } | { s: 'list'; pos: { lat: number; lng: number }; region: Place | null; items: NearbyItem[]; shown: number } | { s: 'fail'; msg: string; pos?: { lat: number; lng: number }; region?: Place | null };

export default function HereNow({ trip }: { trip: Trip }) {
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [st, setSt] = useState<St>({ s: 'idle' });
  const [saving, setSaving] = useState(false);
  useBusy(st.s !== 'idle' || saving);

  const start = async () => {
    setSt({ s: 'busy', msg: '지금 위치를 찾는 중…' });
    const p = await here();
    if ('error' in p) return setSt({ s: 'fail', msg: p.error });
    const region = await locate(p.lng, p.lat).catch(() => null);
    setSt({ s: 'busy', msg: '근처 장소를 찾는 중…' });
    const r = await fetchNearby(auth.status === 'ready' ? auth.user : null, p.lat, p.lng);
    if (!r) return setSt({ s: 'fail', msg: '지금은 근처 장소를 찾을 수 없어요', pos: p, region });
    if (r.outside) return setSt({ s: 'fail', msg: '근처 장소 찾기는 아직 국내에서만 돼요', pos: p, region });
    if (!r.items.length) return setSt({ s: 'fail', msg: '근처에 알려진 장소가 없어요', pos: p, region });
    setSt({ s: 'list', pos: p, region, items: r.items, shown: 3 });
  };

  const save = async (name: string, kind: NearbyItem['kind'], pos: { lat: number; lng: number }, region: Place | null | undefined, addr?: string) => {
    if (auth.status !== 'ready' || saving) return;
    const where = region ?? trip.places[0];
    if (!where) return toast('어느 지역인지 몰라 남기지 못했어요');
    setSaving(true);
    try {
      const id = await createPlace({ name: name.slice(0, 80), kind, region: where, tripId: trip.id, reviews: {}, verdict: null, lat: pos.lat, lng: pos.lng, ...(addr ? { address: addr.slice(0, 200) } : {}) }, auth.user);
      setSt({ s: 'idle' });
      toast(`${name} 남겼어요`, { label: '한 줄 쓰기', onClick: () => nav(`/places/${id}`) });
    } catch {
      toast('남기지 못했어요. 잠시 뒤 다시 해 주세요');
    } finally { setSaving(false); }
  };

  const close = () => setSt({ s: 'idle' });
  return (
    <>
      <button type="button" className="btn sm glass" onClick={start} data-testid="here-now">지금 여기</button>
      {st.s !== 'idle' && createPortal(
        <div className="map-choice-backdrop" onClick={close} data-testid="here-sheet">
          <div className="map-choice card here-sheet" role="dialog" aria-label="지금 여기 남기기" onClick={(e) => e.stopPropagation()}>
            <b className="jua" style={{ fontSize: 20 }}>지금 여기</b>
            {st.s === 'busy' && <span className="small muted" aria-live="polite">{st.msg}</span>}
            {st.s === 'fail' && (
              <>
                <span className="small" aria-live="polite">{st.msg}</span>
                {st.pos && <button className="btn block" disabled={saving} onClick={() => save(`${st.region ? placeLabel(st.region) : ''} 이 근처`.trim(), 'etc', st.pos!, st.region)} data-testid="here-fallback">이 근처로 남기기</button>}
              </>
            )}
            {st.s === 'list' && (
              <>
                <span className="tiny muted">누르면 '{trip.title}'의 장소로 남겨요</span>
                <div className="here-list">
                  {st.items.slice(0, st.shown).map((it) => (
                    <button key={it.id} type="button" className="here-item" disabled={saving} onClick={() => save(it.name, it.kind, { lat: it.lat, lng: it.lng }, st.region, it.addr)} data-testid="here-item">
                      {it.img ? <img src={it.img} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="here-noimg" aria-hidden="true" />}
                      <span className="here-copy">
                        <b>{it.name}</b>
                        <span className="tiny muted">{it.type} · {walkText(it)}</span>
                        {it.line && <span className="tiny">{it.line}</span>}
                      </span>
                    </button>
                  ))}
                </div>
                {st.items.length > st.shown && <button className="link-btn" onClick={() => setSt({ ...st, shown: st.shown + 3 })}>다른 곳 더 보기</button>}
                <button className="btn line block" disabled={saving} onClick={() => save(`${st.region ? placeLabel(st.region) : ''} 이 근처`.trim(), 'etc', st.pos, st.region)} data-testid="here-fallback">목록에 없어요 · 이 근처로 남기기</button>
                <span className="tiny muted" style={{ textAlign: 'center' }}>한국관광공사 관광정보</span>
              </>
            )}
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={close}>그대로 두기</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
