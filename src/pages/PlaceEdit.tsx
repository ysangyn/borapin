import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon, TopBar, useToast } from '../components/ui';
import PlacePicker from '../components/PlacePicker';
import { useAuth, displayName } from '../lib/auth';
import { createPlace, deletePlace, tripsAtPlace, updatePlace, usePlaces, useTrips } from '../lib/data';
import { formatWhen } from '../lib/dates';
import { parsePlaceParam } from '../lib/geo';
import { KINDS, parseNaverShare, placeRecLinks, VERDICTS } from '../lib/placeRecs';
import { COUPLE, samePlace } from '../lib/wishes';
import type { Place, PlaceKind, PlaceRecInput, Verdict } from '../lib/types';

/** 장소 남기기·고치기: 이름, 종류, 어디, 어느 여행, 둘의 한 줄 평, 평가, 네이버 링크 */
export default function PlaceEdit() {
  const { id } = useParams();
  const editing = Boolean(id && id !== 'new');
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const auth = useAuth();
  const { places } = usePlaces();
  const { trips } = useTrips();
  const existing = useMemo(() => places?.find((p) => p.id === id), [places, id]);
  const tripParam = sp.get('trip');
  const tripFromParam = trips?.find((t) => t.id === tripParam);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<PlaceKind>('food');
  const [region, setRegion] = useState<Place[]>(() => parsePlaceParam(sp.get('region')));
  const [tripId, setTripId] = useState<string>(tripParam ?? '');
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [naverUrl, setNaverUrl] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [paste, setPaste] = useState('');
  const [loaded, setLoaded] = useState(!editing);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // 여행에서 들어오면 그 여행의 첫 장소를 지역으로
  useEffect(() => {
    if (!editing && tripFromParam && region.length === 0) setRegion(tripFromParam.places.slice(0, 1));
  }, [editing, tripFromParam, region.length]);

  useEffect(() => {
    if (editing && existing && !loaded) {
      setName(existing.name);
      setKind(existing.kind);
      setRegion([existing.region]);
      setTripId(existing.tripId ?? '');
      setReviews(existing.reviews ?? {});
      setVerdict(existing.verdict ?? null);
      setNaverUrl(existing.naverUrl ?? '');
      setAddress(existing.address ?? '');
      setMemo(existing.memo ?? '');
      setLoaded(true);
    }
  }, [editing, existing, loaded]);

  const where = region[region.length - 1] ?? null;
  const tripOptions = useMemo(() => (trips && where ? tripsAtPlace(trips, (p) => samePlace(p, where)) : []), [trips, where]);
  const me = auth.status === 'ready' ? displayName(auth.user) : '';
  const writers = [...new Set([...COUPLE, me].filter(Boolean))];

  const applyPaste = (text: string) => {
    setPaste(text);
    const r = parseNaverShare(text);
    if (r.name && !name) setName(r.name.slice(0, 80));
    if (r.url) setNaverUrl(r.url);
    if (r.address && !address) setAddress(r.address);
  };

  const save = async () => {
    if (!where || !name.trim() || auth.status !== 'ready' || saving) return;
    setSaving(true);
    const input: PlaceRecInput = {
      name: name.trim(),
      kind,
      region: where,
      tripId: tripId || null,
      reviews: Object.fromEntries(Object.entries(reviews).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
      verdict,
      naverUrl: naverUrl.trim() || undefined,
      address: address.trim() || undefined,
      memo: memo.trim() || undefined,
    };
    try {
      if (editing && id) await updatePlace(id, input);
      else await createPlace(input, auth.user);
      toast(editing ? '고쳤어요' : '장소를 남겼어요');
      nav(-1);
    } catch (e) {
      console.warn(e);
      toast('저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
      setSaving(false);
    }
  };

  const links = where && name ? placeRecLinks({ name, region: where, naverUrl }) : null;

  return (
    <>
      <TopBar back title={editing ? '장소' : '장소 남기기'} />
      <div className="page" style={{ paddingTop: 4, gap: 18 }}>
        {!editing && (
          <div className="field">
            <span className="label">네이버지도에서 공유한 글 붙여넣기 <span className="muted small">(선택)</span></span>
            <textarea className="textarea" rows={2} aria-label="네이버지도 공유 글" value={paste} onChange={(e) => applyPaste(e.target.value)} placeholder={'[네이버지도]\n가게 이름\nhttps://naver.me/…'} />
          </div>
        )}

        <div className="field">
          <span className="label">이름<span className="req">*</span></span>
          <input className="input" aria-label="장소 이름" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="예: 초당할머니순두부" />
        </div>

        <div className="field">
          <span className="label">종류</span>
          <div className="chips">
            {KINDS.map((k) => (
              <button key={k.k} type="button" className={'chip' + (kind === k.k ? ' on' : '')} onClick={() => setKind(k.k)}>{k.label}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">어디<span className="req">*</span></span>
          <PlacePicker value={where ? [where] : []} onChange={(v) => setRegion(v.slice(-1))} />
        </div>

        {tripOptions.length > 0 && (
          <div className="field">
            <span className="label">어느 여행에서</span>
            <select className="select" aria-label="여행 연결" value={tripId} onChange={(e) => setTripId(e.target.value)}>
              <option value="">연결 안 함</option>
              {tripOptions.map((t) => <option key={t.id} value={t.id}>{t.title} · {formatWhen(t.when)}</option>)}
            </select>
          </div>
        )}

        <div className="field">
          <span className="label">한 줄 평</span>
          {writers.map((w) => (
            <input
              key={w}
              className="input"
              aria-label={`${w} 한 줄 평`}
              placeholder={`${w}: 어땠어요?`}
              value={reviews[w] ?? ''}
              onChange={(e) => setReviews((r) => ({ ...r, [w]: e.target.value }))}
              maxLength={140}
            />
          ))}
        </div>

        <div className="field">
          <span className="label">다시 간다면</span>
          <div className="chips">
            {VERDICTS.map((v) => (
              <button key={v.v} type="button" className={'chip' + (verdict === v.v ? (v.v === 'again' ? ' on-coral' : ' on') : '')} onClick={() => setVerdict(verdict === v.v ? null : v.v)}>{v.label}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">네이버지도 링크 · 주소 <span className="muted small">(선택)</span></span>
          <input className="input" aria-label="네이버지도 링크" value={naverUrl} onChange={(e) => setNaverUrl(e.target.value)} placeholder="https://naver.me/…" />
          <input className="input" aria-label="주소" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="주소" />
        </div>

        <div className="field">
          <span className="label">메모</span>
          <textarea className="textarea" aria-label="장소 메모" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="주문한 메뉴, 웨이팅, 주차…" maxLength={5000} />
        </div>

        {links && (
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={links.naver} target="_blank" rel="noreferrer" className="btn sm ghost" style={{ flex: 1 }}>네이버지도로 열기</a>
            <a href={links.google} target="_blank" rel="noreferrer" className="btn sm ghost" style={{ flex: 1 }}>구글지도로 열기</a>
          </div>
        )}

        <button className="btn block" disabled={!where || !name.trim() || saving} onClick={save} data-testid="place-save">
          {saving ? '저장 중…' : editing ? '고친 내용 저장' : '남기기'}
        </button>
        {editing && existing && (
          !confirm ? (
            <button className="btn danger block" onClick={() => setConfirm(true)}><Icon name="trash" size={17} />이 장소 지우기</button>
          ) : (
            <div className="card" style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>그대로 두기</button>
              <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} onClick={() => deletePlace(existing.id).then(() => { toast('지웠어요'); nav(-1); })}>지우기</button>
            </div>
          )
        )}
      </div>
    </>
  );
}
