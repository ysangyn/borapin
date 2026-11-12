import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar, useBusy, useToast } from '../components/ui';
import { useAuth, displayName } from '../lib/auth';
import { createPlace, useTrips } from '../lib/data';
import { fetchNearby, here, walkText, type NearbyItem } from '../lib/nearby';
import { locate } from '../lib/geodata';
import { useHome } from '../lib/home';
import { tripStage } from '../lib/stage';
import { placeLabel } from '../lib/geo';
import { withJosa } from '../lib/ko';
import { hereKind, HERE_KINDS, type HereKind } from '../lib/hereKinds';
import type { Place, Verdict } from '../lib/types';

type Pos = { lat: number; lng: number };
type Pick = { name: string; kind: HereKind; pos: Pos | null; addr?: string };

const VERDICTS: { v: Verdict; label: string }[] = [
  { v: 'again', label: '또 갈래요' },
  { v: 'once', label: '한 번이면 충분' },
  { v: 'meh', label: '별로' },
];

/**
 * 지금 여기 남기기: 여행이 아니어도 언제든 — 지금 자리 → 근처 가게 고르기(또는 이름 쓰기) → 종류·어땠어요·한 줄 → 다녀온 곳으로 저장.
 * 여행 중이면 그 여행에도 붙는다. 근처 목록은 그때그때 받기만 하고, 고른 한 곳만 내 기록으로 남긴다.
 */
export default function HerePage() {
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const home = useHome();
  const { trips } = useTrips();
  const trip = useMemo(() => { const s = trips ? tripStage(trips) : null; return s?.kind === 'during' ? s.trip : null; }, [trips]);
  const me = auth.status === 'ready' ? displayName(auth.user) : '';

  const [pos, setPos] = useState<Pos | null>(null);
  const [region, setRegion] = useState<Place | null>(null);
  const [msg, setMsg] = useState('지금 위치를 찾는 중…');
  const [items, setItems] = useState<NearbyItem[] | null>(null);
  const [shown, setShown] = useState(5);
  const [pick, setPick] = useState<Pick | null>(null);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [line, setLine] = useState('');
  const [withTrip, setWithTrip] = useState(true);
  const [saving, setSaving] = useState(false);
  useBusy(!!pick || saving);

  useEffect(() => {
    let on = true;
    void (async () => {
      const p = await here();
      if (!on) return;
      if ('error' in p) { setMsg(`${p.error} · 가게 이름을 적어 주세요`); setItems([]); return; }
      setPos(p);
      setRegion(await locate(p.lng, p.lat).catch(() => null));
      if (!on) return;
      setMsg('근처를 찾는 중…');
      const r = await fetchNearby(auth.status === 'ready' ? auth.user : null, p.lat, p.lng);
      if (!on) return;
      const list = r && !r.outside ? r.items.filter((x) => x.kind !== 'stay') : [];
      setItems(list);
      setMsg(list.length ? '여기예요?' : '근처 가게 목록은 못 받았어요 · 가게 이름을 적어 주세요');
    })();
    return () => { on = false; };
  }, [auth]);

  // 어느 지역에 남기나: 지금 자리 → 여행 중이면 그 여행 지역 → 우리 집
  const where: Place | null = region ?? trip?.places[0] ?? (home ? { t: 'kr', code: home.code } : null);

  const choose = (p: Pick) => { setPick(p); setVerdict(null); setLine(''); };
  const save = async () => {
    if (!pick || auth.status !== 'ready' || saving) return;
    const name = pick.name.trim();
    if (!name) return;
    if (!where) return toast('어느 지역인지 몰라 남기지 못했어요');
    setSaving(true);
    try {
      const k = HERE_KINDS.find((x) => x.k === pick.kind)!;
      const id = await createPlace({
        name: name.slice(0, 80), kind: k.kind, ...(k.tag ? { tag: k.tag } : {}), region: where, status: 'been',
        tripId: trip && withTrip ? trip.id : null,
        reviews: line.trim() && me ? { [me]: line.trim().slice(0, 200) } : {}, verdict,
        ...(pick.pos ? { lat: pick.pos.lat, lng: pick.pos.lng } : {}), ...(pick.addr ? { address: pick.addr.slice(0, 200) } : {}),
      }, auth.user);
      toast(`${withJosa(name, '을/를')} 남겼어요`, { label: '보기', onClick: () => nav(`/places/${id}`) });
      if (window.history.length > 1) nav(-1); else nav('/');
    } catch {
      toast('남기지 못했어요. 잠시 뒤 다시 해 주세요');
    } finally { setSaving(false); }
  };

  return (
    <>
      <TopBar back title="지금 여기" />
      <div className="page here-page" data-testid="here-page">
        {!pick ? (
          <>
            <div className="here-where small muted" data-testid="here-pos">{where ? `${placeLabel(where)}${region ? ' · 지금 있는 곳' : ''}` : ''}{trip ? ` · ${trip.title} 중` : ''}</div>
            <b className="jua" style={{ fontSize: 22 }} aria-live="polite">{msg}</b>
            {!!items?.length && (
              <div className="here-list" data-testid="here-list">
                {items.slice(0, shown).map((it) => (
                  <button key={it.id} type="button" className="here-item" onClick={() => choose({ name: it.name, kind: hereKind(it.name, it.kind), pos: { lat: it.lat, lng: it.lng }, addr: it.addr })} data-testid="here-item">
                    {it.img ? <img src={it.img} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="here-noimg" aria-hidden="true" />}
                    <span className="here-copy"><b>{it.name}</b><span className="tiny muted">{it.type} · {walkText(it)}</span></span>
                  </button>
                ))}
                {items.length > shown && <button className="link-btn" onClick={() => setShown(shown + 5)}>더 보기</button>}
              </div>
            )}
            <form className="here-own" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) choose({ name: typed.trim(), kind: hereKind(typed, null), pos }); }}>
              <label className="small" htmlFor="here-typed" style={{ fontWeight: 600 }}>{items?.length ? '목록에 없으면 이름을 적어요' : '가게 이름'}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="here-typed" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="예: 소금빵 맛집 ○○베이커리" maxLength={80} enterKeyHint="next" data-testid="here-typed" />
                <button className="btn" disabled={!typed.trim()} data-testid="here-typed-next">다음</button>
              </div>
              {pos && <span className="tiny muted">지금 자리가 함께 저장돼서 지도에 바로 핀이 꽂혀요</span>}
            </form>
          </>
        ) : (
          <div className="here-form" data-testid="here-form">
            <label className="field">
              <span className="label">이름</span>
              <input className="input" value={pick.name} onChange={(e) => setPick({ ...pick, name: e.target.value })} maxLength={80} data-testid="here-name" />
            </label>
            <div className="field">
              <span className="label">어떤 곳이에요?</span>
              <div className="chips" role="radiogroup" aria-label="종류">
                {HERE_KINDS.map((k) => <button key={k.k} type="button" role="radio" aria-checked={pick.kind === k.k} className={'chip' + (pick.kind === k.k ? ' on' : '')} onClick={() => setPick({ ...pick, kind: k.k })} data-testid={`here-kind-${k.k}`}>{k.label}</button>)}
              </div>
            </div>
            <div className="field">
              <span className="label">어땠어요? <span className="muted small">(안 골라도 돼요)</span></span>
              <div className="chips" role="radiogroup" aria-label="어땠어요">
                {VERDICTS.map((x) => <button key={x.v} type="button" role="radio" aria-checked={verdict === x.v} className={'chip' + (verdict === x.v ? ' on' : '')} onClick={() => setVerdict(verdict === x.v ? null : x.v)} data-testid={`here-verdict-${x.v}`}>{x.label}</button>)}
              </div>
            </div>
            <label className="field">
              <span className="label">한 줄 <span className="muted small">(안 써도 돼요)</span></span>
              <input className="input hand" value={line} onChange={(e) => setLine(e.target.value)} placeholder="예: 소금빵은 오후 3시에 나와요" maxLength={200} data-testid="here-line" />
            </label>
            {trip && (
              <label className="here-trip small"><input type="checkbox" checked={withTrip} onChange={(e) => setWithTrip(e.target.checked)} /> {trip.title}에도 남기기</label>
            )}
            <span className="tiny muted">{where ? `${placeLabel(where)}에 다녀온 곳으로 남겨요 · 내 지도에 바로 보여요` : ''}</span>
            <button className="btn primary block" disabled={saving || !pick.name.trim()} onClick={save} data-testid="here-save">{saving ? '남기는 중…' : '남기기'}</button>
            <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => setPick(null)}>다른 곳 고르기</button>
          </div>
        )}
      </div>
    </>
  );
}
